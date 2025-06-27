import React from "react";
import { CloseIcon } from "./Icons";

interface ConfirmEndInteractionDialogProps {
	isOpen: boolean;
	onConfirm: () => void;
	onCancel: () => void;
}

export const ConfirmEndInteractionDialog: React.FC<
	ConfirmEndInteractionDialogProps
> = ({ isOpen, onConfirm, onCancel }) => {
	if (!isOpen) {
		return null;
	}

	// Effect to handle Escape key for closing the dialog
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
			onClick={onCancel} // Close on backdrop click
		>
			<div
				className="bg-slate-800 p-6 md:p-8 rounded-xl shadow-2xl w-full max-w-md space-y-6 transform animate-[fadeInSlideUp_0.3s_ease-out_forwards]"
				onClick={(e) => e.stopPropagation()} // Prevent close when clicking inside
			>
				<div className="flex justify-between items-center">
					<h2
						id="confirm-dialog-title"
						className="text-2xl font-bold text-sky-400">
						End Interaction?
					</h2>
					<button
						onClick={onCancel}
						className="text-gray-400 hover:text-gray-200 p-1 rounded-full hover:bg-slate-700 transition-colors"
						aria-label="Cancel and continue interaction">
						<CloseIcon className="h-6 w-6" />
					</button>
				</div>
				<p id="confirm-dialog-description" className="text-gray-300">
					Are you sure you want to end the current interaction and return to the
					home screen? Your progress in this session will be lost.
				</p>
				<div className="flex justify-end space-x-4 pt-2">
					<button
						onClick={onCancel}
						className="px-6 py-2 bg-slate-600 hover:bg-slate-500 text-white font-semibold rounded-lg shadow-md
                       transition-all duration-150 ease-in-out hover:scale-105 focus:outline-none 
                       focus:ring-2 focus:ring-slate-400 focus:ring-opacity-75">
						No, Continue
					</button>
					<button
						onClick={onConfirm}
						className="px-6 py-2 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-lg shadow-md
                       transition-all duration-150 ease-in-out hover:scale-105 focus:outline-none 
                       focus:ring-2 focus:ring-red-400 focus:ring-opacity-75">
						Yes, End
					</button>
				</div>
			</div>
		</div>
	);
};
