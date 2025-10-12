import React, { useState, useEffect, useCallback } from 'react';
import { FOOD_CHAINS } from '../constants.ts';

interface FoodChainGameProps {
  onEnd: () => void;
}

const FoodChainGame: React.FC<FoodChainGameProps> = ({ onEnd }) => {
    const [score, setScore] = useState(0);
    const [currentChain, setCurrentChain] = useState<{ name: string; chain: string[] } | null>(null);
    const [shuffledOptions, setShuffledOptions] = useState<string[]>([]);
    const [userSelection, setUserSelection] = useState<string[]>([]);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [isComplete, setIsComplete] = useState(false);

    const setupNextChain = useCallback(() => {
        setIsCorrect(null);
        setIsComplete(false);
        setUserSelection([]);
        const chainData = FOOD_CHAINS[Math.floor(Math.random() * FOOD_CHAINS.length)];
        setCurrentChain(chainData);
        setShuffledOptions([...chainData.chain].sort(() => Math.random() - 0.5));
    }, []);

    useEffect(() => {
        setupNextChain();
    }, [setupNextChain]);

    useEffect(() => {
        if (!currentChain) return;
        if (userSelection.length === currentChain.chain.length) {
            setIsComplete(true);
            const correct = userSelection.every((item, index) => item === currentChain.chain[index]);
            setIsCorrect(correct);
            if (correct) {
                setScore(prev => prev + 1);
            }
            setTimeout(setupNextChain, 2000);
        }
    }, [userSelection, currentChain, setupNextChain]);

    const handleSelect = (item: string) => {
        if (isComplete || userSelection.includes(item)) return;
        setUserSelection(prev => [...prev, item]);
    };

    return (
        <div className="w-full max-w-2xl mx-auto p-6 md:p-8 bg-slate-900 rounded-xl shadow-2xl border border-slate-800">
            <div className="flex justify-between items-center text-slate-300 font-mono text-xl mb-6">
                <span>Score: {score}</span>
                <button onClick={onEnd} className="px-4 py-1 text-sm bg-slate-700 rounded-md hover:bg-slate-600">Quit</button>
            </div>

            <div className="text-center mb-6">
                <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-300">Food Chain Builder</h1>
                <p className="text-slate-400 mt-2">Click the items in the correct order for a {currentChain?.name} food chain.</p>
            </div>

            <div className="w-full p-4 min-h-[80px] bg-slate-950/50 rounded-lg shadow-inner flex items-center justify-center gap-2 flex-wrap">
                {userSelection.map((item, index) => (
                    <React.Fragment key={index}>
                        <div className="p-2 bg-slate-700 text-white rounded-md">{item}</div>
                        {index < userSelection.length -1 && <span className="text-cyan-400 font-bold text-xl">{'>'}</span>}
                    </React.Fragment>
                ))}
                 {isComplete && isCorrect && <span className="text-2xl ml-4">✅</span>}
                 {isComplete && !isCorrect && <span className="text-2xl ml-4">❌</span>}
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6">
                {shuffledOptions.map(option => (
                    <button
                        key={option}
                        onClick={() => handleSelect(option)}
                        disabled={userSelection.includes(option) || isComplete}
                        className="p-4 bg-slate-800 text-slate-100 font-semibold rounded-lg border-2 border-slate-700 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-opacity"
                    >
                        {option}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default FoodChainGame;
