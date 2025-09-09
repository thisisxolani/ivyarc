# Authentication Service API

## 📋 Overview

The Authentication Service handles user authentication, JWT token management, and session control. All endpoints use standard HTTP methods and return JSON responses following the RFC 7807 problem details standard for errors.

**Base URL**: `https://api.ivyarc.pro/api/v1/auth`  
**Service Port**: 8081 (internal)  
**Content-Type**: `application/json`

## 🔐 Authentication Endpoints

### POST /login
Authenticate a user and return JWT access and refresh tokens.

**Request Body**:
```json
{
  "identifier": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response (200 OK)**:
```json
{
  "status": "success",
  "data": {
    "accessToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tokenType": "Bearer",
    "expiresIn": 3600,
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "username": "johndoe",
      "email": "user@example.com",
      "fullName": "John Doe",
      "roles": ["USER"],
      "permissions": ["user:read", "user:update-self"]
    }
  },
  "message": "Login successful",
  "timestamp": "2024-01-15T10:30:00Z",
  "path": "/api/v1/auth/login"
}
```

**Error Response (401 Unauthorized)**:
```json
{
  "type": "https://api.ivyarc.pro/problems/authentication-failed",
  "title": "Authentication Failed",
  "status": 401,
  "detail": "Invalid credentials provided",
  "instance": "/api/v1/auth/login",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**Error Codes**:
- `400` - Invalid request format or missing required fields
- `401` - Invalid credentials
- `423` - Account locked due to too many failed attempts
- `429` - Rate limit exceeded

---

### POST /register
Create a new user account.

**Request Body**:
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePassword123!",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response (201 Created)**:
```json
{
  "status": "success",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "johndoe",
    "email": "john@example.com",
    "fullName": "John Doe",
    "isVerified": false,
    "createdAt": "2024-01-15T10:30:00Z"
  },
  "message": "User registered successfully. Please verify your email address.",
  "timestamp": "2024-01-15T10:30:00Z",
  "path": "/api/v1/auth/register"
}
```

**Password Requirements**:
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one digit
- At least one special character

**Error Codes**:
- `400` - Invalid input data or password requirements not met
- `409` - Username or email already exists
- `429` - Rate limit exceeded

---

### POST /refresh
Generate new access token using refresh token.

**Request Body**:
```json
{
  "refreshToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200 OK)**:
```json
{
  "status": "success",
  "data": {
    "accessToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tokenType": "Bearer",
    "expiresIn": 3600
  },
  "message": "Token refreshed successfully",
  "timestamp": "2024-01-15T10:30:00Z",
  "path": "/api/v1/auth/refresh"
}
```

**Error Codes**:
- `400` - Invalid refresh token format
- `401` - Refresh token expired or revoked
- `429` - Rate limit exceeded

---

### POST /logout
Invalidate the current session and JWT token.

**Headers**:
```
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK)**:
```json
{
  "status": "success",
  "data": null,
  "message": "Logout successful",
  "timestamp": "2024-01-15T10:30:00Z",
  "path": "/api/v1/auth/logout"
}
```

**Error Codes**:
- `401` - Invalid or expired token
- `400` - Invalid authorization header format

---

### POST /logout-all
Invalidate all user sessions across all devices.

**Headers**:
```
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK)**:
```json
{
  "status": "success",
  "data": null,
  "message": "All sessions have been invalidated",
  "timestamp": "2024-01-15T10:30:00Z",
  "path": "/api/v1/auth/logout-all"
}
```

**Error Codes**:
- `401` - Invalid or expired token

---

### GET /me
Get current authenticated user information.

**Headers**:
```
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK)**:
```json
{
  "status": "success",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "johndoe",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "fullName": "John Doe",
    "isVerified": true,
    "isActive": true,
    "roles": ["USER"],
    "permissions": ["user:read", "user:update-self"],
    "lastLogin": "2024-01-15T09:00:00Z",
    "createdAt": "2024-01-01T00:00:00Z"
  },
  "message": "User information retrieved",
  "timestamp": "2024-01-15T10:30:00Z",
  "path": "/api/v1/auth/me"
}
```

**Error Codes**:
- `401` - Invalid or expired token

---

### POST /validate
Validate JWT access token (primarily for internal service-to-service calls).

