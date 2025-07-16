import React, { useState } from "react";
import type {
	ScenarioDetails,
	IconComponentProps,
	UserScenarioDetails,
} from "../types";
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
	UserCircleIcon,
	GlobeAltIcon,
	PencilSquareIcon,
	TagIcon,
	MapPinIcon,
	ChatBubbleBottomCenterTextIcon,
	FlagIcon,
} from "./Icons";
import { InfoCard } from "./InfoCard";
import { motion } from "motion/react";
import {
	personalityCategories,
	orderedPersonalityCategories,
	personalityTraitDescriptions,
	cultureNameData,
} from "../constants/personality";
import { Tooltip } from "./Tooltip";

interface GuidedSetupProps {
	onStart: (
		details: ScenarioDetails,
		userScenarioDetails?: UserScenarioDetails
	) => void;
	onSwitchToAdvanced: () => void;
}

const MAX_STEPS = 7; // Increased to add confirmation screen
const MAX_PERSONALITY_TRAITS = 5;

// --- Style constants for UI consistency ---
const optionButtonBaseClasses =
	"p-3 rounded-lg text-sm font-semibold transition-all duration-200 ease-in-out transform focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-teal-400";
const optionButtonSelectedClasses =
	"bg-teal-500 text-white shadow-lg scale-105";
const optionButtonUnselectedClasses =
	"bg-slate-700 hover:bg-slate-600 text-gray-300";

const traitButtonBaseClasses =
	"px-3 py-1.5 rounded-full text-xs font-medium transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800";
const traitButtonSelectedClasses =
	"bg-teal-500 text-white ring-2 ring-teal-300";
const traitButtonUnselectedClasses =
	"bg-slate-600 hover:bg-slate-500 text-gray-300";

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

