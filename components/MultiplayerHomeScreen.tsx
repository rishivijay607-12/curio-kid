import React, { useState } from 'react';
import LoadingSpinner from './LoadingSpinner';

interface MultiplayerHomeScreenProps {
  onJoin: (roomId: string) => void;
  onCreate: () => void;
  isLoading: boolean;
  error: string | null;
}

const MultiplayerHomeScreen: React.FC<MultiplayerHomeScreenProps> = ({ onJoin, onCreate, isLoading, error }) => {
  const [roomId, setRoomId] = useState('');

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomId.trim()) {
      onJoin(roomId.trim().toUpperCase());
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-8 bg-slate-900 rounded-xl shadow-2xl border border-slate-800 text-center">
      <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-300">
        Study Group Showdown
      </h1>
      <p className="text-slate-400 mt-2 mb-8">Challenge your friends in a real-time quiz!</p>

      {error && (
        <div className="mb-4 p-3 bg-red-900/50 border border-red-500 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-6">
        <form onSubmit={handleJoinSubmit} className="space-y-4">
          <input
            type="text"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            placeholder="Enter Room Code"
            maxLength={6}
            className="w-full text-center bg-slate-800 border-2 border-slate-700 rounded-lg p-4 text-2xl font-bold tracking-[0.5em] uppercase text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-colors"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !roomId.trim()}
            className="w-full px-8 py-4 bg-teal-500 text-white font-bold rounded-lg shadow-lg hover:bg-teal-400 transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-teal-300 disabled:bg-slate-700 disabled:cursor-not-allowed"
          >
            {isLoading ? <LoadingSpinner /> : 'Join Game'}
          </button>
        </form>

        <div className="flex items-center">
          <div className="flex-grow border-t border-slate-700"></div>
          <span className="flex-shrink mx-4 text-slate-500">OR</span>
          <div className="flex-grow border-t border-slate-700"></div>
        </div>

        <button
          onClick={onCreate}
          disabled={isLoading}
          className="w-full px-8 py-4 bg-cyan-600 text-white font-bold rounded-lg shadow-lg hover:bg-cyan-500 transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-cyan-400 disabled:bg-slate-700 disabled:cursor-not-allowed"
        >
          Create New Game
        </button>
      </div>
    </div>
  );
};

export default MultiplayerHomeScreen;
