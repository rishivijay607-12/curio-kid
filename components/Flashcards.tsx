import React, { useState } from 'react';
import type { Grade, Flashcard } from '../types.ts';

interface FlashcardsProps {
    flashcards: Flashcard[];
    onRestart: () => void;
    grade: Grade;
    topic: string;
}

const Flashcards: React.FC<FlashcardsProps> = ({ flashcards, onRestart, grade, topic }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);

    const handleNext = () => {
        setIsFlipped(false); // Reset flip state on navigation
        setCurrentIndex((prevIndex) => (prevIndex + 1) % flashcards.length);
    };

    const handlePrev = () => {
        setIsFlipped(false);
        setCurrentIndex((prevIndex) => (prevIndex - 1 + flashcards.length) % flashcards.length);
    };
    
    const handleFlip = () => {
        setIsFlipped(!isFlipped);
    };

    const currentCard = flashcards[currentIndex];

    // Styles for the card flip
    const cardContainerStyle: React.CSSProperties = {
        perspective: '1000px',
    };
    const cardStyle: React.CSSProperties = {
        position: 'relative',
        width: '100%',
        height: '100%',
        transition: 'transform 0.6s',
        transformStyle: 'preserve-3d',
        transform: isFlipped ? 'rotateY(180deg)' : 'none',
    };
    const cardFaceStyle: React.CSSProperties = {
        position: 'absolute',
        width: '100%',
        height: '100%',
        backfaceVisibility: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '2rem',
        overflowY: 'auto',
    };
    const cardFrontStyle: React.CSSProperties = { ...cardFaceStyle, backgroundColor: '#1e293b' /* slate-800 */ };
    const cardBackStyle: React.CSSProperties = { ...cardFaceStyle, backgroundColor: '#0f172a' /* slate-900 */, transform: 'rotateY(180deg)' };

    return (
        <div className="w-full max-w-2xl mx-auto p-6 md:p-8 flex flex-col items-center">
            {/* Header */}
            <div className="text-center mb-6">
                <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-300">Flashcards</h1>
                <p className="text-slate-400 mt-1">Grade {grade} &bull; {topic}</p>
            </div>
            
            {/* Card */}
            <div style={cardContainerStyle} className="w-full h-80 rounded-xl shadow-2xl border border-slate-700 mb-6">
                <div style={cardStyle}>
                    <div style={cardFrontStyle} className="rounded-xl">
                        <p className="text-3xl font-bold text-slate-100">{currentCard?.term}</p>
                    </div>
                    <div style={cardBackStyle} className="rounded-xl">
                        <p className="text-xl text-slate-200 leading-relaxed">{currentCard?.definition}</p>
                    </div>
                </div>
            </div>

            {/* Progress Indicator */}
            <p className="text-slate-400 mb-4 font-mono">{currentIndex + 1} / {flashcards.length}</p>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4 w-full mb-6">
                <button onClick={handlePrev} className="px-6 py-3 bg-slate-800 text-white font-bold rounded-lg shadow-lg hover:bg-slate-700 transition-colors">
                    Prev
                </button>
                <button onClick={handleFlip} className="w-40 px-8 py-4 bg-cyan-600 text-white font-bold text-lg rounded-lg shadow-lg hover:bg-cyan-500 transition-all transform hover:scale-105">
                    {isFlipped ? 'Show Term' : 'Show Definition'}
                </button>
                <button onClick={handleNext} className="px-6 py-3 bg-slate-800 text-white font-bold rounded-lg shadow-lg hover:bg-slate-700 transition-colors">
                    Next
                </button>
            </div>

             {/* Restart Button */}
            <button onClick={onRestart} className="mt-4 px-6 py-2 bg-slate-700 text-white font-semibold rounded-lg shadow-md hover:bg-slate-600 transition-colors">
                Finish Review
            </button>
        </div>
    );
};

export default Flashcards;
