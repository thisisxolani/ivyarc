import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { UserApiService, UserProfile, UserResponse, UserStats } from '../services/user-api.service';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="space-y-6">
      <!-- Page Header with Stats -->
      <div class="dashboard-grid">
        <div class="dashboard-card">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                <dd class="text-lg font-medium text-gray-900">{{ stats().totalUsers }}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div class="dashboard-card">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                </svg>
              </div>
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">Active Users</dt>
                <dd class="text-lg font-medium text-gray-900">{{ stats().activeUsers }}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div class="dashboard-card">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
                </svg>
              </div>
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">Inactive Users</dt>
                <dd class="text-lg font-medium text-gray-900">{{ stats().inactiveUsers }}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div class="dashboard-card">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z"></path>
                  <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z"></path>
                </svg>
              </div>
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">Active Rate</dt>
                <dd class="text-lg font-medium text-gray-900">{{ stats().activePercentage.toFixed(1) }}%</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <!-- Search and Filter Controls -->
      <div class="dashboard-card">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div class="flex flex-col sm:flex-row gap-4 flex-1">
            <div class="flex-1">
              <input
                type="text"
                [(ngModel)]="searchTerm"
                (input)="onSearchChange()"
                placeholder="Search users by name or email..."
                class="form-input w-full"
              />
            </div>
            <div class="flex gap-2">
              <select [(ngModel)]="statusFilter" (change)="onFilterChange()" class="form-input">
                <option value="">All Users</option>
                <option value="true">Active Only</option>
                <option value="false">Inactive Only</option>
              </select>
              <select [(ngModel)]="pageSize" (change)="onPageSizeChange()" class="form-input">
                <option value="10">10 per page</option>
                <option value="20">20 per page</option>
                <option value="50">50 per page</option>
              </select>
            </div>
          </div>
          <div class="flex-shrink-0">
            <button (click)="openCreateModal()" class="btn-primary">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              Add User
            </button>
          </div>
        </div>
      </div>

      <!-- Users Table -->
      <div class="dashboard-card">
        <div class="table-container">
          <table class="table">
            <thead>
              <tr>
                <th (click)="sort('firstName')" class="cursor-pointer hover:bg-gray-100">
                  <div class="flex items-center space-x-1">
                    <span>Name</span>
                    <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"></path>
                    </svg>
                  </div>
                </th>
                <th (click)="sort('email')" class="cursor-pointer hover:bg-gray-100">
                  <div class="flex items-center space-x-1">
                    <span>Email</span>
                    <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"></path>
                    </svg>
                  </div>
                </th>
                <th>Phone</th>
                <th>Status</th>
                <th (click)="sort('createdAt')" class="cursor-pointer hover:bg-gray-100">
                  <div class="flex items-center space-x-1">
                    <span>Created</span>
                    <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"></path>
                    </svg>
                  </div>
                </th>
                <th class="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let user of users().content" class="hover:bg-gray-50">
                <td>
                  <div class="flex items-center space-x-3">
                    <div class="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                      <span class="text-white font-medium text-sm">
                        {{ getInitials(user.firstName, user.lastName) }}
                      </span>
                    </div>
                    <div>
                      <div class="font-medium text-gray-900">{{ user.fullName || user.firstName + ' ' + user.lastName }}</div>
                      <div class="text-sm text-gray-500">ID: {{ user.userId }}</div>
                    </div>
                  </div>
                </td>
                <td class="text-gray-900">{{ user.email }}</td>
                <td class="text-gray-500">{{ user.phone || '-' }}</td>
                <td>
                  <span [class]="getStatusClass(user.isActive)">
                    {{ user.isActive ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td class="text-gray-500">{{ formatDate(user.createdAt) }}</td>
                <td class="text-right">
                  <div class="flex justify-end space-x-2">
                    <button (click)="viewUser(user)" class="btn-secondary text-xs px-2 py-1">View</button>
                    <button (click)="editUser(user)" class="btn-secondary text-xs px-2 py-1">Edit</button>
                    <button 
                      (click)="toggleUserStatus(user)" 
                      [class]="user.isActive ? 'btn-secondary text-xs px-2 py-1' : 'btn-primary text-xs px-2 py-1'">
                      {{ user.isActive ? 'Deactivate' : 'Activate' }}
                    </button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="loading()">
                <td colspan="6" class="text-center py-8">
                  <div class="loading-skeleton h-4 w-32 mx-auto"></div>
                </td>
              </tr>
              <tr *ngIf="!loading() && users().content.length === 0">
                <td colspan="6" class="text-center py-8 text-gray-500">
                  No users found
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div *ngIf="users().totalPages > 1" class="flex items-center justify-between px-4 py-3 border-t border-gray-200 sm:px-6">
          <div class="flex justify-between flex-1 sm:hidden">
            <button 
              (click)="previousPage()" 
              [disabled]="users().first"
              class="btn-secondary"
              [class.opacity-50]="users().first">
              Previous
            </button>
            <button 
              (click)="nextPage()" 
              [disabled]="users().last"
              class="btn-secondary ml-3"
              [class.opacity-50]="users().last">
              Next
            </button>
          </div>
          <div class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p class="text-sm text-gray-700">
                Showing <span class="font-medium">{{ (users().number * users().size) + 1 }}</span>
                to <span class="font-medium">{{ Math.min((users().number + 1) * users().size, users().totalElements) }}</span>
                of <span class="font-medium">{{ users().totalElements }}</span> results
              </p>
            </div>
            <div>
              <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button 
                  (click)="previousPage()" 
                  [disabled]="users().first"
                  class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  [class.opacity-50]="users().first">
                  Previous
                </button>
                <button 
                  (click)="nextPage()" 
                  [disabled]="users().last"
                  class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 ml-3"
                  [class.opacity-50]="users().last">
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class UserListComponent implements OnInit {
  users = signal<UserResponse>({
    content: [],
    totalElements: 0,
    totalPages: 0,
    size: 20,
    number: 0,
    first: true,
    last: true
  });
  
  stats = signal<UserStats>({
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    activePercentage: 0
  });

  loading = signal(false);
  searchTerm = '';
  statusFilter = '';
  sortBy = 'createdAt';
  sortDir = 'desc';
  pageSize = 20;
  currentPage = 0;

  // Add Math reference for template
  Math = Math;

  constructor(private userApiService: UserApiService) {}

  ngOnInit() {
    this.loadUsers();
    this.loadStats();
  }

  loadUsers() {
    this.loading.set(true);
    
    const params = {
      page: this.currentPage,
      size: this.pageSize,
      sortBy: this.sortBy,
      sortDir: this.sortDir,
      search: this.searchTerm || undefined,
      active: this.statusFilter ? this.statusFilter === 'true' : undefined
    };

    this.userApiService.getUsers(params).subscribe({
      next: (response) => {
        this.users.set(response);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.loading.set(false);
      }
    });
  }

  loadStats() {
    this.userApiService.getUserStats().subscribe({
      next: (stats) => {
        this.stats.set(stats);
      },
      error: (error) => {
        console.error('Error loading stats:', error);
      }
    });
  }

  onSearchChange() {
    this.currentPage = 0;
    this.loadUsers();
  }

  onFilterChange() {
    this.currentPage = 0;
    this.loadUsers();
  }

  onPageSizeChange() {
    this.currentPage = 0;
    this.loadUsers();
  }

  sort(field: string) {
    if (this.sortBy === field) {
      this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = field;
      this.sortDir = 'asc';
    }
    this.currentPage = 0;
    this.loadUsers();
  }

  previousPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadUsers();
    }
  }

  nextPage() {
    if (!this.users().last) {
      this.currentPage++;
      this.loadUsers();
    }
  }

  getInitials(firstName: string, lastName: string): string {
    return (firstName?.charAt(0) || '') + (lastName?.charAt(0) || '');
  }

  getStatusClass(isActive: boolean): string {
    return isActive 
      ? 'inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800'
      : 'inline-flex px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800';
  }

  formatDate(dateString?: string): string {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  }

  openCreateModal() {
    // TODO: Implement create user modal
    console.log('Create user modal');
  }

  viewUser(user: UserProfile) {
    // TODO: Implement user detail view
    console.log('View user:', user);
  }

  editUser(user: UserProfile) {
    // TODO: Implement edit user modal
    console.log('Edit user:', user);
  }

  toggleUserStatus(user: UserProfile) {
    if (!user.id) return;
    
    const action = user.isActive ? 'deactivate' : 'activate';
    const apiCall = user.isActive 
      ? this.userApiService.deactivateUser(user.id)
      : this.userApiService.activateUser(user.id);

    apiCall.subscribe({
      next: () => {
        this.loadUsers();
        this.loadStats();
      },
      error: (error) => {
        console.error(`Error ${action} user:`, error);
      }
    });
  }
}