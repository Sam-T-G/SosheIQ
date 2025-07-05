import React, { useState, useEffect, useRef } from "react";
import { BackgroundCrossfadeImage } from "./BackgroundCrossfadeImage";

interface AIVisualCueProps {
	imageBase64: string | null;
	bodyLanguageDescription: string;
	isLoading?: boolean; // True if a new image is being fetched
	aiName?: string;
	aiPersona?: string;
	aiEnvironment?: string;
	showOverlayText?: boolean; // New prop: show overlay text (mobile, chatbox not open)
	cinematicPhase?:
		| "image"
		| "name"
		| "personality"
		| "encounter-type"
		| "body-language"
		| "complete";
	imageOpacity?: number;
	nameOpacity?: number;
	personalityOpacity?: number;
	encounterTypeOpacity?: number;
	bodyLanguageOpacity?: number;
	hasCompletedFirstLoad?: boolean;
	showReplayButton?: boolean;
	onReplayCinematic?: () => void;
	onViewImage?: (url: string | null) => void; // New prop for image viewing
	uiExclusionZones?: Array<{
		top: number;
		left: number;
		width: number;
		height: number;
	}>; // Areas to exclude from image clicks
	isHidden?: boolean; // New prop: completely hide the component
	isFullScreen?: boolean; // New prop: indicates if the component is in fullscreen cinematic mode
	isCinematicFadingOut?: boolean; // New prop: triggers synchronized fade-out of overlay
}

