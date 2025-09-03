/**
 * Validation Utility
 * 
 * This utility provides functions for validating data throughout the application.
 * It includes validation rules for common data types and formats.
 */

import { createValidationError } from './errorHandler';

/**
 * Validate an object against a schema
 * @param {Object} data - The data to validate
 * @param {Object} schema - The validation schema
 * @returns {Object} - Validation result
 */
export function validateObject(data, schema) {
  const errors = {};
  let isValid = true;
  
  // Check each field in the schema
  Object.entries(schema).forEach(([field, rules]) => {
    // Skip validation if the field is not required and is empty
    if (!rules.required && (data[field] === undefined || data[field] === null || data[field] === '')) {
      return;
    }
    
    // Validate required fields
    if (rules.required && (data[field] === undefined || data[field] === null || data[field] === '')) {
      errors[field] = 'This field is required';
      isValid = false;
      return;
    }
    
    // Skip further validation if the field is empty
    if (data[field] === undefined || data[field] === null || data[field] === '') {
      return;
    }
    
    // Validate field type
    if (rules.type && !validateType(data[field], rules.type)) {
      errors[field] = `Must be a valid ${rules.type}`;
      isValid = false;
      return;
    }
    
    // Validate field format
    if (rules.format && !validateFormat(data[field], rules.format)) {
      errors[field] = `Must be a valid ${rules.format}`;
      isValid = false;
      return;
    }
    
    // Validate min/max for numbers
    if (rules.type === 'number') {
      if (rules.min !== undefined && data[field] < rules.min) {
        errors[field] = `Must be at least ${rules.min}`;
        isValid = false;
        return;
      }
      
      if (rules.max !== undefined && data[field] > rules.max) {
        errors[field] = `Must be at most ${rules.max}`;
        isValid = false;
        return;
      }
    }
    
    // Validate min/max length for strings
    if (rules.type === 'string') {
      if (rules.minLength !== undefined && data[field].length < rules.minLength) {
        errors[field] = `Must be at least ${rules.minLength} characters`;
        isValid = false;
        return;
      }
      
      if (rules.maxLength !== undefined && data[field].length > rules.maxLength) {
        errors[field] = `Must be at most ${rules.maxLength} characters`;
        isValid = false;
        return;
      }
    }
    
    // Validate pattern
    if (rules.pattern && !rules.pattern.test(data[field])) {
      errors[field] = rules.patternMessage || 'Invalid format';
      isValid = false;
      return;
    }
    
    // Validate enum values
    if (rules.enum && !rules.enum.includes(data[field])) {
      errors[field] = `Must be one of: ${rules.enum.join(', ')}`;
      isValid = false;
      return;
    }
    
    // Validate custom rules
    if (rules.validate && typeof rules.validate === 'function') {
      const customValidation = rules.validate(data[field], data);
      if (customValidation !== true) {
        errors[field] = customValidation || 'Invalid value';
        isValid = false;
        return;
      }
    }
  });
  
  return {
    isValid,
    errors: Object.keys(errors).length > 0 ? errors : null
  };
}

/**
 * Validate a value against a type
 * @param {any} value - The value to validate
 * @param {string} type - The expected type
 * @returns {boolean} - Whether the value is valid
 */
export function validateType(value, type) {
  switch (type) {
    case 'string':
      return typeof value === 'string';
    
    case 'number':
      return typeof value === 'number' && !isNaN(value);
    
    case 'boolean':
      return typeof value === 'boolean';
    
    case 'array':
      return Array.isArray(value);
    
    case 'object':
      return typeof value === 'object' && value !== null && !Array.isArray(value);
    
    case 'date':
      return value instanceof Date && !isNaN(value.getTime());
    
    default:
      return true;
  }
}

/**
 * Validate a value against a format
 * @param {any} value - The value to validate
 * @param {string} format - The expected format
 * @returns {boolean} - Whether the value is valid
 */
export function validateFormat(value, format) {
  switch (format) {
    case 'email':
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    
    case 'url':
      try {
        new URL(value);
        return true;
      } catch (e) {
        return false;
      }
    
    case 'date-iso':
      return /^\d{4}-\d{2}-\d{2}$/.test(value);
    
    case 'date-time-iso':
      return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/.test(value);
    
    case 'phone':
      return /^\+?[\d\s-()]{7,}$/.test(value);
    
    case 'zip':
      return /^\d{5}(-\d{4})?$/.test(value);
    
    case 'ip':
      return /^(\d{1,3}\.){3}\d{1,3}$/.test(value);
    
    case 'color-hex':
      return /^#([0-9A-F]{3}|[0-9A-F]{6})$/i.test(value);
    
    default:
      return true;
  }
}

/**
 * Validate and throw an error if invalid
 * @param {Object} data - The data to validate
 * @param {Object} schema - The validation schema
 * @throws {Error} - Throws a validation error if invalid
 */
export function validateAndThrow(data, schema) {
  const result = validateObject(data, schema);
  
  if (!result.isValid) {
    throw createValidationError('Validation failed', result.errors);
  }
  
  return true;
}

/**
 * Validate a URL
 * @param {string} url - The URL to validate
 * @returns {boolean} - Whether the URL is valid
 */
export function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Validate an email address
 * @param {string} email - The email to validate
 * @returns {boolean} - Whether the email is valid
 */
export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Validate a date string
 * @param {string} dateStr - The date string to validate
 * @returns {boolean} - Whether the date is valid
 */
export function isValidDate(dateStr) {
  const date = new Date(dateStr);
  return !isNaN(date.getTime());
}

/**
 * Validate a CSS selector
 * @param {string} selector - The CSS selector to validate
 * @returns {boolean} - Whether the selector is valid
 */
export function isValidCssSelector(selector) {
  try {
    document.querySelector(selector);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Common validation schemas
 */
export const VALIDATION_SCHEMAS = {
  // Data source schema
  dataSource: {
    name: {
      required: true,
      type: 'string',
      minLength: 1,
      maxLength: 100
    },
    type: {
      required: true,
      type: 'string',
      enum: ['scrape', 'api']
    },
    config: {
      required: true,
      type: 'object'
    }
  },
  
  // Web scraper config schema
  scraperConfig: {
    url: {
      required: true,
      type: 'string',
      format: 'url'
    },
    selectors: {
      required: true,
      type: 'object'
    },
    schedule: {
      required: true,
      type: 'string',
      enum: ['once', 'hourly', 'daily', 'weekly', 'monthly']
    }
  },
  
  // API connector config schema
  apiConfig: {
    endpoint: {
      required: true,
      type: 'string',
      format: 'url'
    },
    params: {
      required: false,
      type: 'object'
    },
    headers: {
      required: false,
      type: 'object'
    },
    authType: {
      required: true,
      type: 'string',
      enum: ['none', 'api_key', 'bearer', 'basic', 'oauth']
    },
    schedule: {
      required: true,
      type: 'string',
      enum: ['once', 'hourly', 'daily', 'weekly', 'monthly']
    }
  },
  
  // Dataset schema
  dataset: {
    name: {
      required: true,
      type: 'string',
      minLength: 1,
      maxLength: 100
    },
    sourceIds: {
      required: true,
      type: 'array'
    }
  },
  
  // User schema
  user: {
    email: {
      required: true,
      type: 'string',
      format: 'email'
    },
    password: {
      required: true,
      type: 'string',
      minLength: 8,
      pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      patternMessage: 'Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character'
    },
    name: {
      required: true,
      type: 'string',
      minLength: 1,
      maxLength: 100
    }
  }
};

