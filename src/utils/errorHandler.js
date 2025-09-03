/**
 * Error Handler Utility
 * 
 * This utility provides functions for handling errors throughout the application.
 * It includes error logging, formatting, and user-friendly error messages.
 */

// Error types
export const ERROR_TYPES = {
  VALIDATION: 'validation_error',
  API: 'api_error',
  NETWORK: 'network_error',
  AUTH: 'authentication_error',
  PERMISSION: 'permission_error',
  NOT_FOUND: 'not_found_error',
  TIMEOUT: 'timeout_error',
  UNKNOWN: 'unknown_error'
};

/**
 * Handle an error and return a standardized error object
 * @param {Error} error - The error to handle
 * @param {string} context - The context where the error occurred
 * @returns {Object} - Standardized error object
 */
export function handleError(error, context = '') {
  // Determine error type
  const errorType = determineErrorType(error);
  
  // Log the error
  logError(error, errorType, context);
  
  // Return standardized error object
  return {
    type: errorType,
    message: getUserFriendlyMessage(error, errorType),
    context,
    timestamp: new Date().toISOString(),
    originalError: process.env.NODE_ENV === 'development' ? error : undefined
  };
}

/**
 * Determine the type of an error
 * @param {Error} error - The error to analyze
 * @returns {string} - The error type
 */
function determineErrorType(error) {
  if (!error) return ERROR_TYPES.UNKNOWN;
  
  // Check for network errors
  if (error.name === 'NetworkError' || 
      error.message?.includes('network') || 
      error.message?.includes('fetch')) {
    return ERROR_TYPES.NETWORK;
  }
  
  // Check for validation errors
  if (error.name === 'ValidationError' || 
      error.message?.includes('validation') || 
      error.message?.includes('invalid')) {
    return ERROR_TYPES.VALIDATION;
  }
  
  // Check for API errors
  if (error.name === 'ApiError' || 
      error.status || 
      error.statusCode) {
    // Check for specific HTTP status codes
    const status = error.status || error.statusCode;
    if (status === 401 || status === 403) {
      return ERROR_TYPES.AUTH;
    }
    if (status === 404) {
      return ERROR_TYPES.NOT_FOUND;
    }
    if (status === 408 || status === 504) {
      return ERROR_TYPES.TIMEOUT;
    }
    return ERROR_TYPES.API;
  }
  
  // Check for timeout errors
  if (error.name === 'TimeoutError' || 
      error.message?.includes('timeout') || 
      error.message?.includes('timed out')) {
    return ERROR_TYPES.TIMEOUT;
  }
  
  // Default to unknown error
  return ERROR_TYPES.UNKNOWN;
}

/**
 * Log an error to the console or error tracking service
 * @param {Error} error - The error to log
 * @param {string} errorType - The type of error
 * @param {string} context - The context where the error occurred
 */
function logError(error, errorType, context) {
  // In a production app, this would send the error to a logging service
  // For this demo, we'll just log to the console
  console.error(`[${errorType}] Error in ${context}:`, error);
}

/**
 * Get a user-friendly error message
 * @param {Error} error - The original error
 * @param {string} errorType - The type of error
 * @returns {string} - User-friendly error message
 */
function getUserFriendlyMessage(error, errorType) {
  // Use the original error message if available
  const originalMessage = error.message || 'An error occurred';
  
  // For certain error types, provide more user-friendly messages
  switch (errorType) {
    case ERROR_TYPES.NETWORK:
      return 'Unable to connect to the server. Please check your internet connection and try again.';
    
    case ERROR_TYPES.AUTH:
      return 'Authentication failed. Please check your credentials and try again.';
    
    case ERROR_TYPES.PERMISSION:
      return 'You do not have permission to perform this action.';
    
    case ERROR_TYPES.NOT_FOUND:
      return 'The requested resource was not found.';
    
    case ERROR_TYPES.TIMEOUT:
      return 'The request timed out. Please try again later.';
    
    case ERROR_TYPES.VALIDATION:
      // For validation errors, use the original message as it's usually helpful
      return originalMessage;
    
    case ERROR_TYPES.API:
      // For API errors, use the original message if it's user-friendly
      if (originalMessage.includes('API') || originalMessage.includes('server')) {
        return originalMessage;
      }
      return 'An error occurred while communicating with the server.';
    
    case ERROR_TYPES.UNKNOWN:
    default:
      // For unknown errors, provide a generic message
      return 'An unexpected error occurred. Please try again later.';
  }
}

/**
 * Create a custom error with a specific type
 * @param {string} message - The error message
 * @param {string} type - The error type
 * @param {Object} additionalData - Additional data to include in the error
 * @returns {Error} - The custom error
 */
export function createError(message, type = ERROR_TYPES.UNKNOWN, additionalData = {}) {
  const error = new Error(message);
  error.type = type;
  
  // Add additional data to the error
  Object.entries(additionalData).forEach(([key, value]) => {
    error[key] = value;
  });
  
  return error;
}

/**
 * Create a validation error
 * @param {string} message - The error message
 * @param {Object} validationErrors - Specific validation errors
 * @returns {Error} - The validation error
 */
export function createValidationError(message, validationErrors = {}) {
  return createError(message, ERROR_TYPES.VALIDATION, { validationErrors });
}

/**
 * Create an API error
 * @param {string} message - The error message
 * @param {number} status - The HTTP status code
 * @param {Object} responseData - The response data from the API
 * @returns {Error} - The API error
 */
export function createApiError(message, status, responseData = {}) {
  return createError(message, ERROR_TYPES.API, { status, responseData });
}

/**
 * Wrap an async function with error handling
 * @param {Function} fn - The async function to wrap
 * @param {string} context - The context for error handling
 * @returns {Function} - The wrapped function
 */
export function withErrorHandling(fn, context) {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (error) {
      return { error: handleError(error, context) };
    }
  };
}

/**
 * Format an error for display in the UI
 * @param {Object} error - The error object
 * @returns {Object} - Formatted error for UI display
 */
export function formatErrorForDisplay(error) {
  if (!error) return null;
  
  // If it's already a handled error, use it directly
  if (error.type && error.message) {
    return {
      title: getErrorTitle(error.type),
      message: error.message,
      type: error.type
    };
  }
  
  // Otherwise, handle it first
  const handled = handleError(error);
  
  return {
    title: getErrorTitle(handled.type),
    message: handled.message,
    type: handled.type
  };
}

/**
 * Get a user-friendly title for an error type
 * @param {string} errorType - The error type
 * @returns {string} - User-friendly error title
 */
function getErrorTitle(errorType) {
  switch (errorType) {
    case ERROR_TYPES.VALIDATION:
      return 'Validation Error';
    case ERROR_TYPES.API:
      return 'API Error';
    case ERROR_TYPES.NETWORK:
      return 'Network Error';
    case ERROR_TYPES.AUTH:
      return 'Authentication Error';
    case ERROR_TYPES.PERMISSION:
      return 'Permission Error';
    case ERROR_TYPES.NOT_FOUND:
      return 'Not Found';
    case ERROR_TYPES.TIMEOUT:
      return 'Request Timeout';
    case ERROR_TYPES.UNKNOWN:
    default:
      return 'Error';
  }
}

