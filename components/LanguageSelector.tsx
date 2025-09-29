import React from 'react';
import type { Language } from '../types';

interface LanguageSelectorProps {
  onLanguageSelect: (language: Language) => void;
}

const AtomIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.5 3.5C14.5 5.433 12.933 7 11 7s-3.5-1.567-3.5-3.5S9.067 0 11 0s3.5 1.567 3.5 3.5zM11 24c-1.933 0-3.5-1.567-3.5-3.5S9.067 17 11 17s3.5 1.567 3.5 3.5S12.933 24 11 24zM3.5 14.5C1.567 14.5 0 12.933 0 11s1.567-3.5 3.5-3.5S7 9.067 7 11s-1.567 3.5-3.5 3.5zM18.5 14.5C16.567 14.5 15 12.933 15 11s1.567-3.5 3.5-3.5S22 9.067 22 11s-1.567 3.5-3.5 3.5z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 21a10 10 0 100-20 10 10 0 000 20z" />
    </svg>
);


const LanguageButton: React.FC<{ language: Language, label: string, onClick: (lang: Language) => void }> = ({ language, label, onClick }) => (
  <button
    onClick={() => onClick(language)}
    className="w-full text-center px-6 py-5 bg-slate-800 border-2 border-slate-700 rounded-xl shadow-lg hover:bg-slate-700 hover:border-cyan-500 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-opacity-75"
  >
    <span className="text-xl font-bold text-slate-100">{label}</span>
  </button>
);


const LanguageSelector: React.FC<LanguageSelectorProps> = ({ onLanguageSelect }) => {
  const languages: { key: Language, label: string }[] = [
    { key: 'English', label: 'English' },
    { key: 'English+Hindi', label: 'English + Hindi' },
    { key: 'English+Tamil', label: 'English + Tamil' },
    { key: 'English+Malayalam', label: 'English + Malayalam' },
    { key: 'English+Telugu', label: 'English + Telugu' },
    { key: 'English+Kannada', label: 'English + Kannada' },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-8">
      <div className="text-center mb-10">
        <div className="flex justify-center items-center gap-4">
          <AtomIcon />
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-300">
            AI Doubt Solver
          </h1>
        </div>
        <p className="text-slate-300 mt-6 text-xl">
          Choose your preferred language
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        {languages.map(({key, label}) => (
          <LanguageButton key={key} language={key} label={label} onClick={onLanguageSelect} />
        ))}
      </div>
    </div>
  );
};

export default LanguageSelector;