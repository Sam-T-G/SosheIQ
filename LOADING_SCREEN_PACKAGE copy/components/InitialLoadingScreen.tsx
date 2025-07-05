/**
 * Motion-Optimized Initial Loading Screen with Perfect Viewport Centering
 * Enhanced with refined bounce effects and momentum curves using Motion physics
 */

"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
	motion,
	AnimatePresence,
	Variants,
	useMotionValue,
	useSpring,
	useTransform,
	useAnimation as useMotionAnimation,
	animate,
} from "framer-motion";
import { SosheIQLogo } from "./SosheIQLogo";
import { useAnimation } from "../providers/AnimationProvider";
import {
	MOTION_SPRINGS,
	MOTION_LOADING_TIMING,
	MOTION_SPRING_CONFIGS,
	SPACING,
	TYPOGRAPHY,
	SHADOWS,
	Z_INDEX,
	ANIMATION_VARIANTS,
} from "../constants/animations";

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
	ENTRANCE_DURATION: 800, // Smooth entrance
	LOGO_DURATION: 1200, // Logo animation
	CONTENT_DURATION: 1000, // Content reveals
	PROGRESS_DURATION: 2500, // Progress animation
	COMPLETION_DURATION: 1000, // Completion state
	READY_DURATION: 800, // Ready for transition
	EXIT_DURATION: 600, // Clean exit
	MINIMUM_TOTAL_DURATION: 8000, // 8 seconds total for complete experience
} as const;

// Enhanced Motion spring configurations for natural physics
const REFINED_SPRINGS = {
	// Subtle bounce for logo entrance
	logoEntrance: {
		type: "spring" as const,
		damping: 20,
		stiffness: 300,
		mass: 0.8,
	},
	// Gentle bounce for text elements
	textBounce: {
		type: "spring" as const,
		damping: 25,
		stiffness: 400,
		mass: 0.6,
	},
	// Progress bar momentum with elegant deceleration
	progressMomentum: {
		type: "spring" as const,
		damping: 35,
		stiffness: 180,
		mass: 1.2,
	},
	// Enhanced breathing animation with sophisticated momentum
	breathing: {
		type: "spring" as const,
		damping: 35,
		stiffness: 80,
		mass: 1.8,
		restSpeed: 0.5,
		restDelta: 0.01,
	},
	// Container smooth motion
	containerSmooth: {
		type: "spring" as const,
		damping: 35,
		stiffness: 250,
		mass: 1.0,
	},
	// Enhanced completion glow effect
	completionGlow: {
		type: "spring" as const,
		damping: 12,
		stiffness: 200,
		mass: 1.2,
		restSpeed: 0.1,
		restDelta: 0.01,
	},
} as const;

