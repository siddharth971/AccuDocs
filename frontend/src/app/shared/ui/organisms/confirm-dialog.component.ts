import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../atoms/button.component';
import { ModalComponent } from '../molecules/modal.component';

@Component({
  selector: 'app-confirm-dialog, ui-confirm-dialog',
  standalone: true,
  imports: [CommonModule, ButtonComponent, ModalComponent],
  template: `
    <ui-modal
      [isOpen]="isOpen()"
      [title]="title()"
      [description]="description()"
      [size]="size()"
      [closeOnBackdrop]="!loading()"
      [closeOnEscape]="!loading()"
      (closed)="onCancel()"
    >
      <!-- Custom content slot -->
      <div class="min-h-[40px]">
        <ng-content></ng-content>
      </div>

      <!-- Footer -->
      <div modal-footer class="flex items-center justify-end gap-3">
        <ui-button
          variant="secondary"
          [disabled]="loading()"
          (clicked)="onCancel()"
        >
          {{ cancelLabel() }}
        </ui-button>
        <ui-button
          [variant]="confirmVariant()"
          [loading]="loading()"
          (clicked)="onConfirm()"
        >
          {{ confirmLabel() }}
        </ui-button>
      </div>
    </ui-modal>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmDialogComponent {
  // Inputs
  isOpen = input<boolean>(false);
  title = input<string>('Confirm Action');
  description = input<string>('');
  confirmLabel = input<string>('Confirm');
  cancelLabel = input<string>('Cancel');
  confirmVariant = input<'primary' | 'danger'>('primary');
  size = input<'sm' | 'md'>('sm');
  loading = input<boolean>(false);

  // Outputs
  confirmed = output<void>();
  cancelled = output<void>();

  // Methods
  onConfirm(): void {
    this.confirmed.emit();
  }

  onCancel(): void {
    this.cancelled.emit();
  }
}

// Delete Confirm Dialog preset
@Component({
  selector: 'app-delete-confirm, ui-delete-confirm',
  standalone: true,
  imports: [CommonModule, ConfirmDialogComponent],
  template: `
    <ui-confirm-dialog
      [isOpen]="isOpen()"
      [title]="title()"
      [description]="description()"
      [confirmLabel]="confirmLabel()"
      [cancelLabel]="cancelLabel()"
      confirmVariant="danger"
      [loading]="loading()"
      (confirmed)="confirmed.emit()"
      (cancelled)="cancelled.emit()"
    >
      <!-- Warning Content -->
      <div class="flex items-start gap-4 py-2">
        <div class="shrink-0 w-10 h-10 rounded-full bg-danger-100 dark:bg-danger-900/30 flex items-center justify-center">
          <svg class="w-5 h-5 text-danger-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div class="flex-1">
          <p class="text-sm text-text-secondary">
            {{ warningMessage() || 'This action cannot be undone. All data will be permanently deleted.' }}
          </p>
          @if (itemName()) {
            <p class="mt-2 text-sm font-medium text-text-primary">
              Item: <span class="text-danger-600">{{ itemName() }}</span>
            </p>
          }
        </div>
      </div>
    </ui-confirm-dialog>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeleteConfirmComponent {
  // Inputs
  isOpen = input<boolean>(false);
  title = input<string>('Delete Item');
  description = input<string>('Are you sure you want to delete this item?');
  warningMessage = input<string>('');
  itemName = input<string>('');
  confirmLabel = input<string>('Delete');
  cancelLabel = input<string>('Cancel');
  loading = input<boolean>(false);

  // Outputs
  confirmed = output<void>();
  cancelled = output<void>();
}
