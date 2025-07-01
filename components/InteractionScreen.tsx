import React, { useState, useEffect } from "react";
import type {
	ScenarioDetails,
	ChatMessage,
	ActiveAction,
	UserTurnFeedback,
} from "../types";
import { ProgressBar } from "./ProgressBar";
import { AIVisualCue } from "./AIVisualCue";
import { ChatBubbleIcon, CheckCircleIcon, ZoomInIcon } from "./Icons";
import { RenderChatInterface } from "./RenderChatInterface";
import { TopBannerContainer } from "./TopBannerContainer";

interface InteractionScreenProps {
	scenarioDetails: ScenarioDetails;
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
	aiImageBase64: string | null;
	isLoadingAI: boolean; // True when AI is fetching new image/text
	onToggleHelp: () => void;
	onViewImage: (url: string | null) => void;
	initialAiBodyLanguage: string | null;
	goalJustChanged: boolean;
	onAnimationComplete: () => void;
	showGoalAchievedToast: { show: boolean; text: string };
	onGoToAnalysis: () => void;
	onCloseGoalToast: () => void;
	pendingFeedback: { messageId: string; feedback: UserTurnFeedback } | null;
	onFeedbackAnimationComplete: (
		messageId: string,
		feedback: UserTurnFeedback
	) => void;
}

// Helper function to get the last meaningful AI body language description
const getLastMeaningfulAiMessageWithBodyLanguage = (
	history: ChatMessage[]
): string | undefined => {
	for (let i = history.length - 1; i >= 0; i--) {
		const msg = history[i];
		if (
			msg.sender === "ai" &&
			!msg.isThoughtBubble &&
			msg.bodyLanguageDescription
		) {
			return msg.bodyLanguageDescription;
		}
	}
	return undefined;
};

const formatPersonalityForDisplay = (details: ScenarioDetails): string => {
	let personalityDisplay = "";
	if (details.aiPersonalityTraits && details.aiPersonalityTraits.length > 0) {
		personalityDisplay += details.aiPersonalityTraits.join(", ");
	}
	if (details.customAiPersonality) {
		if (personalityDisplay.length > 0) personalityDisplay += " ";
		personalityDisplay += `(${details.customAiPersonality.substring(0, 50)}${
			details.customAiPersonality.length > 50 ? "..." : ""
		})`;
	}
	if (!personalityDisplay) return "Default";
	return personalityDisplay;
};

interface GoalAchievedToastProps {
	message: string;
	onGoToAnalysis: () => void;
	onClose: () => void;
}

const GoalAchievedToast: React.FC<GoalAchievedToastProps> = ({
	message,
	onGoToAnalysis,
	onClose,
}) => {
	useEffect(() => {
		const timer = setTimeout(() => {
			onClose();
		}, 7000); // Duration matches animation
		return () => clearTimeout(timer);
	}, [onClose]);

	return (
		<div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-lg p-4 bg-green-600 border-2 border-green-400 rounded-xl shadow-2xl animate-goal-toast overflow-hidden">
			<div className="flex items-center gap-4">
				<CheckCircleIcon className="h-10 w-10 text-white flex-shrink-0" />
				<div className="flex-grow">
					<h3 className="font-bold text-lg text-white">Goal Achieved!</h3>
					<p className="text-sm text-green-100 italic">"{message}"</p>
				</div>
				<button
					onClick={onGoToAnalysis}
					className="flex-shrink-0 px-3 py-1.5 bg-green-700 hover:bg-green-800 text-white font-semibold rounded-lg text-xs shadow-md transition-colors">
					View Analysis
				</button>
			</div>
			{/* Countdown bar wrapper */}
			<div className="absolute bottom-0 left-0 right-0 h-1.5 bg-green-200/50">
				<div className="h-full bg-white animate-countdown-bar"></div>
			</div>
		</div>
	);
};

