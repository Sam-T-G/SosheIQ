import React, { useState, useEffect } from "react";
import type { ScenarioDetails } from "../types";
import {
	SocialEnvironment,
	AIPersonalityTrait,
	AIGender,
	AIAgeBracket,
} from "../types";

interface SetupScreenProps {
	onStart: (details: ScenarioDetails) => void;
}

type NameInputMode = "manual" | "automatic";
type AgeConfigMode = "automatic" | "manual_select" | "manual_custom";
const MAX_PERSONALITY_TRAITS = 3;
const MAX_CUSTOM_PERSONALITY_LENGTH = 300;
const MAX_CONVERSATION_GOAL_LENGTH = 200;
const MAX_CUSTOM_ENV_LENGTH = 200;
const MAX_AI_CULTURE_LENGTH = 100;

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

interface OptionButtonProps<T extends string | NameInputMode | AgeConfigMode> {
	value: T;
	isSelected: boolean;
	onChange: (value: T) => void;
	children: React.ReactNode;
	className?: string;
	disabled?: boolean;
	title?: string;
}

const OptionButton = <T extends string | NameInputMode | AgeConfigMode>({
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
		className={`flex items-center justify-center text-center p-3 rounded-lg text-sm font-medium transition-all duration-200 ease-in-out transform focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-opacity-75
                ${
									disabled
										? "bg-slate-500 text-gray-400 cursor-not-allowed opacity-70"
										: isSelected
										? "bg-teal-500 text-white shadow-lg scale-105 ring-2 ring-teal-300"
										: "bg-slate-700 hover:bg-slate-600 text-gray-300 hover:shadow-md hover:scale-102"
								} ${className}`}>
		{children}
	</button>
);

interface SectionProps {
	title: string;
	children: React.ReactNode;
	animationDelay?: string;
	error?: string | null;
	id?: string;
}

const Section: React.FC<SectionProps> = ({
	title,
	children,
	animationDelay,
	error,
	id,
}) => (
	<div
		className="mb-8 p-6 bg-slate-700/50 rounded-lg shadow-inner opacity-0 animate-[fadeInSlideUp_0.5s_ease-out_forwards]"
		style={{ animationDelay }}
		aria-labelledby={id ? `${id}-title` : undefined}
		aria-describedby={error && id ? `${id}-error` : undefined}>
		<label
			id={id ? `${id}-title` : undefined}
			className="block text-xl font-semibold mb-4 text-teal-300">
			{title}:
		</label>
		{children}
		{error && id && (
			<p id={`${id}-error`} className="text-xs text-red-400 mt-2">
				{error}
			</p>
		)}
	</div>
);

const PREDEFINED_AI_MALE_FIRST_NAMES: string[] = [
	"Arthur",
	"David",
	"Ethan",
	"James",
	"John",
	"Liam",
	"Michael",
	"Noah",
	"Robert",
	"William",
	"Daniel",
	"Matthew",
	"Ryan",
	"Kevin",
	"Mark",
];
const PREDEFINED_AI_FEMALE_FIRST_NAMES: string[] = [
	"Anna",
	"Chloe",
	"Elizabeth",
	"Emily",
	"Emma",
	"Isabella",
	"Jennifer",
	"Linda",
	"Mary",
	"Olivia",
	"Sophia",
	"Ava",
	"Mia",
	"Grace",
	"Sarah",
];
const PREDEFINED_AI_NEUTRAL_FIRST_NAMES: string[] = [
	"Alex",
	"Jordan",
	"Casey",
	"Morgan",
	"Riley",
	"Skyler",
	"Cameron",
	"Drew",
	"Kai",
	"Phoenix",
	"River",
	"Sage",
	"Blake",
	"Jamie",
	"Taylor",
	"Avery",
	"Devin",
	"Emerson",
];
const PREDEFINED_AI_LAST_NAMES: string[] = [
	"Smith",
	"Jones",
	"Williams",
	"Brown",
	"Davis",
	"Miller",
	"Wilson",
	"Moore",
	"Taylor",
	"Chen",
	"Lee",
	"Garcia",
	"Rodriguez",
	"Martinez",
	"Kim",
	"Patel",
	"Singh",
	"Walker",
	"Hall",
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

export const SetupScreen: React.FC<SetupScreenProps> = ({ onStart }) => {
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
	const [nameInputMode, setNameInputMode] =
		useState<NameInputMode>("automatic");
	const [nameError, setNameError] = useState<string | null>(null);
	const [personalityError, setPersonalityError] = useState<string | null>(null);
	const [customContext, setCustomContext] = useState<string>("");
	const [conversationGoal, setConversationGoal] = useState<string>("");

	const [ageConfigMode, setAgeConfigMode] =
		useState<AgeConfigMode>("automatic");
	const [aiAgeBracket, setAiAgeBracket] = useState<AIAgeBracket>(
		AIAgeBracket.NOT_SPECIFIED
	);
	const [customAiAgeString, setCustomAiAgeString] = useState<string>("");
	const [customAgeError, setCustomAgeError] = useState<string | null>(null);

	const nameInputRef = React.useRef<HTMLInputElement>(null);
	const customPersonalityRef = React.useRef<HTMLTextAreaElement>(null);
	const customAgeRef = React.useRef<HTMLInputElement>(null);

	const handleSuggestName = () => {
		if (nameInputMode === "manual") {
			const newName = generateRandomAiName(aiGender);
			setAiName(newName);
			if (nameError) setNameError(null);
		}
	};

	const handleNameInputModeChange = (mode: NameInputMode) => {
		setNameInputMode(mode);
		if (mode === "automatic") {
			setAiName("");
			setNameError(null);
		} else {
			if (nameInputRef.current) {
				nameInputRef.current.focus();
			}
		}
	};

	const handleAgeConfigModeChange = (mode: AgeConfigMode) => {
		setAgeConfigMode(mode);
		if (mode === "automatic") {
			setAiAgeBracket(AIAgeBracket.NOT_SPECIFIED);
			setCustomAiAgeString("");
			setCustomAgeError(null);
		} else if (mode === "manual_select") {
			if (
				aiAgeBracket === AIAgeBracket.NOT_SPECIFIED ||
				aiAgeBracket === AIAgeBracket.CUSTOM
			) {
				setAiAgeBracket(AIAgeBracket.ADULT_30_39);
			}
			setCustomAiAgeString("");
			setCustomAgeError(null);
		} else {
			setAiAgeBracket(AIAgeBracket.CUSTOM);
			if (customAiAgeString.trim() === "" || customAgeError) {
				setCustomAiAgeString("");
			}
			if (customAgeRef.current) {
				customAgeRef.current.focus();
			}
		}
	};

	const handleAgeBracketSelect = (bracket: AIAgeBracket) => {
		setAiAgeBracket(bracket);
		setCustomAiAgeString("");
		setCustomAgeError(null);
	};

	const handleCustomAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setCustomAiAgeString(value);
		if (value.trim() === "") {
			setCustomAgeError(null);
			return;
		}
		const ageNum = parseInt(value, 10);
		if (isNaN(ageNum) || ageNum < 13 || ageNum > 100) {
			setCustomAgeError("Please enter a valid age (13-100).");
		} else {
			setCustomAgeError(null);
		}
	};

	const handlePersonalityTraitToggle = (trait: AIPersonalityTrait) => {
		setSelectedPersonalityTraits((prev) => {
			if (prev.includes(trait)) {
				return prev.filter((t) => t !== trait);
			}
			if (prev.length < MAX_PERSONALITY_TRAITS) {
				return [...prev, trait];
			}
			return prev; // Max reached, do not add
		});
		setPersonalityError(null); // Clear error on interaction
	};

	const handleCustomPersonalityChange = (
		e: React.ChangeEvent<HTMLTextAreaElement>
	) => {
		const value = e.target.value;
		if (value.length <= MAX_CUSTOM_PERSONALITY_LENGTH) {
			setCustomAiPersonality(value);
		}
		setPersonalityError(null); // Clear error on interaction
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		let finalAiName = aiName.trim();

		if (nameInputMode === "automatic") {
			finalAiName = generateRandomAiName(aiGender);
		} else {
			if (!finalAiName) finalAiName = generateRandomAiName(aiGender);
		}

		if (!finalAiName) {
			setNameError("AI name is required or could not be generated.");
			return;
		}
		if (finalAiName.length > 50) {
			setNameError("AI name cannot exceed 50 characters.");
			return;
		}
		if (nameError) setNameError(null);

		if (
			selectedPersonalityTraits.length === 0 &&
			customAiPersonality.trim() === ""
		) {
			setPersonalityError(
				"Please select at least one personality trait or provide a custom personality description."
			);
			const personalitySection = document.getElementById(
				"ai-personality-section"
			);
			if (personalitySection)
				personalitySection.scrollIntoView({ behavior: "smooth" });
			return;
		}
		if (personalityError) setPersonalityError(null);

		let finalAiAgeBracket: AIAgeBracket | undefined = aiAgeBracket;
		let finalCustomAiAge: number | undefined = undefined;

		if (ageConfigMode === "automatic") {
			finalAiAgeBracket = AIAgeBracket.NOT_SPECIFIED;
		} else if (ageConfigMode === "manual_custom") {
			if (customAgeError || customAiAgeString.trim() === "") {
				setCustomAgeError(
					customAiAgeString.trim() === ""
						? "Custom age cannot be empty."
						: "Please enter a valid age (13-100)."
				);
				if (customAgeRef.current) customAgeRef.current.focus();
				return;
			}
			const ageNum = parseInt(customAiAgeString, 10);
			if (isNaN(ageNum) || ageNum < 13 || ageNum > 100) {
				setCustomAgeError(
					"Invalid custom age. Please enter between 13 and 100."
				);
				if (customAgeRef.current) customAgeRef.current.focus();
				return;
			}
			finalCustomAiAge = ageNum;
			finalAiAgeBracket = AIAgeBracket.CUSTOM;
		} else {
			if (
				finalAiAgeBracket === AIAgeBracket.NOT_SPECIFIED ||
				finalAiAgeBracket === AIAgeBracket.CUSTOM
			) {
				finalAiAgeBracket = AIAgeBracket.ADULT_30_39;
			}
		}
		if (customAgeError) return;

		onStart({
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
			aiAgeBracket: finalAiAgeBracket,
			customAiAge: finalCustomAiAge,
			customContext: customContext.trim() || undefined,
			conversationGoal: conversationGoal.trim() || undefined,
		});
	};

	const sectionBaseDelay = 0.2;
	const sectionDelayIncrement = 0.1;

	const ageBracketOptions = (
		Object.values(AIAgeBracket) as AIAgeBracket[]
	).filter(
		(age) => age !== AIAgeBracket.NOT_SPECIFIED && age !== AIAgeBracket.CUSTOM
	);

	const allSocialEnvironments = Object.values(
		SocialEnvironment
	) as SocialEnvironment[];

	return (
		<div className="w-full max-w-3xl p-6 md:p-10 bg-slate-800 rounded-xl shadow-2xl space-y-6 opacity-0 animate-[fadeIn_0.3s_ease-out_forwards]">
			<h1
				className="text-4xl md:text-5xl font-bold text-center text-teal-400 mb-6 drop-shadow-md opacity-0 animate-[fadeInSlideUp_0.5s_ease-out_forwards]"
				style={{ animationDelay: "0.1s" }}>
				Advanced Interaction Setup
			</h1>
			<p
				className="text-center text-gray-400 mb-10 text-lg opacity-0 animate-[fadeInSlideUp_0.5s_ease-out_forwards]"
				style={{ animationDelay: "0.2s" }}>
				Fine-tune every aspect of the AI's persona and scenario.
			</p>
			<form onSubmit={handleSubmit} className="space-y-6">
				<Section
					title="AI Gender"
					animationDelay={`${sectionBaseDelay + sectionDelayIncrement * 0}s`}>
					<div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
						{(Object.values(AIGender) as AIGender[]).map((gender) => (
							<OptionButton<AIGender>
								key={gender}
								value={gender}
								isSelected={aiGender === gender}
								onChange={setAiGender}>
								{gender}
							</OptionButton>
						))}
					</div>
				</Section>

				<Section
					title="AI Culture/Race (Optional)"
					animationDelay={`${sectionBaseDelay + sectionDelayIncrement * 1}s`}>
					<input
						type="text"
						value={aiCulture}
						onChange={(e) => {
							if (e.target.value.length <= MAX_AI_CULTURE_LENGTH)
								setAiCulture(e.target.value);
						}}
						placeholder="E.g., 'Japanese salaryman', 'Italian grandmother', 'Nigerian student abroad'. Leave blank for random."
						className={`w-full p-3 bg-slate-600 text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500`}
						maxLength={MAX_AI_CULTURE_LENGTH}
					/>
					<p className="text-xs text-gray-400 mt-1">
						Provide cultural or racial context to add nuance to the AI's
						persona, communication style, and appearance. ({aiCulture.length}/
						{MAX_AI_CULTURE_LENGTH})
					</p>
				</Section>

				<Section
					title="AI Name"
					animationDelay={`${sectionBaseDelay + sectionDelayIncrement * 2}s`}
					error={nameError}
					id="ai-name-section">
					<div className="grid grid-cols-2 gap-3 mb-3">
						<OptionButton<NameInputMode>
							value="manual"
							isSelected={nameInputMode === "manual"}
							onChange={handleNameInputModeChange}>
							Enter Name Manually
						</OptionButton>
						<OptionButton<NameInputMode>
							value="automatic"
							isSelected={nameInputMode === "automatic"}
							onChange={handleNameInputModeChange}>
							Generate Name on Start
						</OptionButton>
					</div>
					<div className="flex items-start space-x-2">
						<div className="flex-grow">
							<input
								ref={nameInputRef}
								type="text"
								value={aiName}
								onChange={(e) => {
									if (nameInputMode === "manual") {
										setAiName(e.target.value);
										if (nameError && e.target.value.trim()) setNameError(null);
										if (
											e.target.value.length <= 50 &&
											nameError === "AI name cannot exceed 50 characters."
										)
											setNameError(null);
									}
								}}
								placeholder={
									nameInputMode === "manual"
										? "E.g., Alex, Dr. Evelyn Reed"
										: "[Name will be auto-generated on start]"
								}
								className={`w-full p-3 bg-slate-600 text-gray-200 rounded-lg focus:outline-none focus:ring-2 
                                ${
																	nameError && nameInputMode === "manual"
																		? "ring-red-500"
																		: "focus:ring-teal-500"
																}
                                ${
																	nameInputMode === "automatic"
																		? "cursor-not-allowed opacity-70"
																		: ""
																}`}
								maxLength={51}
								aria-describedby={
									nameError && nameInputMode === "manual"
										? "name-error-desc"
										: "name-helper"
								}
								aria-invalid={!!nameError && nameInputMode === "manual"}
								disabled={nameInputMode === "automatic"}
							/>
							{nameError && nameInputMode === "manual" && (
								<p id="name-error-desc" className="text-xs text-red-400 mt-1">
									{nameError}
								</p>
							)}
						</div>
						{nameInputMode === "manual" && (
							<button
								type="button"
								onClick={handleSuggestName}
								className="p-3 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-lg text-sm transition-colors duration-150 h-[48px] flex-shrink-0"
								title="Suggest a random name (considers selected gender)">
								Suggest
							</button>
						)}
					</div>
				</Section>

				<Section
					title="AI Age"
					animationDelay={`${sectionBaseDelay + sectionDelayIncrement * 3}s`}
					error={customAgeError}
					id="ai-age-section">
					<div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
						<OptionButton<AgeConfigMode>
							value="automatic"
							isSelected={ageConfigMode === "automatic"}
							onChange={handleAgeConfigModeChange}
							title="AI age will be general adult or adapt to context.">
							Auto-Select Age
						</OptionButton>
						<OptionButton<AgeConfigMode>
							value="manual_select"
							isSelected={ageConfigMode === "manual_select"}
							onChange={handleAgeConfigModeChange}
							title="Choose from predefined age brackets.">
							Select Bracket
						</OptionButton>
						<OptionButton<AgeConfigMode>
							value="manual_custom"
							isSelected={ageConfigMode === "manual_custom"}
							onChange={handleAgeConfigModeChange}
							title="Enter a specific age for the AI.">
							Enter Custom Age
						</OptionButton>
					</div>
					{ageConfigMode === "manual_select" && (
						<div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
							{ageBracketOptions.map((ageOpt) => (
								<OptionButton<AIAgeBracket>
									key={ageOpt}
									value={ageOpt}
									isSelected={aiAgeBracket === ageOpt}
									onChange={() =>
										handleAgeBracketSelect(ageOpt as AIAgeBracket)
									}
									className="text-xs sm:text-sm py-2 px-2.5"
									disabled={ageConfigMode !== "manual_select"}>
									{ageOpt}
								</OptionButton>
							))}
						</div>
					)}
					{ageConfigMode === "manual_custom" && (
						<div className="mt-2">
							<input
								ref={customAgeRef}
								type="number"
								value={customAiAgeString}
								onChange={handleCustomAgeChange}
								placeholder="Enter age (13-100)"
								className={`w-full p-3 bg-slate-600 text-gray-200 rounded-lg focus:outline-none focus:ring-2 
                            ${
															customAgeError
																? "ring-red-500"
																: "focus:ring-teal-500"
														}`}
								min="13"
								max="100"
								aria-invalid={!!customAgeError}
								disabled={ageConfigMode !== "manual_custom"}
							/>
						</div>
					)}
				</Section>

				<Section
					title="Social Environment"
					animationDelay={`${sectionBaseDelay + sectionDelayIncrement * 4}s`}>
					<div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
						{allSocialEnvironments.map((env) => (
							<OptionButton<SocialEnvironment>
								key={env}
								value={env}
								isSelected={environment === env}
								onChange={setEnvironment}>
								{env}
							</OptionButton>
						))}
					</div>
					{environment === SocialEnvironment.CUSTOM && (
						<div className="mt-4">
							<textarea
								value={customEnvironment}
								onChange={(e) => {
									if (e.target.value.length <= MAX_CUSTOM_ENV_LENGTH)
										setCustomEnvironment(e.target.value);
								}}
								placeholder="Describe the custom environment... e.g., 'A quiet library where speaking too loudly is discouraged.'"
								className="w-full p-3 bg-slate-600 text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 min-h-[70px] text-sm"
								rows={2}
								maxLength={MAX_CUSTOM_ENV_LENGTH}
							/>
							<p className="text-xs text-right text-gray-400 mt-1">
								{customEnvironment.length}/{MAX_CUSTOM_ENV_LENGTH}
							</p>
						</div>
					)}
				</Section>

				<Section
					title={`AI Personality Traits (Selected ${selectedPersonalityTraits.length}/${MAX_PERSONALITY_TRAITS})`}
					animationDelay={`${sectionBaseDelay + sectionDelayIncrement * 5}s`}
					error={personalityError}
					id="ai-personality-section">
					<div className="space-y-4">
						{orderedPersonalityCategories.map((category) => (
							<div key={category}>
								<h3 className="text-md font-semibold text-teal-300 mb-2 border-b border-slate-600 pb-1">
									{category}
								</h3>
								<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
									{personalityCategories[category].map((p) => {
										const isSelected = selectedPersonalityTraits.includes(p);
										return (
											<button
												key={p}
												type="button"
												onClick={() => {
													if (isSelected) {
														handlePersonalityTraitToggle(p);
													} else if (
														selectedPersonalityTraits.length <
														MAX_PERSONALITY_TRAITS
													) {
														handlePersonalityTraitToggle(p);
													}
												}}
												className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
													isSelected
														? "bg-teal-500 text-white ring-2 ring-teal-300"
														: "bg-slate-700 hover:bg-slate-600"
												} ${
													!isSelected &&
													selectedPersonalityTraits.length >=
														MAX_PERSONALITY_TRAITS
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
					<div className="mt-6">
						<label
							htmlFor="customAiPersonality"
							className="block text-md font-medium text-teal-300 mb-2">
							Custom AI Personality (Optional, you may also add unlisted traits
							here)
						</label>
						<textarea
							ref={customPersonalityRef}
							id="customAiPersonality"
							value={customAiPersonality}
							onChange={handleCustomPersonalityChange}
							placeholder="E.g., 'A grumpy old librarian who secretly loves cats', 'A nervous first-time public speaker who stutters a bit', 'An overly enthusiastic salesperson who uses a lot of exclamation marks!!!'"
							className="w-full p-3 bg-slate-600 text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 min-h-[100px] text-sm"
							rows={3}
							maxLength={MAX_CUSTOM_PERSONALITY_LENGTH + 10}
						/>
						<p className="text-xs text-gray-400 mt-1">
							({customAiPersonality.length}/{MAX_CUSTOM_PERSONALITY_LENGTH})
						</p>
					</div>
				</Section>

				<Section
					title="Conversation Goal (Optional)"
					animationDelay={`${sectionBaseDelay + sectionDelayIncrement * 6}s`}>
					<textarea
						value={conversationGoal}
						onChange={(e) => {
							if (e.target.value.length <= MAX_CONVERSATION_GOAL_LENGTH) {
								setConversationGoal(e.target.value);
							}
						}}
						placeholder="E.g., 'Ask for a date', 'Convince the AI to agree with my point on a topic', 'Negotiate a lower price for an item', 'Get an extension on a deadline'."
						className="w-full p-3 bg-slate-600 text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 min-h-[100px] text-sm"
						rows={3}
						maxLength={MAX_CONVERSATION_GOAL_LENGTH}
						aria-label="Conversation goal"
					/>
					<p className="text-xs text-gray-400 mt-1">
						({conversationGoal.length}/{MAX_CONVERSATION_GOAL_LENGTH})
					</p>
				</Section>

				<Section
					title="Custom Scenario Details (Optional)"
					animationDelay={`${sectionBaseDelay + sectionDelayIncrement * 7}s`}>
					<textarea
						value={customContext}
						onChange={(e) => setCustomContext(e.target.value)}
						placeholder="E.g., You are at a company holiday party. You recently received a promotion, and the AI is your direct competitor who also wanted that promotion. Or, you're on a first date set up by a mutual friend, and the AI knows this friend well..."
						className="w-full p-3 bg-slate-600 text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 min-h-[100px] text-sm"
						rows={4}
						maxLength={1000}
						aria-label="Custom scenario details"
					/>
				</Section>

				<button
					type="submit"
					className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-4 px-6 rounded-lg text-xl shadow-lg 
                     transition-all duration-200 ease-in-out transform hover:scale-105 hover:shadow-xl 
                     focus:outline-none focus:ring-4 focus:ring-green-400 focus:ring-opacity-50
                     opacity-0 animate-[fadeInSlideUp_0.5s_ease-out_forwards]"
					style={{
						animationDelay: `${sectionBaseDelay + sectionDelayIncrement * 8}s`,
					}}>
					Start Interaction
				</button>
			</form>
		</div>
	);
};
