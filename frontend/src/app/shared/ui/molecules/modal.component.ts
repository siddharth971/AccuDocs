import { Component, input, output, ChangeDetectionStrategy, signal, computed, inject, ElementRef, HostListener, AfterViewInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

@Component({
  selector: 'app-modal, ui-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isOpen()) {
      <!-- Premium Backdrop -->
      <div
        class="modal-overlay-premium"
        (click)="onBackdropClick()"
        aria-hidden="true"
      ></div>

      <!-- Modal Container -->
      <div
        class="fixed inset-0 overflow-y-auto"
        style="z-index: var(--z-modal);"
        role="dialog"
        [attr.aria-modal]="true"
        [attr.aria-labelledby]="title() ? modalId + '-title' : null"
        [attr.aria-describedby]="description() ? modalId + '-desc' : null"
      >
        <div class="flex min-h-full items-center justify-center p-4">
          <!-- Modal Panel -->
          <div
            [class]="modalClasses()"
            (click)="$event.stopPropagation()"
            tabindex="-1"
            #modalPanel
          >
            <!-- Header -->
            @if (title() || showCloseButton()) {
              <header class="flex items-start justify-between gap-4 px-6 py-4 border-b border-border-color">
                <div class="flex-1 min-w-0">
                  @if (title()) {
                    <h2
                      [id]="modalId + '-title'"
                      class="text-xl font-semibold text-text-primary"
                    >
                      {{ title() }}
                    </h2>
                  }
                  @if (description()) {
                    <p
                      [id]="modalId + '-desc'"
                      class="mt-1 text-sm text-text-secondary"
                    >
                      {{ description() }}
                    </p>
                  }
                </div>

                @if (showCloseButton()) {
                  <button
                    type="button"
                    class="shrink-0 p-2 -m-2 rounded-lg text-secondary-400 hover:text-secondary-600 hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                    (click)="onClose()"
                    aria-label="Close modal"
                  >
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                }
              </header>
            }

            <!-- Body -->
            <div [class]="bodyClasses()">
              <ng-content></ng-content>
            </div>

            <!-- Footer -->
            @if (hasFooter) {
              <footer class="flex items-center justify-end gap-3 px-6 py-4 border-t border-border-color bg-secondary-50/50 dark:bg-secondary-900/30">
                <ng-content select="[modal-footer]"></ng-content>
              </footer>
            }
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    :host {
      display: contents;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalComponent implements OnChanges, OnDestroy {
  private document = inject(DOCUMENT);

  // Inputs
  isOpen = input<boolean>(false);
  size = input<ModalSize>('md');
  title = input<string>('');
  description = input<string>('');
  showCloseButton = input<boolean>(true);
  closeOnBackdrop = input<boolean>(true);
  closeOnEscape = input<boolean>(true);
  padding = input<boolean>(true);
  scrollable = input<boolean>(true);

  // Content projection flag
  hasFooter = false;

  // Unique ID
  modalId = `modal-${Math.random().toString(36).substr(2, 9)}`;

  // Track scroll position for body lock
  private savedScrollY = 0;

  // Outputs
  closed = output<void>();

  // Watch isOpen changes for body scroll lock
  ngOnChanges(changes: SimpleChanges): void {
    // Angular signals-based inputs still trigger ngOnChanges
    // We need to check the current value
    if (this.isOpen()) {
      this.lockBodyScroll();
    } else {
      this.unlockBodyScroll();
    }
  }

  ngOnDestroy(): void {
    // Always clean up body state
    this.unlockBodyScroll();
  }

  // Keyboard handler
  @HostListener('document:keydown.escape')
  onEscapePress(): void {
    if (this.isOpen() && this.closeOnEscape()) {
      this.onClose();
    }
  }

  // Computed modal classes — uses premium global styles
  modalClasses = computed(() => {
    const baseClasses = [
      'modal-panel-premium',
      'dark:border dark:border-secondary-700',
    ].join(' ');

    const sizeClasses: Record<ModalSize, string> = {
      sm: 'max-w-modal-sm',
      md: 'max-w-modal-md',
      lg: 'max-w-modal-lg',
      xl: 'max-w-modal-xl',
      full: 'max-w-full mx-4 my-4 min-h-[calc(100vh-2rem)]',
    };

    return `${baseClasses} ${sizeClasses[this.size()]}`;
  });

  // Computed body classes
  bodyClasses = computed(() => {
    const paddingClass = this.padding() ? 'p-6' : '';
    const scrollClass = this.scrollable() ? 'max-h-[60vh] overflow-y-auto' : '';
    return `${paddingClass} ${scrollClass}`;
  });

  // Methods
  onBackdropClick(): void {
    if (this.closeOnBackdrop()) {
      this.onClose();
    }
  }

  onClose(): void {
    this.closed.emit();
  }

  // Body scroll lock helpers
  private lockBodyScroll(): void {
    if (this.document.body.classList.contains('modal-open')) return;
    this.savedScrollY = window.scrollY;
    this.document.body.classList.add('modal-open');
    this.document.body.style.top = `-${this.savedScrollY}px`;
  }

  private unlockBodyScroll(): void {
    if (!this.document.body.classList.contains('modal-open')) return;
    this.document.body.classList.remove('modal-open');
    this.document.body.style.top = '';
    window.scrollTo(0, this.savedScrollY);
  }
}
