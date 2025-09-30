import React, { useState } from 'react';
import type { QuizQuestion, Grade } from '../types.ts';

interface QuestionItemProps {
    question: QuizQuestion;
    number: number;
    questionIndex: number;
    isSubmitted: boolean;
    userAnswer: string | undefined;
    onAnswerChange: (questionIndex: number, answer: string) => void;
}

const QuestionItem: React.FC<QuestionItemProps> = ({ question: q, number, questionIndex, isSubmitted, userAnswer, onAnswerChange }) => {
    
    const getOptionClass = (option: string) => {
        if (!isSubmitted) {
            return userAnswer === option
                ? 'bg-cyan-800 border-cyan-500' // Selected
                : 'bg-slate-800 hover:bg-slate-700 border-slate-700'; // Default
        }
    
        const isCorrect = option === q.answer;
        const isSelected = userAnswer === option;
    
        if (isCorrect) {
          return 'bg-green-700 border-green-500'; // Correct answer
        }
        if (isSelected) {
          return 'bg-red-700 border-red-500'; // User's wrong answer
        }
        return 'bg-slate-800 border-slate-700 opacity-60'; // Other wrong options
    };

    return (
        <div className="worksheet-question">
            <h3 className="text-xl font-semibold text-slate-200">
                {number}.
                {q.type === 'Assertion/Reason' && <span className="font-normal italic"> In the following question, a statement of assertion (A) is followed by a statement of reason (R). Mark the correct choice.</span>}
            </h3>

            {q.type === 'Assertion/Reason' ? (
                <div className="space-y-2 my-3 pl-4">
                    <p className="text-slate-200"><span className="font-semibold">Assertion (A):</span> {q.question}</p>
                    <p className="text-slate-200"><span className="font-semibold">Reason (R):</span> {q.reason}</p>
                </div>
            ) : (
                <p className="text-slate-200 my-3 pl-4">{q.question}</p>
            )}

            {q.type === 'Q&A' ? (
                 <div className="pl-4">
                    <textarea
                        value={userAnswer || ''}
                        onChange={(e) => onAnswerChange(questionIndex, e.target.value)}
                        disabled={isSubmitted}
                        placeholder="Type your answer here..."
                        rows={3}
                        className={`w-full p-2 bg-slate-800 text-slate-100 rounded-md border-2 focus:outline-none transition-colors ${isSubmitted ? (userAnswer?.toLowerCase().trim() === q.answer.toLowerCase().trim() ? 'border-green-500' : 'border-red-500') : 'border-slate-700 focus:border-cyan-500'}`}
                    />
                </div>
            ) : (
                <div className={`grid ${q.type === 'MCQ' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'} gap-3 pl-4 mt-4`}>
                    {q.options.map((option, i) => (
                        <button 
                            key={i}
                            onClick={() => onAnswerChange(questionIndex, option)}
                            disabled={isSubmitted}
                            className={`p-3 rounded-lg border-2 text-left text-slate-100 font-medium transition-all duration-200 ${getOptionClass(option)} ${!isSubmitted ? 'cursor-pointer' : 'cursor-default'}`}
                        >
                            {String.fromCharCode(97 + i)}. {option}
                        </button>
                    ))}
                </div>
            )}

            {isSubmitted && (
                <div className="mt-4 p-3 bg-slate-950/50 border-l-4 border-cyan-500 rounded-r-md">
                    <p className="font-semibold text-green-400">
                        Correct Answer: <span className="font-normal">{q.answer}</span>
                    </p>
                    <p className="mt-1 text-slate-400">
                        <span className="font-semibold">Explanation:</span> {q.explanation}
                    </p>
                </div>
            )}
        </div>
    );
};

// Fix: Added missing WorksheetProps interface
interface WorksheetProps {
    questions: QuizQuestion[];
    onRestart: () => void;
    grade: Grade;
    topic: string;
}

