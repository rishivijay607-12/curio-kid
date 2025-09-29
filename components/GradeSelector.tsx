import React from 'react';
import type { Grade, AppMode } from '../types';
import LoadingSpinner from './LoadingSpinner';

interface GradeSelectorProps {
  onGradeSelect: (grade: Grade) => void;
  appMode: AppMode;
  setAppMode: (mode: AppMode) => void;
  isSolverSetup: boolean;
  isLoading: boolean;
  error: string | null;
}

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
    className="w-full text-center px-8 py-6 bg-slate-800 border-2 border-slate-700 rounded-xl shadow-lg hover:bg-slate-700 hover:border-cyan-500 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed"
  >
    <span className="text-3xl font-bold text-slate-100">Grade {grade}</span>
  </button>
);

const ModeButton: React.FC<{
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, isActive, onClick }) => {
  const baseClasses = "px-6 py-2 rounded-lg font-semibold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-opacity-75";
  const activeClasses = "bg-cyan-600 text-white shadow-md";
  const inactiveClasses = "bg-slate-700 text-slate-300 hover:bg-slate-600";
  return (
    <button onClick={onClick} className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}>
      {label}
    </button>
  );
};


const GradeSelector: React.FC<GradeSelectorProps> = ({ onGradeSelect, appMode, setAppMode, isSolverSetup, isLoading, error }) => {
  const grades: Grade[] = [6, 7, 8, 9, 10];

  const headerText = () => {
    if (isSolverSetup) return 'AI Doubt Solver';
    if (appMode === 'diagram') return 'Diagram Generator';
    return 'The App of Curiosity';
  };

  const mainText = isSolverSetup || appMode === 'diagram' ? 'Which grade are you studying in?' : 'Select your grade to start!';

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-8">
      <div className="text-center mb-8">
        <div className="flex justify-center items-center gap-4">
          <AtomIcon />
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-300">
            {headerText()}
          </h1>
        </div>
        {!isSolverSetup && appMode !== 'diagram' && (
            <div className="mt-6 p-1 bg-slate-800 rounded-lg inline-flex flex-wrap justify-center space-x-1">
                <ModeButton label="Quiz" isActive={appMode === 'quiz'} onClick={() => setAppMode('quiz')} />
                <ModeButton label="Worksheets" isActive={appMode === 'worksheet'} onClick={() => setAppMode('worksheet')} />
                <ModeButton label="Notes" isActive={appMode === 'notes'} onClick={() => setAppMode('notes')} />
            </div>
        )}
        <p className="text-slate-300 mt-6 text-xl">
          {mainText}
        </p>
      </div>

       {isLoading ? (
             <div className="flex flex-col items-center justify-center p-8 bg-slate-800/50 rounded-xl min-h-[150px]">
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