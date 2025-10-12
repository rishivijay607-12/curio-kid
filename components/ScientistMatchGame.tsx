import React, { useState, useEffect, useCallback } from 'react';
import { SCIENTIST_DISCOVERIES } from '../constants.ts';

interface ScientistMatchGameProps {
  onEnd: () => void;
}

const GAME_DURATION = 60;

const ScientistMatchGame: React.FC<ScientistMatchGameProps> = ({ onEnd }) => {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [currentItem, setCurrentItem] = useState<{ name: string; discovery: string } | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);

  const shuffleArray = <T,>(array: T[]): T[] => {
    return array.sort(() => Math.random() - 0.5);
  };

  const setupNextQuestion = useCallback(() => {
    setIsAnswered(false);
    setSelectedAnswer(null);

    const correctItem = SCIENTIST_DISCOVERIES[Math.floor(Math.random() * SCIENTIST_DISCOVERIES.length)];
    setCurrentItem(correctItem);

    const wrongOptions: string[] = [];
    const itemsCopy = [...SCIENTIST_DISCOVERIES];
    while (wrongOptions.length < 3) {
      const randomIndex = Math.floor(Math.random() * itemsCopy.length);
      const randomItem = itemsCopy.splice(randomIndex, 1)[0];
      if (randomItem.discovery !== correctItem.discovery) {
        wrongOptions.push(randomItem.discovery);
      }
    }

    setOptions(shuffleArray([correctItem.discovery, ...wrongOptions]));
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

  const handleAnswerSelect = (option: string) => {
    if (isAnswered) return;

    setIsAnswered(true);
    setSelectedAnswer(option);

    if (option === currentItem?.discovery) {
      setScore(prev => prev + 1);
    }

    setTimeout(() => {
        if(!gameEnded) setupNextQuestion();
    }, 1200);
  };
  
  const getButtonClass = (option: string) => {
    if (!isAnswered) return 'bg-slate-800 hover:bg-slate-700 border-slate-700';
    if (option === currentItem?.discovery) return 'bg-green-700 border-green-500';
    if (option === selectedAnswer) return 'bg-red-700 border-red-500';
    return 'bg-slate-800 border-slate-700 opacity-60';
  };

  if (gameEnded) {
    return (
        <div className="w-full max-w-2xl mx-auto p-8 bg-slate-900 rounded-xl shadow-2xl border border-slate-800 text-center flex flex-col items-center">
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

        <div className="text-center mb-8 min-h-[120px]">
            <p className="text-slate-400 text-lg mb-2">What is {currentItem?.name} famous for?</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {options.map((option, index) => (
            <button
                key={index}
                onClick={() => handleAnswerSelect(option)}
                disabled={isAnswered}
                className={`p-5 min-h-[80px] flex items-center justify-center rounded-lg border-2 text-center text-slate-100 font-semibold text-lg transition-all duration-300 ${getButtonClass(option)} ${!isAnswered ? 'cursor-pointer' : 'cursor-default'}`}
            >
                {option}
            </button>
            ))}
        </div>
    </div>
  );
};

export default ScientistMatchGame;