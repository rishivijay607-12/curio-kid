import React, { useState, useEffect, useRef } from 'react';
import { type LiveServerMessage, type Blob, Modality } from '@google/genai';
import type { Grade, Language } from '../types.ts';
import { live } from '../services/geminiService.ts'; // Import the centralized service
import LoadingSpinner from './LoadingSpinner.tsx';

// Add webkitAudioContext to Window interface for browser compatibility
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

// --- Speaking Indicator Icon ---
const SpeakingIndicatorIcon = ({ isSpeaking }: { isSpeaking: boolean }) => {
    return (
        <div className="relative">
            <svg className="h-48 w-48 text-slate-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                {/* Face and Eyes */}
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0z" clipRule="evenodd" />
                {/* Mouth */}
                {isSpeaking ? (
                    <ellipse cx="10" cy="14.5" rx="3" ry="1.5" className="animate-pulse" />
                ) : (
                    <path d="M 7 13.5 Q 10 15.5 13 13.5" stroke="currentColor" strokeWidth="1" fill="none" strokeLinecap="round" />
                )}
            </svg>
            {isSpeaking && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="h-56 w-56 border-4 border-cyan-400 rounded-full animate-pulse"></div>
                </div>
            )}
        </div>
    );
};


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
                
                let langTarget = 'clear and simple English';
                if (language !== 'English') {
                    langTarget = `a friendly mix of English and ${language.split('+')[1]}`;
                }

                const systemInstruction = `You are 'Curio', a friendly and encouraging AI science tutor for a Grade ${grade} student. The topic is "${topic}".
Your task is to start a spoken conversation.
1. Begin by introducing yourself and asking a simple opening question about the topic.
2. You MUST speak in ${langTarget}.
3. Keep your responses short and wait for the student to reply.`;
                
                sessionPromiseRef.current = live.connect({
                    model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                    config: {
                        responseModalities: [Modality.AUDIO],
                        speechConfig: {
                            voiceConfig: {prebuiltVoiceConfig: {voiceName: 'Zephyr'}},
                        },
                        systemInstruction,
                    },
                    callbacks: {
                        onopen: () => {
                            try {
                                if (isCancelled || !inputAudioContextRef.current || !streamRef.current) return;
                                 const inputAudioContext = inputAudioContextRef.current;
                                 setStatus('listening');

                                 const source = inputAudioContext.createMediaStreamSource(streamRef.current);
                                 scriptProcessorRef.current = inputAudioContext.createScriptProcessor(4096, 1, 1);
                                 const gainNode = inputAudioContext.createGain();
                                 gainNode.gain.value = 0; // Mute the node to prevent echo

                                 scriptProcessorRef.current.onaudioprocess = (audioProcessingEvent) => {
                                     try {
                                        const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                                        const pcmBlob = createBlob(inputData);
                                        sessionPromiseRef.current.then((session: any) => {
                                          session.sendRealtimeInput({ media: pcmBlob });
                                        });
                                     } catch (e) {
                                         console.error("Error during audio processing:", e);
                                     }
                                 };
                                 
                                 source.connect(scriptProcessorRef.current);
                                 scriptProcessorRef.current.connect(gainNode);
                                 gainNode.connect(inputAudioContext.destination);
                            } catch (e) {
                                if (isCancelled) return;
                                console.error("Error setting up audio source:", e);
                                setError("Failed to connect to your microphone.");
                                setStatus('error');
                            }
                        },
                        onmessage: async (message: LiveServerMessage) => {
                            try {
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

                                 const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
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
                            } catch (e) {
                                if (isCancelled) return;
                                console.error("Error processing incoming message:", e);
                                setError("An error occurred processing the AI's response.");
                                setStatus('error');
                            }
                        },
                        onerror: (e: ErrorEvent) => {
                            console.error('Session error:', e);
                            if (!isCancelled) {
                                setError('An error occurred with the connection.');
                                setStatus('error');
                            }
                        },
                        onclose: () => {
                             if (!isCancelled) {
                                // Session closed by server
                             }
                        },
                    },
                });

                sessionPromiseRef.current.catch((err: unknown) => {
                    if (isCancelled) return;
                    const message = err instanceof Error ? err.message : 'An unknown connection error occurred.';
                    console.error("Live session connection promise rejected:", err);
                    setError(`Failed to connect. Please check your network and browser permissions. Details: ${message}`);
                    setStatus('error');
                });


            } catch (err) {
                if (isCancelled) return;
                const message = err instanceof Error ? err.message : 'An unknown error occurred.';
                console.error("Setup failed:", message);
                if (message.includes('Permission denied')) {
                    setError('Microphone permission denied. Please allow microphone access in your browser settings.');
                } else {
                    setError(`Could not start the voice session. ${message}`);
                }
                setStatus('error');
            }
        }
        
        setupSession();

        return () => {
            isCancelled = true;
            if (sessionPromiseRef.current) {
                sessionPromiseRef.current
                    .then((session: any) => {
                        if (session?.close) {
                            session.close();
                        }
                    })
                    .catch((err: any) => {
                        console.debug("Ignoring error during session cleanup:", err);
                    });
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
    
    
    const renderStatus = () => {
        const isSpeaking = status === 'speaking';
        switch(status) {
            case 'connecting':
                return <><LoadingSpinner /> <p className="mt-4">Connecting to AI Tutor...</p></>;
            case 'listening':
                return <><SpeakingIndicatorIcon isSpeaking={isSpeaking} /><p className="mt-4 text-xl">I'm listening...</p></>;
            case 'speaking':
                return <><SpeakingIndicatorIcon isSpeaking={isSpeaking} /><p className="mt-4 text-xl">AI is speaking...</p></>;
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