import React from 'react';
import type { Grade, Diagram } from '../types';
import LoadingSpinner from './LoadingSpinner';

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

const DiagramCard: React.FC<{ diagram: Diagram; onRegenerate: (id: string) => void; isRegenerating: boolean }> = ({ diagram, onRegenerate, isRegenerating }) => (
    <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4 flex flex-col items-center text-center">
        <div className="relative w-full aspect-square">
            <img 
                src={diagram.image} 
                alt={diagram.description} 
                className={`w-full h-full object-contain rounded-md bg-white transition-opacity duration-300 ${isRegenerating ? 'opacity-20' : 'opacity-100'}`} 
            />
            {isRegenerating && (
                 <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-md">
                    <LoadingSpinner />
                </div>
            )}
        </div>
        <p className="text-slate-300 mt-3 text-sm leading-relaxed flex-grow">{diagram.description}</p>
        <button
            onClick={() => onRegenerate(diagram.id)}
            disabled={isRegenerating}
            className="mt-3 px-4 py-1 bg-slate-700 text-slate-200 font-semibold rounded-md hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-wait no-print"
        >
            Regenerate
        </button>
    </div>
);

const PlaceholderCard: React.FC = () => (
    <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4 flex flex-col items-center justify-center aspect-square">
        <LoadingSpinner />
    </div>
);


const DiagramGenerator: React.FC<DiagramGeneratorProps> = ({ diagrams, isGenerating, grade, topic, onRestart, onCancelGeneration, generationProgress, onRegenerate, regeneratingId }) => {
    const placeholdersCount = isGenerating ? Math.max(0, generationProgress.total - diagrams.length) : 0;
    const placeholders = Array(placeholdersCount).fill(0);

    const getStatusText = () => {
        if (!isGenerating && generationProgress.current < generationProgress.total && generationProgress.current > 0) {
            return `Generation stopped. ${generationProgress.current} of ${generationProgress.total} diagrams were created.`;
        }
        if (isGenerating && generationProgress.current < generationProgress.total) {
            return `Generating diagram ${generationProgress.current + 1} of ${generationProgress.total}...`;
        }
        if (!isGenerating && generationProgress.total > 0 && generationProgress.current === generationProgress.total) {
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
            <div className="my-6 p-4 bg-slate-900/50 rounded-lg border border-slate-700 no-print">
                <p className="text-slate-300 text-center mb-2 font-medium">{statusText || 'Preparing to generate diagrams...'}</p>
                <div className="w-full bg-slate-700 rounded-full h-2.5">
                    <div className="bg-cyan-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${progressPercentage}%` }}></div>
                </div>
            </div>
        );
    };


    return (
        <div className="w-full max-w-6xl mx-auto p-6 md:p-8 bg-slate-800 rounded-xl shadow-2xl border border-slate-700 printable-worksheet">
            {/* Header and Controls */}
            <div className="mb-2 print:mb-4 no-print">
                <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-300">Diagram Generator</h1>
                <p className="text-slate-400 mt-1">Here are the key diagrams for your chapter.</p>
                <div className="mt-6 flex flex-wrap items-center gap-4">
                     <button
                        onClick={onRestart}
                        className="px-6 py-2 bg-slate-700 text-white font-bold rounded-lg shadow-lg hover:bg-slate-600 transition-colors"
                    >
                        Start Over
                    </button>
                    <button
                        onClick={() => window.print()}
                        disabled={isGenerating || diagrams.length === 0}
                        className="px-6 py-2 bg-cyan-600 text-white font-bold rounded-lg shadow-lg hover:bg-cyan-500 transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed"
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
            <div className="text-center mb-8 border-b border-slate-600 pb-4">
                <h2 className="text-3xl font-bold text-slate-100">Chapter Diagrams</h2>
                <div className="flex justify-center gap-6 text-slate-300 mt-2">
                    <span><strong>Grade:</strong> {grade}</span>
                    <span><strong>Chapter:</strong> {topic}</span>
                </div>
            </div>

            {/* Diagrams Grid */}
             {diagrams.length === 0 && !isGenerating && generationProgress.total > 0 && (
                 <div className="text-center p-8 bg-slate-900/30 rounded-lg">
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
                    />
                ))}
                {placeholders.map((_, index) => <PlaceholderCard key={`placeholder-${index}`} />)}
            </div>
        </div>
    );
};

export default DiagramGenerator;