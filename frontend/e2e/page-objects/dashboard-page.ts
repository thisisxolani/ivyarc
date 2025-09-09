import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base-page';

/**
 * Dashboard Page Object Model
 * Handles all dashboard-related interactions and validations
 */
export class DashboardPage extends BasePage {
  // Page elements
  readonly pageTitle: Locator;
  readonly userProfile: Locator;
  readonly logoutButton: Locator;
  readonly navigationMenu: Locator;
  readonly mainContent: Locator;
  readonly statsCards: Locator;
  readonly userStatsCard: Locator;
  readonly roleStatsCard: Locator;
  readonly auditStatsCard: Locator;
  readonly recentActivitiesSection: Locator;
  readonly quickActionsSection: Locator;
  readonly searchBox: Locator;
  readonly notificationBell: Locator;
  readonly themeToggle: Locator;
  readonly sidebar: Locator;
  readonly mobileMenuToggle: Locator;

  constructor(page: Page) {
    super(page);
    
    // Initialize page elements
    this.pageTitle = page.locator('[data-testid="page-title"], .page-title, h1');
    this.userProfile = page.locator('[data-testid="user-profile"], .user-profile, .profile-dropdown');
    this.logoutButton = page.locator('[data-testid="logout-button"], .logout-btn, a[href*="logout"]');
    this.navigationMenu = page.locator('[data-testid="navigation-menu"], .nav-menu, .sidebar-menu');
    this.mainContent = page.locator('[data-testid="main-content"], .main-content, main');
    this.statsCards = page.locator('[data-testid="stats-card"], .stat-card, .stats-card');
    this.userStatsCard = page.locator('[data-testid="user-stats"], .user-stats');
    this.roleStatsCard = page.locator('[data-testid="role-stats"], .role-stats');
    this.auditStatsCard = page.locator('[data-testid="audit-stats"], .audit-stats');
    this.recentActivitiesSection = page.locator('[data-testid="recent-activities"], .recent-activities');
    this.quickActionsSection = page.locator('[data-testid="quick-actions"], .quick-actions');
    this.searchBox = page.locator('[data-testid="search-box"], .search-input, input[type="search"]');
    this.notificationBell = page.locator('[data-testid="notifications"], .notification-bell, .notifications');
    this.themeToggle = page.locator('[data-testid="theme-toggle"], .theme-toggle, .dark-mode-toggle');
    this.sidebar = page.locator('[data-testid="sidebar"], .sidebar, .side-navigation');
    this.mobileMenuToggle = page.locator('[data-testid="mobile-menu"], .mobile-menu-toggle, .hamburger');
  }

  /**
   * Navigate to dashboard
   */
  async navigateToDashboard(): Promise<void> {
    await this.goto('/dashboard');
    await this.waitForPageLoad();
    await this.verifyDashboardLoaded();
  }

  /**
   * Verify dashboard has loaded correctly
   */
  async verifyDashboardLoaded(): Promise<void> {
    await this.waitForVisible(this.mainContent);
    await this.waitForVisible(this.navigationMenu);
    
    // Check page title
    const title = await this.getTitle();
    expect(title).toContain('Dashboard');
    
    // Verify user is authenticated
    expect(await this.isVisible(this.userProfile)).toBe(true);
  }

  /**
   * Get welcome message or user name from dashboard
   */
  async getWelcomeMessage(): Promise<string> {
    const welcomeElement = this.page.locator('[data-testid="welcome-message"], .welcome, .greeting');
    if (await welcomeElement.isVisible()) {
      return await this.getTextContent(welcomeElement);
    }
    return '';
  }

