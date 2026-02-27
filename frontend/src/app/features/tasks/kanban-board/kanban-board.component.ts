import { Component, OnInit, inject, signal, computed, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatSelectModule } from '@angular/material/select';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TaskService } from '@core/services/task.service';
import { NotificationService } from '@core/services/notification.service';
import { LoadingService } from '@core/services/loading.service';
import { Task, TaskStatus, PaginatedResponse } from '@app/models/task.model';
import { TaskFormComponent } from '../task-form/task-form.component';

@Component({
  selector: 'app-kanban-board',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule,
    FormsModule,
    DragDropModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatChipsModule,
    MatSelectModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    TaskFormComponent,
  ],
  template: `
    <div class="w-full h-full flex flex-col gap-4 p-6">
      <!-- Header -->
      <div class="flex items-center justify-between gap-4">
        <div>
          <h1 class="text-3xl font-bold text-text-primary">Tasks</h1>
          <p class="text-text-secondary mt-1">Organize your work with drag and drop</p>
        </div>
        <button class="btn-primary" (click)="openCreateForm()">
          <mat-icon>add</mat-icon>
          Add Task
        </button>
      </div>

      <!-- Kanban Board -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 flex-1">
        @for (status of statuses; track status) {
          <div class="bg-slate-50 dark:bg-slate-900/30 rounded-lg border border-border-color overflow-hidden flex flex-col">
            <!-- Column Header -->
            <div class="px-4 py-3 border-b border-border-color bg-white dark:bg-slate-800 flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span [class]="getStatusBadgeClass(status)" class="px-2.5 py-1 rounded text-xs font-semibold">
                  {{ statusLabels[status] }}
                </span>
                <span class="text-sm font-medium text-text-secondary">
                  {{ getTaskCountByStatus(status) }}
                </span>
              </div>
              <button 
                [matMenuTriggerFor]="columnMenu"
                class="btn-icon-sm opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <mat-icon>more_vert</mat-icon>
              </button>
              <mat-menu #columnMenu="matMenu">
                <button mat-menu-item (click)="openCreateFormWithStatus(status)">
                  <mat-icon>add</mat-icon>
                  <span>Add Task</span>
                </button>
              </mat-menu>
            </div>

            <!-- Tasks Droppable Zone -->
            <div
              cdkDropList
              [id]="status"
              [cdkDropListData]="getTasksByStatus(status)"
              [cdkDropListSortingDisabled]="false"
              cdkDropListConnectedTo="['todo', 'in-progress', 'review', 'done']"
              class="flex-1 p-3 space-y-3 overflow-y-auto"
              (cdkDropListDropped)="onTaskDrop($event, status)"
            >
              @for (task of getTasksByStatus(status); track task.id) {
                <div
                  cdkDrag
                  [cdkDragData]="task"
                  class="bg-white dark:bg-slate-800 rounded-lg border border-border-color p-3 cursor-grabbing shadow-sm hover:shadow-md transition-all"
                >
                  <!-- Priority Badge -->
                  <div class="flex items-start justify-between gap-2 mb-2">
                    <div class="flex items-center gap-1">
                      <span [class]="getPriorityBadgeClass(task.priority)" class="w-2 h-2 rounded-full"></span>
                      <span [class]="getPriorityTextClass(task.priority)" class="text-xs font-semibold">
                        {{ task.priority | titlecase }}
                      </span>
                    </div>
                    <button
                      [matMenuTriggerFor]="taskMenu"
                      class="btn-icon-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <mat-icon class="text-sm">more_vert</mat-icon>
                    </button>
                    <mat-menu #taskMenu="matMenu" class="bg-white dark:bg-slate-800">
                      <button mat-menu-item (click)="editTask(task)">
                        <mat-icon>edit</mat-icon>
                        <span>Edit</span>
                      </button>
                      <button mat-menu-item (click)="deleteTask(task.id)">
                        <mat-icon>delete</mat-icon>
                        <span>Delete</span>
                      </button>
                    </mat-menu>
                  </div>

                  <!-- Title -->
                  <h3 class="font-semibold text-sm text-text-primary mb-2 line-clamp-2">
                    {{ task.title }}
                  </h3>

                  <!-- Client & Assignee -->
                  <div class="space-y-1 mb-3 text-xs">
                    @if (task.client) {
                      <div class="flex items-center gap-1 text-text-secondary">
                        <mat-icon class="text-xs">business</mat-icon>
                        <span>{{ task.client.name }}</span>
                      </div>
                    }
                    @if (task.assignee) {
                      <div class="flex items-center gap-1 text-text-secondary">
                        <mat-icon class="text-xs">person</mat-icon>
                        <span>{{ task.assignee.name }}</span>
                      </div>
                    }
                  </div>

                  <!-- Due Date -->
                  @if (task.dueDate) {
                    <div
                      [class]="isDueDateOverdue(task.dueDate) && task.status !== 'done'
                        ? 'text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10'
                        : 'text-text-secondary border-border-color bg-slate-50 dark:bg-slate-700/30'"
                      class="flex items-center gap-1 px-2 py-1 rounded border text-xs"
                    >
                      <mat-icon class="text-xs">calendar_today</mat-icon>
                      <span>{{ formatDate(task.dueDate) }}</span>
                    </div>
                  }

                  <!-- Tags -->
                  @if (task.tags && task.tags.length > 0) {
                    <div class="flex flex-wrap gap-1 mt-2">
                      @for (tag of task.tags; track tag) {
                        <span class="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-text-secondary text-xs rounded">
                          {{ tag }}
                        </span>
                      }
                    </div>
                  }
                </div>
              }

              @if (!getTasksByStatus(status) || getTasksByStatus(status).length === 0) {
                <div class="flex items-center justify-center py-12 text-text-secondary">
                  <p class="text-sm">No tasks</p>
                </div>
              }
            </div>

            <!-- Quick Add Button -->
            <div class="px-3 py-2 border-t border-border-color bg-white dark:bg-slate-800">
              <button
                class="w-full flex items-center justify-center gap-2 py-2 text-text-secondary hover:text-text-primary transition-colors text-sm"
                (click)="openCreateFormWithStatus(status)"
              >
                <mat-icon class="text-lg">add</mat-icon>
                <span>Add task</span>
              </button>
            </div>
          </div>
        }
      </div>
    </div>

    <!-- Task Form Modal -->
    <app-task-form
      [visible]="showTaskForm()"
      [initialTask]="selectedTask()"
      [clientId]="selectedClientId()"
      [initialStatus]="selectedStatus()"
      (visibleChange)="onTaskFormVisibilityChange($event)"
      (onSave)="handleTaskSave()"
    ></app-task-form>
  `,
  styles: [`
    :host {
      display: flex;
      height: 100%;
    }
  `],
})
export class KanbanBoardComponent implements OnInit {
  private taskService = inject(TaskService);
  private notificationService = inject(NotificationService);
  private loadingService = inject(LoadingService);

