import { GoogleGenAI } from "@google/genai";
import type { GenerateContentResponse } from "@google/genai";
import {
	ScenarioDetails,
	ChatMessage,
	AnalysisReport,
	AIGender,
	AIPersonalityTrait,
	SocialEnvironment,
	TurnByTurnAnalysisItem,
	AIAgeBracket,
	AiTurnResponse,
	DialogueChunk,
	ActiveAction,
	EstablishedVisuals,
	UserTurnFeedback,
	StartConversationResponse,
	UserScenarioDetails,
} from "../types";
import {
	GEMINI_TEXT_MODEL,
	MAX_CONVERSATION_HISTORY_FOR_PROMPT,
	INITIAL_ENGAGEMENT,
	MAX_HISTORY_FOR_ANALYSIS,
	SILENT_USER_ACTION_TOKEN,
} from "../constants";
import {
	buildStartConversationPrompt,
	buildNextAITurnPrompt,
	inferMissingPersonaDetails,
} from "./promptService";

// Helper to construct a more informative error message from Google API errors
const getGoogleApiErrorMessage = (
	error: any,
	defaultMessage: string
): string => {
	if (
		error &&
		typeof error === "object" &&
		error.error &&
		typeof error.error === "object"
	) {
		const apiError = error.error;
		let message = apiError.message || defaultMessage;
		if (apiError.code === 429 || apiError.status === "RESOURCE_EXHAUSTED") {
			message = `API quota exceeded (Error ${apiError.code || "429"}: ${
				apiError.status || "RESOURCE_EXHAUSTED"
			}). Please check your Google Cloud project plan and billing details. For more information, visit https://ai.google.dev/gemini-api/docs/rate-limits. Original message: ${
				apiError.message || "No specific message."
			}`;
		} else if (
			apiError.code === 400 ||
			apiError.status === "INVALID_ARGUMENT"
		) {
			message = `Invalid request (Error ${apiError.code || "400"}: ${
				apiError.status || "INVALID_ARGUMENT"
			}). Please check your input and try again. Original message: ${
				apiError.message || "No specific message."
			}`;
		} else if (
			apiError.code === 403 ||
			apiError.status === "PERMISSION_DENIED"
		) {
			message = `Access denied (Error ${apiError.code || "403"}: ${
				apiError.status || "PERMISSION_DENIED"
			}). Please check your API key and permissions. Original message: ${
				apiError.message || "No specific message."
			}`;
		} else if (apiError.message) {
			message = `API Error ${apiError.code || "Unknown Code"} (${
				apiError.status || "Unknown Status"
			}): ${apiError.message}`;
		}
		return message;
	}
	return error instanceof Error ? error.message : defaultMessage;
};

export class GeminiService {
	private ai: GoogleGenAI;

	constructor(apiKey: string) {
		this.ai = new GoogleGenAI({ apiKey });
	}

	private parseJsonFromText<T>(text: string): T | null {
		let jsonStr = text.trim();

		// Remove markdown code fences
		const fenceRegex = /^```(\w*)?\s*\n?([\s\S]*?)\n?\s*```$/;
		const match = jsonStr.match(fenceRegex);
		if (match && match[2]) {
			jsonStr = match[2].trim();
		}

		// Remove any leading/trailing non-JSON text
		const jsonStart = jsonStr.indexOf("{");
		const jsonEnd = jsonStr.lastIndexOf("}");
		if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
			jsonStr = jsonStr.substring(jsonStart, jsonEnd + 1);
		}

