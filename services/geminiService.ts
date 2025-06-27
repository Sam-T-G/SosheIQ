
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { ScenarioDetails, ChatMessage, AnalysisReport, AIGender, AIPersonalityTrait, SocialEnvironment, TurnByTurnAnalysisItem, AIAgeBracket, PowerDynamic } from '../types';
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

interface AiTurnResponse {
    aiDialogue: string;
    aiBodyLanguage: string;
    aiThoughts: string;
    engagementDelta: number;
    userTurnEffectivenessScore: number;
    conversationMomentum: number;
    positiveTraitContribution?: string;
    negativeTraitContribution?: string;
    isEndingConversation: boolean;
    emergingGoal?: string;
    goalProgress: number;
    achieved: boolean;
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
    // This regex is simplified to avoid being too aggressive
    return text.trim();
  }

  async startConversation(scenario: ScenarioDetails): Promise<{ initialDialogue: string; initialBodyLanguage: string; initialAiThoughts: string; initialEngagementScore: number; initialConversationMomentum: number; }> {
    const customContextPrompt = scenario.customContext ? `\n    - Custom Scenario Details: ${scenario.customContext}` : "";
    const agePromptSegment = `\n    - AI Age: ${getAgeDescriptionForLLM(scenario.aiAgeBracket, scenario.customAiAge)}`;
    const personalityPromptSegment = getPersonalityPromptSegment(scenario.aiPersonalityTraits, scenario.customAiPersonality);
		const customEnvPrompt = scenario.environment === SocialEnvironment.CUSTOM && scenario.customEnvironment ? `\n    - Custom Environment Details: ${scenario.customEnvironment}` : "";
		const culturePrompt = scenario.aiCulture ? `\n    - AI Culture/Race Nuances: "${scenario.aiCulture}". Incorporate this into your persona subtly.` : "";


    const prompt = `You are an AI simulating a social interaction for training purposes.
    Your AI Name: ${scenario.aiName}
    Your AI Persona Details:
    - Environment: ${scenario.environment}${customEnvPrompt}${personalityPromptSegment}${culturePrompt}
    - AI Gender: ${scenario.aiGender}${agePromptSegment}${customContextPrompt}

    As ${scenario.aiName}, start the conversation with an engaging opening line. This line must be consistent with your persona, name, gender, age, and all scenario details.
    Describe your initial body language, appropriate for your persona, and the scenario. This 'initialBodyLanguage' field is mandatory.
    Provide your initial internal thoughts about this upcoming interaction (e.g., your expectations, how you feel about the scenario). This should be a brief, candid first-person internal monologue reflecting your persona and age. This 'initialAiThoughts' field is a absolutely mandatory part of your response.
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
    existingEstablishedVisualSegment?: string,
		aiCulture?: string
  ): Promise<{ fullImagenPrompt: string, newEstablishedVisualSegment: string | null }> {

    let genderTerm = "person";
    switch (aiGender) {
        case AIGender.MALE: genderTerm = "man"; break;
        case AIGender.FEMALE: genderTerm = "woman"; break;
        case AIGender.NON_BINARY: genderTerm = "non-binary person"; break;
        case AIGender.RANDOM: genderTerm = "person with an androgynous appearance"; break;
    }

    const ageVisualCue = getAgeVisualDescriptionForImagen(aiAgeBracket, customAiAge);
		const cultureVisualCue = aiCulture ? `${aiCulture},` : "";
    const cleanedBodyLanguage = this.cleanAiDialogue(bodyLanguageDescription);
    const noTextLogosInstructionGlobal = "Ensure no text, letters, words, logos, or watermarks appear in the generated image.";

    let currentEstablishedVisualBase: string;
    let newSegmentForReturn: string | null = null;

    if (!existingEstablishedVisualSegment) {
      const createdBaseSegment = `Photorealistic portrait of a ${cultureVisualCue} ${ageVisualCue} ${genderTerm} who embodies the character ${aiName}, wearing simple neutral-colored attire (like a dark gray t-shirt or simple blue sweater). The background is simple and neutral, slightly out of focus, with soft natural lighting. The shot is typically chest-up. ${noTextLogosInstructionGlobal}`;
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
  ): Promise<AiTurnResponse> {
      const historyForPrompt = conversationHistory
          .slice(-MAX_CONVERSATION_HISTORY_FOR_PROMPT)
          .map(m => `  - ${m.sender === 'user' ? 'User' : scenario.aiName}: "${m.text}" ${m.sender === 'ai' && m.bodyLanguageDescription ? `(Body Language: ${m.bodyLanguageDescription})` : ''}`)
          .join('\n');

      const customContextPrompt = scenario.customContext ? `\n- Custom Scenario Details: ${scenario.customContext}` : "";
      const agePromptSegment = `\n- AI Age: ${getAgeDescriptionForLLM(scenario.aiAgeBracket, scenario.customAiAge)}`;
      const personalityPromptSegment = getPersonalityPromptSegment(scenario.aiPersonalityTraits, scenario.customAiPersonality);
      const goalPrompt = scenario.conversationGoal ? `\n- Stated User Goal: "${scenario.conversationGoal}". You should react to how the user progresses towards this goal.` : `\n- Stated User Goal: None specified. Determine if a goal emerges from the conversation.`;
			const customEnvPrompt = scenario.environment === SocialEnvironment.CUSTOM && scenario.customEnvironment ? `\n- Custom Environment Details: ${scenario.customEnvironment}` : "";
			const culturePrompt = scenario.aiCulture ? `\n- AI Culture/Race Nuances: "${scenario.aiCulture}".` : "";

      const prompt = `You are role-playing as an AI named ${scenario.aiName}. Maintain your persona consistently.
      
      Your Persona & Scenario:
      - AI Name: ${scenario.aiName}
      - AI Gender: ${scenario.aiGender}
      - Environment: ${scenario.environment}${customEnvPrompt}${personalityPromptSegment}${culturePrompt}${agePromptSegment}${customContextPrompt}${goalPrompt}
      
      Current State:
      - Your current engagement level with the user is ${currentEngagement} out of 100.
      
      Recent Conversation History:
      ${historyForPrompt}
      
      The user has just said: "${userInput}"
      
      Your Task:
      Analyze the user's message and generate your response. Your entire output must be a single, valid JSON object.
      1.  **Analyze User Input**: Based on your persona and the context, analyze the user's message for tone, relevance, and effectiveness.
      2.  **Determine Your Reaction**: Decide how your character, ${scenario.aiName}, would react.
      3.  **Generate Response**:
          - \`aiDialogue\`: Write your response. It MUST be natural and in character. Do NOT break character or sound like a generic assistant.
          - \`aiBodyLanguage\`: Describe your new body language.
          - \`aiThoughts\`: Provide your internal monologue. What are you *really* thinking about the user's message and the conversation's direction? Be candid.
      4.  **Calculate Metrics**:
          - \`engagementDelta\`: How much did the user's message change your engagement? Provide an integer between -30 and +30. A boring or offensive message gets a negative delta. An engaging, insightful, or charismatic message gets a positive one.
          - \`userTurnEffectivenessScore\`: Score the user's last message from 0-100 on how well it fit the social context, was engaging, and moved the conversation forward.
          - \`conversationMomentum\`: A score (0-100) indicating the conversation's current energy. If the user's turn was good, it should increase from the last AI turn's momentum. If bad, it should decrease.
          - \`positiveTraitContribution\` (optional): If the user displayed a clear positive social trait (e.g., "Empathetic", "Witty", "Curious"), name it.
          - \`negativeTraitContribution\` (optional): If the user displayed a clear negative social trait (e.g., "Dismissive", "Awkward", "Arrogant"), name it.
      5.  **Goal Tracking**:
          - \`emergingGoal\` (optional): If no goal was stated initially, but one has clearly emerged from the conversation (e.g., user is trying to ask you out), describe it briefly.
          - \`goalProgress\`: An integer (0-100) estimating the user's progress towards their stated or emerging goal.
          - \`achieved\`: A boolean (true/false) indicating if the goal has been fully achieved.
      6.  **End Condition**:
          - \`isEndingConversation\`: Set to \`true\` only if your character has a strong reason to end the conversation (e.g., they are offended, bored, the interaction has reached a natural conclusion). Otherwise, \`false\`.
          
      Output ONLY a single, valid JSON object with the following structure. Do not add any text before or after the JSON.
      {
        "aiDialogue": "...",
        "aiBodyLanguage": "...",
        "aiThoughts": "...",
        "engagementDelta": number,
        "userTurnEffectivenessScore": number,
        "conversationMomentum": number,
        "positiveTraitContribution": "string",
        "negativeTraitContribution": "string",
        "isEndingConversation": boolean,
        "emergingGoal": "string",
        "goalProgress": number,
        "achieved": boolean
      }`;

      try {
          const response: GenerateContentResponse = await this.ai.models.generateContent({
              model: GEMINI_TEXT_MODEL,
              contents: [{role: "user", parts: [{text: prompt}]}],
              config: { responseMimeType: "application/json" }
          });
          const parsed = this.parseJsonFromText<AiTurnResponse>(response.text ?? '{}');
          if (parsed && typeof parsed.aiDialogue === 'string') {
              return parsed;
          }
          console.error("Failed to parse AI turn data from Gemini, using fallback.", response.text);
          return {
              aiDialogue: "I'm not sure how to respond to that.",
              aiBodyLanguage: "Looks confused.",
              aiThoughts: "The model response failed to parse. I need to give a generic answer.",
              engagementDelta: -5,
              userTurnEffectivenessScore: 20,
              conversationMomentum: currentEngagement - 5,
              isEndingConversation: false,
              goalProgress: 0,
              achieved: false,
          };
      } catch (error) {
          const errorMessage = getGoogleApiErrorMessage(error, "Failed to get AI response.");
          console.error("Error getting next AI turn from Gemini:", errorMessage, error);
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
          .map(m => {
              let entry = `{"sender": "${m.sender === 'user' ? 'User' : scenario.aiName}", "message": "${m.text}"`;
              if (m.sender === 'ai') {
                  if (m.bodyLanguageDescription) entry += `, "bodyLanguage": "${m.bodyLanguageDescription}"`;
                  if (m.aiThoughts) entry += `, "internalThoughts": "${m.aiThoughts}"`;
              } else {
                  if (typeof m.userTurnEffectivenessScore === 'number') entry += `, "effectivenessScore": ${m.userTurnEffectivenessScore}`;
                  if (typeof m.engagementDelta === 'number') entry += `, "engagementImpact": ${m.engagementDelta}`;
              }
              entry += '}';
              return entry;
          })
          .join(',\n');
      
      const customContextPrompt = scenario.customContext ? `\n- Custom Scenario Details: ${scenario.customContext}` : "";
      const agePromptSegment = `\n- AI Age: ${getAgeDescriptionForLLM(scenario.aiAgeBracket, scenario.customAiAge)}`;
      const personalityPromptSegment = getPersonalityPromptSegment(scenario.aiPersonalityTraits, scenario.customAiPersonality);
      const goalPrompt = scenario.conversationGoal ? `\n- Stated User Goal: "${scenario.conversationGoal}".` : "";

      const prompt = `You are an expert social skills analyst. Your task is to provide a detailed performance report based on a simulated conversation.
      
      Scenario Details:
      - Environment: ${scenario.environment}
      - AI Persona: ${scenario.aiName}, a ${scenario.aiGender} character. ${personalityPromptSegment}${agePromptSegment}${customContextPrompt}${goalPrompt}
      - Final Engagement Score: ${finalEngagement}/100
      
      Conversation History (JSON format):
      [
      ${historyForAnalysis}
      ]
      
      Task:
      Analyze the entire conversation and generate a comprehensive report. Your response must be a single, valid JSON object.
      
      1.  **Overall Scores (0-100)**:
          - \`overallCharismaScore\`: User's charm, confidence, and likability.
          - \`responseClarityScore\`: How clear, concise, and easy to understand the user's messages were.
          - \`engagementMaintenanceScore\`: User's ability to keep the conversation interesting and maintain the AI's engagement.
          - \`adaptabilityScore\`: How well the user adapted to the AI's personality and the flow of conversation.
          - \`goalAchievementScore\` (optional): If a goal was present, how well the user progressed towards and achieved it.
      2.  **Qualitative Feedback**:
          - \`strengths\`: A paragraph highlighting what the user did well (e.g., "You showed great empathy by..."). Be specific.
          - \`areasForImprovement\`: A paragraph on what could be improved (e.g., "Your questions were often closed-ended...").
          - \`actionableTips\`: Bullet points with concrete, actionable advice for future interactions.
          - \`thingsToAvoid\`: Bullet points on specific behaviors or phrases the user should avoid.
          - \`goalAchievementFeedback\` (optional): If a goal was present, provide specific feedback on their strategy and execution.
      3.  **AI Perspective**:
          - \`aiEvolvingThoughtsSummary\`: A summary of how the AI's internal thoughts and perception of the user changed over time.
      4.  **Turn-by-Turn Breakdown**:
          - \`turnByTurnAnalysis\`: An array of objects, one for each user+AI exchange. For each item, include the AI's response/thoughts and then the user's input and a brief analysis of that input.
          
      JSON Structure for your response:
      {
        "overallCharismaScore": number,
        "responseClarityScore": number,
        "engagementMaintenanceScore": number,
        "adaptabilityScore": number,
        "goalAchievementScore": number,
        "finalEngagementSnapshot": ${finalEngagement},
        "strengths": "string",
        "areasForImprovement": "string",
        "actionableTips": "string",
        "thingsToAvoid": "string",
        "goalAchievementFeedback": "string",
        "aiEvolvingThoughtsSummary": "string",
        "turnByTurnAnalysis": [
          {
            "aiResponse": "string",
            "aiBodyLanguage": "string",
            "aiThoughts": "string",
            "conversationMomentum": number,
            "userInput": "string",
            "userTurnEffectivenessScore": number,
            "engagementDelta": number,
            "positiveTraitContribution": "string",
            "negativeTraitContribution": "string",
            "analysis": "Brief analysis of the user's turn."
          }
        ]
      }`;
      
      try {
          const response: GenerateContentResponse = await this.ai.models.generateContent({
              model: GEMINI_TEXT_MODEL,
              contents: [{role: "user", parts: [{text: prompt}]}],
              config: { responseMimeType: "application/json" }
          });
          const parsed = this.parseJsonFromText<AnalysisReport>(response.text ?? '{}');
          if (parsed && typeof parsed.overallCharismaScore === 'number') {
              return parsed;
          }
          console.error("Failed to parse analysis report from Gemini.", response.text);
          throw new Error("Could not parse the analysis report from the AI.");

      } catch (error) {
          const errorMessage = getGoogleApiErrorMessage(error, "Failed to generate analysis report.");
          console.error("Error analyzing conversation with Gemini:", errorMessage, error);
          throw new Error(errorMessage);
      }
  }
}
