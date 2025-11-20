import React, { useState, useEffect } from "react";
import type { UserTurnFeedback } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface VoidFeedbackTrayProps {
	data: { messageId: string; feedback: UserTurnFeedback };
	onComplete: (messageId: string, feedback: UserTurnFeedback) => void;
}

const Badge: React.FC<{
	label: string;
	value?: string | number;
	type: "positive" | "negative" | "neutral";
	icon?: React.ReactNode;
}> = ({ label, value, type, icon }) => {
	const colors = {
		positive: "border-emerald-500 text-emerald-400 bg-emerald-950/30",
		negative: "border-red-500 text-red-400 bg-red-950/30",
		neutral: "border-cyan-500 text-cyan-400 bg-cyan-950/30",
	};

	return (
		<motion.div
			initial={{ opacity: 0, x: 50, filter: "blur(10px)" }}
			animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
			exit={{ opacity: 0, x: 50, filter: "blur(10px)" }}
			transition={{ type: "spring", stiffness: 300, damping: 30 }}
			className={`flex items-center gap-2 px-3 py-1.5 border-r-2 ${colors[type]} backdrop-blur-sm font-mono text-xs uppercase tracking-wider shadow-lg`}>
			{icon}
			<span className="font-bold">{label}</span>
			{value && <span className="opacity-75">[{value}]</span>}
		</motion.div>
	);
};

export const VoidFeedbackTray: React.FC<VoidFeedbackTrayProps> = ({
	data,
	onComplete,
}) => {
	const { messageId, feedback } = data;
	const [isVisible, setIsVisible] = useState(true);

	useEffect(() => {
		// Auto-dismiss after a delay
		const timer = setTimeout(() => {
			setIsVisible(false);
		}, 4000);
		return () => clearTimeout(timer);
	}, [messageId]);

	const handleExitComplete = () => {
		if (!isVisible) {
			onComplete(messageId, feedback);
		}
	};

	return (
		<div className="fixed bottom-24 right-4 z-40 flex flex-col items-end gap-2 pointer-events-none">
			<AnimatePresence onExitComplete={handleExitComplete}>
				{isVisible && (
					<>
						{feedback.positiveTraitContribution && (
							<Badge
								key="pos"
								type="positive"
								label={feedback.positiveTraitContribution}
								value="DETECTED"
							/>
						)}
						{feedback.negativeTraitContribution && (
							<Badge
								key="neg"
								type="negative"
								label={feedback.negativeTraitContribution}
								value="DETECTED"
							/>
						)}
						{typeof feedback.engagementDelta === "number" &&
							feedback.engagementDelta !== 0 && (
								<Badge
									key="eng"
									type={feedback.engagementDelta > 0 ? "positive" : "negative"}
									label="ENGAGEMENT"
									value={`${feedback.engagementDelta > 0 ? "+" : ""}${
										feedback.engagementDelta
									}%`}
								/>
							)}
						{typeof feedback.userTurnEffectivenessScore === "number" && (
							<Badge
								key="eff"
								type="neutral"
								label="EFFECTIVENESS"
								value={`${feedback.userTurnEffectivenessScore}%`}
							/>
						)}
					</>
				)}
			</AnimatePresence>
		</div>
	);
};
