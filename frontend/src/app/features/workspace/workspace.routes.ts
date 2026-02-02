import { Routes } from '@angular/router';

export const WORKSPACE_ROUTES: Routes = [
  {
    path: ':clientId',
    loadComponent: () => import('./client-workspace/client-workspace.component').then((m) => m.ClientWorkspaceComponent),
  },
];
