import React from "react";

interface LoadingIndicatorProps {
	message?: string;
	extraClasses?: string;
}

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
	message = "Loading...",
	extraClasses = "",
}) => {
	return (
		<div
			className={`fixed inset-0 bg-slate-900 bg-opacity-85 flex flex-col items-center justify-center z-50 transition-opacity duration-300 ease-in-out ${extraClasses}`}
			role="status"
			aria-live="assertive"
			aria-label={message}>
			<div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-sky-500 mb-4"></div>
			<p className="text-xl text-sky-300 font-semibold mb-4">{message}</p>
		</div>
	);
};
