import React from "react";
// Removed motion and AnimatePresence for instant rendering

interface FooterProps {
	onNavigateToPrivacy: () => void;
	onNavigateToTerms: () => void;
	onNavigateToSafety: () => void;
	onNavigateToAbout: () => void;
	onNavigateToInstructions: () => void;
	isFadingOut?: boolean;
}

export const Footer: React.FC<FooterProps> = ({
	onNavigateToPrivacy,
	onNavigateToTerms,
	onNavigateToSafety,
	onNavigateToAbout,
	onNavigateToInstructions,
	isFadingOut = false,
}) => {
	if (isFadingOut) return null;
	return (
		<footer className="bg-slate-800 border-t border-slate-700 mt-auto relative z-20">
			<div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row justify-center items-center text-center gap-4">
				<div className="flex flex-wrap items-center justify-center gap-x-4 sm:gap-x-6 gap-y-2">
					<button
						onClick={onNavigateToAbout}
						className="text-sm font-semibold text-gray-400 hover:text-white transition-colors"
						aria-label="About SosheIQ">
						About
					</button>
					<span className="text-gray-600 hidden sm:inline">|</span>
					<button
						onClick={onNavigateToInstructions}
						className="text-sm font-semibold text-gray-400 hover:text-white transition-colors"
						aria-label="How it works">
						How it works
					</button>
					<span className="text-gray-600 hidden sm:inline">|</span>
					<button
						onClick={onNavigateToSafety}
						className="text-sm font-semibold text-gray-400 hover:text-white transition-colors"
						aria-label="AI Safety Information">
						Safety
					</button>
					<span className="text-gray-600 hidden sm:inline">|</span>
					<button
						onClick={onNavigateToPrivacy}
						className="text-sm font-semibold text-gray-400 hover:text-white transition-colors"
						aria-label="Privacy Policy">
						Privacy
					</button>
					<span className="text-gray-600 hidden sm:inline">|</span>
					<button
						onClick={onNavigateToTerms}
						className="text-sm font-semibold text-gray-400 hover:text-white transition-colors"
						aria-label="Terms of Service">
						Terms
					</button>
				</div>
			</div>
		</footer>
	);
};
