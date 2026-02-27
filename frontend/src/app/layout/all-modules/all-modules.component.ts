import { Component, ChangeDetectionStrategy, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HUBS, MODULE_REGISTRY, getHubModules, groupModulesByStatus } from '../../core/module-registry';
import { ModuleCardComponent } from '../hub-overview/hub-overview.component';

@Component({
  selector: 'app-all-modules',
  standalone: true,
  imports: [CommonModule, RouterModule, ModuleCardComponent],
  template: `
    <div style="padding: 32px 40px;">
      <!-- Header -->
      <div style="margin-bottom: 32px;">
        <h1
          style="
            font-size: 36px;
            font-weight: 700;
            color: var(--color-text);
            margin: 0 0 8px 0;
          "
        >
          All Modules
        </h1>
        <p
          style="
            font-size: 14px;
            color: var(--color-text-sub);
            margin: 0;
          "
        >
          {{ MODULE_REGISTRY.length }} modules total •
          {{ liveCount }} live •
          {{ betaCount }} beta •
          {{ soonCount }} coming soon
        </p>
      </div>

      <!-- Modules grouped by hub -->
      @for (hub of hubs; track hub.id) {
        @if (hasModulesForHub(hub.id)) {
          <div style="margin-bottom: 48px;">
            <!-- Hub Section Header -->
            <div style="margin-bottom: 16px;">
              <div
                style="
                  display: flex;
                  align-items: center;
                  gap: 12px;
                  margin-bottom: 4px;
                "
              >
                <span style="font-size: 24px;">{{ hub.icon }}</span>
                <h2
                  style="
                    font-size: 20px;
                    font-weight: 600;
                    color: var(--color-text);
                    margin: 0;
                  "
                >
                  {{ hub.label }}
                </h2>
              </div>
              <p
                style="
                  font-size: 13px;
                  color: var(--color-text-sub);
                  margin: 0 0 0 36px;
                "
              >
                {{ hub.desc }}
              </p>
            </div>

            <!-- Module cards grid -->
            <div
              style="
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
                gap: 16px;
              "
            >
              @for (module of getHubModules(hub.id); track module.id) {
                <app-module-card
                  [module]="module"
                  [hubColor]="hub.color"
                  [disabled]="module.status === 'soon'"
                />
              }
            </div>
          </div>
        }
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AllModulesComponent {
  hubs = HUBS;
  MODULE_REGISTRY = MODULE_REGISTRY;

  liveCount = MODULE_REGISTRY.filter(m => m.status === 'live').length;
  betaCount = MODULE_REGISTRY.filter(m => m.status === 'beta').length;
  soonCount = MODULE_REGISTRY.filter(m => m.status === 'soon').length;

  getHubModules = getHubModules;

  hasModulesForHub(hubId: string): boolean {
    return getHubModules(hubId as any).length > 0;
  }
}
