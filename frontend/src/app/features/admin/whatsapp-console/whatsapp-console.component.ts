
import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { WhatsAppService, WhatsAppSession } from '@core/services/whatsapp.service';
import { ToastService } from '@core/services/toast.service';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroPaperAirplaneSolid, heroTrashSolid, heroArrowPathSolid } from '@ng-icons/heroicons/solid';

@Component({
  selector: 'app-whatsapp-console',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgIconComponent],
  templateUrl: './whatsapp-console.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    provideIcons({
      heroPaperAirplaneSolid,
      heroTrashSolid,
      heroArrowPathSolid
    })
  ]
})
export class WhatsAppConsoleComponent {
  private fb = inject(FormBuilder);
  private whatsappService = inject(WhatsAppService);
  private toast = inject(ToastService);

  form = this.fb.nonNullable.group({
    mobile: ['', [Validators.required, Validators.pattern(/^\+?\d{10,15}$/)]],
    message: ['', [Validators.required, Validators.minLength(1)]],
  });

  sessionData = signal<WhatsAppSession | null>(null);
  isLoading = signal(false);
  checkLoading = signal(false);

  // Quick templates
  templates = [
    { label: 'Welcome', text: '👋 Welcome to AccuDocs! Reply with "Hi" to start.' },
    { label: 'OTP Reset', text: '🔐 Your OTP has been reset. Please try login again.' },
    { label: 'Docs Ready', text: '📄 Your requested documents are ready properly.' },
  ];

  sendMessage() {
    if (this.form.invalid) return;

    this.isLoading.set(true);
    const { mobile, message } = this.form.getRawValue();

    this.whatsappService.sendMessage(mobile, message).subscribe({
      next: () => {
        this.toast.success('Message sent successfully via Meta Cloud API');
        this.form.patchValue({ message: '' });
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.toast.error('Failed to send message: ' + (err.error?.message || err.message));
        this.isLoading.set(false);
      }
    });
  }

  checkSession() {
    const mobile = this.form.get('mobile')?.value;
    if (!mobile) {
      this.toast.error('Please enter a mobile number');
      return;
    }

    this.checkLoading.set(true);
    this.whatsappService.getSession(mobile).subscribe({
      next: (session) => {
        this.sessionData.set(session);
        this.checkLoading.set(false);
        if (session) {
          this.toast.info('Session found');
        } else {
          this.toast.info('No active session found');
        }
      },
      error: (err) => {
        console.error(err);
        this.sessionData.set(null);
        this.checkLoading.set(false);
      }
    });
  }

  clearSession() {
    const mobile = this.form.get('mobile')?.value;
    if (!mobile) return;

    if (!confirm('Are you sure you want to clear the session for this user?')) return;

    this.whatsappService.clearSession(mobile).subscribe({
      next: () => {
        this.toast.success('Session cleared');
        this.sessionData.set(null);
      },
      error: (err) => {
        this.toast.error('Failed to clear session');
      }
    });
  }

  useTemplate(text: string) {
    this.form.patchValue({ message: text });
  }
}
