import React, {
	useState,
	useEffect,
	useRef,
	useCallback,
	forwardRef,
} from "react";
import type { ChatMessage, ActiveAction, UserTurnFeedback } from "../types";
import { ChatMessageView } from "./ChatMessageView";
import { ProgressBar } from "./ProgressBar"; // Import ProgressBar
import {
	SendIcon,
	StopCircleIcon,
	CheckCircleIcon,
	CloseIcon,
	InfoIcon,
	QuestionMarkIcon,
	ChevronDownIcon,
	ChevronUpIcon,
	PlayIcon,
	GestureIcon,
	StarIcon,
	SparklesIcon,
	XCircleIcon,
} from "./Icons";
import { ChatMessageViewAIThinking } from "./ChatMessageViewAIThinking";
import { TopBannerContainer } from "./TopBannerContainer";

// --- Badge components, duplicated for use in the animation tray ---

const EngagementDeltaBadge: React.FC<{ delta: number }> = ({ delta }) => {
	const isPositive = delta >= 0;
	const colorClasses = isPositive
		? "bg-green-600 text-white ring-green-400"
		: "bg-red-600 text-white ring-red-400";
	const sign = isPositive ? "+" : "";

	return (
		<div
			className={`px-2 py-0.5 rounded-full text-xs font-bold ring-1 ring-inset ${colorClasses}`}
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
			className={`px-2 py-1 rounded-full text-xs font-bold ring-1 ring-inset flex items-center space-x-1 ${colorClasses}`}
			aria-label={`Effectiveness score: ${score}%`}>
			<StarIcon className="h-3 w-3" />
			<span>{score}%</span>
		</div>
	);
};

const TraitContributionBadge: React.FC<{ trait: string }> = ({ trait }) => {
	return (
		<div
			className={`px-2.5 py-1 rounded-full text-xs font-bold ring-1 ring-inset flex items-center space-x-1.5 bg-purple-600 text-white ring-purple-400`}
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
			className={`px-2.5 py-1 rounded-full text-xs font-bold ring-1 ring-inset flex items-center space-x-1.5 bg-red-600 text-white ring-red-400`}
			aria-label={`Negative Trait: ${trait}`}>
			<XCircleIcon className="h-3.5 w-3.5" />
			<span>{trait} -</span>
		</div>
	);
};

// --- Animation Phase 1 & 2: Self-contained Tray ---

interface FeedbackAnimationTrayProps {
	data: { messageId: string; feedback: UserTurnFeedback };
	onComplete: (messageId: string, feedback: UserTurnFeedback) => void;
}

const FeedbackAnimationTray: React.FC<FeedbackAnimationTrayProps> = ({
	data,
	onComplete,
}) => {
	const [isExiting, setIsExiting] = useState(false);
	const { messageId, feedback } = data;

	// On mount (which happens on new data due to the key), set a timer to trigger the exit animation.
	useEffect(() => {
		const holdTimer = setTimeout(() => {
			setIsExiting(true);
		}, 2000); // 2-second hold time

		return () => {
			clearTimeout(holdTimer);
		};
	}, []); // Empty dependency array makes this effect run only once on mount

	const badges: React.ReactNode[] = [];
	if (feedback.positiveTraitContribution) {
		badges.push(
			<TraitContributionBadge
				key="pos-trait"
				trait={feedback.positiveTraitContribution}
			/>
		);
	}
	if (feedback.negativeTraitContribution) {
		badges.push(
			<NegativeTraitContributionBadge
				key="neg-trait"
				trait={feedback.negativeTraitContribution}
			/>
		);
	}
	if (typeof feedback.userTurnEffectivenessScore === "number") {
		badges.push(
			<EffectivenessBadge
				key="effectiveness"
				score={feedback.userTurnEffectivenessScore}
			/>
		);
	}
	if (typeof feedback.engagementDelta === "number") {
		badges.push(
			<EngagementDeltaBadge key="engagement" delta={feedback.engagementDelta} />
		);
	}

	if (badges.length === 0) return null;

	const lastBadgeIndex = badges.length - 1;

	// This function is called when the last badge finishes its exit animation.
	const handleAnimationEnd = (e: React.AnimationEvent) => {
		// Only trigger on the pop-out animation to avoid firing on entry
		if (isExiting && e.animationName === "badge-pop-out") {
			onComplete(messageId, feedback);
		}
	};

	return (
		<div
			className="fixed bottom-[110px] sm:bottom-24 right-4 sm:right-6 z-50 flex flex-row items-center gap-4"
			role="status"
			aria-live="polite">
			{badges.map((badge, index) => (
				<div
					key={index}
					className={
						isExiting ? "animate-badge-pop-out" : "animate-badge-slide-in-right"
					}
					style={{ animationDelay: `${index * 0.15}s` }}
					onAnimationEnd={
						index === lastBadgeIndex ? handleAnimationEnd : undefined
					}>
					{badge}
				</div>
			))}
		</div>
	);
};

