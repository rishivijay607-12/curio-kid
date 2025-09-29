import React, { useState, useRef, Suspense } from 'react';
import { GameState } from './types';
import type { Grade, Difficulty, AppMode, QuizQuestion, ChatMessage, Language, NoteSection, Diagram, DiagramIdea, GenerativeTextResult } from './types';
import HomeScreen from './components/HomeScreen';
import LoadingSpinner from './components/LoadingSpinner';
import { generateWorksheet, generateNotes, getChatResponse, generateGreeting, generateDiagramIdeas, generateDiagramImage, generateTextForMode, explainImageWithText } from './services/geminiService';

// Lazy-loaded components for code-splitting
const LoginScreen = React.lazy(() => import('./components/LoginScreen'));
const GradeSelector = React.lazy(() => import('./components/GradeSelector'));
const LanguageSelector = React.lazy(() => import('./components/LanguageSelector'));
const TopicSelector = React.lazy(() => import('./components/TopicSelector'));
const DifficultySelector = React.lazy(() => import('./components/DifficultySelector'));
const QuestionCountSelector = React.lazy(() => import('./components/QuestionCountSelector'));
const TimerSelector = React.lazy(() => import('./components/TimerSelector'));
const Quiz = React.lazy(() => import('./components/Quiz'));
const ScoreScreen = React.lazy(() => import('./components/ScoreScreen'));
const Worksheet = React.lazy(() => import('./components/Worksheet'));
const Notes = React.lazy(() => import('./components/Notes'));
const WorksheetCountSelector = React.lazy(() => import('./components/WorksheetCountSelector'));
const DoubtSolver = React.lazy(() => import('./components/DoubtSolver'));
const DiagramIdeaSelector = React.lazy(() => import('./components/DiagramIdeaSelector'));
const DiagramGenerator = React.lazy(() => import('./components/DiagramGenerator'));
const GenerativeText = React.lazy(() => import('./components/GenerativeText'));
const ScienceLens = React.lazy(() => import('./components/ScienceLens'));
const VoiceTutor = React.lazy(() => import('./components/VoiceTutor'));


const HomeButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <button
    onClick={onClick}
    className="absolute top-4 left-4 z-10 p-3 bg-slate-700/50 text-slate-300 rounded-full shadow-lg hover:bg-slate-600 hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-opacity-75 no-print"
    aria-label="Go to Home"
  >
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  </button>
);

const SuspenseLoader: React.FC = () => (
  <div className="flex justify-center items-center py-20">
    <LoadingSpinner />
  </div>
);


