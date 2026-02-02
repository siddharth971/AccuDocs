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
import { LayoutComponent } from '@shared/components/layout/layout.component';

@Component({
  selector: 'app-logs',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatCardModule, MatButtonModule, MatIconModule,
    MatTableModule, MatPaginatorModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatProgressSpinnerModule, MatChipsModule, LayoutComponent,
  ],
  template: `
    <app-layout>
      <div class="logs-container fade-in">
        <header class="page-header">
          <h1>Activity Logs</h1>
        </header>

        <mat-card>
          <div class="toolbar">
            <mat-form-field appearance="outline" class="search-field">
              <mat-label>Search</mat-label>
              <input matInput [(ngModel)]="searchQuery" (ngModelChange)="onSearch()">
              <mat-icon matPrefix>search</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline">
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
            <div class="loading"><mat-spinner diameter="40"></mat-spinner></div>
          } @else if (logs().length === 0) {
            <div class="empty"><mat-icon>history</mat-icon><p>No logs found</p></div>
          } @else {
            <table mat-table [dataSource]="logs()">
              <ng-container matColumnDef="action">
                <th mat-header-cell *matHeaderCellDef>Action</th>
                <td mat-cell *matCellDef="let log">
                  <mat-chip>{{ logService.getActionLabel(log.action) }}</mat-chip>
                </td>
              </ng-container>

              <ng-container matColumnDef="description">
                <th mat-header-cell *matHeaderCellDef>Description</th>
                <td mat-cell *matCellDef="let log">{{ log.description }}</td>
              </ng-container>

              <ng-container matColumnDef="user">
                <th mat-header-cell *matHeaderCellDef>User</th>
                <td mat-cell *matCellDef="let log">{{ log.user?.name || 'System' }}</td>
              </ng-container>

              <ng-container matColumnDef="ip">
                <th mat-header-cell *matHeaderCellDef>IP</th>
                <td mat-cell *matCellDef="let log">{{ log.ip || '-' }}</td>
              </ng-container>

              <ng-container matColumnDef="createdAt">
                <th mat-header-cell *matHeaderCellDef>Date</th>
                <td mat-cell *matCellDef="let log">{{ log.createdAt | date:'medium' }}</td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            </table>

            <mat-paginator
              [length]="totalCount()"
              [pageSize]="pageSize()"
              [pageIndex]="pageIndex()"
              [pageSizeOptions]="[20, 50, 100]"
              (page)="onPageChange($event)"
              showFirstLastButtons
            ></mat-paginator>
          }
        </mat-card>
      </div>
    </app-layout>
  `,
  styles: [`
    .logs-container { padding: 1.5rem; }
    .page-header { margin-bottom: 1rem; }
    .page-header h1 { margin: 0; }
    .toolbar { display: flex; gap: 1rem; padding: 1rem; flex-wrap: wrap; }
    .search-field { flex: 1; min-width: 200px; }
    .loading, .empty { display: flex; flex-direction: column; align-items: center; padding: 4rem; color: var(--text-secondary); }
    .empty mat-icon { font-size: 48px; height: 48px; width: 48px; }
    table { width: 100%; }
  `],
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
