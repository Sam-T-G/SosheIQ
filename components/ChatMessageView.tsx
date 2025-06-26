import React from "react";
import type { ChatMessage } from "../types";
import { ChatMessageViewAI } from "./ChatMessageViewAI";
import { ChatMessageViewAIThoughtBubble } from "./ChatMessageViewAIThoughtBubble";
import { ChatMessageViewAIThinking } from "./ChatMessageViewAIThinking";
import { StarIcon } from "./Icons";

interface ChatMessageViewProps {
	message: ChatMessage;
	isLastMessage: boolean;
	isLoadingAI: boolean;
}

const EngagementDeltaBadge: React.FC<{ delta: number }> = ({ delta }) => {
	const isPositive = delta > 0;
	const colorClasses = isPositive
		? "bg-green-500/20 text-green-300 ring-green-500/30"
		: "bg-red-500/20 text-red-300 ring-red-500/30";

	const sign = isPositive ? "+" : "";

	return (
		<div
			className={`
				px-2 py-0.5 rounded-full text-xs font-bold ring-1
				${colorClasses} animate-popIn
			`}
			aria-label={`Engagement change: ${sign}${delta}%`}>
			{sign}
			{delta}%
		</div>
	);
};

const EffectivenessBadge: React.FC<{ score: number }> = ({ score }) => {
	const colorClasses =
		score >= 75
			? "bg-sky-500/20 text-sky-300 ring-sky-500/30"
			: score >= 40
			? "bg-yellow-500/20 text-yellow-300 ring-yellow-500/30"
			: "bg-red-500/20 text-red-300 ring-red-500/30";

	return (
		<div
			className={`
				px-2 py-1 rounded-full text-xs font-bold ring-1
				flex items-center space-x-1 ${colorClasses} animate-zoomIn
			`}
			aria-label={`Effectiveness score: ${score}%`}>
			<StarIcon className="h-3 w-3" />
			<span>{score}%</span>
		</div>
	);
};

export const ChatMessageView: React.FC<ChatMessageViewProps> = ({
	message,
	isLastMessage,
	isLoadingAI,
}) => {
	const isUser = message.sender === "user";

	if (isUser) {
		return (
			<div className="flex justify-end">
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
					<div className="absolute -top-3 -right-2 flex flex-col items-end gap-y-1.5">
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
	if (message.isThinkingBubble) {
		return <ChatMessageViewAIThinking message={message} />;
	}

	if (message.isThoughtBubble) {
		return (
			<div className="flex justify-start">
				<ChatMessageViewAIThoughtBubble message={message} />
			</div>
		);
	}

	// Standard AI message (handles its own internal layout for avatar + bubble)
	return (
		<div className="flex justify-start">
			{" "}
			{/* This ensures the whole AI group (bubble) aligns left */}
			<ChatMessageViewAI
				message={message}
				isLastMessage={isLastMessage}
				isLoadingAI={isLoadingAI}
			/>
		</div>
	);
};
