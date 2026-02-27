import { Component, inject, ChangeDetectionStrategy, computed, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavigationService } from '../../core/navigation.service';
import {
  getHubModules,
  groupModulesByStatus,
  findHub,
  getHubStatusCounts,
  AppModule,
  Hub,
} from '../../core/module-registry';

// Inner module card component (declared first)
@Component({
  selector: 'app-module-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      (click)="!_disabled && _nav.navigateTo(module.id)"
      style="
        padding: 16px;
        border: 1px solid var(--color-border);
        border-radius: 8px;
        background: var(--color-surface);
        cursor: {{ _disabled ? 'not-allowed' : 'pointer' }};
        transition: all 0.2s;
        text-align: left;
        color: var(--color-text);
        display: flex;
        flex-direction: column;
        gap: 12px;
      "
      [style.opacity]="_disabled ? '0.5' : '1'"
      (mouseenter)="!_disabled && (hovered = true)"
      (mouseleave)="hovered = false"
      [style.border-color]="
        hovered && !_disabled
          ? hubColor
          : 'var(--color-border)'
      "
      [style.background]="
        hovered && !_disabled
          ? 'var(--color-gold-faint)'
          : 'var(--color-surface)'
      "
      class="hover:shadow-lg"
    >
      <!-- Top colored bar -->
      <div
        style="
          width: 100%;
          height: 3px;
          border-radius: 3px;
          background: {{ hubColor }};
          opacity: {{ _disabled ? '0.3' : '1' }};
        "
      ></div>

      <!-- Icon + Status -->
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <div
          style="
            font-size: 28px;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
          "
        >
          {{ module.icon }}
        </div>
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
          [style.color]="'white'"
        >
          {{ module.status }}
        </span>
      </div>

      <!-- Label -->
      <div>
        <div
          style="
            font-weight: 600;
            font-size: 13px;
            color: var(--color-text);
            margin-bottom: 4px;
          "
        >
          {{ module.label }}
        </div>
        <div
          style="
            font-size: 12px;
            color: var(--color-text-sub);
            line-height: 1.4;
          "
        >
          {{ module.desc }}
        </div>
      </div>

      <!-- Badge if present -->
      @if (module.badge && module.badge > 0) {
        <div
          style="
            background: var(--color-red);
            color: white;
            font-size: 11px;
            font-weight: 700;
            padding: 4px 8px;
            border-radius: 4px;
            text-align: center;
          "
        >
          {{ module.badge }} notifications
        </div>
      }
    </button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModuleCardComponent {
  _nav = inject(NavigationService);
  @Input() module!: AppModule;
  @Input() hubColor: string = '#C9943A';
  @Input() set disabled(value: boolean) {
    this._disabled = value;
  }
  _disabled: boolean = false;
  hovered: boolean = false;

  getStatusColor(status: string): string {
    return status === 'live'
      ? '#3D9E6A'
      : status === 'beta'
        ? '#C87C2A'
        : '#7A8898';
  }
}

// Main hub overview component
@Component({
  selector: 'app-hub-overview',
  standalone: true,
  imports: [CommonModule, RouterModule, ModuleCardComponent],
  template: `
    @if (hubData(); as hub) {
      <div style="padding: 32px 40px;">
        <!-- Hub Header -->
        <div style="margin-bottom: 40px;">
          <div style="display: flex; align-items: flex-start; gap: 16px; margin-bottom: 16px;">
            <div
              style="
                font-size: 48px;
                width: 80px;
                height: 80px;
                display: flex;
                align-items: center;
                justify-content: center;
                background: var(--color-surface);
                border-radius: 12px;
              "
            >
              {{ hub.icon }}
            </div>
            <div>
              <h1
                style="
                  font-size: 32px;
                  font-weight: 700;
                  color: var(--color-text);
                  margin: 0 0 8px 0;
                "
              >
                {{ hub.label }}
              </h1>
              <p
                style="
                  font-size: 14px;
                  color: var(--color-text-sub);
                  margin: 0 0 12px 0;
                "
              >
                {{ hub.desc }}
              </p>
              <div
                style="
                  display: flex;
                  gap: 16px;
                  font-size: 12px;
                  color: var(--color-text-dim);
                "
              >
                <span>{{ counts().live }} Live</span>
                <span>•</span>
                <span>{{ counts().beta }} Beta</span>
                <span>•</span>
                <span>{{ counts().soon }} Coming Soon</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Live Section -->
        @if (grouped().live.length > 0) {
          <div style="margin-bottom: 40px;">
            <div
              style="
                font-size: 14px;
                font-weight: 600;
                color: var(--color-text);
                margin-bottom: 16px;
                display: flex;
                align-items: center;
                gap: 8px;
              "
            >
              <span
                style="
                  width: 8px;
                  height: 8px;
                  border-radius: 50%;
                  background: #3D9E6A;
                  display: inline-block;
                "
              ></span>
              Ready
            </div>
            <div
              style="
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                gap: 16px;
              "
            >
              @for (module of grouped().live; track module.id) {
                <app-module-card [module]="module" [hubColor]="hub.color" />
              }
            </div>
          </div>
        }

        <!-- Beta Section -->
        @if (grouped().beta.length > 0) {
          <div style="margin-bottom: 40px;">
            <div
              style="
                font-size: 14px;
                font-weight: 600;
                color: var(--color-text);
                margin-bottom: 16px;
                display: flex;
                align-items: center;
                gap: 8px;
              "
            >
              <span
                style="
                  width: 8px;
                  height: 8px;
                  border-radius: 50%;
                  background: #C87C2A;
                  display: inline-block;
                "
              ></span>
              Beta
            </div>
            <div
              style="
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                gap: 16px;
              "
            >
              @for (module of grouped().beta; track module.id) {
                <app-module-card [module]="module" [hubColor]="hub.color" />
              }
            </div>
          </div>
        }

        <!-- Coming Soon Section -->
        @if (grouped().soon.length > 0) {
          <div>
            <div
              style="
                font-size: 14px;
                font-weight: 600;
                color: var(--color-text);
                margin-bottom: 16px;
                display: flex;
                align-items: center;
                gap: 8px;
              "
            >
              <span
                style="
                  width: 8px;
                  height: 8px;
                  border-radius: 50%;
                  background: #7A8898;
                  display: inline-block;
                "
              ></span>
              Coming Soon
            </div>
            <div
              style="
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                gap: 16px;
              "
            >
              @for (module of grouped().soon; track module.id) {
                <app-module-card [module]="module" [hubColor]="hub.color" [disabled]="true" />
              }
            </div>
          </div>
        }
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HubOverviewComponent {
  private nav = inject(NavigationService);

  hubData = computed(() => {
    return findHub(this.nav.activeHub());
  });

  grouped = computed(() => {
    const modules = getHubModules(this.nav.activeHub());
    return groupModulesByStatus(modules);
  });

  counts = computed(() => {
    return getHubStatusCounts(this.nav.activeHub());
  });
}
