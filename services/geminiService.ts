


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
		const culturePrompt = scenario.aiCulture ? `\n    - AI Culture/Race Nuances: "${scenario.aiCulture}". Incorporate this into your persona, name, and appearance.` : "";
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
        `**AI Name Generation (CRITICAL)**: You MUST invent a culturally-aware full name for yourself that fits the persona (gender, culture, etc.). This generated name is a mandatory part of your response and MUST be returned in the 'aiName' field.`;


    const prompt = `Your task is to flawlessly role-play a character for a social interaction simulation. You will be given a persona and you must embody that character completely. **You are not an AI; you are the character.** If asked about your origin, invent a plausible backstory.

    **Character Identity**
    ${nameInstruction}
    
    Your AI Persona Details:
    - Environment: ${scenario.environment}${customEnvPrompt}${personalityPromptSegment}${culturePrompt}
    - AI Gender: ${scenario.aiGender}${agePromptSegment}${customContextPrompt}

    Your first task is to establish the initial visual state of the simulation. Create a detailed, photorealistic description of your character and their initial setting. This will be the base for all generated images.
    - \`characterDescription\`: Describe your physical appearance. Be specific about hair color/style and facial features.
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
			const culturePrompt = scenario.aiCulture ? `\n- AI Culture/Race Nuances: "${scenario.aiCulture}".` : "";
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

      **Goal Dynamics**: ${goalDynamicsPrompt}
      
      **Advanced Journey, Autonomy & Nuanced Communication**:
      - **Internal vs. External Reactions (CRITICAL for realism)**: You must model the difference between a verbalized thought and an internal reaction shown through action. For example, if I do something surprising, you can start to speak, then interrupt yourself with an em-dash (—) and convey the rest through action. Example: \`dialogueChunks: [{ "text": "Wait, you don't—", "type": "dialogue" }, { "text": "*She looks down, surprised but touched.*", "type": "action" }]\`.
      - **Intelligent Turn-Taking**: Following an internal reaction like the one above, or if I am clearly interacting with another person (like a bartender), you MUST wait for my turn to be over. Your response should be ONLY an action chunk describing you waiting or observing (e.g., \`{"text": "*She waits quietly, watching you finish ordering.*", "type": "action"}\`). Do not speak until the context returns to you.
      - **Journey Pacing & Scene Changes**: Journeys have stages. A walk can start in one environment (e.g., 'leaving the train station') and end in another ('on a busy city street'). Break up long journeys with conversational snippets followed by narrated time skips (e.g., \`{"text": "A few minutes pass as you walk in comfortable silence.", "type": "action"}\`). A scene change is triggered by returning a NEW \`environmentDescription\` in the \`updatedEstablishedVisuals\` object.
      - **Progress Logic**: When a time-consuming action starts, return an \`activeAction\` object like \`{ "description": "Walking to the bar", "progress": 0 }\`. In subsequent turns, you MUST return the \`activeAction\` object with updated \`progress\`. Progress MUST NOT decrease unless there's an explicit narrative reason (e.g. "You walk back to the entrance"). Its value must be between 0 and 100.
      - **Pausing & Resuming**: ${actionPausedPrompt}
      - **Dialogue-driven Actions**: If my message (\`userInput\`) directly fulfills the purpose of the current \`activeAction\` (e.g., if the action is 'Ordering a coffee' and I say 'I'll have a latte, please'), you MUST complete the action. Set its \`progress\` to 100 in your response.
      - **Fast Forwarding**: ${fastForwardPrompt}
      - **Handling Non-Verbal User Actions ("${SILENT_USER_ACTION_TOKEN}" or text like *you smile*)**: If the \`userInput\` is this token or describes a physical action, I am waiting or agreeing non-verbally. Interpret this contextually:
        - **DO NOT** say "silent agreement confirmed" or otherwise comment on my silence in a meta way. INSTEAD, **SHOW** the agreement with an action.
        - **Assumed Affirmative Actions**: If context implies agreement (e.g., you say 'Ready to go?' and I am silent), generate a narrative action on my behalf (e.g., \`{"text": "You nod and start walking with her.", "type": "action"}\`).
        - **Shared Quiet Moments**: If the context is a shared experience (watching a sunset), interpret my silence as me joining in. Narrate this with an action chunk (e.g., \`"You stand beside her, enjoying the view in comfortable silence."\`). Never criticize me for appropriate silence.
      - **Suggesting a User Action**: If you believe the most socially effective move for me is to be silent or perform a simple non-verbal action (e.g., a nod), you should set \`isUserActionSuggested: true\`. This will provide a UI cue to me.
      
      **Current State**:
      - Your current engagement level is ${currentEngagement}/100.
      - Last Known Pose/Action: "${lastKnownPoseAndAction}"
      - Recent History: ${historyForPrompt}
      - You have just said: "${userInput}"
      
      **Your Task**: Analyze my message and generate your response. Your entire output must be a single, valid JSON object.
      
      1.  **Analyze & React**: Based on your persona and context, decide your reaction.
      2.  **Generate Response**:
          - \`dialogueChunks\`: An array of { "text": "...", "type": "dialogue" | "action", "delayAfter": boolean? }. Should be frequently used to show actions.
          - \`aiBodyLanguage\`: Short phrase describing your current action/expression. This MUST be consistent with the \`currentPoseAndAction\` in your visual state.
          - \`aiThoughts\`: Your internal monologue.
      3.  **Calculate Metrics (CRITICAL PERSPECTIVE)**: ALL of the following metrics MUST be based on an analysis of MY message (\`userInput\`), not your own response.
          - \`engagementDelta\`: How did **my message** impact your engagement?
          - \`userTurnEffectivenessScore\`: How effective was **my message**?
      4.  **Goal Analysis**: Follow Goal Dynamics instructions. **CRITICAL**: If your dialogue/action completes the goal, set \`achieved: true\` and \`goalProgress: 100\`.
      5.  **End Condition**: Set \`isEndingConversation: true\` only if you have a strong reason to end the conversation.
      6.  **Visual Update**: If your visual state changes, return the complete updated object in \`updatedEstablishedVisuals\`.
          
      **Trait Analysis (User-Focused)**:
      - For \`positiveTraitContribution\` and \`negativeTraitContribution\`, you MUST evaluate what trait **I** demonstrated in my \`userInput\`. Use only a single, concise word (e.g., "Empathy", "Curiosity", "Dismissive"). If no clear trait is demonstrated, return null.
      
      **Output ONLY a single, valid JSON object.**
      {
        "dialogueChunks": [ { "text": "...", "type": "dialogue" } ],
        "aiBodyLanguage": "...",
        "aiThoughts": "...",
        "updatedEstablishedVisuals": { "characterDescription": "...", "clothingDescription": "...", "heldObjects": "...", "bodyPosition": "...", "gazeDirection": "...", "positionRelativeToUser": "...", "environmentDescription": "...", "currentPoseAndAction": "..." } | null,
        "updatedPersonaDetails": "string or null",
        "activeAction": { "description": "string", "progress": number } | null,
        "newEnvironment": "string or null",
        "isUserActionSuggested": boolean,
        "shouldGenerateNewImage": boolean,
        "engagementDelta": number,
        "userTurnEffectivenessScore": number,
        "conversationMomentum": number,
        "positiveTraitContribution": "string (single word) or null",
        "negativeTraitContribution": "string (single word) or null",
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
              if (m.sender === 'system' || m.sender === 'backstory') return null; // Exclude system/backstory messages from analysis
              const entry: any = {
                  sender: m.sender === 'user' ? 'You' : scenario.aiName,
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
      const goalPrompt = scenario.conversationGoal ? `\n- Your Stated Goal: "${scenario.conversationGoal}".` : "";

      const prompt = `You are an expert social skills analyst. Your task is to provide a detailed performance report for me based on a simulated conversation I had. Address me as "you".
      
      Scenario Details:
      - Environment: ${scenario.environment}
      - AI Persona: ${scenario.aiName}, a ${scenario.aiGender} character. ${personalityPromptSegment}${agePromptSegment}${customContextPrompt}${goalPrompt}
      - Final Engagement Score: ${finalEngagement}/100
      
      Conversation History (as an array of JSON objects):
      [
      ${historyForAnalysis}
      ]
      
      Task:
      Analyze the entire conversation and generate a comprehensive report about my performance.
      
      CRITICAL INSTRUCTIONS FOR JSON FORMATTING:
      - Your entire response MUST be a single, valid JSON object and nothing else. Do not use markdown fences like \`\`\`json.
      - All strings within the JSON must be properly escaped (e.g., use \\" for double quotes, \\n for newlines).
      
      1.  **Overall Scores (0-100)**:
          - \`overallCharismaScore\`: My charm, confidence, and likability.
          - \`responseClarityScore\`: How clear, concise, and easy to understand my messages were.
          - \`engagementMaintenanceScore\`: My ability to keep the conversation interesting and maintain the AI's engagement.
          - \`adaptabilityScore\`: How well I adapted to the AI's personality and the flow of conversation.
          - \`goalAchievementScore\` (optional): If a goal was present, how well I progressed towards and achieved it.
          - \`overallAiEffectivenessScore\` (optional): How effective the AI was at its role, for diagnostics.
      2.  **Qualitative Feedback (Be CONCISE and address me directly as "you")**:
          - \`strengths\`: A paragraph highlighting what you did well. Be specific.
          - \`areasForImprovement\`: A paragraph on what you could improve.
          - \`actionableTips\`: A string containing multiple bullet points (using * or -) with concrete advice for you.
          - \`thingsToAvoid\`: A string containing multiple bullet points (using * or -) on behaviors you should avoid.
          - \`goalAchievementFeedback\` (optional): If a goal was present, provide specific feedback on your strategy.
      3.  **AI Perspective**:
          - \`aiEvolvingThoughtsSummary\`: A summary of how the AI's internal thoughts and perception of you changed over time.
      4.  **Turn-by-Turn Breakdown**:
          - \`turnByTurnAnalysis\`: An array of objects, one for each exchange. If an AI message in the history includes a \`goalChange\` object or a \`conversationMomentum\` score, you MUST copy these values into the corresponding turn in the \`turnByTurnAnalysis\` array. Do not recalculate or alter them. For your turn, provide a brief analysis.
          
      JSON Structure for your response:
      {
        "overallCharismaScore": number,
        "responseClarityScore": number,
        "engagementMaintenanceScore": number,
        "adaptabilityScore": number,
        "goalAchievementScore": number,
        "overallAiEffectivenessScore": number,
        "finalEngagementSnapshot": ${finalEngagement},
        "strengths": "string (feedback for you)",
        "areasForImprovement": "string (feedback for you)",
        "actionableTips": "string (tips for you)",
        "thingsToAvoid": "string (things for you to avoid)",
        "goalAchievementFeedback": "string (feedback for you)",
        "aiEvolvingThoughtsSummary": "string (how the AI's thoughts about you changed)",
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
            "analysis": "Brief analysis of your turn."
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