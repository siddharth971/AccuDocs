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
          {
            path: 'deadlines',
            redirectTo: '/hub/compliance',
          },
          {
            path: 'notices',
            redirectTo: '/coming-soon?module=notices',
          },
          {
            path: 'ais',
            redirectTo: '/coming-soon?module=ais',
          },
          {
            path: 'udin',
            redirectTo: '/coming-soon?module=udin',
          },
          {
            path: 'dsc',
            redirectTo: '/coming-soon?module=dsc',
          },
          {
            path: 'engagement',
            redirectTo: '/coming-soon?module=engagement',
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
          {
            path: 'time',
            redirectTo: '/coming-soon?module=timetracking',
          },
          {
            path: 'workload',
            redirectTo: '/coming-soon?module=workload',
          },
          {
            path: 'templates',
            redirectTo: '/coming-soon?module=task_templates',
          },
          {
            path: 'knowledge',
            redirectTo: '/coming-soon?module=knowledge',
          },
        ],
      },

      // BILLING
      {
        path: 'billing',
        children: [
          {
            path: '',
            loadComponent: () => import('./layout/hub-overview/hub-overview.component').then(m => m.HubOverviewComponent),
          },
          {
            path: 'invoices',
            redirectTo: '/coming-soon?module=invoices',
          },
          {
            path: 'payments',
            redirectTo: '/coming-soon?module=payments',
          },
          {
            path: 'expenses',
            redirectTo: '/coming-soon?module=expenses',
          },
          {
            path: 'catalog',
            redirectTo: '/coming-soon?module=service_catalog',
          },
          {
            path: 'credit-notes',
            redirectTo: '/coming-soon?module=credit_notes',
          },
          {
            path: 'fee-optimizer',
            redirectTo: '/coming-soon?module=fee_optimizer',
          },
          {
            path: 'retainers',
            redirectTo: '/coming-soon?module=retainers',
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
            loadComponent: () => import('./layout/hub-overview/hub-overview.component').then(m => m.HubOverviewComponent),
          },
          {
            path: 'staff',
            loadComponent: () => import('./layout/hub-overview/hub-overview.component').then(m => m.HubOverviewComponent),
          },
          // Module-specific routes
          {
            path: 'notes',
            redirectTo: '/coming-soon?module=client_notes',
          },
          {
            path: 'onboarding',
            redirectTo: '/coming-soon?module=onboarding',
          },
          {
            path: 'risk',
            redirectTo: '/coming-soon?module=risk',
          },
          {
            path: 'churn',
            redirectTo: '/coming-soon?module=churn',
          },
          {
            path: 'referrals',
            redirectTo: '/coming-soon?module=referrals',
          },
          {
            path: 'ltv',
            redirectTo: '/coming-soon?module=ltv',
          },
          {
            path: 'fingerprint',
            redirectTo: '/coming-soon?module=fingerprint',
          },
          {
            path: 'reminders',
            redirectTo: '/coming-soon?module=reminders',
          },
          {
            path: 'broadcast',
            redirectTo: '/coming-soon?module=broadcast',
          },
          // Generic client ID route (must come last)
          {
            path: ':id',
            loadChildren: () => import('./features/clients/clients.routes').then((m) => m.CLIENTS_ROUTES),
            canActivate: [roleGuard],
            data: { roles: ['admin'] },
          },
        ],
      },

      // ANALYTICS
      {
        path: 'analytics',
        children: [
          {
            path: '',
            loadComponent: () => import('./layout/hub-overview/hub-overview.component').then(m => m.HubOverviewComponent),
          },
          {
            path: 'reports',
            redirectTo: '/coming-soon?module=reports',
          },
          {
            path: 'valuation',
            redirectTo: '/coming-soon?module=practice_value',
          },
          {
            path: 'tax-savings',
            redirectTo: '/coming-soon?module=tax_savings',
          },
          {
            path: 'budget',
            redirectTo: '/coming-soon?module=budget',
          },
          {
            path: 'gst-recon',
            redirectTo: '/coming-soon?module=gst_recon',
          },
          {
            path: 'capital-gains',
            redirectTo: '/coming-soon?module=capital_gains',
          },
          {
            path: 'advance-tax',
            redirectTo: '/coming-soon?module=advance_tax',
          },
        ],
      },

      // SPECIALIST
      {
        path: 'specialist',
        children: [
          {
            path: '',
            loadComponent: () => import('./layout/hub-overview/hub-overview.component').then(m => m.HubOverviewComponent),
          },
          {
            path: 'nri',
            redirectTo: '/coming-soon?module=nri',
          },
          {
            path: 'payroll',
            redirectTo: '/coming-soon?module=payroll',
          },
          {
            path: 'company-sec',
            redirectTo: '/coming-soon?module=company_sec',
          },
          {
            path: 'loans',
            redirectTo: '/coming-soon?module=loans',
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
          {
            path: 'attendance',
            redirectTo: '/coming-soon?module=attendance',
          },
          {
            path: 'leaves',
            redirectTo: '/coming-soon?module=leaves',
          },
          {
            path: 'partners',
            redirectTo: '/coming-soon?module=partners',
          },
          {
            path: 'handover',
            redirectTo: '/coming-soon?module=handover',
          },
          {
            path: 'watermark',
            redirectTo: '/coming-soon?module=watermark',
          },
          {
            path: 'audit-log',
            redirectTo: '/coming-soon?module=audit_log',
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
            path: 'firm',
            redirectTo: '/coming-soon?module=firm_settings',
          },
          {
            path: 'whatsapp',
            loadComponent: () => import('./features/admin/whatsapp-console/whatsapp-console.component').then(m => m.WhatsAppConsoleComponent),
            canActivate: [roleGuard],
            data: { roles: ['admin'] },
          },
          {
            path: 'storage',
            redirectTo: '/coming-soon?module=storage',
          },
          {
            path: 'roles',
            redirectTo: '/coming-soon?module=roles',
          },
          {
            path: 'subscription',
            redirectTo: '/coming-soon?module=subscription',
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
    ]
  },
  {
    path: '**',
    loadComponent: () => import('./shared/components/not-found/not-found.component').then((m) => m.NotFoundComponent),
  },
];
