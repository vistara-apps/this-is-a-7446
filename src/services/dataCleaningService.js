/**
 * Data Cleaning Service
 * 
 * This service provides functions for cleaning and standardizing data.
 * It includes various cleaning rules and utilities for data transformation.
 */

/**
 * Apply cleaning rules to a dataset
 * @param {Array} data - The raw data to clean
 * @param {Array} rules - Array of rule IDs to apply
 * @param {Object} options - Configuration options for cleaning rules
 * @returns {Array} - The cleaned data
 */
export function applyCleaningRules(data, rules, options = {}) {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return [];
  }

  // Create a copy of the data to avoid mutating the original
  let cleanedData = JSON.parse(JSON.stringify(data));
  
  // Apply each selected rule
  rules.forEach(ruleId => {
    const ruleFunction = CLEANING_RULES[ruleId];
    if (ruleFunction) {
      cleanedData = ruleFunction(cleanedData, options);
    }
  });

  return cleanedData;
}

/**
 * Get statistics about the cleaning process
 * @param {Array} originalData - The original data
 * @param {Array} cleanedData - The cleaned data
 * @returns {Object} - Statistics about the cleaning process
 */
export function getCleaningStats(originalData, cleanedData) {
  if (!originalData || !cleanedData) {
    return {};
  }

  // Count modified fields
  let modifiedFields = 0;
  let totalFields = 0;

  // Sample the first 100 rows for performance
  const sampleSize = Math.min(originalData.length, 100);
  
  for (let i = 0; i < sampleSize; i++) {
    const original = originalData[i];
    const cleaned = cleanedData[i];
    
    if (!original || !cleaned) continue;
    
    Object.keys(original).forEach(key => {
      totalFields++;
      if (original[key] !== cleaned[key]) {
        modifiedFields++;
      }
    });
  }

  return {
    originalRowCount: originalData.length,
    cleanedRowCount: cleanedData.length,
    modifiedFields,
    totalFields,
    modificationRate: totalFields > 0 ? (modifiedFields / totalFields) * 100 : 0,
    duplicatesRemoved: originalData.length - cleanedData.length
  };
}

/**
 * Validate a dataset against a schema
 * @param {Array} data - The data to validate
 * @param {Object} schema - The schema to validate against
 * @returns {Object} - Validation results
 */
export function validateDataset(data, schema) {
  if (!data || !schema) {
    return { valid: false, errors: ['Invalid data or schema'] };
  }

  const errors = [];
  const fieldErrors = {};

  data.forEach((row, rowIndex) => {
    Object.entries(schema).forEach(([field, type]) => {
      if (row[field] !== undefined && row[field] !== null) {
        const isValid = validateField(row[field], type);
        if (!isValid) {
          if (!fieldErrors[field]) {
            fieldErrors[field] = [];
          }
          fieldErrors[field].push({
            rowIndex,
            value: row[field],
            message: `Invalid ${type} value`
          });
        }
      }
    });
  });

  if (Object.keys(fieldErrors).length > 0) {
    errors.push('Schema validation failed');
  }

  return {
    valid: errors.length === 0,
    errors,
    fieldErrors
  };
}

/**
 * Validate a field value against a type
 * @param {any} value - The value to validate
 * @param {string} type - The expected type
 * @returns {boolean} - Whether the value is valid
 */
function validateField(value, type) {
  switch (type) {
    case 'string':
      return typeof value === 'string';
    case 'number':
      return typeof value === 'number' && !isNaN(value);
    case 'boolean':
      return typeof value === 'boolean';
    case 'date':
      return !isNaN(new Date(value).getTime());
    case 'url':
      try {
        new URL(value);
        return true;
      } catch (e) {
        return false;
      }
    case 'email':
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    default:
      return true;
  }
}

