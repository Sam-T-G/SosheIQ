export enum SocialEnvironment {
  CASUAL = "Casual Encounter",
  DATING = "On a Date",
  WORK = "Work Environment",
  SOCIAL_GATHERING = "Social Gathering",
  FAMILY = "Family Interaction",
  CUSTOMER_SERVICE = "Customer Service",
  NEGOTIATION = "Negotiation",
  CUSTOM = "Custom...",
}

export enum AIPersonalityTrait {
  // Communication Style
  TALKATIVE = "Talkative",
  QUIET = "Quiet",
  DIRECT = "Direct",
  SARCASTIC = "Sarcastic",
  FORMAL = "Formal",
  INFORMAL = "Informal",
  WITTY = "Witty",
  ASSERTIVE = "Assertive",

  // General Mood
  CHEERFUL = "Cheerful",
  GRUMPY = "Grumpy",
  ANXIOUS = "Anxious",
  CALM = "Calm",
  SERIOUS = "Serious",
  PLAYFUL = "Playful",
  SAD = "Sad",
  ENTHUSIASTIC = "Enthusiastic",
  
  // Attitude / Outlook
  OPTIMISTIC = "Optimistic",
  PESSIMISTIC = "Pessimistic",
  SUPPORTIVE = "Supportive",
  CHALLENGING = "Challenging",
  CURIOUS = "Curious",
  SKEPTICAL = "Skeptical",
  CREATIVE = "Creative",
  LOGICAL = "Logical",
  METHODICAL = "Methodical",
  PRAGMATIC = "Pragmatic",
  IDEALISTIC = "Idealistic",

  // Social Behavior
  CONFIDENT = "Confident",
  SHY = "Shy",
  FLIRTATIOUS = "Flirtatious",
  GUARDED = "Guarded",
  EMPATHETIC = "Empathetic",
  HUMBLE = "Humble",
  AMBITIOUS = "Ambitious",
  IMPULSIVE = "Impulsive",
  SPONTANEOUS = "Spontaneous",
  INTROVERTED = "Introverted",
  EXTROVERTED = "Extroverted",
  NURTURING = "Nurturing",
}


export enum AIGender {
  RANDOM = "Random",
  MALE = "Male",
  FEMALE = "Female",
  NON_BINARY = "Non-binary",
}

export enum AIAgeBracket {
  NOT_SPECIFIED = "Not Specified / Auto",
  TEENAGER = "Teenager (13-17)",
  YOUNG_ADULT_18_23 = "Young Adult (18-23)",
  YOUNG_ADULT_24_29 = "Young Adult (24-29)",
  ADULT_30_39 = "Adult (30-39)",
  ADULT_40_50 = "Adult (40-50)",
  SENIOR_51_PLUS = "Senior (51+)",
  CUSTOM = "Custom Age",
}

// New interface for structured visual memory
export interface EstablishedVisuals {
  characterDescription: string; // "a woman in her late 20s with long, curly brown hair and green eyes"
  clothingDescription: string; // "wearing a simple black t-shirt and blue jeans"
  heldObjects: string; // "holding a coffee mug in her right hand", "hands are free"
  bodyPosition: string; // "sitting at a small wooden table", "leaning against a wall"
  gazeDirection: string; // "looking directly at you", "looking out the window"
  positionRelativeToUser: string; // "sitting across the table from you", "standing a few feet away"
  environmentDescription: string; // "in a dimly lit, cozy coffee shop"
  currentPoseAndAction: string; // "leaning forward slightly, with a curious expression" - This is the most immediate action
}


export interface ScenarioDetails {
  environment: SocialEnvironment;
  customEnvironment?: string;
  aiCulture?: string;
  aiPersonalityTraits: AIPersonalityTrait[];
  customAiPersonality?: string;
  aiGender: AIGender;
  aiName: string;
  aiAgeBracket?: AIAgeBracket;
  customAiAge?: number;
  customContext?: string;
  conversationGoal?: string;
  establishedVisuals?: EstablishedVisuals | null;
  isRandomScenario?: boolean;
}

export interface DialogueChunk {
  text: string;
  type: 'dialogue' | 'action';
  delayAfter?: boolean;
}

export interface ActiveAction {
  description: string;
  progress: number; // 0-100
}

export interface UserTurnFeedback {
  engagementDelta: number;
  userTurnEffectivenessScore: number;
  positiveTraitContribution?: string;
  negativeTraitContribution?: string;
  badgeReasoning?: string;
  nextStepSuggestion?: string;
  alternativeSuggestion?: string;
}

export interface AiTurnResponse {
    aiName?: string; // Only present in the first turn
    scenarioBackstory?: string; // For "I'm Feeling Lucky"
    dialogueChunks: DialogueChunk[];
    aiBodyLanguage: string;
    aiThoughts: string;
    conversationMomentum: number;
    feedbackOnUserTurn?: UserTurnFeedback;
    isEndingConversation: boolean;
    isUserActionSuggested?: boolean;
    shouldGenerateNewImage: boolean;
    contextualSummary?: string; // New field for gallery text
    emergingGoal?: string;
    goalProgress: number;
    achieved: boolean;
    updatedPersonaDetails?: string;
    activeAction?: ActiveAction;
    updatedEstablishedVisuals?: EstablishedVisuals;
    newEnvironment?: string;
}


export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai' | 'system' | 'backstory' | 'user_action';
  text: string;
  dialogueChunks?: DialogueChunk[];
  bodyLanguageDescription?: string;
  aiThoughts?: string;
  conversationMomentum?: number;
  userTurnEffectivenessScore?: number;
  engagementDelta?: number;
  positiveTraitContribution?: string;
  negativeTraitContribution?: string;
  badgeReasoning?: string;
  nextStepSuggestion?: string;
  alternativeSuggestion?: string;
  imagePrompt?: string;
  imageUrl?: string; // base64
  fallbackImageUrl?: string; // base64 for previous turn's image
  contextualSummary?: string; // New field for gallery text
  timestamp: Date;
  isThoughtBubble?: boolean;
  goalChange?: {
    type: 'established' | 'changed' | 'removed';
    from?: string;
    to?: string;
  };
  isRetryable?: boolean;
  originalMessageText?: string;
}

export interface TurnByTurnAnalysisItem {
  aiResponse?: string;
  aiBodyLanguage?: string;
  aiThoughts?: string;
  conversationMomentum?: number;
  goalChange?: ChatMessage['goalChange'];
  userInput?: string;
  userTurnEffectivenessScore?: number;
  engagementDelta?: number;
  positiveTraitContribution?: string;
  negativeTraitContribution?: string;
  analysis?: string;
}

export interface AnalysisReport {
  overallCharismaScore: number;
  responseClarityScore: number;
  engagementMaintenanceScore: number;
  adaptabilityScore: number;
  goalAchievementScore?: number;
  overallAiEffectivenessScore?: number;
  finalEngagementSnapshot: number;
  turnByTurnAnalysis: TurnByTurnAnalysisItem[];
  strengths: string;
  areasForImprovement: string;
  actionableTips: string;
  thingsToAvoid: string;
  goalAchievementFeedback?: string;
  aiEvolvingThoughtsSummary?: string;
}

export enum GamePhase {
  HERO = "hero",
  INSTRUCTIONS = "instructions",
  SETUP = "setup",
  INTERACTION = "interaction",
  ANALYSIS = "analysis",
}