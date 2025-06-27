
export enum SocialEnvironment {
  CASUAL = "Casual Chat",
  DATING = "Dating",
  WORK = "Work Environment",
  SOCIAL_GATHERING = "Social Gathering",
  FAMILY = "Family Interaction",
  CUSTOMER_SERVICE = "Customer Service",
  NEGOTIATION = "Negotiation",
  CUSTOM = "Custom...",
}

export enum AIPersonalityTrait {
  FRIENDLY = "Friendly",
  SUPPORTIVE = "Supportive",
  RESERVED = "Reserved",
  OBSERVANT = "Observant",
  ASSERTIVE = "Assertive",
  DIRECT = "Direct",
  SARCASTIC = "Sarcastic",
  WITTY = "Witty",
  ANALYTICAL = "Analytical",
  CURIOUS = "Curious",
  CHALLENGING = "Challenging",
  SKEPTICAL = "Skeptical",
  ENERGETIC = "Energetic",
  ENTHUSIASTIC = "Enthusiastic",
  EMPATHETIC = "Empathetic",
  CALM = "Calm",
  PLAYFUL = "Playful",
  SERIOUS = "Serious",
  CREATIVE = "Creative",
  LOGICAL = "Logical",
  CONFIDENT = "Confident",
  SHY = "Shy",
  OPTIMISTIC = "Optimistic",
  PESSIMISTIC = "Pessimistic",
  FORMAL = "Formal",
  INFORMAL = "Informal",
}

export enum PowerDynamic {
  BALANCED = "Balanced / Peers",
  AI_IS_AUTHORITY = "AI is Authority",
  USER_IS_AUTHORITY = "User is Authority",
  USER_SEEKS_FAVOR = "User Seeks Favor",
  AI_SEEKS_FAVOR = "AI Seeks Favor",
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

export interface ScenarioDetails {
  environment: SocialEnvironment;
  customEnvironment?: string;
  aiCulture?: string;
  aiPersonalityTraits: AIPersonalityTrait[];
  customAiPersonality?: string;
  powerDynamic: PowerDynamic;
  aiGender: AIGender;
  aiName: string;
  aiAgeBracket?: AIAgeBracket;
  customAiAge?: number;
  customContext?: string;
  conversationGoal?: string;
  aiEstablishedVisualPromptSegment?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  bodyLanguageDescription?: string;
  aiThoughts?: string;
  conversationMomentum?: number;
  userTurnEffectivenessScore?: number;
  engagementDelta?: number;
  positiveTraitContribution?: string;
  negativeTraitContribution?: string;
  imagePrompt?: string;
  imageUrl?: string; // base64
  timestamp: Date;
  isThoughtBubble?: boolean;
  isThinkingBubble?: boolean;
}

export interface TurnByTurnAnalysisItem {
  // AI's part of the exchange
  aiResponse?: string;
  aiBodyLanguage?: string;
  aiThoughts?: string;
  conversationMomentum?: number;

  // User's part of the exchange
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
