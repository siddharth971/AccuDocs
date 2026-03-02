import { Component, inject, ChangeDetectionStrategy, TemplateRef, viewChild, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StaffFacade } from './staff-list.facade';
import { StaffFormComponent } from '../staff-form/staff-form.component';

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
  selector: 'app-staff-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DataTableComponent,
    NgIconComponent
  ],
  providers: [
    StaffFacade,
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
    <div class="p-6 space-y-8">
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
          Staff & Team
        </h1>
        <p class="text-[15px] font-medium text-slate-500 dark:text-slate-400 mt-2">
          Manage your internal team members and assign roles.
        </p>
      </div>

      <!-- Data Table -->
      <app-data-table
        title="Staff Directory"
        [tableData]="facade.staff()"
        [tableColumns]="tableColumns"
        [serverSide]="true"
        [totalCount]="facade.totalCount()"
        [loading]="facade.isLoading()"
        [actionsTemplate]="actionsTpl()"
        [rowClass]="getRowClass"
        [addFormComponent]="staffFormComponent"
        [updateFormComponent]="staffFormComponent"
        (loadMore)="facade.updatePagination($event.offset, $event.limit)"
        (add)="onAdd()"
        (modalClosed)="facade.reload()"
      >
        <!-- Filters Slot -->
        <div class="flex items-center gap-2" filters>
          <select 
            [ngModel]="facade.roleFilter()" 
            (ngModelChange)="onRoleChange($event)"
            class="h-[40px] px-4 bg-[#f8fafc] dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-2xl text-sm font-medium text-slate-600 dark:text-slate-300 outline-none hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer focus:ring-2 focus:ring-[#0074c9]/20 focus:border-[#0074c9]">
            <option value="admin">Admin Only</option>
          </select>
        </div>
      </app-data-table>

      <!-- Actions Template -->
      <ng-template #actionsTemplate let-row="row">
        <div class="flex items-center justify-end gap-1">
          <!-- Edit -->
          <button
            (click)="onEdit(row)"
            class="w-8 h-8 flex items-center justify-center rounded-xl text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
            title="Edit"
          >
            <ng-icon name="heroPencilSquareSolid" size="18"></ng-icon>
          </button>
        </div>
      </ng-template>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StaffListComponent {
  facade: StaffFacade = inject(StaffFacade);
  staffFormComponent = StaffFormComponent;

  actionsTpl = viewChild.required<TemplateRef<any>>('actionsTemplate');

  @ViewChild(DataTableComponent) dataTable!: DataTableComponent;

  get tableColumns(): any[] {
    return [
      { name: 'Name', prop: 'name', type: 'text', sortable: true },
      { name: 'Mobile', prop: 'mobile', type: 'text' },
      { name: 'Role', prop: 'role', type: 'text', sortable: true },
      { name: 'Status', prop: 'isActive', type: 'status' },
    ];
  }

  onRoleChange(role: string): void {
    if (role === 'admin') {
      this.facade.roleFilter.set('admin');
    }
    this.facade.pageIndex.set(0);
    this.facade.reload();
  }

  onAdd(): void {
    this.dataTable?.openModalWithType('add');
  }

  onEdit(row: any): void {
    this.dataTable?.openModalWithType('edit', row);
  }

  getRowClass = (row: any): string => {
    const classes = ['border-primary', 'border-success', 'border-warning', 'border-danger', 'border-info'];
    const idVal = row.id ? (typeof row.id === 'number' ? row.id : row.id.charCodeAt(row.id.length - 1)) : 0;
    return classes[idVal % classes.length];
  }
}
