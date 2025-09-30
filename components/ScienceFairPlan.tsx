import React from 'react';
import type { ScienceFairIdea, ScienceFairPlanStep } from '../types.ts';
import LoadingSpinner from './LoadingSpinner.tsx';

interface ScienceFairPlanProps {
    idea: ScienceFairIdea;
    plan: ScienceFairPlanStep[];
    isLoading: boolean;
    error: string | null;
}

const ScienceFairPlan: React.FC<ScienceFairPlanProps> = ({ idea, plan, isLoading, error }) => {
    
    return (
        <div className="w-full max-w-4xl mx-auto p-6 md:p-8 bg-slate-900 rounded-xl shadow-2xl border border-slate-800">
            <header className="text-center border-b border-slate-800 pb-6 mb-8">
                <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-300">
                    {idea.title}
                </h1>
                <p className="text-slate-300 mt-4 text-xl">Your Step-by-Step Project Plan</p>
            </header>

            <main className="space-y-10">
                {isLoading && (
                     <div className="flex flex-col items-center justify-center p-8 text-center">
                        <LoadingSpinner />
                        <p className="text-slate-300 mt-4 text-lg">Generating your project plan...</p>
                        <p className="text-slate-400 mt-2 text-sm">This involves creating text and images, so it may take a few moments.</p>
                    </div>
                )}
                {error && (
                     <div className="p-4 text-center bg-red-900/50 border border-red-500 rounded-lg">
                        <p className="font-semibold text-red-400">Generation Failed</p>
                        <p className="text-slate-300 text-sm mt-1">{error}</p>
                    </div>
                )}
                {!isLoading && !error && plan.length > 0 && plan.map((step, index) => (
                    <div key={index} className="p-6 bg-slate-950/50 border border-slate-800 rounded-lg">
                        <h2 className="text-2xl font-bold text-cyan-400 mb-4">{`Step ${index + 1}: ${step.stepTitle}`}</h2>
                        {step.image ? (
                             <img 
                                src={step.image} 
                                alt={`Visual for ${step.stepTitle}`} 
                                className="w-full h-auto object-contain rounded-md bg-white mb-4 shadow-lg"
                             />
                        ) : (
                            <div className="w-full aspect-video bg-slate-800 rounded-md flex items-center justify-center mb-4">
                                <p className="text-slate-400">Image could not be generated</p>
                            </div>
                        )}
                       
                        <p className="text-slate-200 leading-relaxed whitespace-pre-wrap">{step.instructions}</p>
                    </div>
                ))}
                 {!isLoading && !error && plan.length === 0 && (
                    <div className="text-center text-slate-400 py-8">
                        <p>No plan steps were generated. This might be due to an error or content restrictions.</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default ScienceFairPlan;