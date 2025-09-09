import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-card">
      <h2 class="text-2xl font-bold text-gray-900 mb-4">Settings</h2>
      <p class="text-gray-600">System settings and configuration options.</p>
    </div>
  `
})
export class SettingsComponent {}