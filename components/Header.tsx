import React, { useState, useRef, useEffect } from "react";
import { SosheIQLogo } from "./SosheIQLogo";
import { useAuth } from "../contexts/AuthContext";
import { ChevronDownIcon, UserIcon, ArrowRightIcon } from "./Icons";

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
	const { status, user, logout } = useAuth();
	const [showUserMenu, setShowUserMenu] = useState(false);
	const menuRef = useRef<HTMLDivElement>(null);

	// Close menu when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
				setShowUserMenu(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	const handleLogout = async () => {
		try {
			await logout();
			setShowUserMenu(false);
		} catch (error) {
			console.error("Logout failed:", error);
		}
	};

	const renderAuthSection = () => {
		if (status === "loading") {
			return (
				<div className="flex items-center space-x-6">
					<button
						onClick={onNavigateToAbout}
						className="text-sm font-semibold text-gray-300 hover:text-white transition-colors"
						aria-label="About SosheIQ">
						About
					</button>
					<div className="text-sm text-gray-400">Loading...</div>
				</div>
			);
		}

		if (status === "guest" || status === "authenticated") {
			return (
				<div className="flex items-center space-x-6">
					<button
						onClick={onNavigateToAbout}
						className="text-sm font-semibold text-gray-300 hover:text-white transition-colors"
						aria-label="About SosheIQ">
						About
					</button>

					{/* User Profile Dropdown */}
					<div className="relative" ref={menuRef}>
						<button
							onClick={() => setShowUserMenu(!showUserMenu)}
							className="flex items-center space-x-2 text-sm font-semibold text-white bg-slate-700 hover:bg-slate-600 px-3 py-2 rounded-md transition-all duration-200 shadow-lg hover:shadow-xl"
							aria-label="User menu">
							<UserIcon className="h-4 w-4" />
							<span className="hidden sm:block">{user?.name || "User"}</span>
							{status === "guest" && (
								<span className="hidden sm:block text-xs text-gray-300">
									(Guest)
								</span>
							)}
							<ChevronDownIcon className="h-4 w-4" />
						</button>

						{showUserMenu && (
							<div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-md shadow-lg z-50">
								<div className="py-1">
									<div className="px-4 py-2 border-b border-slate-700">
										<p className="text-sm font-medium text-white">
											{user?.name || "User"}
										</p>
										<p className="text-xs text-gray-400">
											{status === "guest"
												? "Guest User"
												: user?.email || "Authenticated"}
										</p>
									</div>
									<button
										onClick={handleLogout}
										className="w-full flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-slate-700 hover:text-white transition-colors">
										<ArrowRightIcon className="h-4 w-4 mr-2" />
										Sign Out
									</button>
								</div>
							</div>
						)}
					</div>
				</div>
			);
		}

		// Unauthenticated state
		return (
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
					Sign In
				</button>
			</div>
		);
	};

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
				{renderAuthSection()}
			</div>
		</header>
	);
};
