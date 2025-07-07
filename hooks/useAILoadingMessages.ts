import { useState, useEffect, useCallback } from "react";
import type { ScenarioDetails } from "../types";
import {
	AIGender,
	AIAgeBracket,
	SocialEnvironment,
	AIPersonalityTrait,
} from "../types";

interface LoadingMessage {
	text: string;
	duration: number; // How long to show this message (in ms)
}

interface UseAILoadingMessagesProps {
	scenarioDetails?: ScenarioDetails;
	isLoading: boolean;
	baseMessage?: string;
	testMode?: boolean; // Enable random test data generation
	startCycling?: boolean; // New: controls when cycling begins
	numMessages?: number; // New: limit number of messages cycled
}

/**
 * Custom hook for cycling through contextual AI loading messages
 * Generates personalized messages based on user's AI configuration
 */
export const useAILoadingMessages = ({
	scenarioDetails,
	isLoading,
	baseMessage = "Loading...",
	testMode = false,
	startCycling = true, // New: default to true for backward compatibility
	numMessages,
}: UseAILoadingMessagesProps) => {
	const [currentMessage, setCurrentMessage] = useState<string>(baseMessage);
	const [messageIndex, setMessageIndex] = useState(0);

	// Generate random test scenario details for demo purposes
	const generateTestScenarioDetails = useCallback((): ScenarioDetails => {
		const names = [
			"Sarah",
			"Alex",
			"Maya",
			"Jordan",
			"Luna",
			"Kai",
			"Zoe",
			"River",
		];
		const traits = [
			AIPersonalityTrait.CONFIDENT,
			AIPersonalityTrait.CHEERFUL,
			AIPersonalityTrait.WITTY,
			AIPersonalityTrait.EMPATHETIC,
			AIPersonalityTrait.PLAYFUL,
			AIPersonalityTrait.CREATIVE,
			AIPersonalityTrait.FLIRTATIOUS,
			AIPersonalityTrait.SARCASTIC,
		];
		const environments = [
			SocialEnvironment.DATING,
			SocialEnvironment.CASUAL,
			SocialEnvironment.WORK,
			SocialEnvironment.SOCIAL_GATHERING,
		];
		const genders = [AIGender.FEMALE, AIGender.MALE, AIGender.NON_BINARY];
		const ages = [
			AIAgeBracket.YOUNG_ADULT_18_23,
			AIAgeBracket.YOUNG_ADULT_24_29,
			AIAgeBracket.ADULT_30_39,
		];
		const cultures = [
			"Japanese",
			"French",
			"Brazilian",
			"Italian",
			"Korean",
			"Spanish",
		];

		return {
			aiName: names[Math.floor(Math.random() * names.length)],
			aiPersonalityTraits: [
				traits[Math.floor(Math.random() * traits.length)],
				traits[Math.floor(Math.random() * traits.length)],
			],
			environment:
				environments[Math.floor(Math.random() * environments.length)],
			aiGender: genders[Math.floor(Math.random() * genders.length)],
			aiAgeBracket: ages[Math.floor(Math.random() * ages.length)],
			aiCulture:
				Math.random() > 0.5
					? cultures[Math.floor(Math.random() * cultures.length)]
					: undefined,
			conversationGoal:
				Math.random() > 0.5 ? "Build a meaningful connection" : undefined,
		} as ScenarioDetails;
	}, []);

	// Generate contextual messages based on user's AI setup
	const generateAIMessages = useCallback((): LoadingMessage[] => {
		const linger = 1500; // 1.5 seconds for all except final name
		const finalLinger = 2000; // 2 seconds for final name display
		const activeScenarioDetails =
			testMode && !scenarioDetails
				? generateTestScenarioDetails()
				: scenarioDetails;

		if (!activeScenarioDetails) {
			const linger = 1500;
			const finalLinger = 2000;
			return [
				{ text: "Creating personality...", duration: linger },
				{ text: "Creating environment...", duration: linger },
				{ text: "Creating character essence...", duration: linger },
				{ text: "Creating cultural background...", duration: linger },
				{ text: "Creating conversation goal...", duration: linger },
				{ text: "Character ready to begin", duration: finalLinger },
			];
		}

		const messages: LoadingMessage[] = [];

		// Personality-based message
		if (
			activeScenarioDetails.aiPersonalityTraits &&
			activeScenarioDetails.aiPersonalityTraits.length > 0
		) {
			const mainTrait = activeScenarioDetails.aiPersonalityTraits[0];
			messages.push({
				text: `Calibrating ${mainTrait.toLowerCase()} personality...`,
				duration: linger,
			});
		} else if (activeScenarioDetails.customAiPersonality) {
			messages.push({
				text: "Configuring custom personality...",
				duration: linger,
			});
		} else {
			messages.push({
				text: "Crafting unique personality...",
				duration: linger,
			});
		}

		// Environment-based message
		if (activeScenarioDetails.environment === SocialEnvironment.DATING) {
			messages.push({
				text: "Setting romantic atmosphere...",
				duration: linger,
			});
		} else if (activeScenarioDetails.environment === SocialEnvironment.WORK) {
			messages.push({
				text: "Preparing professional setting...",
				duration: linger,
			});
		} else if (activeScenarioDetails.environment === SocialEnvironment.CASUAL) {
			messages.push({
				text: "Creating casual environment...",
				duration: linger,
			});
		} else if (
			activeScenarioDetails.environment === SocialEnvironment.CUSTOM &&
			activeScenarioDetails.customEnvironment
		) {
			messages.push({
				text: `Setting up ${activeScenarioDetails.customEnvironment.toLowerCase()}...`,
				duration: linger,
			});
		} else {
			messages.push({
				text: "Preparing interaction space...",
				duration: linger,
			});
		}

		// Age/Gender-based message
		if (activeScenarioDetails.aiGender !== AIGender.RANDOM) {
			const genderText = activeScenarioDetails.aiGender.toLowerCase();
			if (
				activeScenarioDetails.aiAgeBracket &&
				activeScenarioDetails.aiAgeBracket !== AIAgeBracket.NOT_SPECIFIED
			) {
				const ageText =
					activeScenarioDetails.aiAgeBracket === AIAgeBracket.CUSTOM &&
					activeScenarioDetails.customAiAge
						? `${activeScenarioDetails.customAiAge}-year-old`
						: activeScenarioDetails.aiAgeBracket
								.toLowerCase()
								.replace("_", " ");
				messages.push({
					text: `Embodying ${ageText} ${genderText} persona...`,
					duration: linger,
				});
			} else {
				messages.push({
					text: `Embodying ${genderText} persona...`,
					duration: linger,
				});
			}
		} else {
			messages.push({
				text: "Defining character essence...",
				duration: linger,
			});
		}

		// Culture-based message
		if (activeScenarioDetails.aiCulture) {
			messages.push({
				text: `Integrating ${activeScenarioDetails.aiCulture} cultural nuances...`,
				duration: linger,
			});
		}

		// Goal-based message
		if (activeScenarioDetails.conversationGoal) {
			messages.push({
				text: "Preparing conversation dynamics...",
				duration: linger,
			});
		}

		// Generic preparation message when no specific goal
		if (!activeScenarioDetails.conversationGoal) {
			messages.push({
				text: "Finalizing interaction parameters...",
				duration: linger,
			});
		}

		// Name-based message (only if name is available, otherwise skip)
		// (Removed 'Awakening (name)...' message)

		// Always end with name introduction or generic ready message
		if (activeScenarioDetails.aiName) {
			messages.push({
				text: `Meet ${activeScenarioDetails.aiName}`,
				duration: finalLinger, // Linger for 2 seconds before fade
			});
		} else {
			messages.push({
				text: "Character ready to begin",
				duration: finalLinger, // Linger for 2 seconds before fade
			});
		}

		// Limit number of messages if numMessages is provided
		if (typeof numMessages === "number" && numMessages > 0) {
			return messages.slice(0, numMessages);
		}
		return messages;
	}, [scenarioDetails, testMode, generateTestScenarioDetails, numMessages]);

	// Cycle through messages
	useEffect(() => {
		if (!isLoading) {
			setCurrentMessage(baseMessage);
			setMessageIndex(0);
			return;
		}

		const messages = generateAIMessages();
		if (messages.length === 0) return;

		setCurrentMessage(messages[0].text);
		setMessageIndex(0);

		let currentIndex = 0;
		let timeoutId: NodeJS.Timeout;

		const cycleToNextMessage = () => {
			if (currentIndex < messages.length - 1) {
				currentIndex++;
				setCurrentMessage(messages[currentIndex].text);
				setMessageIndex(currentIndex);

				// Schedule next message
				timeoutId = setTimeout(
					cycleToNextMessage,
					messages[currentIndex].duration
				);
			}
		};

		// Start the cycle only if allowed
		if (messages.length > 1 && startCycling) {
			timeoutId = setTimeout(cycleToNextMessage, messages[0].duration);
		}

		return () => {
			if (timeoutId) {
				clearTimeout(timeoutId);
			}
		};
	}, [isLoading, generateAIMessages, baseMessage, startCycling]);

	return {
		currentMessage,
		messageIndex,
		totalMessages: generateAIMessages().length,
	};
};
