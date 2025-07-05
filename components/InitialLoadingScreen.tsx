/**
 * Motion-Optimized Initial Loading Screen with Perfect Viewport Centering
 * Enhanced with refined bounce effects and momentum curves using Motion physics
 * Comprehensive implementation with advanced glow system and cinematic transitions
 */

"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
	motion,
	AnimatePresence,
	useMotionValue,
	useSpring,
	useTransform,
	useAnimation,
	animate,
	Variants,
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

// Enhanced timing constants for seamless cinematic experience with quick synchronized transition
const LOADING_SEQUENCE = {
	ENTRANCE_DURATION: 200, // Very quick entrance
	LOGO_DURATION: 300, // Quick logo phase - total 0.5s before progress
	CONTENT_DURATION: 1000,
	PROGRESS_DURATION: 3200, // Slightly faster progress
	COMPLETION_DURATION: 1200, // Reduced for quicker transition
	READY_DURATION: 600, // Faster ready phase
	EXIT_DURATION: 800, // Synchronized exit timing
	MINIMUM_TOTAL_DURATION: 7500, // Slightly reduced total duration
	TRANSITION_HANDOFF_DELAY: 200, // Precise handoff timing
} as const;

// Sophisticated spacing system for responsive design
const SPACING = {
	XS: 6,
	SM: 12,
	MD: 24,
	LG: 32,
	XL: 48,
	CINEMATIC_SM: 60,
	CINEMATIC_MD: 120,
	CINEMATIC_LG: 180,
} as const;

// Advanced typography system
const TYPOGRAPHY = {
	SIZES: {
		SM: 14,
		MD: 16,
		LG: 18,
		XL: 20,
	},
	LINE_HEIGHTS: {
		TIGHT: 1.25,
		NORMAL: 1.5,
		RELAXED: 1.6,
	},
	LETTER_SPACING: {
		TIGHT: "-0.025em",
		NORMAL: "0em",
		WIDE: "0.025em",
		WIDER: "0.05em",
	},
} as const;

// Sophisticated shadow system
const SHADOWS = {
	CINEMATIC_SOFT:
		"0 8px 32px rgba(0, 0, 0, 0.12), 0 4px 16px rgba(0, 0, 0, 0.08)",
	CINEMATIC_MEDIUM:
		"0 12px 48px rgba(0, 0, 0, 0.18), 0 6px 24px rgba(0, 0, 0, 0.12)",
	CINEMATIC_STRONG:
		"0 16px 64px rgba(0, 0, 0, 0.24), 0 8px 32px rgba(0, 0, 0, 0.16)",
} as const;

// Advanced easing curves for sophisticated momentum with quick transition
const EASING_CURVES = {
	gentleEntrance: [0.16, 1, 0.3, 1] as const,
	dramaticReveal: [0.25, 0.46, 0.45, 0.94] as const,
	snappyBounce: [0.68, -0.55, 0.265, 1.55] as const,
	smoothMomentum: [0.4, 0, 0.2, 1] as const,
	breathingMomentum: "cubic-bezier(0.4, 0, 0.6, 1)" as const,
	elegantProgress: [0.4, 0.0, 0.2, 1] as const,
	// Advanced synchronized exit curves using Motion-generated springs
	synchronizedExit:
		"1000ms linear(0, 0.1262, 0.4133, 0.7368, 1.0078, 1.1812, 1.2506, 1.2366, 1.1719, 1.0896, 1.0154, 0.9638, 0.9389, 0.9372, 0.9509, 0.9713, 0.9912, 1.0062, 1.0144, 1.0163, 1.0137, 1.0088, 1.0036, 0.9993, 0.9968, 1, 0.9962, 0.9974, 0.9987, 0.9999, 1.0007, 1, 1)" as const,
	cinematicHandoff:
		"800ms linear(0, 0.8577, 1.5266, 1.0688, 0.7228, 0.967, 1.1459, 1.0157, 0.9232, 0.9926, 1.0404, 1.0034, 0.9788, 0.9984, 1.0112, 1.0007, 0.9941, 0.9997, 1, 1.0001, 1, 1, 1, 1, 1, 1, 1)" as const,
} as const;

