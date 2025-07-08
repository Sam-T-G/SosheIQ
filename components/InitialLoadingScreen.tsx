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

// Firefly particle system - authentic firefly field effect
const FIREFLY_COUNT = 15; // Reduced to 15 for fewer fireflies
const FIREFLY_BLUE = "rgba(59, 130, 246, 0.9)"; // Increased opacity from 0.8 to 0.9
const FIREFLY_LIGHT_BLUE = "rgba(56, 189, 248, 0.8)"; // Increased opacity from 0.6 to 0.8

// Generate fireflies with natural characteristics
const generateFireflies = () => {
	return Array.from({ length: FIREFLY_COUNT }, (_, i) => ({
		id: i,
		// Fireflies use consistent blue color palette
		color: Math.random() > 0.7 ? FIREFLY_LIGHT_BLUE : FIREFLY_BLUE,
		size: Math.random() * 3 + 2, // 2-5px (small like real fireflies)
		initialX: Math.random() * 100, // 0-100%
		initialY: Math.random() * 100, // 0-100%
		// Natural firefly movement patterns
		driftRange: Math.random() * 40 + 15, // 15-55px gentle drift
		duration: Math.random() * 12 + 8, // 8-20s slow, natural movement
		delay: Math.random() * 5, // 0-5s staggered appearance
		// Firefly-specific properties
		pulseSpeed: Math.random() * 2 + 1.5, // 1.5-3.5s pulse cycle
		glowIntensity: Math.random() * 0.3 + 0.7, // Increased from 0.4 + 0.6 to 0.3 + 0.7 (0.7-1.0 range)
		flickerPattern: Math.random(), // 0-1 for flicker variation
		floatDirection: Math.random() * Math.PI * 2, // Random float direction
		verticalBias: Math.random() * 0.3 + 0.1, // 0.1-0.4 upward tendency
	}));
};

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
	fireflyFloat: `
		@keyframes fireflyFloat {
			0% { transform: translateY(0px) translateX(0px) scale(1); }
			25% { transform: translateY(-8px) translateX(5px) scale(1.1); }
			50% { transform: translateY(3px) translateX(-3px) scale(0.9); }
			75% { transform: translateY(-5px) translateX(2px) scale(1.05); }
			100% { transform: translateY(0px) translateX(0px) scale(1); }
		}
	`,
	fireflyGlow: `
		@keyframes fireflyGlow {
			0% { opacity: 0.3; filter: blur(1px) brightness(1.2); box-shadow: 0 0 8px currentColor; }
			50% { opacity: 1; filter: blur(2px) brightness(1.8); box-shadow: 0 0 16px currentColor, 0 0 24px currentColor; }
			100% { opacity: 0.3; filter: blur(1px) brightness(1.2); box-shadow: 0 0 8px currentColor; }
		}
	`,
	fireflyFlicker: `
		@keyframes fireflyFlicker {
			0%, 90%, 100% { opacity: 1; }
			95% { opacity: 0.2; }
		}
	`,
} as const;

// Add style tag to inject keyframes
const StyleInjector: React.FC = () => (
	<style>{Object.values(KEYFRAMES).join("\n")}</style>
);

const PROGRESS_MESSAGES = [
	"Calibrating personality matrix...",
	"Optimizing conversation algorithms...",
	"Loading scenario details...",
	"Preparing your experience...",
	"Loading neural networks...",
];

// Modular: how many random progress messages to show
const NUM_PROGRESS_MESSAGES_TO_SHOW = 3; // Adjust as needed

interface InitialLoadingScreenProps {
	showFireflies?: boolean;
}

