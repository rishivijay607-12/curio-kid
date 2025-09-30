import React from 'react';

interface FeatureNotConfiguredScreenProps {
  featureName: string;
  onBack: () => void;
}

const FeatureNotConfiguredScreen: React.FC<FeatureNotConfiguredScreenProps> = ({ featureName, onBack }) => {
  return (
    <div className="w-full max-w-lg mx-auto p-8 text-center bg-slate-900 rounded-xl shadow-2xl border border-slate-800">
      <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400 mb-4">
        Feature Not Available
      </h2>
      <p className="text-slate-300 text-lg mb-6">
        The "{featureName}" feature has not been configured by the administrator yet.
      </p>
      <p className="text-slate-400 mb-8">
        This feature requires a one-time setup by the admin to function. Please ask them to log in and provide the necessary API key.
      </p>
      <button
        onClick={onBack}
        className="px-8 py-3 bg-cyan-600 text-white font-bold rounded-lg shadow-lg hover:bg-cyan-500 transition-transform transform hover:scale-105"
      >
        Back to Home
      </button>
    </div>
  );
};

export default FeatureNotConfiguredScreen;
