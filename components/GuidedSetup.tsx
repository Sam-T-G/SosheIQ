import React, { useState } from "react";
import type {
	ScenarioDetails,
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
	BriefcaseIcon,
	CoffeeIcon,
	UsersIcon,
	HeartIcon,
	ArrowRightIcon,
} from "./Icons";
import { motion, AnimatePresence } from "motion/react";
import {
	personalityCategories,
	orderedPersonalityCategories,
} from "../constants/personality";

interface GuidedSetupProps {
	onStart: (
		details: ScenarioDetails,
		userScenarioDetails?: UserScenarioDetails
	) => void;
	onSwitchToAdvanced: () => void;
}

const MAX_STEPS = 7;
const MAX_PERSONALITY_TRAITS = 5;

// --- Minimalist Style Constants ---
const schematicInputBase = "w-full bg-transparent border-b border-white/20 py-2 text-white font-mono focus:outline-none focus:border-white/60 transition-colors placeholder-white/20";
const schematicButtonBase = "px-4 py-2 border border-white/20 text-white/60 font-mono text-sm hover:bg-white/5 hover:text-white hover:border-white/40 transition-all uppercase tracking-wider";
const schematicButtonSelected = "bg-white/10 text-white border-white/60 shadow-[0_0_10px_rgba(255,255,255,0.1)]";

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

const PREDEFINED_AI_MALE_FIRST_NAMES = ["Arthur", "David", "Ethan", "James", "Liam"];
const PREDEFINED_AI_FEMALE_FIRST_NAMES = ["Anna", "Chloe", "Emily", "Emma", "Isabella"];
const PREDEFINED_AI_NEUTRAL_FIRST_NAMES = ["Alex", "Jordan", "Casey", "Morgan", "Riley"];
const PREDEFINED_AI_LAST_NAMES = ["Smith", "Jones", "Williams", "Brown", "Davis"];

const generateRandomAiName = (gender: AIGender, culture?: string): string => {
    const first = PREDEFINED_AI_NEUTRAL_FIRST_NAMES[Math.floor(Math.random() * PREDEFINED_AI_NEUTRAL_FIRST_NAMES.length)];
    const last = PREDEFINED_AI_LAST_NAMES[Math.floor(Math.random() * PREDEFINED_AI_LAST_NAMES.length)];
    return `${first} ${last}`;
};

