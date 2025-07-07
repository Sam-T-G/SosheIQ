import React, { useState, useEffect } from "react";
import { ENGAGEMENT_BAR_COLORS } from "../constants";
import { motion } from "motion/react";

interface ProgressBarProps {
	percentage: number;
	isCompleting?: boolean;
	onCompletionAnimationEnd?: () => void;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
	percentage,
	isCompleting = false,
	onCompletionAnimationEnd,
}) => {
	const [showCompletionEffect, setShowCompletionEffect] = useState(false);
	const [prevPercentage, setPrevPercentage] = useState(percentage);

	const cappedPercentage = Math.max(0, Math.min(100, percentage));

	let barColorClass = ENGAGEMENT_BAR_COLORS.medium;
	if (cappedPercentage <= 33) {
		barColorClass = ENGAGEMENT_BAR_COLORS.low;
	} else if (cappedPercentage >= 67) {
		barColorClass = ENGAGEMENT_BAR_COLORS.high;
	}

	// Detect when progress reaches 100% for the first time
	useEffect(() => {
		if (
			cappedPercentage >= 100 &&
			prevPercentage < 100 &&
			!showCompletionEffect
		) {
			setShowCompletionEffect(true);
			// Trigger completion animation
			const timer = setTimeout(() => {
				if (onCompletionAnimationEnd) {
					onCompletionAnimationEnd();
				}
			}, 1500); // Match the CSS animation duration

			return () => clearTimeout(timer);
		}
		setPrevPercentage(cappedPercentage);
	}, [
		cappedPercentage,
		prevPercentage,
		showCompletionEffect,
		onCompletionAnimationEnd,
	]);

	return (
		<div className="w-full bg-slate-700 rounded-full h-4 shadow-inner overflow-hidden relative">
			<motion.div
				className={`h-full rounded-full ${barColorClass} ${
					showCompletionEffect ? "animate-progress-completion" : ""
				}`}
				initial={false}
				animate={{ width: `${cappedPercentage}%` }}
				transition={{ type: "spring", stiffness: 320, damping: 32, mass: 0.7 }}
				role="progressbar"
				aria-valuenow={cappedPercentage}
				aria-valuemin={0}
				aria-valuemax={100}
				aria-label={`Engagement: ${cappedPercentage}%`}
			/>
			{/* Completion sparkle effect */}
			{showCompletionEffect && (
				<div className="absolute inset-0 animate-completion-sparkle pointer-events-none">
					<div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-yellow-300/20 to-transparent animate-sparkle-sweep" />
					<div
						className="absolute top-1/2 left-1/2 w-1.5 h-1.5 bg-yellow-300/80 rounded-full animate-sparkle-pulse"
						style={{ transform: "translate(-50%, -50%)" }}
					/>
					<div className="absolute top-1/4 left-1/4 w-0.5 h-0.5 bg-yellow-200/60 rounded-full animate-sparkle-pulse-delayed" />
					<div className="absolute top-3/4 right-1/4 w-0.5 h-0.5 bg-yellow-200/60 rounded-full animate-sparkle-pulse-delayed-2" />
				</div>
			)}
		</div>
	);
};
