import React, { useState, useEffect } from 'react';
import { generateScienceRiddle } from '../services/geminiService.ts';
import type { ScienceRiddle } from '../types.ts';
import LoadingSpinner from './LoadingSpinner.tsx';

interface ScienceRiddlesGameProps {
  onEnd: () => void;
}

const ScienceRiddlesGame: React.FC<ScienceRiddlesGameProps> = ({ onEnd }) => {
  const [score, setScore] = useState(0);
  const [riddle, setRiddle] = useState<ScienceRiddle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  const fetchRiddle = () => {
    setIsLoading(true);
    setError(null);
    setIsAnswered(false);
    setSelectedAnswer(null);
    generateScienceRiddle()
      .then(data => {
        // Ensure options are shuffled
        const shuffledOptions = [...data.options].sort(() => Math.random() - 0.5);
        setRiddle({ ...data, options: shuffledOptions });
      })
      .catch(err => {
        setError(err instanceof Error ? err.message : "Failed to generate a riddle.");
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchRiddle();
  }, []);

  const handleAnswerSelect = (option: string) => {
    if (isAnswered) return;
    setIsAnswered(true);
    setSelectedAnswer(option);
    if (option === riddle?.answer) {
      setScore(prev => prev + 1);
    }
  };

  const getButtonClass = (option: string) => {
    if (!isAnswered) return 'bg-slate-800 hover:bg-slate-700 border-slate-700';
    if (option === riddle?.answer) return 'bg-green-700 border-green-500';
    if (option === selectedAnswer) return 'bg-red-700 border-red-500';
    return 'bg-slate-800 border-slate-700 opacity-60';
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 md:p-8 bg-slate-900 rounded-xl shadow-2xl border border-slate-800">
      <div className="flex justify-between items-center text-slate-300 font-mono text-xl mb-6">
        <span>Score: {score}</span>
        <button onClick={onEnd} className="px-4 py-1 text-sm bg-slate-700 rounded-md hover:bg-slate-600">Quit</button>
      </div>

      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-300">Science Riddles</h1>
      </div>

      <div className="min-h-[350px]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full">
            <LoadingSpinner />
            <p className="text-slate-400 mt-4">Generating a riddle...</p>
          </div>
        ) : error ? (
          <div className="text-center text-red-400 p-4">{error}</div>
        ) : riddle ? (
          <div>
            <div className="w-full p-4 mb-6 min-h-[120px] flex items-center justify-center bg-slate-950/50 rounded-lg shadow-lg">
              <p className="text-xl text-center font-medium text-white italic">"{riddle.riddle}"</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {riddle.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(option)}
                  disabled={isAnswered}
                  className={`p-4 rounded-lg border-2 text-center text-slate-100 font-semibold text-lg transition-all duration-300 ${getButtonClass(option)}`}
                >
                  {option}
                </button>
              ))}
            </div>
             {isAnswered && (
                <div className="mt-4 text-center text-lg">
                    {selectedAnswer === riddle.answer ? (
                        <p className="text-green-400">Correct!</p>
                    ) : (
                        <p className="text-red-400">Incorrect. The answer was: {riddle.answer}</p>
                    )}
                </div>
            )}
          </div>
        ) : null}
      </div>
      
      <div className="mt-6 flex justify-center">
        <button 
            onClick={fetchRiddle}
            disabled={isLoading}
            className="px-8 py-3 bg-cyan-600 text-white font-bold rounded-lg shadow-lg hover:bg-cyan-500 transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-opacity-75 disabled:bg-slate-700 disabled:cursor-not-allowed"
        >
            Next Riddle
        </button>
      </div>
    </div>
  );
};

export default ScienceRiddlesGame;