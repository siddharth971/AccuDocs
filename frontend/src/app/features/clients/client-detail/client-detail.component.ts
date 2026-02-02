import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { ClientService, Client } from '@core/services/client.service';
import { NotificationService } from '@core/services/notification.service';

@Component({
  selector: 'app-client-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatIconModule,
    MatProgressSpinnerModule,
    MatMenuModule,
  ],
  template: `
    <div class="w-full space-y-6">
      @if (isLoading()) {
        <div class="flex flex-col items-center justify-center py-20">
          <mat-spinner diameter="40"></mat-spinner>
          <p class="mt-4 text-text-secondary">Loading client details...</p>
        </div>
      } @else if (client()) {
        <!-- Header -->
        <header class="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div class="flex items-start gap-4">
            <a 
              routerLink="/clients" 
              class="p-2 rounded-lg bg-white dark:bg-slate-800 border border-border-color hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
            >
              <mat-icon class="text-slate-600 dark:text-slate-300">arrow_back</mat-icon>
            </a>
            <div>
              <h1 class="text-2xl font-bold text-text-primary">{{ client()?.user?.name }}</h1>
              <div class="flex items-center gap-2 mt-2">
                <span class="px-3 py-1 text-sm font-mono font-semibold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full">
                  {{ client()?.code }}
                </span>
                <span 
                  [class]="client()?.user?.isActive 
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'"
                  class="px-3 py-1 text-sm font-semibold rounded-full"
                >
                  {{ client()?.user?.isActive ? 'Active' : 'Inactive' }}
                </span>
              </div>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <a [routerLink]="['edit']" class="btn-secondary">
              <mat-icon class="text-lg">edit</mat-icon>
              Edit
            </a>
            <button 
              [matMenuTriggerFor]="menu"
              class="btn-icon border border-border-color"
            >
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

        <!-- Content Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Client Info Card -->
          <div class="bg-white dark:bg-slate-800 rounded-xl border border-border-color shadow-sm overflow-hidden">
            <div class="px-6 py-4 border-b border-border-color bg-slate-50 dark:bg-slate-900/50 flex items-center gap-3">
              <div class="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                <mat-icon class="text-primary-600 dark:text-primary-400">person</mat-icon>
              </div>
              <h2 class="font-semibold text-text-primary">Client Information</h2>
            </div>
            <div class="divide-y divide-border-color">
              <div class="flex justify-between items-center px-6 py-4">
                <span class="text-text-secondary">Mobile</span>
                <span class="font-medium text-text-primary">{{ client()?.user?.mobile }}</span>
              </div>
              <div class="flex justify-between items-center px-6 py-4">
                <span class="text-text-secondary">Created</span>
                <span class="font-medium text-text-primary">{{ client()?.createdAt | date:'mediumDate' }}</span>
              </div>
              <div class="flex justify-between items-center px-6 py-4">
                <span class="text-text-secondary">Total Documents</span>
                <span class="font-bold text-primary-600">{{ getTotalDocuments() }}</span>
              </div>
            </div>
          </div>

          <!-- Years/Documents Card -->
          <div class="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl border border-border-color shadow-sm overflow-hidden">
            <div class="px-6 py-4 border-b border-border-color bg-slate-50 dark:bg-slate-900/50 flex items-center gap-3">
              <div class="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                <mat-icon class="text-amber-600 dark:text-amber-400">folder</mat-icon>
              </div>
              <h2 class="font-semibold text-text-primary">Document Folders</h2>
            </div>
            @if (client()?.years?.length) {
              <div class="divide-y divide-border-color">
                @for (year of client()?.years; track year.id) {
                  <a 
                    [routerLink]="['/documents']" 
                    [queryParams]="{yearId: year.id}"
                    class="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group"
                  >
                    <div class="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg group-hover:bg-primary-100 dark:group-hover:bg-primary-900/30 transition-colors">
                      <mat-icon class="text-slate-500 group-hover:text-primary-600 transition-colors">folder</mat-icon>
                    </div>
                    <div class="flex-1">
                      <p class="font-semibold text-text-primary">{{ year.year }}</p>
                      <p class="text-sm text-text-secondary">{{ year.documentCount || 0 }} documents</p>
                    </div>
                    <mat-icon class="text-slate-400 group-hover:text-primary-600 transition-colors">chevron_right</mat-icon>
                  </a>
                }
              </div>
            } @else {
              <div class="flex flex-col items-center justify-center py-16 text-center">
                <mat-icon class="text-5xl text-text-muted mb-3">folder_off</mat-icon>
                <h3 class="font-semibold text-text-primary mb-1">No document folders</h3>
                <p class="text-sm text-text-secondary">Document folders will appear here when created.</p>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [``],
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