// Enhanced Motion spring configurations with sophisticated physics and quick transitions
const MOTION_SPRING_CONFIGS = {
	GENTLE: {
		type: "spring" as const,
		damping: 20,
		stiffness: 300,
		mass: 0.8,
	},
	SNAPPY: {
		type: "spring" as const,
		damping: 25,
		stiffness: 400,
		mass: 0.6,
	},
	MOMENTUM: {
		type: "spring" as const,
		damping: 35,
		stiffness: 180,
		mass: 1.2,
	},
	CINEMATIC: {
		type: "spring" as const,
		damping: 30,
		stiffness: 200,
		mass: 1.0,
	},
	BREATHING: {
		type: "spring" as const,
		damping: 35,
		stiffness: 80,
		mass: 1.8,
		restSpeed: 0.5,
		restDelta: 0.01,
	},
	COMPLETION_GLOW: {
		type: "spring" as const,
		damping: 12,
		stiffness: 200,
		mass: 1.2,
		restSpeed: 0.1,
		restDelta: 0.01,
	},
	// Advanced synchronized exit springs
	SYNCHRONIZED_EXIT: {
		type: "spring" as const,
		damping: 28,
		stiffness: 380,
		mass: 0.7,
		restSpeed: 0.01,
		restDelta: 0.001,
	},
	QUICK_FADE: {
		type: "spring" as const,
		damping: 35,
		stiffness: 450,
		mass: 0.5,
		restSpeed: 0.01,
		restDelta: 0.001,
	},
	// Advanced springy exit animations with sophisticated bounce and momentum
	SPRINGY_EXIT: {
		type: "spring" as const,
		damping: 20,
		stiffness: 200,
		mass: 0.8,
		bounce: 0.25,
		restSpeed: 0.01,
		restDelta: 0.001,
	},
	LOGO_SPRINGY_EXIT: {
		type: "spring" as const,
		damping: 25,
		stiffness: 300,
		mass: 0.6,
		bounce: 0.3,
		restSpeed: 0.01,
		restDelta: 0.001,
	},
	CONTENT_SPRINGY_EXIT: {
		type: "spring" as const,
		damping: 22,
		stiffness: 250,
		mass: 0.7,
		bounce: 0.2,
		restSpeed: 0.01,
		restDelta: 0.001,
	},
	CASCADING_EXIT: {
		type: "spring" as const,
		damping: 18,
		stiffness: 180,
		mass: 0.9,
		bounce: 0.35,
		restSpeed: 0.01,
		restDelta: 0.001,
	},
	// Ultimate sophisticated exit with Motion AI-generated spring physics
	ULTIMATE_EXIT: {
		type: "spring" as const,
		damping: 15,
		stiffness: 160,
		mass: 1.1,
		bounce: 0.4,
		restSpeed: 0.001,
		restDelta: 0.0001,
	},
	// Breathing collapse animation configurations
	BREATHE_OUT: {
		type: "spring" as const,
		damping: 12,
		stiffness: 80,
		mass: 1.5,
		restSpeed: 0.01,
		restDelta: 0.001,
	},
	BREATHE_IN_COLLAPSE: {
		type: "spring" as const,
		damping: 25,
		stiffness: 300,
		mass: 0.8,
		bounce: 0.4,
		restSpeed: 0.001,
		restDelta: 0.0001,
	},
	SPRINGY_COLLAPSE: {
		type: "spring" as const,
		damping: 20,
		stiffness: 400,
		mass: 0.6,
		bounce: 0.5,
		restSpeed: 0.001,
		restDelta: 0.0001,
	},
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
	const [isVisible, setIsVisible] = useState(true);
	const [animationComplete, setAnimationComplete] = useState(false);
	const [showGlow, setShowGlow] = useState(false);
	const [glowOpacity, setGlowOpacity] = useState(0.8);

	// Early return if not visible and animation is complete
	if (!isVisible && animationComplete) {
		return null;
	}

	const [currentPhase, setCurrentPhase] = useState<LoadingPhase>({
		phase: "entrance",
		message: "Initializing SosheIQ...",
		progress: 0,
	});

	// Add a dedicated collapse trigger state
	const [isCollapsing, setIsCollapsing] = useState(false);

	// Enhanced Motion values with sophisticated physics
	const progress = useMotionValue(0);
	const progressSpring = useSpring(progress, MOTION_SPRING_CONFIGS.CINEMATIC);
	const containerOpacitySpring = useSpring(1, MOTION_SPRING_CONFIGS.GENTLE);
	const completionScaleSpring = useSpring(1, MOTION_SPRING_CONFIGS.SNAPPY);

	// Advanced Motion controls for sophisticated animations
	const shimmerControls = useAnimation();
	const breathingControls = useAnimation();
	const completionGlow = useMotionValue(0);
	const completionGlowSpring = useSpring(
		completionGlow,
		MOTION_SPRING_CONFIGS.COMPLETION_GLOW
	);

	// Advanced transform chains for sophisticated animations
	const progressWidth = useTransform(progressSpring, [0, 100], ["0%", "100%"]);
	const displayedPercentage = useTransform(progressSpring, (value) =>
		Math.floor(value)
	);

	// Enhanced glow effects with Motion transforms
	const progressGlow = useTransform(progressSpring, [0, 100], [0, 1]);
	const progressBrightness = useTransform(
		completionGlowSpring,
		[0, 0.5, 1],
		["brightness(1)", "brightness(1.2)", "brightness(1.4)"]
	);

	// Performance optimization refs
	const animationFrameRef = useRef<number>();
	const completionTimeoutRef = useRef<NodeJS.Timeout>();
	const startTimeRef = useRef<number>(Date.now());

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

	// Enhanced loading sequence with sophisticated timing and more text dialogues
	const runLoadingSequence = useCallback(async () => {
		const startTime = Date.now();
		startTimeRef.current = startTime;

		try {
			console.log(
				"InitialLoadingScreen: Starting sophisticated loading sequence"
			);

			// Phase 1: Entrance - Very quick entrance (200ms)
			setCurrentPhase({
				phase: "entrance",
				message: "Initializing SosheIQ...",
				progress: 0,
			});
			setShowGlow(true);
			await new Promise((resolve) =>
				setTimeout(resolve, LOADING_SEQUENCE.ENTRANCE_DURATION)
			);

			// Phase 2: Logo - Quick logo phase (300ms) - Total 0.5s before progress
			setCurrentPhase({
				phase: "logo",
				message: "Awakening AI consciousness...",
				progress: 0,
			});
			animate(progress, 15, {
				duration: 0.8,
				ease: EASING_CURVES.smoothMomentum,
			});

			// Start shimmer sequence early for visual appeal
			triggerShimmerSequence();

			await new Promise((resolve) =>
				setTimeout(resolve, LOADING_SEQUENCE.LOGO_DURATION)
			);

			// Phase 3: Content - Progress bar becomes visible here (after 0.5s total)
			setCurrentPhase({
				phase: "content",
				message: "Preparing your experience...",
				progress: 45,
			});
			animate(progress, 45, {
				duration: 1.2,
				ease: EASING_CURVES.dramaticReveal,
			});
			await new Promise((resolve) =>
				setTimeout(resolve, LOADING_SEQUENCE.CONTENT_DURATION)
			);

			// Phase 4: Progress - Optimized progress with multiple text changes
			setCurrentPhase({
				phase: "progress",
				message: "Loading neural networks...",
				progress: 65,
			});

			// Animate progress through multiple stages with text changes
			const progressSequence = animate(progress, [45, 65, 75, 87], {
				duration: 2.8, // Slightly faster for quicker transition
				ease: "linear",
				times: [0, 0.3, 0.6, 1],
			});

			// Text dialogue changes during progress (more like original)
			setTimeout(() => {
				setCurrentPhase((prev) => ({
					...prev,
					message: "Calibrating personality matrix...",
				}));
			}, 900);

			setTimeout(() => {
				setCurrentPhase((prev) => ({
					...prev,
					message: "Optimizing conversation algorithms...",
				}));
			}, 1800);

			setTimeout(() => {
				setCurrentPhase((prev) => ({
					...prev,
					message: "Almost ready...",
				}));
			}, 2400);

			// Wait for progress sequence
			await progressSequence;

			// Final progress push to 100%
			await animate(progress, 100, {
				duration: 0.6,
				ease: EASING_CURVES.elegantProgress,
			});

			// Phase 5: Completion - Enhanced completion effects with expansion animation
			setCurrentPhase({
				phase: "completion",
				message: "Welcome to SosheIQ!",
				progress: 100,
			});

			// Trigger enhanced completion effects with Motion controls
			const completionEffects = Promise.all([
				// Glow effect
				animate(completionGlow, 1, MOTION_SPRING_CONFIGS.COMPLETION_GLOW),
				// Scale pulse
				animate(completionScaleSpring, 1.05, MOTION_SPRING_CONFIGS.BREATHING),
			]);

			await completionEffects;

			// EXPANSION PHASE: Breathe out to maximum size
			console.log("Starting expansion phase...");

			// Trigger maximum expansion animation
			const expansionEffects = Promise.all([
				// Main container expansion
				animate(completionScaleSpring, 1.12, MOTION_SPRING_CONFIGS.BREATHE_OUT),
				// Glow expansion
				animate(completionGlow, 1.5, MOTION_SPRING_CONFIGS.BREATHE_OUT),
				// Breathing controls expansion
				breathingControls.start({
					scale: 1.15,
					transition: MOTION_SPRING_CONFIGS.BREATHE_OUT,
				}),
			]);

			await expansionEffects;

			// Hold the expansion for a moment
			await new Promise((resolve) => setTimeout(resolve, 300));

			// Ensure minimum duration
			const elapsed = Date.now() - startTime;
			const remaining = LOADING_SEQUENCE.MINIMUM_TOTAL_DURATION - elapsed;
			if (remaining > 0) {
				await new Promise((resolve) => setTimeout(resolve, remaining));
			}

			// Phase 6: Ready - Quick preparation with synchronized glow fade-out
			setCurrentPhase({
				phase: "ready",
				message: "Welcome to SosheIQ!",
				progress: 100,
			});

			// Start synchronized fade-out effects
			const readyEffects = Promise.all([
				animate(completionGlow, 0.3, MOTION_SPRING_CONFIGS.QUICK_FADE),
				animate(completionScaleSpring, 0.98, MOTION_SPRING_CONFIGS.QUICK_FADE),
			]);

			setGlowOpacity(0.2);

			// Signal completion with sophisticated coordination
			document.body.setAttribute("data-loading-complete", "true");
			document.body.setAttribute("data-loading-ready-for-crossfade", "true");

			await readyEffects;
			// No hold period - go directly to collapse

			// Phase 7: Quick Collapse Exit - Rapid shrink to nothing
			console.log("Starting quick collapse phase...");
			setCurrentPhase({
				phase: "exit",
				message: "",
				progress: 100,
			});

			// Trigger collapse state for variants
			setIsCollapsing(true);

			// COLLAPSE PHASE: Only use exit variants - stop all other animations
			// Immediate glow shutdown for clean transition
			setShowGlow(false);
			setGlowOpacity(0);

			// Stop all conflicting animations - let only exit variants handle the collapse
			// Wait for exit animations to complete (0.8s duration)
			await new Promise((resolve) => setTimeout(resolve, 800));

			// Additional handoff delay for perfect synchronization
			await new Promise((resolve) =>
				setTimeout(resolve, LOADING_SEQUENCE.TRANSITION_HANDOFF_DELAY)
			);

			setAnimationComplete(true);
			setIsVisible(false);

			console.log(
				`InitialLoadingScreen: Synchronized sequence completed in ${
					Date.now() - startTime
				}ms`
			);
		} catch (error) {
			console.error("Loading sequence error:", error);
			// Emergency completion handling
			document.body.setAttribute("data-loading-complete", "true");
			document.body.setAttribute("data-loading-ready-for-crossfade", "true");
			animate(containerOpacitySpring, 0, { duration: 0.5 });
			setAnimationComplete(true);
			setIsVisible(false);
		}
	}, [
		progress,
		containerOpacitySpring,
		completionScaleSpring,
		completionGlow,
		shimmerControls,
		breathingControls,
		triggerShimmerSequence,
	]);

	// Start loading sequence
	useEffect(() => {
		console.log("InitialLoadingScreen: Component mounted, starting sequence");
		runLoadingSequence();

		return () => {
			if (animationFrameRef.current) {
				cancelAnimationFrame(animationFrameRef.current);
			}
			if (completionTimeoutRef.current) {
				clearTimeout(completionTimeoutRef.current);
			}
		};
	}, [runLoadingSequence]);

	// Fallback emergency timeout
	useEffect(() => {
		const emergencyTimeout = setTimeout(() => {
			if (isVisible && !animationComplete) {
				console.warn(
					"InitialLoadingScreen: Emergency timeout - forcing completion"
				);
				document.body.setAttribute("data-loading-complete", "true");
				document.body.setAttribute("data-loading-ready-for-crossfade", "true");
				animate(containerOpacitySpring, 0, { duration: 0.5 });
				setAnimationComplete(true);
				setIsVisible(false);
			}
		}, 12000);

		return () => clearTimeout(emergencyTimeout);
	}, [isVisible, animationComplete, containerOpacitySpring]);

	// Enhanced animation variants for sophisticated phase transitions with synchronized exit
	const containerVariants: Variants = {
		entrance: {
			opacity: 1,
			scale: 1,
			transition: { ...MOTION_SPRING_CONFIGS.GENTLE, delay: 0.2 },
		},
		logo: {
			opacity: 1,
			scale: 1,
			transition: MOTION_SPRING_CONFIGS.GENTLE,
		},
		content: {
			opacity: 1,
			scale: 1,
			transition: MOTION_SPRING_CONFIGS.GENTLE,
		},
		progress: {
			opacity: 1,
			scale: 1,
			transition: MOTION_SPRING_CONFIGS.GENTLE,
		},
		completion: {
			opacity: 1,
			scale: 1,
			transition: MOTION_SPRING_CONFIGS.GENTLE,
		},
		ready: {
			opacity: 0.95,
			scale: 0.99,
			transition: MOTION_SPRING_CONFIGS.QUICK_FADE,
		},
		exit: {
			opacity: [1, 1, 0],
			scale: [1, 1.15, 0],
			x: [0, 0, 0],
			y: [0, 0, 0],
			transition: {
				duration: 0.8,
				times: [0, 0.3, 1],
				ease: "easeInOut",
			},
		},
	};

	// Enhanced logo variants with natural bounce physics
	const logoVariants: Variants = {
		entrance: { opacity: 0, scale: 0.8, y: 20 },
		logo: {
			opacity: 1,
			scale: 1,
			y: 0,
			transition: { ...MOTION_SPRING_CONFIGS.SNAPPY, delay: 0.1 },
		},
		content: {
			opacity: 1,
			scale: 1,
			y: 0,
			transition: MOTION_SPRING_CONFIGS.GENTLE,
		},
		progress: {
			opacity: 1,
			scale: 1,
			y: 0,
			transition: MOTION_SPRING_CONFIGS.GENTLE,
		},
		completion: {
			opacity: 1,
			scale: 1,
			y: 0,
			transition: MOTION_SPRING_CONFIGS.GENTLE,
		},
		ready: {
			opacity: 0.9,
			scale: 0.98,
			y: 5,
			transition: MOTION_SPRING_CONFIGS.QUICK_FADE,
		},
		exit: {
			opacity: [1, 1, 0],
			scale: [1, 1.2, 0],
			y: [0, 0, 0],
			rotate: [0, 0, 0],
			transition: {
				duration: 0.8,
				times: [0, 0.3, 1],
				ease: "easeInOut",
			},
		},
	};

	// Enhanced text variants with subtle bounce
	const textVariants: Variants = {
		entrance: { opacity: 0, scale: 0.95, y: 20 },
		logo: {
			opacity: 0.8,
			scale: 1,
			y: 0,
			transition: { ...MOTION_SPRING_CONFIGS.GENTLE, delay: 0.3 },
		},
		content: {
			opacity: 1,
			scale: 1,
			y: 0,
			transition: MOTION_SPRING_CONFIGS.GENTLE,
		},
		progress: {
			opacity: 1,
			scale: 1,
			y: 0,
			transition: MOTION_SPRING_CONFIGS.GENTLE,
		},
		completion: {
			opacity: 1,
			scale: 1,
			y: 0,
			transition: MOTION_SPRING_CONFIGS.GENTLE,
		},
		ready: {
			opacity: 0.8,
			scale: 0.98,
			y: 5,
			transition: MOTION_SPRING_CONFIGS.QUICK_FADE,
		},
		exit: {
			opacity: [1, 1, 0],
			scale: [1, 1.1, 0],
			y: [0, 0, 0],
			x: [0, 0, 0],
			transition: {
				duration: 0.8,
				times: [0, 0.3, 1],
				ease: "easeInOut",
			},
		},
	};

	return (
		<>
			<StyleInjector />
			<AnimatePresence mode="wait">
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
						initial={{ opacity: 0, scale: 1.05, y: 20 }}
						animate={{
							opacity: 1,
							scale: 1,
							y: 0,
							transition: MOTION_SPRING_CONFIGS.GENTLE,
						}}
						exit={{
							opacity: [1, 1, 0],
							scale: [1, 1.15, 0],
							y: [0, 0, 0],
							rotate: [0, 0, 0],
							transition: {
								duration: 0.8,
								times: [0, 0.3, 1],
								ease: "easeInOut",
							},
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
										opacity: [1, 1, 0],
										scale: [1, 1.2, 0],
										y: [0, 0, 0],
										rotate: [0, 0, 0],
										transition: {
											duration: 0.8,
											times: [0, 0.3, 1],
											ease: "easeInOut",
										},
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
													height: `${
														Math.min(SPACING.CINEMATIC_MD, 80) + 30
													}px`,
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
													opacity: [1, 1, 0],
													scale: [1, 1.25, 0],
													y: [0, 0, 0],
													transition: {
														duration: 0.8,
														times: [0, 0.3, 1],
														ease: "easeInOut",
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
													height: `${
														Math.min(SPACING.CINEMATIC_MD, 80) + 60
													}px`,
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
													opacity: [1, 1, 0],
													scale: [1, 1.3, 0],
													y: [0, 0, 0],
													transition: {
														duration: 0.8,
														times: [0, 0.3, 1],
														ease: "easeInOut",
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
										exit={{
											opacity: [1, 1, 0],
											scale: [1, 1.1, 0],
											y: [0, 0, 0],
											x: [0, 0, 0],
											rotate: [0, 0, 0],
											transition: {
												duration: 0.8,
												times: [0, 0.3, 1],
												ease: "easeInOut",
											},
										}}
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
										opacity: [
											"content", // Progress bar appears in content phase (after 0.5s)
											"progress",
											"completion",
											"ready",
											"exit",
										].includes(currentPhase.phase)
											? 1
											: 0,
										scaleX: 1,
										y: 0,
									}}
									exit={{
										opacity: [1, 1, 0],
										scaleX: [1, 1.1, 0],
										scaleY: [1, 1.1, 0],
										y: [0, 0, 0],
										x: [0, 0, 0],
										rotate: [0, 0, 0],
										transition: {
											duration: 0.8,
											times: [0, 0.3, 1],
											ease: "easeInOut",
										},
									}}
									transition={MOTION_SPRING_CONFIGS.GENTLE}>
									<motion.div
										className="relative overflow-hidden backdrop-blur-sm"
										style={{
											height: `${SPACING.XS}px`,
											borderRadius: `${SPACING.XS / 2}px`,
											background: "rgba(30, 41, 59, 0.8)",
											boxShadow: SHADOWS.CINEMATIC_SOFT,
											scale: completionScaleSpring,
											willChange: "transform",
										}}>
										{/* Enhanced progress fill with sophisticated gradient and glow */}
										<motion.div
											className="absolute left-0 top-0 h-full rounded-full"
											style={{
												width: progressWidth,
												background:
													"linear-gradient(90deg, #3b82f6 0%, #06b6d4 50%, #0ea5e9 100%)",
												transformOrigin: "left",
												willChange: "width, transform, filter",
												filter: progressBrightness,
												boxShadow: useTransform(
													completionGlowSpring,
													[0, 0.5, 1],
													[
														"0 0 16px rgba(59, 130, 246, 0.4)",
														"0 0 24px rgba(59, 130, 246, 0.6), 0 0 48px rgba(6, 182, 212, 0.4)",
														"0 0 32px rgba(59, 130, 246, 0.8), 0 0 64px rgba(6, 182, 212, 0.6)",
													]
												),
											}}
										/>

										{/* Sophisticated shimmer effect overlay with Motion controls */}
										<motion.div
											className="absolute inset-0 overflow-hidden rounded-full"
											style={{
												background:
													"linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
												width: "50%",
												willChange: "transform",
											}}
											animate={shimmerControls}
											initial={{ x: -120 }}
										/>
									</motion.div>

									{/* Enhanced progress percentage with sophisticated typography */}
									<motion.div
										className="text-center mt-3"
										style={{
											fontFamily: '"Courier New", monospace',
											fontSize: `${TYPOGRAPHY.SIZES.SM}px`,
											color: useTransform(
												completionGlowSpring,
												[0, 1],
												["rgba(56, 189, 248, 0.8)", "rgba(255, 255, 255, 1)"]
											),
											letterSpacing: TYPOGRAPHY.LETTER_SPACING.WIDER,
											textShadow: useTransform(
												completionGlowSpring,
												[0, 1],
												[
													"0 0 10px rgba(56, 189, 248, 0.3)",
													"0 0 20px rgba(255, 255, 255, 0.6)",
												]
											),
											willChange: "transform, opacity",
											scale: completionScaleSpring,
										}}
										initial={{ opacity: 0 }}
										animate={{ opacity: 1 }}
										transition={{ delay: 0.5 }}>
										<motion.span>{displayedPercentage}</motion.span>%
									</motion.div>
								</motion.div>
							</motion.div>
						</div>

						{/* Sophisticated vignette overlay for cinematic depth */}
						<div
							className="absolute inset-0 pointer-events-none"
							style={{
								background: `
								radial-gradient(ellipse at center, transparent 60%, rgba(0, 0, 0, 0.05) 95%),
								linear-gradient(0deg, rgba(15, 23, 42, 0.1) 0%, transparent 20%, transparent 80%, rgba(15, 23, 42, 0.1) 100%)
							`,
							}}
						/>
					</motion.div>
				)}
			</AnimatePresence>
		</>
	);
};
