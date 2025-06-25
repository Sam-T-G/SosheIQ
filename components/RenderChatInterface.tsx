import React, { useState, useEffect, useRef } from "react";
import type { ChatMessage } from "../types";
import { ChatMessageView } from "./ChatMessageView";
import {
	SendIcon,
	StopCircleIcon,
	CheckCircleIcon,
	ChevronDownIcon,
	ChevronUpIcon,
	InfoIcon,
	QuestionMarkIcon,
	CloseIcon,
	ThoughtBubbleIcon,
} from "./Icons";

interface RenderChatInterfaceProps {
	conversationHistory: ChatMessage[];
	currentEngagement: number;
	onSendMessage: (message: string) => void;
	onEndConversation: () => void;
	isLoadingAI: boolean;
	scenarioDetailsAiName: string;
	isMaxEngagement: boolean;
	isOverlay: boolean;
	onCloseOverlay?: () => void;
	showGlobalAiThoughts: boolean;
	onToggleGlobalAiThoughts: () => void;
	onToggleHelpOverlay: () => void;
	onToggleQuickTipsOverlay: () => void;
}

const INITIAL_VISIBLE_MESSAGES = 3;

export const RenderChatInterface: React.FC<RenderChatInterfaceProps> = ({
	conversationHistory,
	currentEngagement,
	onSendMessage,
	onEndConversation,
	isLoadingAI,
	scenarioDetailsAiName,
	isMaxEngagement,
	isOverlay,
	onCloseOverlay,
	showGlobalAiThoughts,
	onToggleGlobalAiThoughts,
	onToggleHelpOverlay,
	onToggleQuickTipsOverlay,
}) => {
	const [userInput, setUserInput] = useState("");
	const [showFullHistoryView, setShowFullHistoryView] = useState(false);
	const chatEndRef = useRef<HTMLDivElement>(null);
	const messagesContainerRef = useRef<HTMLDivElement>(null);

	const [processedMessagesForDisplay, setProcessedMessagesForDisplay] =
		useState<ChatMessage[]>([]);

	useEffect(() => {
		const newProcessedMessages: ChatMessage[] = [];
		for (let i = 0; i < conversationHistory.length; i++) {
			const currentMsg = conversationHistory[i];

			if (
				showGlobalAiThoughts &&
				currentMsg.sender === "ai" &&
				currentMsg.aiThoughts &&
				currentMsg.aiThoughts.trim() !== "" &&
				!currentMsg.isThoughtBubble
			) {
				newProcessedMessages.push({
					id: `${currentMsg.id}-thoughts`,
					sender: "ai",
					text: currentMsg.aiThoughts,
					timestamp: new Date(currentMsg.timestamp.getTime() - 1),
					isThoughtBubble: true,
				});
			}
			newProcessedMessages.push(currentMsg);
		}
		setProcessedMessagesForDisplay(newProcessedMessages);
	}, [conversationHistory, showGlobalAiThoughts]);

	useEffect(() => {
		if (
			showFullHistoryView ||
			processedMessagesForDisplay.length <= INITIAL_VISIBLE_MESSAGES + 1
		) {
			chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
		} else {
			const container = messagesContainerRef.current;
			if (
				container &&
				container.scrollHeight - container.scrollTop <=
					container.clientHeight + 200
			) {
				chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
			}
		}
	}, [processedMessagesForDisplay, showFullHistoryView]);

	const handleSend = () => {
		if (userInput.trim()) {
			onSendMessage(userInput.trim());
			setUserInput("");
			if (
				!showFullHistoryView &&
				processedMessagesForDisplay.length > INITIAL_VISIBLE_MESSAGES
			) {
				setShowFullHistoryView(true);
			}
		}
	};

	const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSend();
		}
	};

	const toggleShowFullHistoryView = () => {
		setShowFullHistoryView((prev) => !prev);
	};

	const messagesToRender = showFullHistoryView
		? processedMessagesForDisplay
		: processedMessagesForDisplay.slice(-INITIAL_VISIBLE_MESSAGES);

	const canCompressHistory =
		processedMessagesForDisplay.length > INITIAL_VISIBLE_MESSAGES;

	const handleEndOrFinish = () => {
		onEndConversation();
		if (isOverlay && onCloseOverlay) {
			setTimeout(() => {
				onCloseOverlay();
			}, 100);
		}
	};

	const ChatAreaHeader = () => (
		<div
			className={`flex-shrink-0 flex justify-between items-center p-3 
                    ${
											isOverlay
												? "bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50" // Restored semi-transparent blurred background
												: "bg-slate-700/50 border-b border-slate-600/50"
										}`}>
			<h3 className="text-lg font-semibold text-sky-400">
				{isOverlay
					? `Chat with ${scenarioDetailsAiName}`
					: `Conversation with ${scenarioDetailsAiName}`}
			</h3>
			<div className="flex items-center space-x-2">
				<button
					onClick={onToggleGlobalAiThoughts}
					className={`p-2 rounded-full transition-colors duration-150 shadow-sm
                            ${
															showGlobalAiThoughts
																? "bg-purple-600 hover:bg-purple-500 text-white ring-1 ring-purple-400"
																: `${
																		isOverlay
																			? "bg-slate-700/40 hover:bg-slate-600/50" // Slightly more transparent for overlay buttons
																			: "bg-slate-700/70 hover:bg-slate-600"
																  } text-purple-300 hover:text-purple-100 ring-1 ring-slate-500`
														}`}
					aria-label={
						showGlobalAiThoughts ? "Hide AI's thoughts" : "Show AI's thoughts"
					}
					title={
						showGlobalAiThoughts
							? "Hide AI's internal thoughts"
							: "Show AI's internal thoughts"
					}>
					<ThoughtBubbleIcon />
				</button>
				<button
					onClick={onToggleQuickTipsOverlay}
					className={`p-2 text-sky-300 hover:text-sky-100 rounded-full transition-colors duration-150 shadow-sm
                            ${
															isOverlay
																? "bg-slate-700/40 hover:bg-slate-600/50"
																: "bg-slate-700/70 hover:bg-slate-600"
														}`}
					aria-label="View Quick Tips"
					title="Quick Tips">
					<InfoIcon />
				</button>
				<button
					onClick={onToggleHelpOverlay}
					className={`p-2 text-sky-300 hover:text-sky-100 rounded-full transition-colors duration-150 shadow-sm
                            ${
															isOverlay
																? "bg-slate-700/40 hover:bg-slate-600/50"
																: "bg-slate-700/70 hover:bg-slate-600"
														}`}
					aria-label="Show help for chat interface"
					title="Help">
					<QuestionMarkIcon />
				</button>
				{isOverlay && onCloseOverlay && (
					<button
						onClick={onCloseOverlay}
						className="p-2 text-gray-400 hover:text-gray-200 bg-slate-700/40 hover:bg-slate-600/50 rounded-full transition-colors"
						aria-label="Close chat"
						title="Close Chat">
						<CloseIcon />
					</button>
				)}
			</div>
		</div>
	);

	return (
		<div
			className={`flex flex-col h-full ${
				isOverlay ? "bg-transparent" : "bg-slate-800" // Main chat interface container is transparent in overlay
			}`}>
			<ChatAreaHeader />

			<div
				ref={messagesContainerRef}
				className={`flex-grow p-1 md:p-4 overflow-y-auto space-y-2 min-h-0 relative ${
					isOverlay ? "bg-transparent" : "bg-slate-800/90" // Message area itself is transparent in overlay
				}`}>
				{canCompressHistory && (
					<div
						className={`sticky top-0 z-10 py-2 ${
							isOverlay
								? "bg-slate-800/30 backdrop-blur-sm" // Give "Show More" a subtle blurred bg in overlay
								: "bg-slate-800/80 backdrop-blur-sm"
						} flex justify-center`}>
						<button
							onClick={toggleShowFullHistoryView}
							className={`text-xs text-sky-300 hover:text-sky-100 px-3 py-1.5 rounded-full shadow transition-colors duration-150 flex items-center space-x-1.5
														${
															isOverlay
																? "bg-slate-700/50 hover:bg-slate-600/60"
																: "bg-slate-700 hover:bg-slate-600"
														}`}>
							{showFullHistoryView ? <ChevronUpIcon /> : <ChevronDownIcon />}
							<span>
								{showFullHistoryView
									? "Show Fewer Messages"
									: `Show More Messages (${
											processedMessagesForDisplay.filter(
												(m) => !m.isThoughtBubble
											).length
									  })`}
							</span>
						</button>
					</div>
				)}
				<div className="space-y-4 pt-1">
					{messagesToRender.map((msg, index) => (
						<ChatMessageView
							key={msg.id}
							message={msg}
							isLastMessage={
								index === messagesToRender.length - 1 &&
								msg.id ===
									conversationHistory[conversationHistory.length - 1]?.id &&
								!msg.isThoughtBubble
							}
							isLoadingAI={
								isLoadingAI &&
								index === messagesToRender.length - 1 &&
								msg.id ===
									conversationHistory[conversationHistory.length - 1]?.id &&
								!msg.isThoughtBubble
							}
						/>
					))}
				</div>
				<div ref={chatEndRef} />
			</div>

			<div
				className={`p-4 border-t ${
					isOverlay
						? "border-slate-700/50 bg-slate-800/50 backdrop-blur-sm" // Restored semi-transparent blurred background
						: "border-slate-600 bg-slate-700"
				} flex-shrink-0`}>
				{isMaxEngagement && (
					<p className="text-center text-green-400 font-semibold mb-2 animate-pulse">
						🎉 Max Engagement Reached! Click 'Finish' to review your
						performance.
					</p>
				)}
				<div className="flex items-start sm:items-center space-x-2">
					<textarea
						value={userInput}
						onChange={(e) => setUserInput(e.target.value)}
						onKeyPress={handleKeyPress}
						placeholder="Type your response..."
						className={`flex-grow p-3 text-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none resize-none
                        ${
													isOverlay
														? "bg-transparent placeholder-gray-300"
														: "bg-slate-600 placeholder-gray-400"
												}`} // Textarea itself is transparent in overlay
						rows={
							userInput.split("\n").length > 2
								? 3
								: userInput.split("\n").length > 1
								? 2
								: 1
						}
						style={{
							maxHeight: "calc(3 * 1.5rem + 2 * 0.75rem + 2 * 0.125rem)",
						}}
						aria-label="Your response input"
						disabled={isLoadingAI}
					/>
					<div className="flex items-center space-x-2">
						<button
							onClick={handleSend}
							disabled={!userInput.trim() || isLoadingAI}
							className="p-3 bg-sky-600 hover:bg-sky-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150 flex items-center justify-center space-x-2 flex-grow sm:flex-grow-0 min-h-[48px] sm:min-h-0"
							aria-label="Send message">
							<SendIcon />
							<span className="hidden sm:inline">Send</span>
						</button>
						<button
							onClick={handleEndOrFinish}
							disabled={isLoadingAI}
							className={`p-3 text-white rounded-lg transition-colors duration-150 flex items-center justify-center space-x-2 disabled:opacity-60 disabled:cursor-not-allowed flex-grow sm:flex-grow-0 min-h-[48px] sm:min-h-0
                            ${
															isMaxEngagement
																? "bg-green-600 hover:bg-green-700 animate-pulse-glow"
																: "bg-red-600 hover:bg-red-700"
														}`}
							aria-label={
								isMaxEngagement ? "Finish conversation" : "End conversation"
							}>
							{isMaxEngagement ? <CheckCircleIcon /> : <StopCircleIcon />}
							<span className="hidden sm:inline">
								{isMaxEngagement ? "Finish" : "End"}
							</span>
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};