const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.LOGIN_SCREEN);
  const [username, setUsername] = useState<string>('');
  const [appMode, setAppMode] = useState<AppMode>('quiz');
  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(null);
  const [quizLength, setQuizLength] = useState<number>(5);
  const [timerDuration, setTimerDuration] = useState<number>(0);
  const [finalScore, setFinalScore] = useState<number>(0);
  const [finalQuizLength, setFinalQuizLength] = useState<number>(0);
  const [worksheetQuestions, setWorksheetQuestions] = useState<QuizQuestion[] | null>(null);
  const [generatedNotes, setGeneratedNotes] = useState<NoteSection[] | null>(null);
  const [diagramIdeas, setDiagramIdeas] = useState<DiagramIdea[]>([]);
  const [generatedDiagrams, setGeneratedDiagrams] = useState<Diagram[]>([]);
  const [regeneratingDiagramId, setRegeneratingDiagramId] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [generativeTextResult, setGenerativeTextResult] = useState<GenerativeTextResult | null>(null);
  const [scienceLensResult, setScienceLensResult] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const generationCancelledRef = useRef(false);
  const [generationProgress, setGenerationProgress] = useState({ current: 0, total: 0 });

  // --- Navigation and Mode Setting ---
  const startFeature = (mode: AppMode) => {
      setAppMode(mode);
      setGameState(GameState.GRADE_SELECTION);
  };
  
  const handleStartDoubtSolver = () => {
    setGameState(GameState.LANGUAGE_SELECTION);
  };
  
  const handleStartVoiceTutor = () => {
    setAppMode('voice_tutor');
    setGameState(GameState.GRADE_SELECTION);
  };

  const handleStartScienceLens = () => {
      setAppMode('science_lens');
      setScienceLensResult(null);
      setError(null);
      setGameState(GameState.SCIENCE_LENS_INPUT);
  };

  const handleStartGenerativeFeature = (mode: AppMode) => {
    setAppMode(mode);
    setSelectedGrade(null);
    setSelectedTopic('');
    setGenerativeTextResult(null);
    setError(null);
    setGameState(GameState.GENERATIVE_TEXT_INPUT);
  };

  const handleLanguageSelect = (language: Language) => {
    setSelectedLanguage(language);
    setGameState(GameState.GRADE_SELECTION);
  };
  
  const handleVoiceTutorLanguageSelect = (language: Language) => {
    setSelectedLanguage(language);
    setGameState(GameState.VOICE_TUTOR_SESSION);
  };

  const handleGradeSelect = (grade: Grade) => {
    setSelectedGrade(grade);
    setError(null);
    setSelectedTopic('');
    setGameState(GameState.TOPIC_SELECTION);
  };
  
  const handleGoHome = () => {
    setGameState(GameState.HOME_SCREEN);
    setAppMode('quiz');
    setSelectedLanguage(null);
  };

  const handleRestart = () => {
    setGameState(GameState.LOGIN_SCREEN);
    setUsername('');
    setAppMode('quiz');
    setSelectedGrade(null);
    setSelectedTopic('');
    setSelectedDifficulty(null);
    setSelectedLanguage(null);
    setFinalScore(0);
    setFinalQuizLength(0);
    setQuizLength(5);
    setTimerDuration(0);
    setWorksheetQuestions(null);
    setGeneratedNotes(null);
    setDiagramIdeas([]);
    setGeneratedDiagrams([]);
    setRegeneratingDiagramId(null);
    setChatHistory([]);
    setGenerativeTextResult(null);
    setScienceLensResult(null);
    setError(null);
    setIsGenerating(false);
  };

  // --- Main Logic Handlers ---

  const handleTopicSelect = async (topic: string) => {
    setSelectedTopic(topic);
    setError(null);
    setIsGenerating(true);

    try {
        if (!selectedGrade) return;

        switch (appMode) {
            case 'diagram':
                const ideas = await generateDiagramIdeas(topic, selectedGrade);
                const ideasWithIds = ideas.map(idea => ({ ...idea, id: crypto.randomUUID() }));
                setDiagramIdeas(ideasWithIds);
                setGameState(GameState.DIAGRAM_IDEAS_SELECTION);
                break;
            case 'notes':
                const notes = await generateNotes(topic, selectedGrade);
                setGeneratedNotes(notes);
                setGameState(GameState.NOTES_GENERATED);
                break;
            case 'quiz':
            case 'worksheet':
                setGameState(GameState.DIFFICULTY_SELECTION);
                break;
            case 'voice_tutor':
                setGameState(GameState.VOICE_TUTOR_LANGUAGE_SELECTION);
                break;
            case 'concept_deep_dive':
            case 'virtual_lab':
            case 'real_world_links':
            case 'chat_with_history':
            case 'story_weaver':
            case 'science_fair_buddy':
            case 'what_if':
                setGenerativeTextResult(null);
                setGameState(GameState.GENERATIVE_TEXT_INPUT);
                break;
            // Handle doubt solver topic selection
            default:
                 if (selectedLanguage) {
                    const greeting = await generateGreeting(selectedGrade, selectedLanguage, topic);
                    const initialMessage: ChatMessage = { role: 'model', parts: [{ text: greeting }] };
                    setChatHistory([initialMessage]);
                    setGameState(GameState.DOUBT_SOLVER);
                } else {
                    setGameState(GameState.DIFFICULTY_SELECTION);
                }
                break;
        }
    } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        setGameState(GameState.TOPIC_SELECTION); // Go back if something fails
    } finally {
        setIsGenerating(false);
    }
  };
  
  const handleGenerateSelectedDiagrams = async (selectedIdeas: DiagramIdea[]) => {
    if (selectedIdeas.length === 0) return;
    
    setGameState(GameState.DIAGRAM_GENERATOR);
    setIsGenerating(true);
    setGeneratedDiagrams([]); // Clear previous diagrams
    setGenerationProgress({ current: 0, total: selectedIdeas.length });
    generationCancelledRef.current = false;

    for (const idea of selectedIdeas) {
        if (generationCancelledRef.current) break;
        try {
            const imageBytes = await generateDiagramImage(idea.prompt);
            const newDiagram: Diagram = {
                id: idea.id,
                prompt: idea.prompt,
                image: `data:image/png;base64,${imageBytes}`,
                description: idea.description,
            };
            setGeneratedDiagrams(prev => [...prev, newDiagram]);
        } catch (imgError) {
            console.error(`Failed to generate diagram for "${idea.description}", skipping:`, imgError);
        } finally {
            if (!generationCancelledRef.current) {
                setGenerationProgress(prev => ({ ...prev, current: prev.current + 1 }));
            }
        }
    }
    
    setIsGenerating(false);
    generationCancelledRef.current = false;
  };

  const handleRegenerateDiagram = async (diagramId: string) => {
    const diagramToRegen = generatedDiagrams.find(d => d.id === diagramId);
    if (!diagramToRegen) return;
    
    setRegeneratingDiagramId(diagramId);
    try {
        const imageBytes = await generateDiagramImage(diagramToRegen.prompt);
        const newImage = `data:image/png;base64,${imageBytes}`;
        setGeneratedDiagrams(prevDiagrams => 
            prevDiagrams.map(d => 
                d.id === diagramId ? { ...d, image: newImage } : d
            )
        );
    } catch (error) {
        console.error("Failed to regenerate diagram:", error);
        // Optionally show an error to the user
    } finally {
        setRegeneratingDiagramId(null);
    }
  };


  const handleDifficultySelect = (difficulty: Difficulty) => {
    setSelectedDifficulty(difficulty);
    if (appMode === 'quiz') {
      setGameState(GameState.QUESTION_NUMBER_SELECTION);
    } else if (appMode === 'worksheet') {
      setGameState(GameState.WORKSHEET_COUNT_SELECTION);
    }
  };
  
  const handleWorksheetCountSelect = async (count: number) => {
    setIsGenerating(true);
    setError(null);
    setGenerationProgress({ current: 0, total: count });
    try {
        if (!selectedTopic || !selectedGrade || !selectedDifficulty) return;
        const data = await generateWorksheet(
            selectedTopic, 
            selectedGrade, 
            selectedDifficulty, 
            count,
            (progress) => setGenerationProgress(progress)
        );
        setWorksheetQuestions(data);
        setGameState(GameState.WORKSHEET_GENERATED);
    } catch(err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        setGameState(GameState.WORKSHEET_COUNT_SELECTION); 
    } finally {
        setIsGenerating(false);
    }
  };

  const handleQuestionCountSelect = (count: number) => {
    setQuizLength(count);
    setGameState(GameState.TIMER_SELECTION);
  };

  const handleTimerSelect = (duration: number) => {
    setTimerDuration(duration);
    setGameState(GameState.PLAYING);
  };

  const handleQuizEnd = (score: number, skipsUsed: number) => {
    setFinalScore(score);
    setFinalQuizLength(quizLength - skipsUsed);
    setGameState(GameState.FINISHED);
  };
  
  const handleSendMessage = async (message: string) => {
    if (!selectedGrade || !selectedLanguage) return;

    generationCancelledRef.current = false;
    setIsGenerating(true);
    setError(null);

    const userMessage: ChatMessage = { role: 'user', parts: [{ text: message }] };
    const newHistory = [...chatHistory, userMessage];
    setChatHistory(newHistory);

    try {
      const responseText = await getChatResponse(selectedGrade, newHistory, selectedLanguage, selectedTopic);
      if (generationCancelledRef.current) return;
      
      const modelMessage: ChatMessage = { role: 'model', parts: [{ text: responseText }] };
      setChatHistory(prev => [...prev, modelMessage]);
      setIsGenerating(false);
    } catch (err) {
       if (generationCancelledRef.current) return;
       setError(err instanceof Error ? err.message : 'An unknown error occurred.');
       setIsGenerating(false);
    }
  };
  
  const handleGenerativeText = async (userInput: string) => {
      setIsGenerating(true);
      setError(null);
      setGenerativeTextResult(null);
      try {
          const result = await generateTextForMode(appMode, userInput, selectedGrade ?? undefined, selectedTopic || undefined);
          setGenerativeTextResult(result);
      } catch (err) {
          setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      } finally {
          setIsGenerating(false);
      }
  };
  
  const handleScienceLens = async (base64Image: string, mimeType: string, prompt: string) => {
      setIsGenerating(true);
      setError(null);
      setScienceLensResult(null);
      try {
          const result = await explainImageWithText(base64Image, mimeType, prompt);
          setScienceLensResult(result);
      } catch (err) {
          setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      } finally {
          setIsGenerating(false);
      }
  };

  const handleCancelGeneration = () => {
    generationCancelledRef.current = true;
    setIsGenerating(false);
  };

  const renderContent = () => {
    switch (gameState) {
      case GameState.LOGIN_SCREEN:
        return <LoginScreen onLoginSuccess={(name) => { setUsername(name); setGameState(GameState.HOME_SCREEN); }} />;
      case GameState.PLAYING:
        if (!selectedGrade || !selectedTopic || !selectedDifficulty) {
            handleRestart();
            return null;
        }
        return <Quiz grade={selectedGrade} topic={selectedTopic} difficulty={selectedDifficulty} quizLength={quizLength} timerDuration={timerDuration} onQuizEnd={handleQuizEnd} />;
      case GameState.FINISHED:
        return <ScoreScreen score={finalScore} onRestart={handleRestart} quizLength={finalQuizLength} />;
      case GameState.WORKSHEET_GENERATED:
        if (!worksheetQuestions || !selectedGrade || !selectedTopic) {
            handleRestart();
            return null;
        }
        return <Worksheet questions={worksheetQuestions} onRestart={handleRestart} grade={selectedGrade} topic={selectedTopic} />
      case GameState.NOTES_GENERATED:
        if (!generatedNotes || !selectedGrade || !selectedTopic) {
            handleRestart();
            return null;
        }
        return <Notes notes={generatedNotes} onRestart={handleRestart} grade={selectedGrade} topic={selectedTopic} />
      case GameState.DIAGRAM_IDEAS_SELECTION:
        return <DiagramIdeaSelector ideas={diagramIdeas} onGenerate={handleGenerateSelectedDiagrams} />;
      case GameState.DIAGRAM_GENERATOR:
        if (!selectedGrade || !selectedTopic) {
            handleRestart();
            return null;
        }
        return <DiagramGenerator
            diagrams={generatedDiagrams}
            isGenerating={isGenerating}
            grade={selectedGrade}
            topic={selectedTopic}
            onRestart={handleRestart}
            onCancelGeneration={handleCancelGeneration}
            generationProgress={generationProgress}
            onRegenerate={handleRegenerateDiagram}
            regeneratingId={regeneratingDiagramId}
         />;
      case GameState.DOUBT_SOLVER:
        if (!selectedGrade || !selectedTopic) {
            handleRestart();
            return null;
        }
        return <DoubtSolver 
            grade={selectedGrade}
            topic={selectedTopic}
            history={chatHistory} 
            onSendMessage={handleSendMessage} 
            isLoading={isGenerating}
            error={error}
            onCancelGeneration={handleCancelGeneration}
        />
      case GameState.GENERATIVE_TEXT_INPUT:
        return <GenerativeText
            appMode={appMode}
            grade={selectedGrade}
            topic={selectedTopic}
            onGenerate={handleGenerativeText}
            isLoading={isGenerating}
            result={generativeTextResult}
            error={error}
        />;
      case GameState.SCIENCE_LENS_INPUT:
        return <ScienceLens
            onGenerate={handleScienceLens}
            isLoading={isGenerating}
            result={scienceLensResult}
            error={error}
        />;
      case GameState.TIMER_SELECTION:
        return <TimerSelector onTimerSelect={handleTimerSelect} />;
      case GameState.QUESTION_NUMBER_SELECTION:
        return <QuestionCountSelector onQuestionCountSelect={handleQuestionCountSelect} />;
      case GameState.WORKSHEET_COUNT_SELECTION:
        return <WorksheetCountSelector 
                    onCountSelect={handleWorksheetCountSelect} 
                    isGenerating={isGenerating} 
                    error={error} 
                    generationProgress={generationProgress} 
                />;
      case GameState.DIFFICULTY_SELECTION:
        if (!selectedGrade || !selectedTopic) {
            handleRestart();
            return null;
        }
        return <DifficultySelector onDifficultySelect={handleDifficultySelect} />;
      case GameState.TOPIC_SELECTION:
        if (!selectedGrade) {
            handleRestart();
            return null;
        }
        return <TopicSelector 
                    grade={selectedGrade} 
                    onTopicSelect={handleTopicSelect} 
                    isGenerating={isGenerating}
                    error={error}
                    appMode={appMode}
                    isSolverSetup={!!selectedLanguage && appMode !== 'voice_tutor'}
                />;
       case GameState.LANGUAGE_SELECTION:
        return <LanguageSelector onLanguageSelect={handleLanguageSelect} title="AI Doubt Solver"/>;
       case GameState.VOICE_TUTOR_LANGUAGE_SELECTION:
        if (!selectedGrade || !selectedTopic) { handleRestart(); return null; }
        return <LanguageSelector
            onLanguageSelect={handleVoiceTutorLanguageSelect}
            title="Select Conversation Language"
            grade={selectedGrade}
            topic={selectedTopic}
        />;
      case GameState.VOICE_TUTOR_SESSION:
        if (!selectedGrade || !selectedTopic || !selectedLanguage) { handleRestart(); return null; }
        return <VoiceTutor
            grade={selectedGrade}
            topic={selectedTopic}
            language={selectedLanguage}
            onEndSession={handleGoHome}
        />
      case GameState.GRADE_SELECTION:
         return <GradeSelector 
                    onGradeSelect={handleGradeSelect} 
                    appMode={appMode} 
                    isSolverSetup={!!selectedLanguage && appMode !== 'voice_tutor'}
                    isLoading={isGenerating}
                    error={error}
                />;
      case GameState.HOME_SCREEN:
      default:
        return <HomeScreen 
            username={username}
            onStartQuiz={() => startFeature('quiz')}
            onStartWorksheet={() => startFeature('worksheet')}
            onStartNotes={() => startFeature('notes')}
            onStartDiagramGenerator={() => startFeature('diagram')}
            onStartDoubtSolver={handleStartDoubtSolver}
            onStartVoiceTutor={handleStartVoiceTutor}
            onStartScienceLens={handleStartScienceLens}
            onStartConceptDeepDive={() => handleStartGenerativeFeature('concept_deep_dive')}
            onStartVirtualLab={() => startFeature('virtual_lab')}
            onStartRealWorldLinks={() => startFeature('real_world_links')}
            onStartChatWithHistory={() => handleStartGenerativeFeature('chat_with_history')}
            onStartStoryWeaver={() => startFeature('story_weaver')}
            onStartScienceFairBuddy={() => handleStartGenerativeFeature('science_fair_buddy')}
            onStartWhatIf={() => handleStartGenerativeFeature('what_if')}
            onLogout={handleRestart}
         />;
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-slate-900 text-white font-sans relative">
      {gameState !== GameState.HOME_SCREEN && gameState !== GameState.LOGIN_SCREEN && <HomeButton onClick={handleGoHome} />}
      <div className="w-full">
        <Suspense fallback={<SuspenseLoader />}>
          {renderContent()}
        </Suspense>
      </div>
    </main>
  );
};

export default App;