export const InitialLoadingScreen: React.FC<InitialLoadingScreenProps> = ({
	showFireflies = false,
}) => {
	// 🔥 CRITICAL: ALL HOOKS MUST BE DECLARED FIRST - NO CONDITIONAL LOGIC BEFORE HOOKS
	// This is the key to preventing "Rendered fewer hooks than expected" errors

	// State hooks - ALWAYS called in the same order
	const [isVisible, setIsVisible] = useState(true);
	const [animationComplete, setAnimationComplete] = useState(false);
	const [showGlow, setShowGlow] = useState(false);
	const [glowOpacity, setGlowOpacity] = useState(0); // Start at 0 for smooth ease-in
	const [currentPhase, setCurrentPhase] = useState<LoadingPhase>({
		phase: "entrance",
		message: "Initializing SosheIQ...",
		progress: 0,
	});
	const [isCollapsing, setIsCollapsing] = useState(false);
	const [isClient, setIsClient] = useState(false); // Hydration safety
	const [showContent, setShowContent] = useState(false);
	const [popPhase, setPopPhase] = useState<"spring" | "settle">("spring");
	const [showBlack, setShowBlack] = useState(true);

	// Motion values - ALWAYS called in the same order
	const progress = useMotionValue(0);
	const progressSpring = useSpring(progress, {
		...MOTION_SPRING_CONFIGS.CINEMATIC,
		stiffness: 35, // even lower for more ease
		damping: 22, // even higher for more smoothness
	});
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

	// Enhanced loading sequence with perfect timing synchronization
	const runLoadingSequence = useCallback(async () => {
		try {
			const startTime = Date.now();
			console.log("InitialLoadingScreen: Starting loading sequence");

			// Phase 1: Entrance - Quick entrance
			setCurrentPhase({
				phase: "entrance",
				message: "Initializing SosheIQ...",
				progress: 0,
			});

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
			// triggerShimmerSequence();

			await new Promise((resolve) =>
				setTimeout(resolve, LOADING_SEQUENCE.LOGO_DURATION)
			);

			// Phase 3: Content - Progress bar becomes visible here (after 0.5s total)
			setCurrentPhase({
				phase: "content",
				message: "Preparing your experience...",
				progress: 75,
			});
			animate(progress, 75, {
				duration: 0.84, // 30% reduction: 1.2 * 0.7 = 0.84 seconds
				ease: EASING_CURVES.dramaticReveal,
			});
			await new Promise((resolve) =>
				setTimeout(resolve, LOADING_SEQUENCE.CONTENT_DURATION)
			);
			// Add extra delay for 'Preparing your experience...'
			await new Promise((resolve) => setTimeout(resolve, 600));

			// Phase 4: Progress - Optimized progress with multiple text changes
			setCurrentPhase({
				phase: "progress",
				message: "Loading neural networks...",
				progress: 65,
			});

			// Randomly select one unique message
			const shuffled = PROGRESS_MESSAGES.slice().sort(
				() => 0.5 - Math.random()
			);
			const selectedMessage = shuffled.slice(
				0,
				NUM_PROGRESS_MESSAGES_TO_SHOW
			)[0];

			// Show the single random message
			setTimeout(() => {
				setCurrentPhase((prev) => ({
					...prev,
					message: selectedMessage,
				}));
			}, 700);

			// Show 'Almost ready...' last
			setTimeout(() => {
				setCurrentPhase((prev) => ({
					...prev,
					message: "Almost ready...",
				}));
				// Animate progress to 100%
				animate(progress, 100, {
					duration: 0.7,
					ease: EASING_CURVES.dramaticReveal,
				});
			}, 2100);

			// Wait for progress sequence
			// await progressSequence;

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

	// Add showContent state and set it true after 500ms
	useEffect(() => {
		const timer = setTimeout(() => setShowContent(true), 500);
		return () => clearTimeout(timer);
	}, []);

	// Efficient black screen delay using requestIdleCallback or setTimeout
	useEffect(() => {
		let timeoutId: any;
		// Instead of removing black after 400ms, wait until showContent is true (500ms)
		if (showContent) {
			// Fade out black overlay for polish
			timeoutId = setTimeout(() => setShowBlack(false), 100); // fade out after content is ready
		}
		return () => clearTimeout(timeoutId);
	}, [showContent]);

	// Auto-start glow when black overlay is removed and content is visible
	useEffect(() => {
		if (showContent && !showBlack && !showGlow && isClient) {
			setShowGlow(true);

			// Gradually increase glow opacity
			const startTime = Date.now();
			const duration = 1250;
			const targetOpacity = 0.6;

			const animateGlowOpacity = () => {
				const elapsed = Date.now() - startTime;
				const progress = Math.min(elapsed / duration, 1);

				const easedProgress =
					progress < 0.5
						? 2 * progress * progress
						: 1 - Math.pow(-2 * progress + 2, 3) / 2;

				setGlowOpacity(easedProgress * targetOpacity);

				if (progress < 1) {
					requestAnimationFrame(animateGlowOpacity);
				}
			};

			requestAnimationFrame(animateGlowOpacity);
		}
	}, [showContent, showBlack, showGlow, isClient]);

	// 🔥 CRITICAL: Early return ONLY AFTER all hooks are declared
	// This prevents "Rendered fewer hooks than expected" errors
	if (!isClient) {
		// Render a blank black screen during hydration to avoid showing 'Loading...'
		return <div className="fixed inset-0 bg-black z-50 w-screen h-screen" />;
	}

	if (!isVisible && animationComplete) {
		return null;
	}

	// Enhanced animation variants for sophisticated phase transitions
	const containerVariants: Variants = {
		entrance: {
			opacity: 1,
			scale: 1,
			transition: {
				...MOTION_SPRING_CONFIGS.GENTLE,
				delay: 0.1,
				ease: [0.22, 1, 0.36, 1],
			}, // Adjusted for 4 second total
		},
		logo: {
			opacity: 1,
			scale: 1,
			transition: { ...MOTION_SPRING_CONFIGS.GENTLE, ease: [0.22, 1, 0.36, 1] },
		},
		content: {
			opacity: 1,
			scale: 1,
			transition: { ...MOTION_SPRING_CONFIGS.GENTLE, ease: [0.22, 1, 0.36, 1] },
		},
		progress: {
			opacity: 1,
			scale: 1,
			transition: { ...MOTION_SPRING_CONFIGS.GENTLE, ease: [0.22, 1, 0.36, 1] },
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

	// Enhanced logo variants with natural bounce physics - NO OPACITY CONTROL
	const logoVariants: Variants = {
		entrance: { scale: 0.8, y: 20 },
		logo: {
			scale: 1,
			y: 0,
			transition: { ...MOTION_SPRING_CONFIGS.GENTLE, ease: [0.22, 1, 0.36, 1] },
		},
		content: {
			scale: 1,
			y: 0,
			transition: { ...MOTION_SPRING_CONFIGS.GENTLE, ease: [0.22, 1, 0.36, 1] },
		},
		progress: {
			scale: 1,
			y: 0,
			transition: { ...MOTION_SPRING_CONFIGS.GENTLE, ease: [0.22, 1, 0.36, 1] },
		},
		exit: {
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
			transition: {
				...MOTION_SPRING_CONFIGS.GENTLE,
				delay: 0.21,
				ease: [0.22, 1, 0.36, 1],
			}, // 30% reduction: 0.3 * 0.7 = 0.21
		},
		content: {
			opacity: 1,
			scale: 1,
			y: 0,
			transition: { ...MOTION_SPRING_CONFIGS.GENTLE, ease: [0.22, 1, 0.36, 1] },
		},
		progress: {
			opacity: 1,
			scale: 1,
			y: 0,
			transition: { ...MOTION_SPRING_CONFIGS.GENTLE, ease: [0.22, 1, 0.36, 1] },
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
			<AnimatePresence>
				{showBlack && (
					<motion.div
						key="black-overlay"
						className="fixed inset-0 z-[10000] bg-black w-screen h-screen"
						initial={{ opacity: 1 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.35, ease: "easeInOut" }}
					/>
				)}
			</AnimatePresence>
			{!showBlack && showContent && (
				<AnimatePresence mode="wait">
					{isVisible && (
						<>
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
								variants={containerVariants}
								initial="entrance"
								animate="content"
								exit="exit"
								transition={
									popPhase === "spring"
										? {
												type: "spring",
												stiffness: 180,
												damping: 22,
												mass: 1.1,
												duration: 0.7,
										  }
										: {
												type: "tween",
												duration: 0.18,
												ease: [0.22, 1, 0.36, 1],
										  }
								}>
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
											gap: "1.2rem",
											willChange: "transform, opacity",
											position: "relative",
											zIndex: 1,
										}}
										variants={containerVariants}
										initial="entrance"
										animate={currentPhase.phase}
										exit="exit"
										transition={
											popPhase === "spring"
												? {
														type: "spring",
														stiffness: 180,
														damping: 22,
														mass: 1.1,
														duration: 0.7,
												  }
												: {
														type: "tween",
														duration: 0.18,
														ease: [0.22, 1, 0.36, 1],
												  }
										}>
										{/* Logo with enhanced glow system */}
										<motion.div
											className="relative flex items-center justify-center"
											variants={logoVariants}
											initial="entrance"
											animate={currentPhase.phase}
											exit="exit"
											transition={
												popPhase === "spring"
													? {
															type: "spring",
															stiffness: 180,
															damping: 22,
															mass: 1.1,
															duration: 0.7,
													  }
													: {
															type: "tween",
															duration: 0.18,
															ease: [0.22, 1, 0.36, 1],
													  }
											}
											style={{ width: "260px", height: "100px" }}>
											{/* Primary glow */}
											<motion.div
												className="absolute rounded-full"
												style={{
													top: "-30px",
													left: "-30px",
													right: "-30px",
													bottom: "-30px",
													background:
														"radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, rgba(59, 130, 246, 0.08) 30%, rgba(59, 130, 246, 0.04) 60%, transparent 85%)",
													filter: "blur(26px)",
													willChange: "opacity, transform",
													zIndex: 1,
													opacity: glowOpacity,
												}}
												whileInView={
													showGlow && glowOpacity > 0.1
														? {
																scale: [1, 1.15, 1],
																filter: [
																	"blur(26px)",
																	"blur(35px)",
																	"blur(26px)",
																],
														  }
														: {}
												}
												transition={{
													duration: 3.7,
													ease: "easeInOut",
													repeat: Infinity,
													repeatType: "loop",
												}}
											/>
											{/* Secondary glow */}
											<motion.div
												className="absolute rounded-full"
												style={{
													top: "-3px",
													left: "-6px",
													right: "-6px",
													bottom: "-3px",
													background:
														"radial-gradient(circle, rgba(6, 182, 212, 0.12) 0%, rgba(6, 182, 212, 0.06) 40%, rgba(6, 182, 212, 0.02) 70%, transparent 90%)",
													filter: "blur(19.5px)",
													willChange: "opacity, transform",
													zIndex: 2,
													opacity: glowOpacity * 0.8,
												}}
												whileInView={
													showGlow && glowOpacity > 0.1
														? {
																scale: [1, 1.18, 1.25, 1.18, 1],
																filter: [
																	"blur(19.5px)",
																	"blur(28px)",
																	"blur(32px)",
																	"blur(28px)",
																	"blur(19.5px)",
																],
														  }
														: {}
												}
												transition={{
													duration: 4.8,
													ease: "easeInOut",
													repeat: Infinity,
													repeatType: "loop",
													delay: 0.5,
												}}
											/>
											{/* Tertiary inner glow */}
											<motion.div
												className="absolute rounded-full"
												style={{
													top: "8px",
													left: "22px",
													right: "22px",
													bottom: "8px",
													background:
														"radial-gradient(circle, rgba(56, 189, 248, 0.1) 0%, rgba(56, 189, 248, 0.05) 50%, transparent 80%)",
													filter: "blur(13px)",
													willChange: "opacity, transform",
													zIndex: 3,
													opacity: glowOpacity * 0.6,
												}}
											/>
											{/* Logo */}
											<SosheIQLogo
												className="relative z-10"
												style={{
													height: "120px",
													width: "auto",
													filter: `drop-shadow(0 0 12px rgba(59, 130, 246, ${
														glowOpacity * 0.3
													}))`,
													willChange: "transform, filter",
												}}
											/>
										</motion.div>

										{/* Loading message */}
										<motion.div
											className="text-center w-full"
											style={{ padding: "0 1rem" }}
											variants={textVariants}
											initial="entrance"
											animate={currentPhase.phase}
											exit="exit"
											transition={
												popPhase === "spring"
													? {
															type: "spring",
															stiffness: 180,
															damping: 22,
															mass: 1.1,
															duration: 0.7,
													  }
													: {
															type: "tween",
															duration: 0.18,
															ease: [0.22, 1, 0.36, 1],
													  }
											}>
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
													popPhase === "spring"
														? {
																type: "spring",
																stiffness: 180,
																damping: 22,
																mass: 1.1,
																duration: 0.7,
														  }
														: {
																type: "tween",
																duration: 0.18,
																ease: [0.22, 1, 0.36, 1],
														  }
												}>
												{currentPhase.message}
											</motion.p>
										</motion.div>

										{/* Progress bar */}
										<motion.div
											className="w-full"
											style={{ maxWidth: "20rem", padding: "0 1rem" }}
											variants={textVariants}
											initial="entrance"
											animate={currentPhase.phase}
											exit="exit"
											transition={
												popPhase === "spring"
													? {
															type: "spring",
															stiffness: 180,
															damping: 22,
															mass: 1.1,
															duration: 0.7,
													  }
													: {
															type: "tween",
															duration: 0.18,
															ease: [0.22, 1, 0.36, 1],
													  }
											}>
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
												transition={{ delay: 0.35, ease: [0.22, 1, 0.36, 1] }}>
												<motion.span>{displayedPercentage}</motion.span>%
											</motion.div>
										</motion.div>
									</motion.div>
								</div>
							</motion.div>
						</>
					)}
				</AnimatePresence>
			)}
		</>
	);
};
