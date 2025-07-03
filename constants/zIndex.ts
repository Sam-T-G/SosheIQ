// Z-Index Constants
// Organized from lowest to highest priority
export const Z_INDEX = {
  // Base content layers
  BASE: 0,
  CONTENT: 1,
  
  // Interactive elements
  BUTTON: 10,
  INPUT: 10,
  DROPDOWN: 20,
  
  // Navigation and headers
  NAVIGATION: 30,
  HEADER: 40,
  SIDEBAR: 50,
  
  // Overlays and modals
  OVERLAY: 100,
  MODAL: 200,
  MODAL_CONTENT: 210,
  TOOLTIP: 300,
  
  // Notifications and alerts
  NOTIFICATION: 400,
  TOAST: 500,
  ALERT: 600,
  
  // Loading and progress
  LOADING: 700,
  PROGRESS: 800,
  
  // Highest priority elements
  SKIP_LINK: 9999,
  DEBUG: 10000
} as const;

// Helper function to get z-index value
export function getZIndex(level: keyof typeof Z_INDEX): number {
  return Z_INDEX[level];
}

// CSS custom properties for use in stylesheets
export const Z_INDEX_CSS_VARS = {
  '--z-base': Z_INDEX.BASE,
  '--z-content': Z_INDEX.CONTENT,
  '--z-button': Z_INDEX.BUTTON,
  '--z-input': Z_INDEX.INPUT,
  '--z-dropdown': Z_INDEX.DROPDOWN,
  '--z-navigation': Z_INDEX.NAVIGATION,
  '--z-header': Z_INDEX.HEADER,
  '--z-sidebar': Z_INDEX.SIDEBAR,
  '--z-overlay': Z_INDEX.OVERLAY,
  '--z-modal': Z_INDEX.MODAL,
  '--z-modal-content': Z_INDEX.MODAL_CONTENT,
  '--z-tooltip': Z_INDEX.TOOLTIP,
  '--z-notification': Z_INDEX.NOTIFICATION,
  '--z-toast': Z_INDEX.TOAST,
  '--z-alert': Z_INDEX.ALERT,
  '--z-loading': Z_INDEX.LOADING,
  '--z-progress': Z_INDEX.PROGRESS,
  '--z-skip-link': Z_INDEX.SKIP_LINK,
  '--z-debug': Z_INDEX.DEBUG
} as const; 