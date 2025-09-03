# Error Codes

This document provides a comprehensive list of error codes that may be returned by the DataMosaic API, along with their descriptions and suggested resolutions.

## Error Response Format

All API errors are returned in a consistent format:

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

## HTTP Status Codes

The API uses conventional HTTP status codes to indicate the success or failure of a request:

| Status Code | Description |
|-------------|-------------|
| 200 | OK - The request was successful |
| 201 | Created - The resource was successfully created |
| 204 | No Content - The request was successful, but there is no content to return |
| 400 | Bad Request - The request was invalid or cannot be served |
| 401 | Unauthorized - Authentication is required or failed |
| 403 | Forbidden - The authenticated user does not have permission to access the resource |
| 404 | Not Found - The requested resource does not exist |
| 409 | Conflict - The request conflicts with the current state of the resource |
| 422 | Unprocessable Entity - The request was well-formed but contains semantic errors |
| 429 | Too Many Requests - The user has sent too many requests in a given amount of time |
| 500 | Internal Server Error - An error occurred on the server |
| 503 | Service Unavailable - The server is temporarily unavailable |

## Error Codes

### Authentication Errors

| Error Code | Description | Resolution |
|------------|-------------|------------|
| `authentication_required` | No authentication credentials were provided | Include an API key in the Authorization header |
| `invalid_api_key` | The provided API key is invalid | Check that you're using a valid API key |
| `expired_api_key` | The provided API key has expired | Generate a new API key |
| `revoked_api_key` | The provided API key has been revoked | Generate a new API key |

### Permission Errors

| Error Code | Description | Resolution |
|------------|-------------|------------|
| `permission_denied` | The authenticated user does not have permission to perform the requested action | Upgrade your subscription or request additional permissions |
| `subscription_required` | This feature requires a paid subscription | Upgrade your subscription |
| `plan_limit_reached` | You have reached the limit for this resource on your current plan | Upgrade your subscription or delete unused resources |

### Resource Errors

| Error Code | Description | Resolution |
|------------|-------------|------------|
| `resource_not_found` | The requested resource does not exist | Check that the resource ID is correct |
| `resource_already_exists` | A resource with the same identifier already exists | Use a different identifier or update the existing resource |
| `resource_in_use` | The resource cannot be deleted because it is in use by another resource | Remove the dependencies before deleting the resource |
| `resource_locked` | The resource is locked and cannot be modified | Wait for the resource to be unlocked or contact support |

### Validation Errors

| Error Code | Description | Resolution |
|------------|-------------|------------|
| `validation_error` | The request contains invalid data | Check the error details for specific validation errors |
| `invalid_parameter` | One or more parameters are invalid | Check the error details for specific parameter errors |
| `missing_parameter` | One or more required parameters are missing | Include all required parameters in the request |
| `invalid_format` | The request data is not in the expected format | Check the API documentation for the correct format |

### Data Source Errors

| Error Code | Description | Resolution |
|------------|-------------|------------|
| `invalid_url` | The provided URL is invalid | Check that the URL is correctly formatted and accessible |
| `invalid_selector` | One or more CSS selectors are invalid | Check that the selectors are correctly formatted |
| `scraping_error` | An error occurred while scraping the website | Check that the website is accessible and the selectors are correct |
| `api_connection_error` | Could not connect to the external API | Check that the API endpoint is correct and accessible |
| `api_response_error` | The external API returned an error | Check the error details for the specific API error |

### Dataset Errors

| Error Code | Description | Resolution |
|------------|-------------|------------|
| `invalid_data` | The provided data is invalid | Check the error details for specific data errors |
| `invalid_schema` | The provided schema is invalid | Check the error details for specific schema errors |
| `schema_mismatch` | The data does not match the schema | Ensure that the data conforms to the schema |
| `empty_dataset` | The dataset is empty | Add data to the dataset |
| `dataset_too_large` | The dataset exceeds the maximum size | Reduce the size of the dataset or upgrade your subscription |

### Data Cleaning Errors

| Error Code | Description | Resolution |
|------------|-------------|------------|
| `invalid_cleaning_rule` | One or more cleaning rules are invalid | Check that the cleaning rules are correctly formatted |
| `cleaning_error` | An error occurred while cleaning the data | Check the error details for the specific cleaning error |

### Data Merging Errors

| Error Code | Description | Resolution |
|------------|-------------|------------|
| `invalid_merge_key` | The merge key is invalid | Check that the merge key exists in all datasets |
| `incompatible_datasets` | The datasets cannot be merged | Check that the datasets have compatible schemas |
| `merge_error` | An error occurred while merging the datasets | Check the error details for the specific merging error |

### Rate Limiting Errors

| Error Code | Description | Resolution |
|------------|-------------|------------|
| `rate_limit_exceeded` | You have exceeded the rate limit for this API | Wait until the rate limit resets or upgrade your subscription |

### Server Errors

| Error Code | Description | Resolution |
|------------|-------------|------------|
| `internal_server_error` | An unexpected error occurred on the server | Contact support if the error persists |
| `service_unavailable` | The service is temporarily unavailable | Try again later |
| `maintenance_mode` | The service is in maintenance mode | Try again later |

## Error Details

For validation errors, the `details` field will contain specific information about the validation failures:

```json
{
  "error": {
    "code": "validation_error",
    "message": "The request contains invalid data",
    "details": {
      "fields": {
        "name": "Name is required",
        "url": "URL is not valid",
        "selectors": "At least one selector is required"
      }
    }
  }
}
```

For rate limiting errors, the `details` field will contain information about the rate limit:

```json
{
  "error": {
    "code": "rate_limit_exceeded",
    "message": "You have exceeded the rate limit for this API",
    "details": {
      "limit": 100,
      "remaining": 0,
      "reset": 1642248000
    }
  }
}
```

## Error Handling Best Practices

When handling errors from the DataMosaic API, we recommend the following best practices:

1. **Check the HTTP status code**: The status code provides a high-level indication of what went wrong
2. **Check the error code**: The error code provides more specific information about the error
3. **Display the error message**: The error message is human-readable and can be displayed to the user
4. **Check the error details**: The details field may contain additional information about the error
5. **Implement retry logic**: For transient errors (e.g., rate limiting, service unavailable), implement retry logic with exponential backoff
6. **Log errors**: Log errors for debugging and monitoring purposes
7. **Provide user-friendly error messages**: Translate API errors into user-friendly messages

## Contacting Support

If you encounter an error that you cannot resolve, please contact our support team at api-support@datamosaic.com or visit our [support portal](https://support.datamosaic.com). When contacting support, please include:

1. The error code and message
2. The request that caused the error
3. The time of the request
4. Any additional information that might help us diagnose the issue

