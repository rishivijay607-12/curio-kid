import React from 'react';
import type { AppMode, User } from '../types';

interface HomeScreenProps {
  onStartFeature: (mode: AppMode) => void;
  user: User | null;
  onShowProfile: () => void;
  onShowLeaderboard: () => void;
  onGoToAdminPanel: () => void;
}

// --- SVG Icons (as functional components) ---
const IconQuiz: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const IconWorksheet: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16v2a2 2 0 01-2 2H5a2 2 0 01-2-2v-7a2 2 0 012-2h2m3-4H9a2 2 0 00-2 2v7a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-1m-1 4l-3 3m0 0l-3-3m3 3V3" /></svg>;
const IconNotes: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>;
const IconDiagram: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4H7z" /></svg>;
const IconDoubtSolver: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>;
const IconVoiceTutor: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>;
const IconScienceLens: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" /></svg>;
const IconDeepDive: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>;
const IconWorksheetV2: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>;
const IconNotesV2: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
const IconVirtualLab: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>;
const IconRealWorld: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2h10a2 2 0 002-2v-1a2 2 0 012-2h1.945M7.704 4.343a9.003 9.003 0 0110.592 0m-10.592 0c-3.404 3.403-3.404 8.919 0 12.322m10.592-12.322c3.404 3.403 3.404 8.919 0 12.322m-10.592 0l10.592 0" /></svg>;
const IconHistory: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>;
const IconStory: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M16 4v12l-4-2-4 2V4M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const IconScienceFair: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>;
const IconWhatIf: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>;
const IconProfile: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
const IconLeaderboard: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>;
const IconAdmin: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;

// --- Feature Definitions ---
const features = [
    { mode: 'quiz' as AppMode, title: 'Interactive Quiz', description: 'Test your knowledge with an endless supply of AI-generated questions.', icon: <IconQuiz /> },
    { mode: 'doubt_solver' as AppMode, title: 'AI Doubt Solver', description: 'Stuck on a concept? Ask our AI tutor for a simple explanation.', icon: <IconDoubtSolver /> },
    { mode: 'voice_tutor' as AppMode, title: 'AI Voice Tutor', description: 'Practice concepts by having a spoken conversation with an AI tutor.', icon: <IconVoiceTutor /> },
    { mode: 'diagram' as AppMode, title: 'Diagram Generator', description: 'Visualize complex topics with custom AI-generated diagrams.', icon: <IconDiagram /> },
    { mode: 'science_lens' as AppMode, title: 'Science Lens', description: 'Upload an image and ask the AI to explain the science behind it.', icon: <IconScienceLens /> },
    { mode: 'worksheet' as AppMode, title: 'Printable Worksheet', description: 'Generate practice worksheets to solve offline.', icon: <IconWorksheetV2 /> },
    { mode: 'notes' as AppMode, title: 'Quick Study Notes', description: 'Get concise, easy-to-read notes on any chapter.', icon: <IconNotesV2 /> },
    { mode: 'concept_deep_dive' as AppMode, title: 'Concept Deep Dive', description: 'Go beyond the textbook with in-depth explanations.', icon: <IconDeepDive /> },
    { mode: 'virtual_lab' as AppMode, title: 'Virtual Lab', description: 'Simulate experiments with step-by-step visual guidance.', icon: <IconVirtualLab /> },
    { mode: 'real_world_links' as AppMode, title: 'Real World Links', description: 'See how science applies to everyday life around you.', icon: <IconRealWorld /> },
    { mode: 'chat_with_history' as AppMode, title: 'Chat with History', description: 'Talk to simulations of science\'s greatest minds.', icon: <IconHistory /> },
    { mode: 'story_weaver' as AppMode, title: 'AI Story Weaver', description: 'Turn any science concept into a fun, educational story.', icon: <IconStory /> },
    { mode: 'science_fair_buddy' as AppMode, title: 'Science Fair Buddy', description: 'Brainstorm project ideas and plan your experiment.', icon: <IconScienceFair /> },
    { mode: "'what_if'" as AppMode, title: "'What If?' Scenarios", description: 'Explore wild hypothetical questions with creative, scientific answers.', icon: <IconWhatIf /> },
];


const FeatureCard: React.FC<{ title: string; description: string; mode: AppMode; onSelect: (mode: AppMode) => void; icon: React.ReactNode; }> = ({ title, description, mode, onSelect, icon }) => (
    <button
        onClick={() => onSelect(mode)}
        className="text-left w-full h-full p-6 bg-slate-900/70 backdrop-blur-sm border-2 border-slate-800 rounded-2xl shadow-lg hover:bg-slate-800/70 hover:border-cyan-500 transition-all duration-200 transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-opacity-75 flex flex-col items-center text-center"
    >
        <div className="text-cyan-400 mb-4">{icon}</div>
        <h3 className="text-xl font-bold text-slate-100 mb-2">{title}</h3>
        <p className="text-slate-400 text-sm flex-grow">{description}</p>
    </button>
);


const HomeScreen: React.FC<HomeScreenProps> = ({ onStartFeature, user, onShowProfile, onShowLeaderboard, onGoToAdminPanel }) => {
  return (
    <div className="w-full max-w-screen-2xl mx-auto p-4 md:p-8">
      <header className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-300">
          Welcome, {user?.username || 'Curious Mind'}!
        </h1>
        <p className="text-slate-300 mt-3 text-lg">
          What would you like to explore today?
        </p>
         <div className="mt-6 flex justify-center items-center gap-4 flex-wrap">
             <button onClick={onShowProfile} className="flex items-center px-5 py-2.5 bg-slate-800 text-slate-200 font-semibold rounded-full hover:bg-slate-700 transition-colors shadow">
                <IconProfile />
                Profile
             </button>
             <button onClick={onShowLeaderboard} className="flex items-center px-5 py-2.5 bg-slate-800 text-slate-200 font-semibold rounded-full hover:bg-slate-700 transition-colors shadow">
                <IconLeaderboard />
                Leaderboard
             </button>
             {user?.isAdmin && (
                <button onClick={onGoToAdminPanel} className="flex items-center px-5 py-2.5 bg-teal-600 text-white font-semibold rounded-full hover:bg-teal-500 transition-colors shadow">
                    <IconAdmin />
                    Admin Panel
                </button>
             )}
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
        {features.map(feature => (
            <FeatureCard key={feature.mode} {...feature} onSelect={onStartFeature} />
        ))}
      </div>
    </div>
  );
};

export default HomeScreen;