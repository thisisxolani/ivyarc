import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base-page';

/**
 * User Management Page Object Model
 * Handles all user management related interactions and validations
 */
export class UserManagementPage extends BasePage {
  // Page elements
  readonly pageTitle: Locator;
  readonly createUserButton: Locator;
  readonly userTable: Locator;
  readonly searchInput: Locator;
  readonly filterDropdown: Locator;
  readonly sortDropdown: Locator;
  readonly bulkActionsDropdown: Locator;
  readonly selectAllCheckbox: Locator;
  readonly paginationContainer: Locator;
  readonly itemsPerPageSelect: Locator;
  readonly exportButton: Locator;
  readonly importButton: Locator;
  readonly refreshButton: Locator;

  // Modal elements
  readonly modal: Locator;
  readonly modalTitle: Locator;
  readonly modalCloseButton: Locator;
  readonly saveButton: Locator;
  readonly cancelButton: Locator;

  // Form elements
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly emailInput: Locator;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly roleSelect: Locator;
  readonly statusSelect: Locator;
  readonly phoneInput: Locator;
  readonly departmentInput: Locator;

  constructor(page: Page) {
    super(page);
    
    // Initialize page elements
    this.pageTitle = page.locator('[data-testid="page-title"], h1, .page-header h1');
    this.createUserButton = page.locator('[data-testid="create-user"], .create-user-btn, button:has-text("Create User")');
    this.userTable = page.locator('[data-testid="user-table"], .user-table, .data-table');
    this.searchInput = page.locator('[data-testid="search-users"], .search-input, input[placeholder*="Search"]');
    this.filterDropdown = page.locator('[data-testid="filter-dropdown"], .filter-dropdown');
    this.sortDropdown = page.locator('[data-testid="sort-dropdown"], .sort-dropdown');
    this.bulkActionsDropdown = page.locator('[data-testid="bulk-actions"], .bulk-actions');
    this.selectAllCheckbox = page.locator('[data-testid="select-all"], .select-all-checkbox');
    this.paginationContainer = page.locator('[data-testid="pagination"], .pagination');
    this.itemsPerPageSelect = page.locator('[data-testid="items-per-page"], .items-per-page');
    this.exportButton = page.locator('[data-testid="export"], .export-btn');
    this.importButton = page.locator('[data-testid="import"], .import-btn');
    this.refreshButton = page.locator('[data-testid="refresh"], .refresh-btn');

    // Modal elements
    this.modal = page.locator('[data-testid="user-modal"], .modal, .dialog');
    this.modalTitle = page.locator('[data-testid="modal-title"], .modal-title, .dialog-title');
    this.modalCloseButton = page.locator('[data-testid="modal-close"], .modal-close, .close-btn');
    this.saveButton = page.locator('[data-testid="save-user"], .save-btn, button[type="submit"]');
    this.cancelButton = page.locator('[data-testid="cancel"], .cancel-btn');

    // Form elements
    this.firstNameInput = page.locator('[data-testid="first-name"], [name="firstName"], [id*="firstName"]');
    this.lastNameInput = page.locator('[data-testid="last-name"], [name="lastName"], [id*="lastName"]');
    this.emailInput = page.locator('[data-testid="email"], [name="email"], [id*="email"]');
    this.usernameInput = page.locator('[data-testid="username"], [name="username"], [id*="username"]');
    this.passwordInput = page.locator('[data-testid="password"], [name="password"], [id*="password"]');
    this.confirmPasswordInput = page.locator('[data-testid="confirm-password"], [name="confirmPassword"], [id*="confirmPassword"]');
    this.roleSelect = page.locator('[data-testid="role"], [name="role"], [id*="role"]');
    this.statusSelect = page.locator('[data-testid="status"], [name="status"], [id*="status"]');
    this.phoneInput = page.locator('[data-testid="phone"], [name="phone"], [id*="phone"]');
    this.departmentInput = page.locator('[data-testid="department"], [name="department"], [id*="department"]');
  }

  /**
   * Navigate to user management page
   */
  async navigateToUserManagement(): Promise<void> {
    await this.goto('/users');
    await this.waitForPageLoad();
    await this.verifyUserManagementPageLoaded();
  }

  /**
   * Verify user management page has loaded correctly
   */
  async verifyUserManagementPageLoaded(): Promise<void> {
    await this.waitForVisible(this.userTable);
    await this.waitForVisible(this.createUserButton);
    
    const title = await this.getTitle();
    expect(title).toContain('User');
  }

  /**
   * Click create user button
   */
  async clickCreateUser(): Promise<void> {
    await this.clickElement(this.createUserButton);
    await this.waitForVisible(this.modal);
  }

