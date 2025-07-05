import React, { useState } from "react";
import Head from "next/head";
import { LoadingIndicator } from "../components/LoadingIndicator";

const LoadingDemo: React.FC = () => {
	const [currentMessage, setCurrentMessage] = useState("Loading...");
	const [isVisible, setIsVisible] = useState(true);

	const messages = [
		"Loading...",
		"Generating analysis...",
		"Conjuring a scenario...",
		"Loading scenario...",
		"Preparing your experience...",
		"Awakening AI consciousness...",
		"Calibrating personality matrix...",
		"Optimizing conversation algorithms...",
		"Loading neural networks...",
	];

	const handleToggleVisibility = () => {
		setIsVisible(!isVisible);
	};

	const handleMessageChange = (message: string) => {
		setCurrentMessage(message);
	};

	const handleRestart = () => {
		setIsVisible(false);
		setTimeout(() => {
			setIsVisible(true);
		}, 100);
	};

	return (
		<>
			<Head>
				<title>Loading Animation Demo - SosheIQ</title>
				<meta
					name="description"
					content="Demo page for testing loading animations"
				/>
			</Head>

			{/* Control Panel */}
			<div className="fixed top-4 left-4 z-[10001] bg-slate-800 p-4 rounded-lg shadow-lg border border-slate-600">
				<h2 className="text-white font-bold mb-3">Animation Controls</h2>

				<div className="space-y-3">
					<button
						onClick={handleToggleVisibility}
						className="w-full bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded text-sm">
						{isVisible ? "Hide" : "Show"} Loading Screen
					</button>

					<button
						onClick={handleRestart}
						className="w-full bg-green-600 hover:bg-green-500 text-white px-3 py-2 rounded text-sm">
						Restart Animation
					</button>

					<div className="border-t border-slate-600 pt-3">
						<label className="text-white text-sm font-medium mb-2 block">
							Message:
						</label>
						<select
							value={currentMessage}
							onChange={(e) => handleMessageChange(e.target.value)}
							className="w-full bg-slate-700 text-white px-2 py-1 rounded text-sm border border-slate-600">
							{messages.map((msg) => (
								<option key={msg} value={msg}>
									{msg}
								</option>
							))}
						</select>
					</div>

					<div className="border-t border-slate-600 pt-3">
						<label className="text-white text-sm font-medium mb-2 block">
							Quick Tests:
						</label>
						<div className="grid grid-cols-2 gap-2">
							<button
								onClick={() => handleMessageChange("Loading...")}
								className="bg-purple-600 hover:bg-purple-500 text-white px-2 py-1 rounded text-xs">
								Default
							</button>
							<button
								onClick={() => handleMessageChange("Conjuring a scenario...")}
								className="bg-orange-600 hover:bg-orange-500 text-white px-2 py-1 rounded text-xs">
								Scenario
							</button>
							<button
								onClick={() => handleMessageChange("Generating analysis...")}
								className="bg-red-600 hover:bg-red-500 text-white px-2 py-1 rounded text-xs">
								Analysis
							</button>
							<button
								onClick={() =>
									handleMessageChange("Awakening AI consciousness...")
								}
								className="bg-cyan-600 hover:bg-cyan-500 text-white px-2 py-1 rounded text-xs">
								AI Mode
							</button>
						</div>
					</div>
				</div>
			</div>

			{/* Info Panel */}
			<div className="fixed top-4 right-4 z-[10001] bg-slate-800 p-4 rounded-lg shadow-lg border border-slate-600 max-w-xs">
				<h3 className="text-white font-bold mb-2">Animation Features</h3>
				<ul className="text-slate-300 text-sm space-y-1">
					<li>• Floating particles (12 animated)</li>
					<li>• Breathing logo animation</li>
					<li>• Pulsing text effects</li>
					<li>• Orbital elements</li>
					<li>• Persistent loading dots</li>
					<li>• Enhanced glow effects</li>
					<li>• Motion React physics</li>
					<li>• Black background theme</li>
					<li>• Enhanced fade in/out</li>
					<li>• Footer hidden during loading</li>
				</ul>

				<div className="mt-3 pt-2 border-t border-slate-600">
					<p className="text-xs text-slate-400">
						💡 Demo URL:{" "}
						<code className="text-teal-300">localhost:3001/loading-demo</code>
					</p>
				</div>
			</div>

			{/* Background for better contrast */}
			<div className="fixed inset-0 bg-black z-0" />

			{/* Loading Screen */}
			{isVisible && (
				<LoadingIndicator message={currentMessage} extraClasses="z-[10000]" />
			)}
		</>
	);
};

export default LoadingDemo;
