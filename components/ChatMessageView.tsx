import React from "react";
import type { ChatMessage } from "../types";
import { ChatMessageViewAI } from "./ChatMessageViewAI";
import { ChatMessageViewAIThoughtBubble } from "./ChatMessageViewAIThoughtBubble";
import { ChatMessageViewAIThinking } from "./ChatMessageViewAIThinking";
import { StarIcon, SparklesIcon, XCircleIcon } from "./Icons";

interface ChatMessageViewProps {
	message: ChatMessage;
	isLastMessage: boolean;
	isLoadingAI: boolean;
	onAnimationComplete?: () => void;
}

const EngagementDeltaBadge: React.FC<{ delta: number }> = ({ delta }) => {
	const isPositive = delta >= 0;
	const colorClasses = isPositive
		? "bg-green-600 text-white ring-green-400"
		: "bg-red-600 text-white ring-red-400";
	const sign = isPositive ? "+" : "";

	return (
		<div
			className={`px-2 py-0.5 rounded-full text-xs font-bold ring-1 ring-inset ${colorClasses} animate-popInAndSettle`}
			aria-label={`Engagement change: ${sign}${delta}%`}>
			{sign}
			{delta}%
		</div>
	);
};

const EffectivenessBadge: React.FC<{ score: number }> = ({ score }) => {
	const colorClasses =
		score >= 75
			? "bg-sky-600 text-white ring-sky-400"
			: score >= 40
			? "bg-yellow-600 text-white ring-yellow-400"
			: "bg-red-600 text-white ring-red-400";

	return (
		<div
			className={`px-2 py-1 rounded-full text-xs font-bold ring-1 ring-inset flex items-center space-x-1 ${colorClasses} animate-popInAndSettle`}
			aria-label={`Effectiveness score: ${score}%`}>
			<StarIcon className="h-3 w-3" />
			<span>{score}%</span>
		</div>
	);
};

const TraitContributionBadge: React.FC<{ trait: string }> = ({ trait }) => {
	return (
		<div
			className={`px-2.5 py-1 rounded-full text-xs font-bold ring-1 ring-inset flex items-center space-x-1.5 bg-purple-600 text-white ring-purple-400 animate-popInAndSettle`}
			aria-label={`Positive Trait: ${trait}`}>
			<SparklesIcon className="h-3.5 w-3.5" />
			<span>{trait} +</span>
		</div>
	);
};

const NegativeTraitContributionBadge: React.FC<{ trait: string }> = ({
	trait,
}) => {
	return (
		<div
			className={`px-2.5 py-1 rounded-full text-xs font-bold ring-1 ring-inset flex items-center space-x-1.5 bg-red-600 text-white ring-red-400 animate-popInAndSettle`}
			aria-label={`Negative Trait: ${trait}`}>
			<XCircleIcon className="h-3.5 w-3.5" />
			<span>{trait} -</span>
		</div>
	);
};

export const ChatMessageView: React.FC<ChatMessageViewProps> = ({
	message,
	isLastMessage,
	isLoadingAI,
	onAnimationComplete,
}) => {
	const isUser = message.sender === "user";

	if (isUser) {
		return (
			<div className="flex justify-end pl-10 sm:pl-20">
				<div className="relative">
					<div className="max-w-xl px-4 py-3 rounded-xl shadow-md bg-sky-600 text-white rounded-br-none">
						<p className="whitespace-pre-wrap break-words">{message.text}</p>
						<p className="text-xs mt-1 opacity-70 text-right">
							{new Date(message.timestamp).toLocaleTimeString([], {
								hour: "2-digit",
								minute: "2-digit",
							})}
						</p>
					</div>
					<div className="absolute -top-4 right-0 flex flex-row-reverse items-center gap-x-2 w-auto whitespace-nowrap">
						{message.positiveTraitContribution && (
							<TraitContributionBadge
								trait={message.positiveTraitContribution}
							/>
						)}
						{message.negativeTraitContribution && (
							<NegativeTraitContributionBadge
								trait={message.negativeTraitContribution}
							/>
						)}
						{typeof message.userTurnEffectivenessScore === "number" && (
							<EffectivenessBadge score={message.userTurnEffectivenessScore} />
						)}
						{typeof message.engagementDelta === "number" && (
							<EngagementDeltaBadge delta={message.engagementDelta} />
						)}
					</div>
				</div>
			</div>
		);
	}

	// AI Message
	if (message.isThoughtBubble) {
		return (
			<div className="flex justify-start pr-10 sm:pr-20">
				<ChatMessageViewAIThoughtBubble message={message} />
			</div>
		);
	}

	// Standard AI message (handles its own internal layout for avatar + bubble)
	return (
		<div className="flex justify-start pr-10 sm:pr-20">
			{" "}
			{/* This ensures the whole AI group (bubble) aligns left */}
			<ChatMessageViewAI
				message={message}
				isLastMessage={isLastMessage}
				isLoadingAI={isLoadingAI}
				onAnimationComplete={onAnimationComplete}
			/>
		</div>
	);
};
