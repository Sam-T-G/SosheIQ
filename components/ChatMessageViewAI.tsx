import React, { useState, useEffect } from "react";
import type { ChatMessage } from "../types";
import { AnimatedDialogue } from "./AnimatedDialogue";

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

	// On mobile (md:hidden for the image), the image will be displayed.
	// The bubble needs to adjust its border-radius if the image is shown.
	// The image is shown if message.imageUrl exists AND screen is < md.
	// We can rely on CSS for hiding the image, but the bubble style needs to consider imageUrl for rounding.
	const showImageOnMobile = !!message.imageUrl;

	return (
		<div className="flex items-start space-x-2">
			{" "}
			{/* Container for image (on mobile) + bubble */}
			{message.imageUrl && (
				<img
					src={`data:image/jpeg;base64,${message.imageUrl}`}
					alt="AI mini visual"
					className="md:hidden w-10 h-10 rounded-lg object-cover shadow-md mt-1 flex-shrink-0"
				/>
			)}
			<div
				className={`
          max-w-xl px-4 py-3 rounded-xl shadow-md bg-slate-600 text-gray-200 
          ${
						showImageOnMobile ? "rounded-bl-xl" : "rounded-bl-none"
					} {/* Adjust rounding based on potential image presence */}
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
						className={`text-sm italic text-sky-300 mb-2 whitespace-pre-wrap break-words ${
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
						<p className="text-gray-400 ml-auto">
							{new Date(message.timestamp).toLocaleTimeString([], {
								hour: "2-digit",
								minute: "2-digit",
							})}
						</p>
					</div>
				)}
			</div>
		</div>
	);
};
