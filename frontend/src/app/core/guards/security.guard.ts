import { CanActivateFn, CanActivateChildFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

/**
 * Security Guard - Comprehensive security validation for route protection
 * Implements multiple security checks including authentication, authorization,
 * session validation, and security policy enforcement
 */
export const securityGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // 1. Authentication Check
  if (!authService.isAuthenticated()) {
    console.warn('Security Guard: User not authenticated, redirecting to login');
    router.navigate(['/auth/login'], { 
      queryParams: { returnUrl: state.url },
      state: { securityViolation: 'UNAUTHENTICATED' }
    });
    return false;
  }

  // 2. Token Validation
  const accessToken = authService.getAccessToken();
  if (!accessToken || isTokenExpired(accessToken)) {
    console.warn('Security Guard: Invalid or expired token detected');
    authService.logout().subscribe();
    return false;
  }

  // 3. Role-based Authorization
  const requiredRoles = route.data?.['requiredRoles'] as string[];
  if (requiredRoles && requiredRoles.length > 0) {
    const hasRequiredRole = requiredRoles.some(role => authService.hasRole(role));
    if (!hasRequiredRole) {
      console.warn('Security Guard: Insufficient role permissions', { 
        required: requiredRoles,
        user: authService.currentUser()?.roles 
      });
      router.navigate(['/unauthorized'], {
        state: { 
          securityViolation: 'INSUFFICIENT_ROLES',
          requiredRoles,
          userRoles: authService.currentUser()?.roles
        }
      });
      return false;
    }
  }

  // 4. Permission-based Authorization
  const requiredPermissions = route.data?.['requiredPermissions'] as string[];
  if (requiredPermissions && requiredPermissions.length > 0) {
    const hasRequiredPermission = requiredPermissions.some(permission => 
      authService.hasPermission(permission)
    );
    if (!hasRequiredPermission) {
      console.warn('Security Guard: Insufficient permissions', {
        required: requiredPermissions,
        user: authService.currentUser()?.permissions
      });
      router.navigate(['/unauthorized'], {
        state: {
          securityViolation: 'INSUFFICIENT_PERMISSIONS',
          requiredPermissions,
          userPermissions: authService.currentUser()?.permissions
        }
      });
      return false;
    }
  }

  // 5. Session Security Validation
  if (!validateSessionSecurity()) {
    console.warn('Security Guard: Session security validation failed');
    authService.logout().subscribe();
    return false;
  }

  // 6. Route-specific Security Policies
  const securityPolicy = route.data?.['securityPolicy'] as SecurityPolicy;
  if (securityPolicy && !enforceSecurityPolicy(securityPolicy, authService)) {
    console.warn('Security Guard: Security policy violation', securityPolicy);
    router.navigate(['/unauthorized'], {
      state: { 
        securityViolation: 'SECURITY_POLICY_VIOLATION',
        policy: securityPolicy
      }
    });
    return false;
  }

  // 7. IP Address Validation (if configured)
  if (route.data?.['restrictedByIP'] && !validateIPAccess()) {
    console.warn('Security Guard: IP address not authorized');
    router.navigate(['/unauthorized'], {
      state: { securityViolation: 'IP_NOT_AUTHORIZED' }
    });
    return false;
  }

  // 8. Time-based Access Control
  const timeRestrictions = route.data?.['timeRestrictions'] as TimeRestriction;
  if (timeRestrictions && !validateTimeAccess(timeRestrictions)) {
    console.warn('Security Guard: Access denied due to time restrictions');
    router.navigate(['/unauthorized'], {
      state: { 
        securityViolation: 'TIME_RESTRICTION_VIOLATION',
        restrictions: timeRestrictions
      }
    });
    return false;
  }

  // All security checks passed
  return true;
};

/**
 * Security Guard for Child Routes
 */
export const securityChildGuard: CanActivateChildFn = (childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  return securityGuard(childRoute, state);
};

/**
 * Admin Security Guard - Enhanced security for administrative functions
 */
