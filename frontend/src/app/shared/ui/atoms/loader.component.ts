import { Component, input, ChangeDetectionStrategy, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

export type LoaderSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type LoaderVariant = 'primary' | 'secondary' | 'white' | 'success' | 'danger';

@Component({
  selector: 'app-loader, ui-loader',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      [class]="containerClasses()"
      role="status"
      [attr.aria-label]="label() || 'Loading'"
    >
      <!-- Spinner -->
      <svg
        [class]="spinnerClasses()"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        ></circle>
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>

      <!-- Label -->
      @if (label()) {
        <span [class]="labelClasses()">{{ label() }}</span>
      }

      <!-- Screen reader text -->
      <span class="sr-only">{{ label() || 'Loading...' }}</span>
    </div>
  `,
  styles: [`
    :host {
      display: inline-flex;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoaderComponent {
  // Inputs
  size = input<LoaderSize>('md');
  variant = input<LoaderVariant>('primary');
  label = input<string>('');
  centered = input<boolean>(false);
  fullScreen = input<boolean>(false);
  overlay = input<boolean>(false);

  // Computed container classes
  containerClasses = computed(() => {
    const baseClasses = 'inline-flex items-center gap-3';

    const alignmentClasses = this.centered()
      ? 'justify-center'
      : '';

    const layoutClasses = [];

    if (this.fullScreen()) {
      layoutClasses.push('fixed inset-0 z-50');
    }

    if (this.overlay()) {
      layoutClasses.push('bg-white/80 dark:bg-secondary-900/80 backdrop-blur-sm');
    }

    if (this.fullScreen() || this.overlay()) {
      layoutClasses.push('flex items-center justify-center');
    }

    return [
      baseClasses,
      alignmentClasses,
      ...layoutClasses,
    ].filter(Boolean).join(' ');
  });

  // Computed spinner classes
  spinnerClasses = computed(() => {
    const sizeClasses: Record<LoaderSize, string> = {
      xs: 'w-3 h-3',
      sm: 'w-4 h-4',
      md: 'w-6 h-6',
      lg: 'w-8 h-8',
      xl: 'w-12 h-12',
    };

    const colorClasses: Record<LoaderVariant, string> = {
      primary: 'text-primary-600 dark:text-primary-400',
      secondary: 'text-secondary-500 dark:text-secondary-400',
      white: 'text-white',
      success: 'text-success-600 dark:text-success-400',
      danger: 'text-danger-600 dark:text-danger-400',
    };

    return [
      'animate-spin',
      sizeClasses[this.size()],
      colorClasses[this.variant()],
    ].join(' ');
  });

  // Computed label classes
  labelClasses = computed(() => {
    const sizeClasses: Record<LoaderSize, string> = {
      xs: 'text-xs',
      sm: 'text-sm',
      md: 'text-sm',
      lg: 'text-base',
      xl: 'text-lg',
    };

    return [
      'font-medium text-text-secondary',
      sizeClasses[this.size()],
    ].join(' ');
  });
}
