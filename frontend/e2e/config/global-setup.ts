import { chromium, FullConfig } from '@playwright/test';
import { TestDataManager } from '../utils/test-data-manager';
import { ApiClient } from '../utils/api-client';

/**
 * Global setup runs before all tests
 * - Sets up test data
 * - Ensures backend services are ready
 * - Creates authentication state storage
 */
async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting global setup...');

  // Check if backend services are running
  await waitForBackendServices();

  // Initialize test data manager
  const testDataManager = new TestDataManager();
  await testDataManager.initialize();

  // Set up authentication state for tests
  await setupAuthenticationState();

  console.log('✅ Global setup completed successfully');
}

/**
 * Wait for backend services to be available
 */
async function waitForBackendServices() {
  const apiClient = new ApiClient();
  const maxRetries = 30;
  const retryDelay = 2000;

  console.log('🔍 Checking backend services availability...');

  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch('http://localhost:8080/actuator/health');
      if (response.ok) {
        console.log('✅ Backend services are ready');
        return;
      }
    } catch (error) {
      if (i === maxRetries - 1) {
        console.error('❌ Backend services not available after maximum retries');
        console.error('Please ensure all Spring Boot services are running:');
        console.error('1. Run: ./scripts/setup-local.sh');
        console.error('2. Start services: mvn spring-boot:run');
        throw new Error('Backend services not available');
      }
      
      console.log(`⏳ Waiting for backend services... Attempt ${i + 1}/${maxRetries}`);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }
}

/**
 * Set up authentication state for tests
 */
async function setupAuthenticationState() {
  console.log('🔑 Setting up authentication state...');

  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Create admin user authentication state
    await createUserAuthState(page, {
      username: 'admin@ivyarc.com',
      password: 'admin123',
      storageStatePath: 'e2e/auth-states/admin.json',
    });

    // Create regular user authentication state
    await createUserAuthState(page, {
      username: 'user@ivyarc.com', 
      password: 'user123',
      storageStatePath: 'e2e/auth-states/user.json',
    });

    // Create manager user authentication state
    await createUserAuthState(page, {
      username: 'manager@ivyarc.com',
      password: 'manager123', 
      storageStatePath: 'e2e/auth-states/manager.json',
    });

  } finally {
    await browser.close();
  }

  console.log('✅ Authentication states created');
}

/**
 * Create authentication state for a specific user
 */
async function createUserAuthState(page: any, options: {
  username: string;
  password: string;
  storageStatePath: string;
}) {
  const { username, password, storageStatePath } = options;

  try {
    // Navigate to login page
    await page.goto('http://localhost:4200/auth/login');
    await page.waitForLoadState('networkidle');

    // Fill login form
    await page.fill('[data-testid="username-input"]', username);
    await page.fill('[data-testid="password-input"]', password);
    
    // Submit login form
    await page.click('[data-testid="login-button"]');
    
    // Wait for successful login redirect
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    
    // Save authentication state
    await page.context().storageState({ path: storageStatePath });
    
    console.log(`✅ Authentication state saved for ${username}`);
  } catch (error) {
    console.warn(`⚠️  Could not create auth state for ${username}:`, error);
    // Don't fail global setup if auth state creation fails
    // Tests should handle unauthenticated state gracefully
  }
}

export default globalSetup;