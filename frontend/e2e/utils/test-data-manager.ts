import { ApiClient } from './api-client';

/**
 * Manages test data creation, seeding, and cleanup
 * Ensures consistent test data across all test runs
 */
export class TestDataManager {
  private apiClient: ApiClient;
  private createdUserIds: string[] = [];
  private createdRoleIds: string[] = [];

  constructor() {
    this.apiClient = new ApiClient();
  }

  /**
   * Initialize test data manager and seed initial data
   */
  async initialize() {
    console.log('🌱 Initializing test data...');
    
    try {
      await this.seedUsers();
      await this.seedRoles();
      await this.seedPermissions();
      console.log('✅ Test data initialized successfully');
    } catch (error) {
      console.warn('⚠️  Could not initialize all test data:', error);
      // Don't throw - tests should handle missing data gracefully
    }
  }

  /**
   * Clean up all created test data
   */
  async cleanup() {
    console.log('🧹 Cleaning up test data...');
    
    try {
      await this.cleanupUsers();
      await this.cleanupRoles();
      console.log('✅ Test data cleanup completed');
    } catch (error) {
      console.warn('⚠️  Error during test data cleanup:', error);
    }
  }

  /**
   * Get test users for different scenarios
   */
  getTestUsers() {
    return {
      admin: {
        username: 'admin@ivyarc.com',
        email: 'admin@ivyarc.com',
        password: 'admin123',
        firstName: 'Admin',
        lastName: 'User',
        roles: ['ADMIN', 'USER'],
        permissions: ['user:read', 'user:write', 'user:delete', 'role:read', 'role:write', 'role:delete']
      },
      manager: {
        username: 'manager@ivyarc.com',
        email: 'manager@ivyarc.com',
        password: 'manager123',
        firstName: 'Manager',
        lastName: 'User',
        roles: ['MANAGER', 'USER'],
        permissions: ['user:read', 'user:write', 'role:read']
      },
      user: {
        username: 'user@ivyarc.com',
        email: 'user@ivyarc.com',
        password: 'user123',
        firstName: 'Regular',
        lastName: 'User',
        roles: ['USER'],
        permissions: ['user:read']
      },
      newUser: {
        username: 'newuser@ivyarc.com',
        email: 'newuser@ivyarc.com',
        password: 'newuser123',
        firstName: 'New',
        lastName: 'User',
        roles: ['USER'],
        permissions: ['user:read']
      }
    };
  }

  /**
   * Get test roles for different scenarios
   */
  getTestRoles() {
    return {
      admin: {
        name: 'ADMIN',
        description: 'Administrator role with full access',
        permissions: ['user:read', 'user:write', 'user:delete', 'role:read', 'role:write', 'role:delete', 'audit:read']
      },
      manager: {
        name: 'MANAGER', 
        description: 'Manager role with user management access',
        permissions: ['user:read', 'user:write', 'role:read', 'audit:read']
      },
      user: {
        name: 'USER',
        description: 'Basic user role with read access',
        permissions: ['user:read']
      },
      testRole: {
        name: 'TEST_ROLE',
        description: 'Test role for automation',
        permissions: ['user:read']
      }
    };
  }

  /**
   * Create a test user with specific attributes
   */
  async createTestUser(userData: any): Promise<string> {
    try {
      const response = await this.apiClient.post('/api/v1/users', userData);
      const userId = response.data.id;
      this.createdUserIds.push(userId);
      return userId;
    } catch (error) {
      console.warn('Could not create test user:', userData.username, error);
      throw error;
    }
  }

  /**
   * Create a test role with specific permissions
   */
  async createTestRole(roleData: any): Promise<string> {
    try {
      const response = await this.apiClient.post('/api/v1/roles', roleData);
      const roleId = response.data.id;
      this.createdRoleIds.push(roleId);
      return roleId;
    } catch (error) {
      console.warn('Could not create test role:', roleData.name, error);
      throw error;
    }
  }

