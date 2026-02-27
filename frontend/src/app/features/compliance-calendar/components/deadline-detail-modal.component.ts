import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  heroXMarkSolid,
  heroCheckCircleSolid,
  heroClockSolid,
  heroExclamationTriangleSolid,
  heroUserGroupSolid,
} from '@ng-icons/heroicons/solid';
import { ComplianceDeadline, ClientDeadlineAssignment } from '@core/services/compliance.service';

@Component({
  selector: 'app-deadline-detail-modal',
  standalone: true,
  imports: [CommonModule, NgIconComponent],
  providers: [
    provideIcons({
      heroXMarkSolid,
      heroCheckCircleSolid,
      heroClockSolid,
      heroExclamationTriangleSolid,
      heroUserGroupSolid,
    }),
  ],
  template: `
    <div
      class="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      (click)="close.emit()"
    >
      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>

      <div
        class="relative w-full max-w-2xl rounded-2xl overflow-hidden animate-page-enter bg-white dark:bg-slate-900 shadow-2xl ring-1 ring-slate-200 dark:ring-slate-800"
        (click)="$event.stopPropagation()"
      >
        <!-- Header with accent -->
        <div
          class="p-6"
          [style.background]="'linear-gradient(135deg, ' + getTypeAccent(deadline.type) + '10, ' + getTypeAccent(deadline.type) + '05)'"
          [style.border-bottom]="'1px solid ' + getTypeAccent(deadline.type) + '20'"
        >
          <div class="flex items-start justify-between">
            <div class="flex items-start gap-3">
              <div class="text-3xl">{{ getTypeEmoji(deadline.type) }}</div>
              <div>
                <span
                  class="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider mb-2 mt-0.5"
                  [style.background]="getTypeAccent(deadline.type) + '18'"
                  [style.color]="getTypeAccent(deadline.type)"
                >
                  {{ deadline.type === 'ADVANCE_TAX' ? 'ADVANCE TAX' : deadline.type }}
                </span>
                <h2 class="text-lg font-bold" style="color: var(--text-primary);">{{ deadline.title }}</h2>
                @if (deadline.description) {
                  <p class="text-xs mt-1 max-w-md" style="color: var(--text-secondary);">{{ deadline.description }}</p>
                }
              </div>
            </div>
            <button (click)="close.emit()" class="p-2 rounded-lg" style="color: var(--text-secondary);">
              <ng-icon name="heroXMarkSolid" size="18"></ng-icon>
            </button>
          </div>

          <!-- Due Date & Countdown -->
          <div class="flex items-center gap-4 mt-4">
            <div
              class="px-4 py-2 rounded-xl text-sm font-bold"
              [style.background]="getDateBg()"
              [style.color]="getDateColor()"
            >
              📅 {{ formatDate(deadline.dueDate) }}
            </div>
            <span
              class="text-sm font-semibold"
              [style.color]="getCountdownColor()"
            >
              {{ getCountdownText() }}
            </span>
            @if (deadline.recurring) {
              <span class="text-xs font-medium px-2 py-1 rounded-md" style="background: rgba(100,116,139,0.1); color: var(--text-secondary);">
                🔄 {{ deadline.recurringPattern }}
              </span>
            }
          </div>
        </div>

        <!-- Client Assignments -->
        <div class="p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-sm font-bold flex items-center gap-2" style="color: var(--text-primary);">
              <ng-icon name="heroUserGroupSolid" size="16" style="color: #0074c9;"></ng-icon>
              Assigned Clients ({{ clientDeadlines.length }})
            </h3>
            <button
              (click)="assign.emit(deadline.id)"
              class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 hover:scale-[1.02]"
              style="background: rgba(0, 116, 201, 0.08); color: #0074c9;"
            >
              + Assign More
            </button>
          </div>

          @if (clientDeadlines.length > 0) {
            <div class="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar">
              @for (cd of clientDeadlines; track cd.id) {
                <div
                  class="flex items-center justify-between p-3 rounded-xl transition-all duration-200 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700"
                >
                  <div class="flex items-center gap-3">
                    <div
                      class="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white"
                      style="background: linear-gradient(135deg, #0074c9, #005fa3);"
                    >
                      {{ getInitials(cd.client?.user?.name) }}
                    </div>
                    <div>
                      <p class="text-sm font-semibold" style="color: var(--text-primary);">
                        {{ cd.client?.user?.name || 'Client' }}
                      </p>
                      <p class="text-[11px]" style="color: var(--text-secondary);">
                        Code: {{ cd.client?.code }} · {{ cd.client?.user?.mobile }}
                      </p>
                    </div>
                  </div>

                  <!-- Status Actions -->
                  <div class="flex items-center gap-2">
                    <select
                      [value]="cd.status"
                      (change)="onStatusChange(cd.id, $any($event.target).value)"
                      class="px-2 py-1 rounded-lg text-xs font-semibold outline-none cursor-pointer"
                      [style.background]="getStatusBg(cd.status)"
                      [style.color]="getStatusColor(cd.status)"
                      [style.border]="'1px solid ' + getStatusBorder(cd.status)"
                    >
                      <option value="pending">⏳ Pending</option>
                      <option value="filed">✅ Filed</option>
                      <option value="overdue">🔴 Overdue</option>
                    </select>
                  </div>
                </div>
              }
            </div>
          } @else {
            <div class="text-center py-12 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <p class="text-3xl mb-2">👥</p>
              <p class="text-sm font-medium" style="color: var(--text-secondary);">No clients assigned yet</p>
              <button
                (click)="assign.emit(deadline.id)"
                class="mt-3 px-4 py-2 rounded-xl text-white text-xs font-semibold"
                style="background: #0074c9;"
              >
                Assign Clients
              </button>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.12); border-radius: 4px; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeadlineDetailModalComponent {
  @Input() deadline!: ComplianceDeadline;
  @Input() clientDeadlines: ClientDeadlineAssignment[] = [];
  @Output() close = new EventEmitter<void>();
  @Output() assign = new EventEmitter<string>();
  @Output() statusChange = new EventEmitter<{ clientDeadlineId: string; status: string }>();

  getTypeEmoji(type: string): string {
    const emojis: Record<string, string> = { GST: '🧾', ITR: '📄', TDS: '💰', ROC: '🏢', ADVANCE_TAX: '💳', OTHER: '📌' };
    return emojis[type] || '📌';
  }

  getTypeAccent(type: string): string {
    const colors: Record<string, string> = { GST: '#6366f1', ITR: '#0074c9', TDS: '#f59e0b', ROC: '#8b5cf6', ADVANCE_TAX: '#ec4899', OTHER: '#64748b' };
    return colors[type] || '#64748b';
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
  }

  getCountdownText(): string {
    const now = new Date(); now.setHours(0, 0, 0, 0);
    const due = new Date(this.deadline.dueDate); due.setHours(0, 0, 0, 0);
    const diff = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diff < 0) return `${Math.abs(diff)} days overdue`;
    if (diff === 0) return 'Due today!';
    if (diff === 1) return 'Due tomorrow';
    return `${diff} days left`;
  }

  getCountdownColor(): string {
    const now = new Date(); now.setHours(0, 0, 0, 0);
    const due = new Date(this.deadline.dueDate); due.setHours(0, 0, 0, 0);
    const diff = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diff < 0) return '#ef4444';
    if (diff <= 7) return '#f59e0b';
    return '#22c55e';
  }

  getDateBg(): string {
    const c = this.getCountdownColor();
    return c + '12';
  }

  getDateColor(): string {
    return this.getCountdownColor();
  }

  getInitials(name?: string): string {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  getStatusBg(status: string): string {
    if (status === 'filed') return 'rgba(34, 197, 94, 0.08)';
    if (status === 'overdue') return 'rgba(239, 68, 68, 0.08)';
    return 'rgba(245, 158, 11, 0.08)';
  }

  getStatusColor(status: string): string {
    if (status === 'filed') return '#22c55e';
    if (status === 'overdue') return '#ef4444';
    return '#f59e0b';
  }

  getStatusBorder(status: string): string {
    if (status === 'filed') return 'rgba(34, 197, 94, 0.15)';
    if (status === 'overdue') return 'rgba(239, 68, 68, 0.15)';
    return 'rgba(245, 158, 11, 0.15)';
  }

  onStatusChange(clientDeadlineId: string, status: string) {
    this.statusChange.emit({ clientDeadlineId, status });
  }
}
