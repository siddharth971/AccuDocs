import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatMenuModule } from '@angular/material/menu';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { ClientService, Client } from '@core/services/client.service';
import { NotificationService } from '@core/services/notification.service';
import { LayoutComponent } from '@shared/components/layout/layout.component';
import { ConfirmDialogComponent } from '@shared/components/confirm-dialog/confirm-dialog.component';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-clients-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatMenuModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatTooltipModule,
    MatDividerModule,
    LayoutComponent,
  ],
  template: `
    <app-layout>
      <div class="clients-container fade-in">
        <header class="page-header">
          <div>
            <h1>Clients</h1>
            <p class="subtitle">Manage your client accounts</p>
          </div>
          <button mat-raised-button color="primary" routerLink="create">
            <mat-icon>add</mat-icon>
            Add Client
          </button>
        </header>

        <mat-card class="clients-card">
          <!-- Search and filters -->
          <div class="toolbar">
            <mat-form-field appearance="outline" class="search-field">
              <mat-label>Search clients</mat-label>
              <input matInput [(ngModel)]="searchQuery" (ngModelChange)="onSearchChange($event)" placeholder="Name, code, or mobile...">
              <mat-icon matPrefix>search</mat-icon>
              @if (searchQuery) {
                <button matSuffix mat-icon-button (click)="clearSearch()">
                  <mat-icon>close</mat-icon>
                </button>
              }
            </mat-form-field>
          </div>

          @if (isLoading()) {
            <div class="loading-state">
              <mat-spinner diameter="40"></mat-spinner>
            </div>
          } @else {
            @if (clients().length === 0) {
              <div class="empty-state">
                <mat-icon>people_outline</mat-icon>
                <h3>No clients found</h3>
                <p>{{ searchQuery ? 'Try a different search term' : 'Get started by adding your first client' }}</p>
                @if (!searchQuery) {
                  <button mat-raised-button color="primary" routerLink="create">
                    <mat-icon>add</mat-icon>
                    Add Client
                  </button>
                }
              </div>
            } @else {
              <div class="table-container">
                <table mat-table [dataSource]="clients()" matSort (matSortChange)="onSortChange($event)">
                  <!-- Code Column -->
                  <ng-container matColumnDef="code">
                    <th mat-header-cell *matHeaderCellDef mat-sort-header>Code</th>
                    <td mat-cell *matCellDef="let client">
                      <span class="client-code">{{ client.code }}</span>
                    </td>
                  </ng-container>

                  <!-- Name Column -->
                  <ng-container matColumnDef="name">
                    <th mat-header-cell *matHeaderCellDef mat-sort-header>Name</th>
                    <td mat-cell *matCellDef="let client">{{ client.user?.name }}</td>
                  </ng-container>

                  <!-- Mobile Column -->
                  <ng-container matColumnDef="mobile">
                    <th mat-header-cell *matHeaderCellDef>Mobile</th>
                    <td mat-cell *matCellDef="let client">{{ client.user?.mobile }}</td>
                  </ng-container>

                  <!-- Status Column -->
                  <ng-container matColumnDef="status">
                    <th mat-header-cell *matHeaderCellDef>Status</th>
                    <td mat-cell *matCellDef="let client">
                      <mat-chip [class]="client.user?.isActive ? 'active' : 'inactive'">
                        {{ client.user?.isActive ? 'Active' : 'Inactive' }}
                      </mat-chip>
                    </td>
                  </ng-container>

                  <!-- Documents Column -->
                  <ng-container matColumnDef="documents">
                    <th mat-header-cell *matHeaderCellDef>Documents</th>
                    <td mat-cell *matCellDef="let client">
                      {{ getTotalDocuments(client) }}
                    </td>
                  </ng-container>

                  <!-- Actions Column -->
                  <ng-container matColumnDef="actions">
                    <th mat-header-cell *matHeaderCellDef class="actions-header">Actions</th>
                    <td mat-cell *matCellDef="let client">
                      <button mat-icon-button [matMenuTriggerFor]="menu" matTooltip="More actions">
                        <mat-icon>more_vert</mat-icon>
                      </button>
                      <mat-menu #menu="matMenu">
                        <a mat-menu-item [routerLink]="[client.id]">
                          <mat-icon>visibility</mat-icon>
                          <span>View Details</span>
                        </a>
                        <a mat-menu-item [routerLink]="[client.id, 'edit']">
                          <mat-icon>edit</mat-icon>
                          <span>Edit</span>
                        </a>
                        <button mat-menu-item (click)="toggleStatus(client)">
                          <mat-icon>{{ client.user?.isActive ? 'block' : 'check_circle' }}</mat-icon>
                          <span>{{ client.user?.isActive ? 'Deactivate' : 'Activate' }}</span>
                        </button>
                        <mat-divider></mat-divider>
                        <button mat-menu-item class="delete-action" (click)="confirmDelete(client)">
                          <mat-icon>delete</mat-icon>
                          <span>Delete</span>
                        </button>
                      </mat-menu>
                    </td>
                  </ng-container>

                  <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                  <tr mat-row *matRowDef="let row; columns: displayedColumns;" [routerLink]="[row.id]" class="clickable-row"></tr>
                </table>
              </div>

              <mat-paginator
                [length]="totalCount()"
                [pageSize]="pageSize()"
                [pageIndex]="pageIndex()"
                [pageSizeOptions]="[10, 25, 50]"
                (page)="onPageChange($event)"
                showFirstLastButtons
              ></mat-paginator>
            }
          }
        </mat-card>
      </div>
    </app-layout>
  `,
  styles: [`
    .clients-container {
      padding: 1.5rem;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .page-header h1 {
      margin: 0;
    }

    .subtitle {
      color: var(--text-secondary);
      margin: 0.25rem 0 0;
    }

    .clients-card {
      padding: 0;
      overflow: hidden;
    }

    .toolbar {
      padding: 1rem;
      border-bottom: 1px solid var(--border-color);
    }

    .search-field {
      width: 100%;
      max-width: 400px;
    }

    .loading-state,
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem 2rem;
      color: var(--text-secondary);
    }

    .empty-state mat-icon {
      font-size: 64px;
      height: 64px;
      width: 64px;
      margin-bottom: 1rem;
    }

    .empty-state h3 {
      margin: 0 0 0.5rem;
      color: var(--text-primary);
    }

    .empty-state p {
      margin: 0 0 1.5rem;
    }

    .table-container {
      overflow-x: auto;
    }

    table {
      width: 100%;
    }

    .client-code {
      font-family: monospace;
      font-weight: 600;
      background: var(--background-color);
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
    }

    .clickable-row {
      cursor: pointer;
      transition: background 0.2s;
    }

    .clickable-row:hover {
      background: var(--background-color) !important;
    }

    mat-chip.active {
      background: #e8f5e9 !important;
      color: #2e7d32 !important;
    }

    mat-chip.inactive {
      background: #ffebee !important;
      color: #c62828 !important;
    }

    .actions-header {
      width: 80px;
    }

    .delete-action {
      color: #c62828;
    }

    @media (max-width: 768px) {
      .page-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
      }

      .page-header button {
        width: 100%;
      }
    }
  `],
})
export class ClientsListComponent implements OnInit {
  private clientService = inject(ClientService);
  private notificationService = inject(NotificationService);
  private dialog = inject(MatDialog);

