import React from "react";
// Note: useLetterFadeInTypewriter hook is not strictly needed anymore if we simplify to block animation,
// but keeping the import path in case its other functionalities (like onComplete) are still desired.
// The core change is to render text directly.

interface AnimatedDialogueProps {
	text: string;
	startAnimation: boolean;
	letterFadeDuration?: number;
	onComplete?: () => void; // Optional: callback when animation (if any) finishes
}

export const AnimatedDialogue: React.FC<AnimatedDialogueProps> = ({
	text,
	startAnimation,
	letterFadeDuration = 300, // Duration for the overall text block fade-in
	// onComplete // onComplete could be called after a timeout matching letterFadeDuration if needed
}) => {
	if (!text) {
		return null;
	}

	const paragraphClassName = `whitespace-pre-wrap min-h-[1em] break-words ${
		startAnimation ? "animate-letter-fade-in" : "opacity-100"
	}`;
	const paragraphStyle: React.CSSProperties = startAnimation
		? { animationDuration: `${letterFadeDuration}ms` }
		: {};

	// Render text directly. The `break-words` and `whitespace-pre-wrap` classes on the <p>
	// will handle the word wrapping correctly.
	return (
		<p className={paragraphClassName} style={paragraphStyle}>
			{text}
		</p>
	);
};
