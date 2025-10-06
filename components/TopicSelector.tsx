
import React from 'react';
import { CHAPTERS_BY_GRADE } from '../constants.ts';
import type { Grade, AppMode } from '../types.ts';
import LoadingSpinner from './LoadingSpinner.tsx';

interface TopicSelectorProps {
  onTopicSelect: (topic: string) => void;
  grade: Grade;
  isGenerating: boolean;
  error: string | null;
  appMode: AppMode;
  isSolverSetup?: boolean;
}

const featureTitles: { [key in AppMode]?: string } = {
    'quiz': 'Interactive Quiz',
    'worksheet': 'Printable Worksheet',
    'notes': 'Quick Study Notes',
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


const TopicSelector: React.FC<TopicSelectorProps> = ({ onTopicSelect, grade, isGenerating, error, appMode, isSolverSetup }) => {
    const loadingText = () => {
        if (isSolverSetup) return 'Preparing your AI tutor...';
        switch(appMode) {
            case 'notes': return 'Generating your notes...';
            default: return 'Loading...';
        }
    }

    const headerText = () => {
        if (isSolverSetup) return 'AI Doubt Solver';
        return featureTitles[appMode] || 'The Book of Curiosity';
    };

    const subHeaderText = isSolverSetup ? 'Select a chapter to ask questions about!' : 'Select a chapter to begin!';

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-8">
        <div className="text-center mb-8">
            <div className="flex justify-center items-center gap-4">
                 <AtomIcon />
                <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-300">
                    {headerText()}
                </h1>
            </div>
            <p className="text-slate-400 mt-2 text-lg">Grade {grade}</p>
            <p className="text-slate-300 mt-6 text-xl">{subHeaderText}</p>
        </div>
        
        {isGenerating ? (
             <div className="flex flex-col items-center justify-center p-8 bg-slate-800/50 rounded-xl min-h-[150px]">
                <LoadingSpinner />
                <p className="text-slate-300 mt-4 text-lg">{loadingText()}</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {CHAPTERS_BY_GRADE[grade].map((chapter, index) => (
                    <button
                        key={index}
                        onClick={() => onTopicSelect(chapter)}
                        disabled={isGenerating}
                        className="text-left p-4 bg-slate-800 border border-slate-700 rounded-lg shadow-md hover:bg-slate-700 hover:border-cyan-500 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                        <p className="font-semibold text-slate-100">{chapter}</p>
                    </button>
                ))}
            </div>
        )}

        {error && !isGenerating && (
         <div className="mt-6 p-4 text-center bg-red-900/50 border border-red-500 rounded-lg">
            <p className="font-semibold text-red-400">Failed to generate content</p>
            <p className="text-slate-300 text-sm mt-1">{error}</p>
        </div>
      )}
    </div>
  );
};

export default TopicSelector;