const generateRandomAiName = (gender: AIGender, culture?: string): string => {
	let firstNamePool: string[];
	let lastNamePool: string[];
	const normalizedCulture = culture?.trim();
	if (normalizedCulture && cultureNameData[normalizedCulture]) {
		const cultureData = cultureNameData[normalizedCulture];
		switch (gender) {
			case AIGender.MALE:
				firstNamePool = cultureData.male.length
					? cultureData.male
					: cultureData.neutral;
				break;
			case AIGender.FEMALE:
				firstNamePool = cultureData.female.length
					? cultureData.female
					: cultureData.neutral;
				break;
			case AIGender.NON_BINARY:
			case AIGender.RANDOM:
			default:
				firstNamePool = cultureData.neutral;
				break;
		}
		lastNamePool = cultureData.last;
	} else {
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
		lastNamePool = PREDEFINED_AI_LAST_NAMES;
	}
	const firstName =
		firstNamePool[Math.floor(Math.random() * firstNamePool.length)];
	const lastName =
		lastNamePool[Math.floor(Math.random() * lastNamePool.length)];
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

const SummaryItem: React.FC<{
	Icon: React.FC<IconComponentProps>;
	label: string;
	children: React.ReactNode;
}> = ({ Icon, label, children }) => (
	<div className="flex items-start gap-4">
		<div className="flex-shrink-0 mt-1 p-2 bg-slate-800/60 rounded-lg">
			<Icon className="h-5 w-5 text-sky-400" />
		</div>
		<div>
			<h4 className="text-sm font-semibold text-gray-400">{label}</h4>
			<div className="text-white font-medium">{children}</div>
		</div>
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
	const [provideUserName, setProvideUserName] = useState(false);
	const [userName, setUserName] = useState("");

	const handleNext = () => {
		setError(null);

		if (step === 2 && scenario.aiAgeBracket === AIAgeBracket.CUSTOM) {
			if (customAiAgeString.trim() === "") {
				setError("Custom age cannot be empty.");
				return;
			}
			const ageNum = parseInt(customAiAgeString, 10);
			if (isNaN(ageNum) || ageNum < 18 || ageNum > 100) {
				setError("Please enter a valid age (18-100).");
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
			if (!isNaN(ageNum) && ageNum >= 18 && ageNum <= 100) {
				finalCustomAiAge = ageNum;
			} else {
				setError("Please enter a valid age (18-100) before starting.");
				return;
			}
		}

		let finalAiName = scenario.aiName || "";
		if (!finalAiName)
			finalAiName = generateRandomAiName(
				scenario.aiGender!,
				scenario.aiCulture
			);

		const finalScenario: ScenarioDetails = {
			environment: scenario.environment || SocialEnvironment.CASUAL,
			customEnvironment:
				scenario.environment === SocialEnvironment.CUSTOM
					? scenario.customEnvironment?.trim() || undefined
					: undefined,
			aiGender: scenario.aiGender || AIGender.RANDOM,
			aiName: finalAiName,
			aiPersonalityTraits: scenario.aiPersonalityTraits || [],
			aiAgeBracket: scenario.aiAgeBracket || AIAgeBracket.NOT_SPECIFIED,
			customAiAge: finalCustomAiAge,
			conversationGoal: scenario.conversationGoal?.trim() || undefined,
			customContext: scenario.customContext?.trim() || undefined,
			aiCulture: scenario.aiCulture?.trim() || undefined,
			customAiPersonality: scenario.customAiPersonality?.trim() || undefined,
		};
		const userScenarioDetails: UserScenarioDetails =
			provideUserName && userName.trim() ? { userName: userName.trim() } : {};
		onStart(finalScenario, userScenarioDetails);
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
		if (isNaN(ageNum) || ageNum < 18 || ageNum > 100) {
			setError("Age must be between 18 and 100.");
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
					<div key={step} className={`${animationClass}`}>
						<div className="text-center mb-10">
							<h2 className="text-4xl font-bold tracking-tight text-white">
								Let's craft your scenario
							</h2>
							<p className="mt-4 text-lg text-gray-400">
								How would you like to begin? Choose a path to set up your
								practice session.
							</p>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							{/* Guided Setup Card */}
							<button
								onClick={handleNext}
								className="group relative text-left p-6 bg-slate-700/50 rounded-xl border border-slate-700 hover:border-teal-500/80 transition-all duration-300">
								<div className="absolute -inset-px rounded-xl border-2 border-transparent transition-all duration-300 group-hover:border-teal-500/50"></div>
								<div className="relative">
									<div className="p-3 bg-slate-800 rounded-lg inline-block mb-4">
										<PlayIcon className="h-6 w-6 text-teal-400" />
									</div>
									<h3 className="text-xl font-semibold text-white">
										Guided Setup
									</h3>
									<p className="mt-2 text-gray-400 text-sm">
										A step-by-step process to quickly define your interaction.
										Perfect for getting started.
									</p>
								</div>
							</button>

							{/* Advanced Setup Card */}
							<button
								onClick={onSwitchToAdvanced}
								className="group relative text-left p-6 bg-slate-700/50 rounded-xl border border-slate-700 hover:border-sky-500/80 transition-all duration-300">
								<div className="absolute -inset-px rounded-xl border-2 border-transparent transition-all duration-300 group-hover:border-sky-500/50"></div>
								<div className="relative">
									<div className="p-3 bg-slate-800 rounded-lg inline-block mb-4">
										<CogIcon className="h-6 w-6 text-sky-400" />
									</div>
									<h3 className="text-xl font-semibold text-white">
										Advanced Setup
									</h3>
									<p className="mt-2 text-gray-400 text-sm">
										Fine-tune every detail of the AI's persona and scenario for
										a fully customized experience.
									</p>
								</div>
							</button>
						</div>
					</div>
				);
			case 1:
				return (
					<div key={step} className={`${animationClass}`}>
						<h2 className="text-3xl font-bold text-teal-400 mb-2 text-center">
							Set Up the Environment & Your Identity
						</h2>
						<p className="text-lg text-gray-400 mb-8 text-center">
							Where is this conversation taking place? (And optionally, who are
							you?)
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
												: "bg-slate-700/60 border-slate-600 hover:border-teal-500 hover:bg-slate-700"
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
											: "bg-slate-700/60 border-slate-600 hover:border-teal-500 hover:bg-slate-700"
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
						{/* User Name Toggle/Input (moved here) */}
						<div className="mt-8 space-y-4 max-w-lg mx-auto">
							<label className="flex items-center gap-2">
								<button
									type="button"
									onClick={() => setProvideUserName((v) => !v)}
									className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ${
										provideUserName ? "bg-teal-500" : "bg-slate-600"
									}`}
									aria-pressed={provideUserName}>
									<span
										className={`inline-block w-4 h-4 transform bg-white rounded-full shadow transition-transform duration-200 ${
											provideUserName ? "translate-x-6" : "translate-x-0"
										}`}
									/>
								</button>
								<span className="text-md font-medium text-gray-300">
									Provide your name?
								</span>
							</label>
							<p className="text-xs text-slate-400 mt-2">
								Only provide your name if you want the relationship to be
								prior-established. For natural, casual encounters, it's normal
								for neither party to know each other's name.
							</p>
							{provideUserName && (
								<div>
									<label className="block text-md font-medium text-gray-300 mb-2">
										Your Name
									</label>
									<input
										type="text"
										value={userName}
										onChange={(e) => setUserName(e.target.value)}
										placeholder="Enter your name (optional)"
										className="w-full p-3 bg-slate-600 text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
									/>
								</div>
							)}
						</div>
					</div>
				);
			case 2:
				return (
					<div key={step} className={`${animationClass}`}>
						<h2 className="text-3xl font-bold text-teal-400 mb-8 text-center">
							Who are you talking to?
						</h2>
						<div className="space-y-6">
							<div>
								<h3 className="text-lg font-medium text-gray-300 mb-3 text-center">
									Gender
								</h3>
								<div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
									{Object.values(AIGender).map((g) => {
										const isSelected = scenario.aiGender === g;
										return (
											<button
												key={g}
												onClick={() => updateScenario({ aiGender: g })}
												className={`${optionButtonBaseClasses} ${
													isSelected
														? optionButtonSelectedClasses
														: optionButtonUnselectedClasses
												}`}>
												{g}
											</button>
										);
									})}
								</div>
							</div>
							<div>
								<h3 className="text-lg font-medium text-gray-300 mb-3 text-center">
									Age
								</h3>
								<div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
									{Object.values(AIAgeBracket).map((age) => {
										const isSelected = scenario.aiAgeBracket === age;
										return (
											<button
												key={age}
												onClick={() => updateScenario({ aiAgeBracket: age })}
												className={`${optionButtonBaseClasses} ${
													isSelected
														? optionButtonSelectedClasses
														: optionButtonUnselectedClasses
												}`}>
												{age}
											</button>
										);
									})}
								</div>
								{scenario.aiAgeBracket === AIAgeBracket.CUSTOM && (
									<div className="mt-4">
										<input
											type="number"
											value={customAiAgeString}
											onChange={handleCustomAgeChange}
											placeholder="Enter age (18-100)"
											className={`w-full p-3 bg-slate-600 text-gray-200 rounded-lg focus:outline-none focus:ring-2 ${
												error ? "ring-red-500" : "focus:ring-teal-500"
											}`}
										/>
										<div className="mt-2 flex items-start gap-2 text-xs text-slate-400">
											<InfoIcon className="h-4 w-4 flex-shrink-0 mt-0.5 text-sky-400" />
											<p>
												Provide a specific age for the AI between 18 and 100.
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
						<h2 className="text-3xl font-bold text-teal-400 mb-2 text-center">
							Choose from the trait palette
						</h2>
						<p className="text-lg text-gray-400 mb-6 text-center">
							Select up to {MAX_PERSONALITY_TRAITS} traits across the scientific
							anchors below, and/or add your own.
						</p>
						<p className="text-sm text-slate-400 mb-2">
							You may also type in your own custom personality description below
							if you prefer.
						</p>
						<textarea
							id="guided-custom-personality"
							value={scenario.customAiPersonality || ""}
							onChange={(e) =>
								updateScenario({ customAiPersonality: e.target.value })
							}
							placeholder="Type your own personality description here..."
							className="w-full p-3 bg-slate-600 text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 min-h-[80px]"
							rows={2}
						/>

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
												<Tooltip
													key={p}
													content={personalityTraitDescriptions[p] || p}>
													<button
														data-testid={`trait-button-${p}`}
														style={{ zIndex: 10 }}
														onClick={() => {
															const currentTraits =
																scenario.aiPersonalityTraits || [];
															if (isSelected) {
																updateScenario({
																	aiPersonalityTraits: currentTraits.filter(
																		(trait) => trait !== p
																	),
																});
															} else if (
																selectedCount < MAX_PERSONALITY_TRAITS
															) {
																updateScenario({
																	aiPersonalityTraits: [...currentTraits, p],
																});
															}
														}}
														className={`${traitButtonBaseClasses} ${
															isSelected
																? traitButtonSelectedClasses
																: traitButtonUnselectedClasses
														} ${
															!isSelected &&
															selectedCount >= MAX_PERSONALITY_TRAITS
																? "opacity-50 cursor-not-allowed"
																: ""
														}`}>
														{p}
													</button>
												</Tooltip>
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
						<h2 className="text-3xl font-bold text-teal-400 mb-6 text-center">
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
												aiName: generateRandomAiName(
													scenario.aiGender!,
													scenario.aiCulture
												),
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
						<h2 className="text-3xl font-bold text-teal-400 mb-6 text-center">
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
										description="Context like “You are both walking out of an office building” can trigger an 'Active Action' banner in the simulation."
									/>
								</div>
							</div>
						</div>
					</div>
				);
			case 6:
				// Modern Scenario Locked In Card
				return (
					<div key={step} className={`${animationClass}`}>
						<h2 className="text-3xl font-bold text-white mb-2 text-center">
							Scenario Locked In
						</h2>
						<p className="text-md text-slate-300 mb-8 text-center">
							Review your choices below. Press Start when you're ready to begin
							the interaction.
						</p>
						<div className="bg-slate-800/80 rounded-2xl border border-slate-700 px-6 py-6 mb-8 max-w-2xl mx-auto shadow-lg">
							<div className="space-y-6">
								{/* Persona */}
								<div className="flex items-start gap-4">
									<div className="flex-shrink-0 mt-1 p-2 bg-slate-900/60 rounded-lg">
										<UserCircleIcon className="h-5 w-5 text-sky-400" />
									</div>
									<div>
										<h4 className="text-sm font-semibold text-gray-400 mb-1">
											Persona
										</h4>
										<div className="text-white font-medium">
											{(() => {
												const gender =
													scenario.aiGender && scenario.aiGender !== "Random"
														? scenario.aiGender
														: null;
												const age =
													scenario.aiAgeBracket &&
													scenario.aiAgeBracket !== AIAgeBracket.NOT_SPECIFIED
														? scenario.aiAgeBracket
														: null;
												let persona = [];
												if (gender) persona.push(gender.toLowerCase());
												if (age) persona.push(age.toLowerCase());
												if (persona.length) return persona.join(" ");
												return (
													<span className="italic text-slate-400">
														(No persona details set)
													</span>
												);
											})()}
											{scenario.aiName && (
												<span className="ml-2 text-slate-400 text-sm">
													({scenario.aiName})
												</span>
											)}
											{scenario.aiCulture && (
												<span className="ml-2 text-slate-400 text-sm">
													[{scenario.aiCulture}]
												</span>
											)}
										</div>
									</div>
								</div>
								{/* Environment */}
								<div className="flex items-start gap-4">
									<div className="flex-shrink-0 mt-1 p-2 bg-slate-900/60 rounded-lg">
										<MapPinIcon className="h-5 w-5 text-sky-400" />
									</div>
									<div>
										<h4 className="text-sm font-semibold text-gray-400 mb-1">
											Environment
										</h4>
										<div className="text-white font-medium">
											{scenario.environment === SocialEnvironment.CUSTOM
												? scenario.customEnvironment || (
														<span className="italic text-slate-400">
															(Describe your unique setting)
														</span>
												  )
												: scenario.environment}
										</div>
									</div>
								</div>
								{/* Personality Traits */}
								<div className="flex items-start gap-4">
									<div className="flex-shrink-0 mt-1 p-2 bg-slate-900/60 rounded-lg">
										<TagIcon className="h-5 w-5 text-sky-400" />
									</div>
									<div>
										<h4 className="text-sm font-semibold text-gray-400 mb-1">
											Personality Traits
										</h4>
										<div className="flex flex-wrap gap-2 mt-1">
											{scenario.aiPersonalityTraits &&
											scenario.aiPersonalityTraits.length > 0 ? (
												scenario.aiPersonalityTraits.map((trait) => (
													<span
														key={trait}
														className="px-3 py-1 rounded-full bg-teal-700/80 text-teal-100 text-xs font-semibold">
														{trait}
													</span>
												))
											) : scenario.customAiPersonality ? (
												<span className="italic text-slate-400">
													{scenario.customAiPersonality}
												</span>
											) : (
												<span className="italic text-slate-400">
													(No traits selected)
												</span>
											)}
										</div>
									</div>
								</div>
								{/* Goal */}
								<div className="flex items-start gap-4">
									<div className="flex-shrink-0 mt-1 p-2 bg-slate-900/60 rounded-lg">
										<ChatBubbleBottomCenterTextIcon className="h-5 w-5 text-sky-400" />
									</div>
									<div>
										<h4 className="text-sm font-semibold text-gray-400 mb-1">
											Goal
										</h4>
										<div className="text-white font-medium">
											{scenario.conversationGoal || (
												<span className="italic text-slate-400">
													(Leave blank to let the AI suggest a goal)
												</span>
											)}
										</div>
									</div>
								</div>
								{/* Extra Context */}
								<div className="flex items-start gap-4">
									<div className="flex-shrink-0 mt-1 p-2 bg-slate-900/60 rounded-lg">
										<InfoIcon className="h-5 w-5 text-sky-400" />
									</div>
									<div>
										<h4 className="text-sm font-semibold text-gray-400 mb-1">
											Extra Context
										</h4>
										<div className="text-white font-medium">
											{scenario.customContext || (
												<span className="italic text-slate-400">
													(No extra details provided)
												</span>
											)}
										</div>
									</div>
								</div>
								{/* Your Name */}
								<div className="flex items-start gap-4">
									<div className="flex-shrink-0 mt-1 p-2 bg-slate-900/60 rounded-lg">
										<UserCircleIcon className="h-5 w-5 text-sky-400" />
									</div>
									<div>
										<h4 className="text-sm font-semibold text-gray-400 mb-1">
											Your Name
										</h4>
										<div className="text-white font-medium">
											{provideUserName && userName.trim() ? (
												userName
											) : (
												<span className="italic text-slate-400">
													(The AI won’t know your name)
												</span>
											)}
										</div>
									</div>
								</div>
							</div>
						</div>
						<div className="flex justify-between items-center mt-8 gap-4">
							<button
								type="button"
								className="px-6 py-3 bg-slate-600/80 text-white font-semibold rounded-lg hover:bg-slate-600 flex items-center justify-center gap-2 transition-colors"
								onClick={handleBack}>
								<ArrowLeftIcon className="h-5 w-5" />
								<span>Back</span>
							</button>
							<button
								type="button"
								className="px-8 py-3 bg-teal-500 text-white font-bold rounded-lg shadow hover:bg-teal-400 transition-colors flex items-center gap-2"
								onClick={handleStart}>
								Start
								<PlayIcon className="h-6 w-6 ml-1" />
							</button>
						</div>
					</div>
				);
			default:
				return <div>Setup complete.</div>;
		}
	};

	return (
		<motion.div
			layout
			transition={{ type: "spring", stiffness: 120, damping: 18, mass: 0.9 }}
			className="w-full max-w-3xl p-6 md:p-8 bg-slate-900/70 border border-slate-700 backdrop-blur-lg rounded-xl shadow-2xl space-y-6 my-4">
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

			{/* Only render the default navigation bar if not on the confirmation step */}
			{step !== 6 && (
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
								className="group w-full bg-teal-500 hover:bg-teal-400 text-white font-bold py-4 px-6 rounded-lg text-lg shadow-lg 
                       transition-all duration-200 ease-in-out transform hover:scale-105 focus:outline-none 
                       focus:ring-4 focus:ring-teal-300 focus:ring-opacity-50 flex items-center justify-center gap-2">
								<span>Start</span>
								<PlayIcon className="h-6 w-6 transition-transform group-hover:translate-x-1" />
							</button>
						)}
					</div>
				</div>
			)}
		</motion.div>
	);
};
