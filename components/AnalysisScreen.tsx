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
	ThoughtBubbleIcon,
	ChatBubbleIcon,
	EyeIcon,
	EyeSlashIcon,
	TrendingUpIcon,
} from "./Icons";
import { AIAgeBracket } from "../types"; // Import AIAgeBracket

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
		<p className="text-sm text-sky-300 font-semibold mb-1">
			Exchange {index + 1}
		</p>
		{item.userInput && (
			<div className="mb-2">
				<p className="text-gray-300 italic mb-1">
					<strong>You:</strong> "{item.userInput}"
				</p>
				{showPerTurnScores &&
					typeof item.userTurnEffectivenessScore === "number" && (
						<div className="mt-1 p-1.5 bg-cyan-800/40 border border-cyan-700/50 rounded-md">
							<div className="flex items-center text-xs text-cyan-400">
								<EyeIcon />
								<span className="ml-1.5 font-semibold">
									Your Effectiveness This Turn:
								</span>
								<span className="ml-auto text-cyan-200 font-bold text-sm">
									{item.userTurnEffectivenessScore}%
								</span>
							</div>
							<ProgressBar percentage={item.userTurnEffectivenessScore} />
						</div>
					)}
			</div>
		)}

		{item.aiResponse && (
			<div className="mb-1">
				<p className="text-gray-400 italic">
					<strong>{aiName}:</strong> "{item.aiResponse}"
				</p>
				{showPerTurnScores && typeof item.conversationMomentum === "number" && (
					<div className="mt-1 p-1.5 bg-green-800/40 border border-green-700/50 rounded-md">
						<div className="flex items-center text-xs text-green-400">
							<TrendingUpIcon />
							<span className="ml-1.5 font-semibold">
								Conversation Momentum:
							</span>
							<span className="ml-auto text-green-200 font-bold text-sm">
								{item.conversationMomentum}%
							</span>
						</div>
						<ProgressBar percentage={item.conversationMomentum} />
					</div>
				)}
			</div>
		)}

		{item.aiBodyLanguage && (
			<div className="mt-2 p-2.5 bg-yellow-800/20 border border-yellow-700/40 rounded-md">
				<div className="flex items-center text-xs text-yellow-500 mb-1">
					<ChatBubbleIcon />
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
					<ThoughtBubbleIcon />
					<span className="ml-1.5 font-semibold">
						{aiName}'s Internal Thoughts:
					</span>
				</div>
				<p className="text-purple-200 italic text-sm whitespace-pre-wrap">
					{item.aiThoughts}
				</p>
			</div>
		)}

		<p className="text-gray-200 mt-2 pt-2 border-t border-slate-600/70 whitespace-pre-wrap">
			{item.analysis}
		</p>
	</div>
);

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
		if (
			!reportContentRef.current ||
			!report ||
			!turnByTurnAnalysisContainerRef.current
		)
			return;

		const originalBodyBg = document.body.style.backgroundColor;
		const scrollableContainer = turnByTurnAnalysisContainerRef.current;
		const mainContent = reportContentRef.current;

		const originalScrollableMaxHeight = scrollableContainer.style.maxHeight;
		const originalScrollableOverflow = scrollableContainer.style.overflow;
		const originalMainContentMaxWidth = mainContent.style.maxWidth;

		try {
			document.body.style.backgroundColor = "white";
			scrollableContainer.style.maxHeight = "none";
			scrollableContainer.style.overflow = "visible";
			mainContent.style.maxWidth = "none";

			const canvas = await html2canvas(mainContent, {
				scale: 2,
				useCORS: true,
				backgroundColor: "#1e293b",
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
			const ratio = canvasWidth / canvasHeight;

			let imgWidth = pdfWidth - 40;
			let imgHeight = imgWidth / ratio;

			if (imgHeight > pdfHeight - 40) {
				imgHeight = pdfHeight - 40;
				imgWidth = imgHeight * ratio;
			}

			const x = (pdfWidth - imgWidth) / 2;
			const y = 20;

			pdf.addImage(imgData, "PNG", x, y, imgWidth, imgHeight);
			const safeAiName = scenarioDetails.aiName
				? scenarioDetails.aiName.replace(/\s+/g, "_")
				: "AI";
			pdf.save(
				`SosheIQ-Analysis-${safeAiName}-${
					new Date().toISOString().split("T")[0]
				}.pdf`
			);
		} catch (err) {
			console.error("Error generating PDF:", err);
		} finally {
			document.body.style.backgroundColor = originalBodyBg;
			scrollableContainer.style.maxHeight = originalScrollableMaxHeight;
			scrollableContainer.style.overflow = originalScrollableOverflow;
			mainContent.style.maxWidth = originalMainContentMaxWidth;
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

	const ageBracketText =
		scenarioDetails.aiAgeBracket &&
		scenarioDetails.aiAgeBracket !== AIAgeBracket.NOT_SPECIFIED
			? ` | Age: ${scenarioDetails.aiAgeBracket}`
			: "";

	return (
		<div className="w-full max-w-4xl p-6 bg-slate-800 rounded-xl shadow-2xl space-y-6">
			<div ref={reportContentRef} className="p-4 bg-slate-800 text-gray-100">
				<h1 className="text-4xl font-bold text-center text-sky-400 mb-2">
					Interaction Analysis
				</h1>
				<p className="text-center text-gray-400 text-sm mb-6">
					Scenario: {scenarioDetails.environment} | AI: {scenarioDetails.aiName}{" "}
					({scenarioDetails.aiPersonality}, {scenarioDetails.aiGender}
					{ageBracketText})
					<br />
					Dynamic: {scenarioDetails.powerDynamic}
					{scenarioDetails.customContext && (
						<span className="block mt-1 text-xs italic">
							Custom Context: {scenarioDetails.customContext}
						</span>
					)}
				</p>

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

				<div className="bg-slate-700 p-4 rounded-lg shadow mt-6">
					<h3 className="text-xl font-semibold text-sky-400 mb-3">
						Overall Feedback & Tips
					</h3>
					<p className="text-gray-200 whitespace-pre-wrap">
						{report.overallFeedback}
					</p>
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
							{showPerTurnScores ? <EyeSlashIcon /> : <EyeIcon />}
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
					<DownloadIcon /> Export to PDF
				</button>
			</div>
		</div>
	);
};
