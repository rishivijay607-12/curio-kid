





import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { Grade, Difficulty, QuizQuestion, ChatMessage, Language, NoteSection, AppMode, GenerativeTextResult, ScienceFairIdea, ScienceFairPlanStep, Scientist, User, UserProfile, Flashcard, MysteryState, MultiplayerGameState } from './types.ts';

// Service Imports
import {
    ApiError,
    generateQuizQuestions,
    generateWorksheet,
    generateNotes,
    generateFlashcards,
    generateGreeting,
    getChatResponse,
    generateTextForMode,
    explainImageWithText,
    generateScienceFairIdeas,
    generateScienceFairPlan,
    generateScientistGreeting,
    getHistoricalChatResponse,
    live,
    getClientSideApiKey,
    generateMysteryStart,
    continueMystery,
} from './services/geminiService.ts';
import { login, register, getCurrentUser, logout, addQuizScore, getProfile } from './services/userService.ts';
import * as multiplayerService from './services/multiplayerService.ts';

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
import Flashcards from './components/Flashcards.tsx';
import LanguageSelector from './components/LanguageSelector.tsx';
import DoubtSolver from './components/DoubtSolver.tsx';
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
import ErrorScreen from './components/ErrorScreen.tsx';
import GameSelectionScreen from './components/GameSelectionScreen.tsx';
import ElementMatchGame from './components/ElementMatchGame.tsx';
import LabSafetyGame from './components/LabSafetyGame.tsx';
import PlanetLineupGame from './components/PlanetLineupGame.tsx';
import StateOfMatterGame from './components/StateOfMatterGame.tsx';
import ScientificMethodGame from './components/ScientificMethodGame.tsx';
import FoodChainGame from './components/FoodChainGame.tsx';
import InventionTimelineGame from './components/InventionTimelineGame.tsx';
import ScientistMatchGame from './components/ScientistMatchGame.tsx';
import ScienceRiddlesGame from './components/ScienceRiddlesGame.tsx';
import AnimalKingdomGame from './components/AnimalKingdomGame.tsx';
import LabToolMatchGame from './components/LabToolMatchGame.tsx';
import AnatomyQuizGame from './components/AnatomyQuizGame.tsx';
import TicTacToeGame from './components/TicTacToeGame.tsx';
import MysteryOfScienceGame from './components/MysteryOfScienceGame.tsx';
import MultiplayerHomeScreen from './components/MultiplayerHomeScreen.tsx';
import MultiplayerLobby from './components/MultiplayerLobby.tsx';
import MultiplayerQuiz from './components/MultiplayerQuiz.tsx';
import MultiplayerRoundLeaderboard from './components/MultiplayerRoundLeaderboard.tsx';
import MultiplayerFinalScore from './components/MultiplayerFinalScore.tsx';

// --- App Logo Icon ---
const IconLogo: React.FC = () => (
    <svg className="h-6 w-6 text-cyan-400" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="32" cy="19" r="10" stroke="currentColor" strokeWidth="4"/>
        <circle cx="45" cy="32" r="10" stroke="currentColor" strokeWidth="4"/>
        <circle cx="32" cy="45" r="10" stroke="currentColor" strokeWidth="4"/>
        <circle cx="19" cy="32" r="10" stroke="currentColor" strokeWidth="4"/>
    </svg>
);

// --- Home Icon ---
const IconHome: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
);

