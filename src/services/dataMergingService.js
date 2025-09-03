/**
 * Data Merging Service
 * 
 * This service provides functions for merging datasets based on common fields.
 * It includes various join strategies and utilities for data combination.
 */

/**
 * Merge datasets based on a common key
 * @param {Array} datasets - Array of datasets to merge
 * @param {Object} options - Merge options
 * @returns {Object} - The merged dataset and metadata
 */
export function mergeDatasets(datasets, options) {
  const { 
    mergeKey, 
    joinType = 'inner',
    conflictStrategy = 'first',
    includeSourceInfo = false
  } = options;

  if (!datasets || datasets.length < 2 || !mergeKey) {
    throw new Error('Invalid merge parameters');
  }

  // Extract data from datasets
  const dataArrays = datasets.map(dataset => dataset.cleanedData || dataset.rawData || []);
  
  // Perform the appropriate join based on joinType
  let mergedData;
  switch (joinType) {
    case 'inner':
      mergedData = performInnerJoin(dataArrays, mergeKey, conflictStrategy, includeSourceInfo);
      break;
    case 'left':
      mergedData = performLeftJoin(dataArrays, mergeKey, conflictStrategy, includeSourceInfo);
      break;
    case 'right':
      // Reverse the arrays and perform a left join
      mergedData = performLeftJoin([...dataArrays].reverse(), mergeKey, conflictStrategy, includeSourceInfo);
      break;
    case 'outer':
      mergedData = performOuterJoin(dataArrays, mergeKey, conflictStrategy, includeSourceInfo);
      break;
    case 'union':
      mergedData = performUnion(dataArrays, includeSourceInfo);
      break;
    default:
      throw new Error(`Unsupported join type: ${joinType}`);
  }

  // Generate schema for the merged dataset
  const schema = generateMergedSchema(mergedData, datasets);

  return {
    data: mergedData,
    schema,
    stats: {
      rowCount: mergedData.length,
      columnCount: Object.keys(schema).length,
      sourceDatasets: datasets.length
    }
  };
}

/**
 * Perform an inner join on datasets
 * @param {Array} dataArrays - Array of data arrays to join
 * @param {string} mergeKey - The common key to join on
 * @param {string} conflictStrategy - How to handle conflicts
 * @param {boolean} includeSourceInfo - Whether to include source dataset info
 * @returns {Array} - The joined data
 */
function performInnerJoin(dataArrays, mergeKey, conflictStrategy, includeSourceInfo) {
  if (dataArrays.length === 0) return [];
  if (dataArrays.length === 1) return [...dataArrays[0]];

  // Start with the first dataset
  let result = [...dataArrays[0]];

  // Join with each subsequent dataset
  for (let i = 1; i < dataArrays.length; i++) {
    const rightData = dataArrays[i];
    
    // Create a map of the right dataset by merge key for faster lookups
    const rightMap = new Map();
    rightData.forEach((item, index) => {
      const key = item[mergeKey];
      if (key !== undefined && key !== null) {
        if (!rightMap.has(key)) {
          rightMap.set(key, []);
        }
        rightMap.get(key).push({ item, index });
      }
    });

    // Perform the join
    result = result.flatMap(leftItem => {
      const leftKey = leftItem[mergeKey];
      
      if (leftKey === undefined || leftKey === null || !rightMap.has(leftKey)) {
        return []; // No match in inner join
      }

      return rightMap.get(leftKey).map(({ item: rightItem }) => {
        const merged = mergeObjects(leftItem, rightItem, conflictStrategy);
        
        if (includeSourceInfo) {
          merged._sourceIndex = i;
        }
        
        return merged;
      });
    });
  }

  return result;
}

/**
 * Perform a left join on datasets
 * @param {Array} dataArrays - Array of data arrays to join
 * @param {string} mergeKey - The common key to join on
 * @param {string} conflictStrategy - How to handle conflicts
 * @param {boolean} includeSourceInfo - Whether to include source dataset info
 * @returns {Array} - The joined data
 */
