import { Component, inject, input, output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  heroQueueListSolid,
  heroUsersSolid,
  heroFolderSolid,
  heroClockSolid,
  heroHomeSolid,
  heroCog6ToothSolid
} from '@ng-icons/heroicons/solid';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, NgIconComponent],
  template: `
    <aside class="fixed z-sidebar inset-y-0 left-0 w-20 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border-r border-slate-200/50 dark:border-slate-800/50 flex flex-col">
      <!-- Logo Section -->
      <div class="h-20 flex items-center justify-center border-b border-slate-100 dark:border-slate-800">
        <div class="w-11 h-11 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
           <ng-icon name="heroQueueListSolid" size="24"></ng-icon>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 overflow-y-auto py-6 px-3 space-y-2">
        @for (link of navLinks; track link.path) {
          @if (!link.adminOnly || isAdmin()) {
            <a 
              [routerLink]="link.path"
              routerLinkActive="bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 shadow-sm"
              [routerLinkActiveOptions]="{ exact: link.exact }"
              class="group relative flex items-center justify-center w-full h-12 rounded-xl text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200 transition-all duration-200"
              [title]="link.label"
            >
              <ng-icon [name]="link.icon" size="22" class="transition-transform group-hover:scale-110 duration-200"></ng-icon>
              
              <!-- Tooltip -->
              <div class="absolute left-full ml-3 px-3 py-1.5 bg-slate-900 dark:bg-slate-700 text-white text-xs font-bold rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none z-50 whitespace-nowrap shadow-xl">
                {{ link.label }}
                <div class="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-slate-900 dark:bg-slate-700 rotate-45"></div>
              </div>
            </a>
          }
        }
      </nav>

      <!-- Settings at bottom -->
      <div class="p-3 border-t border-slate-100 dark:border-slate-800">
        <a 
          routerLink="/settings"
          routerLinkActive="bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
          class="group relative flex items-center justify-center w-full h-12 rounded-xl text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200 transition-all duration-200"
          title="Settings"
        >
          <ng-icon name="heroCog6ToothSolid" size="22" class="transition-transform group-hover:rotate-90 duration-300"></ng-icon>
          
          <!-- Tooltip -->
          <div class="absolute left-full ml-3 px-3 py-1.5 bg-slate-900 dark:bg-slate-700 text-white text-xs font-bold rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none z-50 whitespace-nowrap shadow-xl">
            Settings
            <div class="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-slate-900 dark:bg-slate-700 rotate-45"></div>
          </div>
        </a>
      </div>
    </aside>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    provideIcons({
      heroQueueListSolid,
      heroUsersSolid,
      heroFolderSolid,
      heroClockSolid,
      heroHomeSolid,
      heroCog6ToothSolid
    })
  ]
})
export class SidebarComponent {
  private authService = inject(AuthService);

  isAdmin = this.authService.isAdmin;

  navLinks = [
    { label: 'Dashboard', path: '/dashboard', icon: 'heroHomeSolid', exact: true, adminOnly: false },
    { label: 'Documents', path: '/documents', icon: 'heroFolderSolid', exact: false, adminOnly: false },
    { label: 'Clients', path: '/clients', icon: 'heroUsersSolid', exact: false, adminOnly: true },
    { label: 'Activity Logs', path: '/logs', icon: 'heroClockSolid', exact: false, adminOnly: true },
  ];
}
