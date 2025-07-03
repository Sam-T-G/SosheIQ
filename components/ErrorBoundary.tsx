import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
	children: ReactNode;
	fallback?: ReactNode;
}

interface State {
	hasError: boolean;
	error?: Error;
	errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = { hasError: false };
	}

	static getDerivedStateFromError(error: Error): State {
		return { hasError: true, error };
	}

	componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		console.error("ErrorBoundary caught an error:", error, errorInfo);
		this.setState({ error, errorInfo });
	}

	render() {
		if (this.state.hasError) {
			if (this.props.fallback) {
				return this.props.fallback;
			}

			return (
				<div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
					<div className="max-w-md w-full bg-slate-800 rounded-lg shadow-xl p-6 border border-red-500/50">
						<div className="text-center">
							<div className="text-red-400 text-6xl mb-4">⚠️</div>
							<h1 className="text-2xl font-bold text-white mb-2">
								Something went wrong
							</h1>
							<p className="text-gray-300 mb-6">
								We encountered an unexpected error. Please try refreshing the
								page.
							</p>
							<button
								onClick={() => window.location.reload()}
								className="bg-teal-600 hover:bg-teal-500 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
								Refresh Page
							</button>
							{process.env.NODE_ENV === "development" && this.state.error && (
								<details className="mt-4 text-left">
									<summary className="text-red-400 cursor-pointer">
										Error Details (Development)
									</summary>
									<pre className="mt-2 text-xs text-gray-400 bg-slate-900 p-2 rounded overflow-auto">
										{this.state.error.toString()}
										{this.state.errorInfo?.componentStack}
									</pre>
								</details>
							)}
						</div>
					</div>
				</div>
			);
		}

		return this.props.children;
	}
}
