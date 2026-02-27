import { Component, inject, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroCalendarDaysSolid, heroArrowRightSolid } from '@ng-icons/heroicons/solid';
import { ComplianceService, ClientDeadlineAssignment, ComplianceStats } from '@core/services/compliance.service';

@Component({
  selector: 'app-deadline-widget',
  standalone: true,
  imports: [CommonModule, RouterLink, NgIconComponent],
  providers: [provideIcons({ heroCalendarDaysSolid, heroArrowRightSolid })],
  template: `
    <div
      class="rounded-2xl overflow-hidden"
      style="background: var(--card-bg); border: 1px solid var(--border-color); box-shadow: 0 4px 24px -4px rgba(0,0,0,0.06);"
    >
      <!-- Header -->
      <div
        class="flex items-center justify-between px-5 py-4"
        style="border-bottom: 1px solid var(--border-color);"
      >
        <div class="flex items-center gap-2.5">
          <div
            class="w-8 h-8 rounded-lg flex items-center justify-center"
            style="background: rgba(0, 116, 201, 0.1);"
          >
            <ng-icon name="heroCalendarDaysSolid" size="16" style="color: #0074c9;"></ng-icon>
          </div>
          <h3 class="text-sm font-bold" style="color: var(--text-primary);">Deadlines This Week</h3>
        </div>
        <a
          routerLink="/compliance"
          class="flex items-center gap-1 text-xs font-semibold transition-all duration-200 hover:gap-2"
          style="color: #0074c9;"
        >
          View All
          <ng-icon name="heroArrowRightSolid" size="12"></ng-icon>
        </a>
      </div>

      <!-- Stats Row -->
      <div class="grid grid-cols-3 gap-0" style="border-bottom: 1px solid var(--border-color);">
        <div class="px-4 py-3 text-center" style="border-right: 1px solid var(--border-color);">
          <p class="text-lg font-bold" style="color: #f59e0b;">{{ stats()?.upcoming || 0 }}</p>
          <p class="text-[10px] font-medium" style="color: var(--text-secondary);">Upcoming</p>
        </div>
        <div class="px-4 py-3 text-center" style="border-right: 1px solid var(--border-color);">
          <p class="text-lg font-bold" style="color: #ef4444;">{{ stats()?.overdue || 0 }}</p>
          <p class="text-[10px] font-medium" style="color: var(--text-secondary);">Overdue</p>
        </div>
        <div class="px-4 py-3 text-center">
          <p class="text-lg font-bold" style="color: #22c55e;">{{ stats()?.filed || 0 }}</p>
          <p class="text-[10px] font-medium" style="color: var(--text-secondary);">Filed</p>
        </div>
      </div>

      <!-- Upcoming List -->
      <div class="p-4 space-y-2">
        @for (cd of upcomingDeadlines(); track cd.id; let i = $index) {
          @if (i < 5) {
            <div
              class="flex items-center justify-between p-2.5 rounded-xl transition-all duration-200"
              style="background: var(--hover-bg);"
            >
              <div class="flex items-center gap-2.5 min-w-0">
                <span class="text-base">{{ getTypeEmoji(cd.deadline?.type) }}</span>
                <div class="min-w-0">
                  <p class="text-xs font-semibold truncate" style="color: var(--text-primary);">
                    {{ cd.deadline?.title || 'Deadline' }}
                  </p>
                  <p class="text-[10px]" style="color: var(--text-secondary);">
                    {{ cd.client?.user?.name || 'Client' }}
                  </p>
                </div>
              </div>
              <span
                class="text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0"
                [style.background]="getCountdownBg(cd.deadline?.dueDate)"
                [style.color]="getCountdownColor(cd.deadline?.dueDate)"
              >
                {{ getCountdownText(cd.deadline?.dueDate) }}
              </span>
            </div>
          }
        } @empty {
          <div class="text-center py-6">
            <p class="text-2xl mb-1.5">✅</p>
            <p class="text-xs font-medium" style="color: var(--text-secondary);">No upcoming deadlines this week!</p>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`:host { display: block; }`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeadlineWidgetComponent implements OnInit {
  private complianceService = inject(ComplianceService);

  upcomingDeadlines = signal<ClientDeadlineAssignment[]>([]);
  stats = signal<ComplianceStats | null>(null);

  ngOnInit() {
    this.complianceService.getUpcomingThisWeek().subscribe({
      next: (res) => this.upcomingDeadlines.set(res.data),
    });
    this.complianceService.getStats().subscribe({
      next: (res) => this.stats.set(res.data),
    });
  }

  getTypeEmoji(type?: string): string {
    if (!type) return '📌';
    const emojis: Record<string, string> = { GST: '🧾', ITR: '📄', TDS: '💰', ROC: '🏢', ADVANCE_TAX: '💳', OTHER: '📌' };
    return emojis[type] || '📌';
  }

  getCountdownText(dateStr?: string): string {
    if (!dateStr) return '';
    const now = new Date(); now.setHours(0, 0, 0, 0);
    const due = new Date(dateStr); due.setHours(0, 0, 0, 0);
    const diff = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diff < 0) return `${Math.abs(diff)}d overdue`;
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Tomorrow';
    return `${diff}d left`;
  }

  getCountdownColor(dateStr?: string): string {
    if (!dateStr) return '#64748b';
    const now = new Date(); now.setHours(0, 0, 0, 0);
    const due = new Date(dateStr); due.setHours(0, 0, 0, 0);
    const diff = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diff < 0) return '#ef4444';
    if (diff <= 3) return '#f59e0b';
    return '#22c55e';
  }

  getCountdownBg(dateStr?: string): string {
    return this.getCountdownColor(dateStr) + '12';
  }
}