interface RenderChatInterfaceProps {
	conversationHistory: ChatMessage[];
	currentEngagement: number;
	displayedGoal: { text: string; progress: number } | null;
	activeAction: ActiveAction | null;
	isActionPaused: boolean;
	isPinnable: boolean;
	isGoalPinned: boolean;
	isContinueActionSuggested: boolean;
	onSendMessage: (messages: { gesture?: string; dialogue?: string }) => void;
	onEndConversation: () => void;
	onFastForwardAction: () => void;
	onPinGoal: (goalText: string) => void;
	onUnpinGoal: () => void;
	onContinueWithoutSpeaking: () => void;
	onRetryMessage: (messageText: string) => void;
	isLoadingAI: boolean;
	scenarioDetailsAiName: string;
	isMaxEngagement: boolean;
	isOverlay: boolean;
	hasBlurredBackground?: boolean;
	onCloseOverlay?: () => void;
	onToggleHelpOverlay: () => void;
	onToggleQuickTipsOverlay: () => void;
	onViewImage: (url: string | null) => void;
	goalJustChanged: boolean;
	onAnimationComplete: () => void;
	pendingFeedback: { messageId: string; feedback: UserTurnFeedback } | null;
	onFeedbackAnimationComplete: (
		messageId: string,
		feedback: UserTurnFeedback
	) => void;
}

// Define InputArea as a standalone component to prevent re-renders from losing focus
interface InputAreaProps {
	onSend: (gesture: string, dialogue: string) => void;
	handleEndOrFinish: () => void;
	handleContinue: () => void;
	isLoadingAI: boolean;
	isMaxEngagement: boolean;
	hasBlurredBackground: boolean;
	isContinueActionSuggested: boolean;
	isUserStart: boolean;
}

