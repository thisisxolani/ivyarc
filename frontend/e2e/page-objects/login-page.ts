import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base-page';

/**
 * Login Page Object Model
 * Handles all login-related interactions and validations
 */
export class LoginPage extends BasePage {
  // Page elements
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly forgotPasswordLink: Locator;
  readonly registerLink: Locator;
  readonly rememberMeCheckbox: Locator;
  readonly showPasswordButton: Locator;
  readonly loginForm: Locator;
  readonly errorMessage: Locator;
  readonly loadingSpinner: Locator;

  constructor(page: Page) {
    super(page);
    
    // Initialize page elements
    this.usernameInput = page.locator('[data-testid="username-input"], [name="username"], [name="identifier"], input[type="email"]');
    this.passwordInput = page.locator('[data-testid="password-input"], [name="password"], input[type="password"]');
    this.loginButton = page.locator('[data-testid="login-button"], button[type="submit"], .login-btn');
    this.forgotPasswordLink = page.locator('[data-testid="forgot-password-link"], a[href*="forgot"], .forgot-password');
    this.registerLink = page.locator('[data-testid="register-link"], a[href*="register"], .register-link');
    this.rememberMeCheckbox = page.locator('[data-testid="remember-me"], [name="rememberMe"], .remember-me');
    this.showPasswordButton = page.locator('[data-testid="show-password"], .show-password, .password-toggle');
    this.loginForm = page.locator('[data-testid="login-form"], form, .login-form');
    this.errorMessage = page.locator('[data-testid="error-message"], .error, .alert-error, [role="alert"]');
    this.loadingSpinner = page.locator('[data-testid="loading"], .spinner, .loading');
  }

  /**
   * Navigate to login page
   */
  async navigateToLogin(): Promise<void> {
    await this.goto('/auth/login');
    await this.waitForPageLoad();
    await this.verifyLoginPageLoaded();
  }

  /**
   * Verify login page has loaded correctly
   */
  async verifyLoginPageLoaded(): Promise<void> {
    await this.waitForVisible(this.loginForm);
    await this.waitForVisible(this.usernameInput);
    await this.waitForVisible(this.passwordInput);
    await this.waitForVisible(this.loginButton);
    
    // Check page title
    const title = await this.getTitle();
    expect(title).toContain('Login');
  }

  /**
   * Login with username and password
   */
  async login(username: string, password: string, rememberMe: boolean = false): Promise<void> {
    await this.fillUsername(username);
    await this.fillPassword(password);
    
    if (rememberMe && await this.rememberMeCheckbox.isVisible()) {
      await this.clickElement(this.rememberMeCheckbox);
    }
    
    await this.clickLoginButton();
  }

  /**
   * Fill username field
   */
  async fillUsername(username: string): Promise<void> {
    await this.fillField(this.usernameInput, username);
  }

  /**
   * Fill password field
   */
  async fillPassword(password: string): Promise<void> {
    await this.fillField(this.passwordInput, password);
  }

  /**
   * Click login button
   */
  async clickLoginButton(): Promise<void> {
    await this.clickElement(this.loginButton);
    await this.waitForLoadingToFinish();
  }

  /**
   * Click forgot password link
   */
  async clickForgotPassword(): Promise<void> {
    await this.clickElement(this.forgotPasswordLink);
    await this.waitForPageLoad();
  }

  /**
   * Click register link
   */
  async clickRegisterLink(): Promise<void> {
    await this.clickElement(this.registerLink);
    await this.waitForPageLoad();
  }

  /**
   * Toggle password visibility
   */
  async togglePasswordVisibility(): Promise<void> {
    if (await this.showPasswordButton.isVisible()) {
      await this.clickElement(this.showPasswordButton);
      await this.page.waitForTimeout(500); // Allow for transition
    }
  }

  /**
   * Verify password visibility state
   */
  async verifyPasswordVisibility(shouldBeVisible: boolean): Promise<void> {
    const passwordType = await this.passwordInput.getAttribute('type');
    if (shouldBeVisible) {
      expect(passwordType).toBe('text');
    } else {
      expect(passwordType).toBe('password');
    }
  }

