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
import { TopBannerContainer } from "./TopBannerContainer";
import { BackgroundCrossfadeImage } from "./BackgroundCrossfadeImage";

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
	onModalStateChange?: (isModalActive: boolean) => void;
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
	// Active Action states
	const [isActionCompleting, setIsActionCompleting] = useState(false);
	const [isActionStowingAway, setIsActionStowingAway] = useState(false);
	const [prevAction, setPrevAction] = useState<ActiveAction | null>(null);

	// Goal states
	const [isGoalCompleting, setIsGoalCompleting] = useState(false);
	const [isGoalStowingAway, setIsGoalStowingAway] = useState(false);
	const [prevGoal, setPrevGoal] = useState<{
		text: string;
		progress: number;
	} | null>(null);

	// Track when action reaches 100% and when it gets removed
	useEffect(() => {
		if (action && action.progress >= 100 && !isActionCompleting) {
			setIsActionCompleting(true);
		}

		// If we had an action and now it's null, trigger stow-away
		if (prevAction && !action && !isActionStowingAway) {
			setIsActionStowingAway(true);
		}

		setPrevAction(action);
	}, [action, isActionCompleting, isActionStowingAway, prevAction]);

	// Track when goal reaches 100% and when it gets removed
	useEffect(() => {
		if (goal && goal.progress >= 100 && !isGoalCompleting) {
			setIsGoalCompleting(true);
		}

		// If we had a goal and now it's null, trigger stow-away
		if (prevGoal && !goal && !isGoalStowingAway) {
			setIsGoalStowingAway(true);
		}

		setPrevGoal(goal);
	}, [goal, isGoalCompleting, isGoalStowingAway, prevGoal]);

	const handleActionCompletionAnimationEnd = () => {
		setIsActionCompleting(false);
		// Trigger stow-away animation after completion
		setIsActionStowingAway(true);
	};

	const handleActionStowAwayAnimationEnd = () => {
		setIsActionStowingAway(false);
	};

	const handleGoalCompletionAnimationEnd = () => {
		setIsGoalCompleting(false);
		// Trigger stow-away animation after completion
		setIsGoalStowingAway(true);
	};

	const handleGoalStowAwayAnimationEnd = () => {
		setIsGoalStowingAway(false);
	};

	if (action) {
		return (
			<div
				className={`relative active-action-glow overflow-hidden animate-slideInFromUnderMobile ${
					isActionCompleting ? "animate-action-completion" : ""
				} ${isActionStowingAway ? "animate-stow-away-mobile" : ""}`}
				style={{ zIndex: 1 }}
				onAnimationEnd={
					isActionStowingAway ? handleActionStowAwayAnimationEnd : undefined
				}>
				<div className="relative z-1 bg-sky-900/95 backdrop-blur-md border-t-2 border-sky-500/50 p-3 shadow-xl animate-fadeIn rounded-lg">
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
							className="p-2.5 rounded-full bg-sky-700/90 hover:bg-sky-600/95 text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-wait shadow-lg border border-sky-600/40 hover:border-sky-500/60 hover:shadow-xl hover:scale-105 active:scale-95 backdrop-blur-sm"
							title="Fast Forward to the end of this action">
							<FastForwardIcon className="h-5 w-5" />
						</button>
					</div>
					<ProgressBar
						percentage={action.progress}
						isCompleting={isActionCompleting}
						onCompletionAnimationEnd={handleActionCompletionAnimationEnd}
					/>
				</div>
			</div>
		);
	}

	if (goal) {
		return (
			<div
				className={`bg-teal-900/95 backdrop-blur-md border-t-2 border-teal-500/50 p-3 shadow-xl animate-slideInFromUnderMobile rounded-lg ${
					isGlowing ? "animate-glow-pulse" : ""
				} ${isGoalCompleting ? "animate-goal-completion" : ""} ${
					isGoalStowingAway ? "animate-stow-away-mobile" : ""
				}`}
				style={{ zIndex: 1 }}
				onAnimationEnd={
					isGoalStowingAway ? handleGoalStowAwayAnimationEnd : undefined
				}>
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
				<ProgressBar
					percentage={goal.progress}
					isCompleting={isGoalCompleting}
					onCompletionAnimationEnd={handleGoalCompletionAnimationEnd}
				/>
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
	onModalStateChange,
}) => {
	const [showChatOverlay, setShowChatOverlay] = useState(false);
	const [chatOverlayHasFadedIn, setChatOverlayHasFadedIn] = useState(false);
	const [chatOverlayIsVisible, setChatOverlayIsVisible] = useState(false);
	const [chatOverlayImageVisible, setChatOverlayImageVisible] = useState(false);
	const [showMenu, setShowMenu] = useState(false);
	const [showMenuContent, setShowMenuContent] = useState(false);
	const [showQuitConfirm, setShowQuitConfirm] = useState(false);

	// Cinematic first load experience states
	const [cinematicPhase, setCinematicPhase] = useState<
		| "image"
		| "name"
		| "personality"
		| "encounter-type"
		| "body-language"
		| "complete"
	>("image");
	const [hasCompletedFirstLoad, setHasCompletedFirstLoad] = useState(false);
	const [imageOpacity, setImageOpacity] = useState(0);
	const [nameOpacity, setNameOpacity] = useState(0);
	const [personalityOpacity, setPersonalityOpacity] = useState(0);
	const [encounterTypeOpacity, setEncounterTypeOpacity] = useState(0);
	const [bodyLanguageOpacity, setBodyLanguageOpacity] = useState(0);
	const [showReplayButton, setShowReplayButton] = useState(false);

	// Enhanced cinematic experience states
	const [showScenarioContextModal, setShowScenarioContextModal] =
		useState(false);
	const [scenarioContextModalVisible, setScenarioContextModalVisible] =
		useState(false);
	const [screenDimmed, setScreenDimmed] = useState(false);
	const [uiExclusionZones, setUiExclusionZones] = useState<
		Array<{
			top: number;
			left: number;
			width: number;
			height: number;
		}>
	>([]);
	const [buttonsVisible, setButtonsVisible] = useState(false);
	const [cinematicSequenceComplete, setCinematicSequenceComplete] =
		useState(false);
	const [isReplaying, setIsReplaying] = useState(false);
	const [isCinematicFadingOut, setIsCinematicFadingOut] = useState(false);
	const [isGlobalFading, setIsGlobalFading] = useState(false);

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
			setChatOverlayImageVisible(false);
			const timeout = setTimeout(() => setChatOverlayHasFadedIn(true), 200);
			const imageTimeout = setTimeout(
				() => setChatOverlayImageVisible(true),
				300
			);
			return () => {
				clearTimeout(timeout);
				clearTimeout(imageTimeout);
			};
		} else {
			setChatOverlayHasFadedIn(false);
			setChatOverlayImageVisible(false);
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

	// Enhanced cinematic first load experience
	useEffect(() => {
		if (!aiImageBase64 || hasCompletedFirstLoad || showChatOverlay) return;

		const startCinematicSequence = () => {
			// Phase 1: Image fade-in with parallax drift (1.5s)
			setImageOpacity(1);

			setTimeout(() => {
				// Phase 2: Name appears with slide-up animation (1.5s delay, 0.8s duration)
				setCinematicPhase("name");
				setNameOpacity(1);

				setTimeout(() => {
					// Phase 3: Personality traits with staggered reveal (0.8s delay, 1.0s duration)
					setCinematicPhase("personality");
					setPersonalityOpacity(1);

					setTimeout(() => {
						// Phase 4: Encounter type with dramatic reveal (1.0s delay, 1.2s duration)
						setCinematicPhase("encounter-type");
						setEncounterTypeOpacity(1);

						setTimeout(() => {
							// Phase 5: Body language with subtle reveal (1.2s delay, 1.0s duration)
							setCinematicPhase("body-language");
							setBodyLanguageOpacity(1);

							setTimeout(() => {
								// Phase 6: Cinematic sequence complete
								setCinematicPhase("complete");
								setCinematicSequenceComplete(true);

								// On mobile: show scenario context modal
								// On desktop: skip modal and show buttons directly
								if (window.innerWidth < 768) {
									// Mobile: Dim the screen and show scenario context modal
									setTimeout(() => {
										setScreenDimmed(true);
										setTimeout(() => {
											setShowScenarioContextModal(true);
											setScenarioContextModalVisible(true);
										}, 400);
									}, 800);
								} else {
									// Desktop: After a 2s pause, dim and show the scenario context modal (same as mobile)
									setTimeout(() => {
										setScreenDimmed(true);
										setTimeout(() => {
											setShowScenarioContextModal(true);
											setScenarioContextModalVisible(true);
										}, 400);
									}, 2000);
								}
							}, 1000);
						}, 1200);
					}, 1000);
				}, 800);
			}, 1500);
		};

		// Start sequence after a brief delay to ensure smooth transition
		// Only start if not already completed
		if (!hasCompletedFirstLoad) {
			const timer = setTimeout(startCinematicSequence, 200);
			return () => clearTimeout(timer);
		}
	}, [aiImageBase64, showChatOverlay]);

	// Enhanced replay cinematic animation
	const replayCinematic = () => {
		setIsReplaying(true);
		setIsCinematicFadingOut(true);
		// First, fade out all text elements
		setNameOpacity(0);
		setPersonalityOpacity(0);
		setEncounterTypeOpacity(0);
		setBodyLanguageOpacity(0);
		setShowReplayButton(false);
		setShowScenarioContextModal(false);
		setScenarioContextModalVisible(false);
		setButtonsVisible(false);

		// Wait for text elements to fade out completely (800ms for transition)
		setTimeout(() => {
			// Now fade to black by dimming the screen completely
			setIsGlobalFading(true);

			// After fade to black, reset all elements
			setTimeout(() => {
				// Reset all cinematic states
				setImageOpacity(0);
				setCinematicSequenceComplete(false);
				setHasCompletedFirstLoad(false);
				setCinematicPhase("image");
				setIsCinematicFadingOut(false); // Reset fade-out state

				// Brighten screen and start new sequence
				setTimeout(() => {
					setIsGlobalFading(false);
					setIsReplaying(false);

					const startCinematicSequence = () => {
						// Phase 1: Image fade-in with parallax drift (1.5s)
						setImageOpacity(1);

						setTimeout(() => {
							// Phase 2: Name appears (1.5s delay, 0.8s duration)
							setCinematicPhase("name");
							setNameOpacity(1);

							setTimeout(() => {
								// Phase 3: Personality traits (0.8s delay, 1.0s duration)
								setCinematicPhase("personality");
								setPersonalityOpacity(1);

								setTimeout(() => {
									// Phase 4: Environment/Scenario (1.0s delay, 1.0s duration)
									setCinematicPhase("encounter-type");
									setEncounterTypeOpacity(1);

									setTimeout(() => {
										// Phase 5: Body language (1.0s delay, 1.0s duration)
										setCinematicPhase("body-language");
										setBodyLanguageOpacity(1);

										setTimeout(() => {
											// Phase 6: Cinematic sequence complete
											setCinematicPhase("complete");
											setCinematicSequenceComplete(true);

											// On mobile: show scenario context modal
											// On desktop: skip modal and show buttons directly
											if (window.innerWidth < 768) {
												// Mobile: Dim the screen and show scenario context modal
												setTimeout(() => {
													setScreenDimmed(true);
													setTimeout(() => {
														setShowScenarioContextModal(true);
														setScenarioContextModalVisible(true);
													}, 400);
												}, 800);
											} else {
												// Desktop: After a 2s pause, dim and show the scenario context modal (same as mobile)
												setTimeout(() => {
													setScreenDimmed(true);
													setTimeout(() => {
														setShowScenarioContextModal(true);
														setScenarioContextModalVisible(true);
													}, 400);
												}, 2000);
											}
										}, 1000);
									}, 1000);
								}, 1000);
							}, 800);
						}, 1500);
					};

					startCinematicSequence();
				}, 200); // Brief delay before brightening
			}, 400); // Time for fade to black
		}, 800); // Time for text elements to fade out
	};

	// Handle scenario context modal confirmation
	const handleScenarioContextConfirm = () => {
		if (window.innerWidth >= 768) {
			// Desktop: fade to black then fade back in
			setScenarioContextModalVisible(false);
			// Trigger full black overlay
			setIsGlobalFading(true);

			setTimeout(() => {
				// Hide modal completely while black
				setShowScenarioContextModal(false);
				// Prepare main UI
				setHasCompletedFirstLoad(true);
				setShowReplayButton(true);
				setButtonsVisible(true);

				// Fade back to chat interface
				setTimeout(() => {
					setIsGlobalFading(false);
				}, 400);
			}, 500);
		} else {
			// Mobile – retain existing behaviour
			setScenarioContextModalVisible(false);
			setTimeout(() => {
				setShowScenarioContextModal(false);
				setScreenDimmed(false);
				setHasCompletedFirstLoad(true);
				setShowReplayButton(true);

				setTimeout(() => {
					setButtonsVisible(true);
				}, 200);
			}, 300);
		}
	};

	// Get the scenario context from conversation history
	const scenarioContext =
		conversationHistory.find((msg) => msg.sender === "backstory")?.text ||
		scenarioDetails.customContext ||
		"Review the scenario details before starting your interaction.";

	// Notify parent when modal state changes
	useEffect(() => {
		if (onModalStateChange) {
			onModalStateChange(showScenarioContextModal);
		}
	}, [showScenarioContextModal, onModalStateChange]);

	// Calculate UI exclusion zones for mobile image clicks
	useEffect(() => {
		if (typeof window !== "undefined") {
			const calculateExclusionZones = () => {
				const zones = [
					// Open Chat button (bottom-right)
					{
						top: window.innerHeight - 80,
						left: window.innerWidth - 140,
						width: 140,
						height: 80,
					},
					// Header (top)
					{
						top: 0,
						left: 0,
						width: window.innerWidth,
						height: 64,
					},
					// Replay button (bottom-left)
					{
						top: window.innerHeight - 88,
						left: 0,
						width: 88,
						height: 88,
					},
				];
				setUiExclusionZones(zones);
			};

			calculateExclusionZones();
			window.addEventListener("resize", calculateExclusionZones);

			return () => {
				window.removeEventListener("resize", calculateExclusionZones);
			};
		}
	}, []);

	return (
		<div className="w-full max-w-7xl h-[85vh] flex flex-col md:flex-row bg-slate-800 shadow-2xl rounded-xl relative overflow-hidden">
			{/* Global fade overlay for smooth cross-fades (desktop & mobile) */}
			<div
				className="fixed inset-0 z-[11000] bg-black pointer-events-none transition-opacity duration-700"
				style={{ opacity: isGlobalFading ? 1 : 0 }}
			/>

			{/* Goal Achieved Toast */}
			{showGoalAchievedToast.show && (
				<GoalAchievedToast
					message={showGoalAchievedToast.text}
					onGoToAnalysis={onGoToAnalysis}
					onClose={onCloseGoalToast}
				/>
			)}

			{/* Scenario Context Modal - Mobile Only */}
			{showScenarioContextModal && (
				<div
					className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/25 backdrop-blur-sm"
					style={{ pointerEvents: "auto" }}>
					<div className="text-center transition-all duration-500 max-w-2xl mx-4 animate-modal-fade-in flex flex-col h-96">
						<div className="flex-1 overflow-y-auto custom-scrollbar mb-12 flex items-center justify-center">
							<p className="text-white/90 text-lg leading-relaxed font-light tracking-wide text-center">
								{scenarioContext}
							</p>
						</div>

						<div className="flex-shrink-0">
							<button
								onClick={handleScenarioContextConfirm}
								className={`group relative z-[10000] bg-black/40 hover:bg-black/60 active:bg-black/70 backdrop-blur-md rounded-full px-8 py-4 text-slate-200/90 font-medium text-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-slate-600/40 cursor-pointer shadow-md hover:shadow-lg border border-slate-300/40 overflow-hidden ${
									scenarioContextModalVisible
										? "animate-cinematic-button-appear"
										: ""
								}`}
								style={{ pointerEvents: "auto", letterSpacing: "0.01em" }}>
								{/* Simple shimmer effect on hover */}
								<div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 -translate-x-full group-hover:translate-x-full rounded-full" />

								{/* Subtle border glow on hover */}
								<div className="absolute inset-0 border border-transparent group-hover:border-white/20 transition-all duration-300 rounded-full" />

								{/* Button content with subtle hover effects */}
								<span className="relative z-10 transition-all duration-300 group-hover:text-white group-hover:drop-shadow-sm">
									Continue
								</span>

								{/* Simple click feedback */}
								<div className="absolute inset-0 bg-white/10 opacity-0 group-active:opacity-100 transition-opacity duration-150 rounded-full" />
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Desktop Cinematic Overlay (matches mobile cinematic, only before hasCompletedFirstLoad) */}
			{!hasCompletedFirstLoad && (
				<div
					className="hidden md:block fixed inset-0 z-[9997] bg-black transition-opacity duration-700 animate-fadeIn"
					style={{ pointerEvents: isReplaying ? "none" : "auto" }}>
					<div className="relative w-full h-full flex items-center justify-center">
						<AIVisualCue
							imageBase64={aiImageBase64}
							bodyLanguageDescription={bodyLanguageForDisplay}
							isLoading={isLoadingAI && !aiImageBase64}
							aiName={scenarioDetails.aiName}
							aiPersona={personalityDisplayText}
							aiEnvironment={
								scenarioDetails.customContext ||
								scenarioDetails.customEnvironment ||
								scenarioDetails.environment
							}
							showOverlayText={true}
							isFullScreen={true}
							cinematicPhase={cinematicPhase}
							imageOpacity={imageOpacity}
							nameOpacity={nameOpacity}
							personalityOpacity={personalityOpacity}
							encounterTypeOpacity={encounterTypeOpacity}
							bodyLanguageOpacity={bodyLanguageOpacity}
							hasCompletedFirstLoad={hasCompletedFirstLoad}
							showReplayButton={showReplayButton && buttonsVisible}
							onReplayCinematic={replayCinematic}
							onViewImage={onViewImage}
							uiExclusionZones={[]}
							isHidden={false}
							isCinematicFadingOut={isCinematicFadingOut}
						/>
						{/* Replay button (desktop, bottom left of AI image) */}
						{showReplayButton && buttonsVisible && (
							<button
								onClick={replayCinematic}
								className="absolute left-8 bottom-8 z-[9998] px-8 py-4 rounded-full bg-slate-900/80 border border-slate-700/70 shadow-2xl backdrop-blur-md text-sky-100 font-semibold text-lg hover:bg-slate-800/90 active:bg-slate-900/95 transition-all duration-200 animate-replay-button-fade-in animate-subtle-shimmer focus:outline-none"
								tabIndex={0}
								aria-label="Replay cinematic introduction">
								Replay Intro
							</button>
						)}
					</div>
				</div>
			)}

			{/* AI Visual Cue Panel (Left on Desktop, Top on Mobile Main View) */}
			<div
				className={`
          w-full md:w-1/3 md:flex-shrink-0 flex flex-col p-4 bg-slate-800
          md:h-full md:border-r md:border-slate-700 md:overflow-y-auto
          flex-grow min-h-0 md:flex-grow-0
        `}>
				{/* Base black screen layer for clean transitions */}
				<div className="md:hidden fixed inset-0 z-[9996] bg-black" />

				{/* Mobile AIVisualCue - Fullscreen overlay */}
				<div
					className={`md:hidden fixed inset-0 z-[9997] transition-all duration-300 ${
						showChatOverlay
							? "opacity-0 pointer-events-none scale-95 translate-y-4"
							: isReplaying
							? "opacity-0"
							: screenDimmed
							? "opacity-30"
							: "opacity-100 scale-100 translate-y-0"
					}`}
					style={{
						visibility: showChatOverlay ? "hidden" : "visible",
						transformOrigin: "center center",
					}}>
					<AIVisualCue
						imageBase64={aiImageBase64}
						bodyLanguageDescription={bodyLanguageForDisplay}
						isLoading={isLoadingAI && !aiImageBase64}
						aiName={scenarioDetails.aiName}
						aiPersona={personalityDisplayText}
						aiEnvironment={
							scenarioDetails.customContext ||
							scenarioDetails.customEnvironment ||
							scenarioDetails.environment
						}
						showOverlayText={!!aiImageBase64 && !showChatOverlay}
						cinematicPhase={cinematicPhase}
						imageOpacity={imageOpacity}
						nameOpacity={nameOpacity}
						personalityOpacity={personalityOpacity}
						encounterTypeOpacity={encounterTypeOpacity}
						bodyLanguageOpacity={bodyLanguageOpacity}
						hasCompletedFirstLoad={hasCompletedFirstLoad}
						showReplayButton={showReplayButton && buttonsVisible}
						onReplayCinematic={replayCinematic}
						onViewImage={onViewImage}
						uiExclusionZones={uiExclusionZones}
						isHidden={showChatOverlay}
						isCinematicFadingOut={isCinematicFadingOut}
					/>
					{/* SosheIQ Logo and Header (top) */}
					{!showChatOverlay && (
						<header className="absolute top-0 left-0 right-0 z-[9999] h-14 flex items-center px-4 bg-slate-900/60 backdrop-blur border-b border-slate-700/60 shadow-sm">
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
									className="bg-black/40 hover:bg-black/60 active:bg-slate-700/80 focus:bg-sky-800/70 rounded-full p-2 shadow-lg focus:outline-none transition-all duration-200 ring-1 ring-white/20 hover:ring-white/30"
									aria-label="Open menu">
									<CogIcon className="h-7 w-7 text-white drop-shadow-sm" />
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
						<div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn">
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
										className="px-4 py-2 rounded-lg bg-slate-600 text-slate-100 hover:bg-slate-700 transition-all duration-200 font-semibold shadow-lg">
										End Session
									</button>
								</div>
							</div>
						</div>
					)}
				</div>
				{/* Desktop: normal panel with top text and card styling */}
				{hasCompletedFirstLoad && (
					<div className="hidden md:flex flex-col flex-grow min-h-0 gap-4">
						<div className="text-center md:text-left w-full px-2 mb-2 flex-shrink-0">
							<h2 className="text-lg font-semibold text-sky-400 drop-shadow-sm">
								{scenarioDetails.aiName}
							</h2>
							<p
								className="text-xs text-gray-400 truncate"
								title={personalityDisplayText}>
								{personalityDisplayText}
							</p>
							<p className="text-xs text-gray-400">
								{scenarioDetails.customEnvironment ||
									scenarioDetails.environment}
							</p>
						</div>
						<AIVisualCue
							imageBase64={aiImageBase64}
							bodyLanguageDescription={bodyLanguageForDisplay}
							isLoading={isLoadingAI && !aiImageBase64}
							aiName={scenarioDetails.aiName}
							aiPersona={personalityDisplayText}
							aiEnvironment={
								scenarioDetails.customContext ||
								scenarioDetails.customEnvironment ||
								scenarioDetails.environment
							}
							showOverlayText={!!aiImageBase64 && !showChatOverlay}
							cinematicPhase={cinematicPhase}
							imageOpacity={imageOpacity}
							nameOpacity={nameOpacity}
							personalityOpacity={personalityOpacity}
							encounterTypeOpacity={encounterTypeOpacity}
							bodyLanguageOpacity={bodyLanguageOpacity}
							hasCompletedFirstLoad={hasCompletedFirstLoad}
							showReplayButton={showReplayButton}
							onReplayCinematic={replayCinematic}
							onViewImage={onViewImage}
							uiExclusionZones={[]} // No exclusions needed for desktop
							isCinematicFadingOut={isCinematicFadingOut}
						/>
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
							isOverlay={false}
						/>
					</div>
				)}
				{/* Progress bar for desktop, hidden on mobile where it's in the chat overlay */}
				<div className="pt-4 w-full px-2 flex-shrink-0 hidden md:block mt-auto relative z-20">
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
				{/* Background Container with AI Image */}
				<div className="absolute inset-0 overflow-hidden rounded-r-xl">
					<BackgroundCrossfadeImage
						src={
							aiImageBase64 ? `data:image/jpeg;base64,${aiImageBase64}` : null
						}
						parallax
					/>
					{/* Darkening overlay for better text readability */}
					<div className="absolute inset-0 w-full h-full bg-slate-900/75 backdrop-blur-sm" />
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
			{!showChatOverlay && hasCompletedFirstLoad && buttonsVisible && (
				<button
					onClick={() => setShowChatOverlay(true)}
					className="md:hidden fixed bottom-6 right-6 z-[9997] flex items-center gap-3 px-6 py-3 rounded-2xl bg-slate-900/70 border border-slate-700/70 shadow-2xl backdrop-blur-md text-sky-100 font-semibold text-lg hover:bg-slate-800/80 active:bg-slate-900/90 transition-all duration-150 animate-replay-button-fade-in animate-subtle-shimmer focus:outline-none"
					aria-label="Open chat">
					{/* If you want to crossfade between different icons, use BackgroundCrossfadeImage here. For now, wrap the icon for future extensibility. */}
					<span className="relative w-7 h-7 flex items-center justify-center">
						<ChatBubbleIcon className="h-7 w-7 text-sky-300 drop-shadow" />
					</span>
					<span className="drop-shadow">Open Chat</span>
				</button>
			)}

			{/* Mobile: Full Screen Chat Overlay */}
			{chatOverlayIsVisible && (
				<div
					className={`md:hidden fixed inset-0 z-[9998] bg-black transition-opacity duration-200 ${
						showChatOverlay
							? "animate-chat-overlay-in"
							: "animate-chat-overlay-out pointer-events-none"
					}`}
					role="dialog"
					aria-modal="true">
					{/* Solid background to prevent image pop-in */}
					<div className="absolute inset-0 bg-black" />
					{chatOverlayImageVisible && (
						<BackgroundCrossfadeImage
							src={
								aiImageBase64 ? `data:image/jpeg;base64,${aiImageBase64}` : null
							}
							parallax
							className="animate-fadeIn"
						/>
					)}
					{/* Darkening overlay */}
					<div className="absolute inset-0 w-full h-full bg-slate-900/75 backdrop-blur-sm" />
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
