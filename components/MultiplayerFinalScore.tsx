import React from 'react';
import type { MultiplayerGameState } from '../types.ts';

interface MultiplayerFinalScoreProps {
    gameData: MultiplayerGameState;
    onExit: () => void;
}

const MultiplayerFinalScore: React.FC<MultiplayerFinalScoreProps> = ({ gameData, onExit }) => {
    const sortedPlayers = [...gameData.players].sort((a, b) => b.score - a.score);
    const winner = sortedPlayers[0];

    return (
        <div className="w-full max-w-2xl mx-auto p-8 bg-slate-900 rounded-xl shadow-2xl border border-slate-800 text-center flex flex-col items-center">
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-300 mb-2">Game Over!</h1>
            
            <div className="mt-6 text-center">
                <p className="text-2xl text-yellow-400">👑 Winner 👑</p>
                <p className="text-4xl font-bold text-white my-2">{winner?.username}</p>
                <p className="text-2xl font-semibold text-slate-300">{winner?.score} Points</p>
            </div>
            
            <div className="mt-8 w-full">
                <h2 className="text-xl font-semibold text-slate-200 mb-2">Final Rankings</h2>
                <div className="space-y-2">
                    {sortedPlayers.map((player, index) => (
                        <div key={player.username} className={`p-3 rounded-md flex justify-between items-center ${index === 0 ? 'bg-yellow-900/50' : 'bg-slate-800'}`}>
                             <div className="flex items-center">
                                <span className="font-bold w-8 text-lg">#{index + 1}</span>
                                <span className="text-slate-200">{player.username}</span>
                            </div>
                            <span className="font-bold text-white">{player.score} pts</span>
                        </div>
                    ))}
                </div>
            </div>

            <button
                onClick={onExit}
                className="mt-10 px-8 py-3 bg-cyan-600 text-white font-bold rounded-lg shadow-lg hover:bg-cyan-500 transition-transform transform hover:scale-105"
            >
                Back to Home
            </button>
        </div>
    );
};

export default MultiplayerFinalScore;