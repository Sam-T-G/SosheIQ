import React, { useRef, useState } from "react";
import type {
	AnalysisReport,
	ScenarioDetails,
	TurnByTurnAnalysisItem,
} from "../types";
import { ProgressBar } from "./ProgressBar";
import { LoadingIndicator } from "./LoadingIndicator";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import {
	DownloadIcon,
	StarIcon,
	ChatBubbleIcon,
	EyeIcon,
	EyeSlashIcon,
	TrendingUpIcon,
	SparklesIcon,
	ThumbsUpIcon,
	ThumbsDownIcon,
	LightbulbIcon,
	ProhibitIcon,
	XCircleIcon,
} from "./Icons";
import { AIAgeBracket } from "../types";

interface AnalysisScreenProps {
	report: AnalysisReport | null;
	isLoadingReport: boolean;
	errorReport: string | null;
	onRestart: () => void;
	scenarioDetails: ScenarioDetails;
}

const ScoreDisplay: React.FC<{ label: string; score: number | undefined }> = ({
	label,
	score,
}) => (
	<div className="bg-slate-700 p-4 rounded-lg shadow">
		<h3 className="text-md font-semibold text-sky-400 mb-2">{label}</h3>
		{typeof score === "number" ? (
			<>
				<ProgressBar percentage={score} />
				<p className="text-right text-2xl font-bold text-white mt-1">
					{score}%
				</p>
			</>
		) : (
			<p className="text-gray-400 text-sm italic">Not available</p>
		)}
	</div>
);

const DeltaBadge: React.FC<{ delta: number }> = ({ delta }) => {
	const isPositive = delta >= 0;
	const colorClasses = isPositive
		? "bg-green-500/20 text-green-300"
		: "bg-red-500/20 text-red-300";
	const sign = isPositive ? "+" : "";

	return (
		<span
			className={`px-2 py-0.5 rounded-full text-xs font-bold ${colorClasses} animate-popInAndSettle`}>
			{sign}
			{delta}%
		</span>
	);
};

const TraitBadge: React.FC<{
	trait: string;
	isPositive: boolean;
}> = ({ trait, isPositive }) => {
	if (isPositive) {
		return (
			<div className="p-1.5 bg-purple-800/40 border border-purple-600/50 rounded-md flex items-center justify-between animate-popInAndSettle">
				<span className="font-semibold text-purple-300">Positive Trait</span>
				<span className="flex items-center gap-1 font-bold text-purple-200">
					<SparklesIcon className="h-3 w-3" />
					{trait}
				</span>
			</div>
		);
	}
	return (
		<div className="p-1.5 bg-red-800/40 border border-red-600/50 rounded-md flex items-center justify-between animate-popInAndSettle">
			<span className="font-semibold text-red-300">Negative Trait</span>
			<span className="flex items-center gap-1 font-bold text-red-200">
				<XCircleIcon className="h-3 w-3" />
				{trait}
			</span>
		</div>
	);
};

interface FeedbackSectionProps {
	title: string;
	content?: string;
	IconComponent: React.FC<any>;
	colorClass: string;
}

const FeedbackSection: React.FC<FeedbackSectionProps> = ({
	title,
	content,
	IconComponent,
	colorClass,
}) => {
	if (!content || content.trim() === "") return null;

	return (
		<div className="bg-slate-700 p-4 rounded-lg shadow">
			<h3
				className={`text-xl font-semibold mb-3 flex items-center gap-3 ${colorClass}`}>
				<IconComponent className="h-6 w-6 flex-shrink-0" />
				{title}
			</h3>
			<div
				className="text-gray-200 whitespace-pre-wrap text-sm leading-relaxed"
				dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, "<br />") }}
			/>
		</div>
	);
};

interface TurnAnalysisItemDisplayProps {
	item: TurnByTurnAnalysisItem;
	index: number;
	aiName: string;
	showPerTurnScores: boolean;
}

