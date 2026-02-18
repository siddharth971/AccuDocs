import { Component, inject, signal, ChangeDetectionStrategy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '@core/services/auth.service';
import { ThemeService } from '@core/services/theme.service';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  heroMagnifyingGlassSolid,
  heroBellSolid,
  heroMoonSolid,
  heroSunSolid,
  heroChevronDownSolid,
  heroArrowLeftStartOnRectangleSolid,
  heroUserCircleSolid
} from '@ng-icons/heroicons/solid';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, NgIconComponent],
  template: `
    <header
      class="fixed top-0 right-0 h-20 flex items-center justify-between px-10 z-header transition-all duration-300"
      style="left: 80px; background: rgba(255,255,255,0.7); backdrop-filter: blur(20px) saturate(180%); border-bottom: 1px solid var(--border-color);"
    >

      <!-- Search Bar -->
      <div class="flex-1 max-w-[400px] hidden md:block">
        <div class="relative group">
          <div
            class="relative flex items-center h-[42px] rounded-full transition-all duration-200"
            [ngClass]="searchFocused ? 'bg-white ring-2' : ''"
            [style.background]="searchFocused ? '#ffffff' : '#f1f5f9'"
            [style.border]="searchFocused ? '1px solid #0074c9' : '1px solid transparent'"
            [style.box-shadow]="searchFocused ? '0 0 0 3px rgba(0, 116, 201, 0.12)' : 'none'"
          >
            <!-- Icon -->
            <div class="pl-[14px] flex items-center">
              <ng-icon
                name="heroMagnifyingGlassSolid"
                size="18"
                class="transition-colors duration-200"
                [style.color]="searchFocused ? '#0074c9' : '#94a3b8'"
              ></ng-icon>
            </div>

            <!-- Input -->
            <input
              type="text"
              placeholder="Search anything..."
              class="flex-1 h-full pl-3 pr-4 border-none bg-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none text-sm font-medium"
              (focus)="searchFocused = true"
              (blur)="searchFocused = false"
              id="global-search-input"
            >

            <!-- Keyboard shortcut badge -->
            <div
              class="pr-3 flex items-center gap-1 transition-opacity duration-200"
              [style.opacity]="searchFocused ? '0' : '1'"
            >
              <kbd class="hidden sm:inline-flex items-center text-[11px] font-semibold text-slate-500 rounded-md border border-slate-300/50"
                style="background: #e2e8f0; font-family: var(--font-mono); padding: 2px 6px;"
              >
                Ctrl
              </kbd>
              <kbd class="hidden sm:inline-flex items-center text-[11px] font-semibold text-slate-500 rounded-md border border-slate-300/50"
                style="background: #e2e8f0; font-family: var(--font-mono); padding: 2px 6px;"
              >
                K
              </kbd>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Actions -->
      <div class="flex items-center gap-2 ml-auto">

        <!-- Notification Bell -->
        <button
          class="relative w-10 h-10 flex items-center justify-center rounded-xl text-[#64748b] hover:bg-[#f1f5f9] dark:hover:bg-[#334155] hover:text-[#0f172a] dark:hover:text-[#f1f5f9] transition-all duration-200"
          aria-label="Notifications"
        >
          <ng-icon name="heroBellSolid" size="20"></ng-icon>
          <!-- Notification dot -->
          <span
            class="absolute top-[7px] right-[7px] w-2 h-2 bg-[#dc2626] rounded-full animate-notification-pulse"
            style="box-shadow: 0 0 0 2px white;"
          ></span>
        </button>

        <!-- Theme Toggle -->
        <button
          (click)="themeService.toggleTheme()"
          class="w-10 h-10 flex items-center justify-center rounded-xl text-[#64748b] hover:bg-[#f1f5f9] dark:hover:bg-[#334155] hover:text-[#0f172a] dark:hover:text-[#f1f5f9] transition-all duration-200"
          [title]="themeService.isDarkMode() ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
          aria-label="Toggle theme"
        >
          <ng-icon
            [name]="themeService.isDarkMode() ? 'heroSunSolid' : 'heroMoonSolid'"
            size="20"
            class="transition-transform duration-200"
          ></ng-icon>
        </button>

        <!-- Divider -->
        <div class="h-8 w-px mx-2" style="background: var(--border-color);"></div>

        <!-- Profile Dropdown -->
        <div class="relative">
          <button
            (click)="userMenuOpen.set(!userMenuOpen())"
            class="w-12 h-12 rounded-[14px] flex items-center justify-center text-white font-extrabold text-base transition-all duration-200 hover:ring-[3px] hover:ring-[rgba(0,116,201,0.2)]"
            style="background: linear-gradient(135deg, #0074c9 0%, #005fa3 100%);"
            aria-haspopup="true"
            [attr.aria-expanded]="userMenuOpen()"
          >
            {{ authService.currentUser()?.name?.charAt(0) }}
          </button>

          <!-- Dropdown Panel -->
          @if (userMenuOpen()) {
            <div
              class="absolute top-full right-0 mt-2 w-60 rounded-[20px] border overflow-hidden z-50"
              style="background: var(--surface-color); border-color: var(--border-color); box-shadow: 0 20px 40px -8px rgba(0,0,0,0.15);"
              role="menu"
            >
              <!-- User Info Header -->
              <div class="p-3 border-b" style="border-color: var(--border-color);">
                <div class="flex items-center gap-3 px-1">
                  <div
                    class="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0"
                    style="background: linear-gradient(135deg, #0074c9 0%, #005fa3 100%);"
                  >
                    {{ authService.currentUser()?.name?.charAt(0) }}
                  </div>
                  <div class="min-w-0">
                    <p class="text-sm font-bold text-slate-900 dark:text-white truncate leading-tight">
                      {{ authService.currentUser()?.name }}
                    </p>
                    <p class="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mt-0.5">
                      {{ authService.currentUser()?.role }}
                    </p>
                  </div>
                </div>
              </div>

              <!-- Menu Items -->
              <div class="p-2 space-y-1">
                <!-- Profile -->
                <button
                  class="w-full flex items-center gap-3 px-3 py-2.5 rounded-[14px] text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                  role="menuitem"
                >
                  <div class="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                    <ng-icon name="heroUserCircleSolid" size="18" class="text-slate-500 dark:text-slate-400"></ng-icon>
                  </div>
                  Profile Settings
                </button>

                <!-- Theme toggle -->
                <button
                  (click)="themeService.toggleTheme()"
                  class="w-full flex items-center gap-3 px-3 py-2.5 rounded-[14px] text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                  role="menuitem"
                >
                  <div class="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                    <ng-icon
                      [name]="themeService.isDarkMode() ? 'heroSunSolid' : 'heroMoonSolid'"
                      size="18"
                      class="text-slate-500 dark:text-slate-400"
                    ></ng-icon>
                  </div>
                  {{ themeService.isDarkMode() ? 'Light Mode' : 'Dark Mode' }}
                </button>

                <!-- Logout -->
                <button
                  (click)="authService.logout()"
                  class="w-full flex items-center gap-3 px-3 py-2.5 rounded-[14px] text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  role="menuitem"
                >
                  <div class="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                    <ng-icon name="heroArrowLeftStartOnRectangleSolid" size="18" class="text-red-500"></ng-icon>
                  </div>
                  Logout
                </button>
              </div>
            </div>
          }

          <!-- Backdrop for dropdown -->
          @if (userMenuOpen()) {
            <div (click)="userMenuOpen.set(false)" class="fixed inset-0 z-40"></div>
          }
        </div>
      </div>
    </header>
  `,
  styles: [`
    :host {
      display: block;
    }
    :host-context(.dark) header {
      background: rgba(15, 23, 42, 0.7) !important;
    }
    :host-context(.dark) .search-bar {
      background: #1e293b !important;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    provideIcons({
      heroMagnifyingGlassSolid,
      heroBellSolid,
      heroMoonSolid,
      heroSunSolid,
      heroChevronDownSolid,
      heroArrowLeftStartOnRectangleSolid,
      heroUserCircleSolid
    })
  ]
})
export class HeaderComponent {
  authService = inject(AuthService);
  themeService = inject(ThemeService);
  userMenuOpen = signal(false);
  searchFocused = false;

  @HostListener('window:keydown', ['$event'])
  onKeydown(event: KeyboardEvent) {
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
      event.preventDefault();
      const searchInput = document.getElementById('global-search-input') as HTMLInputElement;
      searchInput?.focus();
    }
  }
}
