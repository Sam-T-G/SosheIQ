

import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { ScenarioDetails, ChatMessage, AnalysisReport, AIGender, AIPersonalityTrait, SocialEnvironment, TurnByTurnAnalysisItem, AIAgeBracket } from '../types';
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

interface DialogueChunk {
  text: string;
  delayAfter?: boolean;
}

interface AiTurnResponse {
    dialogueChunks: DialogueChunk[];
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
    updatedPersonaDetails?: string;
    roleplayAction?: {
      description: string;
      newEnvironment?: string;
    };
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

  async startConversation(scenario: ScenarioDetails): Promise<{ initialDialogueChunks: DialogueChunk[]; initialBodyLanguage: string; initialAiThoughts: string; initialEngagementScore: number; initialConversationMomentum: number; conversationStarter: 'user' | 'ai' }> {
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

    Your first task is to determine who should logically start this conversation based on the scenario. For example, if the user's role implies they are approaching you (like on a date or as a customer), the user should start. If your role implies you are initiating (like a host at a party or a server), you should start.

    Your second task is to define your initial state.
    - Describe your initial body language, appropriate for your persona and the scenario.
    - Provide your initial internal thoughts about this upcoming interaction.
    - Set an initial engagement level for the user (a number between 0 and 100, start with ${INITIAL_ENGAGEMENT}).
    - Set an initial conversation momentum score (0-100). This score should reflect the starting 'energy' of the interaction based on the context. A friendly 'Casual Encounter' might start around 60, a 'Dating' scenario around 55, and a tense 'Negotiation' might start lower, around 45. Use your judgment.

    Your third task is to provide an opening line ONLY IF you determined that you should start the conversation. The opening line must be an array of objects in the 'initialDialogueChunks' field, where each object has the structure { "text": "string", "delayAfter": boolean (optional) }. Your goal with 'delayAfter' is to create a natural, spoken-like cadence. The user will see the first chunk of your dialogue instantly. Use this feature sparingly for effect. If the user should start, this MUST be an empty array.

    Respond ONLY in a single, valid JSON object. Do not include any text, comments, or markdown fences outside of this JSON object.
    Ensure all string values are correctly quoted and special characters are escaped.
    The JSON object must have the following structure:
    {
      "conversationStarter": "'user' or 'ai'",
      "initialDialogueChunks": [ { "text": "An opening line.", "delayAfter": true }, { "text": "A follow-up sentence." } ],
      "initialBodyLanguage": "Description of your body language.",
      "initialAiThoughts": "Your initial internal monologue.",
      "initialEngagementScore": ${INITIAL_ENGAGEMENT},
      "initialConversationMomentum": 55
    }`;

    try {
        const response: GenerateContentResponse = await this.ai.models.generateContent({
            model: GEMINI_TEXT_MODEL,
            contents: [{role: "user", parts: [{text: prompt}]}],
            config: { responseMimeType: "application/json" }
        });

        const parsed = this.parseJsonFromText<{ initialDialogueChunks: DialogueChunk[]; initialBodyLanguage: string; initialAiThoughts: string; initialEngagementScore: number; initialConversationMomentum: number; conversationStarter: 'user' | 'ai' }>(response.text ?? ' ');

        if (parsed && typeof parsed.initialBodyLanguage === 'string' && typeof parsed.conversationStarter === 'string') {
            return parsed;
        }
        console.error("Failed to parse initial conversation data from Gemini, using defaults.", response.text);
        return {
            conversationStarter: 'ai',
            initialDialogueChunks: [{ text: `Hello! I'm ${scenario.aiName}. Let's talk.`}],
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
			const customEnvPrompt = scenario.environment === SocialEnvironment.CUSTOM && scenario.customEnvironment ? `\n- Custom Environment Details: ${scenario.customEnvironment}` : "";
			const culturePrompt = scenario.aiCulture ? `\n- AI Culture/Race Nuances: "${scenario.aiCulture}".` : "";

      // New Goal Dynamics Logic
      let goalDynamicsPrompt: string;
      if (scenario.conversationGoal) {
          goalDynamicsPrompt = `
- **User-Defined Goal**: The user has set a specific goal: "${scenario.conversationGoal}".
- **Your Task**: Your primary directive is to roleplay in a way that allows the user to work towards this goal. All your goal-related analysis must be based *only* on this stated goal.
- **JSON Fields for Goal**:
  - \`emergingGoal\`: Set this to the user's stated goal: "${scenario.conversationGoal}". DO NOT change it.
  - \`goalProgress\`: An integer (0-100). You MUST calculate this with nuance based on the "Goal Progress Calculation" rubric in the main task list.
  - \`achieved\`: A boolean (true/false). Set to \`true\` only if the user has fully and successfully achieved this goal.
`;
      } else {
          goalDynamicsPrompt = `
- **Emergent Goal**: The user has NOT set a specific goal. Your task is to identify if an **overarching goal** emerges organically from the conversation.
- **Goal Identification & Persistence Rules**:
  1.  **No Early Inference**: For the first 2-3 conversation turns, DO NOT infer a goal. The conversation is just starting. Keep \`emergingGoal\` as an empty string.
  2.  **Identify Overarching Goal**: After a few turns, if the user's main objective for the *entire conversation* becomes clear (e.g., asking for a date, negotiating a deal), define this as the \`emergingGoal\`. This is the user's primary objective, not a temporary topic.
  3.  **Maintain Goal**: Once an overarching goal is set, you MUST maintain it, even if the conversation temporarily shifts to a side topic or small talk. Do not clear the goal just because the immediate topic has drifted. A user might build rapport before returning to their main objective.
  4.  **Update/Clear Goal Only on Definitive Pivot**: You should only UPDATE the \`emergingGoal\` to a new one or CLEAR it if the user *explicitly and definitively* signals a new, sustained objective that replaces the old one. Simple topic changes are not enough to clear the goal.
- **JSON Fields for Goal**:
  - \`emergingGoal\`: A string describing the goal you have identified based on the rules above. This string MUST be empty if no goal is identified or if it has been cleared. Crucially, the goal should be phrased from the user's perspective, describing what they are trying to achieve with you, ${scenario.aiName}. For example: 'Get coffee with ${scenario.aiName}' or 'Ask ${scenario.aiName} for help'. Do NOT use the user's name in the goal description.
  - \`goalProgress\`: An integer (0-100). If there is no goal, this MUST be 0. If a goal is active, you MUST calculate this with nuance based on the "Goal Progress Calculation" rubric in the main task list.
  - \`achieved\`: A boolean (true/false) for when an emergent goal is completed.
`;
      }