// Advanced easing curves with sophisticated momentum and drag physics
const EASING_CURVES = {
	// Natural bounce for UI elements
	naturalBounce: [0.68, -0.55, 0.265, 1.55],
	// Smooth momentum for progress
	smoothMomentum: [0.25, 0.46, 0.45, 0.94],
	// Gentle entrance
	gentleEntrance: [0.4, 0.0, 0.2, 1],
	// Playful bounce
	playfulBounce: [0.175, 0.885, 0.32, 1.275],
	// Precise motion
	preciseMotion: [0.4, 0.0, 0.6, 1],
	// Sophisticated breathing with drag momentum (4s duration)
	breathingMomentum:
		"linear(0, 0.4928, 1.4269, 1.8541, 1.4118, 0.6154, 0.2712, 0.6669, 1.3452, 1.6213, 1.2684, 0.6912, 0.4709, 0.7848, 1.2754, 1.4503, 1.1718, 0.755, 0.6172, 0.8637, 1.2173, 1.3251, 1.1074, 0.8076, 0.7241, 0.916, 1.1699, 1.2339, 1.0651, 0.8503, 0.8019, 0.9501, 1.1317, 1.1676, 1.0377, 0.8844, 0.8584, 0.9721, 1.1014, 1.1196, 1.0202, 0.9113, 0.8991, 0.9858, 1.0775, 1.085, 1.0095, 0.9324, 0.9285, 0.9942, 1.0589, 1.0601, 1.003, 0.9487, 0.9495, 0.9991, 1.0446, 1.0424, 0.9994, 0.9613, 0.9645, 1.0017, 1.0335, 1.0297, 0.9975, 0.971, 0.9752, 1.003, 1.0251, 1.0207, 0.9967, 0.9783, 0.9828, 1.0035, 1.0187, 1.0143, 0.9965, 0.9839, 0.9881, 1.0034, 1.0139, 1.0099, 0.9967, 0.988, 0.9918, 1.0031, 1.0103, 1.0068, 0.997, 0.9912, 0.9944, 1.0028, 1.0076, 1.0046, 0.9975, 0.9935, 0.9962, 1.0023, 1.0056, 1.0031, 0.9979, 0.9952, 0.9975, 1.0019, 1.0041, 1.002, 0.9982, 1, 0.9983, 1.0016, 1, 1.0013, 0.9986, 1, 0.9989, 1.0013, 1, 1.0009, 0.9989, 1, 0.9993, 1.001, 1)",
	// Progress momentum with smooth acceleration (2.5s duration)
	progressMomentum:
		"linear(0, 1.8532, 0.2742, 1.6157, 0.4793, 1.439, 0.631, 1.3092, 0.7418, 1.2149, 0.8218, 1.1472, 0.8788, 1.0993, 0.919, 1.0657, 0.947, 1.0425, 0.9662, 1.0267, 0.9791, 1.0162, 0.9877, 1.0092, 0.9932, 1.0048, 0.9967, 1.0021, 0.9988, 1.0005, 1, 0.9996, 1.0007, 0.9992, 1.001, 0.999, 1.001, 0.999, 1.001, 0.9991, 1.0009, 0.9992, 1.0007, 0.9993, 1.0006, 0.9995, 1.0005, 0.9996, 1.0004, 0.9997, 1.0003, 0.9997, 1.0002, 0.9998, 1)",
	// Elegant progress curve
	elegantProgress: [0.4, 0.0, 0.2, 1],
	// Completion glow pulse
	glowPulse: [0.4, 0.0, 0.6, 1],
} as const;

// Enhanced keyframe animations with sophisticated momentum curves
const KEYFRAMES = {
	breathingGlow: `
		@keyframes breathingGlow {
			0% { transform: translateX(-50%) scale(1); opacity: 0.4; filter: brightness(0.8) blur(12px); }
			25% { transform: translateX(-50%) scale(1.05); opacity: 0.6; filter: brightness(1.1) blur(16px); }
			50% { transform: translateX(-50%) scale(1.1); opacity: 0.8; filter: brightness(1.2) blur(20px); }
			75% { transform: translateX(-50%) scale(1.05); opacity: 0.6; filter: brightness(1.1) blur(16px); }
			100% { transform: translateX(-50%) scale(1); opacity: 0.4; filter: brightness(0.8) blur(12px); }
		}
	`,
	breathingGlowSecondary: `
		@keyframes breathingGlowSecondary {
			0% { transform: translateX(-50%) scale(1); opacity: 0.2; filter: brightness(0.9) blur(16px); }
			25% { transform: translateX(-50%) scale(1.08); opacity: 0.3; filter: brightness(1.1) blur(20px); }
			50% { transform: translateX(-50%) scale(1.15); opacity: 0.4; filter: brightness(1.3) blur(24px); }
			75% { transform: translateX(-50%) scale(1.08); opacity: 0.3; filter: brightness(1.1) blur(20px); }
			100% { transform: translateX(-50%) scale(1); opacity: 0.2; filter: brightness(0.9) blur(16px); }
		}
	`,
	shimmer: `
		@keyframes shimmer {
			0% { transform: translateX(-100%) skewX(-15deg); }
			100% { transform: translateX(100%) skewX(-15deg); }
		}
	`,
} as const;