const InputArea: React.FC<InputAreaProps> = ({
	onSend,
	handleEndOrFinish,
	handleContinue,
	isLoadingAI,
	isMaxEngagement,
	hasBlurredBackground,
	isContinueActionSuggested,
	isUserStart,
}) => {
	const [dialogueInput, setDialogueInput] = useState("");
	const [gestureInput, setGestureInput] = useState("");
	const [showGestureInput, setShowGestureInput] = useState(false);
	const [isMaxEngagementBannerOpen, setIsMaxEngagementBannerOpen] =
		useState(true);
	const dialogueTextareaRef = useRef<HTMLTextAreaElement>(null);

	const handleGestureButtonClick = () => {
		setShowGestureInput((prev) => !prev);
	};

	const handleSendClick = () => {
		if (gestureInput.trim() || dialogueInput.trim()) {
			onSend(gestureInput.trim(), dialogueInput.trim());
			setGestureInput("");
			setDialogueInput("");
			// Optionally close gesture input on send
			if (showGestureInput) {
				setShowGestureInput(false);
			}
		}
	};

	const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSendClick();
		}
	};

	const wrapperClasses = hasBlurredBackground
		? "flex-shrink-0 p-3 border-t border-slate-700/40 bg-slate-900/50 backdrop-blur-sm shadow-lg z-10"
		: "flex-shrink-0 p-4 border-t border-slate-600 bg-slate-700";

	const textareaClasses = hasBlurredBackground
		? `w-full text-base flex-grow p-3 text-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none resize-none bg-slate-800/50 placeholder-gray-300`
		: `w-full text-base flex-grow p-3 text-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none resize-none bg-slate-600 placeholder-gray-300`;

	const placeholderText = isUserStart
		? "The scene is set. What's your opening line?"
		: "Type your response...";

	const gesturePlaceholderText =
		"Describe a gesture... e.g., *smiles and nods*";

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
			<div className="flex flex-col gap-2">
				{/* Gesture Input Area - Conditionally rendered with animation */}
				<div
					className={`grid transition-all duration-300 ease-in-out ${
						showGestureInput
							? "grid-rows-[1fr] opacity-100"
							: "grid-rows-[0fr] opacity-0"
					}`}>
					<div className="overflow-hidden">
						<textarea
							id="gesture-input"
							value={gestureInput}
							onChange={(e) => setGestureInput(e.target.value)}
							placeholder={gesturePlaceholderText}
							className={`${textareaClasses} min-h-[50px]`}
							rows={1}
							aria-label="Your gesture or action input"
						/>
					</div>
				</div>

				<div className="flex items-end sm:items-center space-x-2">
					<button
						onClick={handleEndOrFinish}
						disabled={isLoadingAI}
						className={`p-3 text-white rounded-lg transition-colors duration-150 flex items-center justify-center space-x-2 disabled:opacity-60 disabled:cursor-not-allowed flex-shrink-0 min-h-[52px] sm:min-h-0
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
					<button
						onClick={handleGestureButtonClick}
						disabled={isLoadingAI}
						className={`p-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150 flex items-center justify-center space-x-2 flex-shrink-0 min-h-[52px] sm:min-h-0 ${
							showGestureInput
								? "bg-sky-700 text-white"
								: "bg-slate-600 hover:bg-slate-500 text-white"
						}`}
						aria-label="Add a gesture or action"
						title="Add a gesture or action"
						aria-pressed={showGestureInput}>
						<GestureIcon className="h-5 w-5" />
					</button>
					<textarea
						ref={dialogueTextareaRef}
						value={dialogueInput}
						onChange={(e) => setDialogueInput(e.target.value)}
						onKeyPress={handleKeyPress}
						placeholder={placeholderText}
						className={`${textareaClasses} max-h-32`}
						rows={1}
						aria-label="Your response input"
					/>
					<button
						onClick={handleContinue}
						disabled={isLoadingAI}
						className={`p-3 bg-slate-600 hover:bg-slate-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150 flex items-center justify-center space-x-2 flex-shrink-0 min-h-[52px] sm:min-h-0 ${
							isContinueActionSuggested ? "animate-pulse-glow-slow" : ""
						}`}
						aria-label="Continue without speaking"
						title="Continue without speaking (pass your turn)">
						<PlayIcon className="h-5 w-5" />
					</button>
					<button
						onClick={handleSendClick}
						disabled={
							(!dialogueInput.trim() && !gestureInput.trim()) || isLoadingAI
						}
						className="p-3 bg-sky-600 hover:bg-sky-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150 flex items-center justify-center space-x-2 flex-shrink-0 min-h-[52px] sm:min-h-0"
						aria-label="Send message">
						<SendIcon className="h-5 w-5" />
						<span className="hidden sm:inline">Send</span>
					</button>
				</div>
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
	isPinnable,
	isGoalPinned,
	onPinGoal,
	onUnpinGoal,
	isContinueActionSuggested,
	onSendMessage,
	onEndConversation,
	onFastForwardAction,
	onContinueWithoutSpeaking,
	onRetryMessage,
	isLoadingAI,
	scenarioDetailsAiName,
	isMaxEngagement,
	isOverlay,
	hasBlurredBackground = false,
	onCloseOverlay,
	onToggleHelpOverlay,
	onToggleQuickTipsOverlay,
	onViewImage,
	goalJustChanged,
	onAnimationComplete,
	pendingFeedback,
	onFeedbackAnimationComplete,
}) => {
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
		if (isLoadingAI) {
			scrollToBottom(true);
		}
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

	const handleSend = (gesture: string, dialogue: string) => {
		if (gesture.trim() || dialogue.trim()) {
			onSendMessage({ gesture, dialogue });
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
		onSend: handleSend,
		handleEndOrFinish,
		handleContinue: onContinueWithoutSpeaking,
		isLoadingAI,
		isMaxEngagement,
		hasBlurredBackground,
		isContinueActionSuggested,
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
					<TopBannerContainer
						activeAction={activeAction}
						isActionPaused={isActionPaused}
						displayedGoal={displayedGoal}
						isPinnable={isPinnable}
						isGoalPinned={isGoalPinned}
						onPinGoal={onPinGoal}
						onUnpinGoal={onUnpinGoal}
						onFastForwardAction={onFastForwardAction}
						isLoadingAI={isLoadingAI}
						goalJustChanged={goalJustChanged}
						isOverlay={true}
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
							onViewImage={onViewImage}
							onRetryMessage={onRetryMessage}
						/>
					))}
					{isLoadingAI && <ChatMessageViewAIThinking />}
					<div ref={chatEndRef} />
				</div>
			</div>

			{pendingFeedback && (
				<FeedbackAnimationTray
					key={pendingFeedback.messageId}
					data={pendingFeedback}
					onComplete={onFeedbackAnimationComplete}
				/>
			)}

			<div className="flex-shrink-0 z-20">
				<InputArea {...inputAreaProps} />
			</div>
		</div>
	);
};
