import React from 'react';
import type { AppMode } from '../types';

interface HomeScreenProps {
  onSelectMode: (mode: AppMode) => void;
  username: string | null;
  onNavigateToProfile: () => void;
  onNavigateToLeaderboard: () => void;
}

const FeatureCard: React.FC<{ title: string, description: string, mode: AppMode, onSelect: (mode: AppMode) => void, icon: JSX.Element }> = ({ title, description, mode, onSelect, icon }) => (
    <button
        onClick={() => onSelect(mode)}
        className="text-left w-full h-full p-6 bg-slate-900 border-2 border-slate-800 rounded-xl shadow-lg hover:bg-slate-800 hover:border-cyan-500 transition-all duration-200 transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-opacity-75 flex flex-col"
    >
        <div className="flex items-center gap-4 mb-3">
            <div className="text-cyan-400">{icon}</div>
            <h3 className="text-xl font-bold text-slate-100">{title}</h3>
        </div>
        <p className="text-slate-400 text-sm flex-grow">{description}</p>
    </button>
);

const ICONS = {
    quiz: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    worksheet: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>,
    notes: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>,
    diagram: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4H7z" /></svg>,
    doubt_solver: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>,
    chat_with_history: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>,
    science_lens: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" /></svg>,
    science_fair_buddy: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>,
    voice_tutor: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>,
};

const EXPLORE_FEATURES = [
    { mode: 'concept_deep_dive' as AppMode, title: 'Concept Deep Dive', description: 'Go beyond the textbook. Ask about a concept for an in-depth explanation.', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg> },
    { mode: 'virtual_lab' as AppMode, title: 'Virtual Lab', description: 'Get step-by-step instructions for a science experiment without the mess.', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg> },
    { mode: 'real_world_links' as AppMode, title: 'Real World Links', description: 'See how concepts like friction or electricity apply to your daily life.', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2h10a2 2 0 002-2v-1a2 2 0 012-2h1.945M7.704 4.343a9.003 9.003 0 0110.592 0m-10.592 0c-3.404 3.403-3.404 8.919 0 12.322m10.592-12.322c3.404 3.403 3.404 8.919 0 12.322m-10.592 0l10.592 0" /></svg> },
    { mode: 'story_weaver' as AppMode, title: 'AI Story Weaver', description: 'Turn any science topic into a fun, educational story.', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 4v12l-4-2-4 2V4M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> },
    { mode: 'what_if' as AppMode, title: "'What If?' Scenarios", description: 'Explore hypothetical questions with creative, scientific answers.', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg> },
];

const MAIN_FEATURES = [
    { mode: 'quiz' as AppMode, title: 'Interactive Quiz', description: 'Test your knowledge with an AI-generated quiz on any chapter.', icon: ICONS.quiz },
    { mode: 'worksheet' as AppMode, title: 'Printable Worksheet', description: 'Create a worksheet with various question types for offline practice.', icon: ICONS.worksheet },
    { mode: 'notes' as AppMode, title: 'Quick Study Notes', description: 'Generate concise, easy-to-review bullet-point notes for any topic.', icon: ICONS.notes },
    { mode: 'diagram' as AppMode, title: 'Diagram Generator', description: 'Visualize complex concepts with custom-generated scientific diagrams.', icon: ICONS.diagram },
    { mode: 'doubt_solver' as AppMode, title: 'AI Doubt Solver', description: 'Chat with an AI tutor to get your specific questions answered step-by-step.', icon: ICONS.doubt_solver },
    { mode: 'voice_tutor' as AppMode, title: 'Live Voice Tutor', description: 'Talk with an AI tutor in a real-time voice conversation.', icon: ICONS.voice_tutor },
    { mode: 'science_lens' as AppMode, title: 'Science Lens', description: 'Upload a picture and ask the AI to explain the science behind it.', icon: ICONS.science_lens },
    { mode: 'chat_with_history' as AppMode, title: 'Chat with History', description: 'Have a conversation with a famous scientist from the past.', icon: ICONS.chat_with_history },
    { mode: 'science_fair_buddy' as AppMode, title: 'Science Fair Buddy', description: 'Brainstorm ideas and create a step-by-step plan for your next project.', icon: ICONS.science_fair_buddy },
];


const HomeScreen: React.FC<HomeScreenProps> = ({ onSelectMode, username, onNavigateToProfile, onNavigateToLeaderboard }) => {
  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-8">
      <header className="flex flex-col sm:flex-row justify-between items-center mb-8">
        <div>
            <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-300">
            The Book of Curiosity
            </h1>
            <p className="text-slate-300 mt-2 text-xl">
            Welcome, {username || 'curious mind'}! What would you like to do today?
            </p>
        </div>
        <div className="flex items-center gap-4 mt-4 sm:mt-0">
             <button onClick={onNavigateToLeaderboard} className="px-4 py-2 bg-slate-800 text-slate-200 font-semibold rounded-md hover:bg-slate-700 transition-colors">Leaderboard</button>
             <button onClick={onNavigateToProfile} className="px-4 py-2 bg-cyan-600 text-white font-semibold rounded-md hover:bg-cyan-500 transition-colors">My Profile</button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MAIN_FEATURES.map(feature => (
            <FeatureCard key={feature.mode} {...feature} onSelect={onSelectMode} />
        ))}
      </div>

      <div className="mt-12">
        <h2 className="text-3xl font-bold text-slate-200 mb-6 text-center">Explore More</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {EXPLORE_FEATURES.map(feature => (
                <FeatureCard key={feature.mode} {...feature} onSelect={onSelectMode} />
            ))}
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;
