import React from 'react';
import LoadingSpinner from './LoadingSpinner';

interface WorksheetCountSelectorProps {
  onCountSelect: (count: number) => void;
  isGenerating: boolean;
  error: string | null;
  generationProgress: { current: number, total: number };
}

const AtomIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.5 3.5C14.5 5.433 12.933 7 11 7s-3.5-1.567-3.5-3.5S9.067 0 11 0s3.5 1.567 3.5 3.5zM11 24c-1.933 0-3.5-1.567-3.5-3.5S9.067 17 11 17s3.5 1.567 3.5 3.5S12.933 24 11 24zM3.5 14.5C1.567 14.5 0 12.933 0 11s1.567-3.5 3.5-3.5S7 9.067 7 11s-1.567 3.5-3.5 3.5zM18.5 14.5C16.567 14.5 15 12.933 15 11s1.567-3.5 3.5-3.5S22 9.067 22 11s-1.567 3.5-3.5 3.5z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 21a10 10 0 100-20 10 10 0 000 20z" />
    </svg>
);

const CountButton: React.FC<{ count: number; onClick: (count: number) => void, disabled: boolean }> = ({ count, onClick, disabled }) => (
  <button
    onClick={() => onClick(count)}
    disabled={disabled}
    className="w-full text-center px-6 py-5 bg-slate-800 border-2 border-slate-700 rounded-xl shadow-lg hover:bg-slate-700 hover:border-cyan-500 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
  >
    <span className="text-2xl font-bold text-slate-100">{count}</span>
    <span className="text-lg text-slate-300"> Questions</span>
  </button>
);


const WorksheetCountSelector: React.FC<WorksheetCountSelectorProps> = ({ onCountSelect, isGenerating, error, generationProgress }) => {
  const counts = [10, 20, 30];
  const progressPercentage = generationProgress.total > 0 ? (generationProgress.current / generationProgress.total) * 100 : 0;

  return (
    <div className="w-full max-w-2xl mx-auto p-4 md:p-8">
      <div className="text-center mb-10">
        <div className="flex justify-center items-center gap-4">
          <AtomIcon />
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-300">
            The App of Curiosity
          </h1>
        </div>
        <p className="text-slate-300 mt-6 text-xl">
          How many questions for the worksheet?
        </p>
      </div>
      
      {isGenerating ? (
        <div className="flex flex-col items-center justify-center p-8 bg-slate-800/50 rounded-xl min-h-[150px]">
            <LoadingSpinner />
            <p className="text-slate-300 mt-4 text-lg">Generating your worksheet...</p>
            {generationProgress.total > 0 && (
                <div className="w-full max-w-xs mt-4">
                    <div className="flex justify-between mb-1 text-sm text-slate-400">
                        <span>Progress</span>
                        <span>{generationProgress.current} / {generationProgress.total}</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2.5">
                        <div className="bg-cyan-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${progressPercentage}%` }}></div>
                    </div>
                </div>
            )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {counts.map((count) => (
            <CountButton key={count} count={count} onClick={onCountSelect} disabled={isGenerating} />
          ))}
        </div>
      )}

      {error && !isGenerating && (
         <div className="mt-6 p-4 text-center bg-red-900/50 border border-red-500 rounded-lg">
            <p className="font-semibold text-red-400">Failed to generate worksheet</p>
            <p className="text-slate-300 text-sm mt-1">{error}</p>
        </div>
      )}
    </div>
  );
};

export default WorksheetCountSelector;