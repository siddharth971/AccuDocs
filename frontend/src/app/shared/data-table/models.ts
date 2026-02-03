
import { TemplateRef } from '@angular/core';

export interface TableColumn {
  name: string; // Display name
  prop: string; // Property key in data
  sortable?: boolean;
  hidden?: boolean;
  type?: 'text' | 'number' | 'date' | 'boolean' | 'status' | 'currency' | 'action';
  width?: number;
  cellClass?: string | ((row: any) => string);
  template?: TemplateRef<any>;
}

export interface TableAction {
  label: string;
  icon?: string; // Phosphor icon name
  action: string; // Event identifier
  color?: 'primary' | 'danger' | 'success' | 'warning' | 'neutral';
  hide?: (row: any) => boolean;
}

export interface PaginationConfig {
  page: number;
  limit: number;
  total: number;
}

// Re-export ngx-datatable types if needed for consumers
export type SortType = 'single' | 'multi';
export type SelectionType = 'single' | 'multi' | 'checkbox';
