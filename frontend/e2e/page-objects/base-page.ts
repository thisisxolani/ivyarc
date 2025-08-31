import { Page, Locator, expect } from '@playwright/test';

/**
 * Base page class with common functionality for all page objects
 * Provides consistent interface and shared utilities
 */
export abstract class BasePage {
  protected page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Navigate to a specific path
   */
  async goto(path: string = '') {
    await this.page.goto(path);
    await this.waitForPageLoad();
  }

  /**
   * Wait for page to finish loading
   */
  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle', { timeout: 10000 });
  }

  /**
   * Get page title
   */
  async getTitle(): Promise<string> {
    return await this.page.title();
  }

  /**
   * Get current URL
   */
  getCurrentURL(): string {
    return this.page.url();
  }

  /**
   * Wait for element to be visible
   */
  async waitForVisible(locator: string | Locator, timeout: number = 10000) {
    const element = typeof locator === 'string' ? this.page.locator(locator) : locator;
    await element.waitFor({ state: 'visible', timeout });
  }

  /**
   * Wait for element to be hidden
   */
  async waitForHidden(locator: string | Locator, timeout: number = 10000) {
    const element = typeof locator === 'string' ? this.page.locator(locator) : locator;
    await element.waitFor({ state: 'hidden', timeout });
  }

  /**
   * Click element with retry logic
   */
  async clickElement(locator: string | Locator) {
    const element = typeof locator === 'string' ? this.page.locator(locator) : locator;
    await element.waitFor({ state: 'visible' });
    await element.click();
  }

  /**
   * Fill input field
   */
  async fillField(locator: string | Locator, value: string) {
    const element = typeof locator === 'string' ? this.page.locator(locator) : locator;
    await element.waitFor({ state: 'visible' });
    await element.clear();
    await element.fill(value);
  }

  /**
   * Select option from dropdown
   */
  async selectOption(locator: string | Locator, value: string) {
    const element = typeof locator === 'string' ? this.page.locator(locator) : locator;
    await element.waitFor({ state: 'visible' });
    await element.selectOption(value);
  }

  /**
   * Get text content of element
   */
  async getTextContent(locator: string | Locator): Promise<string> {
    const element = typeof locator === 'string' ? this.page.locator(locator) : locator;
    await element.waitFor({ state: 'visible' });
    return (await element.textContent()) || '';
  }

  /**
   * Check if element is visible
   */
  async isVisible(locator: string | Locator): Promise<boolean> {
    const element = typeof locator === 'string' ? this.page.locator(locator) : locator;
    return await element.isVisible();
  }

  /**
   * Check if element is enabled
   */
  async isEnabled(locator: string | Locator): Promise<boolean> {
    const element = typeof locator === 'string' ? this.page.locator(locator) : locator;
    return await element.isEnabled();
  }

  /**
   * Wait for toast/notification message
   */
  async waitForNotification(message?: string, timeout: number = 5000) {
    const notification = this.page.locator('[data-testid="notification"], .toast, .alert');
    await notification.waitFor({ state: 'visible', timeout });
    
    if (message) {
      await expect(notification).toContainText(message);
    }
    
    return notification;
  }

  /**
   * Close notification if visible
   */
  async closeNotification() {
    const closeButton = this.page.locator('[data-testid="notification-close"], .toast-close, .alert-close');
    if (await closeButton.isVisible()) {
      await closeButton.click();
    }
  }

  /**
   * Take screenshot for debugging
   */
  async takeScreenshot(name?: string) {
    const screenshotPath = `test-results/screenshots/${name || 'debug'}-${Date.now()}.png`;
    await this.page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`📸 Screenshot saved: ${screenshotPath}`);
    return screenshotPath;
  }

  /**
   * Wait for API response
   */
  async waitForAPIResponse(urlPattern: string | RegExp, timeout: number = 10000) {
    return await this.page.waitForResponse(
      response => {
        const url = response.url();
        const matches = typeof urlPattern === 'string' 
          ? url.includes(urlPattern)
          : urlPattern.test(url);
        return matches && response.status() < 400;
      },
      { timeout }
    );
  }

  /**
   * Scroll element into view
   */
  async scrollIntoView(locator: string | Locator) {
    const element = typeof locator === 'string' ? this.page.locator(locator) : locator;
    await element.scrollIntoViewIfNeeded();
  }

  /**
   * Hover over element
   */
  async hover(locator: string | Locator) {
    const element = typeof locator === 'string' ? this.page.locator(locator) : locator;
    await element.waitFor({ state: 'visible' });
    await element.hover();
  }

  /**
   * Double click element
   */
  async doubleClick(locator: string | Locator) {
    const element = typeof locator === 'string' ? this.page.locator(locator) : locator;
    await element.waitFor({ state: 'visible' });
    await element.dblclick();
  }

  /**
   * Press key combination
   */
  async pressKeys(keys: string) {
    await this.page.keyboard.press(keys);
  }

  /**
   * Wait for loading spinner to disappear
   */
  async waitForLoadingToFinish() {
    const loadingSpinner = this.page.locator('[data-testid="loading"], .spinner, .loading');
    
    // Wait for spinner to appear (if it's going to)
    try {
      await loadingSpinner.waitFor({ state: 'visible', timeout: 1000 });
    } catch (error) {
      // Spinner might not appear - that's OK
    }
    
    // Wait for spinner to disappear
    await loadingSpinner.waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {
      // Spinner might not exist - that's OK
    });
  }

  /**
   * Check if page has errors
   */
  async hasErrors(): Promise<boolean> {
    const errorElements = this.page.locator('[data-testid="error"], .error, .alert-error');
    return await errorElements.count() > 0;
  }

  /**
   * Get error messages
   */
  async getErrorMessages(): Promise<string[]> {
    const errorElements = this.page.locator('[data-testid="error"], .error, .alert-error');
    const count = await errorElements.count();
    const messages: string[] = [];
    
    for (let i = 0; i < count; i++) {
      const message = await errorElements.nth(i).textContent();
      if (message) {
        messages.push(message.trim());
      }
    }
    
    return messages;
  }

  /**
   * Clear all form fields
   */
  async clearForm() {
    const inputs = this.page.locator('input, textarea, select');
    const count = await inputs.count();
    
    for (let i = 0; i < count; i++) {
      const input = inputs.nth(i);
      if (await input.isVisible() && await input.isEnabled()) {
        await input.clear();
      }
    }
  }

  /**
   * Generic form validation helper
   */
  async validateFormFields(fieldsData: Record<string, string>) {
    for (const [fieldSelector, expectedError] of Object.entries(fieldsData)) {
      const errorElement = this.page.locator(`${fieldSelector} + .error, ${fieldSelector}-error`);
      await expect(errorElement).toContainText(expectedError);
    }
  }
}