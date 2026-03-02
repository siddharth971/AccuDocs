import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  {
    path: 'upload/:token',
    loadComponent: () => import('./features/public-upload/public-upload.component').then(m => m.PublicUploadComponent),
  },
  {
    path: '',
    loadComponent: () => import('./layout/app-shell/app-shell.component').then(m => m.AppShellComponent),
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      // All Modules Registry Page
      {
        path: 'modules',
        loadComponent: () => import('./layout/all-modules/all-modules.component').then(m => m.AllModulesComponent),
      },
      // Coming Soon Page
      {
        path: 'coming-soon',
        loadComponent: () => import('./layout/coming-soon/coming-soon.component').then(m => m.ComingSoonComponent),
      },
      // Hub Overview Page (e.g., /hub/compliance, /hub/work)
      {
        path: 'hub/:id',
        loadComponent: () => import('./layout/hub-overview/hub-overview.component').then(m => m.HubOverviewComponent),
      },

      // ==================
      // MODULE ROUTES
      // ==================

      // CORE
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'search',
        redirectTo: '/dashboard',
      },

      // COMPLIANCE
      {
        path: 'compliance',
        children: [
          {
            path: '',
            loadComponent: () => import('./layout/hub-overview/hub-overview.component').then(m => m.HubOverviewComponent),
          },
          {
            path: 'calendar',
            loadComponent: () => import('./features/compliance-calendar/compliance-calendar.component').then(m => m.ComplianceCalendarComponent),
            canActivate: [roleGuard],
            data: { roles: ['admin'] },
          },
          {
            path: 'checklists',
            loadComponent: () => import('./features/checklists/checklists-overview.component').then(m => m.ChecklistsOverviewComponent),
            canActivate: [roleGuard],
            data: { roles: ['admin'] },
          },
        ],
      },

      // WORK
      {
        path: 'work',
        children: [
          {
            path: '',
            loadComponent: () => import('./layout/hub-overview/hub-overview.component').then(m => m.HubOverviewComponent),
          },
          {
            path: 'tasks',
            loadChildren: () => import('./features/tasks/tasks.routes').then((m) => m.TASKS_ROUTES),
          },
        ],
      },

      // CLIENTS
      {
        path: 'clients',
        children: [
          {
            path: '',
            loadComponent: () => import('./layout/hub-overview/hub-overview.component').then(m => m.HubOverviewComponent),
          },
          // Specific client and staff routes must come before :id
          {
            path: 'client',
            loadChildren: () => import('./features/clients/clients.routes').then((m) => m.CLIENTS_ROUTES),
            canActivate: [roleGuard],
            data: { roles: ['admin'] },
          },
          {
            path: 'staff',
            loadChildren: () => import('./features/staff/staff.routes').then((m) => m.STAFF_ROUTES),
            canActivate: [roleGuard],
            data: { roles: ['admin'] },
          },
        ],
      },

      // FIRM
      {
        path: 'firm',
        children: [
          {
            path: '',
            loadComponent: () => import('./layout/hub-overview/hub-overview.component').then(m => m.HubOverviewComponent),
          },
          {
            path: 'staff',
            loadChildren: () => import('./features/staff/staff.routes').then((m) => m.STAFF_ROUTES),
            canActivate: [roleGuard],
            data: { roles: ['admin'] },
          },
        ],
      },

      // SETTINGS
      {
        path: 'settings',
        children: [
          {
            path: '',
            loadComponent: () => import('./layout/hub-overview/hub-overview.component').then(m => m.HubOverviewComponent),
          },
          {
            path: 'whatsapp',
            loadComponent: () => import('./features/admin/whatsapp-console/whatsapp-console.component').then(m => m.WhatsAppConsoleComponent),
            canActivate: [roleGuard],
            data: { roles: ['admin'] },
          },
        ],
      },

      // Catch-all for unmatched routes within authenticated area
      {
        path: 'documents',
        loadChildren: () => import('./features/documents/documents.routes').then((m) => m.DOCUMENTS_ROUTES),
      },
      {
        path: 'logs',
        loadComponent: () => import('./features/logs/logs.component').then((m) => m.LogsComponent),
        canActivate: [roleGuard],
        data: { roles: ['admin'] },
      },
      {
        path: 'workspace',
        loadChildren: () => import('./features/workspace/workspace.routes').then((m) => m.WORKSPACE_ROUTES),
      },
      {
        path: 'demo',
        loadComponent: () => import('./features/demo/demo.component').then(m => m.DemoComponent),
      },
      // BILLING AND INVOICING
      {
        path: 'billing',
        loadChildren: () => import('./features/billing/billing.routes').then((m) => m.BILLING_ROUTES),
      }
    ]
  },
  {
    path: '**',
    loadComponent: () => import('./shared/components/not-found/not-found.component').then((m) => m.NotFoundComponent),
  },
];
