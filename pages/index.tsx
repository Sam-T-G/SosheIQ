import React, { useState, useCallback, useEffect, useRef } from "react";
import Head from "next/head";
import { AnimatePresence, motion } from "motion/react";
import { v4 as uuidv4 } from "uuid";
import { HeroScreen } from "../components/HeroScreen";
import { AboutScreen } from "../components/AboutScreen";
import { PrivacyPolicyScreen } from "../components/PrivacyPolicyScreen";
import { TermsOfServiceScreen } from "../components/TermsOfServiceScreen";
import { SafetyScreen } from "../components/SafetyScreen";
import { LoginScreen } from "../components/LoginScreen";
import { InstructionsScreen } from "../components/InstructionsScreen";
import { SetupScreen } from "../components/SetupScreen";
import { GuidedSetup } from "../components/GuidedSetup";
import { InteractionScreen } from "../components/InteractionScreen";
import { AnalysisScreen } from "../components/AnalysisScreen";
import { LoadingIndicator } from "../components/LoadingIndicator";
import { HelpAndTipsOverlay } from "../components/QuickTipsScreen";
import { ConfirmEndInteractionDialog } from "../components/ConfirmEndInteractionDialog";
import { ConfirmationDialog } from "../components/ConfirmationDialog";
import { ImageViewerOverlay } from "../components/ImageViewerOverlay";
import { InitialLoadingScreen } from "../components/InitialLoadingScreen";
import type {
	ScenarioDetails,
	ChatMessage,
	AnalysisReport,
	ActiveAction,
	AiTurnResponse,
	EstablishedVisuals,
	UserTurnFeedback,
} from "../types";
import {
	GamePhase,
	SocialEnvironment,
	AIGender,
	AIAgeBracket,
	AIPersonalityTrait,
} from "../types";
import { GeminiService } from "../services/geminiService";
import { ImagenService } from "../services/imagenService";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import {
	MAX_ZERO_ENGAGEMENT_STREAK,
	ENGAGEMENT_DECAY_PER_TURN,
	INITIAL_ENGAGEMENT,
	SILENT_USER_ACTION_TOKEN,
} from "../constants";
import {
	getErrorMessageByType,
	getErrorMessage,
} from "../constants/errorMessages";
import { useSession } from "./_app";
import { useAuth } from "../contexts/AuthContext";
import { useInitConfig } from "../hooks/useInitConfig";

type DisplayedGoal = {
	text: string;
	progress: number;
} | null;

interface ProcessAiResponseOptions {
	wasFastForward?: boolean;
}

// Custom hook to detect mobile landscape
function useMobileLandscape() {
	const [isMobileLandscape, setIsMobileLandscape] = useState(false);
	useEffect(() => {
		function check() {
			const isMobile = window.innerWidth <= 900;
			const isLandscape = window.innerWidth > window.innerHeight;
			setIsMobileLandscape(isMobile && isLandscape);
		}
		check();
		window.addEventListener("resize", check);
		window.addEventListener("orientationchange", check);
		return () => {
			window.removeEventListener("resize", check);
			window.removeEventListener("orientationchange", check);
		};
	}, []);
	return isMobileLandscape;
}

