import React, { useState, useEffect, useCallback } from 'react';
import type { Grade, Difficulty, QuizQuestion, ChatMessage, Language, NoteSection, AppMode, GenerativeTextResult, DiagramIdea, Diagram, ScienceFairIdea, ScienceFairPlanStep, Scientist, User, UserProfile } from './types';

// Service Imports
import {
    generateQuizQuestions,
    generateWorksheet,
    generateNotes,
    generateGreeting,
    getChatResponse,
    generateDiagramIdeas,
    generateDiagramImage,
    generateTextForMode,
    explainImageWithText,
    generateScienceFairIdeas,
    generateScienceFairPlan,
    generateScientistGreeting,
    getHistoricalChatResponse,
} from './services/geminiService';
import { login, register, getCurrentUser, logout, addQuizScore, getProfile } from './services/userService';

// Component Imports
const GradeSelector = React.lazy(() => import('./components/GradeSelector'));
const TopicSelector = React.lazy(() => import('./components/TopicSelector'));
const DifficultySelector = React.lazy(() => import('./components/DifficultySelector'));
const QuestionCountSelector = React.lazy(() => import('./components/QuestionCountSelector'));
const TimerSelector = React.lazy(() => import('./components/TimerSelector'));
const Quiz = React.lazy(() => import('./components/Quiz'));
const ScoreScreen = React.lazy(() => import('./components/ScoreScreen'));
const WorksheetCountSelector = React.lazy(() => import('./components/WorksheetCountSelector'));
const Worksheet = React.lazy(() => import('./components/Worksheet'));
const Notes = React.lazy(() => import('./components/Notes'));
const LanguageSelector = React.lazy(() => import('./components/LanguageSelector'));
const DoubtSolver = React.lazy(() => import('./components/DoubtSolver'));
const DiagramIdeaSelector = React.lazy(() => import('./components/DiagramIdeaSelector'));
const DiagramGenerator = React.lazy(() => import('./components/DiagramGenerator'));
const GenerativeText = React.lazy(() => import('./components/GenerativeText'));
const ScienceLens = React.lazy(() => import('./components/ScienceLens'));
const ScienceFairBuddy = React.lazy(() => import('./components/ScienceFairBuddy'));
const ScienceFairIdeas = React.lazy(() => import('./components/ScienceFairIdeas'));
const ScienceFairPlan = React.lazy(() => import('./components/ScienceFairPlan'));
const VoiceTutor = React.lazy(() => import('./components/VoiceTutor'));
const ScientistSelector = React.lazy(() => import('./components/ScientistSelector'));
const HistoricalChat = React.lazy(() => import('./components/HistoricalChat'));
const LoginScreen = React.lazy(() => import('./components/LoginScreen'));
const RegistrationScreen = React.lazy(() => import('./components/RegistrationScreen'));
const Leaderboard = React.lazy(() => import('./components/Leaderboard'));
const ProfileScreen = React.lazy(() => import('./components/ProfileScreen'));
const HomeScreen = React.lazy(() => import('./components/HomeScreen'));
const AdminPanel = React.lazy(() => import('./components/AdminPanel'));
import LoadingSpinner from './components/LoadingSpinner';


