import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-button',
  imports: [CommonModule],
  template: `
    <button
      [type]="type()"
      [disabled]="disabled() || loading()"
      [class]="buttonClasses()"
      (click)="onClick()"
    >
      @if (loading()) {
        <svg class="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      }
      
      @if (icon()) {
        <span [innerHTML]="icon()" class="w-4 h-4" [class.mr-2]="hasContent"></span>
      }
      
      <ng-content></ng-content>
    </button>
  `
})
export class ButtonComponent {
  variant = input<ButtonVariant>('primary');
  size = input<ButtonSize>('md');
  type = input<'button' | 'submit' | 'reset'>('button');
  disabled = input(false);
  loading = input(false);
  icon = input<string>();
  fullWidth = input(false);

  click = output<void>();

  hasContent = true; // Would need ContentChild to detect this properly

  onClick(): void {
    if (!this.disabled() && !this.loading()) {
      this.click.emit();
    }
  }

  buttonClasses = () => {
    const baseClasses = 'inline-flex items-center justify-center font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200';
    
    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base'
    };

    const variantClasses = {
      primary: 'text-white bg-primary-600 hover:bg-primary-700 focus:ring-primary-500 disabled:bg-primary-300',
      secondary: 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 focus:ring-primary-500 disabled:bg-gray-100',
      outline: 'text-primary-700 bg-transparent border border-primary-300 hover:bg-primary-50 focus:ring-primary-500 disabled:border-primary-200 disabled:text-primary-400',
      ghost: 'text-gray-700 bg-transparent hover:bg-gray-100 focus:ring-gray-500 disabled:text-gray-400',
      danger: 'text-white bg-red-600 hover:bg-red-700 focus:ring-red-500 disabled:bg-red-300'
    };

    const widthClass = this.fullWidth() ? 'w-full' : '';
    const disabledClass = this.disabled() || this.loading() ? 'opacity-50 cursor-not-allowed' : '';

    return [
      baseClasses,
      sizeClasses[this.size()],
      variantClasses[this.variant()],
      widthClass,
      disabledClass
    ].filter(Boolean).join(' ');
  };
}