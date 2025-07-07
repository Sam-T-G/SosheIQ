import React, { useState, useEffect } from "react";
import type { ActiveAction } from "../types";
import { ProgressBar } from "./ProgressBar";
import {
	TargetIcon,
	FastForwardIcon,
	PinOutlineIcon,
	PinSolidIcon,
} from "./Icons";

interface TopBannerContainerProps {
	activeAction: ActiveAction | null;
	isActionPaused: boolean;
	displayedGoal: { text: string; progress: number } | null;
	isPinnable: boolean;
	isGoalPinned: boolean;
	onPinGoal: (goalText: string) => void;
	onUnpinGoal: () => void;
	onFastForwardAction: () => void;
	isLoadingAI: boolean;
	goalJustChanged: boolean;
	isOverlay?: boolean;
}

const GoalBanner: React.FC<{
	goal: { text: string; progress: number };
	isGlowing?: boolean;
	isPinnable: boolean;
	isGoalPinned: boolean;
	onPinGoal: (goalText: string) => void;
	onUnpinGoal: () => void;
	isCompleting: boolean;
	onCompletionAnimationEnd: () => void;
}> = ({
	goal,
	isGlowing,
	isPinnable,
	isGoalPinned,
	onPinGoal,
	onUnpinGoal,
	isCompleting,
	onCompletionAnimationEnd,
}) => {
	const showPinButton = isPinnable || isGoalPinned;
	const animationClass = isGoalPinned
		? "animate-pinned-goal-glow"
		: isGlowing
		? "animate-glow-pulse"
		: "";
	const shapeClass = isGoalPinned ? "border rounded-lg" : "border rounded-lg";

	return (
		<div
			className={`bg-teal-900/95 backdrop-blur-sm p-3 shadow-lg border-teal-800/40 ${shapeClass} ${animationClass} ${
				isCompleting ? "animate-goal-completion" : ""
			}`}>
			<div className="flex items-center gap-3 mb-1.5">
				<TargetIcon className="h-5 w-5 text-teal-300 flex-shrink-0" />
				<div className="flex-grow">
					<p className="text-xs font-semibold text-teal-300 uppercase tracking-wider">
						Conversation Goal
					</p>
					<p className="text-sm text-teal-100 break-words" title={goal.text}>
						{goal.text}
					</p>
				</div>
				{showPinButton && (
					<button
						onClick={isGoalPinned ? onUnpinGoal : () => onPinGoal(goal.text)}
						className="p-2 rounded-full bg-teal-700/90 hover:bg-teal-600/95 text-white transition-all duration-200 shadow-lg border border-teal-600/40 hover:border-teal-500/60 hover:shadow-xl hover:scale-105 active:scale-95 backdrop-blur-sm"
						title={
							isGoalPinned ? "Unpin this goal" : "Pin this goal to track it"
						}>
						{isGoalPinned ? (
							<PinSolidIcon className="h-5 w-5" />
						) : (
							<PinOutlineIcon className="h-5 w-5" />
						)}
					</button>
				)}
				<span className="text-lg font-bold text-white">{goal.progress}%</span>
			</div>
			<ProgressBar
				percentage={goal.progress}
				isCompleting={isCompleting}
				onCompletionAnimationEnd={onCompletionAnimationEnd}
			/>
		</div>
	);
};

const ActiveActionBanner: React.FC<{
	action: ActiveAction;
	onFastForward: () => void;
	isLoading: boolean;
	isPaused: boolean;
	isCompleting: boolean;
	onCompletionAnimationEnd: () => void;
}> = ({
	action,
	onFastForward,
	isLoading,
	isPaused,
	isCompleting,
	onCompletionAnimationEnd,
}) => (
	<div
		className={`relative rounded-b-lg active-action-glow overflow-hidden ${
			isCompleting ? "animate-action-completion" : ""
		}`}>
		<div className="relative z-1 bg-sky-900/95 backdrop-blur-sm p-3 shadow-lg border-sky-800/40 rounded-b-lg">
			<div className="flex items-center gap-3 mb-1.5">
				<div className="flex-grow">
					<p className="text-xs font-semibold text-sky-300 uppercase tracking-wider">
						Active Action
					</p>
					<p
						className="text-sm text-sky-100 break-words"
						title={action.description}>
						{action.description}
					</p>
					{isPaused && (
						<p className="text-red-400 font-bold text-xs animate-pulse mt-1">
							ACTIVE PAUSE
						</p>
					)}
				</div>
				<button
					onClick={onFastForward}
					disabled={isLoading}
					className="p-2.5 rounded-full bg-sky-700/90 hover:bg-sky-600/95 text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-wait shadow-lg border border-sky-600/40 hover:border-sky-500/60 hover:shadow-xl hover:scale-105 active:scale-95 backdrop-blur-sm"
					title="Fast Forward to the end of this action">
					<FastForwardIcon className="h-5 w-5" />
				</button>
			</div>
			<ProgressBar
				percentage={action.progress}
				isCompleting={isCompleting}
				onCompletionAnimationEnd={onCompletionAnimationEnd}
			/>
		</div>
	</div>
);

