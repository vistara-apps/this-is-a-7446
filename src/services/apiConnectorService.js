/**
 * API Connector Service
 * 
 * This service provides functions for connecting to external APIs and fetching data.
 * It includes utilities for authentication, request handling, and data transformation.
 */

/**
 * Fetch data from an API endpoint
 * @param {Object} config - API configuration
 * @returns {Promise<Object>} - The fetched data and metadata
 */
export async function fetchApiData(config) {
  const { endpoint, params = {}, headers = {}, method = 'GET', body = null, auth = null } = config;
  
  if (!endpoint) {
    throw new Error('API endpoint is required');
  }
  
  try {
    // In a real implementation, this would make an actual API call
    // For this demo, we'll simulate the API request
    
    // Simulate network request
    const response = await simulateApiRequest(endpoint, {
      method,
      params,
      headers,
      body,
      auth
    });
    
    // Transform the data if needed
    const transformedData = transformApiResponse(response.data, config.transformations);
    
    return {
      success: true,
      data: transformedData,
      metadata: {
        endpoint,
        timestamp: new Date().toISOString(),
        rowCount: Array.isArray(transformedData) ? transformedData.length : 1,
        responseTime: response.responseTime
      }
    };
  } catch (error) {
    console.error('API request error:', error);
    return {
      success: false,
      error: error.message,
      metadata: {
        endpoint,
        timestamp: new Date().toISOString()
      }
    };
  }
}

/**
 * Test an API connection
 * @param {Object} config - API configuration
 * @returns {Promise<Object>} - The test result
 */
export async function testApiConnection(config) {
  try {
    // Make a simple request to test the connection
    const result = await fetchApiData({
      ...config,
      params: { ...config.params, limit: 1 } // Limit to 1 result for testing
    });
    
    return {
      success: result.success,
      message: result.success ? 'Connection successful' : 'Connection failed',
      data: result.success ? result.data : null,
      error: result.error
    };
  } catch (error) {
    return {
      success: false,
      message: 'Connection test failed',
      error: error.message
    };
  }
}

/**
 * Schedule recurring API data fetching
 * @param {Object} config - Job configuration
 * @returns {Object} - The created job
 */
export function scheduleApiFetch(config) {
  const { sourceId, endpoint, schedule } = config;
  
  // In a real implementation, this would create a job in a backend service
  // For this demo, we'll return a simulated job object
  
  return {
    jobId: `job-${Date.now()}`,
    dataSourceId: sourceId,
    endpoint,
    schedule,
    status: 'scheduled',
    nextRun: getNextRunTime(schedule),
    createdAt: new Date().toISOString()
  };
}

/**
 * Get available authentication methods for an API
 * @param {string} apiType - The type of API
 * @returns {Array} - Available authentication methods
 */
export function getAuthMethods(apiType) {
  const commonMethods = [
    { id: 'none', name: 'No Authentication', description: 'Public API with no authentication required' },
    { id: 'api_key', name: 'API Key', description: 'Authentication using an API key in header or query parameter' },
    { id: 'bearer', name: 'Bearer Token', description: 'Authentication using a bearer token in the Authorization header' }
  ];
  
  // Add specific methods based on API type
  switch (apiType) {
    case 'github':
      return [
        ...commonMethods,
        { id: 'oauth', name: 'OAuth', description: 'GitHub OAuth authentication' }
      ];
    case 'twitter':
      return [
        ...commonMethods,
        { id: 'oauth', name: 'OAuth 1.0a', description: 'Twitter OAuth 1.0a authentication' },
        { id: 'oauth2', name: 'OAuth 2.0', description: 'Twitter OAuth 2.0 authentication' }
      ];
    case 'google':
      return [
        ...commonMethods,
        { id: 'oauth2', name: 'OAuth 2.0', description: 'Google OAuth 2.0 authentication' }
      ];
    default:
      return commonMethods;
  }
}

// Helper functions

/**
 * Simulate an API request
 * @param {string} endpoint - The API endpoint
 * @param {Object} options - Request options
 * @returns {Promise<Object>} - The response
 */
