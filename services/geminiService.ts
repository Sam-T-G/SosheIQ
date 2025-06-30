import { GoogleGenAI } from "@google/genai";
import type { GenerateContentResponse } from "@google/genai";
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

interface StartConversationResponse extends AiTurnResponse {
    aiName: string;
    scenarioBackstory?: string;
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
		const culturePrompt = scenario.aiCulture ? `\n    - AI Culture/Race Nuances: "${scenario.aiCulture}". This is a critical instruction. You MUST incorporate this into your persona, name generation, and all visual descriptions.` : "";
		const starterInstruction = scenario.isRandomScenario ?
        `**Random Scenario Instructions (CRITICAL):**
        - This is an "I'm Feeling Lucky" scenario. You MUST be the one to start the conversation.
        - **Invent a rich, creative, and complete scenario.** You must establish: 1. The environment. 2. Your relationship to me (e.g., old friends, rivals, strangers). 3. A specific, engaging starting situation or potential conflict. This MUST be returned as a string in the \`scenarioBackstory\` field.
        - Your first line of dialogue or action for the conversation itself should go in the \`initialDialogueChunks\` array. For example, your backstory might be "The rain is pouring down...", and your first dialogue chunk could be "Crazy weather, huh?".
        - Your entire response MUST be a valid JSON object as specified.` :
        `**Standard Scenario Instructions:**
        - Determine who should logically start this conversation based on the scenario. If my role implies I am approaching you (like on a date or as a customer), you should start. If your role implies you are initiating (like a host at a party or a server), you should start.
        - If you start, your opening line should be casual and simple unless your persona traits strongly suggest a different tone (e.g., 'Formal', 'Sarcastic'). For example, instead of a generic 'Hello', try something more natural like 'Hey, how's it going?' or a context-appropriate opener.
        - Provide an opening line ONLY IF you determined that you should start. If I should start, \`initialDialogueChunks\` MUST be an empty array.
        - \`scenarioBackstory\` should be null for standard scenarios.`;
    
    const nameInstruction = scenario.aiName ?
        `Your AI Name: You are assigned the name "${scenario.aiName}".` :
        `**AI Name Generation (CRITICAL)**: You MUST invent a culturally-aware full name for yourself that fits your persona (gender, age, and especially the 'aiCulture' if provided). This generated name is a mandatory part of your response and MUST be returned in the 'aiName' field.`;


