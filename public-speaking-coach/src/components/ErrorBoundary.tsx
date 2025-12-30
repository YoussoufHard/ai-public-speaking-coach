import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) return this.props.fallback;
            return (
                <div className="flex flex-col items-center justify-center h-full p-4 text-center bg-black/20 rounded-xl border border-red-500/20">
                    <AlertTriangle className="w-8 h-8 text-red-400 mb-2" />
                    <h3 className="text-sm font-bold text-red-200">Une erreur est survenue</h3>
                    <p className="text-xs text-red-300/70 mt-1 max-w-[200px]">
                        {this.state.error?.message || "Erreur d'affichage"}
                    </p>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
