import React, { useState, useEffect, useRef } from "react";

interface AIVisualCueProps {
	imageBase64: string | null;
	bodyLanguageDescription: string;
	isLoading?: boolean; // True if a new image is being fetched
	aiName?: string;
	aiPersona?: string;
	aiEnvironment?: string;
	showOverlayText?: boolean; // New prop: show overlay text (mobile, chatbox not open)
}

export const AIVisualCue: React.FC<AIVisualCueProps> = ({
	imageBase64,
	bodyLanguageDescription,
	isLoading,
	aiName,
	aiPersona,
	aiEnvironment,
	showOverlayText = false,
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

	return (
		<div
			className={
				showOverlayText
					? "fixed inset-0 z-0 w-full h-full md:relative md:w-full md:max-w-none md:flex-grow md:min-h-0 md:rounded-lg md:shadow-xl md:overflow-hidden"
					: "relative w-full max-w-lg mx-auto md:max-w-none flex-grow min-h-0 rounded-lg shadow-xl overflow-hidden"
			}>
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
						<>
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
							{/* Overlayed text for mobile, world-class style */}
							{showOverlayText && (
								<div className="md:hidden absolute inset-0 flex flex-col items-center justify-end pb-36 px-4 z-10">
									{/* Stronger fade at the bottom for readability */}
									<div className="w-full bg-gradient-to-t from-black/90 via-black/50 to-transparent absolute inset-0 pointer-events-none" />
									<div className="relative z-10 w-full flex flex-col items-center text-center gap-1 animate-fadeInUp">
										{aiName && (
											<h2 className="text-2xl font-extrabold text-white drop-shadow-lg tracking-tight mb-0.5 animate-fadeInUp delay-100">
												{aiName}
											</h2>
										)}
										{aiPersona && (
											<p className="text-base text-sky-200 font-medium drop-shadow-md animate-fadeInUp delay-200">
												{aiPersona}
											</p>
										)}
										{aiEnvironment && (
											<p className="text-sm text-slate-200/90 font-normal animate-fadeInUp delay-300">
												{aiEnvironment}
											</p>
										)}
										{bodyLanguageDescription && (
											<p className="mt-1 text-sm text-slate-100/90 italic font-light animate-fadeInUp delay-400">
												{bodyLanguageDescription}
											</p>
										)}
									</div>
								</div>
							)}
						</>
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
	);
};
