import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UserProfile {
  id?: number;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  bio?: string;
  isActive: boolean;
  fullName?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserResponse {
  content: UserProfile[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  activePercentage: number;
}

@Injectable({
  providedIn: 'root'
})
export class UserApiService {
  // Route through API Gateway; nginx proxies /api to the gateway
  private readonly baseUrl = '/api/v1/users';

  constructor(private http: HttpClient) {}

  // Get all users with pagination and filtering
  getUsers(params: {
    page?: number;
    size?: number;
    sortBy?: string;
    sortDir?: string;
    active?: boolean;
    search?: string;
  } = {}): Observable<UserResponse> {
    let httpParams = new HttpParams();
    
    if (params.page !== undefined) httpParams = httpParams.set('page', params.page.toString());
    if (params.size !== undefined) httpParams = httpParams.set('size', params.size.toString());
    if (params.sortBy) httpParams = httpParams.set('sortBy', params.sortBy);
    if (params.sortDir) httpParams = httpParams.set('sortDir', params.sortDir);
    if (params.active !== undefined) httpParams = httpParams.set('active', params.active.toString());
    if (params.search) httpParams = httpParams.set('search', params.search);

    return this.http.get<UserResponse>(this.baseUrl, { params: httpParams });
  }

  // Get user by ID
  getUserById(id: number): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.baseUrl}/${id}`);
  }

  // Get user by user ID
  getUserByUserId(userId: string): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.baseUrl}/user/${userId}`);
  }

  // Get user by email
  getUserByEmail(email: string): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.baseUrl}/email/${email}`);
  }

  // Create new user
  createUser(user: Omit<UserProfile, 'id' | 'fullName' | 'createdAt' | 'updatedAt'>): Observable<UserProfile> {
    return this.http.post<UserProfile>(this.baseUrl, user);
  }

  // Update user by ID
  updateUser(id: number, user: Partial<UserProfile>): Observable<UserProfile> {
    return this.http.put<UserProfile>(`${this.baseUrl}/${id}`, user);
  }

  // Update user by user ID
  updateUserByUserId(userId: string, user: Partial<UserProfile>): Observable<UserProfile> {
    return this.http.put<UserProfile>(`${this.baseUrl}/user/${userId}`, user);
  }

  // Delete user
  deleteUser(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/${id}`);
  }

  // Activate user
  activateUser(id: number): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.baseUrl}/${id}/activate`, {});
  }

  // Deactivate user
  deactivateUser(id: number): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.baseUrl}/${id}/deactivate`, {});
  }

  // Get user statistics
  getUserStats(): Observable<UserStats> {
    return this.http.get<UserStats>(`${this.baseUrl}/stats`);
  }
}