  /**
   * Fill user form
   */
  async fillUserForm(userData: {
    firstName: string;
    lastName: string;
    email: string;
    username?: string;
    password?: string;
    confirmPassword?: string;
    role?: string;
    status?: string;
    phone?: string;
    department?: string;
  }): Promise<void> {
    await this.fillField(this.firstNameInput, userData.firstName);
    await this.fillField(this.lastNameInput, userData.lastName);
    await this.fillField(this.emailInput, userData.email);
    
    if (userData.username && await this.usernameInput.isVisible()) {
      await this.fillField(this.usernameInput, userData.username);
    }
    
    if (userData.password && await this.passwordInput.isVisible()) {
      await this.fillField(this.passwordInput, userData.password);
    }
    
    if (userData.confirmPassword && await this.confirmPasswordInput.isVisible()) {
      await this.fillField(this.confirmPasswordInput, userData.confirmPassword);
    }
    
    if (userData.role && await this.roleSelect.isVisible()) {
      await this.selectOption(this.roleSelect, userData.role);
    }
    
    if (userData.status && await this.statusSelect.isVisible()) {
      await this.selectOption(this.statusSelect, userData.status);
    }
    
    if (userData.phone && await this.phoneInput.isVisible()) {
      await this.fillField(this.phoneInput, userData.phone);
    }
    
    if (userData.department && await this.departmentInput.isVisible()) {
      await this.fillField(this.departmentInput, userData.department);
    }
  }

  /**
   * Save user form
   */
  async saveUser(): Promise<void> {
    await this.clickElement(this.saveButton);
    await this.waitForLoadingToFinish();
    
    // Wait for modal to close or success notification
    try {
      await this.waitForHidden(this.modal, 5000);
    } catch {
      // Modal might still be open if there's an error
      const hasError = await this.hasErrors();
      if (hasError) {
        const errors = await this.getErrorMessages();
        console.log('Form errors:', errors);
        throw new Error(`User creation failed: ${errors.join(', ')}`);
      }
    }
  }

  /**
   * Cancel user form
   */
  async cancelUserForm(): Promise<void> {
    await this.clickElement(this.cancelButton);
    await this.waitForHidden(this.modal);
  }

  /**
   * Create a new user
   */
  async createUser(userData: {
    firstName: string;
    lastName: string;
    email: string;
    username?: string;
    password?: string;
    role?: string;
    status?: string;
    phone?: string;
    department?: string;
  }): Promise<void> {
    await this.clickCreateUser();
    
    const userFormData = {
      ...userData,
      confirmPassword: userData.password // Assume confirm password matches password
    };
    
    await this.fillUserForm(userFormData);
    await this.saveUser();
    
    // Wait for success notification
    await this.waitForNotification('User created successfully');
  }

  /**
   * Search for users
   */
  async searchUsers(searchTerm: string): Promise<void> {
    await this.fillField(this.searchInput, searchTerm);
    await this.page.waitForTimeout(1000); // Allow debounced search
    await this.waitForLoadingToFinish();
  }

  /**
   * Get user table data
   */
  async getUserTableData(): Promise<any[]> {
    const rows = await this.userTable.locator('tbody tr, .table-row').all();
    const users: any[] = [];
    
    for (const row of rows) {
      const cells = await row.locator('td, .table-cell').all();
      const user: any = {};
      
      if (cells.length > 0) {
        user.name = await this.getTextContent(cells[0]);
        user.email = await this.getTextContent(cells[1]);
        if (cells.length > 2) user.role = await this.getTextContent(cells[2]);
        if (cells.length > 3) user.status = await this.getTextContent(cells[3]);
        if (cells.length > 4) user.createdAt = await this.getTextContent(cells[4]);
      }
      
      users.push(user);
    }
    
    return users;
  }

  /**
   * Get total user count
   */
  async getTotalUserCount(): Promise<number> {
    const countElement = this.page.locator('[data-testid="total-count"], .total-count, .record-count');
    
    if (await countElement.isVisible()) {
      const countText = await this.getTextContent(countElement);
      const match = countText.match(/\d+/);
      return match ? parseInt(match[0]) : 0;
    }
    
    // Fallback: count visible rows
    const rows = await this.userTable.locator('tbody tr, .table-row').count();
    return rows;
  }

  /**
   * Select user by email
   */
  async selectUserByEmail(email: string): Promise<void> {
    const userRow = this.page.locator(`tr:has-text("${email}"), .table-row:has-text("${email}")`);
    const checkbox = userRow.locator('input[type="checkbox"], .row-checkbox');
    await this.clickElement(checkbox);
  }

