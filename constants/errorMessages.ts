export interface ErrorMessage {
  code: string;
  title: string;
  description: string;
  userMessage: string;
  severity: 'error' | 'warning' | 'info';
}

export const ERROR_MESSAGES: Record<string, ErrorMessage> = {
  // API Errors
  API_KEY_MISSING: {
    code: 'API_KEY_MISSING',
    title: 'Configuration Error',
    description: 'API key is not configured on the server',
    userMessage: 'Service is not properly configured. Please contact support.',
    severity: 'error'
  },
  API_RATE_LIMIT: {
    code: 'API_RATE_LIMIT',
    title: 'Rate Limit Exceeded',
    description: 'Too many requests to the API',
    userMessage: 'Too many requests. Please wait a moment and try again.',
    severity: 'warning'
  },
  API_UNAUTHORIZED: {
    code: 'API_UNAUTHORIZED',
    title: 'Authentication Failed',
    description: 'Invalid or expired API key',
    userMessage: 'Authentication failed. Please check your configuration.',
    severity: 'error'
  },
  API_SERVER_ERROR: {
    code: 'API_SERVER_ERROR',
    title: 'Service Unavailable',
    description: 'External service is temporarily unavailable',
    userMessage: 'Service is temporarily unavailable. Please try again later.',
    severity: 'error'
  },
  API_TIMEOUT: {
    code: 'API_TIMEOUT',
    title: 'Request Timeout',
    description: 'Request to external service timed out',
    userMessage: 'Request timed out. Please check your connection and try again.',
    severity: 'warning'
  },
  API_INVALID_RESPONSE: {
    code: 'API_INVALID_RESPONSE',
    title: 'Invalid Response',
    description: 'Received invalid response from external service',
    userMessage: 'Received an invalid response. Please try again.',
    severity: 'error'
  },

  // Validation Errors
  INVALID_INPUT: {
    code: 'INVALID_INPUT',
    title: 'Invalid Input',
    description: 'User provided invalid input data',
    userMessage: 'Please check your input and try again.',
    severity: 'warning'
  },
  REQUIRED_FIELD_MISSING: {
    code: 'REQUIRED_FIELD_MISSING',
    title: 'Missing Information',
    description: 'Required field is missing',
    userMessage: 'Please fill in all required fields.',
    severity: 'warning'
  },
  INVALID_URL: {
    code: 'INVALID_URL',
    title: 'Invalid URL',
    description: 'Provided URL is not valid',
    userMessage: 'Please enter a valid URL.',
    severity: 'warning'
  },

  // Network Errors
  NETWORK_ERROR: {
    code: 'NETWORK_ERROR',
    title: 'Network Error',
    description: 'Failed to connect to the server',
    userMessage: 'Network connection failed. Please check your internet connection.',
    severity: 'error'
  },
  FETCH_FAILED: {
    code: 'FETCH_FAILED',
    title: 'Request Failed',
    description: 'Failed to fetch data from server',
    userMessage: 'Failed to load data. Please try again.',
    severity: 'error'
  },

  // Application Errors
  COMPONENT_ERROR: {
    code: 'COMPONENT_ERROR',
    title: 'Application Error',
    description: 'Unexpected error in application component',
    userMessage: 'An unexpected error occurred. Please refresh the page.',
    severity: 'error'
  },
  STATE_ERROR: {
    code: 'STATE_ERROR',
    title: 'State Error',
    description: 'Application state is inconsistent',
    userMessage: 'Application state error. Please refresh the page.',
    severity: 'error'
  },
  RENDER_ERROR: {
    code: 'RENDER_ERROR',
    title: 'Display Error',
    description: 'Failed to render component',
    userMessage: 'Failed to display content. Please refresh the page.',
    severity: 'error'
  },

  // User Action Errors
  ACTION_FAILED: {
    code: 'ACTION_FAILED',
    title: 'Action Failed',
    description: 'User action could not be completed',
    userMessage: 'Action could not be completed. Please try again.',
    severity: 'warning'
  },
  PERMISSION_DENIED: {
    code: 'PERMISSION_DENIED',
    title: 'Permission Denied',
    description: 'User does not have permission for this action',
    userMessage: 'You do not have permission to perform this action.',
    severity: 'warning'
  },

  // Default Error
  UNKNOWN_ERROR: {
    code: 'UNKNOWN_ERROR',
    title: 'Unknown Error',
    description: 'An unknown error occurred',
    userMessage: 'An unexpected error occurred. Please try again.',
    severity: 'error'
  }
};

export function getErrorMessage(code: string): ErrorMessage {
  return ERROR_MESSAGES[code] || ERROR_MESSAGES.UNKNOWN_ERROR;
}

export function getErrorMessageByType(error: any): ErrorMessage {
  if (typeof error === 'string') {
    return getErrorMessage(error);
  }
  
  if (error?.code && ERROR_MESSAGES[error.code]) {
    return ERROR_MESSAGES[error.code];
  }
  
  if (error?.message) {
    // Try to match error message patterns
    const message = error.message.toLowerCase();
    
    if (message.includes('rate limit')) return ERROR_MESSAGES.API_RATE_LIMIT;
    if (message.includes('unauthorized')) return ERROR_MESSAGES.API_UNAUTHORIZED;
    if (message.includes('timeout')) return ERROR_MESSAGES.API_TIMEOUT;
    if (message.includes('network')) return ERROR_MESSAGES.NETWORK_ERROR;
    if (message.includes('fetch')) return ERROR_MESSAGES.FETCH_FAILED;
    if (message.includes('invalid')) return ERROR_MESSAGES.INVALID_INPUT;
  }
  
  return ERROR_MESSAGES.UNKNOWN_ERROR;
} 