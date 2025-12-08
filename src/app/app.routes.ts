import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./components/login/login').then(m => m.LoginComponent)
  },
  {
    path: 'tasks',
    loadComponent: () => import('./components/task-list/task-list').then(m => m.TaskListComponent),
    canActivate: [authGuard]
  }
];