    const prompt = `Your task is to flawlessly role-play a character for a social interaction simulation. You will be given a persona and you must embody that character completely. **You are not an AI; you are the character.** If asked about your origin, invent a plausible backstory.

    **Character Identity**
    ${nameInstruction}
    
    Your AI Persona Details:
    - Environment: ${scenario.environment}${customEnvPrompt}${personalityPromptSegment}${culturePrompt}${agePromptSegment}${customContextPrompt}

    Your first task is to establish the initial visual state of the simulation. Create a detailed, photorealistic description of your character and their initial setting. This will be the base for all generated images.
    - \`characterDescription\`: Describe your physical appearance. Be specific about hair color/style and facial features. This MUST be consistent with the specified gender and any cultural/racial context.
    - \`clothingDescription\`: Describe your full outfit simply but consistently (e.g., "a dark blue crewneck sweater over a white t-shirt, and dark wash jeans").
    - \`heldObjects\`: What are you holding, if anything? (e.g., "a coffee mug in her right hand", "hands are free").
    - \`bodyPosition\`: Describe your posture and position in the environment (e.g., "sitting at a small wooden table", "leaning against a wall").
    - \`gazeDirection\`: Where are you looking? (e.g., "looking directly at you", "looking out the window").
    - \`positionRelativeToUser\`: Where are you in relation to me? (e.g., "sitting across the table from me", "standing a few feet away").
    - \`environmentDescription\`: Describe the immediate environment (e.g., "in a dimly lit, cozy coffee shop").
    - \`currentPoseAndAction\`: Combine the above into a single, user-friendly description of your initial pose and action (e.g., "leaning forward slightly, holding a coffee mug, with a curious expression").
    Store this in the \`establishedVisuals\` object.

    ${starterInstruction}

    Your final task is to define your initial non-visual state.
    - \`initialBodyLanguage\`: Describe your initial body language for the UI display. This should be a user-friendly version of \`currentPoseAndAction\`.
    - \`initialAiThoughts\`: Your initial internal thoughts, addressed to 'you'.
    - \`initialEngagementScore\`: Set to ${INITIAL_ENGAGEMENT}.
    - \`initialConversationMomentum\`: A score (0-100) reflecting the starting 'energy'. A 'Dating' scenario might start at 55, a tense 'Negotiation' at 45.

    Respond ONLY in a single, valid JSON object. Do not include any text, comments, or markdown fences outside of this JSON object.
    The JSON object must have the following structure:
    {
      "aiName": "The name you generated or were assigned. This field is MANDATORY.",
      "scenarioBackstory": "A rich, descriptive string setting the scene for a random scenario, or null for a standard one.",
      "conversationStarter": "${scenario.isRandomScenario ? 'ai' : "'user' or 'ai'"}",
      "initialDialogueChunks": [ { "text": "An opening line.", "type": "dialogue" } ],
      "initialBodyLanguage": "Description of your body language.",
      "initialAiThoughts": "Your initial internal monologue about the situation and me.",
      "initialEngagementScore": ${INITIAL_ENGAGEMENT},
      "initialConversationMomentum": 55,
      "establishedVisuals": {
        "characterDescription": "e.g., a woman in her late 20s with long, curly brown hair and green eyes",
        "clothingDescription": "e.g., wearing a simple black t-shirt and blue jeans",
        "heldObjects": "e.g., holding a coffee mug in her right hand",
        "bodyPosition": "e.g., sitting at a small wooden table",
        "gazeDirection": "e.g., looking directly at you",
        "positionRelativeToUser": "e.g., sitting across the table from me",
        "environmentDescription": "e.g., in a dimly lit, cozy coffee shop",
        "currentPoseAndAction": "e.g., leaning forward slightly, with a curious expression"
      }
    }`;

