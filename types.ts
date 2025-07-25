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
	// 1. Social Orientation (Agency × Affiliation, Interpersonal Circumplex)
	OUTGOING = "Outgoing",
	RESERVED = "Reserved",
	WARM = "Warm",
	GUARDED = "Guarded",
	FLIRTATIOUS = "Flirtatious",
	STOIC = "Stoic",
	SPONTANEOUS = "Spontaneous",
	METHODICAL = "Methodical",
	CHARMING = "Charming",
	ALOOF = "Aloof",
	NURTURING = "Nurturing",
	PLAYFUL = "Playful",
	COMPETITIVE = "Competitive",
	COOPERATIVE = "Co-operative",

	// 2. Communication Tone (Delivery style / pragmatics)
	TALKATIVE = "Talkative",
	CONCISE = "Concise",
	DIRECT = "Direct",
	DIPLOMATIC = "Diplomatic",
	WITTY = "Witty",
	DRY_HUMORED = "Dry-humored",
	FORMAL = "Formal",
	CASUAL = "Casual",
	STORYTELLING = "Story-telling",
	SARCASTIC = "Sarcastic",
	SUPPORTIVE = "Supportive",
	ENCOURAGING = "Encouraging",
	ASSERTIVE = "Assertive",
	REFLECTIVE = "Reflective",
	ANIMATED = "Animated",
	MATTER_OF_FACT = "Matter-of-fact",

	// 3. Emotional Temperature (Baseline affect)
	CHEERFUL = "Cheerful",
	CALM = "Calm",
	ENTHUSIASTIC = "Enthusiastic",
	IRRITABLE = "Irritable",
	ANXIOUS = "Anxious",
	MELANCHOLIC = "Melancholic",
	BALANCED = "Balanced", // formerly EVEN_KEELED
	LIVELY = "Lively",
	MOODY = "Moody",
	SENTIMENTAL = "Sentimental",
	STOIC_EMO = "Stoic", // To distinguish from Social Orientation's Stoic
	LIGHT_HEARTED = "Light-hearted",
	SENSITIVE = "Sensitive",
	SERENE = "Serene",

	// 4. Motivational Drive & Self-Regulation (Conscientiousness / effortful control)
	AMBITIOUS = "Ambitious",
	LAID_BACK = "Laid-back",
	GOAL_ORIENTED = "Goal-oriented",
	SUPPORTIVE_MOTIV = "Supportive", // To distinguish from Communication Tone's Supportive
	PATIENT = "Patient",
	RESTLESS = "Restless",
	ADAPTIVE = "Adaptive",
	IMPULSIVE = "Impulsive",
	PERSISTENT = "Persistent",
	DISCIPLINED = "Disciplined",
	PROCRASTINATING = "Procrastinating",
	OPPORTUNISTIC = "Opportunistic",
	RESILIENT = "Resilient",
	DETAIL_DRIVEN = "Detail-driven",

	// 5. Cognitive Lens (Openness & thinking style)
	ANALYTICAL = "Analytical",
	CREATIVE = "Creative",
	LOGICAL = "Logical",
	IMAGINATIVE = "Imaginative",
	PRACTICAL = "Practical",
	VISIONARY = "Visionary",
	CURIOUS = "Curious",
	SKEPTICAL = "Skeptical",
	DETAIL_ORIENTED = "Detail-oriented",
	BIG_PICTURE = "Big-picture",
	EXPERIMENTAL = "Experimental",
	INTUITIVE = "Intuitive",
	STRUCTURED = "Structured",
	ABSTRACT_MINDED = "Abstract-minded",

	// 6. Outlook / World-View (Valence & explanatory style)
	OPTIMISTIC = "Optimistic",
	REALISTIC = "Realistic",
	PESSIMISTIC = "Pessimistic",
	PRAGMATIC = "Pragmatic",
	IDEALISTIC = "Idealistic",
	GROWTH_MINDED = "Growth-minded",
	TRADITION_MINDED = "Tradition-minded",
	EXISTENTIAL = "Existential",
	ROMANTIC = "Romantic",
	CYNICAL = "Cynical",
	ALTRUISTIC = "Altruistic",
	STOIC_WORLDVIEW = "Stoic", // To distinguish from other Stoic usages
	CHALLENGING = "Challenging",
	COMMUNITY_FOCUSED = "Community-focused",

	// Legacy/compatibility traits (if needed)
	CONFIDENT = "Confident",
	SHY = "Shy",
	EMPATHETIC = "Empathetic",
	HUMBLE = "Humble",
	INTROVERTED = "Introverted",
	EXTROVERTED = "Extroverted",
	SAD = "Sad",
	GRUMPY = "Grumpy",
	SERIOUS = "Serious",
}

