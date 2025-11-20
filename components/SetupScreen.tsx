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
	InfoIcon,
	TargetIcon,
	PlayIcon,
} from "./Icons";
import { motion, AnimatePresence } from "motion/react";
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

// --- Minimalist Style Constants ---
const schematicInputBase = "w-full bg-transparent border-b border-white/20 py-2 text-white font-mono focus:outline-none focus:border-white/60 transition-colors placeholder-white/20";
const schematicButtonBase = "px-4 py-2 border border-white/20 text-white/60 font-mono text-sm hover:bg-white/5 hover:text-white hover:border-white/40 transition-all uppercase tracking-wider";
const schematicButtonSelected = "bg-white/10 text-white border-white/60 shadow-[0_0_10px_rgba(255,255,255,0.1)]";
const sectionHeader = "text-xs font-mono text-white/40 uppercase tracking-widest mb-6 border-b border-white/10 pb-2";

const PREDEFINED_AI_MALE_FIRST_NAMES = ["Arthur", "David", "Ethan", "James", "Liam"];
const PREDEFINED_AI_FEMALE_FIRST_NAMES = ["Anna", "Chloe", "Emily", "Emma", "Isabella"];
const PREDEFINED_AI_NEUTRAL_FIRST_NAMES = ["Alex", "Jordan", "Casey", "Morgan", "Riley"];
const PREDEFINED_AI_LAST_NAMES = ["Smith", "Jones", "Williams", "Brown", "Davis"];

const generateRandomAiName = (gender: AIGender, culture?: string): string => {
	let firstNamePool: string[];
	let lastNamePool: string[];
	const normalizedCulture = culture?.trim();
	if (normalizedCulture && cultureNameData[normalizedCulture]) {
		const cultureData = cultureNameData[normalizedCulture];
		switch (gender) {
			case AIGender.MALE:
				firstNamePool = cultureData.male.length ? cultureData.male : cultureData.neutral;
				break;
			case AIGender.FEMALE:
				firstNamePool = cultureData.female.length ? cultureData.female : cultureData.neutral;
				break;
			default:
				firstNamePool = cultureData.neutral;
				break;
		}
		lastNamePool = cultureData.last;
	} else {
		switch (gender) {
			case AIGender.MALE: firstNamePool = PREDEFINED_AI_MALE_FIRST_NAMES; break;
			case AIGender.FEMALE: firstNamePool = PREDEFINED_AI_FEMALE_FIRST_NAMES; break;
			default: firstNamePool = PREDEFINED_AI_NEUTRAL_FIRST_NAMES; break;
		}
		lastNamePool = PREDEFINED_AI_LAST_NAMES;
	}
	const firstName = firstNamePool[Math.floor(Math.random() * firstNamePool.length)];
	const lastName = lastNamePool[Math.floor(Math.random() * lastNamePool.length)];
	return `${firstName} ${lastName}`;
};

