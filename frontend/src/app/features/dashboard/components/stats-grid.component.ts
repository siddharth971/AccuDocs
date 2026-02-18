import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  heroUsersSolid,
  heroFolderSolid,
  heroCircleStackSolid,
  heroClockSolid
} from '@ng-icons/heroicons/solid';

interface StatItem {
  label: string;
  value: string;
  icon: string;
  iconBg: string;
  iconColor: string;
  link?: string;
}

@Component({
  selector: 'app-stats-grid',
  standalone: true,
  imports: [CommonModule, RouterLink, NgIconComponent],
  template: `
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" style="margin-bottom: 48px;">
      @for (stat of getStats(); track stat.label; let i = $index) {
        <div
          class="relative bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700/50 rounded-3xl overflow-hidden transition-all duration-[400ms] cursor-pointer group"
          style="padding: 28px 32px; box-shadow: 0 4px 24px -4px rgba(15, 23, 42, 0.05);"
          [class.hover:-translate-y-1.5]="true"
          [style.animation-delay]="(i * 80) + 'ms'"
        >
          <!-- Top row: label + icon -->
          <div class="flex justify-between items-start">
            <p class="text-[13px] font-semibold text-slate-500 dark:text-slate-400">{{ stat.label }}</p>
            <div
              class="w-11 h-11 rounded-[14px] flex items-center justify-center shrink-0"
              [style.background]="stat.iconBg"
            >
              <ng-icon [name]="stat.icon" size="22" [style.color]="stat.iconColor"></ng-icon>
            </div>
          </div>

          <!-- Metric value -->
          <h3
            class="text-[40px] font-black text-slate-900 dark:text-white mt-3"
            style="letter-spacing: -0.03em; line-height: 1;"
          >
            {{ stat.value }}
          </h3>

          <!-- Hover card lift -->
          @if (stat.link) {
            <a [routerLink]="stat.link" class="absolute inset-0 z-10"></a>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    :host div.group:hover {
      transform: translateY(-6px);
      box-shadow: 0 20px 40px -8px rgba(15, 23, 42, 0.1);
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    provideIcons({ heroUsersSolid, heroFolderSolid, heroCircleStackSolid, heroClockSolid })
  ]
})
export class StatsGridComponent {
  isAdmin = input<boolean>(false);
  clientCount = input<number>(0);
  documentCount = input<number>(0);
  totalSize = input<number>(0);
  totalLogs = input<number>(0);

  getStats(): StatItem[] {
    const stats: StatItem[] = [];

    if (this.isAdmin()) {
      stats.push({
        label: 'Total Clients',
        value: String(this.clientCount() || 0),
        icon: 'heroUsersSolid',
        iconBg: '#eff6ff',
        iconColor: '#0074c9',
        link: '/clients',
      });
    }

    stats.push(
      {
        label: 'Documents',
        value: String(this.documentCount() || 0),
        icon: 'heroFolderSolid',
        iconBg: '#f0fdf4',
        iconColor: '#16a34a',
        link: '/documents',
      },
      {
        label: 'Storage Used',
        value: this.formatSize(this.totalSize() || 0),
        icon: 'heroCircleStackSolid',
        iconBg: '#fefce8',
        iconColor: '#d97706',
      },
      {
        label: 'Activity Logs',
        value: String(this.totalLogs() || 0),
        icon: 'heroClockSolid',
        iconBg: '#fdf2f8',
        iconColor: '#db2777',
        link: '/logs',
      }
    );

    return stats;
  }

  formatSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }
}
