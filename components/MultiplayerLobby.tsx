import React, { useState } from 'react';
import type { MultiplayerGameState, Grade } from '../types.ts';
import { CHAPTERS_BY_GRADE } from '../constants.ts';
import LoadingSpinner from './LoadingSpinner.tsx';

interface MultiplayerLobbyProps {
    gameData: MultiplayerGameState;
    currentUser: string;
    onStartGame: (gameId: string, grade: Grade, topic: string, quizLength: number) => void;
}

const MultiplayerLobby: React.FC<MultiplayerLobbyProps> = ({ gameData, currentUser, onStartGame }) => {
    const isHost = gameData.host === currentUser;
    const [grade, setGrade] = useState<Grade>(6);
    const [topic, setTopic] = useState<string>(CHAPTERS_BY_GRADE[6][0]);
    const [quizLength, setQuizLength] = useState<number>(5);
    const [isLoading, setIsLoading] = useState(false);

    const handleStart = () => {
        setIsLoading(true);
        onStartGame(gameData.gameId, grade, topic, quizLength);
    };

    const handleCopyCode = () => {
        navigator.clipboard.writeText(gameData.gameId);
        // Add a visual cue, like a temporary message
    };

    return (
        <div className="w-full max-w-3xl mx-auto p-6 md:p-8 bg-slate-900 rounded-xl shadow-2xl border border-slate-800">
            <h1 className="text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-300">Game Lobby</h1>
            
            <div className="mt-6 text-center">
                <p className="text-slate-400">Share this code with your friends:</p>
                <div className="my-2 p-4 bg-slate-950/50 border-2 border-slate-700 rounded-lg flex items-center justify-center gap-4">
                    <span className="text-5xl font-mono tracking-widest text-white">{gameData.gameId}</span>
                    <button onClick={handleCopyCode} className="p-2 rounded-md hover:bg-slate-700 transition-colors" title="Copy code">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    </button>
                </div>
            </div>

            {isHost && !isLoading && (
                 <div className="mt-6 p-4 border border-slate-800 rounded-lg bg-slate-950/50 space-y-4">
                     <h3 className="text-lg font-semibold text-slate-200">Game Settings</h3>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label htmlFor="grade" className="block text-sm font-medium text-slate-400">Grade</label>
                            <select id="grade" value={grade} onChange={e => { setGrade(Number(e.target.value) as Grade); setTopic(CHAPTERS_BY_GRADE[Number(e.target.value) as Grade][0]); }} className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-md p-2">
                                {[6, 7, 8, 9, 10].map(g => <option key={g} value={g}>{g}</option>)}
                            </select>
                        </div>
                        <div className="md:col-span-2">
                             <label htmlFor="topic" className="block text-sm font-medium text-slate-400">Topic</label>
                            <select id="topic" value={topic} onChange={e => setTopic(e.target.value)} className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-md p-2">
                                {CHAPTERS_BY_GRADE[grade].map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="quizLength" className="block text-sm font-medium text-slate-400">Questions</label>
                             <select id="quizLength" value={quizLength} onChange={e => setQuizLength(Number(e.target.value))} className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-md p-2">
                                <option value={5}>5</option>
                                <option value={10}>10</option>
                                <option value={15}>15</option>
                            </select>
                        </div>
                    </div>
                </div>
            )}

            <div className="mt-6">
                <h2 className="text-xl font-semibold text-slate-200 mb-2">Players ({gameData.players.length}/8)</h2>
                <div className="grid grid-cols-2 gap-3">
                    {gameData.players.map(player => (
                        <div key={player.username} className="p-3 bg-slate-800 rounded-md text-slate-200 text-center">
                            {player.username} {player.username === gameData.host && '👑'}
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-8 text-center">
                {isHost ? (
                    <button onClick={handleStart} disabled={isLoading || gameData.players.length < 2} className="w-full px-8 py-4 bg-green-600 text-white font-bold text-lg rounded-lg shadow-lg hover:bg-green-500 disabled:bg-slate-700 disabled:cursor-not-allowed flex justify-center items-center h-[60px]">
                        {isLoading ? <LoadingSpinner /> : `Start Game (${gameData.players.length} Players)`}
                    </button>
                ) : (
                    <div className="flex flex-col items-center">
                        <LoadingSpinner />
                        <p className="text-slate-300 mt-2">Waiting for the host to start the game...</p>
                    </div>
                )}
                 {isHost && gameData.players.length < 2 && <p className="text-sm text-yellow-400 mt-2">You need at least 2 players to start.</p>}
            </div>
        </div>
    );
};

export default MultiplayerLobby;
