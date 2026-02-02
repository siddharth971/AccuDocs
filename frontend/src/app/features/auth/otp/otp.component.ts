import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '@core/services/auth.service';
import { NotificationService } from '@core/services/notification.service';

@Component({
  selector: 'app-otp',
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
  ],
  template: `
    <div class="otp-container">
      <mat-card class="otp-card slide-in-up">
        <mat-card-header>
          <div class="header-content">
            <mat-icon class="otp-icon">lock_clock</mat-icon>
            <h2>Verify OTP</h2>
            <p>Enter the 6-digit code sent to your WhatsApp</p>
            <p class="mobile-number">{{ mobile }}</p>
          </div>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="otpForm" (ngSubmit)="onVerifyOTP()" class="otp-form">
            <mat-form-field appearance="outline">
              <mat-label>Enter OTP</mat-label>
              <input
                matInput
                formControlName="otp"
                maxlength="6"
                placeholder="••••••"
                class="otp-input"
                autocomplete="one-time-code"
              />
              <mat-icon matPrefix>dialpad</mat-icon>
              @if (otpForm.get('otp')?.hasError('required') && otpForm.get('otp')?.touched) {
                <mat-error>OTP is required</mat-error>
              }
              @if (otpForm.get('otp')?.hasError('pattern') && otpForm.get('otp')?.touched) {
                <mat-error>OTP must be 6 digits</mat-error>
              }
            </mat-form-field>

            <button mat-raised-button color="primary" type="submit" [disabled]="otpForm.invalid || isLoading()">
              @if (isLoading()) {
                <mat-spinner diameter="20"></mat-spinner>
              } @else {
                <span class="button-content">
                  <mat-icon>verified</mat-icon>
                  Verify OTP
                </span>
              }
            </button>

            <div class="resend-section">
              @if (resendTimer() > 0) {
                <p class="timer-text">Resend OTP in {{ resendTimer() }}s</p>
              } @else {
                <button mat-button type="button" (click)="onResendOTP()" [disabled]="isResending()">
                  @if (isResending()) {
                    <mat-spinner diameter="16"></mat-spinner>
                  } @else {
                    Resend OTP
                  }
                </button>
              }
            </div>

            <a mat-button routerLink="/auth/login" class="back-link">
              <mat-icon>arrow_back</mat-icon>
              Back to Login
            </a>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .otp-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 1rem;
    }

    .otp-card {
      width: 100%;
      max-width: 400px;
      padding: 2rem;
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    }

    mat-card-header {
      display: flex;
      justify-content: center;
      margin-bottom: 1.5rem;
    }

    .header-content {
      text-align: center;
    }

    .otp-icon {
      font-size: 56px;
      height: 56px;
      width: 56px;
      color: #667eea;
    }

    .header-content h2 {
      margin: 1rem 0 0.5rem;
      font-size: 1.5rem;
    }

    .header-content p {
      color: #666;
      margin: 0;
    }

    .mobile-number {
      font-weight: 600;
      color: #333 !important;
      margin-top: 0.5rem !important;
    }

    .otp-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .otp-input {
      font-size: 1.5rem !important;
      letter-spacing: 0.5rem;
      text-align: center;
      font-weight: 600;
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

    .resend-section {
      display: flex;
      justify-content: center;
      margin-top: 0.5rem;
    }

    .timer-text {
      color: #666;
      font-size: 0.9rem;
    }

    .back-link {
      margin-top: 0.5rem;
    }

    .button-content {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
  `],
})
export class OtpComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private notificationService = inject(NotificationService);

  mobile = '';
  isLoading = signal(false);
  isResending = signal(false);
  resendTimer = signal(60);
  private timerInterval: any;

  otpForm: FormGroup = this.fb.group({
    otp: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
  });

  ngOnInit(): void {
    this.mobile = this.route.snapshot.queryParams['mobile'];
    if (!this.mobile) {
      this.router.navigate(['/auth/login']);
      return;
    }
    this.startResendTimer();
  }

  ngOnDestroy(): void {
    this.clearTimer();
  }

  private startResendTimer(): void {
    this.resendTimer.set(60);
    this.timerInterval = setInterval(() => {
      const current = this.resendTimer();
      if (current > 0) {
        this.resendTimer.set(current - 1);
      } else {
        this.clearTimer();
      }
    }, 1000);
  }

  private clearTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  onVerifyOTP(): void {
    if (this.otpForm.invalid) return;

    this.isLoading.set(true);
    const { otp } = this.otpForm.value;

    this.authService.verifyOTP(this.mobile, otp).subscribe({
      next: () => {
        this.notificationService.success('Verification successful!');
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
        this.router.navigateByUrl(returnUrl);
      },
      error: () => this.isLoading.set(false),
      complete: () => this.isLoading.set(false),
    });
  }

  onResendOTP(): void {
    this.isResending.set(true);

    this.authService.sendOTP(this.mobile).subscribe({
      next: () => {
        this.notificationService.success('OTP resent successfully!');
        this.startResendTimer();
      },
      error: () => this.isResending.set(false),
      complete: () => this.isResending.set(false),
    });
  }
}
