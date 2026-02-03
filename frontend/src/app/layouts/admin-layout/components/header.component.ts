import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
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
    <header class="fixed top-0 right-0 left-20 h-20 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between px-6 z-header transition-all duration-300">
      
      <!-- Search Bar -->
      <div class="flex-1 max-w-xl hidden md:block">
        <div class="relative group">
          <!-- Gradient border effect on focus -->
          <div class="absolute -inset-0.5 bg-gradient-to-r from-primary-500 to-indigo-500 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity blur-sm"></div>
          <div class="relative bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center group-focus-within:bg-white dark:group-focus-within:bg-slate-900 transition-all shadow-sm group-focus-within:shadow-lg group-focus-within:ring-2 group-focus-within:ring-primary-500/20">
            <div class="pl-4 pr-3 flex items-center">
              <ng-icon name="heroMagnifyingGlassSolid" class="text-slate-400 group-focus-within:text-primary-500 transition-colors" size="18"></ng-icon>
            </div>
            <input 
              type="text" 
              placeholder="Search anything..." 
              class="flex-1 py-3 pr-4 border-none bg-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none text-sm font-medium"
            >
            <div class="pr-4 flex items-center gap-1">
              <kbd class="hidden sm:inline-flex items-center px-2 py-1 text-xs font-semibold text-slate-500 bg-slate-200/70 dark:bg-slate-700 dark:text-slate-400 rounded-md border border-slate-300/50 dark:border-slate-600">
                Ctrl
              </kbd>
              <kbd class="hidden sm:inline-flex items-center px-2 py-1 text-xs font-semibold text-slate-500 bg-slate-200/70 dark:bg-slate-700 dark:text-slate-400 rounded-md border border-slate-300/50 dark:border-slate-600">
                K
              </kbd>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Actions -->
      <div class="flex items-center gap-4 ml-auto">
        
        <!-- Theme Toggle -->
        <button 
          (click)="themeService.toggleTheme()" 
          class="p-2.5 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-600 transition-colors relative group"
          [title]="themeService.isDarkMode() ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
        >
          <ng-icon [name]="themeService.isDarkMode() ? 'heroSunSolid' : 'heroMoonSolid'" size="20"></ng-icon>
        </button>

        <!-- Notifications -->
        <button class="p-2.5 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-600 transition-colors relative">
          <ng-icon name="heroBellSolid" size="20"></ng-icon>
          <!-- Badge -->
          <span class="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 border-2 border-white dark:border-slate-900 rounded-full"></span>
        </button>

        <div class="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-2"></div>

        <!-- User Profile -->
        <div class="relative">
          <button 
            (click)="userMenuOpen.set(!userMenuOpen())"
            class="flex items-center gap-3 pl-1 pr-2 py-1 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all"
          >
             <div class="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">
               {{ authService.currentUser()?.name?.charAt(0) }}
             </div>
             <div class="hidden md:block text-left">
               <p class="text-sm font-bold text-slate-700 dark:text-slate-200 leading-none">{{ authService.currentUser()?.name }}</p>
               <p class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">{{ authService.currentUser()?.role }}</p>
             </div>
             <ng-icon name="heroChevronDownSolid" size="14" class="text-slate-400"></ng-icon>
          </button>

          <!-- Dropdown -->
          @if (userMenuOpen()) {
            <div class="absolute top-full right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 border border-slate-100 dark:border-slate-700 overflow-hidden animate-in fade-in slide-in-from-top-2 origin-top-right z-50">
               <div class="p-3 border-b border-slate-100 dark:border-slate-700">
                 <p class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Signed in as</p>
                 <p class="text-sm font-bold text-slate-900 dark:text-white truncate">{{ authService.currentUser()?.mobile }}</p>
               </div>
               <div class="p-2 space-y-1">
                 <button class="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-blue-600 transition-colors">
                   <ng-icon name="heroUserCircleSolid" size="18"></ng-icon>
                   Profile Settings
                 </button>
                 <button 
                   (click)="authService.logout()" 
                   class="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                 >
                   <ng-icon name="heroArrowLeftStartOnRectangleSolid" size="18"></ng-icon>
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
}
