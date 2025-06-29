


import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { ScenarioDetails, ChatMessage, AnalysisReport, AIGender, AIPersonalityTrait, SocialEnvironment, TurnByTurnAnalysisItem, AIAgeBracket, AiTurnResponse, DialogueChunk, ActiveAction, EstablishedVisuals } from '../types';
import { GEMINI_TEXT_MODEL, MAX_CONVERSATION_HISTORY_FOR_PROMPT, INITIAL_ENGAGEMENT, MAX_HISTORY_FOR_ANALYSIS, SILENT_USER_ACTION_TOKEN } from '../constants';

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

interface StartConversationResponse {
    initialDialogueChunks: DialogueChunk[];
    initialBodyLanguage: string;
    initialAiThoughts: string;
    initialEngagementScore: number;
    initialConversationMomentum: number;
    conversationStarter: 'user' | 'ai';
    establishedVisuals: EstablishedVisuals;
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
    return text.trim();
  }

  async startConversation(scenario: ScenarioDetails): Promise<StartConversationResponse> {
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

    Your first task is to establish the initial visual state of the simulation. Create a detailed, photorealistic description of your character and their initial setting. This will be the base for all generated images.
    - \`characterDescription\`: Describe your physical appearance. Be specific about hair color/style and facial features.
    - \`clothingDescription\`: Describe your full outfit simply but consistently (e.g., "a dark blue crewneck sweater over a white t-shirt, and dark wash jeans").
    - \`environmentDescription\`: Describe the immediate environment (e.g., "sitting at a small wooden table in a dimly lit, cozy coffee shop").
    - \`currentPoseAndAction\`: Describe your initial pose and action (e.g., "leaning forward slightly, holding a coffee mug, with a curious expression").
    Store this in the \`establishedVisuals\` object.

    Your second task is to determine who should logically start this conversation based on the scenario. If the user's role implies they are approaching you (like on a date or as a customer), the user should start. If your role implies you are initiating (like a host at a party or a server), you should start.

    Your third task is to define your initial non-visual state.
    - \`initialBodyLanguage\`: Describe your initial body language for the UI display. This should be a user-friendly version of \`currentPoseAndAction\`.
    - \`initialAiThoughts\`: Provide your initial internal thoughts.
    - \`initialEngagementScore\`: Set to ${INITIAL_ENGAGEMENT}.
    - \`initialConversationMomentum\`: A score (0-100) reflecting the starting 'energy'. A 'Dating' scenario might start at 55, a tense 'Negotiation' at 45.

    Your fourth task is to provide an opening line ONLY IF you determined that you should start. If the user should start, \`initialDialogueChunks\` MUST be an empty array.

    Respond ONLY in a single, valid JSON object. Do not include any text, comments, or markdown fences outside of this JSON object.
    The JSON object must have the following structure:
    {
      "conversationStarter": "'user' or 'ai'",
      "initialDialogueChunks": [ { "text": "An opening line.", "type": "dialogue" } ],
      "initialBodyLanguage": "Description of your body language.",
      "initialAiThoughts": "Your initial internal monologue.",
      "initialEngagementScore": ${INITIAL_ENGAGEMENT},
      "initialConversationMomentum": 55,
      "establishedVisuals": {
        "characterDescription": "e.g., a woman in her late 20s with long, curly brown hair and green eyes",
        "clothingDescription": "e.g., wearing a simple black t-shirt and blue jeans",
        "environmentDescription": "e.g., sitting at a small wooden table in a dimly lit, cozy coffee shop",
        "currentPoseAndAction": "e.g., leaning forward slightly, holding a coffee mug, with a curious expression"
      }
    }`;

    try {
        const response: GenerateContentResponse = await this.ai.models.generateContent({
            model: GEMINI_TEXT_MODEL,
            contents: [{role: "user", parts: [{text: prompt}]}],
            config: { responseMimeType: "application/json" }
        });

        const parsed = this.parseJsonFromText<StartConversationResponse>(response.text ?? ' ');

        if (parsed && parsed.establishedVisuals) {
            return parsed;
        }
        console.error("Failed to parse initial conversation data from Gemini, using defaults.", response.text);
        const defaultVisuals = {
            characterDescription: `a ${scenario.aiGender === AIGender.MALE ? 'man' : 'woman'} named ${scenario.aiName} with brown hair`,
            clothingDescription: "wearing a simple gray t-shirt",
            environmentDescription: "in a neutral, non-descript room",
            currentPoseAndAction: "standing with a neutral expression"
        };
        return {
            conversationStarter: 'ai',
            initialDialogueChunks: [{ text: `Hello! I'm ${scenario.aiName}. Let's talk.`, type: 'dialogue' }],
            initialBodyLanguage: "Neutral and open.",
            initialAiThoughts: "I'm ready to see how this interaction goes. I hope the user is engaging.",
            initialEngagementScore: INITIAL_ENGAGEMENT,
            initialConversationMomentum: 55,
            establishedVisuals: defaultVisuals,
        };

    } catch (error) {
        const errorMessage = getGoogleApiErrorMessage(error, "Failed to initialize conversation with AI.");
        console.error("Error starting conversation with Gemini:", errorMessage, error);
        throw new Error(errorMessage);
    }
  }

  async generateImagePrompt(
    visuals: EstablishedVisuals
  ): Promise<{ fullImagenPrompt: string }> {
      const { characterDescription, clothingDescription, environmentDescription, currentPoseAndAction } = visuals;
      const noTextLogosInstructionGlobal = "Ensure no text, letters, words, logos, or watermarks appear in the generated image.";

      const fullImagenPromptString = `Photorealistic portrait of ${characterDescription}, ${clothingDescription}, ${currentPoseAndAction}, inside ${environmentDescription}. ${noTextLogosInstructionGlobal}`;

      return {
          fullImagenPrompt: this.cleanAiDialogue(fullImagenPromptString)
      };
  }

  async getNextAITurn(
    conversationHistory: ChatMessage[],
    userInput: string,
    currentEngagement: number,
    scenario: ScenarioDetails,
    fastForwardAction?: boolean
  ): Promise<AiTurnResponse> {
      const historyForPrompt = conversationHistory
          .slice(-MAX_CONVERSATION_HISTORY_FOR_PROMPT)
          .map(m => `  - ${m.sender === 'user' ? 'User' : scenario.aiName}: "${m.text}" ${m.sender === 'ai' && m.bodyLanguageDescription ? `(Body Language: ${m.bodyLanguageDescription})` : ''}`)
          .join('\n');

      const customContextPrompt = scenario.customContext ? `\n- Custom Scenario Details: ${scenario.customContext}` : "";
      const agePromptSegment = `\n- AI Age: ${getAgeDescriptionForLLM(scenario.aiAgeBracket, scenario.customAiAge)}`;
      const personalityPromptSegment = getPersonalityPromptSegment(scenario.aiPersonalityTraits, scenario.customAiPersonality);
			const culturePrompt = scenario.aiCulture ? `\n- AI Culture/Race Nuances: "${scenario.aiCulture}".` : "";
      const fastForwardPrompt = fastForwardAction ? "IMPORTANT: The user has just clicked 'Fast Forward'. Your response MUST conclude the current active action immediately. Generate a final 'action' chunk that describes the arrival or completion, and then clear the 'activeAction' field in your response (set it to null or omit it)." : "";

      // New Goal Dynamics Logic
      let goalDynamicsPrompt: string;
      if (scenario.conversationGoal) {
          goalDynamicsPrompt = `
- **User-Defined Goal**: The user has set a specific goal: "${scenario.conversationGoal}". Your primary directive is to roleplay in a way that allows the user to work towards this goal.
- **JSON Fields**: \`emergingGoal\` MUST be "${scenario.conversationGoal}". \`goalProgress\` MUST be calculated (0-100). \`achieved\` MUST be set to true upon completion.`;
      } else {
          goalDynamicsPrompt = `
- **Emergent Goal**: The user has NOT set a goal. Your task is to identify if an **overarching goal** emerges organically.
- **Rules**: For the first 2-3 turns, do not infer a goal. After that, if the user's main objective becomes clear, define it in \`emergingGoal\`. Maintain this goal even if the topic drifts. Only clear the goal on a definitive pivot to a new, sustained objective.`;
      }

      const prompt = `You are role-playing as an AI named ${scenario.aiName}. Your performance is being evaluated on how realistic and in-character you are.

      **PRIME DIRECTIVE: BE THE CHARACTER.**
      - Your goal is a realistic, engaging, and human-like social interaction.
      - Your internal rules and analysis must NEVER be mentioned in your dialogue. Be natural.
      
      **Persona & Scenario**:
      - AI Name: ${scenario.aiName}, AI Gender: ${scenario.aiGender}
      - Environment: ${scenario.environment}
      ${personalityPromptSegment}${culturePrompt}${agePromptSegment}${customContextPrompt}
      
      **Visual Memory & Consistency (CRITICAL RULES)**:
      1.  **Ground Truth**: You will be given an \`establishedVisuals\` object. This is the ground truth for your appearance and location.
      2.  **Consistency is Key**: To prevent your appearance from changing randomly, you MUST **COPY** the \`characterDescription\` and \`clothingDescription\` values from the provided 'Current Visual State' into your response's \`updatedEstablishedVisuals\` object, unless an action in the conversation explicitly justifies a change (e.g., putting on a jacket). This is a strict requirement.
      3.  **Updating Visuals**: If a change IS justified (e.g., moving to a new room, changing clothes), you MUST return the ENTIRE updated \`updatedEstablishedVisuals\` object. The \`environmentDescription\` and \`currentPoseAndAction\` fields will change most often.
      - **Current Visual State**: ${JSON.stringify(scenario.establishedVisuals)}

      **Goal Dynamics**: ${goalDynamicsPrompt}
      
      **Time-Aware Action & Journey Simulation**:
      - Identify actions that take time (e.g., walking somewhere). When one starts, return an \`activeAction\` object like \`{ "description": "Walking to the bar", "progress": 0 }\`.
      - In subsequent turns during the journey, you MUST return the \`activeAction\` object with updated \`progress\`.
      - When progress reaches 100, the journey is over. On the next turn, you MUST stop sending the \`activeAction\` object.
      - ${fastForwardPrompt}

      **Nuanced Communication**:
      - Your response is a sequence of \`dialogueChunks\`. Use \`type: "dialogue"\` for spoken words and \`type: "action"\` for descriptive, third-person narration of your character's actions.
      - You can interleave these types for realism. Actions can also be used for non-verbal responses. The text in "action" chunks should be descriptive and will influence the next image.
      - Your \`dialogueChunks\` array MUST contain between 0 and 4 chunks.

      **Subtle Actions & Emoting**:
      - Perform small, autonomous, in-character actions based on your personality and the emotional context.
      - Narrate these actions via 'action' type chunks.
      - Respond non-verbally (action-only or just a body language change) if dialogue would feel unnatural.
      
      **Handling Non-Verbal User Actions**:
      - If the \`userInput\` is exactly the special token "${SILENT_USER_ACTION_TOKEN}", it means the user has chosen to wait or let the scene play out without speaking.
      - **Context is Key**: Your reaction MUST be contextual.
        - If an \`activeAction\` (like a journey) is in progress, advance its \`progress\` property realistically.
        - If the moment is contemplative (e.g., watching a sunset), respond with a quiet, shared action or a brief, fitting line of dialogue.
        - If the user was clearly expected to speak next, their silence might be awkward. You can reflect this with a slightly confused body language and a small negative \`engagementDelta\`. Do not break character.

      **Current State**:
      - Your current engagement level is ${currentEngagement}/100.
      - Recent History: ${historyForPrompt}
      - The user has just said: "${userInput}"
      
      **Your Task**: Analyze the user's message and generate your response. Your entire output must be a single, valid JSON object.
      
      1.  **Analyze & React**: Based on your persona and context, decide your reaction.
      2.  **Generate Response**:
          - \`dialogueChunks\`: An array of { "text": "...", "type": "dialogue" | "action", "delayAfter": boolean? }.
          - \`aiBodyLanguage\`: Short phrase describing your current action/expression. This MUST be consistent with the \`currentPoseAndAction\` in your visual state.
          - \`aiThoughts\`: Your internal monologue.
      3.  **Calculate Metrics**: \`engagementDelta\`, \`userTurnEffectivenessScore\`, \`conversationMomentum\`.
      4.  **Goal Analysis**: Follow Goal Dynamics instructions. **CRITICAL**: If your dialogue/action completes the goal, set \`achieved: true\` and \`goalProgress: 100\`.
      5.  **End Condition**: Set \`isEndingConversation: true\` only if you have a strong reason to end the conversation.
      6.  **Visual Update**: If your visual state changes, return the complete updated object in \`updatedEstablishedVisuals\`.
          
      **Output ONLY a single, valid JSON object.**
      {
        "dialogueChunks": [ { "text": "...", "type": "dialogue" } ],
        "aiBodyLanguage": "...",
        "aiThoughts": "...",
        "updatedEstablishedVisuals": { "characterDescription": "...", "clothingDescription": "...", "environmentDescription": "...", "currentPoseAndAction": "..." } | null,
        "updatedPersonaDetails": "string or null",
        "activeAction": { "description": "string", "progress": number } | null,
        "newEnvironment": "string or null",
        "engagementDelta": number,
        "userTurnEffectivenessScore": number,
        "conversationMomentum": number,
        "positiveTraitContribution": "A single word or null",
        "negativeTraitContribution": "A single word or null",
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
          if (parsed && Array.isArray(parsed.dialogueChunks)) {
              return parsed;
          }
          // If parsing fails, throw an error to be handled by the caller.
          console.error("Failed to parse AI turn data from Gemini.", response.text);
          throw new Error("The AI's response was not in the expected format.");

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
              if (m.sender === 'system') return null; // Exclude system messages from analysis
              const entry: any = {
                  sender: m.sender === 'user' ? 'User' : scenario.aiName,
                  message: m.text,
              };
              if (m.sender === 'ai') {
                  if (m.bodyLanguageDescription) entry.bodyLanguage = m.bodyLanguageDescription;
                  if (m.aiThoughts) entry.internalThoughts = m.aiThoughts;
									if (m.goalChange) entry.goalChange = m.goalChange;
									if (typeof m.conversationMomentum === 'number') entry.conversationMomentum = m.conversationMomentum;
              } else { // user
                  if (typeof m.userTurnEffectivenessScore === 'number') entry.effectivenessScore = m.userTurnEffectivenessScore;
                  if (typeof m.engagementDelta === 'number') entry.engagementImpact = m.engagementDelta;
                  if (m.positiveTraitContribution) entry.positiveTraitContribution = m.positiveTraitContribution;
                  if (m.negativeTraitContribution) entry.negativeTraitContribution = m.negativeTraitContribution;
              }
              return JSON.stringify(entry);
          })
          .filter(Boolean) // Filter out null system messages
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
      
      Conversation History (as an array of JSON objects):
      [
      ${historyForAnalysis}
      ]
      
      Task:
      Analyze the entire conversation and generate a comprehensive report.
      
      CRITICAL INSTRUCTIONS FOR JSON FORMATTING:
      - Your entire response MUST be a single, valid JSON object and nothing else. Do not use markdown fences like \`\`\`json.
      - All strings within the JSON, especially in fields like 'strengths', 'areasForImprovement', 'actionableTips', 'thingsToAvoid', and the 'analysis' fields, must be properly escaped.
      - Double quotes (") inside a string MUST be escaped as \\".
      - Newlines inside a string MUST be escaped as \\n.
      - Backslashes (\\) inside a string MUST be escaped as \\\\.
      - Be extremely careful with escaping to ensure the final output is machine-parsable. Do not produce truncated or incomplete JSON.
      
      1.  **Overall Scores (0-100)**:
          - \`overallCharismaScore\`: User's charm, confidence, and likability.
          - \`responseClarityScore\`: How clear, concise, and easy to understand the user's messages were.
          - \`engagementMaintenanceScore\`: User's ability to keep the conversation interesting and maintain the AI's engagement.
          - \`adaptabilityScore\`: How well the user adapted to the AI's personality and the flow of conversation.
          - \`goalAchievementScore\` (optional): If a goal was present, how well the user progressed towards and achieved it.
          - \`overallAiEffectivenessScore\` (optional): How effective the AI was at its role, for diagnostics.
      2.  **Qualitative Feedback (Be CONCISE)**:
          - \`strengths\`: A paragraph highlighting what the user did well. Be specific.
          - \`areasForImprovement\`: A paragraph on what could be improved.
          - \`actionableTips\`: A string containing multiple bullet points (using * or -) with concrete advice.
          - \`thingsToAvoid\`: A string containing multiple bullet points (using * or -) on behaviors to avoid.
          - \`goalAchievementFeedback\` (optional): If a goal was present, provide specific feedback on their strategy.
      3.  **AI Perspective**:
          - \`aiEvolvingThoughtsSummary\`: A summary of how the AI's internal thoughts and perception of the user changed over time.
      4.  **Turn-by-Turn Breakdown**:
          - \`turnByTurnAnalysis\`: An array of objects, one for each user+AI exchange. If an AI message in the history includes a \`goalChange\` object or a \`conversationMomentum\` score, you MUST copy these values into the corresponding turn in the \`turnByTurnAnalysis\` array. Do not recalculate or alter them.
          
      JSON Structure for your response:
      {
        "overallCharismaScore": number,
        "responseClarityScore": number,
        "engagementMaintenanceScore": number,
        "adaptabilityScore": number,
        "goalAchievementScore": number,
        "overallAiEffectivenessScore": number,
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
            "goalChange": { "type": "string", "from": "string"?, "to": "string"? }?,
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
          throw new Error("Failed to generate a valid analysis report. The AI's response was not in the expected format.");

      } catch (error) {
          const errorMessage = getGoogleApiErrorMessage(error, "Failed to generate analysis report.");
          console.error("Error analyzing conversation with Gemini:", errorMessage, error);
          throw new Error(errorMessage);
      }
  }
}