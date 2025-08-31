import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '../base-page';

/**
 * Page Object for Dashboard functionality
 * Handles main dashboard navigation and user interactions
 */
export class DashboardPage extends BasePage {
  // Navigation elements
  readonly sidebar: Locator;
  readonly userMenu: Locator;
  readonly logoutButton: Locator;
  readonly profileButton: Locator;
  readonly settingsButton: Locator;
  readonly navigationMenu: Locator;

  // Dashboard sections
  readonly welcomeMessage: Locator;
  readonly userInfo: Locator;
  readonly dashboardContent: Locator;
  readonly statsCards: Locator;
  readonly quickActions: Locator;

  // User management links (if accessible)
  readonly usersLink: Locator;
  readonly rolesLink: Locator;
  readonly auditLink: Locator;

  constructor(page: Page) {
    super(page);
    
    // Navigation elements
    this.sidebar = page.locator('[data-testid="sidebar"], .sidebar, nav');
    this.userMenu = page.locator('[data-testid="user-menu"], .user-menu');
    this.logoutButton = page.locator('[data-testid="logout-button"], button:has-text("Logout"), button:has-text("Sign Out")');
    this.profileButton = page.locator('[data-testid="profile-button"], button:has-text("Profile"), a:has-text("Profile")');
    this.settingsButton = page.locator('[data-testid="settings-button"], button:has-text("Settings"), a:has-text("Settings")');
    this.navigationMenu = page.locator('[data-testid="navigation-menu"], .nav-menu');

    // Dashboard content
    this.welcomeMessage = page.locator('[data-testid="welcome-message"], .welcome');
    this.userInfo = page.locator('[data-testid="user-info"], .user-info');
    this.dashboardContent = page.locator('[data-testid="dashboard-content"], .dashboard-content, main');
    this.statsCards = page.locator('[data-testid="stats-card"], .stats-card, .metric-card');
    this.quickActions = page.locator('[data-testid="quick-actions"], .quick-actions');

    // Management links
    this.usersLink = page.locator('[data-testid="users-link"], a[href*="/users"], a:has-text("Users")');
    this.rolesLink = page.locator('[data-testid="roles-link"], a[href*="/roles"], a:has-text("Roles")');
    this.auditLink = page.locator('[data-testid="audit-link"], a[href*="/audit"], a:has-text("Audit")');
  }

  /**
   * Navigate to dashboard
   */
  async navigateToDashboard() {
    await this.goto('/dashboard');
    await this.waitForPageLoad();
    await expect(this.dashboardContent).toBeVisible();
  }

  /**
   * Check if user is on dashboard
   */
  async isOnDashboard(): Promise<boolean> {
    return this.page.url().includes('/dashboard') && await this.dashboardContent.isVisible();
  }

  /**
   * Get welcome message text
   */
  async getWelcomeMessage(): Promise<string> {
    if (await this.welcomeMessage.isVisible()) {
      return await this.welcomeMessage.textContent() || '';
    }
    return '';
  }

  /**
   * Get current user information displayed
   */
  async getUserInfo(): Promise<{ name?: string; email?: string; role?: string }> {
    const info: { name?: string; email?: string; role?: string } = {};
    
    if (await this.userInfo.isVisible()) {
      const infoText = await this.userInfo.textContent() || '';
      
      // Extract information based on common patterns
      const nameMatch = infoText.match(/Name:\s*([^,\n]+)/i);
      const emailMatch = infoText.match(/Email:\s*([^,\n]+)/i);
      const roleMatch = infoText.match(/Role:\s*([^,\n]+)/i);
      
      if (nameMatch) info.name = nameMatch[1].trim();
      if (emailMatch) info.email = emailMatch[1].trim();
      if (roleMatch) info.role = roleMatch[1].trim();
    }
    
    return info;
  }

  /**
   * Open user menu
   */
  async openUserMenu() {
    await this.clickElement(this.userMenu);
    await this.waitForVisible('[data-testid="user-menu-dropdown"], .dropdown-menu');
  }

  /**
   * Logout from dashboard
   */
  async logout() {
    // Try to find and click logout button directly, or through user menu
    if (await this.logoutButton.isVisible()) {
      await this.clickElement(this.logoutButton);
    } else {
      await this.openUserMenu();
      await this.clickElement(this.logoutButton);
    }
    
    // Wait for redirect to login page
    await this.page.waitForURL('**/auth/login', { timeout: 10000 });
    await expect(this.page.locator('form, [data-testid="login-form"]')).toBeVisible();
  }

  /**
   * Navigate to user management section
   */
  async navigateToUsers() {
    await this.clickElement(this.usersLink);
    await this.page.waitForURL('**/users', { timeout: 5000 });
    await this.waitForPageLoad();
  }

  /**
   * Navigate to roles management section
   */
  async navigateToRoles() {
    await this.clickElement(this.rolesLink);
    await this.page.waitForURL('**/roles', { timeout: 5000 });
    await this.waitForPageLoad();
  }

