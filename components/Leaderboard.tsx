import React, { useState, useEffect } from 'react';
import { getQuizScores } from '../services/userService';
import { QuizScore } from '../types';
import LoadingSpinner from './LoadingSpinner';

interface LeaderboardProps {
  onBack: () => void;
  currentUser: string | null;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ onBack, currentUser }) => {
  const [scores, setScores] = useState<QuizScore[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchScores = async () => {
      try {
        const fetchedScores = await getQuizScores();
        setScores(fetchedScores);
      } catch (err) {
        setError("Could not load leaderboard data.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchScores();
  }, []);

  const getRankColor = (rank: number) => {
    if (rank === 0) return 'text-yellow-400';
    if (rank === 1) return 'text-gray-300';
    if (rank === 2) return 'text-amber-600';
    return 'text-slate-300';
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-300">
          Leaderboard
        </h1>
        <p className="text-slate-400 mt-2">Top 20 Quiz Scores</p>
      </div>

      <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl shadow-2xl p-6">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-400">{error}</div>
        ) : scores.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            No scores recorded yet. Be the first to take a quiz!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="text-sm text-slate-400 uppercase border-b border-slate-700">
                <tr>
                  <th className="p-3">Rank</th>
                  <th className="p-3">Player</th>
                  <th className="p-3 text-center">Score</th>
                  <th className="p-3 text-center">Percentage</th>
                  <th className="p-3 hidden sm:table-cell">Date</th>
                </tr>
              </thead>
              <tbody>
                {scores.map((score, index) => (
                  <tr
                    key={`${score.username}-${score.date}-${index}`}
                    className={`border-b border-slate-800 ${score.username === currentUser ? 'bg-cyan-900/50' : ''}`}
                  >
                    <td className={`p-3 font-bold text-lg ${getRankColor(index)}`}>#{index + 1}</td>
                    <td className="p-3 font-medium text-slate-100">{score.username}</td>
                    <td className="p-3 text-center text-slate-200">{score.score} / {score.total}</td>
                    <td className="p-3 text-center font-semibold text-cyan-400">{score.percentage}%</td>
                    <td className="p-3 text-slate-400 hidden sm:table-cell">
                      {new Date(score.date).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="text-center mt-8">
        <button
          onClick={onBack}
          className="px-8 py-3 bg-slate-800 text-white font-bold rounded-lg shadow-lg hover:bg-slate-700 transition-colors"
        >
          &larr; Back to Home
        </button>
      </div>
    </div>
  );
};

export default Leaderboard;