function performLeftJoin(dataArrays, mergeKey, conflictStrategy, includeSourceInfo) {
  if (dataArrays.length === 0) return [];
  if (dataArrays.length === 1) return [...dataArrays[0]];

  // Start with the first dataset
  let result = dataArrays[0].map(item => ({ ...item }));
  if (includeSourceInfo) {
    result = result.map(item => ({ ...item, _sourceIndex: 0 }));
  }

  // Join with each subsequent dataset
  for (let i = 1; i < dataArrays.length; i++) {
    const rightData = dataArrays[i];
    
    // Create a map of the right dataset by merge key for faster lookups
    const rightMap = new Map();
    rightData.forEach((item, index) => {
      const key = item[mergeKey];
      if (key !== undefined && key !== null) {
        if (!rightMap.has(key)) {
          rightMap.set(key, []);
        }
        rightMap.get(key).push({ item, index });
      }
    });

    // Perform the join
    result = result.flatMap(leftItem => {
      const leftKey = leftItem[mergeKey];
      
      if (leftKey === undefined || leftKey === null || !rightMap.has(leftKey)) {
        return [leftItem]; // Keep left item in left join
      }

      return rightMap.get(leftKey).map(({ item: rightItem }) => {
        const merged = mergeObjects(leftItem, rightItem, conflictStrategy);
        
        if (includeSourceInfo && !merged._sourceIndex) {
          merged._sourceIndex = 0; // Mark as from left dataset
        }
        
        return merged;
      });
    });
  }

  return result;
}

/**
 * Perform an outer join on datasets
 * @param {Array} dataArrays - Array of data arrays to join
 * @param {string} mergeKey - The common key to join on
 * @param {string} conflictStrategy - How to handle conflicts
 * @param {boolean} includeSourceInfo - Whether to include source dataset info
 * @returns {Array} - The joined data
 */
function performOuterJoin(dataArrays, mergeKey, conflictStrategy, includeSourceInfo) {
  if (dataArrays.length === 0) return [];
  if (dataArrays.length === 1) return [...dataArrays[0]];

  // Create a map to track all unique keys
  const allKeys = new Map();
  
  // Collect all unique keys from all datasets
  dataArrays.forEach((data, datasetIndex) => {
    data.forEach((item, itemIndex) => {
      const key = item[mergeKey];
      if (key !== undefined && key !== null) {
        if (!allKeys.has(key)) {
          allKeys.set(key, []);
        }
        allKeys.get(key).push({ item, datasetIndex, itemIndex });
      }
    });
  });

  // Merge items with the same key
  const result = [];
  allKeys.forEach((items, key) => {
    if (items.length === 1) {
      // Only one dataset has this key
      const { item, datasetIndex } = items[0];
      const resultItem = { ...item };
      
      if (includeSourceInfo) {
        resultItem._sourceIndex = datasetIndex;
      }
      
      result.push(resultItem);
    } else {
      // Multiple datasets have this key, merge them
      let mergedItem = { ...items[0].item };
      
      for (let i = 1; i < items.length; i++) {
        mergedItem = mergeObjects(mergedItem, items[i].item, conflictStrategy);
      }
      
      if (includeSourceInfo) {
        mergedItem._sourceIndices = items.map(i => i.datasetIndex);
      }
      
      result.push(mergedItem);
    }
  });

  // Add items without a merge key
  dataArrays.forEach((data, datasetIndex) => {
    data.forEach(item => {
      const key = item[mergeKey];
      if (key === undefined || key === null) {
        const resultItem = { ...item };
        
        if (includeSourceInfo) {
          resultItem._sourceIndex = datasetIndex;
        }
        
        result.push(resultItem);
      }
    });
  });

  return result;
}

