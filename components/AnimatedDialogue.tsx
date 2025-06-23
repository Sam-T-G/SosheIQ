import React from "react";
import { useLetterFadeInTypewriter } from "../hooks/useTypewriter";

interface AnimatedDialogueProps {
	text: string;
	startAnimation: boolean;
	typingSpeed?: number; // Kept for prop compatibility, not directly used by new hook logic for speed
	letterFadeDuration?: number;
	onComplete?: () => void;
}

export const AnimatedDialogue: React.FC<AnimatedDialogueProps> = ({
	text,
	startAnimation,
	// typingSpeed is no longer used for letter-by-letter delay
	letterFadeDuration = 300, // Duration for the overall text block fade-in
	onComplete,
}) => {
	// The hook now makes all characters visible at once if enabled.
	const { animatedChars, isTypingComplete } = useLetterFadeInTypewriter(text, {
		onComplete,
		enabled: startAnimation,
	});

	if (!text && !animatedChars.length) {
		return null;
	}

	// Apply fade-in animation to the entire paragraph if startAnimation is true
	const paragraphClassName = `whitespace-pre-wrap min-h-[1em] break-words ${
		startAnimation ? "animate-letter-fade-in" : "opacity-100"
	}`;
	const paragraphStyle: React.CSSProperties = startAnimation
		? { animationDuration: `${letterFadeDuration}ms` }
		: {};

	return (
		<p className={paragraphClassName} style={paragraphStyle}>
			{animatedChars.map((item) => (
				// Render characters directly as they are all set to visible by the hook at once
				// Using a span for each char is not strictly necessary anymore but kept for consistency with original structure
				// The animation is now on the parent <p>
				<span key={item.key}>{item.char === " " ? "\u00A0" : item.char}</span>
			))}
			{/* Blinking cursor removed as typing animation is removed */}
		</p>
	);
};
