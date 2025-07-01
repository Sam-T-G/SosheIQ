import React from "react";
import { InfoIcon } from "./Icons";
import { SosheIQLogo } from "./SosheIQLogo"; // Import the new SVG Logo component

interface HeaderProps {
	onLogoClick: () => void;
	onToggleQuickTips: () => void;
}

export const Header: React.FC<HeaderProps> = ({
	onLogoClick,
	onToggleQuickTips,
}) => {
	return (
		<header className="bg-slate-800 shadow-md">
			{/* Increased vertical padding and reverted horizontal padding */}
			<div className="container mx-auto px-4 py-4 flex justify-between items-center">
				<div
					onClick={onLogoClick}
					role="button"
					tabIndex={0}
					aria-label="SosheIQ Logo - Go to Homepage"
					className="cursor-pointer">
					<SosheIQLogo className="h-10 w-auto" />
				</div>
				<button
					onClick={onToggleQuickTips}
					// Reverted responsive padding changes
					className="text-sky-300 hover:text-sky-100 font-medium py-2 px-3 rounded-md text-sm
                     bg-slate-700 hover:bg-slate-600 transition-colors duration-150 flex items-center space-x-1.5"
					aria-label="View Quick Tips">
					<InfoIcon className="h-5 w-5" />
					{/* Reverted hidden text on mobile */}
					<span>Quick Tips</span>
				</button>
			</div>
		</header>
	);
};
