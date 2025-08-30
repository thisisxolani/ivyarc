import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const authService = inject(AuthService);
  const accessToken = authService.getAccessToken();

  // Skip auth header for login, register, and refresh endpoints
  const skipAuthUrls = ['/api/v1/auth/login', '/api/v1/auth/register', '/api/v1/auth/refresh'];
  const shouldSkipAuth = skipAuthUrls.some(url => req.url.includes(url));

  let authReq = req;

  // Add authorization header if we have a token and it's not a skip URL
  if (accessToken && !shouldSkipAuth) {
    authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${accessToken}`)
    });
  }

  // Add content type header for POST/PUT requests
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    authReq = authReq.clone({
      headers: authReq.headers.set('Content-Type', 'application/json')
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Handle 401 Unauthorized errors
      if (error.status === 401 && !shouldSkipAuth) {
        // Try to refresh the token
        return authService.refreshToken().pipe(
          switchMap(() => {
            // Retry the original request with the new token
            const newToken = authService.getAccessToken();
            const retryReq = req.clone({
              headers: req.headers.set('Authorization', `Bearer ${newToken}`)
            });
            return next(retryReq);
          }),
          catchError((refreshError) => {
            // If refresh fails, logout the user
            authService.logout().subscribe();
            return throwError(() => refreshError);
          })
        );
      }

      return throwError(() => error);
    })
  );
};