export enum AIGender {
	RANDOM = "Random",
	MALE = "Male",
	FEMALE = "Female",
	NON_BINARY = "Non-binary",
}

export enum AIAgeBracket {
	NOT_SPECIFIED = "Not Specified / Auto",
	YOUNG_ADULT_18_23 = "Young Adult (18-23)",
	YOUNG_ADULT_24_29 = "Young Adult (24-29)",
	ADULT_30_39 = "Adult (30-39)",
	ADULT_40_50 = "Adult (40-50)",
	SENIOR_51_PLUS = "Senior (51+)",
	CUSTOM = "Custom Age",
}

// Error types for proper error handling
export interface ApiError {
	message: string;
	code?: number;
	status?: string;
	details?: string;
}

export interface ServiceError extends ApiError {
	service: "gemini" | "imagen" | "general";
	timestamp: Date;
}

export interface ValidationError {
	field: string;
	message: string;
	value?: unknown;
}

// Icon component interface
export interface IconComponentProps {
	className?: string;
	size?: number;
	color?: string;
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
	facialAccessories?: string; // e.g., "wearing glasses, nose ring"; default: ""
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
	type: "dialogue" | "action";
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
	inferredUserAction?: string; // For AI-inferred user actions from silent continue button
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
	activeAction?: ActiveAction | null;
	updatedEstablishedVisuals?: EstablishedVisuals | null;
	newEnvironment?: string;
}

// New interface for the initial conversation response
export interface StartConversationResponse extends AiTurnResponse {
	aiName: string;
	scenarioBackstory?: string;
	initialDialogueChunks: DialogueChunk[];
	initialBodyLanguage: string;
	initialAiThoughts: string;
	initialEngagementScore: number;
	initialConversationMomentum: number;
	conversationStarter: "user" | "ai";
	establishedVisuals: EstablishedVisuals;
}

export interface ChatMessage {
	id: string;
	sender: "user" | "ai" | "system" | "backstory" | "user_action";
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
		type: "established" | "changed" | "removed";
		from?: string;
		to?: string;
	};
	isRetryable?: boolean;
	originalMessageText?: string;
	isInferredAction?: boolean; // Indicates if this user_action is an AI-inferred action from the continue button
}

export interface TurnByTurnAnalysisItem {
	aiResponse?: string;
	aiBodyLanguage?: string;
	aiThoughts?: string;
	conversationMomentum?: number;
	goalChange?: ChatMessage["goalChange"];
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
	LOGIN = "login",
	ABOUT = "about",
	PRIVACY = "privacy",
	TERMS = "terms",
	SAFETY = "safety",
	INSTRUCTIONS = "instructions",
	SETUP = "setup",
	INTERACTION = "interaction",
	ANALYSIS = "analysis",
}

// Z-Index system for consistent layering
export const Z_INDEX_LAYERS = {
	BASE: 0,
	CONTENT: 1,
	OVERLAY: 100,
	MODAL: 200,
	TOOLTIP: 300,
	DROPDOWN: 400,
	LOADING: 500,
	NOTIFICATION: 600,
	DIALOG: 700,
	POPUP: 800,
	FIXED_HEADER: 900,
	FIXED_FOOTER: 950,
	HIGHEST: 1000,
} as const;

// Animation timing constants
export const ANIMATION_DURATIONS = {
	FAST: 150,
	NORMAL: 300,
	SLOW: 500,
	VERY_SLOW: 1000,
} as const;

// Environment validation interface
export interface EnvironmentConfig {
	apiKey: string;
	geminiModel: string;
	imagenModel: string;
	isDevelopment: boolean;
	isProduction: boolean;
}

// Session storage interface
export interface StoredSession {
	id: string;
	timestamp: Date;
	scenarioDetails: ScenarioDetails;
	conversationHistory: ChatMessage[];
	finalEngagement: number;
	analysisReport?: AnalysisReport;
}

// Authentication types
export type AuthenticationStatus =
	| "loading"
	| "guest"
	| "authenticated"
	| "unauthenticated";

export interface User {
	id: string;
	name: string;
	email?: string;
	avatar?: string;
	authProvider?: "google" | "apple" | "email" | "guest";
	createdAt: Date;
	lastLoginAt: Date;
}

export interface AuthState {
	status: AuthenticationStatus;
	user: User | null;
	isLoading: boolean;
	error: string | null;
}

export interface AuthContextValue extends AuthState {
	login: (
		provider: "google" | "apple" | "email",
		credentials?: any
	) => Promise<void>;
	loginAsGuest: () => Promise<void>;
	logout: () => Promise<void>;
	clearError: () => void;
}

export interface AuthProviderProps {
	children: React.ReactNode;
}

// User persona/configuration structure for future expansion
export interface UserScenarioDetails {
	userName?: string;
	occupation?: string;
	hobbies?: string[];
	heldObjects?: string;
}
