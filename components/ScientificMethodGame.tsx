import React, { useState, useEffect } from 'react';
import { SCIENTIFIC_METHOD_STEPS } from '../constants.ts';

interface ScientificMethodGameProps {
  onEnd: () => void;
}

const ScientificMethodGame: React.FC<ScientificMethodGameProps> = ({ onEnd }) => {
    const shuffle = <T,>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5);

    const [steps, setSteps] = useState(() => shuffle(SCIENTIFIC_METHOD_STEPS));
    const [draggedStep, setDraggedStep] = useState<typeof SCIENTIFIC_METHOD_STEPS[0] | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    useEffect(() => {
        const isCorrect = steps.every((s, i) => s.order === i + 1);
        if (isCorrect) {
            setMessage("Excellent! You've correctly ordered the Scientific Method!");
        } else {
            setMessage(null);
        }
    }, [steps]);

    const handleDragStart = (step: typeof SCIENTIFIC_METHOD_STEPS[0]) => {
        setDraggedStep(step);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    const handleDrop = (targetStep: typeof SCIENTIFIC_METHOD_STEPS[0]) => {
        if (!draggedStep || draggedStep.step === targetStep.step) return;

        const draggedIndex = steps.findIndex(s => s.step === draggedStep.step);
        const targetIndex = steps.findIndex(s => s.step === targetStep.step);

        const newSteps = [...steps];
        newSteps.splice(draggedIndex, 1);
        newSteps.splice(targetIndex, 0, draggedStep);

        setSteps(newSteps);
        setDraggedStep(null);
    };

    const handleReset = () => {
        setSteps(shuffle(SCIENTIFIC_METHOD_STEPS));
        setMessage(null);
    };

    return (
        <div className="w-full max-w-2xl mx-auto p-6 md:p-8 bg-slate-900 rounded-xl shadow-2xl border border-slate-800">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-300">The Scientific Method</h1>
                <p className="text-slate-400 mt-2">Drag and drop the steps into the correct order.</p>
            </div>
            
            <div className="space-y-3">
                {steps.map((step, index) => (
                    <div
                        key={step.step}
                        draggable
                        onDragStart={() => handleDragStart(step)}
                        onDragOver={handleDragOver}
                        onDrop={() => handleDrop(step)}
                        className={`p-4 bg-slate-800 border-2 border-slate-700 rounded-lg flex items-center gap-4 cursor-grab transition-opacity ${draggedStep?.step === step.step ? 'opacity-30' : ''}`}
                    >
                        <span className="text-2xl font-bold text-cyan-400">{index + 1}.</span>
                        <span className="text-lg text-slate-100">{step.step}</span>
                    </div>
                ))}
            </div>

            <div className="text-center mt-6 min-h-[3rem]">
                {message && (
                    <p className="text-2xl font-semibold text-green-400 animate-fade-in">{message}</p>
                )}
            </div>

            <div className="flex justify-center gap-4 mt-6">
                <button onClick={handleReset} className="px-8 py-3 bg-cyan-600 text-white font-bold rounded-lg shadow-lg hover:bg-cyan-500">
                    Reset
                </button>
                <button onClick={onEnd} className="px-8 py-3 bg-slate-700 text-white font-bold rounded-lg shadow-lg hover:bg-slate-600">
                    Back to Games
                </button>
            </div>
        </div>
    );
};

export default ScientificMethodGame;
