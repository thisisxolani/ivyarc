import { Routes } from '@angular/router';
import { DashboardComponent } from './layouts/dashboard/dashboard.component';
import { AuthGuard, guestGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'auth',
    canActivate: [guestGuard],
    loadChildren: () => import('./features/auth/auth.routes').then(r => r.AUTH_ROUTES)
  },
  {
    path: '',
    component: DashboardComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard-home.component').then(c => c.DashboardHomeComponent),
        data: { breadcrumb: 'Dashboard' }
      },
      {
        path: 'users',
        loadChildren: () => import('./features/users/user.routes').then(r => r.USER_ROUTES),
        data: { breadcrumb: 'User Management' }
      },
      {
        path: 'audit',
        loadComponent: () => import('./features/audit/audit-list.component').then(c => c.AuditListComponent),
        data: { breadcrumb: 'Audit Logs' }
      },
      {
        path: 'settings',
        loadComponent: () => import('./features/settings/settings.component').then(c => c.SettingsComponent),
        data: { breadcrumb: 'Settings' }
      },
      {
        path: 'profile',
        loadComponent: () => import('./features/profile/profile.component').then(c => c.ProfileComponent),
        data: { breadcrumb: 'Profile' }
      }
    ]
  },
  {
    path: '**',
    loadComponent: () => import('./shared/components/not-found/not-found.component').then(c => c.NotFoundComponent)
  }
];