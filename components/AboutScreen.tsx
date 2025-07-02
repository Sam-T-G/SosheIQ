import React from "react";
import { GamePhase } from "../types";
import {
	ArrowLeftIcon,
	HeartIcon,
	SparklesIcon,
	AcademicCapIcon,
	GlobeAltIcon,
} from "./Icons";

interface AboutScreenProps {
	onBack: () => void;
}

const InfoSection: React.FC<{
	title: string;
	children: React.ReactNode;
	Icon: React.FC<any>;
	delay: string;
}> = ({ title, children, Icon, delay }) => (
	<div
		className="opacity-0 animate-[fadeInSlideUp_0.5s_ease-out_forwards]"
		style={{ animationDelay: delay }}>
		<div className="flex items-center text-2xl font-semibold text-teal-300 mb-4">
			<div className="p-2 bg-slate-700/50 rounded-lg mr-4">
				<Icon className="h-6 w-6" />
			</div>
			<h2>{title}</h2>
		</div>
		<div className="space-y-4 text-gray-300 pl-4 border-l-2 border-slate-600/70 ml-5">
			{children}
		</div>
	</div>
);

export const AboutScreen: React.FC<AboutScreenProps> = ({ onBack }) => {
	return (
		<div className="w-full max-w-3xl min-h-[60vh] flex flex-col justify-center p-6 md:p-10 bg-slate-900/70 border border-slate-700 backdrop-blur-lg rounded-xl shadow-2xl text-gray-200 animate-fadeIn mt-9 mb-9 md:mt-8 md:mb-8">
			<div className="max-h-[85vh] overflow-y-auto custom-scrollbar pr-4 -mr-4">
				<div className="space-y-12">
					<header className="text-center">
						<h1 className="text-4xl md:text-5xl font-bold text-sky-400 mb-4 drop-shadow-md">
							About SosheIQ
						</h1>
						<p className="text-lg text-gray-300 max-w-3xl mx-auto">
							Reconnecting in a Disconnected World
						</p>
					</header>

					<div className="space-y-10">
						<InfoSection
							Icon={GlobeAltIcon}
							title="The Paradox of Our Time"
							delay="0.2s">
							<p>
								In an age of infinite connectivity, we've never been more
								disconnected. Social media shows us curated lives, and the
								pandemic taught us isolation. SosheIQ was born from a simple
								observation:{" "}
								<strong className="text-white">
									we're forgetting how to truly talk to one another.
								</strong>
							</p>
						</InfoSection>

						<InfoSection Icon={HeartIcon} title="Our Mission" delay="0.4s">
							<p>
								Our goal is to create a judgment-free space—
								<strong className="text-white">
									a 'gym for your social skills'
								</strong>
								—where you can practice, make mistakes, and grow. By simulating
								realistic social scenarios with a dynamic AI, we help you
								rebuild the conversational muscles needed to thrive in any
								situation.
							</p>
						</InfoSection>

						<InfoSection Icon={AcademicCapIcon} title="The Spark" delay="0.6s">
							<p>
								SosheIQ began as a passion project for the{" "}
								<strong className="text-white">UC Berkeley AI Hackathon</strong>
								. It was an answer to a question: Can we use the same technology
								that sometimes isolates us to bring us back together? We believe
								the answer is a resounding yes.
							</p>
						</InfoSection>

						<InfoSection
							Icon={SparklesIcon}
							title="The Technology"
							delay="0.8s">
							<p>
								Powered by Google's{" "}
								<strong className="text-white">Gemini API</strong> for nuanced,
								in-character dialogue and analysis, and the{" "}
								<strong className="text-white">Imagen API</strong> for
								expressive, dynamic visuals. Every interaction is unique,
								designed to challenge and support you.
							</p>
						</InfoSection>
					</div>

					<div className="flex justify-center mt-12 pt-8 border-t border-slate-700">
						<button
							onClick={onBack}
							className="flex-1 max-w-xs px-6 py-3 bg-slate-600 hover:bg-slate-500 text-white font-semibold rounded-lg text-lg shadow-md
                         transition-all duration-200 ease-in-out transform hover:scale-105 focus:outline-none
                         focus:ring-4 focus:ring-slate-400 focus:ring-opacity-50 flex items-center justify-center space-x-2">
							<ArrowLeftIcon className="h-5 w-5" />
							<span>Back to Home</span>
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};
