import React, { useState, useEffect, useRef } from "react";

interface BackgroundCrossfadeImageProps {
	src: string | null;
	parallax?: boolean;
	className?: string;
	objectPosition?: string;
}

export const BackgroundCrossfadeImage: React.FC<
	BackgroundCrossfadeImageProps
> = ({ src, parallax = false, className = "", objectPosition = "center" }) => {
	const [displayed, setDisplayed] = useState<string | null>(null);
	const [incoming, setIncoming] = useState<string | null>(null);
	const [isAnimating, setIsAnimating] = useState(false);
	const [incomingLoaded, setIncomingLoaded] = useState(false);
	const prevSrcRef = useRef<string | null>(null);
	const CROSSFADE_DURATION = 2000;
	const CROSSFADE_EASING = "cubic-bezier(0.4,0,0.2,1)";

	// Handle src changes
	useEffect(() => {
		if (src && src !== prevSrcRef.current) {
			if (!displayed) {
				setDisplayed(src);
				setIncoming(null);
				setIsAnimating(false);
				setIncomingLoaded(false);
			} else {
				setIncoming(src);
				setIncomingLoaded(false);
			}
			prevSrcRef.current = src;
		} else if (!src && displayed) {
			setDisplayed(null);
			setIncoming(null);
			setIsAnimating(false);
			setIncomingLoaded(false);
			prevSrcRef.current = null;
		} else if (src && !displayed && !incoming) {
			setDisplayed(src);
			setIncoming(null);
			setIsAnimating(false);
			setIncomingLoaded(false);
			prevSrcRef.current = src;
		}
	}, [src]);

	useEffect(() => {
		if (incoming && incomingLoaded) setIsAnimating(true);
	}, [incoming, incomingLoaded]);

	const handleIncomingLoad = () => setIncomingLoaded(true);

	const handleTransitionEnd = () => {
		if (incoming) setDisplayed(incoming);
		setIncoming(null);
		setIsAnimating(false);
		setIncomingLoaded(false);
	};

	// Parallax wrapper class
	const parallaxClass = parallax ? "animate-parallax-drift" : "";

	return (
		<div
			className={`absolute inset-0 w-full h-full overflow-hidden ${className} ${parallaxClass}`}
			style={{ pointerEvents: "none" }}>
			{displayed && (
				<img
					src={displayed}
					className={`absolute inset-0 w-full h-full object-cover`}
					style={{
						objectPosition: objectPosition,
						opacity: incoming && isAnimating ? 0 : 1,
						transition: `opacity ${CROSSFADE_DURATION}ms ${CROSSFADE_EASING}`,
						zIndex: 1,
					}}
					onTransitionEnd={
						incoming && isAnimating ? handleTransitionEnd : undefined
					}
					draggable={false}
					alt=""
					aria-hidden="true"
				/>
			)}
			{incoming && (
				<img
					src={incoming}
					className={`absolute inset-0 w-full h-full object-cover`}
					style={{
						objectPosition: objectPosition,
						opacity: isAnimating ? 1 : 0,
						transition: `opacity ${CROSSFADE_DURATION}ms ${CROSSFADE_EASING}`,
						zIndex: 2,
					}}
					onLoad={handleIncomingLoad}
					draggable={false}
					alt=""
					aria-hidden="true"
				/>
			)}
		</div>
	);
};
