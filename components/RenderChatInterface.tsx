import React, {
	useState,
	useEffect,
	useRef,
	useCallback,
} from "react";
import type { ChatMessage, ActiveAction, UserTurnFeedback } from "../types";
import {
	SendIcon,
	StopCircleIcon,
	PlayIcon,
	GestureIcon,
    ArrowRightIcon,
    SparklesIcon,
} from "./Icons";
import { motion, AnimatePresence } from "motion/react";

// --- Minimalist Void Components ---

const VoidBadge: React.FC<{ text: string; type: 'positive' | 'negative' | 'neutral' }> = ({ text, type }) => {
    const color = type === 'positive' ? 'text-cyan-400 border-cyan-400/30' : type === 'negative' ? 'text-red-400 border-red-400/30' : 'text-white/40 border-white/10';
    return <span className={`text-[10px] font-mono uppercase tracking-wider ${color} border px-1.5 py-0.5 rounded bg-black/50 backdrop-blur-sm`}>{text}</span>;
};

const VoidMessage: React.FC<{
    message: ChatMessage;
    isLast: boolean;
    scenarioDetailsAiName: string;
}> = ({ message, isLast, scenarioDetailsAiName }) => {
    const isAI = message.sender === "ai";
    const isUser = message.sender === "user";
    const isAction = message.sender === "user_action";
    const isSystem = message.sender === "system";
    const isBackstory = message.sender === "backstory";

    if (isSystem) {
        return (
            <div className="py-2 text-center opacity-50">
                <span className="text-xs font-mono text-white/40 uppercase tracking-widest">[{message.text}]</span>
            </div>
        );
    }

    if (isBackstory) {
        return (
            <div className="py-6 border-y border-white/10 my-6">
                <span className="block text-xs font-mono text-cyan-500/70 uppercase tracking-widest mb-3">Context Data</span>
                <p className="text-sm font-mono text-gray-400 leading-relaxed">{message.text}</p>
            </div>
        );
    }

    const label = isAI ? scenarioDetailsAiName.toUpperCase() : isUser ? "USER" : "ACTION";
    // Increased contrast for labels
    const labelColor = isAI ? "text-cyan-400" : isUser ? "text-white/80" : "text-emerald-400";
    
    return (
        <motion.div 
            layout
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            className={`py-4 font-mono group ${isAction ? "pl-4 border-l-2 border-emerald-500/20" : ""}`}
        >
            <div className="flex items-baseline gap-4 mb-2">
                <span className={`text-xs font-bold tracking-widest uppercase min-w-[80px] text-right ${labelColor}`}>{label}</span>
                {isAI && message.bodyLanguageDescription && (
                    // Increased contrast for body language: text-white/30 -> text-gray-500
                    <span className="text-xs text-gray-500 italic">({message.bodyLanguageDescription})</span>
                )}
            </div>
            <div className="pl-[96px] pr-4 md:pr-12">
                {/* Increased contrast for message text: text-white/90 -> text-gray-200, text-white/50 -> text-gray-400 */}
                <p className={`text-sm md:text-base leading-relaxed ${isAction ? "text-emerald-400/80 italic" : "text-gray-200"}`}>
                    {message.text}
                </p>
                
                {/* Feedback Badges (Minimalist) */}
                {(message.positiveTraitContribution || message.negativeTraitContribution || message.engagementDelta) && (
                    <div className="flex flex-wrap gap-2 mt-3 opacity-80 group-hover:opacity-100 transition-opacity">
                        {message.positiveTraitContribution && <VoidBadge text={`${message.positiveTraitContribution} +`} type="positive" />}
                        {message.negativeTraitContribution && <VoidBadge text={`${message.negativeTraitContribution} -`} type="negative" />}
                        {message.engagementDelta !== undefined && message.engagementDelta !== 0 && (
                            <VoidBadge text={`ENG ${message.engagementDelta > 0 ? '+' : ''}${message.engagementDelta}%`} type={message.engagementDelta > 0 ? 'positive' : 'negative'} />
                        )}
                    </div>
                )}
            </div>
        </motion.div>
    );
};

