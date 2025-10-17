import React, { useState, useEffect, useRef } from 'react';
import type { MultiplayerRoom, User } from '../types';
import { getRoomState, startGame } from '../services/multiplayerService';
import LoadingSpinner from './LoadingSpinner';

interface MultiplayerLobbyProps {
  room: MultiplayerRoom;
  currentUser: User;
  onStateChange: (newRoomState: MultiplayerRoom) => void;
  onStartGame: () => void;
}

const MultiplayerLobby: React.FC<MultiplayerLobbyProps> = ({ room, currentUser, onStateChange, onStartGame }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollingIntervalRef = useRef<number | null>(null);

  const isHost = room.host === currentUser.username;

  useEffect(() => {
    const pollRoomState = async () => {
      try {
        const updatedRoom = await getRoomState(room.roomId);
        onStateChange(updatedRoom);
        if (updatedRoom.status === 'in-progress') {
          if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
          onStartGame();
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Connection to room lost.');
        if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
      }
    };

    pollingIntervalRef.current = window.setInterval(pollRoomState, 3000);

    return () => {
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
    };
  }, [room.roomId, onStateChange, onStartGame]);
  
  const handleStartGame = async () => {
    setIsLoading(true);
    setError(null);
    try {
        await startGame(room.roomId, currentUser.username);
        // Polling will handle the state transition
    } catch(err) {
        setError(err instanceof Error ? err.message : 'Failed to start game.');
        setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(room.roomId).then(() => {
        alert("Room Code copied to clipboard!");
    }, (err) => {
        console.error('Could not copy text: ', err);
    });
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-8 bg-slate-900 rounded-xl shadow-2xl border border-slate-800">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-300">
          Game Lobby
        </h1>
        <p className="text-slate-400 mt-2">Share the code below with your friends!</p>
        
        <div 
            className="my-6 p-4 bg-slate-950/50 border-2 border-dashed border-slate-700 rounded-lg cursor-pointer hover:border-cyan-500"
            onClick={copyToClipboard}
            title="Click to copy"
        >
          <p className="text-5xl font-bold tracking-[0.5em] text-white text-center">{room.roomId}</p>
        </div>

        <div className="text-left">
            <h2 className="text-xl font-semibold text-slate-200 mb-3">Players ({room.players.length}):</h2>
            <ul className="space-y-2 bg-slate-800/50 p-4 rounded-lg min-h-[100px]">
                {room.players.map(player => (
                    <li key={player} className="text-slate-300 text-lg flex items-center">
                       {player}
                       {player === room.host && <span className="ml-2 text-xs font-bold text-cyan-400 bg-slate-700 px-2 py-0.5 rounded-full">HOST</span>}
                    </li>
                ))}
            </ul>
        </div>
        
        {error && <p className="text-red-400 mt-4 text-center">{error}</p>}

        {isHost ? (
             <button
                onClick={handleStartGame}
                disabled={isLoading}
                className="mt-8 w-full px-8 py-4 bg-green-600 text-white font-bold rounded-lg shadow-lg hover:bg-green-500 transition-transform transform hover:scale-105 disabled:bg-slate-700"
            >
                {isLoading ? <LoadingSpinner /> : 'Start Game!'}
            </button>
        ) : (
            <div className="mt-8 text-center text-lg text-slate-300">
                <p>Waiting for the host to start the game...</p>
            </div>
        )}

      </div>
    </div>
  );
};

export default MultiplayerLobby;
