import { useState, useEffect } from "react";

interface UseCinematicIntroProps {
    aiImageBase64: string | null;
    hasCompletedFirstLoad: boolean;
    showChatOverlay: boolean;
    onComplete: () => void;
}

export const useCinematicIntro = ({
    aiImageBase64,
    hasCompletedFirstLoad,
    showChatOverlay,
    onComplete,
}: UseCinematicIntroProps) => {
    const [cinematicPhase, setCinematicPhase] = useState<
        | "image"
        | "name"
        | "personality"
        | "encounter-type"
        | "body-language"
        | "complete"
    >("image");
    const [imageOpacity, setImageOpacity] = useState(0);
    const [nameOpacity, setNameOpacity] = useState(0);
    const [personalityOpacity, setPersonalityOpacity] = useState(0);
    const [encounterTypeOpacity, setEncounterTypeOpacity] = useState(0);
    const [bodyLanguageOpacity, setBodyLanguageOpacity] = useState(0);
    const [cinematicSequenceComplete, setCinematicSequenceComplete] =
        useState(false);
    const [screenDimmed, setScreenDimmed] = useState(false);
    const [showScenarioContextModal, setShowScenarioContextModal] =
        useState(false);
    const [scenarioContextModalVisible, setScenarioContextModalVisible] =
        useState(false);
    const [isReplaying, setIsReplaying] = useState(false);
    const [isCinematicFadingOut, setIsCinematicFadingOut] = useState(false);
    const [isGlobalFading, setIsGlobalFading] = useState(false);

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
                                onComplete();

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
                                    // Desktop: Faster transition to context modal
                                    setTimeout(() => {
                                        setScreenDimmed(true);
                                        setTimeout(() => {
                                            setShowScenarioContextModal(true);
                                            setScenarioContextModalVisible(true);
                                        }, 400);
                                    }, 500); // Reduced from 2000ms to 500ms for snappier feel
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
    }, [aiImageBase64, showChatOverlay, hasCompletedFirstLoad, onComplete]);

    const replayCinematic = (resetCallback: () => void) => {
        setIsReplaying(true);
        setIsCinematicFadingOut(true);
        // First, fade out all text elements
        setNameOpacity(0);
        setPersonalityOpacity(0);
        setEncounterTypeOpacity(0);
        setBodyLanguageOpacity(0);
        setShowScenarioContextModal(false);
        setScenarioContextModalVisible(false);

        // Wait for text elements to fade out completely (800ms for transition)
        setTimeout(() => {
            // Now fade to black by dimming the screen completely
            setIsGlobalFading(true);

            // After fade to black, reset all elements
            setTimeout(() => {
                // Reset all cinematic states
                setImageOpacity(0);
                setCinematicSequenceComplete(false);
                setCinematicPhase("image");
                setIsCinematicFadingOut(false); // Reset fade-out state
                resetCallback(); // Reset parent state (hasCompletedFirstLoad)

                // Brighten screen and start new sequence
                setTimeout(() => {
                    setIsGlobalFading(false);
                    setIsReplaying(false);
                    // The useEffect will trigger again because hasCompletedFirstLoad is false
                }, 200); // Brief delay before brightening
            }, 400); // Time for fade to black
        }, 800); // Time for text elements to fade out
    };

    return {
        cinematicPhase,
        imageOpacity,
        nameOpacity,
        personalityOpacity,
        encounterTypeOpacity,
        bodyLanguageOpacity,
        cinematicSequenceComplete,
        screenDimmed,
        setScreenDimmed,
        showScenarioContextModal,
        setShowScenarioContextModal,
        scenarioContextModalVisible,
        setScenarioContextModalVisible,
        isReplaying,
        isCinematicFadingOut,
        isGlobalFading,
        setIsGlobalFading,
        replayCinematic,
    };
};
