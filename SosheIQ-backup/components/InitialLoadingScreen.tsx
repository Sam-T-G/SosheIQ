import React from "react";
import { SosheIQLogo } from "./SosheIQLogo";

export const InitialLoadingScreen: React.FC = () => {
	return (
		<div
			className="fixed inset-0 bg-slate-900 flex flex-col items-center justify-center z-[500] animate-fadeIn"
			role="status"
			aria-live="polite"
			aria-label="Waking up the AI...">
			<div className="relative flex items-center justify-center">
				{/* Breathing Glow Effect */}
				<div className="absolute h-40 w-40 rounded-full bg-sky-500/10 animate-logo-glow-pulse"></div>
				{/* Logo on top */}
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
	);
};
