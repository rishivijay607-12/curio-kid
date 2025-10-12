import React, { useState, useEffect } from 'react';
import { generateSudokuPuzzle } from '../services/geminiService.ts';
import type { SudokuPuzzle, Difficulty } from '../types.ts';
import LoadingSpinner from './LoadingSpinner.tsx';

interface SudokuGameProps {
  onEnd: () => void;
}

const SudokuGame: React.FC<SudokuGameProps> = ({ onEnd }) => {
    const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
    const [puzzle, setPuzzle] = useState<SudokuPuzzle | null>(null);
    const [userBoard, setUserBoard] = useState<number[][] | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
    const [statusMessage, setStatusMessage] = useState<string | null>(null);

    const startGame = async (diff: Difficulty) => {
        setDifficulty(diff);
        setIsLoading(true);
        setError(null);
        setStatusMessage(null);
        try {
            const newPuzzle = await generateSudokuPuzzle(diff);
            setPuzzle(newPuzzle);
            setUserBoard(newPuzzle.puzzle.map(row => [...row]));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to generate a Sudoku puzzle.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleInputChange = (row: number, col: number, value: string) => {
        const num = parseInt(value, 10);
        if (value === '' || (num >= 1 && num <= 9)) {
            const newBoard = userBoard!.map(r => [...r]);
            newBoard[row][col] = value === '' ? 0 : num;
            setUserBoard(newBoard);
        }
    };

    const checkSolution = () => {
        if (!userBoard || !puzzle) return;
        const isCorrect = JSON.stringify(userBoard) === JSON.stringify(puzzle.solution);
        setStatusMessage(isCorrect ? "Congratulations! You solved it correctly!" : "Not quite right. Keep trying!");
        setTimeout(() => setStatusMessage(null), 3000);
    };

    const getHint = () => {
        if (!userBoard || !puzzle) return;
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                if (userBoard[r][c] === 0) {
                    const newBoard = userBoard.map(row => [...row]);
                    newBoard[r][c] = puzzle.solution[r][c];
                    setUserBoard(newBoard);
                    return;
                }
            }
        }
        setStatusMessage("The board is already full!");
        setTimeout(() => setStatusMessage(null), 3000);
    };

    const solvePuzzle = () => {
        if (!puzzle) return;
        setUserBoard(puzzle.solution.map(row => [...row]));
    };
    
    const getCellStyle = (row: number, col: number, value: number) => {
        let classes = 'w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-xl sm:text-2xl font-bold transition-colors duration-200 ';
        const isOriginal = puzzle?.puzzle[row][col] !== 0;

        if (isOriginal) {
            classes += 'bg-slate-700 text-slate-100 ';
        } else {
            classes += 'bg-slate-800 text-cyan-400 focus:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 ';
        }

        if (selectedCell?.row === row || selectedCell?.col === col) {
             classes += 'bg-slate-600/50 ';
        }

        if (row % 3 === 2 && row < 8) classes += 'border-b-4 ';
        if (col % 3 === 2 && col < 8) classes += 'border-r-4 ';
        if (row % 3 === 0 && row > 0) classes += 'border-t-4 ';
        if (col % 3 === 0 && col > 0) classes += 'border-l-4 ';
        
        classes += 'border-slate-600 ';

        return classes;
    };


    if (!difficulty || !userBoard) {
        return (
            <div className="w-full max-w-md mx-auto p-8 bg-slate-900 rounded-xl shadow-2xl border border-slate-800 text-center">
                <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-300 mb-2">AI Sudoku</h1>
                <p className="text-slate-400 mb-6">Choose a difficulty to generate a puzzle:</p>
                {isLoading ? <LoadingSpinner /> : (
                     <div className="flex flex-col gap-4">
                        <button onClick={() => startGame('Easy')} className="px-6 py-3 text-lg font-semibold bg-green-600 rounded-lg hover:bg-green-500 transition-colors">Easy</button>
                        <button onClick={() => startGame('Medium')} className="px-6 py-3 text-lg font-semibold bg-yellow-600 rounded-lg hover:bg-yellow-500 transition-colors">Medium</button>
                        <button onClick={() => startGame('Hard')} className="px-6 py-3 text-lg font-semibold bg-red-600 rounded-lg hover:bg-red-500 transition-colors">Hard</button>
                     </div>
                )}
                {error && <p className="text-red-400 mt-4">{error}</p>}
                <button onClick={onEnd} className="mt-8 text-slate-300 hover:underline">Back to Games</button>
            </div>
        );
    }

    return (
        <div className="w-full max-w-2xl mx-auto p-4 sm:p-6 bg-slate-900 rounded-xl shadow-2xl border border-slate-800 text-center">
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-300 mb-1">AI Sudoku</h1>
            <p className="text-slate-400 mb-4">{difficulty} Puzzle</p>
            
            <div className="inline-block bg-slate-950/50 p-2 rounded-lg shadow-lg">
                {userBoard.map((row, rIdx) => (
                    <div key={rIdx} className="flex">
                        {row.map((cell, cIdx) => (
                            <input
                                key={`${rIdx}-${cIdx}`}
                                type="text"
                                maxLength={1}
                                value={cell === 0 ? '' : cell}
                                readOnly={puzzle?.puzzle[rIdx][cIdx] !== 0}
                                onChange={(e) => handleInputChange(rIdx, cIdx, e.target.value)}
                                onFocus={() => setSelectedCell({row: rIdx, col: cIdx})}
                                onBlur={() => setSelectedCell(null)}
                                className={getCellStyle(rIdx, cIdx, cell)}
                            />
                        ))}
                    </div>
                ))}
            </div>

            <div className="min-h-[2rem] mt-4 flex items-center justify-center">
                {statusMessage && <p className="text-lg font-semibold text-green-400">{statusMessage}</p>}
            </div>

            <div className="mt-4 flex flex-wrap justify-center gap-2 sm:gap-4">
                 <button onClick={checkSolution} className="px-4 py-2 bg-cyan-600 text-white font-semibold rounded-lg shadow hover:bg-cyan-500">Check</button>
                 <button onClick={getHint} className="px-4 py-2 bg-slate-700 text-white font-semibold rounded-lg shadow hover:bg-slate-600">Hint</button>
                 <button onClick={solvePuzzle} className="px-4 py-2 bg-yellow-600 text-white font-semibold rounded-lg shadow hover:bg-yellow-500">Solve</button>
                 <button onClick={() => setDifficulty(null)} className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg shadow hover:bg-red-500">New Game</button>
                 <button onClick={onEnd} className="px-4 py-2 bg-slate-600 text-white font-semibold rounded-lg shadow hover:bg-slate-500">Quit</button>
            </div>
        </div>
    );
};

export default SudokuGame;
