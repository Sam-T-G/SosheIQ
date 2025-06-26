import React, { useState, useEffect } from "react";
import type { ScenarioDetails } from "../types";
import {
	SocialEnvironment,
	AIPersonalityTrait,
	PowerDynamic,
	AIGender,
	AIAgeBracket,
} from "../types";

interface GuidedSetupProps {
	onStart: (details: ScenarioDetails) => void;
	onSwitchToAdvanced: () => void;
}

const MAX_STEPS = 6;

const generateRandomAiName = (gender: AIGender): string => {
	const maleNames = ["David", "James", "Michael", "John", "Chris"];
	const femaleNames = ["Sarah", "Jennifer", "Emily", "Jessica", "Linda"];
	const neutralNames = ["Alex", "Jordan", "Taylor", "Casey", "Morgan"];
	let pool: string[];
	switch (gender) {
		case AIGender.MALE:
			pool = maleNames;
			break;
		case AIGender.FEMALE:
			pool = femaleNames;
			break;
		default:
			pool = neutralNames;
	}
	return pool[Math.floor(Math.random() * pool.length)];
};

const initialScenario: ScenarioDetails = {
	environment: SocialEnvironment.CASUAL,
	powerDynamic: PowerDynamic.PEERS_EQUAL_FOOTING,
	aiGender: AIGender.PREFER_NOT_TO_SPECIFY,
	aiName: "",
	aiAgeBracket: AIAgeBracket.NOT_SPECIFIED,
	aiPersonalityTraits: [],
};

