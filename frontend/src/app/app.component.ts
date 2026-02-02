import { Component, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from './core/services/theme.service';
import { LoadingService } from './core/services/loading.service';
import { LoaderComponent } from '@ui/atoms/loader.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, LoaderComponent],
  template: `
    <div [class.dark]="themeService.isDarkMode()" class="min-h-screen bg-background-color transition-colors duration-300">
      <!-- Global loading overlay -->
      @if (loadingService.isLoading()) {
        <div class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/10 backdrop-blur-[2px] animate-in fade-in duration-200">
          <app-loader size="lg" label="Processing your request..."></app-loader>
        </div>
      }
      
      <!-- Main content -->
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit {
  themeService = inject(ThemeService);
  loadingService = inject(LoadingService);

  ngOnInit(): void {
    this.themeService.initTheme();
  }
}

