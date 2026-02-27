import { Component, Input, Output, EventEmitter, computed, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComplianceDeadline, ClientDeadlineAssignment } from '@core/services/compliance.service';

@Component({
  selector: 'app-calendar-view',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Calendar Grid -->
    <div
      class="rounded-2xl overflow-hidden"
      style="background: var(--card-bg); border: 1px solid var(--border-color); box-shadow: 0 4px 24px -4px rgba(0,0,0,0.06);"
    >
      <!-- Day Headers -->
      <div class="grid grid-cols-7 border-b" style="border-color: var(--border-color);">
        @for (day of dayNames; track day) {
          <div
            class="py-3 text-center text-xs font-bold uppercase tracking-wider"
            style="color: var(--text-secondary); background: var(--hover-bg);"
          >
            {{ day }}
          </div>
        }
      </div>

      <!-- Calendar Cells -->
      <div class="grid grid-cols-7">
        @for (cell of calendarCells(); track $index) {
          <div
            class="min-h-[110px] p-2 border-b border-r transition-all duration-200"
            [class.opacity-40]="!cell.isCurrentMonth"
            [style.border-color]="'var(--border-color)'"
            [style.background]="cell.isToday ? 'rgba(0, 116, 201, 0.04)' : 'transparent'"
          >
            <!-- Date Number -->
            <div class="flex items-center justify-between mb-1">
              <span
                class="text-sm font-semibold w-7 h-7 flex items-center justify-center rounded-full"
                [style.background]="cell.isToday ? '#0074c9' : 'transparent'"
                [style.color]="cell.isToday ? '#fff' : 'var(--text-primary)'"
              >
                {{ cell.day }}
              </span>
            </div>

            <!-- Deadline Pills -->
            <div class="flex flex-col gap-1">
              @for (dl of cell.deadlines; track dl.id; let i = $index) {
                @if (i < 3) {
                  <button
                    (click)="deadlineClick.emit(dl)"
                    class="w-full text-left px-2 py-1 rounded-lg text-[10px] font-semibold leading-tight truncate transition-all duration-200 hover:scale-[1.02] cursor-pointer"
                    [style.background]="getTypeColor(dl.type).bg"
                    [style.color]="getTypeColor(dl.type).text"
                    [style.border]="'1px solid ' + getTypeColor(dl.type).border"
                    [title]="dl.title"
                  >
                    <span class="mr-1">{{ getTypeEmoji(dl.type) }}</span>{{ dl.title | slice:0:20 }}
                  </button>
                }
              }
              @if (cell.deadlines.length > 3) {
                <span class="text-[10px] font-bold px-2" style="color: var(--text-secondary);">
                  +{{ cell.deadlines.length - 3 }} more
                </span>
              }
            </div>
          </div>
        }
      </div>
    </div>

    <!-- Legend -->
    <div class="flex flex-wrap items-center gap-4 mt-4 px-2">
      @for (item of legendItems; track item.label) {
        <div class="flex items-center gap-2">
          <div
            class="w-3 h-3 rounded-sm"
            [style.background]="item.color"
          ></div>
          <span class="text-xs font-medium" style="color: var(--text-secondary);">{{ item.label }}</span>
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalendarViewComponent {
  @Input() deadlines: ComplianceDeadline[] = [];
  @Input() month: number = new Date().getMonth();
  @Input() year: number = new Date().getFullYear();
  @Input() clientDeadlines: ClientDeadlineAssignment[] = [];

  @Output() deadlineClick = new EventEmitter<ComplianceDeadline>();

  dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  legendItems = [
    { label: 'GST', color: '#6366f1' },
    { label: 'ITR', color: '#0074c9' },
    { label: 'TDS', color: '#f59e0b' },
    { label: 'ROC', color: '#8b5cf6' },
    { label: 'Advance Tax', color: '#ec4899' },
    { label: 'Other', color: '#64748b' },
  ];

  calendarCells = computed(() => {
    const cells: { day: number; isCurrentMonth: boolean; isToday: boolean; deadlines: ComplianceDeadline[] }[] = [];
    const firstDay = new Date(this.year, this.month, 1).getDay();
    const daysInMonth = new Date(this.year, this.month + 1, 0).getDate();
    const daysInPrevMonth = new Date(this.year, this.month, 0).getDate();
    const today = new Date();
    const isCurrentMonthYear = today.getMonth() === this.month && today.getFullYear() === this.year;

    // Create a map of deadlines by date
    const deadlineMap = new Map<string, ComplianceDeadline[]>();
    for (const dl of this.deadlines) {
      const dateStr = dl.dueDate.split('T')[0];
      if (!deadlineMap.has(dateStr)) deadlineMap.set(dateStr, []);
      deadlineMap.get(dateStr)!.push(dl);
    }

    // Previous month's trailing days
    for (let i = firstDay - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      const prevMonth = this.month === 0 ? 11 : this.month - 1;
      const prevYear = this.month === 0 ? this.year - 1 : this.year;
      const dateStr = `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      cells.push({ day, isCurrentMonth: false, isToday: false, deadlines: deadlineMap.get(dateStr) || [] });
    }

    // Current month's days
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${this.year}-${String(this.month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      cells.push({
        day: d,
        isCurrentMonth: true,
        isToday: isCurrentMonthYear && today.getDate() === d,
        deadlines: deadlineMap.get(dateStr) || [],
      });
    }

    // Next month's leading days
    const remaining = 42 - cells.length; // Always show 6 rows
    for (let d = 1; d <= remaining; d++) {
      const nextMonth = this.month === 11 ? 0 : this.month + 1;
      const nextYear = this.month === 11 ? this.year + 1 : this.year;
      const dateStr = `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      cells.push({ day: d, isCurrentMonth: false, isToday: false, deadlines: deadlineMap.get(dateStr) || [] });
    }

    return cells;
  });

  getTypeColor(type: string): { bg: string; text: string; border: string } {
    const colors: Record<string, { bg: string; text: string; border: string }> = {
      GST: { bg: 'rgba(99, 102, 241, 0.1)', text: '#6366f1', border: 'rgba(99, 102, 241, 0.2)' },
      ITR: { bg: 'rgba(0, 116, 201, 0.1)', text: '#0074c9', border: 'rgba(0, 116, 201, 0.2)' },
      TDS: { bg: 'rgba(245, 158, 11, 0.1)', text: '#d97706', border: 'rgba(245, 158, 11, 0.2)' },
      ROC: { bg: 'rgba(139, 92, 246, 0.1)', text: '#8b5cf6', border: 'rgba(139, 92, 246, 0.2)' },
      ADVANCE_TAX: { bg: 'rgba(236, 72, 153, 0.1)', text: '#ec4899', border: 'rgba(236, 72, 153, 0.2)' },
      OTHER: { bg: 'rgba(100, 116, 139, 0.1)', text: '#64748b', border: 'rgba(100, 116, 139, 0.2)' },
    };
    return colors[type] || colors['OTHER'];
  }

  getTypeEmoji(type: string): string {
    const emojis: Record<string, string> = {
      GST: '🧾', ITR: '📄', TDS: '💰', ROC: '🏢', ADVANCE_TAX: '💳', OTHER: '📌',
    };
    return emojis[type] || '📌';
  }
}