const Worksheet: React.FC<WorksheetProps> = ({ questions, onRestart, grade, topic }) => {
    const [userAnswers, setUserAnswers] = useState<{ [key: number]: string }>({});
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [score, setScore] = useState(0);

    const handleAnswerChange = (questionIndex: number, answer: string) => {
        if (isSubmitted) return;
        setUserAnswers(prev => ({ ...prev, [questionIndex]: answer }));
    };
    
    const handleSubmit = () => {
        let newScore = 0;
        questions.forEach((q, index) => {
            const userAnswer = userAnswers[index];
            if (userAnswer) {
                 if (q.type === 'Q&A') {
                    if (userAnswer.trim().toLowerCase() === q.answer.trim().toLowerCase()) {
                        newScore++;
                    }
                 } else {
                    if (userAnswer === q.answer) {
                        newScore++;
                    }
                 }
            }
        });
        setScore(newScore);
        setIsSubmitted(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };


    const mcqQuestions = questions.filter(q => q.type === 'MCQ');
    const tfQuestions = questions.filter(q => q.type === 'True/False');
    const arQuestions = questions.filter(q => q.type === 'Assertion/Reason');
    const qaQuestions = questions.filter(q => q.type === 'Q&A');
    
    let questionCounter = 0;

    return (
        <div className="w-full max-w-4xl mx-auto p-6 md:p-8 bg-slate-900 rounded-xl shadow-2xl border border-slate-800 printable-worksheet">
            {/* Header and Controls */}
            <div className="mb-8 print:mb-4 no-print">
                 <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-300">
                    {isSubmitted ? 'Worksheet Results' : 'Interactive Worksheet'}
                </h1>
                <p className="text-slate-400 mt-1">
                    {isSubmitted ? 'Review your answers below.' : 'Answer the questions and submit to see your score.'}
                </p>

                {isSubmitted && (
                     <div className="mt-6 p-4 bg-slate-950/70 rounded-lg border border-slate-800 text-center">
                        <p className="text-lg text-slate-300">Your Score</p>
                        <p className="text-5xl font-bold text-white my-2">{score} / {questions.length}</p>
                        <p className="text-2xl text-cyan-400 font-semibold">{questions.length > 0 ? Math.round((score / questions.length) * 100) : 0}%</p>
                    </div>
                )}
                
                <div className="mt-6 flex flex-wrap gap-4">
                    {!isSubmitted && (
                         <button
                            onClick={handleSubmit}
                            className="px-6 py-2 bg-green-600 text-white font-bold rounded-lg shadow-lg hover:bg-green-500 transition-colors"
                        >
                            Submit Worksheet
                        </button>
                    )}
                    <button
                        onClick={() => window.print()}
                        className="px-6 py-2 bg-cyan-600 text-white font-bold rounded-lg shadow-lg hover:bg-cyan-500 transition-colors"
                    >
                        Print
                    </button>
                    <button
                        onClick={onRestart}
                        className="px-6 py-2 bg-slate-800 text-white font-bold rounded-lg shadow-lg hover:bg-slate-700 transition-colors"
                    >
                        Start Over
                    </button>
                </div>
            </div>

             {/* Printable Header */}
            <div className="text-center mb-8 border-b border-slate-700 pb-4">
                <h2 className="text-2xl font-bold text-slate-100">Science Worksheet</h2>
                <div className="flex justify-center gap-6 text-slate-300 mt-2">
                    <span><strong>Grade:</strong> {grade}</span>
                    <span><strong>Chapter:</strong> {topic}</span>
                </div>
                 <div className="flex justify-center gap-6 text-slate-300 mt-2">
                    <span><strong>Name:</strong> _________________________</span>
                    <span><strong>Date:</strong> _________________</span>
                </div>
            </div>

            {/* Questions List */}
            <div className="space-y-12">
                {mcqQuestions.length > 0 && (
                    <section>
                        <h2 className="text-2xl font-bold text-cyan-400 border-b-2 border-slate-700 pb-2 mb-6">I. Multiple Choice Questions</h2>
                        <div className="space-y-8">
                            {mcqQuestions.map((q) => {
                                questionCounter++;
                                const originalIndex = questions.indexOf(q);
                                return <QuestionItem 
                                    key={originalIndex}
                                    question={q} 
                                    number={questionCounter}
                                    questionIndex={originalIndex}
                                    isSubmitted={isSubmitted}
                                    userAnswer={userAnswers[originalIndex]}
                                    onAnswerChange={handleAnswerChange}
                                />;
                            })}
                        </div>
                    </section>
                )}

                {tfQuestions.length > 0 && (
                     <section>
                        <h2 className="text-2xl font-bold text-cyan-400 border-b-2 border-slate-700 pb-2 mb-6">II. True or False</h2>
                        <div className="space-y-8">
                            {tfQuestions.map((q) => {
                                questionCounter++;
                                const originalIndex = questions.indexOf(q);
                                return <QuestionItem 
                                    key={originalIndex}
                                    question={q} 
                                    number={questionCounter}
                                    questionIndex={originalIndex}
                                    isSubmitted={isSubmitted}
                                    userAnswer={userAnswers[originalIndex]}
                                    onAnswerChange={handleAnswerChange}
                                />;
                            })}
                        </div>
                    </section>
                )}

                {arQuestions.length > 0 && (
                     <section>
                        <h2 className="text-2xl font-bold text-cyan-400 border-b-2 border-slate-700 pb-2 mb-6">III. Assertion & Reason</h2>
                        <div className="space-y-8">
                             {arQuestions.map((q) => {
                                questionCounter++;
                                const originalIndex = questions.indexOf(q);
                                return <QuestionItem 
                                    key={originalIndex}
                                    question={q} 
                                    number={questionCounter}
                                    questionIndex={originalIndex}
                                    isSubmitted={isSubmitted}
                                    userAnswer={userAnswers[originalIndex]}
                                    onAnswerChange={handleAnswerChange}
                                />;
                            })}
                        </div>
                    </section>
                )}

                {qaQuestions.length > 0 && (
                     <section>
                        <h2 className="text-2xl font-bold text-cyan-400 border-b-2 border-slate-700 pb-2 mb-6">IV. Question & Answer</h2>
                        <div className="space-y-8">
                             {qaQuestions.map((q) => {
                                questionCounter++;
                                const originalIndex = questions.indexOf(q);
                                return <QuestionItem 
                                    key={originalIndex}
                                    question={q} 
                                    number={questionCounter}
                                    questionIndex={originalIndex}
                                    isSubmitted={isSubmitted}
                                    userAnswer={userAnswers[originalIndex]}
                                    onAnswerChange={handleAnswerChange}
                                />;
                            })}
                        </div>
                    </section>
                )}
            </div>
            
            {/* Footer Controls */}
            <div className="mt-12 pt-8 border-t border-slate-800 flex justify-center no-print">
                {!isSubmitted ? (
                    <button
                        onClick={handleSubmit}
                        className="px-10 py-4 bg-green-600 text-white font-bold text-xl rounded-lg shadow-lg hover:bg-green-500 transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75"
                    >
                        Submit Worksheet
                    </button>
                ) : (
                    <button
                        onClick={onRestart}
                        className="px-10 py-4 bg-slate-800 text-white font-bold text-xl rounded-lg shadow-lg hover:bg-slate-700 transition-colors"
                    >
                        Start Over
                    </button>
                )}
            </div>

        </div>
    );
};

export default Worksheet;