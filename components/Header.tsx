import React from "react";
import { SosheIQLogo } from "./SosheIQLogo";

interface HeaderProps {
	onLogoClick: () => void;
	onNavigateToAbout: () => void;
	onNavigateToLogin: () => void;
}

export const Header: React.FC<HeaderProps> = ({
	onLogoClick,
	onNavigateToAbout,
	onNavigateToLogin,
}) => {
	return (
		<header className="bg-slate-800 shadow-md">
			<div className="container mx-auto px-4 py-4 flex justify-between items-center">
				<div
					onClick={onLogoClick}
					role="button"
					tabIndex={0}
					aria-label="SosheIQ Logo - Go to Homepage"
					className="cursor-pointer">
					<SosheIQLogo className="h-10 w-auto" />
				</div>
				<div className="flex items-center space-x-6">
					<button
						onClick={onNavigateToAbout}
						className="text-sm font-semibold text-gray-300 hover:text-white transition-colors"
						aria-label="About SosheIQ">
						About
					</button>
					<button
						onClick={onNavigateToLogin}
						className="text-sm font-semibold text-white bg-sky-600 hover:bg-sky-500 px-4 py-2 rounded-md transition-all duration-200 shadow-lg hover:shadow-xl"
						aria-label="Login">
						Login
					</button>
				</div>
			</div>
		</header>
	);
};
