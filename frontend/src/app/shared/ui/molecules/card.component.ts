import { Component, input, ChangeDetectionStrategy, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

export type CardVariant = 'default' | 'elevated' | 'bordered' | 'filled';

@Component({
  selector: 'app-card, ui-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <article [class]="cardClasses()" [attr.aria-labelledby]="title() ? cardId + '-title' : null">
      <!-- Card Header -->
      @if (title() || hasHeaderActions) {
        <header class="flex items-start justify-between gap-4 px-6 py-4 border-b border-border-subtle">
          <div class="flex-1 min-w-0">
            @if (title()) {
              <h3 
                [id]="cardId + '-title'"
                class="text-lg font-semibold text-text-primary truncate"
              >
                {{ title() }}
              </h3>
            }
            @if (subtitle()) {
              <p class="mt-0.5 text-sm text-text-secondary">{{ subtitle() }}</p>
            }
          </div>
          
          <!-- Header Actions Slot -->
          <div class="shrink-0 flex items-center gap-2">
            <ng-content select="[card-actions]"></ng-content>
          </div>
        </header>
      }

      <!-- Card Body -->
      <div [class]="contentClasses()">
        <ng-content></ng-content>
      </div>

      <!-- Card Footer -->
      @if (hasFooter) {
        <footer class="px-6 py-4 border-t border-border-subtle bg-secondary-50/50 dark:bg-secondary-900/30">
          <ng-content select="[card-footer]"></ng-content>
        </footer>
      }
    </article>
  `,
  styles: [`
    :host {
      display: block;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardComponent {
  // Inputs
  variant = input<CardVariant>('default');
  title = input<string>('');
  subtitle = input<string>('');
  padding = input<boolean>(true);
  hoverable = input<boolean>(false);
  clickable = input<boolean>(false);
  fullHeight = input<boolean>(false);

  // Content projection flags
  hasHeaderActions = false;
  hasFooter = false;

  // Unique ID
  cardId = `card-${Math.random().toString(36).substr(2, 9)}`;

  // Computed card classes
  cardClasses = computed(() => {
    const baseClasses = [
      'bg-surface-color',
      'overflow-hidden',
      'transition-all duration-200',
    ].join(' ');

    const variantClasses: Record<CardVariant, string> = {
      default: [
        'rounded-lg border border-border-color',
        'shadow-card',
      ].join(' '),
      elevated: [
        'rounded-xl',
        'shadow-lg',
        'dark:border dark:border-secondary-700',
      ].join(' '),
      bordered: [
        'rounded-lg border-2 border-border-color',
      ].join(' '),
      filled: [
        'rounded-lg',
        'bg-secondary-50 dark:bg-secondary-900',
      ].join(' '),
    };

    const interactiveClasses = [];
    if (this.hoverable()) {
      interactiveClasses.push('hover:shadow-card-hover hover:border-secondary-300 dark:hover:border-secondary-600');
    }
    if (this.clickable()) {
      interactiveClasses.push('cursor-pointer active:scale-[0.995]');
    }

    const heightClass = this.fullHeight() ? 'h-full' : '';

    return [
      baseClasses,
      variantClasses[this.variant()],
      ...interactiveClasses,
      heightClass,
    ].join(' ');
  });

  // Computed content classes
  contentClasses = computed(() => {
    return this.padding() ? 'p-6' : '';
  });
}
