import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
    canActivate: [authGuard],
  },
  {
    path: 'clients',
    loadChildren: () => import('./features/clients/clients.routes').then((m) => m.CLIENTS_ROUTES),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['admin'] },
  },
  {
    path: 'documents',
    loadChildren: () => import('./features/documents/documents.routes').then((m) => m.DOCUMENTS_ROUTES),
    canActivate: [authGuard],
  },
  {
    path: 'logs',
    loadComponent: () => import('./features/logs/logs.component').then((m) => m.LogsComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['admin'] },
  },
  {
    path: '**',
    loadComponent: () => import('./shared/components/not-found/not-found.component').then((m) => m.NotFoundComponent),
  },
];
