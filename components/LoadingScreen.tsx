/**
 * Motion-Enhanced Session Loading Screen
 * Features persistent animations with floating particles, breathing effects, and pulsing elements
 * Now with AI-contextual text cycling based on user's scenario details
 * Inspired by Motion React best practices and modern loading UX patterns
 */

"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
	useMotionValue,
	useSpring,
	useTransform,
	useAnimation,
	animate,
} from "framer-motion";
import type { Variants } from "framer-motion";
import { SosheIQLogo } from "./SosheIQLogo";
import { useAILoadingMessages } from "../hooks/useAILoadingMessages";
import type { ScenarioDetails } from "../types";

interface LoadingScreenProps {
	message?: string;
	extraClasses?: string;
	scenarioDetails?: ScenarioDetails;
	testMode?: boolean; // Enable random test data generation
	showFireflies?: boolean;
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

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
	message = "Loading...",
	extraClasses = "",
	scenarioDetails,
	testMode = false,
	showFireflies = false,
}) => {
	const [isClient, setIsClient] = useState(false);
	const [popInComplete, setPopInComplete] = useState(false);
	const [firstMessageShown, setFirstMessageShown] = useState(false);

	// Modular: how many loading messages to show
	const NUM_LOADING_MESSAGES_TO_SHOW = 5; // Reduce by one from default (if default is 6)

	// Use AI loading messages hook for dynamic text cycling
	const { currentMessage, messageIndex, totalMessages } = useAILoadingMessages({
		scenarioDetails,
		isLoading: true,
		baseMessage: message,
		testMode,
		startCycling: firstMessageShown,
		numMessages: NUM_LOADING_MESSAGES_TO_SHOW,
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
			<div className="fixed inset-0 bg-slate-900 flex items-center justify-center z-50 pointer-events-none">
				<div className="text-white">Loading...</div>
			</div>
		);
	}

	return (
		<AnimatePresence>
			<motion.div
				className={`fixed inset-0 bg-black flex flex-col items-center justify-center z-50 overflow-hidden pointer-events-none ${extraClasses}`}
				role="status"
				aria-live="assertive"
				aria-label={message}
				variants={containerVariants}
				initial="hidden"
				animate="visible"
				exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.6 } }}
				onAnimationComplete={() => setPopInComplete(true)}>
				{/* Central Content Container */}
				<motion.div
					className="relative z-10 flex flex-col items-center justify-center text-center pointer-events-auto"
					style={{
						maxWidth: "28rem",
						gap: "1.2rem",
						margin: 0,
						padding: 0,
					}}>
					{/* Logo - statically centered, no revolution */}
					<div
						style={{
							zIndex: 2,
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							width: 260,
							height: 100,
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
								}}
								onAnimationComplete={() => {
									if (
										messageIndex === 0 &&
										!firstMessageShown &&
										popInComplete
									) {
										setFirstMessageShown(true);
									}
								}}>
								{currentMessage}
							</motion.p>
						</AnimatePresence>
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
								className="absolute w-6 h-6 bg-cyan-400 rounded-full pointer-events-none"
								style={{
									top: "50%",
									left: "50%",
									transformOrigin: `${160 + i * 60}px 0px`, // Much larger orbit
									opacity: 0.25,
									filter: "blur(0.5px)",
								}}
								animate={{
									scale: [1, 1.3, 1],
									opacity: [0.15, 0.4, 0.15],
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
