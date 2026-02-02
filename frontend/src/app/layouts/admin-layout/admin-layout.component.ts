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
      class="min-h-screen bg-background font-sans overflow-x-hidden transition-colors duration-300"
    >
      <!-- Fixed Icon Sidebar -->
      <app-sidebar></app-sidebar>

      <!-- Main Content Wrapper (offset for sidebar) -->
      <div class="ml-20 flex flex-col min-h-screen">
        <!-- Sticky Header -->
        <app-header></app-header>

        <!-- Scrollable Content Area (offset for fixed header) -->
        <main class="flex-1 pt-24 px-6 pb-6 overflow-x-hidden bg-slate-50 dark:bg-slate-900">
          <!-- Full-width Content Container -->
          <div class="w-full animate-fade-in">
            <router-outlet></router-outlet>
          </div>
        </main>

        <!-- Footer -->
        <footer class="shrink-0 px-6 py-4 border-t border-border-subtle bg-white dark:bg-slate-800">
          <div class="flex items-center justify-between text-sm text-text-muted">
            <span>© 2026 AccuDocs. All rights reserved.</span>
            <span>Version 1.0.0</span>
          </div>
        </footer>
      </div>

      <!-- Toast Notifications -->
      <app-toast-container></app-toast-container>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminLayoutComponent {
  themeService = inject(ThemeService);
}
