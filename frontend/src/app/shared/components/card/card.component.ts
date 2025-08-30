import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card',
  imports: [CommonModule],
  template: `
    <div [class]="cardClasses()">
      @if (title() || actions) {
        <div [class]="headerClasses()">
          @if (title()) {
            <h3 class="text-lg font-medium text-gray-900">{{ title() }}</h3>
          }
          @if (subtitle()) {
            <p class="text-sm text-gray-500">{{ subtitle() }}</p>
          }
          <div class="ml-auto">
            <ng-content select="[slot=actions]"></ng-content>
          </div>
        </div>
      }
      
      <div [class]="contentClasses()">
        <ng-content></ng-content>
      </div>
      
      @if (footer) {
        <div [class]="footerClasses()">
          <ng-content select="[slot=footer]"></ng-content>
        </div>
      }
    </div>
  `
})
export class CardComponent {
  title = input<string>();
  subtitle = input<string>();
  padding = input('p-6');
  shadow = input('shadow-sm');
  border = input('border');
  rounded = input('rounded-lg');
  background = input('bg-white');

  actions = false;
  footer = false;

  ngAfterContentInit() {
    // Check if actions or footer content is provided
    // This would require ViewChild queries in a real implementation
  }

  cardClasses = () => {
    return `${this.background()} ${this.shadow()} ${this.border()} border-gray-200 ${this.rounded()}`;
  };

  headerClasses = () => {
    return `flex items-start justify-between ${this.padding()} pb-3 border-b border-gray-200`;
  };

  contentClasses = () => {
    return `${this.padding()}`;
  };

  footerClasses = () => {
    return `${this.padding()} pt-3 border-t border-gray-200 bg-gray-50`;
  };
}