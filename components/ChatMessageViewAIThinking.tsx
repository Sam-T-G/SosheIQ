import React from "react";

export const ChatMessageViewAIThinking: React.FC = () => {
	return (
		<div className="flex justify-start pr-10 sm:pr-20 opacity-0 animate-[fadeIn_0.3s_ease-out_forwards]">
			<div
				className="max-w-xl lg:max-w-2xl px-4 py-3 rounded-xl shadow-md bg-slate-600 text-gray-200 rounded-bl-none min-h-[50px] flex items-center"
				role="log"
				aria-live="polite"
				aria-label="AI is thinking">
				<div className="flex space-x-1.5 items-center">
					<span className="thinking-dot w-2.5 h-2.5 bg-sky-300 rounded-full"></span>
					<span className="thinking-dot w-2.5 h-2.5 bg-sky-300 rounded-full"></span>
					<span className="thinking-dot w-2.5 h-2.5 bg-sky-300 rounded-full"></span>
				</div>
			</div>
		</div>
	);
};
