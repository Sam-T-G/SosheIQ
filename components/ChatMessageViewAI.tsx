import React, { useState, useEffect } from "react";
import type { ChatMessage } from "../types";
import { AnimatedDialogue } from "./AnimatedDialogue"; // Import AnimatedDialogue

interface ChatMessageViewAIProps {
	message: ChatMessage;
	isLastMessage: boolean;
	isLoadingAI: boolean;
}

export const ChatMessageViewAI: React.FC<ChatMessageViewAIProps> = ({
	message,
	isLastMessage,
	isLoadingAI,
}) => {
	const [applyOverallFadeIn, setApplyOverallFadeIn] = useState(false);

	useEffect(() => {
		if (
			isLastMessage &&
			!isLoadingAI &&
			(message.text || message.bodyLanguageDescription)
		) {
			setApplyOverallFadeIn(true);
		} else {
			setApplyOverallFadeIn(false);
		}
	}, [
		isLastMessage,
		isLoadingAI,
		message.text,
		message.bodyLanguageDescription,
		message.id,
	]);

	const formattedBodyLanguage = message.bodyLanguageDescription
		? message.bodyLanguageDescription.replace(/[()]/g, "")
		: null;

	if (!message.text && !formattedBodyLanguage && !isLoadingAI) {
		return null;
	}

	const shouldAnimateText = isLastMessage && !isLoadingAI && applyOverallFadeIn;

	return (
		<div
			className={`
        max-w-xl px-4 py-3 rounded-xl shadow-md bg-slate-600 text-gray-200 rounded-bl-none
        ${
					applyOverallFadeIn && !shouldAnimateText
						? "animate-[fadeIn_1s_ease-out_forwards]"
						: shouldAnimateText
						? "opacity-100" // If animating text, container is immediately visible
						: "opacity-100"
				} 
      `}>
			{/* Body Language Description */}
			{formattedBodyLanguage && (
				<p
					className={`text-sm italic text-sky-300 mb-2 whitespace-pre-wrap ${
						shouldAnimateText ? "animate-[fadeIn_0.5s_ease-out_forwards]" : ""
					}`}>
					{formattedBodyLanguage}
				</p>
			)}

			{/* Main Message Text */}
			{message.text ? (
				<AnimatedDialogue
					text={message.text}
					startAnimation={shouldAnimateText}
					typingSpeed={30} // Adjust speed as desired
					// onComplete={() => console.log("AI dialogue animation complete")} // Optional: callback when typing finishes
				/>
			) : (
				!formattedBodyLanguage && (
					<p className="whitespace-pre-wrap text-gray-400 italic">...</p>
				)
			)}

			{/* Timestamp */}
			{(message.text || formattedBodyLanguage) && (
				<div
					className={`flex items-center justify-end mt-2 text-xs opacity-90 ${
						shouldAnimateText
							? "opacity-0 animate-[fadeIn_0.5s_ease-out_1s_forwards]"
							: ""
					}`}>
					{" "}
					{/* Delay timestamp fade-in if text animates */}
					<p className="text-gray-400 ml-auto">
						{new Date(message.timestamp).toLocaleTimeString([], {
							hour: "2-digit",
							minute: "2-digit",
						})}
					</p>
				</div>
			)}
		</div>
	);
};
