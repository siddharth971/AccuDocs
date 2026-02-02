import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { LogService, Log } from '@core/services/log.service';

@Component({
  selector: 'app-logs',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatCardModule, MatButtonModule, MatIconModule,
    MatTableModule, MatPaginatorModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatProgressSpinnerModule, MatChipsModule,
  ],
  template: `
    <div class="w-full space-y-6">
      <!-- Header -->
      <header>
        <h1 class="text-2xl font-bold text-text-primary">Activity Logs</h1>
        <p class="text-text-secondary mt-1">Monitor system activity and user actions.</p>
      </header>

      <!-- Content Card -->
      <div class="bg-white dark:bg-slate-800 rounded-xl border border-border-color shadow-sm overflow-hidden">
        <!-- Filters -->
        <div class="flex flex-wrap gap-4 p-4 border-b border-border-color bg-slate-50 dark:bg-slate-900/50">
          <mat-form-field appearance="outline" class="flex-1 min-w-[250px]">
            <mat-label>Search</mat-label>
            <input matInput [(ngModel)]="searchQuery" (ngModelChange)="onSearch()">
            <mat-icon matPrefix>search</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline" class="min-w-[180px]">
            <mat-label>Action</mat-label>
            <mat-select [(ngModel)]="selectedAction" (ngModelChange)="onSearch()">
              <mat-option value="">All</mat-option>
              @for (action of actions; track action) {
                <mat-option [value]="action">{{ logService.getActionLabel(action) }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
        </div>

        @if (isLoading()) {
          <div class="flex flex-col items-center justify-center py-20">
            <mat-spinner diameter="40"></mat-spinner>
            <p class="mt-4 text-text-secondary">Loading logs...</p>
          </div>
        } @else if (logs().length === 0) {
          <div class="flex flex-col items-center justify-center py-20 text-center">
            <mat-icon class="text-6xl text-text-muted mb-4">history</mat-icon>
            <h3 class="text-lg font-semibold text-text-primary mb-2">No logs found</h3>
            <p class="text-text-secondary">No activity has been recorded yet.</p>
          </div>
        } @else {
          <div class="overflow-x-auto">
            <table mat-table [dataSource]="logs()" class="w-full">
              <ng-container matColumnDef="action">
                <th mat-header-cell *matHeaderCellDef class="!bg-slate-50 dark:!bg-slate-800 font-semibold">Action</th>
                <td mat-cell *matCellDef="let log">
                  <mat-chip class="!text-xs">{{ logService.getActionLabel(log.action) }}</mat-chip>
                </td>
              </ng-container>

              <ng-container matColumnDef="description">
                <th mat-header-cell *matHeaderCellDef class="!bg-slate-50 dark:!bg-slate-800 font-semibold">Description</th>
                <td mat-cell *matCellDef="let log" class="text-text-secondary">{{ log.description }}</td>
              </ng-container>

              <ng-container matColumnDef="user">
                <th mat-header-cell *matHeaderCellDef class="!bg-slate-50 dark:!bg-slate-800 font-semibold">User</th>
                <td mat-cell *matCellDef="let log">{{ log.user?.name || 'System' }}</td>
              </ng-container>

              <ng-container matColumnDef="ip">
                <th mat-header-cell *matHeaderCellDef class="!bg-slate-50 dark:!bg-slate-800 font-semibold">IP</th>
                <td mat-cell *matCellDef="let log" class="text-text-muted font-mono text-sm">{{ log.ip || '-' }}</td>
              </ng-container>

              <ng-container matColumnDef="createdAt">
                <th mat-header-cell *matHeaderCellDef class="!bg-slate-50 dark:!bg-slate-800 font-semibold">Date</th>
                <td mat-cell *matCellDef="let log" class="text-text-secondary">{{ log.createdAt | date:'medium' }}</td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="hover:bg-slate-50 dark:hover:bg-slate-700/50"></tr>
            </table>
          </div>

          <mat-paginator
            [length]="totalCount()"
            [pageSize]="pageSize()"
            [pageIndex]="pageIndex()"
            [pageSizeOptions]="[20, 50, 100]"
            (page)="onPageChange($event)"
            showFirstLastButtons
            class="border-t border-border-color"
          ></mat-paginator>
        }
      </div>
    </div>
  `,
  styles: [``],
})
export class LogsComponent implements OnInit {
  logService = inject(LogService);

  logs = signal<Log[]>([]);
  isLoading = signal(true);
  totalCount = signal(0);
  pageSize = signal(20);
  pageIndex = signal(0);
  searchQuery = '';
  selectedAction = '';

  displayedColumns = ['action', 'description', 'user', 'ip', 'createdAt'];
  actions = ['LOGIN', 'LOGOUT', 'CLIENT_CREATED', 'CLIENT_UPDATED', 'CLIENT_DELETED', 'DOCUMENT_UPLOADED', 'DOCUMENT_DOWNLOADED', 'DOCUMENT_DELETED'];

  ngOnInit(): void {
    this.loadLogs();
  }

  loadLogs(): void {
    this.isLoading.set(true);
    this.logService.getLogs(this.pageIndex() + 1, this.pageSize(), {
      search: this.searchQuery,
      action: this.selectedAction,
    }).subscribe({
      next: (res) => {
        this.logs.set(res.data);
        this.totalCount.set(res.meta.total);
      },
      complete: () => this.isLoading.set(false),
    });
  }

  onSearch(): void {
    this.pageIndex.set(0);
    this.loadLogs();
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.loadLogs();
  }
}
