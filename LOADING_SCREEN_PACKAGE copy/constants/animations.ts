/**
 * Animation Constants for Loading Screen Package
 * Essential constants for world-class loading animations
 */

// Golden ratio constant for harmonious spacing
const PHI = 1.618;

// Base spacing unit (16px = 1rem)
const BASE_UNIT = 16;

/**
 * Spacing System based on Golden Ratio
 */
export const SPACING = {
	// Micro spacing (for fine details)
	XXS: BASE_UNIT / (PHI * PHI * PHI), // ~2.5px
	XS: BASE_UNIT / (PHI * PHI), // ~6px
	SM: BASE_UNIT / PHI, // ~10px

	// Base spacing
	BASE: BASE_UNIT, // 16px

	// Golden ratio progression
	MD: BASE_UNIT * PHI, // ~26px
	LG: BASE_UNIT * PHI * PHI, // ~42px
	XL: BASE_UNIT * PHI * PHI * PHI, // ~68px
	XXL: BASE_UNIT * PHI * PHI * PHI * PHI, // ~110px

	// Cinematic spacing (for dramatic layouts)
	CINEMATIC_SM: BASE_UNIT * PHI ** 2, // ~42px
	CINEMATIC_MD: BASE_UNIT * PHI ** 3, // ~68px
	CINEMATIC_LG: BASE_UNIT * PHI ** 4, // ~110px
	CINEMATIC_XL: BASE_UNIT * PHI ** 5, // ~178px
} as const;

/**
 * Typography scale based on golden ratio
 */
export const TYPOGRAPHY = {
	// Font sizes
	SIZES: {
		XS: BASE_UNIT * 0.75, // 12px
		SM: BASE_UNIT * 0.875, // 14px
		BASE: BASE_UNIT, // 16px
		LG: (BASE_UNIT * PHI) / 1.4, // ~18px
		XL: (BASE_UNIT * PHI) / 1.2, // ~22px
		XXL: BASE_UNIT * PHI, // ~26px
		XXXL: BASE_UNIT * PHI * 1.2, // ~31px
		DISPLAY_SM: BASE_UNIT * PHI * 1.5, // ~39px
		DISPLAY_MD: BASE_UNIT * PHI * 2, // ~52px
		DISPLAY_LG: BASE_UNIT * PHI * 2.5, // ~65px
		DISPLAY_XL: BASE_UNIT * PHI * 3, // ~78px
	},

	// Line heights (golden ratio based)
	LINE_HEIGHTS: {
		TIGHT: 1.2,
		NORMAL: 1.4,
		RELAXED: PHI / 1.15, // ~1.4
		LOOSE: PHI, // ~1.618
		CINEMATIC: PHI * 1.2, // ~1.94
	},

	// Letter spacing
	LETTER_SPACING: {
		TIGHT: "-0.025em",
		NORMAL: "0",
		WIDE: "0.025em",
		WIDER: "0.05em",
		WIDEST: "0.1em",
		CINEMATIC: "0.15em",
	},
} as const;

/**
 * Enhanced shadow system for depth
 */
export const SHADOWS = {
	// Subtle shadows
	XS: "0 1px 2px rgba(0, 0, 0, 0.05)",
	SM: "0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)",
	BASE: "0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)",
	MD: "0 4px 6px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.06)",
	LG: "0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)",
	XL: "0 20px 25px rgba(0, 0, 0, 0.1), 0 10px 10px rgba(0, 0, 0, 0.04)",
	XXL: "0 25px 50px rgba(0, 0, 0, 0.25)",

	// Cinematic shadows
	CINEMATIC_SOFT:
		"0 8px 32px rgba(0, 0, 0, 0.12), 0 4px 16px rgba(0, 0, 0, 0.08)",
	CINEMATIC_MEDIUM:
		"0 16px 64px rgba(0, 0, 0, 0.15), 0 8px 32px rgba(0, 0, 0, 0.1)",
	CINEMATIC_STRONG:
		"0 32px 128px rgba(0, 0, 0, 0.2), 0 16px 64px rgba(0, 0, 0, 0.15)",

	// Colored shadows for drama
	GLOW_BLUE:
		"0 0 20px rgba(59, 130, 246, 0.3), 0 0 40px rgba(59, 130, 246, 0.1)",
	GLOW_PURPLE:
		"0 0 20px rgba(147, 51, 234, 0.3), 0 0 40px rgba(147, 51, 234, 0.1)",
	GLOW_CYAN: "0 0 20px rgba(6, 182, 212, 0.3), 0 0 40px rgba(6, 182, 212, 0.1)",
} as const;

