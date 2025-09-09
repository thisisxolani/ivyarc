import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-audit-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-card">
      <h2 class="text-2xl font-bold text-gray-900 mb-4">Audit Logs</h2>
      <p class="text-gray-600">Audit logging system is ready. Integration coming soon.</p>
    </div>
  `
})
export class AuditListComponent {}