// Add style tag to inject keyframes
const StyleInjector: React.FC = () => (
	<style>{Object.values(KEYFRAMES).join("\n")}</style>
);

export const InitialLoadingScreen: React.FC = () => {
	// Move early return to the very top before any hooks
	const [isVisible, setIsVisible] = useState(true);
	const [animationComplete, setAnimationComplete] = useState(false);
	if (!isVisible && animationComplete) {
		return null;
	}
	const { getOptimizedTransition, isMobile, isReducedMotion } = useAnimation();
	const [currentPhase, setCurrentPhase] = useState<LoadingPhase>({
		phase: "entrance",
		message: "Initializing SosheIQ...",
		progress: 0,
	});

	// Enhanced Motion values with refined spring physics
	const progress = useMotionValue(0);
	const progressSpring = useSpring(progress, {
		damping: 30,
		stiffness: 200,
		mass: 1.0,
	});

	const containerOpacity = useMotionValue(1);
	const containerOpacitySpring = useSpring(containerOpacity, {
		damping: 30,
		stiffness: 200,
		mass: 1.0,
	});

	// Advanced progress transforms with smooth momentum physics
	const progressWidth = useTransform(progressSpring, [0, 100], ["0%", "100%"]);
	const progressGlow = useTransform(progressSpring, [0, 100], [0, 1]);

	// Smooth percentage display that increments digit by digit
	const displayedPercentage = useTransform(progressSpring, (value) =>
		Math.floor(value)
	);

	// Completion glow effect controls
	const completionGlow = useMotionValue(0);
	const completionGlowSpring = useSpring(completionGlow, {
		damping: 15,
		stiffness: 300,
		mass: 0.8,
	});

	// Completion scale effect
	const completionScale = useMotionValue(1);
	const completionScaleSpring = useSpring(completionScale, {
		damping: 20,
		stiffness: 400,
		mass: 0.6,
	});

	// Shimmer animation controls
	const shimmerControls = useMotionAnimation();

	// Performance optimization refs
	const animationFrameRef = useRef<number>();
	const completionTimeoutRef = useRef<NodeJS.Timeout>();
	const startTimeRef = useRef<number>(Date.now());

	// Add at the top, after other useMotionValue hooks
	const [showGlow, setShowGlow] = useState(true);
	const glowOpacity = useMotionValue(1);

	// Enhanced shimmer sequence with sophisticated momentum curves
	const triggerShimmerSequence = useCallback(async () => {
		await shimmerControls.start({
			x: [-60, 300],
			transition: {
				duration: 2.8,
				ease: [0.4, 0.0, 0.2, 1],
				repeat: Infinity,
				repeatDelay: 0.8,
			},
		});
	}, [shimmerControls]);

	// Revolutionary smooth loading sequence with elegant progression
	const runSmoothLoadingSequence = useCallback(async () => {
		const startTime = Date.now();
		startTimeRef.current = startTime;
		const mobileMultiplier = isMobile
			? MOTION_LOADING_TIMING.MOBILE_MULTIPLIER
			: 1;

		try {
			console.log("InitialLoadingScreen: Starting elegant loading sequence");

			// Initial setup
			setCurrentPhase({
				phase: "entrance",
				message: "Initializing SosheIQ...",
				progress: 0,
			});
			progress.set(0);

			// Phase 1: Logo reveal
			await new Promise((resolve) =>
				setTimeout(resolve, 800 * mobileMultiplier)
			);

			setCurrentPhase({
				phase: "logo",
				message: "Awakening AI consciousness...",
				progress: 0,
			});

			// Start shimmer sequence early for visual appeal
			triggerShimmerSequence();

			// Phase 2: Initial progress (0-87%)
			const progressSequence = animate(
				progress,
				[
					0, // Start
					35, // First milestone
					65, // Second milestone
					87, // Final pre-completion milestone
				],
				{
					duration: 8, // Longer duration for more gradual progression
					ease: "linear",
					times: [0, 0.3, 0.6, 1],
				}
			);

			// Message changes during progress
			setTimeout(() => {
				setCurrentPhase((prev) => ({
					...prev,
					phase: "progress",
					message: "Preparing your experience...",
				}));
			}, 2500 * mobileMultiplier);

			setTimeout(() => {
				setCurrentPhase((prev) => ({
					...prev,
					message: "Almost there...",
				}));
			}, 6000 * mobileMultiplier);

			// Wait for initial progress sequence
			await progressSequence;

			// Phase 3: Elegant completion (87-100%)
			await animate(progress, 100, {
				duration: 2.5, // Slower, more satisfying completion
				ease: EASING_CURVES.elegantProgress,
			});

			// Phase 4: Completion effects
			setCurrentPhase({
				phase: "completion",
				message: "Welcome to SosheIQ!",
				progress: 100,
			});

			// Trigger enhanced completion effects
			const completionEffects = Promise.all([
				// Glow effect
				animate(completionGlow, 1, {
					...REFINED_SPRINGS.completionGlow,
				}),
				// Scale pulse
				animate(completionScale, 1.05, {
					...REFINED_SPRINGS.breathing,
				}),
			]);

			await completionEffects;

			// Start breathing animation with enhanced physics
			const breathingControls = useMotionAnimation();
			await breathingControls.start({
				scale: [1, 1.03, 1],
				transition: {
					duration: 3.2,
					ease: [0.4, 0.0, 0.2, 1],
					repeat: Infinity,
					repeatType: "mirror",
					repeatDelay: 0.4,
				},
			});

			// Allow breathing animation to run for a moment
			await new Promise((resolve) => setTimeout(resolve, 2000));

			// Clean up breathing animation
			breathingControls.stop();

			// Settle back to normal scale with enhanced spring physics
			await animate(completionScale, 1, {
				...REFINED_SPRINGS.breathing,
				duration: 0.5,
			});

			// Ensure minimum duration
			const elapsedTime = Date.now() - startTime;
			const remainingTime = Math.max(
				0,
				LOADING_SEQUENCE.MINIMUM_TOTAL_DURATION - elapsedTime
			);

			if (remainingTime > 0) {
				await new Promise((resolve) => setTimeout(resolve, remainingTime));
			}

			// Phase 6: Ready for transition
			setCurrentPhase({
				phase: "ready",
				message: "Welcome to SosheIQ!",
				progress: 100,
			});

			// Signal completion
			document.body.setAttribute("data-loading-complete", "true");
			document.body.setAttribute("data-loading-ready-for-crossfade", "true");

			await new Promise((resolve) =>
				setTimeout(resolve, LOADING_SEQUENCE.READY_DURATION * mobileMultiplier)
			);

			// Phase 7: Smooth exit
			setCurrentPhase({
				phase: "exit",
				message: "",
				progress: 100,
			});

			// Fade out the container
			containerOpacity.set(0);

			await new Promise((resolve) =>
				setTimeout(resolve, LOADING_SEQUENCE.EXIT_DURATION * mobileMultiplier)
			);

			setAnimationComplete(true);
			setIsVisible(false);

			console.log(
				`InitialLoadingScreen: Sequence completed in ${
					Date.now() - startTime
				}ms`
			);
		} catch (error) {
			console.error("Elegant loading sequence error:", error);
			// Emergency completion handling
			document.body.setAttribute("data-loading-complete", "true");
			document.body.setAttribute("data-loading-ready-for-crossfade", "true");
			containerOpacity.set(0);
			setAnimationComplete(true);
			setIsVisible(false);
		}
	}, [isMobile, progress, containerOpacity, triggerShimmerSequence]);

	// Start sequence on mount
	useEffect(() => {
		console.log("InitialLoadingScreen: Component mounted, starting sequence");
		runSmoothLoadingSequence();

		return () => {
			if (animationFrameRef.current) {
				cancelAnimationFrame(animationFrameRef.current);
			}
			if (completionTimeoutRef.current) {
				clearTimeout(completionTimeoutRef.current);
			}
		};
	}, [runSmoothLoadingSequence]);

	// Fallback mechanisms
	useEffect(() => {
		// Emergency completion after 12 seconds
		const emergencyTimeout = setTimeout(() => {
			if (isVisible && !animationComplete) {
				console.warn(
					"InitialLoadingScreen: Emergency timeout - forcing completion"
				);
				document.body.setAttribute("data-loading-complete", "true");
				document.body.setAttribute("data-loading-ready-for-crossfade", "true");
				containerOpacity.set(0);
				setAnimationComplete(true);
				setIsVisible(false);
			}
		}, 12000);

		return () => clearTimeout(emergencyTimeout);
	}, [isVisible, animationComplete, containerOpacity]);

	// In useEffect, watch for phase change to completion/ready/exit and animate glow opacity out
	useEffect(() => {
		if (["completion", "ready", "exit"].includes(currentPhase.phase)) {
			// Fade out glow layers gently
			animate(glowOpacity, 0, {
				duration: 0.8,
				ease: [0.4, 0, 0.2, 1],
				onComplete: () => setShowGlow(false),
			});
		} else {
			setShowGlow(true);
			glowOpacity.set(1);
		}
	}, [currentPhase.phase, glowOpacity]);

	// Enhanced container variants with refined spring physics
	const containerVariants: Variants = {
		entrance: {
			opacity: 1,
			scale: 1,
			x: 0,
			y: 0,
			transition: { ...REFINED_SPRINGS.containerSmooth },
		},
		logo: {
			opacity: 1,
			scale: 1,
			x: 0,
			y: 0,
			transition: { ...REFINED_SPRINGS.containerSmooth },
		},
		content: {
			opacity: 1,
			scale: 1,
			x: 0,
			y: 0,
			transition: { ...REFINED_SPRINGS.containerSmooth },
		},
		progress: {
			opacity: 1,
			scale: 1,
			x: 0,
			y: 0,
			transition: { ...REFINED_SPRINGS.containerSmooth },
		},
		completion: {
			opacity: 1,
			scale: 1.02,
			x: 0,
			y: 0,
			transition: { ...REFINED_SPRINGS.logoEntrance },
		},
		ready: {
			opacity: 1,
			scale: 1,
			x: 0,
			y: 0,
			transition: { ...REFINED_SPRINGS.containerSmooth },
		},
		exit: {
			opacity: 0,
			scale: 0.98,
			x: 0,
			y: 0,
			transition: { duration: 0.95, ease: EASING_CURVES.gentleEntrance },
		},
	};

	// Enhanced logo variants with natural bounce physics
	const logoVariants: Variants = {
		entrance: { opacity: 0, scale: 0.8, x: 0, y: 0 },
		logo: {
			opacity: 1,
			scale: 1,
			x: 0,
			y: 0,
			transition: { ...REFINED_SPRINGS.logoEntrance },
		},
		content: {
			opacity: 1,
			scale: 1,
			x: 0,
			y: 0,
			transition: { ...REFINED_SPRINGS.containerSmooth },
		},
		progress: {
			opacity: 1,
			scale: 1,
			x: 0,
			y: 0,
			transition: { ...REFINED_SPRINGS.containerSmooth },
		},
		completion: {
			opacity: 1,
			scale: 1.05,
			x: 0,
			y: 0,
			transition: { ...REFINED_SPRINGS.logoEntrance },
		},
		ready: {
			opacity: 1,
			scale: 1,
			x: 0,
			y: 0,
			transition: { ...REFINED_SPRINGS.containerSmooth },
		},
		exit: {
			opacity: 0,
			scale: 0.9,
			x: 0,
			y: 0,
			transition: { duration: 0.95, ease: EASING_CURVES.gentleEntrance },
		},
	};

	// Enhanced text variants with subtle bounce
	const textVariants: Variants = {
		entrance: { opacity: 0, scale: 0.95, y: 20 },
		logo: {
			opacity: 0.8,
			scale: 1,
			y: 0,
			transition: { ...REFINED_SPRINGS.textBounce },
		},
		content: {
			opacity: 1,
			scale: 1,
			y: 0,
			transition: { ...REFINED_SPRINGS.textBounce },
		},
		progress: {
			opacity: 1,
			scale: 1,
			y: 0,
			transition: { ...REFINED_SPRINGS.textBounce },
		},
		completion: {
			opacity: 1,
			scale: 1.02,
			y: 0,
			transition: { ...REFINED_SPRINGS.textBounce },
		},
		ready: {
			opacity: 1,
			scale: 1,
			y: 0,
			transition: { ...REFINED_SPRINGS.textBounce },
		},
		exit: {
			opacity: 0,
			scale: 0.95,
			y: 20,
			transition: { duration: 0.95, ease: EASING_CURVES.gentleEntrance },
		},
	};

	return (
		<AnimatePresence mode="wait">
			<StyleInjector />
			{isVisible && (
				<motion.div
					className="fixed inset-0 z-[10000]"
					style={{
						opacity: containerOpacitySpring,
						willChange: "opacity, background-color",
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
						width: "100vw",
						height: "100vh",
						position: "fixed",
						backgroundColor: "#000", // always black
					}}
					initial={{ opacity: 1, scale: 1 }}
					animate={{ opacity: 1, scale: 1 }}
					exit={{
						opacity: 0,
						scale: 0.98,
						transition: { duration: 0.85, ease: [0.4, 0, 0.2, 1] },
					}}
					transition={{}}>
					{/* Perfect viewport-centered content container */}
					<div
						className="absolute inset-0"
						style={{
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							minHeight: "100vh",
							minWidth: "100vw",
							padding: "1rem",
						}}>
						<motion.div
							className="flex flex-col items-center justify-center text-center"
							style={{
								width: "100%",
								maxWidth: "28rem", // max-w-md equivalent
								margin: "0 auto",
								gap: "1.5rem", // space-y-6 equivalent
								willChange: "transform, opacity",
								// Ensure content is always centered
								position: "relative",
								zIndex: 1,
							}}
							variants={containerVariants}
							initial="entrance"
							animate={currentPhase.phase}>
							{/* Logo with enhanced glow system and refined bounce */}
							<motion.div
								className="relative"
								variants={logoVariants}
								initial="entrance"
								animate={currentPhase.phase}
								exit={{
									opacity: 0,
									scale: 0.85,
									transition: { duration: 0.85, ease: [0.4, 0, 0.2, 1] },
								}}>
								<SosheIQLogo
									className="relative z-10"
									style={{
										height: `${Math.min(SPACING.CINEMATIC_MD, 80)}px`,
										width: "auto",
										filter: "drop-shadow(0 0 24px rgba(59, 130, 246, 0.5))",
										willChange: "transform, filter",
									}}
								/>

								{/* Enhanced primary glow layer with sophisticated breathing momentum */}
								<AnimatePresence>
									{showGlow && (
										<motion.div
											className="absolute rounded-full blur-lg"
											style={{
												height: `${Math.min(SPACING.CINEMATIC_MD, 80) + 30}px`,
												width: `${Math.min(SPACING.CINEMATIC_MD, 80) + 30}px`,
												background:
													"radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, rgba(6, 182, 212, 0.2) 50%, transparent 100%)",
												top: "-15px",
												left: "50%",
												transform: "translateX(-50%)",
												willChange: "transform, opacity",
												animation: `breathingGlow 3700ms ${EASING_CURVES.breathingMomentum} infinite`,
												opacity: glowOpacity,
											}}
											initial={{ opacity: 0 }}
											animate={{ opacity: 1 }}
											exit={{
												opacity: 0,
												transition: {
													duration: 0.8,
													ease: [0.4, 0, 0.2, 1],
												},
											}}
										/>
									)}
								</AnimatePresence>

								{/* Enhanced secondary glow layer with sophisticated momentum curves */}
								<AnimatePresence>
									{showGlow && (
										<motion.div
											className="absolute rounded-full blur-xl"
											style={{
												height: `${Math.min(SPACING.CINEMATIC_MD, 80) + 60}px`,
												width: `${Math.min(SPACING.CINEMATIC_MD, 80) + 60}px`,
												background:
													"radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, rgba(6, 182, 212, 0.1) 40%, transparent 70%)",
												top: "-30px",
												left: "50%",
												transform: "translateX(-50%)",
												willChange: "transform, opacity",
												animation: `breathingGlowSecondary 4800ms ${EASING_CURVES.breathingMomentum} infinite`,
												opacity: glowOpacity,
											}}
											initial={{ opacity: 1 }}
											animate={{ opacity: 1 }}
											exit={{
												opacity: 0,
												transition: {
													duration: 0.8,
													ease: [0.4, 0, 0.2, 1],
												},
											}}
										/>
									)}
								</AnimatePresence>
							</motion.div>

							{/* Loading message with refined bounce entrance */}
							<motion.div
								className="text-center w-full"
								style={{ padding: "0 1rem" }}
								variants={textVariants}
								initial="entrance"
								animate={currentPhase.phase}
								exit="exit">
								<motion.p
									className="font-semibold text-sky-300"
									style={{
										fontSize: `${Math.min(TYPOGRAPHY.SIZES.LG, 18)}px`,
										lineHeight: TYPOGRAPHY.LINE_HEIGHTS.RELAXED,
										letterSpacing: TYPOGRAPHY.LETTER_SPACING.WIDE,
										textShadow: "0 0 20px rgba(56, 189, 248, 0.5)",
										willChange: "transform, opacity",
									}}
									key={currentPhase.message}
									initial={{ opacity: 0, scale: 0.95, y: 20 }}
									animate={{ opacity: 1, scale: 1, y: 0 }}
									exit={{ opacity: 0, scale: 0.95, y: 20 }}
									transition={
										currentPhase.phase === "entrance"
											? { ...MOTION_SPRING_CONFIGS.GENTLE, delay: 0.8 }
											: MOTION_SPRING_CONFIGS.GENTLE
									}>
									{currentPhase.message}
								</motion.p>
							</motion.div>

							{/* Enhanced progress bar with sophisticated momentum physics */}
							<motion.div
								className="w-full"
								style={{ maxWidth: "20rem", padding: "0 1rem" }}
								initial={{ opacity: 0, scaleX: 0.95, y: 20 }}
								animate={{
									opacity: ["progress", "completion", "ready", "exit"].includes(
										currentPhase.phase
									)
										? 1
										: 0,
									scaleX: 1,
									y: 0,
								}}
								exit={{ opacity: 0, scaleX: 0.95, y: 20 }}
								transition={MOTION_SPRING_CONFIGS.GENTLE}>
								<motion.div
									className="relative overflow-hidden backdrop-blur-sm"
									style={{
										height: `${SPACING.XS}px`,
										borderRadius: `${SPACING.XS / 2}px`,
										background: "rgba(30, 41, 59, 0.8)",
										boxShadow: SHADOWS.CINEMATIC_SOFT,
										scale: completionScaleSpring,
									}}>
									{/* Enhanced progress fill with gradient and glow */}
									<motion.div
										className="h-full origin-left"
										style={{
											background:
												"linear-gradient(90deg, #3b82f6 0%, #06b6d4 50%, #0ea5e9 100%)",
											borderRadius: `${SPACING.XS / 2}px`,
											boxShadow: useTransform(
												completionGlowSpring,
												[0, 0.5, 1],
												[
													"0 0 16px rgba(59, 130, 246, 0.4)",
													"0 0 24px rgba(59, 130, 246, 0.6), 0 0 48px rgba(6, 182, 212, 0.4)",
													"0 0 32px rgba(59, 130, 246, 0.8), 0 0 64px rgba(6, 182, 212, 0.6)",
												]
											),
											width: progressWidth,
											willChange: "transform, filter, box-shadow",
											filter: useTransform(
												completionGlowSpring,
												[0, 0.5, 1],
												[
													"brightness(1) contrast(1)",
													"brightness(1.2) contrast(1.1)",
													"brightness(1.4) contrast(1.2)",
												]
											),
										}}
									/>

									{/* Enhanced shimmer effect with sophisticated gradient */}
									<motion.div
										className="absolute inset-0"
										style={{
											background:
												"linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.07) 20%, rgba(255, 255, 255, 0.2) 40%, rgba(255, 255, 255, 0.4) 50%, rgba(255, 255, 255, 0.2) 60%, rgba(255, 255, 255, 0.07) 80%, transparent 100%)",
											width: "120px",
											willChange: "transform, opacity",
											filter: "blur(4px)",
											opacity: useTransform(
												progress,
												[0, 87, 100],
												[0.8, 1, 0.4]
											),
										}}
										animate={shimmerControls}
										initial={{ x: -120 }}
									/>

									{/* Enhanced completion celebration sparkles */}
									<motion.div
										className="absolute inset-0 pointer-events-none"
										style={{
											background: useTransform(
												completionGlowSpring,
												[0, 0.5, 1],
												[
													"transparent",
													"radial-gradient(circle at 25% 50%, rgba(255, 255, 255, 0.3) 0%, rgba(59, 130, 246, 0.2) 25%, transparent 50%), radial-gradient(circle at 75% 50%, rgba(255, 255, 255, 0.3) 0%, rgba(6, 182, 212, 0.2) 25%, transparent 50%)",
													"radial-gradient(circle at 25% 50%, rgba(255, 255, 255, 0.7) 0%, rgba(59, 130, 246, 0.4) 25%, transparent 50%), radial-gradient(circle at 75% 50%, rgba(255, 255, 255, 0.7) 0%, rgba(6, 182, 212, 0.4) 25%, transparent 50%)",
												]
											),
											opacity: completionGlowSpring,
											willChange: "opacity, background, filter",
											filter: useTransform(
												completionGlowSpring,
												[0, 0.5, 1],
												["blur(8px)", "blur(12px)", "blur(16px)"]
											),
										}}
									/>
								</motion.div>

								{/* Enhanced percentage display with glow effect */}
								<motion.div
									className="text-center font-mono"
									style={{
										fontSize: `${TYPOGRAPHY.SIZES.SM}px`,
										color: useTransform(
											completionGlowSpring,
											[0, 1],
											["rgba(56, 189, 248, 0.8)", "rgba(255, 255, 255, 1)"]
										),
										letterSpacing: TYPOGRAPHY.LETTER_SPACING.WIDER,
										marginTop: "0.75rem",
										scale: completionScaleSpring,
										textShadow: useTransform(
											completionGlowSpring,
											[0, 1],
											[
												"0 0 10px rgba(56, 189, 248, 0.3)",
												"0 0 20px rgba(255, 255, 255, 0.6)",
											]
										),
									}}
									initial={{ opacity: 0, scale: 0.95, y: 20 }}
									animate={{
										opacity: [
											"progress",
											"completion",
											"ready",
											"exit",
										].includes(currentPhase.phase)
											? 0.8
											: 0,
										scale: 1,
										y: 0,
									}}
									exit={{ opacity: 0, scale: 0.95, y: 20 }}
									transition={MOTION_SPRING_CONFIGS.GENTLE}>
									<motion.span>
										{useTransform(displayedPercentage, (value) => `${value}%`)}
									</motion.span>
								</motion.div>
							</motion.div>
						</motion.div>
					</div>

					{/* Enhanced vignette with refined fade */}
					<motion.div
						className="absolute inset-0 pointer-events-none"
						style={{
							background: `
								radial-gradient(ellipse at center, transparent 60%, rgba(0, 0, 0, 0.05) 95%),
								linear-gradient(0deg, rgba(15, 23, 42, 0.1) 0%, transparent 20%, transparent 80%, rgba(15, 23, 42, 0.1) 100%)
							`,
						}}
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{
							duration: 1.2,
							ease: EASING_CURVES.gentleEntrance,
							delay: 0.4,
						}}
					/>
				</motion.div>
			)}
		</AnimatePresence>
	);
};
