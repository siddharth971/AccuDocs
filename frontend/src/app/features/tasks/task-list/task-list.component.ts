import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TaskService } from '@core/services/task.service';
import { NotificationService } from '@core/services/notification.service';
import { Task, TaskStatus, PaginatedResponse } from '@app/models/task.model';
import { TaskFormComponent } from '../task-form/task-form.component';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatMenuModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    TaskFormComponent,
  ],
  template: `
    <div class="w-full flex flex-col gap-4 p-6">
      <!-- Header -->
      <div class="flex items-center justify-between gap-4">
        <div>
          <h1 class="text-3xl font-bold text-text-primary">Tasks</h1>
          <p class="text-text-secondary mt-1">View and manage all tasks</p>
        </div>
        <button class="btn-primary" (click)="openCreateForm()">
          <mat-icon>add</mat-icon>
          Add Task
        </button>
      </div>

      <!-- Filters -->
      <div class="bg-white dark:bg-slate-800 rounded-lg border border-border-color p-4 space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <!-- Search -->
          <mat-form-field class="w-full" appearance="outline">
            <mat-label>Search</mat-label>
            <input
              matInput
              [(ngModel)]="searchTerm"
              (ngModelChange)="resetPagination()"
              placeholder="Search by title..."
            />
            <mat-icon matSuffix>search</mat-icon>
          </mat-form-field>

          <!-- Status Filter -->
          <mat-form-field class="w-full" appearance="outline">
            <mat-label>Status</mat-label>
            <mat-select [(value)]="statusFilter" (valueChange)="resetPagination()">
              <mat-option value="">All Statuses</mat-option>
              <mat-option value="todo">To Do</mat-option>
              <mat-option value="in-progress">In Progress</mat-option>
              <mat-option value="review">In Review</mat-option>
              <mat-option value="done">Done</mat-option>
            </mat-select>
          </mat-form-field>

          <!-- Priority Filter -->
          <mat-form-field class="w-full" appearance="outline">
            <mat-label>Priority</mat-label>
            <mat-select [(value)]="priorityFilter" (valueChange)="resetPagination()">
              <mat-option value="">All Priorities</mat-option>
              <mat-option value="high">High</mat-option>
              <mat-option value="medium">Medium</mat-option>
              <mat-option value="low">Low</mat-option>
            </mat-select>
          </mat-form-field>

          <!-- Sort By -->
          <mat-form-field class="w-full" appearance="outline">
            <mat-label>Sort By</mat-label>
            <mat-select [(value)]="sortBy" (valueChange)="resetPagination()">
              <mat-option value="createdAt">Created Date</mat-option>
              <mat-option value="dueDate">Due Date</mat-option>
              <mat-option value="priority">Priority</mat-option>
              <mat-option value="title">Title</mat-option>
            </mat-select>
          </mat-form-field>

          <!-- Sort Order -->
          <mat-form-field class="w-full" appearance="outline">
            <mat-label>Order</mat-label>
            <mat-select [(value)]="sortOrder" (valueChange)="resetPagination()">
              <mat-option value="desc">Newest First</mat-option>
              <mat-option value="asc">Oldest First</mat-option>
            </mat-select>
          </mat-form-field>
        </div>
      </div>

      <!-- Task Table -->
      <div class="bg-white dark:bg-slate-800 rounded-lg border border-border-color overflow-hidden">
        @if (isLoading()) {
          <div class="flex items-center justify-center py-20">
            <mat-spinner diameter="40"></mat-spinner>
          </div>
        } @else {
          <!-- Table -->
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="bg-slate-50 dark:bg-slate-900/50 border-b border-border-color">
                  <th class="px-6 py-3 text-left text-xs font-semibold text-text-secondary">Title</th>
                  <th class="px-6 py-3 text-left text-xs font-semibold text-text-secondary">Client</th>
                  <th class="px-6 py-3 text-left text-xs font-semibold text-text-secondary">Priority</th>
                  <th class="px-6 py-3 text-left text-xs font-semibold text-text-secondary">Status</th>
                  <th class="px-6 py-3 text-left text-xs font-semibold text-text-secondary">Due Date</th>
                  <th class="px-6 py-3 text-left text-xs font-semibold text-text-secondary">Assigned To</th>
                  <th class="px-6 py-3 text-left text-xs font-semibold text-text-secondary"></th>
                </tr>
              </thead>
              <tbody>
                @for (task of tasks(); track task.id) {
                  <tr class="border-b border-border-color hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                    <td class="px-6 py-4 text-sm text-text-primary font-medium">{{ task.title }}</td>
                    <td class="px-6 py-4 text-sm text-text-secondary">{{ task.client?.name || '-' }}</td>
                    <td class="px-6 py-4 text-sm">
                      <span [class]="getPriorityBadgeClass(task.priority)" class="px-3 py-1 rounded-full text-xs font-semibold">
                        {{ task.priority | titlecase }}
                      </span>
                    </td>
                    <td class="px-6 py-4 text-sm">
                      <span [class]="getStatusBadgeClass(task.status)" class="px-3 py-1 rounded-full text-xs font-semibold">
                        {{ getStatusLabel(task.status) }}
                      </span>
                    </td>
                    <td class="px-6 py-4 text-sm" [class]="isDueDateOverdue(task.dueDate) && task.status !== 'done' ? 'text-red-600 dark:text-red-400 font-semibold' : 'text-text-secondary'">
                      {{ task.dueDate ? (task.dueDate | date: 'MMM d, y') : '-' }}
                    </td>
                    <td class="px-6 py-4 text-sm text-text-secondary">{{ task.assignee?.name || '-' }}</td>
                    <td class="px-6 py-4 text-sm text-right">
                      <button
                        [matMenuTriggerFor]="menu"
                        class="btn-icon-sm"
                      >
                        <mat-icon>more_vert</mat-icon>
                      </button>
                      <mat-menu #menu="matMenu">
                        <button mat-menu-item (click)="editTask(task)">
                          <mat-icon>edit</mat-icon>
                          <span>Edit</span>
                        </button>
                        <button mat-menu-item (click)="deleteTask(task.id)">
                          <mat-icon>delete</mat-icon>
                          <span>Delete</span>
                        </button>
                      </mat-menu>
                    </td>
                  </tr>
                }

                @if (tasks().length === 0) {
                  <tr>
                    <td colspan="7" class="px-6 py-12 text-center text-text-secondary">
                      <div class="flex flex-col items-center justify-center">
                        <mat-icon class="text-4xl mb-2 opacity-50">folder_open</mat-icon>
                        <p class="font-medium">No tasks found</p>
                        <p class="text-sm">Try adjusting your filters or create a new task</p>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <mat-paginator
            [length]="totalTasks()"
            [pageSize]="pageSize"
            [pageSizeOptions]="[10, 25, 50, 100]"
            (page)="onPageChange($event)"
            class="border-t border-border-color"
          ></mat-paginator>
        }
      </div>
    </div>

    <!-- Task Form Modal -->
    <app-task-form
      [visible]="showTaskForm()" (visibleChange)="showTaskForm.set($event)"
      [initialTask]="selectedTask()"
      (onSave)="handleTaskSave()"
    ></app-task-form>
  `,
})
export class TaskListComponent implements OnInit {
  private taskService = inject(TaskService);
  private notificationService = inject(NotificationService);

