import React, { useState } from "react";
import type { ScenarioDetails } from "../types";
import {
	SocialEnvironment,
	AIPersonalityTrait,
	AIGender,
	AIAgeBracket,
} from "../types";
import {
	PlayIcon,
	CogIcon,
	ArrowLeftIcon,
	TargetIcon,
	BriefcaseIcon,
	CoffeeIcon,
	UsersIcon,
	InfoIcon,
	FastForwardIcon,
	HeartIcon,
} from "./Icons";
import { InfoCard } from "./InfoCard";

interface GuidedSetupProps {
	onStart: (details: ScenarioDetails) => void;
	onSwitchToAdvanced: () => void;
}

const MAX_STEPS = 6;
const MAX_PERSONALITY_TRAITS = 5;

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
		AIPersonalityTrait.SPONTANEOUS,
		AIPersonalityTrait.INTROVERTED,
		AIPersonalityTrait.EXTROVERTED,
		AIPersonalityTrait.NURTURING,
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
		AIPersonalityTrait.METHODICAL,
		AIPersonalityTrait.PRAGMATIC,
		AIPersonalityTrait.IDEALISTIC,
	],
};

const orderedPersonalityCategories = [
	"Social Behavior",
	"Communication Style",
	"General Mood",
	"Attitude / Outlook",
];

const guidedSocialEnvironments = [
	{ name: SocialEnvironment.CASUAL, icon: CoffeeIcon },
	{ name: SocialEnvironment.DATING, icon: HeartIcon },
	{ name: SocialEnvironment.WORK, icon: BriefcaseIcon },
	{ name: SocialEnvironment.SOCIAL_GATHERING, icon: UsersIcon },
];

const initialScenario: Partial<ScenarioDetails> = {
	environment: SocialEnvironment.CASUAL,
	aiGender: AIGender.RANDOM,
	aiName: "",
	aiAgeBracket: AIAgeBracket.NOT_SPECIFIED,
	aiPersonalityTraits: [],
	conversationGoal: "",
	customContext: "",
	aiCulture: "",
	customAiPersonality: "",
	customEnvironment: "",
};

const PREDEFINED_AI_MALE_FIRST_NAMES = [
	"Arthur",
	"David",
	"Ethan",
	"James",
	"Liam",
	"Michael",
	"Noah",
	"Ryan",
	"Chris",
	"Ben",
];
const PREDEFINED_AI_FEMALE_FIRST_NAMES = [
	"Anna",
	"Chloe",
	"Emily",
	"Emma",
	"Isabella",
	"Olivia",
	"Sophia",
	"Ava",
	"Grace",
	"Sarah",
];
const PREDEFINED_AI_NEUTRAL_FIRST_NAMES = [
	"Alex",
	"Jordan",
	"Casey",
	"Morgan",
	"Riley",
	"Skyler",
	"Cameron",
	"Drew",
	"Kai",
	"Taylor",
];
const PREDEFINED_AI_LAST_NAMES = [
	"Smith",
	"Jones",
	"Williams",
	"Brown",
	"Davis",
	"Miller",
	"Wilson",
	"Chen",
	"Lee",
	"Garcia",
];

const generateRandomAiName = (gender: AIGender): string => {
	let firstNamePool: string[];
	switch (gender) {
		case AIGender.MALE:
			firstNamePool = PREDEFINED_AI_MALE_FIRST_NAMES;
			break;
		case AIGender.FEMALE:
			firstNamePool = PREDEFINED_AI_FEMALE_FIRST_NAMES;
			break;
		case AIGender.NON_BINARY:
		case AIGender.RANDOM:
		default:
			firstNamePool = PREDEFINED_AI_NEUTRAL_FIRST_NAMES;
			break;
	}
	const firstName =
		firstNamePool[Math.floor(Math.random() * firstNamePool.length)];
	const lastName =
		PREDEFINED_AI_LAST_NAMES[
			Math.floor(Math.random() * PREDEFINED_AI_LAST_NAMES.length)
		];
	return `${firstName} ${lastName}`;
};

