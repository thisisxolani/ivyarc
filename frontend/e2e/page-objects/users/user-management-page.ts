import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '../base-page';

/**
 * Page Object for User Management functionality
 * Handles CRUD operations for users and user-related actions
 */
export class UserManagementPage extends BasePage {
  // Table and list elements
  readonly usersTable: Locator;
  readonly userRows: Locator;
  readonly tableHeaders: Locator;
  readonly emptyState: Locator;
  readonly loadingState: Locator;

  // Action buttons
  readonly createUserButton: Locator;
  readonly editUserButton: Locator;
  readonly deleteUserButton: Locator;
  readonly bulkActionButton: Locator;
  readonly exportButton: Locator;
  readonly refreshButton: Locator;

  // Search and filters
  readonly searchInput: Locator;
  readonly roleFilter: Locator;
  readonly statusFilter: Locator;
  readonly sortOptions: Locator;

  // User form elements
  readonly userForm: Locator;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly emailInput: Locator;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly roleSelect: Locator;
  readonly statusSelect: Locator;
  readonly submitButton: Locator;
  readonly cancelButton: Locator;

  // Modal elements
  readonly modal: Locator;
  readonly modalTitle: Locator;
  readonly modalContent: Locator;
  readonly modalClose: Locator;
  readonly confirmModal: Locator;
  readonly confirmButton: Locator;

  // Pagination
  readonly pagination: Locator;
  readonly nextPageButton: Locator;
  readonly prevPageButton: Locator;
  readonly pageInfo: Locator;

  constructor(page: Page) {
    super(page);
    
    // Table elements
    this.usersTable = page.locator('[data-testid="users-table"], .users-table, table');
    this.userRows = page.locator('[data-testid="user-row"], .user-row, tbody tr');
    this.tableHeaders = page.locator('[data-testid="table-header"], th');
    this.emptyState = page.locator('[data-testid="empty-state"], .empty-state');
    this.loadingState = page.locator('[data-testid="loading"], .loading');

    // Action buttons
    this.createUserButton = page.locator('[data-testid="create-user"], button:has-text("Add User"), button:has-text("Create User")');
    this.editUserButton = page.locator('[data-testid="edit-user"], .edit-button');
    this.deleteUserButton = page.locator('[data-testid="delete-user"], .delete-button');
    this.bulkActionButton = page.locator('[data-testid="bulk-action"], .bulk-action');
    this.exportButton = page.locator('[data-testid="export"], button:has-text("Export")');
    this.refreshButton = page.locator('[data-testid="refresh"], .refresh-button');

    // Search and filters
    this.searchInput = page.locator('[data-testid="search-input"], input[placeholder*="search"], .search-input');
    this.roleFilter = page.locator('[data-testid="role-filter"], select[name="role"]');
    this.statusFilter = page.locator('[data-testid="status-filter"], select[name="status"]');
    this.sortOptions = page.locator('[data-testid="sort-options"], .sort-select');

    // Form elements
    this.userForm = page.locator('[data-testid="user-form"], .user-form, form');
    this.firstNameInput = page.locator('[data-testid="first-name"], input[name="firstName"]');
    this.lastNameInput = page.locator('[data-testid="last-name"], input[name="lastName"]');
    this.emailInput = page.locator('[data-testid="email"], input[name="email"]');
    this.usernameInput = page.locator('[data-testid="username"], input[name="username"]');
    this.passwordInput = page.locator('[data-testid="password"], input[name="password"]');
    this.confirmPasswordInput = page.locator('[data-testid="confirm-password"], input[name="confirmPassword"]');
    this.roleSelect = page.locator('[data-testid="role-select"], select[name="role"]');
    this.statusSelect = page.locator('[data-testid="status-select"], select[name="status"]');
    this.submitButton = page.locator('[data-testid="submit"], button[type="submit"], button:has-text("Save")');
    this.cancelButton = page.locator('[data-testid="cancel"], button:has-text("Cancel")');

    // Modal elements
    this.modal = page.locator('[data-testid="modal"], .modal, .dialog');
    this.modalTitle = page.locator('[data-testid="modal-title"], .modal-title');
    this.modalContent = page.locator('[data-testid="modal-content"], .modal-content');
    this.modalClose = page.locator('[data-testid="modal-close"], .modal-close');
    this.confirmModal = page.locator('[data-testid="confirm-modal"], .confirm-dialog');
    this.confirmButton = page.locator('[data-testid="confirm"], button:has-text("Confirm"), button:has-text("Delete")');

    // Pagination
    this.pagination = page.locator('[data-testid="pagination"], .pagination');
    this.nextPageButton = page.locator('[data-testid="next-page"], .next-page');
    this.prevPageButton = page.locator('[data-testid="prev-page"], .prev-page');
    this.pageInfo = page.locator('[data-testid="page-info"], .page-info');
  }

