import React, { useState, useEffect } from 'react';
import { getUserStats } from '../services/userService';
import type { UserStats } from '../types';
import LoadingSpinner from './LoadingSpinner';

interface ProfileScreenProps {
  username: string;
  onLogout: () => void;
  onNavigateToLeaderboard: () => void;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ username, onLogout, onNavigateToLeaderboard }) => {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const userStats = await getUserStats(username);
        setStats(userStats);
      } catch (err) {
        setError("Could not load user profile data.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, [username]);
  
  const StatCard: React.FC<{ title: string; value: number | string; unit?: string }> = ({ title, value, unit }) => (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 text-center">
        <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">{title}</p>
        <p className="text-4xl font-bold text-white mt-2">
            {value}
            {unit && <span className="text-2xl text-slate-300">{unit}</span>}
        </p>
    </div>
  );

  return (
    <div className="w-full max-w-2xl mx-auto p-4 md:p-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-300">
          My Profile
        </h1>
        <p className="text-slate-300 mt-2 text-2xl">{username}</p>
      </div>

      <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl shadow-2xl p-6 mb-8">
        <h2 className="text-2xl font-bold text-slate-200 mb-4">My Stats</h2>
        {isLoading ? (
            <div className="flex justify-center items-center py-8">
                <LoadingSpinner />
            </div>
        ) : error ? (
            <div className="text-center py-8 text-red-400">{error}</div>
        ) : stats ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <StatCard title="Quizzes Taken" value={stats.quizzesTaken} />
               <StatCard title="Average Score" value={stats.averageScore} unit="%" />
               <StatCard title="Worksheets" value={stats.worksheetsCompleted} />
            </div>
        ) : (
            <p className="text-slate-400 text-center py-8">No stats available yet.</p>
        )}
      </div>
      
      <div className="flex flex-col sm:flex-row justify-center gap-4">
         <button
            onClick={onNavigateToLeaderboard}
            className="w-full sm:w-auto px-8 py-3 bg-cyan-600 text-white font-bold rounded-lg shadow-lg hover:bg-cyan-500 transition-colors"
        >
            View Leaderboard
        </button>
        <button
          onClick={onLogout}
          className="w-full sm:w-auto px-8 py-3 bg-slate-700 text-white font-bold rounded-lg shadow-lg hover:bg-slate-600 transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default ProfileScreen;
