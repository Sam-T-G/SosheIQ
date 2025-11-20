import React, { useState, useEffect, useRef } from "react";
import type {
	ScenarioDetails,
	ChatMessage,
	ActiveAction,
	UserTurnFeedback,
} from "../types";
import {
	CheckCircleIcon,
	CogIcon,
    ArrowRightIcon,
} from "./Icons";
import { RenderChatInterface } from "./RenderChatInterface";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../contexts/AuthContext";
import { useCinematicIntro } from "../hooks/useCinematicIntro";
import { GlitchText } from "./GlitchText";
import { CinematicImageReveal } from "./CinematicImageReveal";

interface InteractionScreenProps {
	scenarioDetails: ScenarioDetails;
	conversationHistory: ChatMessage[];
	currentEngagement: number;
	displayedGoal: { text: string; progress: number } | null;
	activeAction: ActiveAction | null;
	isActionPaused: boolean;
	isPinnable: boolean;
	isGoalPinned: boolean;
	isContinueActionSuggested: boolean;
	onSendMessage: (messages: { gesture?: string; dialogue?: string }) => void;
	onEndConversation: () => void;
	onFastForwardAction: () => void;
	onPinGoal: (goalText: string) => void;
	onUnpinGoal: () => void;
	onContinueWithoutSpeaking: () => void;
	onRetryMessage: (messageText: string) => void;
	aiImageBase64: string | null;
	isLoadingAI: boolean;
	onToggleHelp: () => void;
	onViewImage: (url: string | null) => void;
	initialAiBodyLanguage: string | null;
	goalJustChanged: boolean;
	onAnimationComplete: () => void;
	showGoalAchievedToast: { show: boolean; text: string };
	onGoToAnalysis: () => void;
	onCloseGoalToast: () => void;
	pendingFeedback: { messageId: string; feedback: UserTurnFeedback } | null;
	onFeedbackAnimationComplete: (
		messageId: string,
		feedback: UserTurnFeedback
	) => void;
	onModalStateChange?: (isModalActive: boolean) => void;
}

// --- Minimalist Toast ---
const GoalAchievedToast: React.FC<{
	message: string;
	onGoToAnalysis: () => void;
	onClose: () => void;
}> = ({ message, onGoToAnalysis, onClose }) => {
	useEffect(() => {
		const timer = setTimeout(onClose, 7000);
		return () => clearTimeout(timer);
	}, [onClose]);

	return (
		<motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed top-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-full"
        >
			<CheckCircleIcon className="h-5 w-5 text-white" />
            <span className="text-sm font-mono text-white uppercase tracking-wider">Goal Achieved</span>
			<button
				onClick={onGoToAnalysis}
				className="text-xs font-mono text-white/60 hover:text-white border-b border-white/20 hover:border-white transition-colors uppercase">
				View Analysis
			</button>
		</motion.div>
	);
};

