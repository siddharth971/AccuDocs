import { Component, input, ChangeDetectionStrategy, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

export type BadgeVariant = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
export type BadgeSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-badge, ui-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span [class]="badgeClasses()" [attr.role]="role()">
      <!-- Dot indicator -->
      @if (dot()) {
        <span [class]="dotClasses()" aria-hidden="true"></span>
      }

      <!-- Icon prefix -->
      @if (icon()) {
        <ng-content select="[badge-icon]"></ng-content>
      }

      <!-- Badge content -->
      <ng-content></ng-content>
    </span>
  `,
  styles: [`
    :host {
      display: inline-flex;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BadgeComponent {
  // Inputs
  variant = input<BadgeVariant>('default');
  size = input<BadgeSize>('md');
  dot = input<boolean>(false);
  icon = input<boolean>(false);
  pill = input<boolean>(true);
  role = input<string>('status');

  // Computed dot classes
  dotClasses = computed(() => {
    const baseClasses = 'shrink-0 rounded-full';

    const sizeClasses: Record<BadgeSize, string> = {
      sm: 'w-1.5 h-1.5',
      md: 'w-2 h-2',
      lg: 'w-2.5 h-2.5',
    };

    const variantClasses: Record<BadgeVariant, string> = {
      default: 'bg-secondary-500',
      primary: 'bg-primary-500',
      secondary: 'bg-secondary-500',
      success: 'bg-success-500',
      warning: 'bg-warning-500',
      danger: 'bg-danger-500',
      info: 'bg-info-500',
    };

    return [
      baseClasses,
      sizeClasses[this.size()],
      variantClasses[this.variant()],
    ].join(' ');
  });

  // Computed badge classes
  badgeClasses = computed(() => {
    const baseClasses = [
      'inline-flex items-center gap-1.5',
      'font-medium',
      'whitespace-nowrap',
      'transition-colors duration-200',
    ].join(' ');

    const sizeClasses: Record<BadgeSize, string> = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-2.5 py-0.5 text-xs',
      lg: 'px-3 py-1 text-sm',
    };

    const variantClasses: Record<BadgeVariant, string> = {
      default: [
        'bg-secondary-100 text-secondary-700',
        'dark:bg-secondary-800 dark:text-secondary-300',
      ].join(' '),
      primary: [
        'bg-primary-100 text-primary-700',
        'dark:bg-primary-900/30 dark:text-primary-400',
      ].join(' '),
      secondary: [
        'bg-secondary-100 text-secondary-600',
        'dark:bg-secondary-800 dark:text-secondary-400',
      ].join(' '),
      success: [
        'bg-success-100 text-success-700',
        'dark:bg-success-900/30 dark:text-success-400',
      ].join(' '),
      warning: [
        'bg-warning-100 text-warning-700',
        'dark:bg-warning-900/30 dark:text-warning-400',
      ].join(' '),
      danger: [
        'bg-danger-100 text-danger-700',
        'dark:bg-danger-900/30 dark:text-danger-400',
      ].join(' '),
      info: [
        'bg-info-100 text-info-700',
        'dark:bg-info-900/30 dark:text-info-400',
      ].join(' '),
    };

    const radiusClass = this.pill() ? 'rounded-full' : 'rounded-md';

    return [
      baseClasses,
      sizeClasses[this.size()],
      variantClasses[this.variant()],
      radiusClass,
    ].join(' ');
  });
}