async function simulateApiRequest(endpoint, options) {
  // Simulate network delay
  const startTime = Date.now();
  await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 700));
  const responseTime = Date.now() - startTime;
  
  // Check if endpoint is valid
  try {
    new URL(endpoint);
  } catch (e) {
    throw new Error('Invalid API endpoint URL');
  }
  
  // Simulate different responses based on endpoint
  if (endpoint.includes('github.com')) {
    return {
      status: 200,
      data: generateGithubData(options),
      responseTime
    };
  } else if (endpoint.includes('weather')) {
    return {
      status: 200,
      data: generateWeatherData(options),
      responseTime
    };
  } else if (endpoint.includes('products')) {
    return {
      status: 200,
      data: generateProductData(options),
      responseTime
    };
  } else if (endpoint.includes('error')) {
    throw new Error('API request failed');
  } else {
    return {
      status: 200,
      data: generateGenericData(endpoint, options),
      responseTime
    };
  }
}

/**
 * Transform API response data
 * @param {any} data - The response data
 * @param {Object} transformations - Transformation rules
 * @returns {any} - The transformed data
 */
function transformApiResponse(data, transformations = {}) {
  if (!transformations || Object.keys(transformations).length === 0) {
    return data;
  }
  
  // Handle array data
  if (Array.isArray(data)) {
    return data.map(item => transformObject(item, transformations));
  }
  
  // Handle object data
  return transformObject(data, transformations);
}

/**
 * Transform an object based on transformation rules
 * @param {Object} obj - The object to transform
 * @param {Object} transformations - Transformation rules
 * @returns {Object} - The transformed object
 */
function transformObject(obj, transformations) {
  const result = {};
  
  // Apply field mappings
  if (transformations.fieldMappings) {
    Object.entries(transformations.fieldMappings).forEach(([targetField, sourceField]) => {
      result[targetField] = getNestedValue(obj, sourceField);
    });
  } else {
    // No mappings, copy the object
    Object.assign(result, obj);
  }
  
  // Apply field filters
  if (transformations.includeFields) {
    const filtered = {};
    transformations.includeFields.forEach(field => {
      if (field in result) {
        filtered[field] = result[field];
      }
    });
    return filtered;
  }
  
  if (transformations.excludeFields) {
    transformations.excludeFields.forEach(field => {
      delete result[field];
    });
  }
  
  return result;
}

/**
 * Get a nested value from an object using dot notation
 * @param {Object} obj - The object to get the value from
 * @param {string} path - The path to the value (e.g., 'user.profile.name')
 * @returns {any} - The value at the path
 */
function getNestedValue(obj, path) {
  return path.split('.').reduce((o, key) => (o && o[key] !== undefined) ? o[key] : null, obj);
}

/**
 * Get the next run time based on a schedule
 * @param {string} schedule - The schedule (hourly, daily, weekly, monthly)
 * @returns {string} - The next run time
 */
function getNextRunTime(schedule) {
  const now = new Date();
  let nextRun;
  
  switch (schedule) {
    case 'hourly':
      nextRun = new Date(now.getTime() + 60 * 60 * 1000);
      break;
    case 'daily':
      nextRun = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      break;
    case 'weekly':
      nextRun = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      break;
    case 'monthly':
      nextRun = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
      break;
    default:
      nextRun = new Date(now.getTime() + 24 * 60 * 60 * 1000); // Default to daily
  }
  
  return nextRun.toISOString();
}

// Data generation helpers

