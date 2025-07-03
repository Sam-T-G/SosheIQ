import React, {
	createContext,
	useContext,
	useEffect,
	useRef,
	ReactNode,
} from "react";

interface AccessibilityContextType {
	focusFirstInteractive: () => void;
	trapFocus: (element: HTMLElement) => () => void;
	announceToScreenReader: (message: string) => void;
	isKeyboardUser: boolean;
}

const AccessibilityContext = createContext<
	AccessibilityContextType | undefined
>(undefined);

interface AccessibilityProviderProps {
	children: ReactNode;
}

export function AccessibilityProvider({
	children,
}: AccessibilityProviderProps) {
	const isKeyboardUser = useRef(false);
	const liveRegionRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handleKeyDown = () => {
			isKeyboardUser.current = true;
		};

		const handleMouseDown = () => {
			isKeyboardUser.current = false;
		};

		document.addEventListener("keydown", handleKeyDown);
		document.addEventListener("mousedown", handleMouseDown);

		return () => {
			document.removeEventListener("keydown", handleKeyDown);
			document.removeEventListener("mousedown", handleMouseDown);
		};
	}, []);

	const focusFirstInteractive = () => {
		const focusableElements = document.querySelectorAll(
			'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
		);

		if (focusableElements.length > 0) {
			(focusableElements[0] as HTMLElement).focus();
		}
	};

	const trapFocus = (element: HTMLElement): (() => void) => {
		const focusableElements = element.querySelectorAll(
			'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
		);

		const firstElement = focusableElements[0] as HTMLElement;
		const lastElement = focusableElements[
			focusableElements.length - 1
		] as HTMLElement;

		const handleTabKey = (e: KeyboardEvent) => {
			if (e.key === "Tab") {
				if (e.shiftKey) {
					if (document.activeElement === firstElement) {
						e.preventDefault();
						lastElement.focus();
					}
				} else {
					if (document.activeElement === lastElement) {
						e.preventDefault();
						firstElement.focus();
					}
				}
			}
		};

		element.addEventListener("keydown", handleTabKey);

		// Focus first element
		if (firstElement) {
			firstElement.focus();
		}

		return () => {
			element.removeEventListener("keydown", handleTabKey);
		};
	};

	const announceToScreenReader = (message: string) => {
		if (liveRegionRef.current) {
			liveRegionRef.current.textContent = message;
			// Clear after a short delay to allow screen readers to process
			setTimeout(() => {
				if (liveRegionRef.current) {
					liveRegionRef.current.textContent = "";
				}
			}, 1000);
		}
	};

	const value: AccessibilityContextType = {
		focusFirstInteractive,
		trapFocus,
		announceToScreenReader,
		isKeyboardUser: isKeyboardUser.current,
	};

	return (
		<AccessibilityContext.Provider value={value}>
			{children}
			{/* Live region for screen reader announcements */}
			<div
				ref={liveRegionRef}
				aria-live="polite"
				aria-atomic="true"
				className="sr-only"
				role="status"
			/>
		</AccessibilityContext.Provider>
	);
}

export function useAccessibility() {
	const context = useContext(AccessibilityContext);
	if (context === undefined) {
		throw new Error(
			"useAccessibility must be used within an AccessibilityProvider"
		);
	}
	return context;
}

// Utility components for common accessibility patterns
export function SkipLink() {
	return (
		<a
			href="#main-content"
			className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-teal-600 text-white px-4 py-2 rounded-lg z-50">
			Skip to main content
		</a>
	);
}

export function VisuallyHidden({ children }: { children: ReactNode }) {
	return <span className="sr-only">{children}</span>;
}

export function FocusTrap({
	children,
	onEscape,
}: {
	children: ReactNode;
	onEscape?: () => void;
}) {
	const { trapFocus } = useAccessibility();
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!containerRef.current) return;

		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === "Escape" && onEscape) {
				onEscape();
			}
		};

		const cleanup = trapFocus(containerRef.current);
		document.addEventListener("keydown", handleEscape);

		return () => {
			cleanup();
			document.removeEventListener("keydown", handleEscape);
		};
	}, [trapFocus, onEscape]);

	return <div ref={containerRef}>{children}</div>;
}