/**
 * Perform a union of datasets (combine all rows)
 * @param {Array} dataArrays - Array of data arrays to union
 * @param {boolean} includeSourceInfo - Whether to include source dataset info
 * @returns {Array} - The combined data
 */
function performUnion(dataArrays, includeSourceInfo) {
  return dataArrays.flatMap((data, index) => 
    data.map(item => {
      const resultItem = { ...item };
      
      if (includeSourceInfo) {
        resultItem._sourceIndex = index;
      }
      
      return resultItem;
    })
  );
}

/**
 * Merge two objects based on a conflict strategy
 * @param {Object} obj1 - First object
 * @param {Object} obj2 - Second object
 * @param {string} strategy - Conflict resolution strategy
 * @returns {Object} - Merged object
 */
function mergeObjects(obj1, obj2, strategy = 'first') {
  const result = { ...obj1 };
  
  Object.entries(obj2).forEach(([key, value]) => {
    if (key in result) {
      // Handle conflict based on strategy
      switch (strategy) {
        case 'first':
          // Keep the first value (already in result)
          break;
        case 'last':
          // Use the last value
          result[key] = value;
          break;
        case 'concat':
          // Concatenate values if they're strings or arrays
          if (typeof result[key] === 'string' && typeof value === 'string') {
            result[key] = `${result[key]}, ${value}`;
          } else if (Array.isArray(result[key]) && Array.isArray(value)) {
            result[key] = [...result[key], ...value];
          } else {
            // Default to last value for non-string, non-array types
            result[key] = value;
          }
          break;
        case 'sum':
          // Sum numeric values
          if (typeof result[key] === 'number' && typeof value === 'number') {
            result[key] += value;
          } else {
            // Default to last value for non-numeric types
            result[key] = value;
          }
          break;
        default:
          // Default to first value
          break;
      }
    } else {
      // No conflict, add the property
      result[key] = value;
    }
  });
  
  return result;
}

/**
 * Generate a schema for the merged dataset
 * @param {Array} data - The merged data
 * @param {Array} sourceDatasets - The source datasets
 * @returns {Object} - The merged schema
 */
function generateMergedSchema(data, sourceDatasets) {
  if (!data || data.length === 0) {
    // Combine schemas from source datasets
    return sourceDatasets.reduce((schema, dataset) => {
      return { ...schema, ...(dataset.schema || {}) };
    }, {});
  }

  // Infer schema from the first few rows
  const sampleSize = Math.min(data.length, 10);
  const schema = {};
  
  for (let i = 0; i < sampleSize; i++) {
    const row = data[i];
    Object.entries(row).forEach(([key, value]) => {
      if (key.startsWith('_')) return; // Skip internal fields
      
      if (!(key in schema)) {
        // Determine type
        if (typeof value === 'string') {
          if (!isNaN(Date.parse(value)) && value.includes('-')) {
            schema[key] = 'date';
          } else if (/^https?:\/\//.test(value)) {
            schema[key] = 'url';
          } else if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            schema[key] = 'email';
          } else {
            schema[key] = 'string';
          }
        } else if (typeof value === 'number') {
          schema[key] = 'number';
        } else if (typeof value === 'boolean') {
          schema[key] = 'boolean';
        } else if (Array.isArray(value)) {
          schema[key] = 'array';
        } else if (value instanceof Date) {
          schema[key] = 'date';
        } else if (value === null || value === undefined) {
          schema[key] = 'unknown';
        } else {
          schema[key] = 'object';
        }
      }
    });
  }
  
  return schema;
}

/**
 * Get common fields across datasets
 * @param {Array} datasets - Array of datasets
 * @returns {Array} - Array of common field names
 */
