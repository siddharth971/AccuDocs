import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/role.guard';

export const BILLING_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'invoices',
    pathMatch: 'full'
  },
  {
    path: 'invoices',
    loadComponent: () => import('./components/invoice-list/invoice-list.component').then(m => m.InvoiceListComponent),
    canActivate: [roleGuard],
    data: { roles: ['admin', 'finance_manager', 'invoicing_officer'] }
  },
  {
    path: 'recurring',
    loadComponent: () => import('./components/recurring-list/recurring-list.component').then(m => m.RecurringListComponent),
    canActivate: [roleGuard],
    data: { roles: ['admin', 'finance_manager'] }
  }
];
