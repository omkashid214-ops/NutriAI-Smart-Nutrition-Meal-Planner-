import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: Error): State {
    let readable = error.message || 'An unexpected error occurred.';
    try {
      const parsed = JSON.parse(error.message);
      if (parsed && typeof parsed.error === 'string') {
        readable = `Data access error (${parsed.operationType || 'operation'}): ${parsed.error}`;
      }
    } catch {
      // Plain error message
    }
    return { hasError: true, errorMessage: readable };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    console.error('NutriAI ErrorBoundary caught:', error, info);
  }

  handleReload = (): void => {
    this.setState({ hasError: false, errorMessage: '' });
    window.location.reload();
  };

  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F7F8F4] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white border border-[#E2E8DF] rounded-3xl p-8 text-center shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-[#FEF2F2] text-[#B91C1C] flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h2 className="font-display text-xl font-semibold text-[#14231A] mb-2">
              Something went wrong
            </h2>
            <p className="text-sm text-[#526458] mb-6 leading-relaxed break-words">
              {this.state.errorMessage}
            </p>
            <button
              type="button"
              onClick={this.handleReload}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 min-h-[44px] rounded-xl bg-[#1B6B40] text-white text-sm font-medium hover:bg-[#14532D] transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Reload NutriAI
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