interface RenderChatInterfaceProps {
	conversationHistory: ChatMessage[];
	currentEngagement: number;
	displayedGoal: { text: string; progress: number } | null;
	activeAction: ActiveAction | null;
	isActionPaused: boolean;
	isPinnable: boolean;
	isGoalPinned: boolean;
	onPinGoal: (goalText: string) => void;
	onUnpinGoal: () => void;
	isContinueActionSuggested: boolean;
	onSendMessage: (messages: { gesture?: string; dialogue?: string }) => void;
	onEndConversation: () => void;
	onFastForwardAction: () => void;
	onContinueWithoutSpeaking: () => void;
	onRetryMessage: (messageText: string) => void;
	isLoadingAI: boolean;
	scenarioDetailsAiName: string;
	isMaxEngagement: boolean;
	isOverlay: boolean;
	onToggleHelp: () => void;
	onViewImage: (url: string | null) => void;
	goalJustChanged: boolean;
	onAnimationComplete: () => void;
	pendingFeedback: { messageId: string; feedback: UserTurnFeedback } | null;
	onFeedbackAnimationComplete: (
		messageId: string,
		feedback: UserTurnFeedback
	) => void;
}

export const RenderChatInterface: React.FC<RenderChatInterfaceProps> = ({
	conversationHistory,
	currentEngagement,
	onSendMessage,
	onEndConversation,
	onContinueWithoutSpeaking,
	isLoadingAI,
	scenarioDetailsAiName,
    isMaxEngagement,
}) => {
	const chatContainerRef = useRef<HTMLDivElement>(null);
	const [inputValue, setInputValue] = useState("");
    const [inputMode, setInputMode] = useState<'dialogue' | 'action'>('dialogue');
    const inputRef = useRef<HTMLInputElement>(null);

	const scrollToBottom = () => {
		if (chatContainerRef.current) {
			chatContainerRef.current.scrollTo({ top: chatContainerRef.current.scrollHeight, behavior: "smooth" });
		}
	};

	useEffect(() => {
		scrollToBottom();
	}, [conversationHistory, isLoadingAI]);

    // Auto-focus input
    useEffect(() => {
        if (!isLoadingAI) {
            inputRef.current?.focus();
        }
    }, [isLoadingAI]);

    const handleSend = () => {
        if (inputValue.trim()) {
            if (inputMode === 'action') {
                onSendMessage({ gesture: inputValue });
            } else {
                onSendMessage({ dialogue: inputValue });
            }
            setInputValue("");
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
        // Toggle mode with Tab
        if (e.key === 'Tab') {
            e.preventDefault();
            setInputMode(prev => prev === 'dialogue' ? 'action' : 'dialogue');
        }
    };

	return (
		<div className="flex flex-col h-full bg-transparent text-white font-mono relative">
            {/* Top Bar (Minimalist Engagement) */}
            <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start z-20 pointer-events-none bg-gradient-to-b from-black via-black/80 to-transparent h-24">
                <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-white/40 uppercase tracking-widest">Engagement Protocol</span>
                    <div className="flex items-center gap-3">
                        <div className="w-32 h-1 bg-white/10 rounded-full overflow-hidden">
                            <motion.div 
                                layout
                                className={`h-full transition-all duration-500 ${currentEngagement > 80 ? 'bg-cyan-400' : 'bg-white/60'}`} 
                                style={{ width: `${currentEngagement}%` }} 
                            />
                        </div>
                        <span className={`text-xs font-bold ${currentEngagement > 80 ? 'text-cyan-400' : 'text-white/60'}`}>{currentEngagement}%</span>
                    </div>
                </div>
            </div>

			{/* Chat Area */}
			<div ref={chatContainerRef} className="flex-grow overflow-y-auto px-4 md:px-8 pt-24 pb-32 custom-scrollbar scroll-smooth">
                <div className="max-w-4xl mx-auto space-y-2">
                    <AnimatePresence initial={false}>
                        {conversationHistory.map((msg, index) => (
                            <VoidMessage 
                                key={msg.id} 
                                message={msg} 
                                isLast={index === conversationHistory.length - 1} 
                                scenarioDetailsAiName={scenarioDetailsAiName} 
                            />
                        ))}
                    </AnimatePresence>
                    
                    {isLoadingAI && (
                        <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            className="py-4 pl-[96px] flex items-center gap-2"
                        >
                            <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse" />
                            <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse delay-75" />
                            <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse delay-150" />
                            <span className="text-cyan-500/70 text-xs uppercase tracking-widest ml-2">Processing</span>
                        </motion.div>
                    )}
                </div>
			</div>

			{/* Terminal Input Area (Fixed Bottom) */}
			<div className="absolute bottom-0 left-0 right-0 bg-black/90 backdrop-blur-md border-t border-white/10 p-4 md:p-6 z-30">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center gap-4">
                        {/* Mode Indicator */}
                        <button 
                            onClick={() => setInputMode(prev => prev === 'dialogue' ? 'action' : 'dialogue')}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded border transition-all uppercase text-[10px] tracking-widest font-bold ${
                                inputMode === 'action' 
                                    ? 'border-emerald-500/50 text-emerald-400 bg-emerald-500/10' 
                                    : 'border-white/20 text-white/60 hover:border-white/40 hover:text-white'
                            }`}
                        >
                            {inputMode === 'action' ? (
                                <>
                                    <SparklesIcon className="w-3 h-3" />
                                    Action
                                </>
                            ) : (
                                <>
                                    <span className="text-xs">›</span>
                                    Dialogue
                                </>
                            )}
                        </button>

                        {/* Terminal Input Line */}
                        <div className="flex-grow relative group">
                            <span className={`absolute left-0 top-1/2 -translate-y-1/2 font-mono text-lg ${inputMode === 'action' ? 'text-emerald-500' : 'text-cyan-500'}`}>
                                {inputMode === 'action' ? '*' : '›'}
                            </span>
                            <input
                                ref={inputRef}
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder={inputMode === 'action' ? "Describe your action..." : "Type your response..."}
                                className={`w-full bg-transparent border-none outline-none font-mono text-base md:text-lg pl-6 py-2 transition-colors ${
                                    inputMode === 'action' 
                                        ? 'text-emerald-100 placeholder:text-emerald-500/30' 
                                        : 'text-white placeholder:text-white/20'
                                }`}
                                autoComplete="off"
                            />
                            {/* Blinking Cursor Effect (CSS) */}
                            <div className={`absolute bottom-0 left-6 right-0 h-[1px] transition-colors ${
                                inputMode === 'action' ? 'bg-emerald-500/30 group-focus-within:bg-emerald-500' : 'bg-white/10 group-focus-within:bg-cyan-500'
                            }`} />
                        </div>

                        {/* Send Button */}
                        <button 
                            onClick={handleSend}
                            disabled={!inputValue.trim()}
                            className={`p-2 rounded-full transition-all ${
                                inputValue.trim() 
                                    ? inputMode === 'action' ? 'text-emerald-400 hover:bg-emerald-500/20' : 'text-cyan-400 hover:bg-cyan-500/20' 
                                    : 'text-white/10 cursor-not-allowed'
                            }`}
                        >
                            <ArrowRightIcon className="w-5 h-5" />
                        </button>
                    </div>
                    
                    {/* Helper Text */}
                    <div className="flex justify-between items-center mt-2 px-1">
                        <span className="text-[10px] text-white/20 uppercase tracking-widest">
                            [TAB] to switch mode
                        </span>
                        <div className="flex gap-4">
                             <button onClick={onContinueWithoutSpeaking} className="text-[10px] text-white/30 hover:text-white transition-colors uppercase tracking-widest">
                                [Silent Nod]
                            </button>
                        </div>
                    </div>
                </div>
			</div>
		</div>
	);
};
