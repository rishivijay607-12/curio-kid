
import React from 'react';

interface ErrorScreenProps {
  errorCode: number;
  errorMessage: string;
  onGoHome: () => void;
}

const Error500Icon: React.FC = () => (
    <svg className="h-24 w-24 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.098 19.502c-1.54.002-2.503-1.666-1.732-3L9.268 3.5c.77-1.333 2.694-1.333 3.464 0l6.902 13.002c.77 1.333-.192 3-1.732 3H4.098zM12 9v3.999" stroke="none" fill="currentColor" opacity="0.1" />
    </svg>
);

const Error404Icon: React.FC = () => (
    <svg className="h-24 w-24 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
         <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18z" stroke="none" fill="currentColor" opacity="0.1" />
    </svg>
);

const ErrorApiIcon: React.FC = () => (
    <svg className="h-24 w-24 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
         <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" stroke="none" fill="currentColor" opacity="0.1" />
    </svg>
);


const ErrorScreen: React.FC<ErrorScreenProps> = ({ errorCode, errorMessage, onGoHome }) => {
    const getErrorDetails = () => {
        switch (errorCode) {
            case 404:
                return {
                    icon: <Error404Icon />,
                    title: "Page Not Found",
                    description: "The page you're looking for doesn't exist or has been moved."
                };
            case 500:
                return {
                    icon: <Error500Icon />,
                    title: "Internal Server Error",
                    description: "Something went wrong on our end. We're working to fix it."
                };
            default:
                return {
                    icon: <ErrorApiIcon />,
                    title: "An Error Occurred",
                    description: "There was a problem processing your request."
                };
        }
    };

    const { icon, title, description } = getErrorDetails();

    return (
        <div className="w-full max-w-2xl mx-auto p-8 bg-slate-900 rounded-xl shadow-2xl border border-slate-800 text-center flex flex-col items-center">
            <div className="mb-6">{icon}</div>
            <h1 className="text-4xl font-bold text-slate-100">{title}</h1>
            <p className="text-slate-400 mt-2 text-lg">{description}</p>
            
            <div className="mt-6 p-4 w-full bg-slate-950/50 text-left text-sm text-slate-300 rounded-md overflow-x-auto">
                <strong>Details:</strong>
                <pre className="whitespace-pre-wrap mt-1">{errorMessage}</pre>
            </div>
            
            <button
                onClick={onGoHome}
                className="mt-8 px-8 py-3 bg-cyan-600 text-white font-bold rounded-lg shadow-lg hover:bg-cyan-500 transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-opacity-75"
            >
                Go to Home
            </button>
        </div>
    );
};

export default ErrorScreen;
