/**
 * Motion-Enhanced Session Loading Screen
 * Features persistent animations with floating particles, breathing effects, and pulsing elements
 * Now with AI-contextual text cycling based on user's scenario details
 * Inspired by Motion React best practices and modern loading UX patterns
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
import { useAILoadingMessages } from "../hooks/useAILoadingMessages";
import type { ScenarioDetails } from "../types";

interface LoadingIndicatorProps {
	message?: string;
	extraClasses?: string;
	scenarioDetails?: ScenarioDetails;
	testMode?: boolean; // Enable random test data generation
}

// Enhanced Motion spring configurations for persistent animations
const MOTION_SPRING_CONFIGS = {
	GENTLE_FLOAT: {
		type: "spring" as const,
		damping: 15,
		stiffness: 120,
		mass: 1.2,
	},
	BREATHING: {
		type: "spring" as const,
		damping: 25,
		stiffness: 80,
		mass: 1.5,
		restSpeed: 0.1,
		restDelta: 0.01,
	},
	PULSE: {
		type: "spring" as const,
		damping: 20,
		stiffness: 200,
		mass: 0.8,
	},
	PARTICLE_DRIFT: {
		type: "spring" as const,
		damping: 40,
		stiffness: 60,
		mass: 2.0,
	},
} as const;

// Firefly particle system - authentic firefly field effect (copied from InitialLoadingScreen)
const FIREFLY_COUNT = 40;
const FIREFLY_BLUE = "rgba(59, 130, 246, 0.9)";
const FIREFLY_LIGHT_BLUE = "rgba(56, 189, 248, 0.8)";

const generateFireflies = () => {
	return Array.from({ length: FIREFLY_COUNT }, (_, i) => ({
		id: i,
		color: Math.random() > 0.7 ? FIREFLY_LIGHT_BLUE : FIREFLY_BLUE,
		size: Math.random() * 3 + 2, // 2-5px
		initialX: Math.random() * 100,
		initialY: Math.random() * 100,
		driftRange: Math.random() * 40 + 15,
		duration: Math.random() * 12 + 8,
		delay: Math.random() * 5,
		pulseSpeed: Math.random() * 2 + 1.5,
		glowIntensity: Math.random() * 0.3 + 0.7,
		flickerPattern: Math.random(),
		floatDirection: Math.random() * Math.PI * 2,
		verticalBias: Math.random() * 0.3 + 0.1,
	}));
};

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
	message = "Loading...",
	extraClasses = "",
	scenarioDetails,
	testMode = false,
}) => {
	const [isClient, setIsClient] = useState(false);
	const [fireflies] = useState(() => generateFireflies());

	// Use AI loading messages hook for dynamic text cycling
	const { currentMessage } = useAILoadingMessages({
		scenarioDetails,
		isLoading: true,
		baseMessage: message,
		testMode,
	});

	// Motion values for breathing and pulsing effects
	const breathingScale = useMotionValue(1);
	const breathingScaleSpring = useSpring(
		breathingScale,
		MOTION_SPRING_CONFIGS.BREATHING
	);
	const pulseOpacity = useMotionValue(0.8);
	const pulseOpacitySpring = useSpring(
		pulseOpacity,
		MOTION_SPRING_CONFIGS.PULSE
	);

	// Animation controls
	const breathingControls = useAnimation();
	const pulseControls = useAnimation();
	const particleControls = useAnimation();

	// Transform chains for enhanced effects
	const logoGlow = useTransform(
		breathingScaleSpring,
		[0.95, 1.05],
		["0 0 20px rgba(59, 130, 246, 0.3)", "0 0 40px rgba(59, 130, 246, 0.6)"]
	);

	const textGlow = useTransform(
		pulseOpacitySpring,
		[0.6, 1],
		["0 0 10px rgba(56, 189, 248, 0.2)", "0 0 20px rgba(56, 189, 248, 0.5)"]
	);

	// Additional transform for secondary glow ring
	const secondaryGlowScale = useTransform(
		breathingScaleSpring,
		[0.95, 1.05],
		[1.1, 1.3]
	);

	// Revolution animation for logo (orbital revolution)
	const revolutionControls = useAnimation();

	// Hydration safety
	useEffect(() => {
		setIsClient(true);
	}, []);

	// Start persistent animations
	const startPersistentAnimations = useCallback(async () => {
		// Breathing animation for logo
		breathingControls.start({
			scale: [1, 1.05, 0.95, 1],
			transition: {
				duration: 4,
				ease: "easeInOut",
				repeat: Infinity,
				repeatType: "loop",
			},
		});

		// Pulsing animation for text
		pulseControls.start({
			opacity: [0.6, 1, 0.8, 1],
			transition: {
				duration: 3,
				ease: "easeInOut",
				repeat: Infinity,
				repeatType: "loop",
			},
		});

		// Particle floating animations
		particleControls.start({
			y: [0, -30, 0],
			x: [0, 15, -10, 0],
			rotate: [0, 360],
			transition: {
				duration: 8,
				ease: "linear",
				repeat: Infinity,
				repeatType: "loop",
			},
		});

		// Revolution animation for logo
		revolutionControls.start({
			rotate: [0, 360],
			transition: {
				duration: 8,
				ease: "linear",
				repeat: Infinity,
				repeatType: "loop",
			},
		});
	}, [breathingControls, pulseControls, particleControls, revolutionControls]);

	useEffect(() => {
		if (isClient) {
			startPersistentAnimations();
		}
	}, [isClient, startPersistentAnimations]);

	// Container variants for entrance with enhanced fade in/out
	const containerVariants: Variants = {
		hidden: {
			opacity: 0,
			scale: 0.95,
		},
		visible: {
			opacity: 1,
			scale: 1,
			transition: {
				duration: 0.8,
				ease: "easeOut",
				staggerChildren: 0.15,
			},
		},
		exit: {
			opacity: 0,
			scale: 0.95,
			transition: {
				duration: 0.6,
				ease: "easeInOut",
			},
		},
	};

	// Logo variants with breathing effect
	const logoVariants: Variants = {
		hidden: {
			opacity: 0,
			scale: 0.8,
		},
		visible: {
			opacity: 1,
			scale: 1,
			transition: {
				duration: 0.8,
				ease: "easeOut",
			},
		},
	};

	// Text variants with pulse effect
	const textVariants: Variants = {
		hidden: {
			opacity: 0,
			y: 20,
		},
		visible: {
			opacity: 1,
			y: 0,
			transition: {
				duration: 0.6,
				ease: "easeOut",
			},
		},
	};

	// Particle variants for floating effect
	const particleVariants: Variants = {
		hidden: {
			opacity: 0,
			scale: 0,
		},
		visible: {
			opacity: 1,
			scale: 1,
			transition: {
				duration: 0.4,
				ease: "easeOut",
			},
		},
	};

	if (!isClient) {
		// Return simple loading during hydration
		return (
			<div className="fixed inset-0 bg-slate-900 flex items-center justify-center z-50">
				<div className="text-white">Loading...</div>
			</div>
		);
	}

	return (
		<AnimatePresence>
			<motion.div
				className={`fixed inset-0 bg-black flex flex-col items-center justify-center z-50 overflow-hidden ${extraClasses}`}
				role="status"
				aria-live="assertive"
				aria-label={message}
				variants={containerVariants}
				initial="hidden"
				animate="visible"
				exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.6 } }}>
				{/* Firefly Field Background - Authentic firefly effect */}
				{fireflies.map((firefly) => (
					<motion.div
						key={firefly.id}
						className="absolute rounded-full"
						style={{
							width: firefly.size,
							height: firefly.size,
							backgroundColor: firefly.color,
							left: `${firefly.initialX}%`,
							top: `${firefly.initialY}%`,
							filter: `blur(1px) brightness(1.5)`,
							boxShadow: `
								0 0 ${firefly.size * 4}px ${firefly.color},
								0 0 ${firefly.size * 8}px ${firefly.color.replace(/\[\d\.]+\)$/g, "0.4)")},
								0 0 ${firefly.size * 12}px ${firefly.color.replace(/\[\d\.]+\)$/g, "0.2)")}
							`,
							zIndex: 0,
							willChange: "transform, opacity, filter",
						}}
						initial={{ opacity: 0, scale: 0 }}
						animate={{ opacity: 1, scale: 1 }}
						whileInView={{
							y: [
								0,
								-firefly.driftRange * firefly.verticalBias,
								firefly.driftRange * 0.3,
								-firefly.driftRange * firefly.verticalBias * 0.5,
								0,
							],
							x: [
								0,
								Math.cos(firefly.floatDirection) * firefly.driftRange * 0.4,
								Math.cos(firefly.floatDirection + Math.PI) *
									firefly.driftRange *
									0.2,
								Math.cos(firefly.floatDirection + Math.PI * 0.5) *
									firefly.driftRange *
									0.1,
								0,
							],
							scale: [1, 1.2, 0.9, 1.1, 1],
							opacity: [
								0.4,
								firefly.glowIntensity,
								0.2 + firefly.flickerPattern * 0.3,
								firefly.glowIntensity * 0.9,
								0.5,
							],
							filter: [
								`blur(1px) brightness(1.4)`,
								`blur(2px) brightness(2.2)`,
								`blur(0.5px) brightness(1.3)`,
								`blur(1.5px) brightness(2.0)`,
								`blur(1px) brightness(1.4)`,
							],
						}}
						transition={{
							duration: firefly.duration,
							delay: firefly.delay,
							ease: "easeInOut",
							repeat: Infinity,
							repeatType: "loop",
							times: [0, 0.3, 0.5, 0.8, 1],
						}}
					/>
				))}

				{/* Central Content Container */}
				<motion.div
					className="relative z-10 flex flex-col items-center justify-center text-center"
					style={{
						maxWidth: "28rem",
						gap: "2rem",
					}}>
					{/* Logo - statically centered, no revolution */}
					<div
						style={{
							zIndex: 2,
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							width: 260,
							height: 156,
							position: "relative",
						}}>
						<SosheIQLogo />
					</div>

					{/* Dynamic AI-Contextual Text with Sophisticated Transitions */}
					<motion.div className="text-center" variants={textVariants}>
						<AnimatePresence mode="wait">
							<motion.p
								key={currentMessage}
								className="font-semibold text-sky-300"
								style={{
									fontSize: "18px",
									lineHeight: 1.6,
									letterSpacing: "0.025em",
									willChange: "opacity, text-shadow, transform, filter",
									opacity: pulseOpacitySpring,
									textShadow: textGlow,
									minHeight: "2.4rem", // Prevent layout shift
								}}
								initial={{
									opacity: 0,
									y: 15,
									scale: 0.92,
									filter: "blur(4px)",
								}}
								animate={{
									opacity: 1,
									y: 0,
									scale: 1,
									filter: "blur(0px)",
									transition: {
										duration: 0.5,
										ease: [0.25, 0.46, 0.45, 0.94], // Dramatic reveal curve
										opacity: { duration: 0.4 },
										filter: { duration: 0.3, delay: 0.1 },
									},
								}}
								exit={{
									opacity: 0,
									y: -12,
									scale: 0.94,
									filter: "blur(2px)",
									transition: {
										duration: 0.35,
										ease: [0.4, 0.0, 0.2, 1], // Smooth momentum
									},
								}}>
								{currentMessage}
							</motion.p>
						</AnimatePresence>
					</motion.div>

					{/* Synchronized Loading Indicator Dots */}
					<motion.div className="flex space-x-2" variants={textVariants}>
						{[0, 1, 2].map((i) => (
							<motion.div
								key={`${currentMessage}-${i}`} // Re-trigger animation on message change
								className="w-3 h-3 bg-sky-400 rounded-full"
								animate={{
									scale: [1, 1.5, 1],
									opacity: [0.5, 1, 0.5],
								}}
								transition={{
									duration: 1.5,
									delay: i * 0.2,
									ease: "easeInOut",
									repeat: Infinity,
									repeatType: "loop",
								}}
								style={{
									filter: "drop-shadow(0 0 8px rgba(56, 189, 248, 0.6))",
								}}
							/>
						))}
					</motion.div>

					{/* Subtle Orbit Animation */}
					<motion.div
						className="absolute inset-0 pointer-events-none"
						animate={{
							rotate: 360,
						}}
						transition={{
							duration: 20,
							ease: "linear",
							repeat: Infinity,
						}}>
						{[0, 1, 2].map((i) => (
							<motion.div
								key={i}
								className="absolute w-2 h-2 bg-cyan-400 rounded-full"
								style={{
									top: "50%",
									left: "50%",
									transformOrigin: `${60 + i * 20}px 0px`,
									opacity: 0.4,
									filter: "blur(0.5px)",
								}}
								animate={{
									scale: [1, 1.3, 1],
									opacity: [0.2, 0.6, 0.2],
								}}
								transition={{
									duration: 2 + i * 0.5,
									ease: "easeInOut",
									repeat: Infinity,
									repeatType: "loop",
								}}
							/>
						))}
					</motion.div>
				</motion.div>

				{/* Ambient Background Glow - Extended 30% farther */}
				<motion.div
					className="absolute pointer-events-none"
					style={{
						top: "-30%", // Extended outward by 30%
						left: "-30%",
						right: "-30%",
						bottom: "-30%",
						background:
							"radial-gradient(circle at center, rgba(59, 130, 246, 0.025) 0%, rgba(59, 130, 246, 0.015) 40%, rgba(59, 130, 246, 0.008) 60%, transparent 85%)", // Extended gradient reach
					}}
					animate={{
						opacity: [0.3, 0.6, 0.3],
					}}
					transition={{
						duration: 8,
						ease: "easeInOut",
						repeat: Infinity,
						repeatType: "loop",
					}}
				/>
			</motion.div>
		</AnimatePresence>
	);
};
