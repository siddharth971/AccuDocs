import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  heroSquares2x2Solid,
  heroUsersSolid,
  heroFolderOpenSolid,
  heroClockSolid,
  heroChatBubbleLeftRightSolid,
  heroCog6ToothSolid,
  heroDocumentTextSolid
} from '@ng-icons/heroicons/solid';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, NgIconComponent],
  template: `
    <aside
      class="fixed z-sidebar inset-y-0 left-0 w-20 flex flex-col border-r transition-colors duration-300"
      style="background: rgba(255,255,255,0.7); backdrop-filter: blur(20px) saturate(180%); border-color: var(--border-color);"
      role="navigation"
      aria-label="Main navigation"
    >
      <!-- Logo -->
      <div class="h-20 flex items-center justify-center" style="padding-top: 0;">
        <div
          class="w-11 h-11 bg-[#0074c9] rounded-[14px] flex items-center justify-center text-white rotate-[4deg] transition-transform duration-500 hover:rotate-0"
          style="box-shadow: 0 8px 24px -4px rgba(0, 116, 201, 0.3);"
        >
          <ng-icon name="heroDocumentTextSolid" size="22" class="-rotate-[4deg]"></ng-icon>
        </div>
      </div>

      <!-- Navigation Icons -->
      <nav class="flex-1 flex flex-col items-center py-4 gap-2 overflow-y-auto">
        @for (link of navLinks; track link.path) {
          @if (!link.adminOnly || isAdmin()) {
            <a
              [routerLink]="link.path"
              routerLinkActive="sidebar-active"
              [routerLinkActiveOptions]="{ exact: link.exact }"
              class="group relative flex items-center justify-center w-12 h-12 rounded-[14px] text-[#94a3b8] hover:text-[#0f172a] dark:hover:text-[#f1f5f9] hover:bg-[#f1f5f9] dark:hover:bg-[#334155] transition-all duration-200"
              [attr.aria-label]="link.label"
            >
              <ng-icon
                [name]="link.icon"
                size="22"
                class="transition-transform duration-200 group-hover:scale-[1.15]"
              ></ng-icon>

              <!-- Active indicator bar -->
              <div
                class="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-[#0074c9] rounded-r-sm opacity-0 transition-opacity duration-200"
                [class.opacity-100]="false"
              ></div>

              <!-- Tooltip -->
              <div
                class="absolute left-full ml-3 px-3 py-1.5 bg-[#0f172a] dark:bg-slate-700 text-white text-xs font-semibold rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none z-50 whitespace-nowrap"
                style="box-shadow: 0 8px 24px -4px rgba(0,0,0,0.2);"
                role="tooltip"
              >
                {{ link.label }}
                <div class="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-[#0f172a] dark:bg-slate-700 rotate-45"></div>
              </div>
            </a>
          }
        }
      </nav>

      <!-- Settings pinned at bottom -->
      <div class="pb-6 flex flex-col items-center">
        <div class="w-8 h-px bg-slate-200 dark:bg-slate-700 mb-4"></div>
        <a
          routerLink="/settings"
          routerLinkActive="sidebar-active"
          class="group relative flex items-center justify-center w-12 h-12 rounded-[14px] text-[#94a3b8] hover:text-[#0f172a] dark:hover:text-[#f1f5f9] hover:bg-[#f1f5f9] dark:hover:bg-[#334155] transition-all duration-200"
          aria-label="Settings"
        >
          <ng-icon
            name="heroCog6ToothSolid"
            size="22"
            class="transition-transform duration-300 group-hover:rotate-90"
          ></ng-icon>

          <!-- Tooltip -->
          <div
            class="absolute left-full ml-3 px-3 py-1.5 bg-[#0f172a] dark:bg-slate-700 text-white text-xs font-semibold rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none z-50 whitespace-nowrap"
            style="box-shadow: 0 8px 24px -4px rgba(0,0,0,0.2);"
            role="tooltip"
          >
            Settings
            <div class="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-[#0f172a] dark:bg-slate-700 rotate-45"></div>
          </div>
        </a>
      </div>
    </aside>
  `,
  styles: [`
    :host {
      display: block;
    }
    .sidebar-active {
      background-color: #eff6ff !important;
      color: #0074c9 !important;
    }
    .sidebar-active::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 3px;
      height: 24px;
      background-color: #0074c9;
      border-radius: 0 3px 3px 0;
    }
    :host-context(.dark) .sidebar-active {
      background-color: rgba(0, 116, 201, 0.15) !important;
      color: #60a5fa !important;
    }
    :host-context(.dark) .sidebar-active::before {
      background-color: #60a5fa;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    provideIcons({
      heroSquares2x2Solid,
      heroUsersSolid,
      heroFolderOpenSolid,
      heroClockSolid,
      heroChatBubbleLeftRightSolid,
      heroCog6ToothSolid,
      heroDocumentTextSolid
    })
  ]
})
export class SidebarComponent {
  private authService = inject(AuthService);

  isAdmin = this.authService.isAdmin;

  navLinks = [
    { label: 'Dashboard', path: '/dashboard', icon: 'heroSquares2x2Solid', exact: true, adminOnly: false },
    { label: 'Documents', path: '/documents', icon: 'heroFolderOpenSolid', exact: false, adminOnly: false },
    { label: 'Clients', path: '/clients', icon: 'heroUsersSolid', exact: false, adminOnly: true },
    { label: 'Activity Logs', path: '/logs', icon: 'heroClockSolid', exact: false, adminOnly: true },
    { label: 'WhatsApp', path: '/whatsapp', icon: 'heroChatBubbleLeftRightSolid', exact: false, adminOnly: true },
  ];
}
