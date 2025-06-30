import React from "react";

// Define IconProps once for icons that need to accept className
interface IconProps {
	className?: string;
}

export const SendIcon: React.FC<IconProps> = ({ className }) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		className={className || "h-5 w-5"}
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

export const StopCircleIcon: React.FC<IconProps> = ({ className }) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		className={className || "h-5 w-5"}
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

export const DownloadIcon: React.FC<IconProps> = ({ className }) => (
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
			d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
		/>
	</svg>
);

export const CheckCircleIcon: React.FC<IconProps> = ({ className }) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		className={className || "h-5 w-5"}
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
		className={className || "h-5 w-5"}
		fill="none"
		viewBox="0 0 24 24"
		stroke="currentColor"
		strokeWidth={2.5}
		strokeLinecap="round"
		strokeLinejoin="round">
		<path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
		<line x1="12" y1="17" x2="12.01" y2="17"></line>
	</svg>
);

export const ArrowLeftIcon: React.FC<IconProps> = ({ className }) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		className={className || "h-5 w-5"}
		viewBox="0 0 20 20"
		fill="currentColor">
		<path
			fillRule="evenodd"
			d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
			clipRule="evenodd"
		/>
	</svg>
);

export const PlayIcon: React.FC<IconProps> = ({ className }) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		className={className || "h-5 w-5"}
		viewBox="0 0 20 20"
		fill="currentColor">
		<path
			fillRule="evenodd"
			d="M7.21 14.77a.75.75 0 01-1.06 0l-4.25-4.25a.75.75 0 010-1.06l4.25-4.25a.75.75 0 111.06 1.06L3.81 10l3.4 3.71a.75.75 0 010 1.06z"
			clipRule="evenodd"
			transform="scale(-1, 1) translate(-20, 0)"
		/>
		<path
			fillRule="evenodd"
			d="M14.21 14.77a.75.75 0 01-1.06 0l-4.25-4.25a.75.75 0 010-1.06l4.25-4.25a.75.75 0 111.06 1.06L10.81 10l3.4 3.71a.75.75 0 010 1.06z"
			clipRule="evenodd"
			transform="scale(-1, 1) translate(-20, 0)"
		/>
	</svg>
);

export const InfoIcon: React.FC<IconProps> = ({ className }) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		className={className || "h-5 w-5"}
		viewBox="0 0 20 20"
		fill="currentColor">
		<path
			fillRule="evenodd"
			d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
			clipRule="evenodd"
		/>
	</svg>
);

export const CloseIcon: React.FC<IconProps> = ({ className }) => (
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
			d="M6 18L18 6M6 6l12 12"
		/>
	</svg>
);

export const ChevronDownIcon: React.FC<IconProps> = ({ className }) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		className={className || "h-4 w-4"}
		fill="none"
		viewBox="0 0 24 24"
		stroke="currentColor"
		strokeWidth={2}>
		<path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
	</svg>
);

export const ChevronUpIcon: React.FC<IconProps> = ({ className }) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		className={className || "h-4 w-4"}
		fill="none"
		viewBox="0 0 24 24"
		stroke="currentColor"
		strokeWidth={2}>
		<path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
	</svg>
);

export const ChatBubbleIcon: React.FC<IconProps> = ({ className }) => (
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
			d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
		/>
	</svg>
);

export const ThoughtBubbleIcon: React.FC<IconProps> = ({ className }) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		className={className || "h-5 w-5"}
		fill="currentColor"
		viewBox="0 0 20 20">
		<path
			fillRule="evenodd"
			d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17.542a.5.5 0 01-.002-.707l.95-1.14a6.472 6.472 0 01-1.94-3.693C1 10.283 1.002 10 1.002 10h1.005A5.485 5.485 0 013 13.06l-.25.3a1.5 1.5 0 00-.313 1.052l.159.942L4.8 13.988a6.5 6.5 0 011.666-.853A7.001 7.001 0 0018 10zm-8-9a7.5 7.5 0 017.5 7.5v.001c0 .354.004.706.012 1.056a.5.5 0 01-.49.497 5.5 5.5 0 00-4.02 4.02.5.5 0 01-.497.49A7.522 7.522 0 0110 17.5 7.5 7.5 0 0110 1z"
			clipRule="evenodd"
		/>
	</svg>
);

export const EyeIcon: React.FC<IconProps> = ({ className }) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		className={className || "h-4 w-4"}
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

export const EyeSlashIcon: React.FC<IconProps> = ({ className }) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		className={className || "h-4 w-4"}
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

export const TrendingUpIcon: React.FC<IconProps> = ({ className }) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		className={className || "h-4 w-4"}
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
		<circle cx="12" cy="12" r="10" />
		<circle cx="12" cy="12" r="6" />
		<circle cx="12" cy="12" r="2" />
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

