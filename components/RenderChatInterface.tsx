import React, { useState, useEffect, useRef, useCallback } from "react";
import type { ChatMessage, ActiveAction } from "../types";
import { ChatMessageView } from "./ChatMessageView";
import { ProgressBar } from "./ProgressBar"; // Import ProgressBar
import {
	SendIcon,
	StopCircleIcon,
	CheckCircleIcon,
	CloseIcon,
	InfoIcon,
	QuestionMarkIcon,
	StarIcon,
	TargetIcon,
	ChevronDownIcon,
	ChevronUpIcon,
	FastForwardIcon,
	PlayIcon,
} from "./Icons";
import { ChatMessageViewAIThinking } from "./ChatMessageViewAIThinking";

interface RenderChatInterfaceProps {
	conversationHistory: ChatMessage[];
	currentEngagement: number;
	displayedGoal: { text: string; progress: number } | null;
	activeAction: ActiveAction | null;
	isActionPaused: boolean;
	onSendMessage: (message: string) => void;
	onEndConversation: () => void;
	onFastForwardAction: () => void;
	onContinueWithoutSpeaking: () => void;
	isLoadingAI: boolean;
	scenarioDetailsAiName: string;
	isMaxEngagement: boolean;
	isOverlay: boolean;
	hasBlurredBackground?: boolean; // New prop
	onCloseOverlay?: () => void;
	onToggleHelpOverlay: () => void;
	onToggleQuickTipsOverlay: () => void;
	goalJustChanged: boolean;
	onAnimationComplete: () => void;
}

const GoalBanner: React.FC<{
	goal: { text: string; progress: number };
	isGlowing?: boolean;
}> = ({ goal, isGlowing }) => (
	<div
		className={`bg-teal-900/60 p-3 shadow-lg border-b border-teal-800/50 rounded-b-md ${
			isGlowing ? "animate-glow-pulse" : ""
		}`}>
		<div className="flex items-center gap-3 mb-1.5">
			<TargetIcon className="h-5 w-5 text-teal-300 flex-shrink-0" />
			<div className="flex-grow">
				<p className="text-xs font-semibold text-teal-300 uppercase tracking-wider">
					Conversation Goal
				</p>
				<p className="text-sm text-teal-100 break-words" title={goal.text}>
					{goal.text}
				</p>
			</div>
			<span className="text-lg font-bold text-white">{goal.progress}%</span>
		</div>
		<ProgressBar percentage={goal.progress} />
	</div>
);

const ActiveActionBanner: React.FC<{
	action: ActiveAction;
	onFastForward: () => void;
	isLoading: boolean;
	isPaused: boolean;
}> = ({ action, onFastForward, isLoading, isPaused }) => (
	<div className="bg-sky-900/60 p-3 shadow-lg border-b border-sky-800/50 rounded-b-md">
		<div className="flex items-center gap-3 mb-1.5">
			<div className="flex-grow">
				<p className="text-xs font-semibold text-sky-300 uppercase tracking-wider">
					Active Action
				</p>
				<p
					className="text-sm text-sky-100 break-words"
					title={action.description}>
					{action.description}
				</p>
				{isPaused && (
					<p className="text-red-400 font-bold text-xs animate-pulse mt-1">
						ACTIVE PAUSE
					</p>
				)}
			</div>
			<button
				onClick={onFastForward}
				disabled={isLoading}
				className="p-2 rounded-full bg-sky-700/80 hover:bg-sky-600 text-white transition-colors disabled:opacity-50 disabled:cursor-wait"
				title="Fast Forward to the end of this action">
				<FastForwardIcon className="h-5 w-5" />
			</button>
		</div>
		<ProgressBar percentage={action.progress} />
	</div>
);

const TopBanner: React.FC<{
	activeAction: ActiveAction | null;
	isActionPaused: boolean;
	displayedGoal: { text: string; progress: number } | null;
	onFastForwardAction: () => void;
	isLoadingAI: boolean;
	goalJustChanged: boolean;
}> = ({
	activeAction,
	isActionPaused,
	displayedGoal,
	onFastForwardAction,
	isLoadingAI,
	goalJustChanged,
}) => {
	if (activeAction) {
		return (
			<div className="animate-slideDown">
				<ActiveActionBanner
					action={activeAction}
					onFastForward={onFastForwardAction}
					isLoading={isLoadingAI}
					isPaused={isActionPaused}
				/>
			</div>
		);
	}
	if (displayedGoal) {
		return (
			<div className="animate-slideDown">
				<GoalBanner goal={displayedGoal} isGlowing={goalJustChanged} />
			</div>
		);
	}
	return null;
};

