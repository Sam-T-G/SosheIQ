/**
 * Motion-Optimized Initial Loading Screen with Perfect Viewport Centering
 * Enhanced with refined bounce effects and momentum curves using Motion physics
 */

"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
	motion,
	AnimatePresence,
	useMotionValue,
	useSpring,
	useTransform,
	animate,
} from "motion/react";
import { SosheIQLogo } from "./SosheIQLogo";

interface LoadingPhase {
	phase:
		| "entrance"
		| "logo"
		| "content"
		| "progress"
		| "completion"
		| "ready"
		| "exit";
	message: string;
	progress: number;
}

// Smooth timing constants for seamless experience
const LOADING_SEQUENCE = {
	ENTRANCE_DURATION: 800,
	LOGO_DURATION: 1200,
	CONTENT_DURATION: 1000,
	PROGRESS_DURATION: 2500,
	COMPLETION_DURATION: 1000,
	READY_DURATION: 800,
	EXIT_DURATION: 600,
	MINIMUM_TOTAL_DURATION: 8000,
} as const;

// Enhanced Motion spring configurations
const REFINED_SPRINGS = {
	logoEntrance: {
		type: "spring" as const,
		damping: 20,
		stiffness: 300,
		mass: 0.8,
	},
	textBounce: {
		type: "spring" as const,
		damping: 25,
		stiffness: 400,
		mass: 0.6,
	},
	progressMomentum: {
		type: "spring" as const,
		damping: 35,
		stiffness: 180,
		mass: 1.2,
	},
} as const;

export const InitialLoadingScreen: React.FC = () => {
	const [isVisible, setIsVisible] = useState(true);
	const [animationComplete, setAnimationComplete] = useState(false);

	// Early return if not visible and animation is complete
	if (!isVisible && animationComplete) {
		return null;
	}

	const [currentPhase, setCurrentPhase] = useState<LoadingPhase>({
		phase: "entrance",
		message: "Initializing SosheIQ...",
		progress: 0,
	});

	// Motion values
	const progress = useMotionValue(0);
	const progressSpring = useSpring(progress, {
		damping: 30,
		stiffness: 200,
		mass: 1.0,
	});

	const containerOpacity = useMotionValue(1);
	const progressWidth = useTransform(progressSpring, [0, 100], ["0%", "100%"]);
	const displayedPercentage = useTransform(progressSpring, (value) =>
		Math.floor(value)
	);

	// Loading sequence
	const runLoadingSequence = useCallback(async () => {
		const startTime = Date.now();

		// Phase 1: Entrance
		setCurrentPhase({
			phase: "entrance",
			message: "Initializing SosheIQ...",
			progress: 0,
		});
		await new Promise((resolve) =>
			setTimeout(resolve, LOADING_SEQUENCE.ENTRANCE_DURATION)
		);

		// Phase 2: Logo
		setCurrentPhase({
			phase: "logo",
			message: "Loading AI Engine...",
			progress: 15,
		});
		animate(progress, 15, { duration: 0.5 });
		await new Promise((resolve) =>
			setTimeout(resolve, LOADING_SEQUENCE.LOGO_DURATION)
		);

		// Phase 3: Content
		setCurrentPhase({
			phase: "content",
			message: "Preparing Interface...",
			progress: 45,
		});
		animate(progress, 45, { duration: 0.8 });
		await new Promise((resolve) =>
			setTimeout(resolve, LOADING_SEQUENCE.CONTENT_DURATION)
		);

		// Phase 4: Progress
		setCurrentPhase({
			phase: "progress",
			message: "Finalizing Setup...",
			progress: 85,
		});
		animate(progress, 85, { duration: 1.2 });
		await new Promise((resolve) =>
			setTimeout(resolve, LOADING_SEQUENCE.PROGRESS_DURATION)
		);

		// Phase 5: Completion
		setCurrentPhase({
			phase: "completion",
			message: "Ready to Begin!",
			progress: 100,
		});
		animate(progress, 100, { duration: 0.6 });
		await new Promise((resolve) =>
			setTimeout(resolve, LOADING_SEQUENCE.COMPLETION_DURATION)
		);

		// Ensure minimum duration
		const elapsed = Date.now() - startTime;
		const remaining = LOADING_SEQUENCE.MINIMUM_TOTAL_DURATION - elapsed;
		if (remaining > 0) {
			await new Promise((resolve) => setTimeout(resolve, remaining));
		}

		// Phase 6: Ready
		setCurrentPhase({
			phase: "ready",
			message: "Welcome to SosheIQ",
			progress: 100,
		});

		// Signal completion
		document.body.setAttribute("data-loading-complete", "true");
		document.body.setAttribute("data-loading-ready-for-crossfade", "true");

		await new Promise((resolve) =>
			setTimeout(resolve, LOADING_SEQUENCE.READY_DURATION)
		);

		// Phase 7: Exit
		setCurrentPhase({
			phase: "exit",
			message: "",
			progress: 100,
		});
		animate(containerOpacity, 0, { duration: 0.6 });
		await new Promise((resolve) =>
			setTimeout(resolve, LOADING_SEQUENCE.EXIT_DURATION)
		);

		setAnimationComplete(true);
		setIsVisible(false);
	}, [progress, containerOpacity]);

	// Start loading sequence
	useEffect(() => {
		runLoadingSequence();
	}, [runLoadingSequence]);

	return (
		<AnimatePresence>
			{isVisible && (
				<motion.div
					className="fixed inset-0 bg-black z-50 flex items-center justify-center"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					transition={{ duration: 0.6 }}
					style={{ opacity: containerOpacity }}>
					<div className="text-center max-w-md mx-auto px-8">
						{/* Logo */}
						<motion.div
							className="mb-8"
							initial={{ scale: 0.8, opacity: 0 }}
							animate={{ scale: 1, opacity: 1 }}
							transition={REFINED_SPRINGS.logoEntrance}>
							<SosheIQLogo className="w-32 h-32 mx-auto" />
						</motion.div>

						{/* Loading Message */}
						<motion.div
							className="text-white text-xl font-light mb-8"
							initial={{ y: 20, opacity: 0 }}
							animate={{ y: 0, opacity: 1 }}
							transition={REFINED_SPRINGS.textBounce}>
							{currentPhase.message}
						</motion.div>

						{/* Progress Bar */}
						<div className="relative w-64 h-2 bg-gray-800 rounded-full mx-auto mb-4">
							<motion.div
								className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
								style={{ width: progressWidth }}
								initial={{ width: "0%" }}
								transition={REFINED_SPRINGS.progressMomentum}
							/>
						</div>

						{/* Progress Percentage */}
						<motion.div
							className="text-gray-400 text-sm"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ delay: 0.5 }}>
							<motion.span>{displayedPercentage}</motion.span>%
						</motion.div>
					</div>
				</motion.div>
			)}
		</AnimatePresence>
	);
};
