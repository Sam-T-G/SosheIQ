import React, { useState, useEffect } from "react";
import type { ScenarioDetails, ChatMessage, ActiveAction } from "../types";
import { ProgressBar } from "./ProgressBar";
import { AIVisualCue } from "./AIVisualCue";
import {
	ChatBubbleIcon,
	TargetIcon,
	CheckCircleIcon,
	FastForwardIcon,
} from "./Icons";
import { RenderChatInterface } from "./RenderChatInterface";

interface InteractionScreenProps {
	scenarioDetails: ScenarioDetails;
	conversationHistory: ChatMessage[];
	currentEngagement: number;
	displayedGoal: { text: string; progress: number } | null;
	activeAction: ActiveAction | null;
	isActionPaused: boolean;
	isContinueActionSuggested: boolean;
	onSendMessage: (message: string) => void;
	onEndConversation: () => void;
	onFastForwardAction: () => void;
	onContinueWithoutSpeaking: () => void;
	aiImageBase64: string | null;
	isLoadingAI: boolean; // True when AI is fetching new image/text
	onToggleHelpOverlay: () => void;
	onToggleQuickTipsOverlay: () => void;
	onViewImage: (url: string | null) => void;
	initialAiBodyLanguage: string | null;
	goalJustChanged: boolean;
	onAnimationComplete: () => void;
	showGoalAchievedToast: { show: boolean; text: string };
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

const TopBanner: React.FC<{
	goal: { text: string; progress: number } | null;
	action: ActiveAction | null;
	isPaused: boolean;
	isGlowing?: boolean;
	onFastForward: () => void;
	isLoading: boolean;
}> = ({ goal, action, isPaused, isGlowing, onFastForward, isLoading }) => {
	if (action) {
		return (
			<div className="bg-sky-900/80 backdrop-blur-sm border-t-2 border-sky-500/50 p-3 shadow-lg animate-fadeIn rounded-md">
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
	}

	if (goal) {
		return (
			<div
				className={`bg-teal-900/80 backdrop-blur-sm border-t-2 border-teal-500/50 p-3 shadow-lg animate-fadeIn rounded-md ${
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
	}

	return null;
};

const GoalAchievedToast: React.FC<{ message: string }> = ({ message }) => (
	<div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-md p-4 bg-green-600 border-2 border-green-400 rounded-xl shadow-2xl animate-goal-toast">
		<div className="flex items-center gap-3">
			<CheckCircleIcon className="h-8 w-8 text-white flex-shrink-0" />
			<div>
				<h3 className="font-bold text-lg text-white">Goal Achieved!</h3>
				<p className="text-sm text-green-100 italic">"{message}"</p>
			</div>
		</div>
	</div>
);

export const InteractionScreen: React.FC<InteractionScreenProps> = ({
	scenarioDetails,
	conversationHistory,
	currentEngagement,
	displayedGoal,
	activeAction,
	isActionPaused,
	isContinueActionSuggested,
	onSendMessage,
	onEndConversation,
	onFastForwardAction,
	onContinueWithoutSpeaking,
	aiImageBase64,
	isLoadingAI,
	onToggleHelpOverlay,
	onToggleQuickTipsOverlay,
	onViewImage,
	initialAiBodyLanguage,
	goalJustChanged,
	onAnimationComplete,
	showGoalAchievedToast,
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
		<div className="w-full max-w-7xl h-[85vh] flex flex-col md:flex-row bg-slate-800 shadow-2xl rounded-xl relative overflow-hidden">
			{/* Goal Achieved Toast */}
			{showGoalAchievedToast.show && (
				<GoalAchievedToast message={showGoalAchievedToast.text} />
			)}

			{/* AI Visual Cue Panel (Left on Desktop, Top on Mobile Main View) */}
			<div
				className={`
          w-full md:w-1/3 md:flex-shrink-0 flex flex-col p-4 bg-slate-800
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
					<AIVisualCue
						imageBase64={aiImageBase64}
						bodyLanguageDescription={bodyLanguageForDisplay}
						isLoading={isLoadingAI && !aiImageBase64} // Show placeholder only if loading AND no image yet
					/>
					{/* Desktop Banner Area */}
					<div className="hidden md:block">
						<TopBanner
							goal={displayedGoal}
							action={activeAction}
							isPaused={isActionPaused}
							isGlowing={goalJustChanged}
							onFastForward={onFastForwardAction}
							isLoading={isLoadingAI}
						/>
					</div>
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
							className="absolute inset-0 w-full h-full object-cover filter blur-xl scale-110"
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
						isContinueActionSuggested={isContinueActionSuggested}
						onSendMessage={onSendMessage}
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
						onToggleHelpOverlay={onToggleHelpOverlay}
						onToggleQuickTipsOverlay={onToggleQuickTipsOverlay}
						onViewImage={onViewImage}
						goalJustChanged={goalJustChanged}
						onAnimationComplete={onAnimationComplete}
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
							className="absolute inset-0 w-full h-full object-cover object-center"
						/>
					)}
					{/* Darkening & Blur Layer */}
					<div className="absolute inset-0 w-full h-full bg-slate-900/75 backdrop-blur-md" />

					{/* Chat Interface Layer (on top) */}
					<div className="relative z-10 h-full">
						<RenderChatInterface
							conversationHistory={conversationHistory}
							currentEngagement={currentEngagement}
							displayedGoal={displayedGoal}
							activeAction={activeAction}
							isActionPaused={isActionPaused}
							isContinueActionSuggested={isContinueActionSuggested}
							onSendMessage={onSendMessage}
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
							onToggleHelpOverlay={onToggleHelpOverlay}
							onToggleQuickTipsOverlay={onToggleQuickTipsOverlay}
							onViewImage={onViewImage}
							goalJustChanged={goalJustChanged}
							onAnimationComplete={onAnimationComplete}
						/>
					</div>
				</div>
			)}
		</div>
	);
};