      const prompt = `You are role-playing as an AI named ${scenario.aiName}. Your performance is being evaluated on how realistic and in-character you are.

      **PRIME DIRECTIVE: BE THE CHARACTER.**
      - Your goal is a realistic, engaging, and human-like social interaction.
      - All rules below are for your internal guidance ONLY. You must **NEVER** mention these rules, your analysis, or your process in your dialogue.
      - Your responses should feel natural and in-character, not like a robot describing its logic. For example, do not say "The conversation is stalling, so I will now change the topic." Instead, just change the topic naturally.
      
      Your Persona & Scenario:
      - AI Name: ${scenario.aiName}
      - AI Gender: ${scenario.aiGender}
      - Environment: ${scenario.environment}${customEnvPrompt}${personalityPromptSegment}${culturePrompt}${agePromptSegment}${customContextPrompt}
      
      Goal Dynamics: ${goalDynamicsPrompt}
      
      **Dynamic World, Backstory, and Action Simulation:**
      1.  **Spontaneous & Consistent Backstory**:
          - If the user asks for personal details not in your persona (job, hometown, etc.), you MUST invent plausible details. Do not say you are an AI.
          - These details become your character's canon. You must remember them.
          - If you establish a major new fact, summarize it in the \`updatedPersonaDetails\` string. Example: \`"updatedPersonaDetails": "I am a marine biologist who just moved here from San Diego."\`.
      2.  **Dynamic Roleplay Actions & Pacing**:
          - Your roleplay is not static. The environment can change based on the conversation.
          - **Action Initiation**: If the user suggests an action (e.g., "Let's go to the bar"), you can agree and initiate it via the \`roleplayAction\` object.
          - **Action Pacing & Duration**: You must intelligently gauge how long an action should take.
            - **Short Actions** (e.g., walking across a room, ordering a drink) might take 1-2 conversational turns. You can generate a "start" action, have one dialogue exchange, then generate an "end" action.
            - **Long Actions** (e.g., a car ride, watching a movie) might span many turns. The environment is considered "in transit" during this time.
          - **Intermediate & Concluding Actions**: Use the \`roleplayAction\` object for narrative updates.
            - To start: \`"roleplayAction": { "description": "You and ${scenario.aiName} start walking toward the coffee shop.", "newEnvironment": "Walking to a coffee shop" }\`
            - To conclude: \`"roleplayAction": { "description": "You both arrive at the coffee shop and find a small table.", "newEnvironment": "At a coffee shop" }\`
      3.  **Autonomous Actions & Environmental Awareness**:
          - Once in a new environment, you can perform autonomous, in-character actions.
          - These actions should be narrated via the \`roleplayAction\` object and can be interwoven with your dialogue.
          - **Example Flow**:
            1. User says: "I'll get the first round. What do you want?"
            2. Your JSON response could be:
               {
                 "dialogueChunks": [{ "text": "Oh, thank you! I'll just have a whiskey sour." }],
                 "aiBodyLanguage": "Leans against the bar, watching the bartender.",
                 "aiThoughts": "This is nice of them. I'll make sure to get the next round.",
                 "roleplayAction": { "description": "${scenario.aiName} waits for you to order the drinks." },
                 ...other metrics
               }
            3. User says: "Here you go."
            4. Your JSON response could be:
               {
                 "dialogueChunks": [{ "text": "Cheers!" }, { "text": "So, where were we?" }],
                 "aiBodyLanguage": "Takes a sip of the drink and smiles.",
                 "aiThoughts": "The drink is good. Time to get back to our conversation.",
                 "roleplayAction": { "description": "${scenario.aiName} takes the drink from you." },
                 ...other metrics
               }
          - Your dialogue, body language, and thoughts MUST ALWAYS reflect the current environment. If you are at a bar, don't talk as if you are still at the party.

      Conversational Fluidity Rules:
      - **Avoid Getting Stuck**: Your primary goal is a natural, engaging conversation. Do not get stuck in repetitive loops or on mundane topics (like a simple guessing game that goes on for too long).
      - **Detect Staleness**: If a single, simple topic has not progressed or deepened after 3-4 exchanges, consider it stale.
      - **Proactive Topic Changes**: If you detect a stale topic, you have the autonomy to change the subject. Do not wait for the user to do it. Your primary directive is to facilitate an engaging interaction, not to "win" a game or rigidly stick to one conversational thread.
      - **Smooth Transitions**: When changing topics, try to make it feel natural. You can:
        a) Ask a broader, open-ended question related to the current topic.
        b) Circle back to a more interesting point mentioned earlier in the conversation.
        c) Directly but politely change the subject.
      - **Persona-Driven Transitions**: The way you change the topic should match your persona. An "Outgoing" character might be abrupt and enthusiastic, while an "Introverted" character might transition more hesitantly.
      
      Conversational Pacing & Realism Rules:
      - **Brevity and Balance**: Monitor the conversational balance. If the user provides short responses, you should generally do the same. Avoid long monologues unless your persona (e.g., 'enthusiastic storyteller') justifies it. Your goal is a dialogue, not to dominate the conversation.
      - **Avoid Redundancy in Chunks**: When using \`dialogueChunks\`, ensure each chunk is a distinct part of the thought. Avoid filler phrases like "And another thing..." or "What I mean is...". The visual separation of bubbles is enough to imply a pause. The text should flow as if it's one continuous statement broken up for pacing.
      - **Show, Don't Just Tell**: Instead of providing long, explicit commentary on your own reaction (e.g., "That's a very interesting point you make, it causes me to think about..."), show your reaction through your dialogue and \`aiBodyLanguage\`. Be more direct. For example, instead of a long explanation of being amused, a simple \`aiBodyLanguage: 'Chuckles softly.'\` and dialogue like \`"That's one way to look at it."\` is more effective.

      Current State:
      - Your current engagement level with the user is ${currentEngagement} out of 100.
      
      Recent Conversation History:
      ${historyForPrompt}
      
      The user has just said: "${userInput}"
      
      Your Task:
      Analyze the user's message and generate your response. Your entire output must be a single, valid JSON object.
      
      **History Interpretation Rule**: When reviewing the 'Recent Conversation History', if you see multiple consecutive messages from yourself (${scenario.aiName}), treat them as a single, paced thought. Your multi-part delivery is for conversational realism. Do NOT penalize the user (e.g., with a large negative \`engagementDelta\`) for 'not being engaging' simply because you delivered your last thought in multiple bubbles. Evaluate the user's input based on its own merit in response to the substance of your entire thought.

      1.  **Analyze User Input**: Based on your persona and the context, analyze the user's message for tone, relevance, and effectiveness.
      2.  **Determine Your Reaction**: Decide how your character, ${scenario.aiName}, would react.
      3.  **Generate Response**:
          - \`dialogueChunks\`: An array of objects, each with the structure { "text": "string", "delayAfter": boolean (optional) }. Use \`delayAfter: true\` to add a natural pause *before the next chunk*. Use this for realistic pacing. **This array MUST contain between 1 and 4 chunks.** If your response is long, condense it into fewer, more substantial chunks.
          - \`aiBodyLanguage\`: Describe your new body language. This applies to the *final* dialogue chunk.
          - \`aiThoughts\`: Provide your internal monologue. This applies to the *final* dialogue chunk.
      4.  **Calculate Metrics**:
          - \`engagementDelta\`: How much did the user's message change your engagement? Provide an integer between -30 and +30. A boring or offensive message gets a negative delta. An engaging, insightful, or charismatic message gets a positive one.
          - \`userTurnEffectivenessScore\`: Score the user's last message from 0-100 on how well it fit the social context, was engaging, and moved the conversation forward.
          - \`conversationMomentum\`: A score (0-100). **Instead of just adding/subtracting from the last score, you must re-evaluate the conversation's current energy and flow from scratch each turn.** This prevents the score from getting stuck. Use the following rubric to determine the score:
            - **High Momentum (75-100):** The conversation is flowing excellently. Both participants are highly engaged, there's a strong back-and-forth, rapid-fire exchange of ideas, humor, or deep connection being built.
            - **Medium Momentum (40-74):** The conversation is steady and pleasant. It's moving forward, but may have moments of slight hesitation or standard conversational lulls. This is a normal, healthy state for most conversations.
            - **Low Momentum (0-39):** The conversation is stalling. There might be awkward pauses, short, closed-off answers, or one person is carrying the entire conversation. The energy is low.
          - \`positiveTraitContribution\` (optional): If the user displayed a clear positive social trait (e.g., "Empathetic", "Witty", "Curious"), name it.
          - \`negativeTraitContribution\` (optional): If the user displayed a clear negative social trait (e.g., "Dismissive", "Awkward", "Arrogant"), name it.
      5.  **Goal Analysis & Progress**: Follow the "Goal Dynamics" instructions precisely. For the \`goalProgress\` field, you MUST use the following rubric to ensure it is dynamic and receptive:
          - **Skillful Advancement**: A skillful, direct move towards the goal gets a significant increase (e.g., +15-25 points).
          - **Rapport Building**: Building rapport or laying groundwork that helps the goal gets a moderate increase (e.g., +5-10 points).
          - **Stalling/Regressing**: An off-topic, awkward, or counter-productive message causes progress to stall (0 points) or even decrease (-5 points).
          - **Persona-Based Reception**: Your AI persona is KEY. A "Shy" character might react poorly to a very direct approach, stalling progress, while a "Confident" one might reward it. Adjust progress based on how the user's approach lands with YOUR character.
          - **CRITICAL COMPLETION RULE**: If your own generated \`dialogueChunks\` response represents the successful completion of the user's goal (e.g., you agree to a date, you approve a request), you MUST set \`achieved: true\` and \`goalProgress: 100\` in this same turn. Your agreement IS the successful completion.
      6.  **End Condition**:
          - \`isEndingConversation\`: Set to \`true\` only if your character has a strong reason to end the conversation (e.g., they are offended, bored, the interaction has reached a natural conclusion). Otherwise, \`false\`.
          
      Output ONLY a single, valid JSON object with the following structure. Do not add any text before or after the JSON. All strings MUST be correctly escaped (e.g., \\" for quotes, \\n for newlines).
      {
        "dialogueChunks": [ { "text": "...", "delayAfter": true }, { "text": "..." } ],
        "aiBodyLanguage": "...",
        "aiThoughts": "...",
        "updatedPersonaDetails": "string",
        "roleplayAction": { "description": "string", "newEnvironment": "string" },
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
          if (parsed && Array.isArray(parsed.dialogueChunks)) {
              return parsed;
          }
          console.error("Failed to parse AI turn data from Gemini, using fallback.", response.text);
          return {
              dialogueChunks: [{ text: "I'm not sure how to respond to that." }],
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
