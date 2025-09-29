import React from 'react';
import type { Grade, NoteSection } from '../types';

interface NotesProps {
    notes: NoteSection[];
    onRestart: () => void;
    grade: Grade;
    topic: string;
}

const Notes: React.FC<NotesProps> = ({ notes, onRestart, grade, topic }) => {
    return (
        <div className="w-full max-w-4xl mx-auto p-6 md:p-8 bg-slate-800 rounded-xl shadow-2xl border border-slate-700 printable-worksheet">
            {/* Header and Controls */}
            <div className="mb-8 print:mb-4 no-print">
                <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-300">Notes Generated!</h1>
                <p className="text-slate-400 mt-1">Here are the key points for your chapter.</p>
                <div className="mt-6 flex flex-wrap gap-4">
                    <button
                        onClick={() => window.print()}
                        className="px-6 py-2 bg-cyan-600 text-white font-bold rounded-lg shadow-lg hover:bg-cyan-500 transition-colors"
                    >
                        Print Notes
                    </button>
                    <button
                        onClick={onRestart}
                        className="px-6 py-2 bg-slate-700 text-white font-bold rounded-lg shadow-lg hover:bg-slate-600 transition-colors"
                    >
                        Start Over
                    </button>
                </div>
            </div>

             {/* Printable Header */}
            <div className="text-center mb-8 border-b border-slate-600 pb-4">
                <h2 className="text-3xl font-bold text-slate-100">Chapter Notes</h2>
                <div className="flex justify-center gap-6 text-slate-300 mt-2">
                    <span><strong>Grade:</strong> {grade}</span>
                    <span><strong>Chapter:</strong> {topic}</span>
                </div>
            </div>

            {/* Notes List */}
            <section className="worksheet-notes space-y-10">
                {notes.map((section, index) => (
                    <div key={index}>
                        <h3 className="text-2xl font-bold text-cyan-400 border-b-2 border-slate-600 pb-2 mb-5">{section.title}</h3>
                        <ul className="space-y-4 pl-5 list-disc text-slate-300">
                        {section.points.map((point, pointIndex) => (
                            <li key={pointIndex} className="leading-relaxed text-xl">{point}</li>
                        ))}
                        </ul>
                    </div>
                ))}
            </section>
        </div>
    );
};

export default Notes;