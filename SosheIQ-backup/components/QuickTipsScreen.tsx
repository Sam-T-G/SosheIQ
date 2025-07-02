import React, { useState, useEffect } from "react";
import {
	CloseIcon,
	ChatBubbleIcon,
	EyeIcon,
	UserIcon,
	HeartIcon,
	BookOpenIcon,
	PlayIcon,
	StopCircleIcon,
	SendIcon,
	GestureIcon,
	TargetIcon,
	FastForwardIcon,
	SparklesIcon,
	PinOutlineIcon,
	CheckCircleIcon,
	LightbulbIcon,
	ArrowRightIcon,
	QuestionMarkIcon,
} from "./Icons";

interface HelpAndTipsOverlayProps {
	onClose: () => void;
}

const TabButton: React.FC<{
	isActive: boolean;
	onClick: () => void;
	children: React.ReactNode;
}> = ({ isActive, onClick, children }) => (
	<button
		onClick={onClick}
		className={`px-4 py-2 text-sm font-semibold rounded-t-md transition-colors border-b-2 ${
			isActive
				? "text-sky-300 border-sky-400"
				: "text-gray-400 hover:text-white border-transparent"
		}`}>
		{children}
	</button>
);

const ProTip: React.FC<{
	title: string;
	children: React.ReactNode;
	Icon: React.FC<any>;
}> = ({ title, children, Icon }) => (
	<div className="p-4 bg-slate-700/70 rounded-lg shadow flex items-start gap-4">
		<Icon className="h-8 w-8 text-teal-300 mt-1 flex-shrink-0" />
		<div>
			<h3 className="text-lg font-semibold text-teal-300 mb-1.5">{title}</h3>
			<div className="text-gray-300 text-sm space-y-2">{children}</div>
		</div>
	</div>
);

const InterfaceGuide: React.FC = () => (
	<div className="space-y-4 text-sm">
		<div className="p-3 bg-slate-700/50 rounded-md">
			<p>
				<strong className="text-sky-300">
					AI Visuals & Body Language (<EyeIcon className="inline h-4 w-4" />
					):
				</strong>{" "}
				The large image and text descriptions reflect the AI's current mood and
				reactions. They change based on your conversation!
			</p>
		</div>
		<div className="p-3 bg-slate-700/50 rounded-md">
			<p>
				<strong className="text-sky-300">
					Top Banners (<TargetIcon className="inline h-4 w-4" /> /{" "}
					<FastForwardIcon className="inline h-4 w-4" />
					):
				</strong>{" "}
				These show your current Goal or an Active Action (like walking
				somewhere). Pinned goals will glow persistently!
			</p>
		</div>
		<div className="p-3 bg-slate-700/50 rounded-md">
			<p>
				<strong className="text-sky-300">
					Feedback Badges (<SparklesIcon className="inline h-4 w-4" />
					):
				</strong>{" "}
				After you speak, badges pop up with instant feedback on your
				effectiveness and social traits.{" "}
				<strong className="text-teal-300">Click them</strong> for detailed
				reasoning and suggestions!
			</p>
		</div>
		<div className="p-3 bg-slate-700/50 rounded-md">
			<p>
				<strong className="text-sky-300">
					Input Controls (<SendIcon className="inline h-4 w-4" />
					):
				</strong>
			</p>
			<ul className="list-disc list-inside mt-2 ml-4 space-y-1 text-gray-400">
				<li>
					<strong className="text-gray-200">Send:</strong> Sends your dialogue
					and/or gesture.
				</li>
				<li>
					<strong className="text-gray-200">
						Gesture (<GestureIcon className="inline h-4 w-4" />
						):
					</strong>{" "}
					Add a physical action to your turn.
				</li>
				<li>
					<strong className="text-gray-200">
						Continue (<PlayIcon className="inline h-4 w-4" />
						):
					</strong>{" "}
					Pass your turn without speaking. A{" "}
					<strong className="text-sky-300">glowing</strong> button means the AI
					suggests this is the best move.
				</li>
				<li>
					<strong className="text-gray-200">
						End (<StopCircleIcon className="inline h-4 w-4" />
						):
					</strong>{" "}
					Finishes the conversation to see your analysis report.
				</li>
			</ul>
		</div>
	</div>
);

