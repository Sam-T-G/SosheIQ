
export const GEMINI_TEXT_MODEL = "gemini-2.5-flash-preview-04-17";
export const IMAGEN_MODEL = "imagen-3.0-generate-002";

export const MAX_CONVERSATION_HISTORY_FOR_PROMPT = 10; // Max recent messages to send to AI
export const MAX_HISTORY_FOR_ANALYSIS = 30; // Max recent messages to send for analysis report

export const ENGAGEMENT_BAR_COLORS: Record<string, string> = {
    low: 'bg-red-500',
    medium: 'bg-yellow-500',
    high: 'bg-green-500',
};

export const INITIAL_ENGAGEMENT = 30;
export const MAX_ZERO_ENGAGEMENT_STREAK = 3; // Reduced for faster game end if engagement is very low
export const ENGAGEMENT_DECAY_PER_TURN = 2; // Engagement decrease per AI turn to simulate time passing

export const SILENT_USER_ACTION_TOKEN = "[[USER_CONTINUES_SILENTLY]]";