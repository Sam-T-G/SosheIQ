import React, { useState } from "react";
import { IconComponentProps } from "../types";
import {
	ArrowLeftIcon,
	GoogleIcon,
	AppleIcon,
	EnvelopeIcon,
	PlayIcon,
} from "./Icons";
import { SosheIQLogo } from "./SosheIQLogo";
import { useAuth } from "../contexts/AuthContext";

interface LoginScreenProps {
	onNavigateToHome: () => void;
	onContinueAsGuest: () => void;
	onNavigateToTerms: () => void;
	onNavigateToPrivacy: () => void;
	onAuthSuccess?: () => void;
}

const AuthButton: React.FC<{
	Icon: React.FC<IconComponentProps>;
	children: React.ReactNode;
	onClick: () => void;
	disabled?: boolean;
	loading?: boolean;
}> = ({ Icon, children, onClick, disabled = false, loading = false }) => (
	<button
		onClick={onClick}
		disabled={disabled || loading}
		className={`w-full flex items-center justify-center gap-3 px-4 py-3 border rounded-lg font-semibold transition-all duration-200 
                   ${
											disabled || loading
												? "bg-slate-700/60 border-slate-600 text-white cursor-not-allowed opacity-50"
												: "bg-slate-700/80 border-slate-600 text-white hover:bg-slate-600/80 hover:border-slate-500 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-slate-400 focus:ring-opacity-50"
										}`}
		title={disabled ? "Coming soon" : undefined}>
		<Icon className="h-6 w-6" />
		<span>{loading ? "Signing in..." : children}</span>
	</button>
);

export const LoginScreen: React.FC<LoginScreenProps> = ({
	onNavigateToHome,
	onContinueAsGuest,
	onNavigateToTerms,
	onNavigateToPrivacy,
	onAuthSuccess,
}) => {
	const { login, loginAsGuest, isLoading, error, clearError } = useAuth();
	const [authProvider, setAuthProvider] = useState<string | null>(null);

	const handleProviderLogin = async (
		provider: "google" | "apple" | "email"
	) => {
		try {
			clearError();
			setAuthProvider(provider);
			await login(provider);
			onAuthSuccess?.();
		} catch (error) {
			console.error(`${provider} login failed:`, error);
			setAuthProvider(null);
		}
	};

	const handleGuestLogin = async () => {
		try {
			clearError();
			setAuthProvider("guest");
			await loginAsGuest();
			onContinueAsGuest();
		} catch (error) {
			console.error("Guest login failed:", error);
			setAuthProvider(null);
		}
	};

	const isProviderLoading = (provider: string) => {
		return isLoading && authProvider === provider;
	};

	return (
		<div className="w-full max-w-md p-6 md:p-8 bg-slate-900/70 border border-slate-700 backdrop-blur-lg rounded-xl shadow-2xl space-y-8 animate-fadeIn">
			<div className="text-center">
				<SosheIQLogo className="h-20 w-auto mx-auto mb-4" />
				<h1 className="text-3xl font-bold text-sky-400">Sign In</h1>
				<p className="text-gray-400 mt-2">
					Choose your preferred sign-in method
				</p>
			</div>

			{error && (
				<div className="bg-red-800/20 border border-red-700 text-red-300 rounded-lg p-4 text-sm">
					{error}
				</div>
			)}

			<div className="space-y-4">
				<AuthButton
					Icon={GoogleIcon}
					onClick={() => handleProviderLogin("google")}
					disabled={true}
					loading={isProviderLoading("google")}>
					Continue with Google
				</AuthButton>
				<AuthButton
					Icon={AppleIcon}
					onClick={() => handleProviderLogin("apple")}
					disabled={true}
					loading={isProviderLoading("apple")}>
					Continue with Apple
				</AuthButton>
				<AuthButton
					Icon={EnvelopeIcon}
					onClick={() => handleProviderLogin("email")}
					disabled={true}
					loading={isProviderLoading("email")}>
					Continue with Email
				</AuthButton>
			</div>

			<div className="flex items-center text-gray-500">
				<div className="flex-grow border-t border-slate-700"></div>
				<span className="flex-shrink mx-4 text-sm">OR</span>
				<div className="flex-grow border-t border-slate-700"></div>
			</div>

			<div className="flex flex-col gap-4">
				<button
					onClick={handleGuestLogin}
					disabled={isLoading}
					className="group w-full px-8 py-4 bg-teal-500 hover:bg-teal-400 disabled:bg-teal-500/50 disabled:cursor-not-allowed text-white font-bold rounded-lg text-lg shadow-lg 
                     transition-all duration-200 ease-in-out transform hover:scale-105 focus:outline-none 
                     focus:ring-4 focus:ring-teal-300 focus:ring-opacity-50 flex items-center justify-center space-x-2"
					aria-label="Continue as Guest and go to setup">
					<span>
						{isProviderLoading("guest") ? "Setting up..." : "Continue as Guest"}
					</span>
					<PlayIcon className="h-5 w-5 transition-transform group-hover:translate-x-1" />
				</button>

				<button
					onClick={onNavigateToHome}
					disabled={isLoading}
					className="text-sm font-semibold text-gray-400 hover:text-white disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
					aria-label="Go back to the homepage">
					Back to Home
				</button>
			</div>

			<div className="text-center text-xs text-gray-500 pt-4 border-t border-slate-800">
				<p>
					By continuing, you agree to our{" "}
					<button
						onClick={onNavigateToTerms}
						className="underline hover:text-white transition-colors">
						Terms of Service
					</button>{" "}
					and{" "}
					<button
						onClick={onNavigateToPrivacy}
						className="underline hover:text-white transition-colors">
						Privacy Policy
					</button>
					.
				</p>
			</div>
		</div>
	);
};
