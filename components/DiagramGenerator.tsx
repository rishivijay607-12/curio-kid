import React from 'react';
import type { Grade, Diagram } from '../types.ts';
import LoadingSpinner from './LoadingSpinner.tsx';

interface DiagramGeneratorProps {
    diagrams: Diagram[];
    isGenerating: boolean;
    grade: Grade;
    topic: string;
    onRestart: () => void;
    onCancelGeneration: () => void;
    generationProgress: { current: number; total: number };
    onRegenerate: (diagramId: string) => void;
    regeneratingId: string | null;
}

const DiagramCard: React.FC<{ diagram: Diagram; onRegenerate: (id: string) => void; isRegenerating: boolean; isGenerating: boolean; }> = ({ diagram, onRegenerate, isRegenerating, isGenerating }) => {
    
    const renderContent = () => {
        if (isRegenerating || diagram.status === 'pending') {
            return (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-md">
                    <LoadingSpinner />
                </div>
            );
        }
        if (diagram.status === 'failed') {
            return (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-950/80 rounded-md p-2 text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm font-semibold text-red-300">Generation Failed</p>
                </div>
            );
        }
        if (diagram.status === 'complete' && diagram.image) {
            return (
                <img 
                    src={diagram.image} 
                    alt={diagram.idea.description} 
                    className="w-full h-full object-contain rounded-md bg-white" 
                />
            );
        }
        return null; // Should not happen
    };

    return (
        <div className="bg-slate-950/50 border border-slate-800 rounded-lg p-4 flex flex-col items-center text-center">
            <div className="relative w-full aspect-square bg-slate-900 rounded-md">
                {renderContent()}
            </div>
            <p className="text-slate-300 mt-3 text-sm leading-relaxed flex-grow">{diagram.idea.description}</p>
            {/* FIX: The variable `isGenerating` was not in scope. It is now passed down from the parent to correctly control the visibility of the regenerate button. */}
            {(diagram.status === 'complete' || diagram.status === 'failed') && !isGenerating && (
                <button
                    onClick={() => onRegenerate(diagram.id)}
                    disabled={isRegenerating}
                    className="mt-3 px-4 py-1 bg-slate-800 text-slate-200 font-semibold rounded-md hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-wait no-print"
                >
                    Regenerate
                </button>
            )}
        </div>
    );
};


const DiagramGenerator: React.FC<DiagramGeneratorProps> = ({ diagrams, isGenerating, grade, topic, onRestart, onCancelGeneration, generationProgress, onRegenerate, regeneratingId }) => {

    const getStatusText = () => {
        if (!isGenerating && generationProgress.current < generationProgress.total && generationProgress.current > 0) {
            return `Generation stopped. ${generationProgress.current} of ${generationProgress.total} diagrams were created.`;
        }
        if (isGenerating && generationProgress.total > 0) {
            return `Generating diagram ${Math.min(generationProgress.current + 1, generationProgress.total)} of ${generationProgress.total}...`;
        }
        if (!isGenerating && generationProgress.total > 0 && generationProgress.current === generationProgress.total) {
             const failedCount = diagrams.filter(d => d.status === 'failed').length;
             if (failedCount > 0) {
                return `Generation complete. ${diagrams.length - failedCount} of ${diagrams.length} succeeded.`;
             }
            return `Successfully generated ${generationProgress.total} diagrams!`;
        }
        return '';
    };

    const ProgressIndicator = () => {
        if (generationProgress.total === 0 && !isGenerating) return null;
        const progressPercentage = generationProgress.total > 0 ? (generationProgress.current / generationProgress.total) * 100 : 0;
        const statusText = getStatusText();
        
        if (!statusText && !isGenerating) return null;

        return (
            <div className="my-6 p-4 bg-slate-950/50 rounded-lg border border-slate-800 no-print">
                <p className="text-slate-300 text-center mb-2 font-medium">{statusText || 'Preparing to generate diagrams...'}</p>
                <div className="w-full bg-slate-800 rounded-full h-2.5">
                    <div className="bg-cyan-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${progressPercentage}%` }}></div>
                </div>
            </div>
        );
    };


    return (
        <div className="w-full max-w-6xl mx-auto p-6 md:p-8 bg-slate-900 rounded-xl shadow-2xl border border-slate-800 printable-worksheet">
            {/* Header and Controls */}
            <div className="mb-2 print:mb-4 no-print">
                <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-300">Diagram Generator</h1>
                <p className="text-slate-400 mt-1">Here are the key diagrams for your chapter.</p>
                <div className="mt-6 flex flex-wrap items-center gap-4">
                     <button
                        onClick={onRestart}
                        className="px-6 py-2 bg-slate-800 text-white font-bold rounded-lg shadow-lg hover:bg-slate-700 transition-colors"
                    >
                        Start Over
                    </button>
                    <button
                        onClick={() => window.print()}
                        disabled={isGenerating || diagrams.every(d => d.status !== 'complete')}
                        className="px-6 py-2 bg-cyan-600 text-white font-bold rounded-lg shadow-lg hover:bg-cyan-500 transition-colors disabled:bg-slate-700 disabled:cursor-not-allowed"
                    >
                        Print Diagrams
                    </button>
                    {isGenerating && (
                         <button
                            onClick={onCancelGeneration}
                            className="px-6 py-2 bg-red-700 text-white font-bold rounded-lg shadow-lg hover:bg-red-600 transition-colors"
                        >
                            Stop Generating
                        </button>
                    )}
                </div>
            </div>

             <ProgressIndicator />

             {/* Printable Header */}
            <div className="text-center mb-8 border-b border-slate-700 pb-4">
                <h2 className="text-3xl font-bold text-slate-100">Chapter Diagrams</h2>
                <div className="flex justify-center gap-6 text-slate-300 mt-2">
                    <span><strong>Grade:</strong> {grade}</span>
                    <span><strong>Chapter:</strong> {topic}</span>
                </div>
            </div>

            {/* Diagrams Grid */}
             {diagrams.length === 0 && !isGenerating && generationProgress.total > 0 && (
                 <div className="text-center p-8 bg-slate-950/30 rounded-lg">
                    <p className="text-xl text-slate-300">No diagrams were generated.</p>
                    <p className="text-slate-400 mt-2">This may be due to a network error or content restrictions.</p>
                 </div>
             )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {diagrams.map((diag) => (
                    <DiagramCard 
                        key={diag.id} 
                        diagram={diag} 
                        onRegenerate={onRegenerate}
                        isRegenerating={regeneratingId === diag.id}
                        isGenerating={isGenerating}
                    />
                ))}
            </div>
        </div>
    );
};

export default DiagramGenerator;
