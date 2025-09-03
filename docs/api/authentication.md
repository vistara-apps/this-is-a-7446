# Authentication

DataMosaic API uses API keys for authentication. This document explains how to obtain and use API keys to authenticate your requests.

## API Keys

API keys are the primary method of authentication for the DataMosaic API. Each API key is associated with a user account and has specific permissions.

### Obtaining an API Key

1. Log in to your DataMosaic account
2. Navigate to Settings > API Keys
3. Click "Create New API Key"
4. Enter a name for your API key (e.g., "Development", "Production")
5. Select the permissions you want to grant to the API key
6. Click "Create"
7. Copy the API key that is displayed (Note: The API key will only be displayed once)

### API Key Permissions

When creating an API key, you can specify the following permissions:

- **Read**: Allows reading data from the API
- **Write**: Allows creating and updating data
- **Delete**: Allows deleting data
- **Admin**: Allows all operations, including managing API keys

### Using API Keys

To authenticate your requests, include your API key in the `Authorization` header using the Bearer token format:

```
Authorization: Bearer YOUR_API_KEY
```

Example request using cURL:

```bash
curl -X GET "https://api.datamosaic.com/v1/datasets" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

Example request using JavaScript:

```javascript
fetch('https://api.datamosaic.com/v1/datasets', {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY'
  }
})
  .then(response => response.json())
  .then(data => console.log(data));
```

### API Key Security

To keep your API keys secure:

1. **Never share your API keys**: Treat your API keys like passwords
2. **Use environment variables**: Store your API keys in environment variables, not in your code
3. **Rotate your keys regularly**: Create new API keys and delete old ones periodically
4. **Use the principle of least privilege**: Only grant the permissions that are necessary for each API key
5. **Monitor API key usage**: Regularly check the usage of your API keys to detect any unauthorized access

## OAuth Authentication (Coming Soon)

In addition to API keys, DataMosaic will soon support OAuth 2.0 authentication for more secure and flexible authentication options. This will allow you to:

- Authenticate users without storing their credentials
- Implement single sign-on (SSO) with popular identity providers
- Set fine-grained permissions for different applications

Stay tuned for updates on OAuth authentication support.

## Authentication Errors

If there's an issue with your authentication, you'll receive one of the following error responses:

### Missing API Key

```json
{
  "error": {
    "code": "authentication_error",
    "message": "Authentication required. Please provide an API key."
  }
}
```

### Invalid API Key

```json
{
  "error": {
    "code": "authentication_error",
    "message": "Invalid API key provided."
  }
}
```

### Expired API Key

```json
{
  "error": {
    "code": "authentication_error",
    "message": "API key has expired."
  }
}
```

### Insufficient Permissions

```json
{
  "error": {
    "code": "permission_error",
    "message": "API key does not have permission to perform this action."
  }
}
```

## Rate Limiting

Authentication is also tied to rate limiting. Different subscription tiers have different rate limits:

- **Free tier**: 100 requests per hour
- **Pro tier**: 1,000 requests per hour
- **Business tier**: 10,000 requests per hour

Rate limit information is included in the response headers:

- `X-RateLimit-Limit`: The maximum number of requests allowed per hour
- `X-RateLimit-Remaining`: The number of requests remaining in the current rate limit window
- `X-RateLimit-Reset`: The time at which the current rate limit window resets (Unix timestamp)

If you exceed your rate limit, you'll receive a `429 Too Many Requests` response:

```json
{
  "error": {
    "code": "rate_limit_exceeded",
    "message": "Rate limit exceeded. Please try again later.",
    "details": {
      "limit": 100,
      "reset": 1642248000
    }
  }
}
```

