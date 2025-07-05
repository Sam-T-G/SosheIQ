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
					{/* Logo with Static Position and Pulsing Glow */}
					<motion.div
						className="relative flex items-center justify-center"
						variants={logoVariants}
						style={{
							width: "260px", // Increased by 30%: 200px * 1.3 = 260px
							height: "156px", // Increased by 30%: 120px * 1.3 = 156px
						}}>
						{/* Soft glow layers - pulsing opacity only - Extended 30% farther */}
						<motion.div
							className="absolute rounded-full"
							style={{
								top: "-30px", // Extended outward by 30px
								left: "-30px",
								right: "-30px",
								bottom: "-30px",
								background:
									"radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, rgba(59, 130, 246, 0.08) 30%, rgba(59, 130, 246, 0.04) 60%, transparent 85%)",
								filter: "blur(26px)", // Increased blur by 30%: 20px * 1.3 = 26px
								willChange: "opacity",
								zIndex: 1,
							}}
							animate={{
								opacity: [0.3, 0.8, 0.3],
							}}
							transition={{
								duration: 3,
								ease: "easeInOut",
								repeat: Infinity,
								repeatType: "loop",
							}}
						/>

						{/* Secondary soft glow - Extended 30% farther */}
						<motion.div
							className="absolute rounded-full"
							style={{
								top: "-3px", // Reduced from 10px to extend farther: 10px - 13px = -3px
								left: "-6px", // Reduced from 20px to extend farther: 20px - 26px = -6px
								right: "-6px",
								bottom: "-3px",
								background:
									"radial-gradient(circle, rgba(6, 182, 212, 0.12) 0%, rgba(6, 182, 212, 0.06) 40%, rgba(6, 182, 212, 0.02) 70%, transparent 90%)",
								filter: "blur(19.5px)", // Increased blur by 30%: 15px * 1.3 = 19.5px
								willChange: "opacity",
								zIndex: 2,
							}}
							animate={{
								opacity: [0.2, 0.7, 0.2],
							}}
							transition={{
								duration: 2.5,
								ease: "easeInOut",
								repeat: Infinity,
								repeatType: "loop",
								delay: 0.5,
							}}
						/>

						{/* Tertiary inner glow - Extended 30% farther */}
						<motion.div
							className="absolute rounded-full"
							style={{
								top: "8px", // Reduced from 20px to extend farther: 20px - 12px = 8px
								left: "22px", // Reduced from 40px to extend farther: 40px - 18px = 22px
								right: "22px",
								bottom: "8px",
								background:
									"radial-gradient(circle, rgba(56, 189, 248, 0.1) 0%, rgba(56, 189, 248, 0.05) 50%, transparent 80%)",
								filter: "blur(13px)", // Increased blur by 30%: 10px * 1.3 = 13px
								willChange: "opacity",
								zIndex: 3,
							}}
							animate={{
								opacity: [0.4, 0.9, 0.4],
							}}
							transition={{
								duration: 2,
								ease: "easeInOut",
								repeat: Infinity,
								repeatType: "loop",
								delay: 1,
							}}
						/>

						{/* Static Logo */}
						<motion.div
							className="relative z-10"
							style={{
								filter: "drop-shadow(0 0 20px rgba(59, 130, 246, 0.3))",
							}}>
							<SosheIQLogo
								style={{
									height: "100px",
									width: "auto",
								}}
							/>
						</motion.div>
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