export const TopBannerContainer: React.FC<TopBannerContainerProps> = ({
	activeAction,
	isActionPaused,
	displayedGoal,
	isPinnable,
	isGoalPinned,
	onPinGoal,
	onUnpinGoal,
	onFastForwardAction,
	isLoadingAI,
	goalJustChanged,
	isOverlay = false, // Default to not being an overlay
}) => {
	// Active Action states
	const [isActionCompleting, setIsActionCompleting] = useState(false);
	const [isActionStowingAway, setIsActionStowingAway] = useState(false);
	const [prevActiveAction, setPrevActiveAction] = useState<ActiveAction | null>(
		null
	);

	// Goal states
	const [isGoalCompleting, setIsGoalCompleting] = useState(false);
	const [isGoalStowingAway, setIsGoalStowingAway] = useState(false);
	const [prevDisplayedGoal, setPrevDisplayedGoal] = useState<{
		text: string;
		progress: number;
	} | null>(null);

	// Track when action reaches 100% and when it gets removed
	useEffect(() => {
		if (activeAction && activeAction.progress >= 100 && !isActionCompleting) {
			setIsActionCompleting(true);
		}

		// If we had an action and now it's null, trigger stow-away
		if (prevActiveAction && !activeAction && !isActionStowingAway) {
			setIsActionStowingAway(true);
		}

		setPrevActiveAction(activeAction);
	}, [activeAction, isActionCompleting, isActionStowingAway, prevActiveAction]);

	// Track when goal reaches 100% and when it gets removed
	useEffect(() => {
		if (displayedGoal && displayedGoal.progress >= 100 && !isGoalCompleting) {
			setIsGoalCompleting(true);
		}

		// If we had a goal and now it's null, trigger stow-away
		if (prevDisplayedGoal && !displayedGoal && !isGoalStowingAway) {
			setIsGoalStowingAway(true);
		}

		setPrevDisplayedGoal(displayedGoal);
	}, [displayedGoal, isGoalCompleting, isGoalStowingAway, prevDisplayedGoal]);

	const handleActionCompletionAnimationEnd = () => {
		setIsActionCompleting(false);
		// Trigger stow-away animation after completion
		setIsActionStowingAway(true);
	};

	const handleActionStowAwayAnimationEnd = () => {
		setIsActionStowingAway(false);
	};

	const handleGoalCompletionAnimationEnd = () => {
		setIsGoalCompleting(false);
		// Trigger stow-away animation after completion
		setIsGoalStowingAway(true);
	};

	const handleGoalStowAwayAnimationEnd = () => {
		setIsGoalStowingAway(false);
	};

	// Choose the appropriate stow-away animation class based on overlay mode
	const getStowAwayClass = (isStowingAway: boolean) => {
		if (!isStowingAway) return "";
		return isOverlay ? "animate-stow-away-mobile" : "animate-stow-away-desktop";
	};

	// Choose the appropriate slide-in animation class based on overlay mode
	const getSlideInClass = () => {
		return isOverlay
			? "animate-slideInFromUnderMobile"
			: "animate-slideInFromUnder";
	};

	// Get the appropriate wrapper class based on overlay mode
	const getWrapperClass = () => {
		if (isOverlay) {
			return ""; // No special container class needed for mobile
		}
		// Enhanced desktop wrapper - ensure complete invisibility on mobile
		// Use max-md:hidden for better mobile hiding + opacity for state transitions
		return "max-md:hidden max-md:opacity-0 max-md:pointer-events-none md:block";
	};

	const renderBanner = () => {
		if (activeAction) {
			return (
				<div
					className={`${getSlideInClass()} ${getStowAwayClass(
						isActionStowingAway
					)}`}
					onAnimationEnd={
						isActionStowingAway ? handleActionStowAwayAnimationEnd : undefined
					}>
					<ActiveActionBanner
						action={activeAction}
						onFastForward={onFastForwardAction}
						isLoading={isLoadingAI}
						isPaused={isActionPaused}
						isCompleting={isActionCompleting}
						onCompletionAnimationEnd={handleActionCompletionAnimationEnd}
					/>
				</div>
			);
		}
		if (displayedGoal) {
			return (
				<div
					className={`${getSlideInClass()} ${getStowAwayClass(
						isGoalStowingAway
					)}`}
					onAnimationEnd={
						isGoalStowingAway ? handleGoalStowAwayAnimationEnd : undefined
					}>
					<GoalBanner
						goal={displayedGoal}
						isGlowing={goalJustChanged}
						isPinnable={isPinnable}
						isGoalPinned={isGoalPinned}
						onPinGoal={onPinGoal}
						onUnpinGoal={onUnpinGoal}
						isCompleting={isGoalCompleting}
						onCompletionAnimationEnd={handleGoalCompletionAnimationEnd}
					/>
				</div>
			);
		}
		return null;
	};

	// Only render the wrapper div if there's banner content
	const bannerContent = renderBanner();
	if (!bannerContent) {
		return null;
	}

	return <div className={getWrapperClass()}>{bannerContent}</div>;
};