function generateGithubData(options) {
  const { params = {} } = options;
  const count = params.per_page || 5;
  
  if (options.endpoint && options.endpoint.includes('/users/')) {
    // Single user
    return {
      login: 'octocat',
      id: 1,
      node_id: 'MDQ6VXNlcjE=',
      avatar_url: 'https://github.com/images/error/octocat_happy.gif',
      gravatar_id: '',
      url: 'https://api.github.com/users/octocat',
      html_url: 'https://github.com/octocat',
      followers_url: 'https://api.github.com/users/octocat/followers',
      following_url: 'https://api.github.com/users/octocat/following{/other_user}',
      gists_url: 'https://api.github.com/users/octocat/gists{/gist_id}',
      starred_url: 'https://api.github.com/users/octocat/starred{/owner}{/repo}',
      subscriptions_url: 'https://api.github.com/users/octocat/subscriptions',
      organizations_url: 'https://api.github.com/users/octocat/orgs',
      repos_url: 'https://api.github.com/users/octocat/repos',
      events_url: 'https://api.github.com/users/octocat/events{/privacy}',
      received_events_url: 'https://api.github.com/users/octocat/received_events',
      type: 'User',
      site_admin: false,
      name: 'The Octocat',
      company: '@github',
      blog: 'https://github.blog',
      location: 'San Francisco',
      email: 'octocat@github.com',
      hireable: true,
      bio: 'There once was...',
      twitter_username: 'octocat',
      public_repos: 8,
      public_gists: 8,
      followers: 2000,
      following: 20,
      created_at: '2011-01-25T18:44:36Z',
      updated_at: '2023-01-22T12:30:00Z'
    };
  }
  
  // List of users
  const users = [];
  for (let i = 0; i < count; i++) {
    users.push({
      login: `user${i + 1}`,
      id: i + 1,
      node_id: `MDQ6VXNlcjE${i}=`,
      avatar_url: `https://github.com/images/error/user${i + 1}.gif`,
      gravatar_id: '',
      url: `https://api.github.com/users/user${i + 1}`,
      html_url: `https://github.com/user${i + 1}`,
      type: 'User',
      site_admin: false,
      name: `User ${i + 1}`,
      company: i % 3 === 0 ? '@github' : null,
      location: i % 2 === 0 ? 'San Francisco' : 'New York',
      public_repos: Math.floor(Math.random() * 50),
      followers: Math.floor(Math.random() * 1000),
      following: Math.floor(Math.random() * 100),
      created_at: `2020-0${(i % 9) + 1}-${(i % 28) + 1}T12:00:00Z`,
      updated_at: `2023-0${(i % 9) + 1}-${(i % 28) + 1}T12:00:00Z`
    });
  }
  
  return users;
}

function generateWeatherData(options) {
  return {
    location: {
      name: 'San Francisco',
      region: 'California',
      country: 'United States',
      lat: 37.77,
      lon: -122.42,
      tz_id: 'America/Los_Angeles',
      localtime: '2024-01-15 10:00'
    },
    current: {
      temp_c: 15.5,
      temp_f: 59.9,
      condition: {
        text: 'Partly cloudy',
        icon: '//cdn.weatherapi.com/weather/64x64/day/116.png',
        code: 1003
      },
      wind_mph: 6.9,
      wind_kph: 11.2,
      wind_degree: 270,
      wind_dir: 'W',
      pressure_mb: 1018.0,
      pressure_in: 30.06,
      precip_mm: 0.0,
      precip_in: 0.0,
      humidity: 72,
      cloud: 25,
      feelslike_c: 14.8,
      feelslike_f: 58.6,
      vis_km: 16.0,
      vis_miles: 9.9,
      uv: 4.0,
      gust_mph: 8.9,
      gust_kph: 14.4
    },
    forecast: {
      forecastday: [
        {
          date: '2024-01-15',
          date_epoch: 1705276800,
          day: {
            maxtemp_c: 18.2,
            maxtemp_f: 64.8,
            mintemp_c: 12.5,
            mintemp_f: 54.5,
            avgtemp_c: 15.3,
            avgtemp_f: 59.5,
            maxwind_mph: 8.9,
            maxwind_kph: 14.4,
            totalprecip_mm: 0.0,
            totalprecip_in: 0.0,
            avgvis_km: 10.0,
            avgvis_miles: 6.2,
            avghumidity: 75,
            condition: {
              text: 'Partly cloudy',
              icon: '//cdn.weatherapi.com/weather/64x64/day/116.png',
              code: 1003
            },
            uv: 4.0
          }
        }
      ]
    }
  };
}