  /**
   * Check if remember me is checked
   */
  async isRememberMeChecked(): Promise<boolean> {
    if (await this.rememberMeCheckbox.isVisible()) {
      return await this.rememberMeCheckbox.isChecked();
    }
    return false;
  }

  /**
   * Get error message text
   */
  async getErrorMessage(): Promise<string> {
    await this.waitForVisible(this.errorMessage);
    return await this.getTextContent(this.errorMessage);
  }

  /**
   * Verify error message appears
   */
  async verifyErrorMessage(expectedMessage: string): Promise<void> {
    const actualMessage = await this.getErrorMessage();
    expect(actualMessage).toContain(expectedMessage);
  }

  /**
   * Check if error message is displayed
   */
  async hasErrorMessage(): Promise<boolean> {
    return await this.isVisible(this.errorMessage);
  }

  /**
   * Clear login form
   */
  async clearLoginForm(): Promise<void> {
    await this.fillField(this.usernameInput, '');
    await this.fillField(this.passwordInput, '');
    
    if (await this.isRememberMeChecked()) {
      await this.clickElement(this.rememberMeCheckbox);
    }
  }

  /**
   * Verify form validation errors
   */
  async verifyValidationErrors(expectedErrors: { username?: string; password?: string }): Promise<void> {
    if (expectedErrors.username) {
      const usernameError = this.page.locator('[data-testid="username-error"], .username-error');
      await this.waitForVisible(usernameError);
      const errorText = await this.getTextContent(usernameError);
      expect(errorText).toContain(expectedErrors.username);
    }

    if (expectedErrors.password) {
      const passwordError = this.page.locator('[data-testid="password-error"], .password-error');
      await this.waitForVisible(passwordError);
      const errorText = await this.getTextContent(passwordError);
      expect(errorText).toContain(expectedErrors.password);
    }
  }

  /**
   * Wait for successful login and redirect
   */
  async waitForSuccessfulLogin(): Promise<void> {
    // Wait for redirect to dashboard or home page
    await Promise.race([
      this.page.waitForURL('**/dashboard'),
      this.page.waitForURL('**/home'),
      this.page.waitForURL(url => !url.includes('login'))
    ]);

    // Ensure we're no longer on login page
    const currentUrl = this.getCurrentURL();
    expect(currentUrl).not.toContain('login');
  }

  /**
   * Perform login with validation
   */
  async loginWithValidation(username: string, password: string): Promise<void> {
    await this.login(username, password);
    
    // Check for error messages first
    await this.page.waitForTimeout(1000); // Allow for error messages to appear
    
    const hasError = await this.hasErrorMessage();
    if (hasError) {
      const errorMessage = await this.getErrorMessage();
      console.log('Login failed with error:', errorMessage);
      throw new Error(`Login failed: ${errorMessage}`);
    }
    
    // Wait for successful login
    await this.waitForSuccessfulLogin();
  }

  /**
   * Verify login button state
   */
  async verifyLoginButtonState(shouldBeEnabled: boolean): Promise<void> {
    const isEnabled = await this.isEnabled(this.loginButton);
    expect(isEnabled).toBe(shouldBeEnabled);
  }

  /**
   * Get current form values
   */
  async getFormValues(): Promise<{ username: string; password: string; rememberMe: boolean }> {
    const username = await this.usernameInput.inputValue();
    const password = await this.passwordInput.inputValue();
    const rememberMe = await this.isRememberMeChecked();
    
    return { username, password, rememberMe };
  }

  /**
   * Test form field interactions
   */
  async testFormInteractions(): Promise<void> {
    // Test tab navigation
    await this.usernameInput.focus();
    await this.pressKeys('Tab');
    expect(await this.passwordInput.evaluate(el => el === document.activeElement)).toBe(true);

    // Test enter key submission
    await this.usernameInput.focus();
    await this.fillUsername('test@example.com');
    await this.pressKeys('Tab');
    await this.fillPassword('password123');
    await this.pressKeys('Enter');
    
    // Should attempt login
    await this.page.waitForTimeout(1000);
  }

