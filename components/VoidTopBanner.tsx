import React, { useState, useEffect } from "react";
import type { ActiveAction } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface VoidTopBannerProps {
	activeAction: ActiveAction | null;
	isActionPaused: boolean;
	displayedGoal: { text: string; progress: number } | null;
	isPinnable: boolean; // Kept for compatibility, though pinning might be auto-handled
	isGoalPinned: boolean;
	onPinGoal: (goalText: string) => void;
	onUnpinGoal: () => void;
	onFastForwardAction: () => void;
	isLoadingAI: boolean;
	goalJustChanged: boolean;
}

export const VoidTopBanner: React.FC<VoidTopBannerProps> = ({
	activeAction,
	isActionPaused,
	displayedGoal,
	onFastForwardAction,
	isLoadingAI,
}) => {
	// We only show one at a time in the void, prioritizing Action over Goal if both exist?
	// Or maybe side-by-side if space permits. Let's stack them top-right for a HUD feel.

	return (
		<div className="absolute top-0 left-0 w-full pointer-events-none z-30 p-4 flex flex-col items-end gap-2">
			<AnimatePresence>
				{activeAction && (
					<motion.div
						initial={{ opacity: 0, x: 20 }}
						animate={{ opacity: 1, x: 0 }}
						exit={{ opacity: 0, x: 20 }}
						className="pointer-events-auto bg-black/80 backdrop-blur-md border-l-2 border-cyan-500 pl-3 pr-4 py-2 max-w-xs md:max-w-md shadow-[0_0_15px_rgba(6,182,212,0.1)]">
						<div className="flex items-center justify-between gap-4">
							<div>
								<div className="flex items-center gap-2">
									<span className="text-[10px] font-mono uppercase tracking-widest text-cyan-600">
										Active Protocol
									</span>
									{isActionPaused && (
										<span className="text-[10px] font-mono uppercase text-red-500 animate-pulse">
											[PAUSED]
										</span>
									)}
								</div>
								<p className="text-xs font-mono text-cyan-100 leading-tight mt-0.5">
									{activeAction.description}
								</p>
							</div>
							<div className="flex items-center gap-3">
								<span className="font-mono text-cyan-400 text-xs">
									{activeAction.progress}%
								</span>
								<button
									onClick={onFastForwardAction}
									disabled={isLoadingAI}
									className="group p-1 hover:bg-cyan-900/30 rounded transition-colors"
									title="Fast Forward">
									<svg
										className="w-4 h-4 text-cyan-700 group-hover:text-cyan-400 transition-colors"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor">
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M13 10V3L4 14h7v7l9-11h-7z"
										/>
									</svg>
								</button>
							</div>
						</div>
						{/* Progress Bar Line */}
						<div className="w-full h-[2px] bg-gray-900 mt-2 relative overflow-hidden">
							<motion.div
								className="absolute top-0 left-0 h-full bg-cyan-500"
								initial={{ width: 0 }}
								animate={{ width: `${activeAction.progress}%` }}
								transition={{ duration: 0.5, ease: "easeInOut" }}
							/>
						</div>
					</motion.div>
				)}

				{displayedGoal && !activeAction && (
					<motion.div
						initial={{ opacity: 0, x: 20 }}
						animate={{ opacity: 1, x: 0 }}
						exit={{ opacity: 0, x: 20 }}
						className="pointer-events-auto bg-black/80 backdrop-blur-md border-l-2 border-emerald-500 pl-3 pr-4 py-2 max-w-xs md:max-w-md shadow-[0_0_15px_rgba(16,185,129,0.1)]">
						<div className="flex items-center justify-between gap-4">
							<div>
								<span className="text-[10px] font-mono uppercase tracking-widest text-emerald-700">
									Objective
								</span>
								<p className="text-xs font-mono text-emerald-100 leading-tight mt-0.5">
									{displayedGoal.text}
								</p>
							</div>
							<span className="font-mono text-emerald-400 text-xs">
								{displayedGoal.progress}%
							</span>
						</div>
						{/* Progress Bar Line */}
						<div className="w-full h-[2px] bg-gray-900 mt-2 relative overflow-hidden">
							<motion.div
								className="absolute top-0 left-0 h-full bg-emerald-500"
								initial={{ width: 0 }}
								animate={{ width: `${displayedGoal.progress}%` }}
								transition={{ duration: 0.5, ease: "easeInOut" }}
							/>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
};
