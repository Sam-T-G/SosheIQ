import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";

interface TooltipProps {
	content: string;
	children: React.ReactElement;
	placement?: "top" | "bottom" | "left" | "right";
}

export const Tooltip: React.FC<TooltipProps> = ({
	content,
	children,
	placement = "top",
}) => {
	const [visible, setVisible] = useState(false);
	const [coords, setCoords] = useState<{ top: number; left: number }>({
		top: 0,
		left: 0,
	});
	const triggerRef = useRef<HTMLButtonElement | null>(null);
	const tooltipRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		if (!visible || !triggerRef.current || !tooltipRef.current) return;
		const triggerRect = triggerRef.current.getBoundingClientRect();
		const tooltipRect = tooltipRef.current.getBoundingClientRect();
		let top = 0,
			left = 0;
		switch (placement) {
			case "top":
				top = triggerRect.top - tooltipRect.height - 8;
				left = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
				break;
			case "bottom":
				top = triggerRect.bottom + 8;
				left = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
				break;
			case "left":
				top = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
				left = triggerRect.left - tooltipRect.width - 8;
				break;
			case "right":
				top = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
				left = triggerRect.right + 8;
				break;
			default:
				break;
		}
		setCoords({ top: Math.max(top, 8), left: Math.max(left, 8) });
	}, [visible, placement]);

	// Clean up on scroll/resize
	useEffect(() => {
		if (!visible) return;
		const handle = () => setVisible(false);
		window.addEventListener("scroll", handle, true);
		window.addEventListener("resize", handle, true);
		return () => {
			window.removeEventListener("scroll", handle, true);
			window.removeEventListener("resize", handle, true);
		};
	}, [visible]);

	// Clone child to attach ref and events
	const child = React.cloneElement(children, {
		ref: (node: HTMLButtonElement) => {
			triggerRef.current = node;
			if (typeof (children as any).ref === "function")
				(children as any).ref(node);
			else if ((children as any).ref) (children as any).ref.current = node;
		},
		onMouseEnter: (e: React.MouseEvent) => {
			setVisible(true);
			children.props.onMouseEnter && children.props.onMouseEnter(e);
		},
		onMouseLeave: (e: React.MouseEvent) => {
			setVisible(false);
			children.props.onMouseLeave && children.props.onMouseLeave(e);
		},
		onFocus: (e: React.FocusEvent) => {
			setVisible(true);
			children.props.onFocus && children.props.onFocus(e);
		},
		onBlur: (e: React.FocusEvent) => {
			setVisible(false);
			children.props.onBlur && children.props.onBlur(e);
		},
		tabIndex: children.props.tabIndex ?? 0,
		"aria-describedby": visible ? "tooltip" : undefined,
	});

	return (
		<>
			{child}
			{typeof window !== "undefined" &&
				createPortal(
					<AnimatePresence>
						{visible && (
							<motion.div
								ref={tooltipRef}
								role="tooltip"
								id="tooltip"
								initial={{ opacity: 0, scale: 0.96 }}
								animate={{ opacity: 1, scale: 1 }}
								exit={{ opacity: 0, scale: 0.96 }}
								transition={{ duration: 0.18, ease: "easeOut" }}
								style={{
									position: "fixed",
									top: coords.top,
									left: coords.left,
									zIndex: 10000,
									pointerEvents: "none",
									background: "rgba(30,41,59,0.98)",
									color: "#f3f4f6",
									borderRadius: 8,
									padding: "8px 14px",
									fontSize: 13,
									fontWeight: 500,
									boxShadow: "0 4px 24px 0 rgba(0,0,0,0.25)",
									maxWidth: 260,
									whiteSpace: "pre-line",
									textAlign: "center",
								}}>
								{content}
							</motion.div>
						)}
					</AnimatePresence>,
					document.body
				)}
		</>
	);
};
