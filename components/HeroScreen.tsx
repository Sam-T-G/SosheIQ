import React from "react";
import { PlayIcon, PaperIcon, QuestionMarkIcon, SparklesIcon } from "./Icons";
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
		<div className="flex flex-col items-center justify-center text-center w-full max-w-3xl p-6 md:p-10">
			<SosheIQLogo
				className="h-20 md:h-28 w-auto mb-8 opacity-0 animate-[fadeInSlideUp_0.7s_ease-out_forwards]"
				style={{ animationDelay: "0.1s" }}
			/>
			<p
				className="text-xl md:text-2xl text-gray-300 mb-12 opacity-0 animate-[fadeInSlideUp_0.7s_ease-out_forwards]"
				style={{ animationDelay: "0.3s" }}>
				Your AI-powered coach for mastering social interactions.
			</p>
			<div className="w-full max-w-sm space-y-4">
				<button
					onClick={onStart}
					className="w-full px-8 py-4 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-lg text-lg shadow-lg 
                     transition-all duration-200 ease-in-out transform hover:scale-105 focus:outline-none 
                     focus:ring-4 focus:ring-green-400 focus:ring-opacity-50
                     opacity-0 animate-[heroButtonAppear_0.5s_ease-out_forwards] flex items-center justify-center space-x-2"
					style={{ animationDelay: "0.6s" }}
					aria-label="Start Interaction">
					<PlayIcon className="h-5 w-5" />
					<span>Start</span>
				</button>
				<button
					onClick={onStartRandom}
					className="w-full px-8 py-4 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-lg text-lg shadow-lg 
                     transition-all duration-200 ease-in-out transform hover:scale-105 focus:outline-none 
                     focus:ring-4 focus:ring-sky-400 focus:ring-opacity-50
                     opacity-0 animate-[heroButtonAppear_0.5s_ease-out_forwards] flex items-center justify-center space-x-2"
					style={{ animationDelay: "0.7s" }}
					aria-label="Start a random scenario">
					<SparklesIcon className="h-5 w-5" />
					<span>I'm Feeling Lucky</span>
				</button>
				<button
					onClick={onShowInstructions}
					className="w-full px-4 py-3 bg-sky-700/90 hover:bg-sky-700 text-white font-semibold rounded-lg text-base shadow-md 
									transition-all duration-200 ease-in-out transform hover:scale-105 focus:outline-none 
									focus:ring-4 focus:ring-sky-500 focus:ring-opacity-50
									opacity-0 animate-[heroButtonAppear_0.5s_ease-out_forwards] flex items-center justify-center space-x-2"
					style={{ animationDelay: "0.8s" }}
					aria-label="How to Play">
					<div className="bg-white rounded-full p-0.5 mr-1">
						<QuestionMarkIcon className="h-4 w-4 text-sky-800" />
					</div>
					<span>How to Play</span>
				</button>
			</div>
		</div>
	);
};
