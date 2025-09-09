# Password Management API

## 📋 Overview

The Password Management API provides secure password reset functionality and password change operations for authenticated users. All endpoints implement security best practices including rate limiting and secure token validation.

**Base URL**: `https://api.ivyarc.pro/api/v1/auth`  
**Service**: Authentication Service  
**Content-Type**: `application/json`

## 🔐 Password Reset Flow

### 1. Request Password Reset

**Endpoint**: `POST /forgot-password`  
**Purpose**: Initiate password reset process by sending reset email

**Request Body**:
```json
{
  "email": "user@example.com"
}
```

**Response (200 OK)**:
```json
{
  "status": "success",
  "data": null,
  "message": "If the email address exists in our system, you will receive password reset instructions.",
  "timestamp": "2024-01-15T10:30:00Z",
  "path": "/api/v1/auth/forgot-password"
}
```

**Security Features**:
- **Email Enumeration Protection**: Same response regardless of email existence
- **Rate Limiting**: 3 requests per hour per IP address
- **Token Expiration**: Reset tokens expire after 1 hour
- **Single Use Tokens**: Each token can only be used once

**Error Codes**:
- `400` - Invalid email format
- `429` - Too many requests (rate limited)
- `500` - Internal server error

---

### 2. Validate Reset Token

**Endpoint**: `GET /validate-reset-token?token={reset_token}`  
**Purpose**: Verify if a password reset token is valid and not expired

**Query Parameters**:
- `token` (required): The password reset token from email

**Response (200 OK) - Valid Token**:
```json
{
  "status": "success",
  "data": true,
  "message": "Token is valid",
  "timestamp": "2024-01-15T10:30:00Z",
  "path": "/api/v1/auth/validate-reset-token"
}
```

**Response (200 OK) - Invalid Token**:
```json
{
  "status": "success",
  "data": false,
  "message": "Token is invalid or expired",
  "timestamp": "2024-01-15T10:30:00Z",
  "path": "/api/v1/auth/validate-reset-token"
}
```

**Use Cases**:
- Frontend form validation before password reset
- Token verification in mobile apps
- Deep link validation

---

### 3. Reset Password

**Endpoint**: `POST /reset-password`  
**Purpose**: Complete password reset using valid reset token

**Request Body**:
```json
{
  "token": "reset-token-from-email",
  "newPassword": "NewSecurePassword123!"
}
```

**Response (200 OK)**:
```json
{
  "status": "success",
  "data": null,
  "message": "Password has been reset successfully. You can now log in with your new password.",
  "timestamp": "2024-01-15T10:30:00Z",
  "path": "/api/v1/auth/reset-password"
}
```

