import React, { useState, useEffect } from 'react';
import type { ScienceFairIdea, ScienceFairPlanStep } from '../types.ts';
import { generateScienceFairPlan } from '../services/geminiService.ts';
import LoadingSpinner from './LoadingSpinner.tsx';

interface ScienceFairPlanProps {
    idea: ScienceFairIdea;
    onRestart: () => void;
}

const ScienceFairPlan: React.FC<ScienceFairPlanProps> = ({ idea, onRestart }) => {
    const [plan, setPlan] = useState<ScienceFairPlanStep[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setIsLoading(true);
        setError(null);
        generateScienceFairPlan(idea.title, idea.description)
            .then(generatedPlan => {
                setPlan(generatedPlan);
            })
            .catch(err => {
                console.error("Failed to generate science fair plan:", err);
                setError(err instanceof Error ? err.message : "An unknown error occurred while generating the plan.");
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [idea]);

    return (
        <div className="w-full max-w-4xl mx-auto p-6 md:p-8 bg-slate-900 rounded-xl shadow-2xl border border-slate-800">
            <header className="text-center border-b border-slate-800 pb-6 mb-8">
                <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-300">
                    {idea.title}
                </h1>
                <p className="text-slate-300 mt-4 text-xl">Your Step-by-Step Project Plan</p>
                <button onClick={onRestart} className="mt-4 px-4 py-2 bg-slate-800 text-white font-semibold rounded-lg shadow-md hover:bg-slate-700 transition-colors">Start Over</button>
            </header>

            <main className="space-y-6">
                {isLoading && (
                    <div className="flex flex-col items-center justify-center p-8">
                        <LoadingSpinner />
                        <p className="text-slate-300 mt-4">Generating your project plan...</p>
                    </div>
                )}
                {error && (
                    <div className="p-4 bg-rose-900/40 border border-rose-500 rounded-lg text-center">
                        <h3 className="font-bold text-rose-300">Failed to Generate Plan</h3>
                        <p className="text-rose-400 text-sm mt-1">{error}</p>
                    </div>
                )}
                {!isLoading && !error && plan.length > 0 && (
                    <div className="space-y-10">
                        {plan.map((step, index) => (
                            <div key={index} className="p-6 bg-slate-950/50 border border-slate-800 rounded-lg animate-fade-in">
                                <h2 className="text-2xl font-bold text-cyan-400 mb-4">{`Step ${index + 1}: ${step.stepTitle}`}</h2>
                                <p className="text-slate-200 leading-relaxed whitespace-pre-wrap">{step.instructions}</p>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default ScienceFairPlan;