# DataMosaic API Endpoints

This document provides a comprehensive list of all available endpoints in the DataMosaic API.

## Data Sources

### Web Scrapers

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/sources/scrapers` | List all web scrapers |
| GET | `/sources/scrapers/{id}` | Get a specific web scraper |
| POST | `/sources/scrapers` | Create a new web scraper |
| PUT | `/sources/scrapers/{id}` | Update a web scraper |
| DELETE | `/sources/scrapers/{id}` | Delete a web scraper |
| POST | `/sources/scrapers/{id}/run` | Run a web scraper |
| GET | `/sources/scrapers/{id}/jobs` | List scraper jobs |
| GET | `/sources/scrapers/{id}/jobs/{jobId}` | Get a specific scraper job |
| POST | `/sources/scrapers/validate` | Validate CSS selectors against a URL |

#### Create a Web Scraper

```http
POST /sources/scrapers
```

Request body:

```json
{
  "name": "Tech News Scraper",
  "url": "https://techcrunch.com",
  "selectors": {
    "title": "h2.post-block__title",
    "link": "a.post-block__title__link",
    "date": "time.post-block__time"
  },
  "schedule": "daily"
}
```

Response:

```json
{
  "id": "scraper-123",
  "name": "Tech News Scraper",
  "url": "https://techcrunch.com",
  "selectors": {
    "title": "h2.post-block__title",
    "link": "a.post-block__title__link",
    "date": "time.post-block__time"
  },
  "schedule": "daily",
  "status": "active",
  "createdAt": "2024-01-15T12:00:00Z",
  "updatedAt": "2024-01-15T12:00:00Z"
}
```

### API Connectors

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/sources/apis` | List all API connectors |
| GET | `/sources/apis/{id}` | Get a specific API connector |
| POST | `/sources/apis` | Create a new API connector |
| PUT | `/sources/apis/{id}` | Update an API connector |
| DELETE | `/sources/apis/{id}` | Delete an API connector |
| POST | `/sources/apis/{id}/run` | Run an API connector |
| GET | `/sources/apis/{id}/jobs` | List API connector jobs |
| GET | `/sources/apis/{id}/jobs/{jobId}` | Get a specific API connector job |
| POST | `/sources/apis/test` | Test an API connection |

#### Create an API Connector

```http
POST /sources/apis
```

Request body:

```json
{
  "name": "GitHub API",
  "endpoint": "https://api.github.com/users",
  "params": {
    "per_page": 100
  },
  "headers": {
    "Accept": "application/vnd.github.v3+json"
  },
  "authType": "bearer",
  "authConfig": {
    "token": "YOUR_GITHUB_TOKEN"
  },
  "schedule": "daily"
}
```

Response:

```json
{
  "id": "api-123",
  "name": "GitHub API",
  "endpoint": "https://api.github.com/users",
  "params": {
    "per_page": 100
  },
  "headers": {
    "Accept": "application/vnd.github.v3+json"
  },
  "authType": "bearer",
  "schedule": "daily",
  "status": "active",
  "createdAt": "2024-01-15T12:00:00Z",
  "updatedAt": "2024-01-15T12:00:00Z"
}
```

## Datasets

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/datasets` | List all datasets |
| GET | `/datasets/{id}` | Get a specific dataset |
| POST | `/datasets` | Create a new dataset |
| PUT | `/datasets/{id}` | Update a dataset |
| DELETE | `/datasets/{id}` | Delete a dataset |
| GET | `/datasets/{id}/data` | Get dataset data |
| PUT | `/datasets/{id}/data` | Update dataset data |
| GET | `/datasets/{id}/schema` | Get dataset schema |
| PUT | `/datasets/{id}/schema` | Update dataset schema |

#### Create a Dataset

```http
POST /datasets
```

Request body:

```json
{
  "name": "Tech Articles Dataset",
  "sourceIds": ["scraper-123"],
  "description": "Collection of tech news articles"
}
```

Response:

```json
{
  "id": "dataset-123",
  "name": "Tech Articles Dataset",
  "sourceIds": ["scraper-123"],
  "description": "Collection of tech news articles",
  "rowCount": 0,
  "schema": {},
  "createdAt": "2024-01-15T12:00:00Z",
  "updatedAt": "2024-01-15T12:00:00Z"
}
```

## Data Cleaning

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/cleaning/rules` | List available cleaning rules |
| POST | `/cleaning/preview` | Preview cleaning results |
| POST | `/datasets/{id}/clean` | Apply cleaning rules to a dataset |
| GET | `/datasets/{id}/cleaning-history` | Get cleaning history for a dataset |

#### Apply Cleaning Rules

```http
POST /datasets/{id}/clean
```

Request body:

```json
{
  "rules": [
    {
      "id": "normalize-text",
      "options": {}
    },
    {
      "id": "standardize-dates",
      "options": {
        "format": "YYYY-MM-DD"
      }
    },
    {
      "id": "remove-duplicates",
      "options": {}
    }
  ]
}
```

Response:

```json
{
  "success": true,
  "datasetId": "dataset-123",
  "stats": {
    "rowsBefore": 100,
    "rowsAfter": 95,
    "fieldsModified": 150,
    "duplicatesRemoved": 5
  }
}
```

## Data Merging

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/merging/preview` | Preview merge results |
| POST | `/datasets/merge` | Merge multiple datasets |

#### Merge Datasets

```http
POST /datasets/merge
```

Request body:

```json
{
  "name": "Merged Dataset",
  "sourceDatasetIds": ["dataset-123", "dataset-456"],
  "mergeKey": "id",
  "joinType": "inner",
  "conflictStrategy": "first",
  "description": "Combined dataset from multiple sources"
}
```

Response:

```json
{
  "id": "dataset-789",
  "name": "Merged Dataset",
  "sourceDatasetIds": ["dataset-123", "dataset-456"],
  "description": "Combined dataset from multiple sources",
  "rowCount": 150,
  "schema": {
    "id": "string",
    "title": "string",
    "content": "string",
    "date": "date",
    "author": "string"
  },
  "createdAt": "2024-01-15T12:00:00Z",
  "updatedAt": "2024-01-15T12:00:00Z"
}
```

## Data Export

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/datasets/{id}/export` | Export a dataset |
| GET | `/exports` | List export history |
| GET | `/exports/{id}` | Get a specific export |

#### Export a Dataset

```http
GET /datasets/{id}/export?format=csv&includeHeaders=true
```

Response:

```
Content-Type: text/csv
Content-Disposition: attachment; filename="dataset-123.csv"

id,title,content,date,author
1,"First Article","Content of the first article","2024-01-01","John Doe"
2,"Second Article","Content of the second article","2024-01-02","Jane Smith"
...
```

## Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users/me` | Get current user |
| PUT | `/users/me` | Update current user |
| GET | `/users/me/api-keys` | List API keys |
| POST | `/users/me/api-keys` | Create a new API key |
| DELETE | `/users/me/api-keys/{id}` | Delete an API key |

## Subscriptions

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/subscriptions` | Get current subscription |
| PUT | `/subscriptions` | Update subscription |
| GET | `/subscriptions/plans` | List available plans |
| GET | `/subscriptions/usage` | Get usage statistics |

## Webhooks

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/webhooks` | List webhooks |
| POST | `/webhooks` | Create a webhook |
| GET | `/webhooks/{id}` | Get a webhook |
| PUT | `/webhooks/{id}` | Update a webhook |
| DELETE | `/webhooks/{id}` | Delete a webhook |
| GET | `/webhooks/{id}/deliveries` | List webhook deliveries |
| POST | `/webhooks/{id}/test` | Test a webhook |

