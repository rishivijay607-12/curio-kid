import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { QuizQuestion, Grade, Difficulty } from '../types.ts';
import { generateQuizQuestions } from '../services/geminiService.ts';
import LoadingSpinner from './LoadingSpinner.tsx';

interface QuizProps {
  topic: string;
  grade: Grade;
  difficulty: Difficulty;
  quizLength: number;
  timerDuration: number;
  onQuizEnd: (finalScore: number, totalQuestions: number) => void;
}

const Quiz: React.FC<QuizProps> = ({ topic, grade, difficulty, quizLength, timerDuration, onQuizEnd }) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [skipsRemaining, setSkipsRemaining] = useState(Math.floor(quizLength / 5));
  const [timeLeft, setTimeLeft] = useState(timerDuration);
  
  const timerIdRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = useCallback(() => {
    if (timerIdRef.current) {
      clearInterval(timerIdRef.current);
      timerIdRef.current = null;
    }
  }, []);
  
  const goToNextQuestion = useCallback(() => {
    clearTimer();
    if (currentQuestionIndex >= questions.length - 1) {
      onQuizEnd(score, questions.length);
      return;
    }
    
    setCurrentQuestionIndex(prev => prev + 1);
    setSelectedAnswer(null);
    setIsAnswered(false);
  }, [clearTimer, currentQuestionIndex, questions.length, onQuizEnd, score]);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    
    generateQuizQuestions(topic, grade, difficulty, quizLength)
      .then(fetchedQuestions => {
        if (fetchedQuestions.length < quizLength) {
            console.warn(`API returned ${fetchedQuestions.length} questions, but ${quizLength} were requested.`);
            if (fetchedQuestions.length === 0) {
                throw new Error("The AI failed to generate any questions for this topic.");
            }
        }
        setQuestions(fetchedQuestions);
        setIsLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "An unknown error occurred.");
        setIsLoading(false);
      });
  }, [topic, grade, difficulty, quizLength]);
  
  useEffect(() => {
    if (isLoading || isAnswered || timerDuration === 0) {
      return;
    }

    setTimeLeft(timerDuration); // Reset timer for new question

    timerIdRef.current = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          clearTimer();
          // Use a callback with goToNextQuestion to avoid stale state issues
          goToNextQuestion(); 
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearTimer(); // Cleanup on unmount or when dependencies change
  }, [currentQuestionIndex, timerDuration, isAnswered, isLoading, clearTimer, goToNextQuestion]);

  const handleAnswerSelect = (option: string) => {
    if (isAnswered) return;
    
    clearTimer();
    setSelectedAnswer(option);
    setIsAnswered(true);

    if (option === questions[currentQuestionIndex]?.answer) {
      setScore(prev => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    goToNextQuestion();
  };
  
  const handleSkipQuestion = () => {
    if (skipsRemaining <= 0 || isAnswered) return;
    
    clearTimer();
    setSkipsRemaining(prev => prev - 1);
    goToNextQuestion();
  };
  
  const currentQuestion = questions[currentQuestionIndex];
  const questionNumber = currentQuestionIndex + 1;

  const getButtonClass = (option: string) => {
    if (!isAnswered) {
      return 'bg-slate-800 hover:bg-slate-700 border-slate-700';
    }
    if (option === currentQuestion?.answer) {
      return 'bg-green-700 border-green-500';
    }
    if (option === selectedAnswer) {
      return 'bg-red-700 border-red-500';
    }
    return 'bg-slate-800 border-slate-700 opacity-60';
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-slate-900 rounded-xl shadow-2xl border border-slate-800 min-h-[400px]">
        <LoadingSpinner />
        <p className="text-slate-300 mt-4 text-lg">Generating your personalized quiz...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-slate-900 rounded-xl shadow-2xl border border-red-500">
        <p className="text-red-400 text-lg font-semibold">Oops! Something went wrong.</p>
        <p className="text-slate-300 mt-2 text-center">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-6 px-6 py-2 bg-cyan-600 text-white font-bold rounded-lg shadow-lg hover:bg-cyan-500 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!currentQuestion) return null;

  return (
    <div className="w-full max-w-3xl mx-auto p-6 md:p-8 bg-slate-900 rounded-xl shadow-2xl border border-slate-800">
      <div className="mb-6">
        <div className="flex justify-between items-center text-slate-400 mb-2">
          <span>Question {questionNumber}/{questions.length}</span>
          {timerDuration > 0 && <span className="font-mono text-lg">Time: {timeLeft}s</span>}
          <span>Score: {score} &bull; Skips: {skipsRemaining}</span>
        </div>
        <div className="w-full h-2 rounded-full bg-slate-700">
            <div className="h-full rounded-full bg-cyan-500 transition-all" style={{ width: `${(questionNumber / questions.length) * 100}%` }}></div>
        </div>
        {timerDuration > 0 && !isAnswered && (
             <div className="w-full h-1.5 mt-2 bg-slate-700 rounded-full">
                <div className={`h-1.5 rounded-full ${timeLeft <= 10 ? 'bg-red-500' : 'bg-yellow-400'}`} style={{ width: `${(timeLeft / timerDuration) * 100}%`, transition: 'width 1s linear' }}></div>
            </div>
        )}
      </div>

      <h2 className="text-2xl md:text-3xl font-semibold text-slate-100 mb-6 min-h-[100px]">{currentQuestion.question}</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {currentQuestion.options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleAnswerSelect(option)}
            disabled={isAnswered}
            className={`p-4 rounded-lg border-2 text-left text-slate-100 font-medium transition-all duration-300 ${getButtonClass(option)} ${!isAnswered ? 'cursor-pointer' : 'cursor-default'}`}
          >
            {option}
          </button>
        ))}
      </div>

      {isAnswered && currentQuestion.explanation && (
        <div className="mt-6 p-4 bg-slate-950/50 border border-slate-800 rounded-lg">
          <h3 className="font-semibold text-lg text-cyan-400 mb-2">Explanation</h3>
          <p className="text-slate-300 leading-relaxed">{currentQuestion.explanation}</p>
        </div>
      )}

      <div className="mt-8 flex justify-end items-center min-h-[52px]">
        {!isAnswered && skipsRemaining > 0 && (
          <button
            onClick={handleSkipQuestion}
            className="px-6 py-2 bg-slate-700 text-white font-bold rounded-lg shadow-lg hover:bg-slate-600 transition-all focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-opacity-75"
          >
            Skip Question
          </button>
        )}
        {isAnswered && (
          <button
            onClick={handleNextQuestion}
            className="px-8 py-3 bg-cyan-600 text-white font-bold rounded-lg shadow-lg hover:bg-cyan-500 transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-opacity-75"
          >
            {questionNumber === questions.length ? 'Finish Quiz' : 'Next Question'}
          </button>
        )}
      </div>
    </div>
  );
};

export default Quiz;