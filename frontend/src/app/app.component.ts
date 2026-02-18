import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from '@core/services/theme.service';
import { LoadingService } from '@core/services/loading.service';
import { CommonModule } from '@angular/common';
import { LoaderComponent } from '@shared/ui/atoms/loader.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, LoaderComponent],
  template: `
    <div
      [class.dark]="themeService.isDarkMode()"
      class="min-h-screen font-sans overflow-x-hidden transition-colors duration-300"
      style="background: var(--background-color);"
    >
      <!-- Global loading overlay -->
      @if (loadingService.isLoading()) {
        <div
          class="fixed inset-0 flex items-center justify-center animate-fade-in"
          style="z-index: 9999; background: rgba(0, 0, 0, 0.08); backdrop-filter: blur(3px);"
        >
          <app-loader size="lg" label="Processing your request..."></app-loader>
        </div>
      }

      <!-- Main content -->
      <router-outlet></router-outlet>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  themeService = inject(ThemeService);
  loadingService = inject(LoadingService);

  constructor() {
    this.themeService.initTheme();
  }
}
