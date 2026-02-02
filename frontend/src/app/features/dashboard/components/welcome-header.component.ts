import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroClockSolid, heroCloudArrowUpSolid } from '@ng-icons/heroicons/solid';

@Component({
  selector: 'app-welcome-header',
  standalone: true,
  imports: [CommonModule, RouterLink, NgIconComponent],
  template: `
    <header class="flex flex-col lg:flex-row lg:items-end justify-between gap-8 border-b border-slate-200 dark:border-slate-800 pb-10">
      <div class="space-y-2">
        <div class="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-black text-xs uppercase tracking-[0.2em]">
          <span class="w-8 h-[2px] bg-blue-600 dark:bg-blue-400"></span>
          System Overview
        </div>
        <h1 class="text-5xl font-black text-slate-900 dark:text-white tracking-tight">
          Welcome, <span class="text-blue-600 dark:text-blue-400 underline decoration-blue-200 dark:decoration-blue-900 decoration-8 underline-offset-[12px]">{{ userName() }}</span>
        </h1>
        <p class="text-slate-500 dark:text-slate-400 font-bold text-lg pt-2">
          Managing your accountant workflow and digital assets.
        </p>
      </div>
      <div class="flex flex-wrap gap-4">
         <button class="px-6 py-4 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all flex items-center gap-2 shadow-sm active:scale-95" routerLink="/logs">
           <ng-icon name="heroClockSolid" size="20"></ng-icon>
           History
         </button>
         <button class="px-8 py-4 bg-blue-600 border-2 border-blue-600 rounded-2xl font-black text-white hover:bg-blue-700 transition-all flex items-center gap-2 shadow-xl shadow-blue-100 dark:shadow-blue-900/20 active:scale-95" routerLink="/documents" [queryParams]="{action: 'upload'}">
           <ng-icon name="heroCloudArrowUpSolid" size="20"></ng-icon>
           Upload Now
         </button>
      </div>
    </header>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    provideIcons({ heroClockSolid, heroCloudArrowUpSolid })
  ]
})
export class WelcomeHeaderComponent {
  userName = input<string | undefined>('');
}
