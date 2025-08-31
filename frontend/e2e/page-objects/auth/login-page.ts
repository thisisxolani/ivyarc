import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '../base-page';

/**
 * Page Object for Login functionality
 * Handles authentication flows and form interactions
 */
export class LoginPage extends BasePage {
  // Locators
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly registerButton: Locator;
  readonly showPasswordButton: Locator;
  readonly forgotPasswordLink: Locator;
  readonly loginForm: Locator;
  readonly errorMessage: Locator;
  readonly loadingIndicator: Locator;

  constructor(page: Page) {
    super(page);
    
    // Initialize locators using data-testid attributes
    this.usernameInput = page.locator('[data-testid="username-input"], [name="identifier"], [placeholder*="username"], [placeholder*="email"]');
    this.passwordInput = page.locator('[data-testid="password-input"], [name="password"], [type="password"]');
    this.loginButton = page.locator('[data-testid="login-button"], button[type="submit"], button:has-text("Sign In"), button:has-text("Login")');
    this.registerButton = page.locator('[data-testid="register-button"], button:has-text("Register"), button:has-text("Sign Up")');
    this.showPasswordButton = page.locator('[data-testid="show-password"], button:has-text("Show"), .password-toggle');
    this.forgotPasswordLink = page.locator('[data-testid="forgot-password"], a:has-text("Forgot Password")');
    this.loginForm = page.locator('[data-testid="login-form"], form');
    this.errorMessage = page.locator('[data-testid="error-message"], .error, .alert-error');
    this.loadingIndicator = page.locator('[data-testid="loading"], .spinner, .loading');
  }

  /**
   * Navigate to login page
   */
  async navigateToLogin() {
    await this.goto('/auth/login');
    await this.waitForPageLoad();
    await expect(this.loginForm).toBeVisible();
  }

  /**
   * Navigate to register page
   */
  async navigateToRegister() {
    await this.goto('/auth/register');
    await this.waitForPageLoad();
  }

  /**
   * Switch between login and register modes
   */
  async switchToRegister() {
    await this.clickElement(this.registerButton);
    await this.waitForPageLoad();
  }

  /**
   * Perform login with credentials
   */
  async login(username: string, password: string) {
    await this.fillField(this.usernameInput, username);
    await this.fillField(this.passwordInput, password);
    
    // Wait for form to be valid and button to be enabled
    await expect(this.loginButton).toBeEnabled();
    
    // Click login and wait for navigation or error
    const loginPromise = this.page.waitForURL('**/dashboard', { timeout: 10000 }).catch(() => {
      // Login might fail, that's handled by error checking
    });
    
    await this.clickElement(this.loginButton);
    await this.waitForLoadingToFinish();
    
    // Check if login was successful (redirected to dashboard) or failed (error message)
    const isOnDashboard = this.page.url().includes('/dashboard');
    const hasError = await this.hasErrors();
    
    return {
      success: isOnDashboard && !hasError,
      error: hasError ? await this.getErrorMessage() : null
    };
  }

  /**
   * Perform quick login with predefined test users
   */
  async loginAsAdmin() {
    return await this.login('admin@ivyarc.com', 'admin123');
  }

  async loginAsUser() {
    return await this.login('user@ivyarc.com', 'user123');
  }

  async loginAsManager() {
    return await this.login('manager@ivyarc.com', 'manager123');
  }

  /**
   * Test invalid login scenarios
   */
  async loginWithInvalidCredentials(username: string, password: string) {
    await this.fillField(this.usernameInput, username);
    await this.fillField(this.passwordInput, password);
    await this.clickElement(this.loginButton);
    await this.waitForLoadingToFinish();
    
    // Should show error message and stay on login page
    await expect(this.errorMessage).toBeVisible();
    const errorText = await this.getErrorMessage();
    
    return {
      error: errorText,
      stayedOnLoginPage: this.page.url().includes('/auth/login')
    };
  }

