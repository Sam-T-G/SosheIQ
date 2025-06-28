import React, { useEffect } from "react";
import {
	CloseIcon,
	ChatBubbleIcon,
	QuestionMarkIcon,
	EyeIcon,
	UserIcon,
	SparklesIcon,
	ThumbsUpIcon,
	HeartIcon,
} from "./Icons";

interface QuickTipsScreenProps {
	onClose: () => void;
}

const tips = [
	{
		title: "Listen Actively",
		description:
			"Focus entirely on what the other person is saying, rather than planning your response. Ask clarifying questions to show engagement and ensure understanding.",
		icon: ChatBubbleIcon,
	},
	{
		title: "Ask Open-Ended Questions",
		description:
			"Encourage more than a 'yes' or 'no' answer. Questions starting with 'How,' 'Why,' or 'What if' can lead to richer conversations.",
		icon: QuestionMarkIcon,
	},
	{
		title: "Maintain Good Eye Contact",
		description:
			"Shows confidence and interest. Aim for a natural and comfortable level of eye contact, avoiding staring or looking away too often.",
		icon: EyeIcon,
	},
	{
		title: "Be Mindful of Body Language",
		description:
			"Your posture, gestures, and facial expressions communicate a lot. An open, relaxed posture can make you seem more approachable.",
		icon: UserIcon,
	},
	{
		title: "Find Common Ground",
		description:
			"Look for shared interests, experiences, or opinions. This helps build rapport and makes the interaction more enjoyable for both parties.",
		icon: SparklesIcon,
	},
	{
		title: "Show Genuine Interest",
		description:
			"People appreciate it when you're genuinely curious about them and their perspectives. Ask follow-up questions and remember details they share.",
		icon: ThumbsUpIcon,
	},
	{
		title: "Practice Empathy",
		description:
			"Try to understand and share the feelings of others. Acknowledging their emotions can strengthen connection and trust.",
		icon: HeartIcon,
	},
];

export const QuickTipsScreen: React.FC<QuickTipsScreenProps> = ({
	onClose,
}) => {
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
			onClick={onClose} // Close on backdrop click
			role="dialog"
			aria-modal="true"
			aria-labelledby="quick-tips-title">
			<div
				className="w-full max-w-2xl bg-slate-800 rounded-xl shadow-2xl space-y-6 text-gray-300 animate-[fadeInSlideUp_0.3s_ease-out_forwards] flex flex-col max-h-[90vh]"
				onClick={(e) => e.stopPropagation()} // Prevent close when clicking inside the panel
			>
				<div className="flex justify-between items-center p-6 border-b border-slate-700">
					<h1
						id="quick-tips-title"
						className="text-3xl md:text-4xl font-bold text-sky-400 drop-shadow-md">
						Quick Social Interaction Tips
					</h1>
					<button
						onClick={onClose}
						className="text-gray-400 hover:text-gray-200 p-1 rounded-full hover:bg-slate-700 transition-colors"
						aria-label="Close Quick Tips">
						<CloseIcon className="h-6 w-6" />
					</button>
				</div>

				<div className="overflow-y-auto px-6 pb-2 space-y-5 flex-grow">
					{tips.map((tip, index) => (
						<section
							key={index}
							className="p-4 bg-slate-700/70 rounded-lg shadow flex items-start gap-4">
							<tip.icon className="h-8 w-8 text-teal-300 mt-1 flex-shrink-0" />
							<div>
								<h2 className="text-xl font-semibold text-teal-300 mb-1.5">
									{tip.title}
								</h2>
								<p className="text-gray-300 text-sm">{tip.description}</p>
							</div>
						</section>
					))}
				</div>

				<div className="flex justify-center p-6 border-t border-slate-700">
					<button
						onClick={onClose}
						className="px-8 py-3 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-lg text-lg shadow-md 
                       transition-all duration-200 ease-in-out transform hover:scale-105 focus:outline-none 
                       focus:ring-4 focus:ring-sky-400 focus:ring-opacity-50 flex items-center justify-center space-x-2"
						aria-label="Close Quick Tips">
						<span>Close</span>
					</button>
				</div>
			</div>
		</div>
	);
};
