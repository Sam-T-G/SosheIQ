import React from "react";
import { SosheIQLogo } from "./SosheIQLogo";

export const InitialLoadingScreen: React.FC = () => {
	return (
		<div
			className="fixed inset-0 bg-slate-900 flex flex-col items-center justify-center z-[500] animate-fadeIn"
			role="status"
			aria-live="polite"
			aria-label="Loading SosheIQ">
			<SosheIQLogo className="h-24 w-auto animate-pulse-logo" />
			<p
				className="mt-4 text-lg text-sky-300 font-semibold animate-fadeIn"
				style={{ animationDelay: "0.3s" }}>
				Initializing...
			</p>
		</div>
	);
};
