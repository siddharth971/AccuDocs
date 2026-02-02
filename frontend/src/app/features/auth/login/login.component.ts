import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '@core/services/auth.service';
import { NotificationService } from '@core/services/notification.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="login-container">
      <mat-card class="login-card slide-in-up">
        <mat-card-header>
          <div class="logo-container">
            <mat-icon class="logo-icon">description</mat-icon>
            <h1>AccuDocs</h1>
            <p class="tagline">Secure Document Management</p>
          </div>
        </mat-card-header>

        <mat-card-content>
          <mat-tab-group [(selectedIndex)]="selectedTab" animationDuration="300ms">
            <!-- Admin Login Tab -->
            <mat-tab label="Admin Login">
              <form [formGroup]="adminForm" (ngSubmit)="onAdminLogin()" class="login-form">
                <mat-form-field appearance="outline">
                  <mat-label>Mobile Number</mat-label>
                  <input matInput formControlName="mobile" placeholder="+919876543210" />
                  <mat-icon matPrefix>phone</mat-icon>
                  @if (adminForm.get('mobile')?.hasError('required') && adminForm.get('mobile')?.touched) {
                    <mat-error>Mobile number is required</mat-error>
                  }
                  @if (adminForm.get('mobile')?.hasError('pattern') && adminForm.get('mobile')?.touched) {
                    <mat-error>Enter a valid mobile number</mat-error>
                  }
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Password</mat-label>
                  <input matInput [type]="hidePassword() ? 'password' : 'text'" formControlName="password" />
                  <mat-icon matPrefix>lock</mat-icon>
                  <button mat-icon-button matSuffix type="button" (click)="hidePassword.set(!hidePassword())">
                    <mat-icon>{{ hidePassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
                  </button>
                  @if (adminForm.get('password')?.hasError('required') && adminForm.get('password')?.touched) {
                    <mat-error>Password is required</mat-error>
                  }
                </mat-form-field>

                <button mat-raised-button color="primary" type="submit" [disabled]="adminForm.invalid || isLoading()">
                  @if (isLoading()) {
                    <mat-spinner diameter="20"></mat-spinner>
                  } @else {
                    <span class="button-content">
                      <mat-icon>login</mat-icon>
                      Login
                    </span>
                  }
                </button>
              </form>
            </mat-tab>

            <!-- Client OTP Tab -->
            <mat-tab label="Client Login">
              <form [formGroup]="otpForm" (ngSubmit)="onSendOTP()" class="login-form">
                <mat-form-field appearance="outline">
                  <mat-label>Mobile Number</mat-label>
                  <input matInput formControlName="mobile" placeholder="+919876543210" />
                  <mat-icon matPrefix>phone</mat-icon>
                  @if (otpForm.get('mobile')?.hasError('required') && otpForm.get('mobile')?.touched) {
                    <mat-error>Mobile number is required</mat-error>
                  }
                  @if (otpForm.get('mobile')?.hasError('pattern') && otpForm.get('mobile')?.touched) {
                    <mat-error>Enter a valid mobile number</mat-error>
                  }
                </mat-form-field>

                <button mat-raised-button color="primary" type="submit" [disabled]="otpForm.invalid || isLoading()">
                  @if (isLoading()) {
                    <mat-spinner diameter="20"></mat-spinner>
                  } @else {
                    <span class="button-content">
                      <mat-icon>send</mat-icon>
                      Send OTP
                    </span>
                  }
                </button>

                <p class="otp-note">
                  <mat-icon>info</mat-icon>
                  You will receive an OTP on your registered WhatsApp number
                </p>
              </form>
            </mat-tab>
          </mat-tab-group>
        </mat-card-content>
      </mat-card>

      <p class="footer-text">© 2024 AccuDocs. All rights reserved.</p>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 1rem;
    }

    .login-card {
      width: 100%;
      max-width: 420px;
      padding: 2rem;
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    }

    mat-card-header {
      display: flex;
      justify-content: center;
      margin-bottom: 1.5rem;
    }

    .logo-container {
      text-align: center;
    }

    .logo-icon {
      font-size: 64px;
      height: 64px;
      width: 64px;
      color: #667eea;
    }

    .logo-container h1 {
      margin: 0.5rem 0 0.25rem;
      font-size: 2rem;
      font-weight: 700;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .tagline {
      color: #888;
      margin: 0;
      font-size: 0.9rem;
    }

    .login-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      padding-top: 1.5rem;
    }

    .button-content {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    button[type="submit"] {
      height: 48px;
      font-size: 1rem;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }

    .otp-note {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #666;
      font-size: 0.85rem;
      margin-top: 0.5rem;
    }

    .otp-note mat-icon {
      font-size: 18px;
      height: 18px;
      width: 18px;
      color: #667eea;
    }

    .footer-text {
      color: rgba(255, 255, 255, 0.7);
      margin-top: 2rem;
      font-size: 0.85rem;
    }

    ::ng-deep .mat-mdc-tab-body-content {
      padding: 0 !important;
    }

    @media (max-width: 480px) {
      .login-card {
        padding: 1.5rem;
      }

      .logo-icon {
        font-size: 48px;
        height: 48px;
        width: 48px;
      }

      .logo-container h1 {
        font-size: 1.75rem;
      }
    }
  `],
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private notificationService = inject(NotificationService);

  selectedTab = 0;
  hidePassword = signal(true);
  isLoading = signal(false);

  adminForm: FormGroup = this.fb.group({
    mobile: ['', [Validators.required, Validators.pattern(/^\+?[1-9]\d{9,14}$/)]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  otpForm: FormGroup = this.fb.group({
    mobile: ['', [Validators.required, Validators.pattern(/^\+?[1-9]\d{9,14}$/)]],
  });

  onAdminLogin(): void {
    if (this.adminForm.invalid) return;

    this.isLoading.set(true);
    const { mobile, password } = this.adminForm.value;

    this.authService.adminLogin(mobile, password).subscribe({
      next: () => {
        this.notificationService.success('Login successful!');
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
        this.router.navigateByUrl(returnUrl);
      },
      error: () => this.isLoading.set(false),
      complete: () => this.isLoading.set(false),
    });
  }

  onSendOTP(): void {
    if (this.otpForm.invalid) return;

    this.isLoading.set(true);
    const { mobile } = this.otpForm.value;

    this.authService.sendOTP(mobile).subscribe({
      next: () => {
        this.notificationService.success('OTP sent to your WhatsApp!');
        this.router.navigate(['/auth/otp'], { queryParams: { mobile } });
      },
      error: () => this.isLoading.set(false),
      complete: () => this.isLoading.set(false),
    });
  }
}
