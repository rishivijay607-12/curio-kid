import React from 'react';
import type { MultiplayerRoom } from '../types';

interface MultiplayerFinalScoreProps {
  room: MultiplayerRoom;
  onPlayAgain: () => void;
}

const MultiplayerFinalScore: React.FC<MultiplayerFinalScoreProps> = ({ room, onPlayAgain }) => {
  const winner = room.scores[0]?.username || 'Nobody';

  const getRankColor = (rank: number) => {
    if (rank === 0) return 'border-yellow-400 bg-yellow-900/50';
    if (rank === 1) return 'border-gray-400 bg-gray-900/50';
    if (rank === 2) return 'border-amber-600 bg-amber-900/50';
    return 'border-slate-800 bg-slate-900/50';
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-8 bg-slate-900 rounded-xl shadow-2xl border border-slate-800 text-center flex flex-col items-center">
      <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-300 mb-2">Quiz Finished!</h2>
      <p className="text-5xl font-bold text-white my-4">🎉 {winner} Wins! 🎉</p>
      
      <div className="w-full my-6 space-y-3">
         <h3 className="text-xl font-semibold text-slate-200 mb-3">Final Scores:</h3>
         {room.scores.map((player, index) => (
            <div key={player.username} className={`flex justify-between items-center p-4 border-2 rounded-lg ${getRankColor(index)}`}>
                <span className={`font-bold text-2xl`}>#{index + 1} {player.username}</span>
                <span className="font-mono text-2xl text-white">{player.score} pts</span>
            </div>
         ))}
      </div>

      <button
        onClick={onPlayAgain}
        className="px-8 py-3 bg-cyan-600 text-white font-bold rounded-lg shadow-lg hover:bg-cyan-500 transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-opacity-75"
      >
        Play Again
      </button>
    </div>
  );
};

export default MultiplayerFinalScore;
