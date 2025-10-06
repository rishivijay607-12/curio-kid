import React from 'react';
import type { Language, Grade } from '../types.ts';
import LoadingSpinner from './LoadingSpinner.tsx';

interface LanguageSelectorProps {
  onLanguageSelect: (language: Language) => void;
  title: string;
  grade?: Grade;
  topic?: string;
  isLoading: boolean;
  error: string | null;
}

const LanguageButton: React.FC<{ language: Language, label: string, onClick: (lang: Language) => void, disabled: boolean }> = ({ language, label, onClick, disabled }) => (
  <button
    onClick={() => onClick(language)}
    disabled={disabled}
    className="w-full text-center px-6 py-5 bg-slate-900 border-2 border-slate-800 rounded-xl shadow-lg hover:bg-slate-800 hover:border-cyan-500 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
  >
    <span className="text-xl font-bold text-slate-100">{label}</span>
  </button>
);


const LanguageSelector: React.FC<LanguageSelectorProps> = ({ onLanguageSelect, title, grade, topic, isLoading, error }) => {
  const languages: { key: Language, label: string }[] = [
    { key: 'English', label: 'English' },
    { key: 'English+Hindi', label: 'English + Hindi' },
    { key: 'English+Tamil', label: 'English + Tamil' },
    { key: 'English+Telugu', label: 'English + Telugu' },
    { key: 'English+Kannada', label: 'English + Kannada' },
    { key: 'English+Malayalam', label: 'English + Malayalam' },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-8">
      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-300">
          {title}
        </h1>
        {grade && topic && (
            <div className="mt-4 flex justify-center items-center gap-2 flex-wrap">
                <span className="px-3 py-1 text-sm font-semibold text-slate-200 bg-slate-800 rounded-full">{`Grade ${grade}`}</span>
                <span className="px-3 py-1 text-sm font-semibold text-slate-200 bg-slate-800 rounded-full max-w-xs truncate">{topic}</span>
            </div>
        )}
      </div>

       {isLoading ? (
        <div className="flex flex-col items-center justify-center p-8 bg-slate-800/50 rounded-xl min-h-[150px]">
           <LoadingSpinner />
           <p className="text-slate-300 mt-4 text-lg">Preparing your AI tutor...</p>
       </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {languages.map(({key, label}) => (
            <LanguageButton key={key} language={key} label={label} onClick={onLanguageSelect} disabled={isLoading} />
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

export default LanguageSelector;