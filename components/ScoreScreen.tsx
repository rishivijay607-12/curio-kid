
import React from 'react';

interface ScoreScreenProps {
  score: number;
  onRestart: () => void;
  quizLength: number;
}

const ScoreScreen: React.FC<ScoreScreenProps> = ({ score, onRestart, quizLength }) => {
  const percentage = quizLength > 0 ? Math.round((score / quizLength) * 100) : 0;
  const message = percentage >= 80 ? "Excellent!" : percentage >= 50 ? "Good Job!" : "Keep Practicing!";

  return (
    <div className="w-full max-w-2xl mx-auto p-8 bg-slate-800 rounded-xl shadow-2xl border border-slate-700 text-center flex flex-col items-center">
      <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-300 mb-2">Quiz Completed!</h2>
      <p className="text-5xl font-bold text-white my-4">{score} / {quizLength}</p>
      <p className="text-2xl text-cyan-400 font-semibold mb-8">{message}</p>
      <button
        onClick={onRestart}
        className="px-8 py-3 bg-cyan-600 text-white font-bold rounded-lg shadow-lg hover:bg-cyan-500 transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-opacity-75"
      >
        Play Again
      </button>
    </div>
  );
};

export default ScoreScreen;