// Define cleaning rule functions
const CLEANING_RULES = {
  // Normalize text fields (lowercase, trim whitespace)
  'normalize-text': (data) => {
    return data.map(row => {
      const cleaned = { ...row };
      Object.keys(cleaned).forEach(key => {
        if (typeof cleaned[key] === 'string') {
          cleaned[key] = cleaned[key].toLowerCase().trim();
        }
      });
      return cleaned;
    });
  },

  // Standardize date fields to ISO format
  'standardize-dates': (data) => {
    return data.map(row => {
      const cleaned = { ...row };
      Object.keys(cleaned).forEach(key => {
        if ((key.includes('date') || key.includes('time')) && cleaned[key]) {
          try {
            const date = new Date(cleaned[key]);
            if (!isNaN(date.getTime())) {
              cleaned[key] = date.toISOString().split('T')[0];
            }
          } catch (e) {
            // Keep original if parsing fails
          }
        }
      });
      return cleaned;
    });
  },

  // Remove duplicate rows based on all fields
  'remove-duplicates': (data) => {
    const uniqueMap = new Map();
    
    data.forEach(row => {
      // Create a string key from all values
      const key = JSON.stringify(row);
      uniqueMap.set(key, row);
    });
    
    return Array.from(uniqueMap.values());
  },

  // Fill missing values with defaults or specified values
  'fill-missing': (data, options = {}) => {
    const { defaultValues = {} } = options;
    
    return data.map(row => {
      const cleaned = { ...row };
      Object.keys(cleaned).forEach(key => {
        if (cleaned[key] === null || cleaned[key] === undefined || cleaned[key] === '') {
          if (defaultValues[key] !== undefined) {
            cleaned[key] = defaultValues[key];
          } else if (key.includes('date')) {
            cleaned[key] = new Date().toISOString().split('T')[0];
          } else if (typeof cleaned[key] === 'number') {
            cleaned[key] = 0;
          } else if (typeof cleaned[key] === 'string') {
            cleaned[key] = '';
          }
        }
      });
      return cleaned;
    });
  },

  // Validate and clean email addresses
  'validate-emails': (data) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    return data.map(row => {
      const cleaned = { ...row };
      Object.keys(cleaned).forEach(key => {
        if ((key.includes('email') || key.includes('mail')) && typeof cleaned[key] === 'string') {
          const email = cleaned[key].trim().toLowerCase();
          cleaned[key] = emailRegex.test(email) ? email : '';
        }
      });
      return cleaned;
    });
  },

  // Clean and standardize URLs
  'clean-urls': (data) => {
    return data.map(row => {
      const cleaned = { ...row };
      Object.keys(cleaned).forEach(key => {
        if ((key.includes('url') || key.includes('link') || key.includes('website')) && 
            typeof cleaned[key] === 'string' && cleaned[key]) {
          let url = cleaned[key].trim();
          
          // Add protocol if missing
          if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
          }
          
          // Remove trailing slashes
          url = url.replace(/\/+$/, '');
          
          try {
            // Validate URL format
            new URL(url);
            cleaned[key] = url;
          } catch (e) {
            // Keep original if invalid
          }
        }
      });
      return cleaned;
    });
  },

  // Remove special characters from text
  'remove-special-chars': (data, options = {}) => {
    const { fields = [], pattern = /[^a-zA-Z0-9\s]/g } = options;
    
    return data.map(row => {
      const cleaned = { ...row };
      Object.keys(cleaned).forEach(key => {
        if ((fields.length === 0 || fields.includes(key)) && 
            typeof cleaned[key] === 'string') {
          cleaned[key] = cleaned[key].replace(pattern, '');
        }
      });
      return cleaned;
    });
  },

  // Format phone numbers
  'format-phones': (data, options = {}) => {
    const { format = '(XXX) XXX-XXXX' } = options;
    
    return data.map(row => {
      const cleaned = { ...row };
      Object.keys(cleaned).forEach(key => {
        if ((key.includes('phone') || key.includes('mobile') || key.includes('cell')) && 
            typeof cleaned[key] === 'string') {
          // Extract digits only
          const digits = cleaned[key].replace(/\D/g, '');
          
          if (digits.length >= 10) {
            // Format based on the specified format
            let formatted = format;
            for (let i = 0; i < digits.length && i < 10; i++) {
              formatted = formatted.replace('X', digits[i]);
            }
            cleaned[key] = formatted;
          }
        }
      });
      return cleaned;
    });
  },

  // Convert text case (uppercase, lowercase, title case)
  'convert-case': (data, options = {}) => {
    const { fields = [], caseType = 'title' } = options;
    
    return data.map(row => {
      const cleaned = { ...row };
      Object.keys(cleaned).forEach(key => {
        if ((fields.length === 0 || fields.includes(key)) && 
            typeof cleaned[key] === 'string') {
          if (caseType === 'upper') {
            cleaned[key] = cleaned[key].toUpperCase();
          } else if (caseType === 'lower') {
            cleaned[key] = cleaned[key].toLowerCase();
          } else if (caseType === 'title') {
            cleaned[key] = cleaned[key].toLowerCase().split(' ')
              .map(word => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ');
          }
        }
      });
      return cleaned;
    });
  },

  // Trim whitespace from all string fields
  'trim-whitespace': (data) => {
    return data.map(row => {
      const cleaned = { ...row };
      Object.keys(cleaned).forEach(key => {
        if (typeof cleaned[key] === 'string') {
          cleaned[key] = cleaned[key].trim();
        }
      });
      return cleaned;
    });
  }
};

// Export the cleaning rules for UI display
export const CLEANING_RULE_DEFINITIONS = [
  { 
    id: 'normalize-text', 
    name: 'Normalize Text', 
    description: 'Convert to lowercase, trim whitespace',
    category: 'Text'
  },
  { 
    id: 'standardize-dates', 
    name: 'Standardize Dates', 
    description: 'Convert to ISO format (YYYY-MM-DD)',
    category: 'Date'
  },
  { 
    id: 'remove-duplicates', 
    name: 'Remove Duplicates', 
    description: 'Remove duplicate rows based on all fields',
    category: 'Structure'
  },
  { 
    id: 'fill-missing', 
    name: 'Fill Missing Values', 
    description: 'Replace empty fields with defaults',
    category: 'Structure',
    configurable: true
  },
  { 
    id: 'validate-emails', 
    name: 'Validate Emails', 
    description: 'Check email format validity',
    category: 'Validation'
  },
  { 
    id: 'clean-urls', 
    name: 'Clean URLs', 
    description: 'Ensure proper URL format with protocols',
    category: 'Text'
  },
  { 
    id: 'remove-special-chars', 
    name: 'Remove Special Characters', 
    description: 'Remove non-alphanumeric characters',
    category: 'Text',
    configurable: true
  },
  { 
    id: 'format-phones', 
    name: 'Format Phone Numbers', 
    description: 'Standardize phone number formats',
    category: 'Text',
    configurable: true
  },
  { 
    id: 'convert-case', 
    name: 'Convert Text Case', 
    description: 'Change text to uppercase, lowercase, or title case',
    category: 'Text',
    configurable: true
  },
  { 
    id: 'trim-whitespace', 
    name: 'Trim Whitespace', 
    description: 'Remove leading and trailing spaces',
    category: 'Text'
  }
];

// Export rule categories for UI organization
export const CLEANING_RULE_CATEGORIES = [
  { id: 'text', name: 'Text Formatting' },
  { id: 'date', name: 'Date & Time' },
  { id: 'structure', name: 'Data Structure' },
  { id: 'validation', name: 'Validation & Quality' }
];