// Define InputArea as a standalone component to prevent re-renders from losing focus
interface InputAreaProps {
	userInput: string;
	setUserInput: (value: string) => void;
	handleSend: () => void;
	handleEndOrFinish: () => void;
	handleContinue: () => void;
	isLoadingAI: boolean;
	isMaxEngagement: boolean;
	hasBlurredBackground: boolean;
	isUserStart: boolean;
}

const InputArea: React.FC<InputAreaProps> = ({
	userInput,
	setUserInput,
	handleSend,
	handleEndOrFinish,
	handleContinue,
	isLoadingAI,
	isMaxEngagement,
	hasBlurredBackground,
	isUserStart,
}) => {
	const [isMaxEngagementBannerOpen, setIsMaxEngagementBannerOpen] =
		useState(true);

	const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSend();
		}
	};

	const wrapperClasses = hasBlurredBackground
		? "flex-shrink-0 p-3 border-t border-slate-700/40 bg-slate-900/50 backdrop-blur-sm shadow-lg z-10"
		: "flex-shrink-0 p-4 border-t border-slate-600 bg-slate-700";

	const textareaClasses = hasBlurredBackground
		? `flex-grow p-3 text-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none resize-none bg-slate-800/50 placeholder-gray-300`
		: `flex-grow p-3 text-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none resize-none bg-slate-600 placeholder-gray-300`;

	const placeholderText = isUserStart
		? "The scene is set. What's your opening line?"
		: "Type your response...";

	return (
		<div className={wrapperClasses}>
			{isMaxEngagement && (
				<div
					role="button"
					tabIndex={0}
					onClick={() => setIsMaxEngagementBannerOpen((prev) => !prev)}
					onKeyPress={(e) => {
						if (e.key === "Enter" || e.key === " ") {
							e.preventDefault();
							setIsMaxEngagementBannerOpen((prev) => !prev);
						}
					}}
					className="mb-2 bg-green-800/30 border border-green-700/40 rounded-lg cursor-pointer hover:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
					aria-expanded={isMaxEngagementBannerOpen}
					aria-controls="max-engagement-content"
					aria-label={
						isMaxEngagementBannerOpen
							? "Collapse max engagement message"
							: "Expand max engagement message"
					}>
					<div
						id="max-engagement-content"
						className={`overflow-hidden transition-all duration-300 ease-in-out ${
							isMaxEngagementBannerOpen ? "max-h-24" : "max-h-0"
						}`}>
						<p className="p-3 text-center text-green-300 font-semibold text-sm">
							Max Engagement Reached! You can 'Finish' for your analysis, or
							click this banner to hide it and keep practicing.
						</p>
					</div>
					<div
						className="w-full flex justify-center items-center py-0.5 bg-green-900/50 rounded-b-lg"
						aria-hidden="true">
						{isMaxEngagementBannerOpen ? (
							<ChevronUpIcon className="h-5 w-5 text-green-400" />
						) : (
							<ChevronDownIcon className="h-5 w-5 text-green-400" />
						)}
					</div>
				</div>
			)}
			<div className="flex items-start sm:items-center space-x-2">
				<button
					onClick={handleEndOrFinish}
					disabled={isLoadingAI}
					className={`p-3 text-white rounded-lg transition-colors duration-150 flex items-center justify-center space-x-2 disabled:opacity-60 disabled:cursor-not-allowed flex-shrink-0 min-h-[48px] sm:min-h-0
						${
							isMaxEngagement
								? "bg-green-600 hover:bg-green-700 animate-pulse-glow"
								: "bg-red-600 hover:bg-red-700"
						}`}
					aria-label={
						isMaxEngagement ? "Finish conversation" : "End conversation"
					}>
					{isMaxEngagement ? (
						<CheckCircleIcon className="h-5 w-5" />
					) : (
						<StopCircleIcon className="h-5 w-5" />
					)}
					<span className="hidden sm:inline">
						{isMaxEngagement ? "Finish" : "End"}
					</span>
				</button>
				<textarea
					value={userInput}
					onChange={(e) => setUserInput(e.target.value)}
					onKeyPress={handleKeyPress}
					placeholder={placeholderText}
					className={textareaClasses}
					rows={
						userInput.split("\n").length > 2
							? 3
							: userInput.split("\n").length > 1
							? 2
							: 1
					}
					style={{ maxHeight: "calc(3 * 1.5rem + 2 * 0.75rem + 2 * 0.125rem)" }}
					aria-label="Your response input"
				/>
				<button
					onClick={handleContinue}
					disabled={isLoadingAI}
					className="p-3 bg-slate-600 hover:bg-slate-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150 flex items-center justify-center space-x-2 flex-shrink-0 min-h-[48px] sm:min-h-0"
					aria-label="Continue without speaking"
					title="Continue without speaking (pass your turn)">
					<PlayIcon className="h-5 w-5" />
				</button>
				<button
					onClick={handleSend}
					disabled={!userInput.trim() || isLoadingAI}
					className="p-3 bg-sky-600 hover:bg-sky-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150 flex items-center justify-center space-x-2 flex-shrink-0 min-h-[48px] sm:min-h-0"
					aria-label="Send message">
					<SendIcon className="h-5 w-5" />
					<span className="hidden sm:inline">Send</span>
				</button>
			</div>
		</div>
	);
};

