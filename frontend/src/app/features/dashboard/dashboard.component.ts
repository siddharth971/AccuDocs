import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { AuthService } from '@core/services/auth.service';
import { ClientService } from '@core/services/client.service';
import { DocumentService } from '@core/services/document.service';
import { LogService } from '@core/services/log.service';
import { of, map } from 'rxjs';

import { WelcomeHeaderComponent } from './components/welcome-header.component';
import { StatsGridComponent } from './components/stats-grid.component';
import { RecentActivityComponent } from './components/recent-activity.component';
import { QuickInsightsComponent } from './components/quick-insights.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    WelcomeHeaderComponent,
    StatsGridComponent,
    RecentActivityComponent,
    QuickInsightsComponent
  ],
  template: `
    <div class="animate-page-enter">

      <app-welcome-header [userName]="authService.currentUser()?.name"></app-welcome-header>

      <app-stats-grid
        [isAdmin]="authService.isAdmin()"
        [clientCount]="clientCountResource.value() || 0"
        [documentCount]="storageStatsResource.value()?.documentCount || 0"
        [totalSize]="storageStatsResource.value()?.totalSize || 0"
        [totalLogs]="logStatsResource.value()?.totalLogs || 0"
      ></app-stats-grid>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
         <!-- Activity Column (8/12) -->
         <div class="lg:col-span-8">
            <app-recent-activity
              [activities]="logStatsResource.value()?.recentActivity || []"
              [isLoading]="logStatsResource.isLoading()"
            ></app-recent-activity>
         </div>

         <!-- Insights Sidebar (4/12) -->
         <div class="lg:col-span-4">
            <app-quick-insights></app-quick-insights>
         </div>
      </div>

    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {
  authService = inject(AuthService);
  private clientService = inject(ClientService);
  private documentService = inject(DocumentService);
  private logService = inject(LogService);

  storageStatsResource = rxResource({
    loader: () => this.documentService.getStorageStats().pipe(map((res) => res.data)),
  });

  clientCountResource = rxResource({
    request: () => this.authService.isAdmin(),
    loader: ({ request: isAdmin }: { request: boolean }) =>
      isAdmin
        ? this.clientService.getClients(1, 1).pipe(map((res) => res.meta.total))
        : of(0),
  });

  logStatsResource = rxResource({
    request: () => this.authService.isAdmin(),
    loader: ({ request: isAdmin }: { request: boolean }) =>
      isAdmin
        ? this.logService.getStats(30).pipe(map((res) => res.data))
        : of(null),
  });
}
