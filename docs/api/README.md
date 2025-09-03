# DataMosaic API Documentation

Welcome to the DataMosaic API documentation. This guide provides comprehensive information about the DataMosaic API, which allows you to programmatically interact with the DataMosaic platform.

## Overview

DataMosaic provides a RESTful API that enables you to:

- Manage data sources (web scrapers and API connectors)
- Create, read, update, and delete datasets
- Clean and transform data
- Merge datasets
- Export data in various formats
- Manage user accounts and subscriptions

## Base URL

All API requests should be made to the following base URL:

```
https://api.datamosaic.com/v1
```

## Authentication

DataMosaic API uses API keys for authentication. You can obtain an API key from your account settings page. Include your API key in the `Authorization` header of all requests:

```
Authorization: Bearer YOUR_API_KEY
```

## Rate Limiting

The API is rate-limited to protect against abuse. Rate limits vary by subscription tier:

- **Free tier**: 100 requests per hour
- **Pro tier**: 1,000 requests per hour
- **Business tier**: 10,000 requests per hour

Rate limit information is included in the response headers:

- `X-RateLimit-Limit`: The maximum number of requests allowed per hour
- `X-RateLimit-Remaining`: The number of requests remaining in the current rate limit window
- `X-RateLimit-Reset`: The time at which the current rate limit window resets (Unix timestamp)

## Error Handling

The API uses conventional HTTP response codes to indicate the success or failure of a request:

- `2xx`: Success
- `4xx`: Client error (e.g., invalid request, authentication error)
- `5xx`: Server error

Error responses include a JSON object with the following structure:

```json
{
  "error": {
    "code": "error_code",
    "message": "A human-readable error message",
    "details": {
      // Additional error details, if available
    }
  }
}
```

## Pagination

List endpoints support pagination using the `page` and `limit` query parameters:

- `page`: The page number (1-based, default: 1)
- `limit`: The number of items per page (default: 20, max: 100)

Paginated responses include metadata about the pagination:

```json
{
  "data": [...],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "pages": 5
  }
}
```

## API Sections

- [Authentication](./authentication.md)
- [Data Sources](./data-sources.md)
- [Datasets](./datasets.md)
- [Data Cleaning](./data-cleaning.md)
- [Data Merging](./data-merging.md)
- [Data Export](./data-export.md)
- [Users](./users.md)
- [Subscriptions](./subscriptions.md)
- [Webhooks](./webhooks.md)
- [Error Codes](./errors.md)
- [Examples](./examples.md)

## SDKs and Libraries

DataMosaic provides official client libraries for several programming languages:

- [JavaScript/TypeScript](https://github.com/datamosaic/datamosaic-js)
- [Python](https://github.com/datamosaic/datamosaic-python)
- [Ruby](https://github.com/datamosaic/datamosaic-ruby)
- [PHP](https://github.com/datamosaic/datamosaic-php)
- [Go](https://github.com/datamosaic/datamosaic-go)

## Support

If you have any questions or need assistance with the API, please contact our support team at api-support@datamosaic.com or visit our [support portal](https://support.datamosaic.com).

## Changelog

For information about API changes and updates, please see our [changelog](./changelog.md).

