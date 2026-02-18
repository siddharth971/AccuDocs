
import { Component, Input, OnChanges, SimpleChanges, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChecklistService, Checklist, ChecklistTemplate } from '@core/services/checklist.service';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  heroPlusSolid,
  heroCheckCircleSolid,
  heroClockSolid,
  heroExclamationCircleSolid,
  heroArchiveBoxSolid,
  heroTrashSolid
} from '@ng-icons/heroicons/solid';
import { ChecklistDetailComponent } from '../checklist-detail/checklist-detail.component';

@Component({
  selector: 'app-checklists',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIconComponent, ChecklistDetailComponent],
  template: `
    @if (selectedChecklist()) {
      <app-checklist-detail 
        [checklistId]="selectedChecklist()!.id" 
        (back)="selectedChecklist.set(null); loadData()"
      ></app-checklist-detail>
    } @else {
    <div class="p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-xl font-bold text-slate-900 dark:text-white">Document Checklists</h2>
          <p class="text-sm text-slate-500 dark:text-slate-400">Track pending and received documents from clients.</p>
        </div>
        <button 
          (click)="openCreateModal()"
          class="flex items-center gap-2 px-4 py-2 bg-[#0074c9] text-white rounded-xl font-semibold hover:bg-blue-600 transition-colors shadow-lg shadow-blue-900/20"
        >
          <ng-icon name="heroPlusSolid" size="18"></ng-icon>
          New Checklist
        </button>
      </div>

      <!-- Stats Overview -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-bold uppercase text-slate-500 tracking-wider">Total Checklists</span>
            <div class="p-1.5 bg-slate-100 dark:bg-slate-700 rounded-lg">
              <ng-icon name="heroArchiveBoxSolid" class="text-slate-500"></ng-icon>
            </div>
          </div>
          <p class="text-2xl font-black text-slate-900 dark:text-white">{{ stats().total }}</p>
        </div>
        <div class="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-bold uppercase text-blue-500 tracking-wider">Active</span>
            <div class="p-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <ng-icon name="heroClockSolid" class="text-blue-500"></ng-icon>
            </div>
          </div>
          <p class="text-2xl font-black text-slate-900 dark:text-white">{{ stats().active }}</p>
        </div>
        <div class="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-bold uppercase text-green-500 tracking-wider">Completed</span>
            <div class="p-1.5 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <ng-icon name="heroCheckCircleSolid" class="text-green-500"></ng-icon>
            </div>
          </div>
          <p class="text-2xl font-black text-slate-900 dark:text-white">{{ stats().completed }}</p>
        </div>
        <div class="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-bold uppercase text-purple-500 tracking-wider">Avg. Completion</span>
            <div class="p-1.5 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <ng-icon name="heroExclamationCircleSolid" class="text-purple-500"></ng-icon>
            </div>
          </div>
          <p class="text-2xl font-black text-slate-900 dark:text-white">{{ stats().avgProgress }}%</p>
        </div>
      </div>

      <!-- Checklist List -->
      <div class="grid gap-4">
        @if (loading()) {
          <div class="flex flex-col items-center justify-center p-12">
            <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
            <p class="text-slate-500 font-medium">Loading checklists...</p>
          </div>
        } @else if (checklists().length === 0) {
          <div class="flex flex-col items-center justify-center py-16 bg-white dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
            <div class="p-4 bg-slate-50 dark:bg-slate-800 rounded-full mb-4">
              <ng-icon name="heroArchiveBoxSolid" size="32" class="text-slate-400"></ng-icon>
            </div>
            <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-1">No checklists found</h3>
            <p class="text-sm text-slate-500 dark:text-slate-400 max-w-xs text-center mb-6">Create a checklist to start tracking documents for this client.</p>
            <button 
              (click)="openCreateModal()"
              class="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg font-semibold hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            >
              Create First Checklist
            </button>
          </div>
        } @else {
          @for (checklist of checklists(); track checklist.id) {
            <div class="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 hover:shadow-lg hover:border-blue-200 dark:hover:border-blue-900 transition-all cursor-pointer group relative overflow-hidden"
                 (click)="selectChecklist(checklist)">
              
              <!-- Completion Background -->
              <div class="absolute top-0 left-0 h-full bg-blue-50 dark:bg-blue-900/10 transition-all duration-500 pointer-events-none"
                   [style.width.%]="checklist.progress"></div>

              <div class="relative z-10 flex items-start justify-between">
                <div>
                  <div class="flex items-center gap-3 mb-2">
                    <h3 class="font-bold text-slate-900 dark:text-white text-lg">{{ checklist.name }}</h3>
                    <span class="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border"
                          [ngClass]="{
                            'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800': checklist.status === 'completed',
                            'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800': checklist.status === 'active',
                            'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600': checklist.status === 'archived'
                          }">
                      {{ checklist.status }}
                    </span>
                  </div>
                  <div class="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                    <div class="flex items-center gap-1.5">
                      <div class="w-1.5 h-1.5 rounded-full bg-slate-400"></div>
                      <span>FY {{ checklist.financialYear }}</span>
                    </div>
                    @if (checklist.dueDate) {
                      <div class="flex items-center gap-1.5" [class.text-red-500]="isOverdue(checklist)">
                        <ng-icon name="heroClockSolid" size="14"></ng-icon>
                        <span>Due: {{ checklist.dueDate | date:'mediumDate' }}</span>
                      </div>
                    }
                  </div>
                </div>
                
                <!-- Progress Stat -->
                <div class="flex flex-col items-end">
                  <div class="text-3xl font-black text-slate-900 dark:text-white leading-none mb-1 tabular-nums">
                    {{ checklist.progress }}<span class="text-lg text-slate-400 align-top">%</span>
                  </div>
                  <div class="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    {{ checklist.receivedItems }} / {{ checklist.totalItems }} received
                  </div>
                </div>
              </div>
            </div>
          }
        }
      </div>
    </div>

    <!-- Create Checklist Modal -->
    @if (showCreateModal) {
      <div class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
        <div class="bg-white dark:bg-slate-800 w-full max-w-lg rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
          <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800">
            <h3 class="text-lg font-bold text-slate-900 dark:text-white">Create New Checklist</h3>
            <button (click)="showCreateModal = false" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
              <ng-icon name="heroExclamationCircleSolid" class="rotate-45" size="24"></ng-icon> <!-- Close icon substitute -->
            </button>
          </div>
          
          <div class="p-6 space-y-5">
            <div>
              <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Template</label>
              <div class="relative">
                <select 
                  [(ngModel)]="creationData.templateId" 
                  (change)="onTemplateChange()"
                  class="w-full p-3 pl-4 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none transition-all cursor-pointer font-medium"
                >
                  <option value="">-- Blank Checklist --</option>
                  @for (template of templates(); track template.id) {
                    <option [value]="template.id">{{ template.name }}</option>
                  }
                </select>
                <div class="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                  <svg class="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
                </div>
              </div>
              <p class="mt-2 text-xs text-slate-500">Select a template to pre-fill items or start from scratch.</p>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Checklist Name</label>
              <input type="text" [(ngModel)]="creationData.name" class="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-400" placeholder="e.g. ITR Filing FY 2024-25">
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Financial Year</label>
                <select [(ngModel)]="creationData.financialYear" class="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none">
                  <option value="2024-2025">2024-2025</option>
                  <option value="2023-2024">2023-2024</option>
                  <option value="2022-2023">2022-2023</option>
                  <option value="2021-2022">2021-2022</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Due Date</label>
                <input type="date" [(ngModel)]="creationData.dueDate" class="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer">
              </div>
            </div>

             <div [class.opacity-50]="creationData.templateId" [class.pointer-events-none]="creationData.templateId">
                <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Service Type</label>
                <select [(ngModel)]="creationData.serviceType" class="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none">
                   <option value="itr">ITR Filing</option>
                   <option value="gst">GST Compliance</option>
                   <option value="audit">Tax Audit</option>
                   <option value="roc">ROC Compliance</option>
                   <option value="tds">TDS Filing</option>
                   <option value="custom">Custom / Other</option>
                </select>
              </div>
          </div>

          <div class="p-6 pt-2 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-700">
            <button (click)="showCreateModal = false" class="px-5 py-2.5 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors">Cancel</button>
            <button (click)="createChecklist()" 
                    [disabled]="!creationData.name"
                    class="px-6 py-2.5 bg-[#0074c9] text-white font-bold rounded-xl hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:shadow-none hover:-translate-y-0.5 active:translate-y-0">
              Create Checklist
            </button>
          </div>
        </div>
      </div>
    }
  } <!-- Close the else block -->
  `,
  providers: [
    provideIcons({
      heroPlusSolid,
      heroCheckCircleSolid,
      heroClockSolid,
      heroExclamationCircleSolid,
      heroArchiveBoxSolid,
      heroTrashSolid
    })
  ]
})
export class ChecklistsComponent implements OnChanges {
  @Input({ required: true }) clientId!: string;

