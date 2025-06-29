import React, { useState, useCallback, useEffect, useRef } from "react";
import Head from "next/head";
import { v4 as uuidv4 } from "uuid";
import { HeroScreen } from "../components/HeroScreen";
import { InstructionsScreen } from "../components/InstructionsScreen";
import { SetupScreen } from "../components/SetupScreen";
import { GuidedSetup } from "@/components/GuidedSetup";
import { InteractionScreen } from "../components/InteractionScreen";
import { AnalysisScreen } from "../components/AnalysisScreen";
import { LoadingIndicator } from "../components/LoadingIndicator";
import { HelpOverlay } from "../components/HelpOverlay";
import { QuickTipsScreen } from "../components/QuickTipsScreen";
import { ConfirmEndInteractionDialog } from "../components/ConfirmEndInteractionDialog";
import type {
	ScenarioDetails,
	ChatMessage,
	AnalysisReport,
	ActiveAction,
	AiTurnResponse,
	EstablishedVisuals,
} from "../types";
import { GamePhase, SocialEnvironment } from "../types";
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

type DisplayedGoal = {
	text: string;
	progress: number;
} | null;

interface ProcessAiResponseOptions {
	wasFastForward?: boolean;
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
	const [displayedGoal, setDisplayedGoal] = useState<DisplayedGoal>(null);
	const [goalJustChanged, setGoalJustChanged] = useState(false);
	const [activeAction, setActiveAction] = useState<ActiveAction | null>(null);
	const [isActionPaused, setIsActionPaused] = useState(false);

	const [zeroEngagementStreak, setZeroEngagementStreak] = useState<number>(0);
	const [isLoading, setIsLoading] = useState<boolean>(false); // General loading for phase changes, setup, analysis
	const [isAiResponding, setIsAiResponding] = useState<boolean>(false); // Specific for AI turn processing (image and text)
	const [error, setError] = useState<string | null>(null);
	const [analysisReport, setAnalysisReport] = useState<AnalysisReport | null>(
		null
	);
	const [currentAIImage, setCurrentAIImage] = useState<string | null>(null);
	const [initialAiBodyLanguage, setInitialAiBodyLanguage] = useState<
		string | null
	>(null);

	const geminiService = useRef<GeminiService | null>(null);
	const imagenService = useRef<ImagenService | null>(null);

	const [showHelpOverlay, setShowHelpOverlay] = useState(false);
	const [showQuickTipsOverlay, setShowQuickTipsOverlay] = useState(false);
	const [showConfirmEndDialog, setShowConfirmEndDialog] = useState(false);
	const [showGoalAchievedToast, setShowGoalAchievedToast] = useState<{
		show: boolean;
		text: string;
	}>({ show: false, text: "" });

	useEffect(() => {
		const initServices = async () => {
			try {
				const res = await fetch("/api/init");
				const data = await res.json();

				if (!data.apiKey) {
					setError("API key is missing.");
					setIsLoading(false);
					return;
				}

				geminiService.current = new GeminiService(data.apiKey);
				imagenService.current = new ImagenService(data.apiKey);
			} catch (err) {
				console.error("Failed to fetch API key:", err);
				setError("Could not initialize services.");
			} finally {
				setIsLoading(false);
			}
		};

		initServices();
	}, []);

	// Effect to handle the temporary glow state for the goal banner
	useEffect(() => {
		if (goalJustChanged) {
			const timer = setTimeout(() => {
				setGoalJustChanged(false);
			}, 2500); // Glow for 2.5 seconds
			return () => clearTimeout(timer);
		}
	}, [goalJustChanged]);

	const resetStateForNewGame = () => {
		setScenarioDetails(null);
		setConversationHistory([]);
		setCurrentEngagement(INITIAL_ENGAGEMENT);
		setDisplayedGoal(null);
		setActiveAction(null);
		setIsActionPaused(false);
		setZeroEngagementStreak(0);
		setAnalysisReport(null);
		setCurrentAIImage(null);
		setInitialAiBodyLanguage(null);
		setGoalJustChanged(false);
		setShowGoalAchievedToast({ show: false, text: "" });
	};

