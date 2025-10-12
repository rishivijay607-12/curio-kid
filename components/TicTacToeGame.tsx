import React, { useState, useEffect, useCallback } from 'react';
import type { TicTacToeBoard, Difficulty } from '../types.ts';

interface TicTacToeGameProps {
  onEnd: () => void;
}

const PLAYER = 'X';
const AI = 'O';

const calculateWinner = (squares: TicTacToeBoard) => {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
    [0, 4, 8], [2, 4, 6], // diagonals
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
};

const TicTacToeGame: React.FC<TicTacToeGameProps> = ({ onEnd }) => {
    const [board, setBoard] = useState<TicTacToeBoard>(Array(9).fill(null));
    const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
    const [isPlayerTurn, setIsPlayerTurn] = useState(true);
    const [winner, setWinner] = useState<string | null>(null);
    const [isDraw, setIsDraw] = useState(false);

    const handlePlayerMove = (index: number) => {
        if (!isPlayerTurn || board[index] || winner) return;
        const newBoard = [...board];
        newBoard[index] = PLAYER;
        setBoard(newBoard);
        setIsPlayerTurn(false);
    };

    const findBestMove = (currentBoard: TicTacToeBoard): number => {
        // 1. Win if possible
        for (let i = 0; i < 9; i++) {
            if (!currentBoard[i]) {
                const tempBoard = [...currentBoard];
                tempBoard[i] = AI;
                if (calculateWinner(tempBoard) === AI) return i;
            }
        }
        // 2. Block player from winning
        for (let i = 0; i < 9; i++) {
            if (!currentBoard[i]) {
                const tempBoard = [...currentBoard];
                tempBoard[i] = PLAYER;
                if (calculateWinner(tempBoard) === PLAYER) return i;
            }
        }
        // 3. Take center if available
        if (!currentBoard[4]) return 4;
        // 4. Take a random corner
        const corners = [0, 2, 6, 8].filter(i => !currentBoard[i]);
        if (corners.length > 0) return corners[Math.floor(Math.random() * corners.length)];
        // 5. Take a random side
        const sides = [1, 3, 5, 7].filter(i => !currentBoard[i]);
        if (sides.length > 0) return sides[Math.floor(Math.random() * sides.length)];

        return currentBoard.findIndex(s => s === null); // Fallback
    };
    
    const makeAiMove = useCallback(() => {
        const emptySquares = board.map((sq, i) => sq === null ? i : -1).filter(i => i !== -1);
        if (emptySquares.length === 0) return;

        let move;
        if (difficulty === 'Easy') {
            move = emptySquares[Math.floor(Math.random() * emptySquares.length)];
        } else if (difficulty === 'Medium') {
            // Try to win, then block, else random
            for (let i = 0; i < 9; i++) {
                if (!board[i]) {
                    const tempBoard = [...board];
                    tempBoard[i] = AI;
                    if (calculateWinner(tempBoard) === AI) { move = i; break; }
                }
            }
            if(move === undefined) {
                 for (let i = 0; i < 9; i++) {
                    if (!board[i]) {
                        const tempBoard = [...board];
                        tempBoard[i] = PLAYER;
                        if (calculateWinner(tempBoard) === PLAYER) { move = i; break; }
                    }
                }
            }
            if(move === undefined) {
                 move = emptySquares[Math.floor(Math.random() * emptySquares.length)];
            }

        } else { // Hard
            move = findBestMove(board);
        }

        const newBoard = [...board];
        if (move !== undefined && newBoard[move] === null) {
            newBoard[move] = AI;
            setBoard(newBoard);
        }
        setIsPlayerTurn(true);

    }, [board, difficulty]);

    useEffect(() => {
        const gameWinner = calculateWinner(board);
        const isBoardFull = board.every(square => square !== null);
        
        if (gameWinner) {
            setWinner(gameWinner);
        } else if (isBoardFull) {
            setIsDraw(true);
        } else if (!isPlayerTurn && difficulty) {
            const timer = setTimeout(() => makeAiMove(), 500);
            return () => clearTimeout(timer);
        }
    }, [board, isPlayerTurn, difficulty, makeAiMove]);

    const resetGame = (diff: Difficulty) => {
        setDifficulty(diff);
        setBoard(Array(9).fill(null));
        setIsPlayerTurn(true);
        setWinner(null);
        setIsDraw(false);
    };

    const getStatusMessage = () => {
        if (winner) return `${winner} Wins!`;
        if (isDraw) return "It's a Draw!";
        return isPlayerTurn ? "Your Turn (X)" : "AI's Turn (O)";
    };

    if (!difficulty) {
        return (
            <div className="w-full max-w-md mx-auto p-8 bg-slate-900 rounded-xl shadow-2xl border border-slate-800 text-center">
                 <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-300 mb-2">AI Tic-Tac-Toe</h1>
                 <p className="text-slate-400 mb-6">Choose your difficulty:</p>
                 <div className="flex flex-col gap-4">
                    <button onClick={() => resetGame('Easy')} className="px-6 py-3 text-lg font-semibold bg-green-600 rounded-lg hover:bg-green-500 transition-colors">Easy</button>
                    <button onClick={() => resetGame('Medium')} className="px-6 py-3 text-lg font-semibold bg-yellow-600 rounded-lg hover:bg-yellow-500 transition-colors">Medium</button>
                    <button onClick={() => resetGame('Hard')} className="px-6 py-3 text-lg font-semibold bg-red-600 rounded-lg hover:bg-red-500 transition-colors">Hard</button>
                 </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-md mx-auto p-6 bg-slate-900 rounded-xl shadow-2xl border border-slate-800 text-center">
            <h2 className="text-2xl font-bold text-slate-100 mb-2">{getStatusMessage()}</h2>
            <div className="grid grid-cols-3 gap-2 my-4">
                {board.map((value, index) => (
                    <button
                        key={index}
                        onClick={() => handlePlayerMove(index)}
                        className={`w-24 h-24 text-5xl font-bold flex items-center justify-center rounded-lg transition-colors
                            ${value === 'X' ? 'text-cyan-400' : 'text-teal-300'}
                            ${!value && isPlayerTurn ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-950/50'}`}
                    >
                        {value}
                    </button>
                ))}
            </div>
            <div className="flex gap-4 justify-center">
                <button onClick={() => resetGame(difficulty)} className="px-6 py-2 bg-cyan-600 text-white font-semibold rounded-lg shadow hover:bg-cyan-500">
                    New Game
                </button>
                 <button onClick={() => setDifficulty(null)} className="px-6 py-2 bg-slate-700 text-white font-semibold rounded-lg shadow hover:bg-slate-600">
                    Change Difficulty
                </button>
                <button onClick={onEnd} className="px-6 py-2 bg-slate-700 text-white font-semibold rounded-lg shadow hover:bg-slate-600">
                    Quit
                </button>
            </div>
        </div>
    );
};

export default TicTacToeGame;