  private checklistService = inject(ChecklistService);

  checklists = signal<Checklist[]>([]);
  templates = signal<ChecklistTemplate[]>([]);
  loading = signal(false);

  stats = signal({
    total: 0,
    active: 0,
    completed: 0,
    avgProgress: 0,
    overdue: 0
  });

  selectedChecklist = signal<Checklist | null>(null);

  showCreateModal = false;
  creationData = {
    templateId: '',
    name: '',
    financialYear: '2024-2025',
    serviceType: 'itr',
    dueDate: '',
    notes: ''
  };

  ngOnChanges(changes: SimpleChanges) {
    if (changes['clientId'] && this.clientId) {
      this.loadData();
    }
  }

  loadData() {
    this.loading.set(true);

    // Fetch Checklists
    this.checklistService.getChecklists({ clientId: this.clientId }).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.checklists.set(res.data || []);
        } else if (res.checklists) {
          this.checklists.set(res.checklists);
        }
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });

    // Fetch Stats
    this.checklistService.getStats(this.clientId).subscribe({
      next: (res: any) => {
        if (res.success) this.stats.set(res.data);
      }
    });

    // Fetch Templates
    this.checklistService.getTemplates().subscribe({
      next: (res) => {
        if (res.success) this.templates.set(res.data);
      }
    });
  }

  openCreateModal() {
    this.resetForm();
    this.showCreateModal = true;
  }

  resetForm() {
    this.creationData = {
      templateId: '',
      name: '',
      financialYear: '2024-2025',
      serviceType: 'itr',
      dueDate: '',
      notes: ''
    };
  }

  onTemplateChange() {
    if (!this.creationData.templateId) return;

    const template = this.templates().find(t => t.id === this.creationData.templateId);
    if (template) {
      this.creationData.name = template.name + ' - ' + this.creationData.financialYear;
      this.creationData.serviceType = template.serviceType;
    }
  }

  createChecklist() {
    if (!this.creationData.name) return;

    this.checklistService.createChecklist({
      clientId: this.clientId,
      ...this.creationData
    }).subscribe({
      next: (res) => {
        if (res.success) {
          this.showCreateModal = false;
          this.loadData();
        }
      }
    });
  }

  selectChecklist(checklist: Checklist) {
    this.selectedChecklist.set(checklist);
  }

  isOverdue(checklist: Checklist): boolean {
    if (!checklist.dueDate || checklist.status === 'completed') return false;
    return new Date(checklist.dueDate) < new Date();
  }
}
