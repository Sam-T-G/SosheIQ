import React from "react";
import { IconComponentProps } from "../types";
import {
	ArrowLeftIcon,
	GoogleIcon,
	AppleIcon,
	EnvelopeIcon,
	PlayIcon,
} from "./Icons";
import { SosheIQLogo } from "./SosheIQLogo";

interface LoginScreenProps {
	onNavigateToHome: () => void;
	onContinueAsGuest: () => void;
	onNavigateToTerms: () => void;
	onNavigateToPrivacy: () => void;
}

const AuthButton: React.FC<{
	Icon: React.FC<IconComponentProps>;
	children: React.ReactNode;
}> = ({ Icon, children }) => (
	<button
		disabled
		className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-slate-700/60 border border-slate-600 rounded-lg text-white font-semibold transition-colors
               cursor-not-allowed opacity-50"
		title="Coming soon">
		<Icon className="h-6 w-6" />
		<span>{children}</span>
	</button>
);

export const LoginScreen: React.FC<LoginScreenProps> = ({
	onNavigateToHome,
	onContinueAsGuest,
	onNavigateToTerms,
	onNavigateToPrivacy,
}) => {
	return (
		<div className="w-full max-w-md p-6 md:p-8 bg-slate-900/70 border border-slate-700 backdrop-blur-lg rounded-xl shadow-2xl space-y-8 animate-fadeIn">
			<div className="text-center">
				<SosheIQLogo className="h-20 w-auto mx-auto mb-4" />
				<h1 className="text-3xl font-bold text-sky-400">Sign In</h1>
				<p className="text-gray-400 mt-2">Unlock full features (coming soon)</p>
			</div>

			<div className="space-y-4">
				<AuthButton Icon={GoogleIcon}>Continue with Google</AuthButton>
				<AuthButton Icon={AppleIcon}>Continue with Apple</AuthButton>
				<AuthButton Icon={EnvelopeIcon}>Continue with Email</AuthButton>
			</div>

			<div className="flex items-center text-gray-500">
				<div className="flex-grow border-t border-slate-700"></div>
				<span className="flex-shrink mx-4 text-sm">OR</span>
				<div className="flex-grow border-t border-slate-700"></div>
			</div>

			<div className="flex flex-col gap-4">
				<button
					onClick={onContinueAsGuest}
					className="group w-full px-8 py-4 bg-teal-500 hover:bg-teal-400 text-white font-bold rounded-lg text-lg shadow-lg 
                     transition-all duration-200 ease-in-out transform hover:scale-105 focus:outline-none 
                     focus:ring-4 focus:ring-teal-300 focus:ring-opacity-50 flex items-center justify-center space-x-2"
					aria-label="Continue as Guest and go to setup">
					<span>Continue as Guest</span>
					<PlayIcon className="h-5 w-5 transition-transform group-hover:translate-x-1" />
				</button>

				<button
					onClick={onNavigateToHome}
					className="text-sm font-semibold text-gray-400 hover:text-white transition-colors"
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
