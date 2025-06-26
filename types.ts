
export enum SocialEnvironment {
  DATING = "Dating",
  WORK = "Work Environment",
  SOCIAL_GATHERING = "Social Gathering (e.g., party, networking event)",
  FAMILY = "Family Interaction",
  CUSTOMER_SERVICE = "Customer Service Scenario",
  NEGOTIATION = "Negotiation or Debate",
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
  AI_IS_AUTHORITY = "AI is Authority (e.g., boss, interviewer, expert)",
  USER_IS_AUTHORITY = "User is Authority (e.g., you're the boss, interviewer)",
  PEERS_EQUAL_FOOTING = "Peers / Equal Footing",
  USER_SEEKS_FAVOR = "User Seeks Favor (e.g., asking for help, making a request)",
  AI_SEEKS_FAVOR = "AI Seeks Favor (e.g., AI needs your help or input)",
}

export enum AIGender {
  MALE = "Male",
  FEMALE = "Female",
  NON_BINARY = "Non-binary",
  PREFER_NOT_TO_SPECIFY = "Prefer Not to Specify / Neutral",
}

export enum AIAgeBracket {
  NOT_SPECIFIED = "Not Specified / Auto",
  TEENAGER = "Teenager (13-17)",
  YOUNG_ADULT_18_23 = "Young Adult (18-23)",
  YOUNG_ADULT_24_29 = "Young Adult (24-29)",
  ADULT_30_39 = "Adult (30-39)",
  ADULT_40_50 = "Adult (40-50)",
  SENIOR_51_PLUS = "Senior (51+)",
  CUSTOM = "Custom Age", // For internal use when custom age is entered
}

export interface ScenarioDetails {
  environment: SocialEnvironment;
  aiPersonalityTraits: AIPersonalityTrait[];
  customAiPersonality?: string;
  powerDynamic: PowerDynamic;
  aiGender: AIGender;
  aiName: string;
  aiAgeBracket?: AIAgeBracket;
  customAiAge?: number; // To store validated custom age
  customContext?: string;
  aiEstablishedVisualPromptSegment?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  bodyLanguageDescription?: string;
  aiThoughts?: string;
  conversationMomentum?: number;
  imagePrompt?: string;
  imageUrl?: string; // base64
  timestamp: Date;
  isThoughtBubble?: boolean;
  isThinkingBubble?: boolean; // Used for the AI "..." thinking animation
}

export interface TurnByTurnAnalysisItem {
  userInput?: string;
  aiResponse?: string;
  aiBodyLanguage?: string;
  aiThoughts?: string;
  userTurnEffectivenessScore?: number;
  conversationMomentum?: number;
  analysis: string;
}

export interface AnalysisReport {
  overallCharismaScore: number;
  responseClarityScore: number;
  engagementMaintenanceScore: number;
  adaptabilityScore: number;
  overallAiEffectivenessScore?: number;
  finalEngagementSnapshot: number;
  turnByTurnAnalysis: TurnByTurnAnalysisItem[];
  overallFeedback: string;
  aiEvolvingThoughtsSummary?: string;
}

export enum GamePhase {
  HERO = "hero",
  INSTRUCTIONS = "instructions",
  SETUP = "setup",
  INTERACTION = "interaction",
  ANALYSIS = "analysis",
}
