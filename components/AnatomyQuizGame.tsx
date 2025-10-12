import React, { useState, useEffect, useCallback } from 'react';
import { ANATOMY_QUESTIONS } from '../constants.ts';

interface AnatomyQuizGameProps {
  onEnd: () => void;
}

const GAME_DURATION = 60;

const AnatomyQuizGame: React.FC<AnatomyQuizGameProps> = ({ onEnd }) => {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [currentQuestion, setCurrentQuestion] = useState<(typeof ANATOMY_QUESTIONS)[0] | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [gameEnded, setGameEnded] = useState(false);

  const setupNextQuestion = useCallback(() => {
    setIsAnswered(false);
    setSelectedAnswer(null);
    const item = ANATOMY_QUESTIONS[Math.floor(Math.random() * ANATOMY_QUESTIONS.length)];
    // Shuffle options for variety
    const shuffledOptions = [...item.options].sort(() => Math.random() - 0.5);
    setCurrentQuestion({ ...item, options: shuffledOptions });
  }, []);

  useEffect(() => {
    setupNextQuestion();
  }, [setupNextQuestion]);

  useEffect(() => {
    if (gameEnded) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setGameEnded(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [gameEnded]);

  const handleAnswerSelect = (answer: string) => {
    if (isAnswered) return;
    setIsAnswered(true);
    setSelectedAnswer(answer);

    if (answer === currentQuestion?.answer) {
      setScore(prev => prev + 1);
    }

    setTimeout(() => {
        if(!gameEnded) setupNextQuestion();
    }, 1200);
  };
  
  const getButtonClass = (option: string) => {
    if (!isAnswered) return 'bg-slate-800 hover:bg-slate-700 border-slate-700';
    if (option === currentQuestion?.answer) return 'bg-green-700 border-green-500 scale-105';
    if (option === selectedAnswer) return 'bg-red-700 border-red-500';
    return 'bg-slate-800 border-slate-700 opacity-50';
  };

  if (gameEnded) {
    return (
      <div className="w-full max-w-2xl mx-auto p-8 bg-slate-900 rounded-xl shadow-2xl border border-slate-800 text-center">
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-300 mb-2">Time's Up!</h2>
        <p className="text-lg text-slate-400">Your final score is:</p>
        <p className="text-6xl font-bold text-white my-4">{score}</p>
        <button onClick={onEnd} className="px-8 py-3 mt-6 bg-slate-700 text-white font-bold rounded-lg shadow-lg hover:bg-slate-600">Back to Games</button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-6 md:p-8 bg-slate-900 rounded-xl shadow-2xl border border-slate-800">
      <div className="flex justify-between items-center text-slate-300 font-mono text-xl mb-6">
        <span>Score: {score}</span>
        <span>Time: {timeLeft}s</span>
      </div>

      <div className="text-center mb-8 min-h-[100px] flex items-center justify-center">
        <h2 className="text-3xl font-bold text-white">{currentQuestion?.question}</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {currentQuestion?.options.map(option => (
            <button key={option} onClick={() => handleAnswerSelect(option)} disabled={isAnswered} className={`py-6 rounded-lg border-2 text-center text-white font-bold text-xl transition-all duration-300 ${getButtonClass(option)}`}>
                {option}
            </button>
        ))}
      </div>
    </div>
  );
};

export default AnatomyQuizGame;