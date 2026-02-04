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
      <div class="ml-20 flex flex-col h-screen overflow-hidden">
        <!-- Sticky Header -->
        <app-header></app-header>

        <!-- Scrollable Content Area (offset for fixed header) -->
        <main class="flex-1 flex flex-col pt-24 px-8 pb-8 bg-slate-50 dark:bg-slate-900 transition-all duration-300 min-h-0">
          <!-- Full-width Content Container -->
          <div class="w-full h-full min-h-0">
            <router-outlet></router-outlet>
          </div>
        </main>
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
