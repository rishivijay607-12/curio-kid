import React from 'react';
import type { UserProfile } from '../types';
import LoadingSpinner from './LoadingSpinner';

interface ProfileScreenProps {
  userProfile: UserProfile | null;
  isLoading: boolean;
  username: string;
}

const PixelArtAvatar: React.FC = () => (
    <div className="relative w-32 h-32">
        <div className="absolute inset-0 bg-red-500 rounded-full"></div>
        <div className="absolute inset-2 bg-cyan-400 rounded-full"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-28 h-28 bg-[#222] rounded-full p-2">
            <div className="w-full h-full bg-[#f8d8b4] rounded-full relative overflow-hidden">
                {/* Hair */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-20 h-10 bg-[#c23a22]">
                    <div className="absolute top-full left-0 w-4 h-4 bg-[#c23a22] -mt-2"></div>
                    <div className="absolute top-full right-0 w-4 h-4 bg-[#c23a22] -mt-2"></div>
                </div>
                {/* Eyes */}
                <div className="absolute top-12 left-8 w-4 h-4 bg-white rounded-full"></div>
                <div className="absolute top-12 right-8 w-4 h-4 bg-white rounded-full"></div>
                {/* Mouth */}
                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 w-6 h-2 bg-[#c23a22] rounded-full"></div>
            </div>
        </div>
    </div>
);


const ProfileScreen: React.FC<ProfileScreenProps> = ({ userProfile, isLoading, username }) => {
  return (
    <div className="w-full max-w-2xl mx-auto p-4 md:p-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-300">
          {username}'s Profile
        </h1>
      </div>

        {isLoading ? (
            <div className="flex justify-center items-center py-12">
                <LoadingSpinner />
            </div>
        ) : userProfile ? (
            <div className="space-y-6">
                {/* Avatar Card */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl shadow-lg p-8 flex flex-col items-center">
                    <PixelArtAvatar />
                    <p className="text-2xl font-bold text-slate-100 mt-4">{username}</p>
                </div>

                {/* Stats Card */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl shadow-lg p-6">
                    <h2 className="text-xl font-bold text-cyan-400 mb-4">Stats</h2>
                    <div className="space-y-3 text-lg">
                        <div className="flex justify-between items-center">
                            <span className="text-slate-400">Quizzes Completed:</span>
                            <span className="font-semibold text-slate-100">{userProfile.quizzesCompleted}</span>
                        </div>
                         <div className="flex justify-between items-center">
                            <span className="text-slate-400">Total Score:</span>
                            <span className="font-semibold text-slate-100">{userProfile.totalScore}</span>
                        </div>
                         <div className="flex justify-between items-center">
                            <span className="text-slate-400">Current Streak:</span>
                            <span className="font-semibold text-slate-100 flex items-center">{userProfile.currentStreak} {userProfile.currentStreak > 0 && <span className="ml-1.5" title="Daily Streak">🔥</span>}</span>
                        </div>
                    </div>
                </div>

                {/* Badges Card */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl shadow-lg p-6">
                    <h2 className="text-xl font-bold text-cyan-400 mb-4">Badges Earned</h2>
                    <p className="text-slate-400 text-center py-4">Complete some quizzes to start earning badges!</p>
                </div>
            </div>
        ) : (
            <div className="text-center py-12 text-red-400">
                Could not load profile data.
            </div>
        )}
    </div>
  );
};

export default ProfileScreen;