import React from "react";

interface SosheIQLogoProps {
	className?: string;
	iconFill?: string;
	textFill?: string;
	smileFill?: string;
	style?: React.CSSProperties;
}

export const SosheIQLogo: React.FC<SosheIQLogoProps> = ({
	className = "",
	iconFill = "#0EA5E9", // Default: sky-500
	textFill = "#F3F4F6", // Default: gray-100
	smileFill = "#FFFFFF", // Default: white for smile
	style,
}) => {
	const iconWidth = 30;
	const iconHeight = 28;
	const cornerRadius = 6;

	const stubStemBaseWidth = iconWidth * 0.35;
	const stubStemBaseLeftX = iconWidth * 0.4;
	const stubStemBaseRightX = stubStemBaseLeftX + stubStemBaseWidth;

	const stemPointY = iconHeight + 3;
	const stemMidX =
		(stubStemBaseLeftX + stubStemBaseRightX) / 2 + iconWidth * 0.08;

	const bubblePath = `
    M ${cornerRadius},0
    L ${iconWidth - cornerRadius},0
    A ${cornerRadius},${cornerRadius} 0 0 1 ${iconWidth},${cornerRadius}
    L ${iconWidth},${iconHeight - cornerRadius}
    A ${cornerRadius},${cornerRadius} 0 0 1 ${
		iconWidth - cornerRadius
	},${iconHeight}
    L ${stubStemBaseRightX},${iconHeight}
    Q ${stemMidX + (stubStemBaseRightX - stemMidX) * 0.6},${
		iconHeight + 1.5
	} ${stemMidX},${stemPointY}
    Q ${stemMidX - (stemMidX - stubStemBaseLeftX) * 0.6},${
		iconHeight + 1.5
	} ${stubStemBaseLeftX},${iconHeight}
    L ${cornerRadius},${iconHeight}
    A ${cornerRadius},${cornerRadius} 0 0 1 0,${iconHeight - cornerRadius}
    L 0,${cornerRadius}
    A ${cornerRadius},${cornerRadius} 0 0 1 ${cornerRadius},0
    Z
  `;

	const originalEyeRadius = 2.5;
	const eyeRadius = originalEyeRadius * 0.85;
	const eyeY = iconHeight * 0.42;
	const eye1X = iconWidth * 0.33;
	const eye2X = iconWidth * 0.67;

	const smileStartX = iconWidth * 0.28;
	const smileEndX = iconWidth * 0.72;
	const smileY = iconHeight * 0.65;
	const smileControlY = smileY + iconHeight * 0.15;
	const smilePath = `M ${smileStartX},${smileY} Q ${
		iconWidth / 2
	},${smileControlY} ${smileEndX},${smileY}`;

	const originalFontSize = 14;
	const textFontSize = originalFontSize * 1.15 * 1.1; // Approx 17.71

	// Reduced gap and refined estimated text width
	const textGap = 7; // Reduced gap from 9
	const textXOffset = iconWidth + textGap;
	// Refined estimate for "SosheIQ" at ~17.7px bold font.
	// Previous 98 was likely too much. 7 chars, average width character for bold sans-serif is ~0.5-0.6 * font-size.
	// Example: 7 * 0.55 * 17.71 = ~68. Let's use a value around that.
	const estimatedTextWidth = 75; // Adjusted from 98

	const textY = iconHeight / 2 + 2;

	// Adjusted viewBoxWidth based on new textXOffset and estimatedTextWidth
	const viewBoxWidth = textXOffset + estimatedTextWidth;
	const viewBoxHeight = stemPointY + 2;

	return (
		<svg
			viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
			xmlns="http://www.w3.org/2000/svg"
			className={className}
			style={style}
			aria-label="SosheIQ Logo"
			preserveAspectRatio="xMidYMid meet">
			<g>
				<path d={bubblePath} fill={iconFill} />
				<circle cx={eye1X} cy={eyeY} r={eyeRadius} fill={smileFill} />
				<circle cx={eye2X} cy={eyeY} r={eyeRadius} fill={smileFill} />
				<path
					d={smilePath}
					stroke={smileFill}
					strokeWidth="2"
					fill="none"
					strokeLinecap="round"
				/>
			</g>

			<text
				x={textXOffset}
				y={textY}
				fontFamily="Arial, Helvetica, sans-serif"
				fontSize={textFontSize}
				fontWeight="bold"
				dominantBaseline="middle">
				<tspan fill={textFill}>Soshe</tspan>
				<tspan fill={iconFill}>IQ</tspan>
			</text>
		</svg>
	);
};