function generateProductData(options) {
  const { params = {} } = options;
  const count = params.limit || 5;
  
  const products = [];
  for (let i = 0; i < count; i++) {
    products.push({
      id: i + 1,
      name: `Product ${i + 1}`,
      description: `This is a description for product ${i + 1}.`,
      price: (19.99 + (i * 5.99)).toFixed(2),
      category: i % 3 === 0 ? 'Electronics' : (i % 3 === 1 ? 'Clothing' : 'Home'),
      rating: (3 + (i % 3)).toFixed(1),
      stock: Math.floor(Math.random() * 100) + 1,
      image: `https://example.com/products/${i + 1}.jpg`,
      created_at: `2023-0${(i % 9) + 1}-${(i % 28) + 1}T12:00:00Z`
    });
  }
  
  return {
    products,
    total: 100,
    page: params.page || 1,
    limit: count
  };
}

function generateGenericData(endpoint, options) {
  const { params = {} } = options;
  const count = params.limit || 5;
  
  // Extract entity type from endpoint
  const parts = endpoint.split('/');
  const entityType = parts[parts.length - 1] || 'items';
  
  const items = [];
  for (let i = 0; i < count; i++) {
    const item = {
      id: i + 1,
      name: `${entityType.charAt(0).toUpperCase() + entityType.slice(1, -1)} ${i + 1}`,
      created_at: `2023-0${(i % 9) + 1}-${(i % 28) + 1}T12:00:00Z`,
      updated_at: `2023-0${(i % 9) + 1}-${(i % 28) + 1}T12:00:00Z`
    };
    
    // Add some random fields based on entity type
    if (entityType.includes('user')) {
      item.email = `user${i + 1}@example.com`;
      item.username = `user${i + 1}`;
      item.role = i % 3 === 0 ? 'admin' : 'user';
    } else if (entityType.includes('product')) {
      item.price = (19.99 + (i * 5.99)).toFixed(2);
      item.category = i % 3 === 0 ? 'Electronics' : (i % 3 === 1 ? 'Clothing' : 'Home');
      item.stock = Math.floor(Math.random() * 100) + 1;
    } else if (entityType.includes('post') || entityType.includes('article')) {
      item.title = `Title for ${entityType.slice(0, -1)} ${i + 1}`;
      item.content = `This is the content for ${entityType.slice(0, -1)} ${i + 1}.`;
      item.author = `Author ${(i % 5) + 1}`;
      item.tags = ['tag1', 'tag2', 'tag3'].slice(0, (i % 3) + 1);
    } else {
      // Generic fields
      item.description = `Description for ${entityType.slice(0, -1)} ${i + 1}`;
      item.status = i % 2 === 0 ? 'active' : 'inactive';
    }
    
    items.push(item);
  }
  
  return {
    [entityType]: items,
    total: 100,
    page: params.page || 1,
    limit: count
  };
}

// Export API types for UI display
export const API_TYPES = [
  { 
    id: 'rest', 
    name: 'REST API', 
    description: 'Standard REST API with JSON responses'
  },
  { 
    id: 'graphql', 
    name: 'GraphQL', 
    description: 'GraphQL API with query language'
  },
  { 
    id: 'soap', 
    name: 'SOAP', 
    description: 'XML-based messaging protocol'
  }
];

// Export common API endpoints for UI suggestions
export const COMMON_APIS = [
  { 
    name: 'GitHub API', 
    endpoint: 'https://api.github.com/users',
    description: 'Get GitHub user data',
    authType: 'bearer',
    type: 'rest'
  },
  { 
    name: 'Weather API', 
    endpoint: 'https://api.weatherapi.com/v1/current.json',
    description: 'Get current weather data',
    authType: 'api_key',
    type: 'rest'
  },
  { 
    name: 'Product API', 
    endpoint: 'https://api.example.com/products',
    description: 'Get product data',
    authType: 'none',
    type: 'rest'
  },
  { 
    name: 'News API', 
    endpoint: 'https://newsapi.org/v2/top-headlines',
    description: 'Get top news headlines',
    authType: 'api_key',
    type: 'rest'
  }
];

