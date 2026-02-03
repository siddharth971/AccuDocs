import { Component, inject, ChangeDetectionStrategy, TemplateRef, viewChild, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ClientsFacade } from './clients-list.facade';
import { ButtonComponent } from '@ui/atoms/button.component';
import { CardComponent } from '@ui/molecules/card.component';
import { ClientFormComponent } from '../client-form/client-form.component';

import { DataTableComponent } from '../../../shared/data-table/data-table.component';
import { LoaderComponent } from '@ui/atoms/loader.component';
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
    ButtonComponent,
    CardComponent,
    DataTableComponent,
    LoaderComponent,
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
    <div class="h-full flex flex-col bg-white rounded-lg animate-in fade-in duration-500">
      <app-data-table 
        title="Clients"
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
          <select class="px-4 py-2 bg-gray-50 border-none rounded-full text-sm font-medium text-gray-600 outline-none hover:bg-gray-100 transition-colors cursor-pointer">
            <option>All Category</option>
             <option>Retail</option>
             <option>Wholesale</option>
          </select>
           <select class="px-4 py-2 bg-gray-50 border-none rounded-full text-sm font-medium text-gray-600 outline-none hover:bg-gray-100 transition-colors cursor-pointer">
            <option>All Group</option>
          </select>
        </div>
      </app-data-table>

      <!-- Actions Template -->
      <ng-template #actionsTemplate let-row>
        <div class="flex items-center justify-end gap-3">
          <!-- View/Open -->
          <button 
            [routerLink]="['/workspace', row.id]" 
            class="text-blue-500 hover:text-blue-700 transition-colors" 
            title="Open Workspace"
          >
            <ng-icon name="heroFolderOpenSolid" size="20"></ng-icon>
          </button>
          
          <!-- Delete -->
          <button 
            (click)="onDelete(row)"
            class="text-red-500 hover:text-red-700 transition-colors" 
            title="Delete"
          >
            <ng-icon name="heroTrashSolid" size="20"></ng-icon>
          </button>

           <!-- Edit -->
           <button 
             (click)="onEdit(row)"
             class="text-orange-400 hover:text-orange-600 transition-colors" 
             title="Edit"
           >
            <ng-icon name="heroPencilSquareSolid" size="20"></ng-icon>
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
