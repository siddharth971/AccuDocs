import { Component, input, ChangeDetectionStrategy, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

export type EmptyStateSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-empty-state, ui-empty-state',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="containerClasses()" role="status">
      <!-- Illustration / Icon -->
      <div [class]="illustrationClasses()">
        @if (customIllustration()) {
          <ng-content select="[empty-illustration]"></ng-content>
        } @else {
          <!-- Default Empty Illustration -->
          <svg 
            class="w-full h-full text-secondary-300 dark:text-secondary-600" 
            viewBox="0 0 200 200" 
            fill="none"
            aria-hidden="true"
          >
            <circle cx="100" cy="100" r="80" stroke="currentColor" stroke-width="2" stroke-dasharray="8 4"></circle>
            <path d="M70 90h60M70 110h40" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path>
            <circle cx="100" cy="100" r="40" fill="currentColor" fill-opacity="0.1"></circle>
            <path d="M85 100l7 7 13-14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" opacity="0.5"></path>
          </svg>
        }
      </div>

      <!-- Content -->
      <div [class]="contentClasses()">
        @if (title()) {
          <h3 [class]="titleClasses()">{{ title() }}</h3>
        }
        @if (description()) {
          <p [class]="descriptionClasses()">{{ description() }}</p>
        }
      </div>

      <!-- Actions -->
      <div class="flex flex-col sm:flex-row items-center gap-3 mt-6">
        <ng-content select="[empty-actions]"></ng-content>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmptyStateComponent {
  // Inputs
  size = input<EmptyStateSize>('md');
  title = input<string>('');
  description = input<string>('');
  customIllustration = input<boolean>(false);

  // Computed classes
  containerClasses = computed(() => {
    const paddingMap: Record<EmptyStateSize, string> = {
      sm: 'py-8',
      md: 'py-12',
      lg: 'py-16',
    };
    return `flex flex-col items-center text-center ${paddingMap[this.size()]}`;
  });

  illustrationClasses = computed(() => {
    const sizeMap: Record<EmptyStateSize, string> = {
      sm: 'w-24 h-24',
      md: 'w-32 h-32',
      lg: 'w-48 h-48',
    };
    return `${sizeMap[this.size()]} mb-4`;
  });

  contentClasses = computed(() => {
    const maxWidthMap: Record<EmptyStateSize, string> = {
      sm: 'max-w-xs',
      md: 'max-w-sm',
      lg: 'max-w-md',
    };
    return maxWidthMap[this.size()];
  });

  titleClasses = computed(() => {
    const sizeMap: Record<EmptyStateSize, string> = {
      sm: 'text-base',
      md: 'text-lg',
      lg: 'text-xl',
    };
    return `${sizeMap[this.size()]} font-semibold text-text-primary`;
  });

  descriptionClasses = computed(() => {
    return 'mt-2 text-sm text-text-secondary';
  });
}
