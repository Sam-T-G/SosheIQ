import React, { useState, useEffect } from "react";
import type { ScenarioDetails } from "../types";
import {
	SocialEnvironment,
	AIPersonalityTrait,
	AIGender,
	AIAgeBracket,
} from "../types";
import {
	ArrowLeftIcon,
	AccordionChevronIcon,
	InfoIcon,
	TargetIcon,
	FastForwardIcon,
	PlayIcon,
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
import { UserScenarioDetails } from "../types";

interface SetupScreenProps {
	onStart: (
		details: ScenarioDetails,
		userScenarioDetails?: UserScenarioDetails
	) => void;
	onBack: () => void;
}

const MAX_PERSONALITY_TRAITS = 5;
const MAX_CUSTOM_PERSONALITY_LENGTH = 300;
const MAX_CONVERSATION_GOAL_LENGTH = 200;
const MAX_CUSTOM_ENV_LENGTH = 200;
const MAX_AI_CULTURE_LENGTH = 100;

interface OptionButtonProps<T extends string> {
	value: T;
	isSelected: boolean;
	onChange: (value: T) => void;
	children: React.ReactNode;
	className?: string;
	disabled?: boolean;
	title?: string;
}

const OptionButton = <T extends string>({
	value,
	isSelected,
	onChange,
	children,
	className = "",
	disabled = false,
	title,
}: OptionButtonProps<T>): React.ReactElement => (
	<button
		type="button"
		onClick={() => !disabled && onChange(value)}
		disabled={disabled}
		title={title}
		aria-pressed={isSelected}
		className={`flex items-center justify-center text-center p-3 rounded-lg text-sm font-medium transition-all duration-200 ease-in-out transform focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-teal-400
			${
				disabled
					? "bg-slate-500 text-gray-400 cursor-not-allowed opacity-70"
					: isSelected
					? "bg-teal-500 text-white shadow-lg scale-105"
					: "bg-slate-700 hover:bg-slate-600 text-gray-300"
			} ${className}`}>
		{children}
	</button>
);

const AccordionSection: React.FC<{
	title: string;
	children: React.ReactNode;
	defaultOpen?: boolean;
	id?: string;
	error?: string | null;
}> = ({ title, children, defaultOpen = false, id, error }) => {
	const [isOpen, setIsOpen] = useState(defaultOpen);

	return (
		<div
			className={`border border-slate-600 rounded-xl bg-slate-700/30 transition-shadow hover:shadow-lg ${
				error ? "border-red-500/50" : ""
			}`}>
			<h2>
				<button
					type="button"
					onClick={() => setIsOpen(!isOpen)}
					className="flex justify-between items-center w-full p-5 font-semibold text-left text-sky-300 bg-slate-700/50 hover:bg-slate-700 transition-colors rounded-t-xl"
					aria-expanded={isOpen}
					aria-controls={id}>
					<span className="text-lg">{title}</span>
					<div className="flex items-center gap-2">
						{error && (
							<span className="text-xs text-red-400 animate-pulse">Error</span>
						)}
						<AccordionChevronIcon
							className={`w-5 h-5 transform transition-transform duration-300 ${
								isOpen ? "rotate-180" : ""
							}`}
						/>
					</div>
				</button>
			</h2>
			<div
				id={id}
				className={`grid transition-all duration-500 ease-in-out ${
					isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
				}`}>
				<div className="overflow-hidden">
					<div className="p-5 border-t border-slate-600">{children}</div>
				</div>
			</div>
		</div>
	);
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

export const SetupScreen: React.FC<SetupScreenProps> = ({
	onStart,
	onBack,
}) => {
	const [environment, setEnvironment] = useState<SocialEnvironment>(
		SocialEnvironment.CASUAL
	);
	const [customEnvironment, setCustomEnvironment] = useState("");
	const [aiCulture, setAiCulture] = useState("");
	const [selectedPersonalityTraits, setSelectedPersonalityTraits] = useState<
		AIPersonalityTrait[]
	>([]);
	const [customAiPersonality, setCustomAiPersonality] = useState<string>("");
	const [aiGender, setAiGender] = useState<AIGender>(AIGender.RANDOM);
	const [aiName, setAiName] = useState<string>("");
	const [nameError, setNameError] = useState<string | null>(null);
	const [personalityError, setPersonalityError] = useState<string | null>(null);
	const [customContext, setCustomContext] = useState<string>("");
	const [conversationGoal, setConversationGoal] = useState<string>("");
	const [aiAgeBracket, setAiAgeBracket] = useState<AIAgeBracket>(
		AIAgeBracket.NOT_SPECIFIED
	);
	const [customAiAgeString, setCustomAiAgeString] = useState<string>("");
	const [customAgeError, setCustomAgeError] = useState<string | null>(null);
	const [provideUserName, setProvideUserName] = useState(false);
	const [userName, setUserName] = useState("");

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		let finalAiName = aiName.trim();
		if (!finalAiName) finalAiName = generateRandomAiName(aiGender, aiCulture);

		if (finalAiName.length > 50) {
			setNameError("AI name cannot exceed 50 characters.");
			return;
		}
		setNameError(null);

		if (
			selectedPersonalityTraits.length === 0 &&
			customAiPersonality.trim() === ""
		) {
			setPersonalityError(
				"Please select at least one personality trait or provide a custom personality description."
			);
			document
				.getElementById("ai-personality-section")
				?.scrollIntoView({ behavior: "smooth" });
			return;
		}
		setPersonalityError(null);

		let finalCustomAiAge: number | undefined = undefined;
		if (aiAgeBracket === AIAgeBracket.CUSTOM) {
			if (customAiAgeString.trim() === "") {
				setCustomAgeError("Custom age cannot be empty.");
				return;
			}
			const ageNum = parseInt(customAiAgeString, 10);
			if (isNaN(ageNum) || ageNum < 18 || ageNum > 100) {
				setCustomAgeError("Please enter a valid age (18-100).");
				return;
			}
			finalCustomAiAge = ageNum;
		}
		if (customAgeError) return;

		const userScenarioDetails: UserScenarioDetails =
			provideUserName && userName.trim() ? { userName: userName.trim() } : {};

		onStart(
			{
				environment,
				customEnvironment:
					environment === SocialEnvironment.CUSTOM
						? customEnvironment.trim() || undefined
						: undefined,
				aiCulture: aiCulture.trim() || undefined,
				aiPersonalityTraits: selectedPersonalityTraits,
				customAiPersonality: customAiPersonality.trim() || undefined,
				aiGender,
				aiName: finalAiName,
				aiAgeBracket: aiAgeBracket,
				customAiAge: finalCustomAiAge,
				customContext: customContext.trim() || undefined,
				conversationGoal: conversationGoal.trim() || undefined,
			},
			userScenarioDetails
		);
	};

	const handleCustomAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setCustomAiAgeString(value);
		if (value.trim() === "") {
			setCustomAgeError(null);
			return;
		}
		const ageNum = parseInt(value, 10);
		if (isNaN(ageNum) || ageNum < 18 || ageNum > 100) {
			setCustomAgeError("Please enter a valid age (18-100).");
		} else {
			setCustomAgeError(null);
		}
	};

	const handlePersonalityTraitToggle = (trait: AIPersonalityTrait) => {
		setSelectedPersonalityTraits((prev) => {
			const isSelected = prev.includes(trait);
			if (isSelected) return prev.filter((t) => t !== trait);
			if (prev.length < MAX_PERSONALITY_TRAITS) return [...prev, trait];
			return prev;
		});
		setPersonalityError(null);
	};

	return (
		<motion.div
			layout
			transition={{ type: "spring", stiffness: 120, damping: 18, mass: 0.9 }}
			className="w-full max-w-3xl p-6 md:p-8 bg-slate-900/70 border border-slate-700 backdrop-blur-lg rounded-xl shadow-2xl space-y-6 opacity-0 animate-[fadeIn_0.3s_ease-out_forwards] my-4">
			<div className="flex items-center gap-4 mb-4">
				<button
					type="button"
					onClick={onBack}
					className="p-2 rounded-full hover:bg-slate-700 transition-colors">
					<ArrowLeftIcon className="h-6 w-6 text-slate-300" />
				</button>
				<h1 className="text-3xl md:text-4xl font-bold text-teal-400 drop-shadow-md">
					Advanced Setup
				</h1>
			</div>

			<form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto">
				<AccordionSection
					title="AI Persona"
					defaultOpen={true}
					error={nameError || customAgeError}>
					<div className="space-y-6">
						<div>
							<label className="block text-md font-medium text-gray-300 mb-2">
								Gender
							</label>
							<div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
								{(Object.values(AIGender) as AIGender[]).map((g) => (
									<OptionButton
										key={g}
										value={g}
										isSelected={aiGender === g}
										onChange={(value) => setAiGender(value)}>
										{g}
									</OptionButton>
								))}
							</div>
						</div>

						<div>
							<label className="block text-md font-medium text-gray-300 mb-2">
								Age
							</label>
							<div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
								{(Object.values(AIAgeBracket) as AIAgeBracket[]).map((age) => (
									<OptionButton
										key={age}
										value={age}
										isSelected={aiAgeBracket === age}
										onChange={(value) => setAiAgeBracket(value)}>
										{age}
									</OptionButton>
								))}
							</div>
							{aiAgeBracket === AIAgeBracket.CUSTOM && (
								<div className="mt-3">
									<input
										type="number"
										value={customAiAgeString}
										onChange={handleCustomAgeChange}
										placeholder="Enter age (18-100)"
										className={`w-full p-3 bg-slate-600 text-gray-200 rounded-lg focus:outline-none focus:ring-2 ${
											customAgeError ? "ring-red-500" : "focus:ring-teal-500"
										}`}
									/>
									<div className="mt-2 flex items-start gap-2 text-xs text-slate-400">
										<InfoIcon className="h-4 w-4 flex-shrink-0 mt-0.5 text-sky-400" />
										<p>
											Provide a specific age for the AI between 18 and 100. This
											will influence its personality, vocabulary, and
											perspectives.
										</p>
									</div>
								</div>
							)}
						</div>

						<div>
							<label className="block text-md font-medium text-gray-300 mb-2">
								Name
							</label>
							<div className="flex items-start space-x-2">
								<div className="flex-grow">
									<input
										type="text"
										value={aiName}
										onChange={(e) => setAiName(e.target.value)}
										placeholder="Leave blank for random"
										className={`w-full p-3 bg-slate-600 text-gray-200 rounded-lg focus:outline-none focus:ring-2 ${
											nameError ? "ring-red-500" : "focus:ring-teal-500"
										}`}
									/>
								</div>
								<button
									type="button"
									onClick={() =>
										setAiName(generateRandomAiName(aiGender, aiCulture))
									}
									className="p-3 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-lg text-sm transition-colors duration-150 h-[48px] flex-shrink-0"
									title="Suggest a random name">
									Suggest
								</button>
							</div>
						</div>

						<div>
							<label className="block text-md font-medium text-gray-300 mb-2">
								Culture/Race (Optional)
							</label>
							<input
								type="text"
								value={aiCulture}
								onChange={(e) => setAiCulture(e.target.value)}
								placeholder="E.g., Japanese, Italian-American, Nigerian..."
								className="w-full p-3 bg-slate-600 text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
							/>
							<div className="mt-2 flex items-start gap-2 text-xs text-slate-400">
								<InfoIcon className="h-4 w-4 flex-shrink-0 mt-0.5 text-sky-400" />
								<p>
									Specify a cultural or racial background. This can influence
									its name, appearance, and communication style. Examples:
									'Japanese', 'Italian-American', 'Nigerian'.
								</p>
							</div>
						</div>
					</div>
				</AccordionSection>

				<AccordionSection
					title={`Trait Palette (Selected ${selectedPersonalityTraits.length}/${MAX_PERSONALITY_TRAITS})`}
					error={personalityError}
					id="ai-personality-section">
					<div className="space-y-4">
						{orderedPersonalityCategories.map((category) => (
							<div key={category}>
								<h3 className="text-md font-semibold text-teal-300 mb-2 border-b border-slate-600 pb-1">
									{category}
								</h3>
								<div className="flex flex-wrap gap-2">
									{personalityCategories[category].map((p) => {
										const isSelected = selectedPersonalityTraits.includes(p);
										return (
											<Tooltip
												key={p}
												content={personalityTraitDescriptions[p] || p}>
												<button
													type="button"
													data-testid={`trait-button-${p}`}
													style={{ zIndex: 10 }}
													onClick={() => handlePersonalityTraitToggle(p)}
													className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all transform hover:scale-105 ${
														isSelected
															? "bg-teal-500 text-white ring-2 ring-teal-300"
															: "bg-slate-600 hover:bg-slate-500"
													} ${
														!isSelected &&
														selectedPersonalityTraits.length >=
															MAX_PERSONALITY_TRAITS
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
					<div className="mt-6">
						<p className="text-sm text-slate-400 mb-2">
							You may also type in your own custom personality description below
							if you prefer.
						</p>
						<textarea
							value={customAiPersonality}
							onChange={(e) => {
								if (e.target.value.length <= MAX_CUSTOM_PERSONALITY_LENGTH)
									setCustomAiPersonality(e.target.value);
							}}
							placeholder="Type your own personality description here..."
							className="w-full p-3 bg-slate-600 text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 min-h-[80px] text-sm"
							rows={2}
							maxLength={MAX_CUSTOM_PERSONALITY_LENGTH}
						/>
						<p className="text-xs text-right text-gray-400 mt-1 flex-shrink-0">
							{customAiPersonality.length}/{MAX_CUSTOM_PERSONALITY_LENGTH}
						</p>
					</div>
				</AccordionSection>

				<AccordionSection title="Scenario & Goal">
					<div className="space-y-6">
						<div>
							<label className="block text-md font-medium text-gray-300 mb-2">
								Social Environment
							</label>
							<div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
								{(Object.values(SocialEnvironment) as SocialEnvironment[]).map(
									(env) => (
										<OptionButton
											key={env}
											value={env}
											isSelected={environment === env}
											onChange={(value) => setEnvironment(value)}>
											{env}
										</OptionButton>
									)
								)}
							</div>
							{environment === SocialEnvironment.CUSTOM && (
								<div className="mt-3">
									<textarea
										value={customEnvironment}
										onChange={(e) => {
											if (e.target.value.length <= MAX_CUSTOM_ENV_LENGTH)
												setCustomEnvironment(e.target.value);
										}}
										placeholder="Describe the custom environment..."
										className="w-full p-3 bg-slate-600 text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 min-h-[70px] text-sm"
										rows={2}
										maxLength={MAX_CUSTOM_ENV_LENGTH}
									/>
									<div className="flex justify-between items-start">
										<div className="mt-2 flex items-start gap-2 text-xs text-slate-400 flex-grow">
											<InfoIcon className="h-4 w-4 flex-shrink-0 mt-0.5 text-sky-400" />
											<p>
												Describe the specific place where the interaction
												happens. Example: 'A bustling, noisy airport terminal
												near the departure gates.'
											</p>
										</div>
										<p className="text-xs text-right text-gray-400 mt-1 flex-shrink-0">
											{customEnvironment.length}/{MAX_CUSTOM_ENV_LENGTH}
										</p>
									</div>
								</div>
							)}
						</div>

						<div>
							<label className="block text-md font-medium text-gray-300 mb-2">
								Conversation Goal (Optional)
							</label>
							<textarea
								value={conversationGoal}
								onChange={(e) => {
									if (e.target.value.length <= MAX_CONVERSATION_GOAL_LENGTH)
										setConversationGoal(e.target.value);
								}}
								placeholder="E.g., Ask for a date, negotiate a better price..."
								className="w-full p-3 bg-slate-600 text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 min-h-[80px] text-sm"
								rows={2}
								maxLength={MAX_CONVERSATION_GOAL_LENGTH}
							/>
							<div className="mt-3">
								<InfoCard
									Icon={TargetIcon}
									title="Example Goal"
									description="“Convince your boss, who is feeling stressed, to give you a raise.”"
								/>
							</div>
						</div>

						<div>
							<label className="block text-md font-medium text-gray-300 mb-2">
								Custom Scenario Details (Optional)
							</label>
							<textarea
								value={customContext}
								onChange={(e) => setCustomContext(e.target.value)}
								placeholder="Add specific background details for the AI..."
								className="w-full p-3 bg-slate-600 text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 min-h-[100px] text-sm"
								rows={3}
								maxLength={1000}
							/>
							<div className="mt-3">
								<InfoCard
									Icon={FastForwardIcon}
									title="Example Context for an Action"
									description={
										"Context like \"You are both walking out of the office building\" can trigger an 'Active Action' banner in the simulation."
									}
								/>
							</div>
						</div>
					</div>
				</AccordionSection>

				<AccordionSection title="User Identity (Optional)">
					<div className="space-y-4">
						<div>
							<label className="flex items-center gap-2">
								<input
									type="checkbox"
									checked={provideUserName}
									onChange={() => setProvideUserName((v) => !v)}
									className="form-checkbox h-5 w-5 text-teal-500"
								/>
								<span className="text-md font-medium text-gray-300">
									Provide your name?
								</span>
							</label>
							<p className="text-xs text-slate-400 mt-2">
								Only provide your name if you want the relationship to be
								prior-established. For natural, casual encounters, it's normal
								for neither party to know each other's name.
							</p>
						</div>
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
				</AccordionSection>

				<div className="flex flex-col sm:flex-row gap-4 mt-8 pt-4 border-t border-slate-700/60">
					<button
						type="button"
						onClick={onBack}
						className="w-full sm:w-auto flex-grow sm:flex-grow-0 px-8 py-4 bg-slate-600 hover:bg-slate-500 text-white font-bold rounded-lg text-lg shadow-md transition-transform duration-150 hover:scale-105">
						Back
					</button>
					<button
						type="submit"
						className="group w-full sm:w-auto flex-grow bg-teal-500 hover:bg-teal-400 text-white font-bold py-4 px-6 rounded-lg text-lg shadow-lg 
										transition-all duration-200 ease-in-out transform hover:scale-105 focus:outline-none 
										focus:ring-4 focus:ring-teal-300 focus:ring-opacity-50 flex items-center justify-center gap-2">
						<span>Start Interaction</span>
						<PlayIcon className="h-6 w-6 transition-transform group-hover:translate-x-1" />
					</button>
				</div>
			</form>
		</motion.div>
	);
};
