import { Component, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { ThemeService } from '@core/services/theme.service';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  heroChevronDownSolid,
  heroQueueListSolid,
  heroUsersSolid,
  heroFolderSolid,
  heroClockSolid,
  heroArrowLeftStartOnRectangleSolid,
  heroBars3Solid,
  heroXMarkSolid,
  heroMoonSolid,
  heroSunSolid
} from '@ng-icons/heroicons/solid';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, NgIconComponent],
  providers: [
    provideIcons({
      heroChevronDownSolid,
      heroQueueListSolid,
      heroUsersSolid,
      heroFolderSolid,
      heroClockSolid,
      heroArrowLeftStartOnRectangleSolid,
      heroBars3Solid,
      heroXMarkSolid,
      heroMoonSolid,
      heroSunSolid
    })
  ],
  template: `
    <div [class.dark]="themeService.isDarkMode()" class="min-h-screen bg-slate-50 transition-colors duration-300">
      <!-- Sidebar -->
      <aside 
        [class.translate-x-0]="sidebarOpen()"
        [class.-translate-x-full]="!sidebarOpen()"
        class="fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0"
      >
        <div class="h-full flex flex-col">
          <!-- Logo -->
          <div class="flex items-center gap-3 px-8 py-10">
            <div class="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-100 rotate-2">
              <ng-icon name="heroQueueListSolid" size="28"></ng-icon>
            </div>
            <div class="flex flex-col">
              <span class="text-2xl font-black text-slate-900 leading-none">AccuDocs</span>
              <span class="text-[10px] font-bold text-blue-600 uppercase tracking-tighter mt-1">Professional Edition</span>
            </div>
          </div>

          <!-- Nav Links -->
          <nav class="flex-1 px-4 space-y-1.5 overflow-y-auto">
            @for (item of navItems(); track item.route) {
              <a
                [routerLink]="item.route"
                routerLinkActive="bg-blue-50 text-blue-700 shadow-sm !border-blue-100"
                [routerLinkActiveOptions]="{ exact: item.route === '/dashboard' }"
                class="flex items-center gap-3 px-6 py-4 rounded-2xl text-slate-500 border border-transparent hover:bg-slate-50 hover:text-slate-900 transition-all group font-bold text-sm"
              >
                <ng-icon [name]="item.icon" size="20" class="group-hover:scale-110 transition-transform"></ng-icon>
                <span>{{ item.label }}</span>
              </a>
            }
          </nav>

          <!-- User Profile -->
          <div class="p-6 border-t border-slate-100 bg-slate-50/50">
            <div class="relative">
              <button 
                (click)="userMenuOpen.set(!userMenuOpen())"
                class="w-full flex items-center gap-3 p-3 rounded-2xl bg-white border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all group shadow-sm"
              >
                <div class="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center font-black text-lg">
                  {{ authService.currentUser()?.name?.charAt(0) }}
                </div>
                <div class="flex-1 text-left">
                  <p class="text-sm font-bold text-slate-900 truncate leading-tight">{{ authService.currentUser()?.name }}</p>
                  <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{{ authService.currentUser()?.role }}</p>
                </div>
                <ng-icon name="heroChevronDownSolid" size="14" class="text-slate-400 group-hover:text-blue-600 transition-colors" [class.rotate-180]="userMenuOpen()"></ng-icon>
              </button>

              <!-- Dropdown Menu -->
              @if (userMenuOpen()) {
                <div class="absolute bottom-full left-0 w-full mb-3 bg-white border border-slate-200 rounded-[2rem] shadow-2xl shadow-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 z-[60]">
                  <div class="p-2 space-y-1">
                    <button (click)="themeService.toggleTheme()" class="w-full flex items-center gap-3 px-4 py-4 text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-2xl transition-all">
                      <div class="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                        <ng-icon [name]="themeService.isDarkMode() ? 'heroSunSolid' : 'heroMoonSolid'" size="18"></ng-icon>
                      </div>
                      {{ themeService.isDarkMode() ? 'Light Mode' : 'Dark Mode' }}
                    </button>
                    <button (click)="logout()" class="w-full flex items-center gap-3 px-4 py-4 text-sm font-bold text-red-600 hover:bg-red-50 rounded-2xl transition-all">
                      <div class="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                        <ng-icon name="heroArrowLeftStartOnRectangleSolid" size="18"></ng-icon>
                      </div>
                      Logout Account
                    </button>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>
      </aside>

      <!-- Main Content Area -->
      <div class="flex-1 flex flex-col min-h-screen">
        <!-- Mobile Header -->
        <header class="lg:hidden flex items-center justify-between px-6 py-5 bg-white border-b border-slate-200">
          <button (click)="sidebarOpen.set(true)" class="p-3 bg-slate-50 rounded-2xl text-slate-600 active:scale-90 transition-transform">
            <ng-icon name="heroBars3Solid" size="24"></ng-icon>
          </button>
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
              <ng-icon name="heroQueueListSolid" size="18"></ng-icon>
            </div>
            <span class="font-black text-slate-900 tracking-tight">AccuDocs</span>
          </div>
          <div class="w-12"></div> <!-- Spacer -->
        </header>

        <!-- Page Content Wrap -->
        <main class="flex-1 p-6 lg:p-12 max-w-[1600px] mx-auto w-full">
          <div class="animate-in fade-in duration-700">
            <router-outlet></router-outlet>
          </div>
        </main>
      </div>

      <!-- Mobile Sidebar Backdrop -->
      @if (sidebarOpen()) {
        <div 
          (click)="sidebarOpen.set(false)"
          class="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-md lg:hidden animate-in fade-in"
        ></div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainLayoutComponent {
  authService = inject(AuthService);
  themeService = inject(ThemeService);

  sidebarOpen = signal(false);
  userMenuOpen = signal(false);

  navItems = computed(() => {
    const role = this.authService.currentUser()?.role;
    const items = [
      { label: 'Dashboard', route: '/dashboard', icon: 'heroQueueListSolid' },
      { label: 'Documents', route: '/documents', icon: 'heroFolderSolid' },
    ];

    if (role === 'admin') {
      items.push(
        { label: 'Clients', route: '/clients', icon: 'heroUsersSolid' },
        { label: 'Activity Logs', route: '/logs', icon: 'heroClockSolid' }
      );
    }

    return items;
  });

  logout() {
    this.authService.logout();
  }
}
