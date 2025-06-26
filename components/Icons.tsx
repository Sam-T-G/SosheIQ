import React from "react";

// Define IconProps once for icons that need to accept className
interface IconProps {
	className?: string;
}

export const SendIcon: React.FC = () => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		className="h-5 w-5"
		fill="none"
		viewBox="0 0 24 24"
		stroke="currentColor"
		strokeWidth={2}>
		<path
			strokeLinecap="round"
			strokeLinejoin="round"
			d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
		/>
	</svg>
);

export const StopCircleIcon: React.FC = () => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		className="h-5 w-5"
		fill="none"
		viewBox="0 0 24 24"
		stroke="currentColor"
		strokeWidth={2}>
		<path
			strokeLinecap="round"
			strokeLinejoin="round"
			d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
		/>
		<path
			strokeLinecap="round"
			strokeLinejoin="round"
			d="M9 10a.5.5 0 01.5-.5h5a.5.5 0 01.5.5v4a.5.5 0 01-.5.5h-5a.5.5 0 01-.5-.5v-4z"
		/>
	</svg>
);

export const DownloadIcon: React.FC = () => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		className="h-6 w-6"
		fill="none"
		viewBox="0 0 24 24"
		stroke="currentColor"
		strokeWidth={2}>
		<path
			strokeLinecap="round"
			strokeLinejoin="round"
			d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
		/>
	</svg>
);

export const CheckCircleIcon: React.FC = () => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		className="h-5 w-5"
		fill="none"
		viewBox="0 0 24 24"
		stroke="currentColor"
		strokeWidth={2}>
		<path
			strokeLinecap="round"
			strokeLinejoin="round"
			d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
		/>
	</svg>
);

export const QuestionMarkIcon: React.FC<IconProps> = ({ className }) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width="24"
		height="24"
		className={className}
		fill="none"
		viewBox="0 0 24 24"
		stroke="currentColor"
		strokeWidth={2}
		strokeLinecap="round"
		strokeLinejoin="round">
		{/* Path from Feather Icons: question-mark */}
		<path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
		<line x1="12" y1="17" x2="12.01" y2="17"></line>
	</svg>
);

export const ArrowLeftIcon: React.FC = () => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		className="h-5 w-5"
		viewBox="0 0 20 20"
		fill="currentColor">
		<path
			fillRule="evenodd"
			d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
			clipRule="evenodd"
		/>
	</svg>
);

export const PlayIcon: React.FC = () => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		className="h-5 w-5"
		viewBox="0 0 20 20"
		fill="currentColor">
		<path
			fillRule="evenodd"
			d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
			clipRule="evenodd"
		/>
	</svg>
);

export const InfoIcon: React.FC<IconProps> = (
	{ className } // Added IconProps for potential className usage
) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width="24"
		height="24"
		className={className || "h-5 w-5"} // Default to h-5 w-5 if no className, or use passed className
		viewBox="0 0 20 20"
		fill="currentColor">
		<path
			fillRule="evenodd"
			d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
			clipRule="evenodd"
		/>
	</svg>
);

export const CloseIcon: React.FC = () => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		className="h-6 w-6"
		fill="none"
		viewBox="0 0 24 24"
		stroke="currentColor"
		strokeWidth={2}>
		<path
			strokeLinecap="round"
			strokeLinejoin="round"
			d="M6 18L18 6M6 6l12 12"
		/>
	</svg>
);

export const ChevronDownIcon: React.FC = () => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		className="h-4 w-4"
		fill="none"
		viewBox="0 0 24 24"
		stroke="currentColor"
		strokeWidth={2}>
		<path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
	</svg>
);

export const ChevronUpIcon: React.FC = () => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		className="h-4 w-4"
		fill="none"
		viewBox="0 0 24 24"
		stroke="currentColor"
		strokeWidth={2}>
		<path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
	</svg>
);

export const ChatBubbleIcon: React.FC<IconProps> = (
	{ className } // Added IconProps
) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width="24"
		height="24"
		className={className || "h-6 w-6"} // Default to h-6 w-6 or use passed className
		fill="none"
		viewBox="0 0 24 24"
		stroke="currentColor"
		strokeWidth={2}>
		<path
			strokeLinecap="round"
			strokeLinejoin="round"
			d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
		/>
	</svg>
);

export const ThoughtBubbleIcon: React.FC<IconProps> = ({ className }) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width="24"
		height="24"
		className={className}
		fill="currentColor"
		viewBox="0 0 24 24">
		<path d="M12 0 L14 10 L24 12 L14 14 L12 24 L10 14 L0 12 L10 10 Z" />
	</svg>
);

export const EyeIcon: React.FC = () => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		className="h-4 w-4"
		fill="none"
		viewBox="0 0 24 24"
		stroke="currentColor"
		strokeWidth={2}>
		<path
			strokeLinecap="round"
			strokeLinejoin="round"
			d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
		/>
		<path
			strokeLinecap="round"
			strokeLinejoin="round"
			d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-.001.026-.002.052-.002.078 0 .026.001.052.002.078-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7A19.953 19.953 0 012.458 12z"
		/>
	</svg>
);

export const EyeSlashIcon: React.FC = () => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		className="h-4 w-4"
		fill="none"
		viewBox="0 0 24 24"
		stroke="currentColor"
		strokeWidth={2}>
		<path
			strokeLinecap="round"
			strokeLinejoin="round"
			d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a19.953 19.953 0 013.116-4.991m13.257 4.991a19.953 19.953 0 00-3.116-4.991m-10.142 9.982A10.05 10.05 0 0112 19c1.905 0 3.71-.476 5.375-1.35M2.458 12C3.732 7.943 7.523 5 12 5c1.613 0 3.14.333 4.543.937m7.101 2.525A10.03 10.03 0 0112 19c-4.478 0-8.268-2.943-9.543-7M15 12a3 3 0 11-6 0 3 3 0 016 0z"
		/>
	</svg>
);

export const TrendingUpIcon: React.FC = () => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		className="h-4 w-4"
		fill="none"
		viewBox="0 0 24 24"
		stroke="currentColor"
		strokeWidth={2}>
		<path strokeLinecap="round" strokeLinejoin="round" d="M3 17l6-6 4 4 8-8" />
		<path strokeLinecap="round" strokeLinejoin="round" d="M17 7h4v4" />
	</svg>
);

export const TargetIcon: React.FC<IconProps> = ({ className }) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		className={className || "h-6 w-6"}
		fill="none"
		viewBox="0 0 24 24"
		stroke="currentColor"
		strokeWidth={2}>
		<path
			strokeLinecap="round"
			strokeLinejoin="round"
			d="M12 21a9 9 0 110-18 9 9 0 010 18z"
		/>
		<path
			strokeLinecap="round"
			strokeLinejoin="round"
			d="M12 15a3 3 0 110-6 3 3 0 010 6z"
		/>
		<path
			strokeLinecap="round"
			strokeLinejoin="round"
			d="M12 9V3m0 18v-6m6-3h6M3 12h6"
		/>
	</svg>
);

export const StarIcon: React.FC<IconProps> = ({ className }) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		className={className || "h-4 w-4"}
		viewBox="0 0 20 20"
		fill="currentColor">
		<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
	</svg>
);