  /**
   * Get stats card values
   */
  async getStatsCardData(): Promise<Record<string, any>> {
    const stats: Record<string, any> = {};
    
    // Get user stats
    if (await this.userStatsCard.isVisible()) {
      const userCount = await this.getTextContent(this.userStatsCard.locator('.count, .number, .stat-value'));
      const userLabel = await this.getTextContent(this.userStatsCard.locator('.label, .title, .stat-label'));
      stats.users = { count: userCount, label: userLabel };
    }
    
    // Get role stats
    if (await this.roleStatsCard.isVisible()) {
      const roleCount = await this.getTextContent(this.roleStatsCard.locator('.count, .number, .stat-value'));
      const roleLabel = await this.getTextContent(this.roleStatsCard.locator('.label, .title, .stat-label'));
      stats.roles = { count: roleCount, label: roleLabel };
    }
    
    // Get audit stats
    if (await this.auditStatsCard.isVisible()) {
      const auditCount = await this.getTextContent(this.auditStatsCard.locator('.count, .number, .stat-value'));
      const auditLabel = await this.getTextContent(this.auditStatsCard.locator('.label, .title, .stat-label'));
      stats.audits = { count: auditCount, label: auditLabel };
    }
    
    return stats;
  }

  /**
   * Verify stats cards are displaying data
   */
  async verifyStatsCards(): Promise<void> {
    const statsCount = await this.statsCards.count();
    expect(statsCount).toBeGreaterThan(0);
    
    const stats = await this.getStatsCardData();
    
    // Verify each stat card has meaningful data
    for (const [key, statData] of Object.entries(stats)) {
      expect(statData.count).toBeTruthy();
      expect(statData.label).toBeTruthy();
      console.log(`${key}: ${statData.count} ${statData.label}`);
    }
  }

  /**
   * Click on navigation menu item
   */
  async clickNavigationItem(itemName: string): Promise<void> {
    const menuItem = this.page.locator(`[data-testid="nav-${itemName.toLowerCase()}"], .nav-item:has-text("${itemName}")`);
    await this.clickElement(menuItem);
    await this.waitForPageLoad();
  }

  /**
   * Open user profile dropdown
   */
  async openUserProfile(): Promise<void> {
    await this.clickElement(this.userProfile);
    await this.page.waitForTimeout(500); // Allow dropdown to open
    
    const dropdown = this.page.locator('[data-testid="profile-dropdown"], .profile-dropdown, .user-menu');
    await this.waitForVisible(dropdown);
  }

  /**
   * Logout from dashboard
   */
  async logout(): Promise<void> {
    // Try direct logout button first
    if (await this.logoutButton.isVisible()) {
      await this.clickElement(this.logoutButton);
    } else {
      // Try via user profile dropdown
      await this.openUserProfile();
      const logoutInDropdown = this.page.locator('[data-testid="logout"], a:has-text("Logout"), a:has-text("Sign out")');
      await this.clickElement(logoutInDropdown);
    }
    
    // Wait for redirect to login page
    await this.page.waitForURL('**/login');
  }

  /**
   * Search using the search box
   */
  async performSearch(query: string): Promise<void> {
    if (await this.searchBox.isVisible()) {
      await this.fillField(this.searchBox, query);
      await this.pressKeys('Enter');
      await this.waitForLoadingToFinish();
    }
  }

  /**
   * Get search results
   */
  async getSearchResults(): Promise<string[]> {
    const resultsContainer = this.page.locator('[data-testid="search-results"], .search-results');
    
    if (await resultsContainer.isVisible()) {
      const resultItems = await resultsContainer.locator('.result-item, .search-result').all();
      const results: string[] = [];
      
      for (const item of resultItems) {
        const text = await this.getTextContent(item);
        if (text) results.push(text);
      }
      
      return results;
    }
    
    return [];
  }

  /**
   * Check notifications
   */
  async checkNotifications(): Promise<void> {
    if (await this.notificationBell.isVisible()) {
      await this.clickElement(this.notificationBell);
      await this.page.waitForTimeout(500);
      
      const notificationPanel = this.page.locator('[data-testid="notification-panel"], .notification-panel');
      if (await notificationPanel.isVisible()) {
        console.log('Notification panel opened');
      }
    }
  }