const ProTips: React.FC = () => (
	<div className="space-y-4">
		<ProTip title="Master the 'Continue' Button" Icon={PlayIcon}>
			<p>
				Silence is powerful. Use the "Continue" button to let the AI finish a
				thought, to show you're listening, or to create a natural pause. If the
				button <strong className="text-sky-300">glows</strong>, the AI is
				explicitly suggesting it's the most effective social move—trust its cue!
			</p>
		</ProTip>
		<ProTip title="Earn Your Rapport" Icon={HeartIcon}>
			<p>
				The AI now has its own personality and boundaries. It won't always agree
				with you. You must build trust and rapport to achieve your goals,
				especially with 'Guarded' or 'Challenging' characters. A rejected
				request will lower your engagement score significantly.
			</p>
		</ProTip>
		<ProTip title="Leverage Interactive Feedback" Icon={LightbulbIcon}>
			<p>
				Don't just look at the feedback badges—
				<strong className="text-teal-300">click on them!</strong> Each popover
				gives you three crucial pieces of AI-generated insight:
			</p>
			<ul className="list-disc list-inside mt-2 ml-4 space-y-1 text-gray-400">
				<li>
					<strong className="text-gray-200">
						Reasoning (<CheckCircleIcon className="inline h-4 w-4" />
						):
					</strong>{" "}
					The specific 'why' behind the badge.
				</li>
				<li>
					<strong className="text-gray-200">
						Next Step (<ArrowRightIcon className="inline h-4 w-4" />
						):
					</strong>{" "}
					A suggestion for where to take the conversation.
				</li>
				<li>
					<strong className="text-gray-200">
						Alternative (<LightbulbIcon className="inline h-4 w-4" />
						):
					</strong>{" "}
					An example of what you could have said differently.
				</li>
			</ul>
		</ProTip>
	</div>
);

export const HelpAndTipsOverlay: React.FC<HelpAndTipsOverlayProps> = ({
	onClose,
}) => {
	const [activeTab, setActiveTab] = useState<"guide" | "tips">("guide");

	useEffect(() => {
		const handleEscKey = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				onClose();
			}
		};
		document.addEventListener("keydown", handleEscKey);
		return () => {
			document.removeEventListener("keydown", handleEscKey);
		};
	}, [onClose]);

	return (
		<div
			className="fixed inset-0 bg-slate-900/80 flex items-center justify-center z-[100] p-4 animate-[fadeIn_0.3s_ease-out]"
			onClick={onClose}
			role="dialog"
			aria-modal="true"
			aria-labelledby="help-title">
			<div
				className="w-full max-w-2xl bg-slate-800 rounded-xl shadow-2xl space-y-6 text-gray-300 animate-[fadeInSlideUp_0.3s_ease-out_forwards] flex flex-col max-h-[90vh]"
				onClick={(e) => e.stopPropagation()}>
				<div className="flex justify-between items-center p-6 border-b border-slate-700">
					<h1
						id="help-title"
						className="flex items-center gap-3 text-3xl md:text-4xl font-bold text-sky-400 drop-shadow-md">
						<BookOpenIcon className="h-8 w-8" />
						Help & Tips
					</h1>
					<button
						onClick={onClose}
						className="text-gray-400 hover:text-gray-200 p-1 rounded-full hover:bg-slate-700 transition-colors"
						aria-label="Close">
						<CloseIcon className="h-6 w-6" />
					</button>
				</div>

				<div className="px-6 border-b border-slate-700">
					<div className="flex space-x-2">
						<TabButton
							isActive={activeTab === "guide"}
							onClick={() => setActiveTab("guide")}>
							Interface Guide
						</TabButton>
						<TabButton
							isActive={activeTab === "tips"}
							onClick={() => setActiveTab("tips")}>
							Pro-Tips
						</TabButton>
					</div>
				</div>

				<div className="overflow-y-auto px-6 pb-2 space-y-5 flex-grow">
					{activeTab === "guide" ? <InterfaceGuide /> : <ProTips />}
				</div>

				<div className="flex justify-center p-6 border-t border-slate-700">
					<button
						onClick={onClose}
						className="px-8 py-3 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-lg text-lg shadow-md 
                       transition-all duration-200 ease-in-out transform hover:scale-105 focus:outline-none 
                       focus:ring-4 focus:ring-sky-400 focus:ring-opacity-50 flex items-center justify-center space-x-2"
						aria-label="Close">
						<span>Close</span>
					</button>
				</div>
			</div>
		</div>
	);
};
