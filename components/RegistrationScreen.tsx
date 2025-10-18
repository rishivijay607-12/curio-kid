import React, { useState } from 'react';

interface RegistrationScreenProps {
  // FIX: Changed return type to Promise<void> to match the actual implementation.
  // The component uses try/catch, so it doesn't need a boolean return value.
  onRegister: (username: string, password: string) => Promise<void>;
  onNavigateToLogin: () => void;
}

const CuriosityLogo: React.FC = () => (
    <svg className="h-16 w-16 text-cyan-400" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="32" cy="19" r="10" stroke="currentColor" strokeWidth="4"/>
        <circle cx="45" cy="32" r="10" stroke="currentColor" strokeWidth="4"/>
        <circle cx="32" cy="45" r="10" stroke="currentColor" strokeWidth="4"/>
        <circle cx="19" cy="32" r="10" stroke="currentColor" strokeWidth="4"/>
    </svg>
);

const RegistrationScreen: React.FC<RegistrationScreenProps> = ({ onRegister, onNavigateToLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password.trim()) {
      setError("Username and password are required.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setIsLoading(true);
    try {
      await onRegister(username.trim(), password);
      // On success, the App component will change the view.
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred during registration.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-4">
      <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl shadow-2xl p-8 md:p-12 text-center">
        <div className="flex justify-center mb-6">
          <CuriosityLogo />
        </div>

        <h1 className="text-4xl font-bold text-slate-100">Create Account</h1>
        <p className="text-slate-400 mt-2 mb-8">Join the community of curious minds!</p>
        
        {error && (
            <div className="mb-4 p-3 bg-red-900/50 border border-red-500 rounded-lg text-red-400 text-sm">
                {error}
            </div>
        )}

        <form onSubmit={handleRegister} className="space-y-6 text-left">
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
              placeholder="Choose a username"
              className="w-full bg-slate-950/50 border border-slate-700 rounded-lg p-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-colors"
              disabled={isLoading}
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
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="6+ characters"
              className="w-full bg-slate-950/50 border border-slate-700 rounded-lg p-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-colors"
              disabled={isLoading}
            />
          </div>

           <div>
            <label htmlFor="confirm-password" className="block text-sm font-medium text-slate-300 mb-2">
              Confirm Password
            </label>
            <input
              id="confirm-password"
              name="confirm-password"
              type="password"
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your password"
              className="w-full bg-slate-950/50 border border-slate-700 rounded-lg p-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-colors"
              disabled={isLoading}
            />
          </div>

          <div className="flex items-center justify-between pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="px-8 py-3 bg-teal-500 text-white font-bold rounded-lg shadow-lg hover:bg-teal-400 transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-teal-300 focus:ring-opacity-75 disabled:bg-slate-700 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating Account...' : 'Sign Up'}
            </button>
            <button 
              type="button" 
              onClick={onNavigateToLogin}
              className="text-cyan-400 font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-cyan-400 rounded-md p-1"
            >
              Already have an account?
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegistrationScreen;