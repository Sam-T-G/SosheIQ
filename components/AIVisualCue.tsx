import React, { useState, useEffect, useRef } from "react";
import { ChatBubbleIcon, ChevronDownIcon, ChevronUpIcon } from "./Icons";

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
	const [isBodyLanguageOpen, setIsBodyLanguageOpen] = useState(false); // Default to collapsed

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
	const currentBodyLanguageText = bodyLanguageDescription;

	return (
		<div className="w-full flex-grow min-h-0 flex flex-col items-stretch gap-4">
			{/* Image Container */}
			<div className="relative w-full max-w-lg mx-auto md:max-w-none flex-grow min-h-0 rounded-lg shadow-xl overflow-hidden">
				{showPlaceholder ? (
					<div className="w-full h-full flex items-center justify-center text-slate-500 bg-slate-800/50">
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
								className="absolute inset-0 w-full h-full object-cover animate-image-cross-fade-in opacity-0"
								onAnimationEnd={handleAnimationEnd}
							/>
						)}
					</>
				)}
			</div>

			{/* Body Language Container - Hidden on Desktop */}
			{currentBodyLanguageText && (
				<div
					role="button"
					tabIndex={0}
					onClick={() => setIsBodyLanguageOpen((prev) => !prev)}
					onKeyPress={(e) => {
						if (e.key === "Enter" || e.key === " ") {
							e.preventDefault();
							setIsBodyLanguageOpen((prev) => !prev);
						}
					}}
					className="w-full bg-yellow-800/20 border border-yellow-700/40 rounded-md shadow-md flex-shrink-0 md:hidden cursor-pointer hover:border-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all"
					aria-expanded={isBodyLanguageOpen}
					aria-controls="body-language-content">
					<div className="flex items-center text-xs text-yellow-500 p-2.5">
						<ChatBubbleIcon className="h-4 w-4" />
						<span className="ml-1.5 font-semibold">Body Language</span>
						<div className="ml-auto">
							{isBodyLanguageOpen ? (
								<ChevronUpIcon className="h-5 w-5" />
							) : (
								<ChevronDownIcon className="h-5 w-5" />
							)}
						</div>
					</div>
					<div
						id="body-language-content"
						className={`overflow-hidden transition-all duration-300 ease-in-out ${
							isBodyLanguageOpen ? "max-h-48" : "max-h-0"
						}`}>
						<p className="text-yellow-200 italic text-sm whitespace-pre-wrap break-words px-2.5 pb-2.5">
							{currentBodyLanguageText}
						</p>
					</div>
				</div>
			)}
		</div>
	);
};
