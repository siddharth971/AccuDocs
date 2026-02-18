import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroClockSolid, heroCloudArrowUpSolid, heroDocumentArrowDownSolid } from '@ng-icons/heroicons/solid';

@Component({
  selector: 'app-welcome-header',
  standalone: true,
  imports: [CommonModule, RouterLink, NgIconComponent],
  template: `
    <header class="flex flex-col lg:flex-row lg:items-end justify-between gap-8" style="margin-bottom: 48px;">
      <div>
        <!-- Section label with underline accent -->
        <div class="flex items-center gap-2 text-[#0074c9] dark:text-blue-400 font-bold text-[11px] uppercase" style="letter-spacing: 0.12em;">
          DASHBOARD
        </div>
        <div class="w-8 h-[3px] bg-[#0074c9] dark:bg-blue-400 rounded-full mt-2 mb-4"></div>

        <!-- Greeting headline -->
        <h1
          class="text-4xl font-black text-slate-900 dark:text-white"
          style="letter-spacing: -0.03em; line-height: 1.1;"
        >
          Good {{ getGreeting() }}, <span class="text-[#0074c9] dark:text-blue-400">{{ userName() }}</span>
        </h1>
        <p class="text-[15px] font-medium text-slate-500 dark:text-slate-400 mt-2">
          Here's what's happening across your workspace today.
        </p>
      </div>

      <!-- Action buttons -->
      <div class="flex flex-wrap gap-3">
        <button
          class="btn-secondary flex items-center gap-2"
          style="height: 48px; padding: 0 24px;"
          routerLink="/logs"
        >
          <ng-icon name="heroDocumentArrowDownSolid" size="18"></ng-icon>
          Export Report
        </button>
        <button
          class="btn-primary flex items-center gap-2"
          style="height: 48px; padding: 0 28px;"
          routerLink="/documents"
          [queryParams]="{action: 'upload'}"
        >
          <ng-icon name="heroCloudArrowUpSolid" size="18"></ng-icon>
          New Document
        </button>
      </div>
    </header>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    provideIcons({ heroClockSolid, heroCloudArrowUpSolid, heroDocumentArrowDownSolid })
  ]
})
export class WelcomeHeaderComponent {
  userName = input<string | undefined>('');

  getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
  }
}
