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
            return <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
        case 'skipped':
             return <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-500" fill="none" viewBox="0 0 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
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

const ScienceFairPlan: React.FC<ScienceFairPlanProps> = ({ idea, onRestart }) => {
    const [plan, setPlan] = useState<ScienceFairPlanStep[]>([]);
    const [generationLog, setGenerationLog] = useState<GenerationLogEntry[]>([]);
    const [generationError, setGenerationError] = useState<{ entry: GenerationLogEntry; message: string } | null>(null);
    const [failureAnalysis, setFailureAnalysis] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    
    useEffect(() => {
        const runGeneration = async () => {
            // Step 1: Initialize log for plan generation
            let log: GenerationLogEntry[] = [{ id: 'plan', title: 'Initializing Plan', status: 'in-progress' }];
            setGenerationLog(log);

            let textPlan: { stepTitle: string; instructions: string }[] = [];
            try {
                textPlan = await generateScienceFairPlan(idea.title, idea.description);
                log = log.map(e => e.id === 'plan' ? { ...e, status: 'complete' } : e);
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Unknown error';
                // FIX: Explicitly type the failedEntry object to match GenerationLogEntry.
                const failedEntry: GenerationLogEntry = { id: 'plan', title: 'Initializing Plan', status: 'failed', error: errorMessage };
                log = log.map(e => e.id === 'plan' ? failedEntry : e);
                setGenerationLog(log);
                setGenerationError({ entry: failedEntry, message: errorMessage });
                return; // Stop execution
            }

            // Step 2: Initialize logs for image generation
            const imageLogs: GenerationLogEntry[] = textPlan.map((step, index) => ({
                id: `image-${index}`,
                title: `Generating Image for Step ${index + 1}: "${step.stepTitle}"`,
                status: 'pending',
            }));
            setGenerationLog([...log, ...imageLogs]);

            // Step 3: Generate images sequentially
            const finalPlanWithImages: ScienceFairPlanStep[] = [];
            for (let i = 0; i < textPlan.length; i++) {
                const step = textPlan[i];
                // Set current image generation to 'in-progress'
                setGenerationLog(prev => prev.map(e => e.id === `image-${i}` ? { ...e, status: 'in-progress' } : e));
                
                try {
                    const imagePrompt = `Photorealistic image of a student working on a science fair project step: "${step.stepTitle}". Focus on the action described.`;
                    const imageBytes = await generateDiagramImage(imagePrompt);
                    const finalStep = { ...step, image: `data:image/png;base64,${imageBytes}` };
                    finalPlanWithImages.push(finalStep);
                    setPlan([...finalPlanWithImages]);

                    // Mark as complete
                    setGenerationLog(prev => prev.map(e => e.id === `image-${i}` ? { ...e, status: 'complete' } : e));
                } catch (err) {
                    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
                    // FIX: Explicitly type the failedEntry object to match GenerationLogEntry.
                    const failedEntry: GenerationLogEntry = { id: `image-${i}`, title: `Generating Image for Step ${i + 1}: "${step.stepTitle}"`, status: 'failed', error: errorMessage };

                    // Mark failed and skip subsequent
                    setGenerationLog(prev => prev.map(e => {
                        if (e.id === `image-${i}`) return failedEntry;
                        const entryIndex = parseInt(e.id.split('-')[1]);
                        if (e.id.startsWith('image-') && entryIndex > i) return { ...e, status: 'skipped' };
                        return e;
                    }));

                    setGenerationError({ entry: failedEntry, message: errorMessage });
                    return; // Stop execution
                }
            }
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
                            <h3 className="font-bold text-rose-300">A failure prevented us from generating your plan.</h3>
                            <p className="text-rose-400 text-sm mt-1">An error occurred during: "{generationError.entry.title}"</p>
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


                {/* Generation Log */}
                {generationLog.length > 0 && (
                     <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-4 md:p-6 space-y-2">
                        <h3 className="text-xl font-bold text-slate-200 mb-3 px-2">Generation Log</h3>
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
                )}
                
                {plan.length > 0 && (
                    <div className="pt-6 mt-6 border-t border-slate-800 space-y-10">
                        {plan.map((step, index) => (
                             <div key={index} className="p-6 bg-slate-950/50 border border-slate-800 rounded-lg animate-fade-in">
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
                    </div>
                )}
            </main>
        </div>
    );
};

export default ScienceFairPlan;
