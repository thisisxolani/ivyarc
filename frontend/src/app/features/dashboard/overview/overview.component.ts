import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { CardComponent } from '../../../shared/components/card/card.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';

interface StatCard {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  icon: string;
}

@Component({
  selector: 'app-overview',
  imports: [CommonModule, CardComponent, ButtonComponent],
  template: `
    <div class="space-y-6">
      <!-- Welcome Header -->
      <div class="bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg p-6 text-white">
        <h1 class="text-2xl font-bold">Welcome back, {{ currentUser()?.firstName || 'User' }}!</h1>
        <p class="text-primary-100 mt-2">Here's what's happening with your application today.</p>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        @for (stat of stats(); track stat.title) {
          <app-card>
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div [class]="getStatIconClasses(stat.trend)">
                  <span [innerHTML]="stat.icon" class="h-6 w-6"></span>
                </div>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">
                    {{ stat.title }}
                  </dt>
                  <dd class="flex items-baseline">
                    <div class="text-2xl font-semibold text-gray-900">
                      {{ stat.value }}
                    </div>
                    <div [class]="getTrendClasses(stat.trend)" class="ml-2 flex items-baseline text-sm font-semibold">
                      <svg [class]="getTrendIconClasses(stat.trend)" fill="currentColor" viewBox="0 0 20 20" class="self-center flex-shrink-0 h-4 w-4">
                        @if (stat.trend === 'up') {
                          <path fill-rule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                        } @else if (stat.trend === 'down') {
                          <path fill-rule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                        }
                      </svg>
                      <span class="sr-only">{{ stat.trend === 'up' ? 'Increased' : stat.trend === 'down' ? 'Decreased' : 'No change' }} by</span>
                      {{ stat.change }}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </app-card>
        }
      </div>

      <!-- Recent Activity -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <app-card title="Recent Users" subtitle="Latest user registrations">
          <div class="flow-root">
            <ul class="-my-5 divide-y divide-gray-200">
              @for (user of recentUsers(); track user.id) {
                <li class="py-4">
                  <div class="flex items-center space-x-4">
                    <div class="flex-shrink-0">
                      <div class="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                        <span class="text-sm font-medium text-gray-600">{{ user.initials }}</span>
                      </div>
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-medium text-gray-900 truncate">
                        {{ user.name }}
                      </p>
                      <p class="text-sm text-gray-500 truncate">
                        {{ user.email }}
                      </p>
                    </div>
                    <div class="inline-flex items-center text-base font-semibold text-gray-900">
                      <span [class]="getUserStatusClasses(user.status)" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
                        {{ user.status }}
                      </span>
                    </div>
                  </div>
                </li>
              }
            </ul>
          </div>
          <div slot="footer">
            <app-button variant="ghost" size="sm">
              View all users
            </app-button>
          </div>
        </app-card>

        <app-card title="System Status" subtitle="Current system health">
          <div class="space-y-4">
            @for (service of systemServices(); track service.name) {
              <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div class="flex items-center space-x-3">
                  <div [class]="getServiceStatusClasses(service.status)" class="w-3 h-3 rounded-full"></div>
                  <span class="text-sm font-medium text-gray-900">{{ service.name }}</span>
                </div>
                <div class="flex items-center space-x-2">
                  <span class="text-sm text-gray-500">{{ service.uptime }}</span>
                  <span [class]="getServiceStatusTextClasses(service.status)" class="text-xs font-medium">
                    {{ service.status }}
                  </span>
                </div>
              </div>
            }
          </div>
        </app-card>
      </div>
    </div>
  `
})
export class OverviewComponent {
  private readonly authService = inject(AuthService);
  
  readonly currentUser = this.authService.currentUser;

  readonly stats = signal<StatCard[]>([
    {
      title: 'Total Users',
      value: '2,651',
      change: '+4.5%',
      trend: 'up',
      icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"/></svg>'
    },
    {
      title: 'Active Sessions',
      value: '1,423',
      change: '+2.1%',
      trend: 'up',
      icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>'
    },
    {
      title: 'Failed Logins',
      value: '12',
      change: '-8.2%',
      trend: 'down',
      icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.232 16.5c-.77.833.192 2.5 1.732 2.5z"/></svg>'
    },
    {
      title: 'System Health',
      value: '99.9%',
      change: '0.0%',
      trend: 'neutral',
      icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>'
    }
  ]);

  readonly recentUsers = signal([
    { id: 1, name: 'John Doe', email: 'john@example.com', status: 'active', initials: 'JD' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', status: 'pending', initials: 'JS' },
    { id: 3, name: 'Mike Johnson', email: 'mike@example.com', status: 'active', initials: 'MJ' },
    { id: 4, name: 'Sarah Wilson', email: 'sarah@example.com', status: 'inactive', initials: 'SW' }
  ]);

  readonly systemServices = signal([
    { name: 'Authentication Service', status: 'healthy', uptime: '99.9%' },
    { name: 'User Service', status: 'healthy', uptime: '99.8%' },
    { name: 'Audit Service', status: 'warning', uptime: '98.5%' },
    { name: 'API Gateway', status: 'healthy', uptime: '99.9%' }
  ]);

  getStatIconClasses(trend: string): string {
    const base = 'h-10 w-10 rounded-lg flex items-center justify-center';
    switch (trend) {
      case 'up': return `${base} bg-green-100 text-green-600`;
      case 'down': return `${base} bg-red-100 text-red-600`;
      default: return `${base} bg-gray-100 text-gray-600`;
    }
  }

  getTrendClasses(trend: string): string {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-500';
    }
  }

  getTrendIconClasses(trend: string): string {
    switch (trend) {
      case 'up': return 'text-green-500';
      case 'down': return 'text-red-500';
      default: return 'text-gray-400';
    }
  }

  getUserStatusClasses(status: string): string {
    const base = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
    switch (status) {
      case 'active': return `${base} bg-green-100 text-green-800`;
      case 'pending': return `${base} bg-yellow-100 text-yellow-800`;
      case 'inactive': return `${base} bg-gray-100 text-gray-800`;
      default: return `${base} bg-gray-100 text-gray-800`;
    }
  }

  getServiceStatusClasses(status: string): string {
    switch (status) {
      case 'healthy': return 'bg-green-400';
      case 'warning': return 'bg-yellow-400';
      case 'error': return 'bg-red-400';
      default: return 'bg-gray-400';
    }
  }

  getServiceStatusTextClasses(status: string): string {
    switch (status) {
      case 'healthy': return 'text-green-700';
      case 'warning': return 'text-yellow-700';
      case 'error': return 'text-red-700';
      default: return 'text-gray-700';
    }
  }
}