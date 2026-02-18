import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  heroArrowUpRightSolid,
  heroTrashSolid,
  heroPencilSquareSolid,
  heroPlusCircleSolid,
  heroArrowRightOnRectangleSolid,
  heroCheckCircleSolid,
  heroClockSolid
} from '@ng-icons/heroicons/solid';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const DOT_COLORS = ['#0074c9', '#16a34a', '#d97706', '#db2777'];

@Component({
  selector: 'app-recent-activity',
  standalone: true,
  imports: [CommonModule, RouterLink, NgIconComponent],
  template: `
    <div
      class="bg-white dark:bg-[#1e293b] rounded-3xl border border-slate-200 dark:border-slate-700/50 overflow-hidden"
      style="box-shadow: 0 4px 24px -4px rgba(15, 23, 42, 0.05);"
    >
      <!-- Card header -->
      <div class="flex items-center justify-between px-8 py-5 border-b border-slate-100 dark:border-slate-700/50">
        <h2 class="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">Recent Activity</h2>
        <a
          routerLink="/logs"
          class="text-[13px] font-semibold text-[#0074c9] dark:text-blue-400 hover:text-[#005fa3] transition-colors flex items-center gap-1 group"
        >
          View All
          <ng-icon name="heroArrowUpRightSolid" size="14" class="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"></ng-icon>
        </a>
      </div>

      <!-- Content -->
      @if (isLoading()) {
        <!-- Skeleton loading -->
        <div class="divide-y divide-slate-100 dark:divide-slate-700/30">
          @for (i of [1,2,3,4,5]; track i) {
            <div class="flex items-center gap-4 px-8 py-5">
              <div class="w-2 h-2 rounded-full skeleton shrink-0"></div>
              <div class="flex-1 space-y-2">
                <div class="skeleton h-4 w-3/4 rounded"></div>
                <div class="skeleton h-3 w-1/2 rounded"></div>
              </div>
              <div class="skeleton h-3 w-16 rounded"></div>
            </div>
          }
        </div>
      } @else if (activities().length) {
        <div class="divide-y divide-slate-50 dark:divide-slate-700/30">
          @for (log of activities().slice(0, 6); track log.id; let i = $index) {
            <div
              class="flex items-start gap-4 px-8 py-5 hover:bg-[#f8fafc] dark:hover:bg-slate-800/30 transition-colors cursor-pointer"
            >
              <!-- Colored dot -->
              <div
                class="w-2 h-2 rounded-full shrink-0 mt-1.5"
                [style.background]="getDotColor(i)"
              ></div>

              <!-- Content -->
              <div class="flex-1 min-w-0">
                <p class="text-sm font-semibold text-slate-900 dark:text-white truncate">
                  {{ log.description }}
                </p>
                <p class="text-[13px] font-normal text-slate-500 dark:text-slate-400 mt-1">
                  {{ log.user?.name || 'System' }}
                </p>
              </div>

              <!-- Timestamp -->
              <span
                class="text-xs font-medium text-slate-400 dark:text-slate-500 whitespace-nowrap shrink-0"
                style="font-family: var(--font-mono);"
              >
                {{ formatDate(log.createdAt) }}
              </span>
            </div>
          }
        </div>
      } @else {
        <!-- Empty state -->
        <div class="py-20 flex flex-col items-center justify-center gap-3 text-center px-8">
          <div class="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center">
            <ng-icon name="heroClockSolid" size="32" class="text-slate-200 dark:text-slate-600"></ng-icon>
          </div>
          <h3 class="text-base font-bold text-slate-900 dark:text-white">No recent activity</h3>
          <p class="text-sm text-slate-400">Activity will appear here as you and your team work.</p>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    provideIcons({
      heroArrowUpRightSolid,
      heroTrashSolid,
      heroPencilSquareSolid,
      heroPlusCircleSolid,
      heroArrowRightOnRectangleSolid,
      heroCheckCircleSolid,
      heroClockSolid
    })
  ]
})
export class RecentActivityComponent {
  activities = input<any[]>([]);
  isLoading = input<boolean>(false);

  formatDate(date: string): string {
    return dayjs(date).fromNow();
  }

  getDotColor(index: number): string {
    return DOT_COLORS[index % DOT_COLORS.length];
  }

  getActionIcon(action: string): string {
    if (action.includes('DELETE')) return 'heroTrashSolid';
    if (action.includes('UPDATE')) return 'heroPencilSquareSolid';
    if (action.includes('CREATE')) return 'heroPlusCircleSolid';
    if (action.includes('LOGIN')) return 'heroArrowRightOnRectangleSolid';
    return 'heroCheckCircleSolid';
  }
}
