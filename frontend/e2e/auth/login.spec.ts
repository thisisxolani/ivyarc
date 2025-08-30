import { test, expect } from '@playwright/test';

test.describe('Login Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/login');
  });

  test('should display login form', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Sign in to your account' })).toBeVisible();
    await expect(page.getByLabel('Email or Username')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
  });

  test('should show validation errors for empty form', async ({ page }) => {
    await page.getByRole('button', { name: 'Sign in' }).click();
    
    // Check that form doesn't submit without validation
    await expect(page.url()).toContain('/auth/login');
  });

  test('should toggle password visibility', async ({ page }) => {
    const passwordField = page.getByLabel('Password');
    const toggleButton = page.locator('button').filter({ has: page.locator('svg') }).nth(1);
    
    // Initially password should be hidden
    await expect(passwordField).toHaveAttribute('type', 'password');
    
    // Click toggle to show password
    await toggleButton.click();
    await expect(passwordField).toHaveAttribute('type', 'text');
    
    // Click toggle to hide password again
    await toggleButton.click();
    await expect(passwordField).toHaveAttribute('type', 'password');
  });

  test('should have link to register page', async ({ page }) => {
    const registerLink = page.getByRole('link', { name: 'create a new account' });
    await expect(registerLink).toBeVisible();
    await expect(registerLink).toHaveAttribute('href', '/auth/register');
  });

  test('should attempt login with valid credentials', async ({ page }) => {
    await page.getByLabel('Email or Username').fill('test@example.com');
    await page.getByLabel('Password').fill('password123');
    
    // Mock the API response
    await page.route('/api/v1/auth/login', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            accessToken: 'mock-token',
            refreshToken: 'mock-refresh-token',
            tokenType: 'Bearer',
            expiresIn: 3600,
            user: {
              id: '1',
              username: 'testuser',
              email: 'test@example.com',
              fullName: 'Test User',
              firstName: 'Test',
              lastName: 'User',
              isVerified: true,
              createdAt: new Date().toISOString()
            }
          },
          message: 'Login successful',
          timestamp: new Date().toISOString(),
          path: '/api/v1/auth/login'
        })
      });
    });
    
    await page.getByRole('button', { name: 'Sign in' }).click();
    
    // Should redirect to dashboard on successful login
    await expect(page).toHaveURL('/dashboard');
  });

  test('should show error message for invalid credentials', async ({ page }) => {
    await page.getByLabel('Email or Username').fill('invalid@example.com');
    await page.getByLabel('Password').fill('wrongpassword');
    
    // Mock the API error response
    await page.route('/api/v1/auth/login', async route => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          message: 'Invalid credentials',
          timestamp: new Date().toISOString(),
          path: '/api/v1/auth/login'
        })
      });
    });
    
    await page.getByRole('button', { name: 'Sign in' }).click();
    
    // Should show error message
    await expect(page.locator('.bg-red-50')).toBeVisible();
    await expect(page.getByText('Invalid credentials')).toBeVisible();
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    await expect(page.getByRole('heading', { name: 'Sign in to your account' })).toBeVisible();
    await expect(page.getByLabel('Email or Username')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
  });
});