import React from "react";

interface AnimatedDialogueProps {
	text: string;
	startAnimation: boolean;
	letterFadeDuration?: number;
}

export const AnimatedDialogue: React.FC<AnimatedDialogueProps> = ({
	text,
	startAnimation,
	letterFadeDuration = 300, // Duration for the overall text block fade-in
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