export const InteractionScreen: React.FC<InteractionScreenProps> = ({
	scenarioDetails,
	conversationHistory,
	currentEngagement,
	displayedGoal,
	activeAction,
	isActionPaused,
	isPinnable,
	isGoalPinned,
	isContinueActionSuggested,
	onSendMessage,
	onEndConversation,
	onFastForwardAction,
	onPinGoal,
	onUnpinGoal,
	onContinueWithoutSpeaking,
	onRetryMessage,
	aiImageBase64,
	isLoadingAI,
	onToggleHelp,
	onViewImage,
	initialAiBodyLanguage,
	goalJustChanged,
	onAnimationComplete,
	showGoalAchievedToast,
	onGoToAnalysis,
	onCloseGoalToast,
	pendingFeedback,
	onFeedbackAnimationComplete,
}) => {
	const [showChatOverlay, setShowChatOverlay] = useState(false);
	// Use helper function to get the body language description
	const lastMeaningfulAiBodyLanguage =
		getLastMeaningfulAiMessageWithBodyLanguage(conversationHistory);

	const bodyLanguageForDisplay =
		lastMeaningfulAiBodyLanguage ||
		(conversationHistory.length === 0
			? initialAiBodyLanguage
			: "AI is present.") ||
		"AI is present.";

	useEffect(() => {
		const handleEsc = (event: KeyboardEvent) => {
			if (event.key === "Escape" && showChatOverlay) {
				setShowChatOverlay(false);
			}
		};
		window.addEventListener("keydown", handleEsc);
		return () => {
			window.removeEventListener("keydown", handleEsc);
		};
	}, [showChatOverlay]);

	useEffect(() => {
		const body = document.body;
		if (showChatOverlay) {
			body.style.overflow = "hidden";
		} else {
			body.style.overflow = "";
		}

		return () => {
			body.style.overflow = "";
		};
	}, [showChatOverlay]);

	const personalityDisplayText = formatPersonalityForDisplay(scenarioDetails);

	return (
		<div className="w-full max-w-7xl h-full flex flex-col md:flex-row bg-slate-900/60 backdrop-blur-xl border border-slate-700/60 shadow-2xl rounded-xl relative overflow-hidden">
			{/* Goal Achieved Toast */}
			{showGoalAchievedToast.show && (
				<GoalAchievedToast
					message={showGoalAchievedToast.text}
					onGoToAnalysis={onGoToAnalysis}
					onClose={onCloseGoalToast}
				/>
			)}

			{/* AI Visual Cue Panel (Left on Desktop, Top on Mobile Main View) */}
			<div
				className={`
          w-full md:w-1/3 md:flex-shrink-0 flex flex-col p-4
          md:h-full md:border-r md:border-slate-700 md:overflow-y-auto
          flex-grow min-h-0 md:flex-grow-0
        `}>
				<div className="text-center md:text-left w-full px-2 mb-2 flex-shrink-0">
					<h2 className="text-lg font-semibold text-sky-400">
						{scenarioDetails.aiName}
					</h2>
					<p
						className="text-xs text-gray-400 truncate"
						title={personalityDisplayText}>
						{personalityDisplayText}
					</p>
					<p className="text-xs text-gray-400">
						{scenarioDetails.customEnvironment || scenarioDetails.environment}
					</p>
				</div>

				{/* Wrapper for AIVisualCue and GoalBanner to allow them to grow and be ordered */}
				<div className="flex-grow min-h-0 flex flex-col gap-4">
					<button
						onClick={() => aiImageBase64 && onViewImage(aiImageBase64)}
						disabled={!aiImageBase64}
						className="group w-full max-w-lg mx-auto md:max-w-none flex-grow min-h-0 rounded-lg shadow-xl overflow-hidden relative focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-900/80 disabled:cursor-not-allowed flex flex-col items-stretch"
						aria-label="View image gallery">
						<AIVisualCue
							imageBase64={aiImageBase64}
							bodyLanguageDescription={bodyLanguageForDisplay}
							isLoading={isLoadingAI && !aiImageBase64}
						/>
						{/* Hover overlay */}
						<div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
							<ZoomInIcon className="h-12 w-12 text-white opacity-90" />
						</div>
					</button>
					{/* Desktop Banner Area */}
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
					/>
				</div>

				{/* Progress bar for desktop, hidden on mobile where it's in the chat overlay */}
				<div className="pt-4 w-full px-2 flex-shrink-0 hidden md:block mt-auto">
					<label
						htmlFor="engagement"
						className="block text-sm font-medium text-sky-300 mb-1 text-center md:text-left">
						Engagement: {currentEngagement}%
					</label>
					<ProgressBar percentage={currentEngagement} />
				</div>
			</div>

			{/* Chat Interface (Right on Desktop) */}
			<div className="hidden md:flex md:w-2/3 relative">
				{/* Background Container (handles blur and clipping) */}
				<div className="absolute inset-0 overflow-hidden rounded-r-xl">
					{aiImageBase64 && (
						<img
							src={`data:image/jpeg;base64,${aiImageBase64}`}
							alt=""
							aria-hidden="true"
							className="absolute inset-0 w-full h-full object-cover filter blur-xl animate-subtle-pan"
						/>
					)}
					<div className="absolute inset-0 w-full h-full bg-slate-800/70" />
				</div>

				{/* Actual Chat Content on top */}
				<div className="relative z-10 w-full h-full flex flex-col">
					<RenderChatInterface
						conversationHistory={conversationHistory}
						currentEngagement={currentEngagement}
						displayedGoal={displayedGoal}
						activeAction={activeAction}
						isActionPaused={isActionPaused}
						isPinnable={isPinnable}
						isGoalPinned={isGoalPinned}
						onPinGoal={onPinGoal}
						onUnpinGoal={onUnpinGoal}
						isContinueActionSuggested={isContinueActionSuggested}
						onSendMessage={onSendMessage}
						onRetryMessage={onRetryMessage}
						onEndConversation={onEndConversation}
						onFastForwardAction={onFastForwardAction}
						onContinueWithoutSpeaking={onContinueWithoutSpeaking}
						isLoadingAI={isLoadingAI}
						scenarioDetailsAiName={scenarioDetails.aiName}
						isMaxEngagement={
							currentEngagement >= 100 && !displayedGoal && !activeAction
						}
						isOverlay={false}
						hasBlurredBackground={true}
						onToggleHelp={onToggleHelp}
						onViewImage={onViewImage}
						goalJustChanged={goalJustChanged}
						onAnimationComplete={onAnimationComplete}
						pendingFeedback={pendingFeedback}
						onFeedbackAnimationComplete={onFeedbackAnimationComplete}
					/>
				</div>
			</div>

			{/* Mobile: Open Chat FAB */}
			{!showChatOverlay && (
				<button
					onClick={() => setShowChatOverlay(true)}
					className="md:hidden fixed bottom-6 right-6 z-30 bg-sky-600 text-white p-4 rounded-full shadow-xl hover:bg-sky-500 transition-all duration-150 ease-in-out transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-sky-400 focus:ring-opacity-50 animate-pulse-glow-fab"
					aria-label="Open chat">
					<ChatBubbleIcon className="h-7 w-7" />
				</button>
			)}

			{/* Mobile: Full Screen Chat Overlay */}
			{showChatOverlay && (
				<div
					className="md:hidden fixed inset-0 z-40 bg-slate-900 animate-[fadeIn_0.2s_ease-out]"
					role="dialog"
					aria-modal="true">
					{/* Background Image Layer */}
					{aiImageBase64 && (
						<img
							src={`data:image/jpeg;base64,${aiImageBase64}`}
							alt=""
							aria-hidden="true"
							className="absolute inset-0 w-full h-full object-cover object-center filter blur-xl animate-subtle-pan"
						/>
					)}
					{/* Darkening & Blur Layer */}
					<div className="absolute inset-0 w-full h-full bg-slate-900/75" />

					{/* Chat Interface Layer (on top) */}
					<div className="relative z-10 h-full">
						<RenderChatInterface
							conversationHistory={conversationHistory}
							currentEngagement={currentEngagement}
							displayedGoal={displayedGoal}
							activeAction={activeAction}
							isActionPaused={isActionPaused}
							isPinnable={isPinnable}
							isGoalPinned={isGoalPinned}
							onPinGoal={onPinGoal}
							onUnpinGoal={onUnpinGoal}
							isContinueActionSuggested={isContinueActionSuggested}
							onSendMessage={onSendMessage}
							onRetryMessage={onRetryMessage}
							onEndConversation={onEndConversation}
							onFastForwardAction={onFastForwardAction}
							onContinueWithoutSpeaking={onContinueWithoutSpeaking}
							isLoadingAI={isLoadingAI}
							scenarioDetailsAiName={scenarioDetails.aiName}
							isMaxEngagement={
								currentEngagement >= 100 && !displayedGoal && !activeAction
							}
							isOverlay={true}
							hasBlurredBackground={true}
							onCloseOverlay={() => setShowChatOverlay(false)}
							onToggleHelp={onToggleHelp}
							onViewImage={onViewImage}
							goalJustChanged={goalJustChanged}
							onAnimationComplete={onAnimationComplete}
							pendingFeedback={pendingFeedback}
							onFeedbackAnimationComplete={onFeedbackAnimationComplete}
						/>
					</div>
				</div>
			)}
		</div>
	);
};
