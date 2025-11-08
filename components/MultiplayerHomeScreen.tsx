import React, { useState, useEffect } from 'react';
import LoadingSpinner from './LoadingSpinner.tsx';
import type { MultiplayerGameState } from '../types.ts';
import { getPublicGames } from '../services/multiplayerService.ts';

interface MultiplayerHomeScreenProps {
    onCreateGame: (isPublic: boolean) => Promise<void>;
    onJoinGame: (gameId: string) => Promise<void>;
}

const ToggleSwitch: React.FC<{ checked: boolean, onChange: (checked: boolean) => void }> = ({ checked, onChange }) => (
    <button
        onClick={() => onChange(!checked)}
        className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-cyan-500 ${checked ? 'bg-cyan-600' : 'bg-slate-700'}`}
    >
        <span
            className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-300 ${checked ? 'translate-x-6' : 'translate-x-1'}`}
        />
    </button>
);


const MultiplayerHomeScreen: React.FC<MultiplayerHomeScreenProps> = ({ onCreateGame, onJoinGame }) => {
    const [gameCode, setGameCode] = useState('');
    const [isPublic, setIsPublic] = useState(true);
    const [publicGames, setPublicGames] = useState<MultiplayerGameState[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetchingPublic, setIsFetchingPublic] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchPublicGames = async () => {
        setIsFetchingPublic(true);
        try {
            const games = await getPublicGames();
            setPublicGames(games);
        } catch (err) {
            // Non-critical error, just log it
            console.error("Failed to fetch public games:", err);
        } finally {
            setIsFetchingPublic(false);
        }
    };

    useEffect(() => {
        fetchPublicGames();
    }, []);
    

    const handleAction = async (action: () => Promise<void>) => {
        setIsLoading(true);
        setError(null);
        try {
            await action();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
            setIsLoading(false);
        }
    };

    const handleCreate = () => handleAction(() => onCreateGame(isPublic));
    const handleJoinWithCode = (e: React.FormEvent) => {
        e.preventDefault();
        if (!gameCode.trim()) return setError('Please enter a game code.');
        handleAction(() => onJoinGame(gameCode.trim().toUpperCase()));
    };
    const handleJoinPublic = (id: string) => handleAction(() => onJoinGame(id));


    if (isLoading) {
        return (
            <div className="w-full max-w-md mx-auto p-8 text-center">
                <LoadingSpinner />
                <p className="mt-4 text-slate-300">Connecting to game...</p>
            </div>
        )
    }

    return (
        <div className="w-full max-w-2xl mx-auto p-6 md:p-8 bg-slate-900 rounded-xl shadow-2xl border border-slate-800">
            <h1 className="text-4xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-300 mb-8">Multiplayer Quiz</h1>

            {error && (
                <div className="mb-4 p-3 bg-red-900/50 border border-red-500 rounded-lg text-red-400 text-sm text-center">
                    {error}
                </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Side: Create & Join Private */}
                <div className="space-y-6 p-4 bg-slate-950/40 rounded-lg">
                    {/* Create Game */}
                    <div>
                        <h2 className="text-xl font-semibold text-slate-100 mb-3">Create a Game</h2>
                        <div className="flex items-center justify-between p-3 bg-slate-800 rounded-md">
                            <span className={`font-medium ${!isPublic ? 'text-cyan-400' : 'text-slate-400'}`}>Private</span>
                            <ToggleSwitch checked={isPublic} onChange={setIsPublic} />
                            <span className={`font-medium ${isPublic ? 'text-cyan-400' : 'text-slate-400'}`}>Public</span>
                        </div>
                        <button onClick={handleCreate} className="mt-3 w-full px-6 py-3 bg-cyan-600 text-white font-bold rounded-lg shadow-lg hover:bg-cyan-500 transition-transform transform hover:scale-105">
                            Create New Game
                        </button>
                    </div>

                    <div className="relative flex items-center justify-center">
                        <hr className="w-full border-slate-700" />
                        <span className="absolute px-3 font-medium text-slate-400 bg-slate-950/40">OR</span>
                    </div>

                    {/* Join with Code */}
                    <div>
                         <h2 className="text-xl font-semibold text-slate-100 mb-3">Join with Code</h2>
                        <form onSubmit={handleJoinWithCode} className="flex gap-2">
                            <input
                                type="text"
                                value={gameCode}
                                onChange={(e) => setGameCode(e.target.value)}
                                placeholder="ABCD"
                                maxLength={4}
                                className="flex-grow text-center text-xl font-mono tracking-widest bg-slate-800 border-2 border-slate-700 rounded-lg p-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 uppercase"
                            />
                            <button type="submit" className="px-4 py-2 bg-teal-600 text-white font-bold rounded-lg shadow-lg hover:bg-teal-500">
                                Join
                            </button>
                        </form>
                    </div>
                </div>

                {/* Right Side: Public Games */}
                <div className="p-4 bg-slate-950/40 rounded-lg flex flex-col">
                    <div className="flex justify-between items-center mb-3">
                        <h2 className="text-xl font-semibold text-slate-100">Public Games</h2>
                        <button onClick={fetchPublicGames} disabled={isFetchingPublic} className="p-1 rounded-full hover:bg-slate-700 transition-colors disabled:opacity-50" title="Refresh list">
                           <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 text-slate-300 ${isFetchingPublic ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h5M20 20v-5h-5M20 4h-5v5M4 20h5v-5" /></svg>
                        </button>
                    </div>
                    <div className="flex-grow overflow-y-auto space-y-2 pr-2">
                        {isFetchingPublic ? (
                            <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>
                        ) : publicGames.length > 0 ? (
                            publicGames.map(game => (
                                <div key={game.gameId} className="p-3 bg-slate-800 rounded-md flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold text-slate-200">{game.host}'s Game</p>
                                        <p className="text-sm text-slate-400">{game.players.length}/8 Players</p>
                                    </div>
                                    <button onClick={() => handleJoinPublic(game.gameId)} className="px-4 py-1 bg-cyan-700 text-white font-semibold rounded-md hover:bg-cyan-600">
                                        Join
                                    </button>
                                </div>
                            ))
                        ) : (
                           <div className="flex justify-center items-center h-full text-slate-400 text-center">No public games found.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MultiplayerHomeScreen;