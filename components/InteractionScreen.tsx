import React, { useState, useEffect } from "react";
import type { ScenarioDetails, ChatMessage } from "../types";
import { ProgressBar } from "./ProgressBar";
import { AIVisualCue } from "./AIVisualCue";
import { ChatBubbleIcon, TargetIcon } from "./Icons";
import { RenderChatInterface } from "./RenderChatInterface";

interface InteractionScreenProps {
	scenarioDetails: ScenarioDetails;
	conversationHistory: ChatMessage[];
	currentEngagement: number;
	displayedGoal: { text: string; progress: number } | null;
	onSendMessage: (message: string) => void;
	onEndConversation: () => void;
	aiImageBase64: string | null;
	isLoadingAI: boolean; // True when AI is fetching new image/text
	onToggleHelpOverlay: () => void;
	onToggleQuickTipsOverlay: () => void;
	showGlobalAiThoughts: boolean;
	onToggleGlobalAiThoughts: () => void;
	initialAiBodyLanguage: string | null;
	goalJustChanged: boolean;
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
			!msg.isThinkingBubble &&
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

const GoalBanner: React.FC<{
	goal: { text: string; progress: number };
	isGlowing?: boolean;
}> = ({ goal, isGlowing }) => (
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

export const InteractionScreen: React.FC<InteractionScreenProps> = ({
	scenarioDetails,
	conversationHistory,
	currentEngagement,
	displayedGoal,
	onSendMessage,
	onEndConversation,
	aiImageBase64,
	isLoadingAI,
	onToggleHelpOverlay,
	onToggleQuickTipsOverlay,
	showGlobalAiThoughts,
	onToggleGlobalAiThoughts,
	initialAiBodyLanguage,
	goalJustChanged,
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

	const personalityDisplayText = formatPersonalityForDisplay(scenarioDetails);

	return (
		<div className="w-full max-w-5xl h-[85vh] flex flex-col md:flex-row bg-transparent shadow-2xl rounded-xl relative overflow-hidden">
			{/* AI Visual Cue Panel (Left on Desktop, Top on Mobile Main View) */}
			<div
				className={`
          w-full md:w-2/5 flex flex-col flex-grow p-4 bg-slate-800/80 
          md:h-full md:border-r md:border-slate-700 md:overflow-y-auto
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
					<p className="text-xs text-gray-400">{scenarioDetails.environment}</p>
				</div>

				{/* Wrapper for AIVisualCue and GoalBanner to allow them to grow and be ordered */}
				<div className="flex-grow min-h-0 flex flex-col gap-4">
					<AIVisualCue
						imageBase64={aiImageBase64}
						bodyLanguageDescription={bodyLanguageForDisplay}
						isLoading={isLoadingAI && !aiImageBase64} // Show placeholder only if loading AND no image yet
					/>
					{/* Desktop Goal Banner - Moved under the visual cue */}
					<div className="hidden md:block">
						{displayedGoal && (
							<GoalBanner goal={displayedGoal} isGlowing={goalJustChanged} />
						)}
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

			{/* Chat Interface (Right on Desktop, hidden on Mobile Main View) */}
			<div className="hidden md:flex md:flex-1 md:flex-col md:bg-slate-800 md:overflow-hidden md:h-full">
				<RenderChatInterface
					conversationHistory={conversationHistory}
					currentEngagement={currentEngagement}
					displayedGoal={displayedGoal}
					onSendMessage={onSendMessage}
					onEndConversation={onEndConversation}
					isLoadingAI={isLoadingAI} // Pass this to disable send button etc.
					scenarioDetailsAiName={scenarioDetails.aiName}
					isMaxEngagement={currentEngagement >= 100 && !displayedGoal}
					isOverlay={false}
					showGlobalAiThoughts={showGlobalAiThoughts}
					onToggleGlobalAiThoughts={onToggleGlobalAiThoughts}
					onToggleHelpOverlay={onToggleHelpOverlay}
					onToggleQuickTipsOverlay={onToggleQuickTipsOverlay}
					goalJustChanged={goalJustChanged}
				/>
			</div>

			{/* Mobile: Open Chat FAB */}
			{!showChatOverlay && (
				<button
					onClick={() => setShowChatOverlay(true)}
					className="md:hidden fixed bottom-6 right-6 z-30 bg-sky-600 text-white p-4 rounded-full shadow-xl hover:bg-sky-500 transition-all duration-150 ease-in-out transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-sky-400 focus:ring-opacity-50"
					aria-label="Open chat">
					<ChatBubbleIcon />
				</button>
			)}

			{/* Mobile: Full Screen Chat Overlay */}
			{showChatOverlay && (
				<div className="md:hidden fixed inset-0 z-40 bg-slate-900/80 backdrop-blur-lg flex flex-col animate-[fadeIn_0.2s_ease-out]">
					<RenderChatInterface
						conversationHistory={conversationHistory}
						currentEngagement={currentEngagement}
						displayedGoal={displayedGoal}
						onSendMessage={onSendMessage}
						onEndConversation={onEndConversation}
						isLoadingAI={isLoadingAI}
						scenarioDetailsAiName={scenarioDetails.aiName}
						isMaxEngagement={currentEngagement >= 100 && !displayedGoal}
						isOverlay={true}
						onCloseOverlay={() => setShowChatOverlay(false)}
						showGlobalAiThoughts={showGlobalAiThoughts}
						onToggleGlobalAiThoughts={onToggleGlobalAiThoughts}
						onToggleHelpOverlay={onToggleHelpOverlay}
						onToggleQuickTipsOverlay={onToggleQuickTipsOverlay}
						goalJustChanged={goalJustChanged}
					/>
				</div>
			)}
		</div>
	);
};
