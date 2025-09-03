# API Usage Examples

This document provides practical examples of how to use the DataMosaic API for common tasks.

## Table of Contents

- [Authentication](#authentication)
- [Web Scraping](#web-scraping)
- [API Data Collection](#api-data-collection)
- [Data Cleaning](#data-cleaning)
- [Data Merging](#data-merging)
- [Data Export](#data-export)

## Authentication

### Authenticating with an API Key

```javascript
// JavaScript example
const apiKey = 'YOUR_API_KEY';

async function fetchDatasets() {
  const response = await fetch('https://api.datamosaic.com/v1/datasets', {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error.message);
  }
  
  return response.json();
}
```

```python
# Python example
import requests

api_key = 'YOUR_API_KEY'

def fetch_datasets():
    response = requests.get(
        'https://api.datamosaic.com/v1/datasets',
        headers={
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json'
        }
    )
    
    response.raise_for_status()
    return response.json()
```

## Web Scraping

### Creating a Web Scraper

```javascript
// JavaScript example
async function createWebScraper() {
  const response = await fetch('https://api.datamosaic.com/v1/sources/scrapers', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: 'Tech News Scraper',
      url: 'https://techcrunch.com',
      selectors: {
        title: 'h2.post-block__title',
        link: 'a.post-block__title__link',
        date: 'time.post-block__time'
      },
      schedule: 'daily'
    })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error.message);
  }
  
  return response.json();
}
```

### Running a Web Scraper

```javascript
// JavaScript example
async function runWebScraper(scraperId) {
  const response = await fetch(`https://api.datamosaic.com/v1/sources/scrapers/${scraperId}/run`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error.message);
  }
  
  return response.json();
}
```

### Validating CSS Selectors

```javascript
// JavaScript example
async function validateSelectors() {
  const response = await fetch('https://api.datamosaic.com/v1/sources/scrapers/validate', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      url: 'https://techcrunch.com',
      selectors: {
        title: 'h2.post-block__title',
        link: 'a.post-block__title__link',
        date: 'time.post-block__time'
      }
    })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error.message);
  }
  
  return response.json();
}
```

## API Data Collection

### Creating an API Connector

```javascript
// JavaScript example
async function createApiConnector() {
  const response = await fetch('https://api.datamosaic.com/v1/sources/apis', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: 'GitHub API',
      endpoint: 'https://api.github.com/users',
      params: {
        per_page: 100
      },
      headers: {
        'Accept': 'application/vnd.github.v3+json'
      },
      authType: 'bearer',
      authConfig: {
        token: 'YOUR_GITHUB_TOKEN'
      },
      schedule: 'daily'
    })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error.message);
  }
  
  return response.json();
}
```

### Testing an API Connection

```javascript
// JavaScript example
async function testApiConnection() {
  const response = await fetch('https://api.datamosaic.com/v1/sources/apis/test', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      endpoint: 'https://api.github.com/users',
      params: {
        per_page: 1
      },
      headers: {
        'Accept': 'application/vnd.github.v3+json'
      },
      authType: 'bearer',
      authConfig: {
        token: 'YOUR_GITHUB_TOKEN'
      }
    })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error.message);
  }
  
  return response.json();
}
```

## Data Cleaning

### Previewing Cleaning Results

```javascript
// JavaScript example
async function previewCleaning(datasetId) {
  const response = await fetch('https://api.datamosaic.com/v1/cleaning/preview', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      datasetId: datasetId,
      rules: [
        {
          id: 'normalize-text',
          options: {}
        },
        {
          id: 'standardize-dates',
          options: {
            format: 'YYYY-MM-DD'
          }
        },
        {
          id: 'remove-duplicates',
          options: {}
        }
      ]
    })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error.message);
  }
  
  return response.json();
}
```

### Applying Cleaning Rules

```javascript
// JavaScript example
async function cleanDataset(datasetId) {
  const response = await fetch(`https://api.datamosaic.com/v1/datasets/${datasetId}/clean`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      rules: [
        {
          id: 'normalize-text',
          options: {}
        },
        {
          id: 'standardize-dates',
          options: {
            format: 'YYYY-MM-DD'
          }
        },
        {
          id: 'remove-duplicates',
          options: {}
        }
      ]
    })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error.message);
  }
  
  return response.json();
}
```

## Data Merging

### Previewing Merge Results

```javascript
// JavaScript example
async function previewMerge(datasetIds, mergeKey) {
  const response = await fetch('https://api.datamosaic.com/v1/merging/preview', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      datasetIds: datasetIds,
      mergeKey: mergeKey,
      joinType: 'inner',
      conflictStrategy: 'first'
    })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error.message);
  }
  
  return response.json();
}
```

### Merging Datasets

```javascript
// JavaScript example
async function mergeDatasets(datasetIds, mergeKey, name) {
  const response = await fetch('https://api.datamosaic.com/v1/datasets/merge', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: name,
      sourceDatasetIds: datasetIds,
      mergeKey: mergeKey,
      joinType: 'inner',
      conflictStrategy: 'first',
      description: 'Combined dataset from multiple sources'
    })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error.message);
  }
  
  return response.json();
}
```

## Data Export

### Exporting a Dataset as CSV

```javascript
// JavaScript example
async function exportDatasetAsCsv(datasetId) {
  const response = await fetch(`https://api.datamosaic.com/v1/datasets/${datasetId}/export?format=csv&includeHeaders=true`, {
    headers: {
      'Authorization': `Bearer ${apiKey}`
    }
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error.message);
  }
  
  return response.text();
}
```

### Exporting a Dataset as JSON

```javascript
// JavaScript example
async function exportDatasetAsJson(datasetId) {
  const response = await fetch(`https://api.datamosaic.com/v1/datasets/${datasetId}/export?format=json`, {
    headers: {
      'Authorization': `Bearer ${apiKey}`
    }
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error.message);
  }
  
  return response.json();
}
```

## Complete Workflow Example

This example demonstrates a complete workflow from creating a data source to exporting a cleaned and merged dataset.

```javascript
// JavaScript example
async function completeWorkflow() {
  try {
    // Create a web scraper
    const scraper = await createWebScraper();
    console.log('Created web scraper:', scraper);
    
    // Run the scraper
    const scraperJob = await runWebScraper(scraper.id);
    console.log('Scraper job started:', scraperJob);
    
    // Create an API connector
    const apiConnector = await createApiConnector();
    console.log('Created API connector:', apiConnector);
    
    // Run the API connector
    const apiJob = await runApiConnector(apiConnector.id);
    console.log('API job started:', apiJob);
    
    // Wait for jobs to complete
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Create datasets from the data sources
    const scraperDataset = await createDataset('Web Scraper Dataset', [scraper.id]);
    console.log('Created scraper dataset:', scraperDataset);
    
    const apiDataset = await createDataset('API Dataset', [apiConnector.id]);
    console.log('Created API dataset:', apiDataset);
    
    // Clean the datasets
    const cleanedScraperDataset = await cleanDataset(scraperDataset.id);
    console.log('Cleaned scraper dataset:', cleanedScraperDataset);
    
    const cleanedApiDataset = await cleanDataset(apiDataset.id);
    console.log('Cleaned API dataset:', cleanedApiDataset);
    
    // Merge the datasets
    const mergedDataset = await mergeDatasets(
      [scraperDataset.id, apiDataset.id],
      'id',
      'Merged Dataset'
    );
    console.log('Merged dataset:', mergedDataset);
    
    // Export the merged dataset
    const exportedData = await exportDatasetAsCsv(mergedDataset.id);
    console.log('Exported data:', exportedData.substring(0, 200) + '...');
    
    return {
      scraper,
      apiConnector,
      scraperDataset,
      apiDataset,
      mergedDataset
    };
  } catch (error) {
    console.error('Workflow error:', error);
    throw error;
  }
}
```

## Using the Official SDKs

DataMosaic provides official client libraries for several programming languages. Here's how to use the JavaScript SDK:

```javascript
// JavaScript SDK example
import { DataMosaic } from '@datamosaic/datamosaic-js';

