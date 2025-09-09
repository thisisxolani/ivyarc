# IvyArc UX Guidelines & Mobile-First Design Specifications

## Table of Contents

1. [Project Overview](#project-overview)
2. [User Personas & Journeys](#user-personas--journeys)
3. [Design Principles](#design-principles)
4. [Mobile-First Design Strategy](#mobile-first-design-strategy)
5. [Component Design System](#component-design-system)
6. [User Flow Definitions](#user-flow-definitions)
7. [Accessibility Guidelines](#accessibility-guidelines)
8. [Typography & Color System](#typography--color-system)
9. [Layout & Navigation](#layout--navigation)
10. [Implementation Standards](#implementation-standards)

---

## Project Overview

IvyArc is a Spring Cloud microservices-based authentication and authorization system with an Angular frontend using the TailAdmin template. The application serves system administrators and end users who need secure access to various system functions.

### Core Features
- JWT-based authentication system
- Role-based access control (RBAC)
- User management dashboard
- Audit logging and monitoring
- Multi-tenant support
- OAuth2 integration

### Technology Stack
- **Frontend**: Angular 20+, TailwindCSS, TailAdmin template
- **Backend**: Spring Cloud microservices
- **Database**: PostgreSQL
- **Caching**: Redis
- **Messaging**: RabbitMQ

---

## User Personas & Journeys

### Primary Personas

#### 1. System Administrator (Sarah)
- **Role**: IT Administrator
- **Goals**: Manage users, monitor system health, configure permissions
- **Pain Points**: Complex interfaces, time-consuming user management tasks
- **Devices**: Primarily desktop (70%), tablet (20%), mobile (10%)
- **Technical Skill**: High
- **Usage Pattern**: Daily, extended sessions (2-4 hours)

#### 2. End User (Marcus)
- **Role**: Business User
- **Goals**: Quick login, access authorized resources, update profile
- **Pain Points**: Forgotten passwords, complex authentication flows
- **Devices**: Mobile (60%), desktop (30%), tablet (10%)
- **Technical Skill**: Medium
- **Usage Pattern**: Multiple short sessions throughout the day

#### 3. Security Auditor (Elena)
- **Role**: Security Analyst
- **Goals**: Review access logs, generate compliance reports, monitor security events
- **Pain Points**: Difficult data filtering, poor report visibility
- **Devices**: Desktop (80%), laptop (20%)
- **Technical Skill**: High
- **Usage Pattern**: Weekly deep-dive sessions, daily quick checks

### User Journey Maps

#### Authentication Journey
```
1. Landing → 2. Login Form → 3. Credential Validation → 4. MFA (if enabled) → 5. Dashboard
   
Pain Points: 
- Slow loading on mobile
- Unclear error messages
- Forgotten password flow confusion

Optimization Goals:
- <2s page load time
- Clear visual feedback
- Intuitive password recovery
```

#### User Management Journey (Admin)
```
1. Dashboard → 2. User List → 3. Search/Filter → 4. User Details → 5. Edit Permissions → 6. Save Changes

Pain Points:
- Poor mobile experience for tables
- No bulk operations
- Unclear permission hierarchy

Optimization Goals:
- Mobile-friendly data tables
- Batch operations
- Visual permission mapping
```

---

## Design Principles

### 1. Mobile-First Approach
Every interface starts with mobile design, then scales up to larger screens.

### 2. Progressive Disclosure
Present information hierarchically, showing essential items first with clear paths to detailed information.

### 3. Consistent Visual Language
Maintain consistent spacing, typography, and color usage across all components.

### 4. Accessible by Default
All designs meet WCAG 2.1 AA standards from initial implementation.

### 5. Performance-Conscious
Optimize for fast loading and smooth interactions across all device types.

### 6. Security-Focused UX
Make security features intuitive and non-intrusive while maintaining effectiveness.

---

## Mobile-First Design Strategy

### Responsive Breakpoint System

```css
/* Mobile First Breakpoints */
:root {
  --mobile-sm: 320px;    /* Small phones */
  --mobile-md: 375px;    /* Standard phones */
  --mobile-lg: 414px;    /* Large phones */
  --tablet-sm: 768px;    /* Small tablets, landscape phones */
  --tablet-lg: 1024px;   /* Large tablets, small laptops */
  --desktop-sm: 1280px;  /* Small desktop */
  --desktop-md: 1440px;  /* Standard desktop */
  --desktop-lg: 1920px;  /* Large desktop */
}
```

### Touch Target Standards

#### Minimum Touch Target Sizes
- **Primary actions**: 44×44px minimum
- **Secondary actions**: 40×40px minimum
- **Text links**: 32px minimum height
- **Form controls**: 44px minimum height

#### Touch Target Spacing
- **Minimum spacing**: 8px between interactive elements
- **Recommended spacing**: 12px between primary actions
- **Safe spacing**: 16px for critical actions

### Mobile Navigation Patterns

#### Bottom Navigation (Primary)
```html
<!-- Bottom Navigation for mobile -->
<nav class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 dark:bg-gray-900 dark:border-gray-700 z-50 md:hidden">
  <div class="flex justify-around items-center h-16">
    <!-- Navigation items with icons and labels -->
  </div>
</nav>
```

#### Collapsible Sidebar (Tablet+)
- Slides in from left on tablet and desktop
- Overlay on mobile with backdrop
- Persistent on desktop screens > 1024px

### Mobile-Specific Interactions

#### Gesture Support
- **Pull-to-refresh**: On data tables and lists
- **Swipe actions**: For table rows (edit, delete)
- **Long press**: For context menus
- **Pinch-to-zoom**: On charts and complex visuals

#### Mobile Performance Considerations
- Lazy load images and non-critical components
- Use skeleton screens for loading states
- Optimize images for different screen densities
- Minimize JavaScript bundle size

---

## Component Design System

### Design Tokens

#### Spacing Scale
```css
:root {
  --space-1: 0.25rem;  /* 4px */
  --space-2: 0.5rem;   /* 8px */
  --space-3: 0.75rem;  /* 12px */
  --space-4: 1rem;     /* 16px */
  --space-5: 1.25rem;  /* 20px */
  --space-6: 1.5rem;   /* 24px */
  --space-8: 2rem;     /* 32px */
  --space-10: 2.5rem;  /* 40px */
  --space-12: 3rem;    /* 48px */
  --space-16: 4rem;    /* 64px */
}
```

#### Border Radius Scale
```css
:root {
  --radius-sm: 0.125rem;  /* 2px */
  --radius-md: 0.375rem;  /* 6px */
  --radius-lg: 0.5rem;    /* 8px */
  --radius-xl: 0.75rem;   /* 12px */
  --radius-2xl: 1rem;     /* 16px */
}
```

### Core Components

#### 1. Authentication Components

##### Login Form
```typescript
interface LoginFormSpec {
  // Mobile: Full-width form with large touch targets
  // Tablet+: Max-width 400px, centered
  
  // Form structure:
  // - Logo/Brand (optional on mobile)
  // - Title + subtitle
  // - Social login buttons (full-width on mobile, side-by-side on tablet+)
  // - Divider with "Or"
  // - Email input (type="email", autocomplete="username")
  // - Password input with show/hide toggle
  // - "Remember me" checkbox + "Forgot password" link
  // - Primary login button (full-width)
  // - Sign-up link
  
  validation: {
    realTime: true,        // Validate on blur/input
    errorDisplay: 'inline', // Show errors below fields
    submitDisabled: true   // Disable button until valid
  },
  
  accessibility: {
    labels: 'explicit',    // No placeholder-only labels
    errorIds: true,        // Link errors to inputs via aria-describedby
    liveRegions: true      // Announce validation errors
  }
}
```

##### Registration Form
- Multi-step on mobile (3 steps max)
- Single form on tablet+
- Progress indicator for multi-step
- Password strength indicator
- Terms & privacy checkboxes

#### 2. Dashboard Components

##### Navigation Sidebar
```typescript
interface SidebarSpec {
  mobile: {
    type: 'overlay',
    trigger: 'hamburger-menu',
    backdrop: true,
    swipeToClose: true
  },
  
  tablet: {
    type: 'collapsible',
    defaultState: 'collapsed',
    width: '240px'
  },
  
  desktop: {
    type: 'persistent',
    width: '280px',
    collapsible: true
  },
  
  // Navigation structure:
  // - User avatar + name (collapsible section)
  // - Primary navigation (Dashboard, Users, Audit, Settings)
  // - Secondary actions (Support, Sign out)
  
  accessibility: {
    skipLinks: true,       // Skip to main content
    keyboardNav: true,     // Arrow key navigation
    screenReader: true     // Proper ARIA labels
  }
}
```

##### Data Tables
```typescript
interface DataTableSpec {
  mobile: {
    layout: 'card-based',  // Stack cards instead of table
    actions: 'swipe',      // Swipe for actions
    pagination: 'scroll',  // Infinite scroll or load more
    search: 'overlay'      // Full-screen search overlay
  },
  
  tablet: {
    layout: 'responsive-table', // Horizontal scroll
    actions: 'dropdown',        // Action dropdown menus
    pagination: 'standard',     // Page numbers
    search: 'inline'           // Search bar in header
  },
  
  desktop: {
    layout: 'full-table',
    actions: 'inline',     // Buttons in row
    pagination: 'advanced', // Items per page + jump to page
    search: 'advanced'     // Multi-column search
  },
  
  features: {
    sorting: true,
    filtering: true,
    selection: 'checkbox', // Bulk operations
    export: true,
    columnToggle: true     // Show/hide columns (tablet+)
  }
}
```

#### 3. Form Components

##### Input Fields
```typescript
interface FormInputSpec {
  states: ['default', 'focus', 'error', 'success', 'disabled'],
  
  mobile: {
    height: '44px',        // Touch-friendly
    fontSize: '16px',      // Prevent zoom on iOS
    spacing: '16px'        // Between fields
  },
  
  validation: {
    timing: 'onBlur',      // Don't validate while typing
    display: 'below',      // Error message below field
    icon: true,            // Status icons
    color: 'semantic'      // Red for errors, green for success
  },
  
  accessibility: {
    labels: 'visible',     // Always visible labels
    required: 'asterisk',  // Red asterisk for required
    helpText: 'aria-describedby' // Link help text to input
  }
}
```

##### Buttons
```typescript
interface ButtonSpec {
  variants: ['primary', 'secondary', 'outline', 'ghost', 'danger'],
  sizes: ['sm', 'md', 'lg'],
  
  touchTargets: {
    sm: '32px',     // Minimum for secondary actions
    md: '40px',     // Standard buttons
    lg: '44px'      // Primary actions on mobile
  },
  
  states: ['default', 'hover', 'active', 'focus', 'disabled', 'loading'],
  
  mobile: {
    fullWidth: true,      // Primary buttons full-width on mobile
    stackVertical: true,  // Stack multiple buttons
    spacing: '12px'       // Between stacked buttons
  }
}
```

#### 4. Feedback Components

##### Loading States
```typescript
interface LoadingStateSpec {
  skeleton: {
    use: 'initial-load',   // First time loading
    animation: 'pulse',    // Subtle pulse animation
    shapes: ['text', 'rect', 'circle'] // Match content
  },
  
  spinner: {
    use: 'user-action',    // After user triggers action
    size: 'contextual',    // Match button/container size
    position: 'overlay'    // Over existing content
  },
  
  progressBar: {
    use: 'file-upload',    // Determinate progress
    style: 'linear',       // Horizontal bar
    percentage: true       // Show percentage text
  }
}
```

##### Error States
```typescript
interface ErrorStateSpec {
  inline: {
    use: 'form-validation',
    color: 'error-500',    // Red color token
    icon: 'warning-triangle',
    animation: 'fade-in'
  },
  
  toast: {
    use: 'system-errors',
    position: 'top-center', // Mobile: top, Desktop: top-right
    duration: '5000ms',     // Auto-dismiss
    actions: ['dismiss', 'retry']
  },
  
  page: {
    use: '404-500-errors',
    illustration: true,     // Friendly error illustration
    actions: ['go-back', 'home', 'contact-support']
  }
}
```

---

## User Flow Definitions

### 1. Authentication Flow

#### Login Process
```
[Landing Page]
    ↓
[Login Form] ← Back to previous page
    ↓ (submit credentials)
[Loading State] → [Error State] (if invalid)
    ↓ (credentials valid)
[MFA Challenge] (if enabled) → [MFA Error] (if invalid)
    ↓ (MFA success or not required)
[Dashboard/Redirect]
```

**Mobile Optimizations:**
- Large, thumb-friendly form inputs (44px height)
- Social login buttons stacked vertically
- Clear visual feedback for each step
- Prevent keyboard from covering form fields

#### Password Recovery Flow
```
[Login Form] → [Forgot Password Link]
    ↓
[Email Input Form]
    ↓ (submit email)
[Confirmation Message]
    ↓ (user checks email)
[Password Reset Form] (from email link)
    ↓ (submit new password)
[Success Confirmation] → [Redirect to Login]
```

### 2. User Management Workflow (Admin)

#### User Creation Flow
```
[Dashboard] → [Users Section] → [Add User Button]
    ↓
[User Details Form]
    ↓ (basic info entered)
[Role Assignment] (multi-select with search)
    ↓ (roles selected)
[Permission Review] (summary of assigned permissions)
    ↓ (confirm)
[Success Confirmation] → [User List with new user highlighted]
```

**Mobile Adaptations:**
- Multi-step wizard instead of single form
- Touch-friendly role selection
- Swipe navigation between steps
- Clear progress indicators

### 3. Audit Log Viewing Flow

#### Audit Dashboard Navigation
```
[Dashboard] → [Audit Section]
    ↓
[Audit Overview] (summary metrics)
    ↓
[Filter Panel] (date range, user, action type)
    ↓ (apply filters)
[Audit Table/Cards] (paginated results)
    ↓ (select entry)
[Audit Detail Modal] (full event details)
```

**Mobile Optimizations:**
- Card-based layout instead of table
- Collapsible filter panel
- Pull-to-refresh for new entries
- Infinite scroll or "Load More" button

---

## Accessibility Guidelines

### WCAG 2.1 AA Compliance Checklist

#### Perceivable
- [ ] **Color Contrast**: Minimum 4.5:1 for normal text, 3:1 for large text
- [ ] **Color Independence**: Information not conveyed by color alone
- [ ] **Text Scaling**: Readable at 200% zoom without horizontal scrolling
- [ ] **Alternative Text**: All images have descriptive alt text
- [ ] **Captions**: Video content has captions when applicable

#### Operable
- [ ] **Keyboard Navigation**: All interactive elements keyboard accessible
- [ ] **Focus Management**: Clear focus indicators (2px outline minimum)
- [ ] **No Seizures**: No flashing content >3 times per second
- [ ] **Touch Targets**: Minimum 44×44px for interactive elements
- [ ] **Timeout Warnings**: Users warned before session timeouts

#### Understandable
- [ ] **Language**: Page language declared (lang attribute)
- [ ] **Navigation**: Consistent navigation across pages
- [ ] **Labels**: Form inputs have visible, descriptive labels
- [ ] **Error Identification**: Errors clearly identified and described
- [ ] **Help Text**: Available for complex interactions

#### Robust
- [ ] **Valid HTML**: Markup validates without errors
- [ ] **ARIA Labels**: Proper ARIA labels for complex widgets
- [ ] **Screen Readers**: Tested with NVDA, JAWS, VoiceOver
- [ ] **Browser Support**: Works with assistive technologies

### Implementation Guidelines

#### Focus Management
```css
/* Custom focus styles */
.focus-visible:focus-visible {
  outline: 2px solid var(--brand-500);
  outline-offset: 2px;
  border-radius: var(--radius-md);
}

/* Skip links */
.skip-link {
  position: absolute;
  top: -40px;
  left: 6px;
  background: var(--brand-500);
  color: white;
  padding: 8px;
  z-index: 1000;
  text-decoration: none;
  transition: top 0.3s;
}

.skip-link:focus {
  top: 6px;
}
```

#### Screen Reader Support
```html
<!-- Proper heading hierarchy -->
<h1>Dashboard</h1>
<h2>User Management</h2>
<h3>Active Users</h3>

<!-- Descriptive links -->
<a href="/users/edit/123" aria-label="Edit user John Smith">
  Edit
</a>

<!-- Form labels -->
<label for="email">Email Address *</label>
<input id="email" type="email" required aria-describedby="email-error">
<div id="email-error" role="alert">Please enter a valid email</div>

<!-- Complex widgets -->
<div role="tabpanel" aria-labelledby="panel1-tab" id="panel1">
  <!-- Panel content -->
</div>
```

#### Motion & Animation
```css
/* Respect reduced motion preferences */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Typography & Color System

### Typography Scale

#### Font Stack
```css
:root {
  --font-sans: 'Inter', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif;
  --font-display: 'Cal Sans', 'Inter', ui-sans-serif, system-ui, sans-serif;
  --font-mono: ui-monospace, SFMono-Regular, 'SF Mono', Monaco, Menlo, 'Roboto Mono', monospace;
}
```

#### Type Scale
```css
:root {
  /* Mobile-first type scale */
  --text-xs: 0.75rem;    /* 12px */
  --text-sm: 0.875rem;   /* 14px */
  --text-base: 1rem;     /* 16px */
  --text-lg: 1.125rem;   /* 18px */
  --text-xl: 1.25rem;    /* 20px */
  --text-2xl: 1.5rem;    /* 24px */
  --text-3xl: 1.875rem;  /* 30px */
  --text-4xl: 2.25rem;   /* 36px */
}

/* Desktop adjustments */
@media (min-width: 768px) {
  :root {
    --text-3xl: 2rem;     /* 32px */
    --text-4xl: 2.5rem;   /* 40px */
    --text-5xl: 3rem;     /* 48px */
  }
}
```

#### Line Heights
```css
:root {
  --leading-tight: 1.25;
  --leading-snug: 1.375;
  --leading-normal: 1.5;
  --leading-relaxed: 1.625;
  --leading-loose: 2;
}
```

### Color System

#### Primary Brand Colors
```css
:root {
  --brand-50: #eff6ff;
  --brand-100: #dbeafe;
  --brand-200: #bfdbfe;
  --brand-300: #93c5fd;
  --brand-400: #60a5fa;
  --brand-500: #3b82f6;   /* Primary brand color */
  --brand-600: #2563eb;
  --brand-700: #1d4ed8;
  --brand-800: #1e40af;
  --brand-900: #1e3a8a;
  --brand-950: #172554;
}
```

#### Semantic Colors
```css
:root {
  /* Success */
  --success-50: #f0fdf4;
  --success-500: #22c55e;
  --success-700: #15803d;
  
  /* Warning */
  --warning-50: #fffbeb;
  --warning-500: #f59e0b;
  --warning-700: #a16207;
  
  /* Error */
  --error-50: #fef2f2;
  --error-500: #ef4444;
  --error-700: #b91c1c;
  
  /* Info */
  --info-50: #f0f9ff;
  --info-500: #06b6d4;
  --info-700: #0e7490;
}
```

#### Neutral Colors
```css
:root {
  /* Light mode */
  --gray-50: #f8fafc;
  --gray-100: #f1f5f9;
  --gray-200: #e2e8f0;
  --gray-300: #cbd5e1;
  --gray-400: #94a3b8;
  --gray-500: #64748b;
  --gray-600: #475569;
  --gray-700: #334155;
  --gray-800: #1e293b;
  --gray-900: #0f172a;
  
  /* Semantic aliases */
  --text-primary: var(--gray-900);
  --text-secondary: var(--gray-600);
  --text-tertiary: var(--gray-500);
  --border-light: var(--gray-200);
  --border-medium: var(--gray-300);
  --bg-subtle: var(--gray-50);
  --bg-muted: var(--gray-100);
}

/* Dark mode overrides */
@media (prefers-color-scheme: dark) {
  :root {
    --text-primary: var(--gray-100);
    --text-secondary: var(--gray-400);
    --text-tertiary: var(--gray-500);
    --border-light: var(--gray-700);
    --border-medium: var(--gray-600);
    --bg-subtle: var(--gray-800);
    --bg-muted: var(--gray-900);
  }
}

/* Dark mode class override */
.dark {
  --text-primary: var(--gray-100);
  --text-secondary: var(--gray-400);
  --text-tertiary: var(--gray-500);
  --border-light: var(--gray-700);
  --border-medium: var(--gray-600);
  --bg-subtle: var(--gray-800);
  --bg-muted: var(--gray-900);
}
```

#### Color Usage Guidelines

**Primary Brand Color (Blue)**
- Primary action buttons
- Links and interactive elements
- Progress indicators
- Active states

**Success (Green)**
- Form validation success
- Completed tasks
- Positive status indicators
- Success messages

**Warning (Yellow/Orange)**
- Caution messages
- Pending states
- Non-critical alerts
- Attention-needed indicators

**Error (Red)**
- Form validation errors
- Critical alerts
- Destructive actions
- Error messages

**Neutral (Gray)**
- Text content
- Borders and dividers
- Background surfaces
- Secondary actions

---

## Layout & Navigation

### Grid System

#### Responsive Grid
```css
/* 12-column responsive grid */
.grid-container {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 1rem;
  padding: 0 1rem;
  max-width: 1200px;
  margin: 0 auto;
}

/* Responsive grid adjustments */
@media (min-width: 640px) {
  .grid-container {
    gap: 1.5rem;
    padding: 0 2rem;
  }
}

@media (min-width: 1024px) {
  .grid-container {
    gap: 2rem;
    max-width: 1440px;
  }
}
```

#### Content Width Constraints
```css
:root {
  --content-max-width: 1200px;
  --content-padding: 1rem;
  --form-max-width: 480px;
  --modal-max-width: 600px;
}

@media (min-width: 640px) {
  :root {
    --content-padding: 2rem;
  }
}
```

### Navigation Architecture

#### Primary Navigation Structure
```
Dashboard (Home)
├── Overview Dashboard
├── Quick Actions
└── System Status

Users
├── User List
├── Add User
├── Role Management
└── Permission Matrix

Audit
├── Activity Log
├── Security Events
├── Reports
└── Export Data

Settings
├── System Configuration
├── Security Settings
├── Integrations
└── Preferences
```

#### Mobile Navigation Strategy
```typescript
interface MobileNavigation {
  primary: {
    type: 'bottom-tabs',
    items: ['Dashboard', 'Users', 'Audit', 'Settings'],
    position: 'fixed-bottom'
  },
  
  secondary: {
    type: 'hamburger-menu',
    trigger: 'top-left',
    overlay: true,
    backdrop: true
  },
  
  breadcrumbs: {
    mobile: 'collapsed', // Show only current page
    tablet: 'partial',   // Show 2 levels
    desktop: 'full'      // Show full path
  }
}
```

### Page Layouts

#### Dashboard Layout
```html
<div class="min-h-screen bg-gray-50 dark:bg-gray-900">
  <!-- Mobile Header -->
  <header class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 lg:hidden">
    <!-- Mobile header content -->
  </header>
  
  <!-- Sidebar Navigation -->
  <aside class="sidebar">
    <!-- Navigation menu -->
  </aside>
  
  <!-- Main Content Area -->
  <main class="main-content">
    <!-- Page header -->
    <div class="page-header">
      <h1>Page Title</h1>
      <div class="page-actions">
        <!-- Action buttons -->
      </div>
    </div>
    
    <!-- Page content -->
    <div class="page-content">
      <!-- Content goes here -->
    </div>
  </main>
</div>
```

#### Form Layout
```html
<div class="form-container">
  <div class="form-header">
    <h2>Form Title</h2>
    <p class="form-description">Optional description</p>
  </div>
  
  <form class="form-body">
    <div class="form-section">
      <h3 class="section-title">Section Title</h3>
      <div class="form-grid">
        <!-- Form fields -->
      </div>
    </div>
    
    <div class="form-actions">
      <button type="button" class="btn-secondary">Cancel</button>
      <button type="submit" class="btn-primary">Save</button>
    </div>
  </form>
</div>
```

---

## Implementation Standards

### CSS Architecture

#### Component-Based CSS Structure
```
styles/
├── base/
│   ├── reset.css
│   ├── typography.css
│   └── utilities.css
├── components/
│   ├── buttons.css
│   ├── forms.css
│   ├── navigation.css
│   └── tables.css
├── layouts/
│   ├── dashboard.css
│   ├── auth.css
│   └── modal.css
└── themes/
    ├── light.css
    └── dark.css
```

#### CSS Methodology
- **BEM Naming**: Block__Element--Modifier
- **Utility Classes**: Prefix with `u-` (e.g., `u-text-center`)
- **Component Classes**: Descriptive names (e.g., `.user-card`)
- **State Classes**: Prefix with `is-` or `has-` (e.g., `.is-active`)

#### Example Component CSS
```css
/* Button Component */
.btn {
  /* Base button styles */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-lg);
  font-weight: 500;
  font-size: var(--text-sm);
  line-height: var(--leading-tight);
  text-decoration: none;
  transition: all 0.2s ease-in-out;
  cursor: pointer;
  border: 1px solid transparent;
  
  /* Touch targets for mobile */
  min-height: 44px;
  min-width: 44px;
}

.btn--primary {
  background-color: var(--brand-500);
  color: white;
  border-color: var(--brand-500);
}

.btn--primary:hover {
  background-color: var(--brand-600);
  border-color: var(--brand-600);
}

.btn--primary:focus-visible {
  outline: 2px solid var(--brand-500);
  outline-offset: 2px;
}

.btn--primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Mobile-specific adjustments */
@media (max-width: 767px) {
  .btn--full-mobile {
    width: 100%;
  }
  
  .btn-group .btn {
    margin-bottom: var(--space-3);
  }
  
  .btn-group .btn:last-child {
    margin-bottom: 0;
  }
}
```

### Angular Component Guidelines

#### Component Structure
```typescript
@Component({
  selector: 'app-user-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserFormComponent implements OnInit, OnDestroy {
  // ViewChild references for form elements
  @ViewChild('userForm', { static: true }) userForm!: NgForm;
  
  // Input/Output properties
  @Input() user: User | null = null;
  @Input() loading = false;
  @Output() userSaved = new EventEmitter<User>();
  @Output() cancelled = new EventEmitter<void>();
  
  // Form data
  formData: UserFormData = {
    firstName: '',
    lastName: '',
    email: '',
    role: ''
  };
  
  // Component state
  validationErrors: ValidationErrors = {};
  submitted = false;
  
  constructor(
    private userService: UserService,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) {}
  
  ngOnInit(): void {
    if (this.user) {
      this.loadUserData();
    }
  }
  
  ngOnDestroy(): void {
    // Cleanup subscriptions
  }
  
  // Form submission
  onSubmit(): void {
    this.submitted = true;
    
    if (this.userForm.valid) {
      this.saveUser();
    } else {
      this.focusFirstError();
    }
  }
  
  // Focus management for accessibility
  private focusFirstError(): void {
    const firstError = document.querySelector('.form-field--error input');
    if (firstError) {
      (firstError as HTMLElement).focus();
    }
  }
}
```

#### Template Guidelines
```html
<!-- user-form.component.html -->
<form #userForm="ngForm" (ngSubmit)="onSubmit()" class="form" novalidate>
  <div class="form-header">
    <h2 class="form-title">{{ user ? 'Edit User' : 'Add New User' }}</h2>
  </div>
  
  <div class="form-body">
    <!-- First Name Field -->
    <div class="form-field" 
         [class.form-field--error]="firstName.invalid && (firstName.dirty || submitted)">
      <label for="firstName" class="form-label">
        First Name <span class="required">*</span>
      </label>
      <input
        id="firstName"
        name="firstName"
        type="text"
        class="form-input"
        [(ngModel)]="formData.firstName"
        #firstName="ngModel"
        required
        autocomplete="given-name"
        [attr.aria-describedby]="firstName.invalid ? 'firstName-error' : null">
      
      <div *ngIf="firstName.invalid && (firstName.dirty || submitted)" 
           id="firstName-error" 
           class="form-error" 
           role="alert">
        <span *ngIf="firstName.errors?.['required']">First name is required</span>
      </div>
    </div>
    
    <!-- Email Field -->
    <div class="form-field" 
         [class.form-field--error]="email.invalid && (email.dirty || submitted)">
      <label for="email" class="form-label">
        Email Address <span class="required">*</span>
      </label>
      <input
        id="email"
        name="email"
        type="email"
        class="form-input"
        [(ngModel)]="formData.email"
        #email="ngModel"
        required
        email
        autocomplete="email"
        [attr.aria-describedby]="email.invalid ? 'email-error' : null">
      
      <div *ngIf="email.invalid && (email.dirty || submitted)" 
           id="email-error" 
           class="form-error" 
           role="alert">
        <span *ngIf="email.errors?.['required']">Email is required</span>
        <span *ngIf="email.errors?.['email']">Please enter a valid email address</span>
      </div>
    </div>
  </div>
  
  <div class="form-actions">
    <button type="button" 
            class="btn btn--secondary" 
            (click)="cancelled.emit()">
      Cancel
    </button>
    <button type="submit" 
            class="btn btn--primary"
            [disabled]="loading"
            [class.btn--loading]="loading">
      <span *ngIf="!loading">{{ user ? 'Update User' : 'Create User' }}</span>
      <span *ngIf="loading" class="btn-loading-content">
        <span class="spinner" aria-hidden="true"></span>
        Saving...
      </span>
    </button>
  </div>
</form>
```

### Performance Optimization

#### Angular-Specific Optimizations
```typescript
// Use OnPush change detection for better performance
@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserListComponent {
  // Use trackBy functions for ngFor
  trackByUserId(index: number, user: User): number {
    return user.id;
  }
}
```

#### Lazy Loading Strategy
```typescript
// Feature module lazy loading
const routes: Routes = [
  {
    path: 'users',
    loadChildren: () => import('./features/users/users.module').then(m => m.UsersModule)
  },
  {
    path: 'audit',
    loadChildren: () => import('./features/audit/audit.module').then(m => m.AuditModule)
  }
];
```

#### Image Optimization
```html
<!-- Responsive images -->
<img 
  src="/api/users/{{ user.id }}/avatar"
  alt="Avatar for {{ user.name }}"
  loading="lazy"
  class="user-avatar"
  width="40"
  height="40">

<!-- Placeholder while loading -->
<div class="avatar-placeholder" *ngIf="!avatarLoaded">
  <div class="skeleton-circle"></div>
</div>
```

### Testing Guidelines

#### Unit Testing
```typescript
describe('UserFormComponent', () => {
  let component: UserFormComponent;
  let fixture: ComponentFixture<UserFormComponent>;
  
  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UserFormComponent],
      imports: [FormsModule, ReactiveFormsModule],
      providers: [
        { provide: UserService, useValue: mockUserService },
        { provide: NotificationService, useValue: mockNotificationService }
      ]
    });
    
    fixture = TestBed.createComponent(UserFormComponent);
    component = fixture.componentInstance;
  });
  
  it('should focus first error field when form is invalid', async () => {
    // Test accessibility behavior
    const firstNameInput = fixture.debugElement.query(By.css('#firstName'));
    spyOn(firstNameInput.nativeElement, 'focus');
    
    component.onSubmit();
    fixture.detectChanges();
    
    expect(firstNameInput.nativeElement.focus).toHaveBeenCalled();
  });
  
  it('should have proper ARIA attributes for error states', () => {
    component.submitted = true;
    component.formData.firstName = '';
    fixture.detectChanges();
    
    const firstNameInput = fixture.debugElement.query(By.css('#firstName'));
    expect(firstNameInput.nativeElement.getAttribute('aria-describedby')).toBe('firstName-error');
  });
});
```

#### E2E Testing
```typescript
describe('Authentication Flow', () => {
  it('should complete login flow on mobile viewport', () => {
    // Set mobile viewport
    cy.viewport(375, 667);
    
    cy.visit('/login');
    
    // Test mobile-specific interactions
    cy.get('[data-testid="email-input"]')
      .type('user@example.com')
      .should('have.css', 'font-size', '16px'); // Prevent zoom
    
    cy.get('[data-testid="password-input"]')
      .type('password123');
    
    cy.get('[data-testid="login-button"]')
      .should('have.css', 'min-height', '44px') // Touch target
      .click();
    
    cy.url().should('include', '/dashboard');
  });
});
```

---

## Summary

This comprehensive UX guideline document provides the foundation for creating a professional, accessible, and mobile-first interface for the IvyArc authentication and dashboard application. The guidelines ensure:

1. **Consistent User Experience**: Standardized patterns across all components and pages
2. **Mobile-First Approach**: Optimized for all device sizes with touch-friendly interactions
3. **Accessibility Compliance**: WCAG 2.1 AA standards met throughout the application
4. **Performance Focus**: Optimized loading times and smooth interactions
5. **Maintainable Code**: Clear architectural patterns and component organization

### Key Implementation Priorities

1. **Start with Mobile**: Design and implement mobile layouts first
2. **Accessibility First**: Include accessibility features from the beginning, not as an afterthought
3. **Performance Budget**: Monitor and maintain fast loading times
4. **User Testing**: Regular testing with actual users to validate design decisions
5. **Iterative Improvement**: Continuous refinement based on user feedback and analytics

The guidelines in this document should be treated as living standards that evolve with the application and user needs. Regular reviews and updates ensure the interface continues to serve users effectively while maintaining technical excellence.