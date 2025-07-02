import React from "react";
import {
	ArrowLeftIcon,
	SparklesIcon,
	UserIcon,
	LightbulbIcon,
	ShieldCheckIcon,
	ExclamationTriangleIcon,
} from "./Icons";

interface SafetyScreenProps {
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

export const SafetyScreen: React.FC<SafetyScreenProps> = ({ onBack }) => {
	return (
		<div className="w-full max-w-3xl min-h-[60vh] flex flex-col justify-center p-6 md:p-10 bg-slate-900/70 border border-slate-700 backdrop-blur-lg rounded-xl shadow-2xl text-gray-200 animate-fadeIn mt-9 mb-9 md:mt-8 md:mb-8">
			<div className="max-h-[85vh] overflow-y-auto custom-scrollbar pr-4 -mr-4">
				<div className="space-y-12">
					<header className="text-center">
						<h1 className="text-4xl md:text-5xl font-bold text-sky-400 mb-4 drop-shadow-md">
							A Note on AI Safety
						</h1>
						<p className="text-lg text-gray-400 max-w-3xl mx-auto">
							Using AI for social practice is powerful, but it's important to
							interact mindfully.
						</p>
					</header>

					<div className="space-y-10">
						<InfoSection
							Icon={SparklesIcon}
							title="The AI is a Simulation"
							delay="0.2s">
							<p>
								The character you are interacting with is not a real person. It
								is a sophisticated language model designed to simulate human
								conversation based on patterns in its training data.{" "}
								<strong className="text-white">
									It does not have consciousness, feelings, or personal
									experiences.
								</strong>
							</p>
						</InfoSection>

						<InfoSection
							Icon={ExclamationTriangleIcon}
							title="The Risk of Parasocial Relationships"
							delay="0.4s">
							<p>
								A parasocial relationship is a one-sided connection where a
								person feels they know a media figure or character. Because this
								AI is designed to be engaging and empathetic, it's possible to
								develop similar feelings.
							</p>
							<p>
								Please be aware that{" "}
								<strong className="text-white">
									this is a known psychological effect.
								</strong>{" "}
								The AI's responses, however personal they may seem, are not
								genuine and do not indicate a real relationship.
							</p>
						</InfoSection>

						<InfoSection
							Icon={LightbulbIcon}
							title="Tips for Mindful Interaction"
							delay="0.6s">
							<ul className="list-disc list-inside space-y-2 pl-2">
								<li>
									<strong className="text-white">Set Boundaries:</strong> Treat
									this as a training tool, not a constant companion. Take breaks
									and limit your session time.
								</li>
								<li>
									<strong className="text-white">
										Prioritize Real Connections:
									</strong>{" "}
									Use the skills you practice here to build and strengthen your
									relationships with real people.
								</li>
								<li>
									<strong className="text-white">Stay Grounded:</strong>{" "}
									Periodically remind yourself that you are interacting with a
									program. The goal is self-improvement, not forming a bond with
									the AI.
								</li>
							</ul>
						</InfoSection>

						<InfoSection Icon={ShieldCheckIcon} title="Our Goal" delay="0.8s">
							<p>
								We created SosheIQ to be a safe, effective tool for personal
								growth. Your well-being is our top priority. By understanding
								the nature of AI, you can use this tool to its full potential
								while safeguarding your emotional health.
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