export const adminSecurityGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // First run standard security checks
  const standardSecurityCheck = securityGuard(route, state);
  if (!standardSecurityCheck) {
    return false;
  }

  // Additional admin-specific checks
  const user = authService.currentUser();
  
  // 1. Admin Role Requirement
  if (!authService.hasRole('ADMIN') && !authService.hasRole('SUPER_ADMIN')) {
    console.warn('Admin Security Guard: User lacks admin privileges');
    router.navigate(['/unauthorized'], {
      state: { 
        securityViolation: 'ADMIN_ACCESS_REQUIRED',
        userRoles: user?.roles
      }
    });
    return false;
  }

  // 2. Multi-Factor Authentication Check (if required)
  if (route.data?.['requiresMFA'] && !user?.mfaEnabled) {
    console.warn('Admin Security Guard: MFA required but not enabled');
    router.navigate(['/auth/setup-mfa'], {
      queryParams: { returnUrl: state.url }
    });
    return false;
  }

  // 3. Admin Session Timeout Check (stricter than regular users)
  if (!validateAdminSession()) {
    console.warn('Admin Security Guard: Admin session expired');
    authService.logout().subscribe();
    return false;
  }

  return true;
};

// Helper Functions

/**
 * Validates if JWT token is expired
 */
function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp < currentTime;
  } catch {
    return true; // Consider invalid tokens as expired
  }
}

/**
 * Validates session security parameters
 */
function validateSessionSecurity(): boolean {
  // Check for session tampering indicators
  const sessionStart = sessionStorage.getItem('session_start');
  const currentTime = Date.now();
  
  if (!sessionStart) {
    sessionStorage.setItem('session_start', currentTime.toString());
    return true;
  }

  // Validate session duration (8 hours max)
  const sessionDuration = currentTime - parseInt(sessionStart);
  const MAX_SESSION_DURATION = 8 * 60 * 60 * 1000; // 8 hours
  
  if (sessionDuration > MAX_SESSION_DURATION) {
    console.warn('Session exceeded maximum duration');
    return false;
  }

  return true;
}

/**
 * Enforces route-specific security policies
 */
function enforceSecurityPolicy(policy: SecurityPolicy, authService: AuthService): boolean {
  const user = authService.currentUser();
  
  // Check user account status
  if (policy.requireActiveAccount && user?.status !== 'ACTIVE') {
    return false;
  }

  // Check user verification requirements
  if (policy.requireEmailVerification && !user?.emailVerified) {
    return false;
  }

  // Check minimum account age
  if (policy.minimumAccountAge && user?.createdAt) {
    const accountAge = Date.now() - new Date(user.createdAt).getTime();
    const requiredAge = policy.minimumAccountAge * 24 * 60 * 60 * 1000; // days to ms
    if (accountAge < requiredAge) {
      return false;
    }
  }

  return true;
}

/**
 * Validates IP-based access control
 */
function validateIPAccess(): boolean {
  // In a real implementation, this would check against a whitelist/blacklist
  // For now, we'll assume all IPs are valid
  // This would typically involve checking the client IP against configured rules
  return true;
}

/**
 * Validates time-based access restrictions
 */
function validateTimeAccess(restrictions: TimeRestriction): boolean {
  const now = new Date();
  const currentHour = now.getHours();
  const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.

  // Check allowed hours
  if (restrictions.allowedHours) {
    const { start, end } = restrictions.allowedHours;
    if (currentHour < start || currentHour >= end) {
      return false;
    }
  }

  // Check allowed days of week
  if (restrictions.allowedDays && !restrictions.allowedDays.includes(currentDay)) {
    return false;
  }

  return true;
}

/**
 * Validates admin session with stricter timeout
 */
function validateAdminSession(): boolean {
  const lastAdminActivity = sessionStorage.getItem('last_admin_activity');
  const currentTime = Date.now();
  
  if (!lastAdminActivity) {
    sessionStorage.setItem('last_admin_activity', currentTime.toString());
    return true;
  }

  // Admin sessions timeout after 30 minutes of inactivity
  const ADMIN_SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
  const timeSinceLastActivity = currentTime - parseInt(lastAdminActivity);
  
  if (timeSinceLastActivity > ADMIN_SESSION_TIMEOUT) {
    sessionStorage.removeItem('last_admin_activity');
    return false;
  }

  // Update last activity timestamp
  sessionStorage.setItem('last_admin_activity', currentTime.toString());
  return true;
}

// Type Definitions

interface SecurityPolicy {
  requireActiveAccount?: boolean;
  requireEmailVerification?: boolean;
  minimumAccountAge?: number; // in days
}

interface TimeRestriction {
  allowedHours?: {
    start: number; // 0-23
    end: number;   // 0-23
  };
  allowedDays?: number[]; // 0-6, where 0 is Sunday
}