import React, { useState, useEffect } from "react";
import type { ChatMessage } from "../types";
import { AnimatedDialogue } from "./AnimatedDialogue";
import { ChatBubbleIcon } from "./Icons";

interface ChatMessageViewAIProps {
	message: ChatMessage;
	isLastMessage: boolean;
	isLoadingAI: boolean;
}

interface VisibleChunk {
	text: string;
	key: string;
}

export const ChatMessageViewAI: React.FC<ChatMessageViewAIProps> = ({
	message,
}) => {
	const [visibleChunks, setVisibleChunks] = useState<VisibleChunk[]>([]);
	const [isComplete, setIsComplete] = useState(false);
	const [imageToDisplay, setImageToDisplay] = useState<string | null>(null);
	const [imageFadeIn, setImageFadeIn] = useState(false);

	useEffect(() => {
		if (message.imageUrl && message.imageUrl !== imageToDisplay) {
			setImageToDisplay(message.imageUrl);
			setImageFadeIn(true);
		}
	}, [message.imageUrl, imageToDisplay]);

	useEffect(() => {
		const chunks = message.dialogueChunks || [];
		if (chunks.length === 0) {
			setVisibleChunks([]);
			setIsComplete(true);
			return;
		}

		setVisibleChunks([]);
		setIsComplete(false);
		let delay = 50;
		const timeouts: NodeJS.Timeout[] = [];

		chunks.forEach((chunk, index) => {
			const timeoutId = setTimeout(() => {
				setVisibleChunks((prev) => [
					...prev,
					{ text: chunk.text, key: `${message.id}-${index}` },
				]);
				if (index === chunks.length - 1) {
					setIsComplete(true);
				}
			}, delay);
			timeouts.push(timeoutId);

			if (chunk.delayAfter) {
				delay += 600 + Math.random() * 400;
			} else {
				delay += 50;
			}
		});

		return () => {
			timeouts.forEach(clearTimeout);
		};
	}, [message.id, message.dialogueChunks]);

	// Don't render anything if there's no text or chunks to display.
	if (!message.text && !message.dialogueChunks?.length) {
		return null;
	}

	return (
		<div className="flex flex-col w-full">
			{/* Top Row for Avatar and Body Language */}
			<div className="flex items-start space-x-3 mb-2">
				{/* Avatar Container - Larger on mobile, hidden on desktop */}
				<div className="w-20 h-20 md:hidden flex-shrink-0 rounded-lg shadow-md bg-slate-700 overflow-hidden relative">
					{imageToDisplay && (
						<img
							src={`data:image/jpeg;base64,${imageToDisplay}`}
							alt="AI visual cue for this turn"
							className={`w-full h-full object-cover transition-opacity duration-500 ${
								imageFadeIn ? "opacity-100" : "opacity-0"
							}`}
							onLoad={() => setImageFadeIn(true)}
						/>
					)}
				</div>
				{/* Body Language Bubble */}
				{message.bodyLanguageDescription && (
					<div className="flex-grow p-3 bg-yellow-800/20 border border-yellow-700/40 rounded-md shadow-md animate-fadeIn">
						<div className="flex items-center text-xs text-yellow-500 mb-1">
							<ChatBubbleIcon className="h-4 w-4" />
							<span className="ml-1.5 font-semibold">Body Language</span>
						</div>
						<p className="text-yellow-200 italic text-sm whitespace-pre-wrap break-words">
							{message.bodyLanguageDescription}
						</p>
					</div>
				)}
			</div>

			{/* Dialogue Bubbles Container (no indent) */}
			<div className="space-y-2">
				{visibleChunks.map((chunk) => (
					<div
						key={chunk.key}
						className="max-w-xl rounded-xl shadow-md bg-slate-600 text-gray-200 p-3 rounded-bl-none opacity-0 animate-[fadeIn_0.5s_ease-out_forwards]">
						<p className="whitespace-pre-wrap break-words">{chunk.text}</p>
					</div>
				))}
			</div>

			{/* Timestamp */}
			{isComplete && (
				<div className="text-xs text-gray-400 mt-1 text-right opacity-0 animate-[fadeIn_0.5s_ease-out_forwards]">
					{new Date(message.timestamp).toLocaleTimeString([], {
						hour: "2-digit",
						minute: "2-digit",
					})}
				</div>
			)}
		</div>
	);
};
