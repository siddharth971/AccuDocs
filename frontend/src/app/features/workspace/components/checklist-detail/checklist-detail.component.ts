
import { Component, Input, Output, EventEmitter, inject, signal, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChecklistService, Checklist, ChecklistItem } from '@core/services/checklist.service';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  heroArrowLeftSolid,
  heroCheckCircleSolid,
  heroXCircleSolid,
  heroMinusCircleSolid,
  heroClockSolid,
  heroPlusSolid,
  heroTrashSolid
} from '@ng-icons/heroicons/solid';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-checklist-detail',
  standalone: true,
  imports: [CommonModule, NgIconComponent, FormsModule],
  template: `
    <div class="p-6 h-full flex flex-col animate-in fade-in slide-in-from-right-4 duration-300">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6 shrink-0">
        <div class="flex items-center gap-4">
          <button 
            (click)="back.emit()"
            class="p-2 -ml-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <ng-icon name="heroArrowLeftSolid" size="20"></ng-icon>
          </button>
          <div>
            <h2 class="text-xl font-bold text-slate-900 dark:text-white">{{ checklist()?.name }}</h2>
            <div class="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
              <span class="font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wider text-[10px]">
                {{ checklist()?.serviceType }}
              </span>
              <span>•</span>
              <span>FY {{ checklist()?.financialYear }}</span>
            </div>
          </div>
        </div>
        
        <div class="flex items-center gap-4">
          <!-- Progress Stats -->
          <div class="text-right">
            <div class="text-2xl font-black text-slate-900 dark:text-white leading-none">
              {{ checklist()?.progress }}%
            </div>
            <div class="text-xs text-slate-500 font-medium">Completed</div>
          </div>
          
          <!-- Circular Progress -->
          <div class="relative w-12 h-12">
            <svg class="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path class="text-slate-100 dark:text-slate-700" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" stroke-width="4" />
              <path class="text-blue-500 transition-all duration-1000 ease-out" [attr.stroke-dasharray]="checklist()?.progress + ', 100'" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" stroke-width="4" />
            </svg>
          </div>
        </div>
      </div>

      <!-- Item List -->
      <div class="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
        @if (loading()) {
            <div class="flex justify-center p-8">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        } @else {
            @for (category of groupedItems() | keyvalue; track category.key) {
            <div class="mb-6">
                <h3 class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 pl-1">
                {{ category.key || 'General' }}
                </h3>
                <div class="space-y-2">
                @for (item of category.value; track item.id) {
                    <div 
                    class="group flex items-start p-3 bg-white dark:bg-slate-800 rounded-xl border transition-all duration-200"
                    [ngClass]="{
                        'border-green-200 bg-green-50/30 dark:border-green-900/30 dark:bg-green-900/10': item.status === 'received',
                        'border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700': item.status !== 'received'
                    }"
                    >
                    <!-- Checkbox / Status Icon -->
                    <button 
                        (click)="toggleItemStatus(item)"
                        class="mt-0.5 shrink-0 w-5 h-5 rounded-md border flex items-center justify-center transition-all duration-200"
                        [ngClass]="{
                        'bg-green-500 border-green-500 text-white': item.status === 'received',
                        'bg-slate-100 border-slate-300 text-slate-300 hover:border-blue-400': item.status === 'pending',
                        'bg-slate-200 border-slate-300 text-slate-500': item.status === 'not_applicable'
                        }"
                    >
                        @if (item.status === 'received') {
                        <ng-icon name="heroCheckCircleSolid" size="14"></ng-icon>
                        } @else if (item.status === 'not_applicable') {
                        <ng-icon name="heroMinusCircleSolid" size="14"></ng-icon>
                        }
                    </button>

                    <div class="ml-3 flex-1 min-w-0">
                        <div class="flex items-center justify-between">
                        <span 
                            class="text-sm font-medium transition-colors"
                            [ngClass]="{
                            'text-slate-900 dark:text-white': item.status !== 'received',
                            'text-slate-500 line-through decoration-slate-400': item.status === 'received',
                            'text-slate-400 italic': item.status === 'not_applicable'
                            }"
                        >
                            {{ item.label }}
                        </span>
                        
                        <!-- Actions -->
                        <div class="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                            (click)="markNotApplicable(item)" 
                            class="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                            title="Mark as Not Applicable"
                            >
                            N/A
                            </button>
                             <button 
                            (click)="deleteItem(item)"
                            class="p-1 text-slate-300 hover:text-red-500 transition-colors"
                            title="Delete Item"
                            >
                            <ng-icon name="heroTrashSolid" size="14"></ng-icon>
                            </button>
                        </div>
                        </div>
                        
                        @if (item.description) {
                        <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{{ item.description }}</p>
                        }
                    </div>
                    </div>
                }
                </div>
            </div>
            }
        }

        <!-- Add Item Button -->
        <button 
            (click)="showAddItem = true"
            class="w-full py-3 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-slate-500 dark:text-slate-400 text-sm font-medium hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all flex items-center justify-center gap-2"
        >
            <ng-icon name="heroPlusSolid" size="16"></ng-icon>
            Add Item
        </button>
      </div>

       <!-- Add Item Inline Form -->
       @if (showAddItem) {
        <div class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div class="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl shadow-2xl p-6">
                <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-4">Add Checklist Item</h3>
                
                <div class="space-y-4">
                    <div>
                        <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Item Name</label>
                        <input type="text" [(ngModel)]="newItemData.label" class="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. Rent Agreement">
                    </div>
                    
                    <div>
                        <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Category</label>
                        <input type="text" [(ngModel)]="newItemData.category" class="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. General">
                    </div>

                    <div class="flex items-center gap-2">
                        <input type="checkbox" [(ngModel)]="newItemData.required" id="req" class="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500">
                        <label for="req" class="text-sm text-slate-700 dark:text-slate-300">Required item</label>
                    </div>
                </div>

                <div class="flex justify-end gap-3 mt-6">
                    <button (click)="showAddItem = false" class="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">Cancel</button>
                    <button (click)="addItem()" [disabled]="!newItemData.label" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">Add Item</button>
                </div>
            </div>
        </div>
       }
    </div>
  `,
  providers: [
    provideIcons({
      heroArrowLeftSolid,
      heroCheckCircleSolid,
      heroXCircleSolid,
      heroMinusCircleSolid,
      heroClockSolid,
      heroPlusSolid,
      heroTrashSolid
    })
  ]
})
export class ChecklistDetailComponent implements OnChanges {
  @Input({ required: true }) checklistId!: string;
  @Output() back = new EventEmitter<void>();

