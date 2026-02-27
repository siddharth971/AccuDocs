import { Injectable, inject, effect } from '@angular/core';
import { NavigationService } from './navigation.service';
import { findModule } from './module-registry';

@Injectable({ providedIn: 'root' })
export class KeyboardShortcutsService {
  private nav = inject(NavigationService);
  private lastGKey: number = 0;

  constructor() {
    this.registerGlobalShortcuts();
  }

  /**
   * Register all global keyboard shortcuts
   */
  private registerGlobalShortcuts(): void {
    document.addEventListener('keydown', (e: KeyboardEvent) => {
      // Cmd/Ctrl + K → Open command palette
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        this.nav.openCommandPalette();
      }

      // Escape → Close command palette or other modals
      if (e.key === 'Escape') {
        if (this.nav.cmdOpen()) {
          this.nav.closeCommandPalette();
        }
      }

      // Vim-style navigation: G + D → Go to Dashboard
      if (e.key === 'g' || e.key === 'G') {
        const now = Date.now();
        // Check if this G was pressed within 500ms of the last one
        if (now - this.lastGKey < 500) {
          this.lastGKey = 0; // Reset
          const nextKey = e.key;

          // Wait for the next key press after G
          const timeout = setTimeout(() => {
            clearTimeout(timeout);
            this.lastGKey = 0;
          }, 500);

          // Listen for additional keys
          const handler = (nextEvent: KeyboardEvent) => {
            document.removeEventListener('keydown', handler);
            clearTimeout(timeout);

            if (nextEvent.key === 'd' || nextEvent.key === 'D') {
              this.nav.navigateTo('dashboard');
              nextEvent.preventDefault();
            } else if (nextEvent.key === 'c' || nextEvent.key === 'C') {
              this.nav.navigateTo('clients_list');
              nextEvent.preventDefault();
            } else if (nextEvent.key === 't' || nextEvent.key === 'T') {
              this.nav.navigateTo('tasks');
              nextEvent.preventDefault();
            } else if (nextEvent.key === 'i' || nextEvent.key === 'I') {
              this.nav.navigateTo('invoices');
              nextEvent.preventDefault();
            } else if (nextEvent.key === 'r' || nextEvent.key === 'R') {
              this.nav.navigateTo('reports');
              nextEvent.preventDefault();
            }
          };

          document.addEventListener('keydown', handler);
        } else {
          this.lastGKey = now;
        }
      }
    });
  }

  /**
   * Helper to navigate to a module by ID
   */
  navigateTo(moduleId: string): void {
    const module = findModule(moduleId);
    if (module) {
      this.nav.navigateTo(moduleId);
    }
  }
}
