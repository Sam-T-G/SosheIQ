import React from "react";
import {
	PlayIcon,
	QuestionMarkIcon,
	SparklesIcon,
	ArrowRightIcon,
} from "./Icons";
import { SosheIQLogo } from "./SosheIQLogo";

interface HeroScreenProps {
	onStart: () => void;
	onShowInstructions: () => void;
	onStartRandom: () => void;
}

export const HeroScreen: React.FC<HeroScreenProps> = ({
	onStart,
	onShowInstructions,
	onStartRandom,
}) => {
	return (
		<div className="relative w-full max-w-4xl mx-auto flex flex-col items-center justify-center text-center p-4 md:p-8 isolate">
			{/* Background Gradients */}
			<div
				aria-hidden="true"
				className="absolute -z-10 -top-40 -left-20 transform-gpu blur-3xl">
				<div className="aspect-[1155/678] w-[72.1875rem] bg-gradient-to-tr from-[#0ea5e9] to-[#14b8a6] opacity-20" />
			</div>
			<div
				aria-hidden="true"
				className="absolute -z-10 -bottom-40 -right-20 transform-gpu blur-3xl">
				<div className="aspect-[1155/678] w-[72.1875rem] bg-gradient-to-tr from-[#14b8a6] to-[#0ea5e9] opacity-20" />
			</div>

			<SosheIQLogo
				className="h-24 md:h-32 w-auto mb-6 opacity-0 animate-[fadeInSlideUp_0.7s_ease-out_forwards]"
				style={{ animationDelay: "0.1s" }}
			/>

			<h1
				className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-6 opacity-0 animate-[fadeInSlideUp_0.7s_ease-out_forwards]"
				style={{ animationDelay: "0.3s" }}>
				Master the Art of Conversation
			</h1>
			<p
				className="text-lg md:text-xl text-gray-300 max-w-2xl mb-12 opacity-0 animate-[fadeInSlideUp_0.7s_ease-out_forwards]"
				style={{ animationDelay: "0.5s" }}>
				Practice scenarios, get instant feedback, and become the most
				charismatic person in the room with your AI-powered social coach.
			</p>

			<div
				className="flex flex-col sm:flex-row items-center gap-4 opacity-0 animate-[fadeInSlideUp_0.7s_ease-out_forwards]"
				style={{ animationDelay: "0.7s" }}>
				<button
					onClick={onStart}
					className="group w-full sm:w-auto px-8 py-4 bg-teal-500 hover:bg-teal-400 text-white font-bold rounded-lg text-lg shadow-lg 
                 transition-all duration-200 ease-in-out transform hover:scale-105 focus:outline-none 
                 focus:ring-4 focus:ring-teal-300 focus:ring-opacity-50 flex items-center justify-center space-x-2"
					aria-label="Start Interaction">
					<span>Get Started</span>
					<ArrowRightIcon className="h-5 w-5 transition-transform group-hover:translate-x-1" />
				</button>
				<button
					onClick={onStartRandom}
					className="group w-full sm:w-auto px-8 py-4 bg-sky-600/50 hover:bg-sky-600/80 ring-1 ring-inset ring-sky-500 text-white font-semibold rounded-lg text-lg shadow-lg
                 transition-all duration-200 ease-in-out transform hover:scale-105 focus:outline-none 
                 focus:ring-4 focus:ring-sky-400 focus:ring-opacity-50 flex items-center justify-center space-x-2"
					aria-label="Start a random scenario">
					<SparklesIcon className="h-5 w-5 transition-transform group-hover:rotate-12" />
					<span>I'm Feeling Lucky</span>
				</button>
			</div>
			<button
				onClick={onShowInstructions}
				className="mt-12 text-sm font-semibold text-gray-400 hover:text-white transition-colors opacity-0 animate-[fadeIn_1s_ease-out_forwards]"
				style={{ animationDelay: "0.9s" }}
				aria-label="How to Play">
				How does it work?
			</button>
		</div>
	);
};