  /**
   * Navigate to user management page
   */
  async navigateToUserManagement() {
    await this.goto('/users');
    await this.waitForPageLoad();
    await this.waitForLoadingToFinish();
  }

  /**
   * Check if on user management page
   */
  async isOnUserManagementPage(): Promise<boolean> {
    return this.page.url().includes('/users') && await this.usersTable.isVisible();
  }

  /**
   * Get list of users from table
   */
  async getUserList(): Promise<Array<{
    id?: string;
    name?: string;
    email?: string;
    role?: string;
    status?: string;
  }>> {
    const users: Array<any> = [];
    
    await this.waitForVisible(this.usersTable);
    const rowCount = await this.userRows.count();
    
    for (let i = 0; i < rowCount; i++) {
      const row = this.userRows.nth(i);
      const cells = row.locator('td');
      const cellCount = await cells.count();
      
      const user: any = {};
      
      // Extract data based on common table structure
      if (cellCount >= 3) {
        user.name = (await cells.nth(0).textContent())?.trim();
        user.email = (await cells.nth(1).textContent())?.trim();
        user.role = (await cells.nth(2).textContent())?.trim();
        if (cellCount >= 4) {
          user.status = (await cells.nth(3).textContent())?.trim();
        }
      }
      
      users.push(user);
    }
    
    return users;
  }

  /**
   * Search for users
   */
  async searchUsers(searchTerm: string) {
    await this.fillField(this.searchInput, searchTerm);
    await this.waitForAPIResponse('/api/v1/users');
    await this.waitForLoadingToFinish();
  }

  /**
   * Filter users by role
   */
  async filterByRole(role: string) {
    await this.selectOption(this.roleFilter, role);
    await this.waitForAPIResponse('/api/v1/users');
    await this.waitForLoadingToFinish();
  }

  /**
   * Filter users by status
   */
  async filterByStatus(status: string) {
    await this.selectOption(this.statusFilter, status);
    await this.waitForAPIResponse('/api/v1/users');
    await this.waitForLoadingToFinish();
  }

  /**
   * Create new user
   */
  async createUser(userData: {
    firstName: string;
    lastName: string;
    email: string;
    username?: string;
    password: string;
    role: string;
    status?: string;
  }) {
    // Click create user button
    await this.clickElement(this.createUserButton);
    await this.waitForVisible(this.modal);
    
    // Fill form
    await this.fillUserForm(userData);
    
    // Submit form
    await this.clickElement(this.submitButton);
    await this.waitForAPIResponse('/api/v1/users', 15000);
    
    // Wait for modal to close and table to refresh
    await this.waitForHidden(this.modal);
    await this.waitForLoadingToFinish();
    
    return await this.waitForNotification();
  }

  /**
   * Edit existing user
   */
  async editUser(userEmail: string, updatedData: Partial<{
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    status: string;
  }>) {
    // Find and click edit button for specific user
    const userRow = await this.findUserRow(userEmail);
    const editButton = userRow.locator('[data-testid="edit-user"], .edit-button');
    await this.clickElement(editButton);
    
    await this.waitForVisible(this.modal);
    
    // Update form fields
    await this.fillUserForm(updatedData);
    
    // Submit form
    await this.clickElement(this.submitButton);
    await this.waitForAPIResponse('/api/v1/users');
    
    // Wait for modal to close
    await this.waitForHidden(this.modal);
    await this.waitForLoadingToFinish();
    
    return await this.waitForNotification();
  }

  /**
   * Delete user
   */
  async deleteUser(userEmail: string) {
    // Find and click delete button for specific user
    const userRow = await this.findUserRow(userEmail);
    const deleteButton = userRow.locator('[data-testid="delete-user"], .delete-button');
    await this.clickElement(deleteButton);
    
    // Confirm deletion
    await this.waitForVisible(this.confirmModal);
    await this.clickElement(this.confirmButton);
    await this.waitForAPIResponse('/api/v1/users');
    
    // Wait for confirmation modal to close
    await this.waitForHidden(this.confirmModal);
    await this.waitForLoadingToFinish();
    
    return await this.waitForNotification();
  }

  /**
   * Find user row by email
   */
  private async findUserRow(userEmail: string): Promise<Locator> {
    const rowCount = await this.userRows.count();
    
    for (let i = 0; i < rowCount; i++) {
      const row = this.userRows.nth(i);
      const emailCell = row.locator('td').nth(1); // Assuming email is in second column
      const cellText = await emailCell.textContent();
      
      if (cellText?.includes(userEmail)) {
        return row;
      }
    }
    
    throw new Error(`User with email ${userEmail} not found in table`);
  }

