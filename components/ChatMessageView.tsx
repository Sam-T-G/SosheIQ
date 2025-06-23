import React from "react";
import type { ChatMessage } from "../types";
import { ChatMessageViewAI } from "./ChatMessageViewAI";
import { ChatMessageViewAIThoughtBubble } from "./ChatMessageViewAIThoughtBubble";
import { ChatMessageViewAIThinking } from "./ChatMessageViewAIThinking"; // Import the new thinking bubble

interface ChatMessageViewProps {
	message: ChatMessage;
	isLastMessage: boolean;
	isLoadingAI: boolean;
}

export const ChatMessageView: React.FC<ChatMessageViewProps> = ({
	message,
	isLastMessage,
	isLoadingAI,
}) => {
	const isUser = message.sender === "user";

	if (isUser) {
		return (
			<div className="flex justify-end">
				<div className="max-w-xl px-4 py-3 rounded-xl shadow-md bg-sky-600 text-white rounded-br-none">
					<p className="whitespace-pre-wrap break-words">{message.text}</p>
					<p className="text-xs mt-1 opacity-70 text-right">
						{new Date(message.timestamp).toLocaleTimeString([], {
							hour: "2-digit",
							minute: "2-digit",
						})}
					</p>
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

	return (
		<div className="flex justify-start">
			<ChatMessageViewAI
				message={message}
				isLastMessage={isLastMessage}
				isLoadingAI={isLoadingAI}
			/>
		</div>
	);
};