  /**
   * Navigate to audit logs section
   */
  async navigateToAudit() {
    await this.clickElement(this.auditLink);
    await this.page.waitForURL('**/audit', { timeout: 5000 });
    await this.waitForPageLoad();
  }

  /**
   * Check which navigation links are visible (based on user permissions)
   */
  async getVisibleNavigationLinks(): Promise<string[]> {
    const links: string[] = [];
    
    if (await this.usersLink.isVisible()) {
      links.push('Users');
    }
    
    if (await this.rolesLink.isVisible()) {
      links.push('Roles');
    }
    
    if (await this.auditLink.isVisible()) {
      links.push('Audit');
    }
    
    return links;
  }

  /**
   * Verify dashboard elements are loaded
   */
  async verifyDashboardLoaded() {
    await expect(this.dashboardContent).toBeVisible();
    
    // Check for common dashboard elements
    const checks = {
      sidebar: await this.sidebar.isVisible(),
      userMenu: await this.userMenu.isVisible(),
      navigation: await this.navigationMenu.isVisible(),
    };
    
    return checks;
  }

  /**
   * Get dashboard statistics if available
   */
  async getDashboardStats(): Promise<Array<{ title: string; value: string }>> {
    const stats: Array<{ title: string; value: string }> = [];
    
    const cardCount = await this.statsCards.count();
    
    for (let i = 0; i < cardCount; i++) {
      const card = this.statsCards.nth(i);
      const title = await card.locator('.title, .stat-title, h3, h4').textContent() || '';
      const value = await card.locator('.value, .stat-value, .number').textContent() || '';
      
      if (title && value) {
        stats.push({ title: title.trim(), value: value.trim() });
      }
    }
    
    return stats;
  }

  /**
   * Click on a quick action button
   */
  async clickQuickAction(actionName: string) {
    const actionButton = this.quickActions.locator(`button:has-text("${actionName}"), a:has-text("${actionName}")`);
    await this.clickElement(actionButton);
    await this.waitForPageLoad();
  }

  /**
   * Get available quick actions
   */
  async getAvailableQuickActions(): Promise<string[]> {
    const actions: string[] = [];
    
    if (await this.quickActions.isVisible()) {
      const actionElements = this.quickActions.locator('button, a');
      const count = await actionElements.count();
      
      for (let i = 0; i < count; i++) {
        const actionText = await actionElements.nth(i).textContent();
        if (actionText) {
          actions.push(actionText.trim());
        }
      }
    }
    
    return actions;
  }

  /**
   * Check user permissions by trying to access restricted areas
   */
  async checkUserPermissions(): Promise<{
    canAccessUsers: boolean;
    canAccessRoles: boolean;
    canAccessAudit: boolean;
  }> {
    const permissions = {
      canAccessUsers: false,
      canAccessRoles: false,
      canAccessAudit: false,
    };
    
    // Check if user management link is visible and clickable
    if (await this.usersLink.isVisible()) {
      try {
        await this.navigateToUsers();
        permissions.canAccessUsers = !this.page.url().includes('/unauthorized');
        await this.navigateToDashboard();
      } catch (error) {
        // Access denied
      }
    }
    
    // Check if roles management link is visible and clickable
    if (await this.rolesLink.isVisible()) {
      try {
        await this.navigateToRoles();
        permissions.canAccessRoles = !this.page.url().includes('/unauthorized');
        await this.navigateToDashboard();
      } catch (error) {
        // Access denied
      }
    }
    
    // Check if audit link is visible and clickable
    if (await this.auditLink.isVisible()) {
      try {
        await this.navigateToAudit();
        permissions.canAccessAudit = !this.page.url().includes('/unauthorized');
        await this.navigateToDashboard();
      } catch (error) {
        // Access denied
      }
    }
    
    return permissions;
  }

  /**
   * Test responsive behavior
   */
  async testResponsiveBehavior() {
    // Test mobile view
    await this.page.setViewportSize({ width: 375, height: 667 });
    await this.waitForPageLoad();
    
    const mobileLayout = {
      sidebarCollapsed: !(await this.sidebar.isVisible()) || (await this.sidebar.getAttribute('class'))?.includes('collapsed'),
      userMenuVisible: await this.userMenu.isVisible(),
      contentVisible: await this.dashboardContent.isVisible(),
    };
    
    // Test tablet view
    await this.page.setViewportSize({ width: 768, height: 1024 });
    await this.waitForPageLoad();
    
    const tabletLayout = {
      sidebarVisible: await this.sidebar.isVisible(),
      userMenuVisible: await this.userMenu.isVisible(),
      contentVisible: await this.dashboardContent.isVisible(),
    };
    
    // Reset to desktop view
    await this.page.setViewportSize({ width: 1280, height: 720 });
    await this.waitForPageLoad();
    
    return { mobileLayout, tabletLayout };
  }
}