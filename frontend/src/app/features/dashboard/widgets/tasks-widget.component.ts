import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TaskService } from '@core/services/task.service';
import { NotificationService } from '@core/services/notification.service';
import { Task, TaskStats } from '@app/models/task.model';

@Component({
  selector: 'app-tasks-widget',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="bg-white dark:bg-slate-800 rounded-lg border border-border-color p-6 shadow-sm">
      <!-- Header -->
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-bold text-text-primary">Tasks</h2>
        <a routerLink="/tasks" class="btn-secondary">
          <mat-icon class="text-lg">arrow_forward</mat-icon>
        </a>
      </div>

      @if (isLoading()) {
        <div class="flex items-center justify-center py-8">
          <mat-spinner diameter="30"></mat-spinner>
        </div>
      } @else if (stats()) {
        <!-- Statistics -->
        <div class="space-y-4 mb-6">
          <!-- Due Today -->
          <div class="flex items-center justify-between p-3 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-900/30">
            <div class="flex items-center gap-2">
              <div class="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <mat-icon class="text-blue-600 dark:text-blue-400">calendar_today</mat-icon>
              </div>
              <div>
                <p class="text-xs text-text-secondary">Due Today</p>
                <p class="text-lg font-bold text-blue-600 dark:text-blue-400">{{ stats()?.dueTodayCount || 0 }}</p>
              </div>
            </div>
          </div>

          <!-- Overdue -->
          <div class="flex items-center justify-between p-3 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30">
            <div class="flex items-center gap-2">
              <div class="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <mat-icon class="text-red-600 dark:text-red-400">warning</mat-icon>
              </div>
              <div>
                <p class="text-xs text-text-secondary">Overdue</p>
                <p class="text-lg font-bold text-red-600 dark:text-red-400">{{ stats()?.overdueCount || 0 }}</p>
              </div>
            </div>
          </div>

          <!-- Total Tasks -->
          <div class="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-700/30 border border-slate-200 dark:border-slate-600">
            <div class="flex items-center gap-2">
              <div class="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-600 flex items-center justify-center">
                <mat-icon class="text-slate-600 dark:text-slate-300">check_circle_outline</mat-icon>
              </div>
              <div>
                <p class="text-xs text-text-secondary">Total Tasks</p>
                <p class="text-lg font-bold text-text-primary">{{ stats()?.totalTasks || 0 }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Task Status Breakdown -->
        <div class="space-y-2">
          <p class="text-xs font-semibold text-text-secondary mb-2">STATUS BREAKDOWN</p>
          <div class="flex items-center gap-2">
            <div class="flex-1">
              <div class="flex items-center justify-between mb-1">
                <span class="text-xs text-text-secondary">To Do</span>
                <span class="text-xs font-semibold text-text-primary">{{ getStatusCount('todo') }}</span>
              </div>
              <div class="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                <div
                  class="h-full bg-slate-400 dark:bg-slate-500"
                  [style.width.%]="getStatusPercentage('todo')"
                ></div>
              </div>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <div class="flex-1">
              <div class="flex items-center justify-between mb-1">
                <span class="text-xs text-text-secondary">In Progress</span>
                <span class="text-xs font-semibold text-text-primary">{{ getStatusCount('in-progress') }}</span>
              </div>
              <div class="w-full h-2 rounded-full bg-blue-200 dark:bg-blue-900/30 overflow-hidden">
                <div
                  class="h-full bg-blue-500"
                  [style.width.%]="getStatusPercentage('in-progress')"
                ></div>
              </div>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <div class="flex-1">
              <div class="flex items-center justify-between mb-1">
                <span class="text-xs text-text-secondary">In Review</span>
                <span class="text-xs font-semibold text-text-primary">{{ getStatusCount('review') }}</span>
              </div>
              <div class="w-full h-2 rounded-full bg-yellow-200 dark:bg-yellow-900/30 overflow-hidden">
                <div
                  class="h-full bg-yellow-500"
                  [style.width.%]="getStatusPercentage('review')"
                ></div>
              </div>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <div class="flex-1">
              <div class="flex items-center justify-between mb-1">
                <span class="text-xs text-text-secondary">Done</span>
                <span class="text-xs font-semibold text-text-primary">{{ getStatusCount('done') }}</span>
              </div>
              <div class="w-full h-2 rounded-full bg-green-200 dark:bg-green-900/30 overflow-hidden">
                <div
                  class="h-full bg-green-500"
                  [style.width.%]="getStatusPercentage('done')"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <!-- View All Button -->
        <button class="w-full mt-4 btn-secondary-outline">
          <a routerLink="/tasks" class="flex items-center justify-center gap-2 w-full">
            View All Tasks
            <mat-icon class="text-sm">arrow_forward</mat-icon>
          </a>
        </button>
      }
    </div>
  `,
})
export class TasksWidgetComponent implements OnInit {
  private taskService = inject(TaskService);
  private notificationService = inject(NotificationService);

  isLoading = signal(false);
  stats = signal<TaskStats | null>(null);

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.isLoading.set(true);
    this.taskService.getTaskStats().subscribe({
      next: (stats) => {
        this.stats.set(stats);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Failed to load task stats', error);
        this.isLoading.set(false);
      },
    });
  }

  getStatusPercentage(status: string): number {
    const stat = this.stats();
    if (!stat || !stat.byStatus || stat.totalTasks === 0) return 0;

    const count = stat.byStatus[status as keyof typeof stat.byStatus] || 0;
    return (count / stat.totalTasks) * 100;
  }

  getStatusCount(status: string): number {
    const stat = this.stats();
    if (!stat || !stat.byStatus) return 0;
    return stat.byStatus[status as keyof typeof stat.byStatus] || 0;
  }
}
