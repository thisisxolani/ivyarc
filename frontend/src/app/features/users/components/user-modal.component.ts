import { Component, Input, Output, EventEmitter, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { UserProfile, UserApiService } from '../services/user-api.service';

@Component({
  selector: 'app-user-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div *ngIf="isOpen" class="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
      <div class="flex items-end justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <!-- Background overlay -->
        <div class="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" (click)="close()"></div>

        <!-- Modal panel -->
        <div class="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg sm:align-middle">
          <form [formGroup]="userForm" (ngSubmit)="onSubmit()">
            <!-- Modal Header -->
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-lg font-medium text-gray-900">
                {{ isEditMode ? 'Edit User' : 'Create New User' }}
              </h3>
              <button type="button" (click)="close()" class="text-gray-400 hover:text-gray-600">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>

            <!-- Form Fields -->
            <div class="space-y-4">
              <!-- User ID (only for create) -->
              <div *ngIf="!isEditMode" class="form-group">
                <label class="form-label">User ID *</label>
                <input 
                  type="text" 
                  formControlName="userId"
                  class="form-input"
                  [class.border-red-300]="isFieldInvalid('userId')"
                  placeholder="Enter unique user ID"
                />
                <div *ngIf="isFieldInvalid('userId')" class="form-error">
                  <span *ngIf="userForm.get('userId')?.errors?.['required']">User ID is required</span>
                  <span *ngIf="userForm.get('userId')?.errors?.['minlength']">User ID must be at least 3 characters</span>
                </div>
              </div>

              <!-- First Name -->
              <div class="form-group">
                <label class="form-label">First Name *</label>
                <input 
                  type="text" 
                  formControlName="firstName"
                  class="form-input"
                  [class.border-red-300]="isFieldInvalid('firstName')"
                  placeholder="Enter first name"
                />
                <div *ngIf="isFieldInvalid('firstName')" class="form-error">
                  <span *ngIf="userForm.get('firstName')?.errors?.['required']">First name is required</span>
                  <span *ngIf="userForm.get('firstName')?.errors?.['maxlength']">First name must not exceed 50 characters</span>
                </div>
              </div>

              <!-- Last Name -->
              <div class="form-group">
                <label class="form-label">Last Name *</label>
                <input 
                  type="text" 
                  formControlName="lastName"
                  class="form-input"
                  [class.border-red-300]="isFieldInvalid('lastName')"
                  placeholder="Enter last name"
                />
                <div *ngIf="isFieldInvalid('lastName')" class="form-error">
                  <span *ngIf="userForm.get('lastName')?.errors?.['required']">Last name is required</span>
                  <span *ngIf="userForm.get('lastName')?.errors?.['maxlength']">Last name must not exceed 50 characters</span>
                </div>
              </div>

              <!-- Email -->
              <div class="form-group">
                <label class="form-label">Email *</label>
                <input 
                  type="email" 
                  formControlName="email"
                  class="form-input"
                  [class.border-red-300]="isFieldInvalid('email')"
                  placeholder="Enter email address"
                />
                <div *ngIf="isFieldInvalid('email')" class="form-error">
                  <span *ngIf="userForm.get('email')?.errors?.['required']">Email is required</span>
                  <span *ngIf="userForm.get('email')?.errors?.['email']">Please enter a valid email address</span>
                </div>
              </div>

              <!-- Phone -->
              <div class="form-group">
                <label class="form-label">Phone</label>
                <input 
                  type="tel" 
                  formControlName="phone"
                  class="form-input"
                  [class.border-red-300]="isFieldInvalid('phone')"
                  placeholder="Enter phone number"
                />
                <div *ngIf="isFieldInvalid('phone')" class="form-error">
                  <span *ngIf="userForm.get('phone')?.errors?.['maxlength']">Phone must not exceed 20 characters</span>
                </div>
              </div>

              <!-- Bio -->
              <div class="form-group">
                <label class="form-label">Bio</label>
                <textarea 
                  formControlName="bio"
                  rows="3"
                  class="form-input"
                  [class.border-red-300]="isFieldInvalid('bio')"
                  placeholder="Enter user bio">
                </textarea>
                <div *ngIf="isFieldInvalid('bio')" class="form-error">
                  <span *ngIf="userForm.get('bio')?.errors?.['maxlength']">Bio must not exceed 500 characters</span>
                </div>
              </div>

              <!-- Avatar URL -->
              <div class="form-group">
                <label class="form-label">Avatar URL</label>
                <input 
                  type="url" 
                  formControlName="avatarUrl"
                  class="form-input"
                  [class.border-red-300]="isFieldInvalid('avatarUrl')"
                  placeholder="Enter avatar image URL"
                />
                <div *ngIf="isFieldInvalid('avatarUrl')" class="form-error">
                  <span *ngIf="userForm.get('avatarUrl')?.errors?.['maxlength']">Avatar URL must not exceed 255 characters</span>
                </div>
              </div>

              <!-- Active Status (only for edit) -->
              <div *ngIf="isEditMode" class="form-group">
                <label class="flex items-center">
                  <input 
                    type="checkbox" 
                    formControlName="isActive"
                    class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                  <span class="ml-2 text-sm text-gray-700">User is active</span>
                </label>
              </div>
            </div>

            <!-- Error Message -->
            <div *ngIf="error()" class="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <div class="flex">
                <div class="flex-shrink-0">
                  <svg class="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
                  </svg>
                </div>
                <div class="ml-3">
                  <h3 class="text-sm font-medium text-red-800">Error</h3>
                  <div class="mt-2 text-sm text-red-700">
                    {{ error() }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Form Actions -->
            <div class="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
              <button type="button" (click)="close()" class="btn-secondary">
                Cancel
              </button>
              <button 
                type="submit" 
                [disabled]="userForm.invalid || loading()"
                class="btn-primary"
                [class.opacity-50]="userForm.invalid || loading()">
                <span *ngIf="loading()" class="inline-flex items-center">
                  <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
                <span *ngIf="!loading()">
                  {{ isEditMode ? 'Update User' : 'Create User' }}
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class UserModalComponent implements OnInit {
  @Input() isOpen = false;
  @Input() user: UserProfile | null = null;
  @Output() closeModal = new EventEmitter<void>();
  @Output() userSaved = new EventEmitter<UserProfile>();

  userForm!: FormGroup;
  loading = signal(false);
  error = signal('');

  constructor(
    private fb: FormBuilder,
    private userApiService: UserApiService
  ) {}

  ngOnInit() {
    this.initializeForm();
  }

  get isEditMode(): boolean {
    return !!this.user;
  }

  initializeForm() {
    this.userForm = this.fb.group({
      userId: [
        { value: this.user?.userId || '', disabled: this.isEditMode }, 
        this.isEditMode ? [] : [Validators.required, Validators.minLength(3)]
      ],
      firstName: [this.user?.firstName || '', [Validators.required, Validators.maxLength(50)]],
      lastName: [this.user?.lastName || '', [Validators.required, Validators.maxLength(50)]],
      email: [this.user?.email || '', [Validators.required, Validators.email]],
      phone: [this.user?.phone || '', [Validators.maxLength(20)]],
      bio: [this.user?.bio || '', [Validators.maxLength(500)]],
      avatarUrl: [this.user?.avatarUrl || '', [Validators.maxLength(255)]],
      isActive: [this.user?.isActive !== undefined ? this.user.isActive : true]
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.userForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  onSubmit() {
    if (this.userForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.loading.set(true);
    this.error.set('');

    const formValue = this.userForm.value;
    const userData: any = {
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      email: formValue.email,
      phone: formValue.phone || null,
      bio: formValue.bio || null,
      avatarUrl: formValue.avatarUrl || null,
      isActive: formValue.isActive
    };

    if (!this.isEditMode) {
      userData.userId = formValue.userId;
    }

    const apiCall = this.isEditMode && this.user?.id
      ? this.userApiService.updateUser(this.user.id, userData)
      : this.userApiService.createUser(userData);

    apiCall.subscribe({
      next: (user) => {
        this.loading.set(false);
        this.userSaved.emit(user);
        this.close();
      },
      error: (error) => {
        this.loading.set(false);
        console.error('Error saving user:', error);
        
        if (error.error?.error) {
          this.error.set(error.error.error);
        } else {
          this.error.set('An error occurred while saving the user. Please try again.');
        }
      }
    });
  }

  close() {
    this.error.set('');
    this.userForm.reset();
    this.closeModal.emit();
  }

  private markFormGroupTouched() {
    Object.keys(this.userForm.controls).forEach(key => {
      const control = this.userForm.get(key);
      control?.markAsTouched();
    });
  }
}