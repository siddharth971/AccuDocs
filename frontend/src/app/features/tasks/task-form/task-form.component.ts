import { Component, OnInit, inject, signal, input, output, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { TaskService } from '@core/services/task.service';
import { ClientService } from '@core/services/client.service';
import { NotificationService } from '@core/services/notification.service';
import { UserService } from '@core/services/user.service';
import { Task, CreateTaskDto, UpdateTaskDto, TaskStatus } from '@app/models/task.model';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatChipsModule,
    MatSelectModule,
    MatRadioModule,
    MatDialogModule,
  ],
  template: `
    @if (visible()) {
      <div class="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" (click)="closeForm()"></div>

        <!-- Modal -->
        <div class="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl p-6 animate-page-enter bg-white dark:bg-slate-900 shadow-2xl ring-1 ring-slate-200 dark:ring-slate-800" (click)="$event.stopPropagation()">
          <!-- Header -->
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-lg font-bold" style="color: var(--text-primary);">
              {{ selectedTask() ? '📝 Edit Task' : '📝 Create Task' }}
            </h2>
            <button class="p-2 rounded-lg transition-all duration-200 hover:bg-opacity-10" style="color: var(--text-secondary);" (click)="closeForm()">
              <mat-icon class="text-[18px] w-[18px] h-[18px]">close</mat-icon>
            </button> 
          </div>

          <!-- Form -->
          <form [formGroup]="form" (ngSubmit)="saveTask()" class="space-y-4">
            <!-- Title -->
            <div>
              <label class="block text-xs font-semibold mb-1.5" style="color: var(--text-secondary);">Task Title *</label>
              <input
                formControlName="title"
                placeholder="Enter task title"
                class="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-all bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
              @if (form.get('title')?.hasError('required') && form.get('title')?.touched) {
                <span class="text-xs text-red-500 mt-1">Title is required</span>
              }
            </div>

            <!-- Description -->
            <div>
              <label class="block text-xs font-semibold mb-1.5" style="color: var(--text-secondary);">Description</label>
              <textarea
                formControlName="description"
                rows="3"
                placeholder="Enter task description"
                class="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-all resize-none bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              ></textarea>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Client -->
              <div>
                <label class="block text-xs font-semibold mb-1.5" style="color: var(--text-secondary);">Client</label>
                <select
                  formControlName="clientId"
                  class="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-all bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">None</option>
                  @for (client of clients(); track client.id) {
                    <option [value]="client.id">{{ client.name || client.code }}</option>
                  }
                </select>
              </div>

              <!-- Assigned To -->
              <div>
                <label class="block text-xs font-semibold mb-1.5" style="color: var(--text-secondary);">Assign To</label>
                <select
                  formControlName="assignedTo"
                  class="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-all bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Unassigned</option>
                  @for (user of users(); track user.id) {
                    <option [value]="user.id">{{ user.name }}</option>
                  }
                </select>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Priority -->
              <div>
                <label class="block text-xs font-semibold mb-1.5" style="color: var(--text-secondary);">Priority *</label>
                <div class="flex gap-4 px-1 py-1">
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input type="radio" formControlName="priority" value="low" class="text-green-500 focus:ring-green-500">
                    <span class="text-sm font-medium text-green-600 dark:text-green-400">Low</span>
                  </label>
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input type="radio" formControlName="priority" value="medium" class="text-yellow-500 focus:ring-yellow-500">
                    <span class="text-sm font-medium text-yellow-600 dark:text-yellow-400">Medium</span>
                  </label>
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input type="radio" formControlName="priority" value="high" class="text-red-500 focus:ring-red-500">
                    <span class="text-sm font-medium text-red-600 dark:text-red-400">High</span>
                  </label>
                </div>
              </div>

              <!-- Status -->
              <div>
                <label class="block text-xs font-semibold mb-1.5" style="color: var(--text-secondary);">Status *</label>
                <select
                  formControlName="status"
                  class="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-all bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="review">In Review</option>
                  <option value="done">Done</option>
                </select>
              </div>
            </div>

            <!-- Due Date -->
            <div>
              <label class="block text-xs font-semibold mb-1.5" style="color: var(--text-secondary);">Due Date</label>
              <input
                type="date"
                formControlName="dueDate"
                class="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-all bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <!-- Tags -->
            <div>
              <label class="block text-xs font-semibold mb-1.5" style="color: var(--text-secondary);">Tags</label>
              <div class="flex flex-col gap-2">
                <input
                  #tagInput
                  (keydown.enter)="addTag({value: tagInput.value}); tagInput.value = ''; $event.preventDefault()"
                  placeholder="Type a tag and press Enter"
                  class="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-all bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
                @if (formTags().length > 0) {
                  <div class="flex flex-wrap gap-2 mt-2">
                    @for (tag of formTags(); track tag) {
                      <div class="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-700">
                        <span>{{ tag }}</span>
                        <button type="button" (click)="removeTag(tag)" class="text-slate-400 hover:text-red-500">
                          <mat-icon class="text-[14px] w-[14px] h-[14px] leading-[14px]">close</mat-icon>
                        </button>
                      </div>
                    }
                  </div>
                }
              </div>
            </div>

            <!-- Footer Buttons -->
            <div class="flex justify-end gap-3 pt-6 mt-6 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                (click)="closeForm()"
                class="px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                [disabled]="!form.valid"
                class="px-5 py-2.5 rounded-xl text-white text-sm font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100"
                style="background: linear-gradient(135deg, #0074c9, #005fa3); box-shadow: 0 4px 14px -2px rgba(0, 116, 201, 0.4);"
              >
                {{ selectedTask() ? 'Update' : 'Create' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
})
export class TaskFormComponent implements OnInit {
  private taskService = inject(TaskService);
  private clientService = inject(ClientService);
  private notificationService = inject(NotificationService);
  private userService = inject(UserService);
  private fb = inject(FormBuilder);

  visible = input<boolean>(false);
  initialTask = input<Task | null>(null);
  clientId = input<string | null>(null);
  initialStatus = input<TaskStatus>('todo');

  onSave = output<void>();
  visibleChange = output<boolean>();

  selectedTask = signal<Task | null>(null);
  clients = signal<any[]>([]);
  users = signal<any[]>([]);
  formTags = signal<string[]>([]);
  separatorKeysCodes = [13];

  form: FormGroup;

  constructor() {
    this.form = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      clientId: [''],
      assignedTo: [''],
      priority: ['medium', Validators.required],
      status: ['todo', Validators.required],
      dueDate: [''],
    });

    effect(() => {
      if (this.visible()) {
        this.selectedTask.set(this.initialTask() || null);
        this.updateFormValues();
      }
    });
  }

  ngOnInit(): void {
    this.loadClients();
    this.loadUsers();
  }

  updateFormValues(): void {
    const task = this.selectedTask();

    // Format date string for the native date input (yyyy-MM-dd)
    let formattedDate = '';
    if (task?.dueDate) {
      try {
        formattedDate = new Date(task.dueDate).toISOString().split('T')[0];
      } catch (e) {
        // Date parsing fallback
      }
    }

    this.form.patchValue({
      title: task?.title || '',
      description: task?.description || '',
      clientId: this.clientId() || task?.clientId || '',
      assignedTo: task?.assignee?.id || '',
      priority: task?.priority || 'medium',
      status: task?.status || this.initialStatus() || 'todo',
      dueDate: formattedDate,
    });
    this.formTags.set(task?.tags || []);
  }

  loadClients(): void {
    this.clientService.getClients().subscribe({
      next: (response) => {
        this.clients.set(response.data);
      },
      error: (error) => {
        console.error('Failed to load clients', error);
      },
    });
  }

  loadUsers(): void {
    this.userService.getUsers(1, 100, undefined, 'admin', true).subscribe({
      next: (response) => {
        this.users.set(response.data);
      },
      error: (error) => {
        console.error('Failed to load users', error);
      },
    });
  }

  addTag(event: any): void {
    const value = (event.value || '').trim();
    if (value) {
      const tags = this.formTags();
      if (!tags.includes(value)) {
        this.formTags.set([...tags, value]);
      }
      event.chipInput.clear();
    }
  }

  removeTag(tag: string): void {
    this.formTags.set(this.formTags().filter((t) => t !== tag));
  }

  saveTask(): void {
    if (!this.form.valid) {
      return;
    }

    const formValue = this.form.value;
    const payload = {
      title: formValue.title,
      description: formValue.description,
      clientId: formValue.clientId,
      assignedTo: formValue.assignedTo,
      priority: formValue.priority,
      status: formValue.status,
      dueDate: formValue.dueDate,
      tags: this.formTags(),
    };

    const task = this.selectedTask();
    if (task) {
      this.taskService.updateTask(task.id, payload).subscribe({
        next: () => {
          this.notificationService.success('Task updated successfully');
          this.closeForm();
          this.onSave.emit();
        },
        error: (error) => {
          console.error('Failed to update task', error);
          this.notificationService.error('Failed to update task');
        },
      });
    } else {
      this.taskService.createTask(payload as CreateTaskDto).subscribe({
        next: () => {
          this.notificationService.success('Task created successfully');
          this.closeForm();
          this.onSave.emit();
        },
        error: (error) => {
          console.error('Failed to create task', error);
          this.notificationService.error('Failed to create task');
        },
      });
    }
  }

  closeForm(): void {
    this.visibleChange.emit(false);
    this.form.reset();
    this.formTags.set([]);
  }
}
