import { Injectable, signal } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { filter, map } from 'rxjs/operators';

export interface BreadcrumbItem {
  label: string;
  url?: string;
}

@Injectable({
  providedIn: 'root'
})
export class LayoutService {
  private readonly _sidebarOpen = signal(false);
  private readonly _pageTitle = signal('Dashboard');
  private readonly _breadcrumbs = signal<BreadcrumbItem[]>([]);

  readonly sidebarOpen = this._sidebarOpen.asReadonly();
  readonly pageTitle = this._pageTitle.asReadonly();
  readonly breadcrumbs = this._breadcrumbs.asReadonly();

  constructor(private router: Router, private activatedRoute: ActivatedRoute) {
    this.initializeRouteTracking();
  }

  toggleSidebar(): void {
    this._sidebarOpen.update(open => !open);
  }

  closeSidebar(): void {
    this._sidebarOpen.set(false);
  }

  openSidebar(): void {
    this._sidebarOpen.set(true);
  }

  setPageTitle(title: string): void {
    this._pageTitle.set(title);
    document.title = `${title} - IvyArc`;
  }

  private initializeRouteTracking(): void {
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        map(() => this.activatedRoute),
        map(route => {
          while (route.firstChild) {
            route = route.firstChild;
          }
          return route;
        })
      )
      .subscribe(route => {
        const data = route.snapshot.data;
        const breadcrumb = data['breadcrumb'];
        
        if (breadcrumb) {
          this.setPageTitle(breadcrumb);
          this.updateBreadcrumbs(route);
        }
      });
  }

  private updateBreadcrumbs(route: ActivatedRoute): void {
    const breadcrumbs: BreadcrumbItem[] = [];
    let currentRoute: ActivatedRoute | null = route;

    while (currentRoute) {
      const data = currentRoute.snapshot.data;
      const breadcrumb = data['breadcrumb'];
      
      if (breadcrumb) {
        const url = this.createBreadcrumbUrl(currentRoute);
        breadcrumbs.unshift({
          label: breadcrumb,
          url: url
        });
      }
      
      currentRoute = currentRoute.parent;
    }

    // Add home breadcrumb
    if (breadcrumbs.length > 0 && breadcrumbs[0].label !== 'Dashboard') {
      breadcrumbs.unshift({
        label: 'Dashboard',
        url: '/dashboard'
      });
    }

    this._breadcrumbs.set(breadcrumbs);
  }

  private createBreadcrumbUrl(route: ActivatedRoute): string {
    const urlSegments: string[] = [];
    let currentRoute: ActivatedRoute | null = route;

    while (currentRoute) {
      urlSegments.unshift(...currentRoute.snapshot.url.map(segment => segment.path));
      currentRoute = currentRoute.parent;
    }

    return '/' + urlSegments.join('/');
  }
}