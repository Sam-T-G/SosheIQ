import React from "react";
import { CloseIcon, SparklesIcon } from "./Icons";

interface ConfirmationDialogProps {
	isOpen: boolean;
	onConfirm: () => void;
	onCancel: () => void;
	title: string;
	description: string;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
	isOpen,
	onConfirm,
	onCancel,
	title,
	description,
}) => {
	if (!isOpen) return null;

	React.useEffect(() => {
		const handleEsc = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				onCancel();
			}
		};
		window.addEventListener("keydown", handleEsc);
		return () => {
			window.removeEventListener("keydown", handleEsc);
		};
	}, [onCancel]);

	return (
		<div
			className="fixed inset-0 bg-slate-900/85 flex items-center justify-center z-[150] p-4 animate-[fadeIn_0.2s_ease-out]"
			role="alertdialog"
			aria-modal="true"
			aria-labelledby="confirm-dialog-title"
			aria-describedby="confirm-dialog-description"
			onClick={onCancel}>
			<div
				className="bg-slate-800 p-6 md:p-8 rounded-xl shadow-2xl w-full max-w-md space-y-6 transform animate-[fadeInSlideUp_0.3s_ease-out_forwards]"
				onClick={(e) => e.stopPropagation()}>
				<div className="flex justify-between items-center">
					<h2
						id="confirm-dialog-title"
						className="text-2xl font-bold text-sky-400 flex items-center gap-3">
						<SparklesIcon className="h-6 w-6" />
						{title}
					</h2>
					<button
						onClick={onCancel}
						className="text-gray-400 hover:text-gray-200 p-1 rounded-full hover:bg-slate-700 transition-colors"
						aria-label="Cancel">
						<CloseIcon className="h-6 w-6" />
					</button>
				</div>
				<p id="confirm-dialog-description" className="text-gray-300">
					{description}
				</p>
				<div className="flex justify-end space-x-4 pt-2">
					<button
						onClick={onCancel}
						className="px-6 py-2 bg-slate-600 hover:bg-slate-500 text-white font-semibold rounded-lg shadow-md
                       transition-all duration-150 ease-in-out hover:scale-105 focus:outline-none 
                       focus:ring-2 focus:ring-slate-400 focus:ring-opacity-75">
						Cancel
					</button>
					<button
						onClick={onConfirm}
						className="px-6 py-2 bg-teal-600 hover:bg-teal-500 text-white font-semibold rounded-lg shadow-md
                       transition-all duration-150 ease-in-out hover:scale-105 focus:outline-none 
                       focus:ring-2 focus:ring-teal-400 focus:ring-opacity-75">
						Confirm
					</button>
				</div>
			</div>
		</div>
	);
};
