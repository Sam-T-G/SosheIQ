

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
  // Social Style (8)
  INTROVERTED = "Introverted",
  OUTGOING = "Outgoing", // Replaced EXTROVERTED
  RESERVED = "Reserved", // Replaced ALOOF
  SOCIABLE = "Sociable", // Replaced GREGARIOUS
  FLIRTATIOUS = "Flirtatious",
  FORMAL = "Formal",
  INFORMAL = "Informal",
  GUARDED = "Guarded", // New

  // Emotional Tone (10)
  ANXIOUS = "Anxious",
  CYNICAL = "Cynical", // Replaced JADED
  HAPPY = "Happy", // Replaced CHEERFUL
  SAD = "Sad", // Replaced MELANCHOLY
  IRRITABLE = "Irritable",
  EMPATHETIC = "Empathetic",
  CALM = "Calm",
  PLAYFUL = "Playful",
  SERIOUS = "Serious",
  ENTHUSIASTIC = "Enthusiastic", // New

  // Intellectual Style (10)
  PHILOSOPHICAL = "Philosophical",
  ACADEMIC = "Academic", // Replaced PEDANTIC
  INQUISITIVE = "Inquisitive",
  NAIVE = "Naive",
  EXPERIENCED = "Experienced", // Replaced WORLDLY
  ANALYTICAL = "Analytical",
  CURIOUS = "Curious",
  CREATIVE = "Creative",
  LOGICAL = "Logical",
  IMAGINATIVE = "Imaginative", // New

  // Core Traits (16)
  CONFIDENT = "Confident",
  SHY = "Shy",
  AMBITIOUS = "Ambitious",
  HUMBLE = "Humble",
  UNCONVENTIONAL = "Unconventional", // Replaced ECCENTRIC
  UNEMOTIONAL = "Unemotional", // Replaced STOIC
  IMPULSIVE = "Impulsive",
  SUPPORTIVE = "Supportive",
  ASSERTIVE = "Assertive",
  DIRECT = "Direct",
  SARCASTIC = "Sarcastic",
  WITTY = "Witty",
  CHALLENGING = "Challenging",
  SKEPTICAL = "Skeptical",
  OPTIMISTIC = "Optimistic",
  PESSIMISTIC = "Pessimistic",
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

export interface AiTurnResponse {
    dialogueChunks: DialogueChunk[];
    aiBodyLanguage: string;
    aiThoughts: string;
    engagementDelta: number;
    userTurnEffectivenessScore: number;
    conversationMomentum: number;
    positiveTraitContribution?: string;
    negativeTraitContribution?: string;
    isEndingConversation: boolean;
    isUserActionSuggested?: boolean; // New field for suggesting a non-verbal user action
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
  sender: 'user' | 'ai' | 'system';
  text: string;
  dialogueChunks?: DialogueChunk[];
  bodyLanguageDescription?: string;
  aiThoughts?: string;
  conversationMomentum?: number;
  userTurnEffectivenessScore?: number;
  engagementDelta?: number;
  positiveTraitContribution?: string;
  negativeTraitContribution?: string;
  imagePrompt?: string;
  imageUrl?: string; // base64
  fallbackImageUrl?: string; // base64 for previous turn's image
  timestamp: Date;
  isThoughtBubble?: boolean;
  goalChange?: {
    type: 'established' | 'changed' | 'removed';
    from?: string;
    to?: string;
  };
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