	const handleNavigate = useCallback((phase: GamePhase) => {
		setError(null);
		if (phase === GamePhase.HERO) {
			resetStateForNewGame();
		}
		setCurrentPhase(phase);
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
				aiPersonalityTraits: details.aiPersonalityTraits || [],
				customAiPersonality: details.customAiPersonality || undefined,
				conversationGoal: details.conversationGoal || undefined,
			};

			try {
				// Step 1: Get initial text-based data from AI, including the established visuals
				const {
					initialDialogueChunks,
					initialBodyLanguage,
					initialAiThoughts,
					initialEngagementScore,
					initialConversationMomentum,
					conversationStarter,
					establishedVisuals, // Use the new structured object
				} = await geminiService.current.startConversation(fullDetails);

				// Step 2: Store the details along with the established visuals
				const updatedDetailsWithVisuals = {
					...fullDetails,
					establishedVisuals,
				};
				setScenarioDetails(updatedDetailsWithVisuals);

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
				if (fullDetails.conversationGoal) {
					setDisplayedGoal({ text: fullDetails.conversationGoal, progress: 0 });
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

				setConversationHistory([initialAiMessage]);

				// Step 6: Transition to the interaction screen
				setCurrentPhase(GamePhase.INTERACTION);
			} catch (e: any) {
				console.error("Error starting interaction:", e);
				setError(`Failed to start interaction: ${e.message}`);
				setCurrentPhase(GamePhase.SETUP); // Revert to setup on failure
			} finally {
				setIsLoading(false); // Turn off loading indicator after everything is done
			}
		},
		[]
	);

	const handleLastMessageAnimationComplete = useCallback(() => {
		setIsAiResponding(false);
	}, []);

