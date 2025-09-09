import { Component, inject, OnInit, HostListener, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { LayoutService, NavigationItem } from '../../../core/services/layout.service';

export interface SidebarItem {
  id: string;
  title: string;
  icon: string;
  route?: string;
  badge?: {
    text: string;
    color: string;
  };
  children?: SidebarItem[];
  isActive?: boolean;
  isExpanded?: boolean;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside [class]="layoutService.sidebarClasses()">
      <div class="flex flex-col h-full">
        <!-- Logo -->
        <div class="flex items-center justify-between p-4 border-b border-gray-200">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-sm">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
              </svg>
            </div>
            @if (!layoutService.sidebarCollapsed()) {
              <div class="min-w-0">
                <h1 class="text-xl font-bold text-gray-900 truncate">IvyArc</h1>
                <p class="text-xs text-gray-500 truncate">Auth Platform</p>
              </div>
            }
          </div>
          @if (!layoutService.sidebarCollapsed()) {
            <button 
              (click)="toggleSidebar()"
              class="p-2 rounded-lg hover:bg-gray-100 transition-colors group"
              title="Collapse sidebar"
            >
              <svg class="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7"/>
              </svg>
            </button>
          }
        </div>

        <!-- Navigation Items -->
        <nav class="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          @for (item of layoutService.navigationItems(); track item.id) {
            <div>
              @if (item.route && !item.children) {
                <!-- Simple navigation item -->
                <a
                  [routerLink]="item.route"
                  [class]="getNavItemClasses(item)"
                  [title]="layoutService.sidebarCollapsed() ? item.title : ''"
                >
                  <i [class]="getIconClasses(item)"></i>
                  @if (!layoutService.sidebarCollapsed()) {
                    <span class="truncate">{{ item.title }}</span>
                    @if (item.badge) {
                      <span [class]="getBadgeClasses(item.badge.color)">
                        {{ item.badge.text }}
                      </span>
                    }
                  }
                </a>
              } @else {
                <!-- Parent item with children -->
                <button
                  (click)="toggleNavigationItem(item.id)"
                  [class]="getParentItemClasses(item)"
                  [title]="layoutService.sidebarCollapsed() ? item.title : ''"
                >
                  <i [class]="getIconClasses(item)"></i>
                  @if (!layoutService.sidebarCollapsed()) {
                    <span class="truncate flex-1 text-left">{{ item.title }}</span>
                    @if (item.badge) {
                      <span [class]="getBadgeClasses(item.badge.color)">
                        {{ item.badge.text }}
                      </span>
                    }
                    <svg
                      class="w-4 h-4 transition-transform duration-200"
                      [class.rotate-180]="item.isExpanded"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                    </svg>
                  }
                </button>
                
                <!-- Children items -->
                @if (item.children && item.isExpanded && !layoutService.sidebarCollapsed()) {
                  <div class="ml-6 mt-2 space-y-1 border-l border-gray-200 pl-4">
                    @for (child of item.children; track child.id) {
                      <a
                        [routerLink]="child.route"
                        [class]="getChildItemClasses(child)"
                      >
                        <i [class]="getChildIconClasses(child)"></i>
                        <span class="truncate">{{ child.title }}</span>
                        @if (child.badge) {
                          <span [class]="getBadgeClasses(child.badge.color)">
                            {{ child.badge.text }}
                          </span>
                        }
                      </a>
                    }
                  </div>
                }
              }
            </div>
          }
        </nav>

        <!-- User Section -->
        <div class="p-4 border-t border-gray-200 bg-gray-50">
          <div class="flex items-center space-x-3">
            <div class="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-sm">
              <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/>
              </svg>
            </div>
            @if (!layoutService.sidebarCollapsed()) {
              <div class="flex-1 min-w-0">
                <p class="text-sm font-semibold text-gray-900 truncate">Admin User</p>
                <p class="text-xs text-gray-500 truncate">admin@ivyarc.com</p>
              </div>
              <div class="flex items-center space-x-1">
                <button
                  (click)="showUserMenu = !showUserMenu"
                  class="flex-shrink-0 p-2 rounded-lg hover:bg-gray-200 transition-colors group relative"
                  title="User menu"
                >
                  <svg class="w-4 h-4 text-gray-500 group-hover:text-gray-700 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zM12 13a1 1 0 110-2 1 1 0 010 2zM12 20a1 1 0 110-2 1 1 0 010 2z"/>
                  </svg>
                  
                  <!-- User Dropdown Menu -->
                  @if (showUserMenu) {
                    <div class="absolute bottom-full right-0 mb-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                      <button class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        <i class="lucide-user w-4 h-4 inline mr-2"></i>
                        Profile Settings
                      </button>
                      <button class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        <i class="lucide-settings w-4 h-4 inline mr-2"></i>
                        Preferences
                      </button>
                      <div class="border-t border-gray-100 my-1"></div>
                      <button
                        (click)="onLogout()"
                        class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <i class="lucide-log-out w-4 h-4 inline mr-2"></i>
                        Sign Out
                      </button>
                    </div>
                  }
                </button>
              </div>
            } @else {
              <button
                (click)="onLogout()"
                class="flex-shrink-0 p-2 rounded-lg hover:bg-gray-200 transition-colors"
                title="Sign out"
              >
                <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                </svg>
              </button>
            }
          </div>
        </div>
      </div>
    </aside>
  `
})
export class SidebarComponent implements OnInit {
  layoutService = inject(LayoutService);
  private router = inject(Router);
  
  @Input() items: SidebarItem[] = [];
  @Input() collapsed = false;
  @Input() userName = 'Admin User';
  @Input() userEmail = 'admin@ivyarc.com';
  
  @Output() toggle = new EventEmitter<boolean>();
  @Output() logout = new EventEmitter<void>();
  
  showUserMenu = false;

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    if (!event.target || !(event.target as Element).closest('.relative')) {
      this.showUserMenu = false;
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any): void {
    this.layoutService.handleScreenResize(event.target.innerWidth);
  }

  ngOnInit(): void {
    // Listen to route changes and update active navigation
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.layoutService.setActiveRoute(event.url);
        this.updateBreadcrumbs(event.url);
      });

    // Load saved layout state
    this.layoutService.loadLayoutState();
  }

  toggleSidebar(): void {
    this.layoutService.toggleSidebar();
    this.layoutService.saveLayoutState();
    this.toggle.emit(this.layoutService.sidebarCollapsed());
  }

  toggleNavigationItem(itemId: string): void {
    this.layoutService.toggleNavigationItem(itemId);
  }

  onLogout(): void {
    this.showUserMenu = false;
    this.logout.emit();
  }

  getNavItemClasses(item: NavigationItem): string {
    const baseClasses = [
      'group', 'flex', 'items-center', 'w-full', 'text-left',
      'px-3', 'py-2.5', 'text-sm', 'font-medium', 'rounded-lg',
      'transition-all', 'duration-200'
    ];

    if (this.layoutService.sidebarCollapsed()) {
      baseClasses.push('justify-center');
    }

    if (item.isActive) {
      baseClasses.push(
        'bg-blue-50', 'text-blue-700', 'border-r-2', 'border-blue-500'
      );
    } else {
      baseClasses.push(
        'text-gray-700', 'hover:bg-gray-50', 'hover:text-gray-900'
      );
    }

    return baseClasses.join(' ');
  }

  getParentItemClasses(item: NavigationItem): string {
    const baseClasses = [
      'group', 'flex', 'items-center', 'w-full', 'text-left',
      'px-3', 'py-2.5', 'text-sm', 'font-medium', 'rounded-lg',
      'transition-all', 'duration-200'
    ];

    if (this.layoutService.sidebarCollapsed()) {
      baseClasses.push('justify-center');
    }

    const hasActiveChild = item.children?.some(child => child.isActive);
    if (hasActiveChild) {
      baseClasses.push(
        'bg-blue-50', 'text-blue-700'
      );
    } else {
      baseClasses.push(
        'text-gray-700', 'hover:bg-gray-50', 'hover:text-gray-900'
      );
    }

    return baseClasses.join(' ');
  }

  getChildItemClasses(child: NavigationItem): string {
    const baseClasses = [
      'group', 'flex', 'items-center', 'w-full', 'text-left',
      'px-3', 'py-2', 'text-sm', 'rounded-lg',
      'transition-all', 'duration-200'
    ];

    if (child.isActive) {
      baseClasses.push(
        'bg-blue-50', 'text-blue-700', 'font-medium'
      );
    } else {
      baseClasses.push(
        'text-gray-600', 'hover:bg-gray-50', 'hover:text-gray-900'
      );
    }

    return baseClasses.join(' ');
  }

  getIconClasses(item: NavigationItem): string {
    const baseClasses = [item.icon, 'w-5', 'h-5', 'flex-shrink-0'];
    
    if (!this.layoutService.sidebarCollapsed()) {
      baseClasses.push('mr-3');
    }
    
    if (item.isActive) {
      baseClasses.push('text-blue-600');
    } else {
      baseClasses.push('text-gray-400', 'group-hover:text-gray-500');
    }
    
    return baseClasses.join(' ');
  }

  getChildIconClasses(child: NavigationItem): string {
    const baseClasses = [child.icon, 'w-4', 'h-4', 'flex-shrink-0', 'mr-2'];
    
    if (child.isActive) {
      baseClasses.push('text-blue-600');
    } else {
      baseClasses.push('text-gray-400', 'group-hover:text-gray-500');
    }
    
    return baseClasses.join(' ');
  }

  getBadgeClasses(color: string): string {
    const baseClasses = [
      'ml-auto', 'inline-flex', 'items-center', 'px-2', 'py-0.5',
      'rounded-full', 'text-xs', 'font-medium'
    ];

    switch (color) {
      case 'blue':
        baseClasses.push('bg-blue-100', 'text-blue-800');
        break;
      case 'green':
        baseClasses.push('bg-green-100', 'text-green-800');
        break;
      case 'red':
        baseClasses.push('bg-red-100', 'text-red-800');
        break;
      case 'yellow':
        baseClasses.push('bg-yellow-100', 'text-yellow-800');
        break;
      case 'purple':
        baseClasses.push('bg-purple-100', 'text-purple-800');
        break;
      default:
        baseClasses.push('bg-gray-100', 'text-gray-800');
    }

    return baseClasses.join(' ');
  }

  private updateBreadcrumbs(url: string): void {
    const segments = url.split('/').filter(segment => segment);
    const breadcrumbs = segments.map(segment => 
      segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ')
    );
    this.layoutService.setBreadcrumbs(breadcrumbs);
  }
}
