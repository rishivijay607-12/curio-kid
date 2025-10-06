
import React, { useState, useEffect } from 'react';
import type { ScienceFairIdea, ScienceFairPlanStep, GenerationLogEntry, GenerationStatus } from '../types.ts';
import { generateScienceFairPlan, generateDiagramImage, analyzeGenerationFailure } from '../services/geminiService.ts';
import LoadingSpinner from './LoadingSpinner.tsx';

// --- Helper Components for Log UI ---

const StatusIcon: React.FC<{ status: GenerationStatus }> = ({ status }) => {
    switch (status) {
        case 'in-progress':
            return <LoadingSpinner />;
        case 'complete':
            return <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
        case 'failed':
            return <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
        case 'skipped':
             return <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
        case 'pending':
        default:
            return <div className="h-8 w-8 flex items-center justify-center"><div className="h-3 w-3 bg-slate-600 rounded-full"></div></div>;
    }
};

const StatusLabel: React.FC<{ status: GenerationStatus }> = ({ status }) => {
    const statusMap: { [key in GenerationStatus]: { text: string; color: string } } = {
        pending: { text: 'Pending', color: 'text-slate-400' },
        'in-progress': { text: 'In Progress', color: 'text-cyan-400' },
        complete: { text: 'Complete', color: 'text-green-400' },
        failed: { text: 'Failed', color: 'text-red-400' },
        skipped: { text: 'Skipped', color: 'text-slate-500' },
    };
    const { text, color } = statusMap[status];
    return <span className={`font-semibold text-sm ${color}`}>{text}</span>;
};


// --- Main Component ---

interface ScienceFairPlanProps {
    idea: ScienceFairIdea;
    onRestart: () => void;
}

// Define the extended type for local state management, including image generation status
interface PlanStepWithStatus extends ScienceFairPlanStep {
    imageStatus: 'pending' | 'loading' | 'complete' | 'failed';
}

