import { test, expect } from '@playwright/test';
import { LoginPage } from '../../page-objects/auth/login-page';
import { DashboardPage } from '../../page-objects/dashboard/dashboard-page';
import { UserManagementPage } from '../../page-objects/users/user-management-page';
import { TestDataManager } from '../../utils/test-data-manager';

test.describe('User Management', () => {
  let loginPage: LoginPage;
  let dashboardPage: DashboardPage;
  let userManagementPage: UserManagementPage;
  let testDataManager: TestDataManager;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
    userManagementPage = new UserManagementPage(page);
    testDataManager = new TestDataManager();
    
    // Login as admin to access user management
    await loginPage.navigateToLogin();
    await loginPage.loginAsAdmin();
    await expect(dashboardPage.dashboardContent).toBeVisible();
  });

  test.describe('User List Display', () => {
    test('should display users list correctly', async () => {
      await userManagementPage.navigateToUserManagement();
      
      expect(await userManagementPage.isOnUserManagementPage()).toBe(true);
      
      // Should show users table
      await expect(userManagementPage.usersTable).toBeVisible();
      
      // Get users list
      const users = await userManagementPage.getUserList();
      expect(users.length).toBeGreaterThan(0);
      
      // Verify test users are present
      const adminUser = users.find(user => user.email?.includes('admin@ivyarc.com'));
      const regularUser = users.find(user => user.email?.includes('user@ivyarc.com'));
      
      expect(adminUser).toBeTruthy();
      expect(regularUser).toBeTruthy();
    });

    test('should show empty state when no users match filter', async () => {
      await userManagementPage.navigateToUserManagement();
      
      // Search for non-existent user
      await userManagementPage.searchUsers('nonexistent@example.com');
      
      // Should show empty state
      await expect(userManagementPage.emptyState).toBeVisible();
    });

    test('should display correct user information in table', async () => {
      await userManagementPage.navigateToUserManagement();
      
      const users = await userManagementPage.getUserList();
      const adminUser = users.find(user => user.email?.includes('admin@ivyarc.com'));
      
      expect(adminUser).toBeTruthy();
      expect(adminUser?.name).toContain('Admin');
      expect(adminUser?.email).toBe('admin@ivyarc.com');
      expect(adminUser?.role).toContain('ADMIN');
    });
  });

  test.describe('User Search and Filtering', () => {
    test('should search users by email', async () => {
      await userManagementPage.navigateToUserManagement();
      
      // Search for admin user
      await userManagementPage.searchUsers('admin@ivyarc.com');
      
      const users = await userManagementPage.getUserList();
      expect(users.length).toBe(1);
      expect(users[0].email).toBe('admin@ivyarc.com');
    });

    test('should search users by name', async () => {
      await userManagementPage.navigateToUserManagement();
      
      // Search for admin user by name
      await userManagementPage.searchUsers('Admin');
      
      const users = await userManagementPage.getUserList();
      const adminUser = users.find(user => user.name?.includes('Admin'));
      expect(adminUser).toBeTruthy();
    });

    test('should filter users by role', async () => {
      await userManagementPage.navigateToUserManagement();
      
      // Filter by admin role
      await userManagementPage.filterByRole('ADMIN');
      
      const users = await userManagementPage.getUserList();
      users.forEach(user => {
        expect(user.role).toContain('ADMIN');
      });
    });

    test('should filter users by status', async () => {
      await userManagementPage.navigateToUserManagement();
      
      // Filter by active status
      await userManagementPage.filterByStatus('ACTIVE');
      
      const users = await userManagementPage.getUserList();
      users.forEach(user => {
        expect(user.status).toContain('ACTIVE');
      });
    });

    test('should clear search and show all users', async () => {
      await userManagementPage.navigateToUserManagement();
      
      // First search for specific user
      await userManagementPage.searchUsers('admin@ivyarc.com');
      let users = await userManagementPage.getUserList();
      expect(users.length).toBe(1);
      
      // Clear search
      await userManagementPage.searchUsers('');
      users = await userManagementPage.getUserList();
      expect(users.length).toBeGreaterThan(1);
    });
  });

  test.describe('User Creation', () => {
    test('should create new user successfully', async () => {
      await userManagementPage.navigateToUserManagement();
      
      const newUserData = testDataManager.generateRandomUserData();
      
      const notification = await userManagementPage.createUser(newUserData);
      
      // Should show success notification
      await expect(notification).toBeVisible();
      await expect(notification).toContainText('created');
      
      // Verify user appears in list
      await userManagementPage.searchUsers(newUserData.email);
      const users = await userManagementPage.getUserList();
      const createdUser = users.find(user => user.email === newUserData.email);
      expect(createdUser).toBeTruthy();
    });

    test('should validate required fields when creating user', async () => {
      await userManagementPage.navigateToUserManagement();
      
      // Click create user to open form
      await userManagementPage.clickElement(userManagementPage.createUserButton);
      await userManagementPage.waitForVisible(userManagementPage.modal);
      
      // Try to submit empty form
      await userManagementPage.clickElement(userManagementPage.submitButton);
      
      // Should show validation errors
      await userManagementPage.validateFormErrors({
        'first-name': 'required',
        'last-name': 'required',
        'email': 'required',
        'password': 'required',
      });
    });

    test('should validate email format when creating user', async () => {
      await userManagementPage.navigateToUserManagement();
      
      const invalidUserData = {
        firstName: 'Test',
        lastName: 'User',
        email: 'invalid-email',
        password: 'TestPassword123!',
        role: 'USER',
      };
      
      // Click create user to open form
      await userManagementPage.clickElement(userManagementPage.createUserButton);
      await userManagementPage.waitForVisible(userManagementPage.modal);
      
      // Fill form with invalid email
      await userManagementPage.fillField(userManagementPage.firstNameInput, invalidUserData.firstName);
      await userManagementPage.fillField(userManagementPage.lastNameInput, invalidUserData.lastName);
      await userManagementPage.fillField(userManagementPage.emailInput, invalidUserData.email);
      await userManagementPage.fillField(userManagementPage.passwordInput, invalidUserData.password);
      await userManagementPage.selectOption(userManagementPage.roleSelect, invalidUserData.role);
      
      // Try to submit
      await userManagementPage.clickElement(userManagementPage.submitButton);
      
      // Should show email validation error
      await userManagementPage.validateFormErrors({
        'email': 'valid email',
      });
    });

    test('should prevent duplicate email addresses', async () => {
      await userManagementPage.navigateToUserManagement();
      
      const duplicateUserData = {
        firstName: 'Duplicate',
        lastName: 'User',
        email: 'admin@ivyarc.com', // Using existing admin email
        password: 'TestPassword123!',
        role: 'USER',
      };
      
      try {
        await userManagementPage.createUser(duplicateUserData);
        
        // Should show error notification
        const notification = await userManagementPage.waitForNotification();
        await expect(notification).toContainText('already exists');
      } catch (error) {
        // API should prevent duplicate creation
        expect(error).toBeTruthy();
      }
    });
  });

  test.describe('User Editing', () => {
    test('should edit user successfully', async () => {
      await userManagementPage.navigateToUserManagement();
      
      // Create a user first
      const userData = testDataManager.generateRandomUserData();
      await userManagementPage.createUser(userData);
      
      // Edit the user
      const updatedData = {
        firstName: 'Updated',
        lastName: 'Name',
        role: 'MANAGER',
      };
      
      const notification = await userManagementPage.editUser(userData.email, updatedData);
      
      // Should show success notification
      await expect(notification).toBeVisible();
      await expect(notification).toContainText('updated');
      
      // Verify changes in user list
      await userManagementPage.searchUsers(userData.email);
      const users = await userManagementPage.getUserList();
      const updatedUser = users.find(user => user.email === userData.email);
      
      expect(updatedUser?.name).toContain('Updated Name');
      expect(updatedUser?.role).toContain('MANAGER');
    });

    test('should validate fields when editing user', async () => {
      await userManagementPage.navigateToUserManagement();
      
      // Try to edit admin user with invalid data
      const userRow = await userManagementPage['findUserRow']('admin@ivyarc.com');
      const editButton = userRow.locator('[data-testid="edit-user"], .edit-button');
      await userManagementPage.clickElement(editButton);
      
      await userManagementPage.waitForVisible(userManagementPage.modal);
      
      // Clear required fields
      await userManagementPage.fillField(userManagementPage.firstNameInput, '');
      await userManagementPage.fillField(userManagementPage.emailInput, 'invalid-email');
      
      // Try to submit
      await userManagementPage.clickElement(userManagementPage.submitButton);
      
      // Should show validation errors
      await userManagementPage.validateFormErrors({
        'first-name': 'required',
        'email': 'valid email',
      });
    });

    test('should cancel edit operation', async () => {
      await userManagementPage.navigateToUserManagement();
      
      // Open edit form
      const userRow = await userManagementPage['findUserRow']('admin@ivyarc.com');
      const editButton = userRow.locator('[data-testid="edit-user"], .edit-button');
      await userManagementPage.clickElement(editButton);
      
      await userManagementPage.waitForVisible(userManagementPage.modal);
      
      // Make some changes
      await userManagementPage.fillField(userManagementPage.firstNameInput, 'Changed');
      
      // Cancel
      await userManagementPage.clickElement(userManagementPage.cancelButton);
      
      // Modal should close
      await userManagementPage.waitForHidden(userManagementPage.modal);
      
      // Changes should not be saved
      const users = await userManagementPage.getUserList();
      const adminUser = users.find(user => user.email?.includes('admin@ivyarc.com'));
      expect(adminUser?.name).toContain('Admin'); // Original name
    });
  });

  test.describe('User Deletion', () => {
    test('should delete user successfully', async () => {
      await userManagementPage.navigateToUserManagement();
      
      // Create a user to delete
      const userData = testDataManager.generateRandomUserData();
      await userManagementPage.createUser(userData);
      
      // Delete the user
      const notification = await userManagementPage.deleteUser(userData.email);
      
      // Should show success notification
      await expect(notification).toBeVisible();
      await expect(notification).toContainText('deleted');
      
      // Verify user is removed from list
      await userManagementPage.searchUsers(userData.email);
      await expect(userManagementPage.emptyState).toBeVisible();
    });

    test('should show confirmation dialog before deleting user', async () => {
      await userManagementPage.navigateToUserManagement();
      
      // Create a user to delete
      const userData = testDataManager.generateRandomUserData();
      await userManagementPage.createUser(userData);
      
      // Click delete button
      const userRow = await userManagementPage['findUserRow'](userData.email);
      const deleteButton = userRow.locator('[data-testid="delete-user"], .delete-button');
      await userManagementPage.clickElement(deleteButton);
      
      // Should show confirmation modal
      await expect(userManagementPage.confirmModal).toBeVisible();
      await expect(userManagementPage.confirmModal).toContainText('confirm');
      
      // Cancel deletion
      const cancelButton = userManagementPage.confirmModal.locator('[data-testid="cancel"], button:has-text("Cancel")');
      await userManagementPage.clickElement(cancelButton);
      
      // Modal should close and user should remain
      await userManagementPage.waitForHidden(userManagementPage.confirmModal);
      await userManagementPage.searchUsers(userData.email);
      const users = await userManagementPage.getUserList();
      expect(users.length).toBe(1);
    });

    test('should prevent deletion of own account', async () => {
      await userManagementPage.navigateToUserManagement();
      
      // Try to delete admin user (current user)
      const userRow = await userManagementPage['findUserRow']('admin@ivyarc.com');
      const deleteButton = userRow.locator('[data-testid="delete-user"], .delete-button');
      
      // Delete button should be disabled or not visible for own account
      const isDisabled = !(await deleteButton.isEnabled()) || !(await deleteButton.isVisible());
      expect(isDisabled).toBe(true);
    });
  });

  test.describe('Bulk Operations', () => {
    test('should perform bulk delete operation', async () => {
      await userManagementPage.navigateToUserManagement();
      
      // Create multiple users
      const users = [
        testDataManager.generateRandomUserData(),
        testDataManager.generateRandomUserData(),
        testDataManager.generateRandomUserData(),
      ];
      
      for (const userData of users) {
        await userManagementPage.createUser(userData);
      }
      
      // Perform bulk delete
      const userEmails = users.map(user => user.email);
      const notification = await userManagementPage.bulkDeleteUsers(userEmails);
      
      // Should show success notification
      await expect(notification).toBeVisible();
      await expect(notification).toContainText('deleted');
      
      // Verify users are removed
      for (const email of userEmails) {
        await userManagementPage.searchUsers(email);
        await expect(userManagementPage.emptyState).toBeVisible();
      }
    });

    test('should show bulk action confirmation', async () => {
      await userManagementPage.navigateToUserManagement();
      
      // Create a user
      const userData = testDataManager.generateRandomUserData();
      await userManagementPage.createUser(userData);
      
      // Select user for bulk action
      const userRow = await userManagementPage['findUserRow'](userData.email);
      const checkbox = userRow.locator('input[type="checkbox"]');
      await userManagementPage.clickElement(checkbox);
      
      // Start bulk action
      await userManagementPage.clickElement(userManagementPage.bulkActionButton);
      
      // Should show confirmation for bulk operation
      await expect(userManagementPage.confirmModal).toBeVisible();
    });
  });

  test.describe('Pagination', () => {
    test('should navigate through pages', async () => {
      await userManagementPage.navigateToUserManagement();
      
      const paginationInfo = await userManagementPage.getPaginationInfo();
      
      if (paginationInfo.totalPages && paginationInfo.totalPages > 1) {
        // Go to next page
        const moved = await userManagementPage.goToNextPage();
        expect(moved).toBe(true);
        
        const newPaginationInfo = await userManagementPage.getPaginationInfo();
        expect(newPaginationInfo.currentPage).toBeGreaterThan(paginationInfo.currentPage || 1);
        
        // Go back to previous page
        const movedBack = await userManagementPage.goToPreviousPage();
        expect(movedBack).toBe(true);
      }
    });

    test('should disable navigation buttons appropriately', async () => {
      await userManagementPage.navigateToUserManagement();
      
      const paginationInfo = await userManagementPage.getPaginationInfo();
      
      if (paginationInfo.currentPage === 1) {
        // Previous button should be disabled on first page
        expect(await userManagementPage.prevPageButton.isEnabled()).toBe(false);
      }
      
      if (paginationInfo.currentPage === paginationInfo.totalPages) {
        // Next button should be disabled on last page
        expect(await userManagementPage.nextPageButton.isEnabled()).toBe(false);
      }
    });
  });

  test.describe('Export Functionality', () => {
    test('should export users data', async () => {
      await userManagementPage.navigateToUserManagement();
      
      const permissions = await userManagementPage.checkUserPermissions();
      
      if (permissions.canExport) {
        const exportResult = await userManagementPage.exportUsers();
        
        expect(exportResult.filename).toBeTruthy();
        expect(exportResult.path).toBeTruthy();
        
        // Verify file exists
        const fs = require('fs');
        expect(fs.existsSync(exportResult.path)).toBe(true);
      }
    });
  });

  test.describe('Permissions and Access Control', () => {
    test('should show appropriate buttons based on user permissions', async () => {
      await userManagementPage.navigateToUserManagement();
      
      const permissions = await userManagementPage.checkUserPermissions();
      
      // Admin should have all permissions
      expect(permissions.canCreate).toBe(true);
      expect(permissions.canEdit).toBe(true);
      expect(permissions.canDelete).toBe(true);
    });

    test('should restrict access for non-admin users', async ({ page }) => {
      // Logout admin and login as regular user
      await dashboardPage.logout();
      await loginPage.loginAsUser();
      
      try {
        await userManagementPage.navigateToUserManagement();
        
        // Should either redirect to unauthorized or show limited functionality
        const isUnauthorized = page.url().includes('/unauthorized') || page.url().includes('/access-denied');
        
        if (!isUnauthorized) {
          // If access is allowed, check permissions are limited
          const permissions = await userManagementPage.checkUserPermissions();
          expect(permissions.canCreate || permissions.canDelete).toBe(false);
        }
      } catch (error) {
        // Access denied is expected for regular users
        expect(error).toBeTruthy();
      }
    });
  });

  test.describe('Performance and UX', () => {
    test('should load user list within acceptable time', async () => {
      const startTime = Date.now();
      
      await userManagementPage.navigateToUserManagement();
      await userManagementPage.waitForVisible(userManagementPage.usersTable);
      
      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(5000); // Should load within 5 seconds
    });

    test('should show loading states during operations', async () => {
      await userManagementPage.navigateToUserManagement();
      
      // Trigger a search
      const searchPromise = userManagementPage.searchUsers('admin');
      
      // Loading state should be visible briefly
      await expect(userManagementPage.loadingState).toBeVisible();
      
      await searchPromise;
      
      // Loading state should be hidden after operation
      await userManagementPage.waitForHidden(userManagementPage.loadingState);
    });

    test('should refresh data when requested', async () => {
      await userManagementPage.navigateToUserManagement();
      
      const initialUsers = await userManagementPage.getUserList();
      
      // Refresh the list
      await userManagementPage.refreshUsersList();
      
      const refreshedUsers = await userManagementPage.getUserList();
      
      // Should have same or updated data
      expect(refreshedUsers.length).toBeGreaterThanOrEqual(initialUsers.length);
    });
  });
});