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
	// Add optional onImageLoad
	onImageLoad?: () => void;
	// Add optional chatContainerRef for scroll centering
	chatContainerRef?: React.RefObject<HTMLDivElement>;
	// Add optional inputAreaRef for aligning above input
	inputAreaRef?: React.RefObject<HTMLDivElement>;
	// Add optional topUiRef for scroll calculations
	topUiRef?: React.RefObject<HTMLDivElement>;
	// Add optional bottom padding for special cases
	addBottomPadding?: boolean;
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

const BadgeInfoPopover: React.FC<
	BadgeInfoPopoverProps & {
		popoverRef?: React.RefObject<HTMLDivElement>;
		onEnsureVisible?: () => void;
	}
> = ({ content, badgeType, onClose, popoverRef, onEnsureVisible }) => {
	useEffect(() => {
		if (!popoverRef?.current || !onEnsureVisible) return;
		let observer: ResizeObserver | null = null;
		let pollingId: number | null = null;

		const runEnsureVisible = () => {
			onEnsureVisible();
		};

		if ("ResizeObserver" in window) {
			observer = new ResizeObserver(runEnsureVisible);
			observer.observe(popoverRef.current);
			// Also run once on mount
			runEnsureVisible();
		} else {
			// Fallback: poll a few times
			let count = 0;
			const poll = () => {
				runEnsureVisible();
				if (++count < 10) {
					pollingId = window.setTimeout(poll, 60);
				}
			};
			poll();
		}
		return () => {
			if (observer) observer.disconnect();
			if (pollingId) window.clearTimeout(pollingId);
		};
	}, [popoverRef, onEnsureVisible]);

	const borderColor =
		badgeType === "positive" ? "border-purple-500" : "border-red-500";

	return (
		<div
			className="absolute bottom-full right-0 mb-3 w-72 z-20 animate-fadeIn"
			onClick={(e) => e.stopPropagation()}
			ref={popoverRef}>
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
	onImageLoad,
	chatContainerRef,
	inputAreaRef,
	topUiRef,
	addBottomPadding = false,
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

	// --- Badge refs for precise centering ---
	const badgeRefs = {
		positive: useRef<HTMLButtonElement>(null),
		negative: useRef<HTMLButtonElement>(null),
	};

	// Ref for the popover to measure its position
	const popoverRef = useRef<HTMLDivElement>(null);

	const centerElementInContainer = (
		el: HTMLElement,
		container: HTMLElement
	) => {
		const elRect = el.getBoundingClientRect();
		const containerRect = container.getBoundingClientRect();
		const elCenterY = elRect.top + elRect.height / 2;
		const containerCenterY = containerRect.top + containerRect.height / 2;
		const scrollOffset = elCenterY - containerCenterY;
		container.scrollBy({
			top: scrollOffset,
			behavior: "smooth",
		});
	};

	const alignElementAboveInput = (
		el: HTMLElement,
		container: HTMLElement,
		input: HTMLElement,
		topUi?: HTMLElement
	) => {
		const elRect = el.getBoundingClientRect();
		const containerRect = container.getBoundingClientRect();
		const inputRect = input.getBoundingClientRect();
		const margin = 16; // px above input
		const elBottom = elRect.bottom;
		const elTop = elRect.top;
		const inputTop = inputRect.top;
		const containerTop = containerRect.top;
		const topUiBottom = topUi ? topUi.getBoundingClientRect().bottom : 0;

		// If badge is below input area, scroll down
		if (elBottom > inputTop - margin) {
			const offset = elBottom - inputTop + margin;
			container.scrollBy({ top: offset, behavior: "smooth" });
			return;
		}
		// If badge is above visible chat container or hidden behind top UI, scroll up
		const minVisibleTop = Math.max(containerTop + margin, topUiBottom + margin);
		if (elTop < minVisibleTop) {
			const offset = elTop - minVisibleTop;
			container.scrollBy({ top: offset, behavior: "smooth" });
			return;
		}
		// Otherwise, do nothing (badge is already visible just above input and not hidden by top UI)
	};

	const ensurePopoverFullyVisible = () => {
		const container = chatContainerRef?.current;
		const topUi = topUiRef?.current;
		const popover = popoverRef.current;
		if (!container || !popover) return;
		const popoverRect = popover.getBoundingClientRect();
		const containerRect = container.getBoundingClientRect();
		const topUiBottom = topUi
			? topUi.getBoundingClientRect().bottom
			: containerRect.top;
		const margin = 12;
		// If any part of the popover is above the top UI, scroll down
		if (popoverRect.top < topUiBottom + margin) {
			const offset = popoverRect.top - (topUiBottom + margin);
			container.scrollBy({ top: offset, behavior: "smooth" });
		}
		// If any part of the popover is above the visible container (but below top UI), scroll down
		else if (popoverRect.top < containerRect.top + margin) {
			const offset = popoverRect.top - (containerRect.top + margin);
			container.scrollBy({ top: offset, behavior: "smooth" });
		}
		// If any part of the popover is below the visible container, scroll up
		else if (popoverRect.bottom > containerRect.bottom - margin) {
			const offset = popoverRect.bottom - (containerRect.bottom - margin);
			container.scrollBy({ top: offset, behavior: "smooth" });
		}
	};

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
		setPopoverState(nextState);

		// Only scroll to ensure popover is visible after it is rendered
		if (nextState) {
			// Wait for DOM update and layout to settle before measuring and scrolling
			requestAnimationFrame(() => {
				requestAnimationFrame(ensurePopoverFullyVisible);
			});
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
					ref={badgeRefs.positive}
					className="focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900/50 focus:ring-purple-400 rounded-full z-[60]"
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
					ref={badgeRefs.negative}
					className="focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900/50 focus:ring-red-400 rounded-full z-[60]"
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
			<div className="flex flex-col items-end pr-10 sm:pr-20 mx-2 sm:mx-6">
				<div className="relative w-full flex justify-end">
					{popoverState && (
						<BadgeInfoPopover
							content={popoverState.content}
							badgeType={popoverState.badgeType}
							onClose={() => setPopoverState(null)}
							popoverRef={popoverRef}
							onEnsureVisible={ensurePopoverFullyVisible}
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
					ref={badgeRefs.positive}
					className="focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900/50 focus:ring-purple-400 rounded-full z-[60]"
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
					ref={badgeRefs.negative}
					className="focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900/50 focus:ring-red-400 rounded-full z-[60]"
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
				className={`flex justify-end pl-10 sm:pl-20 mx-2 sm:mx-6 mt-2 ${
					addBottomPadding ? "pb-6 md:pb-8" : ""
				}`}>
				<div className="relative">
					{popoverState && (
						<BadgeInfoPopover
							content={popoverState.content}
							badgeType={popoverState.badgeType}
							onClose={() => setPopoverState(null)}
							popoverRef={popoverRef}
							onEnsureVisible={ensurePopoverFullyVisible}
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

	const badges: React.ReactNode[] = [];
	if (message.positiveTraitContribution) {
		badges.push(
			<button
				key="pos-trait"
				onClick={(e) => {
					e.stopPropagation();
					handleBadgeClick(message, "positive");
				}}
				ref={badgeRefs.positive}
				className="focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900/50 focus:ring-purple-400 rounded-full z-[60]"
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
				ref={badgeRefs.negative}
				className="focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900/50 focus:ring-red-400 rounded-full z-[60]"
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
			<EngagementDeltaBadge key="engagement" delta={message.engagementDelta} />
		);
	}

	return (
		<div
			className={`flex flex-col items-start pr-10 sm:pr-20 mx-2 sm:mx-6 ${
				addBottomPadding ? "pb-6 md:pb-8" : ""
			}`}>
			{/* Badges row above the bubble */}
			{badges.length > 0 && (
				<div className="flex flex-row flex-wrap gap-x-2 gap-y-1 mb-1 w-full justify-end">
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
			<ChatMessageViewAI
				scenarioDetailsAiName={scenarioDetailsAiName}
				message={message}
				isLastMessage={isLastMessage}
				isLoadingAI={isLoadingAI}
				onAnimationComplete={onAnimationComplete}
				onThoughtToggle={onThoughtToggle}
				onViewImage={onViewImage}
				onImageLoad={onImageLoad}
				hasBadges={badges.length > 0}
			/>
		</div>
	);
};

export const ChatMessageView = React.memo(ChatMessageViewComponent);