const ScienceFairPlan: React.FC<ScienceFairPlanProps> = ({ idea, onRestart }) => {
    const [plan, setPlan] = useState<PlanStepWithStatus[]>([]);
    const [generationLog, setGenerationLog] = useState<GenerationLogEntry[]>([]);
    const [generationError, setGenerationError] = useState<{ entry: GenerationLogEntry; message: string } | null>(null);
    const [failureAnalysis, setFailureAnalysis] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    
    useEffect(() => {
        const runGeneration = async () => {
            // Step 1: Initialize log for plan text generation
            let initialLog: GenerationLogEntry = { id: 'plan', title: 'Generating Step-by-Step Plan', status: 'in-progress' };
            setGenerationLog([initialLog]);

            // Step 2: Fetch the text plan and image prompts together
            let textPlanWithPrompts: { stepTitle: string; instructions: string; imagePrompt: string }[] = [];
            try {
                textPlanWithPrompts = await generateScienceFairPlan(idea.title, idea.description);
                // Update log for plan text success
                setGenerationLog(prevLog => prevLog.map(e => e.id === 'plan' ? { ...e, status: 'complete' } : e));
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Unknown error';
                const failedEntry: GenerationLogEntry = { ...initialLog, status: 'failed', error: errorMessage };
                setGenerationLog([failedEntry]);
                setGenerationError({ entry: failedEntry, message: errorMessage });
                return; // Stop execution
            }

            if (textPlanWithPrompts.length === 0) return;

            // Step 3: Immediately render the text part of the plan with image loaders
            const initialPlanState: PlanStepWithStatus[] = textPlanWithPrompts.map(step => ({
                stepTitle: step.stepTitle,
                instructions: step.instructions,
                image: '', // empty initially
                imageStatus: 'loading',
            }));
            setPlan(initialPlanState);

            // Update log to show all images are starting to generate
            const imageLogs: GenerationLogEntry[] = textPlanWithPrompts.map((step, index) => ({
                id: `image-${index}`,
                title: `Generating Image for: "${step.stepTitle}"`,
                status: 'in-progress',
            }));
            setGenerationLog(prevLog => [...prevLog, ...imageLogs]);

            // Step 4: Generate images concurrently and update UI as each one completes
            textPlanWithPrompts.forEach(async (step, index) => {
                try {
                    const imageBytes = await generateDiagramImage(step.imagePrompt);
                    const imageUrl = `data:image/png;base64,${imageBytes}`;
                    
                    // Update the specific step in the plan state with the new image
                    setPlan(prevPlan => {
                        const newPlan = [...prevPlan];
                        if (newPlan[index]) {
                            newPlan[index] = { ...newPlan[index], image: imageUrl, imageStatus: 'complete' };
                        }
                        return newPlan;
                    });
                    
                    // Update the log for this specific image
                    setGenerationLog(prevLog => prevLog.map(e => e.id === `image-${index}` ? { ...e, status: 'complete' } : e));

                } catch (err) {
                    const errorMessage = err instanceof Error ? err.message : 'Unknown image generation error';
                    console.error(`Failed to generate image for step ${index + 1}:`, err);

                    setPlan(prevPlan => {
                        const newPlan = [...prevPlan];
                        if (newPlan[index]) {
                            newPlan[index].imageStatus = 'failed';
                        }
                        return newPlan;
                    });

                    setGenerationLog(prevLog => prevLog.map(e => e.id === `image-${index}` ? { ...e, status: 'failed', error: errorMessage } : e));

                    // Set the main UI error state only for the first failure encountered
                    setGenerationError(prevError => {
                        if (!prevError) {
                            return {
                                entry: { id: `image-${index}`, title: `Image for: "${step.stepTitle}"`, status: 'failed' },
                                message: errorMessage,
                            };
                        }
                        return prevError;
                    });
                }
            });
        };

        runGeneration();
    }, [idea]);

    const handleAnalyzeFailure = async () => {
        if (!generationError) return;
        setIsAnalyzing(true);
        setFailureAnalysis(null);
        try {
            const analysis = await analyzeGenerationFailure(generationError.message);
            setFailureAnalysis(analysis);
        } catch (err) {
            setFailureAnalysis("Sorry, I couldn't analyze the failure. Please try generating the plan again.");
        } finally {
            setIsAnalyzing(false);
        }
    };
    
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
                {generationError && (
                    <div className="p-4 bg-rose-900/40 border border-rose-500 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div>
                            <h3 className="font-bold text-rose-300">An error occurred during image generation.</h3>
                            <p className="text-rose-400 text-sm mt-1">Failed during: "{generationError.entry.title}"</p>
                        </div>
                        <button onClick={handleAnalyzeFailure} disabled={isAnalyzing} className="px-4 py-2 bg-rose-800 text-white font-bold rounded-lg shadow-md hover:bg-rose-700 transition-colors disabled:bg-slate-700 disabled:cursor-wait flex-shrink-0">
                            {isAnalyzing ? 'Analyzing...' : 'Why did it fail? (AI)'}
                        </button>
                    </div>
                )}
                 {failureAnalysis && (
                    <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg animate-fade-in">
                        <h4 className="font-semibold text-cyan-400 mb-2">AI Analysis</h4>
                        <p className="text-slate-300 whitespace-pre-wrap">{failureAnalysis}</p>
                    </div>
                )}
                
                {/* Main Plan Display */}
                {plan.length > 0 ? (
                    <div className="space-y-10">
                        {plan.map((step, index) => (
                             <div key={index} className="p-6 bg-slate-950/50 border border-slate-800 rounded-lg animate-fade-in">
                                <h2 className="text-2xl font-bold text-cyan-400 mb-4">{`Step ${index + 1}: ${step.stepTitle}`}</h2>
                                
                                <div className="w-full aspect-video bg-slate-800 rounded-md flex items-center justify-center mb-4 shadow-lg">
                                    {step.imageStatus === 'loading' && <LoadingSpinner />}
                                    {step.imageStatus === 'complete' && (
                                        <img 
                                            src={step.image} 
                                            alt={`Visual for ${step.stepTitle}`} 
                                            className="w-full h-full object-contain rounded-md bg-white"
                                        />
                                    )}
                                    {step.imageStatus === 'failed' && (
                                        <div className="text-center text-red-400">
                                            <p>Image could not be generated</p>
                                        </div>
                                    )}
                                </div>
                                
                                <p className="text-slate-200 leading-relaxed whitespace-pre-wrap">{step.instructions}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    // Show initial loading state before plan text arrives
                    <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-6 flex flex-col items-center justify-center">
                        <LoadingSpinner />
                        <p className="text-slate-300 mt-4">Generating your project plan...</p>
                    </div>
                )}
                
                {/* Generation Log as a collapsible section */}
                {generationLog.length > 1 && (
                    <details className="bg-slate-950/50 border border-slate-800 rounded-xl mt-6">
                        <summary className="text-xl font-bold text-slate-200 cursor-pointer p-4 md:p-6">Generation Log</summary>
                        <div className="border-t border-slate-800 p-4 md:p-6 space-y-2">
                            {generationLog.map(entry => (
                                <div key={entry.id} className="flex items-center justify-between p-3 bg-slate-900 rounded-md">
                                    <div className="flex items-center gap-4">
                                        <StatusIcon status={entry.status} />
                                        <span className="text-slate-300">{entry.title}</span>
                                    </div>
                                    <StatusLabel status={entry.status} />
                                </div>
                            ))}
                        </div>
                    </details>
                )}
            </main>
        </div>
    );
};

export default ScienceFairPlan;
