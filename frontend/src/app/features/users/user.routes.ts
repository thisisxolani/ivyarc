import { Routes } from '@angular/router';

export const USER_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./user-list/user-list.component').then(c => c.UserListComponent),
    title: 'Users'
  },
  {
    path: 'create',
    loadComponent: () => import('./user-create/user-create.component').then(c => c.UserCreateComponent),
    title: 'Create User'
  },
  {
    path: ':id',
    loadComponent: () => import('./user-detail/user-detail.component').then(c => c.UserDetailComponent),
    title: 'User Details'
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./user-edit/user-edit.component').then(c => c.UserEditComponent),
    title: 'Edit User'
  }
];