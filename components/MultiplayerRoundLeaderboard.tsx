import React, { useState, useEffect, useRef } from 'react';
import type { MultiplayerRoom } from '../types';
import { getRoomState, nextQuestion } from '../services/multiplayerService';
import LoadingSpinner from './LoadingSpinner';

interface MultiplayerRoundLeaderboardProps {
  room: MultiplayerRoom;
  isHost: boolean;
  onStateChange: (newRoomState: MultiplayerRoom) => void;
  onNextQuestion: () => void;
}

const MultiplayerRoundLeaderboard: React.FC<MultiplayerRoundLeaderboardProps> = ({ room: initialRoom, isHost, onStateChange, onNextQuestion }) => {
    const [room, setRoom] = useState(initialRoom);
    const [isLoading, setIsLoading] = useState(false); // For "Next Question" button
    const pollingIntervalRef = useRef<number | null>(null);

    const prevQuestion = room.questions[room.currentQuestionIndex];

    useEffect(() => {
        const pollRoomState = async () => {
          try {
            const updatedRoom = await getRoomState(room.roomId);
            setRoom(updatedRoom); // Update local room state for leaderboard
            onStateChange(updatedRoom); // Update parent state
            
            // If the host moved on, the parent's useEffect will catch the index change
            if (updatedRoom.currentQuestionIndex !== room.currentQuestionIndex || updatedRoom.status === 'finished') {
                if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
            }

          } catch (err) {
            console.error('Leaderboard poll failed:', err);
            if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
          }
        };

        pollingIntervalRef.current = window.setInterval(pollRoomState, 2000);

        return () => {
          if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
        };
      }, [room.roomId, room.currentQuestionIndex, onStateChange]);

    const handleNext = async () => {
        setIsLoading(true);
        try {
            // This will update the index on the server.
            // The polling effect in the parent component will see the change and trigger the rerender to the next question.
            await nextQuestion(room.roomId, room.host);
            onNextQuestion(); // Tell parent to optimistically switch
        } catch (err) {
            console.error(err);
            setIsLoading(false);
        }
    };
    
    const getRankColor = (rank: number) => {
        if (rank === 0) return 'text-yellow-400';
        if (rank === 1) return 'text-gray-300';
        if (rank === 2) return 'text-amber-600';
        return 'text-slate-300';
    };

    return (
        <div className="w-full max-w-2xl mx-auto p-8 bg-slate-900 rounded-xl shadow-2xl border border-slate-800 text-center">
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-300 mb-2">Leaderboard</h2>
            <div className="mt-4 p-4 bg-slate-950/50 border border-slate-800 rounded-lg">
                <h3 className="font-semibold text-lg text-cyan-400 mb-2">Correct Answer</h3>
                <p className="text-slate-300 leading-relaxed">{prevQuestion.answer}</p>
            </div>
            
            <div className="my-6 space-y-2">
                {room.scores.map((player, index) => (
                    <div key={player.username} className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                        <span className={`font-bold text-lg ${getRankColor(index)}`}>#{index + 1} {player.username}</span>
                        <span className="font-mono text-xl text-white">{player.score} pts</span>
                    </div>
                ))}
            </div>

            {isHost && (
                <button 
                    onClick={handleNext} 
                    disabled={isLoading}
                    className="w-full px-8 py-3 bg-cyan-600 text-white font-bold rounded-lg shadow-lg hover:bg-cyan-500 transition-transform transform hover:scale-105"
                >
                    {isLoading ? <LoadingSpinner/> : (room.currentQuestionIndex >= room.quizLength - 1 ? 'Finish Game' : 'Next Question')}
                </button>
            )}
            {!isHost && <p className="text-slate-400">Waiting for host to continue...</p>}
        </div>
    );
};

export default MultiplayerRoundLeaderboard;