  /**
   * Verify login form accessibility
   */
  async verifyAccessibility(): Promise<void> {
    await this.checkAccessibility();
    
    // Verify form labels
    const usernameLabel = await this.page.locator('label[for*="username"], label[for*="identifier"]').count();
    const passwordLabel = await this.page.locator('label[for*="password"]').count();
    
    expect(usernameLabel + passwordLabel).toBeGreaterThan(0);
    
    // Verify ARIA attributes
    const formRole = await this.loginForm.getAttribute('role');
    expect(formRole).toBeTruthy();
  }

  /**
   * Test responsive behavior
   */
  async testResponsiveDesign(): Promise<void> {
    await this.checkResponsiveDesign();
    
    // Verify form remains functional on mobile
    await this.page.setViewportSize({ width: 375, height: 667 });
    await this.page.waitForTimeout(1000);
    
    expect(await this.isVisible(this.usernameInput)).toBe(true);
    expect(await this.isVisible(this.passwordInput)).toBe(true);
    expect(await this.isVisible(this.loginButton)).toBe(true);
    
    // Reset viewport
    await this.page.setViewportSize({ width: 1280, height: 720 });
  }

  /**
   * Test keyboard navigation
   */
  async testKeyboardNavigation(): Promise<void> {
    await this.testKeyboardNavigation();
    
    // Test form-specific keyboard interactions
    await this.usernameInput.focus();
    
    // Tab through form fields
    const tabOrder = [this.usernameInput, this.passwordInput, this.loginButton];
    
    for (let i = 0; i < tabOrder.length - 1; i++) {
      await this.pressKeys('Tab');
      await this.page.waitForTimeout(200);
    }
  }

  /**
   * Verify login page performance
   */
  async verifyPerformance(): Promise<any> {
    const metrics = await this.measurePerformance();
    
    // Login page should load quickly
    expect(metrics.domContentLoaded).toBeLessThan(3000); // 3 seconds
    expect(metrics.loadComplete).toBeLessThan(5000); // 5 seconds
    
    return metrics;
  }

  /**
   * Test different login scenarios
   */
  async testLoginScenarios(): Promise<void> {
    const testCases = [
      { username: '', password: '', expectError: true },
      { username: 'invalid@email.com', password: 'wrongpassword', expectError: true },
      { username: 'user@ivyarc.com', password: '', expectError: true },
      { username: '', password: 'password123', expectError: true },
      { username: 'not-an-email', password: 'password123', expectError: true },
    ];

    for (const testCase of testCases) {
      await this.clearLoginForm();
      await this.login(testCase.username, testCase.password);
      
      if (testCase.expectError) {
        // Should show error or validation message
        const hasError = await this.hasErrorMessage();
        const validationErrors = await this.getValidationErrors();
        expect(hasError || validationErrors.length > 0).toBe(true);
      }
      
      await this.page.waitForTimeout(1000);
    }
  }

  /**
   * Verify social login options (if available)
   */
  async verifySocialLoginOptions(): Promise<void> {
    const socialLoginButtons = await this.page.locator('.social-login, [data-testid*="social"], .oauth').count();
    
    if (socialLoginButtons > 0) {
      console.log(`Found ${socialLoginButtons} social login options`);
      
      // Test visibility of social login buttons
      const googleLogin = this.page.locator('[data-testid="google-login"], .google-login');
      const githubLogin = this.page.locator('[data-testid="github-login"], .github-login');
      const microsoftLogin = this.page.locator('[data-testid="microsoft-login"], .microsoft-login');
      
      // Verify buttons are visible and clickable if they exist
      const socialButtons = [googleLogin, githubLogin, microsoftLogin];
      
      for (const button of socialButtons) {
        if (await button.isVisible()) {
          expect(await this.isEnabled(button)).toBe(true);
        }
      }
    }
  }
}