import React from 'react';

interface DurationSelectorProps {
  onDurationSelect: (durationInSeconds: number) => void;
}

const AtomIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.5 3.5C14.5 5.433 12.933 7 11 7s-3.5-1.567-3.5-3.5S9.067 0 11 0s3.5 1.567 3.5 3.5zM11 24c-1.933 0-3.5-1.567-3.5-3.5S9.067 17 11 17s3.5 1.567 3.5 3.5S12.933 24 11 24zM3.5 14.5C1.567 14.5 0 12.933 0 11s1.567-3.5 3.5-3.5S7 9.067 7 11s-1.567 3.5-3.5 3.5zM18.5 14.5C16.567 14.5 15 12.933 15 11s1.567-3.5 3.5-3.5S22 9.067 22 11s-1.567 3.5-3.5 3.5z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 21a10 10 0 100-20 10 10 0 000 20z" />
    </svg>
);

const DurationButton: React.FC<{ duration: number; onClick: (duration: number) => void }> = ({ duration, onClick }) => (
  <button
    onClick={() => onClick(duration)}
    className="w-full text-center px-6 py-5 bg-slate-900 border-2 border-slate-800 rounded-xl shadow-lg hover:bg-slate-800 hover:border-cyan-500 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-opacity-75"
  >
    <span className="text-2xl font-bold text-slate-100">{duration}</span>
    <span className="text-lg text-slate-300"> Seconds</span>
  </button>
);


const DurationSelector: React.FC<DurationSelectorProps> = ({ onDurationSelect }) => {
  const durations = [15, 30, 45];
  return (
    <div className="w-full max-w-2xl mx-auto p-4 md:p-8">
      <div className="text-center mb-10">
        <div className="flex justify-center items-center gap-4">
          <AtomIcon />
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-300">
            Educational Video
          </h1>
        </div>
        <p className="text-slate-300 mt-6 text-xl">
          How long should the video be?
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {durations.map((duration) => (
          <DurationButton key={duration} duration={duration} onClick={onDurationSelect} />
        ))}
      </div>
    </div>
  );
};

export default DurationSelector;