import { Component, inject, ChangeDetectionStrategy, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { signal, effect } from '@angular/core';
import { findModule, getHubModules, MODULE_REGISTRY } from '../../core/module-registry';
import { NavigationService } from '../../core/navigation.service';

@Component({
  selector: 'app-coming-soon',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    @if (module(); as mod) {
      <div
        style="
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 60vh;
          padding: 40px 20px;
          text-align: center;
        "
      >
        <!-- Large Module Icon -->
        <div
          style="
            font-size: 80px;
            margin-bottom: 24px;
            opacity: 0.8;
          "
        >
          {{ mod.icon }}
        </div>

        <!-- Module Name -->
        <h1
          style="
            font-size: 32px;
            font-weight: 700;
            color: var(--color-text);
            margin: 0 0 8px 0;
          "
        >
          {{ mod.label }}
        </h1>

        <!-- Module Description -->
        <p
          style="
            font-size: 14px;
            color: var(--color-text-sub);
            max-width: 600px;
            margin: 0 0 24px 0;
            line-height: 1.6;
          "
        >
          {{ mod.desc }}
        </p>

        <!-- Status Badge -->
        <div
          style="
            display: inline-block;
            font-size: 11px;
            text-transform: uppercase;
            font-weight: 700;
            padding: 6px 12px;
            border-radius: 4px;
            letter-spacing: 0.05em;
            margin-bottom: 32px;
          "
          [style.background]="
            mod.status === 'beta' ? '#C87C2A' : '#7A8898'
          "
          [style.color]="'white'"
        >
          {{ mod.status === 'beta' ? '🚀 In Development' : '⏰ Coming Soon' }}
        </div>

        <!-- Development Status Message -->
        <div
          style="
            background: var(--color-surface);
            border: 1px solid var(--color-border);
            border-radius: 8px;
            padding: 24px;
            max-width: 500px;
            margin-bottom: 32px;
          "
        >
          <p
            style="
              margin: 0 0 12px 0;
              color: var(--color-text);
              font-weight: 600;
            "
          >
            {{ mod.status === 'beta'
              ? 'This module is currently in beta and actively being developed.'
              : 'This module is in our roadmap and coming very soon!' }}
          </p>
          <p
            style="
              margin: 0;
              color: var(--color-text-sub);
              font-size: 13px;
              line-height: 1.5;
            "
          >
            {{ mod.status === 'beta'
              ? 'You can help shape its development by providing feedback and suggestions.'
              : 'We\'re working hard to bring this feature to you. Stay tuned!' }}
          </p>
        </div>

        <!-- Pin Button -->
        <button
          (click)="togglePin()"
          style="
            padding: 10px 20px;
            border-radius: 6px;
            border: 1px solid var(--color-border);
            background: transparent;
            color: var(--color-text);
            font-size: 13px;
            cursor: pointer;
            transition: all 0.2s;
            margin-bottom: 32px;
            display: flex;
            align-items: center;
            gap: 6px;
          "
          [style.background]="isPinned ? 'var(--color-gold-faint)' : 'transparent'"
          [style.border-color]="isPinned ? 'var(--color-gold)' : 'var(--color-border)'"
          [style.color]="isPinned ? 'var(--color-gold)' : 'inherit'"
          class="hover:border-gold-500"
        >
          <span>{{ isPinned ? '📌' : '📍' }}</span>
          <span>{{ isPinned ? 'Pinned' : 'Pin for quick access' }}</span>
        </button>

        <!-- Related Modules -->
        @if (relatedModules().length > 0) {
          <div
            style="
              background: var(--color-surface);
              border: 1px solid var(--color-border);
              border-radius: 8px;
              padding: 24px;
              max-width: 500px;
              width: 100%;
            "
          >
            <h3
              style="
                font-size: 14px;
                font-weight: 600;
                color: var(--color-text);
                margin: 0 0 12px 0;
              "
            >
              📞 Related Modules
            </h3>
            <div style="display: flex; flex-direction: column; gap: 8px;">
              @for (relModule of relatedModules(); track relModule.id) {
                <button
                  (click)="nav.navigateTo(relModule.id)"
                  style="
                    padding: 12px;
                    text-align: left;
                    background: transparent;
                    border: 1px solid var(--color-border);
                    border-radius: 6px;
                    color: var(--color-text);
                    font-size: 13px;
                    cursor: pointer;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                  "
                  class="hover:bg-gray-900 hover:border-gold-500"
                >
                  <span>{{ relModule.icon }}</span>
                  <span style="flex: 1;">{{ relModule.label }}</span>
                  <span style="font-size: 11px; color: var(--color-text-sub);">
                    {{ relModule.status }}
                  </span>
                </button>
              }
            </div>
          </div>
        }
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComingSoonComponent {
  private route = inject(ActivatedRoute);
  nav = inject(NavigationService);

  moduleId = signal<string | null>(null);
  isPinned = false;

  module = computed(() => {
    const id = this.moduleId();
    return id ? findModule(id) : null;
  });

  relatedModules = computed(() => {
    const mod = this.module();
    if (!mod) return [];

    const hubModules = getHubModules(mod.hub);
    return hubModules
      .filter(m => m.id !== mod.id && m.status !== 'soon')
      .slice(0, 3);
  });

  constructor() {
    // Get module ID from query params
    this.route.queryParamMap.subscribe(params => {
      const id = params.get('module');
      if (id) {
        this.moduleId.set(id);
        const mod = findModule(id);
        if (mod) {
          this.nav.activeModule.set(id);
          this.nav.activeHub.set(mod.hub);
        }
        this.isPinned = this.nav.isPinned(id);
      }
    });
  }

  togglePin(): void {
    const id = this.moduleId();
    if (id) {
      this.nav.togglePin(id);
      this.isPinned = this.nav.isPinned(id);
    }
  }
}