**Password Requirements**:
- Minimum 8 characters
- At least one uppercase letter (A-Z)
- At least one lowercase letter (a-z)
- At least one digit (0-9)
- At least one special character (!@#$%^&*()_+-=[]{}|;:,.<>?)
- Cannot be one of the last 5 passwords used

**Error Codes**:
- `400` - Invalid or expired token
- `422` - Password doesn't meet requirements
- `500` - Internal server error

---

## 🔑 Password Change (Authenticated Users)

### Change Password

**Endpoint**: `POST /change-password`  
**Purpose**: Allow authenticated users to change their current password

**Headers**:
```
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Request Body**:
```json
{
  "currentPassword": "CurrentPassword123!",
  "newPassword": "NewSecurePassword123!"
}
```

**Response (200 OK)**:
```json
{
  "status": "success",
  "data": null,
  "message": "Password changed successfully",
  "timestamp": "2024-01-15T10:30:00Z",
  "path": "/api/v1/auth/change-password"
}
```

**Security Features**:
- **Current Password Verification**: Must provide current password
- **Session Invalidation**: All other sessions are terminated
- **Audit Logging**: Password change events are logged
- **Notification**: User receives email notification of password change

**Error Codes**:
- `400` - Invalid current password or new password format
- `401` - Authentication required (invalid token)
- `422` - New password doesn't meet requirements
- `500` - Internal server error

---

## 🛡️ Security Implementation

### Token Security
```json
{
  "tokenFormat": "UUID v4 (36 characters)",
  "expiration": "1 hour from generation",
  "storage": "Hashed in database with bcrypt",
  "usage": "Single use only",
  "entropy": "128 bits of cryptographic randomness"
}
```

### Rate Limiting Rules
```yaml
forgot-password:
  limit: 3 requests
  window: 1 hour
  scope: per IP address

reset-password:
  limit: 10 requests
  window: 1 hour  
  scope: per IP address

change-password:
  limit: 5 requests
  window: 15 minutes
  scope: per user
```

### Email Template Security
- **No Sensitive Data**: Emails never contain passwords
- **Secure Links**: HTTPS-only reset links
- **Expiration Notice**: Clear expiration time in email
- **Branding Protection**: Consistent branding to prevent phishing

## 🔧 Integration Examples

### Frontend Password Reset Flow

```typescript
class PasswordResetService {
  private baseUrl = 'https://api.ivyarc.pro/api/v1/auth';

  // Step 1: Request password reset
  async requestPasswordReset(email: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to request password reset');
    }
  }

  // Step 2: Validate reset token
  async validateResetToken(token: string): Promise<boolean> {
    const response = await fetch(`${this.baseUrl}/validate-reset-token?token=${encodeURIComponent(token)}`);
    
    if (!response.ok) {
      return false;
    }

    const result = await response.json();
    return result.data === true;
  }

  // Step 3: Reset password
  async resetPassword(token: string, newPassword: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, newPassword }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to reset password');
    }
  }

  // Change password for authenticated user
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    const token = localStorage.getItem('accessToken');
    
    const response = await fetch(`${this.baseUrl}/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to change password');
    }
  }
}
```

### React Hook Example

```tsx
import { useState } from 'react';

export const usePasswordReset = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestReset = async (email: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/v1/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { requestReset, loading, error };
};
```

### Java Spring Boot Example

```java
@Service
public class PasswordResetClient {
    
    @Autowired
    private RestTemplate restTemplate;
    
    @Value("${auth.service.base-url}")
    private String baseUrl;
    
    public void requestPasswordReset(String email) {
        ForgotPasswordRequest request = new ForgotPasswordRequest();
        request.setEmail(email);
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        
        HttpEntity<ForgotPasswordRequest> entity = new HttpEntity<>(request, headers);
        
        try {
            ResponseEntity<ApiResponse> response = restTemplate.postForEntity(
                baseUrl + "/forgot-password", 
                entity, 
                ApiResponse.class
            );
            
            if (!response.getStatusCode().is2xxSuccessful()) {
                throw new PasswordResetException("Failed to request password reset");
            }
        } catch (RestClientException e) {
            throw new PasswordResetException("Error communicating with auth service", e);
        }
    }
    
    public void resetPassword(String token, String newPassword) {
        ResetPasswordRequest request = new ResetPasswordRequest();
        request.setToken(token);
        request.setNewPassword(newPassword);
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        
        HttpEntity<ResetPasswordRequest> entity = new HttpEntity<>(request, headers);
        
        try {
            ResponseEntity<ApiResponse> response = restTemplate.postForEntity(
                baseUrl + "/reset-password", 
                entity, 
                ApiResponse.class
            );
            
            if (!response.getStatusCode().is2xxSuccessful()) {
                throw new PasswordResetException("Failed to reset password");
            }
        } catch (RestClientException e) {
            throw new PasswordResetException("Error communicating with auth service", e);
        }
    }
}
```

## 📧 Email Templates

### Password Reset Email
```html
<!DOCTYPE html>
<html>
<head>
    <title>Password Reset - IvyArc</title>
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
        <h2 style="color: #2563eb;">Password Reset Request</h2>
        <p>Hello,</p>
        <p>We received a request to reset your password for your IvyArc account. Click the button below to set a new password:</p>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="https://ivyarc.pro/reset-password?token={{resetToken}}" 
               style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Reset Password
            </a>
        </div>
        
        <p><strong>This link will expire in 1 hour.</strong></p>
        
        <p>If you didn't request this password reset, please ignore this email. Your password will remain unchanged.</p>
        
        <hr style="margin: 20px 0; border: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 14px;">
            For security reasons, this link can only be used once. If you need another reset link, please request a new one.
        </p>
    </div>
</body>
</html>
```

## ❗ Common Issues and Solutions

### Token Expired
**Problem**: Reset token has expired (after 1 hour)  
**Solution**: Request a new password reset email  
**Prevention**: Complete password reset within 1 hour

### Email Not Received
**Problem**: Password reset email not arriving  
**Causes**: 
- Email in spam folder
- Incorrect email address
- Email server issues
**Solution**: 
- Check spam/junk folder
- Verify email address spelling
- Contact support if issue persists

### Rate Limiting
**Problem**: "Too many requests" error  
**Cause**: Exceeded rate limits
**Solution**: Wait for the rate limit window to reset
**Prevention**: Implement client-side request throttling

### Invalid Token
**Problem**: "Invalid or expired token" error  
**Causes**:
- Token already used
- Token expired
- Token malformed
**Solution**: Request a new password reset

---

**Related Documentation**:
- [Authentication API](./authentication-api.md)
- [JWT Token Reference](../shared/jwt-tokens.md)
- [Error Handling Guide](../shared/error-handling.md)

**Navigation**: [← Auth Service API](./README.md) | [Authentication API](./authentication-api.md) | [API Documentation](../README.md)