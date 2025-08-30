import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

export interface SidebarItem {
  label: string;
  icon: string;
  route?: string;
  children?: SidebarItem[];
  badge?: string;
  isActive?: boolean;
}

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="h-full flex flex-col">
      <!-- Logo -->
      <div class="flex items-center justify-between p-6">
        <div class="flex items-center space-x-2">
          <div class="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <span class="text-white font-bold text-sm">A</span>
          </div>
          @if (!collapsed()) {
            <span class="font-semibold text-gray-900">Auth Dashboard</span>
          }
        </div>
        @if (!collapsed()) {
          <button 
            (click)="onToggle()"
            class="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7"/>
            </svg>
          </button>
        }
      </div>

      <!-- Navigation Items -->
      <div class="flex-1 px-3 pb-4">
        <ul class="space-y-1">
          @for (item of items(); track item.label) {
            <li>
              @if (item.route) {
                <a
                  [routerLink]="item.route"
                  routerLinkActive="bg-primary-50 border-r-2 border-primary-500 text-primary-700"
                  class="group flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <span [innerHTML]="item.icon" class="flex-shrink-0 w-5 h-5 mr-3 text-gray-400 group-hover:text-gray-500"></span>
                  @if (!collapsed()) {
                    <span class="truncate">{{ item.label }}</span>
                    @if (item.badge) {
                      <span class="ml-auto inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {{ item.badge }}
                      </span>
                    }
                  }
                </a>
              } @else {
                <div class="flex items-center px-3 py-2 text-sm font-medium text-gray-900">
                  <span [innerHTML]="item.icon" class="flex-shrink-0 w-5 h-5 mr-3 text-gray-400"></span>
                  @if (!collapsed()) {
                    <span class="truncate">{{ item.label }}</span>
                  }
                </div>
                @if (item.children && !collapsed()) {
                  <ul class="ml-8 mt-1 space-y-1">
                    @for (child of item.children; track child.label) {
                      <li>
                        <a
                          [routerLink]="child.route"
                          routerLinkActive="bg-primary-50 text-primary-700"
                          class="block px-3 py-2 text-sm text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900 transition-colors"
                        >
                          {{ child.label }}
                        </a>
                      </li>
                    }
                  </ul>
                }
              }
            </li>
          }
        </ul>
      </div>

      <!-- User Section -->
      <div class="p-4 border-t border-gray-200">
        <div class="flex items-center space-x-3">
          <div class="flex-shrink-0 w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
            <svg class="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/>
            </svg>
          </div>
          @if (!collapsed()) {
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900 truncate">{{ userName() }}</p>
              <p class="text-xs text-gray-500 truncate">{{ userEmail() }}</p>
            </div>
            <button
              (click)="onLogout()"
              class="flex-shrink-0 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              title="Logout"
            >
              <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
              </svg>
            </button>
          }
        </div>
      </div>
    </nav>
  `
})
export class SidebarComponent {
  items = input.required<SidebarItem[]>();
  collapsed = input(false);
  userName = input('User');
  userEmail = input('user@example.com');
  
  toggle = output<boolean>();
  logout = output<void>();

  onToggle(): void {
    this.toggle.emit(!this.collapsed());
  }

  onLogout(): void {
    this.logout.emit();
  }
}