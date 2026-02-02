import { Injectable, signal, computed } from '@angular/core';
import type { Toast, ToastType } from '@shared/ui/molecules/toast.component';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private toasts = signal<Toast[]>([]);
  private defaultDuration = 5000;

  // Public readonly signal
  readonly activeToasts = computed(() => this.toasts());

  /**
   * Show a success toast
   */
  success(title: string, message?: string, duration?: number): string {
    return this.show({ type: 'success', title, message, duration });
  }

  /**
   * Show an error toast
   */
  error(title: string, message?: string, duration?: number): string {
    return this.show({ type: 'error', title, message, duration: duration ?? 8000 });
  }

  /**
   * Show a warning toast
   */
  warning(title: string, message?: string, duration?: number): string {
    return this.show({ type: 'warning', title, message, duration });
  }

  /**
   * Show an info toast
   */
  info(title: string, message?: string, duration?: number): string {
    return this.show({ type: 'info', title, message, duration });
  }

  /**
   * Show a custom toast
   */
  show(options: {
    type: ToastType;
    title: string;
    message?: string;
    duration?: number;
    dismissible?: boolean;
  }): string {
    const id = this.generateId();
    const toast: Toast = {
      id,
      type: options.type,
      title: options.title,
      message: options.message,
      duration: options.duration ?? this.defaultDuration,
      dismissible: options.dismissible ?? true,
    };

    this.toasts.update((toasts) => [...toasts, toast]);

    // Auto-dismiss after duration
    if (toast.duration && toast.duration > 0) {
      setTimeout(() => {
        this.dismiss(id);
      }, toast.duration);
    }

    return id;
  }

  /**
   * Dismiss a specific toast
   */
  dismiss(id: string): void {
    this.toasts.update((toasts) => toasts.filter((t) => t.id !== id));
  }

  /**
   * Dismiss all toasts
   */
  dismissAll(): void {
    this.toasts.set([]);
  }

  private generateId(): string {
    return `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
