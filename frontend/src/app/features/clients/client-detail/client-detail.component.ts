import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { ClientService, Client } from '@core/services/client.service';
import { DocumentService } from '@core/services/document.service';
import { NotificationService } from '@core/services/notification.service';
import { LayoutComponent } from '@shared/components/layout/layout.component';

@Component({
  selector: 'app-client-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatListModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatMenuModule,
    MatDividerModule,
    LayoutComponent,
  ],
  template: `
    <app-layout>
      <div class="detail-container fade-in">
        @if (isLoading()) {
          <div class="loading-state">
            <mat-spinner diameter="40"></mat-spinner>
          </div>
        } @else if (client()) {
          <header class="page-header">
            <div class="header-left">
              <button mat-icon-button routerLink="/clients">
                <mat-icon>arrow_back</mat-icon>
              </button>
              <div>
                <h1>{{ client()?.user?.name }}</h1>
                <div class="client-meta">
                  <mat-chip class="code-chip">{{ client()?.code }}</mat-chip>
                  <mat-chip [class]="client()?.user?.isActive ? 'active' : 'inactive'">
                    {{ client()?.user?.isActive ? 'Active' : 'Inactive' }}
                  </mat-chip>
                </div>
              </div>
            </div>
            <div class="header-actions">
              <button mat-stroked-button [routerLink]="['edit']">
                <mat-icon>edit</mat-icon>
                Edit
              </button>
              <button mat-icon-button [matMenuTriggerFor]="menu">
                <mat-icon>more_vert</mat-icon>
              </button>
              <mat-menu #menu="matMenu">
                <button mat-menu-item (click)="toggleStatus()">
                  <mat-icon>{{ client()?.user?.isActive ? 'block' : 'check_circle' }}</mat-icon>
                  <span>{{ client()?.user?.isActive ? 'Deactivate' : 'Activate' }}</span>
                </button>
              </mat-menu>
            </div>
          </header>

          <div class="content-grid">
            <!-- Client Info Card -->
            <mat-card class="info-card">
              <mat-card-header>
                <mat-icon mat-card-avatar>person</mat-icon>
                <mat-card-title>Client Information</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <div class="info-row">
                  <span class="label">Mobile</span>
                  <span class="value">{{ client()?.user?.mobile }}</span>
                </div>
                <mat-divider></mat-divider>
                <div class="info-row">
                  <span class="label">Created</span>
                  <span class="value">{{ client()?.createdAt | date:'medium' }}</span>
                </div>
                <mat-divider></mat-divider>
                <div class="info-row">
                  <span class="label">Total Documents</span>
                  <span class="value">{{ getTotalDocuments() }}</span>
                </div>
              </mat-card-content>
            </mat-card>

            <!-- Years/Documents Card -->
            <mat-card class="years-card">
              <mat-card-header>
                <mat-icon mat-card-avatar>folder</mat-icon>
                <mat-card-title>Document Folders</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                @if (client()?.years?.length) {
                  <mat-list>
                    @for (year of client()?.years; track year.id) {
                      <mat-list-item class="year-item" [routerLink]="['/documents']" [queryParams]="{yearId: year.id}">
                        <mat-icon matListItemIcon>folder</mat-icon>
                        <span matListItemTitle>{{ year.year }}</span>
                        <span matListItemLine>{{ year.documentCount || 0 }} documents</span>
                        <mat-icon matListItemMeta>chevron_right</mat-icon>
                      </mat-list-item>
                    }
                  </mat-list>
                } @else {
                  <div class="empty-state">
                    <mat-icon>folder_off</mat-icon>
                    <p>No document folders yet</p>
                  </div>
                }
              </mat-card-content>
            </mat-card>
          </div>
        }
      </div>
    </app-layout>
  `,
  styles: [`
    .detail-container {
      padding: 1.5rem;
    }

    .loading-state {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 400px;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1.5rem;
    }

    .header-left {
      display: flex;
      align-items: flex-start;
      gap: 0.5rem;
    }

    .header-left h1 {
      margin: 0;
    }

    .client-meta {
      display: flex;
      gap: 0.5rem;
      margin-top: 0.5rem;
    }

    .code-chip {
      font-family: monospace;
      font-weight: 600;
    }

    mat-chip.active {
      background: #e8f5e9 !important;
      color: #2e7d32 !important;
    }

    mat-chip.inactive {
      background: #ffebee !important;
      color: #c62828 !important;
    }

    .header-actions {
      display: flex;
      gap: 0.5rem;
    }

    .content-grid {
      display: grid;
      grid-template-columns: 1fr 2fr;
      gap: 1.5rem;
    }

    .info-card mat-card-content,
    .years-card mat-card-content {
      padding-top: 1rem;
    }

    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 1rem 0;
    }

    .info-row .label {
      color: var(--text-secondary);
    }

    .info-row .value {
      font-weight: 500;
    }

    .year-item {
      cursor: pointer;
      border-radius: 8px;
      margin-bottom: 0.5rem;
    }

    .year-item:hover {
      background: var(--background-color);
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 2rem;
      color: var(--text-secondary);
    }

    .empty-state mat-icon {
      font-size: 48px;
      height: 48px;
      width: 48px;
      margin-bottom: 0.5rem;
    }

    @media (max-width: 768px) {
      .page-header {
        flex-direction: column;
        gap: 1rem;
      }

      .content-grid {
        grid-template-columns: 1fr;
      }
    }
  `],
})
export class ClientDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private clientService = inject(ClientService);
  private notificationService = inject(NotificationService);

  client = signal<Client | null>(null);
  isLoading = signal(true);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadClient(id);
    }
  }

  private loadClient(id: string): void {
    this.isLoading.set(true);
    this.clientService.getClient(id).subscribe({
      next: (response) => this.client.set(response.data),
      error: () => {
        this.notificationService.error('Client not found');
        this.router.navigate(['/clients']);
      },
      complete: () => this.isLoading.set(false),
    });
  }

  getTotalDocuments(): number {
    return this.client()?.years?.reduce((total, year) => total + (year.documentCount || 0), 0) || 0;
  }

  toggleStatus(): void {
    const c = this.client();
    if (!c) return;

    this.clientService.toggleClientActive(c.id).subscribe({
      next: () => {
        this.notificationService.success(`Client ${c.user?.isActive ? 'deactivated' : 'activated'}`);
        this.loadClient(c.id);
      },
    });
  }
}
