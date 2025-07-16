import React, { useState, useEffect, useRef } from "react";
import type { ChatMessage, DialogueChunk } from "../types";
import {
	ChatBubbleIcon,
	StarIcon,
	ChevronUpIcon,
	ChevronDownIcon,
	EyeIcon,
} from "./Icons";

interface ChatMessageViewAIProps {
	message: ChatMessage;
	isLastMessage: boolean;
	isLoadingAI: boolean;
	onAnimationComplete?: () => void;
	onThoughtToggle: () => void;
	onViewImage: (url: string | null) => void;
	scenarioDetailsAiName: string;
	// Add optional onImageLoad
	onImageLoad?: () => void;
	// Add optional hasBadges for extra right padding
	hasBadges?: boolean;
}

interface VisibleChunk {
	text: string;
	type: "dialogue" | "action";
	key: string;
}

export const ChatMessageViewAI: React.FC<ChatMessageViewAIProps> = ({
	message,
	isLastMessage,
	onAnimationComplete,
	onThoughtToggle,
	onViewImage,
	scenarioDetailsAiName,
	onImageLoad,
	hasBadges = false,
}) => {
	const [visibleChunks, setVisibleChunks] = useState<VisibleChunk[]>([]);
	const [isComplete, setIsComplete] = useState(false);
	const [isThoughtsOpen, setIsThoughtsOpen] = useState(false);

	// Image cross-fade state
	const [displayedImage, setDisplayedImage] = useState<string | null>(null);
	const [incomingImage, setIncomingImage] = useState<string | null>(null);
	const [isFading, setIsFading] = useState(false);
	const imageRef = useRef<string | null>(null);
	const displayedImageRef = useRef<string | null>(null);

	useEffect(() => {
		// Set initial image (don't animate)
		if (!imageRef.current) {
			setDisplayedImage(message.imageUrl ?? message.fallbackImageUrl ?? null);
		}

		// When a new image URL arrives for this message via props
		if (message.imageUrl && message.imageUrl !== imageRef.current) {
			if (
				displayedImageRef.current &&
				displayedImageRef.current !== message.imageUrl
			) {
				// An image is already showing, so prepare to fade
				setIncomingImage(message.imageUrl);
				setIsFading(true);
			} else {
				// No image was showing, just set it directly without animation
				setDisplayedImage(message.imageUrl);
			}
		}
		// Keep track of the most recent image URL we've processed for this message instance
		imageRef.current = message.imageUrl ?? displayedImageRef.current;
	}, [message.imageUrl, message.fallbackImageUrl]);

	const onImageAnimationEnd = () => {
		if (incomingImage) {
			setDisplayedImage(incomingImage);
			setIncomingImage(null);
			setIsFading(false);
		}
	};

	// Update ref when displayedImage changes
	useEffect(() => {
		displayedImageRef.current = displayedImage;
	}, [displayedImage]);

	useEffect(() => {
		const chunks = message.dialogueChunks || [];

		// If not the last message, or if there are no chunks, show everything instantly.
		if (!isLastMessage || chunks.length === 0) {
			if (chunks.length === 0 && message.text) {
				setVisibleChunks([
					{ text: message.text, type: "dialogue", key: `${message.id}-0` },
				]);
			} else {
				setVisibleChunks(
					chunks.map((chunk, index) => ({
						text: chunk.text,
						type: chunk.type,
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
		const timeouts: ReturnType<typeof setTimeout>[] = [];

		chunks.forEach((chunk, index) => {
			const timeoutId = setTimeout(() => {
				setVisibleChunks((prev) => [
					...prev,
					{ text: chunk.text, type: chunk.type, key: `${message.id}-${index}` },
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

	const hasContent =
		message.dialogueChunks && message.dialogueChunks.length > 0;

	if (!hasContent && !message.bodyLanguageDescription && !message.aiThoughts) {
		return null;
	}

	const handleToggleThoughts = () => {
		onThoughtToggle();
		setIsThoughtsOpen((prev) => !prev);
	};

	return (
		<div className="flex flex-col w-full">
			{/* AI's Thoughts Banner */}
			{message.aiThoughts && (
				<div
					role="button"
					tabIndex={0}
					onClick={handleToggleThoughts}
					onKeyPress={(e) => {
						if (e.key === "Enter" || e.key === " ") {
							e.preventDefault();
							handleToggleThoughts();
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
				<button
					onClick={() => displayedImage && onViewImage(displayedImage)}
					disabled={!displayedImage}
					className="group md:hidden w-20 h-20 flex-shrink-0 rounded-lg shadow-md bg-slate-700 overflow-hidden relative focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-900/80 disabled:cursor-not-allowed">
					{displayedImage && (
						<>
							<img
								key={`displayed-${displayedImage.substring(0, 20)}`}
								src={`data:image/jpeg;base64,${displayedImage}`}
								alt="AI's current visual cue"
								className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
								style={{ opacity: isFading ? 0 : 1 }}
								onLoad={onImageLoad}
							/>
						</>
					)}
					{incomingImage && isFading && (
						<img
							key={`incoming-${incomingImage.substring(0, 20)}`}
							src={`data:image/jpeg;base64,${incomingImage}`}
							alt="AI's new visual cue"
							className="absolute inset-0 w-full h-full object-cover animate-image-cross-fade-in"
							onAnimationEnd={onImageAnimationEnd}
							onLoad={onImageLoad}
						/>
					)}
					{!displayedImage && !incomingImage && (
						<div className="w-full h-full bg-slate-700" />
					)}
				</button>
				{/* Body Language Bubble */}
				{message.bodyLanguageDescription && (
					<div className="flex-grow p-3 bg-amber-800/20 border border-amber-700/40 rounded-md shadow-md animate-fadeIn">
						<div className="flex items-center text-xs text-amber-300 mb-1">
							<ChatBubbleIcon className="h-4 w-4" />
							<span className="ml-1.5 font-semibold">
								{scenarioDetailsAiName}'s Body Language
							</span>
						</div>
						<p className="text-amber-200 italic text-sm whitespace-pre-wrap break-words">
							{message.bodyLanguageDescription}
						</p>
					</div>
				)}
			</div>

			{/* Dialogue Bubbles Container (no indent) */}
			{hasContent && (
				<div className="space-y-2">
					{visibleChunks.map((chunk) => {
						if (chunk.type === "action") {
							const actionText = chunk.text
								.trim()
								.replace(/^\*|\*$/g, "")
								.trim();
							return (
								<div
									key={chunk.key}
									className="text-center my-1 opacity-0 animate-[fadeIn_0.5s_ease-out_forwards]">
									<p className="text-sm italic text-slate-400 px-4 py-2 bg-slate-700/30 rounded-lg inline-block">
										{actionText}
									</p>
								</div>
							);
						}
						// Default to dialogue bubble
						return (
							<div
								key={chunk.key}
								className={`max-w-xl rounded-xl shadow-md bg-slate-600 text-gray-200 p-3 rounded-bl-none opacity-0 animate-[fadeIn_0.5s_ease-out_forwards]`}>
								<p className="whitespace-pre-wrap break-words">{chunk.text}</p>
							</div>
						);
					})}
				</div>
			)}

			{/* Timestamp */}
			{isComplete && hasContent && (
				<div
					className={`text-xs text-gray-400 mt-1 text-right opacity-0 animate-[fadeIn_0.5s_ease-out_forwards] ${
						hasBadges ? "mb-8" : ""
					}`}>
					{new Date(message.timestamp).toLocaleTimeString([], {
						hour: "2-digit",
						minute: "2-digit",
					})}
				</div>
			)}
		</div>
	);
};
