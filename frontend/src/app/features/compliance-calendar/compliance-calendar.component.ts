import { Component, inject, signal, computed, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  heroCalendarDaysSolid,
  heroListBulletSolid,
  heroFunnelSolid,
  heroPlusSolid,
  heroChevronLeftSolid,
  heroChevronRightSolid,
  heroClockSolid,
  heroCheckCircleSolid,
  heroExclamationTriangleSolid,
  heroXMarkSolid,
  heroUserGroupSolid,
  heroInformationCircleSolid,
} from '@ng-icons/heroicons/solid';
import {
  ComplianceService,
  ComplianceDeadline,
  ClientDeadlineAssignment,
  ComplianceStats,
  DeadlineType,
} from '@core/services/compliance.service';
import { ClientService, Client } from '@core/services/client.service';
import { ToastService } from '@core/services/toast.service';
import { CalendarViewComponent } from './components/calendar-view.component';
import { DeadlineListComponent } from './components/deadline-list.component';
import { AddDeadlineModalComponent } from './components/add-deadline-modal.component';
import { AssignClientModalComponent } from './components/assign-client-modal.component';
import { DeadlineDetailModalComponent } from './components/deadline-detail-modal.component';

@Component({
  selector: 'app-compliance-calendar',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgIconComponent,
    CalendarViewComponent,
    DeadlineListComponent,
    AddDeadlineModalComponent,
    AssignClientModalComponent,
    DeadlineDetailModalComponent,
  ],
  providers: [
    provideIcons({
      heroCalendarDaysSolid,
      heroListBulletSolid,
      heroFunnelSolid,
      heroPlusSolid,
      heroChevronLeftSolid,
      heroChevronRightSolid,
      heroClockSolid,
      heroCheckCircleSolid,
      heroExclamationTriangleSolid,
      heroXMarkSolid,
      heroUserGroupSolid,
      heroInformationCircleSolid,
    }),
  ],
  template: `
    <div class="animate-page-enter">
      <!-- Page Header -->
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 class="text-2xl font-bold" style="color: var(--text-primary);">📅 Compliance Calendar</h1>
          <p class="text-sm mt-1" style="color: var(--text-secondary);">
            Track all Indian tax compliance deadlines — ITR, GST, TDS, ROC & Advance Tax
          </p>
        </div>
        <button
          (click)="showAddDeadlineModal.set(true)"
          class="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          style="background: linear-gradient(135deg, #0074c9, #005fa3); box-shadow: 0 4px 14px -2px rgba(0, 116, 201, 0.4);"
        >
          <ng-icon name="heroPlusSolid" size="16"></ng-icon>
          Add Deadline
        </button>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        @for (stat of statsCards(); track stat.label) {
          <div
            class="rounded-2xl p-4 transition-all duration-300 hover:scale-[1.02]"
            [style.background]="stat.bg"
            [style.border]="'1px solid ' + stat.border"
            style="backdrop-filter: blur(10px);"
          >
            <div class="flex items-center gap-3">
              <div
                class="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                [style.background]="stat.iconBg"
              >
                {{ stat.emoji }}
              </div>
              <div>
                <p class="text-2xl font-bold" [style.color]="stat.valueColor">{{ stat.value }}</p>
                <p class="text-xs font-medium" style="color: var(--text-secondary);">{{ stat.label }}</p>
              </div>
            </div>
          </div>
        }
      </div>

      <!-- View Toggle + Filters -->
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <!-- View Toggle -->
        <div
          class="flex rounded-xl p-1 gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
        >
          <button
            (click)="activeView.set('calendar')"
            class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200"
            [style.background]="activeView() === 'calendar' ? 'var(--primary-color, #0074c9)' : 'transparent'"
            [style.color]="activeView() === 'calendar' ? '#fff' : 'var(--text-secondary)'"
          >
            <ng-icon name="heroCalendarDaysSolid" size="16"></ng-icon>
            Calendar
          </button>
          <button
            (click)="activeView.set('list')"
            class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200"
            [style.background]="activeView() === 'list' ? 'var(--primary-color, #0074c9)' : 'transparent'"
            [style.color]="activeView() === 'list' ? '#fff' : 'var(--text-secondary)'"
          >
            <ng-icon name="heroListBulletSolid" size="16"></ng-icon>
            List
          </button>
        </div>

        <!-- Filters -->
        <div class="flex items-center gap-3 flex-wrap">
          <select
            [ngModel]="selectedType()"
            (ngModelChange)="onTypeChange($event)"
            class="px-3 py-2 rounded-xl text-sm font-medium outline-none transition-all duration-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
          >
            <option value="">All Types</option>
            <option value="ITR">ITR</option>
            <option value="GST">GST</option>
            <option value="TDS">TDS</option>
            <option value="ROC">ROC</option>
            <option value="ADVANCE_TAX">Advance Tax</option>
            <option value="OTHER">Other</option>
          </select>

          <!-- Month/Year (for calendar) -->
          @if (activeView() === 'calendar') {
            <div class="flex items-center gap-2">
              <button
                (click)="prevMonth()"
                class="p-2 rounded-lg transition-all duration-200 hover:bg-opacity-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
              >
                <ng-icon name="heroChevronLeftSolid" size="16" style="color: var(--text-secondary);"></ng-icon>
              </button>
              <span class="text-sm font-bold min-w-[140px] text-center" style="color: var(--text-primary);">
                {{ monthNames[currentMonth()] }} {{ currentYear() }}
              </span>
              <button
                (click)="nextMonth()"
                class="p-2 rounded-lg transition-all duration-200 hover:bg-opacity-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
              >
                <ng-icon name="heroChevronRightSolid" size="16" style="color: var(--text-secondary);"></ng-icon>
              </button>
            </div>
          }
        </div>
      </div>

      <!-- Calendar View -->
      @if (activeView() === 'calendar') {
        <app-calendar-view
          [deadlines]="filteredDeadlines()"
          [month]="currentMonth()"
          [year]="currentYear()"
          [clientDeadlines]="clientDeadlines()"
          (deadlineClick)="onDeadlineClick($event)"
        ></app-calendar-view>
      }

      <!-- List View -->
      @if (activeView() === 'list') {
        <app-deadline-list
          [deadlines]="filteredDeadlines()"
          [clientDeadlines]="clientDeadlines()"
          (deadlineClick)="onDeadlineClick($event)"
          (assignClick)="onAssignClick($event)"
          (statusChange)="onStatusChange($event)"
        ></app-deadline-list>
      }
    </div>

    <!-- Modals -->
    @if (showAddDeadlineModal()) {
        <app-add-deadline-modal
          (close)="showAddDeadlineModal.set(false)"
          (saved)="onDeadlineCreated()"
        ></app-add-deadline-modal>
      }

      @if (showAssignModal()) {
        <app-assign-client-modal
          [deadlineId]="selectedDeadlineId()!"
          [deadlineTitle]="selectedDeadlineTitle()"
          (close)="showAssignModal.set(false)"
          (assigned)="onClientAssigned()"
        ></app-assign-client-modal>
      }

      @if (showDetailModal()) {
        <app-deadline-detail-modal
          [deadline]="selectedDeadline()!"
          [clientDeadlines]="selectedDeadlineClientDeadlines()"
          (close)="showDetailModal.set(false)"
          (assign)="onAssignFromDetail($event)"
          (statusChange)="onStatusChange($event)"
        ></app-deadline-detail-modal>
    }
  `,
  styles: [`
    :host { display: block; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComplianceCalendarComponent implements OnInit {
  private complianceService = inject(ComplianceService);
  private toastService = inject(ToastService);

  // State
  activeView = signal<'calendar' | 'list'>('calendar');
  currentMonth = signal(new Date().getMonth());
  currentYear = signal(new Date().getFullYear());
  selectedType = signal<string>('');
  deadlines = signal<ComplianceDeadline[]>([]);
  clientDeadlines = signal<ClientDeadlineAssignment[]>([]);
  stats = signal<ComplianceStats>({ totalDeadlines: 0, upcoming: 0, overdue: 0, filed: 0, pending: 0 });
  loading = signal(false);

  // Modals
  showAddDeadlineModal = signal(false);
  showAssignModal = signal(false);
  showDetailModal = signal(false);
  selectedDeadlineId = signal<string | null>(null);
  selectedDeadlineTitle = signal('');
  selectedDeadline = signal<ComplianceDeadline | null>(null);
  selectedDeadlineClientDeadlines = signal<ClientDeadlineAssignment[]>([]);

  monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  filteredDeadlines = computed(() => {
    let items = this.deadlines();
    const type = this.selectedType();
    if (type) {
      items = items.filter(d => d.type === type);
    }
    return items;
  });

  statsCards = computed(() => {
    const s = this.stats();
    return [
      { label: 'Total Deadlines', value: s.totalDeadlines, emoji: '📋', bg: '#ffffff', border: 'var(--border-color)', iconBg: 'rgba(0, 116, 201, 0.1)', valueColor: 'var(--text-primary)' },
      { label: 'Upcoming (7d)', value: s.upcoming, emoji: '⏰', bg: 'rgba(245, 158, 11, 0.06)', border: 'rgba(245, 158, 11, 0.15)', iconBg: 'rgba(245, 158, 11, 0.12)', valueColor: '#f59e0b' },
      { label: 'Overdue', value: s.overdue, emoji: '🔴', bg: 'rgba(239, 68, 68, 0.06)', border: 'rgba(239, 68, 68, 0.15)', iconBg: 'rgba(239, 68, 68, 0.12)', valueColor: '#ef4444' },
      { label: 'Filed', value: s.filed, emoji: '✅', bg: 'rgba(34, 197, 94, 0.06)', border: 'rgba(34, 197, 94, 0.15)', iconBg: 'rgba(34, 197, 94, 0.12)', valueColor: '#22c55e' },
    ];
  });

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading.set(true);

    // Load deadlines for current year
    this.complianceService.getDeadlines({ year: this.currentYear() }).subscribe({
      next: (res) => {
        this.deadlines.set(res.data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });

    // Load client deadlines
    this.complianceService.getClientDeadlines().subscribe({
      next: (res) => this.clientDeadlines.set(res.data),
    });

    // Load stats
    this.complianceService.getStats(this.currentYear()).subscribe({
      next: (res) => this.stats.set(res.data),
    });
  }

  prevMonth() {
    const m = this.currentMonth();
    const y = this.currentYear();
    if (m === 0) {
      this.currentMonth.set(11);
      this.currentYear.set(y - 1);
    } else {
      this.currentMonth.set(m - 1);
    }
    this.loadData();
  }

  nextMonth() {
    const m = this.currentMonth();
    const y = this.currentYear();
    if (m === 11) {
      this.currentMonth.set(0);
      this.currentYear.set(y + 1);
    } else {
      this.currentMonth.set(m + 1);
    }
    this.loadData();
  }

  onTypeChange(type: string) {
    this.selectedType.set(type);
  }

  onDeadlineClick(deadline: ComplianceDeadline) {
    this.selectedDeadline.set(deadline);
    // Load client deadlines for this specific deadline
    this.complianceService.getClientDeadlines({ deadlineId: deadline.id }).subscribe({
      next: (res) => {
        this.selectedDeadlineClientDeadlines.set(res.data);
        this.showDetailModal.set(true);
      },
    });
  }

  onAssignClick(deadline: ComplianceDeadline) {
    this.selectedDeadlineId.set(deadline.id);
    this.selectedDeadlineTitle.set(deadline.title);
    this.showAssignModal.set(true);
  }

  onAssignFromDetail(deadlineId: string) {
    this.showDetailModal.set(false);
    const d = this.deadlines().find(x => x.id === deadlineId);
    if (d) {
      this.selectedDeadlineId.set(d.id);
      this.selectedDeadlineTitle.set(d.title);
      this.showAssignModal.set(true);
    }
  }

  onStatusChange(event: { clientDeadlineId: string; status: string }) {
    this.complianceService.updateClientDeadline(event.clientDeadlineId, { status: event.status as any }).subscribe({
      next: () => {
        this.toastService.success('Status updated successfully');
        this.loadData();
      },
      error: () => this.toastService.error('Failed to update status'),
    });
  }

  onDeadlineCreated() {
    this.showAddDeadlineModal.set(false);
    this.toastService.success('Deadline created successfully');
    this.loadData();
  }

  onClientAssigned() {
    this.showAssignModal.set(false);
    this.toastService.success('Client assigned successfully');
    this.loadData();
  }
}
