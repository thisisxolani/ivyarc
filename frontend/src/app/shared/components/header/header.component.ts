import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  imports: [CommonModule],
  template: `
    <header class="bg-white border-b border-gray-200 px-6 py-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <button
            (click)="onMenuToggle()"
            class="p-2 rounded-lg hover:bg-gray-100 transition-colors lg:hidden"
          >
            <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          </button>
          
          @if (title()) {
            <h1 class="text-2xl font-semibold text-gray-900">{{ title() }}</h1>
          }
        </div>

        <div class="flex items-center space-x-4">
          <!-- Search -->
          @if (showSearch()) {
            <div class="relative">
              <input
                type="text"
                placeholder="Search..."
                class="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
              <svg class="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </div>
          }

          <!-- Notifications -->
          @if (showNotifications()) {
            <div class="relative">
              <button class="p-2 rounded-lg hover:bg-gray-100 transition-colors relative">
                <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-5 5v-5zM8 3v4l-3-3m0 0l3-3"/>
                </svg>
                @if (notificationCount() && notificationCount()! > 0) {
                  <span class="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {{ notificationCount() }}
                  </span>
                }
              </button>
            </div>
          }

          <!-- User Menu -->
          <div class="relative">
            <button
              (click)="onUserMenuToggle()"
              class="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div class="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <svg class="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/>
                </svg>
              </div>
              <span class="text-sm font-medium text-gray-900 hidden md:block">{{ userName() }}</span>
              <svg class="w-4 h-4 text-gray-500 hidden md:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
              </svg>
            </button>

            @if (userMenuOpen()) {
              <div class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Profile</a>
                <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Settings</a>
                <hr class="my-1 border-gray-100">
                <button
                  (click)="onLogout()"
                  class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Sign out
                </button>
              </div>
            }
          </div>
        </div>
      </div>
    </header>
  `
})
export class HeaderComponent {
  title = input<string>();
  userName = input('User');
  showSearch = input(true);
  showNotifications = input(true);
  notificationCount = input<number>(0);
  userMenuOpen = input(false);

  menuToggle = output<void>();
  userMenuToggle = output<void>();
  logout = output<void>();

  onMenuToggle(): void {
    this.menuToggle.emit();
  }

  onUserMenuToggle(): void {
    this.userMenuToggle.emit();
  }

  onLogout(): void {
    this.logout.emit();
  }
}