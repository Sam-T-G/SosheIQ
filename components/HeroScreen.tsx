import React from "react";
import { GamePhase } from "../types";
import { PlayIcon, InfoIcon } from "./Icons";
import { SosheIQLogo } from "./SosheIQLogo"; // Import the new SVG Logo component

interface HeroScreenProps {
	onNavigate: (phase: GamePhase) => void;
}

export const HeroScreen: React.FC<HeroScreenProps> = ({ onNavigate }) => {
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
			<div className="space-y-4 md:space-y-0 md:space-x-6 flex flex-col md:flex-row">
				<button
					onClick={() => onNavigate(GamePhase.INSTRUCTIONS)}
					className="px-8 py-4 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-lg text-lg shadow-lg 
                     transition-all duration-200 ease-in-out transform hover:scale-105 focus:outline-none 
                     focus:ring-4 focus:ring-sky-400 focus:ring-opacity-50
                     opacity-0 animate-[heroButtonAppear_0.5s_ease-out_forwards] flex items-center justify-center space-x-2"
					style={{ animationDelay: "0.6s" }}
					aria-label="View Instructions">
					<InfoIcon />
					<span>Instructions</span>
				</button>
				<button
					onClick={() => onNavigate(GamePhase.SETUP)}
					className="px-8 py-4 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-lg text-lg shadow-lg 
                     transition-all duration-200 ease-in-out transform hover:scale-105 focus:outline-none 
                     focus:ring-4 focus:ring-green-400 focus:ring-opacity-50
                     opacity-0 animate-[heroButtonAppear_0.5s_ease-out_forwards] flex items-center justify-center space-x-2"
					style={{ animationDelay: "0.8s" }}
					aria-label="Start Interaction">
					<PlayIcon />
					<span>Get Started</span>
				</button>
			</div>
		</div>
	);
};
