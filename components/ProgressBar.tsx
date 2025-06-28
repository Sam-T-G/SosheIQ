import React from "react";
import { ENGAGEMENT_BAR_COLORS } from "../constants";

interface ProgressBarProps {
	percentage: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ percentage }) => {
	const cappedPercentage = Math.max(0, Math.min(100, percentage));

	let barColorClass = ENGAGEMENT_BAR_COLORS.medium;
	if (cappedPercentage <= 33) {
		barColorClass = ENGAGEMENT_BAR_COLORS.low;
	} else if (cappedPercentage >= 67) {
		barColorClass = ENGAGEMENT_BAR_COLORS.high;
	}

	return (
		<div className="w-full bg-slate-700 rounded-full h-4 shadow-inner overflow-hidden relative">
			<div
				className={`h-full rounded-full ${barColorClass}`}
				style={{
					width: `${cappedPercentage}%`,
					transition: "width 0.5s ease-out",
				}}
				role="progressbar"
				aria-valuenow={cappedPercentage}
				aria-valuemin={0}
				aria-valuemax={100}
				aria-label={`Engagement: ${cappedPercentage}%`}
			/>
		</div>
	);
};