  isLoading = signal(false);
  showTaskForm = signal(false);
  selectedTask = signal<Task | null>(null);
  selectedClientId = signal<string | null>(null);
  selectedStatus = signal<TaskStatus>('todo');

  tasks = signal<Task[]>([]);
  statuses: TaskStatus[] = ['todo', 'in-progress', 'review', 'done'];

  statusLabels: Record<TaskStatus, string> = {
    'todo': 'To Do',
    'in-progress': 'In Progress',
    'review': 'In Review',
    'done': 'Done',
  };

  tasksByStatus = computed(() => {
    const result: Record<TaskStatus, Task[]> = {
      'todo': [],
      'in-progress': [],
      'review': [],
      'done': [],
    };

    this.tasks().forEach((task) => {
      result[task.status].push(task);
    });

    return result;
  });

  ngOnInit(): void {
    this.loadTasks();
  }

  getTasksByStatus(status: TaskStatus): Task[] {
    return this.tasksByStatus()[status] || [];
  }

  onTaskFormVisibilityChange(visible: any): void {
    this.showTaskForm.set(visible === true || visible === 'true');
  }

  loadTasks(): void {
    this.isLoading.set(true);
    this.taskService.getTasks(1, 1000).subscribe({
      next: (response: PaginatedResponse<Task>) => {
        this.tasks.set(response.data);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Failed to load tasks', error);
        this.notificationService.error('Failed to load tasks');
        this.isLoading.set(false);
      },
    });
  }

  openCreateForm(): void {
    this.selectedTask.set(null);
    this.selectedClientId.set(null);
    this.selectedStatus.set('todo');
    this.showTaskForm.set(true);
  }

  openCreateFormWithStatus(status: TaskStatus): void {
    this.selectedTask.set(null);
    this.selectedClientId.set(null);
    this.selectedStatus.set(status);
    this.showTaskForm.set(true);
  }

  editTask(task: Task): void {
    this.selectedTask.set(task);
    this.selectedClientId.set(task.clientId || null);
    this.selectedStatus.set(task.status);
    this.showTaskForm.set(true);
  }

  deleteTask(taskId: string): void {
    if (confirm('Are you sure you want to delete this task?')) {
      this.taskService.deleteTask(taskId).subscribe({
        next: () => {
          this.notificationService.success('Task deleted successfully');
          this.loadTasks();
        },
        error: (error) => {
          console.error('Failed to delete task', error);
          this.notificationService.error('Failed to delete task');
        },
      });
    }
  }

  handleTaskSave(): void {
    this.loadTasks();
  }

  onTaskDrop(event: CdkDragDrop<Task[]>, newStatus: TaskStatus): void {
    const task = event.item.data;

    if (task.status !== newStatus) {
      this.taskService.updateTaskStatus(task.id, newStatus).subscribe({
        next: (updatedTask) => {
          this.notificationService.success(`Task moved to ${this.statusLabels[newStatus]}`);
          this.loadTasks();
        },
        error: (error) => {
          console.error('Failed to update task status', error);
          this.notificationService.error('Failed to update task status');
          this.loadTasks();
        },
      });
    }
  }

  getTaskCountByStatus(status: TaskStatus): number {
    return this.tasksByStatus()[status]?.length || 0;
  }

  getStatusBadgeClass(status: TaskStatus): string {
    const classes: Record<TaskStatus, string> = {
      'todo': 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300',
      'in-progress': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
      'review': 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
      'done': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
    };
    return classes[status];
  }

  getPriorityBadgeClass(priority: string): string {
    const classes: Record<string, string> = {
      'high': 'bg-red-500',
      'medium': 'bg-yellow-500',
      'low': 'bg-green-500',
    };
    return classes[priority] || 'bg-slate-500';
  }

  getPriorityTextClass(priority: string): string {
    const classes: Record<string, string> = {
      'high': 'text-red-700 dark:text-red-400',
      'medium': 'text-yellow-700 dark:text-yellow-400',
      'low': 'text-green-700 dark:text-green-400',
    };
    return classes[priority] || 'text-text-secondary';
  }

  isDueDateOverdue(dueDate: string | Date): boolean {
    const due = new Date(dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return due < today;
  }

  formatDate(date: string | Date): string {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
}
