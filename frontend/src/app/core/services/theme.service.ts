import { Injectable, signal, effect } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private darkModeSignal = signal<boolean>(false);
  readonly isDarkMode = this.darkModeSignal.asReadonly();

  constructor() {
    effect(() => {
      document.body.classList.toggle('dark-theme', this.darkModeSignal());
    });
  }

  initTheme(): void {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      this.darkModeSignal.set(savedTheme === 'dark');
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.darkModeSignal.set(prefersDark);
    }
  }

  toggleTheme(): void {
    const newValue = !this.darkModeSignal();
    this.darkModeSignal.set(newValue);
    localStorage.setItem('theme', newValue ? 'dark' : 'light');
  }

  setTheme(isDark: boolean): void {
    this.darkModeSignal.set(isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }
}