// --- Main App Component ---
const App: React.FC = () => {
    // Game State
    const [gameState, setGameState] = useState<string>('login');
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

    // Config State
    const [appMode, setAppMode] = useState<AppMode>('home');
    const [grade, setGrade] = useState<Grade | null>(null);
    const [topic, setTopic] = useState<string | null>(null);
    const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
    const [quizLength, setQuizLength] = useState<number | null>(null);
    const [timerDuration, setTimerDuration] = useState<number | null>(null);
    const [language, setLanguage] = useState<Language | null>(null);
    const [selectedScientist, setSelectedScientist] = useState<Scientist | null>(null);
    const [userScienceFairTopic, setUserScienceFairTopic] = useState<string>('');

    // Data & UI State
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lastScore, setLastScore] = useState(0);
    const [worksheetQuestions, setWorksheetQuestions] = useState<QuizQuestion[]>([]);
    const [notes, setNotes] = useState<NoteSection[]>([]);
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [generationProgress, setGenerationProgress] = useState({ current: 0, total: 0 });
    const [diagramIdeas, setDiagramIdeas] = useState<DiagramIdea[]>([]);
    const [diagrams, setDiagrams] = useState<Diagram[]>([]);
    const [isGenerationCancelled, setIsGenerationCancelled] = useState(false);
    const [regeneratingId, setRegeneratingId] = useState<string | null>(null);
    const [generativeTextResult, setGenerativeTextResult] = useState<GenerativeTextResult | null>(null);
    const [scienceLensResult, setScienceLensResult] = useState<string | null>(null);
    const [scienceFairIdeas, setScienceFairIdeas] = useState<ScienceFairIdea[]>([]);
    const [selectedScienceFairIdea, setSelectedScienceFairIdea] = useState<ScienceFairIdea | null>(null);
    const [scienceFairPlan, setScienceFairPlan] = useState<ScienceFairPlanStep[]>([]);
    
    // --- Effects ---
    useEffect(() => {
        const user = getCurrentUser();
        if (user) {
            setCurrentUser(user);
            setGameState('home');
        }
    }, []);

    // --- State Resets ---
    const resetToHome = useCallback(() => {
        setGameState('home');
        setAppMode('home');
        setGrade(null);
        setTopic(null);
        setDifficulty(null);
        setQuizLength(null);
        setTimerDuration(null);
        setLanguage(null);
        setError(null);
        setIsLoading(false);
        setWorksheetQuestions([]);
        setNotes([]);
        setChatHistory([]);
        setGenerationProgress({ current: 0, total: 0 });
        setDiagramIdeas([]);
        setDiagrams([]);
        setGenerativeTextResult(null);
        setScienceLensResult(null);
        setScienceFairIdeas([]);
        setSelectedScienceFairIdea(null);
        setScienceFairPlan([]);
        setSelectedScientist(null);
        setUserProfile(null); // Clear profile data
    }, []);

    // --- Handlers ---

    // Auth
    const handleLogin = async (username: string, password: string) => {
        const user = await login(username, password);
        setCurrentUser(user);
        setGameState('home');
        return true;
    };
    
    const handleRegister = async (username: string, password: string) => {
        const user = await register(username, password);
        setCurrentUser(user);
        setGameState('home');
        return true;
    };
    
    const handleLogout = () => {
        logout();
        setCurrentUser(null);
        setGameState('login');
        resetToHome();
    };

    // Navigation
    const handleStartFeature = (mode: AppMode) => {
        setAppMode(mode);
        // Direct to feature for those that don't need grade/topic
        if (['science_lens', 'science_fair_buddy', 'what_if', 'concept_deep_dive', 'virtual_lab', 'story_weaver'].includes(mode)) {
            setGameState('generative_text_input');
        } else if (mode === 'chat_with_history') {
            setGameState('HISTORICAL_SCIENTIST_SELECTION');
        } else {
             setGameState('GRADE_SELECTION');
        }
    };
    
    const handleShowLeaderboard = () => setGameState('LEADERBOARD');
    const handleGoToAdminPanel = () => setGameState('ADMIN_PANEL');
    
    const handleShowProfile = async () => {
        if (!currentUser) return;
        setIsLoading(true);
        try {
            const profileData = await getProfile(currentUser.username);
            setUserProfile(profileData);
            setGameState('PROFILE_SCREEN');
        } catch(err) {
            setError(err instanceof Error ? err.message : 'Could not load profile.');
        } finally {
            setIsLoading(false);
        }
    };

    // Quiz Flow
    const handleQuizEnd = async (finalScore: number, totalQuestions: number) => {
        setLastScore(finalScore);
        if (currentUser && totalQuestions) {
            try {
                await addQuizScore(currentUser.username, finalScore, totalQuestions);
            } catch (err) {
                console.error("Failed to save score or update profile:", err);
                setError("There was an issue saving your score.");
            }
        }
        setGameState('SCORE_SCREEN');
    };
    
    // Worksheet Flow
    const handleWorksheetCountSelect = async (count: number) => {
        if (!topic || !grade || !difficulty) return;
        setIsLoading(true);
        setError(null);
        try {
            const questions = await generateWorksheet(topic, grade, difficulty, count, setGenerationProgress);
            setWorksheetQuestions(questions);
            setGameState('WORKSHEET_DISPLAY');
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unknown error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    // Notes Flow
    const handleNotesTopicSelect = async (selectedTopic: string) => {
        if (!grade) return;
        setTopic(selectedTopic);
        setIsLoading(true);
        setError(null);
        try {
            const notesData = await generateNotes(selectedTopic, grade);
            setNotes(notesData);
            setGameState('NOTES_DISPLAY');
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unknown error occurred.");
        } finally {
            setIsLoading(false);
        }
    };
    
    // Chat & Tutor Flows
    const handleStartChat = async (selectedTopic: string, selectedLanguage: Language) => {
        if (!grade) return;
        setTopic(selectedTopic);
        setLanguage(selectedLanguage);
        setIsLoading(true);
        setError(null);
        try {
            const greeting = await generateGreeting(grade, selectedLanguage, selectedTopic);
            // FIX: Explicitly type the new chat message object to conform to ChatMessage type.
            const greetingMessage: ChatMessage = { role: 'model', parts: [{ text: greeting }] };
            setChatHistory([greetingMessage]);
            setGameState('DOUBT_SOLVER_SESSION');
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unknown error occurred.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleSendMessage = async (message: string) => {
        if (!grade || !topic || !language) return;
        // FIX: Explicitly type the new history array to prevent type widening.
        const newHistory: ChatMessage[] = [...chatHistory, { role: 'user', parts: [{ text: message }] }];
        setChatHistory(newHistory);
        setIsLoading(true);
        setError(null);
        try {
            const response = await getChatResponse(grade, newHistory, language, topic);
            // FIX: Explicitly create a ChatMessage object before adding it to state to prevent type widening.
            const modelMessage: ChatMessage = { role: 'model', parts: [{ text: response }] };
            setChatHistory(prev => [...prev, modelMessage]);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unknown error occurred.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleScientistSelect = async (scientist: Scientist) => {
        setSelectedScientist(scientist);
        setGameState('HISTORICAL_CHAT_SESSION');
        setIsLoading(true);
        try {
            const greeting = await generateScientistGreeting(scientist);
            // FIX: Explicitly type the new chat message object to conform to ChatMessage type.
            const greetingMessage: ChatMessage = { role: 'model', parts: [{ text: greeting }] };
            setChatHistory([greetingMessage]);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to get a greeting.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendHistoricalMessage = async (message: string) => {
        if (!selectedScientist) return;
        const newHistory: ChatMessage[] = [...chatHistory, { role: 'user', parts: [{ text: message }] }];
        setChatHistory(newHistory);
        setIsLoading(true);
        setError(null);
        try {
            const response = await getHistoricalChatResponse(selectedScientist, newHistory);
            // FIX: Explicitly create a ChatMessage object before adding it to state.
            const modelMessage: ChatMessage = { role: 'model', parts: [{ text: response }] };
            setChatHistory(prev => [...prev, modelMessage]);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unknown error occurred.");
        } finally {
            setIsLoading(false);
        }
    };


    // Diagram Flow
    const handleDiagramTopicSelect = async (selectedTopic: string) => {
        if (!grade) return;
        setTopic(selectedTopic);
        setIsLoading(true);
        setError(null);
        try {
            const ideas = await generateDiagramIdeas(selectedTopic, grade);
            setDiagramIdeas(ideas);
            setGameState('DIAGRAM_IDEA_SELECTION');
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unknown error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleGenerateDiagrams = async (selectedIdeas: DiagramIdea[]) => {
        setGameState('DIAGRAM_DISPLAY');
        setIsLoading(true);
        setIsGenerationCancelled(false);
        setGenerationProgress({ current: 0, total: selectedIdeas.length });
        
        const generated: Diagram[] = [];
        setDiagrams(generated);
        for (let i = 0; i < selectedIdeas.length; i++) {
            if (isGenerationCancelled) break;
            const idea = selectedIdeas[i];
            setGenerationProgress({ current: i, total: selectedIdeas.length });
            try {
                const imageBytes = await generateDiagramImage(idea.prompt);
                const newDiagram: Diagram = { id: idea.id, idea, image: `data:image/png;base64,${imageBytes}` };
                generated.push(newDiagram);
                setDiagrams([...generated]);
            } catch (err) {
                console.error(`Failed to generate image for: ${idea.prompt}`, err);
            }
        }
        setGenerationProgress(prev => ({ ...prev, current: generated.length }));
        setIsLoading(false);
    };

    const handleRegenerateDiagram = async (diagramId: string) => {
        const diagramToRegen = diagrams.find(d => d.id === diagramId);
        if (!diagramToRegen) return;
        
        setRegeneratingId(diagramId);
        try {
            const imageBytes = await generateDiagramImage(diagramToRegen.idea.prompt);
            const newImage = `data:image/png;base64,${imageBytes}`;
            setDiagrams(prev => prev.map(d => d.id === diagramId ? { ...d, image: newImage } : d));
        } catch (err) {
            console.error('Failed to regenerate diagram', err);
        } finally {
            setRegeneratingId(null);
        }
    };

    // Other Generative Features
    const handleGenerateText = async (userInput: string) => {
        setIsLoading(true);
        setError(null);
        setGenerativeTextResult(null);
        try {
            const result = await generateTextForMode(appMode, userInput, grade ?? undefined, topic ?? undefined);
            setGenerativeTextResult(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unknown error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleScienceLensGenerate = async (base64Image: string, mimeType: string, prompt: string) => {
        setIsLoading(true);
        setError(null);
        setScienceLensResult(null);
        try {
            const result = await explainImageWithText(base64Image, mimeType, prompt);
            setScienceLensResult(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unknown error occurred.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleScienceFairIdeasGenerate = async (userInput: string) => {
        setIsLoading(true);
        setError(null);
        setUserScienceFairTopic(userInput);
        try {
            const ideas = await generateScienceFairIdeas(userInput);
            setScienceFairIdeas(ideas);
            setGameState('SCIENCE_FAIR_IDEAS');
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unknown error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelectScienceFairIdea = async (idea: ScienceFairIdea) => {
        setSelectedScienceFairIdea(idea);
        setGameState('SCIENCE_FAIR_PLAN');
        setIsLoading(true);
        try {
            const plan = await generateScienceFairPlan(idea.title, idea.description, (progress) => {
                 setGenerationProgress({current: progress.current, total: progress.total});
            });
            setScienceFairPlan(plan);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unknown error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    // --- Render Logic ---
    const renderContent = () => {
        switch (gameState) {
            case 'login': return <LoginScreen onLogin={handleLogin} onNavigateToRegister={() => setGameState('register')} />;
            case 'register': return <RegistrationScreen onRegister={handleRegister} onNavigateToLogin={() => setGameState('login')} />;
            case 'home': return <HomeScreen onStartFeature={handleStartFeature} user={currentUser} onShowProfile={handleShowProfile} onShowLeaderboard={handleShowLeaderboard} onGoToAdminPanel={handleGoToAdminPanel} />;
            case 'PROFILE_SCREEN': return <ProfileScreen userProfile={userProfile} isLoading={isLoading} username={currentUser?.username ?? ''} />;
            case 'LEADERBOARD': return <Leaderboard currentUser={currentUser?.username ?? null} onBack={resetToHome} />;
            case 'ADMIN_PANEL': return <AdminPanel onBack={resetToHome} />;

            // FIX: Add missing required props: isSolverSetup, isLoading, and error.
            case 'GRADE_SELECTION': return <GradeSelector 
                onGradeSelect={grade => { setGrade(grade); setGameState('TOPIC_SELECTION'); }} 
                appMode={appMode} 
                isSolverSetup={['doubt_solver', 'voice_tutor'].includes(appMode)}
                isLoading={isLoading}
                error={error}
            />;
            case 'TOPIC_SELECTION': return <TopicSelector onTopicSelect={(t) => {
                setTopic(t);
                if (appMode === 'notes') handleNotesTopicSelect(t);
                else if (appMode === 'diagram') handleDiagramTopicSelect(t);
                else if (appMode === 'doubt_solver' || appMode === 'voice_tutor') setGameState('LANGUAGE_SELECTION');
                else if (['concept_deep_dive', 'virtual_lab', 'real_world_links', 'story_weaver', 'what_if'].includes(appMode)) setGameState('generative_text_input');
                else setGameState('DIFFICULTY_SELECTION');
            }} grade={grade!} isGenerating={isLoading} error={error} appMode={appMode} />;
            
            case 'DIFFICULTY_SELECTION': return <DifficultySelector onDifficultySelect={d => { setDifficulty(d); setGameState('COUNT_SELECTION'); }} />;
            
            case 'COUNT_SELECTION':
                if (appMode === 'quiz') return <QuestionCountSelector onQuestionCountSelect={c => { setQuizLength(c); setGameState('TIMER_SELECTION'); }} />;
                if (appMode === 'worksheet') return <WorksheetCountSelector onCountSelect={handleWorksheetCountSelect} isGenerating={isLoading} error={error} generationProgress={generationProgress} />;
                return null;
            
            case 'TIMER_SELECTION': return <TimerSelector onTimerSelect={d => { setTimerDuration(d); setGameState('QUIZ_RUNNING'); }} />;
            case 'QUIZ_RUNNING': return <Quiz topic={topic!} grade={grade!} difficulty={difficulty!} quizLength={quizLength!} timerDuration={timerDuration!} onQuizEnd={(score) => handleQuizEnd(score, quizLength!)} />;
            case 'SCORE_SCREEN': return <ScoreScreen score={lastScore} onRestart={() => setGameState('DIFFICULTY_SELECTION')} quizLength={quizLength!} />;
            
            case 'WORKSHEET_DISPLAY': return <Worksheet questions={worksheetQuestions} onRestart={() => setGameState('DIFFICULTY_SELECTION')} grade={grade!} topic={topic!} />;
            case 'NOTES_DISPLAY': return <Notes notes={notes} onRestart={resetToHome} grade={grade!} topic={topic!} />;
           
            case 'LANGUAGE_SELECTION': return <LanguageSelector onLanguageSelect={lang => {
                setLanguage(lang);
                if(appMode === 'doubt_solver') handleStartChat(topic!, lang);
                else setGameState('VOICE_TUTOR_SESSION');
            }} title={appMode === 'voice_tutor' ? "AI Voice Tutor" : "AI Doubt Solver"} grade={grade!} topic={topic!} />;

            case 'DOUBT_SOLVER_SESSION': return <DoubtSolver grade={grade!} topic={topic!} history={chatHistory} onSendMessage={handleSendMessage} isLoading={isLoading} error={error} onCancelGeneration={() => setIsLoading(false)} />;
            
            case 'DIAGRAM_IDEA_SELECTION': return <DiagramIdeaSelector ideas={diagramIdeas} onGenerate={handleGenerateDiagrams} />;
            case 'DIAGRAM_DISPLAY': return <DiagramGenerator diagrams={diagrams} isGenerating={isLoading} grade={grade!} topic={topic!} onRestart={resetToHome} onCancelGeneration={() => setIsGenerationCancelled(true)} generationProgress={generationProgress} onRegenerate={handleRegenerateDiagram} regeneratingId={regeneratingId} />;
            
            case 'generative_text_input': return <GenerativeText appMode={appMode} grade={grade} topic={topic!} onGenerate={handleGenerateText} isLoading={isLoading} result={generativeTextResult} error={error} />;
            
            case 'science_lens': return <ScienceLens onGenerate={handleScienceLensGenerate} isLoading={isLoading} result={scienceLensResult} error={error} />;
           
            case 'science_fair_buddy': return <ScienceFairBuddy onGenerate={handleScienceFairIdeasGenerate} isLoading={isLoading} error={error} />;
            case 'SCIENCE_FAIR_IDEAS': return <ScienceFairIdeas ideas={scienceFairIdeas} onSelect={handleSelectScienceFairIdea} userTopic={userScienceFairTopic} />;
            case 'SCIENCE_FAIR_PLAN': return <ScienceFairPlan idea={selectedScienceFairIdea!} plan={scienceFairPlan} />;

            case 'VOICE_TUTOR_SESSION': return <VoiceTutor grade={grade!} topic={topic!} language={language!} onEndSession={resetToHome} />;

            case 'HISTORICAL_SCIENTIST_SELECTION': return <ScientistSelector onScientistSelect={handleScientistSelect} />;
            case 'HISTORICAL_CHAT_SESSION': return <HistoricalChat scientist={selectedScientist!} history={chatHistory} onSendMessage={handleSendHistoricalMessage} isLoading={isLoading} error={error} onCancelGeneration={() => setIsLoading(false)} />;

            default: return <p className="text-center">Oops! Something went wrong. <button onClick={resetToHome} className="text-cyan-400 underline">Go Home</button></p>;
        }
    };
    
    const showHeader = gameState !== 'login' && gameState !== 'register';

    return (
        <React.Suspense fallback={
            <div className="w-full h-screen flex flex-col items-center justify-center">
                <LoadingSpinner />
                <p className="mt-4 text-slate-300">Loading App...</p>
            </div>
        }>
            <main className="bg-slate-950 text-slate-100 min-h-screen font-sans flex flex-col items-center p-4">
                <div className="absolute inset-0 bg-grid-slate-800/[0.2] [mask-image:linear-gradient(to_bottom,white_5%,transparent_90%)]"></div>
                
                {showHeader && (
                    <header className="w-full max-w-screen-2xl mx-auto flex justify-between items-center p-4 sticky top-0 z-50">
                        <button onClick={resetToHome} aria-label="Home" className="p-3 bg-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-full shadow-lg hover:bg-slate-800 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                        </button>
                         <button onClick={handleLogout} aria-label="Logout" className="p-3 bg-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-full shadow-lg hover:bg-slate-800 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                        </button>
                    </header>
                )}

                <div className="relative z-10 w-full flex-grow flex items-center justify-center">
                    {renderContent()}
                </div>
            </main>
        </React.Suspense>
    );
};

export default App;