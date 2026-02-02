import { Component, inject, signal, OnInit } from '@angular/core';
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
    <div class="w-full space-y-6">
      <!-- Header -->
      <header class="flex items-center gap-4">
        <a 
          routerLink="/clients" 
          class="p-2 rounded-lg bg-white dark:bg-slate-800 border border-border-color hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
        >
          <mat-icon class="text-slate-600 dark:text-slate-300">arrow_back</mat-icon>
        </a>
        <div>
          <h1 class="text-2xl font-bold text-text-primary">{{ isEditMode() ? 'Edit Client' : 'Add New Client' }}</h1>
          <p class="text-text-secondary mt-1">{{ isEditMode() ? 'Update client information' : 'Create a new client account' }}</p>
        </div>
      </header>

      <!-- Form Card -->
      <div class="bg-white dark:bg-slate-800 rounded-xl border border-border-color shadow-sm overflow-hidden">
        @if (isLoadingData()) {
          <div class="flex flex-col items-center justify-center py-20">
            <mat-spinner diameter="40"></mat-spinner>
            <p class="mt-4 text-text-secondary">Loading client data...</p>
          </div>
        } @else {
          <form [formGroup]="clientForm" (ngSubmit)="onSubmit()">
            <!-- Form Header -->
            <div class="px-6 py-4 border-b border-border-color bg-slate-50 dark:bg-slate-900/50">
              <h2 class="font-semibold text-text-primary">Client Information</h2>
              <p class="text-sm text-text-secondary mt-1">Fill in the details below to {{ isEditMode() ? 'update' : 'create' }} the client.</p>
            </div>

            <!-- Form Fields -->
            <div class="p-6 space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Client Code -->
                <div class="space-y-2">
                  <label class="block text-sm font-medium text-text-primary">
                    Client Code <span class="text-danger-500">*</span>
                  </label>
                  <div class="relative">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <mat-icon class="text-slate-400 text-xl">badge</mat-icon>
                    </div>
                    <input 
                      type="text"
                      formControlName="code"
                      placeholder="e.g., CLI001"
                      class="block w-full pl-11 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                    >
                  </div>
                  <p class="text-xs text-text-secondary">Unique identifier for the client</p>
                  @if (clientForm.get('code')?.touched && clientForm.get('code')?.hasError('required')) {
                    <p class="text-xs text-danger-500">Client code is required</p>
                  }
                </div>

                <!-- Client Name -->
                <div class="space-y-2">
                  <label class="block text-sm font-medium text-text-primary">
                    Full Name <span class="text-danger-500">*</span>
                  </label>
                  <div class="relative">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <mat-icon class="text-slate-400 text-xl">person</mat-icon>
                    </div>
                    <input 
                      type="text"
                      formControlName="name"
                      placeholder="Enter client's full name"
                      class="block w-full pl-11 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                    >
                  </div>
                  @if (clientForm.get('name')?.touched && clientForm.get('name')?.hasError('required')) {
                    <p class="text-xs text-danger-500">Name is required</p>
                  }
                </div>
              </div>

              <!-- Mobile Number - Full Width -->
              <div class="space-y-2">
                <label class="block text-sm font-medium text-text-primary">
                  Mobile Number <span class="text-danger-500">*</span>
                </label>
                <div class="relative max-w-md">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <mat-icon class="text-slate-400 text-xl">phone</mat-icon>
                  </div>
                  <input 
                    type="tel"
                    formControlName="mobile"
                    placeholder="+919876543210"
                    class="block w-full pl-11 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  >
                </div>
                <p class="text-xs text-text-secondary">Include country code (e.g., +91 for India)</p>
                @if (clientForm.get('mobile')?.touched && clientForm.get('mobile')?.hasError('required')) {
                  <p class="text-xs text-danger-500">Mobile number is required</p>
                }
              </div>
            </div>

            <!-- Form Actions -->
            <div class="px-6 py-4 border-t border-border-color bg-slate-50 dark:bg-slate-900/50 flex items-center justify-end gap-3">
              <a routerLink="/clients" class="btn-secondary">
                Cancel
              </a>
              <button 
                type="submit" 
                [disabled]="clientForm.invalid || isSubmitting()"
                class="btn-primary"
              >
                @if (isSubmitting()) {
                  <mat-spinner diameter="18" class="[&_circle]:stroke-white"></mat-spinner>
                  <span>{{ isEditMode() ? 'Saving...' : 'Creating...' }}</span>
                } @else {
                  <mat-icon class="text-lg">{{ isEditMode() ? 'save' : 'add' }}</mat-icon>
                  <span>{{ isEditMode() ? 'Save Changes' : 'Create Client' }}</span>
                }
              </button>
            </div>
          </form>
        }
      </div>
    </div>
  `,
  styles: [``],
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
        this.router.navigate(['/clients']);
      },
      error: () => this.isSubmitting.set(false),
      complete: () => this.isSubmitting.set(false),
    });
  }
}
