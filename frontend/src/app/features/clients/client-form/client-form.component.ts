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
    <div class="flex flex-col h-full bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-modal border border-slate-200/50 dark:border-slate-800/50">
      
      <!-- Premium Modal Header -->
      <header class="px-8 py-6 border-b border-slate-100 dark:border-slate-800 relative bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800/50">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-5">
            <div class="w-16 h-16 rounded-full bg-gradient-to-br from-primary-100 to-primary-50 dark:from-primary-900/40 dark:to-primary-900/20 flex items-center justify-center text-primary-600 dark:text-primary-400 shadow-inner border border-primary-200/50 dark:border-primary-800/50">
              <mat-icon class="text-3xl" style="width: 30px; height: 30px; font-size: 30px;">
                {{ isEditMode() ? 'edit_note' : 'person_add' }}
              </mat-icon>
            </div>
            <div>
              <h1 class="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                {{ isEditMode() ? 'Edit Client Profile' : 'Add New Client' }}
              </h1>
              <p class="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium italic opacity-80">
                {{ isEditMode() ? 'Modify existing client information' : 'Create a fresh client profile in the system' }}
              </p>
            </div>
          </div>
          
          <button 
            type="button"
            (click)="onCancel()"
            class="group p-2.5 rounded-xl text-slate-400 hover:text-danger-600 hover:bg-danger-50 dark:hover:bg-danger-900/20 transition-all duration-300"
            title="Close"
          >
            <mat-icon class="transition-transform duration-300 group-hover:rotate-90">close</mat-icon>
          </button>
        </div>
      </header>

      <!-- Scrollable Form Content -->
      <main class="flex-1 overflow-y-auto p-8 custom-scrollbar">
        @if (isLoadingData()) {
          <div class="flex flex-col items-center justify-center py-24">
            <div class="relative w-20 h-20">
              <div class="absolute inset-0 border-4 border-primary-100 dark:border-primary-900/30 rounded-full"></div>
              <div class="absolute inset-0 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p class="mt-6 text-slate-500 dark:text-slate-400 font-bold tracking-wide animate-pulse">GATHERING CLIENT DATA...</p>
          </div>
        } @else {
          <form [formGroup]="clientForm" (ngSubmit)="onSubmit()" class="space-y-10">
            
            <!-- Form Grid -->
            <div class="grid grid-cols-1 md:grid-cols-12 gap-x-8 gap-y-10">
              
              <!-- Client Code Field (4 cols) -->
              <div class="md:col-span-4 space-y-3">
                <label class="flex items-center gap-2 text-[13px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider ml-1">
                  <mat-icon class="text-lg opacity-50">tag</mat-icon>
                  Client Code <span class="text-danger-500">*</span>
                </label>
                <div class="relative group">
                  <input 
                    type="text"
                    formControlName="code"
                    placeholder="e.g. CLI001"
                    class="form-input-premium pr-10 bg-slate-50/80 dark:bg-slate-800/50 cursor-not-allowed opacity-80"
                    [class.error]="clientForm.get('code')?.touched && clientForm.get('code')?.invalid"
                  >
                  <div class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <mat-icon class="text-xl">lock</mat-icon>
                  </div>
                  <div class="input-focus-border !opacity-0"></div>
                </div>
                @if (clientForm.get('code')?.touched && clientForm.get('code')?.hasError('required')) {
                  <p class="text-xs text-danger-500 font-bold mt-1.5 ml-1 flex items-center gap-1.5 animate-slide-up">
                    <mat-icon class="text-[16px] w-[16px] h-[16px]">error</mat-icon> Code is required
                  </p>
                }
              </div>

              <!-- Full Name Field (8 cols) -->
              <div class="md:col-span-8 space-y-3">
                <label class="flex items-center gap-2 text-[13px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider ml-1">
                  <mat-icon class="text-lg opacity-50">person</mat-icon>
                  Full Name <span class="text-danger-500">*</span>
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
                  <p class="text-xs text-danger-500 font-bold mt-1.5 ml-1 flex items-center gap-1.5 animate-slide-up">
                    <mat-icon class="text-[16px] w-[16px] h-[16px]">error_outline</mat-icon> Full name is required
                  </p>
                }
              </div>

              <!-- Mobile Number Field -->
              <div class="md:col-span-12 space-y-3">
                <label class="flex items-center gap-2 text-[13px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider ml-1">
                  <mat-icon class="text-lg opacity-50">call</mat-icon>
                  Mobile Number <span class="text-danger-500">*</span>
                </label>
                <div class="relative group max-w-lg">
                  <div class="absolute left-0 top-1/2 -translate-y-1/2 flex items-center gap-2 px-4 text-slate-500 border-r border-slate-200 dark:border-slate-700 h-8 group-focus-within:border-primary-300 transition-colors z-10 pointer-events-none">
                    <span class="text-sm font-extrabold flex items-center gap-1.5 whitespace-nowrap">
                      <img src="https://flagcdn.com/w20/in.png" class="w-5 h-3.5 rounded-sm shadow-sm" alt="IN">
                      +91
                    </span>
                  </div>
                  <input 
                    type="tel"
                    formControlName="mobile"
                    placeholder="00000 00000"
                    class="form-input-premium !pl-32"
                    [class.error]="clientForm.get('mobile')?.touched && clientForm.get('mobile')?.invalid"
                    (input)="onMobileInput($event)"
                  >
                  <div class="input-focus-border"></div>
                </div>
                <div class="flex items-center justify-between max-w-lg px-1">
                  <p class="text-[11px] text-slate-400 font-medium italic">Format: [10 Digits Mobile Number]</p>
                  @if (clientForm.get('mobile')?.touched && clientForm.get('mobile')?.invalid) {
                    <p class="text-xs text-danger-500 font-bold flex items-center gap-1.5 animate-slide-up">
                      <mat-icon class="text-[16px] w-[16px] h-[16px]">warning</mat-icon> Valid number required
                    </p>
                  }
                </div>
              </div>
            </div>

            <!-- Footer Actions -->
            <div class="pt-8 mt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-6">
              <button 
                type="button" 
                (click)="onCancel()" 
                class="group flex items-center gap-2.5 px-6 py-3 rounded-xl text-sm font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/50 hover:text-danger-600 hover:bg-danger-50 dark:hover:bg-danger-900/20 shadow-sm border border-slate-200/50 dark:border-slate-700/30 transition-all duration-300"
              >
                <mat-icon class="text-xl opacity-60 group-hover:rotate-12 transition-transform">close</mat-icon>
                Discard
              </button>
              
              <button 
                type="submit" 
                [disabled]="clientForm.invalid || isSubmitting()"
                class="relative overflow-hidden flex items-center gap-3 px-10 py-4 rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 text-white font-bold text-sm shadow-xl shadow-primary-500/20 hover:shadow-primary-500/40 hover:-translate-y-1 active:translate-y-0 active:scale-95 transition-all duration-300 disabled:opacity-40 disabled:grayscale disabled:pointer-events-none group"
              >
                <div class="absolute inset-0 bg-white/10 -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out"></div>
                
                @if (isSubmitting()) {
                  <div class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span class="relative z-10">{{ isEditMode() ? 'Updating...' : 'Creating...' }}</span>
                } @else {
                  <mat-icon class="relative z-10 text-xl group-hover:scale-110 transition-transform">{{ isEditMode() ? 'verified' : 'add_task' }}</mat-icon>
                  <span class="relative z-10 tracking-wide uppercase">{{ isEditMode() ? 'Save Changes' : 'Create Client' }}</span>
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
      @apply w-full px-5 py-3 rounded-xl border border-secondary-200 dark:border-secondary-700/50 bg-secondary-50/30 dark:bg-secondary-900/40 text-secondary-900 dark:text-white placeholder-secondary-400/60 focus:outline-none transition-all duration-300 font-semibold text-sm;
      box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.02);
    }

    .form-input-premium:focus {
      @apply bg-white dark:bg-secondary-900 border-primary-400/50 shadow-sm ring-4 ring-primary-500/10;
    }

    .input-focus-border {
      @apply absolute -inset-[2px] bg-gradient-to-r from-primary-400 to-indigo-400 rounded-[14px] opacity-0 blur-[2px] transition-opacity duration-300 pointer-events-none -z-10;
    }

    .group:focus-within .input-focus-border {
      @apply opacity-30;
    }

    .form-input-premium.error {
      @apply border-danger-300 bg-danger-50/20 dark:bg-danger-900/10 dark:border-danger-900/50 text-danger-950 dark:text-danger-100 placeholder-danger-300;
      box-shadow: 0 0 0 4px rgba(220, 38, 38, 0.05);
    }

    .form-input-premium.error:focus {
      @apply ring-danger-500/10 border-danger-400;
    }

    /* Custom Scrollbar */
    .custom-scrollbar::-webkit-scrollbar {
      width: 5px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      @apply bg-transparent;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      @apply bg-slate-200 dark:bg-slate-800 rounded-full;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      @apply bg-slate-300 dark:bg-slate-700;
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

      // Strip +91 from mobile for UI
      let mobile = data.user?.mobile || data.mobile || '';
      if (mobile.startsWith('+91')) {
        mobile = mobile.substring(3).trim();
      }
      // Format mobile for UI
      if (mobile.length > 5) {
        mobile = mobile.substring(0, 5) + ' ' + mobile.substring(5);
      }

      this.clientForm.patchValue({
        code: data.code,
        name: data.user?.name || data.name,
        mobile: mobile,
      });

      // Maintain code as read-only by default
      this.clientForm.get('code')?.disable();
    }
  }

  clientForm: FormGroup = this.fb.group({
    code: ['', [Validators.required]],
    name: ['', [Validators.required]],
    mobile: ['', [Validators.required, Validators.pattern(/^[0-9]{5}\s?[0-9]{5}$/)]],
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

        // Strip +91 from mobile for UI
        let mobile = client.user?.mobile || '';
        if (mobile.startsWith('+91')) {
          mobile = mobile.substring(3).trim();
        }
        // Format mobile for UI
        if (mobile.length > 5) {
          mobile = mobile.substring(0, 5) + ' ' + mobile.substring(5);
        }

        this.clientForm.patchValue({
          code: client.code,
          name: client.user?.name,
          mobile: mobile,
        });

        // Maintain code as read-only by default
        this.clientForm.get('code')?.disable();
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

    // Get all values including disabled ones (like code)
    const formValue = this.clientForm.getRawValue();

    // Format data for backend
    const formData = {
      ...formValue,
      mobile: `+91${formValue.mobile.replace(/\s/g, '')}`
    };

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

  onMobileInput(event: any): void {
    const input = event.target;
    let value = input.value.replace(/\D/g, ''); // Remove non-digits

    // Limit to 10 digits
    if (value.length > 10) {
      value = value.substring(0, 10);
    }

    // Format as 00000 00000
    if (value.length > 5) {
      value = value.substring(0, 5) + ' ' + value.substring(5);
    }

    this.clientForm.get('mobile')?.setValue(value, { emitEvent: false });
  }

  onCancel(): void {
    if (this.isModal && this.closeCallback) {
      this.closeCallback();
    } else {
      this.router.navigate(['/clients']);
    }
  }
}
