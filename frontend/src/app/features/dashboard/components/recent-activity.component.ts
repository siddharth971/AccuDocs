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

@Component({
  selector: 'app-recent-activity',
  standalone: true,
  imports: [CommonModule, RouterLink, NgIconComponent],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between border-l-4 border-blue-600 pl-4 py-2">
        <h2 class="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Activity Feed</h2>
        <button routerLink="/logs" class="text-sm font-black text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors flex items-center gap-1 group">
          Full Report
          <ng-icon name="heroArrowUpRightSolid" size="18" class="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"></ng-icon>
        </button>
      </div>

      <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl shadow-slate-100 dark:shadow-slate-900/50 overflow-hidden">
        @if (isLoading()) {
          <div class="py-32 flex flex-col items-center justify-center gap-4">
            <div class="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
            <span class="text-slate-400 font-bold tracking-widest uppercase text-[10px]">Processing Stream...</span>
          </div>
        } @else if (activities().length) {
          <div class="divide-y divide-slate-100 dark:divide-slate-800">
            @for (log of activities().slice(0, 6); track log.id) {
              <div class="flex items-center gap-6 p-8 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-all cursor-pointer group">
                <div class="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shadow-sm shrink-0">
                   <ng-icon [name]="getActionIcon(log.action)" size="24"></ng-icon>
                </div>
                <div class="flex-1 space-y-1 min-w-0">
                  <p class="text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors truncate">{{ log.description }}</p>
                  <div class="flex items-center gap-3 text-sm font-semibold text-slate-400">
                    <span class="text-slate-600 dark:text-slate-300">{{ log.user?.name || 'System Auto' }}</span>
                    <span class="w-1 h-1 bg-slate-300 dark:bg-slate-600 rounded-full"></span>
                    <span>{{ formatDate(log.createdAt) }}</span>
                  </div>
                </div>
                <div class="hidden sm:block px-4 py-2 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 rounded-xl text-[10px] font-black uppercase tracking-wider group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 group-hover:text-blue-700 dark:group-hover:text-blue-300 group-hover:border-blue-100 dark:group-hover:border-blue-800 transition-all whitespace-nowrap">
                  {{ log.action.split('_').pop() }}
                </div>
              </div>
            }
          </div>
        } @else {
          <div class="py-32 text-center space-y-4">
            <div class="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-200 dark:text-slate-600">
              <ng-icon name="heroClockSolid" size="40"></ng-icon>
            </div>
            <p class="text-slate-400 font-bold">No recent activities found.</p>
          </div>
        }
      </div>
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

  getActionIcon(action: string): string {
    if (action.includes('DELETE')) return 'heroTrashSolid';
    if (action.includes('UPDATE')) return 'heroPencilSquareSolid';
    if (action.includes('CREATE')) return 'heroPlusCircleSolid';
    if (action.includes('LOGIN')) return 'heroArrowRightOnRectangleSolid';
    return 'heroCheckCircleSolid';
  }
}
