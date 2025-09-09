import { Page, expect, BrowserContext } from '@playwright/test';
import { ApiHelpers } from './api-helpers';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  roles: string[];
  permissions: string[];
}

export class AuthHelpers {
  /**
   * Perform login via UI
   */
  static async loginViaUI(page: Page, credentials: LoginCredentials): Promise<void> {
    await page.goto('/auth/login');
    await page.waitForLoadState('networkidle');

    // Fill login form
    await page.fill('[data-testid="username-input"]', credentials.username);
    await page.fill('[data-testid="password-input"]', credentials.password);
    
    // Submit and wait for redirect
    await page.click('[data-testid="login-button"]');
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    
    // Verify login success
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
  }

  /**
   * Perform login via API and set context
   */
  static async loginViaAPI(context: BrowserContext, credentials: LoginCredentials): Promise<UserProfile> {
    const response = await context.request.post('/api/auth/login', {
      data: credentials
    });
    
    expect(response.ok()).toBeTruthy();
    
    const result = await response.json();
    expect(result.token).toBeTruthy();
    expect(result.user).toBeTruthy();
    
    // Set token in context for subsequent requests
    await context.addInitScript(token => {
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(token.user));
    }, result);
    
    return result.user;
  }

  /**
   * Logout via UI
   */
  static async logoutViaUI(page: Page): Promise<void> {
    await page.click('[data-testid="user-menu"]');
    await page.click('[data-testid="logout-button"]');
    await page.waitForURL('**/auth/login', { timeout: 5000 });
  }

  /**
   * Logout via API
   */
  static async logoutViaAPI(context: BrowserContext): Promise<void> {
    const response = await context.request.post('/api/auth/logout');
    expect(response.ok()).toBeTruthy();
  }

  /**
   * Verify authentication state
   */
  static async verifyAuthState(page: Page, shouldBeLoggedIn: boolean = true): Promise<void> {
    if (shouldBeLoggedIn) {
      await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
      await expect(page).not.toHaveURL(/.*\/auth\/login/);
    } else {
      await expect(page.locator('[data-testid="user-menu"]')).not.toBeVisible();
      await expect(page).toHaveURL(/.*\/auth\/login/);
    }
  }

  /**
   * Check user permissions
   */
  static async hasPermission(page: Page, permission: string): Promise<boolean> {
    return await page.evaluate((perm) => {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return user.permissions?.includes(perm) || false;
    }, permission);
  }

  /**
   * Get current user info from page context
   */
  static async getCurrentUser(page: Page): Promise<UserProfile | null> {
    return await page.evaluate(() => {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    });
  }

  /**
   * Setup admin authentication for test
   */
  static async setupAdminAuth(context: BrowserContext): Promise<UserProfile> {
    return await this.loginViaAPI(context, {
      username: 'admin@ivyarc.com',
      password: 'admin123'
    });
  }

  /**
   * Setup user authentication for test
   */
  static async setupUserAuth(context: BrowserContext): Promise<UserProfile> {
    return await this.loginViaAPI(context, {
      username: 'user@ivyarc.com',
      password: 'user123'
    });
  }

  /**
   * Setup manager authentication for test
   */
  static async setupManagerAuth(context: BrowserContext): Promise<UserProfile> {
    return await this.loginViaAPI(context, {
      username: 'manager@ivyarc.com', 
      password: 'manager123'
    });
  }

  /**
   * Warm up authentication endpoints
   */
  static async warmupAuthEndpoints(): Promise<void> {
    try {
      // Health check
      await fetch('http://localhost:8080/api/auth/health');
      
      // Token validation endpoint
      await fetch('http://localhost:8080/api/auth/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      console.log('✅ Auth endpoints warmed up');
    } catch (error) {
      console.warn('⚠️  Could not warm up auth endpoints:', error);
    }
  }

  /**
   * Wait for session timeout
   */
  static async waitForSessionTimeout(page: Page, timeoutMs: number = 30000): Promise<void> {
    await page.waitForFunction(() => {
      return !localStorage.getItem('authToken');
    }, { timeout: timeoutMs });
  }

  /**
   * Refresh authentication token
   */
  static async refreshToken(context: BrowserContext): Promise<boolean> {
    try {
      const response = await context.request.post('/api/auth/refresh');
      if (response.ok()) {
        const result = await response.json();
        await context.addInitScript(token => {
          localStorage.setItem('authToken', token);
        }, result.token);
        return true;
      }
      return false;
    } catch (error) {
      console.warn('Token refresh failed:', error);
      return false;
    }
  }

  /**
   * Verify JWT token structure
   */
  static async verifyTokenStructure(page: Page): Promise<void> {
    const token = await page.evaluate(() => localStorage.getItem('authToken'));
    expect(token).toBeTruthy();
    
    // JWT tokens have 3 parts separated by dots
    const parts = token!.split('.');
    expect(parts).toHaveLength(3);
    
    // Decode header and payload (basic validation)
    const header = JSON.parse(atob(parts[0]));
    const payload = JSON.parse(atob(parts[1]));
    
    expect(header.typ).toBe('JWT');
    expect(payload.sub).toBeTruthy();
    expect(payload.exp).toBeGreaterThan(Date.now() / 1000);
  }
}