export const GuidedSetup: React.FC<GuidedSetupProps> = ({
	onStart,
	onSwitchToAdvanced,
}) => {
	const [step, setStep] = useState(0);
	const [scenario, setScenario] = useState<Partial<ScenarioDetails>>(initialScenario);
	const [customAiAgeString, setCustomAiAgeString] = useState<string>("");
	const [exiting, setExiting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [provideUserName, setProvideUserName] = useState(false);
	const [userName, setUserName] = useState("");

	const handleNext = () => {
		setError(null);
		if (step === 2 && scenario.aiAgeBracket === AIAgeBracket.CUSTOM) {
			if (customAiAgeString.trim() === "") { setError("Age required."); return; }
			const ageNum = parseInt(customAiAgeString, 10);
			if (isNaN(ageNum) || ageNum < 18 || ageNum > 100) { setError("Invalid age (18-100)."); return; }
		}
		if (step === 3 && (!scenario.aiPersonalityTraits?.length) && (!scenario.customAiPersonality?.trim())) {
			setError("Select a trait or describe personality.");
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
			if (!isNaN(ageNum) && ageNum >= 18 && ageNum <= 100) finalCustomAiAge = ageNum;
            else { setError("Invalid age."); return; }
		}

		let finalAiName = scenario.aiName || "";
		if (!finalAiName) finalAiName = generateRandomAiName(scenario.aiGender!, scenario.aiCulture);

		const finalScenario: ScenarioDetails = {
			environment: scenario.environment || SocialEnvironment.CASUAL,
			customEnvironment: scenario.environment === SocialEnvironment.CUSTOM ? scenario.customEnvironment?.trim() || undefined : undefined,
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
		const userScenarioDetails: UserScenarioDetails = provideUserName && userName.trim() ? { userName: userName.trim() } : {};
		onStart(finalScenario, userScenarioDetails);
	};

	const updateScenario = (updates: Partial<ScenarioDetails>) => {
		setScenario((prev) => ({ ...prev, ...updates }));
		setError(null);
	};

	const renderStepContent = () => {
        const contentVariants: any = {
            hidden: { opacity: 0, scale: 0.98, filter: "blur(4px)" },
            visible: { opacity: 1, scale: 1, filter: "blur(0px)", transition: { duration: 0.5, ease: "circOut" } },
            exit: { opacity: 0, scale: 0.98, filter: "blur(4px)", transition: { duration: 0.3, ease: "circIn" } }
        };

		switch (step) {
			case 0: // Mode Selection
				return (
					<motion.div variants={contentVariants} initial="hidden" animate="visible" exit="exit" className="flex flex-col items-center space-y-12">
						<div className="text-center space-y-4">
							<h2 className="text-4xl font-thin text-white tracking-widest uppercase">Configuration Mode</h2>
							<div className="h-[1px] w-16 bg-white/30 mx-auto"/>
							<p className="text-white/40 font-mono text-sm">Select initialization protocol.</p>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-2xl">
							<button onClick={handleNext} className="group border border-white/10 hover:border-white/30 bg-transparent p-8 transition-all duration-500 flex flex-col items-center text-center space-y-4 hover:bg-white/5">
								<PlayIcon className="w-8 h-8 text-white/40 group-hover:text-white transition-colors" />
								<h3 className="text-xl font-mono text-white/80 group-hover:text-white uppercase tracking-wider">Guided Sequence</h3>
								<p className="text-xs text-white/30 font-mono leading-relaxed">Step-by-step parameter definition. Recommended for new fabrications.</p>
							</button>

							<button onClick={onSwitchToAdvanced} className="group border border-white/10 hover:border-white/30 bg-transparent p-8 transition-all duration-500 flex flex-col items-center text-center space-y-4 hover:bg-white/5">
								<CogIcon className="w-8 h-8 text-white/40 group-hover:text-white transition-colors" />
								<h3 className="text-xl font-mono text-white/80 group-hover:text-white uppercase tracking-wider">Manual Override</h3>
								<p className="text-xs text-white/30 font-mono leading-relaxed">Direct access to all variable matrices. For advanced users.</p>
							</button>
						</div>
					</motion.div>
				);
			case 1: // Environment
				return (
					<motion.div variants={contentVariants} initial="hidden" animate="visible" exit="exit" className="w-full max-w-xl space-y-8">
						<div className="border-l-2 border-white/20 pl-6">
							<h2 className="text-2xl font-thin text-white uppercase tracking-widest">Environment</h2>
							<p className="text-white/40 font-mono text-xs mt-2">Select simulation backdrop.</p>
						</div>
						
						<div className="grid grid-cols-2 gap-4">
							{guidedSocialEnvironments.map(({ name, icon: Icon }) => (
								<button
									key={name}
									onClick={() => updateScenario({ environment: name })}
									className={`p-6 border transition-all flex flex-col items-center gap-4 ${scenario.environment === name ? "border-white bg-white/10" : "border-white/10 hover:border-white/30 bg-transparent"}`}
								>
									<Icon className={`w-6 h-6 ${scenario.environment === name ? "text-white" : "text-white/40"}`} />
									<span className={`text-xs font-mono uppercase tracking-wider ${scenario.environment === name ? "text-white" : "text-white/60"}`}>{name}</span>
								</button>
							))}
						</div>
                        
                        {scenario.environment === SocialEnvironment.CUSTOM && (
                            <div className="pt-4 animate-fadeIn">
                                <input 
                                    type="text" 
                                    value={scenario.customEnvironment} 
                                    onChange={(e) => updateScenario({ customEnvironment: e.target.value })}
                                    placeholder="DEFINE CUSTOM COORDINATES..."
                                    className={schematicInputBase}
                                />
                            </div>
                        )}
					</motion.div>
				);
            case 2: // Identity (Gender/Age)
                return (
                    <motion.div variants={contentVariants} initial="hidden" animate="visible" exit="exit" className="w-full max-w-xl space-y-8">
                        <div className="border-l-2 border-white/20 pl-6">
                            <h2 className="text-2xl font-thin text-white uppercase tracking-widest">Identity Matrix</h2>
                            <p className="text-white/40 font-mono text-xs mt-2">Define core demographic parameters.</p>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-mono text-white/40 uppercase">Gender</label>
                                <div className="flex flex-wrap gap-2">
                                    {(Object.values(AIGender) as AIGender[]).map((g) => (
                                        <button key={g} onClick={() => updateScenario({ aiGender: g })} className={`${schematicButtonBase} ${scenario.aiGender === g ? schematicButtonSelected : ""}`}>
                                            {g}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-mono text-white/40 uppercase">Age Bracket</label>
                                <div className="flex flex-wrap gap-2">
                                    {(Object.values(AIAgeBracket) as AIAgeBracket[]).map((age) => (
                                        <button key={age} onClick={() => updateScenario({ aiAgeBracket: age })} className={`${schematicButtonBase} ${scenario.aiAgeBracket === age ? schematicButtonSelected : ""}`}>
                                            {age}
                                        </button>
                                    ))}
                                </div>
                                {scenario.aiAgeBracket === AIAgeBracket.CUSTOM && (
                                    <input type="number" value={customAiAgeString} onChange={(e) => setCustomAiAgeString(e.target.value)} placeholder="SPECIFY YEARS (18-100)" className={schematicInputBase} />
                                )}
                            </div>
                        </div>
                    </motion.div>
                );
            case 3: // Personality
                return (
                    <motion.div variants={contentVariants} initial="hidden" animate="visible" exit="exit" className="w-full max-w-xl space-y-8">
                        <div className="border-l-2 border-white/20 pl-6">
                            <h2 className="text-2xl font-thin text-white uppercase tracking-widest">Psych Profile</h2>
                            <p className="text-white/40 font-mono text-xs mt-2">Select dominant behavioral traits.</p>
                        </div>

                        <div className="space-y-6 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                            {orderedPersonalityCategories.map((category) => (
                                <div key={category} className="space-y-2">
                                    <h3 className="text-xs font-mono text-white/30 uppercase border-b border-white/5 pb-1">{category}</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {personalityCategories[category].map((p) => {
                                            const isSelected = scenario.aiPersonalityTraits?.includes(p);
                                            return (
                                                <button
                                                    key={p}
                                                    onClick={() => {
                                                        const current = scenario.aiPersonalityTraits || [];
                                                        const updated = current.includes(p) ? current.filter(t => t !== p) : [...current, p].slice(0, MAX_PERSONALITY_TRAITS);
                                                        updateScenario({ aiPersonalityTraits: updated });
                                                    }}
                                                    className={`px-2 py-1 text-[10px] font-mono border transition-all ${isSelected ? "bg-white text-black border-white" : "bg-transparent text-white/50 border-white/10 hover:border-white/30"}`}
                                                >
                                                    {p}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                            <div className="pt-4">
                                <textarea 
                                    value={scenario.customAiPersonality} 
                                    onChange={(e) => updateScenario({ customAiPersonality: e.target.value })} 
                                    placeholder="CUSTOM BEHAVIORAL PARAMETERS..." 
                                    className={`${schematicInputBase} min-h-[60px] resize-none`} 
                                />
                            </div>
                        </div>
                    </motion.div>
                );
            case 4: // Name/Culture
                return (
                    <motion.div variants={contentVariants} initial="hidden" animate="visible" exit="exit" className="w-full max-w-xl space-y-8">
                        <div className="border-l-2 border-white/20 pl-6">
                            <h2 className="text-2xl font-thin text-white uppercase tracking-widest">Designation</h2>
                            <p className="text-white/40 font-mono text-xs mt-2">Assign identity labels.</p>
                        </div>

                        <div className="space-y-8">
                            <div className="space-y-2">
                                <label className="text-xs font-mono text-white/40 uppercase">Name</label>
                                <input type="text" value={scenario.aiName} onChange={(e) => updateScenario({ aiName: e.target.value })} placeholder="AUTO-GENERATE IF BLANK" className={schematicInputBase} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-mono text-white/40 uppercase">Cultural Origin</label>
                                <input type="text" value={scenario.aiCulture} onChange={(e) => updateScenario({ aiCulture: e.target.value })} placeholder="UNDEFINED" className={schematicInputBase} />
                            </div>
                        </div>
                    </motion.div>
                );
            case 5: // Goal/Context
                return (
                    <motion.div variants={contentVariants} initial="hidden" animate="visible" exit="exit" className="w-full max-w-xl space-y-8">
                        <div className="border-l-2 border-white/20 pl-6">
                            <h2 className="text-2xl font-thin text-white uppercase tracking-widest">Mission Parameters</h2>
                            <p className="text-white/40 font-mono text-xs mt-2">Define objectives and situational context.</p>
                        </div>

                        <div className="space-y-8">
                            <div className="space-y-2">
                                <label className="text-xs font-mono text-white/40 uppercase">Objective</label>
                                <textarea value={scenario.conversationGoal} onChange={(e) => updateScenario({ conversationGoal: e.target.value })} placeholder="PRIMARY DIRECTIVE..." className={`${schematicInputBase} min-h-[80px] resize-none`} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-mono text-white/40 uppercase">Context</label>
                                <textarea value={scenario.customContext} onChange={(e) => updateScenario({ customContext: e.target.value })} placeholder="SITUATIONAL DATA..." className={`${schematicInputBase} min-h-[80px] resize-none`} />
                            </div>
                        </div>
                    </motion.div>
                );
            case 6: // User Identity
                return (
                    <motion.div variants={contentVariants} initial="hidden" animate="visible" exit="exit" className="w-full max-w-xl space-y-8">
                        <div className="border-l-2 border-white/20 pl-6">
                            <h2 className="text-2xl font-thin text-white uppercase tracking-widest">User Override</h2>
                            <p className="text-white/40 font-mono text-xs mt-2">Optional: Attach user identity.</p>
                        </div>

                        <div className="space-y-8">
                            <div className="flex items-center gap-4">
                                <button 
                                    onClick={() => setProvideUserName(!provideUserName)}
                                    className={`text-xs font-mono uppercase tracking-wider ${provideUserName ? "text-white" : "text-white/40"}`}
                                >
                                    [ {provideUserName ? "X" : " "} ] Attach User Identity
                                </button>
                            </div>
                            {provideUserName && (
                                <div className="animate-fadeIn">
                                    <input 
                                        type="text" 
                                        placeholder="USER DESIGNATION" 
                                        value={userName}
                                        onChange={(e) => setUserName(e.target.value)}
                                        className={schematicInputBase}
                                    />
                                </div>
                            )}
                        </div>
                    </motion.div>
                );
            case 7: // Review
                return (
                    <motion.div variants={contentVariants} initial="hidden" animate="visible" exit="exit" className="w-full max-w-xl space-y-8">
                        <div className="border-l-2 border-white/20 pl-6">
                            <h2 className="text-2xl font-thin text-white uppercase tracking-widest">Final Verification</h2>
                            <p className="text-white/40 font-mono text-xs mt-2">Confirm fabrication parameters.</p>
                        </div>

                        <div className="space-y-4 border border-white/10 p-6 font-mono text-xs text-white/70">
                            <div className="flex justify-between border-b border-white/5 pb-2">
                                <span className="uppercase text-white/40">Environment</span>
                                <span>{scenario.environment}</span>
                            </div>
                            <div className="flex justify-between border-b border-white/5 pb-2">
                                <span className="uppercase text-white/40">Identity</span>
                                <span>{scenario.aiGender} / {scenario.aiAgeBracket}</span>
                            </div>
                            <div className="flex justify-between border-b border-white/5 pb-2">
                                <span className="uppercase text-white/40">Traits</span>
                                <span className="text-right max-w-[200px]">{scenario.aiPersonalityTraits?.join(", ") || "Custom"}</span>
                            </div>
                            <div className="flex justify-between border-b border-white/5 pb-2">
                                <span className="uppercase text-white/40">Objective</span>
                                <span className="text-right max-w-[200px] truncate">{scenario.conversationGoal || "None"}</span>
                            </div>
                        </div>
                    </motion.div>
                );
			default:
				return null;
		}
	};

	return (
		<div className="absolute inset-0 overflow-y-auto custom-scrollbar z-10 flex flex-col">
            {/* Progress Line */}
            {step > 0 && (
                <div className="w-full h-[1px] bg-white/10 fixed top-0 left-0 z-20">
                    <div className="h-full bg-white/60 transition-all duration-500" style={{ width: `${(step / MAX_STEPS) * 100}%` }} />
                </div>
            )}

            {/* Back Button */}
            {step > 0 && (
                <div className="absolute top-8 left-8 z-50">
                    <button onClick={handleBack} className="text-white/30 hover:text-white transition-colors flex items-center gap-2 font-mono text-xs uppercase tracking-widest">
                        <ArrowLeftIcon className="w-4 h-4" />
                        Back
                    </button>
                </div>
            )}

			<div className="flex-grow flex flex-col items-center justify-center p-8 md:p-16 min-h-[600px]">
                <AnimatePresence mode="wait">
                    {!exiting && renderStepContent()}
                </AnimatePresence>
			</div>

            {/* Navigation Footer (Floating) */}
            {step > 0 && (
                <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end gap-2">
                    {error && (
                        <span className="text-red-400 font-mono text-xs animate-pulse mb-2">
                            {error}
                        </span>
                    )}
                    <button
                        onClick={step === MAX_STEPS ? handleStart : handleNext}
                        className="group flex items-center gap-4 px-8 py-3 bg-white text-black font-mono text-sm font-bold uppercase tracking-widest hover:bg-white/90 transition-colors"
                    >
                        <span>{step === MAX_STEPS ? "Initialize" : "Next"}</span>
                        <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            )}
		</div>
	);
};
