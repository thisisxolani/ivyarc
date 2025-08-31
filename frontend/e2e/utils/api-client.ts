import { request } from '@playwright/test';

/**
 * API client for backend service testing and test data management
 * Handles authentication, request/response processing, and error handling
 */
export class ApiClient {
  private baseURL: string;
  private authToken?: string;
  private context: any;

  constructor(baseURL: string = 'http://localhost:8080') {
    this.baseURL = baseURL;
  }

  /**
   * Initialize API client with authentication
   */
  async initialize() {
    this.context = await request.newContext({
      baseURL: this.baseURL,
      extraHTTPHeaders: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
  }

  /**
   * Authenticate with admin credentials
   */
  async authenticateAsAdmin(): Promise<void> {
    await this.authenticate('admin@ivyarc.com', 'admin123');
  }

  /**
   * Authenticate with user credentials
   */
  async authenticateAsUser(): Promise<void> {
    await this.authenticate('user@ivyarc.com', 'user123');
  }

  /**
   * Authenticate with manager credentials
   */
  async authenticateAsManager(): Promise<void> {
    await this.authenticate('manager@ivyarc.com', 'manager123');
  }

  /**
   * Authenticate with custom credentials
   */
  async authenticate(username: string, password: string): Promise<void> {
    if (!this.context) {
      await this.initialize();
    }

    try {
      const response = await this.context.post('/api/v1/auth/login', {
        data: {
          identifier: username,
          password: password
        }
      });

      if (response.ok()) {
        const data = await response.json();
        if (data.success && data.data?.accessToken) {
          this.authToken = data.data.accessToken;
          
          // Update context with auth token
          this.context = await request.newContext({
            baseURL: this.baseURL,
            extraHTTPHeaders: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'Authorization': `Bearer ${this.authToken}`
            }
          });
        } else {
          throw new Error(`Authentication failed: ${data.message}`);
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Authentication failed: ${response.status()} ${errorData.message || response.statusText()}`);
      }
    } catch (error) {
      console.error('Authentication error:', error);
      throw error;
    }
  }

  /**
   * GET request
   */
  async get(endpoint: string): Promise<any> {
    if (!this.context) {
      await this.initialize();
    }

    try {
      const response = await this.context.get(endpoint);
      return await this.handleResponse(response);
    } catch (error) {
      console.error(`GET ${endpoint} failed:`, error);
      throw error;
    }
  }

  /**
   * POST request
   */
  async post(endpoint: string, data?: any): Promise<any> {
    if (!this.context) {
      await this.initialize();
    }

    try {
      const response = await this.context.post(endpoint, {
        data: data
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error(`POST ${endpoint} failed:`, error);
      throw error;
    }
  }

  /**
   * PUT request
   */
  async put(endpoint: string, data?: any): Promise<any> {
    if (!this.context) {
      await this.initialize();
    }

    try {
      const response = await this.context.put(endpoint, {
        data: data
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error(`PUT ${endpoint} failed:`, error);
      throw error;
    }
  }

  /**
   * DELETE request
   */
  async delete(endpoint: string): Promise<any> {
    if (!this.context) {
      await this.initialize();
    }

    try {
      const response = await this.context.delete(endpoint);
      return await this.handleResponse(response);
    } catch (error) {
      console.error(`DELETE ${endpoint} failed:`, error);
      throw error;
    }
  }

  /**
   * PATCH request
   */
  async patch(endpoint: string, data?: any): Promise<any> {
    if (!this.context) {
      await this.initialize();
    }

    try {
      const response = await this.context.patch(endpoint, {
        data: data
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error(`PATCH ${endpoint} failed:`, error);
      throw error;
    }
  }

  /**
   * Handle HTTP response
   */
  private async handleResponse(response: any): Promise<any> {
    const responseData = await response.json().catch(() => ({}));

    if (response.ok()) {
      return responseData;
    } else {
      const error = new Error(`HTTP ${response.status()}: ${responseData.message || response.statusText()}`);
      (error as any).status = response.status();
      (error as any).response = responseData;
      throw error;
    }
  }

  /**
   * Check health of backend services
   */
  async checkHealth(): Promise<boolean> {
    try {
      const response = await this.get('/actuator/health');
      return response.status === 'UP';
    } catch (error) {
      console.warn('Health check failed:', error);
      return false;
    }
  }

  /**
   * Get current authenticated user info
   */
  async getCurrentUser(): Promise<any> {
    return await this.get('/api/v1/auth/me');
  }

  /**
   * Validate current token
   */
  async validateToken(): Promise<boolean> {
    try {
      const response = await this.post('/api/v1/auth/validate');
      return response.success;
    } catch (error) {
      return false;
    }
  }

  /**
   * Logout current session
   */
  async logout(): Promise<void> {
    try {
      await this.post('/api/v1/auth/logout');
      this.authToken = undefined;
      
      // Reset context without auth token
      this.context = await request.newContext({
        baseURL: this.baseURL,
        extraHTTPHeaders: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
    } catch (error) {
      console.warn('Logout failed:', error);
    }
  }

  /**
   * Clean up resources
   */
  async dispose(): Promise<void> {
    if (this.authToken) {
      await this.logout();
    }
    
    if (this.context) {
      await this.context.dispose();
    }
  }

  /**
   * Get auth token
   */
  getAuthToken(): string | undefined {
    return this.authToken;
  }

  /**
   * Check if authenticated
   */
  isAuthenticated(): boolean {
    return !!this.authToken;
  }
}