/**
 * Z-index system for proper layering
 */
export const Z_INDEX = {
	BACKGROUND: -1,
	BASE: 0,
	CONTENT: 1,
	STICKY: 10,
	DROPDOWN: 50,
	OVERLAY: 100,
	MODAL: 200,
	POPOVER: 300,
	TOOLTIP: 400,
	LOADING: 500,
	MAXIMUM: 9999,
} as const;

/**
 * Motion-optimized CSS springs for world-class loading animations
 */
export const MOTION_SPRINGS = {
	// Gentle entrance spring (0.3 bounce, 0.8s duration)
	GENTLE_ENTRANCE:
		"1650ms linear(0, 0.1295, 0.4519, 0.8494, 1.2082, 1.446, 1.5266, 1.46, 1.2911, 1.0819, 0.8924, 0.7662, 0.7227, 0.7569, 0.8454, 0.9555, 1.0556, 1.1226, 1.146, 1.1284, 1.0821, 1.0241, 0.9713, 0.9357, 0.9231, 0.9321, 0.9564, 0.9869, 1.0148, 1.0337, 1.0405, 1.0359, 1.0231, 1.0071, 0.9923, 0.9824, 0.9787, 0.9811, 0.9877, 0.9962, 1.0039, 1.0092, 1.0112, 1.01, 1.0065, 1.0021, 0.998, 0.9952, 0.9941, 0.9947, 0.9965, 0.9989, 1.001, 1.0025, 1)",

	// Smooth dramatic spring (0.1 bounce, 1.2s duration)
	SMOOTH_DRAMATIC:
		"2950ms linear(0, 0.9719, 1.8538, 0.9931, 0.2721, 1.0323, 1.6196, 0.9501, 0.4735, 1.0616, 1.4468, 0.9313, 0.6215, 1.0723, 1.3202, 0.9267, 0.7296, 1.0723, 1.228, 0.9301, 0.8081, 1.0665, 1.1612, 0.9374, 0.8648, 1.0583, 1.1132, 0.9462, 0.9054, 1.0493, 1.0789, 0.9551, 0.9343, 1.0407, 1.0545, 0.9634, 0.9548, 1.0329, 1.0373, 0.9706, 0.9692, 1.0262, 1.0253, 0.9768, 0.9793, 1.0206, 1.0169, 0.9818, 0.9862, 1.016, 1.0112, 0.986, 0.991, 1.0123, 1.0072, 0.9893, 0.9942, 1.0094, 1.0046, 0.9918, 0.9964, 1.0071, 1.0028, 0.9938, 0.9978, 1.0053, 1.0017, 0.9954, 0.9987, 1.004, 1.0009, 0.9966, 0.9993, 1.0029, 1.0005, 0.9975, 0.9997, 1.0022, 1.0002, 0.9981, 0.9999, 1, 1, 1, 1, 1, 0.9999, 1, 1.0001, 1, 0.9999, 1, 1.0001, 1, 0.9999, 1, 1.0001, 1)",

	// Playful bounce spring (0.4 bounce, 0.6s duration)
	PLAYFUL_BOUNCE:
		"1050ms linear(0, 0.0726, 0.2529, 0.4862, 0.7259, 0.9371, 1.0986, 1.2019, 1.2488, 1.2485, 1.2141, 1.1597, 1.0983, 1.0403, 0.9928, 0.9595, 0.9409, 0.9356, 0.9406, 0.9524, 0.9675, 0.983, 0.9964, 1.0067, 1.0132, 1.0161, 1.016, 1.0137, 1.0101, 1.0062, 1.0025, 0.9994, 0.9973, 0.9962, 1)",

	// Natural bounce easing (1s duration)
	NATURAL_BOUNCE:
		"linear(0, 0.0008, 0.0031, 0.0069, 0.0123, 0.0193, 0.0278, 0.0378, 0.0494, 0.0625, 0.0772, 0.0934, 0.1111, 0.1304, 0.1512, 0.1736, 0.1975, 0.223, 0.25, 0.2785, 0.3086, 0.3403, 0.3735, 0.4082, 0.4444, 0.4823, 0.5216, 0.5625, 0.6049, 0.6489, 0.6944, 0.7415, 0.7901, 0.8403, 0.892, 0.9452, 1, 0.973, 0.9475, 0.9236, 0.9012, 0.8804, 0.8611, 0.8434, 0.8272, 0.8125, 0.7994, 0.7878, 0.7778, 0.7693, 0.7623, 0.7569, 0.7531, 0.7508, 0.75, 0.7508, 0.7531, 0.7569, 0.7623, 0.7693, 0.7778, 0.7878, 0.7994, 0.8125, 0.8272, 0.8434, 0.8611, 0.8804, 0.9012, 0.9236, 0.9475, 0.973, 1, 0.9869, 0.9753, 0.9653, 0.9568, 0.9498, 0.9444, 0.9406, 0.9383, 0.9375, 0.9383, 0.9406, 0.9444, 0.9498, 0.9568, 0.9653, 0.9753, 0.9869, 1, 0.9938, 0.9892, 0.9861, 0.9846, 0.9846, 0.9861, 0.9892, 0.9938, 1)",
} as const;