// --- Main App Component ---
const App: React.FC = () => {
    // Overall App State
    const [gameState, setGameState] = useState<string>('initializing');
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

    // Feature Configuration State
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
    const [errorDetails, setErrorDetails] = useState<{ code: number; message: string } | null>(null);
    const [lastScore, setLastScore] = useState(0);
    const [lastQuizActualLength, setLastQuizActualLength] = useState(0);
    const [worksheetQuestions, setWorksheetQuestions] = useState<QuizQuestion[]>([]);
    const [notes, setNotes] = useState<NoteSection[]>([]);
    const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [generativeTextResult, setGenerativeTextResult] = useState<GenerativeTextResult | null>(null);
    const [scienceLensResult, setScienceLensResult] = useState<string | null>(null);
    const [scienceFairIdeas, setScienceFairIdeas] = useState<ScienceFairIdea[]>([]);
    const [selectedScienceFairIdea, setSelectedScienceFairIdea] = useState<ScienceFairIdea | null>(null);
    const [mysteryState, setMysteryState] = useState<MysteryState | null>(null);
    const [multiplayerGameData, setMultiplayerGameData] = useState<MultiplayerGameState | null>(null);
    const generationController = useRef<AbortController | null>(null);
    const multiplayerPollingInterval = useRef<number | null>(null);
    

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
            setError("Could not access browser storage. Please ensure it's enabled.");
            setGameState('login');
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
        setFlashcards([]);
        setChatHistory([]);
        setGenerativeTextResult(null);
        setScienceLensResult(null);
        setScienceFairIdeas([]);
        setSelectedScienceFairIdea(null);
        setSelectedScientist(null);
        setUserProfile(null);
        setMysteryState(null);
        setMultiplayerGameData(null);
    }, []);

    const resetToHome = useCallback(() => {
        setGameState('home');
        resetAllState();
    }, [resetAllState]);

    const handleGlobalError = (err: unknown) => {
        const code = err instanceof ApiError ? err.status : 500;
        const message = err instanceof Error ? err.message : "An unknown error occurred.";
        setErrorDetails({ code, message });
        setGameState('error');
    };

    // --- Generic API Call Wrapper ---
    const handleApiCall = async <T,>(apiCall: () => Promise<T>, onSuccess: (result: T) => void, customLoading = true) => {
        if (customLoading) setIsLoading(true);
        setError(null);
        try {
            const result = await apiCall();
            onSuccess(result);
        } catch (err) {
            handleGlobalError(err);
        } finally {
            if (customLoading) setIsLoading(false);
        }
    };
    
    // --- Auth & Setup Handlers ---
    const handleLogin = async (username: string, password: string) => {
        const user = await login(username, password);
        localStorage.setItem('curiosity_current_user', JSON.stringify(user));
        setCurrentUser(user);
        setGameState('home');
    };
    
    const handleRegister = async (username: string, password: string) => {
        const user = await register(username, password);
        localStorage.setItem('curiosity_current_user', JSON.stringify(user));
        setCurrentUser(user);
        setGameState('home');
    };
    
    const handleLogout = () => {
        logout();
        setCurrentUser(null);
        resetAllState();
        setGameState('login');
    };

    // --- Navigation Handlers ---
    const handleStartFeature = (mode: AppMode) => {
        setAppMode(mode);
        const directFeatures: Record<string, string> = {
            'science_lens': 'science_lens', 'science_fair_buddy': 'science_fair_buddy',
            'chat_with_history': 'HISTORICAL_SCIENTIST_SELECTION', 'science_game': 'science_game_selection',
            'profile': 'profile', 'leaderboard': 'leaderboard', 'admin_panel': 'admin_panel',
            'multiplayer_quiz': 'MULTIPLAYER_HOME',
        };
        if (directFeatures[mode]) {
            setGameState(directFeatures[mode]);
        } else {
            setGameState('GRADE_SELECTION');
        }
    };
    
    const handleGameSelect = (gameMode: AppMode) => { setAppMode(gameMode); setGameState(gameMode); };
    const handleGradeSelect = (g: Grade) => { setGrade(g); setGameState('TOPIC_SELECTION'); };
    const handleTopicSelect = (t: string) => { setTopic(t);
        const nextStateMap: Record<string, string> = {
            'quiz': 'DIFFICULTY_SELECTION', 'worksheet': 'DIFFICULTY_SELECTION', 'notes': 'GENERATING_NOTES',
            'flashcards': 'GENERATING_FLASHCARDS', 'doubt_solver': 'LANGUAGE_SELECTION', 'voice_tutor': 'LANGUAGE_SELECTION',
            'concept_deep_dive': 'GENERATIVE_TEXT_INPUT', 'virtual_lab': 'GENERATIVE_TEXT_INPUT',
            'real_world_links': 'GENERATIVE_TEXT_INPUT', 'story_weaver': 'GENERATIVE_TEXT_INPUT',
            'what_if': 'GENERATIVE_TEXT_INPUT', 'mystery_of_science': 'GENERATING_MYSTERY',
        };
        if (nextStateMap[appMode]) setGameState(nextStateMap[appMode]);
    };
    const handleDifficultySelect = (d: Difficulty) => { setDifficulty(d);
        if (appMode === 'quiz') setGameState('QUESTION_COUNT_SELECTION');
        else if (appMode === 'worksheet') setGameState('WORKSHEET_COUNT_SELECTION');
    };
    const handleQuestionCountSelect = (c: number) => { setQuizLength(c); setGameState('TIMER_SELECTION'); };
    const handleTimerSelect = (d: number) => { setTimerDuration(d); setGameState('QUIZ'); };
    const handleWorksheetCountSelect = (c: number) => { setQuizLength(c); setGameState('GENERATING_WORKSHEET'); };
    const handleLanguageSelect = (l: Language) => { setLanguage(l);
        if (appMode === 'doubt_solver') setGameState('GENERATING_GREETING');
        else if (appMode === 'voice_tutor') setGameState('VOICE_TUTOR');
    };
    const handleScientistSelect = (s: Scientist) => { setSelectedScientist(s); setGameState('GENERATING_GREETING'); };

    // --- Feature-Specific Handlers ---
    const handleQuizEnd = (score: number, actualLength: number) => {
        setLastScore(score); setLastQuizActualLength(actualLength);
        if (currentUser) { addQuizScore(currentUser.username, score, actualLength).catch(console.error); }
        setGameState('SCORE');
    };

    const handleSendMessage = async (message: string) => {
        const newUserMessage: ChatMessage = { role: 'user', parts: [{ text: message }] };
        const newHistory = [...chatHistory, newUserMessage];
        setChatHistory(newHistory);
        setIsLoading(true);
        setError(null);
        try {
            generationController.current = new AbortController();
            const apiCall = appMode === 'chat_with_history'
                ? getHistoricalChatResponse(selectedScientist!, newHistory)
                : getChatResponse(grade!, newHistory, language!, topic!);
            const responseText = await apiCall;
            setChatHistory(prev => [...prev, { role: 'model', parts: [{ text: responseText }] }]);
        } catch (err) {
            handleGlobalError(err);
        } finally {
            setIsLoading(false);
        }
    };
    const handleCancelGeneration = () => { generationController.current?.abort(); setIsLoading(false); };

    // --- Multiplayer Handlers ---
    const handleCreateGame = async (isPublic: boolean) => {
        const data = await multiplayerService.createGame(currentUser!.username, isPublic);
        setMultiplayerGameData(data);
    };
    const handleJoinGame = async (gameId: string) => {
        const data = await multiplayerService.joinGame(gameId, currentUser!.username);
        setMultiplayerGameData(data);
    };
    const handleStartGame = async (gameId: string, grade: Grade, topic: string, quizLength: number) => {
        const data = await multiplayerService.startGame(gameId, grade, topic, quizLength);
        setMultiplayerGameData(data);
    };
    const handleSubmitAnswer = async (gameId: string, questionIndex: number, answer: string, timeTaken: number) => {
        await multiplayerService.submitAnswer(gameId, currentUser!.username, questionIndex, answer, timeTaken);
        // Optimistically update local state
        setMultiplayerGameData(prev => {
            if (!prev) return null;
            const newPlayers = prev.players.map(p => p.username === currentUser!.username ? { ...p, answeredThisRound: true } : p);
            return { ...prev, players: newPlayers };
        });
    };
    const handleNextQuestion = async (gameId: string) => {
        const data = await multiplayerService.nextQuestion(gameId);
        setMultiplayerGameData(data);
    };
    
    // --- Data Fetching Effects ---
    useEffect(() => {
        if (gameState === 'GENERATING_NOTES' && topic && grade) {
            handleApiCall(() => generateNotes(topic, grade), (data) => { setNotes(data); setGameState('NOTES_DISPLAY'); });
        } else if (gameState === 'GENERATING_FLASHCARDS' && topic && grade) {
            handleApiCall(() => generateFlashcards(topic, grade), (data) => { setFlashcards(data); setGameState('FLASHCARDS_DISPLAY'); });
        } else if (gameState === 'GENERATING_WORKSHEET' && topic && grade && difficulty && quizLength) {
            handleApiCall(() => generateWorksheet(topic, grade, difficulty, quizLength), (data) => { setWorksheetQuestions(data); setGameState('WORKSHEET_DISPLAY'); });
        } else if (gameState === 'GENERATING_GREETING' && (topic || selectedScientist)) {
            const apiCall = () => appMode === 'chat_with_history' ? generateScientistGreeting(selectedScientist!) : generateGreeting(grade!, language!, topic!);
            handleApiCall(apiCall, (greeting) => {
                setChatHistory([{ role: 'model', parts: [{ text: greeting }] }]);
                setGameState(appMode === 'chat_with_history' ? 'HISTORICAL_CHAT' : 'DOUBT_SOLVER');
            });
        } else if (gameState === 'profile' && currentUser && !userProfile) {
            handleApiCall(() => getProfile(currentUser.username), setUserProfile);
        } else if (gameState === 'GENERATING_MYSTERY' && topic && grade) {
            handleApiCall(() => generateMysteryStart(topic, grade), (data) => { setMysteryState(data); setGameState('mystery_of_science'); });
        }
    }, [gameState, topic, grade, difficulty, quizLength, language, appMode, selectedScientist, currentUser, userProfile]);

    // --- Multiplayer Polling & State Sync ---
    useEffect(() => {
        const pollGameState = async () => {
            if (!multiplayerGameData?.gameId) return;
            try {
                const updatedState = await multiplayerService.getGameState(multiplayerGameData.gameId);
                if (updatedState) setMultiplayerGameData(updatedState);
                else handleGlobalError(new multiplayerService.ApiError("The game session could not be found. It may have expired.", 404));
            } catch (err) { console.error("Polling error:", err); }
        };

        if (multiplayerGameData) {
            let interval = 4000;
            if (multiplayerGameData.status === 'in_progress' || multiplayerGameData.status === 'round_over') interval = 2000;
            if (multiplayerGameData.status !== 'finished') {
                multiplayerPollingInterval.current = window.setInterval(pollGameState, interval);
            }
        }
        return () => { if (multiplayerPollingInterval.current) clearInterval(multiplayerPollingInterval.current); };
    }, [multiplayerGameData?.gameId]);

    useEffect(() => {
        if (!multiplayerGameData) return;
        switch (multiplayerGameData.status) {
            case 'lobby': setGameState('MULTIPLAYER_LOBBY'); break;
            case 'in_progress': setGameState('MULTIPLAYER_QUIZ'); break;
            case 'round_over': setGameState('MULTIPLAYER_ROUND_OVER'); break;
            case 'finished': setGameState('MULTIPLAYER_FINISHED'); break;
        }
    }, [multiplayerGameData?.status]);


    const handleGenerativeText = (input: string) => handleApiCall(() => generateTextForMode(appMode, input, grade, topic), (data) => { setGenerativeTextResult(data); });
    const handleScienceLens = (img: string, mime: string, p: string) => handleApiCall(() => explainImageWithText(img, mime, p), setScienceLensResult);
    const handleScienceFairIdeas = (input: string) => { setUserScienceFairTopic(input); handleApiCall(() => generateScienceFairIdeas(input), (data) => { setScienceFairIdeas(data); setGameState('SCIENCE_FAIR_IDEAS'); }); };
    const handleScienceFairIdeaSelect = (idea: ScienceFairIdea) => { setSelectedScienceFairIdea(idea); setGameState('SCIENCE_FAIR_PLAN'); };
    const handleMysteryChoice = (choice: string) => handleApiCall(() => continueMystery(topic!, grade!, mysteryState!.story, choice), setMysteryState);

    // --- Content Rendering Logic ---
    const renderContent = () => {
        if (gameState === 'error' && errorDetails) return <ErrorScreen errorCode={errorDetails.code} errorMessage={errorDetails.message} onGoHome={resetToHome} />;
        if (gameState === 'initializing') return <div className="flex justify-center items-center h-screen"><LoadingSpinner /></div>;
        if (gameState === 'login') return <LoginScreen onLogin={handleLogin} onNavigateToRegister={() => setGameState('register')} />;
        if (gameState === 'register') return <RegistrationScreen onRegister={handleRegister} onNavigateToLogin={() => setGameState('login')} />;
        if (!currentUser) return <LoginScreen onLogin={handleLogin} onNavigateToRegister={() => setGameState('register')} />;

        switch (gameState) {
            case 'home': return <HomeScreen onStartFeature={handleStartFeature} user={currentUser} onShowProfile={() => setGameState('profile')} onShowLeaderboard={() => setGameState('leaderboard')} onGoToAdminPanel={() => setGameState('admin_panel')} />;
            case 'GRADE_SELECTION': return <GradeSelector onGradeSelect={handleGradeSelect} appMode={appMode} isSolverSetup={false} isLoading={false} error={null} />;
            
            case 'TOPIC_SELECTION':
            case 'GENERATING_NOTES':
            case 'GENERATING_FLASHCARDS':
            case 'GENERATING_MYSTERY':
                return <TopicSelector onTopicSelect={handleTopicSelect} grade={grade!} isGenerating={isLoading} error={error} appMode={appMode} />;

            case 'DIFFICULTY_SELECTION': return <DifficultySelector onDifficultySelect={handleDifficultySelect} />;
            case 'QUESTION_COUNT_SELECTION': return <QuestionCountSelector onQuestionCountSelect={handleQuestionCountSelect} />;
            case 'TIMER_SELECTION': return <TimerSelector onTimerSelect={handleTimerSelect} />;
            case 'QUIZ': return <Quiz topic={topic!} grade={grade!} difficulty={difficulty!} quizLength={quizLength!} timerDuration={timerDuration!} onQuizEnd={handleQuizEnd} />;
            case 'SCORE': return <ScoreScreen score={lastScore} onRestart={() => setGameState('TOPIC_SELECTION')} quizLength={lastQuizActualLength} />;
            
            case 'WORKSHEET_COUNT_SELECTION':
            case 'GENERATING_WORKSHEET':
                return <WorksheetCountSelector onCountSelect={handleWorksheetCountSelect} isGenerating={isLoading} error={error} />;

            case 'WORKSHEET_DISPLAY': return <Worksheet questions={worksheetQuestions} onRestart={() => setGameState('TOPIC_SELECTION')} grade={grade!} topic={topic!} />;
            case 'NOTES_DISPLAY': return <Notes notes={notes} onRestart={() => setGameState('TOPIC_SELECTION')} grade={grade!} topic={topic!} />;
            case 'FLASHCARDS_DISPLAY': return <Flashcards flashcards={flashcards} onRestart={() => setGameState('TOPIC_SELECTION')} grade={grade!} topic={topic!} />;
            
            case 'LANGUAGE_SELECTION':
            case 'GENERATING_GREETING':
                return <LanguageSelector onLanguageSelect={handleLanguageSelect} title="AI Doubt Solver" grade={grade!} topic={topic!} isLoading={isLoading} error={error} />;
            
            case 'DOUBT_SOLVER': return <DoubtSolver grade={grade!} topic={topic!} history={chatHistory} onSendMessage={handleSendMessage} isLoading={isLoading} error={error} onCancelGeneration={handleCancelGeneration} />;
            case 'VOICE_TUTOR': return <VoiceTutor grade={grade!} topic={topic!} language={language!} onEndSession={resetToHome} />;
            case 'GENERATIVE_TEXT_INPUT': return <GenerativeText appMode={appMode} grade={grade} topic={topic!} onGenerate={handleGenerativeText} isLoading={isLoading} result={generativeTextResult} error={error} />;
            case 'science_lens': return <ScienceLens onGenerate={handleScienceLens} isLoading={isLoading} result={scienceLensResult} error={error} />;
            case 'science_fair_buddy': return <ScienceFairBuddy onGenerate={handleScienceFairIdeas} isLoading={isLoading} error={error} />;
            case 'SCIENCE_FAIR_IDEAS': return <ScienceFairIdeas ideas={scienceFairIdeas} onSelect={handleScienceFairIdeaSelect} userTopic={userScienceFairTopic} />;
            case 'SCIENCE_FAIR_PLAN': return <ScienceFairPlan idea={selectedScienceFairIdea!} onRestart={() => setGameState('science_fair_buddy')} />;
            case 'HISTORICAL_SCIENTIST_SELECTION': return <ScientistSelector onScientistSelect={handleScientistSelect} />;
            case 'HISTORICAL_CHAT': return <HistoricalChat scientist={selectedScientist!} history={chatHistory} onSendMessage={handleSendMessage} isLoading={isLoading} error={error} onCancelGeneration={handleCancelGeneration} />;
            case 'profile': return <ProfileScreen userProfile={userProfile} isLoading={isLoading} username={currentUser.username} />;
            case 'leaderboard': return <Leaderboard onBack={resetToHome} currentUser={currentUser.username} />;
            case 'admin_panel': return <AdminPanel onBack={resetToHome} />;
            case 'science_game_selection': return <GameSelectionScreen onGameSelect={handleGameSelect} />;
            case 'game_element_match': return <ElementMatchGame onEnd={() => setGameState('science_game_selection')} />;
            case 'game_lab_safety': return <LabSafetyGame onEnd={() => setGameState('science_game_selection')} />;
            case 'game_planet_lineup': return <PlanetLineupGame onEnd={() => setGameState('science_game_selection')} />;
            case 'game_state_of_matter': return <StateOfMatterGame onEnd={() => setGameState('science_game_selection')} />;
            case 'game_scientific_method': return <ScientificMethodGame onEnd={() => setGameState('science_game_selection')} />;
            case 'game_food_chain': return <FoodChainGame onEnd={() => setGameState('science_game_selection')} />;
            case 'game_invention_timeline': return <InventionTimelineGame onEnd={() => setGameState('science_game_selection')} />;
            case 'game_scientist_match': return <ScientistMatchGame onEnd={() => setGameState('science_game_selection')} />;
            case 'game_science_riddles': return <ScienceRiddlesGame onEnd={() => setGameState('science_game_selection')} />;
            case 'game_animal_kingdom': return <AnimalKingdomGame onEnd={() => setGameState('science_game_selection')} />;
            case 'game_lab_tool_match': return <LabToolMatchGame onEnd={() => setGameState('science_game_selection')} />;
            case 'game_anatomy_quiz': return <AnatomyQuizGame onEnd={() => setGameState('science_game_selection')} />;
            case 'game_tic_tac_toe': return <TicTacToeGame onEnd={() => setGameState('science_game_selection')} />;
            case 'mystery_of_science': return <MysteryOfScienceGame mystery={mysteryState!} onChoiceSelect={handleMysteryChoice} isLoading={isLoading} onRestart={() => setGameState('TOPIC_SELECTION')} grade={grade!} topic={topic!} />;

            // Multiplayer states
            case 'MULTIPLAYER_HOME': return <MultiplayerHomeScreen onCreateGame={handleCreateGame} onJoinGame={handleJoinGame} />;
            case 'MULTIPLAYER_LOBBY': return <MultiplayerLobby gameData={multiplayerGameData!} currentUser={currentUser.username} onStartGame={handleStartGame} />;
            case 'MULTIPLAYER_QUIZ': return <MultiplayerQuiz gameData={multiplayerGameData!} currentUser={currentUser.username} onSubmitAnswer={handleSubmitAnswer} />;
            case 'MULTIPLAYER_ROUND_OVER': return <MultiplayerRoundLeaderboard gameData={multiplayerGameData!} currentUser={currentUser.username} onNextQuestion={handleNextQuestion} />;
            case 'MULTIPLAYER_FINISHED': return <MultiplayerFinalScore gameData={multiplayerGameData!} onExit={resetToHome} />;
            
            default: return <HomeScreen onStartFeature={handleStartFeature} user={currentUser} onShowProfile={() => setGameState('profile')} onShowLeaderboard={() => setGameState('leaderboard')} onGoToAdminPanel={() => setGameState('admin_panel')} />;
        }
    };

    const showHeader = !['login', 'register', 'initializing', 'error'].includes(gameState);

    return (
        <div className="bg-slate-950 text-slate-100 min-h-screen font-sans bg-grid-pattern">
            {showHeader && (
                <header className="p-4 flex justify-between items-center bg-slate-950/50 backdrop-blur-sm border-b border-slate-800 sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <IconLogo />
                        <span className="text-xl font-bold text-slate-200 hidden sm:inline">The Book of Curiosity</span>
                    </div>
                    <div className="flex items-center gap-4">
                        {gameState !== 'home' && (
                            <button onClick={resetToHome} className="p-2 rounded-full hover:bg-slate-800 transition-colors" aria-label="Go to home screen">
                                <IconHome />
                            </button>
                        )}
                        <span className="font-semibold text-slate-300 hidden md:inline">Welcome, {currentUser?.username}</span>
                        <button onClick={handleLogout} className="px-4 py-2 text-sm bg-slate-800 text-slate-200 font-semibold rounded-lg hover:bg-slate-700 transition-colors shadow">
                            Logout
                        </button>
                    </div>
                </header>
            )}
            <main className="p-4 md:p-8 flex items-center justify-center">
                {renderContent()}
            </main>
        </div>
    );
};

export default App;