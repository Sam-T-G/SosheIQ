import React, { useState } from "react";
import type { ScenarioDetails } from "../types";
import {
	SocialEnvironment,
	AIPersonalityTrait,
	AIGender,
	AIAgeBracket,
} from "../types";
import { PlayIcon, CogIcon, ArrowLeftIcon, TargetIcon } from "./Icons";

interface GuidedSetupProps {
	onStart: (details: ScenarioDetails) => void;
	onSwitchToAdvanced: () => void;
}

const MAX_STEPS = 6;
const MAX_PERSONALITY_TRAITS = 5;

// RETHOUGHT: New, simpler, and more diverse trait categories with Social Behavior at the top
const personalityCategories: { [key: string]: AIPersonalityTrait[] } = {
	"Social Behavior": [
		AIPersonalityTrait.CONFIDENT,
		AIPersonalityTrait.SHY,
		AIPersonalityTrait.FLIRTATIOUS,
		AIPersonalityTrait.GUARDED,
		AIPersonalityTrait.EMPATHETIC,
		AIPersonalityTrait.HUMBLE,
		AIPersonalityTrait.AMBITIOUS,
		AIPersonalityTrait.IMPULSIVE,
	],
	"Communication Style": [
		AIPersonalityTrait.TALKATIVE,
		AIPersonalityTrait.QUIET,
		AIPersonalityTrait.DIRECT,
		AIPersonalityTrait.SARCASTIC,
		AIPersonalityTrait.FORMAL,
		AIPersonalityTrait.INFORMAL,
		AIPersonalityTrait.WITTY,
		AIPersonalityTrait.ASSERTIVE,
	],
	"General Mood": [
		AIPersonalityTrait.CHEERFUL,
		AIPersonalityTrait.GRUMPY,
		AIPersonalityTrait.ANXIOUS,
		AIPersonalityTrait.CALM,
		AIPersonalityTrait.SERIOUS,
		AIPersonalityTrait.PLAYFUL,
		AIPersonalityTrait.SAD,
		AIPersonalityTrait.ENTHUSIASTIC,
	],
	"Attitude / Outlook": [
		AIPersonalityTrait.OPTIMISTIC,
		AIPersonalityTrait.PESSIMISTIC,
		AIPersonalityTrait.SUPPORTIVE,
		AIPersonalityTrait.CHALLENGING,
		AIPersonalityTrait.CURIOUS,
		AIPersonalityTrait.SKEPTICAL,
		AIPersonalityTrait.CREATIVE,
		AIPersonalityTrait.LOGICAL,
	],
};

const orderedPersonalityCategories = [
	"Social Behavior",
	"Communication Style",
	"General Mood",
	"Attitude / Outlook",
];

const guidedSocialEnvironments = [
	SocialEnvironment.CASUAL,
	SocialEnvironment.DATING,
	SocialEnvironment.WORK,
	SocialEnvironment.SOCIAL_GATHERING,
];

