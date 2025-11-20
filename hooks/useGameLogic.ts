import { useState, useCallback, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
    ScenarioDetails,
    ChatMessage,
    AnalysisReport,
    ActiveAction,
    AiTurnResponse,
    UserTurnFeedback,
    UserScenarioDetails,
    GamePhase,
    SocialEnvironment,
    AIGender,
} from '../types';
import { GeminiService } from '../services/geminiService';
import { ImagenService } from '../services/imagenService';
import {
    MAX_ZERO_ENGAGEMENT_STREAK,
    ENGAGEMENT_DECAY_PER_TURN,
    INITIAL_ENGAGEMENT,
} from '../constants';
import { useSession } from '../pages/_app';
import { useAuth } from '../contexts/AuthContext';
import { useInitConfig } from './useInitConfig';

export type DisplayedGoal = {
    text: string;
    progress: number;
} | null;

interface ProcessAiResponseOptions {
    wasFastForward?: boolean;
}

export function useGameLogic() {
    const [currentPhase, setCurrentPhase] = useState<GamePhase>(GamePhase.HERO);
    const [setupMode, setSetupMode] = useState<'guided' | 'advanced'>('guided');
    const [scenarioDetails, setScenarioDetails] =
        useState<ScenarioDetails | null>(null);
    const [conversationHistory, setConversationHistory] = useState<ChatMessage[]>(
        [],
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
    const [analysisReport, setAnalysisReport] = useState<AnalysisReport | null>(
        null,
    );
    const [currentAIImage, setCurrentAIImage] = useState<string | null>(null);
    const [initialAiBodyLanguage, setInitialAiBodyLanguage] = useState<
        string | null
    >(null);
    const [userScenarioDetails, setUserScenarioDetails] =
        useState<UserScenarioDetails>({});

    const geminiService = useRef<GeminiService | null>(null);
    const imagenService = useRef<ImagenService | null>(null);

    const [showConfirmEndDialog, setShowConfirmEndDialog] = useState(false);
    const [showRandomConfirmDialog, setShowRandomConfirmDialog] = useState(false);
    const [postLoginAction, setPostLoginAction] = useState<
        'start_guided' | 'start_random' | null
    >(null);
    const [showGoalAchievedToast, setShowGoalAchievedToast] = useState<{
        show: boolean;
        text: string;
    }>({ show: false, text: '' });
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

    const [pendingPhase, setPendingPhase] = useState<GamePhase | null>(null);
    const [showHero, setShowHero] = useState(true);

    const { setSessionInPlay } = useSession();
    const { status, logout } = useAuth();
    const {
        config: initConfig,
        loading: initLoading,
        error: initError,
    } = useInitConfig();

    // Initialize services
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
            setError('Failed to initialize AI services.');
            setIsAppLoading(false);
            setMainAppVisible(true);
            return;
        }

        // Wait for loading screen completion
        const checkLoadingComplete = () => {
            const isComplete = document.body.getAttribute('data-loading-complete');
            const isReadyForCrossfade = document.body.getAttribute(
                'data-loading-ready-for-crossfade',
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

    // Set sessionInPlay based on phase
    useEffect(() => {
        if (currentPhase === GamePhase.INTERACTION) {
            setSessionInPlay(true);
        } else {
            setSessionInPlay(false);
        }
    }, [currentPhase, setSessionInPlay]);

    const resetStateForNewGame = () => {
        setSetupMode('guided');
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
        setShowGoalAchievedToast({ show: false, text: '' });
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
        [currentPhase, handleNavigate],
    );

    const handleStartRandom = useCallback(() => {
        const randomScenario: ScenarioDetails = {
            isRandomScenario: true,
            aiGender: Math.random() < 0.5 ? AIGender.MALE : AIGender.FEMALE, // Random gender
            environment: SocialEnvironment.CASUAL, // Default, will be overridden by AI
            aiPersonalityTraits: [],
            aiName: "Mystery Person",
        };
        handleStartInteraction(randomScenario);
    }, []);

    const handleLoginFlow = (action: 'start_guided' | 'start_random') => {
        // Check if user is already authenticated
        if (status === 'authenticated' || status === 'guest') {
            // User is already logged in, proceed directly to action
            if (action === 'start_guided') {
                setSetupMode('guided');
                handleNavigate(GamePhase.SETUP);
            } else if (action === 'start_random') {
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
        if (postLoginAction === 'start_guided') {
            setSetupMode('guided');
            handleNavigate(GamePhase.SETUP);
            setIsLoading(false); // Hide loading after navigation
        } else if (postLoginAction === 'start_random') {
            handleStartRandom();
        } else {
            // Fallback: Default to guided setup if no action specified
            setSetupMode('guided');
            handleNavigate(GamePhase.SETUP);
            setIsLoading(false);
        }
        setPostLoginAction(null); // Reset after action is taken
    };

    const handleAuthSuccess = () => {
        // Called when authentication is successful
        handleContinueFromLogin();
    };

    const handleConfirmRandom = () => {
        setShowRandomConfirmDialog(false);
        handleLoginFlow('start_random');
    };

    const handleNavigateToLogin = useCallback(() => {
        // If user clicks the generic "Sign In" link, default the next action to starting the setup.
        setPostLoginAction('start_guided');
        setCurrentPhase(GamePhase.LOGIN);
    }, []);

    const handleViewImage = useCallback(
        (clickedImageUrl: string | null) => {
            if (!clickedImageUrl) return;

            const allImages = conversationHistory
                .map((msg) =>
                    msg.sender === 'ai' && msg.imageUrl
                        ? {
                            url: msg.imageUrl,
                            contextText: msg.contextualSummary || msg.imagePrompt,
                        }
                        : null,
                )
                .filter(
                    (img): img is { url: string; contextText: string | undefined } =>
                        img !== null,
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
                    'Initial character generation.';
                allImages.push({ url: currentAIImage, contextText: context });
            }

            // Deduplicate based on URL, keeping the last occurrence (which is more likely to have a prompt/summary)
            const uniqueImages = Array.from(
                new Map(allImages.map((img) => [img.url, img])).values(),
            );

            const startIndex = uniqueImages.findIndex(
                (img) => img.url === clickedImageUrl,
            );

            if (uniqueImages.length > 0) {
                setImageGalleryConfig({
                    isOpen: true,
                    images: uniqueImages,
                    startIndex: startIndex !== -1 ? startIndex : 0,
                });
            }
        },
        [conversationHistory, currentAIImage],
    );

    const handleCloseImageGallery = useCallback(() => {
        setImageGalleryConfig({ isOpen: false, images: [], startIndex: 0 });
    }, []);

    const handleStartInteraction = useCallback(
        async (
            details: ScenarioDetails,
            userScenarioDetails?: UserScenarioDetails,
        ) => {
            if (!geminiService.current || !imagenService.current) {
                setError('Services not initialized.');
                return;
            }
            setIsLoading(true);
            setError(null);

            resetStateForNewGame();

            const fullDetails: ScenarioDetails = {
                ...details,
                aiName: details.aiName?.trim() || '',
                aiPersonalityTraits: details.aiPersonalityTraits || [],
                customAiPersonality: details.customAiPersonality || undefined,
                conversationGoal: details.conversationGoal || undefined,
            };

            try {
                // [AGENT 1: CORE TEXT AGENT]
                // Critical Path: Only wait for the text response to start the session.
                const {
                    aiName: aiGeneratedName,
                    scenarioBackstory,
                    initialDialogueChunks,
                    initialBodyLanguage,
                    initialAiThoughts,
                    initialEngagementScore,
                    initialConversationMomentum,
                    conversationStarter,
                    establishedVisuals,
                    contextualSummary,
                } = await geminiService.current.startConversation(
                    fullDetails,
                    userScenarioDetails,
                );

                // Update details with the definitive AI-provided name
                const updatedDetailsWithVisuals = {
                    ...fullDetails,
                    aiName: aiGeneratedName,
                    establishedVisuals,
                };
                setScenarioDetails(updatedDetailsWithVisuals);
                setInitialConversationGoal(
                    updatedDetailsWithVisuals.conversationGoal || null,
                );

                // Set initial state
                setInitialAiBodyLanguage(initialBodyLanguage);
                setCurrentEngagement(initialEngagementScore);
                if (updatedDetailsWithVisuals.conversationGoal) {
                    setDisplayedGoal({
                        text: updatedDetailsWithVisuals.conversationGoal,
                        progress: 0,
                    });
                }

                // Construct initial history
                const initialMessages: ChatMessage[] = [];
                if (scenarioBackstory) {
                    initialMessages.push({
                        id: uuidv4(),
                        sender: 'backstory',
                        text: scenarioBackstory,
                        timestamp: new Date(),
                    });
                } else if (contextualSummary) {
                    initialMessages.push({
                        id: uuidv4(),
                        sender: 'backstory',
                        text: contextualSummary,
                        timestamp: new Date(),
                    });
                }

                const initialAiMessage: ChatMessage = {
                    id: uuidv4(),
                    sender: 'ai',
                    text: '',
                    dialogueChunks: [],
                    timestamp: new Date(),
                    bodyLanguageDescription: initialBodyLanguage,
                    aiThoughts: initialAiThoughts,
                    conversationMomentum: initialConversationMomentum,
                    imageUrl: undefined, // Image will be populated asynchronously
                    imagePrompt: undefined,
                    contextualSummary: contextualSummary,
                };

                if (conversationStarter === 'ai' && initialDialogueChunks?.length > 0) {
                    initialAiMessage.text = initialDialogueChunks.map((c) => c.text).join('\n');
                    initialAiMessage.dialogueChunks = initialDialogueChunks;
                }

                initialMessages.push(initialAiMessage);
                setConversationHistory(initialMessages);

                // Transition IMMEDIATELY to Interaction Phase
                setCurrentPhase(GamePhase.INTERACTION);
                setIsLoading(false); // Stop loading screen

                // [AGENT 2: VISUAL AGENT]
                // Run in background - do not await
                (async () => {
                    try {
                        const { fullImagenPrompt } = await geminiService.current!.generateImagePrompt(establishedVisuals);
                        const imageBase64 = await imagenService.current!.generateImage(fullImagenPrompt);

                        setCurrentAIImage(imageBase64);

                        // Update the initial message in history with the image
                        setConversationHistory(prev => prev.map(msg =>
                            msg.id === initialAiMessage.id
                                ? { ...msg, imageUrl: imageBase64, imagePrompt: fullImagenPrompt }
                                : msg
                        ));
                    } catch (imgErr) {
                        console.error("Background image generation failed:", imgErr);
                        // Silently fail or set a placeholder state if needed
                    }
                })();

            } catch (e: unknown) {
                const errorMessage = e instanceof Error ? e.message : 'Unknown error occurred';
                console.error('Error starting interaction:', errorMessage);
                setError(`Failed to start interaction: ${errorMessage}`);
                setCurrentPhase(GamePhase.SETUP);
                setIsLoading(false);
            }
        },
        [geminiService, imagenService],
    );

    const handleEndConversation = useCallback(
        async (aiInitiated = false) => {
            if (!geminiService.current || !scenarioDetails) {
                setError(
                    'Cannot end conversation: service or scenario details missing.',
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
                        setError('Service not available for analysis');
                        setIsLoading(false);
                        return;
                    }

                    setIsLoading(true);

                    const historyForAnalysis = conversationHistory.filter(
                        (m) => !m.isThoughtBubble,
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
                            currentEngagement,
                        );
                        setAnalysisReport(report);
                    } catch (e: unknown) {
                        const errorMessage =
                            e instanceof Error ? e.message : 'Unknown error occurred';
                        console.error('Error generating analysis report:', errorMessage);
                        setError(`Failed to generate analysis: ${errorMessage}`);
                        setAnalysisReport(null);
                    } finally {
                        setIsLoading(false);
                    }
                }, 800); // Brief delay before starting analysis
            }, 1200); // Wait for fade to black animation
        },
        [conversationHistory, scenarioDetails, currentEngagement, displayedGoal],
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
                        : m,
                ),
            );
            // Clear the pending feedback so the tray disappears
            setPendingFeedback(null);
        },
        [],
    );

    const processAiResponse = useCallback(
        (
            aiResponse: AiTurnResponse,
            userMessageId?: string,
            options?: ProcessAiResponseOptions,
        ) => {
            const scenarioForThisTurn = { ...scenarioDetails! };

            // Step 1: Update visual and persona state first
            if (aiResponse.updatedEstablishedVisuals) {
                scenarioForThisTurn.establishedVisuals =
                    aiResponse.updatedEstablishedVisuals;
            }
            if (aiResponse.newEnvironment) {
                const newEnvString = aiResponse.newEnvironment;
                // Check if the returned string is a value in the SocialEnvironment enum
                const isKnownEnvironment = Object.values(SocialEnvironment).includes(
                    newEnvString as SocialEnvironment,
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
                    .join('\n\n');
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
                    sender: 'user_action',
                    text:
                        aiResponse.feedbackOnUserTurn.inferredUserAction ||
                        'You continue the interaction',
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

            const goalChangeInfo: ChatMessage['goalChange'] | undefined = (() => {
                const prevGoalText = displayedGoal?.text || null;
                const newGoalText = aiResponse.emergingGoal?.trim() || null;
                if (!scenarioForThisTurn.conversationGoal) {
                    if (newGoalText && !prevGoalText)
                        return { type: 'established', to: newGoalText };
                    if (prevGoalText && !newGoalText)
                        return { type: 'removed', from: prevGoalText };
                    if (prevGoalText && newGoalText && prevGoalText !== newGoalText)
                        return { type: 'changed', from: prevGoalText, to: newGoalText };
                }
                // Enhanced goal change tracking for pinned goals
                if (scenarioForThisTurn.conversationGoal && aiResponse.achieved) {
                    return {
                        type: 'removed',
                        from: scenarioForThisTurn.conversationGoal,
                    };
                }
                return undefined;
            })();

            const aiMessageTurn: ChatMessage = {
                id: uuidv4(),
                sender: 'ai',
                text: dialogueChunks
                    .filter((c) => c.type === 'dialogue')
                    .map((c) => c.text)
                    .join('\n'),
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
                        stagnantTurnStreak,
                    ),
                );
                setCurrentEngagement(newEngagementValue);
                setZeroEngagementStreak(
                    newEngagementValue <= 0 ? (prev) => prev + 1 : 0,
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
                                finalVisualsForImage,
                            );
                        const imageBase64 = await imagenService.current.generateImage(
                            fullImagenPrompt,
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
                                    : m,
                            ),
                        );
                    } catch (imgError: unknown) {
                        const errorMessage =
                            imgError instanceof Error
                                ? imgError.message
                                : 'Unknown error occurred';
                        console.error('Optimized image generation failed:', errorMessage);
                        setConversationHistory((prev) =>
                            prev.map((m) =>
                                m.id === aiMessageTurn.id
                                    ? { ...m, imageUrl: currentAIImage ?? undefined }
                                    : m,
                            ),
                        );
                    }
                } else {
                    setConversationHistory((prev) =>
                        prev.map((m) =>
                            m.id === aiMessageTurn.id
                                ? { ...m, imageUrl: currentAIImage ?? undefined }
                                : m,
                        ),
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
                let currentGoalText = pinnedGoalText || emergingGoalText;

                // --- FILTER: Block AI-centric goals ---
                // If the goal is from the AI's perspective, do not display it
                const isAICentricGoal = (goal: string | undefined | null) => {
                    if (!goal) return false;
                    const lower = goal.toLowerCase();
                    // Block common AI-centric patterns
                    return (
                        lower.startsWith('my goal is') ||
                        lower.startsWith('i want you to') ||
                        lower.startsWith('i want to') ||
                        lower.startsWith('i will') ||
                        lower.startsWith('i am going to') ||
                        lower.startsWith('i need to') ||
                        lower.startsWith('i should') ||
                        lower.startsWith('i must') ||
                        lower.startsWith('i plan to') ||
                        lower.startsWith('i hope to') ||
                        lower.startsWith('i wish to') ||
                        lower.startsWith('i would like to') ||
                        lower.startsWith('my objective is') ||
                        lower.startsWith('my aim is') ||
                        lower.startsWith('my intention is') ||
                        lower.startsWith('my purpose is') ||
                        lower.startsWith('my mission is') ||
                        lower.startsWith('my task is') ||
                        lower.startsWith('my job is') ||
                        lower.startsWith('my role is') ||
                        lower.startsWith('get to know') || // e.g., 'get to know Sam more'
                        lower.includes('as the ai') ||
                        lower.includes('as your ai') ||
                        lower.includes('as an ai') ||
                        lower.includes('i, as the ai') ||
                        lower.includes('i, as your ai') ||
                        lower.includes('i, as an ai')
                    );
                };
                if (isAICentricGoal(currentGoalText)) {
                    currentGoalText = undefined;
                }
                // --- END FILTER ---

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
        ],
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
                    sender: 'user_action',
                    text: messages.gesture.replace(/^\*|\*$/g, '').trim(),
                    timestamp: new Date(),
                });
            }

            // Create user dialogue message if dialogue exists
            if (messages.dialogue) {
                const userDialogueMessage: ChatMessage = {
                    id: uuidv4(),
                    sender: 'user',
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
                const fullUserInput = newMessages.map((m) => m.text).join('\n');
                const historyForAI = [...conversationHistory, ...newMessages];
                const lastAiMessage = [...conversationHistory]
                    .reverse()
                    .find((m) => m.sender === 'ai');
                const lastAiPose =
                    lastAiMessage?.bodyLanguageDescription ||
                    scenarioDetails.establishedVisuals?.currentPoseAndAction ||
                    '';

                const aiResponse = await geminiService.current.getNextAITurn(
                    historyForAI,
                    fullUserInput,
                    currentEngagement,
                    scenarioDetails,
                    lastAiPose,
                    activeAction,
                    false, // fastForwardAction
                    isActionPaused,
                );
                processAiResponse(aiResponse, userMessageId);
            } catch (e: unknown) {
                const errorMessage =
                    e instanceof Error ? e.message : 'Unknown error occurred';
                console.error(
                    'Error sending message or getting AI response:',
                    errorMessage,
                );
                const systemErrorMessage: ChatMessage = {
                    id: uuidv4(),
                    sender: 'system',
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
        ],
    );

    const handleRetryMessage = useCallback(
        (messageText: string) => {
            // Remove the system error message and the failed user message before retrying.
            setConversationHistory((prev) => {
                const lastIsRetryableSystem =
                    prev[prev.length - 1]?.sender === 'system' &&
                    prev[prev.length - 1]?.isRetryable;
                if (lastIsRetryableSystem) {
                    // Remove system message AND the user message that caused it (which is usually right before)
                    // Actually, we just want to remove the system message and then "resend" the user message.
                    // But handleSendMessage adds the user message again. So we should remove both.
                    // Let's find the last user message.
                    const newHistory = [...prev];
                    newHistory.pop(); // Remove system message
                    if (newHistory.length > 0 && newHistory[newHistory.length - 1].sender === 'user') {
                        newHistory.pop(); // Remove failed user message
                    }
                    return newHistory;
                }
                return prev;
            });

            handleSendMessage({ dialogue: messageText });
        },
        [handleSendMessage],
    );

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
            const historyForAI = [...conversationHistory];
            const lastAiMessage = [...conversationHistory]
                .reverse()
                .find((m) => m.sender === 'ai');
            const lastAiPose =
                lastAiMessage?.bodyLanguageDescription ||
                scenarioDetails.establishedVisuals?.currentPoseAndAction ||
                '';

            // Send a special "fast forward" signal
            const aiResponse = await geminiService.current.getNextAITurn(
                historyForAI,
                '(Fast Forward Action)', // Special input text
                currentEngagement,
                scenarioDetails,
                lastAiPose,
                activeAction,
                true, // fastForwardAction = true
                isActionPaused,
            );
            processAiResponse(aiResponse, undefined, { wasFastForward: true });
        } catch (e: unknown) {
            const errorMessage =
                e instanceof Error ? e.message : 'Unknown error occurred';
            console.error('Error fast forwarding:', errorMessage);
            setError(`Failed to fast forward: ${errorMessage}`);
            setIsAiResponding(false);
        }
    }, [
        processAiResponse,
        conversationHistory,
        currentEngagement,
        scenarioDetails,
        isAiResponding,
        activeAction,
        isActionPaused,
    ]);

    const handlePinGoal = useCallback(
        (goalText: string) => {
            if (scenarioDetails) {
                setScenarioDetails({
                    ...scenarioDetails,
                    conversationGoal: goalText,
                });
                setDisplayedGoal({ text: goalText, progress: 0 });
                setInitialConversationGoal(goalText); // Treat pinned goals as user-set goals
            }
        },
        [scenarioDetails],
    );

    const handleUnpinGoal = useCallback(() => {
        if (scenarioDetails) {
            setScenarioDetails({
                ...scenarioDetails,
                conversationGoal: undefined,
            });
            setDisplayedGoal(null);
            setInitialConversationGoal(null);
        }
    }, [scenarioDetails]);

    const handleContinueWithoutSpeaking = useCallback(() => {
        // Send a special token to indicate silent continuation
        handleSendMessage({ gesture: '*remains silent*' });
    }, [handleSendMessage]);

    const handleCloseGoalToast = useCallback(() => {
        setShowGoalAchievedToast({ show: false, text: '' });
    }, []);

    return {
        currentPhase,
        setupMode,
        setSetupMode,
        scenarioDetails,
        setScenarioDetails,
        conversationHistory,
        currentEngagement,
        displayedGoal,
        activeAction,
        isActionPaused,
        isContinueActionSuggested,
        isAppLoading,
        mainAppVisible,
        isLoading,
        isAiResponding,
        isFadingToBlack,
        error,
        analysisReport,
        currentAIImage,
        initialAiBodyLanguage,
        userScenarioDetails,
        setUserScenarioDetails,
        showConfirmEndDialog,
        setShowConfirmEndDialog,
        showRandomConfirmDialog,
        setShowRandomConfirmDialog,
        showGoalAchievedToast,
        imageGalleryConfig,
        pendingFeedback,
        showHero,
        handleNavigate,
        handleNavigateWithFade,
        handleHeroExitComplete,
        handleLoginFlow,
        handleAuthSuccess,
        handleConfirmRandom,
        handleNavigateToLogin,
        handleViewImage,
        handleCloseImageGallery,
        handleStartInteraction,
        handleEndConversation,
        handleFeedbackAnimationComplete,
        handleSendMessage,
        handleRetryMessage,
        handleFastForwardAction,
        handlePinGoal,
        handleUnpinGoal,
        handleContinueWithoutSpeaking,
        handleCloseGoalToast,
        initialConversationGoal,
    };
}
