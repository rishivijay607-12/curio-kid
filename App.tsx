import React, { useState, useEffect, useCallback } from 'react';
import type { Grade, Difficulty, QuizQuestion, ChatMessage, Language, NoteSection, AppMode, GenerativeTextResult, DiagramIdea, Diagram, ScienceFairIdea, ScienceFairPlanStep, Scientist } from './types';

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
import { login, register, getCurrentUser, logout, saveQuizScore } from './services/userService';

// Component Imports
import GradeSelector from './components/GradeSelector';
import TopicSelector from './components/TopicSelector';
import DifficultySelector from './components/DifficultySelector';
import QuestionCountSelector from './components/QuestionCountSelector';
import TimerSelector from './components/TimerSelector';
import Quiz from './components/Quiz';
import ScoreScreen from './components/ScoreScreen';
import WorksheetCountSelector from './components/WorksheetCountSelector';
import Worksheet from './components/Worksheet';
import Notes from './components/Notes';
import LanguageSelector from './components/LanguageSelector';
import DoubtSolver from './components/DoubtSolver';
import DiagramIdeaSelector from './components/DiagramIdeaSelector';
import DiagramGenerator from './components/DiagramGenerator';
import GenerativeText from './components/GenerativeText';
import ScienceLens from './components/ScienceLens';
import ScienceFairBuddy from './components/ScienceFairBuddy';
import ScienceFairIdeas from './components/ScienceFairIdeas';
import ScienceFairPlan from './components/ScienceFairPlan';
import VoiceTutor from './components/VoiceTutor';
import ScientistSelector from './components/ScientistSelector';
import HistoricalChat from './components/HistoricalChat';
import LoginScreen from './components/LoginScreen';
import RegistrationScreen from './components/RegistrationScreen';
import Leaderboard from './components/Leaderboard';
import ProfileScreen from './components/ProfileScreen';
import HomeScreen from './components/HomeScreen';