export const SparklesIcon: React.FC<IconProps> = ({ className }) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 16 16"
		fill="currentColor"
		className={className || "h-5 w-5"}>
		<path d="M7.657 6.247c.11-.33.576-.33.686 0l.645 1.937a2.89 2.89 0 0 0 1.829 1.828l1.936.645c.33.11.33.576 0 .686l-1.937.645a2.89 2.89 0 0 0-1.828 1.829l-.645 1.936a.361.361 0 0 1-.686 0l-.645-1.937a2.89 2.89 0 0 0-1.828-1.828l-1.937-.645a.361.361 0 0 1 0-.686l1.937-.645a2.89 2.89 0 0 0 1.828-1.828zM3.794 1.148a.217.217 0 0 1 .412 0l.387 1.162c.173.518.579.924 1.097 1.097l1.162.387a.217.217 0 0 1 0 .412l-1.162-.387A1.73 1.73 0 0 0 4.58 5.48l-.386 1.161a.217.217 0 0 1-.412 0l-.387-1.162A1.73 1.73 0 0 0 2.206 4.22l-1.162-.387a.217.217 0 0 1 0-.412l1.162-.387A1.73 1.73 0 0 0 3.407 2.31z" />
	</svg>
);

export const CogIcon: React.FC<IconProps> = ({ className }) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		className={className || "h-6 w-6"}
		fill="none"
		viewBox="0 0 24 24"
		stroke="currentColor"
		strokeWidth={2.5}>
		<path
			strokeLinecap="round"
			strokeLinejoin="round"
			d="M4 6h16M4 12h16M4 18h16"
		/>
	</svg>
);

export const PaperIcon: React.FC<IconProps> = ({ className }) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		fill="none"
		viewBox="0 0 24 24"
		strokeWidth={1.5}
		stroke="currentColor"
		className={className || "h-5 w-5"}>
		<path
			strokeLinecap="round"
			strokeLinejoin="round"
			d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
		/>
	</svg>
);

export const ThumbsUpIcon: React.FC<IconProps> = ({ className }) => (
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
			d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.085c-.938 0-1.757.46-2.239 1.178L5 8m0 12h-2a2 2 0 01-2-2V8a2 2 0 012-2h2.086a2 2 0 012 2v10a2 2 0 01-2 2z"
		/>
	</svg>
);

export const ThumbsDownIcon: React.FC<IconProps> = ({ className }) => (
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
			d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.738 3h4.017c.163 0 .326.02.485.06L17 4m-7 10v5a2 2 0 002 2h.085c.938 0 1.757-.46 2.239-1.178L19 16m0-12h2a2 2 0 012 2v8a2 2 0 01-2 2h-2.086a2 2 0 01-2-2V6a2 2 0 012-2z"
		/>
	</svg>
);

export const LightbulbIcon: React.FC<IconProps> = ({ className }) => (
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
			d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
		/>
	</svg>
);

export const ProhibitIcon: React.FC<IconProps> = ({ className }) => (
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
			d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
		/>
	</svg>
);

export const XCircleIcon: React.FC<IconProps> = ({ className }) => (
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
			d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
		/>
	</svg>
);

export const UserIcon: React.FC<IconProps> = ({ className }) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		className={className || "h-6 w-6"}
		fill="none"
		viewBox="0 0 24 24"
		stroke="currentColor"
		strokeWidth={1.5}>
		<path
			strokeLinecap="round"
			strokeLinejoin="round"
			d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
		/>
	</svg>
);

export const HeartIcon: React.FC<IconProps> = ({ className }) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		fill="currentColor"
		className={className || "h-6 w-6"}>
		<path d="M12,21.35L10.55,20.03C5.4,15.36,2,12.27,2,8.5C2,5.41,4.42,3,7.5,3C9.24,3,10.91,3.81,12,5.08C13.09,3.81,14.76,3,16.5,3C19.58,3,22,5.41,22,8.5C22,12.27,18.6,15.36,13.45,20.03L12,21.35Z" />
	</svg>
);

export const FastForwardIcon: React.FC<IconProps> = ({ className }) => (
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
			d="m13 5 7 7-7 7M5 5l7 7-7 7"
		/>
	</svg>
);

export const GestureIcon: React.FC<IconProps> = ({ className }) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 16 16"
		fill="currentColor"
		className={className || "h-5 w-5"}>
		<path d="M7.657 6.247c.11-.33.576-.33.686 0l.645 1.937a2.89 2.89 0 0 0 1.829 1.828l1.936.645c.33.11.33.576 0 .686l-1.937.645a2.89 2.89 0 0 0-1.828 1.829l-.645 1.936a.361.361 0 0 1-.686 0l-.645-1.937a2.89 2.89 0 0 0-1.828-1.828l-1.937-.645a.361.361 0 0 1 0-.686l1.937-.645a2.89 2.89 0 0 0 1.828-1.828zM3.794 1.148a.217.217 0 0 1 .412 0l.387 1.162c.173.518.579.924 1.097 1.097l1.162.387a.217.217 0 0 1 0 .412l-1.162-.387A1.73 1.73 0 0 0 4.58 5.48l-.386 1.161a.217.217 0 0 1-.412 0l-.387-1.162A1.73 1.73 0 0 0 2.206 4.22l-1.162-.387a.217.217 0 0 1 0-.412l1.162-.387A1.73 1.73 0 0 0 3.407 2.31z" />
	</svg>
);
