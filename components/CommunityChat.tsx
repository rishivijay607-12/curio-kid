
import React, { useState, useEffect, useRef } from 'react';
import type { CommunityMessage } from '../types.ts';
import { getMessages, sendMessage } from '../services/chatService.ts';
import LoadingSpinner from './LoadingSpinner.tsx';

interface CommunityChatProps {
    username: string;
    onExit: () => void;
}

const SendIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
);

const CommunityChat: React.FC<CommunityChatProps> = ({ username, onExit }) => {
    const [messages, setMessages] = useState<CommunityMessage[]>([]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const pollingInterval = useRef<number | null>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchMessages = async () => {
        try {
            const msgs = await getMessages();
            setMessages(msgs);
        } catch (error) {
            console.error("Failed to fetch messages:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages().then(scrollToBottom);
        
        // Poll every 3 seconds
        pollingInterval.current = window.setInterval(fetchMessages, 3000);

        return () => {
            if (pollingInterval.current) clearInterval(pollingInterval.current);
        };
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputText.trim() || isSending) return;

        const textToSend = inputText;
        setInputText(''); // Optimistic clear
        setIsSending(true);

        try {
            // Optimistic update (show message immediately, maybe grayed out or just show it)
            // Ideally we wait for the sanitized version from server, but for speed we can wait.
            // Let's just wait for the server response to be safe about sanitization.
            
            await sendMessage(username, textToSend);
            await fetchMessages(); // Refresh immediately
        } catch (error) {
            console.error("Failed to send message:", error);
            alert("Failed to send message. Please try again.");
            setInputText(textToSend); // Restore text on fail
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto h-[85vh] flex flex-col bg-slate-900 rounded-xl shadow-2xl border border-slate-800 overflow-hidden">
            {/* Header */}
            <div className="p-4 bg-slate-950/50 border-b border-slate-800 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/20 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-100">Community Chat</h2>
                        <p className="text-xs text-slate-400 flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            Live • Safe • Moderated by AI
                        </p>
                    </div>
                </div>
                <button onClick={onExit} className="px-4 py-2 text-sm bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors">
                    Exit
                </button>
            </div>

            {/* Messages Area */}
            <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-slate-900/50 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                {isLoading ? (
                    <div className="flex justify-center items-center h-full">
                        <LoadingSpinner />
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <p>No messages yet. Be the first to say hello!</p>
                    </div>
                ) : (
                    messages.map((msg) => {
                        const isOwn = msg.username === username;
                        return (
                            <div key={msg.id} className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
                                <div className={`flex items-end gap-2 max-w-[80%] ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                                    {/* Avatar Placeholder */}
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${isOwn ? 'bg-cyan-600 text-white' : 'bg-slate-700 text-slate-300'}`}>
                                        {msg.username.substring(0, 2).toUpperCase()}
                                    </div>
                                    
                                    {/* Bubble */}
                                    <div className={`px-4 py-3 rounded-2xl break-words text-sm relative group ${
                                        isOwn 
                                            ? 'bg-cyan-600 text-white rounded-tr-none' 
                                            : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700'
                                    }`}>
                                        {!isOwn && (
                                            <p className="text-[10px] font-bold text-cyan-400 mb-1 opacity-75">{msg.username}</p>
                                        )}
                                        <p className="leading-relaxed">{msg.text}</p>
                                        <p className={`text-[10px] mt-1 text-right opacity-50 ${isOwn ? 'text-cyan-100' : 'text-slate-400'}`}>
                                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-slate-950 border-t border-slate-800">
                <form onSubmit={handleSend} className="flex gap-2">
                    <input
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder="Type a message... (Be kind & curious!)"
                        className="flex-grow px-4 py-3 bg-slate-800 border border-slate-700 rounded-full text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent placeholder-slate-500 transition-all"
                        disabled={isSending}
                    />
                    <button
                        type="submit"
                        disabled={!inputText.trim() || isSending}
                        className="p-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-full shadow-lg transition-transform transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                        {isSending ? (
                            <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (
                            <SendIcon />
                        )}
                    </button>
                </form>
                <p className="text-center text-[10px] text-slate-500 mt-2">
                    Messages are moderated by AI. Please do not share personal information.
                </p>
            </div>
        </div>
    );
};

export default CommunityChat;