// --- Main App Component ---
const App: React.FC = () => {
    // Authentication State
    const [view, setView] = useState<'login' | 'register' | 'app'>('login');
    const [currentUser, setCurrentUser] = useState<string | null>(null);

    // App State
    const [appMode, setAppMode] = useState<AppMode>('home');
    const [appState, setAppState] = useState<string>('home'); // More granular state for multi-step features
    
    // Config State
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
    const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
    const [worksheetQuestions, setWorksheetQuestions] = useState<QuizQuestion[]>([]);
    const [notes, setNotes] = useState<NoteSection[]>([]);
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [generationProgress, setGenerationProgress] = useState({ current: 0, total: 0 });
    const [lastScore, setLastScore] = useState(0);
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
            setView('app');
        }
    }, []);

    // --- State Resets ---
    const resetToHome = useCallback(() => {
        setAppMode('home');
        setAppState('home');
        setGrade(null);
        setTopic(null);
        setDifficulty(null);
        setQuizLength(null);
        setTimerDuration(null);
        setLanguage(null);
        setError(null);
        setIsLoading(false);
        setQuizQuestions([]);
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
    }, []);

    // --- Handlers ---

    // Auth
    const handleLogin = async (username: string, password: string) => {
        await login(username, password);
        setCurrentUser(username);
        setView('app');
        return true;
    };
    
    const handleRegister = async (username: string, password: string) => {
        await register(username, password);
        await handleLogin(username, password);
        return true;
    };
    
    const handleLogout = () => {
        logout();
        setCurrentUser(null);
        setView('login');
        resetToHome();
    };

    // Navigation
    const handleSelectMode = (mode: AppMode) => {
        resetToHome();
        if (['leaderboard', 'profile', 'science_fair_buddy', 'science_lens', 'chat_with_history'].includes(mode)) {
            setAppMode(mode);
            setAppState(mode);
        } else {
            setAppMode(mode);
            setAppState('selecting_grade');
        }
    };
    
    // Quiz Flow
    const handleQuizEnd = (finalScore: number) => {
        setLastScore(finalScore);
        if (currentUser && quizLength) {
             saveQuizScore({ username: currentUser, score: finalScore, total: quizLength });
        }
        setAppState('quiz_score');
    };
    
    // Worksheet Flow
    const handleWorksheetCountSelect = async (count: number) => {
        if (!topic || !grade || !difficulty) return;
        setIsLoading(true);
        setError(null);
        try {
            const questions = await generateWorksheet(topic, grade, difficulty, count, setGenerationProgress);
            setWorksheetQuestions(questions);
            setAppState('worksheet_display');
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
            setAppState('notes_display');
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
            setChatHistory([{ role: 'model', parts: [{ text: greeting }] }]);
            setAppState('doubt_solver_chat');
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unknown error occurred.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleSendMessage = async (message: string) => {
        if (!grade || !topic || !language) return;
        const newHistory = [...chatHistory, { role: 'user', parts: [{ text: message }] }];
        setChatHistory(newHistory);
        setIsLoading(true);
        setError(null);
        try {
            const response = await getChatResponse(grade, newHistory, language, topic);
            setChatHistory(prev => [...prev, { role: 'model', parts: [{ text: response }] }]);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unknown error occurred.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleScientistSelect = async (scientist: Scientist) => {
        setSelectedScientist(scientist);
        setAppState('historical_chat_active');
        setIsLoading(true);
        try {
            const greeting = await generateScientistGreeting(scientist);
            setChatHistory([{ role: 'model', parts: [{ text: greeting }] }]);
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
            setChatHistory(prev => [...prev, { role: 'model', parts: [{ text: response }] }]);
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
            setAppState('diagram_idea_selection');
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unknown error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleGenerateDiagrams = async (selectedIdeas: DiagramIdea[]) => {
        setAppState('diagram_display');
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
            setAppState('science_fair_ideas');
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unknown error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelectScienceFairIdea = async (idea: ScienceFairIdea) => {
        setSelectedScienceFairIdea(idea);
        setAppState('science_fair_plan');
        setIsLoading(true);
        try {
            const plan = await generateScienceFairPlan(idea.title, idea.description, (progress) => {
                // Could update UI with progress messages here if needed
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
        if (view === 'login') return <LoginScreen onLogin={handleLogin} onNavigateToRegister={() => setView('register')} />;
        if (view === 'register') return <RegistrationScreen onRegister={handleRegister} onNavigateToLogin={() => setView('login')} />;

        if (appState === 'home') return <HomeScreen onSelectMode={handleSelectMode} username={currentUser} onNavigateToProfile={() => handleSelectMode('profile')} onNavigateToLeaderboard={() => handleSelectMode('leaderboard')} />;

        if (appMode === 'profile' && currentUser) return <ProfileScreen username={currentUser} onLogout={handleLogout} onNavigateToLeaderboard={() => handleSelectMode('leaderboard')} />;
        if (appMode === 'leaderboard') return <Leaderboard onBack={resetToHome} currentUser={currentUser} />;

        if (appState === 'selecting_grade') return <GradeSelector onGradeSelect={grade => { setGrade(grade); setAppState('selecting_topic'); }} appMode={appMode} isSolverSetup={appMode === 'doubt_solver'} isLoading={isLoading} error={error} />;
        if (appState === 'selecting_topic') return <TopicSelector onTopicSelect={(t) => {
            setTopic(t);
            if (appMode === 'notes') handleNotesTopicSelect(t);
            else if (appMode === 'diagram') handleDiagramTopicSelect(t);
            else if (appMode === 'doubt_solver' || appMode === 'voice_tutor') setAppState('selecting_language');
            else if (['concept_deep_dive', 'virtual_lab', 'real_world_links', 'story_weaver', 'what_if'].includes(appMode)) setAppState('generative_text_input');
            else setAppState('selecting_difficulty');
        }} grade={grade!} isGenerating={isLoading} error={error} appMode={appMode} isSolverSetup={appMode === 'doubt_solver'} />;

        if (appMode === 'quiz') {
            if (appState === 'selecting_difficulty') return <DifficultySelector onDifficultySelect={d => { setDifficulty(d); setAppState('selecting_count'); }} />;
            if (appState === 'selecting_count') return <QuestionCountSelector onQuestionCountSelect={c => { setQuizLength(c); setAppState('selecting_timer'); }} />;
            if (appState === 'selecting_timer') return <TimerSelector onTimerSelect={d => { setTimerDuration(d); setAppState('quiz_running'); }} />;
            if (appState === 'quiz_running' && topic && grade && difficulty && quizLength !== null && timerDuration !== null) {
                return <Quiz topic={topic} grade={grade} difficulty={difficulty} quizLength={quizLength} timerDuration={timerDuration} onQuizEnd={handleQuizEnd} />;
            }
            if (appState === 'quiz_score') return <ScoreScreen score={lastScore} onRestart={() => setAppState('selecting_difficulty')} quizLength={quizLength!} />;
        }
        
        if (appMode === 'worksheet') {
             if (appState === 'selecting_difficulty') return <DifficultySelector onDifficultySelect={d => { setDifficulty(d); setAppState('selecting_count'); }} />;
             if (appState === 'selecting_count') return <WorksheetCountSelector onCountSelect={handleWorksheetCountSelect} isGenerating={isLoading} error={error} generationProgress={generationProgress} />;
             if (appState === 'worksheet_display') return <Worksheet questions={worksheetQuestions} onRestart={() => setAppState('selecting_difficulty')} grade={grade!} topic={topic!} />;
        }

        if (appMode === 'notes' && appState === 'notes_display') return <Notes notes={notes} onRestart={resetToHome} grade={grade!} topic={topic!} />;
        
        if (appMode === 'doubt_solver') {
            if (appState === 'selecting_language') return <LanguageSelector onLanguageSelect={lang => handleStartChat(topic!, lang)} title="AI Doubt Solver" grade={grade!} topic={topic!} />;
            if (appState === 'doubt_solver_chat') return <DoubtSolver grade={grade!} topic={topic!} history={chatHistory} onSendMessage={handleSendMessage} isLoading={isLoading} error={error} onCancelGeneration={() => setIsLoading(false)} />;
        }
        
        if (appMode === 'diagram') {
            if (appState === 'diagram_idea_selection') return <DiagramIdeaSelector ideas={diagramIdeas} onGenerate={handleGenerateDiagrams} />;
            if (appState === 'diagram_display') return <DiagramGenerator diagrams={diagrams} isGenerating={isLoading} grade={grade!} topic={topic!} onRestart={resetToHome} onCancelGeneration={() => setIsGenerationCancelled(true)} generationProgress={generationProgress} onRegenerate={handleRegenerateDiagram} regeneratingId={regeneratingId} />;
        }
        
        if (['concept_deep_dive', 'virtual_lab', 'real_world_links', 'story_weaver', 'what_if'].includes(appMode)) {
            return <GenerativeText appMode={appMode} grade={grade} topic={topic!} onGenerate={handleGenerateText} isLoading={isLoading} result={generativeTextResult} error={error} />;
        }

        if (appMode === 'science_lens') return <ScienceLens onGenerate={handleScienceLensGenerate} isLoading={isLoading} result={scienceLensResult} error={error} />;
       
        if (appMode === 'science_fair_buddy') {
            if (appState === 'science_fair_buddy') return <ScienceFairBuddy onGenerate={handleScienceFairIdeasGenerate} isLoading={isLoading} error={error} />;
            if (appState === 'science_fair_ideas') return <ScienceFairIdeas ideas={scienceFairIdeas} onSelect={handleSelectScienceFairIdea} userTopic={userScienceFairTopic} />;
            if (appState === 'science_fair_plan') return <ScienceFairPlan idea={selectedScienceFairIdea!} plan={scienceFairPlan} />;
        }
        
        if (appMode === 'voice_tutor') {
            if (appState === 'selecting_language') return <LanguageSelector onLanguageSelect={lang => { setLanguage(lang); setAppState('voice_tutor_active');}} title="Live Voice Tutor" grade={grade!} topic={topic!} />;
            if (appState === 'voice_tutor_active') return <VoiceTutor grade={grade!} topic={topic!} language={language!} onEndSession={resetToHome} />;
        }

        if (appMode === 'chat_with_history') {
            if (appState === 'chat_with_history') return <ScientistSelector onScientistSelect={handleScientistSelect} />;
            if (appState === 'historical_chat_active') return <HistoricalChat scientist={selectedScientist!} history={chatHistory} onSendMessage={handleSendHistoricalMessage} isLoading={isLoading} error={error} onCancelGeneration={() => setIsLoading(false)} />;
        }

        return <p className="text-center">Oops! Something went wrong. <button onClick={resetToHome} className="text-cyan-400 underline">Go Home</button></p>;
    };

    return (
        <main className="bg-slate-950 text-slate-100 min-h-screen font-sans flex items-center justify-center p-4 relative">
            <div className="absolute inset-0 bg-grid-slate-800/[0.2] [mask-image:linear-gradient(to_bottom,white_5%,transparent_90%)]"></div>
            <div className="relative z-10 w-full">
                {renderContent()}
                {appState !== 'home' && view === 'app' &&
                    <button onClick={resetToHome} className="fixed top-4 left-4 px-4 py-2 bg-slate-800 text-slate-300 font-semibold rounded-lg shadow-lg hover:bg-slate-700 transition-colors z-20">
                        &larr; Home
                    </button>
                }
            </div>
        </main>
    );
};

export default App;
