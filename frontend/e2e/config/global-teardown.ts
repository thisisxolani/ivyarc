import { TestDataManager } from '../utils/test-data-manager';

/**
 * Global teardown runs after all tests complete
 * - Cleans up test data
 * - Removes temporary files
 * - Generates test report summary
 */
async function globalTeardown() {
  console.log('🧹 Starting global teardown...');

  try {
    // Clean up test data
    const testDataManager = new TestDataManager();
    await testDataManager.cleanup();

    // Clean up authentication state files
    await cleanupAuthStates();

    // Generate test summary
    await generateTestSummary();

    console.log('✅ Global teardown completed successfully');
  } catch (error) {
    console.error('❌ Error during global teardown:', error);
    // Don't throw error to prevent masking test failures
  }
}

/**
 * Clean up authentication state files
 */
async function cleanupAuthStates() {
  console.log('🔑 Cleaning up authentication states...');
  
  const fs = await import('fs/promises');
  const path = await import('path');
  
  try {
    const authStatesDir = 'e2e/auth-states';
    const exists = await fs.access(authStatesDir).then(() => true).catch(() => false);
    
    if (exists) {
      const files = await fs.readdir(authStatesDir);
      for (const file of files) {
        if (file.endsWith('.json')) {
          await fs.unlink(path.join(authStatesDir, file));
        }
      }
      console.log('✅ Authentication state files cleaned up');
    }
  } catch (error) {
    console.warn('⚠️  Could not clean up auth states:', error);
  }
}

/**
 * Generate test execution summary
 */
async function generateTestSummary() {
  console.log('📊 Generating test summary...');
  
  try {
    const fs = await import('fs/promises');
    
    // Check if test results exist
    const resultsPath = 'test-results/results.json';
    const exists = await fs.access(resultsPath).then(() => true).catch(() => false);
    
    if (exists) {
      const results = JSON.parse(await fs.readFile(resultsPath, 'utf-8'));
      
      const summary = {
        totalTests: results.stats?.total || 0,
        passed: results.stats?.passed || 0,
        failed: results.stats?.failed || 0,
        skipped: results.stats?.skipped || 0,
        duration: results.stats?.duration || 0,
        timestamp: new Date().toISOString(),
        reportPath: 'playwright-report/index.html',
      };
      
      console.log('📈 Test Execution Summary:');
      console.log(`   Total Tests: ${summary.totalTests}`);
      console.log(`   Passed: ${summary.passed}`);
      console.log(`   Failed: ${summary.failed}`);
      console.log(`   Skipped: ${summary.skipped}`);
      console.log(`   Duration: ${Math.round(summary.duration / 1000)}s`);
      console.log(`   Report: ${summary.reportPath}`);
      
      // Save summary for CI/CD
      await fs.writeFile('test-results/summary.json', JSON.stringify(summary, null, 2));
    }
  } catch (error) {
    console.warn('⚠️  Could not generate test summary:', error);
  }
}

export default globalTeardown;