  /**
   * Get notification count
   */
  async getNotificationCount(): Promise<number> {
    const notificationBadge = this.page.locator('[data-testid="notification-count"], .notification-count, .badge');
    
    if (await notificationBadge.isVisible()) {
      const countText = await this.getTextContent(notificationBadge);
      return parseInt(countText) || 0;
    }
    
    return 0;
  }

  /**
   * Toggle theme (dark/light mode)
   */
  async toggleTheme(): Promise<void> {
    if (await this.themeToggle.isVisible()) {
      await this.clickElement(this.themeToggle);
      await this.page.waitForTimeout(1000); // Allow theme to change
    }
  }

  /**
   * Verify theme has changed
   */
  async verifyThemeChange(expectedTheme: 'light' | 'dark'): Promise<void> {
    const bodyElement = this.page.locator('body');
    const hasThemeClass = await this.hasClass(bodyElement, expectedTheme === 'dark' ? 'dark' : 'light');
    expect(hasThemeClass).toBe(true);
  }

  /**
   * Toggle mobile menu
   */
  async toggleMobileMenu(): Promise<void> {
    if (await this.mobileMenuToggle.isVisible()) {
      await this.clickElement(this.mobileMenuToggle);
      await this.page.waitForTimeout(500);
    }
  }

  /**
   * Verify mobile menu visibility
   */
  async verifyMobileMenuVisibility(shouldBeVisible: boolean): Promise<void> {
    await this.page.setViewportSize({ width: 375, height: 667 });
    await this.page.waitForTimeout(1000);
    
    const mobileMenuVisible = await this.isVisible(this.mobileMenuToggle);
    expect(mobileMenuVisible).toBe(true);
    
    if (shouldBeVisible) {
      await this.toggleMobileMenu();
      const menuVisible = await this.isVisible(this.navigationMenu);
      expect(menuVisible).toBe(true);
    }
    
    // Reset viewport
    await this.page.setViewportSize({ width: 1280, height: 720 });
  }

  /**
   * Get recent activities
   */
  async getRecentActivities(): Promise<string[]> {
    if (await this.recentActivitiesSection.isVisible()) {
      const activities = await this.recentActivitiesSection.locator('.activity-item, .activity').all();
      const activityList: string[] = [];
      
      for (const activity of activities) {
        const text = await this.getTextContent(activity);
        if (text) activityList.push(text);
      }
      
      return activityList;
    }
    
    return [];
  }

  /**
   * Click quick action button
   */
  async clickQuickAction(actionName: string): Promise<void> {
    if (await this.quickActionsSection.isVisible()) {
      const actionButton = this.page.locator(`[data-testid="quick-${actionName.toLowerCase()}"], .quick-action:has-text("${actionName}")`);
      await this.clickElement(actionButton);
      await this.waitForPageLoad();
    }
  }

  /**
   * Verify dashboard accessibility
   */
  async verifyAccessibility(): Promise<void> {
    await this.checkAccessibility();
    
    // Check navigation landmarks
    const navigation = await this.page.locator('nav, [role="navigation"]').count();
    expect(navigation).toBeGreaterThan(0);
    
    // Check main content landmark
    const main = await this.page.locator('main, [role="main"]').count();
    expect(main).toBeGreaterThan(0);
    
    // Check heading structure
    const h1Count = await this.page.locator('h1').count();
    expect(h1Count).toBe(1); // Should have exactly one h1
  }

  /**
   * Test dashboard responsiveness
   */
  async testResponsiveDesign(): Promise<void> {
    await this.checkResponsiveDesign();
    
    // Test specific dashboard elements on mobile
    await this.page.setViewportSize({ width: 375, height: 667 });
    await this.page.waitForTimeout(1000);
    
    // Stats cards should be visible and stacked on mobile
    const statsVisible = await this.isVisible(this.statsCards.first());
    expect(statsVisible).toBe(true);
    
    // Mobile menu should be visible
    const mobileMenuVisible = await this.isVisible(this.mobileMenuToggle);
    expect(mobileMenuVisible).toBe(true);
    
    // Reset viewport
    await this.page.setViewportSize({ width: 1280, height: 720 });
  }

