import React from "react";
import type { ActiveAction } from "../types";
import { ProgressBar } from "./ProgressBar";
import { TargetIcon, FastForwardIcon, PinIcon } from "./Icons";

interface TopBannerContainerProps {
	activeAction: ActiveAction | null;
	isActionPaused: boolean;
	displayedGoal: { text: string; progress: number } | null;
	isPinnable: boolean;
	onPinGoal: (goalText: string) => void;
	onFastForwardAction: () => void;
	isLoadingAI: boolean;
	goalJustChanged: boolean;
	isOverlay?: boolean;
}

const GoalBanner: React.FC<{
	goal: { text: string; progress: number };
	isGlowing?: boolean;
	isPinnable: boolean;
	onPinGoal: (goalText: string) => void;
}> = ({ goal, isGlowing, isPinnable, onPinGoal }) => (
	<div
		className={`bg-teal-900/60 p-3 shadow-lg border-b border-teal-800/50 rounded-b-md ${
			isGlowing ? "animate-glow-pulse" : ""
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
			{isPinnable && (
				<button
					onClick={() => onPinGoal(goal.text)}
					className="p-1.5 rounded-full bg-teal-700/80 hover:bg-teal-600 text-white transition-colors"
					title="Pin this goal to track it">
					<PinIcon className="h-4 w-4" />
				</button>
			)}
			<span className="text-lg font-bold text-white">{goal.progress}%</span>
		</div>
		<ProgressBar percentage={goal.progress} />
	</div>
);

const ActiveActionBanner: React.FC<{
	action: ActiveAction;
	onFastForward: () => void;
	isLoading: boolean;
	isPaused: boolean;
}> = ({ action, onFastForward, isLoading, isPaused }) => (
	<div className="bg-sky-900/60 p-3 shadow-lg border-b border-sky-800/50 rounded-b-md">
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
				className="p-2 rounded-full bg-sky-700/80 hover:bg-sky-600 text-white transition-colors disabled:opacity-50 disabled:cursor-wait"
				title="Fast Forward to the end of this action">
				<FastForwardIcon className="h-5 w-5" />
			</button>
		</div>
		<ProgressBar percentage={action.progress} />
	</div>
);

export const TopBannerContainer: React.FC<TopBannerContainerProps> = ({
	activeAction,
	isActionPaused,
	displayedGoal,
	isPinnable,
	onPinGoal,
	onFastForwardAction,
	isLoadingAI,
	goalJustChanged,
	isOverlay = false, // Default to not being an overlay
}) => {
	const wrapperClass = isOverlay ? "" : "hidden md:block";

	const renderBanner = () => {
		if (activeAction) {
			return (
				<div className="animate-slideDown">
					<ActiveActionBanner
						action={activeAction}
						onFastForward={onFastForwardAction}
						isLoading={isLoadingAI}
						isPaused={isActionPaused}
					/>
				</div>
			);
		}
		if (displayedGoal) {
			return (
				<div className="animate-slideDown">
					<GoalBanner
						goal={displayedGoal}
						isGlowing={goalJustChanged}
						isPinnable={isPinnable}
						onPinGoal={onPinGoal}
					/>
				</div>
			);
		}
		return null;
	};

	return <div className={wrapperClass}>{renderBanner()}</div>;
};