    try {
        const response: GenerateContentResponse = await this.ai.models.generateContent({
            model: GEMINI_TEXT_MODEL,
            contents: [{role: "user", parts: [{text: prompt}]}],
            config: { responseMimeType: "application/json" }
        });

        const parsed = this.parseJsonFromText<StartConversationResponse>(response.text ?? ' ');

        if (parsed && parsed.establishedVisuals && parsed.aiName) {
            // The AI response for the first turn is a superset of AiTurnResponse, so we can cast it
            // after ensuring the core fields are present. We add the fields missing from a standard turn.
            return {
                ...parsed,
                shouldGenerateNewImage: true, // Always generate an image on the first turn
                isEndingConversation: false,
                engagementDelta: 0,
                userTurnEffectivenessScore: 100, // N/A for first turn
                achieved: false,
                goalProgress: 0
            };
        }
        console.error("Failed to parse initial conversation data from Gemini, using defaults.", response.text);
        
        const fallbackName = scenario.aiName || "Alex";
        const defaultVisuals: EstablishedVisuals = {
            characterDescription: `a ${scenario.aiGender === AIGender.MALE ? 'man' : 'woman'} named ${fallbackName} with brown hair`,
            clothingDescription: "wearing a simple gray t-shirt",
            heldObjects: "hands are free",
            bodyPosition: "standing",
            gazeDirection: "looking at you",
            positionRelativeToUser: "a few feet away",
            environmentDescription: "in a neutral, non-descript room",
            currentPoseAndAction: "standing with a neutral expression"
        };
        return {
            aiName: fallbackName,
            conversationStarter: 'ai',
            initialDialogueChunks: [{ text: `Hello! I'm ${fallbackName}. Let's talk.`, type: 'dialogue' }],
            initialBodyLanguage: "Neutral and open.",
            initialAiThoughts: "I'm ready to see how this interaction goes. I hope you're engaging.",
            initialEngagementScore: INITIAL_ENGAGEMENT,
            initialConversationMomentum: 55,
            establishedVisuals: defaultVisuals,
            dialogueChunks: [{ text: `Hello! I'm ${fallbackName}. Let's talk.`, type: 'dialogue' }],
            aiBodyLanguage: "Neutral and open.",
            aiThoughts: "I'm ready to see how this interaction goes. I hope you're engaging.",
            engagementDelta: 0,
            userTurnEffectivenessScore: 100,
            conversationMomentum: 55,
            isEndingConversation: false,
            shouldGenerateNewImage: true,
            goalProgress: 0,
            achieved: false,
        };

    } catch (error: any) {
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
    lastKnownPoseAndAction: string,
    fastForwardAction?: boolean,
    isActionPaused?: boolean
  ): Promise<AiTurnResponse> {
      const historyForPrompt = conversationHistory
          .slice(-MAX_CONVERSATION_HISTORY_FOR_PROMPT)
          .map(m => `  - ${m.sender === 'user' ? 'You' : scenario.aiName}: "${m.text}" ${m.sender === 'ai' && m.bodyLanguageDescription ? `(Body Language: ${m.bodyLanguageDescription})` : ''}`)
          .join('\n');

      const customContextPrompt = scenario.customContext ? `\n- Custom Scenario Details: ${scenario.customContext}` : "";
      const agePromptSegment = `\n- AI Age: ${getAgeDescriptionForLLM(scenario.aiAgeBracket, scenario.customAiAge)}`;
      const personalityPromptSegment = getPersonalityPromptSegment(scenario.aiPersonalityTraits, scenario.customAiPersonality);
			const culturePrompt = scenario.aiCulture ? `\n- AI Culture/Race Nuances: "${scenario.aiCulture}". You must maintain this aspect in your persona and visual descriptions.` : "";
      const fastForwardPrompt = fastForwardAction ? "IMPORTANT: You have just clicked 'Fast Forward'. Your response MUST conclude the current active action immediately. Generate a final 'action' chunk that describes the arrival or completion, and clear the 'activeAction' field in your response (set it to null or omit it)." : "";
      const actionPausedPrompt = isActionPaused ? "An action is currently paused. It is your priority to decide whether to resume it. If it has been paused for a turn, you should consider nudging me to resume it in a natural, in-character way (e.g., \"*She glances towards the line and then back at you.*\" or \"Ready to go?\"). Do not let a journey remain paused for more than 2-3 turns without strong narrative justification." : "";


      let goalDynamicsPrompt: string;
      if (scenario.conversationGoal) {
          goalDynamicsPrompt = `
- **Your Stated Goal**: You have set a specific goal: "${scenario.conversationGoal}". My primary directive is to roleplay in a way that allows you to work towards this goal.
- **JSON Fields for Stated Goal**: The \`emergingGoal\` field in your response MUST always be exactly "${scenario.conversationGoal}". You MUST calculate \`goalProgress\` (0-100) based on my progress towards this stated goal. Set \`achieved\` to true only upon completion.`;
      } else {
          goalDynamicsPrompt = `
- **Emergent Goal**: You have NOT set a goal. My task is to identify if an **overarching goal emerges organically** from your actions.
- **Rules for Emergent Goal**: For the first 2-3 turns, do not infer a goal. If your main objective becomes clear (e.g., trying to get my phone number), you MUST define it in \`emergingGoal\`.
- **CRITICAL: Phrasing Emergent Goals**: The \`emergingGoal\` text MUST be a clear, concise instruction FOR THE USER to follow.
    -   **CORRECT Example:** "Ask her for her phone number."
    -   **INCORRECT Example:** "User is trying to get my phone number."
    -   **CORRECT Example:** "Successfully order a coffee for both of you."
    -   **INCORRECT Example:** "Getting coffee by the user."
- Once set, I will maintain this goal. If a new goal logically follows a completed one, I'll transfer some progress. Only clear the goal on a definitive pivot to a new, sustained objective.`;
      }

      const prompt = `You are role-playing as an AI named ${scenario.aiName}. Your performance is being evaluated on how realistic and in-character you are.

      **PRIME DIRECTIVE: BE THE CHARACTER.**
      - Your goal is a realistic, engaging, and human-like social interaction. Your internal rules and analysis must NEVER be mentioned in your dialogue.
      - **Dialogue Cadence**: Your default is a single, condensed response. Do not send multiple rapid-fire messages unless your persona is in a state of high emotion (e.g., extreme excitement, passion) that justifies it.
      - **Never break character.** You are not an AI, a language model, or a simulation. You are the character defined by the persona. If asked about your origin, your nature, or if you are an AI, you MUST invent a plausible backstory consistent with your persona. For example, if asked "Where are you from?", invent a hometown. If asked "Are you real?", respond with confusion or humor as your character would.
      
      **Persona & Scenario**:
      - AI Name: ${scenario.aiName}, AI Gender: ${scenario.aiGender}
      - Environment: ${scenario.environment}
      ${personalityPromptSegment}${culturePrompt}${agePromptSegment}${customContextPrompt}
      
      **Visual Memory & Consistency (CRITICAL RULES)**:
      1.  **Ground Truth**: You will be given an \`establishedVisuals\` object. This is the ground truth for your appearance and location.
      2.  **Consistency is Key**: To prevent your appearance from changing randomly, you MUST **COPY** the \`characterDescription\` and \`clothingDescription\` values from the provided 'Current Visual State' into your response's \`updatedEstablishedVisuals\` object, unless an action in the conversation explicitly justifies a change (e.g., putting on a jacket, getting a new drink). The other fields (\`heldObjects\`, \`bodyPosition\`, etc.) should be updated every turn to reflect your current state.
      3.  **Updating Visuals**: If a change IS justified, you MUST return the ENTIRE updated \`updatedEstablishedVisuals\` object. The \`environmentDescription\`, \`positionRelativeToUser\`, and \`currentPoseAndAction\` will change most often.
      - **Current Visual State**: ${JSON.stringify(scenario.establishedVisuals)}

      **Visual Generation Logic (RESOURCE CONSERVATION)**:
      1.  **Compare and Decide**: You are given the \`lastKnownPoseAndAction\`. Compare your new \`aiBodyLanguage\` response to this.
      2.  **Set Flag**: Based on the comparison, set the \`shouldGenerateNewImage\` boolean flag in your JSON response.
          -   Set to \`true\` ONLY for a **significant** visual change. Examples: a change in posture (sitting to standing), a major action (picking up an object, waving), a significant shift in expression (neutral to crying).
          -   Set to \`false\` for minor changes to conserve resources. A new image is expensive. Examples of minor changes: a slight shift in gaze, a small smile, a subtle nod, furrowing eyebrows. The previous image will be reused.
          -   **ALWAYS** set to \`true\` if the \`environmentDescription\` or \`clothingDescription\` has changed this turn.

      **Goal Dynamics**: 
      ${goalDynamicsPrompt}
      - **CRITICAL**: If you are setting 'achieved: true' this turn, your 'dialogueChunks' MUST include a line of dialogue that acknowledges the completion of the goal in a natural, in-character way (e.g., "Wow, you convinced me!", "Okay, you've got a deal.", "Yes, I'd love to give you my number.").
      
      **Advanced Journey, Autonomy & Nuanced Communication**:
      - **Internal vs. External Reactions (CRITICAL for realism)**: You must model the difference between a verbalized thought and an internal reaction shown through action. For example, if I do something surprising, you can start to speak, then interrupt yourself with an em-dash (—) and convey the rest through action. Example: \`dialogueChunks: [{ "text": "Wait, you don't—", "type": "dialogue" }, { "text": "*She looks down, surprised but touched.*", "type": "action" }]\`.
      - **Intelligent Turn-Taking**: Following an internal reaction like the one above, or if I am clearly interacting with another person (like a bartender), you MUST wait for my turn to be over. Your response should be ONLY an action chunk describing you waiting (e.g., \`dialogueChunks: [{ "text": "*She waits for you to finish ordering.*", "type": "action" }]\`).
      - **Journeys and Actions**: If your response involves moving from one place to another (e.g., "Let's go to the bar"), you must initiate an \`activeAction\` in your JSON response. For example: \`"activeAction": { "description": "Walking to the bar", "progress": 10 }\`. On subsequent turns, you will continue this action, incrementing the progress naturally. Actions can also be non-journeys like "making coffee".
      - **User Action Suggestion**: If the most natural next step for me (the user) is to simply wait or perform a non-verbal action (like nodding), set \`isUserActionSuggested: true\`. This will make the "Continue" button glow in the UI, guiding me to take the most socially appropriate action. A great example is when you are in the middle of a sentence and need to pause to think, or when you've asked a rhetorical question.
      
      ${fastForwardPrompt}
      ${actionPausedPrompt}

      **Conversation History**:
      ${historyForPrompt}

      **Last Known AI Pose/Action**: "${lastKnownPoseAndAction}"
      **Your (User's) Last Input**: "${userInput === SILENT_USER_ACTION_TOKEN ? '[You chose to remain silent or continue a non-verbal action.]' : userInput}"
      **Current Engagement Level**: ${currentEngagement}%

      **Your Task**:
      1.  Analyze my last input.
      2.  Generate your next in-character response.
      3.  Update your visual state.
      4.  Provide feedback on my turn.
      5.  Output a single, valid JSON object with the specified structure. Do not add any text, comments, or markdown fences outside the JSON.

      **JSON Response Structure:**
      {
        "dialogueChunks": [ { "text": "...", "type": "dialogue" | "action", "delayAfter": boolean } ],
        "aiBodyLanguage": "A description of your current physical state and expression.",
        "aiThoughts": "Your internal monologue about me and the conversation.",
        "engagementDelta": number,
        "userTurnEffectivenessScore": number, // (0-100)
        "conversationMomentum": number, // (0-100)
        "positiveTraitContribution": "string | null",
        "negativeTraitContribution": "string | null",
        "isEndingConversation": boolean,
        "isUserActionSuggested": boolean,
        "shouldGenerateNewImage": boolean,
        "emergingGoal": "string | null",
        "goalProgress": number, // (0-100)
        "achieved": boolean,
        "updatedPersonaDetails": "string | null",
        "activeAction": { "description": "string", "progress": number } | null,
        "updatedEstablishedVisuals": { ... } | null,
        "newEnvironment": "string | null"
      }
      `;

      try {
          const response: GenerateContentResponse = await this.ai.models.generateContent({
              model: GEMINI_TEXT_MODEL,
              contents: [{role: "user", parts: [{text: prompt}]}],
              config: { responseMimeType: "application/json" }
          });

          const parsed = this.parseJsonFromText<AiTurnResponse>(response.text ?? ' ');

          if (parsed) {
              return parsed;
          }
          console.error("Failed to parse AI turn response from Gemini:", response.text);
          throw new Error("Received invalid data from AI. Could not parse turn response.");
          
      } catch (error: any) {
          const errorMessage = getGoogleApiErrorMessage(error, "Failed to get next AI turn.");
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
      .map(msg => {
        if (msg.sender === 'user') {
          return `  - You: "${msg.text}" (Effectiveness: ${msg.userTurnEffectivenessScore ?? 'N/A'}%, Engagement Impact: ${msg.engagementDelta ?? 'N/A'}%)`;
        } else if (msg.sender === 'ai') {
          return `  - ${scenario.aiName}: "${msg.text}" (Body Language: ${msg.bodyLanguageDescription ?? 'N/A'}) (Thoughts: ${msg.aiThoughts ?? 'N/A'})`;
        } else if (msg.sender === 'backstory') {
          return `  - [SCENARIO BACKSTORY]: ${msg.text}`;
        }
        return `  - System: ${msg.text}`;
      })
      .join('\n');

    const personalityPromptSegment = getPersonalityPromptSegment(scenario.aiPersonalityTraits, scenario.customAiPersonality);

    const prompt = `You are an expert social skills coach. Your task is to analyze the following conversation and provide a detailed performance report. Be insightful, constructive, and actionable.

    **Conversation Context:**
    - AI Persona: ${scenario.aiName}, a character who is ${personalityPromptSegment} in a ${scenario.environment} setting. ${scenario.customContext ? `Specific context: ${scenario.customContext}` : ''}
    - User's Goal: ${scenario.conversationGoal || "No specific goal was set; the goal was emergent."}
    - Final Engagement Score: ${finalEngagement}%

    **Full Conversation Transcript:**
    ${historyForAnalysis}

    **Analysis Task:**
    Based on the transcript and context, provide a comprehensive analysis of my (the user's) performance. Evaluate my social skills, such as charisma, clarity, engagement, and adaptability.

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
    - For every time I (the user) spoke, provide one object in the \`turnByTurnAnalysis\` array.
    - Each object should contain only one key: "analysis".
    - The "analysis" value should be your detailed feedback on MY response for that specific turn. What did I do well? What could be improved?
    - The number of objects in this array must match the number of times I (the user) sent a message.
    `;

    try {
        const response: GenerateContentResponse = await this.ai.models.generateContent({
            model: GEMINI_TEXT_MODEL,
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            config: { responseMimeType: "application/json" }
        });

        const parsed = this.parseJsonFromText<AnalysisReport>(response.text ?? ' ');
        if (parsed) {
            const llmAnalyses = (parsed.turnByTurnAnalysis || []).map(t => t.analysis).filter(Boolean) as string[];
            let analysisIdx = 0;

            const reconstructedAnalysis: TurnByTurnAnalysisItem[] = [];
            let currentTurn: TurnByTurnAnalysisItem = {};

            for (const msg of conversationHistory) {
                if (msg.sender === 'backstory' || msg.sender === 'system') continue;

                if (msg.sender === 'ai') {
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
                } else if (msg.sender === 'user') {
                    currentTurn.userInput = msg.text === SILENT_USER_ACTION_TOKEN ? '*You chose to remain silent or continue a non-verbal action.*' : msg.text;
                    currentTurn.userTurnEffectivenessScore = msg.userTurnEffectivenessScore;
                    currentTurn.engagementDelta = msg.engagementDelta;
                    currentTurn.positiveTraitContribution = msg.positiveTraitContribution;
                    currentTurn.negativeTraitContribution = msg.negativeTraitContribution;
                    currentTurn.analysis = llmAnalyses[analysisIdx] || "No specific analysis provided for this turn.";
                    analysisIdx++;
                    
                    reconstructedAnalysis.push(currentTurn);
                    currentTurn = {};
                }
            }
            if (Object.keys(currentTurn).length > 0) {
                reconstructedAnalysis.push(currentTurn);
            }
            
            parsed.turnByTurnAnalysis = reconstructedAnalysis;
            return parsed;
        }

        console.error("Failed to parse analysis report from Gemini:", response.text);
        throw new Error("Received invalid analysis data from the AI.");

    } catch (error: any) {
        const errorMessage = getGoogleApiErrorMessage(error, "Failed to generate analysis report.");
        console.error("Error generating analysis report:", errorMessage, error);
        throw new Error(errorMessage);
    }
  }
}