  /**
   * Edit user by email
   */
  async editUserByEmail(email: string): Promise<void> {
    const userRow = this.page.locator(`tr:has-text("${email}"), .table-row:has-text("${email}")`);
    const editButton = userRow.locator('[data-testid="edit"], .edit-btn, button:has-text("Edit")');
    await this.clickElement(editButton);
    await this.waitForVisible(this.modal);
  }

  /**
   * Delete user by email
   */
  async deleteUserByEmail(email: string): Promise<void> {
    const userRow = this.page.locator(`tr:has-text("${email}"), .table-row:has-text("${email}")`);
    const deleteButton = userRow.locator('[data-testid="delete"], .delete-btn, button:has-text("Delete")');
    await this.clickElement(deleteButton);
    
    // Handle confirmation dialog
    await this.handleDialog(true);
    await this.waitForLoadingToFinish();
    
    // Wait for success notification
    await this.waitForNotification('User deleted successfully');
  }

  /**
   * View user details by email
   */
  async viewUserByEmail(email: string): Promise<void> {
    const userRow = this.page.locator(`tr:has-text("${email}"), .table-row:has-text("${email}")`);
    const viewButton = userRow.locator('[data-testid="view"], .view-btn, button:has-text("View")');
    
    if (await viewButton.isVisible()) {
      await this.clickElement(viewButton);
    } else {
      // Click on user name/email to view
      await this.clickElement(userRow);
    }
    
    await this.waitForPageLoad();
  }

  /**
   * Update existing user
   */
  async updateUser(email: string, userData: Partial<{
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    status: string;
    phone: string;
    department: string;
  }>): Promise<void> {
    await this.editUserByEmail(email);
    await this.fillUserForm(userData as any);
    await this.saveUser();
    
    // Wait for success notification
    await this.waitForNotification('User updated successfully');
  }

  /**
   * Filter users by role
   */
  async filterUsersByRole(role: string): Promise<void> {
    if (await this.filterDropdown.isVisible()) {
      await this.clickElement(this.filterDropdown);
      await this.page.waitForTimeout(500);
      
      const roleOption = this.page.locator(`[data-testid="filter-${role}"], .filter-option:has-text("${role}")`);
      await this.clickElement(roleOption);
      await this.waitForLoadingToFinish();
    }
  }

  /**
   * Sort users by column
   */
  async sortUsersByColumn(column: string): Promise<void> {
    const columnHeader = this.page.locator(`[data-testid="sort-${column}"], th:has-text("${column}"), .sortable:has-text("${column}")`);
    
    if (await columnHeader.isVisible()) {
      await this.clickElement(columnHeader);
      await this.waitForLoadingToFinish();
    } else if (await this.sortDropdown.isVisible()) {
      await this.clickElement(this.sortDropdown);
      const sortOption = this.page.locator(`.sort-option:has-text("${column}")`);
      await this.clickElement(sortOption);
      await this.waitForLoadingToFinish();
    }
  }

  /**
   * Select all users
   */
  async selectAllUsers(): Promise<void> {
    await this.clickElement(this.selectAllCheckbox);
    await this.page.waitForTimeout(500);
  }

  /**
   * Perform bulk action
   */
  async performBulkAction(action: string): Promise<void> {
    await this.clickElement(this.bulkActionsDropdown);
    await this.page.waitForTimeout(500);
    
    const actionOption = this.page.locator(`[data-testid="bulk-${action}"], .bulk-action:has-text("${action}")`);
    await this.clickElement(actionOption);
    
    // Handle confirmation if needed
    await this.handleDialog(true);
    await this.waitForLoadingToFinish();
  }

  /**
   * Change pagination
   */
  async goToPage(pageNumber: number): Promise<void> {
    const pageButton = this.page.locator(`[data-testid="page-${pageNumber}"], .page-btn:has-text("${pageNumber}")`);
    
    if (await pageButton.isVisible()) {
      await this.clickElement(pageButton);
      await this.waitForLoadingToFinish();
    }
  }

  /**
   * Change items per page
   */
  async changeItemsPerPage(itemsCount: string): Promise<void> {
    if (await this.itemsPerPageSelect.isVisible()) {
      await this.selectOption(this.itemsPerPageSelect, itemsCount);
      await this.waitForLoadingToFinish();
    }
  }

  /**
   * Export users
   */
  async exportUsers(format: string = 'csv'): Promise<void> {
    if (await this.exportButton.isVisible()) {
      await this.clickElement(this.exportButton);
      
      // Select format if dropdown appears
      const formatOption = this.page.locator(`[data-testid="export-${format}"], .export-option:has-text("${format.toUpperCase()}")`);
      if (await formatOption.isVisible()) {
        await this.clickElement(formatOption);
      }
      
      await this.page.waitForTimeout(2000); // Allow download to start
    }
  }

