import React, { useState, useEffect, useRef } from "react";

interface AIVisualCueProps {
	imageBase64: string | null;
	bodyLanguageDescription: string;
	isLoading?: boolean; // True if a new image is being fetched
}

export const AIVisualCue: React.FC<AIVisualCueProps> = ({
	imageBase64,
	bodyLanguageDescription,
	isLoading,
}) => {
	const [displayedImage, setDisplayedImage] = useState<string | null>(null);
	const [incomingImage, setIncomingImage] = useState<string | null>(null);
	const [isAnimating, setIsAnimating] = useState<boolean>(false);

	const prevImageBase64Ref = useRef<string | null>(null);

	useEffect(() => {
		if (imageBase64 && imageBase64 !== prevImageBase64Ref.current) {
			if (!displayedImage) {
				setDisplayedImage(imageBase64);
				setIncomingImage(null);
				setIsAnimating(false);
			} else {
				setIncomingImage(imageBase64);
				setIsAnimating(true);
			}
			prevImageBase64Ref.current = imageBase64;
		} else if (!imageBase64 && displayedImage) {
			// Handles case where image is explicitly cleared
			setDisplayedImage(null);
			setIncomingImage(null);
			setIsAnimating(false);
			prevImageBase64Ref.current = null;
		}
	}, [imageBase64, displayedImage]);

	const handleAnimationEnd = () => {
		if (incomingImage) {
			setDisplayedImage(incomingImage);
		}
		setIncomingImage(null);
		setIsAnimating(false);
	};

	const showPlaceholder = isLoading && !displayedImage && !incomingImage;
	// Simplified: directly use the prop. Parent component controls what's shown.
	const currentBodyLanguageText = bodyLanguageDescription;

	return (
		// Root div now flex-grow to take available space in its parent flex column
		<div className="w-full flex-grow min-h-0 flex flex-col items-center">
			{/* 
        Image container: 
        - Changed from 'min-h-[40vh]' to 'h-[55vh]' for mobile to give more vertical space.
        - 'md:h-auto' ensures desktop height is determined by flex layout and 'md:max-h-full'.
        - 'flex-grow' allows it to take more space if parent provides it, beyond the h-[55vh].
      */}
			<div className="w-full h-[55vh] md:h-auto flex-grow md:min-h-0 md:max-h-full rounded-lg flex items-center justify-center overflow-hidden shadow-xl relative">
				{showPlaceholder ? (
					<div className="w-full h-full flex items-center justify-center text-slate-500">
						{" "}
						{/* Removed bg-slate-700 from here, placeholder is transparent to parent now */}
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="h-1/3 w-1/3 opacity-50 animate-pulse"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							strokeWidth={1}>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
							/>
						</svg>
					</div>
				) : (
					<>
						{displayedImage && (
							<img
								key={`displayed-${displayedImage.substring(0, 20)}`}
								src={`data:image/jpeg;base64,${displayedImage}`}
								alt="AI's current visual cue"
								className="absolute inset-0 w-full h-full object-cover"
								style={{
									opacity: incomingImage && isAnimating ? 0 : 1,
									transition:
										incomingImage && isAnimating
											? "opacity 0.75s ease-in-out"
											: "none",
								}}
							/>
						)}
						{incomingImage && isAnimating && (
							<img
								key={`incoming-${incomingImage.substring(0, 20)}`}
								src={`data:image/jpeg;base64,${incomingImage}`}
								alt="AI's new visual cue"
								className="absolute inset-0 w-full h-full object-cover animate-image-cross-fade-in"
								onAnimationEnd={handleAnimationEnd}
							/>
						)}
					</>
				)}
			</div>

			{currentBodyLanguageText && (
				<p className="w-full text-sm text-center md:text-left text-sky-300 italic px-2 py-1 whitespace-pre-wrap flex-shrink-0">
					{currentBodyLanguageText}
				</p>
			)}
		</div>
	);
};
