import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavigationService } from '../../core/navigation.service';
import { HUBS, getHubBadgeCount, HubId } from '../../core/module-registry';

@Component({
  selector: 'app-hub-rail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav
      class="hub-rail flex flex-col items-center justify-between"
      style="
        width: 58px;
        height: 100vh;
        background: var(--color-surface);
        border-right: 1px solid var(--color-border);
        padding: 16px 0;
        overflow-y: auto;
      "
    >
      <!-- Logo at top -->
      <button
        class="hub-icon"
        (click)="nav.setActiveHub('core')"
        title="Home"
        style="
          font-size: 24px;
          width: 40px;
          height: 40px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
          background: transparent;
          color: var(--color-text);
        "
        [style.background]="nav.activeHub() === 'core' ? 'var(--color-gold-faint)' : 'transparent'"
        [style.color]="nav.activeHub() === 'core' ? 'var(--color-gold)' : 'inherit'"
      >
        🏛️
      </button>

      <!-- Hubs list -->
      <div class="flex-1 flex flex-col gap-2 mt-6">
        @for (hub of hubs; track hub.id) {
          <button
            class="hub-icon relative"
            [attr.title]="hub.label"
            (click)="nav.setActiveHub(hub.id)"
            style="
              font-size: 20px;
              width: 40px;
              height: 40px;
              border-radius: 8px;
              display: flex;
              align-items: center;
              justify-content: center;
              cursor: pointer;
              transition: all 0.2s;
              border: none;
              background: transparent;
              color: var(--color-text-sub);
              position: relative;
              border-left: 3px solid transparent;
            "
            [style.background]="nav.activeHub() === hub.id ? 'var(--color-gold-faint)' : 'transparent'"
            [style.border-left-color]="nav.activeHub() === hub.id ? hub.color : 'transparent'"
            [style.color]="nav.activeHub() === hub.id ? hub.color : 'inherit'"
            [style.opacity]="nav.activeHub() === hub.id ? '1' : '0.7'"
          >
            {{ hub.icon }}
            <!-- Badge if hub has notifications -->
            @if (getHubBadgeCount(hub.id) > 0) {
              <div
                class="absolute top-0 right-0 w-5 h-5 rounded-full"
                style="
                  background: var(--color-red);
                  color: white;
                  font-size: 10px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-weight: 700;
                "
              >
                {{ getHubBadgeCount(hub.id) > 99 ? '99+' : getHubBadgeCount(hub.id) }}
              </div>
            }
          </button>
        }
      </div>

      <!-- Search icon at bottom -->
      <button
        class="hub-icon"
        (click)="nav.openCommandPalette()"
        title="Search (⌘K)"
        style="
          font-size: 20px;
          width: 40px;
          height: 40px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
          background: transparent;
          color: var(--color-text-sub);
        "
      >
        🔍
      </button>
    </nav>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HubRailComponent {
  nav = inject(NavigationService);
  hubs = HUBS;
  getHubBadgeCount = getHubBadgeCount;
}
