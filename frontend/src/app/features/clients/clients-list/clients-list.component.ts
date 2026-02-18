import { Component, inject, ChangeDetectionStrategy, TemplateRef, viewChild, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ClientsFacade } from './clients-list.facade';
import { ClientFormComponent } from '../client-form/client-form.component';

import { DataTableComponent } from '../../../shared/data-table/data-table.component';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  heroPlusSolid,
  heroMagnifyingGlassSolid,
  heroUserGroupSolid,
  heroEllipsisVerticalSolid,
  heroPencilSquareSolid,
  heroTrashSolid,
  heroFolderOpenSolid
} from '@ng-icons/heroicons/solid';

@Component({
  selector: 'app-clients-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    DataTableComponent,
    NgIconComponent
  ],
  providers: [
    ClientsFacade,
    provideIcons({
      heroPlusSolid,
      heroMagnifyingGlassSolid,
      heroUserGroupSolid,
      heroEllipsisVerticalSolid,
      heroPencilSquareSolid,
      heroTrashSolid,
      heroFolderOpenSolid
    })
  ],
  template: `
    <div class="space-y-8 animate-page-enter">
      <!-- Page Header -->
      <div>
        <div class="flex items-center gap-2 text-[#0074c9] dark:text-blue-400 font-bold text-[11px] uppercase" style="letter-spacing: 0.12em;">
          MANAGEMENT
        </div>
        <div class="w-8 h-[3px] bg-[#0074c9] dark:bg-blue-400 rounded-full mt-2 mb-4"></div>
        <h1
          class="text-4xl font-black text-slate-900 dark:text-white"
          style="letter-spacing: -0.03em; line-height: 1.1;"
        >
          Clients
        </h1>
        <p class="text-[15px] font-medium text-slate-500 dark:text-slate-400 mt-2">
          Manage your client network and their information.
        </p>
      </div>

      <!-- Data Table -->
      <app-data-table
        title="Client Directory"
        [tableData]="facade.clients()"
        [tableColumns]="tableColumns"
        [serverSide]="true"
        [totalCount]="facade.totalCount()"
        [loading]="facade.isLoading()"
        [actionsTemplate]="actionsTpl()"
        [rowClass]="getRowClass"
        [addFormComponent]="clientFormComponent"
        [updateFormComponent]="clientFormComponent"
        (loadMore)="facade.updatePagination($event.offset, $event.limit)"
        (add)="onAdd()"
        (modalClosed)="facade.reload()"
      >
        <!-- Filters Slot -->
        <div class="flex items-center gap-2" filters>
          <select class="h-[40px] px-4 bg-[#f8fafc] dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-2xl text-sm font-medium text-slate-600 dark:text-slate-300 outline-none hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer focus:ring-2 focus:ring-[#0074c9]/20 focus:border-[#0074c9]">
            <option>All Category</option>
            <option>Retail</option>
            <option>Wholesale</option>
          </select>
          <select class="h-[40px] px-4 bg-[#f8fafc] dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-2xl text-sm font-medium text-slate-600 dark:text-slate-300 outline-none hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer focus:ring-2 focus:ring-[#0074c9]/20 focus:border-[#0074c9]">
            <option>All Group</option>
          </select>
        </div>
      </app-data-table>

      <!-- Actions Template -->
      <ng-template #actionsTemplate let-row>
        <div class="flex items-center justify-end gap-1">
          <!-- View/Open -->
          <button
            [routerLink]="['/workspace', row.id]"
            class="w-8 h-8 flex items-center justify-center rounded-xl text-[#0074c9] hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
            title="Open Workspace"
          >
            <ng-icon name="heroFolderOpenSolid" size="18"></ng-icon>
          </button>

          <!-- Edit -->
          <button
            (click)="onEdit(row)"
            class="w-8 h-8 flex items-center justify-center rounded-xl text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
            title="Edit"
          >
            <ng-icon name="heroPencilSquareSolid" size="18"></ng-icon>
          </button>

          <!-- Delete -->
          <button
            (click)="onDelete(row)"
            class="w-8 h-8 flex items-center justify-center rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            title="Delete"
          >
            <ng-icon name="heroTrashSolid" size="18"></ng-icon>
          </button>
        </div>
      </ng-template>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientsListComponent {
  facade = inject(ClientsFacade);
  clientFormComponent = ClientFormComponent;

  actionsTpl = viewChild.required<TemplateRef<any>>('actionsTemplate');

  @ViewChild(DataTableComponent) dataTable!: DataTableComponent;

  get tableColumns(): any[] {
    return [
      { name: 'Client Code', prop: 'code', type: 'text', sortable: true },
      { name: 'Name', prop: 'user.name', type: 'text', sortable: true },
      { name: 'Mobile', prop: 'user.mobile', type: 'text' },
      { name: 'Status', prop: 'user.isActive', type: 'status' },
    ];
  }

  onAdd() {
    this.dataTable?.openModalWithType('add');
  }

  onEdit(row: any) {
    this.dataTable?.openModalWithType('edit', row);
  }

  onDelete(client: any) {
    if (confirm(`Are you sure you want to delete client ${client.code}?`)) {
      this.facade.deleteClient(client.id);
    }
  }

  getRowClass = (row: any) => {
    const classes = ['border-primary', 'border-success', 'border-warning', 'border-danger', 'border-info'];
    const idVal = row.id ? (typeof row.id === 'number' ? row.id : row.id.charCodeAt(row.id.length - 1)) : 0;
    return classes[idVal % classes.length];
  }
}
