import React, { useState } from 'react';
import type { DiagramIdea } from '../types.ts';

interface DiagramIdeaSelectorProps {
  ideas: DiagramIdea[];
  onGenerate: (selectedIdeas: DiagramIdea[]) => void;
}

const AtomIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.5 3.5C14.5 5.433 12.933 7 11 7s-3.5-1.567-3.5-3.5S9.067 0 11 0s3.5 1.567 3.5 3.5zM11 24c-1.933 0-3.5-1.567-3.5-3.5S9.067 17 11 17s3.5 1.567 3.5 3.5S12.933 24 11 24zM3.5 14.5C1.567 14.5 0 12.933 0 11s1.567-3.5 3.5-3.5S7 9.067 7 11s-1.567 3.5-3.5 3.5zM18.5 14.5C16.567 14.5 15 12.933 15 11s1.567-3.5 3.5-3.5S22 9.067 22 11s-1.567 3.5-3.5 3.5z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 21a10 10 0 100-20 10 10 0 000 20z" />
    </svg>
);


const DiagramIdeaSelector: React.FC<DiagramIdeaSelectorProps> = ({ ideas, onGenerate }) => {
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    const handleToggle = (id: string) => {
        const newSelection = new Set(selectedIds);
        if (newSelection.has(id)) {
            newSelection.delete(id);
        } else {
            newSelection.add(id);
        }
        setSelectedIds(newSelection);
    };

    const handleSelectAll = () => {
        setSelectedIds(new Set(ideas.map(idea => idea.id)));
    };

    const handleClearAll = () => {
        setSelectedIds(new Set());
    };

    const handleGenerateClick = () => {
        const selected = ideas.filter(idea => selectedIds.has(idea.id));
        onGenerate(selected);
    };
    
    return (
        <div className="w-full max-w-4xl mx-auto p-4 md:p-8">
            <div className="text-center mb-8">
                <div className="flex justify-center items-center gap-4">
                    <AtomIcon />
                    <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-300">
                        Diagram Generator
                    </h1>
                </div>
                <p className="text-slate-300 mt-6 text-xl">Select the diagrams you want to create.</p>
            </div>

            <div className="mb-6 flex justify-center gap-4">
                 <button onClick={handleSelectAll} className="px-4 py-2 bg-slate-800 text-slate-200 font-semibold rounded-md hover:bg-slate-700 transition-colors">Select All</button>
                 <button onClick={handleClearAll} className="px-4 py-2 bg-slate-800 text-slate-200 font-semibold rounded-md hover:bg-slate-700 transition-colors">Clear Selection</button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {ideas.map(idea => (
                     <label 
                        key={idea.id}
                        className={`p-4 bg-slate-900 border-2 rounded-lg shadow-md transition-all duration-200 cursor-pointer flex items-center gap-4 ${selectedIds.has(idea.id) ? 'border-cyan-500' : 'border-slate-800 hover:border-slate-700'}`}
                    >
                        <input
                            type="checkbox"
                            checked={selectedIds.has(idea.id)}
                            onChange={() => handleToggle(idea.id)}
                            className="h-5 w-5 rounded bg-slate-800 border-slate-600 text-cyan-600 focus:ring-cyan-500"
                        />
                        <span className="font-medium text-slate-200">{idea.description}</span>
                    </label>
                ))}
            </div>
            
            <div className="text-center">
                 <button
                    onClick={handleGenerateClick}
                    disabled={selectedIds.size === 0}
                    className="px-8 py-4 bg-cyan-600 text-white font-bold text-xl rounded-lg shadow-lg hover:bg-cyan-500 transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-opacity-75 disabled:bg-slate-700 disabled:cursor-not-allowed disabled:transform-none"
                >
                    Generate {selectedIds.size > 0 ? `${selectedIds.size} Diagram(s)` : 'Diagrams'}
                </button>
            </div>

        </div>
    );
};

export default DiagramIdeaSelector;