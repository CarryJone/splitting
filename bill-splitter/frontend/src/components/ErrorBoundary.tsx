import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RefreshCcw, AlertTriangle } from 'lucide-react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
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
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
                    <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center border border-gray-100">
                        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertTriangle className="w-8 h-8 text-red-500" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">出了一點問題</h1>
                        <p className="text-gray-500 mb-6">
                            系統偵測到未預期的錯誤。這可能是因為資料更新導致的暫時性問題。
                        </p>

                        <div className="bg-gray-100 p-4 rounded-xl text-left mb-6 overflow-auto max-h-32 text-xs text-gray-600 font-mono">
                            {this.state.error?.message}
                        </div>

                        <div className="space-y-3">
                            <button
                                onClick={() => window.location.reload()}
                                className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-brand-600/20 active:translate-y-0.5"
                            >
                                <RefreshCcw className="w-5 h-5" />
                                重新整理頁面
                            </button>
                            <button
                                onClick={() => {
                                    localStorage.clear();
                                    window.location.href = '/';
                                }}
                                className="w-full text-gray-400 hover:text-red-500 font-medium py-2 text-sm transition-colors"
                            >
                                清除快取並回首頁
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
