import { Component, inject, ChangeDetectionStrategy, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavigationService } from '../../core/navigation.service';
import { AuthService } from '../../core/services/auth.service';
import {
  getHubModules,
  groupModulesByStatus,
  findHub,
} from '../../core/module-registry';

@Component({
  selector: 'app-module-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside
      class="module-sidebar flex flex-col"
      style="
        width: 220px;
        height: 100vh;
        overflow-y: auto;
        overflow-x: hidden;
        background: var(--color-surface);
        border-right: 1px solid var(--color-border);
      "
    >
      <!-- Hub Header -->
      <div
        class="hub-header p-4 border-b"
        style="
          border-color: var(--color-border);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        "
      >
        <div style="display: flex; align-items: center; gap: 8px; flex: 1;">
          @if (hubData(); as hub) {
            <div style="font-size: 20px;">{{ hub.icon }}</div>
            <div>
              <div style="font-weight: 600; font-size: 14px; color: var(--color-text);">
                {{ hub.label }}
              </div>
              <div
                style="
                  font-size: 12px;
                  color: var(--color-text-sub);
                  line-height: 1;
                  margin-top: 2px;
                "
              >
                {{ hub.desc }}
              </div>
            </div>
          }
        </div>
        <button
          (click)="nav.toggleSidebar()"
          style="
            background: transparent;
            border: none;
            color: var(--color-text-sub);
            cursor: pointer;
            font-size: 16px;
            padding: 4px 8px;
            border-radius: 4px;
            transition: all 0.2s;
          "
          class="hover:bg-gray-700"
        >
          ‹
        </button>
      </div>

      <!-- Modules grouped by status -->
      <div class="flex-1 overflow-y-auto" style="padding: 12px 0;">
        <!-- LIVE Section -->
        @if (grouped().live.length > 0) {
          <div>
            <div
              class="px-4 py-2 text-xs uppercase tracking-wider"
              style="
                color: var(--color-text-dim);
                display: flex;
                align-items: center;
                gap: 6px;
              "
            >
              <span style="width: 6px; height: 6px; border-radius: 3px; background: #3D9E6A;"></span>
              Ready
            </div>
            @for (module of grouped().live; track module.id) {
              <button
                (click)="nav.navigateTo(module.id)"
                style="
                  width: 100%;
                  padding: 10px 16px;
                  text-align: left;
                  background: transparent;
                  border: none;
                  cursor: pointer;
                  color: var(--color-text);
                  font-size: 14px;
                  display: flex;
                  align-items: center;
                  gap: 10px;
                  transition: all 0.2s;
                  border-left: 3px solid transparent;
                "
                [style.background]="
                  nav.activeModule() === module.id
                    ? 'var(--color-gold-faint)'
                    : 'transparent'
                "
                [style.border-left-color]="
                  nav.activeModule() === module.id ? getHubColor() : 'transparent'
                "
                class="hover:bg-gray-900"
              >
                <span>{{ module.icon }}</span>
                <span class="flex-1">{{ module.label }}</span>
                @if (module.badge && module.badge > 0) {
                  <span
                    style="
                      background: var(--color-red);
                      color: white;
                      font-size: 11px;
                      font-weight: 700;
                      padding: 2px 6px;
                      border-radius: 10px;
                    "
                  >
                    {{ module.badge }}
                  </span>
                }
              </button>
            }
          </div>
        }

        <!-- BETA Section -->
        @if (grouped().beta.length > 0) {
          <div>
            <div
              class="px-4 py-2 text-xs uppercase tracking-wider"
              style="
                color: var(--color-text-dim);
                display: flex;
                align-items: center;
                gap: 6px;
                margin-top: 8px;
              "
            >
              <span style="width: 6px; height: 6px; border-radius: 3px; background: #C87C2A;"></span>
              Beta
            </div>
            @for (module of grouped().beta; track module.id) {
              <button
                (click)="nav.navigateTo(module.id)"
                style="
                  width: 100%;
                  padding: 10px 16px;
                  text-align: left;
                  background: transparent;
                  border: none;
                  cursor: pointer;
                  color: var(--color-text);
                  font-size: 14px;
                  display: flex;
                  align-items: center;
                  gap: 10px;
                  transition: all 0.2s;
                  border-left: 3px solid transparent;
                  opacity: 0.85;
                "
                [style.background]="
                  nav.activeModule() === module.id
                    ? 'var(--color-gold-faint)'
                    : 'transparent'
                "
                [style.border-left-color]="
                  nav.activeModule() === module.id ? getHubColor() : 'transparent'
                "
                class="hover:bg-gray-900"
              >
                <span>{{ module.icon }}</span>
                <span class="flex-1">{{ module.label }}</span>
                @if (module.badge && module.badge > 0) {
                  <span
                    style="
                      background: var(--color-red);
                      color: white;
                      font-size: 11px;
                      font-weight: 700;
                      padding: 2px 6px;
                      border-radius: 10px;
                    "
                  >
                    {{ module.badge }}
                  </span>
                }
              </button>
            }
          </div>
        }

        <!-- SOON Section -->
        @if (grouped().soon.length > 0) {
          <div>
            <div
              class="px-4 py-2 text-xs uppercase tracking-wider"
              style="
                color: var(--color-text-dim);
                display: flex;
                align-items: center;
                gap: 6px;
                margin-top: 8px;
              "
            >
              <span style="width: 6px; height: 6px; border-radius: 3px; background: #7A8898;"></span>
              Coming Soon
            </div>
            @for (module of grouped().soon; track module.id) {
              <button
                (click)="nav.navigateTo(module.id)"
                style="
                  width: 100%;
                  padding: 10px 16px;
                  text-align: left;
                  background: transparent;
                  border: none;
                  cursor: pointer;
                  color: var(--color-text);
                  font-size: 14px;
                  display: flex;
                  align-items: center;
                  gap: 10px;
                  transition: all 0.2s;
                  border-left: 3px solid transparent;
                  opacity: 0.5;
                  cursor: not-allowed;
                "
              >
                <span>{{ module.icon }}</span>
                <span class="flex-1">{{ module.label }}</span>
              </button>
            }
          </div>
        }
      </div>

      <!-- Bottom user section -->
      <div
        class="border-t p-4"
        style="
          border-color: var(--color-border);
          display: flex;
          align-items: center;
          gap: 8px;
        "
      >
        <div
          style="
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: var(--color-gold);
            color: var(--color-bg);
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 12px;
          "
        >
          {{ authService.currentUser()?.name?.charAt(0) || 'CA' }}
        </div>
        <div style="flex: 1; min-width: 0;">
          <div style="font-weight: 600; font-size: 13px; color: var(--color-text);" class="truncate">
            {{ authService.currentUser()?.name || 'Firm Name' }}
          </div>
          <div
            style="
              font-size: 11px;
              color: var(--color-text-sub);
              display: flex;
              align-items: center;
              gap: 4px;
              margin-top: 2px;
              text-transform: capitalize;
            "
          >
            <span style="width: 6px; height: 6px; border-radius: 50%; background: #3D9E6A;"></span>
            {{ authService.currentUser()?.role || 'Admin' }}
          </div>
        </div>
      </div>
    </aside>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModuleSidebarComponent {
  nav = inject(NavigationService);
  authService = inject(AuthService);

  hubData = this.nav.activeHubData;

  grouped = computed(() => {
    const modules = getHubModules(this.nav.activeHub());
    return groupModulesByStatus(modules);
  });

  getHubColor(): string {
    return this.nav.activeHubData()?.color || '#C9943A';
  }
}
