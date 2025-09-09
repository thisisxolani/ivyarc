// Base API response interfaces
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: 'success' | 'error';
  timestamp: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiError {
  code: string;
  message: string;
  details?: string;
  timestamp: string;
  path?: string;
}

// User-related interfaces
export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: Role[];
  active: boolean;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: Permission[];
}

export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  description?: string;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  roleIds: string[];
}

export interface UpdateUserRequest {
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  roleIds?: string[];
  active?: boolean;
}

// Auth-related interfaces
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
  expiresIn: number;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

// Audit-related interfaces
export interface AuditLog {
  id: string;
  userId?: string;
  username?: string;
  action: string;
  resource: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
  success: boolean;
}

export interface AuditLogFilter {
  userId?: string;
  action?: string;
  resource?: string;
  startDate?: string;
  endDate?: string;
  success?: boolean;
}

// System settings interfaces
export interface SystemSettings {
  id: string;
  key: string;
  value: string;
  description?: string;
  category: string;
  type: 'string' | 'number' | 'boolean' | 'json';
  updatedAt: string;
  updatedBy: string;
}

export interface UpdateSettingsRequest {
  settings: Array<{
    key: string;
    value: string;
  }>;
}

// Common query parameters
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SearchParams extends PaginationParams {
  search?: string;
  filters?: Record<string, any>;
}