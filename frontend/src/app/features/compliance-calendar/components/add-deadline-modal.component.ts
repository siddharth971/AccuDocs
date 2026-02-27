import { Component, Output, EventEmitter, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroXMarkSolid } from '@ng-icons/heroicons/solid';
import { ComplianceService, DeadlineType } from '@core/services/compliance.service';

@Component({
  selector: 'app-add-deadline-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIconComponent],
  providers: [provideIcons({ heroXMarkSolid })],
  template: `
    <div
      class="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      (click)="close.emit()"
    >
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>

      <!-- Modal -->
      <div
        class="relative w-full max-w-lg rounded-2xl p-6 animate-page-enter bg-white dark:bg-slate-900 shadow-2xl ring-1 ring-slate-200 dark:ring-slate-800"
        (click)="$event.stopPropagation()"
      >
        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-lg font-bold" style="color: var(--text-primary);">📅 Add Custom Deadline</h2>
          <button
            (click)="close.emit()"
            class="p-2 rounded-lg transition-all duration-200 hover:bg-opacity-10"
            style="color: var(--text-secondary);"
          >
            <ng-icon name="heroXMarkSolid" size="18"></ng-icon>
          </button>
        </div>

        <!-- Form -->
        <form (ngSubmit)="onSubmit()" class="space-y-4">
          <!-- Type -->
          <div>
            <label class="block text-xs font-semibold mb-1.5" style="color: var(--text-secondary);">Type *</label>
            <select
              [(ngModel)]="form.type"
              name="type"
              required
              class="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-all bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select type</option>
              <option value="ITR">ITR</option>
              <option value="GST">GST</option>
              <option value="TDS">TDS</option>
              <option value="ROC">ROC</option>
              <option value="ADVANCE_TAX">Advance Tax</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <!-- Title -->
          <div>
            <label class="block text-xs font-semibold mb-1.5" style="color: var(--text-secondary);">Title *</label>
            <input
              [(ngModel)]="form.title"
              name="title"
              required
              placeholder="e.g., GSTR-3B March Filing"
              class="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-all bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <!-- Due Date -->
          <div>
            <label class="block text-xs font-semibold mb-1.5" style="color: var(--text-secondary);">Due Date *</label>
            <input
              [(ngModel)]="form.dueDate"
              name="dueDate"
              type="date"
              required
              class="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-all bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <!-- Recurring -->
          <div class="flex items-center gap-3">
            <label class="relative inline-flex items-center cursor-pointer">
              <input
                [(ngModel)]="form.recurring"
                name="recurring"
                type="checkbox"
                class="sr-only peer"
              />
              <div class="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:bg-[#0074c9] transition-all duration-200 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full"></div>
            </label>
            <span class="text-xs font-medium" style="color: var(--text-secondary);">Recurring</span>
          </div>

          @if (form.recurring) {
            <div>
              <label class="block text-xs font-semibold mb-1.5" style="color: var(--text-secondary);">Pattern</label>
              <select
                [(ngModel)]="form.recurringPattern"
                name="recurringPattern"
                class="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-all bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="half-yearly">Half-Yearly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          }

          <!-- Description -->
          <div>
            <label class="block text-xs font-semibold mb-1.5" style="color: var(--text-secondary);">Description</label>
            <textarea
              [(ngModel)]="form.description"
              name="description"
              rows="3"
              placeholder="Optional description..."
              class="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-all resize-none bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            ></textarea>
          </div>

          <!-- Submit -->
          <div class="flex justify-end gap-3 pt-2">
            <button
              type="button"
              (click)="close.emit()"
              class="px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              [disabled]="saving()"
              class="px-5 py-2.5 rounded-xl text-white text-sm font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
              style="background: linear-gradient(135deg, #0074c9, #005fa3); box-shadow: 0 4px 14px -2px rgba(0, 116, 201, 0.4);"
            >
              {{ saving() ? 'Creating...' : 'Create Deadline' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddDeadlineModalComponent {
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();

  private complianceService = inject(ComplianceService);

  saving = signal(false);

  form = {
    type: '' as string,
    title: '',
    dueDate: '',
    recurring: false,
    recurringPattern: 'monthly',
    description: '',
  };

  onSubmit() {
    if (!this.form.type || !this.form.title || !this.form.dueDate) return;

    this.saving.set(true);
    this.complianceService.createDeadline({
      type: this.form.type as DeadlineType,
      title: this.form.title,
      dueDate: this.form.dueDate,
      recurring: this.form.recurring,
      recurringPattern: this.form.recurring ? this.form.recurringPattern : undefined,
      description: this.form.description || undefined,
    }).subscribe({
      next: () => {
        this.saving.set(false);
        this.saved.emit();
      },
      error: () => this.saving.set(false),
    });
  }
}