		try {
			return JSON.parse(jsonStr) as T;
		} catch (e) {
			console.error(
				"Failed to parse JSON response:",
				e,
				"Attempted to parse:",
				jsonStr,
				"Original text from API:",
				text
			);
			return null;
		}
	}

	private cleanAiDialogue(text: string | undefined): string {
		if (typeof text !== "string") return text || "";
		return text.trim();
	}

	async startConversation(
		scenario: ScenarioDetails,
		userScenarioDetails?: UserScenarioDetails
	): Promise<StartConversationResponse> {
		scenario = inferMissingPersonaDetails(scenario);
		const prompt = buildStartConversationPrompt(scenario, userScenarioDetails);
		try {
			const response: GenerateContentResponse =
				await this.ai.models.generateContent({
					model: GEMINI_TEXT_MODEL,
					contents: [{ role: "user", parts: [{ text: prompt }] }],
					config: { responseMimeType: "application/json" },
				});

			const parsed = this.parseJsonFromText<StartConversationResponse>(
				response.text ?? " "
			);

			if (parsed && parsed.establishedVisuals && parsed.aiName) {
				return {
					...parsed,
					shouldGenerateNewImage: true, // Always generate an image on the first turn
					isEndingConversation: false,
					feedbackOnUserTurn: {
						engagementDelta: 0,
						userTurnEffectivenessScore: 100,
					},
					achieved: false,
					goalProgress: 0,
				};
			}
			console.error(
				"Failed to parse initial conversation data from Gemini, using defaults.",
				response.text
			);

			const fallbackName = scenario.aiName || "Alex";
			const defaultVisuals: EstablishedVisuals = {
				characterDescription: `a ${
					scenario.aiGender === AIGender.MALE ? "man" : "woman"
				} named ${fallbackName} with brown hair and a friendly expression`,
				clothingDescription: "wearing a simple gray t-shirt and dark jeans",
				heldObjects: "hands are free",
				bodyPosition: "standing comfortably",
				gazeDirection: "looking directly at you with interest",
				positionRelativeToUser: "standing a few feet away, facing you",
				environmentDescription: "in a neutral, non-descript room",
				currentPoseAndAction: "standing with a neutral expression",
				facialAccessories: "",
			};
			return {
				aiName: fallbackName,
				conversationStarter: "ai",
				initialDialogueChunks: [
					{ text: `Hello! I'm ${fallbackName}. Let's talk.`, type: "dialogue" },
				],
				initialBodyLanguage: "Neutral and open.",
				initialAiThoughts:
					"I'm ready to see how this interaction goes. I hope you're engaging.",
				initialEngagementScore: INITIAL_ENGAGEMENT,
				initialConversationMomentum: 55,
				establishedVisuals: defaultVisuals,
				dialogueChunks: [
					{ text: `Hello! I'm ${fallbackName}. Let's talk.`, type: "dialogue" },
				],
				aiBodyLanguage: "Neutral and open.",
				aiThoughts:
					"I'm ready to see how this interaction goes. I hope you're engaging.",
				feedbackOnUserTurn: {
					engagementDelta: 0,
					userTurnEffectivenessScore: 100,
				},
				conversationMomentum: 55,
				isEndingConversation: false,
				shouldGenerateNewImage: true,
				contextualSummary: "You began a new conversation.",
				goalProgress: 0,
				achieved: false,
			};
		} catch (error: any) {
			const errorMessage = getGoogleApiErrorMessage(
				error,
				"Failed to initialize conversation with AI."
			);
			console.error(
				"Error starting conversation with Gemini:",
				errorMessage,
				error
			);
			throw new Error(errorMessage);
		}
	}

	async generateImagePrompt(
		visuals: EstablishedVisuals
	): Promise<{ fullImagenPrompt: string }> {
		const {
			characterDescription,
			clothingDescription,
			environmentDescription,
			currentPoseAndAction,
		} = visuals;
		const noTextLogosInstructionGlobal =
			"Ensure no text, letters, words, logos, or watermarks appear in the generated image.";

		const fullImagenPromptString = `Photorealistic portrait of ${characterDescription}, ${clothingDescription}, ${currentPoseAndAction}, inside ${environmentDescription}. ${noTextLogosInstructionGlobal}`;

		return {
			fullImagenPrompt: this.cleanAiDialogue(fullImagenPromptString),
		};
	}

	async getNextAITurn(
		conversationHistory: ChatMessage[],
		userInput: string,
		currentEngagement: number,
		scenario: ScenarioDetails,
		lastKnownPoseAndAction: string,
		activeAction: ActiveAction | null,
		fastForwardAction?: boolean,
		isActionPaused?: boolean
	): Promise<AiTurnResponse> {
		const prompt = buildNextAITurnPrompt({
			conversationHistory,
			userInput,
			currentEngagement,
			scenario,
			lastKnownPoseAndAction,
			activeAction,
			fastForwardAction,
			isActionPaused,
		});
		try {
			const response: GenerateContentResponse =
				await this.ai.models.generateContent({
					model: GEMINI_TEXT_MODEL,
					contents: [{ role: "user", parts: [{ text: prompt }] }],
					config: { responseMimeType: "application/json" },
				});

			const parsed = this.parseJsonFromText<AiTurnResponse>(
				response.text ?? " "
			);

			if (parsed) {
				// Validate required fields
				if (!parsed.dialogueChunks || !Array.isArray(parsed.dialogueChunks)) {
					console.error(
						"AI response missing or invalid dialogueChunks:",
						parsed
					);
					throw new Error("AI response is missing dialogue chunks.");
				}

				if (
					!parsed.aiBodyLanguage ||
					typeof parsed.aiBodyLanguage !== "string"
				) {
					console.error(
						"AI response missing or invalid aiBodyLanguage:",
						parsed
					);
					throw new Error("AI response is missing body language description.");
				}

				if (!parsed.aiThoughts || typeof parsed.aiThoughts !== "string") {
					console.error("AI response missing or invalid aiThoughts:", parsed);
					throw new Error("AI response is missing AI thoughts.");
				}

				if (
					typeof parsed.conversationMomentum !== "number" ||
					parsed.conversationMomentum < 0 ||
					parsed.conversationMomentum > 100
				) {
					console.error(
						"AI response has invalid conversationMomentum:",
						parsed.conversationMomentum
					);
					parsed.conversationMomentum = Math.max(
						0,
						Math.min(100, parsed.conversationMomentum || 50)
					);
				}

				return parsed;
			}
			console.error(
				"Failed to parse AI turn response from Gemini:",
				response.text
			);
			throw new Error(
				"Received invalid data from AI. Could not parse turn response."
			);
		} catch (error: any) {
			const errorMessage = getGoogleApiErrorMessage(
				error,
				"Failed to get next AI turn."
			);
			console.error("Error in getNextAITurn with Gemini:", errorMessage, error);
			throw new Error(errorMessage);
		}
	}

	async analyzeConversation(
		conversationHistory: ChatMessage[],
		scenario: ScenarioDetails,
		finalEngagement: number
	): Promise<AnalysisReport> {
		const historyForAnalysis = conversationHistory
			.slice(-MAX_HISTORY_FOR_ANALYSIS)
			.map((msg) => {
				if (msg.sender === "user") {
					return `  - You: "${msg.text}" (Effectiveness: ${
						msg.userTurnEffectivenessScore ?? "N/A"
					}%, Engagement Impact: ${msg.engagementDelta ?? "N/A"}%)`;
				} else if (msg.sender === "user_action") {
					return `  - You: *${msg.text}* (Action)`;
				} else if (msg.sender === "ai") {
					return `  - ${scenario.aiName}: "${msg.text}" (Body Language: ${
						msg.bodyLanguageDescription ?? "N/A"
					}) (Thoughts: ${msg.aiThoughts ?? "N/A"})`;
				} else if (msg.sender === "backstory") {
					return `  - [SCENARIO BACKSTORY]: ${msg.text}`;
				}
				return `  - System: ${msg.text}`;
			})
			.join("\n");

		const prompt = `You are an expert social skills coach. Your task is to analyze the following conversation and provide a detailed performance report focused on the user's social skills development. Be insightful, constructive, and actionable.

    **Conversation Context:**
    - AI Persona: ${scenario.aiName}, a character who is ${
			scenario.customContext
				? `Specific context: ${scenario.customContext}`
				: ""
		}
    - User's Goal: ${
			scenario.conversationGoal ||
			"No specific goal was set; the goal was emergent."
		}
    - Final Engagement Score: ${finalEngagement}%

    **Full Conversation Transcript:**
    ${historyForAnalysis}

    **Analysis Task:**
    Based on the transcript and context, provide a comprehensive analysis of the user's performance. Evaluate their social skills, such as charisma, clarity, engagement, and adaptability. Focus on what the user did well and areas where they can improve.

    **CRITICAL: Your entire response MUST be a single, valid JSON object that adheres strictly to the following structure. Do not add any text, comments, or markdown fences outside of this JSON object.**

    **JSON Structure:**
    {
      "overallCharismaScore": number,
      "responseClarityScore": number,
      "engagementMaintenanceScore": number,
      "adaptabilityScore": number,
      "goalAchievementScore": number | null,
      "finalEngagementSnapshot": ${finalEngagement},
      "turnByTurnAnalysis": [
        {
          "analysis": "string"
        }
      ],
      "strengths": "string",
      "areasForImprovement": "string",
      "actionableTips": "string",
      "thingsToAvoid": "string",
      "goalAchievementFeedback": "string | null",
      "aiEvolvingThoughtsSummary": "string"
    }

    **Instructions for Turn-by-Turn Analysis:**
    - For every time the user spoke, provide one object in the \`turnByTurnAnalysis\` array.
    - Each object should contain only one key: "analysis".
    - The "analysis" value should be your detailed feedback on the user's response for that specific turn. What did they do well? What could be improved? Focus on their social skills, communication choices, and behavior.
    - The number of objects in this array must match the number of times the user sent a message.
    `;

		try {
			const response: GenerateContentResponse =
				await this.ai.models.generateContent({
					model: GEMINI_TEXT_MODEL,
					contents: [{ role: "user", parts: [{ text: prompt }] }],
					config: { responseMimeType: "application/json" },
				});

			const parsed = this.parseJsonFromText<AnalysisReport>(
				response.text ?? " "
			);
			if (parsed) {
				const llmAnalyses = (parsed.turnByTurnAnalysis || [])
					.map((t) => t.analysis)
					.filter(Boolean) as string[];
				let analysisIdx = 0;

				const reconstructedAnalysis: TurnByTurnAnalysisItem[] = [];
				let currentTurn: TurnByTurnAnalysisItem = {};

				for (const msg of conversationHistory) {
					if (msg.sender === "backstory" || msg.sender === "system") continue;

					if (msg.sender === "ai") {
						if (Object.keys(currentTurn).length > 0) {
							reconstructedAnalysis.push(currentTurn);
						}
						currentTurn = {
							aiResponse: msg.text,
							aiBodyLanguage: msg.bodyLanguageDescription,
							aiThoughts: msg.aiThoughts,
							conversationMomentum: msg.conversationMomentum,
							goalChange: msg.goalChange,
						};
					} else if (msg.sender === "user" || msg.sender === "user_action") {
						// Also handle user_action for analysis
						const userInputText =
							msg.sender === "user_action"
								? `*${msg.text}*`
								: msg.text === SILENT_USER_ACTION_TOKEN
								? "*You chose to remain silent or continue a non-verbal action.*"
								: msg.text;

						// If the current turn already has user input, append to it. Otherwise, start a new one.
						if (currentTurn.userInput) {
							currentTurn.userInput += `\n${userInputText}`;
						} else {
							currentTurn.userInput = userInputText;
						}

						// User feedback is typically associated with the main dialogue turn.
						if (msg.sender === "user") {
							currentTurn.userTurnEffectivenessScore =
								msg.userTurnEffectivenessScore;
							currentTurn.engagementDelta = msg.engagementDelta;
							currentTurn.positiveTraitContribution =
								msg.positiveTraitContribution;
							currentTurn.negativeTraitContribution =
								msg.negativeTraitContribution;
							currentTurn.analysis =
								llmAnalyses[analysisIdx] ||
								"No specific analysis provided for this turn.";
							analysisIdx++;
						}

						// Handle user_action messages for better analysis context
						if (msg.sender === "user_action") {
							// Add action context to the analysis
							if (currentTurn.analysis) {
								currentTurn.analysis += ` The user also performed the action: ${msg.text}.`;
							}
						}
					}
				}
				if (Object.keys(currentTurn).length > 0) {
					reconstructedAnalysis.push(currentTurn);
				}

				parsed.turnByTurnAnalysis = reconstructedAnalysis;
				return parsed;
			}

			console.error(
				"Failed to parse analysis report from Gemini:",
				response.text
			);
			throw new Error("Received invalid analysis data from the AI.");
		} catch (error: any) {
			const errorMessage = getGoogleApiErrorMessage(
				error,
				"Failed to generate analysis report."
			);
			console.error("Error generating analysis report:", errorMessage, error);
			throw new Error(errorMessage);
		}
	}
}
