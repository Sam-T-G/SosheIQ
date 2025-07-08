import React, { useMemo } from "react";
import { motion } from "motion/react";

interface FireflyFieldProps {
	count?: number;
	zIndex?: number;
	className?: string;
}

const FIREFLY_BLUE = "rgba(59, 130, 246, 0.9)";
const FIREFLY_LIGHT_BLUE = "rgba(56, 189, 248, 0.8)";

const generateFireflies = (count: number) =>
	Array.from({ length: count }, (_, i) => ({
		id: i,
		color: Math.random() > 0.7 ? FIREFLY_LIGHT_BLUE : FIREFLY_BLUE,
		size: Math.random() * 3 + 2, // 2-5px
		initialX: Math.random() * 100, // 0-100%
		initialY: Math.random() * 100, // 0-100%
		driftRange: Math.random() * 40 + 15, // 15-55px
		duration: Math.random() * 12 + 8, // 8-20s
		delay: Math.random() * 5, // 0-5s
		pulseSpeed: Math.random() * 2 + 1.5, // 1.5-3.5s
		glowIntensity: Math.random() * 0.3 + 0.7, // 0.7-1.0
		flickerPattern: Math.random(),
		floatDirection: Math.random() * Math.PI * 2,
		verticalBias: Math.random() * 0.3 + 0.1,
	}));

export const FireflyField: React.FC<FireflyFieldProps> = ({
	count = 7,
	zIndex = 0,
	className = "",
}) => {
	const fireflies = useMemo(() => generateFireflies(count), [count]);

	return (
		<div
			className={`fixed inset-0 w-full h-full pointer-events-none ${className}`}
			style={{ zIndex }}
			aria-hidden="true">
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
              0 0 ${firefly.size * 8}px ${firefly.color.replace(
							/\[\d\.]+\)$/g,
							"0.4)"
						)},
              0 0 ${firefly.size * 12}px ${firefly.color.replace(
							/\[\d\.]+\)$/g,
							"0.2)"
						)}
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
		</div>
	);
};
