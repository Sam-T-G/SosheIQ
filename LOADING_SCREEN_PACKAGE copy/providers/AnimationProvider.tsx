/**
 * Simplified Animation Provider for Loading Screen Package
 * Provides essential animation context and performance optimization
 */

"use client";

import React, {
	createContext,
	useContext,
	useCallback,
	useEffect,
	useState,
	ReactNode,
} from "react";
import { MotionConfig, useReducedMotion } from "framer-motion";

interface AnimationContextValue {
	// Performance monitoring
	frameRate: number;
	isPerformanceMode: boolean;

	// Device detection
	isMobile: boolean;
	isTablet: boolean;
	isDesktop: boolean;

	// Animation utilities
	getOptimizedTransition: (
		type: "fast" | "medium" | "slow" | "cinematic" | "epic"
	) => Record<string, unknown>;
	shouldReduceMotion: boolean;
	isReducedMotion: boolean;
}

interface AnimationProviderProps {
	children: ReactNode;
	theme?: "cinematic" | "minimal" | "gaming";
	performance?: "auto" | "high" | "low";
	debugMode?: boolean;
}

const AnimationContext = createContext<AnimationContextValue | undefined>(
	undefined
);

// Timing constants
const TIMING = {
	ULTRA_FAST: 0.15,
	FAST: 0.3,
	MEDIUM: 0.6,
	SLOW: 1.2,
	CINEMATIC: 2.0,
	EPIC: 3.5,
} as const;

// Easing curves
const EASING = {
	ORGANIC: [0.16, 1, 0.3, 1] as const,
	DRAMATIC: [0.25, 0.46, 0.45, 0.94] as const,
	SNAPPY: [0.68, -0.55, 0.265, 1.55] as const,
	SMOOTH: [0.4, 0, 0.2, 1] as const,
} as const;

// Spring configurations
const SPRINGS = {
	GENTLE: {
		type: "spring" as const,
		stiffness: 100,
		damping: 20,
		mass: 1,
	},
	SNAPPY: {
		type: "spring" as const,
		stiffness: 400,
		damping: 30,
		mass: 1,
	},
	SMOOTH: {
		type: "spring" as const,
		stiffness: 300,
		damping: 25,
		mass: 1,
	},
} as const;

// Reduce motion fallback
const REDUCE_MOTION = {
	duration: 0.01,
	ease: "linear" as const,
};

// Mobile optimized config
const MOBILE_CONFIG = {
	type: "tween" as const,
	ease: EASING.SMOOTH,
};

export const AnimationProvider: React.FC<AnimationProviderProps> = ({
	children,
	theme = "cinematic",
	performance = "auto",
	debugMode = false,
}) => {
	// Accessibility
	const shouldReduceMotion = useReducedMotion();

	// Performance monitoring
	const [frameRate, setFrameRate] = useState(60);
	const [isPerformanceMode, setIsPerformanceMode] = useState(false);

	// Device detection
	const [deviceInfo, setDeviceInfo] = useState({
		isMobile: false,
		isTablet: false,
		isDesktop: true,
	});

	// Device detection effect
	useEffect(() => {
		const checkDevice = () => {
			const width = window.innerWidth;
			const isMobile = width < 768;
			const isTablet = width >= 768 && width < 1024;
			const isDesktop = width >= 1024;

			setDeviceInfo({ isMobile, isTablet, isDesktop });
		};

		checkDevice();
		window.addEventListener("resize", checkDevice);
		return () => window.removeEventListener("resize", checkDevice);
	}, []);

	// Performance monitoring effect
	useEffect(() => {
		if (performance === "auto") {
			let frameCount = 0;
			let lastTime = window.performance.now();

			const measureFrameRate = () => {
				const currentTime = window.performance.now();
				frameCount++;

				if (currentTime - lastTime >= 1000) {
					const fps = frameCount;
					setFrameRate(fps);

					// Adjust performance mode based on frame rate
					setIsPerformanceMode(fps < 50);

					frameCount = 0;
					lastTime = currentTime;
				}

				requestAnimationFrame(measureFrameRate);
			};

			requestAnimationFrame(measureFrameRate);
		}
	}, [performance]);

	// Get optimized transition based on device and performance
	const getOptimizedTransition = useCallback(
		(type: "fast" | "medium" | "slow" | "cinematic" | "epic") => {
			// Return minimal animation if reduce motion is preferred
			if (shouldReduceMotion) {
				return REDUCE_MOTION;
			}

			// Base timing
			const timingMap = {
				fast: TIMING.FAST,
				medium: TIMING.MEDIUM,
				slow: TIMING.SLOW,
				cinematic: TIMING.CINEMATIC,
				epic: TIMING.EPIC,
			};

			const duration = timingMap[type];

			// Optimize for mobile devices
			if (deviceInfo.isMobile) {
				return {
					...MOBILE_CONFIG,
					duration: duration * 0.7, // Reduce duration by 30% on mobile
				};
			}

			// Optimize for low performance
			if (isPerformanceMode || frameRate < 45) {
				return {
					type: "tween" as const,
					duration: duration * 0.5,
					ease: EASING.SMOOTH,
				};
			}

			// Full quality for desktop
			return {
				...SPRINGS.SMOOTH,
				duration,
			};
		},
		[shouldReduceMotion, deviceInfo.isMobile, isPerformanceMode, frameRate]
	);

	const contextValue: AnimationContextValue = {
		frameRate,
		isPerformanceMode,
		isMobile: deviceInfo.isMobile,
		isTablet: deviceInfo.isTablet,
		isDesktop: deviceInfo.isDesktop,
		getOptimizedTransition,
		shouldReduceMotion: !!shouldReduceMotion,
		isReducedMotion: !!shouldReduceMotion,
	};

	return (
		<AnimationContext.Provider value={contextValue}>
			<MotionConfig
				reducedMotion={shouldReduceMotion ? "always" : "never"}
				transition={
					shouldReduceMotion
						? REDUCE_MOTION
						: deviceInfo.isMobile
						? { ...MOBILE_CONFIG, duration: 0.3 }
						: SPRINGS.SMOOTH
				}>
				{children}
			</MotionConfig>
		</AnimationContext.Provider>
	);
};

export const useAnimation = (): AnimationContextValue => {
	const context = useContext(AnimationContext);
	if (!context) {
		throw new Error("useAnimation must be used within an AnimationProvider");
	}
	return context;
};
