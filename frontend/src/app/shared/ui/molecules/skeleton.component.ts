import { Component, input, ChangeDetectionStrategy, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton, ui-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="skeletonClasses()" [style]="customStyle()" aria-hidden="true">
      @if (variant() === 'text' && lines() > 1) {
        @for (line of linesArray(); track $index; let last = $last) {
          <div 
            class="h-4 rounded skeleton mb-2"
            [style.width]="last ? '60%' : '100%'"
          ></div>
        }
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    .skeleton {
      background: linear-gradient(
        90deg,
        var(--border-subtle) 25%,
        var(--surface-color) 50%,
        var(--border-subtle) 75%
      );
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
    }
    @keyframes shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkeletonComponent {
  // Inputs
  variant = input<'text' | 'circle' | 'rectangle' | 'card'>('rectangle');
  width = input<string>('100%');
  height = input<string>('20px');
  lines = input<number>(1);
  rounded = input<boolean>(true);
  animate = input<boolean>(true);

  // Computed lines array
  linesArray = computed(() => Array(this.lines()).fill(0));

  // Computed skeleton classes
  skeletonClasses = computed(() => {
    const baseClasses = ['skeleton'];

    const variantClasses: Record<string, string> = {
      text: '',
      circle: 'rounded-full',
      rectangle: this.rounded() ? 'rounded-md' : '',
      card: 'rounded-lg',
    };

    if (!this.animate()) {
      baseClasses.push('!animation-none');
    }

    return [...baseClasses, variantClasses[this.variant()]].join(' ');
  });

  // Computed custom styles
  customStyle = computed(() => {
    const variant = this.variant();

    if (variant === 'text' && this.lines() > 1) {
      return { width: this.width() };
    }

    if (variant === 'circle') {
      return {
        width: this.width(),
        height: this.width(), // Square for circle
        borderRadius: '50%',
      };
    }

    return {
      width: this.width(),
      height: this.height(),
    };
  });
}

// Skeleton Card preset component
@Component({
  selector: 'app-skeleton-card, ui-skeleton-card',
  standalone: true,
  imports: [CommonModule, SkeletonComponent],
  template: `
    <div class="bg-surface-color border border-border-color rounded-lg p-6 space-y-4">
      <!-- Header -->
      <div class="flex items-center gap-4">
        <ui-skeleton variant="circle" width="48px"></ui-skeleton>
        <div class="flex-1 space-y-2">
          <ui-skeleton height="16px" width="60%"></ui-skeleton>
          <ui-skeleton height="12px" width="40%"></ui-skeleton>
        </div>
      </div>
      
      <!-- Content lines -->
      <div class="space-y-2">
        <ui-skeleton height="14px"></ui-skeleton>
        <ui-skeleton height="14px"></ui-skeleton>
        <ui-skeleton height="14px" width="80%"></ui-skeleton>
      </div>

      <!-- Footer -->
      @if (showFooter()) {
        <div class="flex gap-2 pt-4 border-t border-border-subtle">
          <ui-skeleton height="32px" width="80px"></ui-skeleton>
          <ui-skeleton height="32px" width="80px"></ui-skeleton>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkeletonCardComponent {
  showFooter = input<boolean>(true);
}

// Skeleton Table preset component
@Component({
  selector: 'app-skeleton-table, ui-skeleton-table',
  standalone: true,
  imports: [CommonModule, SkeletonComponent],
  template: `
    <div class="overflow-hidden">
      <!-- Header -->
      <div class="bg-secondary-50 dark:bg-secondary-900 px-6 py-4 flex gap-4">
        @for (col of columnsArray(); track $index) {
          <ui-skeleton height="16px" [width]="getColumnWidth($index)"></ui-skeleton>
        }
      </div>

      <!-- Rows -->
      @for (row of rowsArray(); track $index) {
        <div class="px-6 py-4 flex gap-4 border-t border-border-subtle">
          @for (col of columnsArray(); track $index) {
            <ui-skeleton height="16px" [width]="getColumnWidth($index)"></ui-skeleton>
          }
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkeletonTableComponent {
  rows = input<number>(5);
  columns = input<number>(4);

  columnsArray = computed(() => Array(this.columns()).fill(0));
  rowsArray = computed(() => Array(this.rows()).fill(0));

  getColumnWidth(index: number): string {
    const widths = ['30%', '25%', '20%', '15%', '10%'];
    return widths[index % widths.length];
  }
}
