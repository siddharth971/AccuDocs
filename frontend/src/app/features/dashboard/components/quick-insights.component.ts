import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroShieldCheckSolid, heroDocumentTextSolid, heroBoltSolid } from '@ng-icons/heroicons/solid';

@Component({
  selector: 'app-quick-insights',
  standalone: true,
  imports: [CommonModule, NgIconComponent],
  template: `
    <div class="space-y-6">
      <!-- Data Integrity Card (Blue accent panel) -->
      <div
        class="bg-[#0074c9] dark:bg-blue-700 rounded-3xl text-white relative overflow-hidden group transition-transform duration-300 hover:scale-[1.02]"
        style="padding: 28px 32px; box-shadow: 0 20px 40px -8px rgba(0, 116, 201, 0.3);"
      >
        <div class="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none"></div>
        <div class="relative z-10 space-y-5">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <ng-icon name="heroShieldCheckSolid" size="20"></ng-icon>
            </div>
            <h4 class="text-lg font-extrabold">Data Integrity</h4>
          </div>
          <p class="text-blue-100 font-medium text-sm leading-relaxed">
            Encryption 256-bit active. All data secured with GDPR-compliant protocols.
          </p>
          <div class="space-y-2.5">
            <div class="flex justify-between items-end">
              <span class="text-blue-100 text-[10px] font-bold uppercase tracking-widest">Confidence Score</span>
              <span class="text-2xl font-black leading-none">94.2%</span>
            </div>
            <div class="h-2.5 bg-white/20 rounded-full overflow-hidden">
              <div class="w-[94%] h-full bg-white rounded-full transition-all duration-1000"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Stats Card -->
      <div
        class="bg-white dark:bg-[#1e293b] rounded-3xl border border-slate-200 dark:border-slate-700/50"
        style="padding: 28px 32px; box-shadow: 0 4px 24px -4px rgba(15, 23, 42, 0.05);"
      >
        <h4 class="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">Quick Stats</h4>
        <p class="text-slate-400 font-semibold text-[10px] uppercase tracking-widest mt-1 mb-5">Workspace Overview</p>

        <div class="space-y-0 divide-y divide-slate-100 dark:divide-slate-700/50">
          <!-- Insight rows -->
          @for (insight of insights; track insight.label) {
            <div class="flex items-center justify-between py-4">
              <div class="flex items-center gap-3">
                <div
                  class="w-9 h-9 rounded-xl flex items-center justify-center"
                  [style.background]="insight.bg"
                >
                  <ng-icon [name]="insight.icon" size="18" [style.color]="insight.color"></ng-icon>
                </div>
                <span class="text-[13px] font-semibold text-slate-600 dark:text-slate-300">{{ insight.label }}</span>
              </div>
              <span class="text-sm font-extrabold text-slate-900 dark:text-white">{{ insight.value }}</span>
            </div>
          }
        </div>

        <button
          class="w-full mt-5 py-3.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-bold text-sm hover:bg-slate-800 dark:hover:bg-slate-100 transition-all active:scale-[0.97]"
          style="box-shadow: 0 8px 24px -4px rgba(0,0,0,0.15);"
        >
          Generate Report
        </button>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    provideIcons({ heroShieldCheckSolid, heroDocumentTextSolid, heroBoltSolid })
  ]
})
export class QuickInsightsComponent {
  insights = [
    { label: 'Documents this week', value: '12', icon: 'heroDocumentTextSolid', bg: '#eff6ff', color: '#0074c9' },
    { label: 'Active clients', value: '8', icon: 'heroBoltSolid', bg: '#f0fdf4', color: '#16a34a' },
    { label: 'Avg. turnaround', value: '~2h', icon: 'heroShieldCheckSolid', bg: '#fefce8', color: '#d97706' },
  ];
}
