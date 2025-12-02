
import React, { useState, useEffect, useRef } from 'react';
import type { CommunityMessage } from '../types.ts';
import { getMessages, sendMessage } from '../services/chatService.ts';
import LoadingSpinner from './LoadingSpinner.tsx';

interface CommunityChatProps {
    username: string;
}

const SendIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
);

const MinimizeIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
    </svg>
);

const ChatBubbleIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
);

const CommunityChat: React.FC<CommunityChatProps> = ({ username }) => {
    const [messages, setMessages] = useState<CommunityMessage[]>([]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [isMinimized, setIsMinimized] = useState(true);
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
        if (!isMinimized) {
            fetchMessages().then(scrollToBottom);
            pollingInterval.current = window.setInterval(fetchMessages, 3000);
        }
        return () => {
            if (pollingInterval.current) clearInterval(pollingInterval.current);
        };
    }, [isMinimized]);

    useEffect(() => {
        if (!isMinimized) {
            scrollToBottom();
        }
    }, [messages, isMinimized]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputText.trim() || isSending) return;

        const textToSend = inputText;
        setInputText(''); // Optimistic clear
        setIsSending(true);

        try {
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

    if (isMinimized) {
        return (
            <button
                onClick={() => setIsMinimized(false)}
                className="fixed bottom-6 right-6 p-4 bg-cyan-600 text-white rounded-full shadow-lg hover:bg-cyan-500 transition-all transform hover:scale-110 z-50 flex items-center gap-2"
                title="Open Community Chat"
            >
                <ChatBubbleIcon />
                <span className="font-semibold hidden md:inline">Chat</span>
            </button>
        );
    }

    return (
        <div className="fixed right-0 bottom-0 top-16 w-full md:w-80 bg-slate-950 border-l border-slate-800 shadow-2xl z-40 flex flex-col transition-transform duration-300">
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b border-slate-800 bg-slate-900">
                <div className="flex items-center gap-2">
                    <span className="text-slate-100 font-semibold">Top Chat</span>
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                </div>
                <button 
                    onClick={() => setIsMinimized(true)} 
                    className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
                    title="Minimize"
                >
                    <MinimizeIcon />
                </button>
            </div>

            {/* Messages List */}
            <div className="flex-grow overflow-y-auto p-4 space-y-3 bg-slate-950 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
                {isLoading ? (
                    <div className="flex justify-center items-center h-full">
                        <LoadingSpinner />
                    </div>
                ) : messages.length === 0 ? (
                    <div className="text-center text-slate-500 mt-10">
                        <p className="text-sm">Welcome to live chat!</p>
                        <p className="text-xs mt-1">Remember to guard your privacy.</p>
                    </div>
                ) : (
                    messages.map((msg) => {
                        const isOwn = msg.username === username;
                        // Generate a color based on username hash simply for variety
                        const colors = ['text-cyan-400', 'text-pink-400', 'text-yellow-400', 'text-green-400', 'text-purple-400'];
                        const colorIndex = msg.username.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
                        const userColor = colors[colorIndex];

                        return (
                            <div key={msg.id} className="flex gap-3 text-sm group">
                                <div className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold bg-slate-800 text-slate-300 select-none`}>
                                    {msg.username.substring(0, 1).toUpperCase()}
                                </div>
                                <div className="flex-grow min-w-0">
                                    <span className={`font-semibold mr-2 ${userColor} opacity-90`}>
                                        {msg.username}
                                    </span>
                                    <span className="text-slate-300 break-words leading-relaxed">
                                        {msg.text}
                                    </span>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 border-t border-slate-800 bg-slate-900">
                <form onSubmit={handleSend} className="flex items-center gap-2">
                    <div className="relative flex-grow">
                        <input
                            type="text"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder="Chat..."
                            className="w-full pl-4 pr-2 py-2 bg-slate-800 border border-slate-700 rounded-full text-sm text-slate-100 focus:outline-none focus:border-cyan-500 transition-colors"
                            disabled={isSending}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={!inputText.trim() || isSending}
                        className="p-2 text-slate-400 hover:text-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <SendIcon />
                    </button>
                </form>
                <div className="flex justify-between items-center mt-2 px-1">
                     <span className="text-[10px] text-slate-500">AI Moderated</span>
                     <div className="flex gap-2 text-slate-500">
                        <span className="text-lg hover:text-yellow-400 cursor-pointer">😊</span>
                        <span className="text-lg hover:text-red-400 cursor-pointer">❤️</span>
                     </div>
                </div>
            </div>
        </div>
    );
};

export default CommunityChat;
