import React from "react";
import { IconComponentProps } from "../types";
import {
	ArrowLeftIcon,
	ShieldCheckIcon,
	LockClosedIcon,
	ServerIcon,
	EnvelopeIcon,
} from "./Icons";

interface PrivacyPolicyScreenProps {
	onBack: () => void;
}

const InfoSection: React.FC<{
	title: string;
	children: React.ReactNode;
	Icon: React.FC<IconComponentProps>;
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

export const PrivacyPolicyScreen: React.FC<PrivacyPolicyScreenProps> = ({
	onBack,
}) => {
	return (
		<div className="w-full max-w-3xl min-h-[60vh] flex flex-col justify-center p-6 md:p-10 bg-slate-900/70 border border-slate-700 backdrop-blur-lg rounded-xl shadow-2xl text-gray-200 animate-fadeIn mt-9 mb-9 md:mt-8 md:mb-8">
			<div className="max-h-[85vh] overflow-y-auto custom-scrollbar pr-4 -mr-4">
				<div className="space-y-12">
					<header className="text-center">
						<h1 className="text-4xl md:text-5xl font-bold text-sky-400 mb-4 drop-shadow-md">
							Privacy Policy
						</h1>
						<p className="text-lg text-gray-400 max-w-3xl mx-auto">
							Your trust and privacy are important to us.
						</p>
					</header>

					<div className="space-y-10">
						<InfoSection
							Icon={ShieldCheckIcon}
							title="Our Commitment to You"
							delay="0.2s">
							<p>
								SosheIQ is designed as a safe space for you to practice and
								improve your social skills. We are committed to protecting your
								privacy and handling your information responsibly.
							</p>
						</InfoSection>

						<InfoSection
							Icon={LockClosedIcon}
							title="What We Don't Do"
							delay="0.4s">
							<p className="font-semibold text-white">
								We do not sell your personal information or conversation data to
								third parties. Period.
							</p>
							<p>
								We do not collect personally identifiable information like your
								name, email address, or location unless you voluntarily provide
								it for a specific purpose (which this app does not currently
								support).
							</p>
						</InfoSection>

						<InfoSection
							Icon={ServerIcon}
							title="How We Use Information"
							delay="0.6s">
							<p>
								The information you provide during setup (e.g., scenario
								choices, personality traits) and the conversation history you
								generate are used solely for the following purposes:
							</p>
							<ul className="list-disc list-inside space-y-2 pl-2">
								<li>
									To power the AI's responses and maintain context within a
									single interaction session.
								</li>
								<li>To generate your post-interaction analysis report.</li>
							</ul>
							<p>
								This data is processed by Google's AI services (Gemini and
								Imagen) during your session but is not stored in a persistent
								database linked to you once the session ends.
							</p>
						</InfoSection>

						<InfoSection Icon={EnvelopeIcon} title="Contact Us" delay="0.8s">
							<p>
								If you have any questions about this Privacy Policy, please
								don't hesitate to reach out. As this is a portfolio project, you
								can contact the developer through their professional portfolio
								or GitHub profile.
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
