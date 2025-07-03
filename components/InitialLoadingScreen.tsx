import React, { useState, useEffect } from "react";
import { SosheIQLogo } from "./SosheIQLogo";

export const InitialLoadingScreen: React.FC = () => {
	const [isFadingToBlack, setIsFadingToBlack] = useState(false);
	const [isContentFading, setIsContentFading] = useState(false);
	const [isMobile, setIsMobile] = useState(false);

	useEffect(() => {
		// Check if we're on mobile
		const checkMobile = () => {
			setIsMobile(window.innerWidth <= 768);
		};

		checkMobile();
		window.addEventListener("resize", checkMobile);

		// Start the fade to black sequence after 2.5 seconds (mobile only)
		const fadeTimer = setTimeout(() => {
			if (isMobile) {
				setIsContentFading(true);
				setTimeout(() => {
					setIsFadingToBlack(true);
				}, 800); // Start fade to black after content starts fading
			}
		}, 2500);

		return () => {
			clearTimeout(fadeTimer);
			window.removeEventListener("resize", checkMobile);
		};
	}, [isMobile]);

	return (
		<div
			className={`fixed inset-0 flex flex-col items-center justify-center z-[500] transition-all duration-1500 ${
				isFadingToBlack
					? "animate-loading-fade-to-black"
					: "bg-slate-900 animate-fadeIn"
			}`}
			role="status"
			aria-live="polite"
			aria-label="Waking up the AI...">
			<div
				className={`flex flex-col items-center justify-center transition-all duration-1000 ${
					isContentFading ? "animate-loading-content-fade-out" : ""
				}`}>
				<div className="flex items-center justify-center">
					{/* Logo only, no breathing glow */}
					<SosheIQLogo className="h-24 w-auto relative z-10" />
				</div>

				<p className="mt-8 text-lg text-sky-300 font-semibold animate-subtle-pulse">
					Waking up the AI...
				</p>

				{/* Indeterminate Loading Bar */}
				<div className="absolute bottom-1/4 w-full max-w-xs h-1.5 bg-sky-900/50 rounded-full overflow-hidden">
					<div className="h-full bg-sky-400 rounded-full animate-loading-bar-sweep"></div>
				</div>
			</div>
		</div>
	);
};
