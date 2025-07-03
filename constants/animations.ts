export interface AnimationConfig {
  duration: number;
  easing: string;
  delay?: number;
  className: string;
}

export const ANIMATIONS = {
  // Fade animations
  fadeIn: {
    duration: 300,
    easing: 'ease-out',
    className: 'animate-fade-in'
  },
  fadeOut: {
    duration: 200,
    easing: 'ease-in',
    className: 'animate-fade-out'
  },
  fadeInUp: {
    duration: 400,
    easing: 'ease-out',
    className: 'animate-fade-in-up'
  },
  fadeInDown: {
    duration: 400,
    easing: 'ease-out',
    className: 'animate-fade-in-down'
  },

  // Slide animations
  slideInLeft: {
    duration: 300,
    easing: 'ease-out',
    className: 'animate-slide-in-left'
  },
  slideInRight: {
    duration: 300,
    easing: 'ease-out',
    className: 'animate-slide-in-right'
  },
  slideInUp: {
    duration: 300,
    easing: 'ease-out',
    className: 'animate-slide-in-up'
  },
  slideInDown: {
    duration: 300,
    easing: 'ease-out',
    className: 'animate-slide-in-down'
  },

  // Scale animations
  scaleIn: {
    duration: 250,
    easing: 'ease-out',
    className: 'animate-scale-in'
  },
  scaleOut: {
    duration: 200,
    easing: 'ease-in',
    className: 'animate-scale-out'
  },
  bounceIn: {
    duration: 600,
    easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    className: 'animate-bounce-in'
  },

  // Loading animations
  spin: {
    duration: 1000,
    easing: 'linear',
    className: 'animate-spin'
  },
  pulse: {
    duration: 2000,
    easing: 'ease-in-out',
    className: 'animate-pulse'
  },
  shimmer: {
    duration: 1500,
    easing: 'ease-in-out',
    className: 'animate-shimmer'
  },

  // Button animations
  buttonPress: {
    duration: 150,
    easing: 'ease-out',
    className: 'animate-button-press'
  },
  buttonHover: {
    duration: 200,
    easing: 'ease-out',
    className: 'animate-button-hover'
  },

  // Modal animations
  modalIn: {
    duration: 300,
    easing: 'ease-out',
    className: 'animate-modal-in'
  },
  modalOut: {
    duration: 250,
    easing: 'ease-in',
    className: 'animate-modal-out'
  },

  // Page transitions
  pageEnter: {
    duration: 400,
    easing: 'ease-out',
    className: 'animate-page-enter'
  },
  pageExit: {
    duration: 300,
    easing: 'ease-in',
    className: 'animate-page-exit'
  }
} as const;

export type AnimationType = keyof typeof ANIMATIONS;

export function getAnimationConfig(type: AnimationType): AnimationConfig {
  return ANIMATIONS[type];
}

export function getAnimationClasses(types: AnimationType[]): string {
  return types.map(type => ANIMATIONS[type].className).join(' ');
}

// Animation timing presets
export const ANIMATION_TIMING = {
  fast: 150,
  normal: 300,
  slow: 500,
  verySlow: 800
} as const;

// Animation easing presets
export const ANIMATION_EASING = {
  linear: 'linear',
  easeIn: 'ease-in',
  easeOut: 'ease-out',
  easeInOut: 'ease-in-out',
  bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  elastic: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)'
} as const; 