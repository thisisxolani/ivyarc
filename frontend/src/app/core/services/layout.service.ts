import { Injectable, signal, computed } from '@angular/core';

export interface NavigationItem {
  id: string;
  title: string;
  icon: string;
  route?: string;
  children?: NavigationItem[];
  badge?: {
    text: string;
    color: 'blue' | 'green' | 'red' | 'yellow' | 'purple';
  };
  isActive?: boolean;
  isExpanded?: boolean;
}

export interface LayoutConfig {
  sidebarCollapsed: boolean;
  sidebarMini: boolean;
  headerFixed: boolean;
  footerFixed: boolean;
  boxedLayout: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class LayoutService {
  // Layout state signals
  private _sidebarCollapsed = signal(false);
  private _sidebarMini = signal(false);
  private _headerFixed = signal(true);
  private _footerFixed = signal(false);
  private _boxedLayout = signal(false);
  private _activeRoute = signal('');
  private _breadcrumbs = signal<string[]>([]);

  // Navigation items signal
  private _navigationItems = signal<NavigationItem[]>([
    {
      id: 'dashboard',
      title: 'Dashboard',
      icon: 'lucide-home',
      route: '/dashboard'
    },
    {
      id: 'users',
      title: 'User Management',
      icon: 'lucide-users',
      children: [
        {
          id: 'users-list',
          title: 'All Users',
          icon: 'lucide-list',
          route: '/users'
        },
        {
          id: 'users-roles',
          title: 'Roles & Permissions',
          icon: 'lucide-shield',
          route: '/users/roles'
        }
      ]
    },
    {
      id: 'analytics',
      title: 'Analytics',
      icon: 'lucide-bar-chart',
      route: '/analytics',
      badge: {
        text: 'New',
        color: 'green'
      }
    },
    {
      id: 'settings',
      title: 'Settings',
      icon: 'lucide-settings',
      children: [
        {
          id: 'settings-general',
          title: 'General',
          icon: 'lucide-sliders',
          route: '/settings/general'
        },
        {
          id: 'settings-security',
          title: 'Security',
          icon: 'lucide-lock',
          route: '/settings/security'
        },
        {
          id: 'settings-integrations',
          title: 'Integrations',
          icon: 'lucide-plug',
          route: '/settings/integrations'
        }
      ]
    }
  ]);

  // Computed properties
  readonly sidebarCollapsed = this._sidebarCollapsed.asReadonly();
  readonly sidebarMini = this._sidebarMini.asReadonly();
  readonly headerFixed = this._headerFixed.asReadonly();
  readonly footerFixed = this._footerFixed.asReadonly();
  readonly boxedLayout = this._boxedLayout.asReadonly();
  readonly activeRoute = this._activeRoute.asReadonly();
  readonly breadcrumbs = this._breadcrumbs.asReadonly();
  readonly navigationItems = this._navigationItems.asReadonly();

  // Computed layout classes
  readonly mainContentClasses = computed(() => {
    const classes = ['transition-all', 'duration-300', 'ease-in-out'];
    
    if (this._sidebarCollapsed()) {
      classes.push('xl:ml-20');
    } else {
      classes.push('xl:ml-72');
    }
    
    if (this._headerFixed()) {
      classes.push('pt-16');
    }
    
    if (this._boxedLayout()) {
      classes.push('max-w-screen-2xl', 'mx-auto', 'px-4', 'sm:px-6', 'lg:px-8');
    } else {
      classes.push('px-4', 'sm:px-6', 'lg:px-8');
    }
    
    return classes.join(' ');
  });

  readonly sidebarClasses = computed(() => {
    const classes = [
      'fixed', 'left-0', 'top-0', 'z-40', 'h-full',
      'bg-white', 'shadow-sm', 'border-r', 'border-gray-200',
      'transition-all', 'duration-300', 'ease-in-out'
    ];
    
    if (this._sidebarCollapsed()) {
      classes.push('w-20');
    } else {
      classes.push('w-72');
    }
    
    return classes.join(' ');
  });

  readonly headerClasses = computed(() => {
    const classes = [
      'bg-white', 'shadow-sm', 'border-b', 'border-gray-200',
      'px-4', 'sm:px-6', 'lg:px-8'
    ];
    
    if (this._headerFixed()) {
      classes.push('fixed', 'top-0', 'right-0', 'left-0', 'z-30', 'h-16');
    } else {
      classes.push('relative', 'h-16');
    }
    
    if (this._sidebarCollapsed()) {
      classes.push('xl:ml-20');
    } else {
      classes.push('xl:ml-72');
    }
    
    return classes.join(' ');
  });

  // Layout control methods
  toggleSidebar(): void {
    this._sidebarCollapsed.update(value => !value);
  }

  collapseSidebar(): void {
    this._sidebarCollapsed.set(true);
  }

  expandSidebar(): void {
    this._sidebarCollapsed.set(false);
  }

  toggleSidebarMini(): void {
    this._sidebarMini.update(value => !value);
  }

  setHeaderFixed(fixed: boolean): void {
    this._headerFixed.set(fixed);
  }

  setFooterFixed(fixed: boolean): void {
    this._footerFixed.set(fixed);
  }

  setBoxedLayout(boxed: boolean): void {
    this._boxedLayout.set(boxed);
  }

  // Navigation methods
  setActiveRoute(route: string): void {
    this._activeRoute.set(route);
    this.updateNavigationState(route);
  }

  setBreadcrumbs(breadcrumbs: string[]): void {
    this._breadcrumbs.set(breadcrumbs);
  }

  private updateNavigationState(activeRoute: string): void {
    this._navigationItems.update(items => {
      return this.updateItemActiveState(items, activeRoute);
    });
  }

  private updateItemActiveState(items: NavigationItem[], activeRoute: string): NavigationItem[] {
    return items.map(item => {
      const isActive = item.route === activeRoute;
      const hasActiveChild = item.children ? 
        this.hasActiveChild(item.children, activeRoute) : false;
      
      return {
        ...item,
        isActive,
        isExpanded: hasActiveChild || item.isExpanded || false,
        children: item.children ? 
          this.updateItemActiveState(item.children, activeRoute) : undefined
      };
    });
  }

  private hasActiveChild(children: NavigationItem[], activeRoute: string): boolean {
    return children.some(child => 
      child.route === activeRoute || 
      (child.children && this.hasActiveChild(child.children, activeRoute))
    );
  }

  toggleNavigationItem(itemId: string): void {
    this._navigationItems.update(items => {
      return this.toggleItemExpanded(items, itemId);
    });
  }

  private toggleItemExpanded(items: NavigationItem[], itemId: string): NavigationItem[] {
    return items.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          isExpanded: !item.isExpanded
        };
      }
      if (item.children) {
        return {
          ...item,
          children: this.toggleItemExpanded(item.children, itemId)
        };
      }
      return item;
    });
  }

  // Layout configuration methods
  getLayoutConfig(): LayoutConfig {
    return {
      sidebarCollapsed: this._sidebarCollapsed(),
      sidebarMini: this._sidebarMini(),
      headerFixed: this._headerFixed(),
      footerFixed: this._footerFixed(),
      boxedLayout: this._boxedLayout()
    };
  }

  setLayoutConfig(config: Partial<LayoutConfig>): void {
    if (config.sidebarCollapsed !== undefined) {
      this._sidebarCollapsed.set(config.sidebarCollapsed);
    }
    if (config.sidebarMini !== undefined) {
      this._sidebarMini.set(config.sidebarMini);
    }
    if (config.headerFixed !== undefined) {
      this._headerFixed.set(config.headerFixed);
    }
    if (config.footerFixed !== undefined) {
      this._footerFixed.set(config.footerFixed);
    }
    if (config.boxedLayout !== undefined) {
      this._boxedLayout.set(config.boxedLayout);
    }
  }

  // Responsive behavior
  handleScreenResize(width: number): void {
    // Auto-collapse sidebar on mobile
    if (width < 1280) { // xl breakpoint
      this._sidebarCollapsed.set(true);
    } else {
      // Restore previous state on desktop
      const savedState = localStorage.getItem('ivyarc-sidebar-collapsed');
      this._sidebarCollapsed.set(savedState === 'true');
    }
  }

  // Persistence methods
  saveLayoutState(): void {
    const config = this.getLayoutConfig();
    localStorage.setItem('ivyarc-layout-config', JSON.stringify(config));
  }

  loadLayoutState(): void {
    const saved = localStorage.getItem('ivyarc-layout-config');
    if (saved) {
      try {
        const config = JSON.parse(saved) as LayoutConfig;
        this.setLayoutConfig(config);
      } catch (error) {
        console.warn('Failed to load layout state:', error);
      }
    }
  }
}