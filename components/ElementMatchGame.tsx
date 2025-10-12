import React, { useState, useEffect, useCallback } from 'react';
import { ELEMENTS } from '../constants.ts';

interface ElementMatchGameProps {
  onEnd: () => void;
}

const GAME_DURATION = 60; // 60 seconds

const ElementMatchGame: React.FC<ElementMatchGameProps> = ({ onEnd }) => {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [currentElement, setCurrentElement] = useState<{ symbol: string; name: string } | null>(null);
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

    // Pick a random element
    const correctElement = ELEMENTS[Math.floor(Math.random() * ELEMENTS.length)];
    setCurrentElement(correctElement);

    // Pick 3 wrong options
    const wrongOptions: string[] = [];
    const elementsCopy = [...ELEMENTS];
    while (wrongOptions.length < 3) {
      const randomIndex = Math.floor(Math.random() * elementsCopy.length);
      const randomElement = elementsCopy.splice(randomIndex, 1)[0];
      if (randomElement.name !== correctElement.name) {
        wrongOptions.push(randomElement.name);
      }
    }

    setOptions(shuffleArray([correctElement.name, ...wrongOptions]));
  }, []);

  useEffect(() => {
    // Initial question setup
    setupNextQuestion();
  }, [setupNextQuestion]);

  useEffect(() => {
    // Game timer
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

    if (option === currentElement?.name) {
      setScore(prev => prev + 1);
    }

    setTimeout(() => {
        if(!gameEnded) {
            setupNextQuestion();
        }
    }, 1000);
  };
  
  const handleRestart = () => {
    setScore(0);
    setTimeLeft(GAME_DURATION);
    setGameEnded(false);
    setupNextQuestion();
  };

  const getButtonClass = (option: string) => {
    if (!isAnswered) {
      return 'bg-slate-800 hover:bg-slate-700 border-slate-700';
    }
    if (option === currentElement?.name) {
      return 'bg-green-700 border-green-500';
    }
    if (option === selectedAnswer) {
      return 'bg-red-700 border-red-500';
    }
    return 'bg-slate-800 border-slate-700 opacity-60';
  };

  if (gameEnded) {
    return (
        <div className="w-full max-w-2xl mx-auto p-8 bg-slate-900 rounded-xl shadow-2xl border border-slate-800 text-center flex flex-col items-center">
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-300 mb-2">Time's Up!</h2>
            <p className="text-lg text-slate-400">Your final score is:</p>
            <p className="text-6xl font-bold text-white my-4">{score}</p>
            <div className="flex gap-4 mt-6">
                 <button
                    onClick={handleRestart}
                    className="px-8 py-3 bg-cyan-600 text-white font-bold rounded-lg shadow-lg hover:bg-cyan-500 transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-opacity-75"
                >
                    Play Again
                </button>
                <button
                    onClick={onEnd}
                    className="px-8 py-3 bg-slate-700 text-white font-bold rounded-lg shadow-lg hover:bg-slate-600 transition-colors"
                >
                    Back to Home
                </button>
            </div>
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
            <p className="text-slate-400 text-lg mb-2">What is the element with the symbol:</p>
            <div className="w-40 h-40 mx-auto bg-slate-950/50 border-4 border-cyan-500 rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-7xl font-bold text-white">{currentElement?.symbol}</span>
            </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
            {options.map((option, index) => (
            <button
                key={index}
                onClick={() => handleAnswerSelect(option)}
                disabled={isAnswered}
                className={`p-5 rounded-lg border-2 text-center text-slate-100 font-semibold text-xl transition-all duration-300 ${getButtonClass(option)} ${!isAnswered ? 'cursor-pointer' : 'cursor-default'}`}
            >
                {option}
            </button>
            ))}
        </div>
    </div>
  );
};

export default ElementMatchGame;