  /**
   * Verify user creation form validation
   */
  async verifyUserFormValidation(): Promise<void> {
    await this.clickCreateUser();
    
    // Try to save empty form
    await this.clickElement(this.saveButton);
    
    // Check validation errors
    const validationErrors = await this.getValidationErrors();
    expect(validationErrors.length).toBeGreaterThan(0);
    
    console.log('Validation errors:', validationErrors);
    
    // Cancel form
    await this.cancelUserForm();
  }

  /**
   * Test user form with invalid data
   */
  async testInvalidUserData(): Promise<void> {
    const invalidTestCases = [
      {
        data: { firstName: '', lastName: 'Test', email: 'invalid-email' },
        expectedErrors: ['First name is required', 'Invalid email format']
      },
      {
        data: { firstName: 'Test', lastName: '', email: 'test@example.com', password: '123' },
        expectedErrors: ['Last name is required', 'Password too short']
      },
      {
        data: { firstName: 'Test', lastName: 'User', email: 'test@example.com', password: 'password', confirmPassword: 'different' },
        expectedErrors: ['Passwords do not match']
      }
    ];

    for (const testCase of invalidTestCases) {
      await this.clickCreateUser();
      await this.fillUserForm(testCase.data as any);
      await this.clickElement(this.saveButton);
      
      const errors = await this.getValidationErrors();
      expect(errors.length).toBeGreaterThan(0);
      
      console.log(`Test case errors:`, errors);
      
      await this.cancelUserForm();
      await this.page.waitForTimeout(1000);
    }
  }

  /**
   * Verify user table sorting
   */
  async verifyTableSorting(): Promise<void> {
    const columns = ['Name', 'Email', 'Role', 'Status'];
    
    for (const column of columns) {
      const columnExists = await this.page.locator(`th:has-text("${column}"), .column-header:has-text("${column}")`).count() > 0;
      
      if (columnExists) {
        console.log(`Testing sort for column: ${column}`);
        
        // Get initial data
        const initialData = await this.getUserTableData();
        
        // Sort by column
        await this.sortUsersByColumn(column);
        
        // Get sorted data
        const sortedData = await this.getUserTableData();
        
        // Verify data changed (assuming there's more than one user)
        if (initialData.length > 1) {
          expect(JSON.stringify(initialData)).not.toBe(JSON.stringify(sortedData));
        }
      }
    }
  }

  /**
   * Verify user search functionality
   */
  async verifySearchFunctionality(): Promise<void> {
    // Get total count before search
    const totalCount = await this.getTotalUserCount();
    
    if (totalCount > 0) {
      // Get first user's email for search
      const users = await this.getUserTableData();
      if (users.length > 0 && users[0].email) {
        const searchEmail = users[0].email.split('@')[0]; // Search by email prefix
        
        await this.searchUsers(searchEmail);
        
        const searchResults = await this.getUserTableData();
        expect(searchResults.length).toBeGreaterThan(0);
        
        // Verify search results contain the search term
        const foundUser = searchResults.find(user => 
          user.email && user.email.toLowerCase().includes(searchEmail.toLowerCase())
        );
        expect(foundUser).toBeTruthy();
        
        // Clear search
        await this.searchUsers('');
        await this.page.waitForTimeout(1000);
      }
    }
  }

  /**
   * Test complete user lifecycle
   */
  async testUserLifecycle(): Promise<void> {
    const testUser = {
      firstName: 'Test',
      lastName: 'User',
      email: `testuser${Date.now()}@example.com`,
      role: 'USER',
      status: 'ACTIVE',
      phone: '+1234567890',
      department: 'IT'
    };

    console.log('Creating test user:', testUser.email);
    
    // Create user
    await this.createUser(testUser);
    
    // Verify user appears in table
    await this.searchUsers(testUser.email);
    const users = await this.getUserTableData();
    const createdUser = users.find(user => user.email === testUser.email);
    expect(createdUser).toBeTruthy();
    
    // Update user
    console.log('Updating test user');
    await this.updateUser(testUser.email, {
      firstName: 'Updated',
      department: 'HR'
    });
    
    // Verify update
    await this.searchUsers(testUser.email);
    const updatedUsers = await this.getUserTableData();
    const updatedUser = updatedUsers.find(user => user.email === testUser.email);
    expect(updatedUser?.name).toContain('Updated');
    
    // Delete user
    console.log('Deleting test user');
    await this.deleteUserByEmail(testUser.email);
    
    // Verify user is deleted
    await this.searchUsers(testUser.email);
    const remainingUsers = await this.getUserTableData();
    const deletedUser = remainingUsers.find(user => user.email === testUser.email);
    expect(deletedUser).toBeFalsy();
    
    console.log('User lifecycle test completed successfully');
  }
}