const TurnAnalysisItemDisplay: React.FC<TurnAnalysisItemDisplayProps> = ({
	item,
	index,
	aiName,
	showPerTurnScores,
}) => (
	<div className="p-4 bg-slate-700 rounded-lg shadow mb-3">
		<p className="text-sm text-sky-300 font-semibold mb-2">
			Exchange {index + 1}
		</p>

		{/* AI's Part of the Exchange */}
		<div
			className={`pb-3 ${
				item.userInput && item.analysis ? "border-b border-slate-600/70" : ""
			}`}>
			{item.aiResponse && (
				<p className="text-gray-400 italic mb-1">
					<strong>{aiName}:</strong> "{item.aiResponse}"
				</p>
			)}
			{item.aiBodyLanguage && (
				<div className="mt-2 p-2.5 bg-yellow-800/20 border border-yellow-700/40 rounded-md">
					<div className="flex items-center text-xs text-yellow-500 mb-1">
						<ChatBubbleIcon className="h-4 w-4" />
						<span className="ml-1.5 font-semibold">
							{aiName}'s Body Language:
						</span>
					</div>
					<p className="text-yellow-200 italic text-sm whitespace-pre-wrap">
						{item.aiBodyLanguage}
					</p>
				</div>
			)}
			{item.aiThoughts && (
				<div className="mt-2 p-2.5 bg-purple-800/50 border border-purple-700/60 rounded-md">
					<div className="flex items-center text-xs text-purple-400 mb-1">
						<StarIcon className="h-4 w-4" />
						<span className="ml-1.5 font-semibold">
							{aiName}'s Internal Thoughts:
						</span>
					</div>
					<p className="text-purple-200 italic text-sm whitespace-pre-wrap">
						{item.aiThoughts}
					</p>
				</div>
			)}
			{showPerTurnScores && typeof item.conversationMomentum === "number" && (
				<div className="mt-2 p-1.5 bg-green-800/40 border border-green-700/50 rounded-md">
					<div className="flex items-center text-xs text-green-400">
						<TrendingUpIcon className="h-4 w-4" />
						<span className="ml-1.5 font-semibold">
							Conversation Momentum (after AI turn):
						</span>
						<span className="ml-auto text-green-200 font-bold text-sm">
							{item.conversationMomentum}%
						</span>
					</div>
					<ProgressBar percentage={item.conversationMomentum} />
				</div>
			)}
		</div>

		{/* User's Turn & Analysis of User's Turn */}
		{item.userInput && (
			<div className="mt-3">
				<p className="text-gray-300 italic mb-1">
					<strong>You:</strong> "{item.userInput}"
				</p>
				{showPerTurnScores && (
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 mb-2 text-xs">
						{typeof item.userTurnEffectivenessScore === "number" && (
							<div className="p-1.5 bg-cyan-800/40 border border-cyan-700/50 rounded-md">
								<div className="flex justify-between items-center text-cyan-400">
									<span className="font-semibold">Effectiveness</span>
									<span className="font-bold text-cyan-200 text-sm">
										{item.userTurnEffectivenessScore}%
									</span>
								</div>
								<ProgressBar percentage={item.userTurnEffectivenessScore} />
							</div>
						)}
						{typeof item.engagementDelta === "number" && (
							<div className="p-1.5 bg-slate-800/40 border border-slate-600/50 rounded-md flex flex-col items-start gap-1">
								<span className="font-semibold text-gray-300">
									Engagement Impact
								</span>
								<DeltaBadge delta={item.engagementDelta} />
							</div>
						)}
						{item.positiveTraitContribution && (
							<TraitBadge trait={item.positiveTraitContribution} isPositive />
						)}
						{item.negativeTraitContribution && (
							<TraitBadge
								trait={item.negativeTraitContribution}
								isPositive={false}
							/>
						)}
					</div>
				)}
				{item.analysis && item.analysis.trim() !== "" && (
					<div className="mt-2 pt-2 border-t border-slate-600/70">
						<p className="text-sm font-semibold text-sky-300 mb-1">
							Feedback on Your Response:
						</p>
						<p className="text-gray-200 whitespace-pre-wrap">{item.analysis}</p>
					</div>
				)}
			</div>
		)}
	</div>
);