  /**
   * Fill user form with data
   */
  private async fillUserForm(userData: any) {
    if (userData.firstName && await this.firstNameInput.isVisible()) {
      await this.fillField(this.firstNameInput, userData.firstName);
    }
    
    if (userData.lastName && await this.lastNameInput.isVisible()) {
      await this.fillField(this.lastNameInput, userData.lastName);
    }
    
    if (userData.email && await this.emailInput.isVisible()) {
      await this.fillField(this.emailInput, userData.email);
    }
    
    if (userData.username && await this.usernameInput.isVisible()) {
      await this.fillField(this.usernameInput, userData.username);
    }
    
    if (userData.password && await this.passwordInput.isVisible()) {
      await this.fillField(this.passwordInput, userData.password);
      if (await this.confirmPasswordInput.isVisible()) {
        await this.fillField(this.confirmPasswordInput, userData.password);
      }
    }
    
    if (userData.role && await this.roleSelect.isVisible()) {
      await this.selectOption(this.roleSelect, userData.role);
    }
    
    if (userData.status && await this.statusSelect.isVisible()) {
      await this.selectOption(this.statusSelect, userData.status);
    }
  }

  /**
   * Bulk delete users
   */
  async bulkDeleteUsers(userEmails: string[]) {
    // Select users
    for (const email of userEmails) {
      const userRow = await this.findUserRow(email);
      const checkbox = userRow.locator('input[type="checkbox"]');
      await this.clickElement(checkbox);
    }
    
    // Click bulk action
    await this.clickElement(this.bulkActionButton);
    
    // Select delete action
    const deleteOption = this.page.locator('[data-testid="bulk-delete"], option[value="delete"]');
    await this.clickElement(deleteOption);
    
    // Confirm bulk deletion
    await this.waitForVisible(this.confirmModal);
    await this.clickElement(this.confirmButton);
    await this.waitForAPIResponse('/api/v1/users');
    
    await this.waitForHidden(this.confirmModal);
    await this.waitForLoadingToFinish();
    
    return await this.waitForNotification();
  }

  /**
   * Export users data
   */
  async exportUsers() {
    await this.clickElement(this.exportButton);
    
    // Wait for download to start
    const downloadPromise = this.page.waitForEvent('download');
    await this.clickElement(this.exportButton);
    const download = await downloadPromise;
    
    return {
      filename: download.suggestedFilename(),
      path: await download.path(),
    };
  }

  /**
   * Navigate through pagination
   */
  async goToNextPage() {
    if (await this.nextPageButton.isEnabled()) {
      await this.clickElement(this.nextPageButton);
      await this.waitForAPIResponse('/api/v1/users');
      await this.waitForLoadingToFinish();
      return true;
    }
    return false;
  }

  async goToPreviousPage() {
    if (await this.prevPageButton.isEnabled()) {
      await this.clickElement(this.prevPageButton);
      await this.waitForAPIResponse('/api/v1/users');
      await this.waitForLoadingToFinish();
      return true;
    }
    return false;
  }

  /**
   * Get pagination info
   */
  async getPaginationInfo(): Promise<{
    currentPage?: number;
    totalPages?: number;
    totalItems?: number;
  }> {
    if (await this.pageInfo.isVisible()) {
      const infoText = await this.pageInfo.textContent() || '';
      
      // Parse common pagination formats
      const pageMatch = infoText.match(/Page (\d+) of (\d+)/i);
      const itemsMatch = infoText.match(/(\d+) total/i);
      
      return {
        currentPage: pageMatch ? parseInt(pageMatch[1]) : undefined,
        totalPages: pageMatch ? parseInt(pageMatch[2]) : undefined,
        totalItems: itemsMatch ? parseInt(itemsMatch[1]) : undefined,
      };
    }
    
    return {};
  }

  /**
   * Validate form errors
   */
  async validateFormErrors(expectedErrors: Record<string, string>) {
    for (const [field, expectedError] of Object.entries(expectedErrors)) {
      const errorElement = this.page.locator(`[data-testid="${field}-error"], .${field}-error`);
      await expect(errorElement).toBeVisible();
      await expect(errorElement).toContainText(expectedError);
    }
  }

  /**
   * Check user permissions on page
   */
  async checkUserPermissions(): Promise<{
    canCreate: boolean;
    canEdit: boolean;
    canDelete: boolean;
    canExport: boolean;
  }> {
    return {
      canCreate: await this.createUserButton.isVisible(),
      canEdit: await this.editUserButton.first().isVisible(),
      canDelete: await this.deleteUserButton.first().isVisible(),
      canExport: await this.exportButton.isVisible(),
    };
  }

  /**
   * Refresh users list
   */
  async refreshUsersList() {
    await this.clickElement(this.refreshButton);
    await this.waitForAPIResponse('/api/v1/users');
    await this.waitForLoadingToFinish();
  }
}