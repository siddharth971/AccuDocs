import { inject, Injectable, signal } from '@angular/core';
import { AuthService } from '@core/services/auth.service';
import { Router } from '@angular/router';
import { NotificationService } from '@core/services/notification.service';
import { z } from 'zod';
import { createFormState } from '@shared/utils/validation.util';

const LoginSchema = z.object({
  mobile: z.string().regex(/^\+?[1-9]\d{9,14}$/, 'Invalid mobile number (e.g. +919000000000)'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type LoginData = z.infer<typeof LoginSchema>;

@Injectable()
export class LoginFacade {
  private authService = inject(AuthService);
  private router = inject(Router);
  private notification = inject(NotificationService);

  form = createFormState<LoginData>({ mobile: '', password: '' }, LoginSchema);
  hidePassword = signal(true);

  async login() {
    if (!this.form.validate()) return;

    this.form.isSubmitting.set(true);
    const { mobile, password } = this.form.value();

    this.authService.adminLogin(mobile, password).subscribe({
      next: () => {
        this.notification.success('Login successful!');
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.notification.error(err.message || 'Login failed');
        this.form.isSubmitting.set(false);
      },
      complete: () => this.form.isSubmitting.set(false),
    });
  }
}
