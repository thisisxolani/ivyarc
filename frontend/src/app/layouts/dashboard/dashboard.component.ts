import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, RouterLink } from '@angular/router';
import { LayoutService } from '../../shared/services/layout.service';
import { BreadcrumbComponent } from '../../shared/components/breadcrumb/breadcrumb.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, BreadcrumbComponent],
  template: `
    <div class="flex h-screen bg-gray-50">
      <!-- Sidebar -->
      <aside [class]="sidebarClasses()">
        <!-- Sidebar Header -->
        <div class="flex items-center justify-between p-4 border-b border-gray-200">
          <div class="flex items-center space-x-2">
            <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span class="text-white font-bold text-sm">IA</span>
            </div>
            <span class="font-semibold text-gray-900">IvyArc</span>
          </div>
          <button 
            (click)="layoutService.toggleSidebar()" 
            class="lg:hidden p-1 rounded-md hover:bg-gray-100"
            aria-label="Toggle sidebar">
            <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <!-- Navigation -->
        <nav class="flex-1 px-4 py-6 space-y-1">
          <a routerLink="/dashboard" 
             routerLinkActive="active" 
             class="nav-link"
             (click)="layoutService.closeSidebar()">
            <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5v4m8-4v4"></path>
            </svg>
            Dashboard
          </a>
          
          <a routerLink="/users" 
             routerLinkActive="active" 
             class="nav-link"
             (click)="layoutService.closeSidebar()">
            <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"></path>
            </svg>
            User Management
          </a>
          
          <a routerLink="/audit" 
             routerLinkActive="active" 
             class="nav-link"
             (click)="layoutService.closeSidebar()">
            <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            Audit Logs
          </a>
          
          <a routerLink="/settings" 
             routerLinkActive="active" 
             class="nav-link"
             (click)="layoutService.closeSidebar()">
            <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
            Settings
          </a>
        </nav>

        <!-- Sidebar Footer -->
        <div class="p-4 border-t border-gray-200">
          <div class="flex items-center space-x-3">
            <div class="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <span class="text-sm font-medium text-gray-600">{{ userInitials }}</span>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900 truncate">{{ userName }}</p>
              <p class="text-xs text-gray-500 truncate">{{ userEmail }}</p>
            </div>
            <button 
              routerLink="/profile"
              class="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="View profile">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
            </button>
          </div>
        </div>
      </aside>

      <!-- Sidebar Overlay for Mobile -->
      <div 
        *ngIf="layoutService.sidebarOpen()" 
        class="sidebar-overlay lg:hidden"
        (click)="layoutService.closeSidebar()">
      </div>

      <!-- Main Content -->
      <div class="flex flex-col flex-1 overflow-hidden">
        <!-- Header -->
        <header class="header">
          <div class="flex items-center justify-between px-4 py-4 sm:px-6">
            <div class="flex items-center space-x-4">
              <button 
                (click)="layoutService.toggleSidebar()" 
                class="lg:hidden p-2 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                aria-label="Open sidebar">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                </svg>
              </button>
              <div class="flex flex-col">
                <h1 class="text-xl font-semibold text-gray-900">{{ layoutService.pageTitle() }}</h1>
                <app-breadcrumb class="mt-1"></app-breadcrumb>
              </div>
            </div>

            <div class="flex items-center space-x-4">
              <!-- Notifications -->
              <button 
                class="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full relative"
                aria-label="View notifications">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                </svg>
                <!-- Notification badge -->
                <span class="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
              </button>

              <!-- User Menu -->
              <div class="relative">
                <button 
                  routerLink="/profile"
                  class="flex items-center space-x-2 p-2 text-sm rounded-full hover:bg-gray-100"
                  aria-label="User menu">
                  <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span class="text-white font-medium text-sm">{{ userInitials }}</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </header>

        <!-- Main Content Area -->
        <main class="main-content">
          <div class="p-4 sm:p-6 lg:p-8">
            <router-outlet></router-outlet>
          </div>
        </main>
      </div>
    </div>
  `,
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  layoutService = inject(LayoutService);
  
  // User data (would come from auth service in real app)
  userName = 'John Doe';
  userEmail = 'john.doe@ivyarc.com';
  userInitials = 'JD';

  constructor(private router: Router) {}

  ngOnInit() {
    console.log('DashboardComponent - ngOnInit called');
    console.log('DashboardComponent - This should NOT be visible if auth guard is working');
    // Layout service handles route tracking automatically
  }

  sidebarClasses() {
    return `sidebar ${!this.layoutService.sidebarOpen() ? 'closed' : ''}`;
  }
}