import { Component, input, output, ChangeDetectionStrategy, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export type StatVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
export type StatTrend = 'up' | 'down' | 'neutral';

export interface StatItem {
  id: string;
  label: string;
  value: string | number;
  previousValue?: string | number;
  change?: number;
  changeLabel?: string;
  trend?: StatTrend;
  variant?: StatVariant;
  icon?: string;
  href?: string;
}

@Component({
  selector: 'app-stats-card, ui-stats-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="cardClasses()">
      <!-- Icon -->
      @if (showIcon()) {
        <div [class]="iconContainerClasses()">
          <ng-content select="[stat-icon]"></ng-content>
        </div>
      }

      <!-- Content -->
      <div class="min-w-0 flex-1">
        <p class="text-sm font-medium text-text-secondary truncate">{{ label() }}</p>
        <p class="mt-1 text-3xl font-bold text-text-primary tracking-tight">{{ formattedValue() }}</p>
        
        <!-- Change indicator -->
        @if (showChange() && change() !== undefined) {
          <div class="mt-2 flex items-center gap-1.5">
            <span [class]="trendClasses()">
              @if (trend() === 'up') {
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 11l5-5m0 0l5 5m-5-5v12" />
                </svg>
              } @else if (trend() === 'down') {
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                </svg>
              } @else {
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14" />
                </svg>
              }
              <span class="text-sm font-medium">{{ change() }}%</span>
            </span>
            @if (changeLabel()) {
              <span class="text-xs text-text-muted">{{ changeLabel() }}</span>
            }
          </div>
        }
      </div>

      <!-- Action slot -->
      <div class="shrink-0">
        <ng-content select="[stat-action]"></ng-content>
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
export class StatsCardComponent {
  // Inputs
  label = input.required<string>();
  value = input.required<string | number>();
  variant = input<StatVariant>('default');
  change = input<number | undefined>(undefined);
  changeLabel = input<string>('vs last period');
  trend = input<StatTrend>('neutral');
  showIcon = input<boolean>(true);
  showChange = input<boolean>(true);
  clickable = input<boolean>(false);

  // Formatted value
  formattedValue = computed(() => {
    const val = this.value();
    if (typeof val === 'number') {
      return val.toLocaleString();
    }
    return val;
  });

  // Computed classes
  cardClasses = computed(() => {
    const base = [
      'flex items-start gap-4',
      'p-6',
      'bg-surface-color',
      'border border-border-color',
      'rounded-lg',
      'transition-all duration-200',
    ];

    if (this.clickable()) {
      base.push('cursor-pointer hover:shadow-card-hover hover:border-secondary-300');
    }

    return base.join(' ');
  });

  iconContainerClasses = computed(() => {
    const variantClasses: Record<StatVariant, string> = {
      default: 'bg-secondary-100 text-secondary-600 dark:bg-secondary-800 dark:text-secondary-400',
      primary: 'bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400',
      success: 'bg-success-100 text-success-600 dark:bg-success-900/30 dark:text-success-400',
      warning: 'bg-warning-100 text-warning-600 dark:bg-warning-900/30 dark:text-warning-400',
      danger: 'bg-danger-100 text-danger-600 dark:bg-danger-900/30 dark:text-danger-400',
      info: 'bg-info-100 text-info-600 dark:bg-info-900/30 dark:text-info-400',
    };

    return `shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${variantClasses[this.variant()]}`;
  });

  trendClasses = computed(() => {
    const trend = this.trend();
    const trendColors: Record<StatTrend, string> = {
      up: 'text-success-600',
      down: 'text-danger-600',
      neutral: 'text-secondary-500',
    };

    return `inline-flex items-center gap-0.5 ${trendColors[trend]}`;
  });
}

// Stats Grid Component
@Component({
  selector: 'app-stats-grid, ui-stats-grid',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="gridClasses()">
      <ng-content></ng-content>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatsGridComponent {
  columns = input<2 | 3 | 4>(4);

  gridClasses = computed(() => {
    const colClasses: Record<number, string> = {
      2: 'grid-cols-1 sm:grid-cols-2',
      3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    };

    return `grid gap-6 ${colClasses[this.columns()]}`;
  });
}
