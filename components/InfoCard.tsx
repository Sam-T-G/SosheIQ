import React from "react";

interface InfoCardProps {
	Icon: React.FC<{ className?: string }>;
	title: string;
	description: string;
	className?: string;
}

export const InfoCard: React.FC<InfoCardProps> = ({
	Icon,
	title,
	description,
	className = "",
}) => {
	return (
		<div
			className={`bg-slate-700/50 p-3 rounded-lg flex items-start gap-3 border border-slate-600/50 ${className}`}>
			<div className="flex-shrink-0 mt-1">
				<Icon className="h-5 w-5 text-sky-400" />
			</div>
			<div>
				<h4 className="font-semibold text-sm text-sky-300">{title}</h4>
				<p className="text-xs text-gray-300 italic">{description}</p>
			</div>
		</div>
	);
};
