import React, { useState } from "react";
import type { ScenarioDetails } from "../types";
import {
	SocialEnvironment,
	AIPersonalityTrait,
	AIGender,
	AIAgeBracket,
} from "../types";
import { PlayIcon, CogIcon, ArrowLeftIcon } from "./Icons";

interface GuidedSetupProps {
	onStart: (details: ScenarioDetails) => void;
	onSwitchToAdvanced: () => void;
}

const MAX_STEPS = 6;
const MAX_PERSONALITY_TRAITS = 5;

// Expanded list of categorized personality traits
const personalityCategories: { [key: string]: AIPersonalityTrait[] } = {
	"Social Style": [
		AIPersonalityTrait.INTROVERTED,
		AIPersonalityTrait.OUTGOING,
		AIPersonalityTrait.RESERVED,
		AIPersonalityTrait.SOCIABLE,
		AIPersonalityTrait.FLIRTATIOUS,
		AIPersonalityTrait.FORMAL,
		AIPersonalityTrait.INFORMAL,
		AIPersonalityTrait.GUARDED,
	],
	"Emotional Tone": [
		AIPersonalityTrait.ANXIOUS,
		AIPersonalityTrait.CYNICAL,
		AIPersonalityTrait.HAPPY,
		AIPersonalityTrait.SAD,
		AIPersonalityTrait.IRRITABLE,
		AIPersonalityTrait.EMPATHETIC,
		AIPersonalityTrait.CALM,
		AIPersonalityTrait.PLAYFUL,
		AIPersonalityTrait.SERIOUS,
		AIPersonalityTrait.ENTHUSIASTIC,
	],
	"Intellectual Style": [
		AIPersonalityTrait.PHILOSOPHICAL,
		AIPersonalityTrait.ACADEMIC,
		AIPersonalityTrait.INQUISITIVE,
		AIPersonalityTrait.NAIVE,
		AIPersonalityTrait.EXPERIENCED,
		AIPersonalityTrait.ANALYTICAL,
		AIPersonalityTrait.CURIOUS,
		AIPersonalityTrait.CREATIVE,
		AIPersonalityTrait.LOGICAL,
		AIPersonalityTrait.IMAGINATIVE,
	],
	"Core Traits": [
		AIPersonalityTrait.CONFIDENT,
		AIPersonalityTrait.SHY,
		AIPersonalityTrait.AMBITIOUS,
		AIPersonalityTrait.HUMBLE,
		AIPersonalityTrait.UNCONVENTIONAL,
		AIPersonalityTrait.UNEMOTIONAL,
		AIPersonalityTrait.IMPULSIVE,
		AIPersonalityTrait.SUPPORTIVE,
		AIPersonalityTrait.ASSERTIVE,
		AIPersonalityTrait.DIRECT,
		AIPersonalityTrait.SARCASTIC,
		AIPersonalityTrait.WITTY,
		AIPersonalityTrait.CHALLENGING,
		AIPersonalityTrait.SKEPTICAL,
		AIPersonalityTrait.OPTIMISTIC,
		AIPersonalityTrait.PESSIMISTIC,
	],
};

// Define the desired display order for categories
const orderedPersonalityCategories = [
	"Social Style",
	"Core Traits",
	"Emotional Tone",
	"Intellectual Style",
];

