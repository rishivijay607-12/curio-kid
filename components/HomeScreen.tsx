import React from 'react';

// Define SVG icon components
const IconHome: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
);
const IconLogout: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
);
const IconProfile: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
    </svg>
);
const IconLeaderboard: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
);
const IconQuiz: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-14 h-14">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
    </svg>
);
const IconDoubtSolver: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-14 h-14">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.76 9.76 0 01-2.543-.336A9.75 9.75 0 013 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
    </svg>
);
const IconVoiceTutor: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-14 h-14">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
    </svg>
);
const IconDiagram: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-14 h-14">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
);
const IconScienceLens: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-14 h-14">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 10.5a.5.5 0 01.5-.5h2a.5.5 0 01.5.5v2a.5.5 0 01-.5.5h-2a.5.5 0 01-.5-.5v-2z" />
    </svg>
);
const IconWorksheet: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-14 h-14">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);
const IconNotes: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-14 h-14">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
    </svg>
);
const IconDeepDive: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-14 h-14">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m0 0l-6.75-6.75M12 19.5l6.75-6.75" />
    </svg>
);
const IconVirtualLab: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-14 h-14">
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 6.087c0-.597.484-1.087 1.088-1.087h.375c.603 0 1.087.49 1.087 1.087s-.484 1.087-1.088-1.087h-.375c-.603 0-1.087-.49-1.087-1.087z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.087c0-.597.484-1.087 1.088-1.087h.375c.603 0 1.087.49 1.087 1.087s-.484 1.087-1.088-1.087h-.375C4.234 7.174 3.75 6.684 3.75 6.087zM9 9.75h6" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l.75-5.25h13.5l.75 5.25H4.5zM3.75 12.75h16.5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 12.75v6.75a.75.75 0 00.75.75h11.5a.75.75 0 00.75-.75v-6.75" />
    </svg>
);
const IconRealWorld: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-14 h-14">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
    </svg>
);
const IconChatHistory: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-14 h-14">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
    </svg>
);
const IconStory: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-14 h-14">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
    </svg>
);
const IconScienceFair: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-14 h-14">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.037-.502.068-.752.098m.752-.098a2.25 2.25 0 012.498 2.064M9.75 3.104c.251.037.502.068.752.098M14.25 3.104v5.714c0 .828-.448 1.591-1.141 1.957l-4.1 2.25M14.25 3.104c.251.037.502.068.752.098m-.752-.098a2.25 2.25 0 002.498 2.064M14.25 3.104c-.251.037-.502.068-.752.098" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-4.5m0 4.5v-4.5m0 4.5h-4.5m4.5 0h4.5" />
    </svg>
);
const IconWhatIf: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-14 h-14">
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m-7.512 2.72a3 3 0 01-4.682-2.72 9.094 9.094 0 013.741-.479m7.512 2.72a8.97 8.97 0 01-7.512 0m7.512 2.72v-3.375c0-.621-.504-1.125-1.125-1.125h-4.5c-.621 0-1.125.504-1.125 1.125v3.375m0 0a3 3 0 006 0z" />
    </svg>
);

interface FeatureCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    onClick: () => void;
    disabled?: boolean;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, onClick, disabled = false }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={`group p-8 bg-slate-800/70 border border-slate-700 rounded-xl shadow-lg transition-all duration-300 flex flex-col items-center text-center h-full 
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-700/80 hover:border-cyan-500 hover:shadow-cyan-500/10 transform hover:-translate-y-1'}`}
    >
        <div className="text-cyan-400 mb-5">{icon}</div>
        <h3 className="font-bold text-xl text-slate-100">{title}</h3>
        <p className="text-slate-400 mt-3 text-base flex-grow">{description}</p>
        {disabled && <span className="text-xs text-amber-400 mt-4">(Coming Soon)</span>}
    </button>
);

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
    onLogout: () => void;
}

