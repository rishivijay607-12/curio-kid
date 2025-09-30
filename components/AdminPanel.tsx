import React, { useState, useEffect, useCallback } from 'react';
import { getAllUsers, getAllProfiles, getAllScores, deleteUser, editUserPassword } from '../services/userService';
import type { UserProfile, QuizScore } from '../types';
import LoadingSpinner from './LoadingSpinner';

interface UserData {
    username: string;
    profile: UserProfile | null;
    bestScore: QuizScore | null;
}

const AdminPanel: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [userData, setUserData] = useState<UserData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editingUser, setEditingUser] = useState<string | null>(null);
    const [newPassword, setNewPassword] = useState('');
    
    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [users, profiles, scores] = await Promise.all([
                getAllUsers(),
                getAllProfiles(),
                getAllScores(),
            ]);

            const combinedData = users.map(user => {
                const userScores = scores.filter(s => s.username === user.username);
                const bestScore = userScores.length > 0
                    ? userScores.reduce((best, current) => current.percentage > best.percentage ? current : best)
                    : null;

                return {
                    username: user.username,
                    profile: profiles[user.username] || null,
                    bestScore: bestScore,
                };
            });
            
            combinedData.sort((a, b) => {
                if (a.username === 'Rishi') return -1;
                if (b.username === 'Rishi') return 1;
                return a.username.localeCompare(b.username);
            });

            setUserData(combinedData);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load data.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleDeleteUser = async (username: string) => {
        if (window.confirm(`Are you sure you want to delete the user "${username}"? This action cannot be undone.`)) {
            try {
                await deleteUser(username);
                fetchData(); // Refresh data
            } catch (err) {
                alert(err instanceof Error ? err.message : 'Failed to delete user.');
            }
        }
    };
    
    const handleStartEdit = (username: string) => {
        setEditingUser(username);
        setNewPassword('');
    };
    
    const handleCancelEdit = () => {
        setEditingUser(null);
        setNewPassword('');
    };

    const handleSaveEdit = async (username: string) => {
        try {
            await editUserPassword(username, newPassword);
            handleCancelEdit();
            alert(`Password for "${username}" has been updated.`);
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to update password.');
        }
    };

    return (
        <div className="w-full max-w-6xl mx-auto p-4 md:p-8">
            <div className="text-center mb-8">
                <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-300">
                    Admin Panel
                </h1>
            </div>

            {/* User Management */}
            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl shadow-2xl p-6">
                 <h2 className="text-2xl font-bold text-slate-100 mb-4">User Management</h2>
                {isLoading ? (
                    <div className="flex justify-center items-center py-12"><LoadingSpinner /></div>
                ) : error ? (
                    <div className="text-center py-12 text-red-400">{error}</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left min-w-[700px]">
                            <thead className="text-sm text-slate-400 uppercase border-b border-slate-700">
                                <tr>
                                    <th className="p-3">Username</th>
                                    <th className="p-3 text-center">Quizzes</th>
                                    <th className="p-3 text-center">Total Score</th>
                                    <th className="p-3 text-center">Best Score %</th>
                                    <th className="p-3 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {userData.map(user => (
                                    <tr key={user.username} className="border-b border-slate-800 last:border-b-0">
                                        {editingUser === user.username ? (
                                            <td colSpan={5} className="p-2">
                                                <form onSubmit={(e) => { e.preventDefault(); handleSaveEdit(user.username); }} className="flex items-center gap-2 md:gap-4 p-2 bg-slate-800/50 rounded-lg">
                                                    <span className="font-medium text-slate-100 flex-shrink-0">{user.username}</span>
                                                    <input 
                                                        type="password"
                                                        value={newPassword}
                                                        onChange={(e) => setNewPassword(e.target.value)}
                                                        placeholder="New password (min 6 chars)"
                                                        className="flex-grow bg-slate-950/50 border border-slate-700 rounded-lg p-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                                        autoFocus
                                                    />
                                                    <button type="submit" className="px-3 py-1 bg-green-600 text-white font-semibold rounded-md hover:bg-green-500">Save</button>
                                                    <button type="button" onClick={handleCancelEdit} className="px-3 py-1 bg-slate-600 text-white font-semibold rounded-md hover:bg-slate-500">Cancel</button>
                                                </form>
                                            </td>
                                        ) : (
                                            <>
                                                <td className="p-3 font-medium text-slate-100">{user.username} {user.username === 'Rishi' && <span className="text-xs text-cyan-400 ml-2">(Admin)</span>}</td>
                                                <td className="p-3 text-center text-slate-200">{user.profile?.quizzesCompleted ?? 0}</td>
                                                <td className="p-3 text-center text-slate-200">{user.profile?.totalScore ?? 0}</td>
                                                <td className="p-3 text-center font-semibold text-cyan-400">{user.bestScore ? `${user.bestScore.percentage}%` : 'N/A'}</td>
                                                <td className="p-3 text-center">
                                                    {user.username !== 'Rishi' && (
                                                        <div className="flex justify-center gap-2">
                                                            <button onClick={() => handleStartEdit(user.username)} className="px-3 py-1 text-sm bg-slate-700 text-white font-semibold rounded-md hover:bg-slate-600">Edit</button>
                                                            <button onClick={() => handleDeleteUser(user.username)} className="px-3 py-1 text-sm bg-red-700 text-white font-semibold rounded-md hover:bg-red-600">Delete</button>
                                                        </div>
                                                    )}
                                                </td>
                                            </>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            
            <div className="mt-8 text-center">
                 <button onClick={onBack} className="px-6 py-2 bg-slate-700 text-white font-bold rounded-lg shadow-lg hover:bg-slate-600 transition-colors">
                    Back to Home
                </button>
            </div>
        </div>
    );
};

export default AdminPanel;