  /**
   * Toggle password visibility
   */
  async togglePasswordVisibility() {
    await this.clickElement(this.showPasswordButton);
    
    // Check if password is now visible
    const passwordType = await this.passwordInput.getAttribute('type');
    return passwordType === 'text';
  }

  /**
   * Get current error message
   */
  async getErrorMessage(): Promise<string> {
    if (await this.errorMessage.isVisible()) {
      return await this.errorMessage.textContent() || '';
    }
    return '';
  }

  /**
   * Check if login form is valid
   */
  async isFormValid(): Promise<boolean> {
    const usernameValue = await this.usernameInput.inputValue();
    const passwordValue = await this.passwordInput.inputValue();
    const buttonEnabled = await this.loginButton.isEnabled();
    
    return usernameValue.length > 0 && passwordValue.length >= 6 && buttonEnabled;
  }

  /**
   * Clear login form
   */
  async clearForm() {
    await this.usernameInput.clear();
    await this.passwordInput.clear();
  }

  /**
   * Validate form field errors
   */
  async validateFieldErrors(expectedErrors: { username?: string; password?: string }) {
    if (expectedErrors.username) {
      const usernameError = this.page.locator('[data-testid="username-error"], .username-error');
      await expect(usernameError).toContainText(expectedErrors.username);
    }
    
    if (expectedErrors.password) {
      const passwordError = this.page.locator('[data-testid="password-error"], .password-error');
      await expect(passwordError).toContainText(expectedErrors.password);
    }
  }

  /**
   * Test form validation by submitting empty form
   */
  async testFormValidation() {
    await this.clearForm();
    await this.clickElement(this.loginButton);
    
    // Should show validation errors
    await this.validateFieldErrors({
      username: 'required',
      password: 'required'
    });
    
    return await this.isFormValid() === false;
  }

  /**
   * Test minimum password length validation
   */
  async testPasswordValidation() {
    await this.fillField(this.usernameInput, 'test@example.com');
    await this.fillField(this.passwordInput, '123'); // Too short
    
    const isValid = await this.isFormValid();
    return !isValid; // Should be invalid
  }

  /**
   * Click forgot password link
   */
  async clickForgotPassword() {
    await this.clickElement(this.forgotPasswordLink);
    // Wait for navigation or modal
    await this.waitForPageLoad();
  }

  /**
   * Check if currently on login page
   */
  async isOnLoginPage(): Promise<boolean> {
    return this.page.url().includes('/auth/login');
  }

  /**
   * Check if currently on register page
   */
  async isOnRegisterPage(): Promise<boolean> {
    return this.page.url().includes('/auth/register');
  }

  /**
   * Wait for login to complete (success or failure)
   */
  async waitForLoginResult(timeout: number = 10000) {
    // Wait for either successful navigation to dashboard or error message
    await Promise.race([
      this.page.waitForURL('**/dashboard', { timeout }),
      this.errorMessage.waitFor({ state: 'visible', timeout })
    ]);
    
    return {
      success: this.page.url().includes('/dashboard'),
      error: await this.isVisible(this.errorMessage) ? await this.getErrorMessage() : null
    };
  }

  /**
   * Test keyboard navigation and accessibility
   */
  async testKeyboardNavigation() {
    // Tab through form elements
    await this.usernameInput.focus();
    await this.page.keyboard.press('Tab');
    
    const passwordFocused = await this.passwordInput.evaluate(el => el === document.activeElement);
    
    await this.page.keyboard.press('Tab');
    const buttonFocused = await this.loginButton.evaluate(el => el === document.activeElement);
    
    return { passwordFocused, buttonFocused };
  }

  /**
   * Submit form using Enter key
   */
  async submitWithEnterKey() {
    await this.passwordInput.focus();
    await this.page.keyboard.press('Enter');
    await this.waitForLoadingToFinish();
  }
}