  isLoading = signal(false);
  showTaskForm = signal(false);
  selectedTask = signal<Task | null>(null);

  tasks = signal<Task[]>([]);
  totalTasks = signal(0);

  searchTerm = '';
  statusFilter = '';
  priorityFilter = '';
  sortBy = 'createdAt';
  sortOrder: 'asc' | 'desc' = 'desc';

  pageSize = 10;
  currentPage = 0;

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    this.isLoading.set(true);

    const filters: any = {};
    if (this.searchTerm) filters.search = this.searchTerm;
    if (this.statusFilter) filters.status = this.statusFilter;
    if (this.priorityFilter) filters.priority = this.priorityFilter;

    this.taskService.getTasks(
      this.currentPage + 1,
      this.pageSize,
      filters,
      this.sortBy,
      this.sortOrder
    ).subscribe({
      next: (response: PaginatedResponse<Task>) => {
        this.tasks.set(response.data);
        this.totalTasks.set(response.meta.total);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Failed to load tasks', error);
        this.notificationService.error('Failed to load tasks');
        this.isLoading.set(false);
      },
    });
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadTasks();
  }

  resetPagination(): void {
    this.currentPage = 0;
    this.loadTasks();
  }

  openCreateForm(): void {
    this.selectedTask.set(null);
    this.showTaskForm.set(true);
  }

  editTask(task: Task): void {
    this.selectedTask.set(task);
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

  getStatusLabel(status: TaskStatus): string {
    const labels: Record<TaskStatus, string> = {
      'todo': 'To Do',
      'in-progress': 'In Progress',
      'review': 'In Review',
      'done': 'Done',
    };
    return labels[status];
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
      'high': 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
      'medium': 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
      'low': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
    };
    return classes[priority] || 'bg-slate-100 dark:bg-slate-700 text-text-secondary';
  }

  isDueDateOverdue(dueDate: string | Date | undefined): boolean {
    if (!dueDate) return false;
    const due = new Date(dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return due < today;
  }
}
