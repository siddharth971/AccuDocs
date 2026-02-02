import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '@core/services/auth.service';
import { ClientService, Client } from '@core/services/client.service';
import { DocumentService, StorageStats } from '@core/services/document.service';
import { LogService, LogStats } from '@core/services/log.service';
import { ThemeService } from '@core/services/theme.service';
import { LayoutComponent } from '@shared/components/layout/layout.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    LayoutComponent,
  ],
  template: `
    <app-layout>
      <div class="dashboard-container fade-in">
        <header class="dashboard-header">
          <div>
            <h1>Welcome, {{ authService.currentUser()?.name }}!</h1>
            <p class="subtitle">Here's your document management overview</p>
          </div>
          <div class="header-actions">
            <button mat-icon-button matTooltip="Toggle Theme" (click)="themeService.toggleTheme()">
              <mat-icon>{{ themeService.isDarkMode() ? 'light_mode' : 'dark_mode' }}</mat-icon>
            </button>
          </div>
        </header>

        @if (isLoading()) {
          <div class="loading-state">
            <mat-spinner diameter="40"></mat-spinner>
            <p>Loading dashboard...</p>
          </div>
        } @else {
          <!-- Stats Cards -->
          <div class="stats-grid">
            @if (authService.isAdmin()) {
              <mat-card class="stat-card">
                <div class="stat-icon clients">
                  <mat-icon>people</mat-icon>
                </div>
                <div class="stat-content">
                  <h3>{{ clientCount() }}</h3>
                  <p>Total Clients</p>
                </div>
                <a mat-button routerLink="/clients" class="stat-action">View All</a>
              </mat-card>
            }

            <mat-card class="stat-card">
              <div class="stat-icon documents">
                <mat-icon>folder</mat-icon>
              </div>
              <div class="stat-content">
                <h3>{{ storageStats()?.documentCount || 0 }}</h3>
                <p>Total Documents</p>
              </div>
              <a mat-button routerLink="/documents" class="stat-action">View All</a>
            </mat-card>

            <mat-card class="stat-card">
              <div class="stat-icon storage">
                <mat-icon>cloud</mat-icon>
              </div>
              <div class="stat-content">
                <h3>{{ formatSize(storageStats()?.totalSize || 0) }}</h3>
                <p>Storage Used</p>
              </div>
            </mat-card>

            @if (authService.isAdmin()) {
              <mat-card class="stat-card">
                <div class="stat-icon activity">
                  <mat-icon>timeline</mat-icon>
                </div>
                <div class="stat-content">
                  <h3>{{ logStats()?.totalLogs || 0 }}</h3>
                  <p>Activities (30 days)</p>
                </div>
                <a mat-button routerLink="/logs" class="stat-action">View Logs</a>
              </mat-card>
            }
          </div>

          @if (authService.isAdmin()) {
            <!-- Quick Actions -->
            <section class="quick-actions">
              <h2>Quick Actions</h2>
              <div class="actions-grid">
                <button mat-raised-button color="primary" routerLink="/clients" [queryParams]="{action: 'create'}">
                  <mat-icon>person_add</mat-icon>
                  Add Client
                </button>
                <button mat-raised-button color="accent" routerLink="/documents" [queryParams]="{action: 'upload'}">
                  <mat-icon>cloud_upload</mat-icon>
                  Upload Documents
                </button>
                <button mat-stroked-button routerLink="/logs">
                  <mat-icon>history</mat-icon>
                  View Activity Logs
                </button>
              </div>
            </section>

            <!-- Recent Activity -->
            <section class="recent-activity">
              <h2>Recent Activity</h2>
              <mat-card>
                @if (logStats()?.recentActivity?.length) {
                  <div class="activity-list">
                    @for (log of logStats()?.recentActivity?.slice(0, 5); track log.id) {
                      <div class="activity-item">
                        <div class="activity-icon" [class]="log.action.toLowerCase()">
                          <mat-icon>{{ getActionIcon(log.action) }}</mat-icon>
                        </div>
                        <div class="activity-content">
                          <p class="activity-description">{{ log.description }}</p>
                          <span class="activity-meta">
                            {{ log.user?.name || 'System' }} • {{ formatDate(log.createdAt) }}
                          </span>
                        </div>
                      </div>
                    }
                  </div>
                } @else {
                  <div class="empty-state">
                    <mat-icon>event_note</mat-icon>
                    <p>No recent activity</p>
                  </div>
                }
              </mat-card>
            </section>
          }
        }
      </div>
    </app-layout>
  `,
  styles: [`
    .dashboard-container {
      padding: 1.5rem;
    }

    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .dashboard-header h1 {
      margin: 0;
      font-size: 1.75rem;
    }

    .subtitle {
      color: var(--text-secondary);
      margin: 0.25rem 0 0;
    }

    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem;
      gap: 1rem;
      color: var(--text-secondary);
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .stat-icon {
      width: 56px;
      height: 56px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .stat-icon mat-icon {
      font-size: 28px;
      height: 28px;
      width: 28px;
      color: white;
    }

    .stat-icon.clients { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
    .stat-icon.documents { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); }
    .stat-icon.storage { background: linear-gradient(135deg, #ee9ca7 0%, #ffdde1 100%); }
    .stat-icon.activity { background: linear-gradient(135deg, #fc4a1a 0%, #f7b733 100%); }

    .stat-content h3 {
      font-size: 2rem;
      font-weight: 700;
      margin: 0;
    }

    .stat-content p {
      color: var(--text-secondary);
      margin: 0;
    }

    .stat-action {
      margin-top: auto;
      align-self: flex-start;
    }

    .quick-actions {
      margin-bottom: 2rem;
    }

    .quick-actions h2,
    .recent-activity h2 {
      font-size: 1.25rem;
      margin-bottom: 1rem;
    }

    .actions-grid {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .actions-grid button {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .activity-list {
      display: flex;
      flex-direction: column;
    }

    .activity-item {
      display: flex;
      gap: 1rem;
      padding: 1rem;
      border-bottom: 1px solid var(--border-color);
    }

    .activity-item:last-child {
      border-bottom: none;
    }

    .activity-icon {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--background-color);
      flex-shrink: 0;
    }

    .activity-icon mat-icon {
      font-size: 20px;
      height: 20px;
      width: 20px;
    }

    .activity-content {
      flex: 1;
    }

    .activity-description {
      margin: 0 0 0.25rem;
    }

    .activity-meta {
      font-size: 0.85rem;
      color: var(--text-secondary);
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 3rem;
      color: var(--text-secondary);
    }

    .empty-state mat-icon {
      font-size: 48px;
      height: 48px;
      width: 48px;
      margin-bottom: 1rem;
    }

    @media (max-width: 768px) {
      .dashboard-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
      }

      .actions-grid {
        flex-direction: column;
      }

      .actions-grid button {
        width: 100%;
      }
    }
  `],
})
export class DashboardComponent implements OnInit {
  authService = inject(AuthService);
  themeService = inject(ThemeService);
  private clientService = inject(ClientService);
  private documentService = inject(DocumentService);
  private logService = inject(LogService);

