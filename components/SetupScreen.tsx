import React, { useState } from "react";
import type { ScenarioDetails } from "../types";
import {
	SocialEnvironment,
	AIPersonality,
	PowerDynamic,
	AIGender,
	AIAgeBracket,
} from "../types";

interface SetupScreenProps {
	onStart: (details: ScenarioDetails) => void;
}

type NameInputMode = "manual" | "automatic";
type AgeConfigMode = "automatic" | "manual_select" | "manual_custom";

interface OptionButtonProps<T extends string | NameInputMode | AgeConfigMode> {
	value: T;
	selectedValue: T | AIAgeBracket; // Allow AIAgeBracket for age bracket buttons
	onChange: (value: T) => void;
	children: React.ReactNode;
	className?: string;
	disabled?: boolean;
	title?: string;
}

const OptionButton = <T extends string | NameInputMode | AgeConfigMode>({
	value,
	selectedValue,
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
		className={`p-3 m-1 rounded-lg text-sm font-medium transition-all duration-200 ease-in-out transform focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-opacity-75
                ${
									disabled
										? "bg-slate-500 text-gray-400 cursor-not-allowed"
										: selectedValue === value
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
}

const Section: React.FC<SectionProps> = ({
	title,
	children,
	animationDelay,
}) => (
	<div
		className="mb-8 p-6 bg-slate-700/50 rounded-lg shadow-inner opacity-0 animate-[fadeInSlideUp_0.5s_ease-out_forwards]"
		style={{ animationDelay }}>
		<label className="block text-xl font-semibold mb-4 text-teal-300">
			{title}:
		</label>
		{children}
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
		case AIGender.PREFER_NOT_TO_SPECIFY:
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
		SocialEnvironment.SOCIAL_GATHERING
	);
	const [aiPersonality, setAiPersonality] = useState<AIPersonality>(
		AIPersonality.FRIENDLY_SUPPORTIVE
	);
	const [powerDynamic, setPowerDynamic] = useState<PowerDynamic>(
		PowerDynamic.PEERS_EQUAL_FOOTING
	);
	const [aiGender, setAiGender] = useState<AIGender>(
		AIGender.PREFER_NOT_TO_SPECIFY
	);
	const [aiName, setAiName] = useState<string>("");
	const [nameInputMode, setNameInputMode] =
		useState<NameInputMode>("automatic");
	const [nameError, setNameError] = useState<string | null>(null);
	const [customContext, setCustomContext] = useState<string>("");

	const [ageConfigMode, setAgeConfigMode] =
		useState<AgeConfigMode>("automatic");
	const [aiAgeBracket, setAiAgeBracket] = useState<AIAgeBracket>(
		AIAgeBracket.NOT_SPECIFIED
	);
	const [customAiAgeString, setCustomAiAgeString] = useState<string>("");
	const [customAgeError, setCustomAgeError] = useState<string | null>(null);

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
				setAiAgeBracket(AIAgeBracket.ADULT_30_39); // Default to a common bracket
			}
			setCustomAiAgeString("");
			setCustomAgeError(null);
		} else {
			// manual_custom
			setAiAgeBracket(AIAgeBracket.CUSTOM); // Mark as custom
			// If custom age input was empty or invalid, clear it or keep the error
			if (customAiAgeString.trim() === "" || customAgeError) {
				setCustomAiAgeString("");
			}
		}
	};

	const handleAgeBracketSelect = (bracket: AIAgeBracket) => {
		setAiAgeBracket(bracket);
		setCustomAiAgeString(""); // Clear custom age if a bracket is selected
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
				return;
			}
			const ageNum = parseInt(customAiAgeString, 10);
			if (isNaN(ageNum) || ageNum < 13 || ageNum > 100) {
				// Re-validate just in case
				setCustomAgeError(
					"Invalid custom age. Please enter between 13 and 100."
				);
				return;
			}
			finalCustomAiAge = ageNum;
			finalAiAgeBracket = AIAgeBracket.CUSTOM;
		} else {
			// manual_select
			if (
				finalAiAgeBracket === AIAgeBracket.NOT_SPECIFIED ||
				finalAiAgeBracket === AIAgeBracket.CUSTOM
			) {
				finalAiAgeBracket = AIAgeBracket.ADULT_30_39;
			}
		}
		if (customAgeError) return;

		const finalCustomContext = customContext.trim() || undefined;

		onStart({
			environment,
			aiPersonality,
			powerDynamic,
			aiGender,
			aiName: finalAiName,
			aiAgeBracket: finalAiAgeBracket,
			customAiAge: finalCustomAiAge,
			customContext: finalCustomContext,
		});
	};

	const sectionBaseDelay = 0.2;
	const sectionDelayIncrement = 0.1;

	const ageBracketOptions = (
		Object.values(AIAgeBracket) as AIAgeBracket[]
	).filter(
		(age) => age !== AIAgeBracket.NOT_SPECIFIED && age !== AIAgeBracket.CUSTOM
	);

	return (
		<div className="w-full max-w-3xl p-6 md:p-10 bg-slate-800 rounded-xl shadow-2xl space-y-6 opacity-0 animate-[fadeIn_0.3s_ease-out_forwards]">
			<h1
				className="text-4xl md:text-5xl font-bold text-center text-teal-400 mb-6 drop-shadow-md opacity-0 animate-[fadeInSlideUp_0.5s_ease-out_forwards]"
				style={{ animationDelay: "0.1s" }}>
				Configure Your Interaction
			</h1>
			<p
				className="text-center text-gray-400 mb-10 text-lg opacity-0 animate-[fadeInSlideUp_0.5s_ease-out_forwards]"
				style={{ animationDelay: "0.2s" }}>
				Set up the AI's persona and scenario to practice specific social skills
				with SosheIQ.
			</p>
			<form onSubmit={handleSubmit} className="space-y-6">
				<Section title="AI Gender" animationDelay={`${sectionBaseDelay}s`}>
					<div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
						{(Object.values(AIGender) as AIGender[]).map((gender) => (
							<OptionButton<AIGender>
								key={gender}
								value={gender}
								selectedValue={aiGender}
								onChange={setAiGender}>
								{gender}
							</OptionButton>
						))}
					</div>
				</Section>

				<Section
					title="AI Name"
					animationDelay={`${sectionBaseDelay + sectionDelayIncrement * 1}s`}>
					<div className="grid grid-cols-2 gap-3 mb-3">
						<OptionButton<NameInputMode>
							value="manual"
							selectedValue={nameInputMode}
							onChange={handleNameInputModeChange}>
							Enter Name Manually
						</OptionButton>
						<OptionButton<NameInputMode>
							value="automatic"
							selectedValue={nameInputMode}
							onChange={handleNameInputModeChange}>
							Generate Name on Start
						</OptionButton>
					</div>
					<div className="flex items-start space-x-2">
						<div className="flex-grow">
							<input
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
										? "name-error"
										: "name-helper"
								}
								aria-invalid={!!nameError && nameInputMode === "manual"}
								disabled={nameInputMode === "automatic"}
							/>
							{nameError && nameInputMode === "manual" && (
								<p id="name-error" className="text-xs text-red-400 mt-1">
									{nameError}
								</p>
							)}
							{nameInputMode === "manual" && !nameError && (
								<p id="name-helper" className="text-xs text-gray-400 mt-1">
									Enter a name or use 'Suggest' (max 50 chars). Suggestion
									considers gender.
								</p>
							)}
							{nameInputMode === "automatic" && (
								<p id="name-helper-auto" className="text-xs text-gray-400 mt-1">
									AI name will be generated based on gender when you start the
									interaction.
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
					animationDelay={`${sectionBaseDelay + sectionDelayIncrement * 2}s`}>
					<div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
						<OptionButton<AgeConfigMode>
							value="automatic"
							selectedValue={ageConfigMode}
							onChange={handleAgeConfigModeChange}
							title="AI age will be general adult or adapt to context.">
							Auto-Select Age
						</OptionButton>
						<OptionButton<AgeConfigMode>
							value="manual_select"
							selectedValue={ageConfigMode}
							onChange={handleAgeConfigModeChange}
							title="Choose from predefined age brackets.">
							Select Bracket
						</OptionButton>
						<OptionButton<AgeConfigMode>
							value="manual_custom"
							selectedValue={ageConfigMode}
							onChange={handleAgeConfigModeChange}
							title="Enter a specific age for the AI.">
							Enter Custom Age
						</OptionButton>
					</div>

					{ageConfigMode === "manual_select" && (
						<>
							<div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
								{ageBracketOptions.map((ageOpt) => (
									<OptionButton<AIAgeBracket>
										key={ageOpt}
										value={ageOpt}
										selectedValue={aiAgeBracket}
										onChange={() => handleAgeBracketSelect(ageOpt)}
										disabled={ageConfigMode !== "manual_select"}>
										{ageOpt}
									</OptionButton>
								))}
							</div>
							<p className="text-xs text-gray-400 mt-2">
								Select an age bracket to influence AI's persona, language, and
								appearance.
							</p>
						</>
					)}

					{ageConfigMode === "manual_custom" && (
						<div className="mt-2">
							<input
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
								aria-describedby={
									customAgeError ? "custom-age-error" : undefined
								}
								aria-invalid={!!customAgeError}
								disabled={ageConfigMode !== "manual_custom"}
							/>
							{customAgeError && (
								<p id="custom-age-error" className="text-xs text-red-400 mt-1">
									{customAgeError}
								</p>
							)}
							{!customAgeError && (
								<p className="text-xs text-gray-400 mt-1">
									Enter a specific age between 13 and 100.
								</p>
							)}
						</div>
					)}
					{ageConfigMode === "automatic" && (
						<p className="text-xs text-gray-400 mt-2">
							AI will generally adopt an adult persona unless context implies
							otherwise.
						</p>
					)}
				</Section>

				<Section
					title="Social Environment"
					animationDelay={`${sectionBaseDelay + sectionDelayIncrement * 3}s`}>
					<div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
						{(Object.values(SocialEnvironment) as SocialEnvironment[]).map(
							(env) => (
								<OptionButton<SocialEnvironment>
									key={env}
									value={env}
									selectedValue={environment}
									onChange={setEnvironment}>
									{env}
								</OptionButton>
							)
						)}
					</div>
				</Section>

				<Section
					title="AI Personality"
					animationDelay={`${sectionBaseDelay + sectionDelayIncrement * 4}s`}>
					<div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
						{(Object.values(AIPersonality) as AIPersonality[]).map((pers) => (
							<OptionButton<AIPersonality>
								key={pers}
								value={pers}
								selectedValue={aiPersonality}
								onChange={setAiPersonality}>
								{pers}
							</OptionButton>
						))}
					</div>
				</Section>

				<Section
					title="Power Dynamic"
					animationDelay={`${sectionBaseDelay + sectionDelayIncrement * 5}s`}>
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
						{(Object.values(PowerDynamic) as PowerDynamic[]).map((dyn) => (
							<OptionButton<PowerDynamic>
								key={dyn}
								value={dyn}
								selectedValue={powerDynamic}
								onChange={setPowerDynamic}>
								{dyn}
							</OptionButton>
						))}
					</div>
				</Section>

				<Section
					title="Custom Scenario Details (Optional)"
					animationDelay={`${sectionBaseDelay + sectionDelayIncrement * 6}s`}>
					<textarea
						value={customContext}
						onChange={(e) => setCustomContext(e.target.value)}
						placeholder="E.g., You are at a company holiday party. You recently received a promotion, and the AI is your direct competitor who also wanted that promotion. Or, you're on a first date set up by a mutual friend, and the AI knows this friend well..."
						className="w-full p-3 bg-slate-600 text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 min-h-[100px] text-sm"
						rows={4}
						maxLength={1000}
						aria-label="Custom scenario details"
					/>
					<p className="text-xs text-gray-400 mt-1">
						Provide any additional specific context for the AI (max 1000 chars).
					</p>
				</Section>

				<button
					type="submit"
					className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-4 px-6 rounded-lg text-xl shadow-lg 
                     transition-all duration-200 ease-in-out transform hover:scale-105 hover:shadow-xl 
                     focus:outline-none focus:ring-4 focus:ring-green-400 focus:ring-opacity-50
                     opacity-0 animate-[fadeInSlideUp_0.5s_ease-out_forwards]"
					style={{
						animationDelay: `${sectionBaseDelay + sectionDelayIncrement * 7}s`,
					}}>
					Start Interaction
				</button>
			</form>
		</div>
	);
};
