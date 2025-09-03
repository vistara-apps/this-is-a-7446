import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './ui/Button';
import { formatErrorForDisplay } from '../utils/errorHandler';

/**
 * Error Boundary component to catch and display errors in the React component tree
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to an error reporting service
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });
    
    // Call the onError prop if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({ 
      hasError: false,
      error: null,
      errorInfo: null
    });
    
    // Call the onReset prop if provided
    if (this.props.onReset) {
      this.props.onReset();
    }
  }

  render() {
    if (this.state.hasError) {
      // Format the error for display
      const formattedError = formatErrorForDisplay(this.state.error);
      
      // Use the fallback UI provided as a prop, or the default fallback
      if (this.props.fallback) {
        return this.props.fallback({
          error: this.state.error,
          errorInfo: this.state.errorInfo,
          reset: this.handleReset
        });
      }
      
      // Default fallback UI
      return (
        <div className="p-6 border border-red-200 rounded-lg bg-red-50 text-red-800">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-6 h-6" />
            <h2 className="text-lg font-semibold">{formattedError?.title || 'Something went wrong'}</h2>
          </div>
          
          <p className="mb-4">{formattedError?.message || 'An unexpected error occurred.'}</p>
          
          {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
            <details className="mb-4">
              <summary className="cursor-pointer text-sm font-medium">Error Details</summary>
              <pre className="mt-2 p-2 bg-red-100 rounded text-xs overflow-auto">
                {this.state.error?.toString()}
                <br />
                {this.state.errorInfo.componentStack}
              </pre>
            </details>
          )}
          
          <Button onClick={this.handleReset} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      );
    }

    // When there's no error, render children normally
    return this.props.children;
  }
}

export default ErrorBoundary;