const SegmentedProgressBar: React.FC<{
	currentStep: number;
	totalSteps: number;
}> = ({ currentStep, totalSteps }) => (
	<div className="flex w-full max-w-sm mx-auto gap-1.5 mb-8">
		{Array.from({ length: totalSteps }, (_, i) => (
			<div
				key={i}
				className="flex-1 h-1.5 rounded-full bg-slate-600 overflow-hidden">
				<div
					className={`h-full rounded-full bg-teal-400 transition-transform duration-500 ease-out origin-left ${
						currentStep > i ? "scale-x-100" : "scale-x-0"
					}`}
				/>
			</div>
		))}
	</div>
);

export const GuidedSetup: React.FC<GuidedSetupProps> = ({
	onStart,
	onSwitchToAdvanced,
}) => {
	const [step, setStep] = useState(0);
	const [scenario, setScenario] =
		useState<Partial<ScenarioDetails>>(initialScenario);
	const [customAiAgeString, setCustomAiAgeString] = useState<string>("");
	const [exiting, setExiting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleNext = () => {
		setError(null);

		if (step === 2 && scenario.aiAgeBracket === AIAgeBracket.CUSTOM) {
			if (customAiAgeString.trim() === "") {
				setError("Custom age cannot be empty.");
				return;
			}
			const ageNum = parseInt(customAiAgeString, 10);
			if (isNaN(ageNum) || ageNum < 13 || ageNum > 100) {
				setError("Please enter a valid age (13-100).");
				return;
			}
		}

		if (
			step === 3 &&
			(!scenario.aiPersonalityTraits ||
				scenario.aiPersonalityTraits.length === 0) &&
			(!scenario.customAiPersonality ||
				scenario.customAiPersonality.trim() === "")
		) {
			setError(
				"Please select at least one trait or provide a custom personality description."
			);
			return;
		}

		if (step < MAX_STEPS) {
			setExiting(true);
			setTimeout(() => {
				setStep(step + 1);
				setExiting(false);
			}, 300);
		}
	};

	const handleBack = () => {
		if (step > 0) {
			setExiting(true);
			setError(null);
			setTimeout(() => {
				setStep(step - 1);
				setExiting(false);
			}, 300);
		}
	};

	const handleStart = () => {
		let finalCustomAiAge: number | undefined = undefined;
		if (scenario.aiAgeBracket === AIAgeBracket.CUSTOM) {
			const ageNum = parseInt(customAiAgeString, 10);
			if (!isNaN(ageNum) && ageNum >= 13 && ageNum <= 100) {
				finalCustomAiAge = ageNum;
			} else {
				setError("Please enter a valid age (13-100) before starting.");
				return;
			}
		}

		const finalScenario: ScenarioDetails = {
			environment: scenario.environment || SocialEnvironment.CASUAL,
			customEnvironment:
				scenario.environment === SocialEnvironment.CUSTOM
					? scenario.customEnvironment?.trim() || undefined
					: undefined,
			aiGender: scenario.aiGender || AIGender.RANDOM,
			aiName: scenario.aiName || "",
			aiPersonalityTraits: scenario.aiPersonalityTraits || [],
			aiAgeBracket: scenario.aiAgeBracket || AIAgeBracket.NOT_SPECIFIED,
			customAiAge: finalCustomAiAge,
			conversationGoal: scenario.conversationGoal?.trim() || undefined,
			customContext: scenario.customContext?.trim() || undefined,
			aiCulture: scenario.aiCulture?.trim() || undefined,
			customAiPersonality: scenario.customAiPersonality?.trim() || undefined,
		};
		onStart(finalScenario);
	};

	const updateScenario = (updates: Partial<ScenarioDetails>) => {
		setScenario((prev) => ({ ...prev, ...updates }));
		setError(null);
	};

	const handleCustomAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setCustomAiAgeString(value);
		if (value.trim() === "") {
			setError(null);
			return;
		}
		const ageNum = parseInt(value, 10);
		if (isNaN(ageNum) || ageNum < 13 || ageNum > 100) {
			setError("Age must be between 13 and 100.");
		} else {
			setError(null);
		}
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
							Let's craft your scenario.
						</h2>
						<p className="text-lg text-gray-400 mb-8 max-w-md mx-auto">
							Choose a simple, guided setup or dive into advanced options for
							full control.
						</p>
						<div className="flex flex-col gap-4 max-w-sm mx-auto">
							<button
								onClick={handleNext}
								className="group w-full px-6 py-4 bg-green-600 text-white font-bold rounded-lg hover:bg-green-500 transition-all transform hover:scale-105 text-lg flex items-center justify-center gap-3">
								<PlayIcon className="h-5 w-5 transition-transform group-hover:scale-110" />
								Start Guided Setup
							</button>
							<button
								onClick={onSwitchToAdvanced}
								className="group w-full px-6 py-4 bg-sky-700 text-white font-semibold rounded-lg hover:bg-sky-600 transition-all transform hover:scale-105 text-lg flex items-center justify-center gap-3">
								<CogIcon className="h-5 w-5 transition-transform group-hover:rotate-45" />
								Go to Advanced Setup
							</button>
						</div>
					</div>
				);
			case 1:
				return (
					<div key={step} className={`${animationClass}`}>
						<h2 className="text-2xl font-semibold text-sky-300 mb-2 text-center">
							Where is this conversation taking place?
						</h2>
						<p className="text-sm text-gray-400 mb-6 text-center">
							This sets the scene and social etiquette.
						</p>
						<div className="grid grid-cols-2 gap-4">
							{guidedSocialEnvironments.map(({ name, icon: Icon }) => (
								<button
									key={name}
									onClick={() => updateScenario({ environment: name })}
									className={`p-4 rounded-lg border-2 flex flex-col items-center justify-center gap-3 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-teal-400
										${
											scenario.environment === name
												? "bg-teal-500/20 border-teal-400 shadow-lg"
												: "bg-slate-700/60 border-slate-600 hover:border-sky-500 hover:bg-slate-700"
										}`}>
									<Icon
										className={`h-8 w-8 transition-colors ${
											scenario.environment === name
												? "text-teal-300"
												: "text-slate-400"
										}`}
									/>
									<span className="font-bold text-sm text-center text-gray-200">
										{name}
									</span>
								</button>
							))}
						</div>
						{/* Custom Environment Section */}
						<div className="mt-6">
							<button
								onClick={() =>
									updateScenario({ environment: SocialEnvironment.CUSTOM })
								}
								className={`w-full p-3 rounded-lg border-2 flex items-center justify-center gap-3 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-teal-400
									${
										scenario.environment === SocialEnvironment.CUSTOM
											? "bg-teal-500/20 border-teal-400 shadow-lg"
											: "bg-slate-700/60 border-slate-600 hover:border-sky-500 hover:bg-slate-700"
									}`}>
								<CogIcon
									className={`h-6 w-6 transition-colors ${
										scenario.environment === SocialEnvironment.CUSTOM
											? "text-teal-300"
											: "text-slate-400"
									}`}
								/>
								<span className="font-bold text-sm text-center text-gray-200">
									{SocialEnvironment.CUSTOM}
								</span>
							</button>

							{scenario.environment === SocialEnvironment.CUSTOM && (
								<div className="mt-3 animate-slide-down-fade-in">
									<textarea
										value={scenario.customEnvironment || ""}
										onChange={(e) =>
											updateScenario({ customEnvironment: e.target.value })
										}
										placeholder="Describe your custom environment..."
										className="w-full p-3 bg-slate-600 text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 min-h-[80px]"
										rows={2}
									/>
									<div className="mt-2 flex items-start gap-2 text-xs text-slate-400">
										<InfoIcon className="h-4 w-4 flex-shrink-0 mt-0.5 text-sky-400" />
										<p>
											Describe the specific place. Example: 'A bustling airport
											terminal near the departure gates.'
										</p>
									</div>
								</div>
							)}
						</div>
					</div>
				);
			case 2:
				return (
					<div key={step} className={`${animationClass}`}>
						<h2 className="text-2xl font-semibold text-sky-300 mb-6 text-center">
							Who are you talking to?
						</h2>
						<div className="space-y-6">
							<div>
								<h3 className="text-lg font-medium text-gray-300 mb-3 text-center">
									Gender
								</h3>
								<div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
									{Object.values(AIGender).map((g) => (
										<button
											key={g}
											onClick={() => updateScenario({ aiGender: g })}
											className={`px-4 py-3 rounded-lg text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-teal-400 ${
												scenario.aiGender === g
													? "bg-teal-500 text-white shadow-md"
													: "bg-slate-700 hover:bg-slate-600 text-gray-300"
											}`}>
											{g}
										</button>
									))}
								</div>
							</div>
							<div>
								<h3 className="text-lg font-medium text-gray-300 mb-3 text-center">
									Age
								</h3>
								<div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
									{Object.values(AIAgeBracket).map((age) => (
										<button
											key={age}
											onClick={() => updateScenario({ aiAgeBracket: age })}
											className={`px-4 py-3 rounded-lg text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-teal-400 ${
												scenario.aiAgeBracket === age
													? "bg-teal-500 text-white shadow-md"
													: "bg-slate-700 hover:bg-slate-600 text-gray-300"
											}`}>
											{age}
										</button>
									))}
								</div>
								{scenario.aiAgeBracket === AIAgeBracket.CUSTOM && (
									<div className="mt-4">
										<input
											type="number"
											value={customAiAgeString}
											onChange={handleCustomAgeChange}
											placeholder="Enter age (13-100)"
											className={`w-full p-3 bg-slate-600 text-gray-200 rounded-lg focus:outline-none focus:ring-2 ${
												error ? "ring-red-500" : "focus:ring-teal-500"
											}`}
										/>
										<div className="mt-2 flex items-start gap-2 text-xs text-slate-400">
											<InfoIcon className="h-4 w-4 flex-shrink-0 mt-0.5 text-sky-400" />
											<p>
												Provide a specific age. This influences vocabulary and
												perspectives.
											</p>
										</div>
									</div>
								)}
							</div>
						</div>
					</div>
				);
			case 3:
				const selectedCount = scenario.aiPersonalityTraits?.length || 0;
				return (
					<div key={step} className={`${animationClass}`}>
						<h2 className="text-2xl font-semibold text-sky-300 mb-2 text-center">
							What's their personality like?
						</h2>
						<p className="text-gray-400 mb-4 text-center">
							Choose up to {MAX_PERSONALITY_TRAITS} traits, and/or add your own
							below.
						</p>

						<div className="mb-6">
							<label
								htmlFor="guided-custom-personality"
								className="block text-md font-medium text-gray-300 mb-2">
								Custom Additions (Optional)
							</label>
							<textarea
								id="guided-custom-personality"
								value={scenario.customAiPersonality || ""}
								onChange={(e) =>
									updateScenario({ customAiPersonality: e.target.value })
								}
								placeholder="Add unlisted traits or specific behaviors..."
								className="w-full p-3 bg-slate-600 text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 min-h-[80px]"
								rows={2}
							/>
							<div className="mt-2 flex items-start gap-2 text-xs text-slate-400">
								<InfoIcon className="h-4 w-4 flex-shrink-0 mt-0.5 text-sky-400" />
								<p>
									Examples: 'has a dry sense of humor', 'is secretly a
									romantic', 'tends to fidget when nervous'.
								</p>
							</div>
						</div>

						<div className="space-y-4">
							{orderedPersonalityCategories.map((category) => (
								<div key={category}>
									<h3 className="text-md font-semibold text-teal-300 mb-2">
										{category}
									</h3>
									<div className="flex flex-wrap gap-2">
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
													className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-teal-400 ${
														isSelected
															? "bg-teal-500 text-white"
															: "bg-slate-700 text-gray-300"
													} ${
														!isSelected &&
														selectedCount >= MAX_PERSONALITY_TRAITS
															? "opacity-50 cursor-not-allowed"
															: "hover:bg-slate-600"
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
						<h2 className="text-2xl font-semibold text-sky-300 mb-6 text-center">
							Fine-tune their Background (Optional)
						</h2>
						<div className="space-y-6 max-w-lg mx-auto">
							<div>
								<label
									htmlFor="ai-name"
									className="block text-md font-medium text-gray-300 mb-2">
									Name
								</label>
								<div className="flex items-start space-x-2">
									<div className="flex-grow">
										<input
											id="ai-name"
											type="text"
											value={scenario.aiName || ""}
											onChange={(e) =>
												updateScenario({ aiName: e.target.value })
											}
											placeholder="Leave blank for random"
											className="w-full p-3 bg-slate-600 text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
										/>
									</div>
									<button
										type="button"
										onClick={() =>
											updateScenario({
												aiName: generateRandomAiName(scenario.aiGender!),
											})
										}
										className="p-3 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-lg text-sm transition-colors duration-150 h-[48px] flex-shrink-0"
										title="Suggest a random name">
										Suggest
									</button>
								</div>
								<div className="mt-2 flex items-start gap-2 text-xs text-slate-400">
									<InfoIcon className="h-4 w-4 flex-shrink-0 mt-0.5 text-sky-400" />
									<p>
										Give the AI a name, or leave it blank to have one generated
										based on other selections.
									</p>
								</div>
							</div>
							<div>
								<label
									htmlFor="ai-culture"
									className="block text-md font-medium text-gray-300 mb-2">
									Culture/Race
								</label>
								<input
									id="ai-culture"
									type="text"
									value={scenario.aiCulture || ""}
									onChange={(e) =>
										updateScenario({ aiCulture: e.target.value })
									}
									placeholder="E.g., Japanese, Italian-American..."
									className="w-full p-3 bg-slate-600 text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
								/>
								<div className="mt-2 flex items-start gap-2 text-xs text-slate-400">
									<InfoIcon className="h-4 w-4 flex-shrink-0 mt-0.5 text-sky-400" />
									<p>
										This can influence the AI's name, appearance, and
										communication style.
									</p>
								</div>
							</div>
						</div>
					</div>
				);
			case 5:
				return (
					<div key={step} className={`${animationClass}`}>
						<h2 className="text-2xl font-semibold text-sky-300 mb-4 text-center">
							Set the Scene (Optional)
						</h2>
						<div className="space-y-6 max-w-lg mx-auto">
							<div>
								<label
									htmlFor="conversation-goal"
									className="block text-md font-medium text-gray-300 mb-2">
									What is your goal for this conversation?
								</label>
								<input
									id="conversation-goal"
									type="text"
									value={scenario.conversationGoal || ""}
									onChange={(e) =>
										updateScenario({ conversationGoal: e.target.value })
									}
									placeholder="E.g., Ask for a date, get a discount..."
									className="w-full p-3 bg-slate-600 text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
								/>
								<div className="mt-2">
									<InfoCard
										Icon={TargetIcon}
										title="Example Goal"
										description="“Ask for a date, get a discount, or convince your friend to see your favorite movie.”"
									/>
								</div>
							</div>
							<div>
								<label
									htmlFor="custom-context"
									className="block text-md font-medium text-gray-300 mb-2">
									Add any extra scenario details
								</label>
								<textarea
									id="custom-context"
									value={scenario.customContext || ""}
									onChange={(e) =>
										updateScenario({ customContext: e.target.value })
									}
									placeholder="E.g., You've met this person once before..."
									className="w-full p-3 bg-slate-600 text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 min-h-[100px]"
									rows={3}
								/>
								<div className="mt-2">
									<InfoCard
										Icon={FastForwardIcon}
										title="Example Context for an Action"
										description="Context like “You are both walking out of an office building” can trigger an ‘Active Action’ banner in the simulation."
									/>
								</div>
							</div>
						</div>
					</div>
				);
			case 6:
				const {
					aiAgeBracket: finalAgeBracket,
					aiPersonalityTraits,
					environment,
					aiCulture,
					customAiPersonality,
					customContext,
					customEnvironment,
				} = scenario;
				let ageText: string;
				if (
					scenario.aiAgeBracket === AIAgeBracket.CUSTOM &&
					customAiAgeString
				) {
					ageText = `of age ${customAiAgeString}`;
				} else if (
					finalAgeBracket &&
					finalAgeBracket !== AIAgeBracket.NOT_SPECIFIED
				) {
					ageText = finalAgeBracket.toLowerCase();
				} else {
					ageText = "a person";
				}
				const envText: string =
					environment === SocialEnvironment.CUSTOM && customEnvironment
						? customEnvironment
						: (environment as string);

				return (
					<div key={step} className={`${animationClass} text-center`}>
						<h2 className="text-3xl font-bold text-teal-300 mb-6">
							Ready to Go?
						</h2>
						<div className="p-6 bg-slate-700/50 rounded-lg space-y-3 text-gray-200 text-left max-w-md mx-auto">
							<p>
								<strong className="text-sky-300 w-32 inline-block">
									Environment:
								</strong>{" "}
								{envText}
							</p>
							<p>
								<strong className="text-sky-300 w-32 inline-block">
									Persona:
								</strong>{" "}
								A {scenario.aiGender?.toLowerCase()} {ageText}.
							</p>
							{scenario.aiName && (
								<p>
									<strong className="text-sky-300 w-32 inline-block">
										Name:
									</strong>{" "}
									{scenario.aiName}
								</p>
							)}
							{aiCulture && (
								<p>
									<strong className="text-sky-300 w-32 inline-block">
										Culture:
									</strong>{" "}
									{aiCulture}
								</p>
							)}
							{aiPersonalityTraits && aiPersonalityTraits.length > 0 && (
								<p>
									<strong className="text-sky-300 w-32 inline-block">
										Traits:
									</strong>{" "}
									{aiPersonalityTraits.join(", ")}
								</p>
							)}
							{customAiPersonality && (
								<p>
									<strong className="text-sky-300 w-32 inline-block">
										Custom Persona:
									</strong>{" "}
									{customAiPersonality}
								</p>
							)}
							{scenario.conversationGoal && (
								<p>
									<strong className="text-sky-300 w-32 inline-block">
										Your Goal:
									</strong>{" "}
									{scenario.conversationGoal}
								</p>
							)}
							{customContext && (
								<p>
									<strong className="text-sky-300 w-32 inline-block">
										Extra Context:
									</strong>{" "}
									{customContext}
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
		<div className="w-full max-w-xl p-4 md:p-6 bg-slate-800 rounded-xl shadow-2xl flex flex-col justify-between min-h-[75vh]">
			<div className="flex-grow min-h-0 overflow-y-auto custom-scrollbar pr-2 -mr-2">
				{step > 0 && (
					<SegmentedProgressBar currentStep={step} totalSteps={MAX_STEPS} />
				)}
				<div className="px-2">{renderStepContent()}</div>
				{error && (
					<p className="text-red-400 text-sm mt-4 text-center animate-pulse">
						{error}
					</p>
				)}
			</div>

			<div className="flex-shrink-0 flex items-center mt-6 pt-4 border-t border-slate-700/60">
				<div className="flex-1">
					{step > 0 && (
						<button
							onClick={handleBack}
							className="px-6 py-3 bg-slate-600/80 text-white font-semibold rounded-lg hover:bg-slate-600 flex items-center justify-center gap-2 transition-colors">
							<ArrowLeftIcon className="h-5 w-5" />
							<span>Back</span>
						</button>
					)}
				</div>

				<div className="flex-1 text-right">
					{step > 0 && step < MAX_STEPS && (
						<button
							onClick={handleNext}
							className="px-8 py-3 bg-sky-600 text-white font-bold rounded-lg hover:bg-sky-500 transition-colors">
							Next
						</button>
					)}
					{step === MAX_STEPS && (
						<button
							onClick={handleStart}
							className="px-8 py-4 bg-green-600 text-white font-bold rounded-lg hover:bg-green-500 animate-pulse-glow flex items-center justify-center gap-2 transition-transform hover:scale-105">
							<PlayIcon className="h-5 w-5" />
							<span>Start</span>
						</button>
					)}
				</div>
			</div>
		</div>
	);
};
