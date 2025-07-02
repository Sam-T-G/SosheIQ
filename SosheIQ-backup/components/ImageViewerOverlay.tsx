import React, { useState, useEffect, useRef } from "react";
import { CloseIcon, ChevronLeftIcon, ChevronRightIcon } from "./Icons";

interface ImageViewerOverlayProps {
	images: { url: string; contextText?: string }[];
	startIndex: number;
	onClose: () => void;
}

export const ImageViewerOverlay: React.FC<ImageViewerOverlayProps> = ({
	images,
	startIndex,
	onClose,
}) => {
	const [currentIndex, setCurrentIndex] = useState(startIndex);
	const [isExiting, setIsExiting] = useState(false);
	const thumbnailContainerRef = useRef<HTMLDivElement>(null);

	const handleClose = () => {
		setIsExiting(true);
		setTimeout(onClose, 200); // Wait for animation
	};

	const handleNext = () => {
		setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
	};

	const handlePrev = () => {
		setCurrentIndex(
			(prevIndex) => (prevIndex - 1 + images.length) % images.length
		);
	};

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "ArrowRight") handleNext();
			else if (event.key === "ArrowLeft") handlePrev();
			else if (event.key === "Escape") handleClose();
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [images.length]);

	// Scroll active thumbnail into view
	useEffect(() => {
		const container = thumbnailContainerRef.current;
		const activeThumbnail = container?.children[currentIndex] as HTMLElement;
		if (container && activeThumbnail) {
			const containerRect = container.getBoundingClientRect();
			const thumbRect = activeThumbnail.getBoundingClientRect();

			const scrollOffset =
				thumbRect.left -
				containerRect.left -
				containerRect.width / 2 +
				thumbRect.width / 2;

			container.scrollBy({
				left: scrollOffset,
				behavior: "smooth",
			});
		}
	}, [currentIndex]);

	const currentImage = images[currentIndex];
	const overlayAnimationClass = isExiting
		? "animate-[fadeOut_0.2s_ease-out_forwards]"
		: "animate-[fadeIn_0.2s_ease-out]";

	return (
		<div
			className={`fixed inset-0 bg-slate-900/90 flex flex-col items-center justify-center z-[200] p-4 ${overlayAnimationClass}`}
			onClick={handleClose}
			role="dialog"
			aria-modal="true"
			aria-label="Image gallery viewer">
			<button
				onClick={handleClose}
				className="absolute top-4 right-4 text-gray-300 hover:text-white p-2 rounded-full bg-black/50 hover:bg-black/80 transition-colors z-30"
				aria-label="Close image viewer">
				<CloseIcon className="h-8 w-8" />
			</button>

			{/* Main Image and Navigation */}
			<div
				className="relative w-full h-full flex items-center justify-center"
				onClick={(e) => e.stopPropagation()}>
				{/* Previous Button */}
				{images.length > 1 && (
					<button
						onClick={handlePrev}
						className="absolute left-0 sm:left-4 z-20 p-3 rounded-full bg-black/30 hover:bg-black/60 transition-colors"
						aria-label="Previous image">
						<ChevronLeftIcon className="h-8 w-8 text-white" />
					</button>
				)}

				{/* Image Container */}
				<div className="relative flex flex-col items-center justify-center gap-2 max-h-[calc(100%-8rem)] w-full">
					<img
						key={currentImage.url}
						src={`data:image/jpeg;base64,${currentImage.url}`}
						alt={currentImage.contextText || "AI generated image"}
						className="max-w-full max-h-full object-contain rounded-lg shadow-2xl animate-[fadeIn_0.3s_ease-out_forwards]"
					/>
					{currentImage.contextText && (
						<p className="text-sm text-center text-gray-300 italic mt-2 bg-black/20 px-3 py-1 rounded-md">
							{currentImage.contextText}
						</p>
					)}
				</div>

				{/* Next Button */}
				{images.length > 1 && (
					<button
						onClick={handleNext}
						className="absolute right-0 sm:right-4 z-20 p-3 rounded-full bg-black/30 hover:bg-black/60 transition-colors"
						aria-label="Next image">
						<ChevronRightIcon className="h-8 w-8 text-white" />
					</button>
				)}
			</div>

			{/* Thumbnail Filmstrip */}
			{images.length > 1 && (
				<div
					ref={thumbnailContainerRef}
					className="absolute bottom-0 left-0 right-0 h-28 bg-black/30 backdrop-blur-sm p-3 flex items-center gap-3 overflow-x-auto custom-scrollbar"
					onClick={(e) => e.stopPropagation()}
					aria-label="Image thumbnails">
					{images.map((img, index) => (
						<button
							key={img.url}
							onClick={() => setCurrentIndex(index)}
							className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden transition-all duration-200 ease-in-out border-4 
                ${
									currentIndex === index
										? "border-sky-400 scale-105"
										: "border-transparent hover:border-sky-500/50 hover:scale-105"
								}`}
							aria-current={currentIndex === index}>
							<img
								src={`data:image/jpeg;base64,${img.url}`}
								alt={`Thumbnail ${index + 1}`}
								className="w-full h-full object-cover"
							/>
						</button>
					))}
				</div>
			)}
		</div>
	);
};
