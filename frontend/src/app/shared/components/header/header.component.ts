import { Component, inject, OnInit, HostListener, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LayoutService } from '../../../core/services/layout.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <header [class]="layoutService.headerClasses()">
      <div class="flex items-center justify-between h-full">
        <div class="flex items-center space-x-4">
          <button
            (click)="toggleSidebar()"
            class="p-2 rounded-lg hover:bg-gray-100 transition-colors xl:hidden"
            title="Toggle sidebar"
          >
            <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          </button>
          
          <!-- Breadcrumbs -->
          <nav class="flex items-center space-x-2 text-sm" aria-label="Breadcrumb">
            <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2z"/>
            </svg>
            <span class="text-gray-500">Home</span>
            @for (breadcrumb of layoutService.breadcrumbs(); track breadcrumb; let last = $last) {
              <svg class="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
              <span [class]="last ? 'text-gray-900 font-medium' : 'text-gray-500'">{{ breadcrumb }}</span>
            }
          </nav>
        </div>

        <div class="flex items-center space-x-4">
          <!-- Search -->
          <div class="relative hidden md:block">
            <input
              type="text"
              placeholder="Search..."
              [(ngModel)]="searchQuery"
              (input)="onSearch($event)"
              class="w-80 pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-200 text-sm"
            >
            <svg class="absolute left-3 top-3 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            @if (searchQuery) {
              <button
                (click)="clearSearch()"
                class="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            }
          </div>

          <!-- Quick Actions -->
          <div class="flex items-center space-x-2">
            <!-- Notifications -->
            <div class="relative">
              <button 
                (click)="toggleNotifications()"
                class="p-2.5 rounded-xl hover:bg-gray-100 transition-colors relative group"
                title="Notifications"
              >
                <svg class="w-5 h-5 text-gray-600 group-hover:text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-5-5 5-5v10zM4 18v-11a8 8 0 1116 0v11"/>
                </svg>
                @if (showNotifications && notificationCount > 0) {
                  <span class="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium animate-pulse">
                    {{ notificationCount }}
                  </span>
                }
              </button>
              
              @if (showNotificationsPanel) {
                <div class="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                  <div class="px-4 py-2 border-b border-gray-100">
                    <h3 class="text-sm font-semibold text-gray-900">Notifications</h3>
                  </div>
                  <div class="max-h-96 overflow-y-auto">
                    @for (notification of notifications; track notification.id) {
                      <div class="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-b-0">
                        <div class="flex items-start space-x-3">
                          <div [class]="getNotificationIconClasses(notification.type)">
                            <i [class]="getNotificationIcon(notification.type)"></i>
                          </div>
                          <div class="flex-1 min-w-0">
                            <p class="text-sm font-medium text-gray-900">{{ notification.title }}</p>
                            <p class="text-sm text-gray-500 truncate">{{ notification.message }}</p>
                            <p class="text-xs text-gray-400 mt-1">{{ notification.time }}</p>
                          </div>
                        </div>
                      </div>
                    } @empty {
                      <div class="px-4 py-6 text-center">
                        <svg class="w-12 h-12 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-5-5 5-5v10zM4 18v-11a8 8 0 1116 0v11"/>
                        </svg>
                        <p class="text-sm text-gray-500">No notifications</p>
                      </div>
                    }
                  </div>
                  <div class="px-4 py-2 border-t border-gray-100">
                    <button class="text-sm text-blue-600 hover:text-blue-800 font-medium">View all</button>
                  </div>
                </div>
              }
            </div>
            
            <!-- Settings -->
            <button 
              class="p-2.5 rounded-xl hover:bg-gray-100 transition-colors group"
              title="Settings"
            >
              <svg class="w-5 h-5 text-gray-600 group-hover:text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
            </button>
          </div>

          <!-- User Menu -->
          <div class="relative border-l border-gray-200 pl-4">
            <button
              (click)="toggleUserMenu()"
              class="flex items-center space-x-3 p-2 rounded-xl hover:bg-gray-100 transition-all duration-200 group"
            >
              <div class="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-sm">
                <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/>
                </svg>
              </div>
              <div class="hidden md:block text-left">
                <p class="text-sm font-semibold text-gray-900">{{ userName }}</p>
                <p class="text-xs text-gray-500">admin@ivyarc.com</p>
              </div>
              <svg class="w-4 h-4 text-gray-400 hidden md:block transition-transform duration-200 group-hover:text-gray-600" 
                   [class.rotate-180]="showUserMenu" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
              </svg>
            </button>

            @if (showUserMenu || userMenuOpen) {
              <div class="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                <div class="px-4 py-2 border-b border-gray-100">
                  <p class="text-sm font-semibold text-gray-900">{{ userName }}</p>
                  <p class="text-xs text-gray-500">admin@ivyarc.com</p>
                </div>
                <div class="py-1">
                  <button class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center">
                    <svg class="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                    </svg>
                    Profile Settings
                  </button>
                  <button class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center">
                    <svg class="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    </svg>
                    Preferences
                  </button>
                  <button class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center">
                    <svg class="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                    </svg>
                    Activity Log
                  </button>
                </div>
                <div class="border-t border-gray-100 py-1">
                  <button
                    (click)="onLogout()"
                    class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center"
                  >
                    <svg class="w-4 h-4 mr-3 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                    </svg>
                    Sign Out
                  </button>
                </div>
              </div>
            }
          </div>
        </div>
      </div>
    </header>
  `
})
export class HeaderComponent implements OnInit {
  layoutService = inject(LayoutService);
  
  @Input() title = 'Dashboard';
  @Input() userName = 'Admin User';
  @Input() showSearch = true;
  @Input() showNotifications = true;
  @Input() notificationCount = 3;
  @Input() userMenuOpen = false;
  
  @Output() menuToggle = new EventEmitter<void>();
  @Output() userMenuToggle = new EventEmitter<void>();
  @Output() logout = new EventEmitter<void>();
  
  searchQuery = '';
  showUserMenu = false;
  showNotificationsPanel = false;
  
  notifications = [
    {
      id: 1,
      type: 'security',
      title: 'Security Alert',
      message: 'New login detected from unknown device',
      time: '2 minutes ago'
    },
    {
      id: 2,
      type: 'info',
      title: 'System Update',
      message: 'Scheduled maintenance tonight at 2:00 AM',
      time: '1 hour ago'
    },
    {
      id: 3,
      type: 'success',
      title: 'Backup Complete',
      message: 'Daily backup has been completed successfully',
      time: '3 hours ago'
    }
  ];

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    if (!event.target || !(event.target as Element).closest('.relative')) {
      this.showUserMenu = false;
      this.showNotificationsPanel = false;
    }
  }

  ngOnInit(): void {
    // Load saved layout state
    this.layoutService.loadLayoutState();
  }

  toggleSidebar(): void {
    this.layoutService.toggleSidebar();
    this.layoutService.saveLayoutState();
    this.menuToggle.emit();
  }

  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
    this.showNotificationsPanel = false;
    this.userMenuToggle.emit();
  }

  toggleNotifications(): void {
    this.showNotificationsPanel = !this.showNotificationsPanel;
    this.showUserMenu = false;
  }

  onSearch(event: any): void {
    const query = event.target.value;
    console.log('Search query:', query);
    // Implement search logic here
  }

  clearSearch(): void {
    this.searchQuery = '';
  }

  onLogout(): void {
    this.showUserMenu = false;
    this.logout.emit();
  }

  getNotificationIcon(type: string): string {
    switch (type) {
      case 'security':
        return 'lucide-shield-alert';
      case 'info':
        return 'lucide-info';
      case 'success':
        return 'lucide-check-circle';
      case 'warning':
        return 'lucide-alert-triangle';
      case 'error':
        return 'lucide-alert-circle';
      default:
        return 'lucide-bell';
    }
  }

  getNotificationIconClasses(type: string): string {
    const baseClasses = ['w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0'];
    
    switch (type) {
      case 'security':
        baseClasses.push('bg-red-100 text-red-600');
        break;
      case 'info':
        baseClasses.push('bg-blue-100 text-blue-600');
        break;
      case 'success':
        baseClasses.push('bg-green-100 text-green-600');
        break;
      case 'warning':
        baseClasses.push('bg-yellow-100 text-yellow-600');
        break;
      case 'error':
        baseClasses.push('bg-red-100 text-red-600');
        break;
      default:
        baseClasses.push('bg-gray-100 text-gray-600');
    }
    
    return baseClasses.join(' ');
  }
}