  /**
   * Test keyboard navigation
   */
  async testKeyboardNavigation(): Promise<void> {
    await this.testKeyboardNavigation();
    
    // Test specific dashboard navigation
    const focusableElements = await this.page.locator(
      'button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ).all();
    
    expect(focusableElements.length).toBeGreaterThan(0);
    
    // Test skip links
    const skipLink = this.page.locator('a[href="#main"], .skip-link');
    if (await skipLink.isVisible()) {
      await skipLink.focus();
      await this.pressKeys('Enter');
    }
  }

  /**
   * Verify dashboard performance
   */
  async verifyPerformance(): Promise<any> {
    const metrics = await this.measurePerformance();
    
    // Dashboard should load reasonably fast
    expect(metrics.domContentLoaded).toBeLessThan(4000); // 4 seconds
    expect(metrics.loadComplete).toBeLessThan(8000); // 8 seconds
    
    return metrics;
  }

  /**
   * Test dashboard functionality end-to-end
   */
  async testDashboardFunctionality(): Promise<void> {
    // Verify all major sections are present
    await this.verifyStatsCards();
    
    // Test navigation
    const navItems = ['Users', 'Roles', 'Audit'];
    for (const item of navItems) {
      const navElement = this.page.locator(`[data-testid="nav-${item.toLowerCase()}"], .nav-item:has-text("${item}")`);
      if (await navElement.isVisible()) {
        console.log(`Navigation item "${item}" is available`);
      }
    }
    
    // Test search functionality if available
    if (await this.searchBox.isVisible()) {
      await this.performSearch('test');
      await this.page.waitForTimeout(2000);
      console.log('Search functionality tested');
    }
    
    // Test theme toggle if available
    if (await this.themeToggle.isVisible()) {
      await this.toggleTheme();
      await this.page.waitForTimeout(1000);
      console.log('Theme toggle tested');
    }
    
    // Test notifications if available
    const notificationCount = await this.getNotificationCount();
    console.log(`Notification count: ${notificationCount}`);
    
    // Get recent activities
    const activities = await this.getRecentActivities();
    console.log(`Found ${activities.length} recent activities`);
  }

  /**
   * Verify user permissions and role-based access
   */
  async verifyUserPermissions(expectedRole: string): Promise<void> {
    // Check if certain elements are visible based on user role
    const adminOnlyElements = this.page.locator('[data-testid*="admin"], .admin-only');
    const managerOnlyElements = this.page.locator('[data-testid*="manager"], .manager-only');
    
    const adminElementsCount = await adminOnlyElements.count();
    const managerElementsCount = await managerOnlyElements.count();
    
    if (expectedRole === 'ADMIN') {
      // Admin should see all elements
      console.log(`Admin user - Found ${adminElementsCount} admin-only elements`);
    } else if (expectedRole === 'MANAGER') {
      // Manager should see manager elements but not admin-only
      console.log(`Manager user - Found ${managerElementsCount} manager-only elements`);
    } else {
      // Regular user should not see admin or manager elements
      expect(adminElementsCount).toBe(0);
      expect(managerElementsCount).toBe(0);
    }
  }

  /**
   * Test dashboard data refresh
   */
  async testDataRefresh(): Promise<void> {
    // Get initial stats
    const initialStats = await this.getStatsCardData();
    
    // Look for refresh button
    const refreshButton = this.page.locator('[data-testid="refresh"], .refresh-btn, button:has-text("Refresh")');
    
    if (await refreshButton.isVisible()) {
      await this.clickElement(refreshButton);
      await this.waitForLoadingToFinish();
      
      // Verify data refreshed (could be same values)
      const refreshedStats = await this.getStatsCardData();
      console.log('Data refresh completed');
      console.log('Initial:', initialStats);
      console.log('Refreshed:', refreshedStats);
    }
  }
}