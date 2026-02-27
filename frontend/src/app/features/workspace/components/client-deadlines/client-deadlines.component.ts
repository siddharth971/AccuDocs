import { Component, Input, OnChanges, SimpleChanges, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ComplianceService, ClientDeadlineAssignment } from '@core/services/compliance.service';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  heroClockSolid,
  heroCheckCircleSolid,
  heroCalendarSolid,
  heroArchiveBoxSolid
} from '@ng-icons/heroicons/solid';

@Component({
  selector: 'app-client-deadlines',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIconComponent],
  template: `
    <div class="p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-xl font-bold text-slate-900 dark:text-white">Tax & Compliance Deadlines</h2>
          <p class="text-sm text-slate-500 dark:text-slate-400">Track assigned compliance deadlines for this client.</p>
        </div>
      </div>

      <!-- Stats Overview -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-bold uppercase text-slate-500 tracking-wider">Total</span>
            <div class="p-1.5 bg-slate-100 dark:bg-slate-700 rounded-lg">
              <ng-icon name="heroArchiveBoxSolid" class="text-slate-500"></ng-icon>
            </div>
          </div>
          <p class="text-2xl font-black text-slate-900 dark:text-white">{{ deadlines().length }}</p>
        </div>
        <div class="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-bold uppercase text-blue-500 tracking-wider">Pending</span>
            <div class="p-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <ng-icon name="heroClockSolid" class="text-blue-500"></ng-icon>
            </div>
          </div>
          <p class="text-2xl font-black text-slate-900 dark:text-white">{{ getCountByStatus('pending') }}</p>
        </div>
        <div class="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-bold uppercase text-green-500 tracking-wider">Filed</span>
            <div class="p-1.5 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <ng-icon name="heroCheckCircleSolid" class="text-green-500"></ng-icon>
            </div>
          </div>
          <p class="text-2xl font-black text-slate-900 dark:text-white">{{ getCountByStatus('filed') }}</p>
        </div>
        <div class="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-bold uppercase text-red-500 tracking-wider">Overdue</span>
            <div class="p-1.5 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <ng-icon name="heroClockSolid" class="text-red-500"></ng-icon>
            </div>
          </div>
          <p class="text-2xl font-black text-slate-900 dark:text-white">{{ getCountByStatus('overdue') }}</p>
        </div>
      </div>

      <!-- Deadline List -->
      <div class="grid gap-4">
        @if (loading()) {
          <div class="flex flex-col items-center justify-center p-12">
            <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600 mb-4"></div>
            <p class="text-slate-500 font-medium">Loading deadlines...</p>
          </div>
        } @else if (deadlines().length === 0) {
          <div class="flex flex-col items-center justify-center py-16 bg-white dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
            <div class="p-4 bg-slate-50 dark:bg-slate-800 rounded-full mb-4">
              <ng-icon name="heroCalendarSolid" size="32" class="text-slate-400"></ng-icon>
            </div>
            <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-1">No deadlines found</h3>
            <p class="text-sm text-slate-500 dark:text-slate-400 max-w-xs text-center mb-6">No compliance tasks assigned to this client yet.</p>
          </div>
        } @else {
          @for (dl of deadlines(); track dl.id) {
            <div class="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
              
              <div class="flex items-start gap-4">
                <div class="text-3xl mt-1">{{ getTypeEmoji(dl.deadline?.type || '') }}</div>
                <div>
                  <div class="flex items-center gap-2 mb-1">
                    <span
                      class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
                      [style.background]="getTypeAccent(dl.deadline?.type || '') + '18'"
                      [style.color]="getTypeAccent(dl.deadline?.type || '')"
                    >
                      {{ dl.deadline?.type === 'ADVANCE_TAX' ? 'ADVANCE TAX' : dl.deadline?.type }}
                    </span>
                    <h3 class="font-bold text-slate-900 dark:text-white text-base">{{ dl.deadline?.title }}</h3>
                  </div>
                  <div class="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400 mt-2">
                    <div class="flex items-center gap-1.5" [class.text-red-500]="isDueOverdue(dl)">
                      <ng-icon name="heroClockSolid" size="14"></ng-icon>
                      <span class="font-medium">Due: {{ dl.deadline?.dueDate | date:'mediumDate' }}</span>
                    </div>
                    @if (dl.deadline?.recurring) {
                      <div class="flex items-center gap-1.5">
                        <span class="bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded text-xs">🔄 {{ dl.deadline?.recurringPattern }}</span>
                      </div>
                    }
                  </div>
                </div>
              </div>
              
              <div class="flex items-center gap-3">
                <select
                  [value]="dl.status"
                  (change)="updateStatus(dl.id, $any($event.target).value)"
                  class="px-3 py-1.5 rounded-lg text-sm font-semibold outline-none cursor-pointer border"
                  [ngClass]="{
                    'bg-green-50 text-green-600 border-green-200 dark:bg-green-900/20 dark:border-green-800': dl.status === 'filed',
                    'bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20 dark:border-red-800': dl.status === 'overdue',
                    'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800': dl.status === 'pending'
                  }"
                >
                  <option value="pending" class="text-slate-900 bg-white">⏳ Pending</option>
                  <option value="filed" class="text-slate-900 bg-white">✅ Filed</option>
                  <option value="overdue" class="text-slate-900 bg-white">🔴 Overdue</option>
                </select>
              </div>

            </div>
          }
        }
      </div>
    </div>
  `,
  providers: [
    provideIcons({
      heroClockSolid,
      heroCheckCircleSolid,
      heroCalendarSolid,
      heroArchiveBoxSolid
    })
  ]
})
export class ClientDeadlinesComponent implements OnChanges {
  @Input({ required: true }) clientId!: string;

  private complianceService = inject(ComplianceService);

  deadlines = signal<ClientDeadlineAssignment[]>([]);
  loading = signal(false);

  ngOnChanges(changes: SimpleChanges) {
    if (changes['clientId'] && this.clientId) {
      this.loadData();
    }
  }

  loadData() {
    this.loading.set(true);
    this.complianceService.getClientDeadlines({ clientId: this.clientId }).subscribe({
      next: (res) => {
        if (res.success) {
          this.deadlines.set(res.data || []);
        }
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  getCountByStatus(status: string): number {
    return this.deadlines().filter(d => d.status === status).length;
  }

  isDueOverdue(dl: ClientDeadlineAssignment): boolean {
    if (dl.status === 'filed') return false;
    if (!dl.deadline?.dueDate) return false;
    return new Date(dl.deadline.dueDate) < new Date();
  }

  updateStatus(id: string, status: string) {
    this.complianceService.updateClientDeadline(id, { status: status as any }).subscribe({
      next: (res) => {
        if (res.success) {
          this.loadData();
        }
      }
    });
  }

  getTypeEmoji(type: string): string {
    const emojis: Record<string, string> = { GST: '🧾', ITR: '📄', TDS: '💰', ROC: '🏢', ADVANCE_TAX: '💳', OTHER: '📌' };
    return emojis[type] || '📌';
  }

  getTypeAccent(type: string): string {
    const colors: Record<string, string> = { GST: '#6366f1', ITR: '#0074c9', TDS: '#f59e0b', ROC: '#8b5cf6', ADVANCE_TAX: '#ec4899', OTHER: '#64748b' };
    return colors[type] || '#64748b';
  }
}