const HomePage: React.FC = () => {
	const [currentPhase, setCurrentPhase] = useState<GamePhase>(GamePhase.HERO);
	const [setupMode, setSetupMode] = useState<"guided" | "advanced">("guided");
	const [scenarioDetails, setScenarioDetails] =
		useState<ScenarioDetails | null>(null);
	const [conversationHistory, setConversationHistory] = useState<ChatMessage[]>(
		[]
	);
	const [currentEngagement, setCurrentEngagement] =
		useState<number>(INITIAL_ENGAGEMENT);
	const [stagnantTurnStreak, setStagnantTurnStreak] = useState<number>(0);
	const [displayedGoal, setDisplayedGoal] = useState<DisplayedGoal>(null);
	const [lastCompletedGoal, setLastCompletedGoal] =
		useState<DisplayedGoal>(null);
	const [initialConversationGoal, setInitialConversationGoal] = useState<
		string | null
	>(null);
	const [goalJustChanged, setGoalJustChanged] = useState(false);
	const [activeAction, setActiveAction] = useState<ActiveAction | null>(null);
	const [isActionPaused, setIsActionPaused] = useState(false);
	const [isContinueActionSuggested, setIsContinueActionSuggested] =
		useState(false);

	const [zeroEngagementStreak, setZeroEngagementStreak] = useState<number>(0);
	const [isAppLoading, setIsAppLoading] = useState<boolean>(true); // For initial app load
	const [mainAppVisible, setMainAppVisible] = useState<boolean>(false); // For new loading screen
	const [isLoading, setIsLoading] = useState<boolean>(false); // General loading for phase changes, setup, analysis
	const [isAiResponding, setIsAiResponding] = useState<boolean>(false); // Specific for AI turn processing (image and text)
	const [isFadingToBlack, setIsFadingToBlack] = useState<boolean>(false); // For session end fade to black
	const [error, setError] = useState<string | null>(null);
	const [errorDetails, setErrorDetails] = useState<any>(null);
	const [analysisReport, setAnalysisReport] = useState<AnalysisReport | null>(
		null
	);
	const [currentAIImage, setCurrentAIImage] = useState<string | null>(null);
	const [initialAiBodyLanguage, setInitialAiBodyLanguage] = useState<
		string | null
	>(null);

	const geminiService = useRef<GeminiService | null>(null);
	const imagenService = useRef<ImagenService | null>(null);

	const [showHelp, setShowHelp] = useState(false);
	const [showConfirmEndDialog, setShowConfirmEndDialog] = useState(false);
	const [showRandomConfirmDialog, setShowRandomConfirmDialog] = useState(false);
	const [postLoginAction, setPostLoginAction] = useState<
		"start_guided" | "start_random" | null
	>(null);
	const [showGoalAchievedToast, setShowGoalAchievedToast] = useState<{
		show: boolean;
		text: string;
	}>({ show: false, text: "" });
	const [imageGalleryConfig, setImageGalleryConfig] = useState<{
		isOpen: boolean;
		images: { url: string; contextText?: string }[];
		startIndex: number;
	}>({
		isOpen: false,
		images: [],
		startIndex: 0,
	});
	const [pendingFeedback, setPendingFeedback] = useState<{
		messageId: string;
		feedback: UserTurnFeedback;
	} | null>(null);

	const [isModalActive, setIsModalActive] = useState(false);

	const [pendingPhase, setPendingPhase] = useState<GamePhase | null>(null);
	const [showHero, setShowHero] = useState(true);

	const [mainJustify, setMainJustify] = useState<"center" | "start">("center");

	const isMobileLandscape = useMobileLandscape();
	const { sessionInPlay, setSessionInPlay } = useSession();
	const {
		status,
		user,
		isLoading: authLoading,
		loginAsGuest,
		logout,
	} = useAuth();
	const {
		config: initConfig,
		loading: initLoading,
		error: initError,
	} = useInitConfig();

	// Add a derived state for footer fade-out
	const isFooterFadingOut =
		isAppLoading ||
		(isLoading &&
			(currentPhase === GamePhase.LOGIN ||
				currentPhase === GamePhase.HERO ||
				currentPhase === GamePhase.SETUP ||
				(currentPhase === GamePhase.INTERACTION && !scenarioDetails) ||
				(currentPhase === GamePhase.ANALYSIS && !analysisReport && !error)));

	useEffect(() => {
		if (initLoading) return;
		if (initError) {
			setError(initError);
			setIsAppLoading(false);
			setMainAppVisible(true);
			return;
		}
		if (!initConfig) return;

		try {
			geminiService.current = new GeminiService(initConfig.apiKey);
			imagenService.current = new ImagenService(initConfig.apiKey);
		} catch (err) {
			setError("Failed to initialize AI services.");
			setIsAppLoading(false);
			setMainAppVisible(true);
			return;
		}

		// Wait for loading screen completion
		const checkLoadingComplete = () => {
			const isComplete = document.body.getAttribute("data-loading-complete");
			const isReadyForCrossfade = document.body.getAttribute(
				"data-loading-ready-for-crossfade"
			);

			if (isComplete && isReadyForCrossfade) {
				setTimeout(() => {
					setMainAppVisible(true);
					setTimeout(() => setIsAppLoading(false), 800);
				}, 200);
			} else {
				setTimeout(checkLoadingComplete, 100);
			}
		};

		checkLoadingComplete();

		// Fallback timeout
		setTimeout(() => {
			if (isAppLoading) {
				setMainAppVisible(true);
				setTimeout(() => setIsAppLoading(false), 500);
			}
		}, 10000);
	}, [initLoading, initError, initConfig, isAppLoading]);

	// Effect to handle the temporary glow state for the goal banner
	useEffect(() => {
		if (goalJustChanged) {
			const timer = setTimeout(() => {
				setGoalJustChanged(false);
			}, 2500); // Glow for 2.5 seconds
			return () => clearTimeout(timer);
		}
	}, [goalJustChanged]);

	// Effect to handle mobile landscape detection cleanup
	useEffect(() => {
		const handleResize = () => {
			// Mobile landscape detection logic
		};

		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	// Set sessionInPlay based on phase
	useEffect(() => {
		if (currentPhase === GamePhase.INTERACTION) {
			setSessionInPlay(true);
		} else {
			setSessionInPlay(false);
		}
	}, [currentPhase, setSessionInPlay]);

	const resetStateForNewGame = () => {
		setSetupMode("guided");
		setScenarioDetails(null);
		setConversationHistory([]);
		setCurrentEngagement(INITIAL_ENGAGEMENT);
		setStagnantTurnStreak(0);
		setDisplayedGoal(null);
		setLastCompletedGoal(null);
		setInitialConversationGoal(null);
		setActiveAction(null);
		setIsActionPaused(false);
		setIsContinueActionSuggested(false);
		setZeroEngagementStreak(0);
		setAnalysisReport(null);
		setCurrentAIImage(null);
		setInitialAiBodyLanguage(null);
		setGoalJustChanged(false);
		setShowGoalAchievedToast({ show: false, text: "" });
		setImageGalleryConfig({ isOpen: false, images: [], startIndex: 0 });
		setPendingFeedback(null);
		setIsFadingToBlack(false);
	};

	const handleNavigate = useCallback((phase: GamePhase) => {
		setError(null);
		if (phase === GamePhase.HERO) {
			resetStateForNewGame();
		}
		setCurrentPhase(phase);
	}, []);

	const handleHeroExitComplete = useCallback(() => {
		if (pendingPhase) {
			setCurrentPhase(pendingPhase);
			setPendingPhase(null);
			setShowHero(true);
			if (pendingPhase === GamePhase.SETUP) {
				setTimeout(() => setMainJustify("start"), 10); // switch to top-aligned after transition
			}
		}
	}, [pendingPhase]);

	const handleNavigateWithFade = useCallback(
		(phase: GamePhase) => {
			if (currentPhase === GamePhase.HERO) {
				setPendingPhase(phase);
				setShowHero(false); // triggers AnimatePresence exit
			} else {
				handleNavigate(phase);
			}
		},
		[currentPhase, handleNavigate]
	);

	const handleLoginFlow = (action: "start_guided" | "start_random") => {
		// Check if user is already authenticated
		if (status === "authenticated" || status === "guest") {
			// User is already logged in, proceed directly to action
			if (action === "start_guided") {
				setSetupMode("guided");
				handleNavigate(GamePhase.SETUP);
			} else if (action === "start_random") {
				handleStartRandom();
			}
		} else {
			// User needs to authenticate first
			setPostLoginAction(action);
			setCurrentPhase(GamePhase.LOGIN);
		}
	};

	const handleContinueFromLogin = () => {
		// This function is called after successful authentication
		setIsLoading(true); // Show loading screen after login/guest
		if (postLoginAction === "start_guided") {
			setSetupMode("guided");
			handleNavigate(GamePhase.SETUP);
			setIsLoading(false); // Hide loading after navigation
		} else if (postLoginAction === "start_random") {
			handleStartRandom();
		}
		setPostLoginAction(null); // Reset after action is taken
	};

	const handleAuthSuccess = () => {
		// Called when authentication is successful
		handleContinueFromLogin();
	};

	const handleConfirmRandom = () => {
		setShowRandomConfirmDialog(false);
		handleLoginFlow("start_random");
	};

	const handleNavigateToLogin = useCallback(() => {
		// If user clicks the generic "Sign In" link, default the next action to starting the setup.
		setPostLoginAction("start_guided");
		setCurrentPhase(GamePhase.LOGIN);
	}, []);

	const handleViewImage = useCallback(
		(clickedImageUrl: string | null) => {
			if (!clickedImageUrl) return;

			const allImages = conversationHistory
				.map((msg) =>
					msg.sender === "ai" && msg.imageUrl
						? {
								url: msg.imageUrl,
								contextText: msg.contextualSummary || msg.imagePrompt,
						  }
						: null
				)
				.filter(
					(img): img is { url: string; contextText: string | undefined } =>
						img !== null
				);

			// Also consider the absolute current image if it's not yet in history (first turn)
			if (
				currentAIImage &&
				!allImages.some((img) => img.url === currentAIImage)
			) {
				const lastMessage = conversationHistory[conversationHistory.length - 1];
				const context =
					lastMessage?.contextualSummary ||
					lastMessage?.imagePrompt ||
					"Initial character generation.";
				allImages.push({ url: currentAIImage, contextText: context });
			}

			// Deduplicate based on URL, keeping the last occurrence (which is more likely to have a prompt/summary)
			const uniqueImages = Array.from(
				new Map(allImages.map((img) => [img.url, img])).values()
			);

			const startIndex = uniqueImages.findIndex(
				(img) => img.url === clickedImageUrl
			);

			if (uniqueImages.length > 0) {
				setImageGalleryConfig({
					isOpen: true,
					images: uniqueImages,
					startIndex: startIndex !== -1 ? startIndex : 0,
				});
			}
		},
		[conversationHistory, currentAIImage]
	);

	const handleCloseImageGallery = useCallback(() => {
		setImageGalleryConfig({ isOpen: false, images: [], startIndex: 0 });
	}, []);

	const handleStartInteraction = useCallback(
		async (details: ScenarioDetails) => {
			if (!geminiService.current || !imagenService.current) {
				setError("Services not initialized.");
				return;
			}
			setIsLoading(true);
			setError(null);

			resetStateForNewGame();

			const fullDetails: ScenarioDetails = {
				...details,
				aiName: details.aiName?.trim() || "", // Pass empty string to service if user left it blank
				aiPersonalityTraits: details.aiPersonalityTraits || [],
				customAiPersonality: details.customAiPersonality || undefined,
				conversationGoal: details.conversationGoal || undefined,
			};

			try {
				// Step 1: Get initial text-based data from AI, including the established visuals and a generated name if needed.
				const {
					aiName: aiGeneratedName, // The AI will return a name
					scenarioBackstory,
					initialDialogueChunks,
					initialBodyLanguage,
					initialAiThoughts,
					initialEngagementScore,
					initialConversationMomentum,
					conversationStarter,
					establishedVisuals,
					contextualSummary,
				} = await geminiService.current.startConversation(fullDetails);

				// Step 2: Store the details with the definitive AI-provided name and visuals
				const updatedDetailsWithVisuals = {
					...fullDetails,
					aiName: aiGeneratedName, // Use the name from the AI
					establishedVisuals,
				};
				setScenarioDetails(updatedDetailsWithVisuals);
				setInitialConversationGoal(
					updatedDetailsWithVisuals.conversationGoal || null
				);

				// Step 3: Generate the initial image SYNCHRONOUSLY before showing the screen
				const { fullImagenPrompt } =
					await geminiService.current.generateImagePrompt(establishedVisuals);

				const imageBase64 = await imagenService.current.generateImage(
					fullImagenPrompt
				);
				setCurrentAIImage(imageBase64);

				// Step 4: Set all other state based on initial data
				setInitialAiBodyLanguage(initialBodyLanguage);
				setCurrentEngagement(initialEngagementScore);
				if (updatedDetailsWithVisuals.conversationGoal) {
					setDisplayedGoal({
						text: updatedDetailsWithVisuals.conversationGoal,
						progress: 0,
					});
				}

				const initialMessages: ChatMessage[] = [];

				if (scenarioBackstory) {
					// For "I'm Feeling Lucky" scenarios
					initialMessages.push({
						id: uuidv4(),
						sender: "backstory",
						text: scenarioBackstory,
						timestamp: new Date(),
					});
				} else if (contextualSummary) {
					// For standard scenarios, show the initial context
					initialMessages.push({
						id: uuidv4(),
						sender: "backstory",
						text: contextualSummary,
						timestamp: new Date(),
					});
				}

				// Step 5: Add AI's initial state as the first message.
				const initialAiMessage: ChatMessage = {
					id: uuidv4(),
					sender: "ai",
					text: "", // Start with empty text
					dialogueChunks: [],
					timestamp: new Date(),
					bodyLanguageDescription: initialBodyLanguage,
					aiThoughts: initialAiThoughts,
					conversationMomentum: initialConversationMomentum,
					imageUrl: imageBase64,
					imagePrompt: fullImagenPrompt,
					contextualSummary: contextualSummary,
				};

				if (
					conversationStarter === "ai" &&
					initialDialogueChunks &&
					initialDialogueChunks.length > 0
				) {
					// If AI starts, populate text fields
					initialAiMessage.text = initialDialogueChunks
						.map((c) => c.text)
						.join("\n");
					initialAiMessage.dialogueChunks = initialDialogueChunks;
				}

				initialMessages.push(initialAiMessage);
				setConversationHistory(initialMessages);

				// Step 6: Transition to the interaction screen
				setCurrentPhase(GamePhase.INTERACTION);
			} catch (e: unknown) {
				const errorMessage =
					e instanceof Error ? e.message : "Unknown error occurred";
				console.error("Error starting interaction:", errorMessage);
				setError(`Failed to start interaction: ${errorMessage}`);
				// Revert to setup on failure, keeping setup mode consistent
				setCurrentPhase(GamePhase.SETUP);
			} finally {
				setIsLoading(false); // Turn off loading indicator after everything is done
			}
		},
		[]
	);

	const handleLastMessageAnimationComplete = useCallback(() => {
		setIsAiResponding(false);
	}, []);

	const handleEndConversation = useCallback(
		async (aiInitiated = false) => {
			if (!geminiService.current || !scenarioDetails) {
				setError(
					"Cannot end conversation: service or scenario details missing."
				);
				setCurrentPhase(GamePhase.HERO);
				return;
			}

			setShowConfirmEndDialog(false);
			setError(null);

			// Start fade to black transition
			setIsFadingToBlack(true);

			// Wait for fade to black to complete, then transition to analysis
			setTimeout(() => {
				setIsFadingToBlack(false);
				setCurrentPhase(GamePhase.ANALYSIS);

				// Start the actual analysis after a brief delay
				setTimeout(async () => {
					if (!geminiService.current) {
						setError("Service not available for analysis");
						setIsLoading(false);
						return;
					}

					setIsLoading(true);

					const historyForAnalysis = conversationHistory.filter(
						(m) => !m.isThoughtBubble
					);
					setConversationHistory(historyForAnalysis);

					try {
						const finalScenarioDetails = { ...scenarioDetails };
						// This ensures that an emerged goal is passed to the analysis screen
						if (displayedGoal && !finalScenarioDetails.conversationGoal) {
							finalScenarioDetails.conversationGoal = displayedGoal.text;
						}

						const report = await geminiService.current.analyzeConversation(
							historyForAnalysis,
							finalScenarioDetails,
							currentEngagement
						);
						setAnalysisReport(report);
					} catch (e: unknown) {
						const errorMessage =
							e instanceof Error ? e.message : "Unknown error occurred";
						console.error("Error generating analysis report:", errorMessage);
						setError(`Failed to generate analysis: ${errorMessage}`);
						setAnalysisReport(null);
					} finally {
						setIsLoading(false);
					}
				}, 800); // Brief delay before starting analysis
			}, 1200); // Wait for fade to black animation
		},
		[conversationHistory, scenarioDetails, currentEngagement, displayedGoal]
	);

	const handleFeedbackAnimationComplete = useCallback(
		(messageId: string, feedback: UserTurnFeedback) => {
			// This is where the feedback from the animation tray gets applied to the message in history
			setConversationHistory((prev) =>
				prev.map((m) =>
					m.id === messageId
						? {
								...m,
								engagementDelta: feedback.engagementDelta,
								userTurnEffectivenessScore: feedback.userTurnEffectivenessScore,
								positiveTraitContribution: feedback.positiveTraitContribution,
								negativeTraitContribution: feedback.negativeTraitContribution,
								badgeReasoning: feedback.badgeReasoning,
								nextStepSuggestion: feedback.nextStepSuggestion,
								alternativeSuggestion: feedback.alternativeSuggestion,
						  }
						: m
				)
			);
			// Clear the pending feedback so the tray disappears
			setPendingFeedback(null);
		},
		[]
	);

	const processAiResponse = useCallback(
		(
			aiResponse: AiTurnResponse,
			userMessageId?: string,
			options?: ProcessAiResponseOptions
		) => {
			let scenarioForThisTurn = { ...scenarioDetails! };

			// Step 1: Update visual and persona state first
			if (aiResponse.updatedEstablishedVisuals) {
				scenarioForThisTurn.establishedVisuals =
					aiResponse.updatedEstablishedVisuals;
			}
			if (aiResponse.newEnvironment) {
				const newEnvString = aiResponse.newEnvironment;
				// Check if the returned string is a value in the SocialEnvironment enum
				const isKnownEnvironment = Object.values(SocialEnvironment).includes(
					newEnvString as SocialEnvironment
				);

				if (isKnownEnvironment) {
					scenarioForThisTurn.environment = newEnvString as SocialEnvironment;
					// If it's a standard one, we can clear the custom description if it exists
					if (newEnvString !== SocialEnvironment.CUSTOM) {
						scenarioForThisTurn.customEnvironment = undefined;
					}
				} else {
					// It's a new, descriptive environment. Set to CUSTOM.
					scenarioForThisTurn.environment = SocialEnvironment.CUSTOM;
					scenarioForThisTurn.customEnvironment = newEnvString;
				}

				if (scenarioForThisTurn.establishedVisuals) {
					scenarioForThisTurn.establishedVisuals.environmentDescription =
						newEnvString;
				}
			}
			if (aiResponse.updatedPersonaDetails) {
				scenarioForThisTurn.customContext = [
					scenarioForThisTurn.customContext,
					aiResponse.updatedPersonaDetails,
				]
					.filter(Boolean)
					.join("\n\n");
			}

			// Step 1.5: Handle action suggestions
			setIsContinueActionSuggested(aiResponse.isUserActionSuggested ?? false);

			// Step 2: Create the AI message object for the chat log
			const dialogueChunks = aiResponse.dialogueChunks || [];

			// Prepare messages to add in a single batch
			const newMessages: ChatMessage[] = [];

			// NEW LOGIC: Handle AI-inferred user actions differently
			// If this was triggered by a silent user action (continue button),
			// create a separate user_action message that's visually distinct
			if (userMessageId === undefined && aiResponse.feedbackOnUserTurn) {
				// This means the AI generated an inferred user action
				const inferredUserActionMessage: ChatMessage = {
					id: uuidv4(),
					sender: "user_action",
					text:
						aiResponse.feedbackOnUserTurn.inferredUserAction ||
						"You continue the interaction",
					timestamp: new Date(),
					isInferredAction: true,
					userTurnEffectivenessScore:
						aiResponse.feedbackOnUserTurn?.userTurnEffectivenessScore,
					engagementDelta: aiResponse.feedbackOnUserTurn?.engagementDelta,
					positiveTraitContribution:
						aiResponse.feedbackOnUserTurn?.positiveTraitContribution,
					negativeTraitContribution:
						aiResponse.feedbackOnUserTurn?.negativeTraitContribution,
					badgeReasoning: aiResponse.feedbackOnUserTurn?.badgeReasoning,
					nextStepSuggestion: aiResponse.feedbackOnUserTurn?.nextStepSuggestion,
					alternativeSuggestion:
						aiResponse.feedbackOnUserTurn?.alternativeSuggestion,
				};
				newMessages.push(inferredUserActionMessage);
			}

			const goalChangeInfo: ChatMessage["goalChange"] | undefined = (() => {
				const prevGoalText = displayedGoal?.text || null;
				const newGoalText = aiResponse.emergingGoal?.trim() || null;
				if (!scenarioForThisTurn.conversationGoal) {
					if (newGoalText && !prevGoalText)
						return { type: "established", to: newGoalText };
					if (prevGoalText && !newGoalText)
						return { type: "removed", from: prevGoalText };
					if (prevGoalText && newGoalText && prevGoalText !== newGoalText)
						return { type: "changed", from: prevGoalText, to: newGoalText };
				}
				// Enhanced goal change tracking for pinned goals
				if (scenarioForThisTurn.conversationGoal && aiResponse.achieved) {
					return {
						type: "removed",
						from: scenarioForThisTurn.conversationGoal,
					};
				}
				return undefined;
			})();

			const aiMessageTurn: ChatMessage = {
				id: uuidv4(),
				sender: "ai",
				text: dialogueChunks
					.filter((c) => c.type === "dialogue")
					.map((c) => c.text)
					.join("\n"),
				dialogueChunks: dialogueChunks,
				timestamp: new Date(),
				bodyLanguageDescription: aiResponse.aiBodyLanguage,
				aiThoughts: aiResponse.aiThoughts,
				conversationMomentum: aiResponse.conversationMomentum,
				goalChange: goalChangeInfo,
				contextualSummary: aiResponse.contextualSummary,
			};
			newMessages.push(aiMessageTurn);

			// Batch add both messages
			setConversationHistory((prev) => [...prev, ...newMessages]);

			// Step 3: Update conversation history and scores in a single batch
			const feedback = aiResponse.feedbackOnUserTurn;

			if (userMessageId && feedback) {
				setPendingFeedback({ messageId: userMessageId, feedback });

				const { engagementDelta = 0 } = feedback;
				const newEngagementValue = Math.max(
					0,
					Math.min(
						100,
						currentEngagement +
							engagementDelta -
							ENGAGEMENT_DECAY_PER_TURN -
							stagnantTurnStreak
					)
				);
				setCurrentEngagement(newEngagementValue);
				setZeroEngagementStreak(
					newEngagementValue <= 0 ? (prev) => prev + 1 : 0
				);

				if (engagementDelta <= 0) {
					setStagnantTurnStreak((prev) => prev + 1);
				} else {
					setStagnantTurnStreak(0);
				}
			}

			// Step 4: Conditionally generate new image.
			(async () => {
				if (
					aiResponse.shouldGenerateNewImage &&
					scenarioForThisTurn.establishedVisuals &&
					geminiService.current &&
					imagenService.current
				) {
					const finalVisualsForImage = {
						...scenarioForThisTurn.establishedVisuals,
					};
					finalVisualsForImage.currentPoseAndAction = aiResponse.aiBodyLanguage;
					try {
						const { fullImagenPrompt } =
							await geminiService.current.generateImagePrompt(
								finalVisualsForImage
							);
						const imageBase64 = await imagenService.current.generateImage(
							fullImagenPrompt
						);
						setCurrentAIImage(imageBase64);
						setConversationHistory((prev) =>
							prev.map((m) =>
								m.id === aiMessageTurn.id
									? {
											...m,
											imageUrl: imageBase64,
											imagePrompt: fullImagenPrompt,
									  }
									: m
							)
						);
					} catch (imgError: unknown) {
						const errorMessage =
							imgError instanceof Error
								? imgError.message
								: "Unknown error occurred";
						console.error("Optimized image generation failed:", errorMessage);
						setConversationHistory((prev) =>
							prev.map((m) =>
								m.id === aiMessageTurn.id
									? { ...m, imageUrl: currentAIImage ?? undefined }
									: m
							)
						);
					}
				} else {
					setConversationHistory((prev) =>
						prev.map((m) =>
							m.id === aiMessageTurn.id
								? { ...m, imageUrl: currentAIImage ?? undefined }
								: m
						)
					);
				}
			})();

			// Step 5: Update goal and active action UI state
			let nextActiveAction: ActiveAction | null = activeAction;
			let nextIsActionPaused: boolean = isActionPaused;
			let updatedDisplayedGoal: DisplayedGoal = displayedGoal;

			// Handle Actions first, as they take banner priority
			if (aiResponse.activeAction) {
				const prevProgress =
					activeAction?.description === aiResponse.activeAction.description
						? activeAction.progress
						: 0;
				nextActiveAction = {
					...aiResponse.activeAction,
					progress: Math.max(prevProgress, aiResponse.activeAction.progress),
				};
				nextIsActionPaused = false;
				updatedDisplayedGoal = null; // Action takes priority
			} else if (activeAction) {
				if (options?.wasFastForward || activeAction.progress >= 100) {
					nextActiveAction = null;
				} else {
					nextActiveAction = activeAction;
					nextIsActionPaused = true;
					updatedDisplayedGoal = null; // Paused action takes priority
				}
			}

			// Handle Goals only if no action is active
			if (!nextActiveAction) {
				const emergingGoalText = aiResponse.emergingGoal?.trim();
				const pinnedGoalText = scenarioForThisTurn.conversationGoal;
				const currentGoalText = pinnedGoalText || emergingGoalText;

				if (currentGoalText) {
					const goalProgress = aiResponse.goalProgress;
					const isAchieved = aiResponse.achieved || goalProgress >= 100;

					if (isAchieved) {
						if (lastCompletedGoal?.text !== currentGoalText) {
							if (currentGoalText !== initialConversationGoal) {
								setShowGoalAchievedToast({ show: true, text: currentGoalText });
							}
							setLastCompletedGoal({ text: currentGoalText, progress: 100 });
						}
						// CRITICAL FIX: Unpin the goal by clearing it from the scenario details
						if (scenarioForThisTurn.conversationGoal === currentGoalText) {
							scenarioForThisTurn.conversationGoal = undefined;
						}
						updatedDisplayedGoal = null; // Remove from banner
					} else {
						updatedDisplayedGoal = {
							text: currentGoalText,
							progress: goalProgress,
						};
						if (goalChangeInfo) {
							setGoalJustChanged(true);
						}
					}
				} else {
					updatedDisplayedGoal = null; // No goal active
				}
			}

			// Atomically set all state at the end
			setScenarioDetails(scenarioForThisTurn); // This now contains the unpinned goal
			setActiveAction(nextActiveAction);
			setIsActionPaused(nextIsActionPaused);
			setDisplayedGoal(updatedDisplayedGoal);

			// Step 6: Check for end conditions or dynamic goal achievement
			const isPreconfiguredGoal = !!initialConversationGoal;
			const finalGoalIsAchieved =
				aiResponse.achieved || (updatedDisplayedGoal?.progress ?? 0) >= 100;
			const shouldEndForUserGoal = isPreconfiguredGoal && finalGoalIsAchieved;
			const currentTurnZeroStreak =
				currentEngagement <= 0 ? zeroEngagementStreak + 1 : 0;
			const shouldEndForLowEngagement =
				currentEngagement <= 0 &&
				currentTurnZeroStreak >= MAX_ZERO_ENGAGEMENT_STREAK;

			if (
				aiResponse.isEndingConversation ||
				shouldEndForUserGoal ||
				shouldEndForLowEngagement
			) {
				handleEndConversation(true);
				setIsAiResponding(false);
				return; // Prevent further state updates for this turn
			}
		},
		[
			scenarioDetails,
			initialConversationGoal,
			currentEngagement,
			displayedGoal,
			zeroEngagementStreak,
			activeAction,
			isActionPaused,
			lastCompletedGoal,
			stagnantTurnStreak,
			handleEndConversation,
		]
	);

	const handleSendMessage = useCallback(
		async (messages: { gesture?: string; dialogue?: string }) => {
			if (!geminiService.current || !scenarioDetails || isAiResponding) return;

			const newMessages: ChatMessage[] = [];
			let userMessageId: string | undefined;

			// Create user action message if gesture exists
			if (messages.gesture) {
				newMessages.push({
					id: uuidv4(),
					sender: "user_action",
					text: messages.gesture.replace(/^\*|\*$/g, "").trim(),
					timestamp: new Date(),
				});
			}

			// Create user dialogue message if dialogue exists
			if (messages.dialogue) {
				const userDialogueMessage: ChatMessage = {
					id: uuidv4(),
					sender: "user",
					text: messages.dialogue,
					timestamp: new Date(),
				};
				userMessageId = userDialogueMessage.id; // The dialogue message gets the feedback
				newMessages.push(userDialogueMessage);
			} else if (newMessages.length > 0) {
				// If only a gesture was sent, it should get the feedback.
				userMessageId = newMessages[0].id;
			}

			if (newMessages.length === 0) return;

			setConversationHistory((prev) => [...prev, ...newMessages]);
			setIsAiResponding(true);
			setError(null);
			setIsContinueActionSuggested(false); // Action taken, remove suggestion

			try {
				// Construct the full input text for the AI from all new messages
				const fullUserInput = newMessages.map((m) => m.text).join("\n");
				const historyForAI = [...conversationHistory, ...newMessages];
				const lastAiMessage = [...conversationHistory]
					.reverse()
					.find((m) => m.sender === "ai");
				const lastAiPose =
					lastAiMessage?.bodyLanguageDescription ||
					scenarioDetails.establishedVisuals?.currentPoseAndAction ||
					"";

				const aiResponse = await geminiService.current.getNextAITurn(
					historyForAI,
					fullUserInput,
					currentEngagement,
					scenarioDetails,
					lastAiPose,
					activeAction,
					false, // fastForwardAction
					isActionPaused
				);
				processAiResponse(aiResponse, userMessageId);
			} catch (e: unknown) {
				const errorMessage =
					e instanceof Error ? e.message : "Unknown error occurred";
				console.error(
					"Error sending message or getting AI response:",
					errorMessage
				);
				const systemErrorMessage: ChatMessage = {
					id: uuidv4(),
					sender: "system",
					text: "I'm sorry, I had a problem generating a response.",
					timestamp: new Date(),
					isRetryable: true,
					originalMessageText: messages.dialogue, // Only retry dialogue
				};
				setConversationHistory((prev) => [...prev, systemErrorMessage]);
				setIsAiResponding(false);
			}
		},
		[
			processAiResponse,
			conversationHistory,
			currentEngagement,
			scenarioDetails,
			isAiResponding,
			activeAction,
			isActionPaused,
		]
	);

	const handleRetryMessage = useCallback(
		(messageText: string) => {
			// Remove the system error message and the failed user message before retrying.
			setConversationHistory((prev) => {
				const lastIsRetryableSystem =
					prev[prev.length - 1]?.sender === "system" &&
					prev[prev.length - 1]?.isRetryable;
				const secondLastIsUser = prev[prev.length - 2]?.sender === "user";

				if (prev.length >= 2 && lastIsRetryableSystem && secondLastIsUser) {
					return prev.slice(0, -2);
				}
				// Fallback if the message order is not as expected, just remove the system message.
				if (prev.length >= 1 && lastIsRetryableSystem) {
					return prev.slice(0, -1);
				}
				return prev;
			});

			// Use a timeout to ensure the state update from removing messages has processed
			// before we add the new message back in handleSendMessage.
			setTimeout(() => {
				handleSendMessage({ dialogue: messageText });
			}, 100);
		},
		[handleSendMessage]
	);

	const handleContinueWithoutSpeaking = useCallback(() => {
		if (isAiResponding) return;
		handleSendMessage({ dialogue: SILENT_USER_ACTION_TOKEN });
	}, [handleSendMessage, isAiResponding]);

	const handleFastForwardAction = useCallback(async () => {
		if (
			!geminiService.current ||
			!scenarioDetails ||
			isAiResponding ||
			!activeAction
		)
			return;

		setIsAiResponding(true);
		setError(null);
		try {
			const lastAiMessage = [...conversationHistory]
				.reverse()
				.find((m) => m.sender === "ai");
			const lastAiPose =
				lastAiMessage?.bodyLanguageDescription ||
				scenarioDetails.establishedVisuals?.currentPoseAndAction ||
				"";

			const aiResponse = await geminiService.current.getNextAITurn(
				conversationHistory,
				"[User fast-forwarded the action]", // Internal note for AI context
				currentEngagement,
				scenarioDetails,
				lastAiPose,
				activeAction,
				true, // Fast Forward Flag
				isActionPaused
			);
			processAiResponse(aiResponse, undefined, { wasFastForward: true });
		} catch (e: unknown) {
			const errorMessage =
				e instanceof Error ? e.message : "Unknown error occurred";
			console.error("Error during fast forward:", errorMessage);
			const systemErrorMessage: ChatMessage = {
				id: uuidv4(),
				sender: "system",
				text: "Sorry, there was an error trying to fast-forward. Please continue normally.",
				timestamp: new Date(),
			};
			setConversationHistory((prev) => [...prev, systemErrorMessage]);
		} finally {
			// This will be handled by the onAnimationComplete callback now
			// setIsAiResponding(false);
		}
	}, [
		processAiResponse,
		conversationHistory,
		currentEngagement,
		scenarioDetails,
		activeAction,
		isAiResponding,
		isActionPaused,
	]);

	const handleRestart = useCallback(() => {
		setCurrentPhase(GamePhase.SETUP);
		resetStateForNewGame();
		setError(null);
	}, []);

	const handleToggleHelp = () => setShowHelp((prev) => !prev);

	const handleConfirmEndInteraction = () => {
		handleNavigate(GamePhase.HERO);
		setShowConfirmEndDialog(false);
	};

	const handleAttemptEndConversation = () => {
		handleEndConversation(false);
	};

	const handlePinGoal = useCallback(
		(goalText: string) => {
			if (scenarioDetails) {
				setScenarioDetails((prev) => ({
					...prev!,
					conversationGoal: goalText,
				}));
				setDisplayedGoal((prev) => (prev ? { ...prev, text: goalText } : null));
				setGoalJustChanged(true); // Trigger glow effect for pinning
			}
		},
		[scenarioDetails]
	);

	const handleUnpinGoal = useCallback(() => {
		if (scenarioDetails) {
			setScenarioDetails((prev) => ({
				...prev!,
				conversationGoal: undefined, // Unpin by clearing the official goal
			}));
			// The displayedGoal will revert to the AI's emergingGoal on the next turn.
			setGoalJustChanged(true); // Trigger glow effect to show change
		}
	}, [scenarioDetails]);

	const handleStartRandom = useCallback(() => {
		if (!geminiService.current || !imagenService.current) {
			setError(getErrorMessage("STATE_ERROR").userMessage);
			return;
		}
		// Show loading indicator immediately
		setIsLoading(true);

		const environments = Object.values(SocialEnvironment).filter(
			(e) => e !== SocialEnvironment.CUSTOM
		);
		const genders = Object.values(AIGender);
		const ageBrackets = Object.values(AIAgeBracket).filter(
			(a) => a !== AIAgeBracket.CUSTOM && a !== AIAgeBracket.NOT_SPECIFIED
		);
		const personalityTraits = Object.values(AIPersonalityTrait);

		const randomGender = genders[Math.floor(Math.random() * genders.length)];
		const numTraits = Math.floor(Math.random() * 3) + 1; // 1 to 3 traits
		const randomTraits = [...personalityTraits]
			.sort(() => 0.5 - Math.random())
			.slice(0, numTraits);

		const randomScenario: ScenarioDetails = {
			environment:
				environments[Math.floor(Math.random() * environments.length)],
			aiGender: randomGender,
			aiName: "", // Name will be generated by the AI service
			aiAgeBracket: ageBrackets[Math.floor(Math.random() * ageBrackets.length)],
			aiPersonalityTraits: randomTraits,
			isRandomScenario: true,
		};

		handleStartInteraction(randomScenario);
		// Loading will be hidden when scenario is ready in handleStartInteraction
	}, [handleStartInteraction]);

	const handleGoToAnalysis = () => {
		// Hide the toast immediately if it's open, then proceed.
		setShowGoalAchievedToast({ show: false, text: "" });
		handleAttemptEndConversation();
	};

	const renderContent = () => {
		if (
			error &&
			(currentPhase === GamePhase.SETUP ||
				currentPhase === GamePhase.HERO ||
				!geminiService.current)
		) {
			return (
				<div className="w-full max-w-xl p-6 bg-red-800/20 border border-red-700 text-red-300 rounded-lg shadow-xl text-center">
					<h2 className="text-2xl font-bold mb-3">An Error Occurred</h2>
					<p className="mb-4">{error}</p>
					<button
						onClick={() => handleNavigate(GamePhase.HERO)}
						className="bg-sky-600 hover:bg-sky-500 text-white font-bold py-2 px-4 rounded-lg">
						Back to Home
					</button>
				</div>
			);
		}

		if (
			isLoading &&
			(currentPhase === GamePhase.LOGIN ||
				currentPhase === GamePhase.HERO ||
				currentPhase === GamePhase.SETUP ||
				(currentPhase === GamePhase.INTERACTION && !scenarioDetails) ||
				(currentPhase === GamePhase.ANALYSIS && !analysisReport && !error))
		) {
			let message = "Loading...";
			if (currentPhase === GamePhase.ANALYSIS) {
				message = "Generating analysis...";
			} else if (
				scenarioDetails?.isRandomScenario ||
				(currentPhase === GamePhase.HERO && isLoading)
			) {
				message = "Conjuring a scenario...";
			} else if (currentPhase === GamePhase.LOGIN) {
				message = "Logging in...";
			}
			return (
				<LoadingIndicator
					message={message}
					scenarioDetails={scenarioDetails || undefined}
				/>
			);
		}

		return (
			<AnimatePresence
				mode="wait"
				initial={false}
				onExitComplete={handleHeroExitComplete}>
				{currentPhase === GamePhase.HERO && showHero && (
					<motion.div
						key="hero"
						initial={{ opacity: 0, y: 40 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -40 }}
						transition={{
							type: "spring",
							stiffness: 80,
							damping: 22,
							mass: 1.1,
						}}>
						<HeroScreen
							onStart={() => handleLoginFlow("start_guided")}
							onShowInstructions={() =>
								handleNavigateWithFade(GamePhase.INSTRUCTIONS)
							}
							onStartRandom={() => setShowRandomConfirmDialog(true)}
							onNavigateToAbout={() => handleNavigateWithFade(GamePhase.ABOUT)}
							onNavigateToLogin={handleNavigateToLogin}
							onNavigateToSafety={() =>
								handleNavigateWithFade(GamePhase.SAFETY)
							}
						/>
					</motion.div>
				)}
				{currentPhase === GamePhase.SETUP &&
					(setupMode === "guided" ? (
						<motion.div
							key="guided-setup"
							initial={{ opacity: 0, y: 40 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -40 }}
							transition={{
								type: "spring",
								stiffness: 80,
								damping: 22,
								mass: 1.1,
							}}>
							<GuidedSetup
								onStart={handleStartInteraction}
								onSwitchToAdvanced={() => setSetupMode("advanced")}
							/>
						</motion.div>
					) : (
						<motion.div
							key="advanced-setup"
							initial={{ opacity: 0, y: 40 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -40 }}
							transition={{
								type: "spring",
								stiffness: 80,
								damping: 22,
								mass: 1.1,
							}}>
							<SetupScreen
								onStart={handleStartInteraction}
								onBack={() => setSetupMode("guided")}
							/>
						</motion.div>
					))}
				{(() => {
					switch (currentPhase) {
						case GamePhase.LOGIN:
							return (
								<LoginScreen
									onNavigateToHome={() => handleNavigate(GamePhase.HERO)}
									onContinueAsGuest={handleAuthSuccess}
									onAuthSuccess={handleAuthSuccess}
									onNavigateToTerms={() => handleNavigate(GamePhase.TERMS)}
									onNavigateToPrivacy={() => handleNavigate(GamePhase.PRIVACY)}
								/>
							);
						case GamePhase.ABOUT:
							return (
								<AboutScreen onBack={() => handleNavigate(GamePhase.HERO)} />
							);
						case GamePhase.PRIVACY:
							return (
								<PrivacyPolicyScreen
									onBack={() => handleNavigate(GamePhase.HERO)}
								/>
							);
						case GamePhase.TERMS:
							return (
								<TermsOfServiceScreen
									onBack={() => handleNavigate(GamePhase.HERO)}
								/>
							);
						case GamePhase.SAFETY:
							return (
								<SafetyScreen onBack={() => handleNavigate(GamePhase.HERO)} />
							);
						case GamePhase.INSTRUCTIONS:
							return <InstructionsScreen onNavigate={handleNavigate} />;
						case GamePhase.INTERACTION:
							if (!scenarioDetails)
								return <LoadingIndicator message="Loading scenario..." />;

							const isPinnable =
								!!displayedGoal && !scenarioDetails.conversationGoal;
							const isGoalPinned =
								!!scenarioDetails.conversationGoal &&
								scenarioDetails.conversationGoal === displayedGoal?.text;

							return (
								<InteractionScreen
									scenarioDetails={scenarioDetails}
									conversationHistory={conversationHistory}
									currentEngagement={currentEngagement}
									displayedGoal={displayedGoal}
									activeAction={activeAction}
									isActionPaused={isActionPaused}
									isPinnable={isPinnable}
									isGoalPinned={isGoalPinned}
									onPinGoal={handlePinGoal}
									onUnpinGoal={handleUnpinGoal}
									isContinueActionSuggested={isContinueActionSuggested}
									onSendMessage={handleSendMessage}
									onRetryMessage={handleRetryMessage}
									onEndConversation={handleAttemptEndConversation}
									onFastForwardAction={handleFastForwardAction}
									onContinueWithoutSpeaking={handleContinueWithoutSpeaking}
									aiImageBase64={currentAIImage}
									isLoadingAI={isAiResponding}
									onToggleHelp={handleToggleHelp}
									onViewImage={handleViewImage}
									initialAiBodyLanguage={initialAiBodyLanguage}
									goalJustChanged={goalJustChanged}
									onAnimationComplete={handleLastMessageAnimationComplete}
									showGoalAchievedToast={showGoalAchievedToast}
									onGoToAnalysis={handleGoToAnalysis}
									onCloseGoalToast={() =>
										setShowGoalAchievedToast({ show: false, text: "" })
									}
									pendingFeedback={pendingFeedback}
									onFeedbackAnimationComplete={handleFeedbackAnimationComplete}
									onModalStateChange={setIsModalActive}
								/>
							);
						case GamePhase.ANALYSIS:
							if (!scenarioDetails)
								return (
									<LoadingIndicator message="Loading scenario for analysis..." />
								);
							return (
								<AnalysisScreen
									report={analysisReport}
									isLoadingReport={isLoading && !analysisReport && !error}
									errorReport={error}
									onRestart={handleRestart}
									scenarioDetails={scenarioDetails}
								/>
							);
						default:
							return null;
					}
				})()}
			</AnimatePresence>
		);
	};

	return (
		<>
			<Head>
				<title>SosheIQ - AI Social Interaction Trainer</title>
				<meta
					name="description"
					content="Practice and improve your social skills with an AI-powered conversation partner. Get detailed feedback and analysis."
				/>
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<link rel="icon" href="/logo.svg" />
			</Head>

			<InitialLoadingScreen />

			{mainAppVisible && (
				<>
					{/* Fade to Black Overlay */}
					{isFadingToBlack && (
						<div className="fixed inset-0 z-[1000] animate-session-fade-to-black pointer-events-none" />
					)}

					{/* Main application content */}
					<div
						className={`flex flex-col min-h-screen text-slate-100 ${
							currentPhase === GamePhase.INTERACTION ||
							currentPhase === GamePhase.ANALYSIS
								? "bg-transparent"
								: "bg-transparent"
						}`}>
						{/* Hide Header in mobile landscape and when modal is active */}
						{!isMobileLandscape && !isModalActive && (
							<Header
								onLogoClick={() => {
									if (currentPhase === GamePhase.INTERACTION) {
										setShowConfirmEndDialog(true);
									} else {
										handleNavigate(GamePhase.HERO);
									}
								}}
								onNavigateToAbout={() => handleNavigate(GamePhase.ABOUT)}
								onNavigateToLogin={handleNavigateToLogin}
							/>
						)}

						{/* Main content area gets a quick, direct fade-in */}
						<main
							className={`flex-grow flex flex-col items-center p-4 md:p-6 animate-[fadeIn_0.3s_ease-out_forwards] relative ${
								mainJustify === "center"
									? "justify-center overflow-hidden"
									: "justify-start py-4 overflow-y-auto"
							} ${isModalActive ? "pointer-events-none" : ""}`}
							style={
								isMobileLandscape ? { padding: 0, minHeight: "100vh" } : {}
							}>
							{renderContent()}
						</main>

						{/* Hide Footer in mobile landscape and during INTERACTION phase */}
						{!isMobileLandscape &&
							currentPhase !== GamePhase.INTERACTION &&
							!isModalActive && (
								<Footer
									onNavigateToAbout={() => handleNavigate(GamePhase.ABOUT)}
									onNavigateToInstructions={() =>
										handleNavigate(GamePhase.INSTRUCTIONS)
									}
									onNavigateToPrivacy={() => handleNavigate(GamePhase.PRIVACY)}
									onNavigateToTerms={() => handleNavigate(GamePhase.TERMS)}
									onNavigateToSafety={() => handleNavigate(GamePhase.SAFETY)}
								/>
							)}

						{imageGalleryConfig.isOpen && (
							<ImageViewerOverlay
								images={imageGalleryConfig.images}
								startIndex={imageGalleryConfig.startIndex}
								onClose={handleCloseImageGallery}
							/>
						)}
						{showHelp && <HelpAndTipsOverlay onClose={handleToggleHelp} />}
						{showRandomConfirmDialog && (
							<ConfirmationDialog
								isOpen={showRandomConfirmDialog}
								onConfirm={handleConfirmRandom}
								onCancel={() => setShowRandomConfirmDialog(false)}
								title="Start a Random Scenario?"
								description="This will generate a completely random scenario, including the AI's personality and the setting. You will be taken to the login screen first."
							/>
						)}
						{showConfirmEndDialog && (
							<ConfirmEndInteractionDialog
								isOpen={showConfirmEndDialog}
								onConfirm={handleConfirmEndInteraction}
								onCancel={() => setShowConfirmEndDialog(false)}
							/>
						)}
					</div>
				</>
			)}
		</>
	);
};

export default HomePage;