export const AIVisualCue: React.FC<AIVisualCueProps> = ({
	imageBase64,
	bodyLanguageDescription,
	isLoading,
	aiName,
	aiPersona,
	aiEnvironment,
	showOverlayText = false,
	cinematicPhase,
	imageOpacity,
	nameOpacity,
	personalityOpacity,
	encounterTypeOpacity,
	bodyLanguageOpacity,
	hasCompletedFirstLoad,
	showReplayButton,
	onReplayCinematic,
	onViewImage,
	uiExclusionZones = [],
	isHidden = false,
	isFullScreen = false,
	isCinematicFadingOut = false,
}) => {
	// Add state for click detection
	const [clickStartTime, setClickStartTime] = useState<number>(0);
	const [clickStartPosition, setClickStartPosition] = useState<{
		x: number;
		y: number;
	} | null>(null);
	const [displayedImage, setDisplayedImage] = useState<string | null>(null);
	const [incomingImage, setIncomingImage] = useState<string | null>(null);
	const [isAnimating, setIsAnimating] = useState<boolean>(false);
	const [incomingLoaded, setIncomingLoaded] = useState<boolean>(false);

	const prevImageBase64Ref = useRef<string | null>(null);
	const displayedImageRef = useRef<string | null>(null);

	const CROSSFADE_DURATION = 2000; // 2 seconds
	const CROSSFADE_EASING = "cubic-bezier(0.4,0,0.2,1)";

	// When imageBase64 changes, set as incomingImage (but don't animate until loaded)
	useEffect(() => {
		if (imageBase64 && imageBase64 !== prevImageBase64Ref.current) {
			if (!displayedImageRef.current) {
				setDisplayedImage(imageBase64);
				setIncomingImage(null);
				setIsAnimating(false);
				setIncomingLoaded(false);
			} else {
				setIncomingImage(imageBase64);
				setIncomingLoaded(false);
			}
			prevImageBase64Ref.current = imageBase64;
		} else if (!imageBase64 && displayedImageRef.current) {
			setDisplayedImage(null);
			setIncomingImage(null);
			setIsAnimating(false);
			setIncomingLoaded(false);
			prevImageBase64Ref.current = null;
		} else if (imageBase64 && !displayedImageRef.current && !incomingImage) {
			setDisplayedImage(imageBase64);
			setIncomingImage(null);
			setIsAnimating(false);
			setIncomingLoaded(false);
			prevImageBase64Ref.current = imageBase64;
		}
	}, [imageBase64]);

	// When incoming image is loaded, start animation
	useEffect(() => {
		if (incomingImage && incomingLoaded) {
			setIsAnimating(true);
		}
	}, [incomingImage, incomingLoaded]);

	const handleIncomingLoad = () => {
		setIncomingLoaded(true);
	};

	const handleAnimationEnd = () => {
		if (incomingImage) {
			setDisplayedImage(incomingImage);
		}
		setIncomingImage(null);
		setIsAnimating(false);
		setIncomingLoaded(false);
	};

	// Update ref when displayedImage changes
	useEffect(() => {
		displayedImageRef.current = displayedImage;
	}, [displayedImage]);

	// Click detection handlers for better UX
	const handleMouseDown = (e: React.MouseEvent) => {
		e.preventDefault();
		setClickStartTime(Date.now());
		setClickStartPosition({ x: e.clientX, y: e.clientY });
	};

	const handleMouseUp = (e: React.MouseEvent) => {
		if (!clickStartPosition || !onViewImage) return;

		const clickDuration = Date.now() - clickStartTime;
		const distance = Math.sqrt(
			Math.pow(e.clientX - clickStartPosition.x, 2) +
				Math.pow(e.clientY - clickStartPosition.y, 2)
		);

		const isInExclusionZone = uiExclusionZones.some((zone) => {
			return (
				e.clientX >= zone.left &&
				e.clientX <= zone.left + zone.width &&
				e.clientY >= zone.top &&
				e.clientY <= zone.top + zone.height
			);
		});

		if (clickDuration < 300 && distance < 10 && !isInExclusionZone) {
			onViewImage(imageToDisplay);
		}

		setClickStartPosition(null);
	};

	const handleTouchStart = (e: React.TouchEvent) => {
		e.preventDefault();
		const touch = e.touches[0];
		setClickStartTime(Date.now());
		setClickStartPosition({ x: touch.clientX, y: touch.clientY });
	};

	const handleTouchEnd = (e: React.TouchEvent) => {
		if (!clickStartPosition || !onViewImage) return;

		const touch = e.changedTouches[0];
		const clickDuration = Date.now() - clickStartTime;
		const distance = Math.sqrt(
			Math.pow(touch.clientX - clickStartPosition.x, 2) +
				Math.pow(touch.clientY - clickStartPosition.y, 2)
		);

		const isInExclusionZone = uiExclusionZones.some((zone) => {
			return (
				touch.clientX >= zone.left &&
				touch.clientX <= zone.left + zone.width &&
				touch.clientY >= zone.top &&
				touch.clientY <= zone.top + zone.height
			);
		});

		if (clickDuration < 300 && distance < 10 && !isInExclusionZone) {
			onViewImage(imageToDisplay);
		}

		setClickStartPosition(null);
	};

	const imageToDisplay =
		displayedImage || (imageBase64 && !incomingImage ? imageBase64 : null);
	const showPlaceholder = !imageToDisplay && !incomingImage;

	// Early return if component should be hidden
	if (isHidden) {
		return null;
	}

	return (
		<div
			className={
				showOverlayText
					? "fixed inset-0 z-0 w-full h-full md:relative md:w-full md:max-w-none md:flex-grow md:min-h-0 md:rounded-lg md:shadow-xl md:overflow-hidden"
					: "relative w-full max-w-lg mx-auto md:max-w-none flex-grow min-h-0 rounded-lg shadow-xl overflow-hidden"
			}
			style={{ position: "relative", minHeight: "300px" }} // ensure stacking works
		>
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
					<BackgroundCrossfadeImage
						src={imageBase64 ? `data:image/jpeg;base64,${imageBase64}` : null}
						className="absolute inset-0 w-full h-full object-cover"
						objectPosition={showOverlayText ? "center 33%" : "center"}
					/>
					{/* Clickable overlay for image viewing - Mobile Only */}
					{onViewImage && showOverlayText && (
						<div
							onMouseDown={handleMouseDown}
							onMouseUp={handleMouseUp}
							onTouchStart={handleTouchStart}
							onTouchEnd={handleTouchEnd}
							className="md:hidden absolute inset-0 z-10 bg-transparent focus:outline-none"
							style={{ pointerEvents: "auto" }}
							role="button"
							tabIndex={0}
							aria-label="View image in full screen"
							onKeyDown={(e) => {
								if (e.key === "Enter" || e.key === " ") {
									e.preventDefault();
									onViewImage(imageToDisplay);
								}
							}}></div>
					)}
					{/* Clickable overlay for image viewing - Desktop Only */}
					{onViewImage && !showOverlayText && (
						<div
							onMouseDown={handleMouseDown}
							onMouseUp={handleMouseUp}
							onTouchStart={handleTouchStart}
							onTouchEnd={handleTouchEnd}
							className="hidden md:block absolute inset-0 z-10 bg-transparent focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-900/80"
							style={{ pointerEvents: "auto" }}
							role="button"
							tabIndex={0}
							aria-label="View image in full screen"
							onKeyDown={(e) => {
								if (e.key === "Enter" || e.key === " ") {
									e.preventDefault();
									onViewImage(imageToDisplay);
								}
							}}></div>
					)}
					{/* Cinematic Text Overlay - Show on all fullscreen overlays (mobile and desktop) */}
					{showOverlayText && (
						<div
							className={`absolute inset-0 z-10 flex flex-col justify-end px-8 pb-36 ${
								isFullScreen
									? "md:items-start md:px-24 md:pb-32"
									: "items-center md:hidden"
							} items-center`}
							style={{
								opacity: isCinematicFadingOut ? 0 : 1,
								transition: "opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
							}}>
							{/* Stronger fade at the bottom for readability */}
							<div
								className="absolute inset-0 w-full pointer-events-none bg-gradient-to-t from-black/95 via-black/70 to-transparent"
								style={{
									opacity: isCinematicFadingOut
										? 0
										: hasCompletedFirstLoad
										? 1
										: nameOpacity || 0,
									transition: "opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
								}}
							/>
							<div
								className={`relative z-10 flex w-full max-w-xl flex-col ${
									isFullScreen
										? "md:items-start md:text-left"
										: "items-center text-center"
								}`}>
								{aiName && (
									<h2
										className="text-3xl font-extrabold tracking-tight text-white drop-shadow-lg md:text-5xl"
										style={{
											opacity: isCinematicFadingOut
												? 0
												: hasCompletedFirstLoad
												? 1
												: nameOpacity || 0,
											transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
											transform: hasCompletedFirstLoad
												? "translateY(0)"
												: "translateY(30px)",
											transitionDelay: hasCompletedFirstLoad ? "0s" : "0s",
										}}>
										{aiName}
									</h2>
								)}
								{aiPersona && (
									<p
										className="mt-2 text-lg font-medium text-sky-100 drop-shadow-md md:text-xl"
										style={{
											opacity: isCinematicFadingOut
												? 0
												: hasCompletedFirstLoad
												? 1
												: personalityOpacity || 0,
											transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
											transform: hasCompletedFirstLoad
												? "translateY(0)"
												: "translateY(30px)",
											transitionDelay: hasCompletedFirstLoad ? "0s" : "0s",
										}}>
										{aiPersona}
									</p>
								)}
								{aiEnvironment && (
									<p
										className="text-base font-normal text-slate-200/90 drop-shadow md:text-lg"
										style={{
											opacity: isCinematicFadingOut
												? 0
												: hasCompletedFirstLoad
												? 1
												: encounterTypeOpacity || 0,
											transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
											transform: hasCompletedFirstLoad
												? "translateY(0)"
												: "translateY(30px)",
											transitionDelay: hasCompletedFirstLoad ? "0s" : "0s",
										}}>
										{aiEnvironment}
									</p>
								)}
								{bodyLanguageDescription && (
									<p
										className="mt-4 text-base font-light italic text-slate-100/90 drop-shadow md:text-lg"
										style={{
											opacity: isCinematicFadingOut
												? 0
												: hasCompletedFirstLoad
												? 1
												: bodyLanguageOpacity || 0,
											transition: "all 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
											transform: hasCompletedFirstLoad
												? "translateY(0)"
												: "translateY(30px)",
											transitionDelay: hasCompletedFirstLoad ? "0s" : "0s",
										}}>
										{bodyLanguageDescription}
									</p>
								)}
							</div>
						</div>
					)}

					{/* Replay Button - Mobile Only */}
					{showReplayButton && onReplayCinematic && hasCompletedFirstLoad && (
						<>
							<div className="md:hidden absolute bottom-6 left-6 z-[9998] animate-replay-button-fade-in">
								<button
									onClick={onReplayCinematic}
									className="group bg-white/10 backdrop-blur-md border border-white/20 rounded-full p-3 replay-button-hover focus:outline-none focus:ring-2 focus:ring-white/30 focus:ring-offset-2 focus:ring-offset-transparent shadow-lg"
									aria-label="Replay introduction animation">
									<svg
										className="w-5 h-5 text-white transition-transform duration-300 group-hover:rotate-180"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
										xmlns="http://www.w3.org/2000/svg">
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
										/>
									</svg>
								</button>
							</div>
							{/* Replay Button - Desktop Only */}
							<div className="hidden md:block absolute bottom-6 left-6 z-[9998] animate-replay-button-fade-in">
								<button
									onClick={onReplayCinematic}
									className="group bg-slate-900/80 border border-slate-700/70 rounded-full p-3 text-sky-100 shadow-xl backdrop-blur-md hover:bg-slate-800/90 active:bg-slate-900/95 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-sky-400/40 focus:ring-offset-2 focus:ring-offset-slate-900/80"
									aria-label="Replay introduction animation">
									<svg
										className="w-6 h-6 text-sky-200 transition-transform duration-300 group-hover:rotate-180"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
										xmlns="http://www.w3.org/2000/svg">
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
										/>
									</svg>
								</button>
							</div>
						</>
					)}
				</>
			)}
		</div>
	);
};
