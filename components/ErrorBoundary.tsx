import React, { ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<Props, State> {
  // FIX: The constructor-based state initialization was causing type errors.
  // Switched to the class property syntax, which is a more modern and robust way to initialize state in React class components.
  public state: State = {
    hasError: false,
    error: undefined,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="w-full max-w-2xl mx-auto p-8 bg-slate-900 rounded-xl shadow-2xl border border-red-500 text-center flex flex-col items-center justify-center min-h-screen">
            <h1 className="text-3xl font-bold text-red-400">Oops! Something went wrong.</h1>
            <p className="text-slate-300 mt-4">A critical error occurred and the application cannot continue.</p>
            <p className="text-slate-400 mt-2 text-sm">Please try refreshing the page. If the problem persists, please check your browser console for more details.</p>
            {this.state.error && (
                <pre className="mt-4 p-4 bg-slate-950/50 text-left text-xs text-red-300 rounded-md overflow-x-auto w-full">
                    <strong>Error:</strong> {this.state.error.message}
                </pre>
            )}
             <button
                onClick={() => window.location.reload()}
                className="mt-6 px-6 py-2 bg-cyan-600 text-white font-bold rounded-lg shadow-lg hover:bg-cyan-500 transition-colors"
                >
                Refresh Page
            </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
