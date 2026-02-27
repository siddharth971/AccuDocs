import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationService } from '../../core/navigation.service';

@Component({
  selector: 'app-sidebar-collapsed-strip',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="sidebar-collapsed w-6 h-screen flex-shrink-0 flex items-center justify-center"
      style="
        width: 24px;
        height: 100vh;
        background: var(--color-surface);
        border-right: 1px solid var(--color-border);
        cursor: pointer;
        transition: all 0.3s;
      "
      (click)="nav.toggleSidebar()"
      title="Expand sidebar"
    >
      <button
        style="
          background: transparent;
          border: none;
          color: var(--color-text-sub);
          font-size: 16px;
          cursor: pointer;
          transition: all 0.2s;
        "
        class="hover:text-white"
      >
        ›
      </button>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarCollapsedStripComponent {
  nav = inject(NavigationService);
}
