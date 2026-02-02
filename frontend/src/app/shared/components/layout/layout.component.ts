import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '@core/services/auth.service';
import { ThemeService } from '@core/services/theme.service';
import { filter } from 'rxjs/operators';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  roles?: string[];
}

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatDividerModule,
  ],
  template: `
    <mat-sidenav-container class="sidenav-container">
      <!-- Mobile backdrop -->
      <mat-sidenav
        #sidenav
        [mode]="isMobile() ? 'over' : 'side'"
        [opened]="!isMobile() && sidenavOpen()"
        (closed)="sidenavOpen.set(false)"
        class="sidenav"
      >
        <div class="sidenav-header">
          <mat-icon class="logo">description</mat-icon>
          <span class="logo-text">AccuDocs</span>
        </div>

        <mat-nav-list>
          @for (item of filteredNavItems(); track item.route) {
            <a
              mat-list-item
              [routerLink]="item.route"
              routerLinkActive="active"
              [routerLinkActiveOptions]="{ exact: item.route === '/dashboard' }"
              (click)="isMobile() && sidenav.close()"
            >
              <mat-icon matListItemIcon>{{ item.icon }}</mat-icon>
              <span matListItemTitle>{{ item.label }}</span>
            </a>
          }
        </mat-nav-list>

        <div class="sidenav-footer">
          <mat-divider></mat-divider>
          <div class="user-info" [matMenuTriggerFor]="userMenu">
            <div class="user-avatar">
              {{ authService.currentUser()?.name?.charAt(0)?.toUpperCase() }}
            </div>
            <div class="user-details">
              <span class="user-name">{{ authService.currentUser()?.name }}</span>
              <span class="user-role">{{ authService.currentUser()?.role | titlecase }}</span>
            </div>
            <mat-icon>expand_more</mat-icon>
          </div>
        </div>

        <mat-menu #userMenu="matMenu">
          <button mat-menu-item (click)="themeService.toggleTheme()">
            <mat-icon>{{ themeService.isDarkMode() ? 'light_mode' : 'dark_mode' }}</mat-icon>
            <span>{{ themeService.isDarkMode() ? 'Light Mode' : 'Dark Mode' }}</span>
          </button>
          <mat-divider></mat-divider>
          <button mat-menu-item (click)="logout()">
            <mat-icon>logout</mat-icon>
            <span>Logout</span>
          </button>
        </mat-menu>
      </mat-sidenav>

      <mat-sidenav-content>
        <!-- Mobile toolbar -->
        <mat-toolbar class="mobile-toolbar" color="primary">
          <button mat-icon-button (click)="sidenav.toggle()">
            <mat-icon>menu</mat-icon>
          </button>
          <span class="toolbar-title">{{ pageTitle() }}</span>
          <span class="spacer"></span>
          <button mat-icon-button [matMenuTriggerFor]="mobileMenu">
            <mat-icon>more_vert</mat-icon>
          </button>
          <mat-menu #mobileMenu="matMenu">
            <button mat-menu-item (click)="themeService.toggleTheme()">
              <mat-icon>{{ themeService.isDarkMode() ? 'light_mode' : 'dark_mode' }}</mat-icon>
              <span>Toggle Theme</span>
            </button>
            <button mat-menu-item (click)="logout()">
              <mat-icon>logout</mat-icon>
              <span>Logout</span>
            </button>
          </mat-menu>
        </mat-toolbar>

        <main class="main-content">
          <ng-content></ng-content>
        </main>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    .sidenav-container {
      height: 100vh;
    }

    .sidenav {
      width: 260px;
      background: var(--surface-color);
      border-right: 1px solid var(--border-color);
    }

    .sidenav-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1.25rem;
      border-bottom: 1px solid var(--border-color);
    }

    .logo {
      font-size: 32px;
      height: 32px;
      width: 32px;
      color: #667eea;
    }

    .logo-text {
      font-size: 1.5rem;
      font-weight: 700;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    mat-nav-list {
      padding-top: 1rem;
    }

    mat-nav-list a {
      margin: 0.25rem 0.5rem;
      border-radius: 8px;
    }

    mat-nav-list a.active {
      background: rgba(102, 126, 234, 0.1);
      color: #667eea;
    }

    mat-nav-list a.active mat-icon {
      color: #667eea;
    }

    .sidenav-footer {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: var(--surface-color);
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem;
      cursor: pointer;
      transition: background 0.2s;
    }

    .user-info:hover {
      background: var(--background-color);
    }

    .user-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 1.1rem;
    }

    .user-details {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .user-name {
      font-weight: 500;
    }

    .user-role {
      font-size: 0.8rem;
      color: var(--text-secondary);
    }

    .mobile-toolbar {
      display: none;
    }

    .toolbar-title {
      font-weight: 500;
    }

    .spacer {
      flex: 1;
    }

    .main-content {
      min-height: 100vh;
      background: var(--background-color);
    }

    @media (max-width: 768px) {
      .mobile-toolbar {
        display: flex;
      }

      .main-content {
        min-height: calc(100vh - 56px);
      }
    }
  `],
})
export class LayoutComponent {
  authService = inject(AuthService);
  themeService = inject(ThemeService);
  private router = inject(Router);

  sidenavOpen = signal(true);
  isMobile = signal(window.innerWidth <= 768);
  pageTitle = signal('Dashboard');

  navItems: NavItem[] = [
    { label: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
    { label: 'Clients', icon: 'people', route: '/clients', roles: ['admin'] },
    { label: 'Documents', icon: 'folder', route: '/documents' },
    { label: 'Activity Logs', icon: 'history', route: '/logs', roles: ['admin'] },
  ];

  constructor() {
    window.addEventListener('resize', () => {
      this.isMobile.set(window.innerWidth <= 768);
    });

    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.updatePageTitle();
      });
  }

  filteredNavItems(): NavItem[] {
    const userRole = this.authService.currentUser()?.role;
    return this.navItems.filter((item) => {
      if (!item.roles) return true;
      return item.roles.includes(userRole || '');
    });
  }

  private updatePageTitle(): void {
    const url = this.router.url;
    const item = this.navItems.find((i) => url.startsWith(i.route));
    this.pageTitle.set(item?.label || 'AccuDocs');
  }

  logout(): void {
    this.authService.logout();
  }
}
