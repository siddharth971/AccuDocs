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
      // Default strictly to light mode always
      this.darkModeSignal.set(false);
      localStorage.setItem('theme', 'light');
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
