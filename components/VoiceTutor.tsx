import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Blob } from '@google/genai';
import type { Grade, Language } from '../types';
import LoadingSpinner from './LoadingSpinner';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Fix: Add webkitAudioContext to Window interface for browser compatibility
declare global {
    interface Window {
        webkitAudioContext: typeof AudioContext;
    }
}


// --- Audio Utility Functions ---
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

function createBlob(data: Float32Array): Blob {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}

// --- Component ---

interface VoiceTutorProps {
  grade: Grade;
  topic: string;
  language: Language;
  onEndSession: () => void;
}

type SessionStatus = 'connecting' | 'listening' | 'speaking' | 'error';

const VoiceTutor: React.FC<VoiceTutorProps> = ({ grade, topic, language, onEndSession }) => {
    const [status, setStatus] = useState<SessionStatus>('connecting');
    const [error, setError] = useState<string | null>(null);

    const inputAudioContextRef = useRef<AudioContext | null>(null);
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const sessionPromiseRef = useRef<any>(null); // Using 'any' for session promise to avoid complex type issues
    const audioQueueRef = useRef<AudioBufferSourceNode[]>([]);
    const nextStartTimeRef = useRef<number>(0);


    useEffect(() => {
        let isCancelled = false;
        
        async function setupSession() {
            try {
                if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                    throw new Error('Your browser does not support the MediaDevices API.');
                }

                streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
                if (isCancelled) return;

                inputAudioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
                outputAudioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });
                const outputNode = outputAudioContextRef.current.createGain();
                outputNode.connect(outputAudioContextRef.current.destination);
                
                let langInstruction = "Engage the student in a spoken conversation in clear and simple English.";
                switch (language) {
                    case 'English+Tamil':
                        langInstruction = "Engage the student in a spoken conversation in a mix of English and Tamil (Tanglish).";
                        break;
                    case 'English+Malayalam':
                        langInstruction = "Engage the student in a spoken conversation in a mix of English and Malayalam (Manglish).";
                        break;
                    case 'English+Hindi':
                        langInstruction = "Engage the student in a spoken conversation in a mix of English and Hindi (Hinglish).";
                        break;
                    case 'English+Telugu':
                        langInstruction = "Engage the student in a spoken conversation in a mix of English and Telugu (Tenglish).";
                        break;
                    case 'English+Kannada':
                        langInstruction = "Engage the student in a spoken conversation in a mix of English and Kannada (Kanglish).";
                        break;
                }

                let systemInstruction = `You are a friendly, patient, and encouraging AI science tutor named 'Curio' for a Grade ${grade} student. The current topic is "${topic}". ${langInstruction} Ask questions, explain concepts clearly, and guide them through the topic.`;
                
                sessionPromiseRef.current = ai.live.connect({
                    model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                    config: {
                        responseModalities: [Modality.AUDIO],
                        systemInstruction,
                    },
                    callbacks: {
                        onopen: () => {
                            if (isCancelled || !inputAudioContextRef.current || !streamRef.current) return;
                             setStatus('listening');
                             const source = inputAudioContextRef.current.createMediaStreamSource(streamRef.current);
                             scriptProcessorRef.current = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);

                             scriptProcessorRef.current.onaudioprocess = (audioProcessingEvent) => {
                                const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                                const pcmBlob = createBlob(inputData);
                                sessionPromiseRef.current.then((session: any) => {
                                  session.sendRealtimeInput({ media: pcmBlob });
                                });
                             };
                             source.connect(scriptProcessorRef.current);
                             scriptProcessorRef.current.connect(inputAudioContextRef.current.destination);
                        },
                        onmessage: async (message: LiveServerMessage) => {
                             if (isCancelled || !outputAudioContextRef.current) return;
                             
                             const interrupted = message.serverContent?.interrupted;
                             if (interrupted) {
                                 for (const source of audioQueueRef.current) {
                                     source.stop();
                                 }
                                 audioQueueRef.current = [];
                                 nextStartTimeRef.current = 0;
                                 if (!isCancelled) {
                                     setStatus('listening');
                                 }
                                 return;
                             }

                             const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData.data;
                             if (base64Audio) {
                                 setStatus('speaking');
                                 const audioBuffer = await decodeAudioData(decode(base64Audio), outputAudioContextRef.current, 24000, 1);
                                 const source = outputAudioContextRef.current.createBufferSource();
                                 source.buffer = audioBuffer;
                                 source.connect(outputNode);

                                 const currentTime = outputAudioContextRef.current.currentTime;
                                 const startTime = Math.max(currentTime, nextStartTimeRef.current);
                                 source.start(startTime);
                                 nextStartTimeRef.current = startTime + audioBuffer.duration;
                                 
                                 audioQueueRef.current.push(source);
                                 source.onended = () => {
                                     audioQueueRef.current = audioQueueRef.current.filter(s => s !== source);
                                     if (audioQueueRef.current.length === 0 && !isCancelled) {
                                         setStatus('listening');
                                     }
                                 };
                             }
                        },
                        onerror: (e: ErrorEvent) => {
                            console.error('Session error:', e);
                            setError('An error occurred with the connection.');
                            setStatus('error');
                        },
                        onclose: () => {
                             if (!isCancelled) {
                                // Session closed by server
                             }
                        },
                    },
                });

            } catch (err) {
                if (isCancelled) return;
                const message = err instanceof Error ? err.message : 'An unknown error occurred.';
                console.error("Setup failed:", message);
                if (message.includes('Permission denied')) {
                    setError('Microphone permission denied. Please allow microphone access in your browser settings.');
                } else {
                    setError('Could not start the voice session.');
                }
                setStatus('error');
            }
        }
        
        setupSession();

        return () => {
            isCancelled = true;
            if (sessionPromiseRef.current) {
                sessionPromiseRef.current.then((session: any) => session.close());
            }
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
            if (scriptProcessorRef.current) {
                 scriptProcessorRef.current.disconnect();
            }
            if (inputAudioContextRef.current) {
                inputAudioContextRef.current.close();
            }
            if (outputAudioContextRef.current) {
                outputAudioContextRef.current.close();
            }
        };

    }, [grade, topic, language]);
    
    const SmileyIcon = () => (
        <div className="relative">
             <svg className="h-48 w-48 text-slate-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-.464 5.535a.5.5 0 01.707 0 5 5 0 01-7.474 0 .5.5 0 01.707-.707 4 4 0 006.06 0 .5.5 0 01.707.707z" clipRule="evenodd" />
            </svg>
            {status === 'speaking' && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-56 w-56 border-4 border-cyan-400 rounded-full animate-pulse"></div>
                </div>
            )}
        </div>
    );
    
    const renderStatus = () => {
        switch(status) {
            case 'connecting':
                return <><LoadingSpinner /> <p className="mt-4">Connecting to AI Tutor...</p></>;
            case 'listening':
                return <><SmileyIcon /><p className="mt-4 text-xl">I'm listening...</p></>;
            case 'speaking':
                return <><SmileyIcon /><p className="mt-4 text-xl">AI is speaking...</p></>;
            case 'error':
                 return (
                    <div className="text-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-red-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="mt-4 text-xl font-semibold text-red-400">Connection Failed</p>
                        <p className="text-slate-300 mt-2 max-w-sm">{error}</p>
                    </div>
                );
        }
    }

    return (
        <div className="w-full max-w-2xl mx-auto p-8 flex flex-col items-center justify-center h-[80vh] text-center">
            <div className="flex-grow flex flex-col items-center justify-center">
                 {renderStatus()}
            </div>
             <button
                onClick={onEndSession}
                className="mt-8 px-8 py-4 bg-red-600 text-white font-bold text-lg rounded-full shadow-lg hover:bg-red-500 transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-75"
            >
                End Session
            </button>
        </div>
    );
};

export default VoiceTutor;