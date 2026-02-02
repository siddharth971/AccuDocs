import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-quick-insights',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-8">
      <h2 class="text-3xl font-black text-slate-900 dark:text-white tracking-tight border-l-4 border-slate-900 dark:border-white pl-4 py-2">Quick Stats</h2>
      
      <div class="bg-blue-600 dark:bg-blue-700 p-8 rounded-[2.5rem] text-white shadow-[0_20px_50px_rgba(37,99,235,0.3)] dark:shadow-none relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
        <div class="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none"></div>
        <div class="relative z-10 space-y-6">
          <div>
            <h4 class="text-xl font-black">Data Integrity</h4>
            <p class="text-blue-100 font-medium text-sm mt-2 leading-relaxed italic">Encryption 256-bit active. GDPR protocols maintained.</p>
          </div>
          <div class="space-y-3">
            <div class="flex justify-between items-end">
              <span class="text-blue-100 text-[10px] font-black uppercase tracking-widest">Confidence Score</span>
              <span class="text-2xl font-black leading-none">94.2%</span>
            </div>
            <div class="h-4 bg-white/20 rounded-full overflow-hidden p-1">
              <div class="w-[94%] h-full bg-white rounded-full shadow-inner animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl shadow-slate-100 dark:shadow-slate-900/50 space-y-6">
         <div class="space-y-1">
           <h4 class="text-lg font-black text-slate-900 dark:text-white tracking-tight">Client Satisfaction</h4>
           <p class="text-slate-400 font-bold text-xs uppercase tracking-widest">Q1 Benchmark</p>
         </div>
         <div class="grid grid-cols-2 gap-4">
            <div class="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 text-center hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
              <span class="block text-2xl font-black text-slate-900 dark:text-white">4.9/5</span>
              <span class="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Rating</span>
            </div>
            <div class="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 text-center hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
              <span class="block text-2xl font-black text-slate-900 dark:text-white">~2h</span>
              <span class="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Turnaround</span>
            </div>
         </div>
         <button class="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-sm hover:bg-slate-800 dark:hover:bg-slate-200 transition-all uppercase tracking-widest shadow-xl active:scale-95">
           Generate Insight Report
         </button>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuickInsightsComponent { }
