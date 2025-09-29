import React from 'react';

interface HomeScreenProps {
    onStartLearningHub: () => void;
    onStartDoubtSolver: () => void;
    onStartDiagramGenerator: () => void;
}

const AtomIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.5 3.5C14.5 5.433 12.933 7 11 7s-3.5-1.567-3.5-3.5S9.067 0 11 0s3.5 1.567 3.5 3.5zM11 24c-1.933 0-3.5-1.567-3.5-3.5S9.067 17 11 17s3.5 1.567 3.5 3.5S12.933 24 11 24zM3.5 14.5C1.567 14.5 0 12.933 0 11s1.567-3.5 3.5-3.5S7 9.067 7 11s-1.567 3.5-3.5 3.5zM18.5 14.5C16.567 14.5 15 12.933 15 11s1.567-3.5 3.5-3.5S22 9.067 22 11s-1.567 3.5-3.5 3.5z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 21a10 10 0 100-20 10 10 0 000 20z" />
    </svg>
);

const LearningHubIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-cyan-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);

const DoubtSolverIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-cyan-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const DiagramGeneratorIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-cyan-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
  </svg>
);

interface FeatureCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    onClick: () => void;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, onClick }) => (
    <button 
        onClick={onClick}
        className="group p-8 bg-slate-800 border-2 border-slate-700 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 hover:border-cyan-500 hover:shadow-cyan-500/10 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-opacity-75 flex flex-col items-center text-center h-full"
    >
        {icon}
        <h2 className="text-2xl font-bold text-slate-100">{title}</h2>
        <p className="text-slate-400 mt-2 flex-grow">{description}</p>
        <div className="mt-6 px-6 py-2 bg-slate-700 text-cyan-400 font-semibold rounded-full group-hover:bg-cyan-600 group-hover:text-white transition-colors duration-300">
            Explore
        </div>
    </button>
);


const HomeScreen: React.FC<HomeScreenProps> = ({ onStartLearningHub, onStartDoubtSolver, onStartDiagramGenerator }) => {
    return (
        <div className="w-full max-w-4xl mx-auto p-4 md:p-8 text-center">
            <div className="flex justify-center items-center gap-4">
                <AtomIcon />
                <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-300">
                    The App of Curiosity
                </h1>
            </div>
            <p className="text-slate-300 mt-6 text-xl max-w-2xl mx-auto">
                Your AI-powered companion for mastering science. Choose an activity to begin your adventure!
            </p>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
                <FeatureCard 
                    icon={<LearningHubIcon />}
                    title="Learning Hub"
                    description="Test your knowledge with quizzes, generate printable worksheets, and get summarized chapter notes."
                    onClick={onStartLearningHub}
                />
                <FeatureCard 
                    icon={<DoubtSolverIcon />}
                    title="AI Doubt Solver"
                    description="Stuck on a concept? Chat with an AI tutor in 6 languages for step-by-step guidance."
                    onClick={onStartDoubtSolver}
                />
                <FeatureCard 
                    icon={<DiagramGeneratorIcon />}
                    title="Diagram Generator"
                    description="Visualize complex topics. Create and download key scientific diagrams for any chapter."
                    onClick={onStartDiagramGenerator}
                />
            </div>
        </div>
    );
};

export default HomeScreen;