**Headers**:
```
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK)**:
```json
{
  "status": "success",
  "data": true,
  "message": "Token is valid",
  "timestamp": "2024-01-15T10:30:00Z",
  "path": "/api/v1/auth/validate"
}
```

**Invalid Token Response (200 OK)**:
```json
{
  "status": "success",
  "data": false,
  "message": "Token is invalid",
  "timestamp": "2024-01-15T10:30:00Z",
  "path": "/api/v1/auth/validate"
}
```

## 🔑 JWT Token Structure

### Access Token Claims
```json
{
  "sub": "550e8400-e29b-41d4-a716-446655440000",
  "iss": "ivyarc-auth-service",
  "aud": ["api-gateway", "user-service"],
  "exp": 1640995200,
  "iat": 1640991600,
  "jti": "token-unique-id",
  "authorities": ["ROLE_USER"],
  "permissions": ["user:read", "user:update-self"],
  "session_id": "session-uuid",
  "username": "johndoe",
  "email": "john@example.com"
}
```

### Token Lifespans
- **Access Token**: 1 hour (3600 seconds)
- **Refresh Token**: 30 days (2592000 seconds)
- **Password Reset Token**: 1 hour (3600 seconds)

## 🛡️ Security Features

### Rate Limiting
- **Login attempts**: 5 per minute per IP
- **Registration**: 3 per hour per IP
- **Password reset**: 3 per hour per email
- **Token refresh**: 10 per minute per user

### Account Security
- **Failed login tracking**: Account locked after 5 consecutive failures
- **Session management**: Maximum 10 concurrent sessions per user
- **IP tracking**: Unusual location detection and alerts
- **Device fingerprinting**: Browser and device tracking

### Password Security
- **Bcrypt hashing**: Cost factor 12 for password storage
- **Password history**: Prevent reuse of last 5 passwords
- **Strength validation**: Comprehensive password policy enforcement
- **Breach checking**: Integration with HaveIBeenPwned API

## 🔧 Integration Examples

### JavaScript/TypeScript
```typescript
// Login example
const login = async (identifier: string, password: string) => {
  const response = await fetch('https://api.ivyarc.pro/api/v1/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ identifier, password }),
  });
  
  if (!response.ok) {
    throw new Error('Login failed');
  }
  
  const data = await response.json();
  localStorage.setItem('accessToken', data.data.accessToken);
  localStorage.setItem('refreshToken', data.data.refreshToken);
  
  return data.data;
};

// Authenticated request example
const makeAuthenticatedRequest = async (url: string) => {
  const token = localStorage.getItem('accessToken');
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  
  if (response.status === 401) {
    // Token expired, try refresh
    await refreshToken();
    return makeAuthenticatedRequest(url);
  }
  
  return response.json();
};
```

### Java Spring Boot
```java
@Service
public class AuthClient {
    
    @Autowired
    private RestTemplate restTemplate;
    
    public AuthResponse login(String identifier, String password) {
        LoginRequest request = new LoginRequest(identifier, password);
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        
        HttpEntity<LoginRequest> entity = new HttpEntity<>(request, headers);
        
        ResponseEntity<ApiResponse<AuthResponse>> response = restTemplate.postForEntity(
            "https://api.ivyarc.pro/api/v1/auth/login",
            entity,
            new ParameterizedTypeReference<ApiResponse<AuthResponse>>() {}
        );
        
        return response.getBody().getData();
    }
}
```

### cURL Examples
```bash
# Login
curl -X POST https://api.ivyarc.pro/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "user@example.com",
    "password": "SecurePassword123!"
  }'

# Get current user
curl -X GET https://api.ivyarc.pro/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Logout
curl -X POST https://api.ivyarc.pro/api/v1/auth/logout \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## ❗ Common Issues

### Token Expiration
- **Symptom**: Receiving 401 responses
- **Solution**: Implement automatic token refresh logic
- **Prevention**: Monitor token expiration time

### Rate Limiting
- **Symptom**: Receiving 429 responses
- **Solution**: Implement exponential backoff retry logic
- **Prevention**: Cache tokens and avoid unnecessary requests

### CORS Issues
- **Symptom**: Browser blocking requests
- **Solution**: Ensure proper CORS headers are configured
- **Note**: API Gateway handles CORS for all services

---

**Related Documentation**:
- [Password Reset API](./password-reset-api.md)
- [JWT Token Reference](../shared/jwt-tokens.md)
- [Error Handling Guide](../shared/error-handling.md)

**Navigation**: [← API Documentation](../README.md) | [Authorization API](../authorization-service/) | [User Management API](../user-service/)