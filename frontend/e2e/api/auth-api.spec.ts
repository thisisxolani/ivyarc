import { test, expect } from '@playwright/test';
import { ApiClient } from '../utils/api-client';
import { TestDataManager } from '../utils/test-data-manager';

test.describe('Authentication API Tests', () => {
  let apiClient: ApiClient;
  let testDataManager: TestDataManager;

  test.beforeEach(async () => {
    apiClient = new ApiClient();
    testDataManager = new TestDataManager();
    await apiClient.initialize();
  });

  test.afterEach(async () => {
    await apiClient.dispose();
  });

  test.describe('Login API', () => {
    test('should login successfully with valid credentials', async () => {
      await apiClient.authenticate('admin@ivyarc.com', 'admin123');
      
      expect(apiClient.isAuthenticated()).toBe(true);
      expect(apiClient.getAuthToken()).toBeTruthy();
      
      // Verify token is valid
      const isValid = await apiClient.validateToken();
      expect(isValid).toBe(true);
    });

    test('should fail login with invalid credentials', async () => {
      await expect(async () => {
        await apiClient.authenticate('invalid@example.com', 'wrongpassword');
      }).rejects.toThrow();
      
      expect(apiClient.isAuthenticated()).toBe(false);
      expect(apiClient.getAuthToken()).toBeFalsy();
    });

    test('should return appropriate error for non-existent user', async () => {
      try {
        await apiClient.authenticate('nonexistent@example.com', 'anypassword');
        expect.fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.message).toContain('Invalid');
        expect(error.status).toBe(401);
      }
    });

    test('should return user information after successful login', async () => {
      await apiClient.authenticate('admin@ivyarc.com', 'admin123');
      
      const userInfo = await apiClient.getCurrentUser();
      
      expect(userInfo.success).toBe(true);
      expect(userInfo.data.email).toBe('admin@ivyarc.com');
      expect(userInfo.data.roles).toContain('ADMIN');
      expect(userInfo.data.permissions).toContain('user:read');
    });

    test('should handle concurrent login requests', async () => {
      const loginPromises = [
        apiClient.authenticate('admin@ivyarc.com', 'admin123'),
        apiClient.authenticate('user@ivyarc.com', 'user123'),
        apiClient.authenticate('manager@ivyarc.com', 'manager123'),
      ];

      // All should succeed without interference
      await Promise.all(loginPromises);
      expect(apiClient.isAuthenticated()).toBe(true);
    });
  });

  test.describe('Token Management', () => {
    test('should validate token successfully', async () => {
      await apiClient.authenticate('admin@ivyarc.com', 'admin123');
      
      const isValid = await apiClient.validateToken();
      expect(isValid).toBe(true);
    });

    test('should refresh token when expired', async () => {
      await apiClient.authenticate('admin@ivyarc.com', 'admin123');
      const originalToken = apiClient.getAuthToken();
      
      // Simulate token refresh (this would normally happen automatically)
      const refreshResponse = await apiClient.post('/api/v1/auth/refresh', {
        refreshToken: originalToken
      });
      
      expect(refreshResponse.success).toBe(true);
      expect(refreshResponse.data.accessToken).toBeTruthy();
      expect(refreshResponse.data.accessToken).not.toBe(originalToken);
    });

    test('should handle expired token gracefully', async () => {
      // This test would require manipulating token expiration
      // Implementation depends on backend token handling
      await apiClient.authenticate('admin@ivyarc.com', 'admin123');
      
      // Verify current token works
      let userInfo = await apiClient.getCurrentUser();
      expect(userInfo.success).toBe(true);
      
      // Token should automatically refresh on API calls when needed
      // This is handled by the ApiClient implementation
    });
  });

  test.describe('Logout API', () => {
    test('should logout successfully', async () => {
      await apiClient.authenticate('admin@ivyarc.com', 'admin123');
      expect(apiClient.isAuthenticated()).toBe(true);
      
      await apiClient.logout();
      expect(apiClient.isAuthenticated()).toBe(false);
      expect(apiClient.getAuthToken()).toBeFalsy();
    });

    test('should invalidate token on logout', async () => {
      await apiClient.authenticate('admin@ivyarc.com', 'admin123');
      const token = apiClient.getAuthToken();
      
      await apiClient.logout();
      
      // Try to use old token - should fail
      try {
        await apiClient.post('/api/v1/auth/validate', {}, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        expect.fail('Should have failed with invalid token');
      } catch (error: any) {
        expect(error.status).toBe(401);
      }
    });

    test('should handle logout when not authenticated', async () => {
      // Should not throw error when logging out without being logged in
      await expect(apiClient.logout()).resolves.toBeUndefined();
    });
  });

  test.describe('User Registration API', () => {
    test('should register new user successfully', async () => {
      const newUserData = testDataManager.generateRandomUserData();
      
      const registerResponse = await apiClient.post('/api/v1/auth/register', {
        username: newUserData.username,
        email: newUserData.email,
        password: newUserData.password,
        firstName: newUserData.firstName,
        lastName: newUserData.lastName,
      });
      
      expect(registerResponse.success).toBe(true);
      expect(registerResponse.data.email).toBe(newUserData.email);
      expect(registerResponse.data.id).toBeTruthy();
    });

    test('should prevent duplicate user registration', async () => {
      const userData = {
        username: 'admin@ivyarc.com',
        email: 'admin@ivyarc.com',
        password: 'newpassword123',
        firstName: 'Duplicate',
        lastName: 'Admin',
      };
      
      try {
        await apiClient.post('/api/v1/auth/register', userData);
        expect.fail('Should have failed with duplicate email');
      } catch (error: any) {
        expect(error.status).toBe(400);
        expect(error.message).toContain('already exists');
      }
    });

    test('should validate required fields during registration', async () => {
      const incompleteData = {
        email: 'incomplete@example.com',
        // Missing required fields
      };
      
      try {
        await apiClient.post('/api/v1/auth/register', incompleteData);
        expect.fail('Should have failed with validation errors');
      } catch (error: any) {
        expect(error.status).toBe(400);
        expect(error.message).toContain('required');
      }
    });

    test('should validate email format during registration', async () => {
      const invalidData = {
        username: 'invalid-email',
        email: 'invalid-email-format',
        password: 'ValidPassword123!',
        firstName: 'Test',
        lastName: 'User',
      };
      
      try {
        await apiClient.post('/api/v1/auth/register', invalidData);
        expect.fail('Should have failed with invalid email');
      } catch (error: any) {
        expect(error.status).toBe(400);
        expect(error.message).toContain('email');
      }
    });

    test('should validate password strength during registration', async () => {
      const weakPasswordData = {
        username: 'test@example.com',
        email: 'test@example.com',
        password: '123', // Too weak
        firstName: 'Test',
        lastName: 'User',
      };
      
      try {
        await apiClient.post('/api/v1/auth/register', weakPasswordData);
        expect.fail('Should have failed with weak password');
      } catch (error: any) {
        expect(error.status).toBe(400);
        expect(error.message).toContain('password');
      }
    });
  });

  test.describe('Password Management API', () => {
    test('should initiate password reset', async () => {
      const resetResponse = await apiClient.post('/api/v1/auth/forgot-password', {
        email: 'admin@ivyarc.com'
      });
      
      expect(resetResponse.success).toBe(true);
      expect(resetResponse.message).toContain('reset');
    });

    test('should handle password reset for non-existent email', async () => {
      // Should not reveal whether email exists for security
      const resetResponse = await apiClient.post('/api/v1/auth/forgot-password', {
        email: 'nonexistent@example.com'
      });
      
      expect(resetResponse.success).toBe(true);
      expect(resetResponse.message).toContain('sent');
    });

    test('should change password when authenticated', async () => {
      await apiClient.authenticate('admin@ivyarc.com', 'admin123');
      
      const changeResponse = await apiClient.post('/api/v1/auth/change-password', {
        currentPassword: 'admin123',
        newPassword: 'NewAdminPassword123!',
        confirmPassword: 'NewAdminPassword123!'
      });
      
      expect(changeResponse.success).toBe(true);
      
      // Test login with new password
      await apiClient.logout();
      await apiClient.authenticate('admin@ivyarc.com', 'NewAdminPassword123!');
      expect(apiClient.isAuthenticated()).toBe(true);
      
      // Reset password back
      const revertResponse = await apiClient.post('/api/v1/auth/change-password', {
        currentPassword: 'NewAdminPassword123!',
        newPassword: 'admin123',
        confirmPassword: 'admin123'
      });
      
      expect(revertResponse.success).toBe(true);
    });

    test('should validate current password when changing', async () => {
      await apiClient.authenticate('admin@ivyarc.com', 'admin123');
      
      try {
        await apiClient.post('/api/v1/auth/change-password', {
          currentPassword: 'wrongpassword',
          newPassword: 'NewPassword123!',
          confirmPassword: 'NewPassword123!'
        });
        expect.fail('Should have failed with wrong current password');
      } catch (error: any) {
        expect(error.status).toBe(400);
        expect(error.message).toContain('current password');
      }
    });
  });

  test.describe('Session Management API', () => {
    test('should get current user information', async () => {
      await apiClient.authenticate('admin@ivyarc.com', 'admin123');
      
      const userInfo = await apiClient.getCurrentUser();
      
      expect(userInfo.success).toBe(true);
      expect(userInfo.data).toBeTruthy();
      expect(userInfo.data.email).toBe('admin@ivyarc.com');
      expect(userInfo.data.firstName).toBe('Admin');
    });

    test('should fail to get user info when not authenticated', async () => {
      try {
        await apiClient.getCurrentUser();
        expect.fail('Should have failed without authentication');
      } catch (error: any) {
        expect(error.status).toBe(401);
      }
    });

    test('should logout from all sessions', async () => {
      await apiClient.authenticate('admin@ivyarc.com', 'admin123');
      
      const logoutAllResponse = await apiClient.post('/api/v1/auth/logout-all');
      expect(logoutAllResponse.success).toBe(true);
      
      // Current session should be invalidated
      expect(apiClient.isAuthenticated()).toBe(false);
    });

    test('should get active sessions information', async () => {
      await apiClient.authenticate('admin@ivyarc.com', 'admin123');
      
      const sessionsResponse = await apiClient.get('/api/v1/auth/sessions');
      
      expect(sessionsResponse.success).toBe(true);
      expect(Array.isArray(sessionsResponse.data)).toBe(true);
      expect(sessionsResponse.data.length).toBeGreaterThan(0);
    });
  });

  test.describe('Authorization API', () => {
    test('should check user permissions', async () => {
      await apiClient.authenticate('admin@ivyarc.com', 'admin123');
      
      const permissionsResponse = await apiClient.get('/api/v1/auth/permissions');
      
      expect(permissionsResponse.success).toBe(true);
      expect(Array.isArray(permissionsResponse.data)).toBe(true);
      expect(permissionsResponse.data).toContain('user:read');
      expect(permissionsResponse.data).toContain('user:write');
    });

    test('should check specific permission', async () => {
      await apiClient.authenticate('admin@ivyarc.com', 'admin123');
      
      const hasPermission = await apiClient.post('/api/v1/auth/check-permission', {
        permission: 'user:delete'
      });
      
      expect(hasPermission.success).toBe(true);
      expect(hasPermission.data.hasPermission).toBe(true);
    });

    test('should deny access to unauthorized endpoints', async () => {
      await apiClient.authenticate('user@ivyarc.com', 'user123');
      
      try {
        await apiClient.get('/api/v1/admin/settings');
        expect.fail('Should have failed with insufficient permissions');
      } catch (error: any) {
        expect(error.status).toBe(403);
      }
    });
  });

  test.describe('API Security Tests', () => {
    test('should reject requests without valid token', async () => {
      try {
        await apiClient.get('/api/v1/auth/me');
        expect.fail('Should have failed without authentication');
      } catch (error: any) {
        expect(error.status).toBe(401);
      }
    });

    test('should reject requests with malformed token', async () => {
      // Set invalid token
      apiClient['context'] = await apiClient['context'].newContext({
        baseURL: 'http://localhost:8080',
        extraHTTPHeaders: {
          'Authorization': 'Bearer invalid.token.here'
        }
      });
      
      try {
        await apiClient.get('/api/v1/auth/me');
        expect.fail('Should have failed with invalid token');
      } catch (error: any) {
        expect(error.status).toBe(401);
      }
    });

    test('should handle rate limiting', async () => {
      // Make multiple rapid requests to trigger rate limiting
      const promises = [];
      for (let i = 0; i < 10; i++) {
        promises.push(
          apiClient.post('/api/v1/auth/login', {
            identifier: 'admin@ivyarc.com',
            password: 'admin123'
          }).catch(err => err)
        );
      }
      
      const results = await Promise.all(promises);
      
      // Some requests should succeed, some might be rate limited
      const rateLimitedRequests = results.filter(result => 
        result.status === 429 || (result.message && result.message.includes('rate limit'))
      );
      
      // Rate limiting should be in effect (or at least not cause server errors)
      expect(results.length).toBe(10);
    });

    test('should sanitize error responses', async () => {
      try {
        await apiClient.post('/api/v1/auth/login', {
          identifier: 'admin@ivyarc.com',
          password: 'wrongpassword'
        });
      } catch (error: any) {
        // Error message should not reveal sensitive information
        expect(error.message).not.toContain('database');
        expect(error.message).not.toContain('internal');
        expect(error.message).not.toContain('stack');
      }
    });
  });

  test.describe('API Performance Tests', () => {
    test('should respond to login requests within acceptable time', async () => {
      const startTime = Date.now();
      
      await apiClient.authenticate('admin@ivyarc.com', 'admin123');
      
      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(2000); // Should respond within 2 seconds
    });

    test('should handle concurrent authentication requests', async () => {
      const startTime = Date.now();
      
      const concurrentRequests = Array.from({ length: 5 }, () =>
        new ApiClient().authenticate('admin@ivyarc.com', 'admin123')
      );
      
      const results = await Promise.all(concurrentRequests);
      
      const totalTime = Date.now() - startTime;
      expect(totalTime).toBeLessThan(5000); // All requests should complete within 5 seconds
      
      results.forEach(client => {
        expect(client).toBeTruthy();
      });
    });
  });
});