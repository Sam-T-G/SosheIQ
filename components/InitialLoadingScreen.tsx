/**
 * Motion-Optimized Initial Loading Screen with Perfect Viewport Centering
 * Enhanced with refined bounce effects and momentum curves using Motion physics
 * Fixed for hydration safety and proper hook sequencing
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

// Enhanced timing constants for seamless cinematic experience - 4 second target
const LOADING_SEQUENCE = {
	ENTRANCE_DURATION: 100, // Quick entrance
	LOGO_DURATION: 150, // Quick logo phase - total 0.25s before progress
	CONTENT_DURATION: 500, // Content phase
	PROGRESS_DURATION: 1800, // Progress bar animation
	COMPLETION_DURATION: 800, // Completion phase
	READY_DURATION: 400, // Ready phase
	EXIT_DURATION: 400, // Exit animations
	TRANSITION_HANDOFF_DELAY: 100, // Precise handoff timing
	MINIMUM_TOTAL_DURATION: 4000, // 4 second total duration
} as const;

// Advanced easing curves for sophisticated momentum
const EASING_CURVES = {
	gentleEntrance: [0.16, 1, 0.3, 1] as const,
	dramaticReveal: [0.25, 0.46, 0.45, 0.94] as const,
	snappyBounce: [0.68, -0.55, 0.265, 1.55] as const,
	smoothMomentum: [0.4, 0, 0.2, 1] as const,
	breathingMomentum: "cubic-bezier(0.4, 0, 0.6, 1)" as const,
	elegantProgress: [0.4, 0.0, 0.2, 1] as const,
} as const;

// Enhanced Motion spring configurations with sophisticated physics
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
	// Sophisticated exit with controlled spring physics
	SPRINGY_EXIT: {
		type: "spring" as const,
		damping: 20,
		stiffness: 200,
		mass: 0.8,
		bounce: 0.25,
		restSpeed: 0.01,
		restDelta: 0.001,
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
	// 🔥 CRITICAL: ALL HOOKS MUST BE DECLARED FIRST - NO CONDITIONAL LOGIC BEFORE HOOKS
	// This is the key to preventing "Rendered fewer hooks than expected" errors

	// State hooks - ALWAYS called in the same order
	const [isVisible, setIsVisible] = useState(true);
	const [animationComplete, setAnimationComplete] = useState(false);
	const [showGlow, setShowGlow] = useState(false);
	const [glowOpacity, setGlowOpacity] = useState(0.8);
	const [currentPhase, setCurrentPhase] = useState<LoadingPhase>({
		phase: "entrance",
		message: "Initializing SosheIQ...",
		progress: 0,
	});
	const [isCollapsing, setIsCollapsing] = useState(false);
	const [isClient, setIsClient] = useState(false); // Hydration safety

	// Motion values - ALWAYS called in the same order
	const progress = useMotionValue(0);
	const progressSpring = useSpring(progress, MOTION_SPRING_CONFIGS.CINEMATIC);
	const containerOpacitySpring = useSpring(1, MOTION_SPRING_CONFIGS.GENTLE);
	const completionScaleSpring = useSpring(1, MOTION_SPRING_CONFIGS.SNAPPY);

	// Advanced Motion controls - ALWAYS called in the same order
	const shimmerControls = useAnimation();
	const breathingControls = useAnimation();
	const completionGlow = useMotionValue(0);
	const completionGlowSpring = useSpring(
		completionGlow,
		MOTION_SPRING_CONFIGS.GENTLE
	);

	// Transform chains - ALWAYS called in the same order
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

	// Progress bar box shadow transform - ALWAYS called in same order
	const progressBoxShadow = useTransform(
		completionGlowSpring,
		[0, 0.5, 1],
		[
			"0 0 16px rgba(59, 130, 246, 0.4)",
			"0 0 24px rgba(59, 130, 246, 0.6), 0 0 48px rgba(6, 182, 212, 0.4)",
			"0 0 32px rgba(59, 130, 246, 0.8), 0 0 64px rgba(6, 182, 212, 0.6)",
		]
	);

	// Progress percentage color and text shadow transforms - ALWAYS called in same order
	const progressTextColor = useTransform(
		completionGlowSpring,
		[0, 1],
		["rgba(56, 189, 248, 0.8)", "rgba(255, 255, 255, 1)"]
	);
	const progressTextShadow = useTransform(
		completionGlowSpring,
		[0, 1],
		["0 0 10px rgba(56, 189, 248, 0.3)", "0 0 20px rgba(255, 255, 255, 0.6)"]
	);

	// Performance optimization refs - ALWAYS called in the same order
	const animationFrameRef = useRef<number>();
	const completionTimeoutRef = useRef<NodeJS.Timeout>();
	const startTimeRef = useRef<number>(Date.now());

	// Callback hooks - ALWAYS called in the same order
	const triggerShimmerSequence = useCallback(async () => {
		shimmerControls.start({
			x: 300,
			transition: {
				duration: 1.4, // Adjusted for 4 second total duration
				ease: [0.4, 0.0, 0.2, 1],
				repeat: Infinity,
				repeatDelay: 0.4, // Adjusted for 4 second total duration
			},
		});
	}, [shimmerControls]);

	// Enhanced loading sequence with sophisticated timing and text dialogues
	const runLoadingSequence = useCallback(async () => {
		const startTime = Date.now();
		startTimeRef.current = startTime;

		try {
			console.log(
				"InitialLoadingScreen: Starting sophisticated loading sequence - hooks fixed"
			);

			// Phase 1: Entrance - Quick entrance (200ms)
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
				duration: 0.56, // 30% reduction: 0.8 * 0.7 = 0.56 seconds
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
				duration: 0.84, // 30% reduction: 1.2 * 0.7 = 0.84 seconds
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

			// Animate progress through multiple stages with text changes - 4 second target
			const progressSequence = animate(progress, [45, 65, 75, 87, 99], {
				duration: 1.4, // Adjusted for 4 second total duration
				ease: "linear",
				times: [0, 0.3, 0.6, 0.8, 1],
			});

			// Text dialogue changes during progress - 4 second timing
			setTimeout(() => {
				setCurrentPhase((prev) => ({
					...prev,
					message: "Calibrating personality matrix...",
				}));
			}, 450); // Adjusted for 4 second total

			setTimeout(() => {
				setCurrentPhase((prev) => ({
					...prev,
					message: "Optimizing conversation algorithms...",
				}));
			}, 900); // Adjusted for 4 second total

			setTimeout(() => {
				setCurrentPhase((prev) => ({
					...prev,
					message: "Almost ready...",
				}));
			}, 1200); // Adjusted for 4 second total

			// Wait for progress sequence
			await progressSequence;

			// Ensure minimum duration
			const elapsed = Date.now() - startTime;
			const remaining = LOADING_SEQUENCE.MINIMUM_TOTAL_DURATION - elapsed;
			if (remaining > 0) {
				await new Promise((resolve) => setTimeout(resolve, remaining));
			}

			// Signal completion and start exit - NO COMPLETION PHASE ANIMATIONS
			document.body.setAttribute("data-loading-complete", "true");
			document.body.setAttribute("data-loading-ready-for-crossfade", "true");

			// Go directly to exit animation
			console.log("Starting exit phase...");
			setCurrentPhase({
				phase: "exit",
				message: "",
				progress: 99,
			});

			// Trigger collapse state for variants
			setIsCollapsing(true);

			// Immediate glow shutdown for clean transition
			setShowGlow(false);
			setGlowOpacity(0);

			// Wait for exit animations to complete - reduced linger delay
			await new Promise((resolve) => setTimeout(resolve, 100)); // Reduced by 0.3s as requested

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

	// Effect hooks - ALWAYS called in the same order
	// Hydration safety - ensure client-side rendering
	useEffect(() => {
		setIsClient(true);
	}, []);

	// Start loading sequence
	useEffect(() => {
		if (isClient) {
			console.log("InitialLoadingScreen: Component mounted, starting sequence");
			runLoadingSequence();
		}

		return () => {
			if (animationFrameRef.current) {
				cancelAnimationFrame(animationFrameRef.current);
			}
			if (completionTimeoutRef.current) {
				clearTimeout(completionTimeoutRef.current);
			}
		};
	}, [isClient, runLoadingSequence]);

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
		}, 8000); // Adjusted emergency timeout for 4 second loading

		return () => clearTimeout(emergencyTimeout);
	}, [isVisible, animationComplete, containerOpacitySpring]);

	// 🔥 CRITICAL: Early return ONLY AFTER all hooks are declared
	// This prevents "Rendered fewer hooks than expected" errors
	if (!isClient) {
		// Return a simple loading state during hydration
		return (
			<div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
				<div className="text-white">Loading...</div>
			</div>
		);
	}

	if (!isVisible && animationComplete) {
		return null;
	}

	// Enhanced animation variants for sophisticated phase transitions
	const containerVariants: Variants = {
		entrance: {
			opacity: 1,
			scale: 1,
			transition: { ...MOTION_SPRING_CONFIGS.GENTLE, delay: 0.1 }, // Adjusted for 4 second total
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
		exit: {
			opacity: 0,
			scale: 0, // Direct collapse without breathe out
			transition: {
				duration: 0.4, // Adjusted for 4 second total
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
			transition: { ...MOTION_SPRING_CONFIGS.SNAPPY, delay: 0.05 }, // Adjusted for 4 second total
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
		exit: {
			opacity: 0,
			scale: 0, // Direct collapse without breathe out
			transition: {
				duration: 0.56, // 30% reduction: 0.8 * 0.7 = 0.56 seconds
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
			transition: { ...MOTION_SPRING_CONFIGS.GENTLE, delay: 0.21 }, // 30% reduction: 0.3 * 0.7 = 0.21
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
		exit: {
			opacity: 0,
			scale: 0, // Direct collapse without breathe out
			transition: {
				duration: 0.56, // 30% reduction: 0.8 * 0.7 = 0.56 seconds
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
							backgroundColor: "#000",
						}}
						initial={{ opacity: 0, scale: 1.05, y: 20 }}
						animate={{
							opacity: 1,
							scale: 1,
							y: 0,
							transition: MOTION_SPRING_CONFIGS.GENTLE,
						}}
						exit={{
							opacity: 0,
							scale: 0, // Direct collapse without breathe out
							transition: {
								duration: 0.56, // 30% reduction: 0.8 * 0.7 = 0.56 seconds
								ease: "easeInOut",
							},
						}}>
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
									maxWidth: "28rem",
									margin: "0 auto",
									gap: "1.5rem",
									willChange: "transform, opacity",
									position: "relative",
									zIndex: 1,
								}}
								variants={containerVariants}
								initial="entrance"
								animate={currentPhase.phase}>
								{/* Logo with enhanced glow system */}
								<motion.div
									className="relative"
									variants={logoVariants}
									initial="entrance"
									animate={currentPhase.phase}>
									<SosheIQLogo
										className="relative z-10"
										style={{
											height: "120px",
											width: "auto",
											filter: "drop-shadow(0 0 24px rgba(59, 130, 246, 0.5))",
											willChange: "transform, filter",
										}}
									/>

									{/* Enhanced primary glow layer */}
									<AnimatePresence>
										{showGlow && (
											<motion.div
												className="absolute rounded-full blur-lg"
												style={{
													height: "150px",
													width: "150px",
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
													scale: 0,
													transition: {
														duration: 0.56, // 30% reduction: 0.8 * 0.7 = 0.56 seconds
														ease: "easeInOut",
													},
												}}
											/>
										)}
									</AnimatePresence>

									{/* Enhanced secondary glow layer */}
									<AnimatePresence>
										{showGlow && (
											<motion.div
												className="absolute rounded-full blur-xl"
												style={{
													height: "180px",
													width: "180px",
													background:
														"radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, rgba(6, 182, 212, 0.1) 40%, transparent 70%)",
													top: "-30px",
													left: "50%",
													transform: "translateX(-50%)",
													willChange: "transform, opacity",
													animation: `breathingGlowSecondary 4800ms ${EASING_CURVES.breathingMomentum} infinite`,
													opacity: glowOpacity,
												}}
												initial={{ opacity: 0 }}
												animate={{ opacity: 1 }}
												exit={{
													opacity: 0,
													scale: 0,
													transition: {
														duration: 0.56, // 30% reduction: 0.8 * 0.7 = 0.56 seconds
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
									animate={currentPhase.phase}>
									<motion.p
										className="font-semibold text-sky-300"
										style={{
											fontSize: "18px",
											lineHeight: 1.6,
											letterSpacing: "0.025em",
											textShadow: "0 0 20px rgba(56, 189, 248, 0.5)",
											willChange: "transform, opacity",
										}}
										key={currentPhase.message}
										initial={{ opacity: 0, scale: 0.95, y: 20 }}
										animate={{ opacity: 1, scale: 1, y: 0 }}
										transition={
											currentPhase.phase === "entrance"
												? { ...MOTION_SPRING_CONFIGS.GENTLE, delay: 0.56 } // 30% reduction: 0.8 * 0.7 = 0.56
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
											"content", // Progress bar appears in content phase
											"progress",
											"exit",
										].includes(currentPhase.phase)
											? 1
											: 0,
										scaleX: 1,
										y: 0,
									}}
									exit={{
										opacity: 0,
										scaleX: 0,
										scaleY: 0,
										transition: {
											duration: 0.56, // 30% reduction: 0.8 * 0.7 = 0.56 seconds
											ease: "easeInOut",
										},
									}}
									transition={MOTION_SPRING_CONFIGS.GENTLE}>
									<motion.div
										className="relative overflow-hidden backdrop-blur-sm"
										style={{
											height: "6px",
											borderRadius: "3px",
											background: "rgba(30, 41, 59, 0.8)",
											boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
											scale: completionScaleSpring,
											willChange: "transform",
										}}>
										{/* Enhanced progress fill */}
										<motion.div
											className="absolute left-0 top-0 h-full rounded-full"
											style={{
												width: progressWidth,
												background:
													"linear-gradient(90deg, #3b82f6 0%, #06b6d4 50%, #0ea5e9 100%)",
												transformOrigin: "left",
												willChange: "width, transform, filter",
												filter: progressBrightness,
												boxShadow: progressBoxShadow,
											}}
										/>

										{/* Sophisticated shimmer effect */}
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

									{/* Enhanced progress percentage */}
									<motion.div
										className="text-center mt-3"
										style={{
											fontFamily: '"Courier New", monospace',
											fontSize: "14px",
											color: progressTextColor,
											letterSpacing: "0.05em",
											textShadow: progressTextShadow,
											willChange: "transform, opacity",
											scale: completionScaleSpring,
										}}
										initial={{ opacity: 0 }}
										animate={{ opacity: 1 }}
										transition={{ delay: 0.35 }}>
										{" "}
										{/* 30% reduction: 0.5 * 0.7 = 0.35 */}
										<motion.span>{displayedPercentage}</motion.span>%
									</motion.div>
								</motion.div>
							</motion.div>
						</div>

						{/* Sophisticated vignette overlay */}
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
