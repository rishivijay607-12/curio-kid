





import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { Grade, Difficulty, QuizQuestion, ChatMessage, Language, NoteSection, AppMode, GenerativeTextResult, DiagramIdea, Diagram, ScienceFairIdea, ScienceFairPlanStep, Scientist, User, UserProfile } from './types.ts';
// No longer need to import API_KEY here

// Service Imports
import {
    ApiError, // Import custom error type
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
    live, // Import the live service directly
    getClientSideApiKey,
} from './services/geminiService.ts';
import { login, register, getCurrentUser, logout, addQuizScore, getProfile } from './services/userService.ts';

// Component Imports
import GradeSelector from './components/GradeSelector.tsx';
import TopicSelector from './components/TopicSelector.tsx';
import DifficultySelector from './components/DifficultySelector.tsx';
import QuestionCountSelector from './components/QuestionCountSelector.tsx';
import TimerSelector from './components/TimerSelector.tsx';
import Quiz from './components/Quiz.tsx';
import ScoreScreen from './components/ScoreScreen.tsx';
import WorksheetCountSelector from './components/WorksheetCountSelector.tsx';
import Worksheet from './components/Worksheet.tsx';
import Notes from './components/Notes.tsx';
import LanguageSelector from './components/LanguageSelector.tsx';
import DoubtSolver from './components/DoubtSolver.tsx';
import DiagramIdeaSelector from './components/DiagramIdeaSelector.tsx';
import DiagramGenerator from './components/DiagramGenerator.tsx';
import GenerativeText from './components/GenerativeText.tsx';
import ScienceLens from './components/ScienceLens.tsx';
import ScienceFairBuddy from './components/ScienceFairBuddy.tsx';
import ScienceFairIdeas from './components/ScienceFairIdeas.tsx';
import ScienceFairPlan from './components/ScienceFairPlan.tsx';
import VoiceTutor from './components/VoiceTutor.tsx';
import ScientistSelector from './components/ScientistSelector.tsx';
import HistoricalChat from './components/HistoricalChat.tsx';
import LoginScreen from './components/LoginScreen.tsx';
import RegistrationScreen from './components/RegistrationScreen.tsx';
import Leaderboard from './components/Leaderboard.tsx';
import ProfileScreen from './components/ProfileScreen.tsx';
import HomeScreen from './components/HomeScreen.tsx';
import AdminPanel from './components/AdminPanel.tsx';
import LoadingSpinner from './components/LoadingSpinner.tsx';
import ErrorScreen from './components/ErrorScreen.tsx'; // Import new error screen
// ApiKeyInstructions is no longer needed