const generateRandomAiName = (gender: AIGender): string => {
	const maleNames = [
		"David",
		"James",
		"Michael",
		"John",
		"Chris",
		"Ryan",
		"Daniel",
	];
	const femaleNames = [
		"Sarah",
		"Jennifer",
		"Emily",
		"Jessica",
		"Linda",
		"Ava",
		"Grace",
	];
	const neutralNames = [
		"Alex",
		"Jordan",
		"Taylor",
		"Casey",
		"Morgan",
		"Riley",
		"Kai",
	];
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

const initialScenario: Omit<ScenarioDetails, "aiName"> & { aiName: string } = {
	environment: SocialEnvironment.CASUAL,
	aiGender: AIGender.RANDOM,
	aiName: "",
	aiAgeBracket: AIAgeBracket.NOT_SPECIFIED,
	aiPersonalityTraits: [],
};

const StepButton: React.FC<{
	onClick: () => void;
	isSelected: boolean;
	children: React.ReactNode;
	title?: string;
	className?: string;
}> = ({ onClick, isSelected, children, title, className = "" }) => (
	<button
		type="button"
		onClick={onClick}
		title={title}
		className={`w-full text-left p-3 md:p-4 rounded-lg border-2 transition-all duration-200 text-gray-200 text-sm md:text-base
      ${
				isSelected
					? "bg-teal-500/20 border-teal-400 shadow-lg"
					: "bg-slate-700/60 border-slate-600 hover:border-sky-500 hover:bg-slate-700"
			} ${className}`}>
		{children}
	</button>
);

export const GuidedSetup: React.FC<GuidedSetupProps> = ({
	onStart,
	onSwitchToAdvanced,
}) => {
	const [step, setStep] = useState(0);
	const [scenario, setScenario] =
		useState<Partial<ScenarioDetails>>(initialScenario);
	const [exiting, setExiting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleNext = () => {
		setError(null);
		// Validation logic
		if (
			step === 1 &&
			scenario.environment === SocialEnvironment.CUSTOM &&
			!scenario.customEnvironment?.trim()
		) {
			setError("Please describe the custom environment before continuing.");
			return;
		}
		if (
			step === 2 &&
			scenario.aiAgeBracket === AIAgeBracket.CUSTOM &&
			(!scenario.customAiAge ||
				scenario.customAiAge < 13 ||
				scenario.customAiAge > 100)
		) {
			setError("Please enter a valid age between 13 and 100.");
			return;
		}
		if (
			step === 3 &&
			(!scenario.aiPersonalityTraits ||
				scenario.aiPersonalityTraits.length === 0) &&
			!scenario.customAiPersonality?.trim()
		) {
			setError(
				"Please select at least one personality trait or provide a custom description."
			);
			return;
		}

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
			setError(null);
			setTimeout(() => {
				setStep(step - 1);
				setExiting(false);
			}, 350);
		}
	};

	const randomizeAndStart = () => {
		const environments = Object.values(SocialEnvironment).filter(
			(e) => e !== SocialEnvironment.CUSTOM
		);
		const genders = Object.values(AIGender);
		const ageBrackets = Object.values(AIAgeBracket).filter(
			(a) => a !== AIAgeBracket.CUSTOM && a !== AIAgeBracket.NOT_SPECIFIED
		);
		const personalityTraits = Object.values(AIPersonalityTrait);

		const randomGender = genders[Math.floor(Math.random() * genders.length)];
		const numTraits = Math.floor(Math.random() * 3) + 1; // 1 to 3 traits
		const randomTraits = [...personalityTraits]
			.sort(() => 0.5 - Math.random())
			.slice(0, numTraits);

		const randomScenario: ScenarioDetails = {
			environment:
				environments[Math.floor(Math.random() * environments.length)],
			aiGender: randomGender,
			aiName: generateRandomAiName(randomGender),
			aiAgeBracket: ageBrackets[Math.floor(Math.random() * ageBrackets.length)],
			aiPersonalityTraits: randomTraits,
		};
		onStart(randomScenario);
	};

	const handleStart = () => {
		const finalScenario: ScenarioDetails = {
			environment: scenario.environment || SocialEnvironment.CASUAL,
			aiGender: scenario.aiGender || AIGender.RANDOM,
			aiName:
				scenario.aiName?.trim() ||
				generateRandomAiName(scenario.aiGender || AIGender.RANDOM),
			aiPersonalityTraits: scenario.aiPersonalityTraits || [],
			// carry over optional fields
			customEnvironment: scenario.customEnvironment,
			aiCulture: scenario.aiCulture,
			customAiPersonality: scenario.customAiPersonality,
			aiAgeBracket: scenario.aiAgeBracket,
			customAiAge: scenario.customAiAge,
			customContext: scenario.customContext,
			conversationGoal: scenario.conversationGoal,
		};

		if (finalScenario.environment !== SocialEnvironment.CUSTOM) {
			finalScenario.customEnvironment = undefined;
		}

		onStart(finalScenario);
	};

	const updateScenario = (updates: Partial<ScenarioDetails>) => {
		setScenario((prev) => ({ ...prev, ...updates }));
		setError(null);
	};

	const renderStepContent = () => {
		const animationClass = exiting
			? "animate-slideOutToLeft"
			: "animate-slideInFromRight";

		switch (step) {
			case 0:
				return (
					<div key={step} className={`${animationClass} text-center`}>
						<h2 className="text-3xl font-bold text-teal-300 mb-4">
							Let's set up your practice session.
						</h2>
						<p className="text-lg text-gray-400 mb-8">
							Configure the AI step-by-step or jump right in.
						</p>
						<div className="flex flex-col gap-4 max-w-xs mx-auto sm:flex-row sm:max-w-full">
							<button
								onClick={handleNext}
								className="w-full px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-500 transition-all transform hover:scale-105 text-lg">
								Start
							</button>
							<button
								onClick={randomizeAndStart}
								className="w-full px-6 py-3 bg-sky-600 text-white font-bold rounded-lg hover:bg-sky-500 transition-all transform hover:scale-105">
								Random Scenario
							</button>
						</div>
					</div>
				);
			case 1:
				return (
					<div key={step} className={`${animationClass}`}>
						<h2 className="text-2xl font-semibold text-sky-300 mb-6">
							Where is this conversation taking place?
						</h2>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
							{Object.values(SocialEnvironment).map((env) => (
								<StepButton
									key={env}
									onClick={() => updateScenario({ environment: env })}
									isSelected={scenario.environment === env}>
									<span className="font-bold">{env}</span>
								</StepButton>
							))}
						</div>
						{scenario.environment === SocialEnvironment.CUSTOM && (
							<div className="mt-6 animate-fadeIn">
								<textarea
									value={scenario.customEnvironment || ""}
									onChange={(e) =>
										updateScenario({ customEnvironment: e.target.value })
									}
									placeholder="e.g., A quiet library, a noisy coffee shop during rush hour..."
									className="w-full p-3 bg-slate-600 text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
								/>
							</div>
						)}
					</div>
				);

			case 2:
				const ageBrackets = Object.values(AIAgeBracket).filter(
					(age) => age !== AIAgeBracket.CUSTOM
				);
				return (
					<div key={step} className={`${animationClass}`}>
						<h2 className="text-2xl font-semibold text-sky-300 mb-6">
							Who are you talking to?
						</h2>
						<div className="space-y-6">
							<div>
								<h3 className="text-lg font-medium text-gray-300 mb-3">
									Gender:
								</h3>
								<div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
									{Object.values(AIGender).map((g) => (
										<button
											key={g}
											onClick={() => updateScenario({ aiGender: g })}
											className={`flex items-center justify-center text-center px-4 py-2 rounded-lg text-sm transition-colors ${
												scenario.aiGender === g
													? "bg-teal-500 text-white shadow-md"
													: "bg-slate-700 hover:bg-slate-600"
											}`}>
											{g}
										</button>
									))}
								</div>
							</div>
							<div>
								<h3 className="text-lg font-medium text-gray-300 mb-3">
									Age Bracket:
								</h3>
								<div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
									{ageBrackets.map((age) => (
										<button
											key={age}
											onClick={() =>
												updateScenario({
													aiAgeBracket: age,
													customAiAge: undefined,
												})
											}
											className={`flex items-center justify-center text-center px-3 py-2 rounded-lg text-xs md:text-sm transition-colors ${
												scenario.aiAgeBracket === age
													? "bg-teal-500 text-white shadow-md"
													: "bg-slate-700 hover:bg-slate-600"
											}`}>
											{age}
										</button>
									))}
									<button
										onClick={() =>
											updateScenario({ aiAgeBracket: AIAgeBracket.CUSTOM })
										}
										className={`flex items-center justify-center text-center px-3 py-2 rounded-lg text-xs md:text-sm transition-colors ${
											scenario.aiAgeBracket === AIAgeBracket.CUSTOM
												? "bg-teal-500 text-white shadow-md"
												: "bg-slate-700 hover:bg-slate-600"
										}`}>
										Custom
									</button>
								</div>
								{scenario.aiAgeBracket === AIAgeBracket.CUSTOM && (
									<input
										type="number"
										value={scenario.customAiAge || ""}
										onChange={(e) =>
											updateScenario({
												customAiAge: parseInt(e.target.value, 10) || undefined,
											})
										}
										placeholder="Enter age (13-100)"
										className="mt-3 w-full p-3 bg-slate-600 text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
									/>
								)}
							</div>
							<div>
								<h3 className="text-lg font-medium text-gray-300 mb-3">
									Culture/Race (Optional):
								</h3>
								<input
									type="text"
									value={scenario.aiCulture || ""}
									onChange={(e) =>
										updateScenario({ aiCulture: e.target.value })
									}
									placeholder="e.g., Japanese salaryman, Italian grandmother"
									className="w-full p-3 bg-slate-600 text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
								/>
							</div>
						</div>
					</div>
				);

			case 3:
				const selectedCount = scenario.aiPersonalityTraits?.length || 0;
				return (
					<div key={step} className={`${animationClass}`}>
						<h2 className="text-2xl font-semibold text-sky-300 mb-2">
							What's their personality like?
						</h2>
						<p className="text-gray-400 mb-4">
							Choose up to {MAX_PERSONALITY_TRAITS} traits, or describe them
							yourself.
						</p>

						<div className="space-y-4">
							{orderedPersonalityCategories.map((category) => (
								<div key={category}>
									<h3 className="text-md font-semibold text-teal-300 mb-2 border-b border-slate-600 pb-1">
										{category}
									</h3>
									<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
										{personalityCategories[category].map((p) => {
											const isSelected =
												scenario.aiPersonalityTraits?.includes(p);
											return (
												<button
													key={p}
													onClick={() => {
														const currentTraits =
															scenario.aiPersonalityTraits || [];
														if (isSelected) {
															updateScenario({
																aiPersonalityTraits: currentTraits.filter(
																	(trait) => trait !== p
																),
															});
														} else if (selectedCount < MAX_PERSONALITY_TRAITS) {
															updateScenario({
																aiPersonalityTraits: [...currentTraits, p],
															});
														}
													}}
													className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
														isSelected
															? "bg-teal-500 text-white ring-2 ring-teal-300"
															: "bg-slate-700 hover:bg-slate-600"
													} ${
														!isSelected &&
														selectedCount >= MAX_PERSONALITY_TRAITS
															? "opacity-50 cursor-not-allowed"
															: ""
													}`}>
													{p}
												</button>
											);
										})}
									</div>
								</div>
							))}
						</div>

						<textarea
							value={scenario.customAiPersonality || ""}
							onChange={(e) =>
								updateScenario({ customAiPersonality: e.target.value })
							}
							placeholder="You can also add unlisted traits or a detailed description here."
							className="w-full p-3 bg-slate-600 text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 mt-6"
						/>
					</div>
				);
			case 4:
				return (
					<div key={step} className={`${animationClass}`}>
						<h2 className="text-2xl font-semibold text-sky-300 mb-6">
							Any other specific context? (Optional)
						</h2>
						<p className="text-gray-400 mb-4">
							Add details to make the scenario more specific. This will
							influence the AI's behavior and dialogue.
						</p>
						<textarea
							value={scenario.customContext || ""}
							onChange={(e) =>
								updateScenario({ customContext: e.target.value })
							}
							placeholder="e.g., You've just met at a friend's party. You both applied for the same job..."
							className="w-full p-3 bg-slate-600 text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 min-h-[120px]"
						/>
					</div>
				);
			case 5:
				return (
					<div key={step} className={`${animationClass}`}>
						<h2 className="text-2xl font-semibold text-sky-300 mb-6">
							Set the final details.
						</h2>
						<div className="space-y-6">
							<div>
								<h3 className="text-lg font-medium text-gray-300 mb-2">
									AI's Name (Optional):
								</h3>
								<input
									type="text"
									value={scenario.aiName || ""}
									onChange={(e) => updateScenario({ aiName: e.target.value })}
									placeholder="Leave blank for a random name"
									className="w-full p-3 bg-slate-600 text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
								/>
							</div>
							<div>
								<h3 className="text-lg font-medium text-gray-300 mb-2">
									Conversation Goal (Optional):
								</h3>
								<input
									type="text"
									value={scenario.conversationGoal || ""}
									onChange={(e) =>
										updateScenario({ conversationGoal: e.target.value })
									}
									placeholder="e.g., Ask for a date, get a job"
									className="w-full p-3 bg-slate-600 text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
								/>
							</div>
						</div>
					</div>
				);

			case 6:
				const { aiAgeBracket } = scenario;
				let ageText: string;
				if (scenario.customAiAge) {
					ageText = `${scenario.customAiAge} year old`;
				} else if (
					aiAgeBracket &&
					aiAgeBracket !== AIAgeBracket.NOT_SPECIFIED &&
					aiAgeBracket !== AIAgeBracket.CUSTOM
				) {
					ageText = aiAgeBracket.toLowerCase();
				} else {
					ageText = "person";
				}

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
								<strong className="text-sky-400">AI Persona:</strong> A{" "}
								{ageText} {scenario.aiGender?.toLowerCase()} who is{" "}
								{scenario.aiPersonalityTraits?.join(", ") || "neutral"}.
							</p>
							{scenario.customContext && (
								<p>
									<strong className="text-sky-400">Custom Context:</strong>{" "}
									{scenario.customContext}
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
							You can change these settings by going back.
						</p>
					</div>
				);

			default:
				return <div>Setup complete.</div>;
		}
	};

	return (
		<div className="w-full max-w-2xl p-4 md:p-8 bg-slate-800 rounded-xl shadow-2xl flex flex-col justify-between h-[85vh] md:h-auto md:min-h-[70vh]">
			<div className="flex-grow overflow-y-auto custom-scrollbar pr-2 -mr-2">
				<div className="relative h-1 bg-slate-700 rounded-full mb-8">
					<div
						className="absolute top-0 left-0 h-1 bg-teal-400 rounded-full transition-all duration-500"
						style={{ width: `${(step / MAX_STEPS) * 100}%` }}></div>
				</div>
				<div className="min-h-[280px] md:min-h-[300px] px-2">
					{renderStepContent()}
				</div>
				{error && (
					<p className="text-red-400 text-sm mt-4 text-center animate-pulse">
						{error}
					</p>
				)}
			</div>

			<div className="flex-shrink-0 flex justify-between items-center mt-auto pt-4 border-t border-slate-700 gap-2 md:gap-4">
				<div className="flex-1 text-left">
					{step > 0 && step <= MAX_STEPS && (
						<button
							onClick={handleBack}
							className="w-full sm:w-auto px-6 py-3 bg-slate-600 text-white font-bold rounded-lg hover:bg-slate-500 flex items-center justify-center space-x-2 transition-colors">
							<ArrowLeftIcon className="h-5 w-5" />
							<span className="hidden sm:inline">Back</span>
						</button>
					)}
				</div>

				<div className="flex-shrink-0">
					{step > 0 && (
						<button
							onClick={onSwitchToAdvanced}
							className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg text-sm shadow-md transition-all flex items-center justify-center space-x-2">
							<CogIcon />
							<span className="hidden sm:inline">Advanced</span>
						</button>
					)}
				</div>

				<div className="flex-1 text-right">
					{step > 0 && step < MAX_STEPS && (
						<button
							onClick={handleNext}
							className="w-full sm:w-auto px-8 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-500 transition-colors">
							Next
						</button>
					)}
					{step === MAX_STEPS && (
						<button
							onClick={handleStart}
							className="w-full sm:w-auto px-8 py-3 bg-green-600 text-white font-bold rounded-lg text-lg hover:bg-green-500 animate-pulse-glow flex items-center justify-center space-x-2 transition-transform hover:scale-105">
							<PlayIcon className="h-5 w-5" />
							<span>Start</span>
						</button>
					)}
				</div>
			</div>
		</div>
	);
};
