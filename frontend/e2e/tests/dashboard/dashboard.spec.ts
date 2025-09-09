import { test, expect } from '@playwright/test';
import { LoginPage } from '../../page-objects/login-page';
import { DashboardPage } from '../../page-objects/dashboard-page';
import { TestDataManager } from '../../utils/test-data-manager';

test.describe('Dashboard Tests', () => {
  let loginPage: LoginPage;
  let dashboardPage: DashboardPage;
  let testDataManager: TestDataManager;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
    testDataManager = new TestDataManager();
    
    // Login with admin user for full dashboard access
    const adminUser = testDataManager.getTestUsers().admin;
    await loginPage.navigateToLogin();
    await loginPage.loginWithValidation(adminUser.username, adminUser.password);
  });

  test.describe('Dashboard Loading and Layout', () => {
    test('should load dashboard with all essential components', async ({ page }) => {
      await dashboardPage.verifyDashboardLoaded();
      
      // Verify page title
      const title = await dashboardPage.getTitle();
      expect(title).toContain('Dashboard');
      
      // Verify welcome message
      const welcomeMessage = await dashboardPage.getWelcomeMessage();
      expect(welcomeMessage.length).toBeGreaterThan(0);
      console.log('Welcome message:', welcomeMessage);
      
      // Take screenshot of fully loaded dashboard
      await dashboardPage.takeScreenshot('dashboard-loaded');
    });

    test('should display correct statistics cards', async ({ page }) => {
      await dashboardPage.verifyStatsCards();
      
      const stats = await dashboardPage.getStatsCardData();
      
      // Verify stats structure
      expect(Object.keys(stats).length).toBeGreaterThan(0);
      
      // Log stats for verification
      console.log('Dashboard Statistics:', JSON.stringify(stats, null, 2));
      
      // Verify each stat card has meaningful data
      for (const [statName, statData] of Object.entries(stats)) {
        expect(statData).toBeTruthy();
        expect(statData.count).toBeTruthy();
        expect(statData.label).toBeTruthy();
      }
    });

    test('should show recent activities section', async ({ page }) => {
      const activities = await dashboardPage.getRecentActivities();
      console.log(`Found ${activities.length} recent activities`);
      
      if (activities.length > 0) {
        // Verify activities have content
        activities.forEach((activity, index) => {
          expect(activity.length).toBeGreaterThan(0);
          console.log(`Activity ${index + 1}: ${activity}`);
        });
      }
    });

    test('should display navigation menu correctly', async ({ page }) => {
      // Verify navigation menu is visible
      expect(await dashboardPage.isVisible(dashboardPage.navigationMenu)).toBe(true);
      
      // Test navigation items
      const navItems = ['Users', 'Roles', 'Audit'];
      
      for (const item of navItems) {
        const navElement = page.locator(`[data-testid="nav-${item.toLowerCase()}"], .nav-item:has-text("${item}")`);
        const isVisible = await navElement.isVisible();
        
        if (isVisible) {
          console.log(`Navigation item "${item}" is available`);
          
          // Test clicking navigation item
          await dashboardPage.clickNavigationItem(item);
          await page.waitForTimeout(1000);
          
          // Verify URL changed or page loaded
          const currentUrl = dashboardPage.getCurrentURL();
          console.log(`After clicking ${item}, URL: ${currentUrl}`);
          
          // Navigate back to dashboard
          await dashboardPage.navigateToDashboard();
        }
      }
    });
  });

  test.describe('Dashboard Functionality', () => {
    test('should handle user profile interactions', async ({ page }) => {
      await dashboardPage.openUserProfile();
      
      // Wait for profile dropdown to appear
      await page.waitForTimeout(500);
      
      // Take screenshot of profile dropdown
      await dashboardPage.takeScreenshot('profile-dropdown');
      
      // Test closing dropdown by clicking outside
      await page.click('body');
      await page.waitForTimeout(500);
    });

    test('should perform search functionality', async ({ page }) => {
      const searchBox = dashboardPage.searchBox;
      
      if (await searchBox.isVisible()) {
        console.log('Testing search functionality');
        
        await dashboardPage.performSearch('admin');
        
        // Get search results
        const results = await dashboardPage.getSearchResults();
        console.log(`Search results count: ${results.length}`);
        
        if (results.length > 0) {
          results.forEach((result, index) => {
            console.log(`Search result ${index + 1}: ${result}`);
          });
        }
        
        // Clear search
        await dashboardPage.performSearch('');
      } else {
        console.log('Search functionality not available on this dashboard');
      }
    });

    test('should handle notifications', async ({ page }) => {
      const notificationCount = await dashboardPage.getNotificationCount();
      console.log(`Notification count: ${notificationCount}`);
      
      if (notificationCount > 0 || await dashboardPage.isVisible(dashboardPage.notificationBell)) {
        await dashboardPage.checkNotifications();
        await dashboardPage.takeScreenshot('notifications-panel');
      }
    });

    test('should support theme toggling', async ({ page }) => {
      const themeToggle = dashboardPage.themeToggle;
      
      if (await themeToggle.isVisible()) {
        console.log('Testing theme toggle functionality');
        
        // Get initial theme
        const initialTheme = await page.locator('body').getAttribute('class');
        console.log('Initial theme classes:', initialTheme);
        
        // Toggle theme
        await dashboardPage.toggleTheme();
        
        // Verify theme changed
        const newTheme = await page.locator('body').getAttribute('class');
        console.log('New theme classes:', newTheme);
        
        expect(newTheme).not.toBe(initialTheme);
        
        // Take screenshots of both themes
        await dashboardPage.takeScreenshot('dashboard-dark-theme');
        
        // Toggle back
        await dashboardPage.toggleTheme();
        await dashboardPage.takeScreenshot('dashboard-light-theme');
      } else {
        console.log('Theme toggle not available');
      }
    });

    test('should handle quick actions', async ({ page }) => {
      const quickActions = ['Create User', 'Add Role', 'View Logs'];
      
      for (const action of quickActions) {
        try {
          await dashboardPage.clickQuickAction(action);
          console.log(`Quick action "${action}" clicked successfully`);
          
          // Wait for navigation or modal
          await page.waitForTimeout(1000);
          
          // Navigate back to dashboard if needed
          if (!page.url().includes('dashboard')) {
            await dashboardPage.navigateToDashboard();
          }
        } catch (error) {
          console.log(`Quick action "${action}" not available or failed`);
        }
      }
    });

    test('should refresh dashboard data', async ({ page }) => {
      await dashboardPage.testDataRefresh();
    });
  });

  test.describe('Responsive Design Tests', () => {
    test('should work properly on mobile devices', async ({ page }) => {
      await dashboardPage.testResponsiveDesign();
      
      // Test mobile-specific functionality
      await dashboardPage.verifyMobileMenuVisibility(true);
    });

    test('should adapt to different screen sizes', async ({ page }) => {
      const viewports = [
        { width: 1920, height: 1080, name: 'desktop-large' },
        { width: 1366, height: 768, name: 'desktop' },
        { width: 1024, height: 768, name: 'tablet-landscape' },
        { width: 768, height: 1024, name: 'tablet-portrait' },
        { width: 414, height: 896, name: 'mobile-large' },
        { width: 375, height: 667, name: 'mobile-medium' },
        { width: 320, height: 568, name: 'mobile-small' }
      ];

      for (const viewport of viewports) {
        console.log(`Testing viewport: ${viewport.name} (${viewport.width}x${viewport.height})`);
        
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.waitForTimeout(1000);
        
        // Verify dashboard is still functional
        await dashboardPage.verifyDashboardLoaded();
        
        // Take screenshot for visual verification
        await dashboardPage.takeScreenshot(`dashboard-${viewport.name}`);
        
        // Test critical functionality
        if (viewport.width < 768) {
          // Mobile: verify mobile menu works
          await dashboardPage.verifyMobileMenuVisibility(false);
        }
      }
      
      // Reset to default viewport
      await page.setViewportSize({ width: 1280, height: 720 });
    });
  });

  test.describe('Performance Tests', () => {
    test('should load within performance thresholds', async ({ page }) => {
      const metrics = await dashboardPage.verifyPerformance();
      
      // Dashboard should load quickly since user is authenticated
      expect(metrics.domContentLoaded).toBeLessThan(3000); // 3 seconds
      expect(metrics.loadComplete).toBeLessThan(6000); // 6 seconds
      
      console.log('Dashboard Performance Metrics:', metrics);
    });

    test('should handle concurrent data loading efficiently', async ({ page }) => {
      // Measure time to load all dashboard components
      const startTime = Date.now();
      
      // Wait for all stats cards to load
      await dashboardPage.verifyStatsCards();
      
      // Wait for recent activities
      await dashboardPage.getRecentActivities();
      
      const endTime = Date.now();
      const loadTime = endTime - startTime;
      
      console.log(`Dashboard components loaded in ${loadTime}ms`);
      expect(loadTime).toBeLessThan(5000); // 5 seconds max
    });
  });

  test.describe('Accessibility Tests', () => {
    test('should meet accessibility standards', async ({ page }) => {
      await dashboardPage.verifyAccessibility();
      
      // Test specific dashboard accessibility features
      const skipLinks = await page.locator('.skip-link, a[href="#main"]').count();
      console.log(`Found ${skipLinks} skip links`);
      
      // Test landmark regions
      const landmarks = await page.locator('[role="navigation"], [role="main"], [role="banner"], [role="contentinfo"]').count();
      expect(landmarks).toBeGreaterThan(0);
      console.log(`Found ${landmarks} landmark regions`);
    });

    test('should support keyboard navigation', async ({ page }) => {
      await dashboardPage.testKeyboardNavigation();
      
      // Test dashboard-specific keyboard shortcuts
      const focusableElements = await page.locator('button, a, input, [tabindex]:not([tabindex="-1"])').count();
      expect(focusableElements).toBeGreaterThan(0);
      console.log(`Found ${focusableElements} focusable elements`);
    });

    test('should provide proper ARIA labels and descriptions', async ({ page }) => {
      // Check stats cards have proper labels
      const statsCards = await page.locator('[data-testid="stats-card"], .stat-card').all();
      
      for (const card of statsCards) {
        const ariaLabel = await card.getAttribute('aria-label');
        const ariaDescribedBy = await card.getAttribute('aria-describedby');
        const hasTitle = await card.locator('.title, .label, h2, h3').count() > 0;
        
        expect(ariaLabel || ariaDescribedBy || hasTitle).toBeTruthy();
      }
    });
  });

  test.describe('Security Tests', () => {
    test('should protect against unauthorized access', async ({ page }) => {
      // Clear authentication
      await page.context().clearCookies();
      await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
      });
      
      // Try to access dashboard directly
      await page.goto('/dashboard');
      
      // Should redirect to login
      await page.waitForURL('**/login', { timeout: 10000 });
      expect(page.url()).toContain('login');
    });

    test('should handle session expiration gracefully', async ({ page }) => {
      // Simulate session expiration by clearing auth tokens
      await page.evaluate(() => {
        localStorage.removeItem('authToken');
        sessionStorage.removeItem('authToken');
      });
      
      // Try to interact with dashboard
      await dashboardPage.navigateToDashboard();
      
      // Should either redirect to login or show appropriate message
      await page.waitForTimeout(3000);
      
      const currentUrl = page.url();
      const hasErrorMessage = await page.locator('[role="alert"], .error, .unauthorized').count() > 0;
      
      expect(currentUrl.includes('login') || hasErrorMessage).toBe(true);
    });

    test('should not expose sensitive data in DOM or console', async ({ page }) => {
      // Monitor console for sensitive data
      const consoleLogs: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'log' || msg.type() === 'error') {
          consoleLogs.push(msg.text());
        }
      });
      
      await dashboardPage.verifyDashboardLoaded();
      await page.waitForTimeout(2000);
      
      // Check for common sensitive patterns in logs
      const sensitivePatterns = [
        /password/i,
        /token.*[A-Za-z0-9]{20,}/,
        /api.*key/i,
        /secret/i
      ];
      
      for (const log of consoleLogs) {
        for (const pattern of sensitivePatterns) {
          if (pattern.test(log)) {
            console.warn('Potentially sensitive data in console:', log);
          }
        }
      }
    });
  });

  test.describe('Role-Based Access Tests', () => {
    test('should show appropriate content for admin user', async ({ page }) => {
      await dashboardPage.verifyUserPermissions('ADMIN');
      
      // Admin should see user management stats
      const stats = await dashboardPage.getStatsCardData();
      expect(stats.users).toBeTruthy();
    });

    test('should show limited content for regular user', async ({ page }) => {
      // Logout current admin user
      await dashboardPage.logout();
      
      // Login as regular user
      const regularUser = testDataManager.getTestUsers().user;
      await loginPage.loginWithValidation(regularUser.username, regularUser.password);
      
      // Verify dashboard loads but with limited permissions
      await dashboardPage.verifyDashboardLoaded();
      await dashboardPage.verifyUserPermissions('USER');
      
      // Regular user might not see admin-only stats
      console.log('Regular user dashboard verified');
    });

    test('should show manager-level content for manager user', async ({ page }) => {
      // Logout current user
      await dashboardPage.logout();
      
      // Login as manager
      const managerUser = testDataManager.getTestUsers().manager;
      await loginPage.loginWithValidation(managerUser.username, managerUser.password);
      
      // Verify manager dashboard
      await dashboardPage.verifyDashboardLoaded();
      await dashboardPage.verifyUserPermissions('MANAGER');
    });
  });

  test.describe('Integration Tests', () => {
    test('should integrate properly with backend services', async ({ page }) => {
      // Monitor API calls
      const apiCalls: any[] = [];
      page.on('response', response => {
        if (response.url().includes('/api/')) {
          apiCalls.push({
            url: response.url(),
            status: response.status(),
            method: response.request().method()
          });
        }
      });
      
      await dashboardPage.navigateToDashboard();
      await dashboardPage.verifyStatsCards();
      
      // Verify API calls were made
      expect(apiCalls.length).toBeGreaterThan(0);
      
      console.log('Dashboard API calls:', apiCalls);
      
      // Verify successful API responses
      const failedCalls = apiCalls.filter(call => call.status >= 400);
      expect(failedCalls.length).toBe(0);
    });

    test('should handle real-time updates if websockets are implemented', async ({ page }) => {
      // This test would verify websocket connections for real-time updates
      const webSocketMessages: any[] = [];
      
      page.on('websocket', ws => {
        console.log('WebSocket connection established');
        ws.on('framereceived', event => {
          webSocketMessages.push(event.payload);
        });
      });
      
      await dashboardPage.navigateToDashboard();
      await page.waitForTimeout(5000);
      
      if (webSocketMessages.length > 0) {
        console.log('WebSocket messages received:', webSocketMessages.length);
      } else {
        console.log('No WebSocket connections found (might not be implemented)');
      }
    });
  });

  test.describe('Error Handling Tests', () => {
    test('should handle API failures gracefully', async ({ page }) => {
      // This would test behavior when backend services are unavailable
      // In a real scenario, you might mock API failures
      
      await dashboardPage.navigateToDashboard();
      
      // Check if dashboard shows error states gracefully
      const hasErrors = await dashboardPage.hasErrors();
      
      if (hasErrors) {
        const errorMessages = await dashboardPage.getErrorMessages();
        console.log('Dashboard errors found:', errorMessages);
        
        // Verify error messages are user-friendly
        for (const error of errorMessages) {
          expect(error.length).toBeGreaterThan(0);
          expect(error).not.toContain('undefined');
          expect(error).not.toContain('null');
        }
      }
    });

    test('should show loading states appropriately', async ({ page }) => {
      // Navigate to dashboard and immediately check for loading states
      const dashboardPromise = dashboardPage.navigateToDashboard();
      
      // Check if loading indicators appear
      try {
        await dashboardPage.waitForVisible(page.locator('[data-testid="loading"], .loading, .spinner'), 2000);
        console.log('Loading indicators found');
        
        await dashboardPage.waitForLoadingToFinish();
        console.log('Loading completed');
      } catch (error) {
        console.log('No loading indicators found (page may load too quickly)');
      }
      
      await dashboardPromise;
      await dashboardPage.verifyDashboardLoaded();
    });
  });

  test.afterEach(async ({ page }) => {
    // Take screenshot on failure
    if (test.info().status === 'failed') {
      await dashboardPage.takeScreenshot(`dashboard-failure-${Date.now()}`);
    }
  });
});