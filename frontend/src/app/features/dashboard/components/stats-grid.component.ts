import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  heroUsersSolid,
  heroFolderSolid,
  heroCloudArrowUpSolid,
  heroListBulletSolid
} from '@ng-icons/heroicons/solid';

@Component({
  selector: 'app-stats-grid',
  standalone: true,
  imports: [CommonModule, RouterLink, NgIconComponent],
  template: `
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      @if (isAdmin()) {
        <div class="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl shadow-slate-100 dark:shadow-slate-900/50 hover:-translate-y-2 transition-transform duration-500 group relative overflow-hidden">
          <div class="absolute -top-10 -right-10 w-32 h-32 bg-blue-50 dark:bg-blue-900/20 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-700"></div>
          <div class="relative z-10 flex flex-col h-full justify-between">
            <div class="flex justify-between items-start">
              <div class="p-4 bg-blue-600 text-white rounded-[1.25rem] shadow-lg shadow-blue-100 dark:shadow-blue-900/30">
                <ng-icon name="heroUsersSolid" size="28"></ng-icon>
              </div>
              <div class="text-[10px] font-black bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1.5 rounded-full uppercase tracking-widest">Active</div>
            </div>
            <div class="mt-8">
              <p class="text-slate-400 font-black text-[10px] uppercase tracking-widest mb-1">Total Network</p>
              <h3 class="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">{{ clientCount() || 0 }} Clients</h3>
            </div>
          </div>
          <a routerLink="/clients" class="absolute inset-0 z-20 cursor-pointer"></a>
        </div>
      }

      <div class="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl shadow-slate-100 dark:shadow-slate-900/50 hover:-translate-y-2 transition-transform duration-500 group relative">
        <div class="flex justify-between items-start">
          <div class="p-4 bg-emerald-500 text-white rounded-[1.25rem] shadow-lg shadow-emerald-100 dark:shadow-emerald-900/30">
            <ng-icon name="heroFolderSolid" size="28"></ng-icon>
          </div>
        </div>
        <div class="mt-8">
          <p class="text-slate-400 font-black text-[10px] uppercase tracking-widest mb-1">Assets Managed</p>
          <h3 class="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">{{ documentCount() || 0 }} Docs</h3>
        </div>
        <a routerLink="/documents" class="absolute inset-0 z-20 cursor-pointer"></a>
      </div>

      <div class="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl shadow-slate-100 dark:shadow-slate-900/50 hover:-translate-y-2 transition-transform duration-500 group">
        <div class="flex justify-between items-start">
          <div class="p-4 bg-purple-500 text-white rounded-[1.25rem] shadow-lg shadow-purple-100 dark:shadow-purple-900/30">
            <ng-icon name="heroCloudArrowUpSolid" size="28"></ng-icon>
          </div>
        </div>
        <div class="mt-8">
          <p class="text-slate-400 font-black text-[10px] uppercase tracking-widest mb-1">Volume Used</p>
          <h3 class="text-4xl font-black text-slate-900 dark:text-white tracking-tighter shrink-0">{{ formatSize(totalSize() || 0) }}</h3>
        </div>
      </div>

      <div class="bg-slate-900 dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-2xl shadow-slate-200 dark:shadow-black/50 hover:-translate-y-2 transition-transform duration-500 group">
        <div class="flex justify-between items-start">
          <div class="p-4 bg-slate-800 dark:bg-slate-700 text-blue-400 rounded-[1.25rem] border border-slate-700 dark:border-slate-600">
            <ng-icon name="heroListBulletSolid" size="28"></ng-icon>
          </div>
        </div>
        <div class="mt-8">
          <p class="text-slate-500 font-black text-[10px] uppercase tracking-widest mb-1">Audit Events</p>
          <h3 class="text-4xl font-black text-white tracking-tighter">{{ totalLogs() || 0 }} Logged</h3>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    provideIcons({ heroUsersSolid, heroFolderSolid, heroCloudArrowUpSolid, heroListBulletSolid })
  ]
})
export class StatsGridComponent {
  isAdmin = input<boolean>(false);
  clientCount = input<number>(0);
  documentCount = input<number>(0);
  totalSize = input<number>(0);
  totalLogs = input<number>(0);

  formatSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
