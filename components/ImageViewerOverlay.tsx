import React, { useEffect } from "react";
import { CloseIcon } from "./Icons";

interface ImageViewerOverlayProps {
	imageUrl: string | null;
	onClose: () => void;
}

export const ImageViewerOverlay: React.FC<ImageViewerOverlayProps> = ({
	imageUrl,
	onClose,
}) => {
	useEffect(() => {
		const handleEscKey = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				onClose();
			}
		};
		document.addEventListener("keydown", handleEscKey);

		return () => {
			document.removeEventListener("keydown", handleEscKey);
		};
	}, [onClose]);

	if (!imageUrl) {
		return null;
	}

	return (
		<div
			className="fixed inset-0 bg-slate-900/90 flex items-center justify-center z-[200] p-4 animate-[fadeIn_0.2s_ease-out]"
			onClick={onClose}
			role="dialog"
			aria-modal="true"
			aria-label="Image viewer">
			<button
				onClick={onClose}
				className="absolute top-4 right-4 text-gray-300 hover:text-white p-2 rounded-full bg-black/50 hover:bg-black/80 transition-colors z-10"
				aria-label="Close image viewer">
				<CloseIcon className="h-8 w-8" />
			</button>

			<div
				className="relative w-full h-full flex items-center justify-center"
				onClick={(e) => e.stopPropagation()}>
				<img
					src={`data:image/jpeg;base64,${imageUrl}`}
					alt="Full-screen view of AI's current visual cue"
					className="max-w-full max-h-full object-contain rounded-lg shadow-2xl animate-[fadeInSlideUp_0.3s_ease-out_forwards]"
				/>
			</div>
		</div>
	);
};
