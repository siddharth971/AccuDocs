import {
  Component,
  inject,
  ChangeDetectionStrategy,
  signal,
  computed,
  effect,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavigationService } from '../../core/navigation.service';
import { searchModules, getDefaultPins, findHub } from '../../core/module-registry';

@Component({
  selector: 'app-command-palette',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div
      class="command-palette-overlay fixed inset-0 flex items-start justify-center pt-16"
      style="
        background: rgba(0, 0, 0, 0.4);
        backdrop-filter: blur(4px);
        z-index: 9999;
      "
      (click)="onBackdropClick($event)"
    >
      <div
        class="command-palette"
        style="
          width: 560px;
          max-width: 90vw;
          max-height: 500px;
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: 8px;
          display: flex;
          flex-direction: column;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          overflow: hidden;
      "
        (click)="$event.stopPropagation()"
      >
        <!-- Input field -->
        <div
          style="
            padding: 16px 16px;
            border-bottom: 1px solid var(--color-border);
            display: flex;
            align-items: center;
            gap: 8px;
          "
        >
          <span style="color: var(--color-text-sub); font-size: 16px;">🔍</span>
          <input
            #searchInput
            [(ngModel)]="query"
            (keydown)="onKeyDown($event)"
            type="text"
            placeholder="Search modules..."
            style="
              flex: 1;
              background: transparent;
              border: none;
              color: var(--color-text);
              font-size: 14px;
              outline: none;
              font-family: inherit;
            "
            class="placeholder-gray-500"
          />
        </div>

        <!-- Results list -->
        <div
          class="results-list overflow-y-auto"
          style="
            flex: 1;
            display: flex;
            flex-direction: column;
          "
        >
          @if (results().length === 0 && query.length === 0) {
            <!-- Quick Access (default) -->
            <div style="padding: 16px;">
              <div
                style="
                  font-size: 11px;
                  text-transform: uppercase;
                  color: var(--color-text-dim);
                  letter-spacing: 0.05em;
                  margin-bottom: 12px;
                  font-weight: 600;
                "
              >
                ⚡ Quick Access
              </div>
              @for (module of quickAccess; track module.id) {
                <button
                  (click)="selectResult(module.id)"
                  [style.background]="
                    selectedIndex - 1 === $index
                      ? 'var(--color-gold-faint)'
                      : 'transparent'
                  "
                  style="
                    width: 100%;
                    padding: 10px 8px;
                    text-align: left;
                    background: transparent;
                    border: none;
                    cursor: pointer;
                    color: var(--color-text);
                    font-size: 13px;
                    display: flex;
                    align-items: center;
                    gap: 2px;
                    border-radius: 4px;
                    transition: all 0.15s;
                    margin-bottom: 4px;
                  "
                  class="hover:bg-gray-900"
                >
                  <span>{{ module.icon }}</span>
                  <span style="flex: 1;">{{ module.label }}</span>
                  <span style="font-size: 11px; color: var(--color-text-dim);">
                    {{ module.hub }}
                  </span>
                </button>
              }
            </div>
          } @else if (results().length > 0) {
            <!-- Search results -->
            @for (module of results(); track module.id; let i = $index) {
              <button
                (click)="selectResult(module.id)"
                (mouseenter)="selectedIndex = i"
                [style.background]="
                  selectedIndex === i ? 'var(--color-gold-faint)' : 'transparent'
                "
                style="
                  width: 100%;
                  padding: 12px 16px;
                  text-align: left;
                  background: transparent;
                  border: none;
                  border-bottom: 1px solid var(--color-border);
                  cursor: pointer;
                  color: var(--color-text);
                  display: flex;
                  align-items: center;
                  gap: 12px;
                  transition: all 0.15s;
                "
                class="hover:bg-gray-900"
              >
                <!-- Icon square -->
                <div
                  style="
                    width: 40px;
                    height: 40px;
                    border-radius: 6px;
                    background: var(--color-surface);
                    border: 1px solid var(--color-border);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 20px;
                    flex-shrink: 0;
                  "
                >
                  {{ module.icon }}
                </div>

                <!-- Content -->
                <div style="flex: 1; min-width: 0;">
                  <div style="font-weight: 500; font-size: 13px; margin-bottom: 2px;">
                    {{ module.label }}
                  </div>
                  <div
                    style="
                      font-size: 12px;
                      color: var(--color-text-sub);
                      white-space: nowrap;
                      overflow: hidden;
                      text-overflow: ellipsis;
                    "
                  >
                    {{ module.desc }}
                  </div>
                </div>

                <!-- Status & Hub tags -->
                <div
                  style="
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    flex-shrink: 0;
                  "
                >
                  <!-- Status -->
                  <span
                    style="
                      font-size: 10px;
                      text-transform: uppercase;
                      font-weight: 700;
                      padding: 2px 6px;
                      border-radius: 3px;
                      letter-spacing: 0.05em;
                    "
                    [style.background]="getStatusColor(module.status)"
                    [style.color]="module.status === 'live' ? 'white' : 'white'"
                  >
                    {{ module.status }}
                  </span>

                  <!-- Hub -->
                  <span
                    style="
                      font-size: 10px;
                      padding: 2px 6px;
                      border-radius: 3px;
                      background: var(--color-border);
                      color: var(--color-text-dim);
                    "
                  >
                    {{ getHubLabel(module.hub) }}
                  </span>
                </div>
              </button>
            }
          } @else {
            <div
              style="
                padding: 32px 16px;
                text-align: center;
                color: var(--color-text-sub);
              "
            >
              No modules found for "{{ query }}"
            </div>
          }
        </div>

        <!-- Footer -->
        <div
          style="
            padding: 12px 16px;
            border-top: 1px solid var(--color-border);
            display: flex;
            justify-content: space-between;
            font-size: 11px;
            color: var(--color-text-dim);
          "
        >
          <div style="display: flex; gap: 12px;">
            <span><strong>↵ Enter</strong> Open</span>
            <span><strong>↑↓</strong> Navigate</span>
          </div>
          <span><strong>ESC</strong> Close</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      --color-bg: #0A0C10;
      --color-bg-raised: #0F1318;
      --color-surface: #141920;
      --color-border: #1E2733;
      --color-text: #D8E0EA;
      --color-text-sub: #7A8898;
      --color-text-dim: #3D4A58;
      --color-gold: #C9943A;
      --color-gold-faint: rgba(201, 148, 58, 0.08);
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommandPaletteComponent implements AfterViewInit {
  private nav = inject(NavigationService);

  @ViewChild('searchInput') searchInput?: ElementRef<HTMLInputElement>;

  query = '';
  selectedIndex = -1;
  quickAccess = getDefaultPins();

  results = computed(() => {
    if (!this.query.trim()) {
      return [];
    }
    return searchModules(this.query).slice(0, 12);
  });

  ngAfterViewInit() {
    // Auto-focus input when component is visible
    setTimeout(() => {
      this.searchInput?.nativeElement.focus();
    }, 0);
  }

  onKeyDown(e: KeyboardEvent): void {
    const resultCount = this.results().length || this.quickAccess.length;

    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        this.selectedIndex = Math.max(-1, this.selectedIndex - 1);
        break;
      case 'ArrowDown':
        e.preventDefault();
        this.selectedIndex = Math.min(resultCount - 1, this.selectedIndex + 1);
        break;
      case 'Enter':
        e.preventDefault();
        if (this.selectedIndex >= 0) {
          const modules = this.results().length > 0 ? this.results() : this.quickAccess;
          const selected = modules[this.selectedIndex];
          if (selected) {
            this.selectResult(selected.id);
          }
        }
        break;
      case 'Escape':
        e.preventDefault();
        this.nav.closeCommandPalette();
        break;
    }
  }

  selectResult(moduleId: string): void {
    this.nav.navigateTo(moduleId);
    this.nav.closeCommandPalette();
  }

  onBackdropClick(e: MouseEvent): void {
    if (e.target === e.currentTarget) {
      this.nav.closeCommandPalette();
    }
  }

  getStatusColor(status: string): string {
    return status === 'live'
      ? '#3D9E6A'
      : status === 'beta'
        ? '#C87C2A'
        : '#7A8898';
  }

  getHubLabel(hubId: string): string {
    const hub = findHub(hubId as any);
    return hub?.label || hubId;
  }
}
