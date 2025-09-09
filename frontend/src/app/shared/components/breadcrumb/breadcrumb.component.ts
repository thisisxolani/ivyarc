import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LayoutService } from '../../services/layout.service';

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <nav class="flex" aria-label="Breadcrumb">
      <ol class="inline-flex items-center space-x-1 md:space-x-3">
        @for (breadcrumb of layoutService.breadcrumbs(); track breadcrumb.label; let last = $last) {
          <li class="inline-flex items-center">
            @if (!$first) {
              <svg class="w-3 h-3 text-gray-400 mx-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 9 4-4-4-4"/>
              </svg>
            }
            @if (last || !breadcrumb.url) {
              <span class="text-sm font-medium text-gray-500" [attr.aria-current]="last ? 'page' : null">
                {{ breadcrumb.label }}
              </span>
            } @else {
              <a 
                [routerLink]="breadcrumb.url" 
                class="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
              >
                @if ($first) {
                  <svg class="w-3 h-3 me-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                    <path d="m19.707 9.293-2-2-7-7a1 1 0 0 0-1.414 0l-7 7-2 2a1 1 0 0 0 1.414 1.414L2 10.414V18a2 2 0 0 0 2 2h3a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1h3a2 2 0 0 0 2-2v-7.586l.293.293a1 1 0 0 0 1.414-1.414Z"/>
                  </svg>
                }
                {{ breadcrumb.label }}
              </a>
            }
          </li>
        }
      </ol>
    </nav>
  `
})
export class BreadcrumbComponent {
  layoutService = inject(LayoutService);
}