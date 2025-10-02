import React from 'react';

const ApiKeyInstructions: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen text-white p-4">
      <div className="w-full max-w-2xl text-center p-8 bg-slate-900 border-2 border-red-500 rounded-2xl shadow-2xl">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-red-400" fill="none" viewBox="0 0 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <h1 className="text-3xl font-bold mt-4 text-red-300">Configuration Required</h1>
        <p className="mt-4 text-slate-300 text-lg">
          The Google Gemini API Key is missing.
        </p>
        <div className="mt-6 text-left bg-slate-950 p-6 rounded-lg border border-slate-700">
            <p className="text-slate-400 font-semibold">To run this application on a platform like Vercel, you must:</p>
            <ol className="list-decimal list-inside mt-2 text-slate-200 space-y-2">
              <li>Create an environment variable named <code className="bg-slate-700 px-2 py-1 rounded-md text-cyan-300">API_KEY</code> with your key as the value.</li>
              <li>Set a specific build command to make the key available to the app (see deployment instructions).</li>
            </ol>
        </div>
         <p className="mt-6 text-sm text-slate-500">
            The application will not function until it has been configured and redeployed.
        </p>
      </div>
    </div>
  );
};

export default ApiKeyInstructions;