  private checklistService = inject(ChecklistService);

  checklist = signal<Checklist | null>(null);
  loading = signal(false);
  groupedItems = signal<Record<string, ChecklistItem[]>>({});

  showAddItem = false;
  newItemData = { label: '', category: '', required: true };

  ngOnChanges(changes: SimpleChanges) {
    if (changes['checklistId'] && this.checklistId) {
      this.loadChecklist();
    }
  }

  loadChecklist() {
    this.loading.set(true);
    this.checklistService.getChecklist(this.checklistId).subscribe({
      next: (res) => {
        if (res.success) {
          this.checklist.set(res.data);
          this.groupItems(res.data.items);
        }
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  groupItems(items: ChecklistItem[]) {
    const groups: Record<string, ChecklistItem[]> = {};
    items.forEach(item => {
      const category = item.category || 'Uncategorized';
      if (!groups[category]) groups[category] = [];
      groups[category].push(item);
    });
    this.groupedItems.set(groups);
  }

  toggleItemStatus(item: ChecklistItem) {
    const newStatus = item.status === 'received' ? 'pending' : 'received';
    // Optimistic update
    const checklist = this.checklist();
    if (checklist) {
      // Update local state temporarily
      const updatedItems = checklist.items.map(i => i.id === item.id ? { ...i, status: newStatus } : i);
      // Recalculate progress locally (simple stats only)

      // Ideally, call API then reload
    }

    this.checklistService.updateItemStatus(this.checklistId, item.id, newStatus).subscribe({
      next: (res) => {
        if (res.success) {
          this.checklist.set(res.data);
          this.groupItems(res.data.items);
        }
      }
    });
  }

  markNotApplicable(item: ChecklistItem) {
    this.checklistService.updateItemStatus(this.checklistId, item.id, 'not_applicable').subscribe({
      next: (res) => {
        if (res.success) {
          this.checklist.set(res.data);
          this.groupItems(res.data.items);
        }
      }
    });
  }

  deleteItem(item: ChecklistItem) {
    if (!confirm('Delete this item?')) return;
    this.checklistService.removeItem(this.checklistId, item.id).subscribe({
      next: (res) => {
        if (res.success) {
          this.checklist.set(res.data);
          this.groupItems(res.data.items);
        }
      }
    });
  }

  addItem() {
    if (!this.newItemData.label) return;
    this.checklistService.addItem(this.checklistId, this.newItemData).subscribe({
      next: (res) => {
        if (res.success) {
          this.checklist.set(res.data);
          this.groupItems(res.data.items);
          this.showAddItem = false;
          this.newItemData = { label: '', category: '', required: true };
        }
      }
    });
  }
}
