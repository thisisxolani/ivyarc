import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { SidebarComponent, SidebarItem } from '../../shared/components/sidebar/sidebar.component';
import { HeaderComponent } from '../../shared/components/header/header.component';

@Component({
  selector: 'app-dashboard-layout',
  imports: [CommonModule, RouterOutlet, SidebarComponent, HeaderComponent],
  template: `
    <div class="flex h-screen bg-gray-50">
      <!-- Sidebar -->
      <div [class]="sidebarClasses()">
        <app-sidebar
          [items]="navigationItems"
          [collapsed]="sidebarCollapsed()"
          [userName]="currentUser()?.fullName || 'User'"
          [userEmail]="currentUser()?.email || ''"
          (toggle)="toggleSidebar($event)"
          (logout)="logout()"
        />
      </div>

      <!-- Main Content -->
      <div class="flex-1 flex flex-col overflow-hidden">
        <!-- Header -->
        <app-header
          [title]="pageTitle()"
          [userName]="currentUser()?.fullName || 'User'"
          [showSearch]="showSearch()"
          [showNotifications]="showNotifications()"
          [notificationCount]="notificationCount()"
          [userMenuOpen]="userMenuOpen()"
          (menuToggle)="toggleMobileSidebar()"
          (userMenuToggle)="toggleUserMenu()"
          (logout)="logout()"
        />

        <!-- Page Content -->
        <main class="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          <div class="max-w-7xl mx-auto">
            <router-outlet></router-outlet>
          </div>
        </main>
      </div>
    </div>

    <!-- Mobile sidebar backdrop -->
    @if (mobileSidebarOpen()) {
      <div class="fixed inset-0 z-40 lg:hidden">
        <div
          class="fixed inset-0 bg-black bg-opacity-50"
          (click)="closeMobileSidebar()"
        ></div>
      </div>
    }
  `
})
export class DashboardLayoutComponent {
  private readonly authService = inject(AuthService);
  
  readonly sidebarCollapsed = signal(false);
  readonly mobileSidebarOpen = signal(false);
  readonly userMenuOpen = signal(false);
  readonly pageTitle = signal('Dashboard');
  readonly showSearch = signal(true);
  readonly showNotifications = signal(true);
  readonly notificationCount = signal(3);

  readonly currentUser = this.authService.currentUser;

  readonly navigationItems: SidebarItem[] = [
    {
      label: 'Dashboard',
      icon: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"/>
      </svg>`,
      route: '/dashboard'
    },
    {
      label: 'Users',
      icon: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"/>
      </svg>`,
      route: '/dashboard/users',
      badge: '12'
    },
    {
      label: 'Roles',
      icon: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
      </svg>`,
      route: '/dashboard/roles'
    },
    {
      label: 'Audit Logs',
      icon: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
      </svg>`,
      route: '/dashboard/audit'
    },
    {
      label: 'Settings',
      icon: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
      </svg>`,
      route: '/dashboard/settings'
    }
  ];

  sidebarClasses = () => {
    const baseClasses = 'bg-white border-r border-gray-200 transition-all duration-300 ease-in-out';
    const desktopClasses = 'hidden lg:block';
    const mobileClasses = this.mobileSidebarOpen() 
      ? 'fixed inset-y-0 left-0 z-50 w-64 lg:static lg:inset-0' 
      : 'fixed -left-64 inset-y-0 z-50 w-64 lg:static lg:left-0';
    
    const width = this.sidebarCollapsed() ? 'lg:w-16' : 'lg:w-64';
    
    return `${baseClasses} ${desktopClasses} ${mobileClasses} ${width}`;
  };

  toggleSidebar(collapsed: boolean): void {
    this.sidebarCollapsed.set(collapsed);
  }

  toggleMobileSidebar(): void {
    this.mobileSidebarOpen.update(open => !open);
  }

  closeMobileSidebar(): void {
    this.mobileSidebarOpen.set(false);
  }

  toggleUserMenu(): void {
    this.userMenuOpen.update(open => !open);
  }

  logout(): void {
    this.authService.logout().subscribe();
  }
}