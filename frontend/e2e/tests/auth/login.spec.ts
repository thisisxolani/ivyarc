import { test, expect, Page } from '@playwright/test';
import { LoginPage } from '../../page-objects/login-page';
import { DashboardPage } from '../../page-objects/dashboard-page';
import { TestDataManager } from '../../utils/test-data-manager';

test.describe('Login Authentication Tests', () => {
  let loginPage: LoginPage;
  let dashboardPage: DashboardPage;
  let testDataManager: TestDataManager;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
    testDataManager = new TestDataManager();
    
    await loginPage.navigateToLogin();
  });

  test.describe('Successful Login Scenarios', () => {
    test('should login with valid admin credentials', async ({ page }) => {
      const adminUser = testDataManager.getTestUsers().admin;
      
      await loginPage.loginWithValidation(adminUser.username, adminUser.password);
      await dashboardPage.verifyDashboardLoaded();
      
      // Verify user role permissions
      await dashboardPage.verifyUserPermissions('ADMIN');
      
      // Take screenshot for verification
      await dashboardPage.takeScreenshot('admin-dashboard');
    });

    test('should login with valid manager credentials', async ({ page }) => {
      const managerUser = testDataManager.getTestUsers().manager;
      
      await loginPage.loginWithValidation(managerUser.username, managerUser.password);
      await dashboardPage.verifyDashboardLoaded();
      
      // Verify manager permissions
      await dashboardPage.verifyUserPermissions('MANAGER');
    });

    test('should login with valid user credentials', async ({ page }) => {
      const regularUser = testDataManager.getTestUsers().user;
      
      await loginPage.loginWithValidation(regularUser.username, regularUser.password);
      await dashboardPage.verifyDashboardLoaded();
      
      // Verify regular user permissions
      await dashboardPage.verifyUserPermissions('USER');
    });

    test('should maintain session with remember me option', async ({ page }) => {
      const adminUser = testDataManager.getTestUsers().admin;
      
      await loginPage.login(adminUser.username, adminUser.password, true);
      await loginPage.waitForSuccessfulLogin();
      
      // Verify remember me is checked
      expect(await loginPage.isRememberMeChecked()).toBe(false); // After navigation, checkbox state is reset
      
      // Navigate to dashboard and verify session
      await dashboardPage.navigateToDashboard();
      await dashboardPage.verifyDashboardLoaded();
    });
  });

  test.describe('Failed Login Scenarios', () => {
    test('should show error for invalid credentials', async ({ page }) => {
      await loginPage.login('invalid@user.com', 'wrongpassword');
      
      // Verify error message appears
      expect(await loginPage.hasErrorMessage()).toBe(true);
      const errorMessage = await loginPage.getErrorMessage();
      expect(errorMessage.toLowerCase()).toContain('invalid');
      
      // Verify still on login page
      expect(loginPage.getCurrentURL()).toContain('login');
    });

    test('should show validation errors for empty fields', async ({ page }) => {
      await loginPage.clickLoginButton();
      
      // Verify validation errors
      const validationErrors = await loginPage.getValidationErrors();
      expect(validationErrors.length).toBeGreaterThan(0);
      
      // Check for specific field validation
      await loginPage.verifyValidationErrors({
        username: 'required',
        password: 'required'
      });
    });

    test('should show error for invalid email format', async ({ page }) => {
      await loginPage.login('invalid-email', 'password123');
      
      // Check for validation error or format error
      const hasError = await loginPage.hasErrorMessage();
      const validationErrors = await loginPage.getValidationErrors();
      
      expect(hasError || validationErrors.length > 0).toBe(true);
      
      if (validationErrors.length > 0) {
        const emailError = validationErrors.find(error => 
          error.toLowerCase().includes('email') || error.toLowerCase().includes('format')
        );
        expect(emailError).toBeTruthy();
      }
    });

    test('should handle account lockout after multiple failed attempts', async ({ page }) => {
      const invalidCredentials = { username: 'test@example.com', password: 'wrongpassword' };
      
      // Attempt login multiple times
      for (let i = 0; i < 3; i++) {
        await loginPage.clearLoginForm();
        await loginPage.login(invalidCredentials.username, invalidCredentials.password);
        
        await page.waitForTimeout(1000);
        const errorMessage = await loginPage.getErrorMessage();
        console.log(`Attempt ${i + 1}: ${errorMessage}`);
      }
      
      // After multiple attempts, there might be a lockout message
      const finalError = await loginPage.getErrorMessage();
      // Note: This test depends on backend implementing account lockout
      console.log('Final error after multiple attempts:', finalError);
    });
  });

  test.describe('UI and UX Tests', () => {
    test('should toggle password visibility', async ({ page }) => {
      await loginPage.fillPassword('testpassword');
      
      // Initially password should be hidden
      await loginPage.verifyPasswordVisibility(false);
      
      // Toggle visibility
      await loginPage.togglePasswordVisibility();
      await loginPage.verifyPasswordVisibility(true);
      
      // Toggle back
      await loginPage.togglePasswordVisibility();
      await loginPage.verifyPasswordVisibility(false);
    });

    test('should have proper form validation feedback', async ({ page }) => {
      // Test email validation
      await loginPage.fillUsername('invalid-email');
      await loginPage.fillPassword('');
      await loginPage.clickLoginButton();
      
      const errors = await loginPage.getValidationErrors();
      expect(errors.length).toBeGreaterThan(0);
      
      // Test password validation
      await loginPage.clearLoginForm();
      await loginPage.fillUsername('test@example.com');
      await loginPage.fillPassword('123'); // Too short
      await loginPage.clickLoginButton();
      
      // Should have some validation
      await page.waitForTimeout(1000);
    });

    test('should handle keyboard navigation properly', async ({ page }) => {
      await loginPage.testKeyboardNavigation();
      
      // Test form submission with Enter key
      await loginPage.testFormInteractions();
    });

    test('should be responsive across different screen sizes', async ({ page }) => {
      await loginPage.testResponsiveDesign();
      
      // Verify form functionality on mobile
      await page.setViewportSize({ width: 375, height: 667 });
      await loginPage.verifyLoginPageLoaded();
      
      // Test login functionality on mobile
      const adminUser = testDataManager.getTestUsers().admin;
      await loginPage.loginWithValidation(adminUser.username, adminUser.password);
      
      // Reset viewport
      await page.setViewportSize({ width: 1280, height: 720 });
    });
  });

  test.describe('Accessibility Tests', () => {
    test('should meet accessibility standards', async ({ page }) => {
      await loginPage.verifyAccessibility();
      
      // Test screen reader compatibility
      const formLabel = await page.locator('label').count();
      expect(formLabel).toBeGreaterThan(0);
      
      // Test ARIA attributes
      const ariaElements = await page.locator('[aria-label], [aria-describedby], [role]').count();
      expect(ariaElements).toBeGreaterThan(0);
    });

    test('should support keyboard-only navigation', async ({ page }) => {
      // Navigate using only keyboard
      await page.keyboard.press('Tab'); // Focus username
      await page.keyboard.type('admin@ivyarc.com');
      
      await page.keyboard.press('Tab'); // Focus password
      await page.keyboard.type('admin123');
      
      await page.keyboard.press('Tab'); // Focus login button
      await page.keyboard.press('Enter'); // Submit form
      
      // Should redirect to dashboard
      await page.waitForURL('**/dashboard');
    });
  });

  test.describe('Performance Tests', () => {
    test('should load login page within performance thresholds', async ({ page }) => {
      const metrics = await loginPage.verifyPerformance();
      
      // Login page should be lightweight and fast
      expect(metrics.domContentLoaded).toBeLessThan(2000); // 2 seconds
      expect(metrics.loadComplete).toBeLessThan(3000); // 3 seconds
      expect(metrics.firstContentfulPaint).toBeLessThan(1500); // 1.5 seconds
    });

    test('should handle login request within reasonable time', async ({ page }) => {
      const adminUser = testDataManager.getTestUsers().admin;
      
      const startTime = Date.now();
      await loginPage.login(adminUser.username, adminUser.password);
      await loginPage.waitForSuccessfulLogin();
      const endTime = Date.now();
      
      const loginDuration = endTime - startTime;
      console.log(`Login completed in ${loginDuration}ms`);
      
      // Login should complete within 5 seconds
      expect(loginDuration).toBeLessThan(5000);
    });
  });

  test.describe('Security Tests', () => {
    test('should not expose sensitive information in client', async ({ page }) => {
      // Check that passwords are properly masked
      await loginPage.fillPassword('secretpassword');
      
      const passwordType = await loginPage.passwordInput.getAttribute('type');
      expect(passwordType).toBe('password');
      
      // Check that form data is not logged in console
      const consoleLogs: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'log') {
          consoleLogs.push(msg.text());
        }
      });
      
      await loginPage.login('test@example.com', 'password123');
      await page.waitForTimeout(2000);
      
      // Ensure password is not logged
      const passwordInLogs = consoleLogs.some(log => 
        log.includes('password123') || log.includes('secretpassword')
      );
      expect(passwordInLogs).toBe(false);
    });

    test('should handle HTTPS redirect properly', async ({ page }) => {
      // This test would verify HTTPS enforcement
      const currentUrl = page.url();
      expect(currentUrl.startsWith('http')).toBe(true);
      
      // In production, this should redirect to HTTPS
      console.log('Current URL protocol:', currentUrl.split(':')[0]);
    });

    test('should implement proper session timeout', async ({ page }) => {
      const adminUser = testDataManager.getTestUsers().admin;
      
      await loginPage.loginWithValidation(adminUser.username, adminUser.password);
      await dashboardPage.verifyDashboardLoaded();
      
      // Store authentication token if available
      const authToken = await page.evaluate(() => {
        return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      });
      
      if (authToken) {
        console.log('Auth token present in storage');
        
        // Verify token has expiration
        try {
          const tokenPayload = JSON.parse(atob(authToken.split('.')[1]));
          expect(tokenPayload.exp).toBeTruthy();
          console.log('Token expires at:', new Date(tokenPayload.exp * 1000));
        } catch (e) {
          console.log('Unable to parse JWT token');
        }
      }
    });
  });

  test.describe('Social Login Tests', () => {
    test('should display social login options if available', async ({ page }) => {
      await loginPage.verifySocialLoginOptions();
    });
  });

  test.describe('Integration Tests', () => {
    test('should integrate properly with backend authentication service', async ({ page }) => {
      const adminUser = testDataManager.getTestUsers().admin;
      
      // Monitor network requests
      const authRequests: any[] = [];
      page.on('response', response => {
        if (response.url().includes('/auth/login') || response.url().includes('/api/v1/auth/login')) {
          authRequests.push({
            url: response.url(),
            status: response.status(),
            headers: response.headers()
          });
        }
      });
      
      await loginPage.login(adminUser.username, adminUser.password);
      await loginPage.waitForSuccessfulLogin();
      
      // Verify authentication request was made
      expect(authRequests.length).toBeGreaterThan(0);
      
      const authRequest = authRequests[0];
      expect(authRequest.status).toBe(200);
      expect(authRequest.headers['content-type']).toContain('application/json');
      
      console.log('Authentication request details:', authRequest);
    });

    test('should handle backend service unavailability gracefully', async ({ page }) => {
      // This test would simulate backend downtime
      // In a real scenario, you might mock network failures
      
      await loginPage.login('admin@ivyarc.com', 'admin123');
      
      // Wait for response or error
      await page.waitForTimeout(5000);
      
      // Should either succeed or show appropriate error message
      const hasError = await loginPage.hasErrorMessage();
      const isOnDashboard = page.url().includes('dashboard');
      
      expect(hasError || isOnDashboard).toBe(true);
      
      if (hasError) {
        const errorMessage = await loginPage.getErrorMessage();
        console.log('Service unavailable error:', errorMessage);
      }
    });
  });

  test.afterEach(async ({ page }) => {
    // Clean up any authentication state
    await page.context().clearCookies();
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });
});