export const InteractionScreen: React.FC<InteractionScreenProps> = ({
	scenarioDetails,
	conversationHistory,
	currentEngagement,
	displayedGoal,
	activeAction,
	isActionPaused,
	isPinnable,
	isGoalPinned,
	isContinueActionSuggested,
	onSendMessage,
	onEndConversation,
	onFastForwardAction,
	onPinGoal,
	onUnpinGoal,
	onContinueWithoutSpeaking,
	onRetryMessage,
	aiImageBase64,
	isLoadingAI,
	onToggleHelp,
	onViewImage,
	initialAiBodyLanguage,
	goalJustChanged,
	onAnimationComplete,
	showGoalAchievedToast,
	onGoToAnalysis,
	onCloseGoalToast,
	pendingFeedback,
	onFeedbackAnimationComplete,
	onModalStateChange,
}) => {
	const { logout } = useAuth();
	const [showMenu, setShowMenu] = useState(false);
	const [hasCompletedFirstLoad, setHasCompletedFirstLoad] = useState(false);

	const menuRef = useRef<HTMLDivElement>(null);
	const menuButtonRef = useRef<HTMLButtonElement>(null);

	const {
		nameOpacity,
		personalityOpacity,
		encounterTypeOpacity,
		bodyLanguageOpacity,
		showScenarioContextModal,
		setShowScenarioContextModal,
		setScreenDimmed,
		isCinematicFadingOut,
		isGlobalFading,
		setIsGlobalFading,
		replayCinematic,
        cinematicSequenceComplete,
	} = useCinematicIntro({
		aiImageBase64,
		hasCompletedFirstLoad,
		showChatOverlay: true, // Always true in this new design
		onComplete: () => {},
	});

	const handleScenarioContextConfirm = () => {
		setShowScenarioContextModal(false);
        // Seamless transition: Start showing chat immediately while intro fades out
        setHasCompletedFirstLoad(true);
        setScreenDimmed(false);
	};

	const scenarioContext = conversationHistory.find((msg) => msg.sender === "backstory")?.text || scenarioDetails.customContext || "Review parameters.";

	useEffect(() => {
		if (onModalStateChange) onModalStateChange(showScenarioContextModal);
	}, [showScenarioContextModal, onModalStateChange]);

	// Menu click outside
	useEffect(() => {
		if (!showMenu) return;
		function handleClick(event: MouseEvent | TouchEvent) {
			if (menuRef.current && !menuRef.current.contains(event.target as Node) && menuButtonRef.current && !menuButtonRef.current.contains(event.target as Node)) {
				setShowMenu(false);
			}
		}
		document.addEventListener("mousedown", handleClick);
		document.addEventListener("touchstart", handleClick);
		return () => {
			document.removeEventListener("mousedown", handleClick);
			document.removeEventListener("touchstart", handleClick);
		};
	}, [showMenu]);

	return (
		<div className="relative w-full h-full overflow-hidden bg-black font-mono">
			{/* Global fade overlay */}
			<AnimatePresence>
				{isGlobalFading && (
					<motion.div
						key="fade-black"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.7 }}
						className="fixed inset-0 z-[20000] bg-black pointer-events-none"
					/>
				)}
			</AnimatePresence>



			{/* Permanent Background Layer */}
            {aiImageBase64 && (
                <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                    <motion.div
                        initial={{ opacity: 0, scale: 1.1 }}
                        animate={{ 
                            opacity: hasCompletedFirstLoad ? 0.2 : 0.6, // Dim when chat starts
                            scale: 1 
                        }}
                        transition={{ duration: 2, ease: "easeInOut" }}
                        className="absolute inset-0"
                    >
                        <CinematicImageReveal 
                            src={aiImageBase64.startsWith("data:") ? aiImageBase64 : `data:image/jpeg;base64,${aiImageBase64}`} 
                            alt={scenarioDetails.aiName} 
                        />
                        {/* Gradient Overlay for Text Readability */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
                        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-transparent opacity-80" />
                        
                        {/* Extra darken layer for chat mode */}
                        <motion.div 
                            animate={{ opacity: hasCompletedFirstLoad ? 0.7 : 0 }}
                            transition={{ duration: 1 }}
                            className="absolute inset-0 bg-black"
                        />
                    </motion.div>
                </div>
            )}

			{/* Cinematic Intro Text Layer */}
			<AnimatePresence>
				{!hasCompletedFirstLoad && !isCinematicFadingOut && (
					<div className="absolute inset-0 z-20 flex flex-col items-center justify-center pointer-events-none p-8 text-center">
						<div className="relative z-10 flex flex-col items-center">
                            <motion.h1 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
                                transition={{ duration: 1.5, ease: "circOut" }}
                                className="text-6xl md:text-8xl font-thin text-white tracking-widest uppercase mb-8 text-center drop-shadow-2xl"
                            >
                                <GlitchText text={scenarioDetails.aiName} scrambleOnMount={true} />
                            </motion.h1>
                            
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ delay: 0.5, duration: 1 }}
                                className="flex flex-col items-center space-y-4"
                            >
                                <div className="h-[1px] w-24 bg-white/40" />
                                <p className="text-sm font-mono text-white/80 tracking-[0.2em] uppercase drop-shadow-md">
                                    <GlitchText text={scenarioDetails.aiPersonalityTraits?.join(" // ") || "UNKNOWN ENTITY"} />
                                </p>
                                <div className="text-sm text-white/60 font-mono tracking-wider uppercase drop-shadow-md">
                                    {scenarioDetails.environment}
                                </div>
                            </motion.div>

                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ delay: 2, duration: 1 }}
                                className="absolute -bottom-32 text-xs font-mono text-white/40 animate-pulse"
                            >
                                {initialAiBodyLanguage || "Target is present."}
                            </motion.p>
                        </div>
					</div>
				)}
			</AnimatePresence>

			{/* Explicit Begin Interaction Button (Replaces Modal) */}
			<AnimatePresence>
				{!hasCompletedFirstLoad && cinematicSequenceComplete && (
					<motion.div 
                        initial={{ opacity: 0, y: 20 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        exit={{ opacity: 0, y: -20 }} 
                        className="absolute bottom-24 left-0 right-0 z-[100] flex justify-center pointer-events-auto"
                    >
						<button 
                            onClick={handleScenarioContextConfirm} 
                            className="group relative px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 hover:border-white/40 transition-all duration-300 rounded-full flex items-center gap-4 overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                            <span className="text-sm font-mono font-bold text-white uppercase tracking-[0.2em]">Begin Interaction</span>
                            <ArrowRightIcon className="w-4 h-4 text-cyan-400 group-hover:translate-x-1 transition-transform" />
						</button>
					</motion.div>
				)}
			</AnimatePresence>

			{/* Main Chat Interface */}
			<AnimatePresence>
				{hasCompletedFirstLoad && (
					<motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        transition={{ duration: 1.5, ease: "easeInOut" }}
                        className="absolute inset-0 z-10"
                    >
						{/* Menu Button */}
						<div className="absolute top-6 right-6 z-50">
							<button ref={menuButtonRef} onClick={() => setShowMenu(!showMenu)} className="text-white/40 hover:text-white transition-colors">
								<CogIcon className="w-5 h-5" />
							</button>
							<AnimatePresence>
								{showMenu && (
									<motion.div ref={menuRef} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute right-0 mt-4 w-48 bg-black border border-white/10 p-2">
										<button onClick={() => replayCinematic(() => setHasCompletedFirstLoad(false))} className="block w-full text-left px-4 py-2 text-xs text-white/60 hover:text-white hover:bg-white/5 uppercase tracking-wider">
											Replay Intro
										</button>
										<button onClick={() => { setShowMenu(false); logout(); onEndConversation(); }} className="block w-full text-left px-4 py-2 text-xs text-red-400/60 hover:text-red-400 hover:bg-white/5 uppercase tracking-wider">
											Terminate
										</button>
									</motion.div>
								)}
							</AnimatePresence>
						</div>

						<RenderChatInterface
							conversationHistory={conversationHistory}
							currentEngagement={currentEngagement}
							displayedGoal={displayedGoal}
							activeAction={activeAction}
							isActionPaused={isActionPaused}
							isPinnable={isPinnable}
							isGoalPinned={isGoalPinned}
							onPinGoal={onPinGoal}
							onUnpinGoal={onUnpinGoal}
							isContinueActionSuggested={isContinueActionSuggested}
							onSendMessage={onSendMessage}
							onEndConversation={onEndConversation}
							onFastForwardAction={onFastForwardAction}
							onContinueWithoutSpeaking={onContinueWithoutSpeaking}
							onRetryMessage={onRetryMessage}
							isLoadingAI={isLoadingAI}
							scenarioDetailsAiName={scenarioDetails.aiName}
							isMaxEngagement={false}
							isOverlay={false}
							onToggleHelp={onToggleHelp}
							onViewImage={onViewImage}
							goalJustChanged={goalJustChanged}
							onAnimationComplete={onAnimationComplete}
							pendingFeedback={pendingFeedback}
							onFeedbackAnimationComplete={onFeedbackAnimationComplete}
						/>
					</motion.div>
				)}
			</AnimatePresence>

			{/* Toast */}
			<AnimatePresence>
				{showGoalAchievedToast.show && (
					<GoalAchievedToast message={showGoalAchievedToast.text} onGoToAnalysis={onGoToAnalysis} onClose={onCloseGoalToast} />
				)}
			</AnimatePresence>
		</div>
	);
};
