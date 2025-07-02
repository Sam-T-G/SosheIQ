import React, { useState, useEffect, useRef } from "react";
import type {
	ScenarioDetails,
	ChatMessage,
	ActiveAction,
	UserTurnFeedback,
} from "../types";
import { ProgressBar } from "./ProgressBar";
import { AIVisualCue } from "./AIVisualCue";
import {
	ChatBubbleIcon,
	TargetIcon,
	CheckCircleIcon,
	FastForwardIcon,
	CogIcon,
	XCircleIcon,
	UserIcon,
} from "./Icons";
import { RenderChatInterface } from "./RenderChatInterface";
import { SosheIQLogo } from "./SosheIQLogo";

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
	const [chatOverlayHasFadedIn, setChatOverlayHasFadedIn] = useState(false);
	const [chatOverlayIsVisible, setChatOverlayIsVisible] = useState(false);
	const [showMenu, setShowMenu] = useState(false);
	const [showMenuContent, setShowMenuContent] = useState(false);
	const [showQuitConfirm, setShowQuitConfirm] = useState(false);
	const menuRef = useRef<HTMLDivElement>(null);
	const menuButtonRef = useRef<HTMLButtonElement>(null);

	const lastMeaningfulAiBodyLanguage =
		getLastMeaningfulAiMessageWithBodyLanguage(conversationHistory);

	const bodyLanguageForDisplay =
		lastMeaningfulAiBodyLanguage ||
		(conversationHistory.length === 0 ? initialAiBodyLanguage : undefined) ||
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

	useEffect(() => {
		if (showChatOverlay) {
			setChatOverlayIsVisible(true);
			setChatOverlayHasFadedIn(false);
			const timeout = setTimeout(() => setChatOverlayHasFadedIn(true), 200); // match fadeIn duration
			return () => clearTimeout(timeout);
		} else {
			setChatOverlayHasFadedIn(false);
			// Delay removal of chat overlay for fade-out
			const timeout = setTimeout(() => setChatOverlayIsVisible(false), 200);
			return () => clearTimeout(timeout);
		}
	}, [showChatOverlay]);

	useEffect(() => {
		if (showMenu) {
			setShowMenuContent(true);
		} else if (showMenuContent) {
			// Delay removal for fade out
			const timeout = setTimeout(() => setShowMenuContent(false), 180);
			return () => clearTimeout(timeout);
		}
	}, [showMenu]);

	// Close menu on outside click
	useEffect(() => {
		if (!showMenu) return;
		function handleClick(event: MouseEvent | TouchEvent) {
			const menu = menuRef.current;
			const button = menuButtonRef.current;
			if (
				menu &&
				!menu.contains(event.target as Node) &&
				button &&
				!button.contains(event.target as Node)
			) {
				setShowMenu(false);
			}
		}
		document.addEventListener("mousedown", handleClick);
		document.addEventListener("touchstart", handleClick);
		return () => {
			document.removeEventListener("mousedown", handleClick);
			document.removeEventListener("touchstart", handleClick);
		};
	}, [showMenu]);

	const personalityDisplayText = formatPersonalityForDisplay(scenarioDetails);

	return (
		<div className="w-full max-w-7xl h-[85vh] flex flex-col md:flex-row bg-slate-800 shadow-2xl rounded-xl relative overflow-hidden">
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
          w-full md:w-1/3 md:flex-shrink-0 flex flex-col p-4 bg-slate-800
          md:h-full md:border-r md:border-slate-700 md:overflow-y-auto
          flex-grow min-h-0 md:flex-grow-0
        `}>
				{/* On mobile, render the AIVisualCue as a fullscreen absolute element with no border/padding/background, and omit the top text */}
				<div
					className={`md:hidden fixed inset-0 z-30 transition-opacity duration-200 ${
						showChatOverlay && chatOverlayHasFadedIn
							? "opacity-0 pointer-events-none"
							: "opacity-100"
					}`}>
					<AIVisualCue
						imageBase64={aiImageBase64}
						bodyLanguageDescription={bodyLanguageForDisplay}
						isLoading={isLoadingAI && !aiImageBase64}
						aiName={scenarioDetails.aiName}
						aiPersona={personalityDisplayText}
						aiEnvironment={
							scenarioDetails.customEnvironment || scenarioDetails.environment
						}
						showOverlayText={
							!!aiImageBase64 && (!showChatOverlay || !chatOverlayHasFadedIn)
						}
					/>
					{/* SosheIQ Logo and Header (top) */}
					{!showChatOverlay && (
						<header className="absolute top-0 left-0 right-0 z-40 h-14 flex items-center px-4 bg-slate-900/60 backdrop-blur border-b border-slate-700/60 shadow-sm">
							<div className="flex items-center h-full">
								<button
									onClick={() => setShowQuitConfirm(true)}
									className="flex items-center h-full rounded-lg"
									aria-label="End session"
									type="button">
									<SosheIQLogo className="h-8 w-auto" />
								</button>
							</div>
							<div className="flex-1" />
							<div className="relative flex items-center">
								<button
									ref={menuButtonRef}
									onClick={() => setShowMenu((v) => !v)}
									className="bg-black/30 hover:bg-black/50 active:bg-slate-700/70 focus:bg-sky-800/60 rounded-full p-2 shadow-lg focus:outline-none transition-colors"
									aria-label="Open menu">
									<CogIcon className="h-7 w-7 text-white" />
								</button>
								{(showMenu || showMenuContent) && (
									<div
										ref={menuRef}
										className={`w-40 bg-slate-800/80 border border-slate-600/70 backdrop-blur-sm rounded-xl shadow-2xl py-2 absolute right-0 top-full z-50 ${
											showMenu ? "animate-fadeInUp" : "animate-fadeOutDown"
										}`}>
										<button
											disabled
											className="w-full text-left px-5 py-3 text-base text-slate-400 flex items-center gap-2 rounded-xl transition-colors font-semibold opacity-60 cursor-not-allowed pointer-events-none mb-1">
											<UserIcon className="h-5 w-5 text-slate-400" />
											Profile
										</button>
										<button
											onClick={() => {
												setShowMenu(false);
												setShowQuitConfirm(true);
											}}
											className="w-full text-left px-5 py-3 text-base text-slate-200 hover:bg-slate-700/60 hover:text-slate-100 active:bg-slate-800/80 rounded-xl transition-colors font-semibold">
											End Session
										</button>
									</div>
								)}
							</div>
						</header>
					)}
					{/* Quit confirmation dialog */}
					{showQuitConfirm && (
						<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn">
							<div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-8 max-w-xs w-full text-center">
								<XCircleIcon className="mx-auto mb-3 h-10 w-10 text-slate-400" />
								<h3 className="text-lg font-bold text-slate-100 mb-2">
									End Session?
								</h3>
								<p className="text-slate-300 mb-6">
									Are you sure you want to end this session?
								</p>
								<div className="flex gap-3 justify-center">
									<button
										onClick={() => setShowQuitConfirm(false)}
										className="px-4 py-2 rounded-lg bg-slate-700 text-slate-200 hover:bg-slate-600 transition-colors font-semibold">
										Cancel
									</button>
									<button
										onClick={() => {
											setShowQuitConfirm(false);
											onEndConversation();
										}}
										className="px-4 py-2 rounded-lg bg-slate-600 text-slate-100 hover:bg-slate-700 transition-colors font-semibold">
										End Session
									</button>
								</div>
							</div>
						</div>
					)}
				</div>
				{/* Desktop: normal panel with top text and card styling */}
				<div className="hidden md:flex flex-col flex-grow min-h-0 gap-4">
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
					<AIVisualCue
						imageBase64={aiImageBase64}
						bodyLanguageDescription={bodyLanguageForDisplay}
						isLoading={isLoadingAI && !aiImageBase64}
						aiName={scenarioDetails.aiName}
						aiPersona={personalityDisplayText}
						aiEnvironment={
							scenarioDetails.customEnvironment || scenarioDetails.environment
						}
						showOverlayText={false}
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

			{/* Mobile: Open Chat Button (icon + label, always above text) */}
			{!showChatOverlay && (
				<button
					onClick={() => setShowChatOverlay(true)}
					className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 px-6 py-3 rounded-2xl bg-slate-900/70 border border-slate-700/70 shadow-2xl backdrop-blur-md text-sky-100 font-semibold text-lg hover:bg-slate-800/80 active:bg-slate-900/90 transition-all duration-150 animate-pulse-glow-fab focus:outline-none"
					aria-label="Open chat">
					<ChatBubbleIcon className="h-7 w-7 text-sky-300 drop-shadow" />
					<span className="drop-shadow">Open Chat</span>
				</button>
			)}

			{/* Mobile: Full Screen Chat Overlay */}
			{chatOverlayIsVisible && (
				<div
					className={`md:hidden fixed inset-0 z-40 bg-slate-900 transition-opacity duration-200 ${
						showChatOverlay ? "opacity-100" : "opacity-0 pointer-events-none"
					}`}
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
