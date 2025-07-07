import React from "react";
import {
	PlayIcon,
	QuestionMarkIcon,
	SparklesIcon,
	ArrowRightIcon,
} from "./Icons";
import { SosheIQLogo } from "./SosheIQLogo";
import { motion } from "motion/react";

interface HeroScreenProps {
	onStart: () => void;
	onShowInstructions: () => void;
	onStartRandom: () => void;
	onNavigateToAbout: () => void;
	onNavigateToLogin: () => void;
	onNavigateToSafety: () => void;
}

export const HeroScreen: React.FC<HeroScreenProps> = ({
	onStart,
	onShowInstructions,
	onStartRandom,
	onNavigateToAbout,
	onNavigateToLogin,
	onNavigateToSafety,
}) => {
	return (
		<motion.div
			className="relative w-full max-w-4xl mx-auto flex flex-col items-center justify-center text-center p-4 md:p-8 isolate"
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			transition={{ duration: 0.5, ease: "easeInOut" }}>
			{/* Background Gradients */}
			<motion.div
				aria-hidden="true"
				className="absolute -z-10 -top-40 -left-20 transform-gpu blur-3xl"
				initial={{ opacity: 0.25 }}
				animate={{ opacity: 0.4 }}
				transition={{
					duration: 6,
					repeat: Infinity,
					repeatType: "mirror",
					ease: "easeInOut",
				}}>
				<div className="aspect-[1155/678] w-[72.1875rem] bg-gradient-to-tr from-[#0369a1] to-[#0f172a]" />
			</motion.div>

			<motion.div
				aria-hidden="true"
				className="absolute -z-10 -bottom-40 -right-20 transform-gpu blur-3xl"
				initial={{ opacity: 0.25 }}
				animate={{ opacity: 0.4 }}
				transition={{
					duration: 6,
					repeat: Infinity,
					repeatType: "mirror",
					ease: "easeInOut",
					delay: 1.5,
				}}>
				<div className="aspect-[1155/678] w-[72.1875rem] bg-gradient-to-tr from-[#0f766e] to-[#0f172a]" />
			</motion.div>

			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}>
				<SosheIQLogo className="h-24 md:h-32 w-auto mb-6" />
			</motion.div>

			<motion.h1
				className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-6"
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.7, ease: "easeOut", delay: 0.3 }}>
				Master the Art of Conversation
			</motion.h1>
			<motion.p
				className="text-lg md:text-xl text-gray-300 max-w-2xl mb-12"
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.7, ease: "easeOut", delay: 0.5 }}>
				Practice scenarios, get instant feedback, and become the most
				charismatic person in the room with your AI-powered social coach.
			</motion.p>

			<motion.div
				className="flex flex-col sm:flex-row items-center gap-4"
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.7, ease: "easeOut", delay: 0.7 }}>
				<button
					onClick={onStart}
					className="group w-full sm:w-auto px-8 py-4 bg-teal-500 hover:bg-teal-400 text-white font-bold rounded-lg text-lg shadow-lg transition-all duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-teal-300 focus:ring-opacity-50 flex items-center justify-center space-x-2"
					aria-label="Start Interaction">
					<span>Get Started</span>
					<ArrowRightIcon className="h-5 w-5 transition-transform group-hover:translate-x-1" />
				</button>
				<button
					onClick={onStartRandom}
					className="group w-full sm:w-auto px-8 py-4 bg-sky-600/50 hover:bg-sky-600/80 ring-1 ring-inset ring-sky-500 text-white font-semibold rounded-lg text-lg shadow-lg transition-all duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-sky-400 focus:ring-opacity-50 flex items-center justify-center space-x-2"
					aria-label="Start a random scenario">
					<SparklesIcon className="h-5 w-5 transition-transform group-hover:rotate-12" />
					<span>I'm Feeling Lucky</span>
				</button>
			</motion.div>

			<motion.div
				className="flex items-center justify-center gap-x-6 mt-12"
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ duration: 1, ease: "easeOut", delay: 0.9 }}>
				<button
					onClick={onNavigateToAbout}
					className="text-sm font-semibold text-gray-400 hover:text-white transition-colors"
					aria-label="About SosheIQ">
					About
				</button>
				<span className="text-gray-600">|</span>
				<button
					onClick={onShowInstructions}
					className="text-sm font-semibold text-gray-400 hover:text-white transition-colors"
					aria-label="How to Play">
					How it works
				</button>
				<span className="text-gray-600">|</span>
				<button
					onClick={onNavigateToSafety}
					className="text-sm font-semibold text-gray-400 hover:text-white transition-colors"
					aria-label="AI Safety Information">
					Safety
				</button>
			</motion.div>
			<motion.div
				className="mt-4 text-sm text-gray-400"
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ duration: 1, ease: "easeOut", delay: 1.0 }}>
				Have an account?{" "}
				<button
					onClick={onNavigateToLogin}
					className="font-semibold text-sky-400 hover:text-sky-300 transition-colors underline">
					Sign In
				</button>{" "}
				to save your progress (coming soon).
			</motion.div>
		</motion.div>
	);
};
