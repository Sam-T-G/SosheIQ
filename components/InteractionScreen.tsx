import React, { useState, useEffect } from "react";
import type { ScenarioDetails, ChatMessage } from "../types";
import { ProgressBar } from "./ProgressBar";
import { AIVisualCue } from "./AIVisualCue";
import { ChatBubbleIcon } from "./Icons";
import { RenderChatInterface } from "./RenderChatInterface";

interface InteractionScreenProps {
	scenarioDetails: ScenarioDetails;
	conversationHistory: ChatMessage[];
	currentEngagement: number;
	onSendMessage: (message: string) => void;
	onEndConversation: () => void;
	aiImageBase64: string | null;
	isLoadingAI: boolean; // True when AI is fetching new image/text
	onToggleHelpOverlay: () => void;
	onToggleQuickTipsOverlay: () => void;
	showGlobalAiThoughts: boolean;
	onToggleGlobalAiThoughts: () => void;
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

export const InteractionScreen: React.FC<InteractionScreenProps> = ({
	scenarioDetails,
	conversationHistory,
	currentEngagement,
	onSendMessage,
	onEndConversation,
	aiImageBase64,
	isLoadingAI,
	onToggleHelpOverlay,
	onToggleQuickTipsOverlay,
	showGlobalAiThoughts,
	onToggleGlobalAiThoughts,
}) => {
	const [showChatOverlay, setShowChatOverlay] = useState(false);
	// Use helper function to get the body language description
	const lastMeaningfulAiBodyLanguage =
		getLastMeaningfulAiMessageWithBodyLanguage(conversationHistory);
	const bodyLanguageForDisplay =
		lastMeaningfulAiBodyLanguage ||
		(conversationHistory.length === 0 ? "Initializing..." : "AI is present.");

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

	return (
		<div className="w-full max-w-5xl h-[85vh] flex flex-col md:flex-row bg-slate-800 shadow-2xl rounded-xl overflow-hidden relative">
			{/* AI Visual Cue Panel (Left on Desktop, Top on Mobile Main View) */}
			<div
				className={`
          w-full md:w-2/5 flex flex-col p-4 bg-slate-800/80
          ${showChatOverlay ? "hidden" : "flex"} 
          md:flex md:flex-col md:h-full md:border-r md:border-slate-700 md:overflow-y-auto
        `}>
				<div className="text-center md:text-left w-full px-2 mb-2 flex-shrink-0">
					<h2 className="text-lg font-semibold text-sky-400">
						{scenarioDetails.aiName}
					</h2>
					<p className="text-xs text-gray-400">
						{scenarioDetails.aiPersonality}
					</p>
					<p className="text-xs text-gray-400">
						{scenarioDetails.environment} | {scenarioDetails.powerDynamic}
					</p>
				</div>

				{/* Wrapper for AIVisualCue to allow it to grow */}
				<div className="flex-grow min-h-0 relative flex flex-col">
					<AIVisualCue
						imageBase64={aiImageBase64}
						bodyLanguageDescription={bodyLanguageForDisplay}
						isLoading={isLoadingAI && !aiImageBase64} // Show placeholder only if loading AND no image yet
					/>
				</div>

				<div className="pt-4 w-full px-2 flex-shrink-0">
					<label
						htmlFor="engagement"
						className="block text-sm font-medium text-sky-300 mb-1 text-center">
						{scenarioDetails.aiName}'s Engagement: {currentEngagement}%
					</label>
					<ProgressBar percentage={currentEngagement} />
				</div>
			</div>

			{/* Chat Interface (Right on Desktop, hidden on Mobile Main View) */}
			<div className="hidden md:flex md:flex-1 md:flex-col md:bg-slate-800 md:overflow-hidden md:h-full">
				<RenderChatInterface
					conversationHistory={conversationHistory}
					currentEngagement={currentEngagement}
					onSendMessage={onSendMessage}
					onEndConversation={onEndConversation}
					isLoadingAI={isLoadingAI} // Pass this to disable send button etc.
					scenarioDetailsAiName={scenarioDetails.aiName}
					isMaxEngagement={currentEngagement >= 100}
					isOverlay={false}
					showGlobalAiThoughts={showGlobalAiThoughts}
					onToggleGlobalAiThoughts={onToggleGlobalAiThoughts}
					onToggleHelpOverlay={onToggleHelpOverlay}
					onToggleQuickTipsOverlay={onToggleQuickTipsOverlay}
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
				<div className="md:hidden fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-md flex flex-col animate-[fadeIn_0.2s_ease-out]">
					<div className="flex-1 flex flex-col overflow-hidden">
						<RenderChatInterface
							conversationHistory={conversationHistory}
							currentEngagement={currentEngagement}
							onSendMessage={onSendMessage}
							onEndConversation={onEndConversation}
							isLoadingAI={isLoadingAI}
							scenarioDetailsAiName={scenarioDetails.aiName}
							isMaxEngagement={currentEngagement >= 100}
							isOverlay={true}
							onCloseOverlay={() => setShowChatOverlay(false)}
							showGlobalAiThoughts={showGlobalAiThoughts}
							onToggleGlobalAiThoughts={onToggleGlobalAiThoughts}
							onToggleHelpOverlay={onToggleHelpOverlay}
							onToggleQuickTipsOverlay={onToggleQuickTipsOverlay}
						/>
					</div>
				</div>
			)}
		</div>
	);
};
