import React from 'react';

interface HomeScreenProps {
    username: string;
    onStartQuiz: () => void;
    onStartWorksheet: () => void;
    onStartNotes: () => void;
    onStartDiagramGenerator: () => void;
    onStartDoubtSolver: () => void;
    onStartVoiceTutor: () => void;
    onStartScienceLens: () => void;
    onStartConceptDeepDive: () => void;
    onStartVirtualLab: () => void;
    onStartRealWorldLinks: () => void;
    onStartChatWithHistory: () => void;
    onStartStoryWeaver: () => void;
    onStartScienceFairBuddy: () => void;
    onStartWhatIf: () => void;
}

const FeatureCard: React.FC<{ title: string; description: string; onClick: () => void; icon: React.ReactNode, disabled?: boolean }> = ({ title, description, onClick, icon, disabled }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className="text-left py-12 px-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-lg hover:bg-slate-800 hover:border-cyan-500 transition-all duration-200 transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-opacity-75 flex flex-col h-full disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
    >
        <div className="flex-shrink-0 text-cyan-400 mb-6">
             {icon}
        </div>
        <h3 className="font-bold text-xl text-slate-100">{title}</h3>
        <p className="text-slate-400 text-sm mt-2 flex-grow">{description}</p>
        {disabled && <span className="text-xs text-yellow-400 mt-2 font-semibold">Coming Soon</span>}
    </button>
);

const icons = {
    quiz: <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    doubtSolver: <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>,
    voiceTutor: <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>,
    diagram: <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
    scienceLens: <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    worksheet: <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>,
    notes: <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>,
    deepDive: <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" /></svg>,
    virtualLab: <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M14.5 3.5C14.5 5.433 12.933 7 11 7s-3.5-1.567-3.5-3.5S9.067 0 11 0s3.5 1.567 3.5 3.5zM11 24c-1.933 0-3.5-1.567-3.5-3.5S9.067 17 11 17s3.5 1.567 3.5 3.5S12.933 24 11 24zM3.5 14.5C1.567 14.5 0 12.933 0 11s1.567-3.5 3.5-3.5S7 9.067 7 11s-1.567 3.5-3.5 3.5zM18.5 14.5C16.567 14.5 15 12.933 15 11s1.567-3.5 3.5-3.5S22 9.067 22 11s-1.567 3.5-3.5 3.5z" /><path strokeLinecap="round" strokeLinejoin="round" d="M11 21a10 10 0 100-20 10 10 0 000 20z" /></svg>,
    realWorld: <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    history: <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>,
    story: <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>,
    scienceFair: <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>,
    whatIf: <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM18 13.5a3.375 3.375 0 00-3.375-3.375L13.5 9.75l-1.125.375a3.375 3.375 0 00-2.456 2.456L9 13.5l.375 1.125a3.375 3.375 0 002.456 2.456L13.5 18l1.125-.375a3.375 3.375 0 002.456-2.456L18 13.5z" /></svg>,
};


const HomeScreen: React.FC<HomeScreenProps> = ({
    username,
    onStartQuiz,
    onStartWorksheet,
    onStartNotes,
    onStartDiagramGenerator,
    onStartDoubtSolver,
    onStartVoiceTutor,
    onStartScienceLens,
    onStartConceptDeepDive,
    onStartVirtualLab,
    onStartRealWorldLinks,
    onStartChatWithHistory,
    onStartStoryWeaver,
    onStartScienceFairBuddy,
    onStartWhatIf,
}) => {
    
    const featureCards = [
        { title: "Interactive Quiz", description: "Test your knowledge with an endless supply of AI-generated questions.", icon: icons.quiz, onClick: onStartQuiz },
        { title: "AI Doubt Solver", description: "Stuck on a concept? Ask our AI tutor for a simple explanation.", icon: icons.doubtSolver, onClick: onStartDoubtSolver },
        { title: "AI Voice Tutor", description: "Practice concepts by having a spoken conversation with an AI tutor.", icon: icons.voiceTutor, onClick: onStartVoiceTutor },
        { title: "Diagram Generator", description: "Visualize complex topics with custom AI-generated diagrams.", icon: icons.diagram, onClick: onStartDiagramGenerator },
        { title: "Science Lens", description: "Upload an image and ask the AI to explain the science behind it.", icon: icons.scienceLens, onClick: onStartScienceLens },
        { title: "Printable Worksheet", description: "Generate practice worksheets to solve offline.", icon: icons.worksheet, onClick: onStartWorksheet },
        { title: "Quick Study Notes", description: "Get concise, easy-to-read notes on any chapter.", icon: icons.notes, onClick: onStartNotes },
        { title: "Concept Deep Dive", description: "Go beyond the textbook with in-depth explanations.", icon: icons.deepDive, onClick: onStartConceptDeepDive },
        { title: "Virtual Lab", description: "Simulate experiments with step-by-step visual guidance.", icon: icons.virtualLab, onClick: onStartVirtualLab },
        { title: "Real World Links", description: "See how science applies to everyday life around you.", icon: icons.realWorld, onClick: onStartRealWorldLinks },
        { title: "Chat with History", description: "Talk to simulations of science's greatest minds.", icon: icons.history, onClick: onStartChatWithHistory },
        { title: "AI Story Weaver", description: "Turn any science concept into a fun, educational story.", icon: icons.story, onClick: onStartStoryWeaver },
        { title: "Science Fair Buddy", description: "Brainstorm project ideas and plan your experiment.", icon: icons.scienceFair, onClick: onStartScienceFairBuddy },
        { title: "'What If?' Scenarios", description: "Explore wild hypothetical questions with creative, scientific answers.", icon: icons.whatIf, onClick: onStartWhatIf },
    ];
    
    return (
        <div className="w-full max-w-screen-2xl mx-auto p-4 md:p-8">
            <header className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-300">
                    Welcome, {username}!
                </h1>
                <p className="text-slate-400 mt-2 text-lg md:text-xl">What would you like to explore today?</p>
                <div className="mt-6 flex justify-center gap-4">
                    <button className="px-5 py-2 bg-slate-900 border border-slate-800 text-slate-300 font-semibold rounded-lg shadow-md hover:bg-slate-800 hover:text-white transition-colors flex items-center gap-2">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
                        Profile
                    </button>
                    <button className="px-5 py-2 bg-slate-900 border border-slate-800 text-slate-300 font-semibold rounded-lg shadow-md hover:bg-slate-800 hover:text-white transition-colors flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" /><path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" /></svg>
                        Leaderboard
                    </button>
                </div>
            </header>
            
            <main>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                    {featureCards.map((card, index) => (
                        <FeatureCard 
                            key={index} 
                            title={card.title} 
                            description={card.description} 
                            icon={card.icon}
                            onClick={card.onClick}
                            disabled={(card as any).disabled}
                        />
                    ))}
                </div>
            </main>
        </div>
    );
};

export default HomeScreen;