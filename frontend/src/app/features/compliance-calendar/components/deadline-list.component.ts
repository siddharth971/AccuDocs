import { Component, Input, Output, EventEmitter, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  heroUserGroupSolid,
  heroCheckCircleSolid,
  heroClockSolid,
  heroExclamationTriangleSolid,
} from '@ng-icons/heroicons/solid';
import { ComplianceDeadline, ClientDeadlineAssignment } from '@core/services/compliance.service';

@Component({
  selector: 'app-deadline-list',
  standalone: true,
  imports: [CommonModule, NgIconComponent],
  providers: [
    provideIcons({
      heroUserGroupSolid,
      heroCheckCircleSolid,
      heroClockSolid,
      heroExclamationTriangleSolid,
    }),
  ],
  template: `
    <div class="space-y-3">
      @for (dl of sortedDeadlines(); track dl.id) {
        <div
          class="group rounded-2xl p-4 transition-all duration-300 hover:shadow-lg hover:scale-[1.005] cursor-pointer"
          style="background: var(--card-bg); border: 1px solid var(--border-color);"
          [style.border-left]="'4px solid ' + getTypeAccent(dl.type)"
          (click)="deadlineClick.emit(dl)"
        >
          <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <!-- Left: Info -->
            <div class="flex items-start gap-3 flex-1 min-w-0">
              <!-- Type Badge -->
              <div
                class="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                [style.background]="getTypeBg(dl.type)"
              >
                {{ getTypeEmoji(dl.type) }}
              </div>
              <div class="min-w-0 flex-1">
                <h3 class="text-sm font-bold truncate" style="color: var(--text-primary);">{{ dl.title }}</h3>
                <div class="flex flex-wrap items-center gap-2 mt-1">
                  <span
                    class="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider"
                    [style.background]="getTypeBg(dl.type)"
                    [style.color]="getTypeAccent(dl.type)"
                  >
                    {{ dl.type === 'ADVANCE_TAX' ? 'ADV TAX' : dl.type }}
                  </span>
                  @if (dl.recurring) {
                    <span class="text-[10px] font-medium px-2 py-0.5 rounded-md" style="background: rgba(100, 116, 139, 0.1); color: var(--text-secondary);">
                      🔄 {{ dl.recurringPattern }}
                    </span>
                  }
                  @if (dl.description) {
                    <span class="text-[11px] hidden sm:inline truncate max-w-[200px]" style="color: var(--text-secondary);" [title]="dl.description">
                      {{ dl.description }}
                    </span>
                  }
                </div>
              </div>
            </div>

            <!-- Right: Date + Actions -->
            <div class="flex items-center gap-3">
              <!-- Status indicator -->
              <div class="flex flex-col items-end gap-1">
                <span
                  class="text-xs font-bold px-3 py-1 rounded-lg"
                  [style.background]="getDateStatusBg(dl.dueDate)"
                  [style.color]="getDateStatusColor(dl.dueDate)"
                >
                  {{ formatDate(dl.dueDate) }}
                </span>
                <span
                  class="text-[10px] font-semibold"
                  [style.color]="getCountdownColor(dl.dueDate)"
                >
                  {{ getCountdownText(dl.dueDate) }}
                </span>
              </div>

              <!-- Assign Button -->
              <button
                (click)="$event.stopPropagation(); assignClick.emit(dl)"
                class="shrink-0 p-2 rounded-xl transition-all duration-200 opacity-0 group-hover:opacity-100 hover:scale-110"
                style="background: rgba(0, 116, 201, 0.08); color: #0074c9;"
                title="Assign Clients"
              >
                <ng-icon name="heroUserGroupSolid" size="16"></ng-icon>
              </button>
            </div>
          </div>

          <!-- Client Assignment Chips (if any) -->
          @if (getAssignedClients(dl.id).length > 0) {
            <div class="flex flex-wrap gap-2 mt-3 pt-3" style="border-top: 1px solid var(--border-color);">
              @for (cd of getAssignedClients(dl.id); track cd.id; let i = $index) {
                @if (i < 5) {
                  <div
                    class="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium"
                    [style.background]="getStatusChipBg(cd.status)"
                    [style.color]="getStatusChipColor(cd.status)"
                    [style.border]="'1px solid ' + getStatusChipBorder(cd.status)"
                  >
                    @if (cd.status === 'filed') {
                      <ng-icon name="heroCheckCircleSolid" size="12"></ng-icon>
                    } @else if (cd.status === 'overdue') {
                      <ng-icon name="heroExclamationTriangleSolid" size="12"></ng-icon>
                    } @else {
                      <ng-icon name="heroClockSolid" size="12"></ng-icon>
                    }
                    {{ cd.client?.user?.name || cd.client?.code || 'Client' }}
                  </div>
                }
              }
              @if (getAssignedClients(dl.id).length > 5) {
                <span class="text-[11px] font-bold px-2 py-1" style="color: var(--text-secondary);">
                  +{{ getAssignedClients(dl.id).length - 5 }} more
                </span>
              }
            </div>
          }
        </div>
      } @empty {
        <div class="text-center py-16 rounded-2xl" style="background: var(--card-bg); border: 1px solid var(--border-color);">
          <p class="text-4xl mb-3">📅</p>
          <p class="text-sm font-semibold" style="color: var(--text-secondary);">No deadlines found for the selected filters</p>
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeadlineListComponent {
  @Input() deadlines: ComplianceDeadline[] = [];
  @Input() clientDeadlines: ClientDeadlineAssignment[] = [];

  @Output() deadlineClick = new EventEmitter<ComplianceDeadline>();
  @Output() assignClick = new EventEmitter<ComplianceDeadline>();
  @Output() statusChange = new EventEmitter<{ clientDeadlineId: string; status: string }>();

  sortedDeadlines = computed(() => {
    return [...this.deadlines].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  });

  getAssignedClients(deadlineId: string): ClientDeadlineAssignment[] {
    return this.clientDeadlines.filter(cd => cd.deadlineId === deadlineId);
  }

  getTypeEmoji(type: string): string {
    const emojis: Record<string, string> = { GST: '🧾', ITR: '📄', TDS: '💰', ROC: '🏢', ADVANCE_TAX: '💳', OTHER: '📌' };
    return emojis[type] || '📌';
  }

  getTypeAccent(type: string): string {
    const colors: Record<string, string> = { GST: '#6366f1', ITR: '#0074c9', TDS: '#f59e0b', ROC: '#8b5cf6', ADVANCE_TAX: '#ec4899', OTHER: '#64748b' };
    return colors[type] || '#64748b';
  }

  getTypeBg(type: string): string {
    const colors: Record<string, string> = {
      GST: 'rgba(99, 102, 241, 0.1)', ITR: 'rgba(0, 116, 201, 0.1)', TDS: 'rgba(245, 158, 11, 0.1)',
      ROC: 'rgba(139, 92, 246, 0.1)', ADVANCE_TAX: 'rgba(236, 72, 153, 0.1)', OTHER: 'rgba(100, 116, 139, 0.1)',
    };
    return colors[type] || 'rgba(100, 116, 139, 0.1)';
  }

  formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  getCountdownText(dateStr: string): string {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const due = new Date(dateStr);
    due.setHours(0, 0, 0, 0);
    const diff = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diff < 0) return `${Math.abs(diff)} days overdue`;
    if (diff === 0) return 'Due today!';
    if (diff === 1) return 'Due tomorrow';
    if (diff <= 7) return `${diff} days left`;
    return `${diff} days ahead`;
  }

  getCountdownColor(dateStr: string): string {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const due = new Date(dateStr);
    due.setHours(0, 0, 0, 0);
    const diff = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diff < 0) return '#ef4444';
    if (diff <= 7) return '#f59e0b';
    return '#22c55e';
  }

  getDateStatusBg(dateStr: string): string {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const due = new Date(dateStr);
    due.setHours(0, 0, 0, 0);
    const diff = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diff < 0) return 'rgba(239, 68, 68, 0.08)';
    if (diff <= 7) return 'rgba(245, 158, 11, 0.08)';
    return 'rgba(34, 197, 94, 0.08)';
  }

  getDateStatusColor(dateStr: string): string {
    return this.getCountdownColor(dateStr);
  }

  // Status chip helpers
  getStatusChipBg(status: string): string {
    if (status === 'filed') return 'rgba(34, 197, 94, 0.08)';
    if (status === 'overdue') return 'rgba(239, 68, 68, 0.08)';
    return 'rgba(245, 158, 11, 0.08)';
  }

  getStatusChipColor(status: string): string {
    if (status === 'filed') return '#22c55e';
    if (status === 'overdue') return '#ef4444';
    return '#f59e0b';
  }

  getStatusChipBorder(status: string): string {
    if (status === 'filed') return 'rgba(34, 197, 94, 0.15)';
    if (status === 'overdue') return 'rgba(239, 68, 68, 0.15)';
    return 'rgba(245, 158, 11, 0.15)';
  }
}
