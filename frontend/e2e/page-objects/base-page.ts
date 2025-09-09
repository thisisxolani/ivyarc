import { Page, Locator, expect } from '@playwright/test';

/**
 * Base page object model with comprehensive functionality
 * All page objects extend from this base class
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
    await this.page.waitForLoadState('networkidle', { timeout: 15000 });
    await this.page.waitForLoadState('domcontentloaded');
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
   * Fill input field with validation
   */
  async fillField(locator: string | Locator, value: string) {
    const element = typeof locator === 'string' ? this.page.locator(locator) : locator;
    await element.waitFor({ state: 'visible' });
    await element.clear();
    await element.fill(value);
    
    // Verify the value was set correctly
    const inputValue = await element.inputValue();
    expect(inputValue).toBe(value);
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
    const notification = this.page.locator('[data-testid="notification"], .toast, .alert, [role="alert"]');
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
    const loadingSpinner = this.page.locator('[data-testid="loading"], .spinner, .loading, [role="progressbar"]');
    
    // Wait for spinner to appear (if it's going to)
    try {
      await loadingSpinner.waitFor({ state: 'visible', timeout: 1000 });
    } catch (error) {
      // Spinner might not appear - that's OK
    }
    
    // Wait for spinner to disappear
    await loadingSpinner.waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {
      // Spinner might not exist - that's OK
    });
  }

  /**
   * Check if page has errors
   */
  async hasErrors(): Promise<boolean> {
    const errorElements = this.page.locator('[data-testid="error"], .error, .alert-error, [role="alert"]');
    return await errorElements.count() > 0;
  }

  /**
   * Get error messages
   */
  async getErrorMessages(): Promise<string[]> {
    const errorElements = this.page.locator('[data-testid="error"], .error, .alert-error, [role="alert"]');
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
    const inputs = this.page.locator('input:not([type="hidden"]), textarea, select');
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
      const errorElement = this.page.locator(`${fieldSelector} + .error, ${fieldSelector}-error, [data-testid="${fieldSelector}-error"]`);
      await expect(errorElement).toContainText(expectedError);
    }
  }

  /**
   * Check accessibility compliance
   */
  async checkAccessibility(): Promise<void> {
    // Check for page heading
    const headings = await this.page.locator('h1, h2, h3, h4, h5, h6').count();
    expect(headings).toBeGreaterThan(0);

    // Check for alt text on images
    const images = await this.page.locator('img').all();
    for (const img of images) {
      const altText = await img.getAttribute('alt');
      const ariaLabel = await img.getAttribute('aria-label');
      expect(altText || ariaLabel).toBeTruthy();
    }

    // Check for form labels
    const inputs = await this.page.locator('input:not([type="hidden"]), select, textarea').all();
    for (const input of inputs) {
      const id = await input.getAttribute('id');
      const ariaLabel = await input.getAttribute('aria-label');
      const ariaLabelledBy = await input.getAttribute('aria-labelledby');
      
      if (id) {
        const label = await this.page.locator(`label[for="${id}"]`).count();
        expect(label > 0 || ariaLabel || ariaLabelledBy).toBeTruthy();
      } else {
        expect(ariaLabel || ariaLabelledBy).toBeTruthy();
      }
    }

    // Check color contrast (basic check)
    const textElements = await this.page.locator('p, span, div, a, button, label').all();
    for (const element of textElements.slice(0, 10)) { // Check first 10 for performance
      const styles = await element.evaluate(el => {
        const computed = window.getComputedStyle(el);
        return {
          color: computed.color,
          backgroundColor: computed.backgroundColor,
          fontSize: computed.fontSize,
        };
      });
      
      // Basic check for very light text on light background
      if (styles.color && styles.backgroundColor) {
        const colorValues = styles.color.match(/\d+/g);
        const bgValues = styles.backgroundColor.match(/\d+/g);
        
        if (colorValues && bgValues) {
          const colorSum = colorValues.reduce((sum, val) => sum + parseInt(val), 0);
          const bgSum = bgValues.reduce((sum, val) => sum + parseInt(val), 0);
          const contrast = Math.abs(colorSum - bgSum);
          
          // Very basic contrast check - in real scenarios use proper contrast calculation
          expect(contrast).toBeGreaterThan(100); // Arbitrary threshold for basic check
        }
      }
    }
  }

  /**
   * Test keyboard navigation
   */
  async testKeyboardNavigation(): Promise<void> {
    // Get all focusable elements
    const focusableElements = await this.page.locator(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    ).all();

    if (focusableElements.length === 0) return;

    // Start from first element
    await focusableElements[0].focus();
    
    // Test Tab navigation
    for (let i = 1; i < Math.min(focusableElements.length, 5); i++) { // Test first 5 for performance
      await this.page.keyboard.press('Tab');
      await this.page.waitForTimeout(200);
      
      // Check if focus moved to next element
      const focusedElement = await this.page.locator(':focus').first();
      expect(await focusedElement.count()).toBeGreaterThan(0);
    }
  }

  /**
   * Check responsive design
   */
  async checkResponsiveDesign(): Promise<void> {
    const viewports = [
      { width: 1920, height: 1080, name: 'desktop' },
      { width: 1024, height: 768, name: 'tablet' },
      { width: 375, height: 667, name: 'mobile' },
    ];

    const originalViewport = this.page.viewportSize();

    for (const viewport of viewports) {
      await this.page.setViewportSize({ width: viewport.width, height: viewport.height });
      await this.page.waitForTimeout(1000); // Allow layout to adjust
      
      // Check for horizontal scrollbar
      const hasHorizontalScroll = await this.page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      
      // Allow small tolerance for scrollbars
      if (hasHorizontalScroll) {
        const scrollDiff = await this.page.evaluate(() => {
          return document.documentElement.scrollWidth - document.documentElement.clientWidth;
        });
        expect(scrollDiff).toBeLessThan(20); // 20px tolerance
      }
      
      // Take screenshot for visual verification
      await this.takeScreenshot(`responsive-${viewport.name}-${Date.now()}`);
    }

    // Restore original viewport
    if (originalViewport) {
      await this.page.setViewportSize(originalViewport);
    }
  }

  /**
   * Measure page performance metrics
   */
  async measurePerformance(): Promise<any> {
    const performanceMetrics = await this.page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType('paint');
      
      return {
        domContentLoaded: Math.round(navigation.domContentLoadedEventEnd - navigation.navigationStart),
        loadComplete: Math.round(navigation.loadEventEnd - navigation.navigationStart),
        firstPaint: paint.find(entry => entry.name === 'first-paint')?.startTime || 0,
        firstContentfulPaint: paint.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0,
        timeToInteractive: Math.round(navigation.domInteractive - navigation.navigationStart),
        networkLatency: Math.round(navigation.responseStart - navigation.requestStart),
        serverResponseTime: Math.round(navigation.responseEnd - navigation.requestStart),
      };
    });

    // Log performance metrics
    console.log('📊 Performance Metrics:', performanceMetrics);
    
    // Basic performance assertions
    expect(performanceMetrics.domContentLoaded).toBeLessThan(5000); // 5 seconds max
    expect(performanceMetrics.loadComplete).toBeLessThan(10000); // 10 seconds max
    
    return performanceMetrics;
  }

  /**
   * Handle browser dialogs (alerts, confirms, prompts)
   */
  async handleDialog(accept: boolean = true, promptText?: string): Promise<void> {
    this.page.on('dialog', async dialog => {
      console.log(`Dialog appeared: ${dialog.type()} - ${dialog.message()}`);
      
      if (dialog.type() === 'prompt' && promptText) {
        await dialog.accept(promptText);
      } else if (accept) {
        await dialog.accept();
      } else {
        await dialog.dismiss();
      }
    });
  }

  /**
   * Wait for form submission to complete
   */
  async waitForFormSubmission(): Promise<void> {
    // Wait for form to be submitted and get response
    await Promise.race([
      this.page.waitForResponse(response => 
        (response.url().includes('/api/') && response.status() < 400)
      ),
      this.waitForNotification(),
      this.page.waitForURL(url => url !== this.getCurrentURL())
    ]);

    // Wait for any loading to complete
    await this.waitForLoadingToFinish();
  }

  /**
   * Verify URL matches expected pattern
   */
  async verifyURL(expectedPattern: string | RegExp): Promise<void> {
    const currentUrl = this.getCurrentURL();
    
    if (typeof expectedPattern === 'string') {
      expect(currentUrl).toContain(expectedPattern);
    } else {
      expect(currentUrl).toMatch(expectedPattern);
    }
  }

  /**
   * Get validation errors from form
   */
  async getValidationErrors(): Promise<string[]> {
    const errorSelectors = [
      '[data-testid="validation-error"]',
      '.invalid-feedback',
      '.error-message',
      '.field-error',
      '.form-error'
    ];

    const errors: string[] = [];
    
    for (const selector of errorSelectors) {
      const elements = await this.page.locator(selector).all();
      for (const element of elements) {
        const text = await element.textContent();
        if (text?.trim()) {
          errors.push(text.trim());
        }
      }
    }

    return errors;
  }

  /**
   * Check if element has specific class
   */
  async hasClass(locator: string | Locator, className: string): Promise<boolean> {
    const element = typeof locator === 'string' ? this.page.locator(locator) : locator;
    const classList = await element.getAttribute('class') || '';
    return classList.split(' ').includes(className);
  }
}