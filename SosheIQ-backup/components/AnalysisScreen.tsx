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
	TargetIcon,
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
			<div className="p-1.5 bg-purple-800/40 border border-purple-600/50 rounded-md flex items-center justify-center gap-1.5 animate-popInAndSettle">
				<SparklesIcon className="h-3.5 w-3.5 text-purple-300" />
				<span className="font-bold text-sm text-purple-200">{trait} +</span>
			</div>
		);
	}
	return (
		<div className="p-1.5 bg-red-800/40 border border-red-600/50 rounded-md flex items-center justify-center gap-1.5 animate-popInAndSettle">
			<XCircleIcon className="h-3.5 w-3.5 text-red-300" />
			<span className="font-bold text-sm text-red-200">{trait} -</span>
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
			<p className="text-gray-200 whitespace-pre-wrap text-sm leading-relaxed">
				{content}
			</p>
		</div>
	);
};

const GoalChangeNotification: React.FC<{
	change: NonNullable<TurnByTurnAnalysisItem["goalChange"]>;
}> = ({ change }) => {
	let text = "";
	let iconColor = "text-teal-400";
	let bgColor = "bg-teal-800/40 border-teal-700/50";

	switch (change.type) {
		case "established":
			text = `A new conversation goal was established: "${change.to}"`;
			break;
		case "changed":
			text = `The conversation goal changed to: "${change.to}"`;
			break;
		case "removed":
			text = `The conversation goal ("${change.from}") was removed.`;
			iconColor = "text-yellow-400";
			bgColor = "bg-yellow-800/20 border-yellow-700/40";
			break;
	}

	return (
		<div
			className={`mt-2 p-2.5 rounded-md flex items-center gap-3 animate-fadeIn ${bgColor}`}>
			<TargetIcon className={`h-5 w-5 flex-shrink-0 ${iconColor}`} />
			<p className={`text-sm italic ${iconColor}`}>{text}</p>
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
			{item.goalChange && <GoalChangeNotification change={item.goalChange} />}
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
	const [showPerTurnScores, setShowPerTurnScores] = useState(true);

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
		} catch (err: any) {
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
			<div className="w-full max-w-3xl p-6 bg-slate-900/70 border border-slate-700 backdrop-blur-lg rounded-xl shadow-2xl text-center">
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
			<div className="w-full max-w-3xl p-6 bg-slate-900/70 border border-slate-700 backdrop-blur-lg rounded-xl shadow-2xl text-center">
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
		<div className="w-full max-w-4xl p-6 bg-slate-900/70 border border-slate-700 backdrop-blur-lg rounded-xl shadow-2xl space-y-8">
			<div ref={reportContentRef} className="p-4 bg-transparent text-gray-100">
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
									Context:
								</strong>{" "}
								{scenarioDetails.customContext}
							</div>
						)}
					</div>
				</div>

				{/* Overall Performance */}
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
					<ScoreDisplay label="Charisma" score={report.overallCharismaScore} />
					<ScoreDisplay label="Clarity" score={report.responseClarityScore} />
					<ScoreDisplay
						label="Engagement"
						score={report.engagementMaintenanceScore}
					/>
					<ScoreDisplay label="Adaptability" score={report.adaptabilityScore} />
					{report.goalAchievementScore && (
						<ScoreDisplay
							label="Goal Achievement"
							score={report.goalAchievementScore}
						/>
					)}
				</div>

				{/* Qualitative Feedback */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
					<FeedbackSection
						title="What You Did Well"
						IconComponent={ThumbsUpIcon}
						content={report.strengths}
						colorClass="text-green-400"
					/>
					<FeedbackSection
						title="Areas for Improvement"
						IconComponent={ThumbsDownIcon}
						content={report.areasForImprovement}
						colorClass="text-yellow-400"
					/>
					<FeedbackSection
						title="Actionable Tips"
						IconComponent={LightbulbIcon}
						content={report.actionableTips}
						colorClass="text-sky-400"
					/>
					<FeedbackSection
						title="Things to Avoid"
						IconComponent={ProhibitIcon}
						content={report.thingsToAvoid}
						colorClass="text-red-400"
					/>
					{report.goalAchievementFeedback && (
						<FeedbackSection
							title="Goal Feedback"
							IconComponent={TargetIcon}
							content={report.goalAchievementFeedback}
							colorClass="text-teal-400"
						/>
					)}
				</div>
				<FeedbackSection
					title="AI's Evolving Perspective"
					IconComponent={StarIcon}
					content={report.aiEvolvingThoughtsSummary}
					colorClass="text-purple-400"
				/>

				{/* Turn-by-Turn Analysis */}
				<div className="mt-8">
					<div className="flex justify-between items-center mb-4">
						<h2 className="text-2xl font-semibold text-sky-400">
							Turn-by-Turn Analysis
						</h2>
						<div className="flex items-center space-x-2">
							<button
								onClick={() => setShowPerTurnScores(!showPerTurnScores)}
								className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors"
								title={
									showPerTurnScores
										? "Hide per-turn scores"
										: "Show per-turn scores"
								}>
								{showPerTurnScores ? (
									<EyeSlashIcon className="h-5 w-5 text-gray-300" />
								) : (
									<EyeIcon className="h-5 w-5 text-gray-300" />
								)}
							</button>
						</div>
					</div>
					<div
						ref={turnByTurnAnalysisContainerRef}
						className="space-y-4 max-h-[800px] overflow-y-auto custom-scrollbar pr-2 -mr-2">
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

			<div className="flex flex-col sm:flex-row justify-between items-center mt-8 pt-6 border-t border-slate-700 gap-4">
				<button
					onClick={handleExportToPdf}
					className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-sky-800 hover:bg-sky-700 text-white font-semibold rounded-lg shadow-md transition-colors">
					<DownloadIcon className="h-5 w-5" />
					<span>Export as PDF</span>
				</button>
				<button
					onClick={onRestart}
					className="w-full sm:w-auto px-8 py-4 bg-green-600 hover:bg-green-500 text-white font-bold text-lg rounded-lg shadow-lg transition-transform hover:scale-105">
					Start New Interaction
				</button>
			</div>
		</div>
	);
};
