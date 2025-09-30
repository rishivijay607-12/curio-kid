import React, { useState, useRef, useEffect } from 'react';
import type { Grade, ChatMessage } from '../types.ts';
import LoadingSpinner from './LoadingSpinner.tsx';

// Fix: Add type definitions for Web Speech API to fix 'Cannot find name 'SpeechRecognition'' error.
// These types are necessary because they might not be included in the default TypeScript DOM library settings.
interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
  readonly message: string;
}

interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onend: () => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
}

interface SpeechRecognitionStatic {
  new(): SpeechRecognition;
}

// Extend the window object to include webkitSpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionStatic;
    webkitSpeechRecognition: SpeechRecognitionStatic;
  }
}

interface DoubtSolverProps {
  grade: Grade;
  topic: string;
  history: ChatMessage[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  error: string | null;
  onCancelGeneration: () => void;
}

const UserIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const ModelIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.5 3.5C14.5 5.433 12.933 7 11 7s-3.5-1.567-3.5-3.5S9.067 0 11 0s3.5 1.567 3.5 3.5zM11 24c-1.933 0-3.5-1.567-3.5-3.5S9.067 17 11 17s3.5 1.567 3.5 3.5S12.933 24 11 24zM3.5 14.5C1.567 14.5 0 12.933 0 11s1.567-3.5 3.5-3.5S7 9.067 7 11s-1.567 3.5-3.5 3.5zM18.5 14.5C16.567 14.5 15 12.933 15 11s1.567-3.5 3.5-3.5S22 9.067 22 11s-1.567 3.5-3.5 3.5z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 21a10 10 0 100-20 10 10 0 000 20z" />
    </svg>
);

const DoubtSolver: React.FC<DoubtSolverProps> = ({ grade, topic, history, onSendMessage, isLoading, error, onCancelGeneration }) => {
    const [input, setInput] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [isSpeechSupported, setIsSpeechSupported] = useState(false);
    const [speechError, setSpeechError] = useState<string | null>(null);
    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            setIsSpeechSupported(true);
            const recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = 'en-US';

            recognition.onresult = (event) => {
                const transcript = event.results[event.results.length - 1][0].transcript.trim();
                setInput(prevInput => prevInput ? `${prevInput} ${transcript}` : transcript);
            };
            recognition.onend = () => setIsListening(false);
            recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
                console.error('Speech recognition error:', event.error, event.message);
                if (event.error === 'network') {
                    setSpeechError('Network error. Speech recognition requires an internet connection.');
                } else if (event.error === 'no-speech') {
                    setSpeechError('No speech was detected. Please try again.');
                } else if (event.error === 'audio-capture') {
                    setSpeechError('Could not start audio capture. Please check your microphone.');
                } else if (event.error === 'not-allowed') {
                    setSpeechError('Microphone access was denied. Please enable it in your browser settings.');
                } else {
                    setSpeechError(`An unexpected error occurred: ${event.error}`);
                }
                setIsListening(false);
            };
            recognitionRef.current = recognition;
        }
    }, []);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [history, isLoading]);
    
    const handleMicClick = () => {
        if (!recognitionRef.current) return;
        setSpeechError(null);
        if (isListening) {
            recognitionRef.current.stop();
        } else {
            recognitionRef.current.start();
            setIsListening(true);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim() && !isLoading) {
            onSendMessage(input.trim());
            setInput('');
        }
    };

    return (
        <div className="w-full max-w-3xl mx-auto flex flex-col h-[85vh] bg-slate-900 rounded-xl shadow-2xl border border-slate-800">
            {/* Header */}
            <div className="p-4 border-b border-slate-800 text-center">
                <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-300">
                    AI Doubt Solver
                </h1>
                <p className="text-slate-400 text-sm mt-1 truncate px-4">
                    <span>Grade {grade}</span>
                    <span className="mx-2 text-slate-600">&bull;</span>
                    <span className="font-semibold">{topic}</span>
                </p>
            </div>
            
            {/* Chat Messages */}
            <div className="flex-grow p-4 overflow-y-auto">
                <div className="space-y-6">
                    {history.map((msg, index) => (
                        <div key={index} className={`flex gap-4 items-start ${msg.role === 'user' ? 'justify-end' : ''}`}>
                             {msg.role === 'model' && <ModelIcon />}
                            <div className={`max-w-md p-4 rounded-xl ${msg.role === 'user' ? 'bg-slate-800 text-slate-100 rounded-br-none' : 'bg-slate-950/50 text-slate-300 rounded-bl-none'}`}>
                                <p className="whitespace-pre-wrap">{msg.parts[0].text}</p>
                            </div>
                             {msg.role === 'user' && <UserIcon />}
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex gap-4 items-start">
                             <ModelIcon />
                            <div className="max-w-md p-4 rounded-xl bg-slate-950/50 text-slate-300 rounded-bl-none flex items-center gap-4">
                               <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse delay-75"></div>
                                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse delay-150"></div>
                               </div>
                               <button
                                 onClick={onCancelGeneration}
                                 className="px-3 py-1 text-sm bg-slate-800 text-slate-300 rounded-md hover:bg-slate-700 transition-colors"
                               >
                                 Stop Generating
                               </button>
                            </div>
                        </div>
                    )}
                     {error && (
                         <div className="p-4 text-center bg-red-900/50 border border-red-500 rounded-lg">
                            <p className="font-semibold text-red-400">Oops! Something went wrong.</p>
                            <p className="text-slate-300 text-sm mt-1">{error}</p>
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>
            </div>

            {/* Input Form */}
            <div className="p-4 border-t border-slate-800">
                <form onSubmit={handleSubmit} className="flex items-center gap-2">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                             if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSubmit(e);
                            }
                        }}
                        placeholder={isListening ? "Listening..." : "Ask a science question..."}
                        rows={1}
                        className="flex-grow bg-slate-800 text-slate-100 p-3 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-shadow disabled:opacity-50"
                        disabled={isLoading}
                    />
                    {isSpeechSupported && (
                        <button
                            type="button"
                            onClick={handleMicClick}
                            className={`p-3 rounded-lg shadow-lg transition-colors disabled:opacity-50 ${isListening ? 'bg-red-600 hover:bg-red-500 animate-pulse' : 'bg-slate-700 hover:bg-slate-600'}`}
                            disabled={isLoading}
                            aria-label={isListening ? 'Stop listening' : 'Start listening'}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                            </svg>
                        </button>
                    )}
                    <button 
                        type="submit" 
                        disabled={isLoading || !input.trim()}
                        className="p-3 bg-cyan-600 text-white rounded-lg shadow-lg hover:bg-cyan-500 transition-colors disabled:bg-slate-700 disabled:cursor-not-allowed"
                        aria-label="Send message"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                        </svg>
                    </button>
                </form>
                {speechError && <p className="text-xs text-red-400 text-center mt-2">{speechError}</p>}
            </div>
        </div>
    );
};

export default DoubtSolver;