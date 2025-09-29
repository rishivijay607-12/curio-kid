
import React, { useState, useRef, Suspense } from 'react';
import { GameState } from './types';
import type { Grade, Difficulty, AppMode, QuizQuestion, ChatMessage, Language, NoteSection, Diagram, DiagramIdea } from './types';
import HomeScreen from './components/HomeScreen';
import LoadingSpinner from './components/LoadingSpinner';
import { generateWorksheet, generateNotes, getChatResponse, generateGreeting, generateDiagramIdeas, generateDiagramImage } from './services/geminiService';

// Lazy-loaded components for code-splitting
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
  const [gameState, setGameState] = useState<GameState>(GameState.HOME_SCREEN);
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
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const generationCancelledRef = useRef(false);
  const [generationProgress, setGenerationProgress] = useState({ current: 0, total: 0 });

  const handleStartLearningHub = () => {
    setAppMode('quiz');
    setGameState(GameState.GRADE_SELECTION);
  };
  
  const handleStartDoubtSolver = () => {
    setGameState(GameState.LANGUAGE_SELECTION);
  };

  const handleStartDiagramGenerator = () => {
    setAppMode('diagram');
    setGameState(GameState.GRADE_SELECTION);
  };
  
  const handleLanguageSelect = (language: Language) => {
    setSelectedLanguage(language);
    setGameState(GameState.GRADE_SELECTION);
  };

  const handleGradeSelect = (grade: Grade) => {
    setSelectedGrade(grade);
    setError(null);
    setSelectedTopic('');
    setGameState(GameState.TOPIC_SELECTION);
  };

  const handleTopicSelect = async (topic: string) => {
    setSelectedTopic(topic);
    setError(null);

    // Diagram Generator Flow
    if (appMode === 'diagram') {
        if (!selectedGrade) return;
        setIsGenerating(true);
        setDiagramIdeas([]);
        
        try {
            const ideas = await generateDiagramIdeas(topic, selectedGrade);
            const ideasWithIds = ideas.map(idea => ({
                ...idea,
                id: crypto.randomUUID(),
            }));
            setDiagramIdeas(ideasWithIds);
            setGameState(GameState.DIAGRAM_IDEAS_SELECTION);
        } catch(err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
            setGameState(GameState.TOPIC_SELECTION); // Go back if ideas fail
        } finally {
            setIsGenerating(false);
        }
        return;
    }

    // Doubt Solver Flow
    if (selectedLanguage) {
        setIsGenerating(true);
        try {
            if (!selectedGrade) return;
            const greeting = await generateGreeting(selectedGrade, selectedLanguage, topic);
            const initialMessage: ChatMessage = { role: 'model', parts: [{ text: greeting }] };
            setChatHistory([initialMessage]);
            setGameState(GameState.DOUBT_SOLVER);
        } catch(err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
            setGameState(GameState.TOPIC_SELECTION); // Stay on topic selection if greeting fails
        } finally {
            setIsGenerating(false);
        }
    } 
    // Learning Hub Flow
    else if (appMode === 'notes') {
        setIsGenerating(true);
        try {
            if (!selectedGrade) return;
            const notes = await generateNotes(topic, selectedGrade);
            setGeneratedNotes(notes);
            setGameState(GameState.NOTES_GENERATED);
        } catch(err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsGenerating(false);
        }
    } else {
        setGameState(GameState.DIFFICULTY_SELECTION);
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
        // Fix: Corrected typo in GameState enum member name.
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
  
  const handleCancelGeneration = () => {
    generationCancelledRef.current = true;
    setIsGenerating(false);
  };

  const handleGoHome = () => {
    setGameState(GameState.HOME_SCREEN);
    setAppMode('quiz');
    setSelectedLanguage(null);
  };

  const handleRestart = () => {
    setGameState(GameState.HOME_SCREEN);
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
    setError(null);
    setIsGenerating(false);
  };

  const renderContent = () => {
    switch (gameState) {
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
                    isSolverSetup={!!selectedLanguage}
                />;
       case GameState.LANGUAGE_SELECTION:
        return <LanguageSelector onLanguageSelect={handleLanguageSelect} />;
      case GameState.GRADE_SELECTION:
         return <GradeSelector 
                    onGradeSelect={handleGradeSelect} 
                    appMode={appMode} 
                    setAppMode={setAppMode}
                    isSolverSetup={!!selectedLanguage}
                    isLoading={false}
                    error={null}
                />;
      case GameState.HOME_SCREEN:
      default:
        return <HomeScreen onStartLearningHub={handleStartLearningHub} onStartDoubtSolver={handleStartDoubtSolver} onStartDiagramGenerator={handleStartDiagramGenerator} />;
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-slate-900 text-white font-sans relative">
      {gameState !== GameState.HOME_SCREEN && <HomeButton onClick={handleGoHome} />}
      <div className="w-full">
        <Suspense fallback={<SuspenseLoader />}>
          {renderContent()}
        </Suspense>
      </div>
    </main>
  );
};

export default App;