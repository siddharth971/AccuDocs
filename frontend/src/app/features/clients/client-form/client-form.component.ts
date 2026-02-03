import { Component, inject, signal, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ClientService } from '@core/services/client.service';
import { NotificationService } from '@core/services/notification.service';

@Component({
  selector: 'app-client-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="flex flex-col h-full bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-200/50 dark:border-slate-800/50">
      
      <!-- Premium Modal Header -->
      <header class="px-8 py-6 border-b border-slate-100 dark:border-slate-800 relative bg-gradient-to-r from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-2xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400">
              <mat-icon class="text-2xl">{{ isEditMode() ? 'edit' : 'person_add' }}</mat-icon>
            </div>
            <div>
              <h1 class="text-xl font-bold text-slate-900 dark:text-white leading-tight">
                {{ isEditMode() ? 'Edit Client' : 'Add New Client' }}
              </h1>
              <p class="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                {{ isEditMode() ? 'Update the details for this client profile' : 'Create a fresh client profile in the system' }}
              </p>
            </div>
          </div>
          
          <button 
            type="button"
            (click)="onCancel()"
            class="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
          >
            <mat-icon>close</mat-icon>
          </button>
        </div>
      </header>

      <!-- Scrollable Form Content -->
      <main class="flex-1 overflow-y-auto p-8">
        @if (isLoadingData()) {
          <div class="flex flex-col items-center justify-center py-20">
            <div class="w-16 h-16 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin"></div>
            <p class="mt-4 text-slate-500 font-medium font-poppins">Gathering client data...</p>
          </div>
        } @else {
          <form [formGroup]="clientForm" (ngSubmit)="onSubmit()" class="space-y-8">
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
              <!-- Client Code Field -->
              <div class="space-y-2.5">
                <label class="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">
                  <mat-icon class="text-lg opacity-60">tag</mat-icon>
                  Client Code <span class="text-red-500">*</span>
                </label>
                <div class="relative group">
                  <input 
                    type="text"
                    formControlName="code"
                    placeholder="e.g. CLI001"
                    class="form-input-premium"
                    [class.error]="clientForm.get('code')?.touched && clientForm.get('code')?.invalid"
                  >
                  <div class="input-focus-border"></div>
                </div>
                @if (clientForm.get('code')?.touched && clientForm.get('code')?.hasError('required')) {
                  <p class="text-xs text-red-500 font-medium mt-1 ml-1 flex items-center gap-1">
                    <mat-icon class="text-sm">error_outline</mat-icon> Client code is required
                  </p>
                }
              </div>

              <!-- Full Name Field -->
              <div class="space-y-2.5">
                <label class="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">
                  <mat-icon class="text-lg opacity-60">person</mat-icon>
                  Full Name <span class="text-red-500">*</span>
                </label>
                <div class="relative group">
                  <input 
                    type="text"
                    formControlName="name"
                    placeholder="John Doe"
                    class="form-input-premium"
                    [class.error]="clientForm.get('name')?.touched && clientForm.get('name')?.invalid"
                  >
                  <div class="input-focus-border"></div>
                </div>
                @if (clientForm.get('name')?.touched && clientForm.get('name')?.hasError('required')) {
                  <p class="text-xs text-red-500 font-medium mt-1 ml-1 flex items-center gap-1">
                    <mat-icon class="text-sm">error_outline</mat-icon> Name is required
                  </p>
                }
              </div>

              <!-- Mobile Number Field -->
              <div class="space-y-2.5 md:col-span-2">
                <label class="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">
                  <mat-icon class="text-lg opacity-60">call</mat-icon>
                  Mobile Number <span class="text-red-500">*</span>
                </label>
                <div class="relative group max-w-md">
                  <input 
                    type="tel"
                    formControlName="mobile"
                    placeholder="+91 00000 00000"
                    class="form-input-premium"
                    [class.error]="clientForm.get('mobile')?.touched && clientForm.get('mobile')?.invalid"
                  >
                  <div class="input-focus-border"></div>
                </div>
                <p class="text-xs text-slate-400 mt-1 ml-1">Format: +[CountryCode] [Number]</p>
                @if (clientForm.get('mobile')?.touched && clientForm.get('mobile')?.hasError('required')) {
                  <p class="text-xs text-red-500 font-medium mt-1 ml-1 flex items-center gap-1">
                    <mat-icon class="text-sm">error_outline</mat-icon> Mobile number is required
                  </p>
                }
              </div>
            </div>

            <!-- Footer Actions -->
            <div class="pt-8 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-4">
              <button 
                type="button" 
                (click)="onCancel()" 
                class="px-6 py-2 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-all duration-200"
              >
                Cancel
              </button>
              
              <button 
                type="submit" 
                [disabled]="clientForm.invalid || isSubmitting()"
                class="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-indigo-600 text-white font-bold text-sm shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none"
              >
                @if (isSubmitting()) {
                  <div class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>{{ isEditMode() ? 'Updating...' : 'Creating...' }}</span>
                } @else {
                  <mat-icon>{{ isEditMode() ? 'check_circle' : 'add_circle' }}</mat-icon>
                  <span>{{ isEditMode() ? 'Save Changes' : 'Create Client' }}</span>
                }
              </button>
            </div>
          </form>
        }
      </main>
    </div>
  `,
  styles: [`
    .form-input-premium {
      @apply w-full px-4 py-4 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-secondary-50/50 dark:bg-secondary-900/50 text-secondary-900 dark:text-white placeholder-secondary-400 focus:outline-none transition-all duration-300 font-medium;
    }

    .form-input-premium:focus {
      @apply bg-white dark:bg-secondary-900 border-primary-500;
    }

    .input-focus-border {
      @apply absolute -inset-0.5 bg-gradient-to-r from-primary-500 to-indigo-500 rounded-xl opacity-0 blur-sm transition-opacity duration-300 pointer-events-none -z-10;
    }

    .group:focus-within .input-focus-border {
      @apply opacity-40;
    }

    .form-input-premium.error {
      @apply border-danger-300 bg-danger-50/30 dark:bg-danger-900/10 dark:border-danger-900/50;
    }

    .premium-button {
      @apply flex items-center gap-2 px-6 py-4 rounded-xl bg-gradient-to-r from-primary-600 to-primary-800 text-white font-bold text-sm shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none;
    }

    /* Custom Scrollbar for Form content */
    main::-webkit-scrollbar {
      width: 6px;
    }
    main::-webkit-scrollbar-thumb {
      background: #e2e8f0;
      border-radius: 10px;
    }
    .dark main::-webkit-scrollbar-thumb {
      background: #334155;
    }
  `],
})
export class ClientFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private clientService = inject(ClientService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  isEditMode = signal(false);
  isLoadingData = signal(false);
  isSubmitting = signal(false);
  private clientId: string | null = null;

  @Input() isModal = false;
  @Input() closeCallback?: () => void;

  // Modal Input
  @Input() set initialData(data: any) {
    if (data) {
      this.isEditMode.set(true);
      this.clientId = data.id;
      this.clientForm.patchValue({
        code: data.code,
        name: data.user?.name || data.name,
        mobile: data.user?.mobile || data.mobile,
      });
    }
  }

  clientForm: FormGroup = this.fb.group({
    code: ['', [Validators.required]],
    name: ['', [Validators.required]],
    mobile: ['', [Validators.required]],
  });

  ngOnInit(): void {
    this.clientId = this.route.snapshot.paramMap.get('id');

    if (this.clientId) {
      this.isEditMode.set(true);
      this.loadClient();
    } else {
      this.loadNextCode();
    }
  }

  private loadClient(): void {
    if (!this.clientId) return;

    this.isLoadingData.set(true);
    this.clientService.getClient(this.clientId).subscribe({
      next: (response) => {
        const client = response.data;
        this.clientForm.patchValue({
          code: client.code,
          name: client.user?.name,
          mobile: client.user?.mobile,
        });
      },
      error: () => {
        this.notificationService.error('Failed to load client');
        this.router.navigate(['/clients']);
      },
      complete: () => this.isLoadingData.set(false),
    });
  }

  private loadNextCode(): void {
    this.clientService.getNextCode().subscribe({
      next: (response) => {
        this.clientForm.patchValue({ code: response.data.code });
      },
    });
  }

  onSubmit(): void {
    if (this.clientForm.invalid) return;

    this.isSubmitting.set(true);
    const formData = this.clientForm.value;

    const request$ = this.isEditMode()
      ? this.clientService.updateClient(this.clientId!, formData)
      : this.clientService.createClient(formData);

    request$.subscribe({
      next: () => {
        this.notificationService.success(
          this.isEditMode() ? 'Client updated successfully' : 'Client created successfully'
        );
        if (this.isModal && this.closeCallback) {
          this.closeCallback();
        } else {
          this.router.navigate(['/clients']);
        }
      },
      error: () => this.isSubmitting.set(false),
      complete: () => this.isSubmitting.set(false),
    });
  }

  onCancel(): void {
    if (this.isModal && this.closeCallback) {
      this.closeCallback();
    } else {
      this.router.navigate(['/clients']);
    }
  }
}