  displayedColumns = ['code', 'name', 'mobile', 'status', 'documents', 'actions'];

  clients = signal<Client[]>([]);
  isLoading = signal(true);
  totalCount = signal(0);
  pageSize = signal(10);
  pageIndex = signal(0);

  searchQuery = '';
  sortBy = 'createdAt';
  sortOrder: 'asc' | 'desc' = 'desc';

  private searchSubject = new Subject<string>();

  ngOnInit(): void {
    this.loadClients();

    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => {
      this.pageIndex.set(0);
      this.loadClients();
    });
  }

  loadClients(): void {
    this.isLoading.set(true);

    this.clientService.getClients(
      this.pageIndex() + 1,
      this.pageSize(),
      this.searchQuery,
      this.sortBy,
      this.sortOrder
    ).subscribe({
      next: (response) => {
        this.clients.set(response.data);
        this.totalCount.set(response.meta.total);
      },
      error: () => this.isLoading.set(false),
      complete: () => this.isLoading.set(false),
    });
  }

  onSearchChange(value: string): void {
    this.searchSubject.next(value);
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.loadClients();
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.loadClients();
  }

  onSortChange(sort: Sort): void {
    this.sortBy = sort.active;
    this.sortOrder = sort.direction as 'asc' | 'desc' || 'desc';
    this.loadClients();
  }

  getTotalDocuments(client: Client): number {
    return client.years?.reduce((total, year) => total + (year.documentCount || 0), 0) || 0;
  }

  toggleStatus(client: Client): void {
    this.clientService.toggleClientActive(client.id).subscribe({
      next: () => {
        this.notificationService.success(`Client ${client.user?.isActive ? 'deactivated' : 'activated'}`);
        this.loadClients();
      },
    });
  }

  confirmDelete(client: Client): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Client',
        message: `Are you sure you want to delete "${client.user?.name}"? This action cannot be undone and will delete all associated documents.`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
        color: 'warn',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.deleteClient(client);
      }
    });
  }

  private deleteClient(client: Client): void {
    this.clientService.deleteClient(client.id).subscribe({
      next: () => {
        this.notificationService.success('Client deleted successfully');
        this.loadClients();
      },
    });
  }
}
