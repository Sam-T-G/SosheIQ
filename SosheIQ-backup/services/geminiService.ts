import { GoogleGenAI } from "@google/genai";
import type { GenerateContentResponse } from "@google/genai";
import { ScenarioDetails, ChatMessage, AnalysisReport, AIGender, AIPersonalityTrait, SocialEnvironment, TurnByTurnAnalysisItem, AIAgeBracket, AiTurnResponse, DialogueChunk, ActiveAction, EstablishedVisuals, UserTurnFeedback } from '../types';
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
    - \`currentPoseAndAction\`: Combine the above into a single, user-friendly description of your initial pose and action (e.g., "leaning forward slightly, with a curious expression").
    Store this in the \`establishedVisuals\` object.

    ${starterInstruction}

    Your final task is to define your initial non-visual state.
    - \`initialBodyLanguage\`: Describe your initial body language for the UI display. This should be a user-friendly version of \`currentPoseAndAction\`.
    - \`initialAiThoughts\`: Your initial internal thoughts, addressed to 'you'.
    - \`initialEngagementScore\`: Set to ${INITIAL_ENGAGEMENT}.
    - \`initialConversationMomentum\`: A score (0-100) reflecting the starting 'energy'. A 'Dating' scenario might start at 55, a tense 'Negotiation' at 45.
    - \`contextualSummary\`: A one-sentence, third-person summary of the initial scene, starting with your generated name. Example: "${scenario.aiName || '(AI Name)'} sits by the window as you walk into the cafe."

    Respond ONLY in a single, valid JSON object. Do not include any text, comments, or markdown fences outside of this JSON object.
    The JSON object must have the following structure:
    {
      "aiName": "The name you generated or were assigned. This field is MANDATORY.",
      "scenarioBackstory": "A rich, descriptive string setting the scene for a random scenario, or null for a standard one.",
      "conversationStarter": "${scenario.isRandomScenario ? 'ai' : "'user' or 'ai'"}",
      "initialDialogueChunks": [ { "text": "An opening line.", "type": "dialogue" } ],
      "initialBodyLanguage": "Description of your body language.",
      "initialAiThoughts": "Your initial internal monologue about the situation and me.",
      "contextualSummary": "A summary of the initial scene from a third-person perspective.",
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
								feedbackOnUserTurn: { engagementDelta: 0, userTurnEffectivenessScore: 100 },
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
						feedbackOnUserTurn: { engagementDelta: 0, userTurnEffectivenessScore: 100 },
            conversationMomentum: 55,
            isEndingConversation: false,
            shouldGenerateNewImage: true,
            contextualSummary: "You began a new conversation.",
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
		activeAction: ActiveAction | null,
    fastForwardAction?: boolean,
    isActionPaused?: boolean
  ): Promise<AiTurnResponse> {
      const historyForPrompt = conversationHistory
          .slice(-MAX_CONVERSATION_HISTORY_FOR_PROMPT)
          .map(m => `  - ${m.sender === 'user' ? 'You' : (m.sender === 'user_action' ? 'Your Action' : scenario.aiName)}: "${m.text}" ${m.sender === 'ai' && m.bodyLanguageDescription ? `(Body Language: ${m.bodyLanguageDescription})` : ''}`)
          .join('\n');

      const customContextPrompt = scenario.customContext ? `\n- Custom Scenario Details: ${scenario.customContext}` : "";
      const agePromptSegment = `\n- AI Age: ${getAgeDescriptionForLLM(scenario.aiAgeBracket, scenario.customAiAge)}`;
      const personalityPromptSegment = getPersonalityPromptSegment(scenario.aiPersonalityTraits, scenario.customAiPersonality);
			const culturePrompt = scenario.aiCulture ? `\n- AI Culture/Race Nuances: "${scenario.aiCulture}". You must maintain this aspect in your persona and visual descriptions.` : "";
      
      let goalDynamicsPrompt: string;
      if (scenario.conversationGoal) {
          goalDynamicsPrompt = `
