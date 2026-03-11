import React from 'react';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI.
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        // You can also log the error to an error reporting service
        console.error("ErrorBoundary caught an error:", error, errorInfo);
        this.setState({ error, errorInfo });
    }

    render() {
        if (this.state.hasError) {
            // You can render any custom fallback UI
            return (
                <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl max-w-md w-full text-center space-y-6">
                        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertTriangle className="w-8 h-8 text-red-500" />
                        </div>
                        
                        <div>
                            <h1 className="text-2xl font-bold text-white mb-2">Something went wrong</h1>
                            <p className="text-gray-400 text-sm">
                                An unexpected error occurred while rendering this component.
                            </p>
                        </div>

                        {import.meta.env.DEV && this.state.error && (
                            <div className="mt-4 p-4 bg-black/50 rounded-lg text-left overflow-auto text-xs font-mono text-red-400 border border-red-500/20 max-h-40">
                                {this.state.error.toString()}
                            </div>
                        )}

                        <div className="pt-6 flex flex-col gap-3">
                            <button 
                                onClick={() => window.location.reload()}
                                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-colors"
                            >
                                <RefreshCw className="w-4 h-4" /> Try Again
                            </button>
                            <Link 
                                to="/"
                                className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-colors"
                                onClick={() => this.setState({ hasError: false })}
                            >
                                <Home className="w-4 h-4" /> Go to Home
                            </Link>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children; 
    }
}

export default ErrorBoundary;
