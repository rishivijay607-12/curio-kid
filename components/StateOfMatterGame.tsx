import React, { useState, useEffect, useCallback } from 'react';
import { STATES_OF_MATTER_ITEMS } from '../constants.ts';

interface StateOfMatterGameProps {
  onEnd: () => void;
}

const GAME_DURATION = 45;

const StateOfMatterGame: React.FC<StateOfMatterGameProps> = ({ onEnd }) => {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [currentItem, setCurrentItem] = useState<{ item: string; state: string } | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [gameEnded, setGameEnded] = useState(false);

  const setupNextQuestion = useCallback(() => {
    setIsAnswered(false);
    setSelectedAnswer(null);
    const item = STATES_OF_MATTER_ITEMS[Math.floor(Math.random() * STATES_OF_MATTER_ITEMS.length)];
    setCurrentItem(item);
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

  const handleAnswerSelect = (answer: 'Solid' | 'Liquid' | 'Gas') => {
    if (isAnswered) return;
    setIsAnswered(true);
    setSelectedAnswer(answer);

    if (answer === currentItem?.state) {
      setScore(prev => prev + 1);
    }

    setTimeout(() => {
        if(!gameEnded) setupNextQuestion();
    }, 1200);
  };
  
  const getButtonClass = (state: string) => {
    if (!isAnswered) return 'bg-slate-800 hover:bg-slate-700 border-slate-700';
    if (state === currentItem?.state) return 'bg-green-700 border-green-500 scale-105';
    if (state === selectedAnswer) return 'bg-red-700 border-red-500';
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

      <div className="text-center mb-8">
        <p className="text-slate-400 text-lg mb-2">What is the state of matter for:</p>
        <div className="w-full p-4 min-h-[80px] flex items-center justify-center bg-slate-950/50 rounded-lg shadow-lg">
          <span className="text-5xl font-bold text-white">{currentItem?.item}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button onClick={() => handleAnswerSelect('Solid')} disabled={isAnswered} className={`py-6 rounded-lg border-2 text-center text-white font-bold text-2xl transition-all duration-300 ${getButtonClass('Solid')}`}>
            Solid
        </button>
        <button onClick={() => handleAnswerSelect('Liquid')} disabled={isAnswered} className={`py-6 rounded-lg border-2 text-center text-white font-bold text-2xl transition-all duration-300 ${getButtonClass('Liquid')}`}>
            Liquid
        </button>
        <button onClick={() => handleAnswerSelect('Gas')} disabled={isAnswered} className={`py-6 rounded-lg border-2 text-center text-white font-bold text-2xl transition-all duration-300 ${getButtonClass('Gas')}`}>
            Gas
        </button>
      </div>
    </div>
  );
};

export default StateOfMatterGame;
