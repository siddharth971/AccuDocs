import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ClientService } from '@core/services/client.service';
import { NotificationService } from '@core/services/notification.service';
import { LayoutComponent } from '@shared/components/layout/layout.component';

@Component({
  selector: 'app-client-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    LayoutComponent,
  ],
  template: `
    <app-layout>
      <div class="form-container fade-in">
        <header class="page-header">
          <button mat-icon-button routerLink="/clients">
            <mat-icon>arrow_back</mat-icon>
          </button>
          <h1>{{ isEditMode() ? 'Edit Client' : 'Add New Client' }}</h1>
        </header>

        <mat-card class="form-card">
          @if (isLoadingData()) {
            <div class="loading-state">
              <mat-spinner diameter="40"></mat-spinner>
            </div>
          } @else {
            <form [formGroup]="clientForm" (ngSubmit)="onSubmit()">
              <div class="form-grid">
                <mat-form-field appearance="outline">
                  <mat-label>Client Code</mat-label>
                  <input matInput formControlName="code" placeholder="e.g., CLI001">
                  <mat-icon matPrefix>badge</mat-icon>
                  @if (clientForm.get('code')?.hasError('required')) {
                    <mat-error>Client code is required</mat-error>
                  }
                  <mat-hint>Unique identifier for the client</mat-hint>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Client Name</mat-label>
                  <input matInput formControlName="name" placeholder="Full name">
                  <mat-icon matPrefix>person</mat-icon>
                  @if (clientForm.get('name')?.hasError('required')) {
                    <mat-error>Name is required</mat-error>
                  }
                </mat-form-field>

                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Mobile Number</mat-label>
                  <input matInput formControlName="mobile" placeholder="+919876543210">
                  <mat-icon matPrefix>phone</mat-icon>
                  @if (clientForm.get('mobile')?.hasError('required')) {
                    <mat-error>Mobile number is required</mat-error>
                  }
                  <mat-hint>Include country code (e.g., +91)</mat-hint>
                </mat-form-field>
              </div>

              <div class="form-actions">
                <button mat-button type="button" routerLink="/clients">
                  Cancel
                </button>
                <button mat-raised-button color="primary" type="submit" [disabled]="clientForm.invalid || isSubmitting()">
                  @if (isSubmitting()) {
                    <mat-spinner diameter="20"></mat-spinner>
                  } @else {
                    <span class="flex items-center gap-2">
                      <mat-icon>{{ isEditMode() ? 'save' : 'add' }}</mat-icon>
                      {{ isEditMode() ? 'Save Changes' : 'Create Client' }}
                    </span>
                  }
                </button>
              </div>
            </form>
          }
        </mat-card>
      </div>
    </app-layout>
  `,
  styles: [`
    .form-container {
      padding: 1.5rem;
      max-width: 800px;
      margin: 0 auto;
    }

    .page-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 1.5rem;
    }

    .page-header h1 {
      margin: 0;
    }

    .form-card {
      padding: 2rem;
    }

    .loading-state {
      display: flex;
      justify-content: center;
      padding: 3rem;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
    }

    .full-width {
      grid-column: 1 / -1;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      margin-top: 1.5rem;
      padding-top: 1.5rem;
      border-top: 1px solid var(--border-color);
    }

    .form-actions button[type="submit"] {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    @media (max-width: 600px) {
      .form-grid {
        grid-template-columns: 1fr;
      }

      .form-actions {
        flex-direction: column-reverse;
      }

      .form-actions button {
        width: 100%;
      }
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
