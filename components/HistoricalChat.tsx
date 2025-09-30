import React, { useState, useRef, useEffect } from 'react';
import type { Scientist, ChatMessage } from '../types.ts';
import LoadingSpinner from './LoadingSpinner.tsx';

// Note: Speech recognition types and logic are included for UI consistency with DoubtSolver,
// though they are not strictly required by the prompt.
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

declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionStatic;
    webkitSpeechRecognition: SpeechRecognitionStatic;
  }
}

interface HistoricalChatProps {
  scientist: Scientist;
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
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
    </svg>
);

const HistoricalChat: React.FC<HistoricalChatProps> = ({ scientist, history, onSendMessage, isLoading, error, onCancelGeneration }) => {
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
            recognition.onresult = (event) => setInput(prev => prev + event.results[event.results.length - 1][0].transcript.trim());
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
        isListening ? recognitionRef.current.stop() : recognitionRef.current.start();
        setIsListening(!isListening);
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
            <div className="p-4 border-b border-slate-800 text-center">
                <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-300 truncate px-4">
                    Chat with {scientist.name}
                </h1>
                <p className="text-slate-400 text-sm mt-1">{scientist.field}</p>
            </div>
            
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
                    {isLoading && history.length > 0 && (
                        <div className="flex gap-4 items-start">
                             <ModelIcon />
                            <div className="max-w-md p-4 rounded-xl bg-slate-950/50 text-slate-300 rounded-bl-none flex items-center gap-4">
                               <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse delay-75"></div>
                                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse delay-150"></div>
                               </div>
                               <button onClick={onCancelGeneration} className="px-3 py-1 text-sm bg-slate-800 text-slate-300 rounded-md hover:bg-slate-700 transition-colors">Stop</button>
                            </div>
                        </div>
                    )}
                     {isLoading && history.length === 0 && (
                        <div className="flex justify-center items-center py-8">
                           <LoadingSpinner />
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

            <div className="p-4 border-t border-slate-800">
                <form onSubmit={handleSubmit} className="flex items-center gap-2">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(e); } }}
                        placeholder={isListening ? "Listening..." : `Ask ${scientist.name} a question...`}
                        rows={1}
                        className="flex-grow bg-slate-800 text-slate-100 p-3 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-shadow disabled:opacity-50"
                        disabled={isLoading}
                    />
                    {isSpeechSupported && (
                        <button type="button" onClick={handleMicClick} className={`p-3 rounded-lg shadow-lg transition-colors disabled:opacity-50 ${isListening ? 'bg-red-600 hover:bg-red-500 animate-pulse' : 'bg-slate-700 hover:bg-slate-600'}`} disabled={isLoading} aria-label={isListening ? 'Stop listening' : 'Start listening'}>
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

export default HistoricalChat;