import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'app-unauthorized',
  imports: [CommonModule, RouterLink, ButtonComponent],
  template: `
    <div class="min-h-screen bg-white px-4 py-16 sm:px-6 sm:py-24 md:grid md:place-items-center lg:px-8">
      <div class="max-w-max mx-auto">
        <main class="sm:flex">
          <p class="text-4xl font-extrabold text-red-600 sm:text-5xl">403</p>
          <div class="sm:ml-6">
            <div class="sm:border-l sm:border-gray-200 sm:pl-6">
              <h1 class="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">Unauthorized</h1>
              <p class="mt-1 text-base text-gray-500">Sorry, you don't have permission to access this page.</p>
            </div>
            <div class="mt-10 flex space-x-3 sm:border-l sm:border-transparent sm:pl-6">
              <app-button routerLink="/dashboard" variant="primary">
                Go back home
              </app-button>
              <app-button routerLink="/auth/login" variant="secondary">
                Sign in
              </app-button>
            </div>
          </div>
        </main>
      </div>
    </div>
  `
})
export class UnauthorizedComponent {}