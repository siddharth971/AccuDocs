import { Component, Input, Output, EventEmitter, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroXMarkSolid, heroMagnifyingGlassSolid, heroCheckCircleSolid } from '@ng-icons/heroicons/solid';
import { ComplianceService } from '@core/services/compliance.service';
import { ClientService, Client } from '@core/services/client.service';

@Component({
  selector: 'app-assign-client-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIconComponent],
  providers: [provideIcons({ heroXMarkSolid, heroMagnifyingGlassSolid, heroCheckCircleSolid })],
  template: `
    <div
      class="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      (click)="close.emit()"
    >
      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>

      <div
        class="relative w-full max-w-lg rounded-2xl p-6 animate-page-enter bg-white dark:bg-slate-900 shadow-2xl ring-1 ring-slate-200 dark:ring-slate-800"
        (click)="$event.stopPropagation()"
      >
        <div class="flex items-center justify-between mb-4">
          <div>
            <h2 class="text-lg font-bold" style="color: var(--text-primary);">👥 Assign Clients</h2>
            <p class="text-xs mt-1" style="color: var(--text-secondary);">{{ deadlineTitle }}</p>
          </div>
          <button (click)="close.emit()" class="p-2 rounded-lg" style="color: var(--text-secondary);">
            <ng-icon name="heroXMarkSolid" size="18"></ng-icon>
          </button>
        </div>

        <!-- Search -->
        <div class="relative mb-4">
          <ng-icon name="heroMagnifyingGlassSolid" size="16" class="absolute left-3 top-1/2 -translate-y-1/2" style="color: var(--text-secondary);"></ng-icon>
          <input
            [(ngModel)]="searchTerm"
            (ngModelChange)="filterClients()"
            placeholder="Search clients..."
            class="w-full pl-9 pr-3 py-2.5 rounded-xl text-sm outline-none transition-all bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <!-- Client List -->
        <div class="max-h-[300px] overflow-y-auto space-y-2 custom-scrollbar">
          @for (client of filteredClients(); track client.id) {
            <label
              class="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200"
              [style.background]="isSelected(client.id) ? 'rgba(0, 116, 201, 0.06)' : 'var(--hover-bg)'"
              [style.border]="isSelected(client.id) ? '1px solid rgba(0, 116, 201, 0.2)' : '1px solid transparent'"
            >
              <input
                type="checkbox"
                [checked]="isSelected(client.id)"
                (change)="toggleClient(client.id)"
                class="sr-only"
              />
              <div
                class="w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-all duration-200"
                [style.background]="isSelected(client.id) ? '#0074c9' : 'transparent'"
                [style.border]="isSelected(client.id) ? '2px solid #0074c9' : '2px solid var(--border-color)'"
              >
                @if (isSelected(client.id)) {
                  <ng-icon name="heroCheckCircleSolid" size="12" style="color: #fff;"></ng-icon>
                }
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-semibold truncate" style="color: var(--text-primary);">{{ client.user.name }}</p>
                <p class="text-[11px]" style="color: var(--text-secondary);">Code: {{ client.code }} · {{ client.user.mobile }}</p>
              </div>
            </label>
          } @empty {
            <p class="text-center py-8 text-sm" style="color: var(--text-secondary);">No clients found</p>
          }
        </div>

        <!-- Footer -->
        <div class="flex items-center justify-between mt-4 pt-4" style="border-top: 1px solid var(--border-color);">
          <span class="text-xs font-medium" style="color: var(--text-secondary);">
            {{ selectedClientIds().length }} client(s) selected
          </span>
          <div class="flex gap-3">
            <button
              (click)="close.emit()"
              class="px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              (click)="onAssign()"
              [disabled]="saving() || selectedClientIds().length === 0"
              class="px-5 py-2.5 rounded-xl text-white text-sm font-semibold transition-all duration-200 hover:scale-[1.02] disabled:opacity-50"
              style="background: linear-gradient(135deg, #0074c9, #005fa3);"
            >
              {{ saving() ? 'Assigning...' : 'Assign' }}
            </button>
          </div>
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
export class AssignClientModalComponent implements OnInit {
  @Input() deadlineId!: string;
  @Input() deadlineTitle = '';
  @Output() close = new EventEmitter<void>();
  @Output() assigned = new EventEmitter<void>();

  private complianceService = inject(ComplianceService);
  private clientService = inject(ClientService);

  clients = signal<Client[]>([]);
  filteredClients = signal<Client[]>([]);
  selectedClientIds = signal<string[]>([]);
  saving = signal(false);
  searchTerm = '';

  ngOnInit() {
    this.clientService.getClients(1, 200).subscribe({
      next: (res) => {
        this.clients.set(res.data);
        this.filteredClients.set(res.data);
      },
    });
  }

  filterClients() {
    const term = this.searchTerm.toLowerCase();
    if (!term) {
      this.filteredClients.set(this.clients());
      return;
    }
    this.filteredClients.set(
      this.clients().filter(c =>
        c.user.name.toLowerCase().includes(term) ||
        c.code.toLowerCase().includes(term) ||
        c.user.mobile.includes(term)
      )
    );
  }

  isSelected(clientId: string): boolean {
    return this.selectedClientIds().includes(clientId);
  }

  toggleClient(clientId: string) {
    const current = this.selectedClientIds();
    if (current.includes(clientId)) {
      this.selectedClientIds.set(current.filter(id => id !== clientId));
    } else {
      this.selectedClientIds.set([...current, clientId]);
    }
  }

  onAssign() {
    const ids = this.selectedClientIds();
    if (ids.length === 0) return;

    this.saving.set(true);
    this.complianceService.bulkAssignClients(this.deadlineId, ids).subscribe({
      next: () => {
        this.saving.set(false);
        this.assigned.emit();
      },
      error: () => this.saving.set(false),
    });
  }
}
