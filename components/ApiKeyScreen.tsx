import React, { useState } from 'react';

interface ApiKeyScreenProps {
  onKeySaved: (key: string) => void;
  error: string | null;
}

const CuriosityLogo: React.FC = () => (
    <svg className="h-16 w-16 text-cyan-400" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="32" cy="19" r="10" stroke="currentColor" strokeWidth="4"/>
        <circle cx="45" cy="32" r="10" stroke="currentColor" strokeWidth="4"/>
        <circle cx="32" cy="45" r="10" stroke="currentColor" strokeWidth="4"/>
        <circle cx="19" cy="32" r="10" stroke="currentColor" strokeWidth="4"/>
    </svg>
);


const ApiKeyScreen: React.FC<ApiKeyScreenProps> = ({ onKeySaved, error }) => {
  const [apiKey, setApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim() || isLoading) return;
    
    setIsLoading(true);
    // The parent component handles the actual saving and state transition.
    onKeySaved(apiKey.trim());
    // We don't set isLoading to false because the component will unmount.
  };

  return (
    <div className="w-full max-w-lg mx-auto p-4">
      <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl shadow-2xl p-8 md:p-12 text-center">
        <div className="flex justify-center mb-6">
          <CuriosityLogo />
        </div>

        <h1 className="text-3xl font-bold text-slate-100">Welcome to Curio Kid!</h1>
        <p className="text-slate-400 mt-2 mb-6">
          This app is powered by Google's Gemini AI. To begin, please enter your Gemini API key.
        </p>

        <div className="text-sm text-slate-500 bg-slate-800/50 p-3 rounded-lg mb-6">
            You can get a free API key from{' '}
            <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-cyan-400 font-medium hover:underline">
                Google AI Studio
            </a>. Your key is stored securely in your browser's local storage and is never sent to our servers.
        </div>
        
        {error && (
            <div className="mb-4 p-3 bg-red-900/50 border border-red-500 rounded-lg text-red-400 text-sm">
                {error}
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 text-left">
          <div>
            <label htmlFor="apiKey" className="block text-sm font-medium text-slate-300 mb-2">
              Gemini API Key
            </label>
            <input
              id="apiKey"
              name="apiKey"
              type="password"
              required
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your API key here"
              className="w-full bg-slate-950/50 border border-slate-700 rounded-lg p-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-colors"
              disabled={isLoading}
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading || !apiKey.trim()}
              className="w-full px-8 py-3 bg-teal-500 text-white font-bold rounded-lg shadow-lg hover:bg-teal-400 transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-teal-300 focus:ring-opacity-75 disabled:bg-slate-700 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Saving...' : 'Save & Continue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApiKeyScreen;