import React, { Component, ErrorInfo, ReactNode } from 'react';
import api from '../api/api.client';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error to the backend
    try {
      api.post('/logs/client', {
        message: error.message,
        stack: error.stack,
        url: window.location.href,
        userAgent: navigator.userAgent,
      }).catch(err => {
        // Fail silently if logging fails
        console.error('Failed to log error to backend', err);
      });
    } catch (e) {
      console.error('CRITIAL FRONTEND ERROR', e);
    }
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-6">
            <AlertCircle size={32} />
          </div>
          <h1 className="text-2xl font-bold font-heading mb-3">Something went wrong</h1>
          <p className="text-muted-foreground max-w-sm mb-8">
            An unexpected error occurred. The system has automatically recorded this for our engineers to investigate.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-md font-semibold hover:opacity-90 transition-all active:scale-95"
          >
            <RefreshCw size={18} />
            Refresh App
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
