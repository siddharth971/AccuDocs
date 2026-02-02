import { Component, input, output, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export type SearchBarSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-search-bar, ui-search-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div [class]="containerClasses()" role="search">
      <div class="relative w-full">
        <!-- Search Icon -->
        <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <svg 
            [class]="iconClasses()"
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 20 20" 
            fill="currentColor"
            aria-hidden="true"
          >
            <path fill-rule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clip-rule="evenodd" />
          </svg>
        </div>

        <!-- Search Input -->
        <input
          type="search"
          [class]="inputClasses()"
          [placeholder]="placeholder()"
          [disabled]="disabled()"
          [(ngModel)]="searchValue"
          (ngModelChange)="onSearchChange($event)"
          (keyup.enter)="onSubmit()"
          (focus)="focused.set(true)"
          (blur)="focused.set(false)"
          [attr.aria-label]="ariaLabel() || placeholder()"
        />

        <!-- Clear Button -->
        @if (clearable() && searchValue) {
          <button
            type="button"
            class="absolute inset-y-0 right-0 flex items-center pr-3 text-secondary-400 hover:text-secondary-600 transition-colors"
            (click)="onClear()"
            aria-label="Clear search"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        }

        <!-- Loading Indicator -->
        @if (loading()) {
          <div class="absolute inset-y-0 right-0 flex items-center pr-3">
            <svg 
              class="w-4 h-4 animate-spin text-primary-600" 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24"
            >
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        }

        <!-- Keyboard Shortcut Hint -->
        @if (showShortcut() && !focused() && !searchValue) {
          <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <kbd class="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-secondary-400 bg-secondary-100 border border-secondary-200 rounded dark:bg-secondary-800 dark:border-secondary-700">
              <span class="text-xs">⌘</span>K
            </kbd>
          </div>
        }
      </div>

      <!-- Submit Button (optional) -->
      @if (showButton()) {
        <button
          type="button"
          [class]="buttonClasses()"
          (click)="onSubmit()"
          [disabled]="disabled() || !searchValue"
        >
          Search
        </button>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    input[type="search"]::-webkit-search-cancel-button {
      display: none;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchBarComponent {
  // Inputs
  size = input<SearchBarSize>('md');
  placeholder = input<string>('Search...');
  ariaLabel = input<string>('');
  disabled = input<boolean>(false);
  clearable = input<boolean>(true);
  loading = input<boolean>(false);
  showButton = input<boolean>(false);
  showShortcut = input<boolean>(false);
  debounceTime = input<number>(300);

  // State
  searchValue = '';
  focused = signal(false);
  private debounceTimer: any;

  // Outputs
  search = output<string>();
  searchChange = output<string>();
  cleared = output<void>();

  // Computed classes
  containerClasses = computed(() => {
    return ['flex items-center gap-2 w-full'].join(' ');
  });

  iconClasses = computed(() => {
    const sizeMap: Record<SearchBarSize, string> = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-5 h-5',
    };
    return `${sizeMap[this.size()]} text-secondary-400`;
  });

  inputClasses = computed(() => {
    const baseClasses = [
      'block w-full',
      'pl-10',
      'border border-border-color',
      'bg-surface-color',
      'text-text-primary placeholder:text-text-muted',
      'transition-all duration-200',
      'focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-500',
      'disabled:bg-secondary-50 disabled:cursor-not-allowed',
      'dark:bg-secondary-800 dark:border-secondary-700',
    ].join(' ');

    const sizeClasses: Record<SearchBarSize, string> = {
      sm: 'py-1.5 text-sm rounded-md pr-8',
      md: 'py-2.5 text-sm rounded-lg pr-10',
      lg: 'py-3 text-base rounded-lg pr-12',
    };

    return `${baseClasses} ${sizeClasses[this.size()]}`;
  });

  buttonClasses = computed(() => {
    const baseClasses = [
      'shrink-0',
      'px-4 py-2',
      'bg-primary-600 text-white',
      'rounded-lg',
      'font-medium text-sm',
      'hover:bg-primary-700',
      'focus:outline-none focus:ring-2 focus:ring-primary-200',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      'transition-colors duration-200',
    ].join(' ');

    return baseClasses;
  });

  // Methods
  onSearchChange(value: string): void {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.searchChange.emit(value);
    }, this.debounceTime());
  }

  onClear(): void {
    this.searchValue = '';
    this.searchChange.emit('');
    this.cleared.emit();
  }

  onSubmit(): void {
    if (this.searchValue) {
      this.search.emit(this.searchValue);
    }
  }
}
