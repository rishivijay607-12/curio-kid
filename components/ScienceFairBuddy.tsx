import React, { useState } from 'react';
import LoadingSpinner from './LoadingSpinner';

interface ScienceFairBuddyProps {
    onGenerate: (userInput: string) => void;
    isLoading: boolean;
    error: string | null;
}

const ScienceFairBuddy: React.FC<ScienceFairBuddyProps> = ({ onGenerate, isLoading, error }) => {
    const [userInput, setUserInput] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (userInput.trim() && !isLoading) {
            onGenerate(userInput.trim());
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto p-6 md:p-8">
            <div className="text-center mb-8">
                <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-300">
                    Science Fair Buddy
                </h1>
                <p className="text-slate-300 mt-4 text-xl">What topics are you interested in?</p>
            </div>
            
            <form onSubmit={handleSubmit}>
                <textarea
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="e.g., renewable energy, chemistry, plants, electricity, robots..."
                    rows={5}
                    className="w-full bg-slate-900 text-slate-100 p-4 rounded-lg resize-y border-2 border-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-shadow disabled:opacity-50"
                    disabled={isLoading}
                />
                <button
                    type="submit"
                    disabled={isLoading || !userInput.trim()}
                    className="mt-6 w-full px-8 py-4 bg-slate-800 text-white font-bold text-lg rounded-lg shadow-lg hover:bg-slate-700 transition-all focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-opacity-75 disabled:bg-slate-700 disabled:cursor-not-allowed"
                >
                    {isLoading ? <LoadingSpinner /> : 'Get Project Ideas'}
                </button>
            </form>
            
            {error && (
                <div className="mt-6 p-4 text-center bg-red-900/50 border border-red-500 rounded-lg">
                    <p className="font-semibold text-red-400">Failed to get ideas</p>
                    <p className="text-slate-300 text-sm mt-1">{error}</p>
                </div>
            )}
        </div>
    );
};

export default ScienceFairBuddy;