import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6">
      <h1 class="text-2xl font-bold mb-6">Profile</h1>
      
      @if (authService.currentUser()) {
        <div class="bg-white shadow rounded-lg p-6">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Username</label>
              <p class="mt-1 text-sm text-gray-900">{{ authService.currentUser()?.username }}</p>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700">Email</label>
              <p class="mt-1 text-sm text-gray-900">{{ authService.currentUser()?.email }}</p>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700">Roles</label>
              <p class="mt-1 text-sm text-gray-900">{{ (authService.currentUser()?.roles || []).join(', ') }}</p>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class ProfileComponent {
  readonly authService = inject(AuthService);
}