import React, { useState, useEffect, useRef } from 'react';
import type { MultiplayerRoom, QuizQuestion, User } from '../types';
import { submitAnswer, getRoomState } from '../services/multiplayerService';
import MultiplayerRoundLeaderboard from './MultiplayerRoundLeaderboard';

interface MultiplayerQuizProps {
  room: MultiplayerRoom;
  currentUser: User;
  onGameEnd: (finalRoomState: MultiplayerRoom) => void;
}

const QUESTION_TIME = 20;

const MultiplayerQuiz: React.FC<MultiplayerQuizProps> = ({ room: initialRoom, currentUser, onGameEnd }) => {
  const [room, setRoom] = useState(initialRoom);
  const [view, setView] = useState<'question' | 'leaderboard'>('question');
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  const currentQuestion = room.questions[room.currentQuestionIndex];
  const isHost = room.host === currentUser.username;

  useEffect(() => {
    if (room.status === 'finished') {
        if(timerRef.current) clearInterval(timerRef.current);
        onGameEnd(room);
    }
  }, [room, onGameEnd]);
  
  useEffect(() => {
    // This effect runs when the question changes (index increments)
    setView('question');
    setHasAnswered(false);
    setSelectedAnswer(null);
    setTimeLeft(QUESTION_TIME);
    startTimeRef.current = Date.now();
    
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setView('leaderboard');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => {
        if(timerRef.current) clearInterval(timerRef.current);
    };
  }, [room.currentQuestionIndex]);

  const handleAnswerSelect = (option: string) => {
    if (hasAnswered) return;
    setHasAnswered(true);
    setSelectedAnswer(option);
    
    const timeTaken = (Date.now() - startTimeRef.current) / 1000;
    const isCorrect = option === currentQuestion.answer;
    
    submitAnswer(room.roomId, currentUser.username, room.currentQuestionIndex, isCorrect, timeTaken);
  };
  
  const handleNextQuestion = async () => {
      // The leaderboard component will get the latest state when it polls
      setView('question'); // Optimistic update
      // A new poll from the leaderboard will fetch the new question index
  };

  const getButtonClass = (option: string) => {
    if (!hasAnswered) {
      return 'bg-slate-800 hover:bg-slate-700 border-slate-700';
    }
    if (option === currentQuestion.answer) {
      return 'bg-green-700 border-green-500';
    }
    if (option === selectedAnswer) {
      return 'bg-red-700 border-red-500';
    }
    return 'bg-slate-800 border-slate-700 opacity-60';
  };
  
  if (view === 'leaderboard') {
    return <MultiplayerRoundLeaderboard room={room} isHost={isHost} onStateChange={setRoom} onNextQuestion={handleNextQuestion} />;
  }

  return (
    <div className="w-full max-w-3xl mx-auto p-6 md:p-8 bg-slate-900 rounded-xl shadow-2xl border border-slate-800">
      <div className="mb-6">
        <div className="flex justify-between items-center text-slate-400 mb-2">
          <span>Question {room.currentQuestionIndex + 1}/{room.quizLength}</span>
          <span className="font-mono text-lg">Time: {timeLeft}s</span>
        </div>
        <div className="w-full h-2 rounded-full bg-slate-700">
            <div className="h-full rounded-full bg-cyan-500" style={{ width: `${((room.currentQuestionIndex + 1) / room.quizLength) * 100}%` }}></div>
        </div>
        <div className="w-full h-1.5 mt-2 bg-slate-700 rounded-full">
            <div className={`h-1.5 rounded-full ${timeLeft <= 5 ? 'bg-red-500' : 'bg-yellow-400'}`} style={{ width: `${(timeLeft / QUESTION_TIME) * 100}%`, transition: 'width 1s linear' }}></div>
        </div>
      </div>

      <h2 className="text-2xl md:text-3xl font-semibold text-slate-100 mb-6 min-h-[100px]">{currentQuestion.question}</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {currentQuestion.options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleAnswerSelect(option)}
            disabled={hasAnswered}
            className={`p-4 rounded-lg border-2 text-left text-slate-100 font-medium transition-all duration-300 ${getButtonClass(option)}`}
          >
            {option}
          </button>
        ))}
      </div>
      
      {hasAnswered && (
         <div className="mt-8 text-center text-lg text-slate-300">
            Waiting for other players...
        </div>
      )}
    </div>
  );
};

export default MultiplayerQuiz;