  /**
   * Seed initial users if they don't exist
   */
  private async seedUsers() {
    const testUsers = this.getTestUsers();
    
    for (const [key, userData] of Object.entries(testUsers)) {
      try {
        // Check if user already exists
        const existingUser = await this.apiClient.get(`/api/v1/users/by-email/${userData.email}`);
        console.log(`✅ Test user ${key} already exists`);
      } catch (error) {
        // User doesn't exist, create it
        try {
          await this.createTestUser(userData);
          console.log(`✅ Created test user: ${key}`);
        } catch (createError) {
          console.warn(`⚠️  Could not create test user ${key}:`, createError);
        }
      }
    }
  }

  /**
   * Seed initial roles if they don't exist
   */
  private async seedRoles() {
    const testRoles = this.getTestRoles();
    
    for (const [key, roleData] of Object.entries(testRoles)) {
      try {
        // Check if role already exists
        const existingRole = await this.apiClient.get(`/api/v1/roles/by-name/${roleData.name}`);
        console.log(`✅ Test role ${key} already exists`);
      } catch (error) {
        // Role doesn't exist, create it
        try {
          await this.createTestRole(roleData);
          console.log(`✅ Created test role: ${key}`);
        } catch (createError) {
          console.warn(`⚠️  Could not create test role ${key}:`, createError);
        }
      }
    }
  }

  /**
   * Seed permissions if they don't exist
   */
  private async seedPermissions() {
    const permissions = [
      { name: 'user:read', description: 'Read user data' },
      { name: 'user:write', description: 'Create and update user data' },
      { name: 'user:delete', description: 'Delete user data' },
      { name: 'role:read', description: 'Read role data' },
      { name: 'role:write', description: 'Create and update role data' },
      { name: 'role:delete', description: 'Delete role data' },
      { name: 'audit:read', description: 'Read audit logs' },
    ];

    for (const permission of permissions) {
      try {
        // Check if permission exists
        await this.apiClient.get(`/api/v1/permissions/by-name/${permission.name}`);
        console.log(`✅ Permission ${permission.name} already exists`);
      } catch (error) {
        // Permission doesn't exist, create it
        try {
          await this.apiClient.post('/api/v1/permissions', permission);
          console.log(`✅ Created permission: ${permission.name}`);
        } catch (createError) {
          console.warn(`⚠️  Could not create permission ${permission.name}:`, createError);
        }
      }
    }
  }

  /**
   * Clean up created users
   */
  private async cleanupUsers() {
    for (const userId of this.createdUserIds) {
      try {
        await this.apiClient.delete(`/api/v1/users/${userId}`);
        console.log(`✅ Deleted test user: ${userId}`);
      } catch (error) {
        console.warn(`⚠️  Could not delete user ${userId}:`, error);
      }
    }
    this.createdUserIds = [];
  }

  /**
   * Clean up created roles
   */
  private async cleanupRoles() {
    for (const roleId of this.createdRoleIds) {
      try {
        await this.apiClient.delete(`/api/v1/roles/${roleId}`);
        console.log(`✅ Deleted test role: ${roleId}`);
      } catch (error) {
        console.warn(`⚠️  Could not delete role ${roleId}:`, error);
      }
    }
    this.createdRoleIds = [];
  }

  /**
   * Generate random test data
   */
  generateRandomUserData(): any {
    const timestamp = Date.now();
    return {
      username: `testuser${timestamp}@ivyarc.com`,
      email: `testuser${timestamp}@ivyarc.com`,
      password: 'TestPassword123!',
      firstName: `Test${timestamp}`,
      lastName: 'User',
      roles: ['USER']
    };
  }

  /**
   * Generate random role data
   */
  generateRandomRoleData(): any {
    const timestamp = Date.now();
    return {
      name: `TEST_ROLE_${timestamp}`,
      description: `Test role created at ${new Date().toISOString()}`,
      permissions: ['user:read']
    };
  }
}