/**
 * Motion-optimized loading sequence timing
 */
export const MOTION_LOADING_TIMING = {
	// Phase durations optimized for Motion springs
	ENTRANCE_PHASE: 1.65, // Matches GENTLE_ENTRANCE spring
	LOGO_REVEAL: 1.05, // Matches PLAYFUL_BOUNCE spring
	CONTENT_STAGGER: 0.6, // Quick content reveals
	PROGRESS_ANIMATION: 2.95, // Matches SMOOTH_DRAMATIC spring
	EXIT_TRANSITION: 1.0, // Natural bounce exit

	// Stagger timings for organic reveals
	PARTICLE_STAGGER: 0.08,
	TEXT_STAGGER: 0.12,
	ELEMENT_STAGGER: 0.15,

	// Performance-optimized mobile timings
	MOBILE_MULTIPLIER: 0.8,
} as const;

/**
 * Motion-optimized spring configurations for Framer Motion
 */
export const MOTION_SPRING_CONFIGS = {
	// Gentle organic entrance
	GENTLE: {
		type: "spring" as const,
		stiffness: 120,
		damping: 20,
		mass: 1,
		restSpeed: 0.01,
		restDelta: 0.01,
	},

	// Snappy responsive interactions
	SNAPPY: {
		type: "spring" as const,
		stiffness: 400,
		damping: 30,
		mass: 0.8,
		restSpeed: 0.01,
		restDelta: 0.01,
	},

	// Smooth cinematic transitions
	CINEMATIC: {
		type: "spring" as const,
		stiffness: 100,
		damping: 25,
		mass: 1.2,
		restSpeed: 0.005,
		restDelta: 0.005,
	},

	// Dramatic emphasis
	DRAMATIC: {
		type: "spring" as const,
		stiffness: 200,
		damping: 15,
		mass: 1,
		restSpeed: 0.01,
		restDelta: 0.01,
	},
} as const;

/**
 * Animation variants for common patterns
 */
export const ANIMATION_VARIANTS = {
	// Fade animations
	FADE_IN: {
		initial: { opacity: 0 },
		animate: { opacity: 1 },
		exit: { opacity: 0 },
	},

	// Scale animations
	SCALE_IN: {
		initial: { opacity: 0, scale: 0.8 },
		animate: { opacity: 1, scale: 1 },
		exit: { opacity: 0, scale: 0.8 },
	},

	// Slide animations
	SLIDE_UP: {
		initial: { opacity: 0, y: 30 },
		animate: { opacity: 1, y: 0 },
		exit: { opacity: 0, y: -30 },
	},

	SLIDE_DOWN: {
		initial: { opacity: 0, y: -30 },
		animate: { opacity: 1, y: 0 },
		exit: { opacity: 0, y: 30 },
	},

	SLIDE_LEFT: {
		initial: { opacity: 0, x: 30 },
		animate: { opacity: 1, x: 0 },
		exit: { opacity: 0, x: -30 },
	},

	SLIDE_RIGHT: {
		initial: { opacity: 0, x: -30 },
		animate: { opacity: 1, x: 0 },
		exit: { opacity: 0, x: 30 },
	},
} as const;
