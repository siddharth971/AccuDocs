import { Component, input, output, ChangeDetectionStrategy, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  dismissible?: boolean;
}

@Component({
  selector: 'app-toast, ui-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      [class]="toastClasses()"
      role="alert"
      [attr.aria-live]="type() === 'error' ? 'assertive' : 'polite'"
    >
      <!-- Icon -->
      <div [class]="iconContainerClasses()">
        @switch (type()) {
          @case ('success') {
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
          }
          @case ('error') {
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
          }
          @case ('warning') {
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
          }
          @case ('info') {
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
            </svg>
          }
        }
      </div>

      <!-- Content -->
      <div class="flex-1 min-w-0">
        <p class="text-sm font-semibold text-text-primary">{{ title() }}</p>
        @if (message()) {
          <p class="mt-0.5 text-sm text-text-secondary">{{ message() }}</p>
        }
      </div>

      <!-- Close Button -->
      @if (dismissible()) {
        <button
          type="button"
          class="shrink-0 p-1 -m-1 rounded-lg text-secondary-400 hover:text-secondary-600 hover:bg-secondary-100 dark:hover:bg-secondary-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          (click)="dismiss.emit()"
          aria-label="Dismiss"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastComponent {
  // Inputs
  type = input<ToastType>('info');
  title = input.required<string>();
  message = input<string>('');
  dismissible = input<boolean>(true);

  // Outputs
  dismiss = output<void>();

  // Computed toast classes
  toastClasses = computed(() => {
    const baseClasses = [
      'flex items-start gap-3',
      'w-full max-w-sm',
      'p-4',
      'bg-surface-color',
      'border border-border-color',
      'rounded-lg',
      'shadow-dropdown',
      'animate-slide-up',
      'dark:border-secondary-700',
    ].join(' ');

    return baseClasses;
  });

  // Computed icon container classes
  iconContainerClasses = computed(() => {
    const typeClasses: Record<ToastType, string> = {
      success: 'text-success-500',
      error: 'text-danger-500',
      warning: 'text-warning-500',
      info: 'text-info-500',
    };

    return `shrink-0 ${typeClasses[this.type()]}`;
  });
}