const HomeScreen: React.FC<HomeScreenProps> = (props) => {
    const { username, onLogout } = props;
    const features = [
        { icon: <IconQuiz />, title: 'Interactive Quiz', description: 'Test your knowledge with an endless supply of AI-generated questions.', onClick: props.onStartQuiz },
        { icon: <IconDoubtSolver />, title: 'AI Doubt Solver', description: 'Stuck on a concept? Ask our AI tutor for a simple explanation.', onClick: props.onStartDoubtSolver },
        { icon: <IconVoiceTutor />, title: 'AI Voice Tutor', description: 'Practice concepts by having a spoken conversation with an AI tutor.', onClick: props.onStartVoiceTutor },
        { icon: <IconDiagram />, title: 'Diagram Generator', description: 'Visualize complex topics with custom AI-generated diagrams.', onClick: props.onStartDiagramGenerator },
        { icon: <IconScienceLens />, title: 'Science Lens', description: 'Upload an image and ask the AI to explain the science behind it.', onClick: props.onStartScienceLens },
        { icon: <IconWorksheet />, title: 'Printable Worksheet', description: 'Generate practice worksheets to solve offline.', onClick: props.onStartWorksheet },
        { icon: <IconNotes />, title: 'Quick Study Notes', description: 'Get concise, easy-to-read notes on any chapter.', onClick: props.onStartNotes },
        { icon: <IconDeepDive />, title: 'Concept Deep Dive', description: 'Go beyond the textbook with in-depth explanations.', onClick: props.onStartConceptDeepDive },
        { icon: <IconVirtualLab />, title: 'Virtual Lab', description: 'Simulate experiments with step-by-step visual guidance.', onClick: props.onStartVirtualLab },
        { icon: <IconRealWorld />, title: 'Real World Links', description: 'See how science applies to everyday life around you.', onClick: props.onStartRealWorldLinks },
        { icon: <IconChatHistory />, title: 'Chat with History', description: "Talk to simulations of science's greatest minds.", onClick: props.onStartChatWithHistory },
        { icon: <IconStory />, title: 'AI Story Weaver', description: 'Turn any science concept into a fun, educational story.', onClick: props.onStartStoryWeaver },
        { icon: <IconScienceFair />, title: 'Science Fair Buddy', description: 'Brainstorm project ideas and plan your experiment.', onClick: props.onStartScienceFairBuddy },
        { icon: <IconWhatIf />, title: "'What If?' Scenarios", description: 'Explore wild hypothetical questions with creative, scientific answers.', onClick: props.onStartWhatIf },
    ];
    
    return (
        <div className="w-full max-w-screen-2xl mx-auto p-4 md:p-8">
            {/* Header */}
            <header className="flex justify-between items-center mb-8">
                <button disabled className="p-3 bg-slate-800/50 text-slate-300 rounded-full cursor-default invisible">
                    <IconHome />
                </button>
                <div className="text-center">
                    <h1 className="text-4xl md:text-5xl font-bold text-cyan-400">Welcome, {username || 'Rishi'}!</h1>
                    <p className="text-slate-400 mt-2 text-lg">What would you like to explore today?</p>
                </div>
                <button onClick={onLogout} className="p-3 bg-slate-800/50 text-slate-300 rounded-full shadow-lg hover:bg-slate-700 hover:text-white transition-colors">
                    <IconLogout />
                </button>
            </header>

             {/* Profile/Leaderboard Buttons */}
             <div className="flex justify-center items-center gap-4 mb-10">
                <button disabled className="flex items-center px-4 py-2 bg-slate-800 text-slate-300 rounded-full font-semibold transition-colors opacity-60 cursor-not-allowed">
                    <IconProfile /> Profile
                </button>
                <button disabled className="flex items-center px-4 py-2 bg-slate-800 text-slate-300 rounded-full font-semibold transition-colors opacity-60 cursor-not-allowed">
                    <IconLeaderboard /> Leaderboard
                </button>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                 {features.map((feature, index) => (
                    <FeatureCard key={index} {...feature} />
                ))}
            </div>
        </div>
    );
};

export default HomeScreen;