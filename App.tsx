import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { Grade, Difficulty, QuizQuestion, ChatMessage, Language, NoteSection, AppMode, GenerativeTextResult, ScienceFairIdea, ScienceFairPlanStep, Scientist, User, UserProfile, Flashcard, MysteryState } from './types.ts';
// No longer need to import API_KEY here

// Service Imports
import {
    ApiError, // Import custom error type
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
    live, // Import the live service directly
    getClientSideApiKey,
    generateMysteryStart,
    continueMystery,
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
import ErrorScreen from './components/ErrorScreen.tsx'; // Import new error screen
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

// ApiKeyInstructions is no longer needed


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
        setFlashcards([]);
        setChatHistory([]);
        setGenerativeTextResult(null);
        setScienceLensResult(null);
        setScienceFairIdeas([]);
        setSelectedScienceFairIdea(null);
        setSelectedScientist(null);
        setUserProfile(null);
        setMysteryState(null);
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
        localStorage.setItem('curiosity_current_user', JSON.stringify(user));
        handleUserLoggedIn(user);
        return true;
    };
    
    const handleRegister = async (username: string, password: string) => {
        const user = await register(username, password);
        localStorage.setItem('curiosity_current_user', JSON.stringify(user));
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
        if (['science_lens', 'science_fair_buddy', 'chat_with_history', 'science_game'].includes(mode)) {
            const stateMap: Record<string, string> = {
                'science_lens': 'science_lens',
                'science_fair_buddy': 'science_fair_buddy',
                'chat_with_history': 'HISTORICAL_SCIENTIST_SELECTION',
                'science_game': 'science_game_selection',
            };
            setGameState(stateMap[mode]);
        } else {
            // All other features start by selecting a grade.
            setGameState('GRADE_SELECTION');
        }
    };
    
    const handleGameSelect = (gameMode: AppMode) => {
        setAppMode(gameMode);
        setGameState(gameMode); // e.g., gameState becomes 'game_element_match'
    };

    const