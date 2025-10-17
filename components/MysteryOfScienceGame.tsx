import React from 'react';
import type { Grade, MysteryState } from '../types.ts';
import LoadingSpinner from './LoadingSpinner.tsx';

interface MysteryOfScienceGameProps {
  mystery: MysteryState;
  onChoiceSelect: (choice: string) => void;
  isLoading: boolean;
  onRestart: () => void;
  grade: Grade;
  topic: string;
}

const MysteryOfScienceGame: React.FC<MysteryOfScienceGameProps> = ({ mystery, onChoiceSelect, isLoading, onRestart, grade, topic }) => {
  return (
    <div className="w-full max-w-3xl mx-auto p-6 md:p-8 bg-slate-900 rounded-xl shadow-2xl border border-slate-800 animate-fade-in">
      <header className="text-center border-b border-slate-800 pb-4 mb-6">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-300">
          Mystery of Science
        </h1>
        <p className="text-slate-400 mt-1">Grade {grade} &bull; {topic}</p>
      </header>

      <main>
        <div className="p-4 bg-slate-950/50 border border-slate-800 rounded-lg min-h-[200px] flex items-center">
          <p className="text-slate-200 text-lg leading-relaxed whitespace-pre-wrap">
            {mystery.story}
          </p>
        </div>

        <div className="mt-6 min-h-[150px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-4">
              <LoadingSpinner />
              <p className="text-slate-300 mt-4">The plot thickens...</p>
            </div>
          ) : mystery.isEnd ? (
            <div className="text-center p-4">
              <p className="text-xl font-semibold text-cyan-400 mb-6">The End</p>
              <button
                onClick={onRestart}
                className="px-8 py-3 bg-cyan-600 text-white font-bold rounded-lg shadow-lg hover:bg-cyan-500 transition-all"
              >
                Play Another Mystery
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {mystery.choices.map((choice, index) => (
                <button
                  key={index}
                  onClick={() => onChoiceSelect(choice)}
                  className="w-full text-left p-4 bg-slate-800 border border-slate-700 rounded-lg shadow-md hover:bg-slate-700 hover:border-cyan-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <p className="font-semibold text-slate-100">{choice}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default MysteryOfScienceGame;