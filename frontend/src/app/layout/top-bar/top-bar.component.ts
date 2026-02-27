import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavigationService } from '../../core/navigation.service';

@Component({
  selector: 'app-top-bar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header
      class="top-bar"
      style="
        height: 52px;
        background: var(--color-bg-raised);
        border-bottom: 1px solid var(--color-border);
        display: flex;
        align-items: center;
        padding: 0 24px;
        gap: 24px;
        flex-shrink: 0;
      "
    >
      <!-- Breadcrumb (left) -->
      <div style="display: flex; align-items: center; gap: 8px; flex: 1; min-width: 0;">
        @if (nav.activeHubData(); as hub) {
          <span style="color: var(--color-text-sub); font-size: 13px;">
            {{ hub.label }}
          </span>
          @if (nav.activeModuleData(); as module) {
            <span style="color: var(--color-text-sub); font-size: 13px;"> / </span>
            <span style="color: var(--color-text); font-size: 13px; font-weight: 500;">
              {{ module.label }}
            </span>
          }
        }
      </div>

      <!-- Search (center) -->
      <button
        (click)="nav.openCommandPalette()"
        style="
          flex: 0.8;
          max-width: 400px;
          min-width: 200px;
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: 8px;
          padding: 8px 12px;
          color: var(--color-text-sub);
          font-size: 13px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          cursor: pointer;
          transition: all 0.2s;
        "
        class="hover:border-gold-500"
      >
        <span style="display: flex; align-items: center; gap: 6px;">
          🔍 Search modules...
        </span>
        <span
          style="
            background: var(--color-border);
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 11px;
            color: var(--color-text-dim);
            font-weight: 600;
          "
        >
          ⌘K
        </span>
      </button>

      <!-- Right side: WA status + notifications + user -->
      <div style="display: flex; align-items: center; gap: 16px;">
        <!-- WhatsApp status -->
        <div
          style="
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 4px 12px;
            border-radius: 20px;
            background: var(--color-surface);
            font-size: 12px;
            color: var(--color-text-sub);
          "
        >
          <span
            style="
              width: 6px;
              height: 6px;
              border-radius: 50%;
              background: #3D9E6A;
            "
          ></span>
          WA Connected
        </div>

        <!-- Notifications bell -->
        <button
          style="
            background: transparent;
            border: none;
            color: var(--color-text);
            font-size: 18px;
            cursor: pointer;
            position: relative;
            transition: all 0.2s;
            padding: 4px;
            border-radius: 6px;
          "
          class="hover:bg-gray-900"
          title="Notifications"
        >
          🔔
          <div
            style="
              position: absolute;
              top: 0;
              right: 0;
              width: 18px;
              height: 18px;
              border-radius: 50%;
              background: var(--color-red);
              color: white;
              font-size: 10px;
              font-weight: 700;
              display: flex;
              align-items: center;
              justify-content: center;
            "
          >
            3
          </div>
        </button>

        <!-- User profile -->
        <button
          style="
            display: flex;
            align-items: center;
            gap: 8px;
            background: transparent;
            border: 1px solid var(--color-border);
            border-radius: 20px;
            padding: 2px 12px 2px 2px;
            cursor: pointer;
            transition: all 0.2s;
          "
          class="hover:border-gold-500"
        >
          <div
            style="
              width: 28px;
              height: 28px;
              border-radius: 50%;
              background: var(--color-gold);
              color: var(--color-bg);
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: 700;
              font-size: 11px;
              flex-shrink: 0;
            "
          >
            CA
          </div>
          <span style="font-size: 12px; color: var(--color-text); font-weight: 500;">
            You
          </span>
        </button>
      </div>
    </header>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopBarComponent {
  nav = inject(NavigationService);
}
