import React from 'react';
import type { ScienceFairIdea } from '../types';

interface ScienceFairIdeasProps {
    ideas: ScienceFairIdea[];
    onSelect: (idea: ScienceFairIdea) => void;
    userTopic: string;
}

const ScienceFairIdeas: React.FC<ScienceFairIdeasProps> = ({ ideas, onSelect, userTopic }) => {
    return (
        <div className="w-full max-w-4xl mx-auto p-6 md:p-8">
            <div className="text-center mb-8">
                <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-300">
                    Project Ideas
                </h1>
                {userTopic && <p className="text-slate-400 mt-2 text-lg">For: {userTopic}</p>}
            </div>

            <div className="space-y-6">
                {ideas.map((idea, index) => (
                    <div
                        key={index}
                        onClick={() => onSelect(idea)}
                        className="p-6 bg-slate-900 border-2 border-slate-800 rounded-xl shadow-lg cursor-pointer hover:border-cyan-500 hover:bg-slate-800/50 transition-all duration-200 transform hover:-translate-y-1"
                    >
                        <h2 className="text-2xl font-bold text-cyan-400 hover:underline">{idea.title}</h2>
                        <p className="text-slate-300 mt-3 leading-relaxed">{idea.description}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ScienceFairIdeas;