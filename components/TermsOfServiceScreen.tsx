import React from "react";
import {
	ArrowLeftIcon,
	DocumentTextIcon,
	CheckCircleIcon,
	ProhibitIcon,
	ShieldCheckIcon,
} from "./Icons";

interface TermsOfServiceScreenProps {
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

export const TermsOfServiceScreen: React.FC<TermsOfServiceScreenProps> = ({
	onBack,
}) => {
	return (
		<div className="w-full max-w-3xl p-6 md:p-10 bg-slate-900/70 border border-slate-700 backdrop-blur-lg rounded-xl shadow-2xl text-gray-200 animate-fadeIn">
			<div className="max-h-[85vh] overflow-y-auto custom-scrollbar pr-4 -mr-4">
				<div className="space-y-12">
					<header className="text-center">
						<h1 className="text-4xl md:text-5xl font-bold text-sky-400 mb-4 drop-shadow-md">
							Terms of Service
						</h1>
						<p className="text-lg text-gray-400 max-w-3xl mx-auto">
							Last Updated: July 26, 2024
						</p>
					</header>

					<div className="space-y-10">
						<InfoSection
							Icon={CheckCircleIcon}
							title="Acceptance of Terms"
							delay="0.2s">
							<p>
								By accessing or using SosheIQ (the "Service"), you agree to be
								bound by these Terms of Service. This app is a demonstration
								project created for a hackathon and is intended for
								informational and entertainment purposes only.
							</p>
						</InfoSection>

						<InfoSection
							Icon={ProhibitIcon}
							title="Use of the Service"
							delay="0.4s">
							<p>
								You agree not to misuse the Service or help anyone else to do
								so. This includes, but is not limited to, attempting to
								reverse-engineer the AI's prompting, submitting malicious or
								harmful content, or using the service for any illegal
								activities.
							</p>
							<p>
								The Service is provided "as is" and is not a substitute for
								professional advice, therapy, or social skills training.
							</p>
						</InfoSection>

						<InfoSection
							Icon={ShieldCheckIcon}
							title="Disclaimers and Limitation of Liability"
							delay="0.6s">
							<p>
								The Service is provided without warranties of any kind. We do
								not guarantee that the AI's responses will be accurate,
								appropriate, or suitable for any particular purpose. You
								acknowledge that interactions are with an AI and not a real
								person.
							</p>
							<p>
								In no event shall the creators of SosheIQ be liable for any
								indirect, incidental, or consequential damages arising out of
								your use of the Service.
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