  isLoading = signal(true);
  clientCount = signal(0);
  storageStats = signal<StorageStats | null>(null);
  logStats = signal<LogStats | null>(null);

  ngOnInit(): void {
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    this.isLoading.set(true);

    // Load storage stats
    this.documentService.getStorageStats().subscribe({
      next: (res) => this.storageStats.set(res.data),
    });

    if (this.authService.isAdmin()) {
      // Load client count
      this.clientService.getClients(1, 1).subscribe({
        next: (res) => this.clientCount.set(res.meta.total),
      });

      // Load log stats
      this.logService.getStats(30).subscribe({
        next: (res) => this.logStats.set(res.data),
        complete: () => this.isLoading.set(false),
      });
    } else {
      this.isLoading.set(false);
    }
  }

  formatSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  }

  getActionIcon(action: string): string {
    const icons: Record<string, string> = {
      LOGIN: 'login',
      LOGOUT: 'logout',
      CLIENT_CREATED: 'person_add',
      CLIENT_UPDATED: 'edit',
      CLIENT_DELETED: 'person_remove',
      DOCUMENT_UPLOADED: 'cloud_upload',
      DOCUMENT_DOWNLOADED: 'cloud_download',
      DOCUMENT_DELETED: 'delete',
    };
    return icons[action] || 'event';
  }
}
