import React from 'react';
import type { Grade, AppMode } from '../types.ts';
import LoadingSpinner from './LoadingSpinner.tsx';

interface GradeSelectorProps {
  onGradeSelect: (grade: Grade) => void;
  appMode: AppMode;
  isSolverSetup: boolean;
  isLoading: boolean;
  error: string | null;
}

const featureTitles: { [key in AppMode]?: string } = {
    'quiz': 'Interactive Quiz',
    'worksheet': 'Printable Worksheet',
    'notes': 'Quick Study Notes',
    'flashcards': 'Flashcards',
    'concept_deep_dive': 'Concept Deep Dive',
    'virtual_lab': 'Virtual Lab',
    'real_world_links': 'Real World Links',
    'chat_with_history': 'Chat with History',
    'story_weaver': 'AI Story Weaver',
    'science_fair_buddy': 'Science Fair Buddy',
    'what_if': "'What If?' Scenarios",
};

const AtomIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.5 3.5C14.5 5.433 12.933 7 11 7s-3.5-1.567-3.5-3.5S9.067 0 11 0s3.5 1.567 3.5 3.5zM11 24c-1.933 0-3.5-1.567-3.5-3.5S9.067 17 11 17s3.5 1.567 3.5 3.5S12.933 24 11 24zM3.5 14.5C1.567 14.5 0 12.933 0 11s1.567-3.5 3.5-3.5S7 9.067 7 11s-1.567 3.5-3.5 3.5zM18.5 14.5C16.567 14.5 15 12.933 15 11s1.567-3.5 3.5-3.5S22 9.067 22 11s-1.567 3.5-3.5 3.5z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 21a10 10 0 100-20 10 10 0 000 20z" />
    </svg>
);

const GradeButton: React.FC<{ grade: Grade; onClick: (grade: Grade) => void, disabled: boolean }> = ({ grade, onClick, disabled }) => (
  <button
    onClick={() => onClick(grade)}
    disabled={disabled}
    className="w-full text-center px-8 py-6 bg-slate-900 border-2 border-slate-800 rounded-xl shadow-lg hover:bg-slate-800 hover:border-cyan-500 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed"
  >
    <span className="text-3xl font-bold text-slate-100">Grade {grade}</span>
  </button>
);

const GradeSelector: React.FC<GradeSelectorProps> = ({ onGradeSelect, appMode, isSolverSetup, isLoading, error }) => {
  const grades: Grade[] = [6, 7, 8, 9, 10];

  const headerText = () => {
    if (isSolverSetup) return 'AI Doubt Solver';
    return featureTitles[appMode] || 'The Book of Curiosity';
  };

  const mainText = 'Which grade are you studying in?';

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-8">
      <div className="text-center mb-8">
        <div className="flex justify-center items-center gap-4">
          <AtomIcon />
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-300">
            {headerText()}
          </h1>
        </div>
        <p className="text-slate-300 mt-6 text-xl">
          {mainText}
        </p>
      </div>

       {isLoading ? (
             <div className="flex flex-col items-center justify-center p-8 bg-slate-900/50 rounded-xl min-h-[150px]">
                <LoadingSpinner />
                <p className="text-slate-300 mt-4 text-lg">Preparing your AI tutor...</p>
            </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {grades.map(grade => (
                <GradeButton key={grade} grade={grade} onClick={onGradeSelect} disabled={isLoading} />
            ))}
          </div>
        )}

      {error && !isLoading && (
         <div className="mt-6 p-4 text-center bg-red-900/50 border border-red-500 rounded-lg">
            <p className="font-semibold text-red-400">Failed to start session</p>
            <p className="text-slate-300 text-sm mt-1">{error}</p>
        </div>
      )}

    </div>
  );
};

export default GradeSelector;