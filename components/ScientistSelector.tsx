import React from 'react';
import type { Scientist } from '../types';
import { SCIENTISTS } from '../constants';

interface ScientistSelectorProps {
  onScientistSelect: (scientist: Scientist) => void;
}

const ScientistCard: React.FC<{ scientist: Scientist; onClick: () => void }> = ({ scientist, onClick }) => (
    <button
        onClick={onClick}
        className="text-left w-full h-full p-6 bg-slate-900 border-2 border-slate-800 rounded-xl shadow-lg hover:bg-slate-800 hover:border-cyan-500 transition-all duration-200 transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-opacity-75 flex flex-col"
    >
        <h3 className="text-2xl font-bold text-slate-100">{scientist.name}</h3>
        <p className="text-cyan-400 font-semibold mt-1">{scientist.field}</p>
        <p className="text-slate-400 text-sm mt-3 flex-grow">{scientist.description}</p>
    </button>
);

const ScientistSelector: React.FC<ScientistSelectorProps> = ({ onScientistSelect }) => {
  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-8">
      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-300">
          Chat with History
        </h1>
        <p className="text-slate-300 mt-6 text-xl">
          Select a famous scientist to talk to.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {SCIENTISTS.map(scientist => (
            <ScientistCard key={scientist.name} scientist={scientist} onClick={() => onScientistSelect(scientist)} />
        ))}
      </div>
    </div>
  );
};

export default ScientistSelector;