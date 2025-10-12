import React, { useState, useEffect, useCallback } from 'react';
import { LAB_SAFETY_RULES } from '../constants.ts';

interface LabSafetyGameProps {
  onEnd: () => void;
}

const GAME_DURATION = 45;

const LabSafetyGame: React.FC<LabSafetyGameProps> = ({ onEnd }) => {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [currentRule, setCurrentRule] = useState<{ rule: string; type: string } | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [gameEnded, setGameEnded] = useState(false);

  const setupNextQuestion = useCallback(() => {
    setIsAnswered(false);
    setSelectedAnswer(null);
    const rule = LAB_SAFETY_RULES[Math.floor(Math.random() * LAB_SAFETY_RULES.length)];
    setCurrentRule(rule);
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

  const handleAnswerSelect = (answer: 'Safe' | 'Unsafe') => {
    if (isAnswered) return;
    setIsAnswered(true);
    setSelectedAnswer(answer);

    if (answer === currentRule?.type) {
      setScore(prev => prev + 1);
    }

    setTimeout(() => {
        if(!gameEnded) setupNextQuestion();
    }, 1200);
  };
  
  const getButtonClass = (type: 'Safe' | 'Unsafe') => {
    if (!isAnswered) {
        if (type === 'Safe') return 'bg-green-800 hover:bg-green-700 border-green-600';
        return 'bg-red-800 hover:bg-red-700 border-red-600';
    }
    if (type === currentRule?.type) {
      return 'bg-green-600 border-green-400 scale-105';
    }
    if (type === selectedAnswer) {
      return 'bg-red-600 border-red-400';
    }
    return 'bg-slate-800 border-slate-700 opacity-50';
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

        <div className="text-center mb-8 min-h-[160px] flex flex-col justify-center items-center">
            <p className="text-slate-400 text-lg mb-2">Is this lab behavior...</p>
            <div className="w-full p-4 bg-slate-950/50 border-2 border-slate-800 rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-2xl text-center font-semibold text-white">{currentRule?.rule}</span>
            </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
            <button onClick={() => handleAnswerSelect('Safe')} disabled={isAnswered} className={`py-8 rounded-lg border-4 text-center text-white font-bold text-3xl transition-all duration-300 ${getButtonClass('Safe')}`}>
                Safe
            </button>
            <button onClick={() => handleAnswerSelect('Unsafe')} disabled={isAnswered} className={`py-8 rounded-lg border-4 text-center text-white font-bold text-3xl transition-all duration-300 ${getButtonClass('Unsafe')}`}>
                Unsafe
            </button>
        </div>
    </div>
  );
};

export default LabSafetyGame;
