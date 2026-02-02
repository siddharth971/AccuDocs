import { Component, input, output, ChangeDetectionStrategy, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ButtonComponent } from '../atoms/button.component';
import { SearchBarComponent } from '../molecules/search-bar.component';

export interface Breadcrumb {
  label: string;
  path?: string;
}

export interface PageAction {
  id: string;
  label: string;
  icon?: string;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
}

@Component({
  selector: 'app-page-header, ui-page-header',
  standalone: true,
  imports: [CommonModule, RouterLink, ButtonComponent, SearchBarComponent],
  template: `
    <header class="mb-8">
      <!-- Breadcrumbs -->
      @if (breadcrumbs().length) {
        <nav aria-label="Breadcrumb" class="mb-4">
          <ol class="flex items-center gap-2 text-sm">
            @for (crumb of breadcrumbs(); track crumb.label; let last = $last) {
              <li class="flex items-center gap-2">
                @if (crumb.path && !last) {
                  <a 
                    [routerLink]="crumb.path"
                    class="text-text-secondary hover:text-primary-600 transition-colors"
                  >
                    {{ crumb.label }}
                  </a>
                } @else {
                  <span [class]="last ? 'text-text-primary font-medium' : 'text-text-secondary'">
                    {{ crumb.label }}
                  </span>
                }
                
                @if (!last) {
                  <svg class="w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                }
              </li>
            }
          </ol>
        </nav>
      }

      <!-- Main Header Row -->
      <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <!-- Title Section -->
        <div class="min-w-0 flex-1">
          <h1 class="text-2xl font-bold text-text-primary tracking-tight">
            {{ title() }}
          </h1>
          @if (subtitle()) {
            <p class="mt-1 text-text-secondary">{{ subtitle() }}</p>
          }

          <!-- Stats / Tags -->
          @if (showStats()) {
            <div class="mt-3 flex flex-wrap items-center gap-4">
              <ng-content select="[page-stats]"></ng-content>
            </div>
          }
        </div>

        <!-- Actions Section -->
        <div class="shrink-0 flex flex-wrap items-center gap-3">
          @for (action of actions(); track action.id) {
            <ui-button
              [variant]="action.variant || 'secondary'"
              [disabled]="action.disabled ?? false"
              (clicked)="onActionClick(action)"
            >
              {{ action.label }}
            </ui-button>
          }
          <ng-content select="[page-actions]"></ng-content>
        </div>
      </div>

      <!-- Filters / Search Row -->
      @if (showFilters() || showSearch()) {
        <div class="mt-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <!-- Search -->
          @if (showSearch()) {
            <div class="w-full sm:w-80">
              <ui-search-bar
                [placeholder]="searchPlaceholder()"
                (searchChange)="onSearch($event)"
              ></ui-search-bar>
            </div>
          }

          <!-- Filters -->
          @if (showFilters()) {
            <div class="flex flex-wrap items-center gap-3">
              <ng-content select="[page-filters]"></ng-content>
            </div>
          }

          <!-- Filter Actions -->
          <div class="ml-auto flex items-center gap-2">
            <ng-content select="[page-filter-actions]"></ng-content>
          </div>
        </div>
      }
    </header>
  `,
  styles: [`
    :host {
      display: block;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageHeaderComponent {
  // Inputs
  title = input.required<string>();
  subtitle = input<string>('');
  breadcrumbs = input<Breadcrumb[]>([]);
  actions = input<PageAction[]>([]);
  showSearch = input<boolean>(false);
  showFilters = input<boolean>(false);
  showStats = input<boolean>(false);
  searchPlaceholder = input<string>('Search...');

  // Outputs
  actionClick = output<PageAction>();
  search = output<string>();

  // Methods
  onActionClick(action: PageAction): void {
    this.actionClick.emit(action);
  }

  onSearch(query: string): void {
    this.search.emit(query);
  }
}
