import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { map, tap, catchError, switchMap } from 'rxjs/operators';
import {
  LoginRequest,
  RegisterRequest,
  RefreshTokenRequest,
  AuthResponse,
  User,
  ApiResponse,
  AuthState
} from '../models/auth.models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly API_BASE = '/api/v1/auth';
  
  private readonly TOKEN_KEY = 'auth_access_token';
  private readonly REFRESH_TOKEN_KEY = 'auth_refresh_token';
  private readonly USER_KEY = 'auth_user';

  // Signals for reactive state management
  private readonly _authState = signal<AuthState>({
    isAuthenticated: false,
    user: null,
    accessToken: null,
    refreshToken: null,
    loading: false,
    error: null
  });

  // Computed signals for derived state
  readonly authState = this._authState.asReadonly();
  readonly isAuthenticated = computed(() => this._authState().isAuthenticated);
  readonly currentUser = computed(() => this._authState().user);
  readonly isLoading = computed(() => this._authState().loading);
  readonly error = computed(() => this._authState().error);

  constructor() {
    this.initializeAuth();
  }

  private initializeAuth(): void {
    const accessToken = localStorage.getItem(this.TOKEN_KEY);
    const refreshToken = localStorage.getItem(this.REFRESH_TOKEN_KEY);
    const userStr = localStorage.getItem(this.USER_KEY);

    if (accessToken && refreshToken && userStr) {
      try {
        const user = JSON.parse(userStr) as User;
        this.updateAuthState({
          isAuthenticated: true,
          user,
          accessToken,
          refreshToken,
          loading: false,
          error: null
        });

        // Validate token on initialization
        this.validateToken().subscribe({
          error: () => this.logout()
        });
      } catch {
        this.clearAuthData();
      }
    }
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    this.updateAuthState({ ...this._authState(), loading: true, error: null });

    return this.http.post<ApiResponse<AuthResponse>>(`${this.API_BASE}/login`, credentials)
      .pipe(
        map(response => {
          if (!response.success) {
            throw new Error(response.message || 'Login failed');
          }
          return response.data;
        }),
        tap(authResponse => {
          this.setAuthData(authResponse);
          this.updateAuthState({
            isAuthenticated: true,
            user: authResponse.user,
            accessToken: authResponse.accessToken,
            refreshToken: authResponse.refreshToken,
            loading: false,
            error: null
          });
        }),
        catchError(error => {
          const errorMessage = error.error?.message || error.message || 'Login failed';
          this.updateAuthState({
            ...this._authState(),
            loading: false,
            error: errorMessage
          });
          return throwError(() => error);
        })
      );
  }

  register(userData: RegisterRequest): Observable<User> {
    this.updateAuthState({ ...this._authState(), loading: true, error: null });

    return this.http.post<ApiResponse<User>>(`${this.API_BASE}/register`, userData)
      .pipe(
        map(response => {
          if (!response.success) {
            throw new Error(response.message || 'Registration failed');
          }
          return response.data;
        }),
        tap(() => {
          this.updateAuthState({
            ...this._authState(),
            loading: false,
            error: null
          });
        }),
        catchError(error => {
          const errorMessage = error.error?.message || error.message || 'Registration failed';
          this.updateAuthState({
            ...this._authState(),
            loading: false,
            error: errorMessage
          });
          return throwError(() => error);
        })
      );
  }

  refreshToken(): Observable<AuthResponse> {
    const refreshToken = this._authState().refreshToken;
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    const refreshRequest: RefreshTokenRequest = { refreshToken };

    return this.http.post<ApiResponse<AuthResponse>>(`${this.API_BASE}/refresh`, refreshRequest)
      .pipe(
        map(response => {
          if (!response.success) {
            throw new Error(response.message || 'Token refresh failed');
          }
          return response.data;
        }),
        tap(authResponse => {
          this.setAuthData(authResponse);
          this.updateAuthState({
            ...this._authState(),
            accessToken: authResponse.accessToken,
            refreshToken: authResponse.refreshToken,
            user: authResponse.user
          });
        }),
        catchError(error => {
          this.logout();
          return throwError(() => error);
        })
      );
  }

  logout(): Observable<boolean> {
    const accessToken = this._authState().accessToken;
    
    if (!accessToken) {
      this.clearAuthData();
      return new BehaviorSubject(true).asObservable();
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${accessToken}`);

    return this.http.post<ApiResponse<string>>(`${this.API_BASE}/logout`, {}, { headers })
      .pipe(
        tap(() => this.clearAuthData()),
        map(() => true),
        catchError(() => {
          this.clearAuthData();
          return new BehaviorSubject(true).asObservable();
        })
      );
  }

  logoutAll(): Observable<boolean> {
    const accessToken = this._authState().accessToken;
    
    if (!accessToken) {
      this.clearAuthData();
      return new BehaviorSubject(true).asObservable();
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${accessToken}`);

    return this.http.post<ApiResponse<string>>(`${this.API_BASE}/logout-all`, {}, { headers })
      .pipe(
        tap(() => this.clearAuthData()),
        map(() => true),
        catchError(() => {
          this.clearAuthData();
          return new BehaviorSubject(true).asObservable();
        })
      );
  }

  getCurrentUser(): Observable<User> {
    const accessToken = this._authState().accessToken;
    
    if (!accessToken) {
      return throwError(() => new Error('No access token available'));
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${accessToken}`);

    return this.http.get<ApiResponse<User>>(`${this.API_BASE}/me`, { headers })
      .pipe(
        map(response => {
          if (!response.success) {
            throw new Error(response.message || 'Failed to get user info');
          }
          return response.data;
        }),
        tap(user => {
          this.updateAuthState({
            ...this._authState(),
            user
          });
          localStorage.setItem(this.USER_KEY, JSON.stringify(user));
        })
      );
  }

  validateToken(): Observable<boolean> {
    const accessToken = this._authState().accessToken;
    
    if (!accessToken) {
      return throwError(() => new Error('No access token available'));
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${accessToken}`);

    return this.http.post<ApiResponse<boolean>>(`${this.API_BASE}/validate`, {}, { headers })
      .pipe(
        map(response => response.data || false),
        catchError(() => new BehaviorSubject(false).asObservable())
      );
  }

  private setAuthData(authResponse: AuthResponse): void {
    localStorage.setItem(this.TOKEN_KEY, authResponse.accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, authResponse.refreshToken);
    localStorage.setItem(this.USER_KEY, JSON.stringify(authResponse.user));
  }

  private clearAuthData(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    
    this.updateAuthState({
      isAuthenticated: false,
      user: null,
      accessToken: null,
      refreshToken: null,
      loading: false,
      error: null
    });

    this.router.navigate(['/auth/login']);
  }

  private updateAuthState(newState: AuthState): void {
    this._authState.set(newState);
  }

  getAccessToken(): string | null {
    return this._authState().accessToken;
  }

  hasRole(role: string): boolean {
    const user = this._authState().user;
    return user?.roles?.includes(role) ?? false;
  }

  hasPermission(permission: string): boolean {
    const user = this._authState().user;
    return user?.permissions?.includes(permission) ?? false;
  }
}