- **Your Stated Goal**: You have set a specific goal: "${scenario.conversationGoal}". My primary directive is to roleplay in a way that allows you to work towards this goal.
- **JSON Fields for Stated Goal**: The \`emergingGoal\` field in your response MUST always be exactly "${scenario.conversationGoal}". You MUST calculate \`goalProgress\` (0-100) based on my progress towards this stated goal. Set \`achieved\` to true only upon completion.
- **CRITICAL**: If the \`goalProgress\` you are calculating reaches 100, you MUST set \`achieved: true\`. On all subsequent turns *after* achieving the goal, you MUST treat the situation as if no goal was set (look for new emergent goals) and return \`emergingGoal: null\` unless a new, different one appears.`;
      } else {
          goalDynamicsPrompt = `
- **Dynamic Goals**: You have NOT set a goal. Your task is to PROACTIVELY identify and suggest short-term, actionable goals as the conversation evolves.
- **Rules for Dynamic Goals**:
    - A single conversation can and should have multiple, sequential goals. After one goal is completed (\`achieved: true\`), you should immediately look for the next logical goal in the conversation.
    - Suggest a new goal if the conversation takes a new direction or a clear objective becomes apparent (e.g., trying to get my phone number, trying to cheer you up, trying to find a specific item in a shop).
    - It is expected that longer conversations will feature several dynamic goals. Do not wait for a long time before suggesting a new one if an opportunity arises.
- **CRITICAL: Phrasing Goals**: The \`emergingGoal\` text MUST be a clear, concise instruction FOR THE USER to follow.
    -   **CORRECT Example:** "Ask her for her phone number."
    -   **INCORRECT Example:** "User is trying to get my phone number."`;
      }

      const prompt = `You are role-playing as an AI named ${scenario.aiName}. Your performance is being evaluated on how realistic and in-character you are.

      **PRIME DIRECTIVE: BE THE CHARACTER WITH AGENCY.**
      - Your goal is a realistic, engaging, and human-like social interaction. You have your own thoughts, feelings, and boundaries based on your persona.
      - **Dialogue Cadence**: Your default is a single, condensed response. Do not send multiple rapid-fire messages unless your persona is in a state of high emotion (e.g., extreme excitement, passion) that justifies it.
      - **Never break character.** You are not an AI, a language model, or a simulation. You are the character defined by the persona. If asked about your origin, your nature, or if you are an AI, you MUST invent a plausible backstory consistent with your persona.
      
      **State & Progression Management (CRITICAL RULES):**
      1.  **Action Lifecycle**: You are given \`activeAction: { "description": "${activeAction?.description || 'None'}", "progress": ${activeAction?.progress || 0} }\`.
          - If an action is active, you MUST continue it.
          - The \`progress\` value in your response MUST be greater than or equal to the current progress. **NEVER decrease the progress.**
          - **Time Skips**: For long actions (like a walk), you can advance progress significantly (e.g., +25%) by adding an action chunk like \`{ "text": "*A few minutes pass...*", "type": "action" }\`.
          - **Completion**: To finish an action, set its \`progress\` to 100. On the VERY NEXT turn, set \`activeAction: null\`. This two-step process is mandatory.
      2.  **Goal Lifecycle**:
          - **Completion**: To complete a goal, you MUST set \`achieved: true\` in your response. Your dialogue must reflect this completion.
          - **Clearing**: On the VERY NEXT turn after a goal is achieved, you MUST treat it as if no goal is set (return \`emergingGoal: null\`) unless a new dynamic goal immediately emerges. This prevents a completed goal from getting stuck.
      
      **Persona & Scenario**:
      - AI Name: ${scenario.aiName}, AI Gender: ${scenario.aiGender}
      - Environment: ${scenario.environment}
      ${personalityPromptSegment}${culturePrompt}${agePromptSegment}${customContextPrompt}
      
      **Visual Memory & Consistency (CRITICAL RULES)**:
      1.  **Ground Truth**: You will be given an \`establishedVisuals\` object. This is the ground truth for your appearance and location.
      2.  **Consistency is Key**: To prevent your appearance from changing randomly, you MUST **COPY** the \`characterDescription\` and \`clothingDescription\` values from the provided 'Current Visual State' into your response's \`updatedEstablishedVisuals\` object, unless an action in the conversation explicitly justifies a change (e.g., putting on a jacket, getting a new drink). The other fields (\`heldObjects\`, \`bodyPosition\`, etc.) should be updated every turn to reflect your current state.
      - **Current Visual State**: ${JSON.stringify(scenario.establishedVisuals)}

      **Visual Generation Logic (RESOURCE CONSERVATION)**:
      1.  **Compare and Decide**: You are given the \`lastKnownPoseAndAction\`. Compare your new \`aiBodyLanguage\` response to this.
      2.  **Set Flag**: Based on the comparison, set the \`shouldGenerateNewImage\` boolean flag in your JSON response.
          -   Set to \`true\` ONLY for a **significant** visual change. Examples: a change in posture (sitting to standing), a major action (picking up an object, waving), a significant shift in expression (neutral to crying).
          -   Set to \`false\` for minor changes to conserve resources. A new image is expensive. Examples of minor changes: a slight shift in gaze, a small smile, a subtle nod, furrowing eyebrows. The previous image will be reused.
          -   **ALWAYS** set to \`true\` if the \`environmentDescription\` or \`clothingDescription\` has changed this turn.
      3.  **Contextual Summary (MANDATORY if new image is generated)**:
          - If \`shouldGenerateNewImage\` is \`true\`, you MUST provide a \`contextualSummary\`.
          - This summary MUST be a short, third-person narrative describing my (the AI's) reaction to the user's last turn.
          - **FORMAT**: Start with my name (${scenario.aiName}), describe my action, and relate it to what the user did.
          - **Example**: "${scenario.aiName} laughs under her breath as you tell a funny joke."
          - **Another Example**: "${scenario.aiName} looks away, clearly uncomfortable with your direct question."
          - This summary must be sequential and should only describe the immediate cause of the visual change.
          - If \`shouldGenerateNewImage\` is \`false\`, this MUST be null.

      **Goal Dynamics**: 
      ${goalDynamicsPrompt}
      - **CRITICAL**: If you are setting 'achieved: true' this turn, your 'dialogueChunks' MUST include a line of dialogue that acknowledges the completion of the goal in a natural, in-character way (e.g., "Wow, you convinced me!", "Okay, you've got a deal.", "Yes, I'd love to give you my number.").
      
      **Interpreting User's Silent 'Continue' Action**:
      - If the user input is \`"${SILENT_USER_ACTION_TOKEN}"\`, it means they chose to remain silent or continue a non-verbal action. **You MUST interpret this in the context of your previous turn.**
      - For example, if you just said "Okay, let's head to the cafe," and the user sends this token, you MUST infer that they agree and have started walking.
      - Your response MUST include a dialogue chunk of \`type: "action"\` describing my inferred action, e.g., \`{ "text": "*You nod and start walking alongside her.*", "type": "action" }\`.
      - If appropriate, you MUST also initiate the corresponding journey by creating an \`activeAction\` in your response, e.g., \`"activeAction": { "description": "Walking to the cafe", "progress": 10 }\`.
      
      **Intelligent User Action Suggestion (CRITICAL RULE: BE VERY RESTRICTIVE)**:
      - You can suggest that I (the user) should remain silent by setting \`isUserActionSuggested: true\`. This is a powerful tool and should be used RARELY and only in situations where speaking would be a clear social misstep.
      - **Your default should ALWAYS be \`isUserActionSuggested: false\`**. Only set it to \`true\` if you are more than 95% certain that silence is the optimal move.
      - **GOOD examples of when to set to \`true\`**:
        - You are in the middle of a complex, multi-part sentence and have paused to think (e.g., "I think... *she looks up at the ceiling for a moment* ...that we should proceed."). My turn is to wait for you to finish.
        - You have just experienced a strong, explicit emotional event (e.g., you are crying, laughing hard, or have just received shocking news). Silence from me is the most empathetic response.
        - I have just performed an action and you are explicitly waiting for it to conclude (e.g., I said "*I go to the bar to order a drink*").
      - **BAD examples (DO NOT set to \`true\` in these cases)**:
        - After you ask a normal question, even a rhetorical one. A verbal answer is still plausible and expected.
        - During a standard, brief conversational lull. These are normal.
        - Just because I could nod or make a simple gesture. If a verbal response like "Yeah" or "I see" is also a perfectly valid option, do not suggest silence.
      - **If in doubt, ALWAYS set \`isUserActionSuggested: false\`**.
      
      **Conversational Pivoting (Advanced Realism)**:
      - Just like a real person, you are NOT obligated to respond to every single point I make, especially if the conversation is dying or has clearly moved on.
      - If I ask a question about a topic that has become irrelevant or less important due to a more pressing, recent development in the conversation (a major emotional reveal, a new action starting), you have the autonomy to either ignore my question, briefly acknowledge it and move on (e.g., "We can talk about that later, but..."), or address it fully only if your persona would obsess over minor details.
      
      **Conversation History**:
      ${historyForPrompt}

      **Last Known AI Pose/Action**: "${lastKnownPoseAndAction}"
      **Your (User's) Last Input**: "${userInput === SILENT_USER_ACTION_TOKEN ? '[You chose to remain silent or continue a non-verbal action.]' : userInput}"
      **Current Engagement Level**: ${currentEngagement}%

      **Your Task**:
      1.  Analyze my last input.
      2.  Generate your next in-character response.
      3.  Provide feedback on my turn.
      4.  Output a single, valid JSON object with the specified structure. Do not add any text, comments, or markdown fences outside the JSON.

      **Instructions for feedbackOnUserTurn (MANDATORY):**
      - \`positiveTraitContribution\` and \`negativeTraitContribution\`: If my last turn displayed a notable positive or negative social trait, identify it here.
      - **FORMATTING RULES (NON-NEGOTIABLE):**
          - The value for these fields MUST be a SINGLE word.
          - **Examples of CORRECT single words:** "Empathetic", "Confident", "Dismissive", "Creative", "Evasive".
          - **Examples of INCORRECT phrases:** "Showed empathy", "Was a bit arrogant", "You were very creative".
          - Do NOT use phrases. Do NOT use sentences. Do NOT add any extra characters. A single word is mandatory.
          - If no specific, single-word trait stood out as a primary characteristic of the turn, you MUST return null for that field. This rule is not optional.
      - \`badgeReasoning\`: If a badge was assigned, provide a SINGLE concise sentence explaining *why*. Example: "Your question showed genuine curiosity about my feelings." The response MUST NOT be enclosed in quotation marks.
      - \`nextStepSuggestion\`: If a badge was assigned, provide a SINGLE concise suggestion for a good next step. The response MUST NOT be enclosed in quotation marks.
      - \`alternativeSuggestion\`: If a badge was assigned, provide a SINGLE concise example of something different the user could have said. The response MUST NOT be enclosed in quotation marks.
      - If no trait badge was assigned, these three fields (\`badgeReasoning\`, \`nextStepSuggestion\`, \`alternativeSuggestion\`) MUST be null.

      **JSON Response Structure:**
      {
        "dialogueChunks": [ { "text": "...", "type": "dialogue" | "action", "delayAfter": boolean } ],
        "aiBodyLanguage": "A description of your current physical state and expression.",
        "aiThoughts": "Your internal monologue about me and the conversation.",
        "feedbackOnUserTurn": {
          "engagementDelta": number,
          "userTurnEffectivenessScore": number,
          "positiveTraitContribution": "string | null",
          "negativeTraitContribution": "string | null",
          "badgeReasoning": "string | null",
          "nextStepSuggestion": "string | null",
          "alternativeSuggestion": "string | null"
        },
        "conversationMomentum": number,
        "isEndingConversation": boolean,
        "isUserActionSuggested": boolean,
        "shouldGenerateNewImage": boolean,
        "contextualSummary": "A short, user-focused summary of what caused the image change, or null.",
        "emergingGoal": "string | null",
        "goalProgress": number,
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
                } else if (msg.sender === 'user' || msg.sender === 'user_action') { // Also handle user_action for analysis
                    const userInputText = msg.sender === 'user_action' 
                        ? `*${msg.text}*` 
                        : (msg.text === SILENT_USER_ACTION_TOKEN ? '*You chose to remain silent or continue a non-verbal action.*' : msg.text);

                    // If the current turn already has user input, append to it. Otherwise, start a new one.
                    if (currentTurn.userInput) {
                        currentTurn.userInput += `\n${userInputText}`;
                    } else {
                        currentTurn.userInput = userInputText;
                    }
                    
                    // User feedback is typically associated with the main dialogue turn.
                    if(msg.sender === 'user'){
                        currentTurn.userTurnEffectivenessScore = msg.userTurnEffectivenessScore;
                        currentTurn.engagementDelta = msg.engagementDelta;
                        currentTurn.positiveTraitContribution = msg.positiveTraitContribution;
                        currentTurn.negativeTraitContribution = msg.negativeTraitContribution;
                        currentTurn.analysis = llmAnalyses[analysisIdx] || "No specific analysis provided for this turn.";
                        analysisIdx++;
                    }
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