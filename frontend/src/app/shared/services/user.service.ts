import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { User } from '../../core/models/auth.models';
import { 
  ApiResponse,
  CreateUserRequest, 
  UpdateUserRequest,
  PaginatedResponse,
  SearchParams
} from '../../core/models/api.models';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiService = inject(ApiService);

  /**
   * Get all users with pagination and search
   */
  getUsers(params?: SearchParams): Observable<ApiResponse<PaginatedResponse<User>>> {
    return this.apiService.getPaginated<User>('/api/users', params);
  }

  /**
   * Get user by ID
   */
  getUser(id: string): Observable<ApiResponse<User>> {
    return this.apiService.get<User>(`/api/users/${id}`);
  }

  /**
   * Create new user
   */
  createUser(userData: CreateUserRequest): Observable<ApiResponse<User>> {
    return this.apiService.post<User, CreateUserRequest>('/api/users', userData);
  }

  /**
   * Update existing user
   */
  updateUser(id: string, userData: UpdateUserRequest): Observable<ApiResponse<User>> {
    return this.apiService.patch<User, UpdateUserRequest>(`/api/users/${id}`, userData);
  }

  /**
   * Delete user
   */
  deleteUser(id: string): Observable<ApiResponse<void>> {
    return this.apiService.delete<void>(`/api/users/${id}`);
  }

  /**
   * Activate/deactivate user
   */
  toggleUserStatus(id: string, active: boolean): Observable<ApiResponse<User>> {
    return this.apiService.patch<User>(`/api/users/${id}/status`, { active });
  }

  /**
   * Get current user profile
   */
  getCurrentUser(): Observable<ApiResponse<User>> {
    return this.apiService.get<User>('/api/users/me');
  }

  /**
   * Update current user profile
   */
  updateProfile(userData: Partial<UpdateUserRequest>): Observable<ApiResponse<User>> {
    return this.apiService.patch<User>('/api/users/me', userData);
  }

  /**
   * Change user password
   */
  changePassword(currentPassword: string, newPassword: string): Observable<ApiResponse<void>> {
    return this.apiService.post<void>('/api/users/me/password', {
      currentPassword,
      newPassword
    });
  }

  /**
   * Upload user avatar
   */
  uploadAvatar(file: File): Observable<ApiResponse<{ avatarUrl: string }>> {
    return this.apiService.uploadFile<{ avatarUrl: string }>('/api/users/me/avatar', file);
  }
}