// --- Main App Component ---
const App: React.FC = () => {
    
    // API Key Check is removed from here

    // Game State
    const [gameState, setGameState] = useState<string>('initializing');
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
    const [error, setError] = useState<string | null>(null); // Keep for simple component-level errors
    const [errorDetails, setErrorDetails] = useState<{ code: number; message: string } | null>(null); // For global errors
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
    
    // --- Effects ---
    useEffect(() => {
        try {
            const user = getCurrentUser();
            if (user) {
                setCurrentUser(user);
                setGameState('home');
            } else {
                setGameState('login');
            }
        } catch (e) {
            console.error("Failed to initialize app from local storage:", e);
            setError("Could not access browser storage. Please ensure it's enabled. The app may not work correctly in private/incognito mode.");
            setGameState('login'); // Fallback
        }
    }, []);

    // --- State Resets ---
    const resetAllState = useCallback(() => {
        setAppMode('home');
        setGrade(null);
        setTopic(null);
        setDifficulty(null);
        setQuizLength(null);
        setTimerDuration(null);
        setLanguage(null);
        setError(null);
        setErrorDetails(null);
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
        setSelectedScientist(null);
        setUserProfile(null);
    }, []);

    const resetToHome = useCallback(() => {
        setGameState('home');
        resetAllState();
    }, [resetAllState]);

    // --- Handlers ---

    // Auth & Setup
    const handleUserLoggedIn = (user: User) => {
        setCurrentUser(user);
        setGameState('home');
    };

    const handleLogin = async (username: string, password: string) => {
        const user = await login(username, password);
        handleUserLoggedIn(user);
        return true;
    };
    
    const handleRegister = async (username: string, password: string) => {
        const user = await register(username, password);
        handleUserLoggedIn(user);
        return true;
    };
    
    const handleLogout = () => {
        logout();
        setCurrentUser(null);
        resetAllState();
        setGameState('login');
    };

    // Navigation
    const handleStartFeature = (mode: AppMode) => {
        setAppMode(mode);
        
        // Features that do not require grade/topic selection
        if (mode === 'science_lens') {
            setGameState('science_lens');
        } else if (mode === 'science_fair_buddy') {
            setGameState('science_fair_buddy');
        } else if (mode === 'chat_with_history') {
            setGameState('HISTORICAL_SCIENTIST_SELECTION');
        } else {
            // All other features start by selecting a grade.
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
            CATCH_BLOCK(err);
        } finally {
            setIsLoading(false);
        }
    };

    // Generic error handler to reduce repetition
    const CATCH_BLOCK = (err: unknown) => {
        setIsLoading(false);
        let code = 500;
        let message = "An unexpected error occurred. Please try again.";

        if (err instanceof ApiError) {
            message = err.message;
            code = err.status;
        } else if (err instanceof Error) {
            message = err.message;
        }
        
        console.error(`Caught error (Code: ${code}):`, message);

        // For simple, non-critical errors, we might just set the local error state
        // For critical errors (like 500), we show the global error screen.
        if (code >= 500) {
            setErrorDetails({ code, message });
            setGameState('ERROR_SCREEN');
        } else {
            // Set local error for display on the current screen (e.g., TopicSelector)
            setError(message);
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
            const questions = await generateWorksheet(topic, grade, difficulty, count);
            setWorksheetQuestions(questions);
            setGameState('WORKSHEET_DISPLAY');
        } catch (err) { CATCH_BLOCK(err); }
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
        } catch (err) { CATCH_BLOCK(err); }
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
            const greetingMessage: ChatMessage = { role: 'model', parts: [{ text: greeting }] };
            setChatHistory([greetingMessage]);
            setGameState('DOUBT_SOLVER_SESSION');
        } catch (err) { CATCH_BLOCK(err); }
    };
    
    const handleSendMessage = async (message: string) => {
        if (!grade || !topic || !language) return;
        const userMessage: ChatMessage = { role: 'user', parts: [{ text: message }] };
        const newHistory: ChatMessage[] = [...chatHistory, userMessage];
        setChatHistory(newHistory);
        setIsLoading(true);
        setError(null);
        try {
            const response = await getChatResponse(grade, newHistory, language, topic);
            const modelMessage: ChatMessage = { role: 'model', parts: [{ text: response }] };
            setChatHistory(prev => [...prev, modelMessage]);
        } catch (err) { CATCH_BLOCK(err); } finally { setIsLoading(false); }
    };
    
    const handleScientistSelect = async (scientist: Scientist) => {
        setSelectedScientist(scientist);
        setGameState('HISTORICAL_CHAT_SESSION');
        setIsLoading(true);
        try {
            const greeting = await generateScientistGreeting(scientist);
            const greetingMessage: ChatMessage = { role: 'model', parts: [{ text: greeting }] };
            setChatHistory([greetingMessage]);
        } catch (err) {
            CATCH_BLOCK(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendHistoricalMessage = async (message: string) => {
        if (!selectedScientist) return;
        const userMessage: ChatMessage = { role: 'user', parts: [{ text: message }] };
        const newHistory: ChatMessage[] = [...chatHistory, userMessage];
        setChatHistory(newHistory);
        setIsLoading(true);
        setError(null);
        try {
            const response = await getHistoricalChatResponse(selectedScientist, newHistory);
            const modelMessage: ChatMessage = { role: 'model', parts: [{ text: response }] };
            setChatHistory(prev => [...prev, modelMessage]);
        } catch (err) { CATCH_BLOCK(err); } finally { setIsLoading(false); }
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
        } catch (err) { CATCH_BLOCK(err); }
    };

    const handleGenerateDiagrams = async (selectedIdeas: DiagramIdea[]) => {
        setGameState('DIAGRAM_DISPLAY');
        setIsLoading(true);
        setIsGenerationCancelled(false);
        setGenerationProgress({ current: 0, total: selectedIdeas.length });

        const initialDiagrams: Diagram[] = selectedIdeas.map(idea => ({
            id: idea.id,
            idea,
            status: 'pending',
        }));
        setDiagrams(initialDiagrams);
        
        for (const idea of selectedIdeas) {
            if (isGenerationCancelled) {
                // Mark remaining as skipped/failed if needed, or just stop
                break;
            }
            try {
                const imageBytes = await generateDiagramImage(idea.description);
                setDiagrams(prev => prev.map(d => 
                    d.id === idea.id 
                    ? { ...d, status: 'complete', image: `data:image/png;base64,${imageBytes}` }
                    : d
                ));
            } catch (err) {
                console.error(`Failed to generate image for: ${idea.description}`, err);
                const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
                setDiagrams(prev => prev.map(d =>
                    d.id === idea.id
                    ? { ...d, status: 'failed', error: errorMessage }
                    : d
                ));
            }
            setGenerationProgress(prev => ({ ...prev, current: prev.current + 1 }));
        }
        
        setIsLoading(false);
    };

    const handleRegenerateDiagram = async (diagramId: string) => {
        const diagramToRegen = diagrams.find(d => d.id === diagramId);
        if (!diagramToRegen) return;
        
        setRegeneratingId(diagramId);
        try {
            const imageBytes = await generateDiagramImage(diagramToRegen.idea.description);
            const newImage = `data:image/png;base64,${imageBytes}`;
            setDiagrams(prev => prev.map(d => d.id === diagramId ? { ...d, image: newImage, status: 'complete', error: undefined } : d));
        } catch (err) {
            console.error('Failed to regenerate diagram', err);
            const errorMessage = err instanceof Error ? err.message : "Regeneration failed.";
            setDiagrams(prev => prev.map(d => d.id === diagramId ? { ...d, status: 'failed', error: errorMessage } : d));
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
        } catch (err) { CATCH_BLOCK(err); } finally { setIsLoading(false); }
    };

    const handleScienceLensGenerate = async (base64Image: string, mimeType: string, prompt: string) => {
        setIsLoading(true);
        setError(null);
        setScienceLensResult(null);
        try {
            const result = await explainImageWithText(base64Image, mimeType, prompt);
            setScienceLensResult(result);
        } catch (err) { CATCH_BLOCK(err); } finally { setIsLoading(false); }
    };
    
    const handleScienceFairIdeasGenerate = async (userInput: string) => {
        setIsLoading(true);
        setError(null);
        setUserScienceFairTopic(userInput);
        try {
            const ideas = await generateScienceFairIdeas(userInput);
            setScienceFairIdeas(ideas);
            setGameState('SCIENCE_FAIR_IDEAS');
        } catch (err) { CATCH_BLOCK(err); } finally { setIsLoading(false); }
    };

    const handleSelectScienceFairIdea = (idea: ScienceFairIdea) => {
        setSelectedScienceFairIdea(idea);
        setGameState('SCIENCE_FAIR_PLAN');
    };

    // --- Render Logic ---
    const renderContent = () => {
        if (gameState === 'initializing') {
            return (
                <div className="flex flex-col items-center justify-center">
                    <LoadingSpinner />
                </div>
            );
        }
        
        switch (gameState) {
            case 'login': return <LoginScreen onLogin={handleLogin} onNavigateToRegister={() => setGameState('register')} />;
            case 'register': return <RegistrationScreen onRegister={handleRegister} onNavigateToLogin={() => setGameState('login')} />;
            
            case 'home': return <HomeScreen onStartFeature={handleStartFeature} user={currentUser} onShowProfile={handleShowProfile} onShowLeaderboard={handleShowLeaderboard} onGoToAdminPanel={handleGoToAdminPanel} />;
            case 'PROFILE_SCREEN': return <ProfileScreen userProfile={userProfile} isLoading={isLoading} username={currentUser?.username ?? ''} />;
            case 'LEADERBOARD': return <Leaderboard currentUser={currentUser?.username ?? null} onBack={resetToHome} />;
            case 'ADMIN_PANEL': return <AdminPanel onBack={resetToHome} />;

            case 'ERROR_SCREEN': return <ErrorScreen errorCode={errorDetails?.code ?? 500} errorMessage={errorDetails?.message ?? 'An unknown error occurred.'} onGoHome={resetToHome} />;

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
            }} grade={grade!} isGenerating={isLoading} error={error} appMode={appMode} isSolverSetup={['doubt_solver', 'voice_tutor'].includes(appMode)} />;
            
            case 'DIFFICULTY_SELECTION': return <DifficultySelector onDifficultySelect={d => { setDifficulty(d); setGameState('COUNT_SELECTION'); }} />;
            
            case 'COUNT_SELECTION':
                if (appMode === 'quiz') return <QuestionCountSelector onQuestionCountSelect={c => { setQuizLength(c); setGameState('TIMER_SELECTION'); }} />;
                if (appMode === 'worksheet') return <WorksheetCountSelector onCountSelect={handleWorksheetCountSelect} isGenerating={isLoading} error={error} />;
                return null;
            
            case 'TIMER_SELECTION': return <TimerSelector onTimerSelect={d => { setTimerDuration(d); setGameState('QUIZ_RUNNING'); }} />;
            case 'QUIZ_RUNNING': return <Quiz topic={topic!} grade={grade!} difficulty={difficulty!} quizLength={quizLength!} timerDuration={timerDuration!} onQuizEnd={handleQuizEnd} />;
            case 'SCORE_SCREEN': return <ScoreScreen score={lastScore} onRestart={() => setGameState('DIFFICULTY_SELECTION')} quizLength={quizLength!} />;
            
            case 'WORKSHEET_DISPLAY': return <Worksheet questions={worksheetQuestions} onRestart={() => setGameState('DIFFICULTY_SELECTION')} grade={grade!} topic={topic!} />;
            case 'NOTES_DISPLAY': return <Notes notes={notes} onRestart={resetToHome} grade={grade!} topic={topic!} />;
           
            case 'LANGUAGE_SELECTION': return <LanguageSelector onLanguageSelect={lang => {
                setLanguage(lang);
                if(appMode === 'doubt_solver') handleStartChat(topic!, lang);
                else setGameState('VOICE_Tutor_SESSION');
            }} title={appMode === 'voice_tutor' ? "AI Voice Tutor" : "AI Doubt Solver"} grade={grade!} topic={topic!} />;

            case 'DOUBT_SOLVER_SESSION': return <DoubtSolver grade={grade!} topic={topic!} history={chatHistory} onSendMessage={handleSendMessage} isLoading={isLoading} error={error} onCancelGeneration={() => setIsLoading(false)} />;
            
            case 'DIAGRAM_IDEA_SELECTION': return <DiagramIdeaSelector ideas={diagramIdeas} onGenerate={handleGenerateDiagrams} />;
            case 'DIAGRAM_DISPLAY': return <DiagramGenerator diagrams={diagrams} isGenerating={isLoading} grade={grade!} topic={topic!} onRestart={resetToHome} onCancelGeneration={() => setIsGenerationCancelled(true)} generationProgress={generationProgress} onRegenerate={handleRegenerateDiagram} regeneratingId={regeneratingId} />;
            
            case 'generative_text_input': return <GenerativeText appMode={appMode} grade={grade} topic={topic!} onGenerate={handleGenerateText} isLoading={isLoading} result={generativeTextResult} error={error} />;
            
            case 'science_lens': return <ScienceLens onGenerate={handleScienceLensGenerate} isLoading={isLoading} result={scienceLensResult} error={error} />;
           
            case 'science_fair_buddy': return <ScienceFairBuddy onGenerate={handleScienceFairIdeasGenerate} isLoading={isLoading} error={error} />;
            case 'SCIENCE_FAIR_IDEAS': return <ScienceFairIdeas ideas={scienceFairIdeas} onSelect={handleSelectScienceFairIdea} userTopic={userScienceFairTopic} />;
            case 'SCIENCE_FAIR_PLAN': return <ScienceFairPlan idea={selectedScienceFairIdea!} onRestart={resetToHome} />;

            case 'VOICE_TUTOR_SESSION': return <VoiceTutor grade={grade!} topic={topic!} language={language!} onEndSession={resetToHome} />;

            case 'HISTORICAL_SCIENTIST_SELECTION': return <ScientistSelector onScientistSelect={handleScientistSelect} />;
            case 'HISTORICAL_CHAT_SESSION': return <HistoricalChat scientist={selectedScientist!} history={chatHistory} onSendMessage={handleSendHistoricalMessage} isLoading={isLoading} error={error} onCancelGeneration={() => setIsLoading(false)} />;

            default: return <ErrorScreen errorCode={404} errorMessage={`The application state "${gameState}" does not exist.`} onGoHome={resetToHome} />;
        }
    };
    
    const showHeader = !['login', 'register', 'initializing', 'ERROR_SCREEN'].includes(gameState);

    return (
        <main className="bg-slate-950 text-slate-100 min-h-screen font-sans flex flex-col items-center p-4">
            <div className="absolute inset-0 bg-grid-pattern [mask-image:linear-gradient(to_bottom,white_5%,transparent_90%)]"></div>
            
            {showHeader && (
                <header className="w-full max-w-screen-2xl mx-auto flex justify-between items-center p-4 sticky top-0 z-50">
                    <button onClick={resetToHome} aria-label="Home" className="p-3 bg-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-full shadow-lg hover:bg-slate-800 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-200" fill="none" viewBox="0 0 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                    </button>
                     <button onClick={handleLogout} aria-label="Logout" className="p-3 bg-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-full shadow-lg hover:bg-slate-800 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-200" fill="none" viewBox="0 0 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                    </button>
                </header>
            )}

            <div className="relative z-10 w-full flex-grow flex items-center justify-center">
                {renderContent()}
            </div>
        </main>
    );
};

export default App;