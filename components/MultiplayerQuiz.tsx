import React, { useState, useEffect } from 'react';
import type { MultiplayerGameState } from '../types.ts';

interface MultiplayerQuizProps {
    gameData: MultiplayerGameState;
    currentUser: string;
    onSubmitAnswer: (gameId: string, questionIndex: number, answer: string, timeTaken: number) => void;
}

const MultiplayerQuiz: React.FC<MultiplayerQuizProps> = ({ gameData, currentUser, onSubmitAnswer }) => {
    const [timeLeft, setTimeLeft] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

    const question = gameData.questions[gameData.currentQuestionIndex];
    const player = gameData.players.find(p => p.username === currentUser);
    const isAnswered = player?.answeredThisRound || false;

    useEffect(() => {
        setSelectedAnswer(null); // Reset selection for new question
        const updateTimer = () => {
            const remaining = Math.max(0, Math.round((gameData.roundEndTime - Date.now()) / 1000));
            setTimeLeft(remaining);
        };
        updateTimer();
        const intervalId = setInterval(updateTimer, 1000);
        return () => clearInterval(intervalId);
    }, [gameData.currentQuestionIndex, gameData.roundEndTime]);

    const handleAnswerSelect = (option: string) => {
        if (isAnswered) return;
        const timeTaken = gameData.roundEndTime - Date.now() - (timeLeft * 1000);
        setSelectedAnswer(option);
        onSubmitAnswer(gameData.gameId, gameData.currentQuestionIndex, option, timeTaken);
    };

    const getButtonClass = (option: string) => {
        if (!isAnswered) {
            return 'bg-slate-800 hover:bg-slate-700 border-slate-700';
        }
        if (option === selectedAnswer) {
            return 'bg-cyan-800 border-cyan-500'; // Highlight user's choice
        }
        return 'bg-slate-800 border-slate-700 opacity-60';
    };

    return (
        <div className="w-full max-w-3xl mx-auto p-6 md:p-8 bg-slate-900 rounded-xl shadow-2xl border border-slate-800">
            <div className="mb-6">
                <div className="flex justify-between items-center text-slate-400 mb-2">
                    <span>Question {gameData.currentQuestionIndex + 1}/{gameData.questions.length}</span>
                    <span className="font-mono text-lg">Time: {timeLeft}s</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-700">
                    <div className="h-full rounded-full bg-cyan-500" style={{ width: `${((gameData.currentQuestionIndex + 1) / gameData.questions.length) * 100}%` }}></div>
                </div>
            </div>

            <h2 className="text-2xl md:text-3xl font-semibold text-slate-100 mb-6 min-h-[100px]">{question?.question}</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {question?.options.map((option, index) => (
                    <button
                        key={index}
                        onClick={() => handleAnswerSelect(option)}
                        disabled={isAnswered}
                        className={`p-4 rounded-lg border-2 text-left text-slate-100 font-medium transition-all duration-300 ${getButtonClass(option)} ${!isAnswered ? 'cursor-pointer' : 'cursor-default'}`}
                    >
                        {option}
                    </button>
                ))}
            </div>

            <div className="mt-8 text-center min-h-[52px]">
                {isAnswered && (
                    <p className="text-lg text-slate-300">Your answer is locked in! Waiting for others...</p>
                )}
            </div>
        </div>
    );
};

export default MultiplayerQuiz;
