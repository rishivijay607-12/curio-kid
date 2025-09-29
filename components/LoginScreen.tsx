import React, { useState } from 'react';

interface LoginScreenProps {
  onLoginSuccess: () => void;
}

const CuriosityLogo: React.FC = () => (
    <svg className="h-16 w-16 text-cyan-400" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="32" cy="19" r="10" stroke="currentColor" strokeWidth="4"/>
        <circle cx="45" cy="32" r="10" stroke="currentColor" strokeWidth="4"/>
        <circle cx="32" cy="45" r="10" stroke="currentColor" strokeWidth="4"/>
        <circle cx="19" cy="32" r="10" stroke="currentColor" strokeWidth="4"/>
    </svg>
);


const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you'd have validation and an API call here.
    // For this demo, we'll just check if fields are not empty.
    if (username.trim() && password.trim()) {
      onLoginSuccess();
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-4">
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl shadow-2xl p-8 md:p-12 text-center">
        <div className="flex justify-center mb-6">
          <CuriosityLogo />
        </div>

        <h1 className="text-4xl font-bold text-slate-100">The Book of Curiosity</h1>
        <p className="text-slate-400 mt-2 mb-8">Welcome back, curious mind!</p>

        <form onSubmit={handleLogin} className="space-y-6 text-left">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-slate-300 mb-2">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g., MarieCurieFan"
              className="w-full bg-slate-900/50 border border-slate-600 rounded-lg p-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-colors"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="****************"
              className="w-full bg-slate-900/50 border border-slate-600 rounded-lg p-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-colors"
            />
          </div>

          <div className="flex items-center justify-between pt-4">
            <button
              type="submit"
              className="px-8 py-3 bg-teal-500 text-white font-bold rounded-lg shadow-lg hover:bg-teal-400 transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-teal-300 focus:ring-opacity-75"
            >
              Login
            </button>
            <button type="button" className="text-cyan-400 font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-cyan-400 rounded-md p-1">
              Create an account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginScreen;