export function getCommonFields(datasets) {
  if (!datasets || datasets.length === 0) return [];
  
  // Get fields from each dataset
  const allFields = datasets.map(dataset => {
    // Try to get fields from schema first
    if (dataset.schema && Object.keys(dataset.schema).length > 0) {
      return Object.keys(dataset.schema);
    }
    
    // Fall back to fields from data
    const data = dataset.cleanedData || dataset.rawData || [];
    return data.length > 0 ? Object.keys(data[0]) : [];
  });
  
  // Find common fields
  return allFields.reduce((common, fields) => 
    common.filter(field => fields.includes(field))
  );
}

/**
 * Get all unique fields across datasets
 * @param {Array} datasets - Array of datasets
 * @returns {Array} - Array of all unique field names
 */
export function getAllFields(datasets) {
  if (!datasets || datasets.length === 0) return [];
  
  const fieldSet = new Set();
  
  datasets.forEach(dataset => {
    // Try to get fields from schema first
    if (dataset.schema && Object.keys(dataset.schema).length > 0) {
      Object.keys(dataset.schema).forEach(field => fieldSet.add(field));
    } else {
      // Fall back to fields from data
      const data = dataset.cleanedData || dataset.rawData || [];
      if (data.length > 0) {
        Object.keys(data[0]).forEach(field => fieldSet.add(field));
      }
    }
  });
  
  return Array.from(fieldSet);
}

/**
 * Get merge statistics
 * @param {Array} sourceDatasets - The source datasets
 * @param {Array} mergedData - The merged data
 * @returns {Object} - Merge statistics
 */
export function getMergeStats(sourceDatasets, mergedData) {
  const totalSourceRows = sourceDatasets.reduce((sum, dataset) => 
    sum + (dataset.cleanedData || dataset.rawData || []).length, 0);
  
  const uniqueKeys = new Set();
  const keyFrequency = {};
  
  // Count key frequencies if we have merged data
  if (mergedData && mergedData.length > 0 && mergedData[0]._mergeKey) {
    mergedData.forEach(row => {
      const key = row._mergeKey;
      if (key) {
        uniqueKeys.add(key);
        keyFrequency[key] = (keyFrequency[key] || 0) + 1;
      }
    });
  }
  
  // Calculate duplicate keys
  const duplicateKeys = Object.values(keyFrequency).filter(count => count > 1).length;
  
  return {
    sourceDatasets: sourceDatasets.length,
    totalSourceRows,
    mergedRows: mergedData.length,
    uniqueKeys: uniqueKeys.size,
    duplicateKeys,
    compressionRatio: totalSourceRows > 0 ? mergedData.length / totalSourceRows : 1
  };
}

// Export join types for UI display
export const JOIN_TYPES = [
  { 
    id: 'inner', 
    name: 'Inner Join', 
    description: 'Only include rows with matching keys in all datasets',
    icon: '⊂'
  },
  { 
    id: 'left', 
    name: 'Left Join', 
    description: 'Include all rows from the first dataset, matching rows from others',
    icon: '⊃'
  },
  { 
    id: 'right', 
    name: 'Right Join', 
    description: 'Include all rows from the last dataset, matching rows from others',
    icon: '⊂'
  },
  { 
    id: 'outer', 
    name: 'Full Outer Join', 
    description: 'Include all rows from all datasets, matching where possible',
    icon: '⊔'
  },
  { 
    id: 'union', 
    name: 'Union All', 
    description: 'Combine all rows from all datasets without matching',
    icon: '∪'
  }
];

// Export conflict resolution strategies for UI display
export const CONFLICT_STRATEGIES = [
  { 
    id: 'first', 
    name: 'Keep First', 
    description: 'Use value from the first dataset when conflicts occur'
  },
  { 
    id: 'last', 
    name: 'Keep Last', 
    description: 'Use value from the last dataset when conflicts occur'
  },
  { 
    id: 'concat', 
    name: 'Concatenate', 
    description: 'Combine text values with comma separation'
  },
  { 
    id: 'sum', 
    name: 'Sum Values', 
    description: 'Add numeric values together when conflicts occur'
  }
];