	const processAiResponse = useCallback(
		(
			aiResponse: AiTurnResponse,
			userMessageId?: string,
			options?: ProcessAiResponseOptions
		) => {
			let currentScenario = { ...scenarioDetails! };

			// Step 1: Update visual and persona state first
			if (aiResponse.updatedEstablishedVisuals) {
				currentScenario.establishedVisuals =
					aiResponse.updatedEstablishedVisuals;
			}
			if (aiResponse.newEnvironment) {
				const newEnvString = aiResponse.newEnvironment;
				// Check if the returned string is a value in the SocialEnvironment enum
				const isKnownEnvironment = Object.values(SocialEnvironment).includes(
					newEnvString as SocialEnvironment
				);

				if (isKnownEnvironment) {
					currentScenario.environment = newEnvString as SocialEnvironment;
					// If it's a standard one, we can clear the custom description if it exists
					if (newEnvString !== SocialEnvironment.CUSTOM) {
						currentScenario.customEnvironment = undefined;
					}
				} else {
					// It's a new, descriptive environment. Set to CUSTOM.
					currentScenario.environment = SocialEnvironment.CUSTOM;
					currentScenario.customEnvironment = newEnvString;
				}

				if (currentScenario.establishedVisuals) {
					currentScenario.establishedVisuals.environmentDescription =
						newEnvString;
				}
			}
			if (aiResponse.updatedPersonaDetails) {
				currentScenario.customContext = [
					currentScenario.customContext,
					aiResponse.updatedPersonaDetails,
				]
					.filter(Boolean)
					.join("\n\n");
			}
			setScenarioDetails(currentScenario); // Commit state changes

			// Step 2: Create the AI message object for the chat log
			const dialogueChunks = aiResponse.dialogueChunks || [];

			const goalChangeInfo: ChatMessage["goalChange"] | undefined = (() => {
				const prevGoalText = displayedGoal?.text || null;
				const newGoalText = aiResponse.emergingGoal?.trim() || null;
				if (!currentScenario.conversationGoal) {
					if (newGoalText && !prevGoalText)
						return { type: "established", to: newGoalText };
					if (prevGoalText && !newGoalText)
						return { type: "removed", from: prevGoalText };
					if (prevGoalText && newGoalText && prevGoalText !== newGoalText)
						return { type: "changed", from: prevGoalText, to: newGoalText };
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
			};

			setConversationHistory((prev) => [...prev, aiMessageTurn]);

			// Step 3: Update the user's message with AI feedback
			if (userMessageId) {
				const {
					engagementDelta = 0,
					userTurnEffectivenessScore,
					positiveTraitContribution,
					negativeTraitContribution,
				} = aiResponse;
				setConversationHistory((prev) =>
					prev.map((m) =>
						m.id === userMessageId
							? {
									...m,
									engagementDelta,
									userTurnEffectivenessScore,
									positiveTraitContribution,
									negativeTraitContribution,
							  }
							: m
					)
				);

				const newEngagementValue = Math.max(
					0,
					Math.min(
						100,
						currentEngagement + engagementDelta - ENGAGEMENT_DECAY_PER_TURN
					)
				);
				setCurrentEngagement(newEngagementValue);
				setZeroEngagementStreak(
					newEngagementValue <= 0 ? (prev) => prev + 1 : 0
				);
			}

			// Step 4: Generate new image using the (potentially updated) visual state.
			(async () => {
				if (
					currentScenario.establishedVisuals &&
					geminiService.current &&
					imagenService.current
				) {
					// The AI's response already contains the new pose/action in the visuals object
					const finalVisualsForImage = {
						...currentScenario.establishedVisuals,
					};
					finalVisualsForImage.currentPoseAndAction = aiResponse.aiBodyLanguage; // The body language description is the new pose
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
					} catch (imgError) {
						console.error("Background image generation failed:", imgError);
					}
				}
			})();

			// Step 5: Update goal and active action UI state
			let nextActiveAction: ActiveAction | null = activeAction;
			let nextIsActionPaused: boolean = isActionPaused;
			let nextDisplayedGoal: DisplayedGoal = displayedGoal;

			// Case 1: An action is actively being returned by the AI.
			if (aiResponse.activeAction) {
				nextActiveAction = aiResponse.activeAction;
				nextIsActionPaused = false;
				nextDisplayedGoal = null; // Active action always takes priority over the goal banner.
			}
			// Case 2: No action is in the response, so we check if one was active before.
			else if (activeAction) {
				// An action was intentionally fast-forwarded OR its progress hit 100 in this turn. It's now complete.
				if (options?.wasFastForward || activeAction.progress >= 100) {
					nextActiveAction = null;
					nextIsActionPaused = false;
				}
				// The action was active but didn't update and isn't finished. It's now paused.
				else {
					nextActiveAction = activeAction; // Keep the existing action data
					nextIsActionPaused = true;
					nextDisplayedGoal = null; // Paused action banner still has priority.
				}
			}

			// After determining the action state, if no action is active, we can show the goal banner.
			if (!nextActiveAction) {
				if (goalChangeInfo) {
					setGoalJustChanged(true);
				}
				if (currentScenario.conversationGoal) {
					nextDisplayedGoal = {
						text: currentScenario.conversationGoal,
						progress: aiResponse.goalProgress,
					};
				} else if (aiResponse.emergingGoal?.trim()) {
					nextDisplayedGoal = {
						text: aiResponse.emergingGoal,
						progress: aiResponse.goalProgress,
					};
				} else {
					nextDisplayedGoal = null;
				}
			}

			// Atomically set all related states at once
			setActiveAction(nextActiveAction);
			setIsActionPaused(nextIsActionPaused);
			setDisplayedGoal(nextDisplayedGoal);

			// Step 6: Check for end conditions or dynamic goal achievement
			const isUserDefinedGoal = !!currentScenario.conversationGoal;
			const goalIsAchieved =
				aiResponse.achieved || aiResponse.goalProgress >= 100;
			const shouldEndForUserGoal = isUserDefinedGoal && goalIsAchieved;
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

			const isDynamicGoal = !currentScenario.conversationGoal;
			if (isDynamicGoal && displayedGoal && goalIsAchieved) {
				setShowGoalAchievedToast({ show: true, text: displayedGoal.text });
				setDisplayedGoal(null); // Clear achieved dynamic goal
				setTimeout(
					() => setShowGoalAchievedToast({ show: false, text: "" }),
					7000
				);
			}
		},
		[
			scenarioDetails,
			currentEngagement,
			displayedGoal,
			zeroEngagementStreak,
			activeAction,
			isActionPaused,
		]
	);

	const handleSendMessage = useCallback(
		async (messageText: string) => {
			if (!geminiService.current || !scenarioDetails || isAiResponding) return;

			const userMessage: ChatMessage = {
				id: uuidv4(),
				sender: "user",
				text: messageText,
				timestamp: new Date(),
			};

			setConversationHistory((prev) => [...prev, userMessage]);
			setIsAiResponding(true);
			setError(null);

			try {
				const historyForAI = [...conversationHistory, userMessage];
				const aiResponse = await geminiService.current.getNextAITurn(
					historyForAI,
					messageText,
					currentEngagement,
					scenarioDetails
				);
				processAiResponse(aiResponse, userMessage.id);
			} catch (e: any) {
				console.error("Error sending message or getting AI response:", e);
				const systemErrorMessage: ChatMessage = {
					id: uuidv4(),
					sender: "system",
					text: "I'm sorry, I had a problem generating a response. Please try sending your message again.",
					timestamp: new Date(),
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
		]
	);

	const handleContinueWithoutSpeaking = useCallback(() => {
		if (isAiResponding) return;
		handleSendMessage(SILENT_USER_ACTION_TOKEN);
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
			const aiResponse = await geminiService.current.getNextAITurn(
				conversationHistory,
				"[User fast-forwarded the action]", // Internal note for AI context
				currentEngagement,
				scenarioDetails,
				true // Fast Forward Flag
			);
			processAiResponse(aiResponse, undefined, { wasFastForward: true });
		} catch (e: any) {
			console.error("Error during fast forward:", e);
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
	]);

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
			setIsLoading(true);
			setError(null);

			const historyForAnalysis = conversationHistory.filter(
				(m) => !m.isThoughtBubble
			);
			setConversationHistory(historyForAnalysis);

			setCurrentPhase(GamePhase.ANALYSIS);

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
			} catch (e: any) {
				console.error("Error generating analysis report:", e);
				setError(`Failed to generate analysis: ${e.message}`);
				setAnalysisReport(null);
			} finally {
				setIsLoading(false);
			}
		},
		[conversationHistory, scenarioDetails, currentEngagement, displayedGoal]
	);

