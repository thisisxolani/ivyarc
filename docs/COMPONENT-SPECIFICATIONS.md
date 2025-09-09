# Component Design Specifications

## Table of Contents
1. [Authentication Components](#authentication-components)
2. [Navigation Components](#navigation-components)
3. [Data Display Components](#data-display-components)
4. [Form Components](#form-components)
5. [Feedback Components](#feedback-components)
6. [Layout Components](#layout-components)

---

## Authentication Components

### Login Form Component

#### Visual Specifications
```scss
.login-form {
  max-width: 400px;
  margin: 0 auto;
  padding: var(--space-8) var(--space-4);
  
  @media (max-width: 767px) {
    padding: var(--space-6) var(--space-4);
    max-width: 100%;
  }
}

.login-header {
  text-align: center;
  margin-bottom: var(--space-8);
  
  .logo {
    height: 48px;
    margin-bottom: var(--space-4);
  }
  
  .title {
    font-size: var(--text-3xl);
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: var(--space-2);
  }
  
  .subtitle {
    font-size: var(--text-base);
    color: var(--text-secondary);
  }
}

.social-login-buttons {
  display: grid;
  gap: var(--space-3);
  margin-bottom: var(--space-6);
  
  @media (min-width: 640px) {
    grid-template-columns: 1fr 1fr;
    gap: var(--space-4);
  }
}

.divider {
  position: relative;
  text-align: center;
  margin: var(--space-6) 0;
  
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 1px;
    background: var(--border-light);
  }
  
  span {
    background: white;
    padding: 0 var(--space-4);
    color: var(--text-tertiary);
    font-size: var(--text-sm);
  }
}
```

#### Interactive States
```scss
.login-form {
  .form-field {
    margin-bottom: var(--space-5);
    
    &--error {
      .form-input {
        border-color: var(--error-500);
        box-shadow: 0 0 0 1px var(--error-500);
      }
    }
    
    &--success {
      .form-input {
        border-color: var(--success-500);
        box-shadow: 0 0 0 1px var(--success-500);
      }
    }
  }
  
  .form-input {
    width: 100%;
    height: 44px;
    padding: 0 var(--space-4);
    border: 1px solid var(--border-medium);
    border-radius: var(--radius-lg);
    font-size: 16px; // Prevent iOS zoom
    transition: all 0.2s ease;
    
    &:focus {
      outline: none;
      border-color: var(--brand-500);
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }
    
    &::placeholder {
      color: var(--text-tertiary);
    }
  }
  
  .password-field {
    position: relative;
    
    .toggle-password {
      position: absolute;
      right: var(--space-3);
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      color: var(--text-tertiary);
      cursor: pointer;
      padding: var(--space-2);
      
      &:focus {
        outline: 2px solid var(--brand-500);
        outline-offset: 2px;
        border-radius: var(--radius-sm);
      }
    }
  }
}
```

#### Accessibility Implementation
```html
<form class="login-form" [attr.aria-label]="'Sign in to your account'">
  <div class="login-header">
    <img src="/assets/logo.svg" alt="Company Logo" class="logo">
    <h1 class="title">Welcome back</h1>
    <p class="subtitle">Please sign in to your account</p>
  </div>
  
  <div class="social-login-buttons" role="group" aria-label="Social sign-in options">
    <button type="button" class="btn btn--social" aria-label="Sign in with Google">
      <svg aria-hidden="true"><!-- Google icon --></svg>
      <span>Google</span>
    </button>
    <button type="button" class="btn btn--social" aria-label="Sign in with Microsoft">
      <svg aria-hidden="true"><!-- Microsoft icon --></svg>
      <span>Microsoft</span>
    </button>
  </div>
  
  <div class="divider" role="separator" aria-label="or">
    <span>or</span>
  </div>
  
  <div class="form-field" [class.form-field--error]="emailInvalid">
    <label for="email" class="form-label">
      Email address <span class="required" aria-label="required">*</span>
    </label>
    <input
      id="email"
      type="email"
      class="form-input"
      autocomplete="username"
      [(ngModel)]="email"
      [attr.aria-describedby]="emailInvalid ? 'email-error' : null"
      [attr.aria-invalid]="emailInvalid">
    <div *ngIf="emailInvalid" id="email-error" class="form-error" role="alert">
      Please enter a valid email address
    </div>
  </div>
  
  <div class="form-field" [class.form-field--error]="passwordInvalid">
    <label for="password" class="form-label">
      Password <span class="required" aria-label="required">*</span>
    </label>
    <div class="password-field">
      <input
        id="password"
        [type]="showPassword ? 'text' : 'password'"
        class="form-input"
        autocomplete="current-password"
        [(ngModel)]="password"
        [attr.aria-describedby]="passwordInvalid ? 'password-error' : null"
        [attr.aria-invalid]="passwordInvalid">
      <button
        type="button"
        class="toggle-password"
        (click)="showPassword = !showPassword"
        [attr.aria-label]="showPassword ? 'Hide password' : 'Show password'">
        <svg aria-hidden="true"><!-- Eye icon --></svg>
      </button>
    </div>
    <div *ngIf="passwordInvalid" id="password-error" class="form-error" role="alert">
      Password is required
    </div>
  </div>
  
  <button type="submit" class="btn btn--primary btn--full-mobile" [disabled]="loading">
    <span *ngIf="!loading">Sign In</span>
    <span *ngIf="loading" class="btn-loading">
      <svg class="spinner" aria-hidden="true"><!-- Spinner --></svg>
      Signing in...
    </span>
  </button>
</form>
```

---

## Navigation Components

### Sidebar Navigation

#### Desktop Sidebar
```scss
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: 280px;
  background: white;
  border-right: 1px solid var(--border-light);
  z-index: 40;
  transform: translateX(0);
  transition: transform 0.3s ease;
  
  &--collapsed {
    width: 72px;
    
    .nav-item__text,
    .nav-section__title {
      opacity: 0;
      visibility: hidden;
    }
  }
  
  .sidebar-header {
    height: 72px;
    display: flex;
    align-items: center;
    padding: 0 var(--space-6);
    border-bottom: 1px solid var(--border-light);
    
    .logo {
      height: 32px;
      width: auto;
    }
  }
  
  .sidebar-content {
    flex: 1;
    overflow-y: auto;
    padding: var(--space-4) 0;
  }
  
  .nav-section {
    margin-bottom: var(--space-6);
    
    &__title {
      padding: 0 var(--space-6);
      font-size: var(--text-xs);
      font-weight: 600;
      color: var(--text-tertiary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: var(--space-3);
    }
  }
  
  .nav-item {
    display: flex;
    align-items: center;
    padding: var(--space-3) var(--space-6);
    color: var(--text-secondary);
    text-decoration: none;
    transition: all 0.2s ease;
    position: relative;
    
    &:hover {
      background: var(--bg-subtle);
      color: var(--text-primary);
    }
    
    &--active {
      background: var(--brand-50);
      color: var(--brand-700);
      
      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 3px;
        background: var(--brand-500);
      }
    }
    
    &__icon {
      width: 20px;
      height: 20px;
      margin-right: var(--space-3);
      flex-shrink: 0;
    }
    
    &__text {
      font-weight: 500;
      transition: opacity 0.3s ease;
    }
  }
}
```

#### Mobile Bottom Navigation
```scss
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 72px;
  background: white;
  border-top: 1px solid var(--border-light);
  z-index: 50;
  display: flex;
  
  @media (min-width: 1024px) {
    display: none;
  }
  
  .nav-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-decoration: none;
    color: var(--text-tertiary);
    padding: var(--space-2);
    min-height: 44px;
    
    &:focus {
      outline: 2px solid var(--brand-500);
      outline-offset: -2px;
    }
    
    &--active {
      color: var(--brand-500);
    }
    
    &__icon {
      width: 24px;
      height: 24px;
      margin-bottom: var(--space-1);
    }
    
    &__text {
      font-size: var(--text-xs);
      font-weight: 500;
    }
  }
}
```

#### Mobile Hamburger Menu
```scss
.mobile-menu {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: 280px;
  background: white;
  z-index: 60;
  transform: translateX(-100%);
  transition: transform 0.3s ease;
  overflow-y: auto;
  
  &--open {
    transform: translateX(0);
  }
  
  .mobile-menu-header {
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 var(--space-4);
    border-bottom: 1px solid var(--border-light);
    
    .close-button {
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
}

.mobile-menu-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 50;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
  
  &--visible {
    opacity: 1;
    visibility: visible;
  }
}
```

---

## Data Display Components

### Data Table Component

#### Responsive Table Layout
```scss
.data-table {
  background: white;
  border-radius: var(--radius-xl);
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  overflow: hidden;
  
  .table-header {
    padding: var(--space-6);
    border-bottom: 1px solid var(--border-light);
    
    .table-title {
      font-size: var(--text-lg);
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: var(--space-2);
    }
    
    .table-actions {
      display: flex;
      gap: var(--space-3);
      
      @media (max-width: 767px) {
        flex-direction: column;
        
        .btn {
          width: 100%;
        }
      }
    }
  }
  
  // Desktop table view
  @media (min-width: 768px) {
    .table-desktop {
      width: 100%;
      border-collapse: collapse;
      
      th {
        padding: var(--space-4) var(--space-6);
        text-align: left;
        font-weight: 600;
        color: var(--text-secondary);
        font-size: var(--text-sm);
        border-bottom: 1px solid var(--border-light);
        
        &.sortable {
          cursor: pointer;
          user-select: none;
          
          &:hover {
            color: var(--text-primary);
          }
          
          .sort-icon {
            margin-left: var(--space-2);
            opacity: 0.5;
            transition: opacity 0.2s ease;
          }
          
          &--active .sort-icon {
            opacity: 1;
          }
        }
      }
      
      td {
        padding: var(--space-4) var(--space-6);
        border-bottom: 1px solid var(--border-light);
        vertical-align: middle;
        
        &.actions {
          width: 120px;
          
          .btn {
            margin-right: var(--space-2);
          }
        }
      }
      
      tr {
        &:hover {
          background: var(--bg-subtle);
        }
        
        &.selected {
          background: var(--brand-50);
        }
      }
    }
  }
  
  // Mobile card view
  @media (max-width: 767px) {
    .table-mobile {
      padding: var(--space-4);
      
      .table-card {
        background: var(--bg-subtle);
        border-radius: var(--radius-lg);
        padding: var(--space-4);
        margin-bottom: var(--space-4);
        position: relative;
        
        &:last-child {
          margin-bottom: 0;
        }
        
        .card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: var(--space-3);
          
          .card-title {
            font-weight: 600;
            color: var(--text-primary);
          }
          
          .card-actions {
            .dropdown-trigger {
              background: none;
              border: none;
              padding: var(--space-2);
              color: var(--text-secondary);
              border-radius: var(--radius-md);
              
              &:focus {
                outline: 2px solid var(--brand-500);
                outline-offset: 2px;
              }
            }
          }
        }
        
        .card-content {
          .card-field {
            display: flex;
            justify-content: space-between;
            margin-bottom: var(--space-2);
            
            .field-label {
              font-size: var(--text-sm);
              color: var(--text-secondary);
              font-weight: 500;
            }
            
            .field-value {
              font-size: var(--text-sm);
              color: var(--text-primary);
              text-align: right;
            }
          }
        }
        
        // Swipe actions
        &.swipe-active {
          transform: translateX(-80px);
          transition: transform 0.3s ease;
        }
        
        .swipe-actions {
          position: absolute;
          right: -80px;
          top: 0;
          bottom: 0;
          width: 80px;
          display: flex;
          
          .swipe-action {
            flex: 1;
            border: none;
            background: var(--error-500);
            color: white;
            cursor: pointer;
            
            &:focus {
              outline: 2px solid white;
              outline-offset: -2px;
            }
            
            &--edit {
              background: var(--brand-500);
            }
          }
        }
      }
    }
  }
}
```

### Status Indicators
```scss
.status-badge {
  display: inline-flex;
  align-items: center;
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-2xl);
  font-size: var(--text-xs);
  font-weight: 600;
  
  &--success {
    background: var(--success-50);
    color: var(--success-700);
  }
  
  &--warning {
    background: var(--warning-50);
    color: var(--warning-700);
  }
  
  &--error {
    background: var(--error-50);
    color: var(--error-700);
  }
  
  &--info {
    background: var(--info-50);
    color: var(--info-700);
  }
  
  .status-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    margin-right: var(--space-2);
    background: currentColor;
  }
}
```

---

## Form Components

### Form Field Component
```scss
.form-field {
  margin-bottom: var(--space-6);
  
  &--inline {
    @media (min-width: 768px) {
      display: flex;
      align-items: flex-start;
      gap: var(--space-4);
      
      .form-label {
        flex: 0 0 200px;
        margin-bottom: 0;
        padding-top: var(--space-3);
      }
      
      .form-input-wrapper {
        flex: 1;
      }
    }
  }
  
  &--error {
    .form-input,
    .form-select,
    .form-textarea {
      border-color: var(--error-500);
      box-shadow: 0 0 0 1px var(--error-500);
    }
    
    .form-label {
      color: var(--error-700);
    }
  }
  
  &--success {
    .form-input,
    .form-select,
    .form-textarea {
      border-color: var(--success-500);
      box-shadow: 0 0 0 1px var(--success-500);
    }
  }
}

.form-label {
  display: block;
  margin-bottom: var(--space-2);
  font-weight: 500;
  color: var(--text-primary);
  font-size: var(--text-sm);
  
  .required {
    color: var(--error-500);
    margin-left: var(--space-1);
  }
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--border-medium);
  border-radius: var(--radius-lg);
  font-size: 16px; // Prevent zoom on iOS
  background: white;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: var(--brand-500);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  
  &:disabled {
    background: var(--bg-muted);
    color: var(--text-tertiary);
    cursor: not-allowed;
  }
  
  &::placeholder {
    color: var(--text-tertiary);
  }
}

.form-input {
  height: 44px;
}

.form-textarea {
  min-height: 120px;
  resize: vertical;
}

.form-help {
  margin-top: var(--space-2);
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.form-error {
  margin-top: var(--space-2);
  font-size: var(--text-sm);
  color: var(--error-600);
  display: flex;
  align-items: center;
  
  .error-icon {
    width: 16px;
    height: 16px;
    margin-right: var(--space-2);
    flex-shrink: 0;
  }
}
```

### Checkbox and Radio Components
```scss
.form-checkbox,
.form-radio {
  display: flex;
  align-items: flex-start;
  cursor: pointer;
  user-select: none;
  
  input {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
  }
  
  .checkbox-indicator,
  .radio-indicator {
    width: 20px;
    height: 20px;
    border: 2px solid var(--border-medium);
    background: white;
    margin-right: var(--space-3);
    margin-top: 2px;
    flex-shrink: 0;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .checkbox-indicator {
    border-radius: var(--radius-sm);
  }
  
  .radio-indicator {
    border-radius: 50%;
  }
  
  input:checked + .checkbox-indicator {
    background: var(--brand-500);
    border-color: var(--brand-500);
    
    .check-icon {
      opacity: 1;
      color: white;
    }
  }
  
  input:checked + .radio-indicator {
    border-color: var(--brand-500);
    
    &::after {
      content: '';
      width: 8px;
      height: 8px;
      background: var(--brand-500);
      border-radius: 50%;
    }
  }
  
  input:focus + .checkbox-indicator,
  input:focus + .radio-indicator {
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  
  .form-label {
    margin-bottom: 0;
    cursor: pointer;
    line-height: 1.5;
  }
  
  &:hover {
    .checkbox-indicator,
    .radio-indicator {
      border-color: var(--brand-400);
    }
  }
}

.checkbox-group,
.radio-group {
  .form-checkbox,
  .form-radio {
    margin-bottom: var(--space-3);
    
    &:last-child {
      margin-bottom: 0;
    }
  }
}
```

---

## Feedback Components

### Toast Notification
```scss
.toast-container {
  position: fixed;
  z-index: 100;
  pointer-events: none;
  
  // Mobile: top center
  @media (max-width: 767px) {
    top: var(--space-4);
    left: var(--space-4);
    right: var(--space-4);
  }
  
  // Desktop: top right
  @media (min-width: 768px) {
    top: var(--space-6);
    right: var(--space-6);
    width: 400px;
  }
}

.toast {
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  border-left: 4px solid var(--info-500);
  padding: var(--space-4);
  margin-bottom: var(--space-3);
  pointer-events: auto;
  animation: toast-enter 0.3s ease-out;
  
  &--success {
    border-left-color: var(--success-500);
  }
  
  &--warning {
    border-left-color: var(--warning-500);
  }
  
  &--error {
    border-left-color: var(--error-500);
  }
  
  .toast-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: var(--space-2);
    
    .toast-title {
      font-weight: 600;
      color: var(--text-primary);
      font-size: var(--text-sm);
      display: flex;
      align-items: center;
      
      .toast-icon {
        width: 20px;
        height: 20px;
        margin-right: var(--space-2);
      }
    }
    
    .toast-close {
      background: none;
      border: none;
      color: var(--text-tertiary);
      cursor: pointer;
      padding: var(--space-1);
      border-radius: var(--radius-sm);
      
      &:hover {
        color: var(--text-secondary);
        background: var(--bg-subtle);
      }
      
      &:focus {
        outline: 2px solid var(--brand-500);
        outline-offset: 2px;
      }
    }
  }
  
  .toast-message {
    color: var(--text-secondary);
    font-size: var(--text-sm);
    line-height: 1.5;
  }
  
  .toast-actions {
    margin-top: var(--space-3);
    display: flex;
    gap: var(--space-2);
    
    .btn {
      font-size: var(--text-sm);
      padding: var(--space-2) var(--space-3);
    }
  }
  
  &.toast-exit {
    animation: toast-exit 0.2s ease-in forwards;
  }
}

@keyframes toast-enter {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes toast-exit {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
}
```

### Modal Dialog
```scss
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 90;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-4);
  animation: backdrop-enter 0.2s ease-out;
}

.modal {
  background: white;
  border-radius: var(--radius-xl);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  animation: modal-enter 0.3s ease-out;
  
  @media (max-width: 767px) {
    max-width: 100%;
    max-height: 100%;
    border-radius: 0;
    margin: 0;
  }
  
  .modal-header {
    padding: var(--space-6);
    border-bottom: 1px solid var(--border-light);
    display: flex;
    align-items: center;
    justify-content: space-between;
    
    .modal-title {
      font-size: var(--text-xl);
      font-weight: 600;
      color: var(--text-primary);
    }
    
    .modal-close {
      background: none;
      border: none;
      color: var(--text-tertiary);
      cursor: pointer;
      padding: var(--space-2);
      border-radius: var(--radius-md);
      
      &:hover {
        color: var(--text-secondary);
        background: var(--bg-subtle);
      }
      
      &:focus {
        outline: 2px solid var(--brand-500);
        outline-offset: 2px;
      }
    }
  }
  
  .modal-body {
    padding: var(--space-6);
    overflow-y: auto;
    flex: 1;
  }
  
  .modal-footer {
    padding: var(--space-6);
    border-top: 1px solid var(--border-light);
    display: flex;
    justify-content: flex-end;
    gap: var(--space-3);
    
    @media (max-width: 767px) {
      flex-direction: column-reverse;
      
      .btn {
        width: 100%;
      }
    }
  }
}

@keyframes backdrop-enter {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes modal-enter {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(-10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
```

---

## Layout Components

### Page Header
```scss
.page-header {
  background: white;
  border-bottom: 1px solid var(--border-light);
  padding: var(--space-6);
  
  @media (max-width: 767px) {
    padding: var(--space-4);
  }
  
  .header-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-4);
    
    @media (max-width: 767px) {
      flex-direction: column;
      align-items: flex-start;
      gap: var(--space-4);
    }
  }
  
  .header-left {
    flex: 1;
    min-width: 0;
    
    .page-title {
      font-size: var(--text-3xl);
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: var(--space-2);
      
      @media (max-width: 767px) {
        font-size: var(--text-2xl);
      }
    }
    
    .page-subtitle {
      color: var(--text-secondary);
      font-size: var(--text-base);
      margin-bottom: var(--space-4);
    }
    
    .breadcrumb {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      font-size: var(--text-sm);
      
      .breadcrumb-item {
        color: var(--text-tertiary);
        text-decoration: none;
        
        &:hover {
          color: var(--text-secondary);
        }
        
        &--current {
          color: var(--text-primary);
          font-weight: 500;
        }
      }
      
      .breadcrumb-separator {
        color: var(--text-tertiary);
      }
    }
  }
  
  .header-actions {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    
    @media (max-width: 767px) {
      width: 100%;
      justify-content: stretch;
      
      .btn {
        flex: 1;
      }
    }
  }
}
```

### Card Container
```scss
.card {
  background: white;
  border-radius: var(--radius-xl);
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  overflow: hidden;
  
  &--elevated {
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  }
  
  &--bordered {
    border: 1px solid var(--border-light);
    box-shadow: none;
  }
  
  .card-header {
    padding: var(--space-6);
    border-bottom: 1px solid var(--border-light);
    
    .card-title {
      font-size: var(--text-lg);
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: var(--space-2);
    }
    
    .card-subtitle {
      color: var(--text-secondary);
      font-size: var(--text-sm);
    }
  }
  
  .card-body {
    padding: var(--space-6);
  }
  
  .card-footer {
    padding: var(--space-6);
    border-top: 1px solid var(--border-light);
    background: var(--bg-subtle);
  }
}
```

This component specification document provides detailed implementation guidelines for all major UI components in the IvyArc application, ensuring consistency and accessibility across the entire interface.