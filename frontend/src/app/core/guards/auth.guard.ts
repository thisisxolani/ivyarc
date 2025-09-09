import { Injectable } from '@angular/core';
import { CanActivate, CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): boolean {
    console.log('AuthGuard - canActivate called');
    
    const isAuthenticated = this.authService.isAuthenticated();
    console.log('AuthGuard - isAuthenticated:', isAuthenticated);
    
    if (isAuthenticated) {
      return true;
    }

    // Redirect unauthenticated users to login
    this.router.navigate(['/auth/login']);
    return false;
  }
}

export const guestGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Check if user is NOT authenticated (guest)
  if (!authService.isAuthenticated()) {
    return true;
  }

  // If authenticated, redirect to dashboard
  router.navigate(['/dashboard']);
  return false;
};

export const roleGuard = (requiredRoles: string[]): CanActivateFn => {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.isAuthenticated()) {
      router.navigate(['/auth/login']);
      return false;
    }

    const user = authService.currentUser();
    if (!user?.roles) {
      router.navigate(['/unauthorized']);
      return false;
    }

    const hasRequiredRole = requiredRoles.some(role => 
      user.roles!.includes(role)
    );

    if (!hasRequiredRole) {
      router.navigate(['/unauthorized']);
      return false;
    }

    return true;
  };
};
