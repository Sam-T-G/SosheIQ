import React, { useState, useEffect, useRef } from "react";
import type { ChatMessage } from "../types";
import { ChatMessageViewAI } from "./ChatMessageViewAI";
import {
	StarIcon,
	SparklesIcon,
	XCircleIcon,
	PaperIcon,
	GestureIcon,
	BrainIcon,
	ArrowRightIcon,
	LightbulbIcon,
	CloseIcon,
	CheckCircleIcon,
} from "./Icons";
import { SILENT_USER_ACTION_TOKEN } from "../constants";

interface ChatMessageViewProps {
	message: ChatMessage;
	isLastMessage: boolean;
	isLoadingAI: boolean;
	onAnimationComplete?: () => void;
	onThoughtToggle: () => void;
	onViewImage: (url: string | null) => void;
	onRetryMessage: (messageText: string) => void;
	scenarioDetailsAiName: string;
}

const EngagementDeltaBadge: React.FC<{ delta: number }> = ({ delta }) => {
	const isPositive = delta >= 0;
	const colorClasses = isPositive
		? "bg-green-600 text-white ring-green-400"
		: "bg-red-600 text-white ring-red-400";
	const sign = isPositive ? "+" : "";

	return (
		<div
			className={`px-2 py-0.5 rounded-full text-xs font-bold ring-1 ring-inset ${colorClasses}`}
			aria-label={`Engagement change: ${sign}${delta}%`}>
			{sign}
			{delta}%
		</div>
	);
};

const EffectivenessBadge: React.FC<{ score: number }> = ({ score }) => {
	const colorClasses =
		score >= 75
			? "bg-sky-600 text-white ring-sky-400"
			: score >= 40
			? "bg-yellow-600 text-white ring-yellow-400"
			: "bg-red-600 text-white ring-red-400";

	return (
		<div
			className={`px-2 py-1 rounded-full text-xs font-bold ring-1 ring-inset flex items-center space-x-1 ${colorClasses}`}
			aria-label={`Effectiveness score: ${score}%`}>
			<StarIcon className="h-3 w-3" />
			<span>{score}%</span>
		</div>
	);
};

const TraitContributionBadge: React.FC<{ trait: string }> = ({ trait }) => {
	return (
		<div
			className={`px-2.5 py-1 rounded-full text-xs font-bold ring-1 ring-inset flex items-center space-x-1.5 bg-purple-600 text-white ring-purple-400`}
			aria-label={`Positive Trait: ${trait}`}>
			<SparklesIcon className="h-3.5 w-3.5" />
			<span>{trait} +</span>
		</div>
	);
};

const NegativeTraitContributionBadge: React.FC<{ trait: string }> = ({
	trait,
}) => {
	return (
		<div
			className={`px-2.5 py-1 rounded-full text-xs font-bold ring-1 ring-inset flex items-center space-x-1.5 bg-red-600 text-white ring-red-400`}
			aria-label={`Negative Trait: ${trait}`}>
			<XCircleIcon className="h-3.5 w-3.5" />
			<span>{trait} -</span>
		</div>
	);
};

interface BadgeInfoPopoverProps {
	content: {
		reasoning: string;
		nextStep: string;
		alternative: string;
	};
	badgeType: "positive" | "negative";
	onClose: () => void;
}

