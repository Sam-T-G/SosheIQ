import React from "react";
import type { ChatMessage } from "../types";
import { ThoughtBubbleIcon } from "./Icons";

interface ChatMessageViewAIThoughtBubbleProps {
	message: ChatMessage;
}

export const ChatMessageViewAIThoughtBubble: React.FC<
	ChatMessageViewAIThoughtBubbleProps
> = ({ message }) => {
	if (!message.text || message.text.trim() === "") {
		return null; // Don't render if thoughts are empty
	}

	return (
		<div
			className="flex justify-start w-full opacity-0 animate-[fadeIn_0.5s_ease-out_forwards]"
			style={{ animationDelay: "0.1s" }}>
			<div
				className={`
          max-w-xl lg:max-w-2xl px-4 py-3 rounded-xl shadow-md bg-purple-800 text-purple-200 
          border border-purple-700 rounded-bl-none relative
        `}
				role="log"
				aria-live="polite">
				<div className="flex items-start text-xs text-purple-400 mb-1.5">
					<ThoughtBubbleIcon />
					<span className="ml-1.5 font-semibold">AI's thoughts</span>
				</div>
				<p className="whitespace-pre-wrap italic text-sm break-words">
					{message.text}
				</p>
				<p className="text-xs mt-1.5 opacity-70 text-right text-purple-400">
					{new Date(message.timestamp).toLocaleTimeString([], {
						hour: "2-digit",
						minute: "2-digit",
					})}
				</p>
			</div>
		</div>
	);
};
