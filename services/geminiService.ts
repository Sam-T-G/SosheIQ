
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { ScenarioDetails, ChatMessage, AnalysisReport, AIGender, PowerDynamic, AIPersonalityTrait, SocialEnvironment, TurnByTurnAnalysisItem, AIAgeBracket } from '../types';
import { GEMINI_TEXT_MODEL, MAX_CONVERSATION_HISTORY_FOR_PROMPT, INITIAL_ENGAGEMENT, MAX_HISTORY_FOR_ANALYSIS } from '../constants';

// Helper to construct a more informative error message from Google API errors
const getGoogleApiErrorMessage = (error: any, defaultMessage: string): string => {
  if (error && typeof error === 'object' && error.error && typeof error.error === 'object') {
    const apiError = error.error;
    let message = apiError.message || defaultMessage;
    if (apiError.code === 429 || apiError.status === 'RESOURCE_EXHAUSTED') {
      message = `API quota exceeded (Error ${apiError.code || '429'}: ${apiError.status || 'RESOURCE_EXHAUSTED'}). Please check your Google Cloud project plan and billing details. For more information, visit https://ai.google.dev/gemini-api/docs/rate-limits. Original message: ${apiError.message || 'No specific message.'}`;
    } else if (apiError.message) {
      message = `API Error ${apiError.code || 'Unknown Code'} (${apiError.status || 'Unknown Status'}): ${apiError.message}`;
    }
    return message;
  }
  return error instanceof Error ? error.message : defaultMessage;
};

// Helper to get text description for LLM prompts based on age bracket or custom age
const getAgeDescriptionForLLM = (ageBracket?: AIAgeBracket, customAge?: number): string => {
  if (typeof customAge === 'number' && customAge >= 13) {
    return `Specific Age: Approximately ${customAge} years old. Your vocabulary, concerns, and social understanding should reflect this specific age.`;
  }
  if (!ageBracket || ageBracket === AIAgeBracket.NOT_SPECIFIED || ageBracket === AIAgeBracket.CUSTOM) { // CUSTOM falls back if no customAge
    return "Not specified. Assume a general adult age unless context implies otherwise. Adapt naturally.";
  }
  switch (ageBracket) {
    case AIAgeBracket.TEENAGER: return "Teenager (e.g., around 13-17 years old). Your vocabulary, concerns, and social understanding should reflect this age group.";
    case AIAgeBracket.YOUNG_ADULT_18_23: return "Young Adult (e.g., around 18-23 years old). Your experiences and perspectives should align with this life stage.";
    case AIAgeBracket.YOUNG_ADULT_24_29: return "Young Adult (e.g., around 24-29 years old). Your experiences and perspectives should align with this life stage.";
    case AIAgeBracket.ADULT_30_39: return "Adult (e.g., around 30-39 years old). Portray maturity and life experiences typical of this age range.";
    case AIAgeBracket.ADULT_40_50: return "Adult (e.g., around 40-50 years old). Portray maturity and life experiences typical of this age range.";
    case AIAgeBracket.SENIOR_51_PLUS: return "Senior (e.g., 51+ years old). Your demeanor, references, and pace might reflect this age group.";
    default: return "Not specified. Assume a general adult age.";
  }
};

// Helper to get visual description for Imagen prompts based on age bracket or custom age
const getAgeVisualDescriptionForImagen = (ageBracket?: AIAgeBracket, customAge?: number): string => {
    if (typeof customAge === 'number' && customAge >= 13) {
        if (customAge <= 17) return "teenage, around " + customAge + " years old";
        if (customAge <= 23) return "young adult, around " + customAge + " years old";
        if (customAge <= 29) return "young adult, around " + customAge + " years old";
        if (customAge <= 39) return "adult, around " + customAge + " years old";
        if (customAge <= 50) return "middle-aged adult, around " + customAge + " years old";
        return "senior citizen, elderly, appearing around " + customAge + " years old";
    }
    if (!ageBracket || ageBracket === AIAgeBracket.NOT_SPECIFIED || ageBracket === AIAgeBracket.CUSTOM) return "adult";
    switch (ageBracket) {
        case AIAgeBracket.TEENAGER: return "teenage";
        case AIAgeBracket.YOUNG_ADULT_18_23: return "young adult, early 20s";
        case AIAgeBracket.YOUNG_ADULT_24_29: return "young adult, late 20s";
        case AIAgeBracket.ADULT_30_39: return "adult, in their 30s";
        case AIAgeBracket.ADULT_40_50: return "adult, in their 40s";
        case AIAgeBracket.SENIOR_51_PLUS: return "senior citizen, 50+ years old, mature looking";
        default: return "adult";
    }
};

