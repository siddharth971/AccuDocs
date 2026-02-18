
import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LogService, Log } from '@core/services/log.service';
import { DataTableComponent } from '../../shared/data-table/data-table.component';
import { TableColumn } from '../../shared/data-table/models';

@Component({
  selector: 'app-logs',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DataTableComponent
  ],
  template: `
    <div class="space-y-8 animate-page-enter">
      <!-- Page Header -->
      <div>
        <div class="flex items-center gap-2 text-[#0074c9] dark:text-blue-400 font-bold text-[11px] uppercase" style="letter-spacing: 0.12em;">
          AUDIT TRAIL
        </div>
        <div class="w-8 h-[3px] bg-[#0074c9] dark:bg-blue-400 rounded-full mt-2 mb-4"></div>
        <h1
          class="text-4xl font-black text-slate-900 dark:text-white"
          style="letter-spacing: -0.03em; line-height: 1.1;"
        >
          Activity Logs
        </h1>
        <p class="text-[15px] font-medium text-slate-500 dark:text-slate-400 mt-2">
          Track and review all system events and user actions.
        </p>
      </div>

      <!-- Data Table -->
      <app-data-table
        title="System Events"
        [tableData]="logs()"
        [tableColumns]="tableColumns"
        [serverSide]="true"
        [totalCount]="totalCount()"
        [loading]="isLoading()"
        [canAdd]="false"
        [canEdit]="false"
        [canDelete]="false"
        (loadMore)="onPageChange($event)"
        (search)="onSearch($event)"
      >
        <!-- Filters Slot -->
        <div class="flex items-center gap-2" filters>
          <select
            [(ngModel)]="selectedAction"
            (change)="loadLogs()"
            class="h-[40px] px-4 bg-[#f8fafc] dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-2xl text-sm font-medium text-slate-600 dark:text-slate-300 outline-none hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer focus:ring-2 focus:ring-[#0074c9]/20 focus:border-[#0074c9]">
            <option value="">All Actions</option>
            @for (action of actions; track action) {
              <option [value]="action">{{ logService.getActionLabel(action) }}</option>
            }
          </select>
        </div>
      </app-data-table>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
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

  actions = ['LOGIN', 'LOGOUT', 'CLIENT_CREATED', 'CLIENT_UPDATED', 'CLIENT_DELETED', 'DOCUMENT_UPLOADED', 'DOCUMENT_DOWNLOADED', 'DOCUMENT_DELETED'];

  get tableColumns(): TableColumn[] {
    return [
      { name: 'Action', prop: 'action', type: 'text', sortable: true, width: 150 },
      { name: 'Description', prop: 'description', type: 'text', sortable: false, width: 300 },
      { name: 'User', prop: 'user.name', type: 'text', sortable: true, width: 150 },
      { name: 'IP Address', prop: 'ip', type: 'text', sortable: false, width: 120 },
      { name: 'Date', prop: 'createdAt', type: 'date', sortable: true, width: 180 },
    ];
  }

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
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load logs', err);
        this.isLoading.set(false);
      }
    });
  }

  onSearch(query: string): void {
    this.searchQuery = query;
    this.pageIndex.set(0);
    this.loadLogs();
  }

  onPageChange(event: { offset: number; limit: number }): void {
    this.pageIndex.set(event.offset);
    this.pageSize.set(event.limit);
    this.loadLogs();
  }
}
