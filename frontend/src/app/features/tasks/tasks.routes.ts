import { Routes } from '@angular/router';

export const TASKS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./kanban-board/kanban-board.component').then(m => m.KanbanBoardComponent),
  },
  {
    path: 'list',
    loadComponent: () => import('./task-list/task-list.component').then(m => m.TaskListComponent),
  },
];