const initialScenario: Partial<ScenarioDetails> = {
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

	const handleStart = () => {
		const finalScenario: ScenarioDetails = {
			environment: scenario.environment || SocialEnvironment.CASUAL,
			aiGender: scenario.aiGender || AIGender.RANDOM,
			aiName: scenario.aiName?.trim() || "", // Name is now handled by index.tsx
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
							Let's get started.
						</h2>
						<p className="text-lg text-gray-400 mb-8">
							Choose a setup method to create your practice scenario.
						</p>
						<div className="flex flex-col gap-4 max-w-sm mx-auto">
							<button
								onClick={handleNext}
								className="w-full px-6 py-4 bg-green-600 text-white font-bold rounded-lg hover:bg-green-500 transition-all transform hover:scale-105 text-lg flex items-center justify-center gap-2">
								<PlayIcon className="h-5 w-5" />
								Start Guided Setup
							</button>
							<button
								onClick={onSwitchToAdvanced}
								className="w-full px-6 py-4 bg-sky-600 text-white font-bold rounded-lg hover:bg-sky-500 transition-all transform hover:scale-105 text-lg flex items-center justify-center gap-2">
								<CogIcon className="h-5 w-5" />
								Advanced Setup
							</button>
						</div>
					</div>
				);
			case 1:
				return (
					<div key={step} className={`${animationClass}`}>
						<h2 className="text-2xl font-semibold text-sky-300 mb-4">
							Where is this conversation taking place?
						</h2>
						<p className="text-sm text-gray-400 mb-6">
							Choose a common scenario, or create your own below.
						</p>

						<div className="grid grid-cols-2 md:grid-cols-4 gap-3">
							{guidedSocialEnvironments.map((env) => (
								<StepButton
									key={env}
									onClick={() => updateScenario({ environment: env })}
									isSelected={scenario.environment === env}>
									<span className="font-bold">{env}</span>
								</StepButton>
							))}
						</div>

						<div className="relative my-8">
							<div
								className="absolute inset-0 flex items-center"
								aria-hidden="true">
								<div className="w-full border-t border-slate-600"></div>
							</div>
							<div className="relative flex justify-center">
								<span className="bg-slate-800 px-3 text-sm font-medium text-gray-400">
									Or
								</span>
							</div>
						</div>

						<div
							role="button"
							tabIndex={0}
							onClick={() =>
								updateScenario({ environment: SocialEnvironment.CUSTOM })
							}
							onKeyPress={(e) => {
								if (e.key === "Enter" || e.key === " ") {
									e.preventDefault();
									updateScenario({ environment: SocialEnvironment.CUSTOM });
								}
							}}
							className={`w-full p-4 rounded-lg border-2 transition-all duration-300
								${
									scenario.environment === SocialEnvironment.CUSTOM
										? "bg-slate-700/70 border-teal-400 shadow-lg"
										: "bg-slate-700/40 border-slate-600 hover:border-sky-500 cursor-pointer"
								}`}>
							<h3 className="text-center text-lg font-bold text-teal-300">
								{SocialEnvironment.CUSTOM}
							</h3>

							{scenario.environment === SocialEnvironment.CUSTOM ? (
								<div className="mt-4 animate-fadeIn">
									<p className="text-sm text-center text-gray-400 mb-3">
										Describe a unique place or situation below.
									</p>
									<textarea
										value={scenario.customEnvironment || ""}
										onChange={(e) =>
											updateScenario({ customEnvironment: e.target.value })
										}
										onClick={(e) => e.stopPropagation()} // Prevent outer div's onClick from firing
										placeholder="e.g., A quiet library, a parent-teacher conference, on a ski lift..."
										className="w-full p-3 bg-slate-600 text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 min-h-[80px]"
										autoFocus
									/>
								</div>
							) : (
								<p className="text-sm text-center text-gray-400 mt-2">
									Click here to describe any situation you can imagine.
								</p>
							)}
						</div>
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
									<div className="mt-4 max-w-sm mx-auto">
										<input
											type="number"
											value={scenario.customAiAge || ""}
											onChange={(e) =>
												updateScenario({
													customAiAge:
														parseInt(e.target.value, 10) || undefined,
												})
											}
											placeholder="Enter age (13-100)"
											className="w-full p-3 bg-slate-600 text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
										/>
									</div>
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
									placeholder="e.g., Korean pop star, Italian grandmother"
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
							Describe them yourself, or choose up to {MAX_PERSONALITY_TRAITS}{" "}
							traits.
						</p>

						<div className="space-y-4">
							<textarea
								value={scenario.customAiPersonality || ""}
								onChange={(e) =>
									updateScenario({ customAiPersonality: e.target.value })
								}
								placeholder="Describe their personality or add unlisted traits here first..."
								className="w-full p-3 bg-slate-600 text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 mb-4"
							/>

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
					</div>
				);
			case 4:
				return (
					<div key={step} className={`${animationClass}`}>
						<h2 className="text-2xl font-semibold text-sky-300 mb-4 text-center">
							Any other specific context? (Optional)
						</h2>
						<p className="text-gray-400 mb-4 text-center">
							Add details to make the scenario more specific. This will
							influence the AI's behavior and dialogue.
						</p>
						<div className="max-w-lg mx-auto">
							<textarea
								value={scenario.customContext || ""}
								onChange={(e) =>
									updateScenario({ customContext: e.target.value })
								}
								placeholder="Provide background information here..."
								className="w-full p-3 bg-slate-600 text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 min-h-[120px]"
							/>
							<p className="text-xs text-gray-500 mt-2 text-left">
								<strong>Examples:</strong>
								<br />
								- "You've just met at a friend's party and find them
								attractive."
								<br />
								- "You need to ask your boss, who is known to be strict, for an
								extension on a deadline."
								<br />- "You're returning a faulty product to a customer service
								representative."
							</p>
						</div>
					</div>
				);
			case 5:
				return (
					<div key={step} className={`${animationClass}`}>
						<h2 className="text-2xl font-semibold text-sky-300 mb-6 text-center">
							Set the final details.
						</h2>
						<div className="space-y-6 max-w-lg mx-auto">
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
								<div className="mb-4 bg-teal-900/60 p-3 shadow-md border border-teal-800/50 rounded-md">
									<div className="flex items-start gap-3">
										<TargetIcon className="h-5 w-5 text-teal-300 flex-shrink-0 mt-0.5" />
										<div>
											<h4 className="text-sm font-semibold text-teal-300">
												Dynamic Goals
											</h4>
											<p className="text-xs text-teal-200">
												If you leave this blank, the AI will try to figure out a
												goal based on how the conversation goes.
											</p>
										</div>
									</div>
								</div>
								<input
									type="text"
									value={scenario.conversationGoal || ""}
									onChange={(e) =>
										updateScenario({ conversationGoal: e.target.value })
									}
									placeholder="What do you want to achieve?"
									className="w-full p-3 bg-slate-600 text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
								/>
								<p className="text-xs text-gray-500 mt-2 text-left">
									<strong>Examples:</strong>
									<br />
									- "Successfully ask for their phone number."
									<br />
									- "Convince my boss to give me a two-day extension."
									<br />- "Get a full refund for a faulty product."
								</p>
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
				{step > 0 && (
					<div className="relative h-1 bg-slate-700 rounded-full mb-8">
						<div
							className="absolute top-0 left-0 h-1 bg-teal-400 rounded-full transition-all duration-500"
							style={{
								width: `${((step - 1) / (MAX_STEPS - 1)) * 100}%`,
							}}></div>
					</div>
				)}
				<div className="min-h-[280px] md:min-h-[300px] px-2">
					{renderStepContent()}
				</div>
				{error && (
					<p className="text-red-400 text-sm mt-4 text-center animate-pulse">
						{error}
					</p>
				)}
			</div>

			<div className="flex-shrink-0 flex justify-between items-stretch mt-auto pt-4 border-t border-slate-700 gap-2 md:gap-4">
				<div className="flex-1 text-left">
					{step > 0 && step <= MAX_STEPS && (
						<button
							onClick={handleBack}
							className="w-full sm:w-auto px-6 py-4 bg-slate-600 text-white font-semibold text-base rounded-lg hover:bg-slate-500 flex items-center justify-center space-x-2 transition-colors">
							<ArrowLeftIcon className="h-5 w-5" />
							<span>Back</span>
						</button>
					)}
				</div>

				<div className="flex-1 text-right">
					{step > 0 && step < MAX_STEPS && (
						<button
							onClick={handleNext}
							className="w-full sm:w-auto px-8 py-4 bg-green-600 text-white font-bold text-base rounded-lg hover:bg-green-500 transition-colors">
							Next
						</button>
					)}
					{step === MAX_STEPS && (
						<button
							onClick={handleStart}
							className="w-full sm:w-auto px-8 py-4 bg-green-600 text-white font-bold text-base rounded-lg hover:bg-green-500 animate-pulse-glow flex items-center justify-center space-x-2 transition-transform hover:scale-105">
							<PlayIcon className="h-5 w-5" />
							<span>Start</span>
						</button>
					)}
				</div>
			</div>
		</div>
	);
};