export const SetupScreen: React.FC<SetupScreenProps> = ({
	onStart,
	onBack,
}) => {
	const [environment, setEnvironment] = useState<SocialEnvironment>(SocialEnvironment.CASUAL);
	const [customEnvironment, setCustomEnvironment] = useState("");
	const [aiCulture, setAiCulture] = useState("");
	const [selectedPersonalityTraits, setSelectedPersonalityTraits] = useState<AIPersonalityTrait[]>([]);
	const [customAiPersonality, setCustomAiPersonality] = useState<string>("");
	const [aiGender, setAiGender] = useState<AIGender>(AIGender.RANDOM);
	const [aiName, setAiName] = useState<string>("");
	const [nameError, setNameError] = useState<string | null>(null);
	const [personalityError, setPersonalityError] = useState<string | null>(null);
	const [customContext, setCustomContext] = useState<string>("");
	const [conversationGoal, setConversationGoal] = useState<string>("");
	const [aiAgeBracket, setAiAgeBracket] = useState<AIAgeBracket>(AIAgeBracket.NOT_SPECIFIED);
	const [customAiAgeString, setCustomAiAgeString] = useState<string>("");
	const [customAgeError, setCustomAgeError] = useState<string | null>(null);
	const [provideUserName, setProvideUserName] = useState(false);
	const [userName, setUserName] = useState("");

	const [isDissipating, setIsDissipating] = useState(false);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		let finalAiName = aiName.trim();
		if (!finalAiName) finalAiName = generateRandomAiName(aiGender, aiCulture);

		if (finalAiName.length > 50) {
			setNameError("Name too long.");
			return;
		}
		setNameError(null);

		if (selectedPersonalityTraits.length === 0 && customAiPersonality.trim() === "") {
			setPersonalityError("Trait or description required.");
			return;
		}
		setPersonalityError(null);

		let finalCustomAiAge: number | undefined = undefined;
		if (aiAgeBracket === AIAgeBracket.CUSTOM) {
			if (customAiAgeString.trim() === "") { setCustomAgeError("Age required."); return; }
			const ageNum = parseInt(customAiAgeString, 10);
			if (isNaN(ageNum) || ageNum < 18 || ageNum > 100) { setCustomAgeError("Invalid age (18-100)."); return; }
			finalCustomAiAge = ageNum;
		}
		if (customAgeError) return;

		const userScenarioDetails: UserScenarioDetails = provideUserName && userName.trim() ? { userName: userName.trim() } : {};

        // Trigger Dissipating Animation
        setIsDissipating(true);

        // Wait for animation to complete before starting
        setTimeout(() => {
            onStart(
                {
                    environment,
                    customEnvironment: environment === SocialEnvironment.CUSTOM ? customEnvironment.trim() || undefined : undefined,
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
        }, 1500); // Match animation duration
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
		<div className="absolute inset-0 overflow-y-auto custom-scrollbar z-10">
            {/* Header */}
            <AnimatePresence>
                {!isDissipating && (
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }}
                        className="absolute top-8 left-8 z-50"
                    >
                        <button onClick={onBack} className="text-white/30 hover:text-white transition-colors flex items-center gap-2 font-mono text-xs uppercase tracking-widest">
                            <ArrowLeftIcon className="w-4 h-4" />
                            Back
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

			<div className="min-h-full flex flex-col items-center p-8 md:p-16 pb-32">
				<motion.div 
                    className="w-full max-w-3xl relative"
                    animate={isDissipating ? { 
                        opacity: 0, 
                        scale: 1.1, 
                        filter: "blur(20px)",
                        y: -20
                    } : { 
                        opacity: 1, 
                        scale: 1, 
                        filter: "blur(0px)",
                        y: 0
                    }}
                    transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
                >
					<div className="mb-12 text-center">
						<h1 className="text-4xl font-thin text-white tracking-widest uppercase mb-2">
							Manual Override
						</h1>
						<p className="text-white/40 font-mono text-xs">
							Direct access to fabrication parameters.
						</p>
					</div>

					<form id="advanced-setup-form" onSubmit={handleSubmit} className="space-y-16">
                        
                        {/* IDENTITY MATRIX */}
                        <section>
                            <h2 className={sectionHeader}>Identity Matrix</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-mono text-white/40 uppercase">Gender</label>
                                        <div className="flex flex-wrap gap-2">
                                            {(Object.values(AIGender) as AIGender[]).map((g) => (
                                                <button type="button" key={g} onClick={() => setAiGender(g)} className={`${schematicButtonBase} ${aiGender === g ? schematicButtonSelected : ""}`}>
                                                    {g}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-mono text-white/40 uppercase">Age Bracket</label>
                                        <div className="flex flex-wrap gap-2">
                                            {(Object.values(AIAgeBracket) as AIAgeBracket[]).map((age) => (
                                                <button type="button" key={age} onClick={() => setAiAgeBracket(age)} className={`${schematicButtonBase} ${aiAgeBracket === age ? schematicButtonSelected : ""}`}>
                                                    {age}
                                                </button>
                                            ))}
                                        </div>
                                        {aiAgeBracket === AIAgeBracket.CUSTOM && (
                                            <input type="number" value={customAiAgeString} onChange={(e) => { setCustomAiAgeString(e.target.value); setCustomAgeError(null); }} placeholder="SPECIFY YEARS (18-100)" className={schematicInputBase} />
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-mono text-white/40 uppercase">Designation (Name)</label>
                                        <div className="flex gap-4">
                                            <input type="text" value={aiName} onChange={(e) => setAiName(e.target.value)} placeholder="AUTO-GENERATE IF BLANK" className={schematicInputBase} />
                                            <button type="button" onClick={() => setAiName(generateRandomAiName(aiGender, aiCulture))} className="text-xs font-mono text-white/40 hover:text-white uppercase border-b border-transparent hover:border-white transition-all">Randomize</button>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-mono text-white/40 uppercase">Cultural Origin</label>
                                        <input type="text" value={aiCulture} onChange={(e) => setAiCulture(e.target.value)} placeholder="UNDEFINED" className={schematicInputBase} />
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* PSYCH PROFILE */}
                        <section>
                            <h2 className={sectionHeader}>Psych Profile</h2>
                            <div className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {orderedPersonalityCategories.map((category) => (
                                        <div key={category} className="space-y-2">
                                            <h3 className="text-xs font-mono text-white/30 uppercase border-b border-white/5 pb-1">{category}</h3>
                                            <div className="flex flex-wrap gap-2">
                                                {personalityCategories[category].map((p) => {
                                                    const isSelected = selectedPersonalityTraits.includes(p);
                                                    return (
                                                        <button
                                                            type="button"
                                                            key={p}
                                                            onClick={() => handlePersonalityTraitToggle(p)}
                                                            className={`px-2 py-1 text-[10px] font-mono border transition-all ${isSelected ? "bg-white text-black border-white" : "bg-transparent text-white/50 border-white/10 hover:border-white/30"}`}
                                                        >
                                                            {p}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-mono text-white/40 uppercase">Additional Psychometrics</label>
                                    <textarea 
                                        value={customAiPersonality} 
                                        onChange={(e) => setCustomAiPersonality(e.target.value)} 
                                        placeholder="CUSTOM BEHAVIORAL PARAMETERS..." 
                                        className={`${schematicInputBase} min-h-[60px] resize-none`} 
                                        maxLength={MAX_CUSTOM_PERSONALITY_LENGTH}
                                    />
                                </div>
                            </div>
                        </section>

                        {/* SCENARIO PARAMETERS */}
                        <section>
                            <h2 className={sectionHeader}>Scenario Parameters</h2>
                            <div className="space-y-8">
                                <div className="space-y-2">
                                    <label className="text-xs font-mono text-white/40 uppercase">Environment</label>
                                    <div className="flex flex-wrap gap-2">
                                        {(Object.values(SocialEnvironment) as SocialEnvironment[]).map((env) => (
                                            <button type="button" key={env} onClick={() => setEnvironment(env)} className={`${schematicButtonBase} ${environment === env ? schematicButtonSelected : ""}`}>
                                                {env}
                                            </button>
                                        ))}
                                    </div>
                                    {environment === SocialEnvironment.CUSTOM && (
                                        <input type="text" value={customEnvironment} onChange={(e) => setCustomEnvironment(e.target.value)} placeholder="DEFINE CUSTOM COORDINATES..." className={schematicInputBase} maxLength={MAX_CUSTOM_ENV_LENGTH} />
                                    )}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-xs font-mono text-white/40 uppercase">Objective</label>
                                        <textarea value={conversationGoal} onChange={(e) => setConversationGoal(e.target.value)} placeholder="PRIMARY DIRECTIVE..." className={`${schematicInputBase} min-h-[60px] resize-none`} maxLength={MAX_CONVERSATION_GOAL_LENGTH} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-mono text-white/40 uppercase">Context</label>
                                        <textarea value={customContext} onChange={(e) => setCustomContext(e.target.value)} placeholder="SITUATIONAL DATA..." className={`${schematicInputBase} min-h-[60px] resize-none`} maxLength={1000} />
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* USER OVERRIDE */}
                        <section>
                            <h2 className={sectionHeader}>User Override</h2>
                            <div className="flex items-center gap-4">
                                <button 
                                    type="button"
                                    onClick={() => setProvideUserName(!provideUserName)}
                                    className={`text-xs font-mono uppercase tracking-wider ${provideUserName ? "text-white" : "text-white/40"}`}
                                >
                                    [ {provideUserName ? "X" : " "} ] Attach User Identity
                                </button>
                                {provideUserName && (
                                    <input 
                                        type="text" 
                                        placeholder="USER DESIGNATION" 
                                        value={userName}
                                        onChange={(e) => setUserName(e.target.value)}
                                        className="bg-transparent border-b border-white/20 text-white font-mono text-xs focus:outline-none w-40"
                                    />
                                )}
                            </div>
                        </section>
					</form>
				</motion.div>
			</div>

			{/* Floating Start Button */}
            <AnimatePresence>
                {!isDissipating && (
                    <motion.div 
                        exit={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
                        transition={{ duration: 0.5 }}
                        className="absolute bottom-8 right-8 z-50 flex flex-col items-end gap-2"
                    >
                        {(nameError || personalityError || customAgeError) && (
                            <span className="text-red-400 font-mono text-xs animate-pulse mb-2">
                                {nameError || personalityError || customAgeError}
                            </span>
                        )}
                        <button
                            type="submit"
                            form="advanced-setup-form"
                            className="group flex items-center gap-4 px-8 py-3 bg-white text-black font-mono text-sm font-bold uppercase tracking-widest hover:bg-white/90 transition-colors">
                            <span>Initialize</span>
                            <PlayIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
		</div>
	);
};
