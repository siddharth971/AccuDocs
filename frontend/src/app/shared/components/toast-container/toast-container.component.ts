import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastComponent } from '@shared/ui/molecules/toast.component';
import { ToastService } from '@core/services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule, ToastComponent],
  template: `
    <div 
      class="fixed bottom-6 right-6 z-toast flex flex-col gap-3 pointer-events-none"
      aria-live="polite"
      aria-label="Notifications"
    >
      @for (toast of toastService.activeToasts(); track toast.id) {
        <div class="pointer-events-auto animate-slide-up">
          <ui-toast
            [type]="toast.type"
            [title]="toast.title"
            [message]="toast.message || ''"
            [dismissible]="toast.dismissible ?? true"
            (dismiss)="toastService.dismiss(toast.id)"
          ></ui-toast>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastContainerComponent {
  toastService = inject(ToastService);
}