	const handleRestart = useCallback(() => {
		setCurrentPhase(GamePhase.SETUP);
		resetStateForNewGame();
		setError(null);
	}, []);

	const handleToggleHelpOverlay = () => setShowHelpOverlay((prev) => !prev);
	const handleToggleQuickTipsOverlay = () =>
		setShowQuickTipsOverlay((prev) => !prev);

	const handleConfirmEndInteraction = () => {
		handleNavigate(GamePhase.HERO);
		setShowConfirmEndDialog(false);
	};

	const handleAttemptEndConversation = () => {
		handleEndConversation(false);
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
			(currentPhase === GamePhase.SETUP ||
				(currentPhase === GamePhase.INTERACTION && !scenarioDetails) ||
				(currentPhase === GamePhase.ANALYSIS && !analysisReport && !error))
		) {
			return (
				<LoadingIndicator
					message={
						currentPhase === GamePhase.ANALYSIS
							? "Generating analysis..."
							: "Loading..."
					}
				/>
			);
		}

		switch (currentPhase) {
			case GamePhase.HERO:
				return (
					<HeroScreen
						onStartGuided={() => {
							setSetupMode("guided");
							handleNavigate(GamePhase.SETUP);
						}}
						onStartAdvanced={() => {
							setSetupMode("advanced");
							handleNavigate(GamePhase.SETUP);
						}}
						onShowInstructions={() => handleNavigate(GamePhase.INSTRUCTIONS)}
					/>
				);
			case GamePhase.INSTRUCTIONS:
				return <InstructionsScreen onNavigate={handleNavigate} />;
			case GamePhase.SETUP:
				if (setupMode === "guided") {
					return (
						<GuidedSetup
							onStart={handleStartInteraction}
							onSwitchToAdvanced={() => setSetupMode("advanced")}
						/>
					);
				}
				return <SetupScreen onStart={handleStartInteraction} />;
			case GamePhase.INTERACTION:
				if (!scenarioDetails)
					return <LoadingIndicator message="Loading scenario..." />;

				return (
					<InteractionScreen
						scenarioDetails={scenarioDetails}
						conversationHistory={conversationHistory}
						currentEngagement={currentEngagement}
						displayedGoal={displayedGoal}
						activeAction={activeAction}
						isActionPaused={isActionPaused}
						onSendMessage={handleSendMessage}
						onEndConversation={handleAttemptEndConversation}
						onFastForwardAction={handleFastForwardAction}
						onContinueWithoutSpeaking={handleContinueWithoutSpeaking}
						aiImageBase64={currentAIImage}
						isLoadingAI={isAiResponding}
						onToggleHelpOverlay={handleToggleHelpOverlay}
						onToggleQuickTipsOverlay={handleToggleQuickTipsOverlay}
						initialAiBodyLanguage={initialAiBodyLanguage}
						goalJustChanged={goalJustChanged}
						onAnimationComplete={handleLastMessageAnimationComplete}
						showGoalAchievedToast={showGoalAchievedToast}
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
				return (
					<HeroScreen
						onStartGuided={() => {
							setSetupMode("guided");
							handleNavigate(GamePhase.SETUP);
						}}
						onStartAdvanced={() => {
							setSetupMode("advanced");
							handleNavigate(GamePhase.SETUP);
						}}
						onShowInstructions={() => handleNavigate(GamePhase.INSTRUCTIONS)}
					/>
				);
		}
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

			{/* Outermost div now visible by default */}
			<div className="flex flex-col min-h-screen bg-slate-900 text-gray-100">
				<Header
					onLogoClick={() => {
						if (currentPhase === GamePhase.INTERACTION) {
							setShowConfirmEndDialog(true);
						} else {
							handleNavigate(GamePhase.HERO);
						}
					}}
					onToggleQuickTips={handleToggleQuickTipsOverlay}
				/>

				{/* Main content area gets a quick, direct fade-in */}
				<main
					className={`flex-grow flex flex-col items-center p-4 md:p-6 animate-[fadeIn_0.3s_ease-out_forwards] ${
						currentPhase === GamePhase.HERO || currentPhase === GamePhase.SETUP
							? "justify-center"
							: ""
					}`}>
					{renderContent()}
				</main>

				<Footer />

				{showHelpOverlay && <HelpOverlay onClose={handleToggleHelpOverlay} />}
				{showQuickTipsOverlay && (
					<QuickTipsScreen onClose={handleToggleQuickTipsOverlay} />
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
	);
};

export default HomePage;
