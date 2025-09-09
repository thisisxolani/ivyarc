# Responsive Design Guide

## Mobile-First Design Strategy for IvyArc

### Table of Contents
1. [Breakpoint System](#breakpoint-system)
2. [Layout Strategies](#layout-strategies)
3. [Component Responsive Behavior](#component-responsive-behavior)
4. [Touch Interface Guidelines](#touch-interface-guidelines)
5. [Performance Optimization](#performance-optimization)
6. [Testing Framework](#testing-framework)

---

## Breakpoint System

### Breakpoint Definitions
```scss
// Mobile-first breakpoint system
$breakpoints: (
  'mobile-sm': 320px,   // Small phones (iPhone SE)
  'mobile-md': 375px,   // Standard phones (iPhone 12)
  'mobile-lg': 414px,   // Large phones (iPhone 12 Pro Max)
  'tablet-sm': 768px,   // Small tablets, landscape phones
  'tablet-lg': 1024px,  // Large tablets, small laptops
  'desktop-sm': 1280px, // Small desktop screens
  'desktop-md': 1440px, // Standard desktop screens
  'desktop-lg': 1920px, // Large desktop screens
  'desktop-xl': 2560px  // Ultra-wide screens
);

// Sass mixins for responsive design
@mixin respond-to($breakpoint) {
  @if map-has-key($breakpoints, $breakpoint) {
    $value: map-get($breakpoints, $breakpoint);
    @media (min-width: $value) {
      @content;
    }
  } @else {
    @warn "Unknown breakpoint: #{$breakpoint}";
  }
}

// Usage examples
.component {
  // Mobile-first base styles
  padding: 1rem;
  font-size: 1rem;
  
  @include respond-to('tablet-sm') {
    padding: 1.5rem;
    font-size: 1.125rem;
  }
  
  @include respond-to('desktop-sm') {
    padding: 2rem;
    font-size: 1.25rem;
  }
}
```

### CSS Custom Properties for Breakpoints
```css
:root {
  --container-padding: 1rem;
  --grid-gap: 1rem;
  --card-padding: 1rem;
  --button-size: 44px;
}

@media (min-width: 768px) {
  :root {
    --container-padding: 2rem;
    --grid-gap: 1.5rem;
    --card-padding: 1.5rem;
    --button-size: 40px;
  }
}

@media (min-width: 1024px) {
  :root {
    --container-padding: 3rem;
    --grid-gap: 2rem;
    --card-padding: 2rem;
    --button-size: 36px;
  }
}
```

### Responsive Typography Scale
```css
:root {
  /* Mobile typography scale */
  --text-xs: 0.75rem;    /* 12px */
  --text-sm: 0.875rem;   /* 14px */
  --text-base: 1rem;     /* 16px - prevent iOS zoom */
  --text-lg: 1.125rem;   /* 18px */
  --text-xl: 1.25rem;    /* 20px */
  --text-2xl: 1.5rem;    /* 24px */
  --text-3xl: 1.875rem;  /* 30px */
  --text-4xl: 2.25rem;   /* 36px */
  
  /* Mobile line heights */
  --leading-tight: 1.25;
  --leading-normal: 1.5;
  --leading-relaxed: 1.625;
}

@media (min-width: 768px) {
  :root {
    /* Tablet adjustments */
    --text-lg: 1.1875rem;  /* 19px */
    --text-xl: 1.375rem;   /* 22px */
    --text-2xl: 1.625rem;  /* 26px */
    --text-3xl: 2rem;      /* 32px */
    --text-4xl: 2.5rem;    /* 40px */
  }
}

@media (min-width: 1024px) {
  :root {
    /* Desktop adjustments */
    --text-2xl: 1.75rem;   /* 28px */
    --text-3xl: 2.25rem;   /* 36px */
    --text-4xl: 3rem;      /* 48px */
    --text-5xl: 3.75rem;   /* 60px */
  }
}
```

---

## Layout Strategies

### Container System
```scss
.container {
  width: 100%;
  padding-left: var(--container-padding);
  padding-right: var(--container-padding);
  margin-left: auto;
  margin-right: auto;
  
  // Mobile: full width with padding
  max-width: none;
  
  @include respond-to('tablet-sm') {
    max-width: 768px;
  }
  
  @include respond-to('tablet-lg') {
    max-width: 1024px;
  }
  
  @include respond-to('desktop-sm') {
    max-width: 1280px;
  }
  
  @include respond-to('desktop-md') {
    max-width: 1440px;
  }
}

.container-fluid {
  width: 100%;
  padding-left: var(--container-padding);
  padding-right: var(--container-padding);
}
```

### Grid System
```scss
.grid {
  display: grid;
  gap: var(--grid-gap);
  
  // Mobile: single column by default
  grid-template-columns: 1fr;
  
  &--2-col {
    @include respond-to('tablet-sm') {
      grid-template-columns: repeat(2, 1fr);
    }
  }
  
  &--3-col {
    @include respond-to('tablet-sm') {
      grid-template-columns: repeat(2, 1fr);
    }
    
    @include respond-to('tablet-lg') {
      grid-template-columns: repeat(3, 1fr);
    }
  }
  
  &--4-col {
    @include respond-to('tablet-sm') {
      grid-template-columns: repeat(2, 1fr);
    }
    
    @include respond-to('tablet-lg') {
      grid-template-columns: repeat(3, 1fr);
    }
    
    @include respond-to('desktop-sm') {
      grid-template-columns: repeat(4, 1fr);
    }
  }
}

// Responsive grid items
.grid-item {
  &--span-2 {
    @include respond-to('tablet-sm') {
      grid-column: span 2;
    }
  }
  
  &--span-3 {
    @include respond-to('tablet-lg') {
      grid-column: span 3;
    }
  }
}
```

### Flexible Layout Patterns
```scss
// Stack pattern (mobile) -> Side-by-side (desktop)
.layout-stack {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  
  @include respond-to('tablet-lg') {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
  
  .layout-stack__main {
    flex: 1;
    min-width: 0; // Prevent flex item overflow
  }
  
  .layout-stack__aside {
    flex-shrink: 0;
    
    @include respond-to('mobile-only') {
      width: 100%;
    }
  }
}

// Sidebar layout
.layout-sidebar {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  
  @include respond-to('tablet-lg') {
    flex-direction: row;
  }
  
  .sidebar {
    // Mobile: hidden by default, overlay when shown
    position: fixed;
    top: 0;
    left: -280px;
    width: 280px;
    height: 100vh;
    z-index: 50;
    transition: left 0.3s ease;
    
    &--open {
      left: 0;
    }
    
    @include respond-to('tablet-lg') {
      position: sticky;
      top: 0;
      left: 0;
      height: 100vh;
      flex-shrink: 0;
    }
  }
  
  .main-content {
    flex: 1;
    min-width: 0;
    
    // Add padding for mobile header
    padding-top: 60px;
    
    @include respond-to('tablet-lg') {
      padding-top: 0;
    }
  }
}
```

---

## Component Responsive Behavior

### Navigation Components

#### Mobile Header
```scss
.mobile-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: white;
  border-bottom: 1px solid var(--border-light);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--space-4);
  z-index: 40;
  
  @include respond-to('tablet-lg') {
    display: none;
  }
  
  .mobile-header__logo {
    height: 32px;
  }
  
  .mobile-header__menu-button {
    background: none;
    border: none;
    padding: var(--space-2);
    color: var(--text-secondary);
    cursor: pointer;
    
    &:focus {
      outline: 2px solid var(--brand-500);
      outline-offset: 2px;
      border-radius: var(--radius-sm);
    }
  }
}
```

#### Responsive Data Tables
```scss
.data-table {
  background: white;
  border-radius: var(--radius-xl);
  overflow: hidden;
  
  // Desktop table
  .table-desktop {
    display: none;
    
    @include respond-to('tablet-lg') {
      display: table;
      width: 100%;
      border-collapse: collapse;
    }
    
    th, td {
      padding: var(--space-4) var(--space-6);
      text-align: left;
      border-bottom: 1px solid var(--border-light);
    }
    
    // Responsive column hiding
    .table-col--hide-mobile {
      @media (max-width: 767px) {
        display: none;
      }
    }
    
    .table-col--hide-tablet {
      @media (max-width: 1023px) {
        display: none;
      }
    }
  }
  
  // Mobile card layout
  .table-mobile {
    display: block;
    padding: var(--space-4);
    
    @include respond-to('tablet-lg') {
      display: none;
    }
    
    .table-card {
      background: var(--bg-subtle);
      border-radius: var(--radius-lg);
      padding: var(--space-4);
      margin-bottom: var(--space-4);
      
      &:last-child {
        margin-bottom: 0;
      }
      
      .card-field {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: var(--space-3);
        
        &:last-child {
          margin-bottom: 0;
        }
        
        .field-label {
          font-weight: 500;
          color: var(--text-secondary);
          font-size: var(--text-sm);
        }
        
        .field-value {
          font-weight: 600;
          color: var(--text-primary);
        }
      }
    }
  }
}
```

#### Responsive Forms
```scss
.form {
  .form-grid {
    display: grid;
    gap: var(--space-6);
    
    // Mobile: single column
    grid-template-columns: 1fr;
    
    // Tablet: 2 columns for most fields
    @include respond-to('tablet-sm') {
      grid-template-columns: repeat(2, 1fr);
    }
    
    // Full-width fields on mobile
    .form-field--full {
      grid-column: 1 / -1;
    }
    
    // Auto-sizing for small fields
    .form-field--auto {
      @include respond-to('tablet-sm') {
        grid-column: span 1;
      }
    }
  }
  
  .form-actions {
    display: flex;
    gap: var(--space-3);
    margin-top: var(--space-8);
    
    // Mobile: stack buttons vertically
    flex-direction: column-reverse;
    
    @include respond-to('tablet-sm') {
      flex-direction: row;
      justify-content: flex-end;
    }
    
    .btn {
      // Mobile: full width buttons
      width: 100%;
      
      @include respond-to('tablet-sm') {
        width: auto;
        min-width: 120px;
      }
    }
  }
}
```

### Modal Dialogs
```scss
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-4);
  
  // Mobile: full screen on small screens
  @media (max-width: 640px) {
    padding: 0;
    align-items: stretch;
  }
  
  .modal-content {
    background: white;
    border-radius: var(--radius-xl);
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    width: 100%;
    max-width: 600px;
    max-height: 90vh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    
    // Mobile: full screen
    @media (max-width: 640px) {
      max-width: 100%;
      max-height: 100%;
      border-radius: 0;
    }
    
    .modal-body {
      flex: 1;
      overflow-y: auto;
      padding: var(--space-6);
      
      @media (max-width: 640px) {
        padding: var(--space-4);
      }
    }
  }
}
```

---

## Touch Interface Guidelines

### Touch Target Sizing
```scss
// Minimum touch target mixin
@mixin touch-target($size: 44px) {
  min-height: $size;
  min-width: $size;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

// Touch-friendly buttons
.btn {
  @include touch-target(44px);
  padding: var(--space-3) var(--space-6);
  
  // Smaller touch targets for secondary actions on desktop
  @include respond-to('desktop-sm') {
    @include touch-target(36px);
    padding: var(--space-2) var(--space-4);
  }
  
  &--small {
    @include touch-target(32px);
    padding: var(--space-2) var(--space-3);
    font-size: var(--text-sm);
  }
}

// Form controls
.form-input,
.form-select {
  height: 44px;
  padding: var(--space-3) var(--space-4);
  font-size: 16px; // Prevent iOS zoom
  
  @include respond-to('desktop-sm') {
    height: 40px;
    font-size: var(--text-sm);
  }
}

// Checkbox and radio buttons
.form-checkbox,
.form-radio {
  .checkbox-indicator,
  .radio-indicator {
    width: 20px;
    height: 20px;
    
    // Larger touch area
    &::before {
      content: '';
      position: absolute;
      top: -12px;
      left: -12px;
      right: -12px;
      bottom: -12px;
    }
  }
}
```

### Touch Interaction States
```scss
// Touch-specific hover states
@media (hover: hover) and (pointer: fine) {
  .btn:hover {
    background-color: var(--brand-600);
  }
  
  .nav-item:hover {
    background-color: var(--bg-subtle);
  }
}

// Touch-specific active states
.btn:active {
  transform: scale(0.98);
  transition: transform 0.1s ease;
}

.card:active {
  transform: translateY(1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
```

### Swipe Gestures
```typescript
// Angular swipe gesture implementation
export class SwipeableCardComponent {
  @HostListener('touchstart', ['$event'])
  onTouchStart(event: TouchEvent) {
    this.startX = event.touches[0].clientX;
    this.startY = event.touches[0].clientY;
  }
  
  @HostListener('touchmove', ['$event'])
  onTouchMove(event: TouchEvent) {
    if (!this.startX || !this.startY) return;
    
    const currentX = event.touches[0].clientX;
    const currentY = event.touches[0].clientY;
    
    const diffX = this.startX - currentX;
    const diffY = this.startY - currentY;
    
    // Horizontal swipe
    if (Math.abs(diffX) > Math.abs(diffY)) {
      if (diffX > 50) {
        // Swipe left - show actions
        this.showActions = true;
      } else if (diffX < -50) {
        // Swipe right - hide actions
        this.showActions = false;
      }
    }
  }
  
  @HostListener('touchend', ['$event'])
  onTouchEnd(event: TouchEvent) {
    this.startX = null;
    this.startY = null;
  }
}
```

---

## Performance Optimization

### Image Optimization
```html
<!-- Responsive images -->
<img
  src="/api/users/avatar-small.jpg"
  srcset="
    /api/users/avatar-small.jpg 1x,
    /api/users/avatar-medium.jpg 2x,
    /api/users/avatar-large.jpg 3x
  "
  sizes="(max-width: 768px) 40px, 60px"
  alt="User avatar"
  loading="lazy"
  width="40"
  height="40">

<!-- Picture element for art direction -->
<picture>
  <source 
    media="(max-width: 768px)" 
    srcset="/images/hero-mobile.jpg">
  <source 
    media="(min-width: 769px)" 
    srcset="/images/hero-desktop.jpg">
  <img 
    src="/images/hero-desktop.jpg" 
    alt="Dashboard hero image">
</picture>
```

### CSS Performance
```scss
// Use transform for animations (GPU accelerated)
.modal {
  transform: scale(0.95) translateY(-10px);
  opacity: 0;
  transition: all 0.2s ease;
  
  &--visible {
    transform: scale(1) translateY(0);
    opacity: 1;
  }
}

// Avoid expensive properties in animations
.loading-spinner {
  // Good: uses transform
  transform: rotate(0deg);
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

// Contain layout changes
.component {
  contain: layout style paint;
}
```

### JavaScript Performance
```typescript
// Lazy load components
const UserManagementModule = () => 
  import('./user-management/user-management.module').then(m => m.UserManagementModule);

// Intersection Observer for lazy loading
export class LazyImageDirective implements OnInit {
  constructor(private el: ElementRef) {}
  
  ngOnInit() {
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            img.src = img.dataset.src;
            img.classList.remove('lazy');
            imageObserver.unobserve(img);
          }
        });
      });
      
      imageObserver.observe(this.el.nativeElement);
    }
  }
}

// Debounce resize events
@Component({
  selector: 'app-responsive-component'
})
export class ResponsiveComponent {
  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
    }
    
    this.resizeTimeout = setTimeout(() => {
      this.handleResize();
    }, 100);
  }
  
  private handleResize() {
    // Handle resize logic here
  }
}
```

---

## Testing Framework

### Responsive Testing Strategy
```typescript
// Cypress viewport testing
describe('Responsive Design Tests', () => {
  const viewports = [
    { device: 'iPhone SE', width: 375, height: 667 },
    { device: 'iPad', width: 768, height: 1024 },
    { device: 'Desktop', width: 1280, height: 720 }
  ];
  
  viewports.forEach(viewport => {
    it(`should display correctly on ${viewport.device}`, () => {
      cy.viewport(viewport.width, viewport.height);
      cy.visit('/dashboard');
      
      // Test mobile-specific elements
      if (viewport.width < 768) {
        cy.get('[data-testid="mobile-menu-button"]').should('be.visible');
        cy.get('[data-testid="desktop-sidebar"]').should('not.be.visible');
      }
      
      // Test touch targets
      cy.get('.btn').should('have.css', 'min-height', '44px');
      
      // Test text scaling
      cy.get('body').should('have.css', 'font-size', '16px');
    });
  });
});
```

### Accessibility Testing at Different Scales
```typescript
// Test zoom levels
describe('Zoom Accessibility Tests', () => {
  [100, 150, 200].forEach(zoomLevel => {
    it(`should be accessible at ${zoomLevel}% zoom`, () => {
      cy.visit('/login', {
        onBeforeLoad: (win) => {
          win.document.body.style.zoom = `${zoomLevel}%`;
        }
      });
      
      // No horizontal scrolling
      cy.window().then((win) => {
        expect(win.document.body.scrollWidth).to.be.at.most(win.innerWidth);
      });
      
      // All functionality still available
      cy.get('[data-testid="login-form"]').should('be.visible');
      cy.get('[data-testid="email-input"]').should('be.visible');
      cy.get('[data-testid="submit-button"]').should('be.visible');
    });
  });
});
```

### Performance Testing
```typescript
// Bundle size testing
describe('Performance Tests', () => {
  it('should load within performance budget', () => {
    cy.visit('/dashboard', {
      onBeforeLoad: (win) => {
        // Mock slow 3G connection
        win.navigator.connection = {
          effectiveType: '3g',
          downlink: 0.7,
          rtt: 150
        };
      }
    });
    
    // Page should load within 3 seconds
    cy.get('[data-testid="dashboard-content"]', { timeout: 3000 })
      .should('be.visible');
    
    // Critical path should be loaded first
    cy.get('[data-testid="main-navigation"]')
      .should('be.visible');
  });
});
```

### Manual Testing Checklist

#### Mobile Testing (< 768px)
- [ ] Navigation collapses to hamburger menu
- [ ] Bottom navigation visible and functional
- [ ] Touch targets are minimum 44px
- [ ] Forms stack vertically
- [ ] Data tables show card layout
- [ ] Modals fill screen appropriately
- [ ] Text is readable without zooming
- [ ] Images scale appropriately

#### Tablet Testing (768px - 1024px)
- [ ] Navigation shows expanded sidebar
- [ ] Two-column layouts work correctly
- [ ] Touch targets appropriate for tablet
- [ ] Forms use available space efficiently
- [ ] Data tables remain functional
- [ ] Content doesn't feel cramped or sparse

#### Desktop Testing (> 1024px)
- [ ] Full navigation sidebar visible
- [ ] Multi-column layouts utilized
- [ ] Hover states work correctly
- [ ] Keyboard navigation functional
- [ ] Content scales to fill available space
- [ ] No excessive white space

#### Cross-Browser Testing
- [ ] Chrome (mobile and desktop)
- [ ] Safari (iOS and macOS)
- [ ] Firefox (mobile and desktop)
- [ ] Edge (desktop)
- [ ] Samsung Internet (Android)

This comprehensive responsive design guide ensures the IvyArc application provides an optimal user experience across all device types and screen sizes, with particular attention to mobile-first design principles and performance optimization.