export const RenderChatInterface: React.FC<RenderChatInterfaceProps> = ({
	conversationHistory,
	currentEngagement,
	displayedGoal,
	activeAction,
	isActionPaused,
	onSendMessage,
	onEndConversation,
	onFastForwardAction,
	onContinueWithoutSpeaking,
	isLoadingAI,
	scenarioDetailsAiName,
	isMaxEngagement,
	isOverlay,
	hasBlurredBackground = false,
	onCloseOverlay,
	onToggleHelpOverlay,
	onToggleQuickTipsOverlay,
	goalJustChanged,
	onAnimationComplete,
}) => {
	const [userInput, setUserInput] = useState("");
	const chatContainerRef = useRef<HTMLDivElement>(null);
	const chatEndRef = useRef<HTMLDivElement>(null);
	const [processedMessagesForDisplay, setProcessedMessagesForDisplay] =
		useState<ChatMessage[]>([]);

	const isScrollingMutedRef = useRef(false);

	const scrollToBottom = useCallback((force = false) => {
		if (isScrollingMutedRef.current && !force) return;
		chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, []);

	const handleThoughtToggle = useCallback(() => {
		isScrollingMutedRef.current = true;
		setTimeout(() => {
			isScrollingMutedRef.current = false;
		}, 500); // Mute for 500ms, longer than the animation duration
	}, []);

	useEffect(() => {
		const finalMessages: ChatMessage[] = [];
		let lastAiImageUrl: string | undefined;

		conversationHistory.forEach((msg) => {
			if (msg.sender === "ai") {
				const msgWithFallback = { ...msg, fallbackImageUrl: lastAiImageUrl };
				finalMessages.push(msgWithFallback);
				if (msg.imageUrl) {
					lastAiImageUrl = msg.imageUrl;
				}
			} else {
				finalMessages.push(msg);
			}
		});

		setProcessedMessagesForDisplay(finalMessages);
		// Force scroll when new message is added to history
		if (conversationHistory.length > processedMessagesForDisplay.length) {
			scrollToBottom(true);
		}
	}, [conversationHistory, processedMessagesForDisplay.length, scrollToBottom]);

	// Force scroll when AI thinking state changes.
	useEffect(() => {
		scrollToBottom(true);
	}, [isLoadingAI, scrollToBottom]);

	// Observer for DOM mutations (like image loads, staged text)
	useEffect(() => {
		const container = chatContainerRef.current;
		if (!container) return;

		const observer = new MutationObserver((mutations) => {
			// Don't scroll for attribute changes (like adding an image src to an existing element)
			// as this was causing jumps. Only scroll for new nodes being added.
			const shouldScroll = mutations.some((m) => m.addedNodes.length > 0);
			if (shouldScroll) {
				scrollToBottom();
			}
		});

		observer.observe(container, {
			childList: true,
			subtree: true,
		});

		return () => observer.disconnect();
	}, [scrollToBottom]);

	const handleSend = () => {
		if (userInput.trim()) {
			onSendMessage(userInput.trim());
			setUserInput("");
		}
	};

	const handleEndOrFinish = () => {
		onEndConversation();
		if (isOverlay && onCloseOverlay) {
			setTimeout(() => {
				onCloseOverlay();
			}, 100);
		}
	};

	const headerBgClass =
		isOverlay || hasBlurredBackground
			? "bg-slate-900/60 backdrop-blur-sm"
			: "bg-slate-700/50";

	const ChatAreaHeader = () => (
		<div
			className={`flex-shrink-0 flex justify-between items-center p-3 z-10
				${headerBgClass} 
				border-b border-slate-700/50 shadow-md
			`}>
			<h3 className="text-lg font-semibold text-sky-400">
				{isOverlay
					? `Chat with ${scenarioDetailsAiName}`
					: `Conversation with ${scenarioDetailsAiName}`}
			</h3>
			<div className="flex items-center space-x-1 sm:space-x-2">
				<button
					onClick={onToggleQuickTipsOverlay}
					className="p-2 text-sky-300 hover:text-sky-100 rounded-full transition-colors duration-150 shadow-sm bg-slate-700/70 hover:bg-slate-600"
					aria-label="View Quick Tips"
					title="Quick Tips">
					<InfoIcon className="h-5 w-5" />
				</button>
				<button
					onClick={onToggleHelpOverlay}
					className="p-2 text-sky-300 hover:text-sky-100 rounded-full transition-colors duration-150 shadow-sm bg-slate-700/70 hover:bg-slate-600"
					aria-label="Show help for chat interface"
					title="Help">
					<QuestionMarkIcon className="h-5 w-5" />
				</button>
				{isOverlay && onCloseOverlay && (
					<button
						onClick={onCloseOverlay}
						className="p-2 text-gray-400 hover:text-gray-200 bg-slate-700/70 hover:bg-slate-600 rounded-full transition-colors"
						aria-label="Close chat"
						title="Close Chat">
						<CloseIcon className="h-6 w-6" />
					</button>
				)}
			</div>
		</div>
	);

	const EngagementBar = () => (
		<div className="px-4 pt-2 pb-3 bg-slate-900/60 backdrop-blur-sm border-b border-slate-700/40 shadow-sm z-10">
			<div className="flex justify-between items-center mb-1">
				<span className="text-sm font-medium text-sky-300">Engagement</span>
				<span className="text-sm font-bold text-white">
					{currentEngagement}%
				</span>
			</div>
			<ProgressBar percentage={currentEngagement} />
		</div>
	);

	const isUserStart = conversationHistory.length === 0;

	const inputAreaProps = {
		userInput,
		setUserInput,
		handleSend,
		handleEndOrFinish,
		handleContinue: onContinueWithoutSpeaking,
		isLoadingAI,
		isMaxEngagement,
		hasBlurredBackground,
		isUserStart,
	};
	const lastMessageIsAi =
		conversationHistory[conversationHistory.length - 1]?.sender === "ai";

	const mainContainerClasses = hasBlurredBackground
		? "bg-transparent"
		: "bg-slate-800";

	return (
		<div className={`flex flex-col h-full ${mainContainerClasses} relative`}>
			<div className="flex-shrink-0 z-20">
				<ChatAreaHeader />
				{isOverlay && <EngagementBar />}
				{isOverlay && (
					<TopBanner
						activeAction={activeAction}
						isActionPaused={isActionPaused}
						displayedGoal={displayedGoal}
						onFastForwardAction={onFastForwardAction}
						isLoadingAI={isLoadingAI}
						goalJustChanged={goalJustChanged}
					/>
				)}
			</div>

			<div
				ref={chatContainerRef}
				className="flex-grow min-h-0 overflow-y-auto px-2 sm:px-4 pt-4 pb-4">
				<div className="space-y-4">
					{processedMessagesForDisplay.map((msg, index) => (
						<ChatMessageView
							key={msg.id}
							message={msg}
							isLastMessage={
								index === processedMessagesForDisplay.length - 1 &&
								msg.id ===
									conversationHistory[conversationHistory.length - 1]?.id &&
								!msg.isThoughtBubble
							}
							isLoadingAI={
								isLoadingAI &&
								index === processedMessagesForDisplay.length - 1 &&
								msg.id ===
									conversationHistory[conversationHistory.length - 1]?.id &&
								!msg.isThoughtBubble
							}
							onAnimationComplete={
								lastMessageIsAi &&
								index === processedMessagesForDisplay.length - 1
									? onAnimationComplete
									: undefined
							}
							onThoughtToggle={handleThoughtToggle}
							scenarioDetailsAiName={scenarioDetailsAiName}
						/>
					))}
					{isLoadingAI && <ChatMessageViewAIThinking />}
					<div ref={chatEndRef} />
				</div>
			</div>

			<div className="flex-shrink-0 z-20">
				<InputArea {...inputAreaProps} />
			</div>
		</div>
	);
};
