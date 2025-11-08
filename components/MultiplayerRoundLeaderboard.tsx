import React from 'react';
import type { MultiplayerGameState } from '../types.ts';

interface MultiplayerRoundLeaderboardProps {
    gameData: MultiplayerGameState;
    currentUser: string;
    onNextQuestion: (gameId: string) => void;
}

const MultiplayerRoundLeaderboard: React.FC<MultiplayerRoundLeaderboardProps> = ({ gameData, currentUser, onNextQuestion }) => {
    const isHost = gameData.host === currentUser;
    const question = gameData.questions[gameData.currentQuestionIndex];
    const sortedPlayers = [...gameData.players].sort((a, b) => b.score - a.score);

    return (
        <div className="w-full max-w-3xl mx-auto p-6 md:p-8 bg-slate-900 rounded-xl shadow-2xl border border-slate-800">
            <h1 className="text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-300">Round Over!</h1>
            
            <div className="mt-6 p-4 bg-slate-950/50 border-l-4 border-green-500 rounded-r-md">
                <p className="text-slate-300">The correct answer was:</p>
                <p className="font-semibold text-green-400 text-lg">{question?.answer}</p>
            </div>
            
            <div className="mt-6">
                <h2 className="text-xl font-semibold text-slate-200 mb-2">Scores</h2>
                <div className="space-y-2">
                    {sortedPlayers.map((player, index) => (
                        <div key={player.username} className={`p-3 rounded-md flex justify-between items-center ${player.username === currentUser ? 'bg-cyan-900/50' : 'bg-slate-800'}`}>
                            <div className="flex items-center">
                                <span className="font-bold w-6">#{index + 1}</span>
                                <span className="text-slate-200">{player.username}</span>
                            </div>
                            <span className="font-bold text-white">{player.score} pts</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-8 text-center">
                {isHost ? (
                    <button 
                        onClick={() => onNextQuestion(gameData.gameId)}
                        className="px-8 py-3 bg-cyan-600 text-white font-bold rounded-lg shadow-lg hover:bg-cyan-500 transition-transform transform hover:scale-105"
                    >
                        {gameData.currentQuestionIndex >= gameData.questions.length - 1 ? 'Finish Game' : 'Next Question'}
                    </button>
                ) : (
                    <p className="text-slate-300">Waiting for the host to continue...</p>
                )}
            </div>
        </div>
    );
};

export default MultiplayerRoundLeaderboard;