const client = new DataMosaic('YOUR_API_KEY');

async function main() {
  try {
    // Get all datasets
    const datasets = await client.datasets.list();
    console.log('Datasets:', datasets);
    
    // Create a web scraper
    const scraper = await client.sources.scrapers.create({
      name: 'Tech News Scraper',
      url: 'https://techcrunch.com',
      selectors: {
        title: 'h2.post-block__title',
        link: 'a.post-block__title__link',
        date: 'time.post-block__time'
      },
      schedule: 'daily'
    });
    console.log('Created scraper:', scraper);
    
    // Run the scraper
    const job = await client.sources.scrapers.run(scraper.id);
    console.log('Scraper job:', job);
    
    // Create a dataset from the scraper
    const dataset = await client.datasets.create({
      name: 'Tech News Dataset',
      sourceIds: [scraper.id]
    });
    console.log('Created dataset:', dataset);
    
    // Clean the dataset
    const cleanedDataset = await client.datasets.clean(dataset.id, {
      rules: [
        { id: 'normalize-text' },
        { id: 'standardize-dates', options: { format: 'YYYY-MM-DD' } },
        { id: 'remove-duplicates' }
      ]
    });
    console.log('Cleaned dataset:', cleanedDataset);
    
    // Export the dataset
    const exportedData = await client.datasets.export(dataset.id, {
      format: 'csv',
      includeHeaders: true
    });
    console.log('Exported data:', exportedData.substring(0, 200) + '...');
    
    return {
      scraper,
      dataset,
      cleanedDataset
    };
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

main();
```

