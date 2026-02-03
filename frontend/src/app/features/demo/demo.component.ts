
import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataTableComponent } from '../../shared/data-table/data-table.component';
import { TableColumn } from '../../shared/data-table/models';
import { HotToastService } from '@ngneat/hot-toast';

@Component({
  selector: 'app-demo',
  standalone: true,
  imports: [CommonModule, DataTableComponent],
  template: `
    <div class="p-8 space-y-8 bg-gray-50 min-h-screen">
      <h1 class="text-3xl font-bold text-gray-800">DataTable Demo</h1>

      <app-data-table
        title="Client List"
        [tableColumns]="columns"
        [tableData]="data()"
        [totalCount]="data().length"
        [filtersTemplate]="filters"
        [actionsTemplate]="customActions"
        (rowAction)="handleAction($event)"
        (add)="handleAdd()"
      >
      </app-data-table>

      <!-- Custom Filter Template -->
      <ng-template #filters>
        <select 
          class="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </ng-template>

      <!-- Custom Actions Template -->
      <ng-template #customActions let-row>
        <button 
          (click)="handleCustom(row)"
          class="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
          title="Custom Action">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </button>
      </ng-template>
    </div>
  `
})
export class DemoComponent {
  columns: TableColumn[] = [
    { name: 'Name', prop: 'name', type: 'text', sortable: true },
    { name: 'Role', prop: 'role', type: 'text', sortable: true },
    { name: 'Status', prop: 'isActive', type: 'status' },
    { name: 'Verified', prop: 'isVerified', type: 'boolean' },
    { name: 'Last Login', prop: 'lastLogin', type: 'date' },
  ];

  data = signal([
    { id: 1, name: 'John Doe', role: 'Admin', isActive: true, isVerified: true, lastLogin: '2023-11-01T10:00:00' },
    { id: 2, name: 'Jane Smith', role: 'User', isActive: false, isVerified: true, lastLogin: '2023-10-15T14:30:00' },
    { id: 3, name: 'Bob Johnson', role: 'Editor', isActive: true, isVerified: false, lastLogin: '2023-11-05T09:15:00' },
    { id: 4, name: 'Alice Williams', role: 'User', isActive: true, isVerified: true, lastLogin: null },
    { id: 5, name: 'Charlie Brown', role: 'Admin', isActive: false, isVerified: false, lastLogin: '2023-09-20T11:45:00' },
  ]);

  constructor(private toast: HotToastService) { }

  handleAdd() {
    this.toast.success('Add button clicked');
  }

  handleAction(event: { action: string; row: any }) {
    this.toast.info(`Action: ${event.action} on ${event.row.name}`);
  }

  handleCustom(row: any) {
    this.toast.success(`Custom action on ${row.name}`);
  }
}
