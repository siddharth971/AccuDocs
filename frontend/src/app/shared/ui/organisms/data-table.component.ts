import { Component, input, output, ChangeDetectionStrategy, computed, TemplateRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoaderComponent } from '../atoms/loader.component';
import { EmptyStateComponent } from '../molecules/empty-state.component';
import { SkeletonTableComponent } from '../molecules/skeleton.component';
import { getNestedValue } from '@shared/utils/object.util';

export interface TableColumn {
  field: string;
  header: string;
  width?: string;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  template?: TemplateRef<any>;
  headerTemplate?: TemplateRef<any>;
}

export interface TableSort {
  field: string;
  direction: 'asc' | 'desc';
}

export interface TablePagination {
  page: number;
  pageSize: number;
  total: number;
}

@Component({
  selector: 'app-data-table, ui-data-table',
  standalone: true,
  imports: [CommonModule, LoaderComponent, EmptyStateComponent, SkeletonTableComponent],
  template: `
    <div class="w-full">
      <!-- Table Header Actions -->
      @if (showHeader()) {
        <div class="flex items-center justify-between gap-4 mb-4">
          <div class="flex-1 min-w-0">
            <ng-content select="[table-header-left]"></ng-content>
          </div>
          <div class="shrink-0 flex items-center gap-2">
            <ng-content select="[table-header-right]"></ng-content>
          </div>
        </div>
      }

      <!-- Table Container -->
      <div [class]="containerClasses()">
        @if (loading() && !data().length) {
          <!-- Skeleton Loading -->
          <ui-skeleton-table [rows]="5" [columns]="columns().length"></ui-skeleton-table>
        } @else {
          <div class="overflow-x-auto">
            <table class="w-full">
              <!-- Table Head -->
              <thead class="bg-secondary-50 dark:bg-secondary-900/50 border-b border-border-color">
                <tr>
                  <!-- Checkbox column -->
                  @if (selectable()) {
                    <th scope="col" class="w-12 px-4 py-3">
                      <input
                        type="checkbox"
                        [checked]="allSelected()"
                        [indeterminate]="someSelected()"
                        (change)="onSelectAll($event)"
                        class="w-4 h-4 rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                        aria-label="Select all rows"
                      />
                    </th>
                  }

                  @for (col of columns(); track col.field) {
                    <th
                      scope="col"
                      [class]="headerCellClasses(col)"
                      [style.width]="col.width"
                    >
                      @if (col.headerTemplate) {
                        <ng-container *ngTemplateOutlet="col.headerTemplate; context: { $implicit: col }"></ng-container>
                      } @else if (col.sortable) {
                        <button
                          type="button"
                          class="group inline-flex items-center gap-1.5 font-semibold hover:text-text-primary transition-colors"
                          (click)="onSort(col.field)"
                        >
                          {{ col.header }}
                          <span [class]="sortIconClasses(col.field)">
                            @if (currentSort()?.field === col.field) {
                              @if (currentSort()?.direction === 'asc') {
                                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
                                </svg>
                              } @else {
                                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                                </svg>
                              }
                            } @else {
                              <svg class="w-4 h-4 opacity-0 group-hover:opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                              </svg>
                            }
                          </span>
                        </button>
                      } @else {
                        {{ col.header }}
                      }
                    </th>
                  }

                  <!-- Actions column -->
                  @if (showActions()) {
                    <th scope="col" class="w-20 px-4 py-3 text-right text-xs font-semibold text-text-secondary uppercase tracking-wider">
                      Actions
                    </th>
                  }
                </tr>
              </thead>

              <!-- Table Body -->
              <tbody class="divide-y divide-border-subtle">
                @for (row of data(); track trackByFn()(row); let idx = $index) {
                  <tr 
                    [class]="rowClasses(row, idx)"
                    [attr.data-row-id]="row.id"
                  >
                    <!-- Checkbox cell -->
                    @if (selectable()) {
                      <td class="px-4 py-4">
                        <input
                          type="checkbox"
                          [checked]="isSelected(row)"
                          (change)="onSelectRow(row, $event)"
                          class="w-4 h-4 rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                          [attr.aria-label]="'Select row ' + (idx + 1)"
                        />
                      </td>
                    }

                    @for (col of columns(); track col.field) {
                      <td [class]="cellClasses(col)">
                        @if (col.template) {
                          <ng-container *ngTemplateOutlet="col.template; context: { $implicit: row, column: col, index: idx }"></ng-container>
                        } @else {
                          {{ getCellValue(row, col.field) }}
                        }
                      </td>
                    }

                    <!-- Actions cell -->
                    @if (showActions()) {
                      <td class="px-4 py-4 text-right">
                        <ng-content select="[table-row-actions]"></ng-content>
                      </td>
                    }
                  </tr>
                } @empty {
                  <tr>
                    <td [attr.colspan]="totalColumns()">
                      <ui-empty-state
                        [title]="emptyTitle()"
                        [description]="emptyDescription()"
                        size="sm"
                      >
                        <div empty-actions>
                          <ng-content select="[table-empty-actions]"></ng-content>
                        </div>
                      </ui-empty-state>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <!-- Loading overlay -->
          @if (loading() && data().length) {
            <div class="absolute inset-0 bg-surface-color/60 flex items-center justify-center z-10">
              <ui-loader size="lg" label="Loading..."></ui-loader>
            </div>
          }
        }
      </div>

      <!-- Pagination -->
      @if (showPagination() && pagination()) {
        <div class="flex items-center justify-between gap-4 mt-4 px-2">
          <!-- Info -->
          <p class="text-sm text-text-secondary">
            Showing 
            <span class="font-medium text-text-primary">{{ paginationStart() }}</span>
            to 
            <span class="font-medium text-text-primary">{{ paginationEnd() }}</span>
            of 
            <span class="font-medium text-text-primary">{{ pagination()?.total }}</span>
            results
          </p>

          <!-- Page buttons -->
          <div class="flex items-center gap-1">
            <button
              type="button"
              [disabled]="!canGoPrev()"
              (click)="onPageChange(pagination()!.page - 1)"
              class="px-3 py-1.5 text-sm font-medium rounded-md border border-border-color bg-white text-text-primary hover:bg-secondary-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors dark:bg-secondary-800 dark:border-secondary-700"
            >
              Previous
            </button>
            
            @for (pageNum of pageNumbers(); track pageNum) {
              @if (pageNum === '...') {
                <span class="px-3 py-1.5 text-secondary-400">...</span>
              } @else {
                <button
                  type="button"
                  (click)="onPageChange(+pageNum)"
                  [class]="pageButtonClasses(+pageNum)"
                >
                  {{ pageNum }}
                </button>
              }
            }

            <button
              type="button"
              [disabled]="!canGoNext()"
              (click)="onPageChange(pagination()!.page + 1)"
              class="px-3 py-1.5 text-sm font-medium rounded-md border border-border-color bg-white text-text-primary hover:bg-secondary-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors dark:bg-secondary-800 dark:border-secondary-700"
            >
              Next
            </button>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataTableComponent {
  // Inputs
  data = input<any[]>([]);
  columns = input<TableColumn[]>([]);
  loading = input<boolean>(false);
  selectable = input<boolean>(false);
  showHeader = input<boolean>(true);
  showActions = input<boolean>(false);
  showPagination = input<boolean>(true);
  striped = input<boolean>(false);
  hoverable = input<boolean>(true);
  bordered = input<boolean>(true);
  compact = input<boolean>(false);
  stickyHeader = input<boolean>(false);
  emptyTitle = input<string>('No data found');
  emptyDescription = input<string>('There are no records to display.');
  trackByFn = input<(item: any) => any>((item) => item.id);
  pagination = input<TablePagination | null>(null);

  // State
  selectedRows = signal<Set<any>>(new Set());
  currentSort = signal<TableSort | null>(null);

  // Outputs
  sortChange = output<TableSort>();
  pageChange = output<number>();
  selectionChange = output<any[]>();
  rowClick = output<any>();

  // Get cell value helper
  getCellValue = getNestedValue;

  // Computed total columns
  totalColumns = computed(() => {
    let count = this.columns().length;
    if (this.selectable()) count++;
    if (this.showActions()) count++;
    return count;
  });

  // Selection state
  allSelected = computed(() => {
    return this.data().length > 0 && this.selectedRows().size === this.data().length;
  });

  someSelected = computed(() => {
    return this.selectedRows().size > 0 && this.selectedRows().size < this.data().length;
  });

  isSelected(row: any): boolean {
    return this.selectedRows().has(row);
  }

  // Pagination computed
  paginationStart = computed(() => {
    const p = this.pagination();
    if (!p) return 0;
    return (p.page - 1) * p.pageSize + 1;
  });

  paginationEnd = computed(() => {
    const p = this.pagination();
    if (!p) return 0;
    return Math.min(p.page * p.pageSize, p.total);
  });

  totalPages = computed(() => {
    const p = this.pagination();
    if (!p) return 0;
    return Math.ceil(p.total / p.pageSize);
  });

  canGoPrev = computed(() => {
    const p = this.pagination();
    return p && p.page > 1;
  });

  canGoNext = computed(() => {
    const p = this.pagination();
    return p && p.page < this.totalPages();
  });

  pageNumbers = computed(() => {
    const total = this.totalPages();
    const current = this.pagination()?.page || 1;
    const pages: (number | string)[] = [];

    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      if (current <= 3) {
        pages.push(1, 2, 3, 4, '...', total);
      } else if (current >= total - 2) {
        pages.push(1, '...', total - 3, total - 2, total - 1, total);
      } else {
        pages.push(1, '...', current - 1, current, current + 1, '...', total);
      }
    }

    return pages;
  });

  // Classes
  containerClasses = computed(() => {
    const classes = ['relative', 'bg-surface-color'];

    if (this.bordered()) {
      classes.push('border border-border-color rounded-lg overflow-hidden');
    }

    return classes.join(' ');
  });

  headerCellClasses(col: TableColumn): string {
    const align = col.align || 'left';
    const alignClass = {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right',
    }[align];

    return [
      'px-6',
      this.compact() ? 'py-2' : 'py-3',
      'text-xs font-semibold text-text-secondary uppercase tracking-wider',
      alignClass,
    ].join(' ');
  }

  cellClasses(col: TableColumn): string {
    const align = col.align || 'left';
    const alignClass = {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right',
    }[align];

    return [
      'px-6',
      this.compact() ? 'py-2' : 'py-4',
      'text-sm text-text-primary',
      alignClass,
    ].join(' ');
  }

  rowClasses(row: any, idx: number): string {
    const classes = ['transition-colors'];

    if (this.striped() && idx % 2 === 1) {
      classes.push('bg-secondary-50/50 dark:bg-secondary-900/30');
    }

    if (this.hoverable()) {
      classes.push('hover:bg-primary-50/50 dark:hover:bg-primary-900/10 cursor-pointer');
    }

    if (this.isSelected(row)) {
      classes.push('bg-primary-50 dark:bg-primary-900/20');
    }

    return classes.join(' ');
  }

  sortIconClasses(field: string): string {
    return this.currentSort()?.field === field
      ? 'text-primary-600'
      : 'text-secondary-400';
  }

  pageButtonClasses(page: number): string {
    const isActive = page === this.pagination()?.page;
    const base = 'px-3 py-1.5 text-sm font-medium rounded-md transition-colors';

    if (isActive) {
      return `${base} bg-primary-600 text-white`;
    }
    return `${base} border border-border-color bg-white text-text-primary hover:bg-secondary-50 dark:bg-secondary-800 dark:border-secondary-700`;
  }

  // Event handlers
  onSort(field: string): void {
    const current = this.currentSort();
    let direction: 'asc' | 'desc' = 'asc';

    if (current?.field === field) {
      direction = current.direction === 'asc' ? 'desc' : 'asc';
    }

    const newSort = { field, direction };
    this.currentSort.set(newSort);
    this.sortChange.emit(newSort);
  }

  onSelectAll(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;

    if (checked) {
      this.selectedRows.set(new Set(this.data()));
    } else {
      this.selectedRows.set(new Set());
    }

    this.selectionChange.emit(Array.from(this.selectedRows()));
  }

  onSelectRow(row: any, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    const newSet = new Set(this.selectedRows());

    if (checked) {
      newSet.add(row);
    } else {
      newSet.delete(row);
    }

    this.selectedRows.set(newSet);
    this.selectionChange.emit(Array.from(newSet));
  }

  onPageChange(page: number): void {
    this.pageChange.emit(page);
  }

  onRowClick(row: any): void {
    this.rowClick.emit(row);
  }
}
