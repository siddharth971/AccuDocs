import { Component, inject, ChangeDetectionStrategy, TemplateRef, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ClientsFacade } from './clients-list.facade';
import { ButtonComponent } from '@ui/atoms/button.component';
import { CardComponent } from '@ui/molecules/card.component';
import { DataTableComponent } from '@ui/organisms/data-table.component';
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
    <div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <!-- Header Section -->
        <header class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 class="text-3xl font-bold text-text-primary tracking-tight">Clients Management</h1>
            <p class="text-text-secondary mt-1 text-lg">Manage your accounts and document sharing permissions.</p>
          </div>
          <app-button variant="primary" size="lg" routerLink="create">
            <ng-icon name="heroPlusSolid" class="mr-2" size="20"></ng-icon>
            New Client
          </app-button>
        </header>

        <!-- Stats Overview (Molecules) -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <app-card [padding]="true" class="!bg-primary-600 text-white">
            <div class="flex items-center gap-4">
              <div class="p-3 bg-white/20 rounded-xl">
                <ng-icon name="heroUserGroupSolid" size="28"></ng-icon>
              </div>
              <div>
                <p class="text-white/80 text-sm font-medium">Total Clients</p>
                <h3 class="text-2xl font-bold">{{ facade.totalCount() }}</h3>
              </div>
            </div>
          </app-card>
          <!-- Add more stat cards here -->
        </div>

        <!-- Filter & Table Section (Organism) -->
        <app-card [padding]="false" class="overflow-visible">
          <!-- Toolbar -->
          <div class="p-4 border-b border-border-color flex flex-col md:flex-row items-center gap-4 bg-gray-50/30">
            <div class="relative flex-1 w-full">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-secondary">
                <ng-icon name="heroMagnifyingGlassSolid" size="18"></ng-icon>
              </div>
              <input
                type="text"
                [ngModel]="facade.searchQuery()"
                (ngModelChange)="facade.searchQuery.set($event)"
                placeholder="Search clients by name, code or mobile..."
                class="form-input !pl-10 !bg-white"
              />
            </div>
            
            <div class="flex items-center gap-2">
              <select 
                [ngModel]="facade.pageSize()" 
                (ngModelChange)="facade.updatePagination(0, $event)"
                class="form-input py-2 text-sm !w-auto !bg-white"
              >
                <option [value]="10">10 per page</option>
                <option [value]="25">25 per page</option>
                <option [value]="50">50 per page</option>
              </select>
            </div>
          </div>

          <!-- Table -->
          @if (facade.isLoading()) {
            <div class="py-20">
              <app-loader size="lg" label="Fetching client data..."></app-loader>
            </div>
          } @else {
            <app-data-table 
              [data]="facade.clients()" 
              [columns]="tableColumns"
              [loading]="facade.isLoading()"
            ></app-data-table>
          }

          <!-- Pagination (Footer Molecule) -->
          <footer class="px-6 py-4 flex items-center justify-between border-t border-border-color">
            <p class="text-sm text-text-secondary">
              Showing <span class="font-semibold text-text-primary">{{ (facade.pageIndex() * facade.pageSize()) + 1 }}</span>
              to <span class="font-semibold text-text-primary">{{ (facade.pageIndex() + 1) * facade.pageSize() }}</span>
              of <span class="font-semibold text-text-primary">{{ facade.totalCount() }}</span> results
            </p>
            <div class="flex gap-2">
              <app-button 
                variant="secondary" 
                size="sm" 
                [disabled]="facade.pageIndex() === 0"
                (clicked)="facade.pageIndex.set(facade.pageIndex() - 1)"
              >
                Previous
              </app-button>
              <app-button 
                variant="secondary" 
                size="sm"
                [disabled]="(facade.pageIndex() + 1) * facade.pageSize() >= facade.totalCount()"
                (clicked)="facade.pageIndex.set(facade.pageIndex() + 1)"
              >
                Next
              </app-button>
            </div>
          </footer>
        </app-card>

      <!-- Templates for Table Columns -->
      <ng-template #statusTemplate let-row>
        <span 
          [class]="row.user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'"
          class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
        >
          {{ row.user.isActive ? 'Active' : 'Inactive' }}
        </span>
      </ng-template>

      <ng-template #actionsTemplate let-row>
        <div class="flex items-center gap-2">
          <button 
            [routerLink]="['/workspace', row.id]" 
            class="p-1.5 text-text-secondary hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" 
            title="Open Workspace"
          >
            <ng-icon name="heroFolderOpenSolid" size="18"></ng-icon>
          </button>
          <button class="p-1.5 text-text-secondary hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors" title="Edit">
            <ng-icon name="heroPencilSquareSolid" size="18"></ng-icon>
          </button>
          <button 
            (click)="onDelete(row)"
            class="p-1.5 text-text-secondary hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" 
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

  statusTemplate = viewChild.required<TemplateRef<any>>('statusTemplate');
  actionsTemplate = viewChild.required<TemplateRef<any>>('actionsTemplate');

  get tableColumns() {
    return [
      { header: 'Client Code', field: 'code' },
      { header: 'Name', field: 'user.name' }, // Note: Nested access handled by data-table or facade
      { header: 'Mobile', field: 'user.mobile' },
      { header: 'Status', field: 'status', template: this.statusTemplate() },
      { header: 'Actions', field: 'actions', template: this.actionsTemplate() },
    ];
  }

  onDelete(client: any) {
    if (confirm(`Are you sure you want to delete client ${client.code}?`)) {
      this.facade.deleteClient(client.id);
    }
  }
}
