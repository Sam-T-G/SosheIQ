
export enum SocialEnvironment {
  DATING = "Dating",
  WORK = "Work Environment",
  SOCIAL_GATHERING = "Social Gathering (e.g., party, networking event)",
  FAMILY = "Family Interaction",
  CUSTOMER_SERVICE = "Customer Service Scenario",
  NEGOTIATION = "Negotiation or Debate",
}

export enum AIPersonality {
  FRIENDLY_SUPPORTIVE = "Friendly & Supportive",
  RESERVED_OBSERVANT = "Reserved & Observant",
  ASSERTIVE_DIRECT = "Assertive & Direct",
  SARCASTIC_WITTY = "Sarcastic & Witty",
  ANALYTICAL_CURIOUS = "Analytical & Curious",
  CHALLENGING_SKEPTICAL = "Challenging & Skeptical",
  ENERGETIC_ENTHUSIASTIC = "Energetic & Enthusiastic",
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
  YOUNG_ADULT = "Young Adult (18-29)",
  ADULT = "Adult (30-55)",
  SENIOR = "Senior (55+)",
}

export interface ScenarioDetails {
  environment: SocialEnvironment;
  aiPersonality: AIPersonality;
  powerDynamic: PowerDynamic;
  aiGender: AIGender;
  aiName: string;
  aiAgeBracket?: AIAgeBracket; 
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
  aiEvolvingThoughtsSummary?: string; // Renamed from aiReflectionOnThoughts
}

export enum GamePhase {
  HERO = "hero",
  INSTRUCTIONS = "instructions",
  SETUP = "setup",
  INTERACTION = "interaction",
  ANALYSIS = "analysis",
}