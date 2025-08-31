import { test, expect } from '@playwright/test';
import { LoginPage } from '../../page-objects/auth/login-page';
import { DashboardPage } from '../../page-objects/dashboard/dashboard-page';
import { TestDataManager } from '../../utils/test-data-manager';

test.describe('Authentication Flows', () => {
  let loginPage: LoginPage;
  let dashboardPage: DashboardPage;
  let testDataManager: TestDataManager;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
    testDataManager = new TestDataManager();
    
    // Start on login page
    await loginPage.navigateToLogin();
  });

  test.describe('Login Functionality', () => {
    test('should login successfully with valid admin credentials', async () => {
      const result = await loginPage.loginAsAdmin();
      
      expect(result.success).toBe(true);
      expect(result.error).toBeNull();
      
      // Verify we're on dashboard
      await expect(dashboardPage.dashboardContent).toBeVisible();
      expect(await dashboardPage.isOnDashboard()).toBe(true);
      
      // Verify user info is displayed
      const userInfo = await dashboardPage.getUserInfo();
      expect(userInfo.email).toBe('admin@ivyarc.com');
    });

    test('should login successfully with valid user credentials', async () => {
      const result = await loginPage.loginAsUser();
      
      expect(result.success).toBe(true);
      expect(result.error).toBeNull();
      
      await expect(dashboardPage.dashboardContent).toBeVisible();
    });

    test('should login successfully with valid manager credentials', async () => {
      const result = await loginPage.loginAsManager();
      
      expect(result.success).toBe(true);
      expect(result.error).toBeNull();
      
      await expect(dashboardPage.dashboardContent).toBeVisible();
    });

    test('should fail login with invalid credentials', async () => {
      const result = await loginPage.loginWithInvalidCredentials('invalid@example.com', 'wrongpassword');
      
      expect(result.error).toBeTruthy();
      expect(result.stayedOnLoginPage).toBe(true);
      
      // Should show error message
      await expect(loginPage.errorMessage).toBeVisible();
      expect(await loginPage.getErrorMessage()).toContain('Invalid');
    });

    test('should fail login with empty credentials', async () => {
      await loginPage.clearForm();
      const isValid = await loginPage.testFormValidation();
      
      expect(isValid).toBe(true); // testFormValidation returns true if form is invalid
      
      // Login button should be disabled or form should show validation errors
      const formValid = await loginPage.isFormValid();
      expect(formValid).toBe(false);
    });

    test('should validate password minimum length', async () => {
      const isInvalid = await loginPage.testPasswordValidation();
      expect(isInvalid).toBe(true);
    });

    test('should toggle password visibility', async () => {
      await loginPage.fillField(loginPage.passwordInput, 'testpassword');
      
      // Toggle to show password
      const passwordVisible = await loginPage.togglePasswordVisibility();
      expect(passwordVisible).toBe(true);
      
      // Toggle to hide password
      const passwordHidden = await loginPage.togglePasswordVisibility();
      expect(passwordHidden).toBe(false);
    });

    test('should handle keyboard navigation', async () => {
      const navigation = await loginPage.testKeyboardNavigation();
      
      expect(navigation.passwordFocused).toBe(true);
      expect(navigation.buttonFocused).toBe(true);
    });

    test('should submit form with Enter key', async () => {
      await loginPage.fillField(loginPage.usernameInput, 'admin@ivyarc.com');
      await loginPage.fillField(loginPage.passwordInput, 'admin123');
      
      await loginPage.submitWithEnterKey();
      
      // Should redirect to dashboard
      await expect(dashboardPage.dashboardContent).toBeVisible();
    });
  });

  test.describe('Session Management', () => {
    test('should maintain session across page refreshes', async ({ page }) => {
      // Login first
      await loginPage.loginAsAdmin();
      await expect(dashboardPage.dashboardContent).toBeVisible();
      
      // Refresh page
      await page.reload();
      await dashboardPage.waitForPageLoad();
      
      // Should still be logged in
      expect(await dashboardPage.isOnDashboard()).toBe(true);
    });

    test('should redirect to login when accessing protected route without authentication', async ({ page }) => {
      // Try to access dashboard directly
      await page.goto('/dashboard');
      
      // Should redirect to login
      await page.waitForURL('**/auth/login', { timeout: 10000 });
      expect(await loginPage.isOnLoginPage()).toBe(true);
    });

    test('should redirect to dashboard when accessing login page while authenticated', async ({ page }) => {
      // Login first
      await loginPage.loginAsAdmin();
      await expect(dashboardPage.dashboardContent).toBeVisible();
      
      // Try to access login page
      await page.goto('/auth/login');
      
      // Should redirect to dashboard
      await page.waitForURL('**/dashboard', { timeout: 10000 });
      expect(await dashboardPage.isOnDashboard()).toBe(true);
    });
  });

  test.describe('Logout Functionality', () => {
    test('should logout successfully and redirect to login', async () => {
      // Login first
      await loginPage.loginAsAdmin();
      await expect(dashboardPage.dashboardContent).toBeVisible();
      
      // Logout
      await dashboardPage.logout();
      
      // Should be on login page
      expect(await loginPage.isOnLoginPage()).toBe(true);
      
      // Try to access dashboard again
      await dashboardPage.navigateToDashboard();
      
      // Should redirect back to login
      await dashboardPage.page.waitForURL('**/auth/login', { timeout: 5000 });
    });

    test('should clear session data on logout', async ({ page }) => {
      // Login and check localStorage
      await loginPage.loginAsAdmin();
      await expect(dashboardPage.dashboardContent).toBeVisible();
      
      // Verify tokens are stored
      const beforeLogout = await page.evaluate(() => ({
        accessToken: localStorage.getItem('auth_access_token'),
        refreshToken: localStorage.getItem('auth_refresh_token'),
        user: localStorage.getItem('auth_user'),
      }));
      
      expect(beforeLogout.accessToken).toBeTruthy();
      expect(beforeLogout.refreshToken).toBeTruthy();
      expect(beforeLogout.user).toBeTruthy();
      
      // Logout
      await dashboardPage.logout();
      
      // Verify tokens are cleared
      const afterLogout = await page.evaluate(() => ({
        accessToken: localStorage.getItem('auth_access_token'),
        refreshToken: localStorage.getItem('auth_refresh_token'),
        user: localStorage.getItem('auth_user'),
      }));
      
      expect(afterLogout.accessToken).toBeNull();
      expect(afterLogout.refreshToken).toBeNull();
      expect(afterLogout.user).toBeNull();
    });
  });

  test.describe('Token Refresh', () => {
    test('should handle token refresh automatically', async ({ page }) => {
      // Login
      await loginPage.loginAsAdmin();
      await expect(dashboardPage.dashboardContent).toBeVisible();
      
      // Mock expired token scenario by manipulating localStorage
      await page.evaluate(() => {
        // Set a token that will be considered expired
        const expiredTokenPayload = {
          exp: Math.floor(Date.now() / 1000) - 3600, // Expired 1 hour ago
          sub: 'admin@ivyarc.com',
        };
        const expiredToken = btoa(JSON.stringify(expiredTokenPayload));
        localStorage.setItem('auth_access_token', `header.${expiredToken}.signature`);
      });
      
      // Make a request that should trigger token refresh
      await dashboardPage.navigateToDashboard();
      
      // Should handle token refresh automatically and stay logged in
      expect(await dashboardPage.isOnDashboard()).toBe(true);
    });
  });

  test.describe('Security Tests', () => {
    test('should not expose sensitive data in client-side code', async ({ page }) => {
      await loginPage.loginAsAdmin();
      
      // Check that passwords are not stored in localStorage
      const storageData = await page.evaluate(() => {
        const storage: Record<string, any> = {};
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key) {
            storage[key] = localStorage.getItem(key);
          }
        }
        return storage;
      });
      
      // Verify no passwords are stored
      const storageString = JSON.stringify(storageData).toLowerCase();
      expect(storageString).not.toContain('admin123');
      expect(storageString).not.toContain('password');
    });

    test('should handle concurrent login attempts', async ({ browser }) => {
      // Create multiple contexts to simulate concurrent logins
      const context1 = await browser.newContext();
      const context2 = await browser.newContext();
      
      const page1 = await context1.newPage();
      const page2 = await context2.newPage();
      
      const loginPage1 = new LoginPage(page1);
      const loginPage2 = new LoginPage(page2);
      
      // Login with same credentials from different sessions
      await loginPage1.navigateToLogin();
      await loginPage2.navigateToLogin();
      
      const [result1, result2] = await Promise.all([
        loginPage1.loginAsAdmin(),
        loginPage2.loginAsAdmin(),
      ]);
      
      // Both logins should succeed (or handle appropriately based on business rules)
      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
      
      await context1.close();
      await context2.close();
    });
  });

  test.describe('Accessibility', () => {
    test('should be accessible to screen readers', async ({ page }) => {
      // Check for proper ARIA labels and roles
      await expect(loginPage.usernameInput).toHaveAttribute('aria-label');
      await expect(loginPage.passwordInput).toHaveAttribute('aria-label');
      await expect(loginPage.loginButton).toHaveAttribute('aria-label');
      
      // Check for proper heading structure
      const headings = page.locator('h1, h2, h3, h4, h5, h6');
      const headingCount = await headings.count();
      expect(headingCount).toBeGreaterThan(0);
    });

    test('should support high contrast mode', async ({ page }) => {
      // Enable high contrast mode simulation
      await page.emulateMedia({ colorScheme: 'dark' });
      await loginPage.navigateToLogin();
      
      // Verify elements are still visible and usable
      await expect(loginPage.loginForm).toBeVisible();
      await expect(loginPage.usernameInput).toBeVisible();
      await expect(loginPage.passwordInput).toBeVisible();
      await expect(loginPage.loginButton).toBeVisible();
    });
  });
});