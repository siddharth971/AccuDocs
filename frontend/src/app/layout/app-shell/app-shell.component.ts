import { Component, inject, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { NavigationService } from '../../core/navigation.service';
import { KeyboardShortcutsService } from '../../core/keyboard-shortcuts.service';
import { ThemeService } from '../../core/services/theme.service';
import { ToastContainerComponent } from '../../shared/components/toast-container/toast-container.component';

import { HubRailComponent } from '../hub-rail/hub-rail.component';
import { ModuleSidebarComponent } from '../module-sidebar/module-sidebar.component';
import { SidebarCollapsedStripComponent } from '../sidebar-collapsed-strip/sidebar-collapsed-strip.component';
import { TopBarComponent } from '../top-bar/top-bar.component';
import { CommandPaletteComponent } from '../command-palette/command-palette.component';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    HubRailComponent,
    ModuleSidebarComponent,
    SidebarCollapsedStripComponent,
    TopBarComponent,
    CommandPaletteComponent,
    ToastContainerComponent,
  ],
  template: `
    <div
      [class.dark]="themeService.isDarkMode()"
      class="app-shell min-h-screen font-sans overflow-x-hidden transition-colors duration-300"
      style="background: var(--color-bg); display: flex; height: 100vh;"
    >
      <!-- Layer 1: Hub Rail -->
      <app-hub-rail />

      <!-- Layer 2: Module Sidebar (collapsible) -->
      @if (nav.sidebarExpanded()) {
        <app-module-sidebar />
      } @else {
        <app-sidebar-collapsed-strip />
      }

      <!-- Main column -->
      <div class="main-column flex flex-col flex-1 min-w-0">
        <!-- Top bar -->
        <app-top-bar />

        <!-- Layer 3: Content area (without favorites bar) -->
        <main
          class="content-area flex-1 overflow-auto"
          style="background: var(--color-bg);"
        >
          <router-outlet></router-outlet>
        </main>
      </div>

      <!-- Command Palette (overlay) -->
      @if (nav.cmdOpen()) {
        <app-command-palette />
      }

      <!-- Toast Notifications -->
      <app-toast-container></app-toast-container>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100vh;
      overflow: hidden;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppShellComponent implements OnInit {
  nav = inject(NavigationService);
  themeService = inject(ThemeService);
  private shortcuts = inject(KeyboardShortcutsService);

  ngOnInit() {
    this.themeService.initTheme();
  }
}