const getPersonalityPromptSegment = (traits: AIPersonalityTrait[], customPersonality?: string): string => {
  let segment = "";
  if (traits.length > 0) {
    segment += `\n    - Selected AI Personality Traits: ${traits.join(', ')}.`;
  }
  if (customPersonality && customPersonality.trim() !== "") {
    segment += `\n    - Custom AI Personality Description: "${customPersonality.trim()}".`;
  }
  if (segment === "") {
    segment = "\n    - AI Personality: General, adaptable."; // Default if nothing specified
  } else {
    segment += "\n    Guidance: Synthesize these traits and custom description. If both are provided, the custom description can add nuance or specificity to the selected traits. If only custom is provided, use that. If only traits are provided, use them."
  }
  return segment;
}

export class GeminiService {
  private ai: GoogleGenAI;

  constructor(apiKey: string) {
    this.ai = new GoogleGenAI({ apiKey });
  }

  private parseJsonFromText<T,>(text: string): T | null {
    let jsonStr = text.trim();
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
      jsonStr = match[2].trim();
    }
    try {
      return JSON.parse(jsonStr) as T;
    } catch (e) {
      console.error("Failed to parse JSON response:", e, "Attempted to parse:", jsonStr, "Original text from API:", text);
      return null;
    }
  }

  private cleanAiDialogue(text: string | undefined): string {
    if (typeof text !== 'string') return text || "";
    let cleanedText = text.replace(/\\n/g, '\n');
    cleanedText = cleanedText.replace(/\s*\[.*?\]\s*|\s*<.*?>\s*/g, ' ');
    cleanedText = cleanedText.replace(/\s+/g, ' ').trim();
    return cleanedText;
  }

  async startConversation(scenario: ScenarioDetails): Promise<{ initialDialogue: string; initialBodyLanguage: string; initialAiThoughts: string; initialEngagementScore: number; initialConversationMomentum: number; }> {
    const customContextPrompt = scenario.customContext ? `\n    - Custom Scenario Details: ${scenario.customContext}` : "";
    const agePromptSegment = `\n    - AI Age: ${getAgeDescriptionForLLM(scenario.aiAgeBracket, scenario.customAiAge)}`;
    const personalityPromptSegment = getPersonalityPromptSegment(scenario.aiPersonalityTraits, scenario.customAiPersonality);

    const prompt = `You are an AI simulating a social interaction for training purposes.
    Your AI Name: ${scenario.aiName}
    Your AI Persona Details:
    - Environment: ${scenario.environment}${personalityPromptSegment}
    - AI Gender: ${scenario.aiGender}${agePromptSegment}
    - Power Dynamic with User: ${scenario.powerDynamic}${customContextPrompt}

    As ${scenario.aiName}, start the conversation with an engaging opening line. This line must be consistent with your persona (synthesized from traits and custom description if provided), name, gender, age, and all scenario details.
    IMPORTANT: For this first message, your language MUST BE VERY CASUAL AND SIMPLE, universally approachable. Avoid jargon, complex idioms, or overly formal sentences. Aim for simple, direct speech as if talking to a new acquaintance in a relaxed setting.
    Describe your initial body language, appropriate for your persona, and the scenario. This 'initialBodyLanguage' field is mandatory.
    Provide your initial internal thoughts about this upcoming interaction (e.g., your expectations, how you feel about the scenario, initial assessment of the user if applicable). This should be a brief, candid first-person internal monologue reflecting your persona and age. This 'initialAiThoughts' field is a absolutely mandatory part of your response.
    Set an initial engagement level for the user (a number between 0 and 100, let's start with ${INITIAL_ENGAGEMENT}). This 'initialEngagementScore' field is mandatory.
    Set an initial conversation momentum score (0-100, start with a neutral 55). This 'initialConversationMomentum' field is mandatory.

    Respond ONLY in a single, valid JSON object. Do not include any text, comments, or markdown fences outside of this JSON object.
    Ensure all string values are correctly quoted. Special characters within strings (e.g., double quotes, backslashes, newlines) must be properly escaped (e.g., \`\\"\`, \`\\\\\`, \`\\\\n\`).
    The JSON object must have the following structure:
    {
      "initialDialogue": "Your opening line as ${scenario.aiName} here.",
      "initialBodyLanguage": "Description of your body language.",
      "initialAiThoughts": "Your initial internal monologue about the interaction as ${scenario.aiName}.",
      "initialEngagementScore": ${INITIAL_ENGAGEMENT},
      "initialConversationMomentum": 55
    }`;

    try {
        const response: GenerateContentResponse = await this.ai.models.generateContent({
            model: GEMINI_TEXT_MODEL,
            contents: [{role: "user", parts: [{text: prompt}]}],
            config: { responseMimeType: "application/json" }
        });

        const parsed = this.parseJsonFromText<{ initialDialogue: string; initialBodyLanguage: string; initialAiThoughts: string; initialEngagementScore: number; initialConversationMomentum: number; }>(response.text ?? ' ');

        if (parsed && typeof parsed.initialDialogue === 'string' &&
            typeof parsed.initialBodyLanguage === 'string' &&
            typeof parsed.initialAiThoughts === 'string' &&
            typeof parsed.initialEngagementScore === 'number' &&
            typeof parsed.initialConversationMomentum === 'number') {
            parsed.initialDialogue = this.cleanAiDialogue(parsed.initialDialogue);
            parsed.initialBodyLanguage = this.cleanAiDialogue(parsed.initialBodyLanguage);
            parsed.initialAiThoughts = this.cleanAiDialogue(parsed.initialAiThoughts);
            return parsed;
        }
        console.error("Failed to parse initial conversation data from Gemini, using defaults.", response.text);
        return {
            initialDialogue: `Hello! I'm ${scenario.aiName}. Let's talk.`,
            initialBodyLanguage: "Neutral and open.",
            initialAiThoughts: "I'm ready to see how this interaction goes. I hope the user is engaging.",
            initialEngagementScore: INITIAL_ENGAGEMENT,
            initialConversationMomentum: 55,
        };

    } catch (error) {
        const errorMessage = getGoogleApiErrorMessage(error, "Failed to initialize conversation with AI.");
        console.error("Error starting conversation with Gemini:", errorMessage, error);
        throw new Error(errorMessage);
    }
  }

  async generateImagePromptForBodyLanguage(
    bodyLanguageDescription: string,
    aiGender: AIGender,
    aiName: string,
    aiAgeBracket: AIAgeBracket | undefined,
    customAiAge: number | undefined,
    existingEstablishedVisualSegment?: string
  ): Promise<{ fullImagenPrompt: string, newEstablishedVisualSegment: string | null }> {

    let genderTerm = "person";
    switch (aiGender) {
        case AIGender.MALE: genderTerm = "man"; break;
        case AIGender.FEMALE: genderTerm = "woman"; break;
        case AIGender.NON_BINARY: genderTerm = "non-binary person"; break;
        case AIGender.PREFER_NOT_TO_SPECIFY: genderTerm = "person with an androgynous appearance"; break;
    }

    const ageVisualCue = getAgeVisualDescriptionForImagen(aiAgeBracket, customAiAge);
    const cleanedBodyLanguage = this.cleanAiDialogue(bodyLanguageDescription);
    const noTextLogosInstructionGlobal = "Ensure no text, letters, words, logos, or watermarks appear in the generated image.";

    let currentEstablishedVisualBase: string;
    let newSegmentForReturn: string | null = null;

    if (!existingEstablishedVisualSegment) {
      const createdBaseSegment = `Photorealistic portrait of a ${ageVisualCue} ${genderTerm} who embodies the character ${aiName}, wearing simple neutral-colored attire (like a dark gray t-shirt or simple blue sweater). The background is simple and neutral, slightly out of focus, with soft natural lighting. The shot is typically chest-up. ${noTextLogosInstructionGlobal}`;
      currentEstablishedVisualBase = createdBaseSegment;
      newSegmentForReturn = this.cleanAiDialogue(createdBaseSegment);
    } else {
      currentEstablishedVisualBase = existingEstablishedVisualSegment;
    }

    const baseWithoutNoText = currentEstablishedVisualBase
        .replace(noTextLogosInstructionGlobal, '')
        .replace(/\.\s*$/, '')
        .trim();

    const fullImagenPromptString = `${baseWithoutNoText}, who is currently ${cleanedBodyLanguage}. ${noTextLogosInstructionGlobal}`;

    return {
        fullImagenPrompt: this.cleanAiDialogue(fullImagenPromptString),
        newEstablishedVisualSegment: newSegmentForReturn
    };
  }

  async getNextAITurn(
    conversationHistory: ChatMessage[],
    userInput: string,
    currentEngagement: number,
    scenario: ScenarioDetails
  ): Promise<{
    aiDialogue: string;
    aiBodyLanguage: string;
    aiThoughts: string;
    newEngagement: number;
    conversationMomentum: number;
    isEndingConversation: boolean;
  }> {
    const customContextPrompt = scenario.customContext ? `\n    - Custom Scenario Details: ${scenario.customContext}` : "";
    const agePromptSegment = `\n    - AI Age: ${getAgeDescriptionForLLM(scenario.aiAgeBracket, scenario.customAiAge)}`;
    const personalityPromptSegment = getPersonalityPromptSegment(scenario.aiPersonalityTraits, scenario.customAiPersonality);

    const historyForPrompt = conversationHistory
      .slice(-MAX_CONVERSATION_HISTORY_FOR_PROMPT)
      .map(msg => {
        const prefix = msg.sender === 'user' ? 'User' : scenario.aiName;
        let content = `${prefix}: "${msg.text}"`;
        if (msg.sender === 'ai' && msg.bodyLanguageDescription) {
          content += ` (Body Language: ${msg.bodyLanguageDescription})`;
        }
        return content;
      })
      .join('\n');

    const prompt = `You are ${scenario.aiName}, an AI in a social interaction simulation.
    Your Persona:
    - Environment: ${scenario.environment}${personalityPromptSegment}
    - AI Gender: ${scenario.aiGender}${agePromptSegment}
    - Power Dynamic with User: ${scenario.powerDynamic}${customContextPrompt}

    Current Conversation Context:
    - User's Current Engagement Score with you: ${currentEngagement}% (0-100 scale). This reflects how interested and positive the user feels towards you. Your response should naturally reflect this. If engagement is very low (e.g., < 20), you might sound disengaged or try to end the conversation. If high (e.g., > 80), you'd be more enthusiastic.
    - Recent Conversation History (last ${MAX_CONVERSATION_HISTORY_FOR_PROMPT} turns):
    ${historyForPrompt}
    - User's latest message to you: "${userInput}"

    Your Task:
    Based on your persona (synthesized from selected traits and custom description, including specified age), the current engagement, the conversation history, and the user's latest message:
    1.  Craft your next spoken dialogue as ${scenario.aiName} ("aiDialogue"). This should be natural, in character, and react appropriately to the user and engagement level. Avoid overly long responses.
    2.  Describe your current body language and facial expression ("aiBodyLanguage"). This should align with your dialogue and emotional state.
    3.  Provide your internal thoughts as ${scenario.aiName} ("aiThoughts"). This is your candid, private reaction to the user's message and your plan for your response. These thoughts influence your dialogue and body language and should reflect your age and persona.
    4.  Calculate a new engagement score ("newEngagement") from your perspective of how the user's last message affected your engagement with them. This score (0-100) should realistically change based on the user's input. For example, a positive, engaging message might increase it, a rude one decrease it.
    5.  Assess the current "conversationMomentum" (0-100). This reflects the energy and flow. Is it picking up, stalling, or negative?
    6.  Decide if you want to end the conversation ("isEndingConversation": true/false). You might end it if engagement is critically low, a natural conclusion is reached, or your persona dictates it.

    Response Format:
    Respond ONLY in a single, valid JSON object. No extra text or markdown. Ensure correct JSON syntax, especially for strings and escaping.
    Example JSON structure:
    {
      "aiDialogue": "Your response here...",
      "aiBodyLanguage": "Your body language description...",
      "aiThoughts": "Your internal thoughts here...",
      "newEngagement": 75,
      "conversationMomentum": 60,
      "isEndingConversation": false
    }
    Focus on natural, human-like interaction. Your response length for aiDialogue should typically be 1-3 sentences.`;

    try {
      const response: GenerateContentResponse = await this.ai.models.generateContent({
        model: GEMINI_TEXT_MODEL,
        contents: [{role: "user", parts: [{text: prompt}]}],
        config: { responseMimeType: "application/json" }
      });

      const parsed = this.parseJsonFromText<{
        aiDialogue: string;
        aiBodyLanguage: string;
        aiThoughts: string;
        newEngagement: number;
        conversationMomentum: number;
        isEndingConversation: boolean;
      }>(response.text ?? '');

      if (parsed && typeof parsed.aiDialogue === 'string' &&
          typeof parsed.aiBodyLanguage === 'string' &&
          typeof parsed.aiThoughts === 'string' &&
          typeof parsed.newEngagement === 'number' &&
          typeof parsed.conversationMomentum === 'number' &&
          typeof parsed.isEndingConversation === 'boolean') {
        parsed.aiDialogue = this.cleanAiDialogue(parsed.aiDialogue);
        parsed.aiBodyLanguage = this.cleanAiDialogue(parsed.aiBodyLanguage);
        parsed.aiThoughts = this.cleanAiDialogue(parsed.aiThoughts);
        return parsed;
      }
      console.error("Failed to parse AI turn data from Gemini, using fallback.", response.text);
      return {
        aiDialogue: "I'm not sure how to respond to that. Could you try rephrasing?",
        aiBodyLanguage: "Looks a bit confused.",
        aiThoughts: "The AI response was not in the expected format. Need to debug the prompt or parsing.",
        newEngagement: Math.max(0, currentEngagement - 10),
        conversationMomentum: 30,
        isEndingConversation: false,
      };
    } catch (error) {
      const errorMessage = getGoogleApiErrorMessage(error, "Failed to get next AI turn.");
      console.error("Error in getNextAITurn:", errorMessage, error);
      throw new Error(errorMessage);
    }
  }

  async analyzeConversation(
    fullConversationHistory: ChatMessage[],
    scenario: ScenarioDetails,
    finalEngagementSnapshot: number
  ): Promise<AnalysisReport> {
    const historyForAnalysis = fullConversationHistory
      .slice(-MAX_HISTORY_FOR_ANALYSIS)
      .map(msg => {
        let turn = "";
        if (msg.sender === 'user') {
          turn += `User: "${msg.text}"\n`;
        } else {
          turn += `${scenario.aiName}: "${msg.text}"\n`;
          if (msg.bodyLanguageDescription) {
            turn += `AI Body Language: ${msg.bodyLanguageDescription}\n`;
          }
          if (msg.aiThoughts) {
            turn += `AI Internal Thoughts: ${msg.aiThoughts}\n`;
          }
          if (typeof msg.conversationMomentum === 'number') {
            turn += `Conversation Momentum (AI perceived): ${msg.conversationMomentum}%\n`;
          }
        }
        return turn.trim();
      })
      .join('\n\n---\n\n');

    const customContextPrompt = scenario.customContext ? `\n    - Custom Scenario Details: ${scenario.customContext}` : "";
    const agePromptSegment = `\n    - AI Age: ${getAgeDescriptionForLLM(scenario.aiAgeBracket, scenario.customAiAge)}`;
    const personalityPromptSegment = getPersonalityPromptSegment(scenario.aiPersonalityTraits, scenario.customAiPersonality);


    const prompt = `You are a sophisticated AI Social Skills Coach. Your task is to analyze the following conversation and provide a detailed performance report FOR THE USER.

    Scenario Context:
    - Social Environment: ${scenario.environment}
    - AI Interlocutor Name: ${scenario.aiName}${personalityPromptSegment}
    - AI Interlocutor Gender: ${scenario.aiGender}${agePromptSegment}
    - Power Dynamic: ${scenario.powerDynamic}${customContextPrompt}
    - The AI's final engagement score with the user was: ${finalEngagementSnapshot}%

    Full Conversation History (or relevant excerpt):
    ${historyForAnalysis}

    Analysis Task:
    Based on the scenario (including AI's persona from traits/custom text and age if specified) and the conversation history, generate a comprehensive analysis report.
    The report MUST be a single, valid JSON object with the following structure and data types:
    {
      "overallCharismaScore": number, // (0-100) User's overall charisma and likability.
      "responseClarityScore": number, // (0-100) Clarity and coherence of the user's responses.
      "engagementMaintenanceScore": number, // (0-100) User's ability to keep the AI engaged.
      "adaptabilityScore": number, // (0-100) User's skill in adapting to the AI's persona (traits, custom description, age) and conversation flow.
      "overallAiEffectivenessScore": number, // (0-100, optional) Your assessment of how well the AI played its role based on its persona and the interaction. If unsure, you can omit or use a placeholder like 75.
      "finalEngagementSnapshot": ${finalEngagementSnapshot}, // User's final engagement score with the AI.
      "turnByTurnAnalysis": [ // An array of exchanges. Each exchange starts with the AI's turn, followed by the User's turn if they responded.
        {
          // AI's part of the exchange
          "aiResponse": "AI's dialogue in that turn (if any).",
          "aiBodyLanguage": "AI's body language at that turn (if any).",
          "aiThoughts": "AI's internal thoughts at that turn (if any, from history).",
          "conversationMomentum": number, // (0-100, optional) The AI's perceived conversation momentum from that AI turn (from history, if available).

          // User's response (if any)
          "userInput": "User's message in response to the AI (if any).",
          "userTurnEffectivenessScore": number, // (0-100, optional) How effective was the user's specific input in this turn? Only if userInput is present.
          "analysis": "Concise analysis and feedback *specifically for the userInput*. If userInput is not present for this exchange (e.g., AI's initial message or if AI spoke last), this 'analysis' field should be omitted or be an empty string. The focus is on evaluating the user's performance when they provide input."
        }
        // ... more exchanges
      ],
      "overallFeedback": "Detailed overall feedback for the user. Include specific strengths, areas for improvement, and actionable tips. Be constructive and encouraging. Consider how user adapted to AI's persona (traits, custom text, age) if specified.",
      "aiEvolvingThoughtsSummary": "A brief summary of how the AI's internal thoughts (from 'AI Internal Thoughts' in history) seemed to evolve or react to the user throughout the conversation. If not enough data, state that."
    }

    Guidelines for Analysis:
    - Process the conversation sequentially. For each instance where the AI makes a statement/asks a question, and the user provides a subsequent 'userInput', generate an entry in 'turnByTurnAnalysis'.
    - If the AI makes a statement and there's no subsequent user input (e.g., the very first AI message, or the last AI message if the conversation ends there), you can still create an entry for the AI's part, but 'userInput', 'userTurnEffectivenessScore', and 'analysis' (for user input) should be omitted or empty for that entry.
    - Be objective and fair in user assessment.
    - Provide specific examples from the conversation to support your scores and feedback for the user.
    - Ensure all numerical scores are within the 0-100 range.
    - The "aiEvolvingThoughtsSummary" should be based *only* on the AI's thoughts provided in the history.
    - The "conversationMomentum" in turnByTurnAnalysis should be taken from the AI's message data if present for that turn.

    Respond ONLY with the single, valid JSON object. No explanations or text outside the JSON structure.
    All string values within the JSON must be properly quoted and escaped.
    `;

    try {
        const response: GenerateContentResponse = await this.ai.models.generateContent({
            model: GEMINI_TEXT_MODEL,
            contents: [{role: "user", parts: [{text: prompt}]}],
            config: { responseMimeType: "application/json" }
        });

        const parsedReport = this.parseJsonFromText<AnalysisReport>(response.text ?? '');

        if (parsedReport &&
            typeof parsedReport.overallCharismaScore === 'number' &&
            typeof parsedReport.responseClarityScore === 'number' &&
            typeof parsedReport.engagementMaintenanceScore === 'number' &&
            typeof parsedReport.adaptabilityScore === 'number' &&
            typeof parsedReport.finalEngagementSnapshot === 'number' &&
            Array.isArray(parsedReport.turnByTurnAnalysis) &&
            typeof parsedReport.overallFeedback === 'string') {

            parsedReport.turnByTurnAnalysis = parsedReport.turnByTurnAnalysis.map(item => ({
                ...item,
                userInput: this.cleanAiDialogue(item.userInput),
                aiResponse: this.cleanAiDialogue(item.aiResponse),
                aiBodyLanguage: this.cleanAiDialogue(item.aiBodyLanguage),
                aiThoughts: this.cleanAiDialogue(item.aiThoughts),
                analysis: item.userInput && item.analysis ? this.cleanAiDialogue(item.analysis) : (item.analysis || ""), // Ensure analysis is cleaned if present, or empty string
                userTurnEffectivenessScore: typeof item.userTurnEffectivenessScore === 'number' ? item.userTurnEffectivenessScore : undefined,
                conversationMomentum: typeof item.conversationMomentum === 'number' ? item.conversationMomentum : undefined,
            }));
            parsedReport.overallFeedback = this.cleanAiDialogue(parsedReport.overallFeedback);
            if (parsedReport.aiEvolvingThoughtsSummary) {
                 parsedReport.aiEvolvingThoughtsSummary = this.cleanAiDialogue(parsedReport.aiEvolvingThoughtsSummary);
            }

            return parsedReport;
        }
        console.error("Failed to parse analysis report from Gemini, or structure is invalid.", response.text, parsedReport);
        throw new Error("Failed to generate a valid analysis report. The AI's response was not in the expected format.");

    } catch (error) {
        const errorMessage = getGoogleApiErrorMessage(error, "Failed to analyze conversation.");
        console.error("Error analyzing conversation with Gemini:", errorMessage, error);
        throw new Error(errorMessage);
    }
  }
}
