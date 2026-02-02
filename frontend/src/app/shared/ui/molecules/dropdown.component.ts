import { Component, input, output, ChangeDetectionStrategy, signal, computed, ElementRef, inject, HostListener } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';

export interface DropdownItem {
  id: string;
  label: string;
  icon?: string;
  disabled?: boolean;
  danger?: boolean;
  divider?: boolean;
}

export type DropdownAlign = 'left' | 'right';
export type DropdownPosition = 'bottom' | 'top';

@Component({
  selector: 'app-dropdown, ui-dropdown',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative inline-block text-left">
      <!-- Trigger -->
      <div (click)="toggle()">
        <ng-content select="[dropdown-trigger]"></ng-content>
      </div>

      <!-- Dropdown Menu -->
      @if (isOpen()) {
        <!-- Backdrop for mobile -->
        <div 
          class="fixed inset-0 z-dropdown md:hidden"
          (click)="close()"
        ></div>

        <div 
          [class]="menuClasses()"
          role="menu"
          aria-orientation="vertical"
          tabindex="-1"
        >
          @for (item of items(); track item.id) {
            @if (item.divider) {
              <div class="h-px bg-border-color my-1" role="separator"></div>
            } @else {
              <button
                type="button"
                role="menuitem"
                [class]="itemClasses(item)"
                [disabled]="item.disabled"
                (click)="onItemClick(item)"
              >
                <!-- Icon -->
                @if (item.icon) {
                  <span class="w-5 h-5 mr-3">
                    <ng-container *ngTemplateOutlet="iconTemplate; context: { icon: item.icon }"></ng-container>
                  </span>
                }

                {{ item.label }}
              </button>
            }
          }

          <!-- Custom content slot -->
          <ng-content select="[dropdown-content]"></ng-content>
        </div>
      }
    </div>

    <!-- Icon template placeholder -->
    <ng-template #iconTemplate let-icon="icon">
      <!-- Icons would be rendered here based on icon name -->
    </ng-template>
  `,
  styles: [`
    :host {
      display: inline-block;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DropdownComponent {
  private elementRef = inject(ElementRef);

  // Inputs
  items = input<DropdownItem[]>([]);
  align = input<DropdownAlign>('left');
  position = input<DropdownPosition>('bottom');
  width = input<string>('w-56');

  // State
  isOpen = signal(false);

  // Outputs
  itemSelected = output<DropdownItem>();
  openChange = output<boolean>();

  // Click outside handler
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.close();
    }
  }

  // Keyboard handler
  @HostListener('document:keydown.escape')
  onEscapePress(): void {
    this.close();
  }

  // Computed menu classes
  menuClasses = computed(() => {
    const baseClasses = [
      'absolute z-dropdown',
      this.width(),
      'py-1',
      'bg-surface-color',
      'rounded-lg',
      'shadow-dropdown',
      'border border-border-color',
      'focus:outline-none',
      'animate-scale-in origin-top-right',
      'dark:border-secondary-700',
    ].join(' ');

    const alignClasses: Record<DropdownAlign, string> = {
      left: 'left-0',
      right: 'right-0',
    };

    const positionClasses: Record<DropdownPosition, string> = {
      bottom: 'mt-2 top-full',
      top: 'mb-2 bottom-full',
    };

    return `${baseClasses} ${alignClasses[this.align()]} ${positionClasses[this.position()]}`;
  });

  // Item classes
  itemClasses(item: DropdownItem): string {
    const baseClasses = [
      'w-full',
      'flex items-center',
      'px-4 py-2',
      'text-sm text-left',
      'transition-colors duration-150',
      'focus:outline-none focus:bg-secondary-100 dark:focus:bg-secondary-800',
    ].join(' ');

    if (item.disabled) {
      return `${baseClasses} text-text-disabled cursor-not-allowed`;
    }

    if (item.danger) {
      return `${baseClasses} text-danger-600 hover:bg-danger-50 dark:hover:bg-danger-900/20`;
    }

    return `${baseClasses} text-text-primary hover:bg-secondary-100 dark:hover:bg-secondary-800`;
  }

  // Methods
  toggle(): void {
    this.isOpen.update(v => !v);
    this.openChange.emit(this.isOpen());
  }

  open(): void {
    this.isOpen.set(true);
    this.openChange.emit(true);
  }

  close(): void {
    this.isOpen.set(false);
    this.openChange.emit(false);
  }

  onItemClick(item: DropdownItem): void {
    if (!item.disabled) {
      this.itemSelected.emit(item);
      this.close();
    }
  }
}
