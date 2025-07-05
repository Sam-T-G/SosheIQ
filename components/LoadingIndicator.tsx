/**
 * Motion-Enhanced Session Loading Screen
 * Features persistent animations with floating particles, breathing effects, and pulsing elements
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

interface LoadingIndicatorProps {
	message?: string;
	extraClasses?: string;
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

// Floating particle configuration
const PARTICLE_COUNT = 12;
const PARTICLE_COLORS = [
	"rgba(59, 130, 246, 0.4)", // blue-500
	"rgba(6, 182, 212, 0.4)", // cyan-500
	"rgba(14, 165, 233, 0.4)", // sky-500
	"rgba(99, 102, 241, 0.3)", // indigo-500
	"rgba(139, 92, 246, 0.3)", // violet-500
];

// Generate floating particles with random properties
const generateParticles = () => {
	return Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
		id: i,
		color: PARTICLE_COLORS[i % PARTICLE_COLORS.length],
		size: Math.random() * 8 + 4, // 4-12px
		initialX: Math.random() * 100, // 0-100%
		initialY: Math.random() * 100, // 0-100%
		driftRange: Math.random() * 40 + 20, // 20-60px drift
		duration: Math.random() * 8 + 6, // 6-14s duration
		delay: Math.random() * 4, // 0-4s delay
	}));
};

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
	message = "Loading...",
	extraClasses = "",
}) => {
	const [isClient, setIsClient] = useState(false);
	const [particles] = useState(() => generateParticles());

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
	}, [breathingControls, pulseControls, particleControls]);

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
			rotate: -10,
		},
		visible: {
			opacity: 1,
			scale: 1,
			rotate: 0,
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
				{/* Floating Particles Background */}
				{particles.map((particle) => (
					<motion.div
						key={particle.id}
						className="absolute rounded-full"
						style={{
							width: particle.size,
							height: particle.size,
							backgroundColor: particle.color,
							left: `${particle.initialX}%`,
							top: `${particle.initialY}%`,
							filter: "blur(1px)",
						}}
						variants={particleVariants}
						initial="hidden"
						animate="visible"
						whileInView={{
							y: [0, -particle.driftRange, particle.driftRange * 0.5, 0],
							x: [0, particle.driftRange * 0.3, -particle.driftRange * 0.2, 0],
							scale: [1, 1.2, 0.8, 1],
							opacity: [0.4, 0.8, 0.3, 0.6],
						}}
						transition={{
							duration: particle.duration,
							delay: particle.delay,
							ease: "easeInOut",
							repeat: Infinity,
							repeatType: "loop",
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
					{/* Logo with Breathing Animation */}
					<motion.div
						className="relative"
						variants={logoVariants}
						animate={breathingControls}>
						<motion.div
							style={{
								filter: logoGlow,
								willChange: "transform, filter",
							}}>
							<SosheIQLogo
								className="relative z-10"
								style={{
									height: "100px",
									width: "auto",
								}}
							/>
						</motion.div>

						{/* Enhanced radial glow rings with pulsing */}
						<motion.div
							className="absolute rounded-full"
							style={{
								width: "200px",
								height: "200px",
								top: "50%",
								left: "50%",
								transform: "translate(-50%, -50%)",
								background:
									"radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, rgba(59, 130, 246, 0.2) 30%, transparent 70%)",
								scale: breathingScaleSpring,
								willChange: "transform",
								filter: "blur(8px)",
							}}
							animate={{
								opacity: [0.3, 0.8, 0.3],
								scale: [0.8, 1.2, 0.8],
							}}
							transition={{
								duration: 2.5,
								ease: "easeInOut",
								repeat: Infinity,
								repeatType: "loop",
							}}
						/>
						<motion.div
							className="absolute rounded-full"
							style={{
								width: "150px",
								height: "150px",
								top: "50%",
								left: "50%",
								transform: "translate(-50%, -50%)",
								background:
									"radial-gradient(circle, rgba(6, 182, 212, 0.5) 0%, rgba(6, 182, 212, 0.3) 40%, transparent 80%)",
								scale: secondaryGlowScale,
								willChange: "transform",
								filter: "blur(4px)",
							}}
							animate={{
								opacity: [0.4, 0.9, 0.4],
								scale: [0.9, 1.1, 0.9],
							}}
							transition={{
								duration: 3,
								ease: "easeInOut",
								repeat: Infinity,
								repeatType: "loop",
								delay: 0.5,
							}}
						/>
						{/* Inner core glow */}
						<motion.div
							className="absolute rounded-full"
							style={{
								width: "120px",
								height: "120px",
								top: "50%",
								left: "50%",
								transform: "translate(-50%, -50%)",
								background:
									"radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, rgba(59, 130, 246, 0.4) 50%, transparent 100%)",
								willChange: "transform",
								filter: "blur(2px)",
							}}
							animate={{
								opacity: [0.2, 0.6, 0.2],
								scale: [1, 1.05, 1],
							}}
							transition={{
								duration: 2,
								ease: "easeInOut",
								repeat: Infinity,
								repeatType: "loop",
								delay: 1,
							}}
						/>
					</motion.div>

					{/* Pulsing Text with Glow */}
					<motion.div
						className="text-center"
						variants={textVariants}
						animate={pulseControls}>
						<motion.p
							className="font-semibold text-sky-300"
							style={{
								fontSize: "18px",
								lineHeight: 1.6,
								letterSpacing: "0.025em",
								willChange: "opacity, text-shadow",
								opacity: pulseOpacitySpring,
								textShadow: textGlow,
							}}>
							{message}
						</motion.p>
					</motion.div>

					{/* Persistent Loading Indicator Dots */}
					<motion.div className="flex space-x-2" variants={textVariants}>
						{[0, 1, 2].map((i) => (
							<motion.div
								key={i}
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

				{/* Ambient Background Glow - Subtle on black background */}
				<motion.div
					className="absolute inset-0 pointer-events-none"
					style={{
						background:
							"radial-gradient(circle at center, rgba(59, 130, 246, 0.02) 0%, transparent 70%)",
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