const BadgeInfoPopover: React.FC<BadgeInfoPopoverProps> = ({
	content,
	badgeType,
	onClose,
}) => {
	useEffect(() => {
		const handleEsc = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				onClose();
			}
		};
		window.addEventListener("keydown", handleEsc);
		return () => {
			window.removeEventListener("keydown", handleEsc);
		};
	}, [onClose]);

	const borderColor =
		badgeType === "positive" ? "border-purple-500" : "border-red-500";

	return (
		<div
			className="absolute bottom-full right-0 mb-3 w-72 z-20 animate-fadeIn"
			onClick={(e) => e.stopPropagation()}>
			<div
				className={`bg-slate-800 rounded-lg shadow-xl border ${borderColor} p-4`}>
				<button
					onClick={onClose}
					className="absolute top-2 right-2 text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-700 transition-colors"
					aria-label="Close feedback popover">
					<CloseIcon className="h-4 w-4" />
				</button>
				<div className="space-y-4">
					{content.reasoning && (
						<div>
							<h4 className="flex items-center text-sm font-semibold text-sky-300 mb-1">
								<CheckCircleIcon className="h-4 w-4 mr-2" /> Reasoning
							</h4>
							<p className="text-xs text-slate-300 italic">
								{content.reasoning}
							</p>
						</div>
					)}
					{content.nextStep && (
						<div>
							<h4 className="flex items-center text-sm font-semibold text-sky-300 mb-1">
								<ArrowRightIcon className="h-4 w-4 mr-2" /> Next Step Suggestion
							</h4>
							<p className="text-xs text-slate-300 italic">
								{content.nextStep}
							</p>
						</div>
					)}
					{content.alternative && (
						<div>
							<h4 className="flex items-center text-sm font-semibold text-sky-300 mb-1">
								<LightbulbIcon className="h-4 w-4 mr-2" /> Alternative Approach
							</h4>
							<p className="text-xs text-slate-300 italic">
								{content.alternative}
							</p>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

const ChatMessageViewComponent: React.FC<ChatMessageViewProps> = ({
	message,
	isLastMessage,
	isLoadingAI,
	onAnimationComplete,
	onThoughtToggle,
	onViewImage,
	onRetryMessage,
	scenarioDetailsAiName,
}) => {
	const isUser = message.sender === "user";
	const isSystem = message.sender === "system";
	const isBackstory = message.sender === "backstory";
	const isUserAction = message.sender === "user_action";

	const [popoverState, setPopoverState] = useState<{
		content: {
			reasoning: string;
			nextStep: string;
			alternative: string;
		};
		badgeType: "positive" | "negative";
	} | null>(null);
	const messageContainerRef = useRef<HTMLDivElement>(null);

	const handleBadgeClick = (
		message: ChatMessage,
		type: "positive" | "negative"
	) => {
		let nextState: typeof popoverState = null;

		// Always open popover if a trait badge is present
		if (
			(type === "positive" && message.positiveTraitContribution) ||
			(type === "negative" && message.negativeTraitContribution)
		) {
			nextState = {
				content: {
					reasoning:
						message.badgeReasoning ||
						"No specific reasoning provided for this turn.",
					nextStep:
						message.nextStepSuggestion ||
						"No next step suggestion for this turn.",
					alternative:
						message.alternativeSuggestion ||
						"No alternative suggestion for this turn.",
				},
				badgeType: type,
			};
		}
		// If we ARE clicking the currently open one, nextState remains null, effectively closing it.

		setPopoverState(nextState);

		// If we are opening a popover, scroll it into view
		if (nextState) {
			setTimeout(() => {
				messageContainerRef.current?.scrollIntoView({
					behavior: "smooth",
					block: "center",
				});
			}, 0);
		}
	};

	// Centralized click-outside logic
	useEffect(() => {
		if (!popoverState) return;

		const handleClickOutside = (event: MouseEvent) => {
			if (
				messageContainerRef.current &&
				!messageContainerRef.current.contains(event.target as Node)
			) {
				setPopoverState(null);
			}
		};

		// Use a timeout to avoid the handler firing from the same click that opened it.
		const timerId = setTimeout(() => {
			document.addEventListener("mousedown", handleClickOutside);
		}, 0);

		return () => {
			clearTimeout(timerId);
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [popoverState]);

	if (isBackstory) {
		return (
			<div className="my-2 p-4 bg-slate-700/80 border border-slate-600/70 rounded-lg shadow-md animate-fadeIn">
				<h3 className="flex items-center gap-2 text-sm font-semibold text-sky-300 mb-2 uppercase tracking-wider">
					<PaperIcon className="h-5 w-5" />
					Scenario Context
				</h3>
				<p className="text-sm text-gray-300 italic whitespace-pre-wrap">
					{message.text}
				</p>
			</div>
		);
	}

	if (isSystem) {
		return (
			<div className="flex justify-center items-center gap-2 my-2 animate-fadeIn">
				<p className="text-sm italic text-slate-400 px-4 py-1 bg-slate-700/50 rounded-full">
					{message.text}
				</p>
				{message.isRetryable && message.originalMessageText && (
					<button
						onClick={() => onRetryMessage(message.originalMessageText!)}
						className="text-xs bg-sky-600 hover:bg-sky-500 text-white font-semibold py-1 px-3 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-sky-400">
						Retry
					</button>
				)}
			</div>
		);
	}

	if (isUserAction) {
		const badges: React.ReactNode[] = [];
		if (message.positiveTraitContribution) {
			badges.push(
				<button
					key="pos-trait"
					onClick={(e) => {
						e.stopPropagation();
						handleBadgeClick(message, "positive");
					}}
					className="focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900/50 focus:ring-purple-400 rounded-full"
					aria-label={`View details for positive trait: ${message.positiveTraitContribution}`}>
					<TraitContributionBadge trait={message.positiveTraitContribution} />
				</button>
			);
		}
		if (message.negativeTraitContribution) {
			badges.push(
				<button
					key="neg-trait"
					onClick={(e) => {
						e.stopPropagation();
						handleBadgeClick(message, "negative");
					}}
					className="focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900/50 focus:ring-red-400 rounded-full"
					aria-label={`View details for negative trait: ${message.negativeTraitContribution}`}>
					<NegativeTraitContributionBadge
						trait={message.negativeTraitContribution}
					/>
				</button>
			);
		}
		if (typeof message.userTurnEffectivenessScore === "number") {
			badges.push(
				<EffectivenessBadge
					key="effectiveness"
					score={message.userTurnEffectivenessScore}
				/>
			);
		}
		if (typeof message.engagementDelta === "number") {
			badges.push(
				<EngagementDeltaBadge
					key="engagement"
					delta={message.engagementDelta}
				/>
			);
		}

		// Consistent styling for all user actions - use subtle transparent quality like AI actions
		const actionText = message.text; // Remove asterisks - display clean text
		const actionBgClass = "bg-slate-700/30"; // Match AI action dialogue subtle transparency

		return (
			<div className="flex flex-col items-end pr-10 sm:pr-20">
				<div className="relative w-full flex justify-end">
					{popoverState && (
						<BadgeInfoPopover
							content={popoverState.content}
							badgeType={popoverState.badgeType}
							onClose={() => setPopoverState(null)}
						/>
					)}
					{badges.length > 0 && (
						<div className="absolute -top-4 right-0 flex flex-row-reverse items-center gap-x-2 w-auto whitespace-nowrap">
							{badges.map((badge, index) => (
								<div
									key={index}
									className="animate-badge-plop"
									style={{ animationDelay: `${index * 0.15}s` }}>
									{badge}
								</div>
							))}
						</div>
					)}
				</div>
				<div className="flex justify-center items-center gap-2 my-2 animate-fadeIn">
					<GestureIcon className="h-4 w-4 text-slate-400" />
					<p
						className={`text-sm italic text-slate-400 px-4 py-2 rounded-lg inline-block ${actionBgClass}`}>
						{actionText}
					</p>
				</div>
			</div>
		);
	}

	if (isUser) {
		if (message.text === SILENT_USER_ACTION_TOKEN) {
			return null;
		}

		const badges: React.ReactNode[] = [];
		if (message.positiveTraitContribution) {
			badges.push(
				<button
					key="pos-trait"
					onClick={(e) => {
						e.stopPropagation();
						handleBadgeClick(message, "positive");
					}}
					className="focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900/50 focus:ring-purple-400 rounded-full"
					aria-label={`View details for positive trait: ${message.positiveTraitContribution}`}>
					<TraitContributionBadge trait={message.positiveTraitContribution} />
				</button>
			);
		}
		if (message.negativeTraitContribution) {
			badges.push(
				<button
					key="neg-trait"
					onClick={(e) => {
						e.stopPropagation();
						handleBadgeClick(message, "negative");
					}}
					className="focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900/50 focus:ring-red-400 rounded-full"
					aria-label={`View details for negative trait: ${message.negativeTraitContribution}`}>
					<NegativeTraitContributionBadge
						trait={message.negativeTraitContribution}
					/>
				</button>
			);
		}
		if (typeof message.userTurnEffectivenessScore === "number") {
			badges.push(
				<EffectivenessBadge
					key="effectiveness"
					score={message.userTurnEffectivenessScore}
				/>
			);
		}
		if (typeof message.engagementDelta === "number") {
			badges.push(
				<EngagementDeltaBadge
					key="engagement"
					delta={message.engagementDelta}
				/>
			);
		}

		return (
			<div
				ref={messageContainerRef}
				className="flex justify-end pl-10 sm:pl-20">
				<div className="relative">
					{popoverState && (
						<BadgeInfoPopover
							content={popoverState.content}
							badgeType={popoverState.badgeType}
							onClose={() => setPopoverState(null)}
						/>
					)}
					<div className="max-w-xl px-4 py-3 rounded-xl shadow-md bg-sky-600 text-white rounded-br-none">
						<p className="whitespace-pre-wrap break-words">{message.text}</p>
						<p className="text-xs mt-1 opacity-70 text-right">
							{new Date(message.timestamp).toLocaleTimeString([], {
								hour: "2-digit",
								minute: "2-digit",
							})}
						</p>
					</div>
					{badges.length > 0 && (
						<div className="absolute -top-4 right-0 flex flex-row-reverse items-center gap-x-2 w-auto whitespace-nowrap">
							{badges.map((badge, index) => (
								<div
									key={index}
									className="animate-badge-plop"
									style={{ animationDelay: `${index * 0.15}s` }}>
									{badge}
								</div>
							))}
						</div>
					)}
				</div>
			</div>
		);
	}

	return (
		<div className="flex justify-start pr-10 sm:pr-20">
			<ChatMessageViewAI
				scenarioDetailsAiName={scenarioDetailsAiName}
				message={message}
				isLastMessage={isLastMessage}
				isLoadingAI={isLoadingAI}
				onAnimationComplete={onAnimationComplete}
				onThoughtToggle={onThoughtToggle}
				onViewImage={onViewImage}
			/>
		</div>
	);
};

export const ChatMessageView = React.memo(ChatMessageViewComponent);
