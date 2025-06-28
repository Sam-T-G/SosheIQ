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
	DialogueChunk,
} from "../types";
import { GamePhase } from "../types";
import { GeminiService } from "../services/geminiService";
import { ImagenService } from "../services/imagenService";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import {
	MAX_ZERO_ENGAGEMENT_STREAK,
	ENGAGEMENT_DECAY_PER_TURN,
	INITIAL_ENGAGEMENT,
} from "../constants";

type DisplayedGoal = {
	text: string;
	progress: number;
} | null;

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
	const [showGlobalAiThoughts, setShowGlobalAiThoughts] = useState(false);

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
		setZeroEngagementStreak(0);
		setAnalysisReport(null);
		setCurrentAIImage(null);
		setShowGlobalAiThoughts(false);
		setInitialAiBodyLanguage(null);
		setGoalJustChanged(false);
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
			setScenarioDetails(fullDetails);

			try {
				// Step 1: Get initial text-based data from AI
				const {
					initialDialogueChunks,
					initialBodyLanguage,
					initialAiThoughts,
					initialEngagementScore,
					initialConversationMomentum,
					conversationStarter,
				} = await geminiService.current.startConversation(fullDetails);

				// Step 2: Generate the initial image SYNCHRONOUSLY before showing the screen
				const { fullImagenPrompt, newEstablishedVisualSegment } =
					await geminiService.current.generateImagePromptForBodyLanguage(
						initialBodyLanguage,
						fullDetails.aiGender,
						fullDetails.aiName,
						fullDetails.aiAgeBracket,
						fullDetails.customAiAge,
						fullDetails.aiEstablishedVisualPromptSegment,
						fullDetails.aiCulture
					);

				// Use a functional update to avoid stale state issues, especially important here
				if (newEstablishedVisualSegment) {
					setScenarioDetails((prev) =>
						prev
							? {
									...prev,
									aiEstablishedVisualPromptSegment: newEstablishedVisualSegment,
							  }
							: null
					);
				}

				const imageBase64 = await imagenService.current.generateImage(
					fullImagenPrompt
				);
				setCurrentAIImage(imageBase64);

				// Step 3: Set all other state based on initial data
				setInitialAiBodyLanguage(initialBodyLanguage);
				setCurrentEngagement(initialEngagementScore);
				if (fullDetails.conversationGoal) {
					setDisplayedGoal({ text: fullDetails.conversationGoal, progress: 0 });
				}

				// Step 4: Add AI's first message to history if AI starts, now with image data included
				if (
					conversationStarter === "ai" &&
					initialDialogueChunks &&
					initialDialogueChunks.length > 0
				) {
					const initialAiMessage: ChatMessage = {
						id: uuidv4(),
						sender: "ai",
						text: initialDialogueChunks.map((c) => c.text).join("\n"),
						dialogueChunks: initialDialogueChunks,
						timestamp: new Date(),
						bodyLanguageDescription: initialBodyLanguage,
						aiThoughts: initialAiThoughts,
						conversationMomentum: initialConversationMomentum,
						imageUrl: imageBase64, // Image is now ready
						imagePrompt: fullImagenPrompt,
					};
					setConversationHistory((prev) => [...prev, initialAiMessage]);
				}

				// Step 5: Transition to the interaction screen
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

	const handleSendMessage = useCallback(
		async (messageText: string) => {
			if (
				!geminiService.current ||
				!imagenService.current ||
				!scenarioDetails ||
				isAiResponding
			)
				return;

			const userMessage: ChatMessage = {
				id: uuidv4(),
				sender: "user",
				text: messageText,
				timestamp: new Date(),
			};

			const thinkingMessage: ChatMessage = {
				id: uuidv4(),
				sender: "ai",
				text: "",
				timestamp: new Date(userMessage.timestamp.getTime() + 1),
				isThinkingBubble: true,
			};

			setConversationHistory((prev) => [...prev, userMessage, thinkingMessage]);
			setIsAiResponding(true);
			setError(null);

			try {
				// Step 1: Get AI's text-based response and analysis of user's turn
				const historyForAI = conversationHistory.filter(
					(m) => !m.isThinkingBubble
				);
				const aiResponse = await geminiService.current.getNextAITurn(
					[...historyForAI, userMessage],
					messageText,
					currentEngagement,
					scenarioDetails
				);

				// Step 2: Update the user's message with the AI's feedback
				const {
					engagementDelta = 0,
					userTurnEffectivenessScore,
					positiveTraitContribution,
					negativeTraitContribution,
				} = aiResponse;
				setConversationHistory((prev) =>
					prev.map((m) =>
						m.id === userMessage.id
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

				// Step 3: Remove thinking bubble and create the full AI turn message object
				const dialogueChunks = aiResponse.dialogueChunks || [];

				const goalChangeInfo: ChatMessage["goalChange"] | undefined = (() => {
					const prevGoalText = displayedGoal?.text || null;
					const newGoalText = aiResponse.emergingGoal?.trim() || null;
					if (!scenarioDetails.conversationGoal) {
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
					text: dialogueChunks.map((c) => c.text).join("\n"),
					dialogueChunks: dialogueChunks,
					timestamp: new Date(),
					bodyLanguageDescription: aiResponse.aiBodyLanguage,
					aiThoughts: aiResponse.aiThoughts,
					conversationMomentum: aiResponse.conversationMomentum,
					goalChange: goalChangeInfo,
				};

				// Add the text-based message to history immediately
				setConversationHistory((prev) => [
					...prev.filter((m) => !m.isThinkingBubble),
					aiMessageTurn,
				]);

				// Step 4: Generate new image in the background. Don't await it.
				(async () => {
					if (
						aiResponse.aiBodyLanguage &&
						scenarioDetails &&
						geminiService.current &&
						imagenService.current
					) {
						try {
							const { fullImagenPrompt, newEstablishedVisualSegment } =
								await geminiService.current.generateImagePromptForBodyLanguage(
									aiResponse.aiBodyLanguage,
									scenarioDetails.aiGender,
									scenarioDetails.aiName,
									scenarioDetails.aiAgeBracket,
									scenarioDetails.customAiAge,
									scenarioDetails.aiEstablishedVisualPromptSegment,
									scenarioDetails.aiCulture
								);
							if (newEstablishedVisualSegment) {
								setScenarioDetails((prev) =>
									prev
										? {
												...prev,
												aiEstablishedVisualPromptSegment:
													newEstablishedVisualSegment,
										  }
										: null
								);
							}
							const imageBase64 = await imagenService.current.generateImage(
								fullImagenPrompt
							);
							setCurrentAIImage(imageBase64);

							// Update the message with the image once loaded
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

				// Step 5: Update state based on AI's text response
				const newEngagementValue = Math.max(
					0,
					Math.min(
						100,
						currentEngagement + engagementDelta - ENGAGEMENT_DECAY_PER_TURN
					)
				);
				setCurrentEngagement(newEngagementValue);

				if (goalChangeInfo) {
					setGoalJustChanged(true);
				}

				if (scenarioDetails.conversationGoal) {
					setDisplayedGoal({
						text: scenarioDetails.conversationGoal,
						progress: aiResponse.goalProgress,
					});
				} else {
					aiResponse.emergingGoal?.trim()
						? setDisplayedGoal({
								text: aiResponse.emergingGoal,
								progress: aiResponse.goalProgress,
						  })
						: setDisplayedGoal(null);
				}

				if (newEngagementValue <= 0) {
					setZeroEngagementStreak((prev) => prev + 1);
				} else {
					setZeroEngagementStreak(0);
				}

				const currentTurnZeroStreak =
					newEngagementValue <= 0 ? zeroEngagementStreak + 1 : 0;
				const goalIsActive = displayedGoal || scenarioDetails.conversationGoal;

				if (
					aiResponse.isEndingConversation ||
					(goalIsActive && aiResponse.achieved) ||
					(goalIsActive && aiResponse.goalProgress >= 100) ||
					(newEngagementValue <= 0 &&
						currentTurnZeroStreak >= MAX_ZERO_ENGAGEMENT_STREAK)
				) {
					handleEndConversation(true);
				}
				setIsAiResponding(false);
			} catch (e: any) {
				console.error("Error sending message or getting AI response:", e);
				setError(`Communication error: ${e.message}`);
				const errorMessageContent: ChatMessage = {
					id: uuidv4(),
					sender: "ai",
					text: "I'm having trouble responding right now. Please try again in a moment or end the conversation.",
					bodyLanguageDescription: "Looks concerned.",
					timestamp: new Date(),
				};
				setConversationHistory((prev) => [
					...prev.filter((m) => !m.isThinkingBubble),
					errorMessageContent,
				]);
				setIsAiResponding(false);
			}
		},
		[
			scenarioDetails,
			conversationHistory,
			currentEngagement,
			displayedGoal,
			zeroEngagementStreak,
			isAiResponding,
		]
	);

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
				(m) => !m.isThinkingBubble
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
						onSendMessage={handleSendMessage}
						onEndConversation={handleAttemptEndConversation}
						aiImageBase64={currentAIImage}
						isLoadingAI={isAiResponding}
						onToggleHelpOverlay={handleToggleHelpOverlay}
						onToggleQuickTipsOverlay={handleToggleQuickTipsOverlay}
						showGlobalAiThoughts={showGlobalAiThoughts}
						onToggleGlobalAiThoughts={() =>
							setShowGlobalAiThoughts((prev) => !prev)
						}
						initialAiBodyLanguage={initialAiBodyLanguage}
						goalJustChanged={goalJustChanged}
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