const formatPersonalityForDisplay = (details: ScenarioDetails): string => {
	let personalityDisplay = "";
	if (details.aiPersonalityTraits && details.aiPersonalityTraits.length > 0) {
		personalityDisplay += details.aiPersonalityTraits.join(", ");
	}
	if (details.customAiPersonality) {
		if (personalityDisplay.length > 0) personalityDisplay += " ";
		personalityDisplay += `(${details.customAiPersonality.substring(0, 70)}${
			details.customAiPersonality.length > 70 ? "..." : ""
		})`;
	}
	if (!personalityDisplay) return "Default";
	return personalityDisplay;
};

export const AnalysisScreen: React.FC<AnalysisScreenProps> = ({
	report,
	isLoadingReport,
	errorReport,
	onRestart,
	scenarioDetails,
}) => {
	const reportContentRef = useRef<HTMLDivElement>(null);
	const turnByTurnAnalysisContainerRef = useRef<HTMLDivElement>(null);
	const [showPerTurnScores, setShowPerTurnScores] = useState(false);

	const handleExportToPdf = async () => {
		const contentToPrint = reportContentRef.current;
		if (!contentToPrint) return;

		// Temporarily adjust styles for rendering full content
		const turnContainer = turnByTurnAnalysisContainerRef.current;
		let originalTurnContainerStyles: {
			maxHeight: string;
			overflow: string;
		} | null = null;
		if (turnContainer) {
			originalTurnContainerStyles = {
				maxHeight: turnContainer.style.maxHeight,
				overflow: turnContainer.style.overflow,
			};
			turnContainer.style.maxHeight = "none";
			turnContainer.style.overflow = "visible";
		}
		const originalBodyBg = document.body.style.backgroundColor;
		document.body.style.backgroundColor = "white";

		try {
			const canvas = await html2canvas(contentToPrint, {
				scale: 2,
				useCORS: true,
				backgroundColor: "#1e293b", // slate-800
				width: contentToPrint.scrollWidth,
				height: contentToPrint.scrollHeight,
				windowWidth: contentToPrint.scrollWidth,
				windowHeight: contentToPrint.scrollHeight,
			});

			const imgData = canvas.toDataURL("image/png");
			const pdf = new jsPDF({
				orientation: "portrait",
				unit: "pt",
				format: "a4",
			});

			const pdfWidth = pdf.internal.pageSize.getWidth();
			const pdfHeight = pdf.internal.pageSize.getHeight();

			const canvasWidth = canvas.width;
			const canvasHeight = canvas.height;

			// Calculate image dimensions to fit PDF width, maintaining aspect ratio
			const imgWidth = pdfWidth;
			const imgHeight = (canvasHeight * imgWidth) / canvasWidth;

			let heightLeft = imgHeight;
			let position = 0;

			// Add the first page
			pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
			heightLeft -= pdfHeight;

			// Add subsequent pages if content is taller than one page
			while (heightLeft > 0) {
				position -= pdfHeight;
				pdf.addPage();
				pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
				heightLeft -= pdfHeight;
			}

			const safeAiName = (scenarioDetails.aiName || "AI").replace(/\s+/g, "_");
			pdf.save(
				`SosheIQ-Analysis-${safeAiName}-${
					new Date().toISOString().split("T")[0]
				}.pdf`
			);
		} catch (err) {
			console.error("Error generating PDF:", err);
			// You might want to show an error message to the user here
		} finally {
			// Restore original styles
			document.body.style.backgroundColor = originalBodyBg;
			if (turnContainer && originalTurnContainerStyles) {
				turnContainer.style.maxHeight = originalTurnContainerStyles.maxHeight;
				turnContainer.style.overflow = originalTurnContainerStyles.overflow;
			}
		}
	};

	if (isLoadingReport) {
		return (
			<LoadingIndicator message="Generating your performance analysis..." />
		);
	}

	if (errorReport) {
		return (
			<div className="w-full max-w-3xl p-6 bg-slate-800 rounded-xl shadow-2xl text-center">
				<h2 className="text-3xl font-bold text-red-500 mb-4">Analysis Error</h2>
				<p className="text-gray-300 mb-6">{errorReport}</p>
				<button
					onClick={onRestart}
					className="bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition-colors">
					Start New Interaction
				</button>
			</div>
		);
	}

	if (!report) {
		return (
			<div className="w-full max-w-3xl p-6 bg-slate-800 rounded-xl shadow-2xl text-center">
				<h2 className="text-3xl font-bold text-yellow-500 mb-4">
					Analysis Not Available
				</h2>
				<p className="text-gray-300 mb-6">
					The analysis report could not be generated. Please try another
					session.
				</p>
				<button
					onClick={onRestart}
					className="bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition-colors">
					Start New Interaction
				</button>
			</div>
		);
	}

	let ageText = "";
	if (typeof scenarioDetails.customAiAge === "number") {
		ageText = ` | Age: ${scenarioDetails.customAiAge}`;
	} else if (
		scenarioDetails.aiAgeBracket &&
		scenarioDetails.aiAgeBracket !== AIAgeBracket.NOT_SPECIFIED &&
		scenarioDetails.aiAgeBracket !== AIAgeBracket.CUSTOM
	) {
		ageText = ` | Age Bracket: ${scenarioDetails.aiAgeBracket}`;
	}

	const personalityDisplayText = formatPersonalityForDisplay(scenarioDetails);

	return (
		<div className="w-full max-w-4xl p-6 bg-slate-800 rounded-xl shadow-2xl space-y-6">
			<div ref={reportContentRef} className="p-4 bg-slate-800 text-gray-100">
				<h1 className="text-4xl font-bold text-center text-sky-400 mb-4">
					Interaction Analysis
				</h1>

				<div className="text-center mb-6 bg-slate-700/50 p-4 rounded-lg border border-slate-600">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-sm text-gray-300">
						<div className="text-left">
							<strong className="text-sky-400 font-semibold">Scenario:</strong>{" "}
							{scenarioDetails.environment}
						</div>
						<div className="text-left">
							<strong className="text-sky-400 font-semibold">AI Name:</strong>{" "}
							{scenarioDetails.aiName}
						</div>
						<div className="text-left md:col-span-2">
							<strong className="text-sky-400 font-semibold">
								AI Persona:
							</strong>{" "}
							{personalityDisplayText} ({scenarioDetails.aiGender}
							{ageText})
						</div>

						{scenarioDetails.conversationGoal && (
							<div className="md:col-span-2 text-left">
								<strong className="font-semibold text-teal-300">Goal:</strong>{" "}
								{scenarioDetails.conversationGoal}
							</div>
						)}
						{scenarioDetails.customContext && (
							<div className="md:col-span-2 text-left mt-1 text-xs italic">
								<strong className="font-semibold not-italic text-gray-400">
									Custom Context:
								</strong>{" "}
								{scenarioDetails.customContext}
							</div>
						)}
					</div>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
					<ScoreDisplay
						label="Overall Charisma"
						score={report.overallCharismaScore}
					/>
					<ScoreDisplay
						label="Response Clarity"
						score={report.responseClarityScore}
					/>
					<ScoreDisplay
						label="Engagement Maintenance"
						score={report.engagementMaintenanceScore}
					/>
					<ScoreDisplay label="Adaptability" score={report.adaptabilityScore} />
					{typeof report.goalAchievementScore === "number" && (
						<ScoreDisplay
							label="Goal Achievement"
							score={report.goalAchievementScore}
						/>
					)}
					{typeof report.overallAiEffectivenessScore === "number" && (
						<ScoreDisplay
							label="Overall AI Effectiveness"
							score={report.overallAiEffectivenessScore}
						/>
					)}
				</div>
				<ScoreDisplay
					label={`Final ${scenarioDetails.aiName}'s Engagement`}
					score={report.finalEngagementSnapshot}
				/>

				{report.goalAchievementFeedback && (
					<div className="bg-slate-700 p-4 rounded-lg shadow mt-6">
						<h3 className="text-xl font-semibold text-teal-400 mb-3">
							Goal Achievement Feedback
						</h3>
						<p className="text-gray-200 whitespace-pre-wrap">
							{report.goalAchievementFeedback}
						</p>
					</div>
				)}

				<div className="space-y-4 mt-6">
					<FeedbackSection
						title="Strengths"
						content={report.strengths}
						IconComponent={ThumbsUpIcon}
						colorClass="text-green-400"
					/>
					<FeedbackSection
						title="Areas for Improvement"
						content={report.areasForImprovement}
						IconComponent={ThumbsDownIcon}
						colorClass="text-yellow-400"
					/>
					<FeedbackSection
						title="Actionable Tips"
						content={report.actionableTips}
						IconComponent={LightbulbIcon}
						colorClass="text-cyan-400"
					/>
					<FeedbackSection
						title="Things to Avoid"
						content={report.thingsToAvoid}
						IconComponent={ProhibitIcon}
						colorClass="text-red-400"
					/>
				</div>

				{report.aiEvolvingThoughtsSummary && (
					<div className="bg-slate-700 p-4 rounded-lg shadow mt-6">
						<h3 className="text-xl font-semibold text-purple-400 mb-3">
							Summary of {scenarioDetails.aiName}'s Evolving Thoughts
						</h3>
						<p className="text-gray-200 whitespace-pre-wrap italic">
							{report.aiEvolvingThoughtsSummary}
						</p>
					</div>
				)}

				<div className="mt-6">
					<div className="flex justify-between items-center mb-3">
						<h3 className="text-xl font-semibold text-sky-400">
							Turn-by-Turn Breakdown
						</h3>
						<button
							onClick={() => setShowPerTurnScores((prev) => !prev)}
							className="px-3 py-1.5 text-xs font-medium rounded-md transition-colors duration-150 flex items-center space-x-1.5
                         bg-slate-700 hover:bg-slate-600 text-cyan-300 hover:text-cyan-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
							title={
								showPerTurnScores
									? "Hide Turn Scores"
									: "Show Turn Scores (User Effectiveness & Momentum)"
							}>
							{showPerTurnScores ? (
								<EyeSlashIcon className="h-4 w-4" />
							) : (
								<EyeIcon className="h-4 w-4" />
							)}
							<span>{showPerTurnScores ? "Hide" : "Show"} Turn Scores</span>
						</button>
					</div>
					<div
						ref={turnByTurnAnalysisContainerRef}
						className="max-h-96 overflow-y-auto pr-2 space-y-3 bg-slate-800 p-3 rounded-md border border-slate-700">
						{report.turnByTurnAnalysis.map((item, index) => (
							<TurnAnalysisItemDisplay
								key={index}
								item={item}
								index={index}
								aiName={scenarioDetails.aiName || "AI"}
								showPerTurnScores={showPerTurnScores}
							/>
						))}
					</div>
				</div>
			</div>

			<div className="flex flex-col sm:flex-row gap-3 mt-8">
				<button
					onClick={onRestart}
					className="w-full sm:w-auto flex-grow bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-lg text-xl shadow-lg transition-transform duration-150 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-500 focus:ring-opacity-50">
					Start New Interaction
				</button>
				<button
					onClick={handleExportToPdf}
					className="w-full sm:w-auto bg-sky-600 hover:bg-sky-700 text-white font-bold py-4 px-6 rounded-lg text-xl shadow-lg transition-transform duration-150 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-sky-500 focus:ring-opacity-50 flex items-center justify-center gap-2"
					title="Download analysis as PDF">
					<DownloadIcon className="h-6 w-6" /> Export to PDF
				</button>
			</div>
		</div>
	);
};
