import React, { useState } from 'react';
import type { AppMode, Grade, GenerativeTextResult } from '../types';
import LoadingSpinner from './LoadingSpinner';

interface GenerativeTextProps {
    appMode: AppMode;
    grade: Grade | null;
    topic: string;
    onGenerate: (userInput: string) => void;
    isLoading: boolean;
    result: GenerativeTextResult | null;
    error: string | null;
}

const featureDetails: { [key in AppMode]?: { title: string; description: string, placeholder: string, resultTitle: string } } = {
    'concept_deep_dive': {
        title: 'Concept Deep Dive',
        description: 'Go beyond the textbook. Ask about a concept for an in-depth explanation.',
        placeholder: 'e.g., What is Newton\'s third law of motion?',
        resultTitle: 'In-Depth Explanation'
    },
    'virtual_lab': {
        title: 'Virtual Lab',
        description: 'Get step-by-step instructions for a science experiment.',
        placeholder: 'e.g., How to make a simple electric circuit?',
        resultTitle: 'Virtual Lab Procedure'
    },
    'real_world_links': {
        title: 'Real World Links',
        description: 'See how science applies to everyday life around you.',
        placeholder: 'e.g., How does refraction work in eyeglasses?',
        resultTitle: 'Real World Connections'
    },
    'story_weaver': {
        title: 'AI Story Weaver',
        description: 'Turn any science concept into a fun, educational story.',
        placeholder: 'e.g., A story about photosynthesis from the perspective of a leaf.',
        resultTitle: 'Your AI-Crafted Story'
    },
    'what_if': {
        title: "'What If?' Scenarios",
        description: 'Explore wild hypothetical questions with creative, scientific answers.',
        placeholder: 'e.g., What if humans could photosynthesize?',
        resultTitle: 'Hypothetical Scenario'
    },
};

const GenerativeText: React.FC<GenerativeTextProps> = ({ appMode, grade, topic, onGenerate, isLoading, result, error }) => {
    const [userInput, setUserInput] = useState('');
    const details = featureDetails[appMode] || { title: 'AI Tool', description: 'Ask the AI a question.', placeholder: 'Type your question...', resultTitle: 'AI Response' };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (userInput.trim() && !isLoading) {
            onGenerate(userInput.trim());
        }
    };
    
    return (
        <div className="w-full max-w-3xl mx-auto p-6 md:p-8 bg-slate-900 rounded-xl shadow-2xl border border-slate-800">
            {/* Header */}
            <div className="text-center border-b border-slate-800 pb-4 mb-6">
                <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-300">
                    {details.title}
                </h1>
                {grade && topic && (
                    <p className="text-slate-400 mt-1">Grade {grade} &bull; {topic}</p>
                )}
                <p className="text-slate-300 mt-4">{details.description}</p>
            </div>
            
            {/* Input Form */}
            <form onSubmit={handleSubmit} className="mb-6">
                <textarea
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder={details.placeholder}
                    rows={4}
                    className="w-full bg-slate-950/50 text-slate-100 p-3 rounded-lg resize-y border border-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-shadow disabled:opacity-50"
                    disabled={isLoading}
                />
                <button
                    type="submit"
                    disabled={isLoading || !userInput.trim()}
                    className="mt-4 w-full px-8 py-3 bg-cyan-600 text-white font-bold rounded-lg shadow-lg hover:bg-cyan-500 transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-opacity-75 disabled:bg-slate-700 disabled:cursor-not-allowed disabled:transform-none"
                >
                    {isLoading ? 'Generating...' : 'Generate Response'}
                </button>
            </form>
            
            {/* Result Display */}
            <div className="min-h-[100px]">
                {isLoading && (
                    <div className="flex justify-center items-center py-8">
                        <LoadingSpinner />
                    </div>
                )}
                {error && (
                    <div className="p-4 text-center bg-red-900/50 border border-red-500 rounded-lg">
                        <p className="font-semibold text-red-400">Oops! Something went wrong.</p>
                        <p className="text-slate-300 text-sm mt-1">{error}</p>
                    </div>
                )}
                {result && (
                    <div className="p-4 bg-slate-950/50 border border-slate-800 rounded-lg animate-fade-in">
                        <h3 className="font-semibold text-lg text-cyan-400 mb-2">{details.resultTitle}</h3>
                        <p className="text-slate-200 leading-relaxed whitespace-pre-wrap">{result.text}</p>
                        
                        {result.sources && result.sources.length > 0 && (
                            <div className="mt-4 pt-3 border-t border-slate-700">
                                <h4 className="font-semibold text-slate-300 mb-2">Sources:</h4>
                                <ul className="list-disc list-inside space-y-1">
                                    {result.sources.map((source, index) => (
                                        <li key={index}>
                                            <a href={source.web.uri} target="_blank" rel="noopener noreferrer" className="text-cyan-500 hover:underline">
                                                {source.web.title || source.web.uri}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default GenerativeText;