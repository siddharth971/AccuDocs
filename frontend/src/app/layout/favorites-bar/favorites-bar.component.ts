import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavigationService } from '../../core/navigation.service';
import { MODULE_REGISTRY } from '../../core/module-registry';

@Component({
  selector: 'app-favorites-bar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div
      class="favorites-bar"
      style="
        height: 44px;
        background: var(--color-surface);
        border-bottom: 1px solid var(--color-border);
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 0 16px;
        overflow-x: auto;
        overflow-y: hidden;
        flex-shrink: 0;
        scroll-behavior: smooth;
      "
    >
      <!-- Decorative pin icon -->
      <span style="color: var(--color-text-dim); font-size: 16px; flex-shrink: 0;">
        📌
      </span>

      <!-- Pinned modules -->
      @for (module of nav.pinnedModules(); track module.id) {
        <button
          (click)="nav.navigateTo(module.id)"
          style="
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 6px 12px;
            border-radius: 6px;
            background: transparent;
            border: 1px solid var(--color-border);
            color: var(--color-text);
            font-size: 12px;
            cursor: pointer;
            transition: all 0.2s;
            white-space: nowrap;
            flex-shrink: 0;
          "
          [style.background]="
            nav.activeModule() === module.id
              ? 'var(--color-gold-faint)'
              : 'transparent'
          "
          [style.border-color]="
            nav.activeModule() === module.id
              ? getModuleHubColor(module)
              : 'var(--color-border)'
          "
          [style.color]="
            nav.activeModule() === module.id ? getModuleHubColor(module) : 'inherit'
          "
          class="hover:border-gold-500"
        >
          <span>{{ module.icon }}</span>
          <span style="font-weight: 500;">{{ module.label }}</span>
          @if (module.badge && module.badge > 0) {
            <span
              style="
                background: var(--color-red);
                color: white;
                font-size: 10px;
                font-weight: 700;
                padding: 1px 4px;
                border-radius: 8px;
                margin-left: 4px;
              "
            >
              {{ module.badge }}
            </span>
          }
        </button>
      }

      <!-- Spacer -->
      <div style="flex: 1; min-width: 8px;"></div>

      <!-- All Modules button -->
      <button
        routerLink="/modules"
        style="
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 6px;
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          color: var(--color-text);
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
          flex-shrink: 0;
        "
        class="hover:border-gold-500"
      >
        <span>⊞</span>
        <span style="font-weight: 500;">All Modules ({{ totalModules }})</span>
      </button>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FavoritesBarComponent {
  nav = inject(NavigationService);
  totalModules = MODULE_REGISTRY.length;

  getModuleHubColor(module: any): string {
    const hubColors: { [key: string]: string } = {
      core: '#C9943A',
      compliance: '#3A9E7A',
      work: '#3A7FBF',
      billing: '#C87C2A',
      clients: '#8B5FBF',
      analytics: '#2A8F8A',
      specialist: '#C84B7A',
      ai: '#5B7FBF',
      firm: '#7A8898',
      portal: '#3A9EBF',
      settings: '#7A8898',
    };
    return hubColors[module.hub] || '#C9943A';
  }
}