const StepButton: React.FC<{
	onClick: () => void;
	isSelected: boolean;
	children: React.ReactNode;
	title?: string;
}> = ({ onClick, isSelected, children, title }) => (
	<button
		type="button"
		onClick={onClick}
		title={title}
		className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200
      ${
				isSelected
					? "bg-teal-500/20 border-teal-400 shadow-lg scale-105"
					: "bg-slate-700/60 border-slate-600 hover:border-sky-500 hover:bg-slate-700"
			}`}>
		{children}
	</button>
);

export const GuidedSetup: React.FC<GuidedSetupProps> = ({
	onStart,
	onSwitchToAdvanced,
}) => {
	const [step, setStep] = useState(0);
	const [scenario, setScenario] = useState<ScenarioDetails>(initialScenario);
	const [exiting, setExiting] = useState(false);
	const [isCustomEnv, setIsCustomEnv] = useState(false);

	const handleNext = () => {
		if (step < MAX_STEPS) {
			setExiting(true);
			setTimeout(() => {
				setStep(step + 1);
				setExiting(false);
			}, 350);
		}
	};

	const handleBack = () => {
		if (step > 0) {
			setExiting(true);
			setTimeout(() => {
				setStep(step - 1);
				setExiting(false);
			}, 350);
		}
	};

	const handleStart = () => {
		const finalScenario = { ...scenario };
		if (!finalScenario.aiName) {
			finalScenario.aiName = generateRandomAiName(finalScenario.aiGender);
		}
		if (finalScenario.environment !== SocialEnvironment.CUSTOM) {
			finalScenario.customEnvironment = undefined;
		}
		onStart(finalScenario);
	};

	const updateScenario = (updates: Partial<ScenarioDetails>) => {
		setScenario((prev) => ({ ...prev, ...updates }));
	};

	const renderStepContent = () => {
		const animationClass = exiting
			? "animate-slideOutToLeft"
			: "animate-slideInFromRight";

		switch (step) {
			case 0: // Welcome
				return (
					<div key={step} className={`${animationClass}`}>
						<h2 className="text-3xl font-bold text-teal-300 mb-4">
							Let's set up your practice session.
						</h2>
						<p className="text-lg text-gray-400">
							We'll configure the AI's persona and the scenario step-by-step.
						</p>
					</div>
				);

			case 1: // Environment
				return (
					<div key={step} className={`${animationClass}`}>
						<h2 className="text-2xl font-semibold text-sky-300 mb-6">
							First, where is this conversation taking place?
						</h2>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							{Object.values(SocialEnvironment).map((env) => (
								<StepButton
									key={env}
									onClick={() => {
										updateScenario({ environment: env });
										setIsCustomEnv(env === SocialEnvironment.CUSTOM);
										if (env !== SocialEnvironment.CUSTOM) {
											handleNext();
										}
									}}
									isSelected={scenario.environment === env}>
									<span className="font-bold text-lg">{env}</span>
								</StepButton>
							))}
						</div>
						{isCustomEnv &&
							scenario.environment === SocialEnvironment.CUSTOM && (
								<div className="mt-6 animate-fadeIn">
									<textarea
										value={scenario.customEnvironment || ""}
										onChange={(e) =>
											updateScenario({ customEnvironment: e.target.value })
										}
										placeholder="e.g., A quiet library, a noisy coffee shop during rush hour..."
										className="w-full p-3 bg-slate-600 text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
									/>
									<button
										onClick={handleNext}
										className="mt-4 px-6 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-500">
										Confirm & Next
									</button>
								</div>
							)}
					</div>
				);

			case 2: // AI Gender & Name
				return (
					<div key={step} className={`${animationClass}`}>
						<h2 className="text-2xl font-semibold text-sky-300 mb-6">
							Who are you talking to?
						</h2>
						<div className="space-y-4">
							<div>
								<h3 className="text-lg font-medium text-gray-300 mb-2">
									AI's Gender:
								</h3>
								<div className="flex flex-wrap gap-2">
									{Object.values(AIGender).map((g) => (
										<button
											key={g}
											onClick={() => updateScenario({ aiGender: g })}
											className={`px-4 py-2 rounded-lg ${
												scenario.aiGender === g
													? "bg-teal-500 text-white"
													: "bg-slate-700 hover:bg-slate-600"
											}`}>
											{g}
										</button>
									))}
								</div>
							</div>
							<div>
								<h3 className="text-lg font-medium text-gray-300 mb-2">
									AI's Name (Optional):
								</h3>
								<input
									type="text"
									value={scenario.aiName}
									onChange={(e) => updateScenario({ aiName: e.target.value })}
									placeholder={`e.g., ${generateRandomAiName(
										scenario.aiGender
									)} (or leave blank for random)`}
									className="w-full p-3 bg-slate-600 text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
								/>
							</div>
						</div>
					</div>
				);

			case 3: // AI Personality
				const selectedCount = scenario.aiPersonalityTraits.length;
				return (
					<div key={step} className={`${animationClass}`}>
						<h2 className="text-2xl font-semibold text-sky-300 mb-2">
							What's their personality like?
						</h2>
						<p className="text-gray-400 mb-4">Choose up to 3 traits.</p>
						<div className="flex flex-wrap gap-2">
							{Object.values(AIPersonalityTrait).map((p) => {
								const isSelected = scenario.aiPersonalityTraits.includes(p);
								return (
									<button
										key={p}
										onClick={() => {
											if (isSelected) {
												updateScenario({
													aiPersonalityTraits:
														scenario.aiPersonalityTraits.filter(
															(trait) => trait !== p
														),
												});
											} else if (selectedCount < 3) {
												updateScenario({
													aiPersonalityTraits: [
														...scenario.aiPersonalityTraits,
														p,
													],
												});
											}
										}}
										className={`px-3 py-1.5 rounded-full text-sm font-medium ${
											isSelected
												? "bg-teal-500 text-white"
												: "bg-slate-700 hover:bg-slate-600"
										} ${
											!isSelected && selectedCount >= 3
												? "opacity-50 cursor-not-allowed"
												: ""
										}`}>
										{p}
									</button>
								);
							})}
						</div>
					</div>
				);

			case 4: // AI Culture/Race & Goal
				return (
					<div key={step} className={`${animationClass}`}>
						<h2 className="text-2xl font-semibold text-sky-300 mb-6">
							Let's add some final details.
						</h2>
						<div className="space-y-6">
							<div>
								<h3 className="text-lg font-medium text-gray-300 mb-2">
									AI Culture/Race (Optional)
								</h3>
								<input
									type="text"
									value={scenario.aiCulture || ""}
									onChange={(e) =>
										updateScenario({ aiCulture: e.target.value })
									}
									placeholder="e.g., French artist, Brazilian programmer"
									className="w-full p-3 bg-slate-600 text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
								/>
								<p className="text-xs text-gray-400 mt-1">
									Adds nuance to persona and appearance. Leave blank for
									default.
								</p>
							</div>
							<div>
								<h3 className="text-lg font-medium text-gray-300 mb-2">
									Conversation Goal (Optional)
								</h3>
								<input
									type="text"
									value={scenario.conversationGoal || ""}
									onChange={(e) =>
										updateScenario({ conversationGoal: e.target.value })
									}
									placeholder="e.g., Ask for a date, negotiate a deal"
									className="w-full p-3 bg-slate-600 text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
								/>
								<p className="text-xs text-gray-400 mt-1">
									If set, your progress towards this goal will be tracked.
								</p>
							</div>
						</div>
					</div>
				);

			case 5: // Summary
				return (
					<div key={step} className={`${animationClass}`}>
						<h2 className="text-3xl font-bold text-teal-300 mb-6">
							Ready to go?
						</h2>
						<div className="p-4 bg-slate-700/50 rounded-lg space-y-2 text-gray-300">
							<p>
								<strong className="text-sky-400">Environment:</strong>{" "}
								{scenario.environment}
								{scenario.environment === SocialEnvironment.CUSTOM
									? ` (${scenario.customEnvironment})`
									: ""}
							</p>
							<p>
								<strong className="text-sky-400">AI Persona:</strong>{" "}
								{scenario.aiName || `Random ${scenario.aiGender}`} who is{" "}
								{scenario.aiPersonalityTraits.join(", ") || "neutral"}.
							</p>
							{scenario.aiCulture && (
								<p>
									<strong className="text-sky-400">Culture/Race:</strong>{" "}
									{scenario.aiCulture}
								</p>
							)}
							{scenario.conversationGoal && (
								<p>
									<strong className="text-sky-400">Your Goal:</strong>{" "}
									{scenario.conversationGoal}
								</p>
							)}
						</div>
						<p className="text-sm text-gray-500 mt-4">
							You can change these settings by going back, or start the
							interaction now.
						</p>
					</div>
				);

			case 6: // Hidden step for final button
				return <div></div>;

			default:
				return <div>Setup complete.</div>;
		}
	};

	return (
		<div className="w-full max-w-2xl p-6 md:p-10 bg-slate-800 rounded-xl shadow-2xl flex flex-col justify-between min-h-[50vh]">
			<div>
				<div className="relative h-1 bg-slate-700 rounded-full mb-8">
					<div
						className="absolute top-0 left-0 h-1 bg-teal-400 rounded-full transition-all duration-500"
						style={{ width: `${(step / MAX_STEPS) * 100}%` }}></div>
				</div>
				{renderStepContent()}
			</div>

			<div className="flex justify-between items-center mt-8 pt-4 border-t border-slate-700">
				<div>
					{step > 0 && step < MAX_STEPS && (
						<button
							onClick={handleBack}
							className="px-6 py-2 bg-slate-600 text-white font-bold rounded-lg hover:bg-slate-500">
							Back
						</button>
					)}
				</div>
				<div>
					{step < MAX_STEPS - 1 && !(isCustomEnv && step === 1) && (
						<button
							onClick={handleNext}
							className="px-6 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-500">
							Next
						</button>
					)}
					{step === MAX_STEPS - 1 && (
						<button
							onClick={handleStart}
							className="px-8 py-3 bg-green-600 text-white font-bold rounded-lg text-lg hover:bg-green-500 animate-pulse-glow">
							Start Interaction
						</button>
					)}
					<button
						onClick={onSwitchToAdvanced}
						className="ml-4 text-sm text-sky-400 hover:underline">
						Switch to Advanced Setup
					</button>
				</div>
			</div>
		</div>
	);
};
