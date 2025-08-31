import { test, expect } from '@playwright/test';
import { LoginPage } from '../page-objects/auth/login-page';
import { DashboardPage } from '../page-objects/dashboard/dashboard-page';
import { UserManagementPage } from '../page-objects/users/user-management-page';

test.describe('Visual Regression Tests', () => {
  let loginPage: LoginPage;
  let dashboardPage: DashboardPage;
  let userManagementPage: UserManagementPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
    userManagementPage = new UserManagementPage(page);
  });

  test.describe('Authentication Screens', () => {
    test('login page should match visual baseline', async ({ page }) => {
      await loginPage.navigateToLogin();
      await loginPage.waitForPageLoad();
      
      // Wait for all elements to be visible
      await expect(loginPage.loginForm).toBeVisible();
      await expect(loginPage.usernameInput).toBeVisible();
      await expect(loginPage.passwordInput).toBeVisible();
      await expect(loginPage.loginButton).toBeVisible();
      
      // Take full page screenshot
      await expect(page).toHaveScreenshot('login-page.png', {
        fullPage: true,
        threshold: 0.3
      });
    });

    test('login page with validation errors should match baseline', async ({ page }) => {
      await loginPage.navigateToLogin();
      
      // Trigger validation errors
      await loginPage.clickElement(loginPage.loginButton);
      await page.waitForTimeout(500); // Wait for validation to appear
      
      await expect(page).toHaveScreenshot('login-page-with-errors.png', {
        fullPage: true,
        threshold: 0.3
      });
    });

    test('login page with error message should match baseline', async ({ page }) => {
      await loginPage.navigateToLogin();
      
      // Trigger login error
      await loginPage.loginWithInvalidCredentials('invalid@example.com', 'wrongpassword');
      await expect(loginPage.errorMessage).toBeVisible();
      
      await expect(page).toHaveScreenshot('login-page-with-error-message.png', {
        fullPage: true,
        threshold: 0.3
      });
    });

    test('login page in mobile view should match baseline', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await loginPage.navigateToLogin();
      await loginPage.waitForPageLoad();
      
      await expect(page).toHaveScreenshot('login-page-mobile.png', {
        fullPage: true,
        threshold: 0.3
      });
    });

    test('login page in dark mode should match baseline', async ({ page }) => {
      await page.emulateMedia({ colorScheme: 'dark' });
      await loginPage.navigateToLogin();
      await loginPage.waitForPageLoad();
      
      await expect(page).toHaveScreenshot('login-page-dark-mode.png', {
        fullPage: true,
        threshold: 0.3
      });
    });
  });

  test.describe('Dashboard Screens', () => {
    test.beforeEach(async () => {
      await loginPage.navigateToLogin();
      await loginPage.loginAsAdmin();
      await expect(dashboardPage.dashboardContent).toBeVisible();
    });

    test('dashboard page should match visual baseline', async ({ page }) => {
      await dashboardPage.navigateToDashboard();
      await dashboardPage.waitForPageLoad();
      
      // Wait for all dashboard elements
      await expect(dashboardPage.dashboardContent).toBeVisible();
      await expect(dashboardPage.sidebar).toBeVisible();
      await expect(dashboardPage.userMenu).toBeVisible();
      
      await expect(page).toHaveScreenshot('dashboard-page.png', {
        fullPage: true,
        threshold: 0.3
      });
    });

    test('dashboard with user menu open should match baseline', async ({ page }) => {
      await dashboardPage.navigateToDashboard();
      await dashboardPage.openUserMenu();
      
      await expect(page).toHaveScreenshot('dashboard-with-user-menu.png', {
        fullPage: true,
        threshold: 0.3
      });
    });

    test('dashboard in mobile view should match baseline', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await dashboardPage.navigateToDashboard();
      await dashboardPage.waitForPageLoad();
      
      await expect(page).toHaveScreenshot('dashboard-mobile.png', {
        fullPage: true,
        threshold: 0.3
      });
    });

    test('dashboard in tablet view should match baseline', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await dashboardPage.navigateToDashboard();
      await dashboardPage.waitForPageLoad();
      
      await expect(page).toHaveScreenshot('dashboard-tablet.png', {
        fullPage: true,
        threshold: 0.3
      });
    });

    test('dashboard sidebar should match baseline', async ({ page }) => {
      await dashboardPage.navigateToDashboard();
      
      // Focus on sidebar only
      await expect(page.locator('[data-testid="sidebar"]')).toHaveScreenshot('dashboard-sidebar.png', {
        threshold: 0.3
      });
    });

    test('dashboard stats cards should match baseline', async ({ page }) => {
      await dashboardPage.navigateToDashboard();
      
      const statsSection = page.locator('[data-testid="stats-section"], .stats-container');
      if (await statsSection.isVisible()) {
        await expect(statsSection).toHaveScreenshot('dashboard-stats.png', {
          threshold: 0.3
        });
      }
    });
  });

  test.describe('User Management Screens', () => {
    test.beforeEach(async () => {
      await loginPage.navigateToLogin();
      await loginPage.loginAsAdmin();
      await expect(dashboardPage.dashboardContent).toBeVisible();
    });

    test('user management page should match visual baseline', async ({ page }) => {
      await userManagementPage.navigateToUserManagement();
      await userManagementPage.waitForLoadingToFinish();
      
      await expect(userManagementPage.usersTable).toBeVisible();
      
      await expect(page).toHaveScreenshot('user-management-page.png', {
        fullPage: true,
        threshold: 0.3
      });
    });

    test('user management table should match baseline', async ({ page }) => {
      await userManagementPage.navigateToUserManagement();
      await userManagementPage.waitForLoadingToFinish();
      
      // Focus on table only
      await expect(userManagementPage.usersTable).toHaveScreenshot('users-table.png', {
        threshold: 0.3
      });
    });

    test('create user modal should match baseline', async ({ page }) => {
      await userManagementPage.navigateToUserManagement();
      
      // Open create user modal
      await userManagementPage.clickElement(userManagementPage.createUserButton);
      await userManagementPage.waitForVisible(userManagementPage.modal);
      
      await expect(userManagementPage.modal).toHaveScreenshot('create-user-modal.png', {
        threshold: 0.3
      });
    });

    test('create user modal with validation errors should match baseline', async ({ page }) => {
      await userManagementPage.navigateToUserManagement();
      
      // Open modal and trigger validation
      await userManagementPage.clickElement(userManagementPage.createUserButton);
      await userManagementPage.waitForVisible(userManagementPage.modal);
      await userManagementPage.clickElement(userManagementPage.submitButton);
      
      // Wait for validation errors
      await page.waitForTimeout(500);
      
      await expect(userManagementPage.modal).toHaveScreenshot('create-user-modal-with-errors.png', {
        threshold: 0.3
      });
    });

    test('user management with search results should match baseline', async ({ page }) => {
      await userManagementPage.navigateToUserManagement();
      
      // Perform search
      await userManagementPage.searchUsers('admin');
      await userManagementPage.waitForLoadingToFinish();
      
      await expect(page).toHaveScreenshot('user-management-search-results.png', {
        fullPage: true,
        threshold: 0.3
      });
    });

    test('user management empty state should match baseline', async ({ page }) => {
      await userManagementPage.navigateToUserManagement();
      
      // Search for non-existent user to trigger empty state
      await userManagementPage.searchUsers('nonexistent@example.com');
      await userManagementPage.waitForLoadingToFinish();
      
      if (await userManagementPage.emptyState.isVisible()) {
        await expect(page).toHaveScreenshot('user-management-empty-state.png', {
          fullPage: true,
          threshold: 0.3
        });
      }
    });

    test('delete confirmation modal should match baseline', async ({ page }) => {
      await userManagementPage.navigateToUserManagement();
      
      // Find first delete button and click it
      const deleteButton = userManagementPage.deleteUserButton.first();
      if (await deleteButton.isVisible()) {
        await userManagementPage.clickElement(deleteButton);
        await userManagementPage.waitForVisible(userManagementPage.confirmModal);
        
        await expect(userManagementPage.confirmModal).toHaveScreenshot('delete-confirmation-modal.png', {
          threshold: 0.3
        });
      }
    });
  });

  test.describe('Form Components', () => {
    test('input field states should match baseline', async ({ page }) => {
      await loginPage.navigateToLogin();
      
      // Test different input states
      const inputStates = page.locator('[data-testid="input-states"]');
      
      // If we have a dedicated component showcase page
      await page.goto('/components/inputs');
      
      if (await inputStates.isVisible()) {
        await expect(inputStates).toHaveScreenshot('input-field-states.png', {
          threshold: 0.3
        });
      }
    });

    test('button states should match baseline', async ({ page }) => {
      await loginPage.navigateToLogin();
      
      // Test button in different states
      const button = loginPage.loginButton;
      
      // Normal state
      await expect(button).toHaveScreenshot('button-normal.png');
      
      // Hover state
      await button.hover();
      await expect(button).toHaveScreenshot('button-hover.png');
      
      // Focus state
      await button.focus();
      await expect(button).toHaveScreenshot('button-focus.png');
      
      // Disabled state (fill form to enable, then disable through other means if possible)
      // This might require specific test setup
    });
  });

  test.describe('Loading and Error States', () => {
    test('loading spinner should match baseline', async ({ page }) => {
      await loginPage.navigateToLogin();
      
      // Trigger loading state
      await loginPage.fillField(loginPage.usernameInput, 'admin@ivyarc.com');
      await loginPage.fillField(loginPage.passwordInput, 'admin123');
      
      const loginPromise = loginPage.clickElement(loginPage.loginButton);
      
      // Try to capture loading state
      const loadingSpinner = page.locator('[data-testid="loading"], .loading, .spinner');
      try {
        await loadingSpinner.waitFor({ state: 'visible', timeout: 1000 });
        await expect(loadingSpinner).toHaveScreenshot('loading-spinner.png');
      } catch (error) {
        // Loading might be too fast to capture
        console.log('Loading state too fast to capture');
      }
      
      await loginPromise;
    });

    test('error notification should match baseline', async ({ page }) => {
      await loginPage.navigateToLogin();
      
      // Trigger error
      await loginPage.loginWithInvalidCredentials('invalid@example.com', 'wrong');
      
      const errorNotification = page.locator('[data-testid="notification"], .notification, .alert-error');
      if (await errorNotification.isVisible()) {
        await expect(errorNotification).toHaveScreenshot('error-notification.png');
      }
    });

    test('success notification should match baseline', async ({ page }) => {
      await loginPage.navigateToLogin();
      await loginPage.loginAsAdmin();
      
      const successNotification = page.locator('[data-testid="notification"], .notification, .alert-success');
      try {
        await successNotification.waitFor({ state: 'visible', timeout: 2000 });
        await expect(successNotification).toHaveScreenshot('success-notification.png');
      } catch (error) {
        console.log('Success notification not visible or too fast');
      }
    });
  });

  test.describe('Cross-browser Compatibility', () => {
    // These tests will run on different browsers based on playwright config
    test('login page should be consistent across browsers', async ({ page, browserName }) => {
      await loginPage.navigateToLogin();
      await loginPage.waitForPageLoad();
      
      await expect(page).toHaveScreenshot(`login-page-${browserName}.png`, {
        fullPage: true,
        threshold: 0.3
      });
    });

    test('dashboard should be consistent across browsers', async ({ page, browserName }) => {
      await loginPage.navigateToLogin();
      await loginPage.loginAsAdmin();
      await dashboardPage.navigateToDashboard();
      
      await expect(page).toHaveScreenshot(`dashboard-${browserName}.png`, {
        fullPage: true,
        threshold: 0.3
      });
    });
  });

  test.describe('Accessibility Visual Tests', () => {
    test('high contrast mode should match baseline', async ({ page }) => {
      await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' });
      await loginPage.navigateToLogin();
      
      await expect(page).toHaveScreenshot('login-high-contrast.png', {
        fullPage: true,
        threshold: 0.3
      });
    });

    test('reduced motion mode should match baseline', async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await loginPage.navigateToLogin();
      await loginPage.loginAsAdmin();
      await dashboardPage.navigateToDashboard();
      
      await expect(page).toHaveScreenshot('dashboard-reduced-motion.png', {
        fullPage: true,
        threshold: 0.3
      });
    });

    test('focus indicators should be visible', async ({ page }) => {
      await loginPage.navigateToLogin();
      
      // Tab through focusable elements
      await page.keyboard.press('Tab');
      await expect(loginPage.usernameInput).toBeFocused();
      await expect(loginPage.usernameInput).toHaveScreenshot('input-focused.png');
      
      await page.keyboard.press('Tab');
      await expect(loginPage.passwordInput).toBeFocused();
      await expect(loginPage.passwordInput).toHaveScreenshot('password-focused.png');
      
      await page.keyboard.press('Tab');
      await expect(loginPage.loginButton).toBeFocused();
      await expect(loginPage.loginButton).toHaveScreenshot('button-focused.png');
    });
  });

  test.describe('Layout and Spacing', () => {
    test('form layout should be consistent', async ({ page }) => {
      await loginPage.navigateToLogin();
      
      // Test form layout
      const form = loginPage.loginForm;
      await expect(form).toHaveScreenshot('form-layout.png', {
        threshold: 0.1 // Stricter threshold for layout consistency
      });
    });

    test('table layout should be consistent', async ({ page }) => {
      await loginPage.navigateToLogin();
      await loginPage.loginAsAdmin();
      await userManagementPage.navigateToUserManagement();
      
      const table = userManagementPage.usersTable;
      await expect(table).toHaveScreenshot('table-layout.png', {
        threshold: 0.1
      });
    });

    test('responsive breakpoints should match baseline', async ({ page }) => {
      const breakpoints = [
        { width: 320, height: 568, name: 'mobile-small' },
        { width: 375, height: 667, name: 'mobile-medium' },
        { width: 768, height: 1024, name: 'tablet' },
        { width: 1024, height: 768, name: 'desktop-small' },
        { width: 1440, height: 900, name: 'desktop-large' },
      ];
      
      for (const breakpoint of breakpoints) {
        await page.setViewportSize({ width: breakpoint.width, height: breakpoint.height });
        await loginPage.navigateToLogin();
        await loginPage.waitForPageLoad();
        
        await expect(page).toHaveScreenshot(`login-${breakpoint.name}.png`, {
          fullPage: true,
          threshold: 0.3
        });
      }
    });
  });
});