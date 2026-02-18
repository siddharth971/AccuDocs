import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './components/sidebar.component';
import { HeaderComponent } from './components/header.component';
import { ThemeService } from '@core/services/theme.service';
import { ToastContainerComponent } from '@shared/components/toast-container/toast-container.component';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, HeaderComponent, ToastContainerComponent],
  template: `
    <div
      [class.dark]="themeService.isDarkMode()"
      class="min-h-screen font-sans overflow-x-hidden transition-colors duration-300"
      style="background: var(--background-color);"
    >
      <!-- Fixed Icon Sidebar (80px) -->
      <app-sidebar></app-sidebar>

      <!-- Fixed Header (80px, offset from sidebar) -->
      <app-header></app-header>

      <!-- Main Content Wrapper -->
      <div class="flex flex-col min-h-screen" style="margin-left: 80px;">
        <!-- Content Area — offset for fixed header -->
        <main
          id="main-content"
          class="flex-1 transition-all duration-300"
          style="padding-top: calc(80px + 24px); padding-left: 24px; padding-right: 24px; padding-bottom: 24px;"
        >
          <div class="w-full animate-page-enter">
            <router-outlet></router-outlet>
          </div>
        </main>
      </div>

      <!-- Toast Notifications -->
      <app-toast-container></app-toast-container>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    @media (max-width: 1023px) {
      :host main {
        padding-left: 16px !important;
        padding-right: 16px !important;
        padding-top: calc(80px + 16px) !important;
        padding-bottom: 16px !important;
      }
    }
    @media (max-width: 639px) {
      :host main {
        padding-left: 12px !important;
        padding-right: 12px !important;
        padding-top: calc(80px + 12px) !important;
        padding-bottom: 12px !important;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminLayoutComponent {
  themeService = inject(ThemeService);
}
