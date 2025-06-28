import React, { useState, useEffect, useRef } from "react";
import type { ChatMessage } from "../types";
import { AnimatedDialogue } from "./AnimatedDialogue";
import {
	ChatBubbleIcon,
	StarIcon,
	ChevronUpIcon,
	ChevronDownIcon,
} from "./Icons";

interface ChatMessageViewAIProps {
	message: ChatMessage;
	isLastMessage: boolean;
	isLoadingAI: boolean;
	onAnimationComplete?: () => void;
	scenarioDetailsAiName: string;
}

interface VisibleChunk {
	text: string;
	key: string;
}

export const ChatMessageViewAI: React.FC<ChatMessageViewAIProps> = ({
	message,
	isLastMessage,
	onAnimationComplete,
	scenarioDetailsAiName,
}) => {
	const [visibleChunks, setVisibleChunks] = useState<VisibleChunk[]>([]);
	const [isComplete, setIsComplete] = useState(false);
	const [isThoughtsOpen, setIsThoughtsOpen] = useState(false);

	// Image cross-fade state
	const [displayedImage, setDisplayedImage] = useState<string | null>(null);
	const [incomingImage, setIncomingImage] = useState<string | null>(null);
	const [isFading, setIsFading] = useState(false);
	const imageRef = useRef<string | null>(null);

	useEffect(() => {
		// Set initial image (don't animate)
		if (!imageRef.current) {
			setDisplayedImage(message.imageUrl ?? message.fallbackImageUrl ?? null);
		}

		// When a new image URL arrives for this message via props
		if (message.imageUrl && message.imageUrl !== imageRef.current) {
			if (displayedImage && displayedImage !== message.imageUrl) {
				// An image is already showing, so prepare to fade
				setIncomingImage(message.imageUrl);
				setIsFading(true);
			} else {
				// No image was showing, just set it directly without animation
				setDisplayedImage(message.imageUrl);
			}
		}
		// Keep track of the most recent image URL we've processed for this message instance
		imageRef.current = message.imageUrl ?? displayedImage;
	}, [message.imageUrl, message.fallbackImageUrl, displayedImage]);

	const onImageAnimationEnd = () => {
		if (incomingImage) {
			setDisplayedImage(incomingImage);
			setIncomingImage(null);
			setIsFading(false);
		}
	};

	useEffect(() => {
		const chunks = message.dialogueChunks || [];

		// If not the last message, or if there are no chunks, show everything instantly.
		if (!isLastMessage || chunks.length === 0) {
			if (chunks.length === 0 && message.text) {
				setVisibleChunks([{ text: message.text, key: `${message.id}-0` }]);
			} else {
				setVisibleChunks(
					chunks.map((chunk, index) => ({
						text: chunk.text,
						key: `${message.id}-${index}`,
					}))
				);
			}
			setIsComplete(true);
			// If it's the last message but we're not animating, we still need to signal completion.
			if (isLastMessage && onAnimationComplete) {
				onAnimationComplete();
			}
			return;
		}

		// Staged animation logic for the last/newest message
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
					if (onAnimationComplete) {
						onAnimationComplete();
					}
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
	}, [
		message.id,
		message.dialogueChunks,
		message.text,
		isLastMessage,
		onAnimationComplete,
	]);

	const hasDialogue =
		message.text ||
		(message.dialogueChunks && message.dialogueChunks.length > 0);

	if (!hasDialogue && !message.bodyLanguageDescription && !message.aiThoughts) {
		return null;
	}

	return (
		<div className="flex flex-col w-full">
			{/* AI's Thoughts Banner */}
			{message.aiThoughts && (
				<div
					role="button"
					tabIndex={0}
					onClick={() => setIsThoughtsOpen((prev) => !prev)}
					onKeyPress={(e) => {
						if (e.key === "Enter" || e.key === " ") {
							e.preventDefault();
							setIsThoughtsOpen((prev) => !prev);
						}
					}}
					className="w-full bg-purple-800/20 border border-purple-700/40 rounded-md shadow-md mb-2 cursor-pointer hover:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
					aria-expanded={isThoughtsOpen}
					aria-controls={`ai-thoughts-content-${message.id}`}>
					<div className="flex items-center text-xs text-purple-400 p-2.5">
						<StarIcon className="h-4 w-4" />
						<span className="ml-1.5 font-semibold">
							{scenarioDetailsAiName}'s Thoughts
						</span>
						<div className="ml-auto">
							{isThoughtsOpen ? (
								<ChevronUpIcon className="h-5 w-5" />
							) : (
								<ChevronDownIcon className="h-5 w-5" />
							)}
						</div>
					</div>
					<div
						id={`ai-thoughts-content-${message.id}`}
						className={`overflow-hidden transition-all duration-300 ease-in-out ${
							isThoughtsOpen ? "max-h-96" : "max-h-0"
						}`}>
						<p className="text-purple-200 italic text-sm whitespace-pre-wrap break-words px-2.5 pb-2.5">
							{message.aiThoughts}
						</p>
					</div>
				</div>
			)}
			{/* Top Row for Avatar and Body Language */}
			<div className="flex items-start space-x-3 mb-2">
				{/* Avatar Container - Visible on mobile, hidden on desktop */}
				<div className="md:hidden w-20 h-20 flex-shrink-0 rounded-lg shadow-md bg-slate-700 overflow-hidden relative">
					{displayedImage && (
						<img
							key={`displayed-${displayedImage.substring(0, 20)}`}
							src={`data:image/jpeg;base64,${displayedImage}`}
							alt="AI's current visual cue"
							className="absolute inset-0 w-full h-full object-cover"
							style={{
								opacity: isFading ? 0 : 1,
								transition: isFading ? "opacity 0.75s ease-in-out" : "none",
							}}
						/>
					)}
					{incomingImage && isFading && (
						<img
							key={`incoming-${incomingImage.substring(0, 20)}`}
							src={`data:image/jpeg;base64,${incomingImage}`}
							alt="AI's new visual cue"
							className="absolute inset-0 w-full h-full object-cover animate-image-cross-fade-in"
							onAnimationEnd={onImageAnimationEnd}
						/>
					)}
					{!displayedImage && !incomingImage && (
						<div className="w-full h-full bg-slate-700" />
					)}
				</div>
				{/* Body Language Bubble */}
				{message.bodyLanguageDescription && (
					<div className="flex-grow p-3 bg-yellow-800/20 border border-yellow-700/40 rounded-md shadow-md animate-fadeIn">
						<div className="flex items-center text-xs text-yellow-500 mb-1">
							<ChatBubbleIcon className="h-4 w-4" />
							<span className="ml-1.5 font-semibold">
								{scenarioDetailsAiName}'s Body Language
							</span>
						</div>
						<p className="text-yellow-200 italic text-sm whitespace-pre-wrap break-words">
							{message.bodyLanguageDescription}
						</p>
					</div>
				)}
			</div>

			{/* Dialogue Bubbles Container (no indent) */}
			{hasDialogue && (
				<div className="space-y-2">
					{visibleChunks.map((chunk) => (
						<div
							key={chunk.key}
							className="max-w-xl rounded-xl shadow-md bg-slate-600 text-gray-200 p-3 rounded-bl-none opacity-0 animate-[fadeIn_0.5s_ease-out_forwards]">
							<p className="whitespace-pre-wrap break-words">{chunk.text}</p>
						</div>
					))}
				</div>
			)}

			{/* Timestamp */}
			{isComplete && hasDialogue && (
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
