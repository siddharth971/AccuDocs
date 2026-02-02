import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ThemeService } from './core/services/theme.service';
import { LoadingService } from './core/services/loading.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, MatProgressSpinnerModule],
  template: `
    <div [class.dark-theme]="themeService.isDarkMode()">
      <!-- Global loading overlay -->
      @if (loadingService.isLoading()) {
        <div class="loading-overlay">
          <mat-spinner diameter="50"></mat-spinner>
        </div>
      }
      
      <!-- Main content -->
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
    }
  `],
})
export class AppComponent implements OnInit {
  themeService = inject(ThemeService);
  loadingService = inject(LoadingService);

  ngOnInit(): void {
    this.themeService.initTheme();
  }
}
