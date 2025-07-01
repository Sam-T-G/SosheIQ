import React from "react";
import { GamePhase } from "../types";
import {
	ArrowLeftIcon,
	PlayIcon,
	SparklesIcon,
	HeartIcon,
	TargetIcon,
	StopCircleIcon,
	FastForwardIcon,
} from "./Icons";
import { InfoCard } from "./InfoCard";

interface InstructionsScreenProps {
	onNavigate: (phase: GamePhase) => void;
}

const FeatureSection: React.FC<{
	title: string;
	children: React.ReactNode;
	Icon: React.FC<any>;
	delay: string;
}> = ({ title, children, Icon, delay }) => (
	<div
		className="opacity-0 animate-[fadeInSlideUp_0.5s_ease-out_forwards]"
		style={{ animationDelay: delay }}>
		<h3 className="flex items-center text-2xl font-semibold text-teal-300 mb-3">
			<Icon className="h-7 w-7 mr-3" />
			{title}
		</h3>
		<div className="space-y-3 text-gray-300 pl-10 border-l-2 border-slate-700 ml-3 pb-3">
			{children}
		</div>
	</div>
);

const FeaturePoint: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => (
	<div className="flex items-start">
		<div className="flex-shrink-0 h-6 flex items-center">
			<svg
				className="h-2 w-2 text-teal-400"
				fill="currentColor"
				viewBox="0 0 8 8">
				<circle cx={4} cy={4} r={4} />
			</svg>
		</div>
		<p className="ml-3">{children}</p>
	</div>
);

export const InstructionsScreen: React.FC<InstructionsScreenProps> = ({
	onNavigate,
}) => {
	return (
		<div className="w-full max-w-4xl p-6 md:p-10 bg-slate-800 rounded-xl shadow-2xl text-gray-300 animate-fadeIn">
			<div className="max-h-[85vh] overflow-y-auto custom-scrollbar pr-4 -mr-4">
				<div className="space-y-12">
					<header className="text-center">
						<h1 className="text-4xl md:text-5xl font-bold text-sky-400 mb-4 drop-shadow-md">
							Welcome to SosheIQ
						</h1>
						<p className="text-lg text-gray-400 max-w-3xl mx-auto">
							This isn't just a chatbot—it's a dynamic social simulator. The AI
							has its own personality, goals, and boundaries. Your mission is to
							navigate the conversation successfully.
						</p>
					</header>

					<div className="space-y-8">
						<FeatureSection
							Icon={SparklesIcon}
							title="A Truly Dynamic AI"
							delay="0.2s">
							<p className="mb-4">
								The AI you'll meet is more than just a script. It has{" "}
								<strong className="text-white">agency</strong>. Based on its
								personality traits, it might be supportive, challenging, shy, or
								even sarcastic.
							</p>
							<FeaturePoint>
								It can{" "}
								<strong className="text-white">reject your requests</strong> if
								they don't align with its personality or goals. Building rapport
								is essential.
							</FeaturePoint>
							<FeaturePoint>
								It remembers the flow of the conversation and will react to
								awkwardness, kindness, or aggression realistically.
							</FeaturePoint>
							<FeaturePoint>
								If a conversation becomes too uncomfortable or unproductive, the
								AI has full autonomy to{" "}
								<strong className="text-red-400">end the interaction</strong>.
							</FeaturePoint>
							<FeaturePoint>
								The AI's internal thoughts and goals can{" "}
								<strong className="text-white">change dynamically</strong> based
								on what you say and do.
							</FeaturePoint>
						</FeatureSection>

						<FeatureSection
							Icon={HeartIcon}
							title="Earning Rapport is Key"
							delay="0.4s">
							<p>
								Your main objective is to build and maintain{" "}
								<strong className="text-white">engagement</strong>. A high
								engagement score means the AI trusts you and is invested in the
								conversation. This is how you "win."
							</p>
							<p>
								You'll get{" "}
								<strong className="text-white">
									real-time feedback badges
								</strong>{" "}
								after each turn. Click them for detailed, AI-generated advice on
								why you received a badge and what you could have done
								differently.
							</p>
						</FeatureSection>

						<FeatureSection
							Icon={TargetIcon}
							title="Goals and Actions"
							delay="0.6s">
							<p>
								Some scenarios have a clear objective, shown in the{" "}
								<strong className="text-teal-300">Goal Banner</strong> at the
								top. The AI can also introduce new, dynamic goals as the
								conversation evolves.
							</p>
							<p>
								You'll also see an{" "}
								<strong className="text-sky-300">Action Banner</strong> for
								things like walking somewhere. These actions progress over time,
								and you can even{" "}
								<strong className="text-white">"fast-forward"</strong> through
								them.
							</p>
							<div className="space-y-3 mt-4">
								<InfoCard
									Icon={TargetIcon}
									title="Example: Conversation Goal"
									description="“Ask your coworker, Alex, for help on a difficult project.”"
								/>
								<InfoCard
									Icon={FastForwardIcon}
									title="Example: Active Action"
									description="The AI might say, “Let's walk to the coffee shop.” This creates an action banner that progresses as you talk."
								/>
							</div>
						</FeatureSection>

						<FeatureSection
							Icon={StopCircleIcon}
							title="The Power of Silence"
							delay="0.8s">
							<p>
								Sometimes, the best move is to say nothing at all. Use the{" "}
								<strong className="text-white">"Continue" button</strong> (
								<PlayIcon className="inline h-4 w-4" />) to pass your turn.
							</p>
							<p>
								If the AI says, "Let's go," and you press "Continue," it will
								intelligently understand you're agreeing and will simulate your
								character walking alongside it. Look for the{" "}
								<strong className="text-sky-300">glowing button</strong>—that's
								the AI suggesting that silence is the most effective choice!
							</p>
						</FeatureSection>
					</div>

					<div className="flex flex-col sm:flex-row justify-center gap-4 mt-12 pt-8 border-t border-slate-700">
						<button
							onClick={() => onNavigate(GamePhase.HERO)}
							className="flex-1 px-6 py-3 bg-slate-600 hover:bg-slate-500 text-white font-semibold rounded-lg text-lg shadow-md
								transition-all duration-200 ease-in-out transform hover:scale-105 focus:outline-none
								focus:ring-4 focus:ring-slate-400 focus:ring-opacity-50 flex items-center justify-center space-x-2">
							<ArrowLeftIcon className="h-5 w-5" />
							<span>Back to Home</span>
						</button>
						<button
							onClick={() => onNavigate(GamePhase.SETUP)}
							className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-lg text-lg shadow-lg
								transition-all duration-200 ease-in-out transform hover:scale-105 focus:outline-none
								focus:ring-4 focus:ring-green-400 focus:ring-opacity-50 flex items-center justify-center space-x-2">
							<PlayIcon className="h-5 w-5" />
							<span>Let's Begin</span>
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};
