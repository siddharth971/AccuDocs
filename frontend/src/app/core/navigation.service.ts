import { Injectable, inject, signal, effect, computed } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import {
  MODULE_REGISTRY,
  HUBS,
  HubId,
  AppModule,
  findModule,
  getDefaultPins,
  getHubModules,
} from './module-registry';

@Injectable({ providedIn: 'root' })
export class NavigationService {
  private router = inject(Router);

  // Signals for navigation state
  activeHub = signal<HubId>('core');
  activeModule = signal<string | null>('dashboard');
  pins = signal<string[]>([]);
  sidebarExpanded = signal<boolean>(true);
  cmdOpen = signal<boolean>(false);

  // Computed signals
  activeModuleData = computed(() => {
    const id = this.activeModule();
    return id ? findModule(id) : null;
  });

  activeHubData = computed(() => {
    return HUBS.find(h => h.id === this.activeHub());
  });

  pinnedModules = computed(() => {
    return this.pins()
      .map(id => findModule(id))
      .filter((m): m is AppModule => m !== undefined);
  });

  constructor() {
    this.initializeNavigation();
  }

  /**
   * Initialize navigation service on startup
   */
  private initializeNavigation(): void {
    // Load pins from localStorage
    this.loadPins();

    // Sync navigation when route changes
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.syncRouteToState(event.urlAfterRedirects);
      });

    // Auto-save pins to localStorage when they change
    effect(() => {
      this.savePins();
    });
  }

  /**
   * Navigate to a module
   */
  navigateTo(moduleId: string): void {
    const module = findModule(moduleId);
    if (!module) return;

    this.activeModule.set(moduleId);
    this.activeHub.set(module.hub);

    // Only navigate if module is live or beta
    if (module.status !== 'soon') {
      this.router.navigate([module.route]);
    } else {
      // For 'soon' modules, navigate to coming-soon page with module ID
      this.router.navigate(['/coming-soon'], { queryParams: { module: moduleId } });
    }
  }

  /**
   * Set active hub and navigate to its first module
   */
  setActiveHub(hubId: HubId): void {
    this.activeHub.set(hubId);

    const hubModules = getHubModules(hubId);
    if (hubModules.length > 0) {
      const firstModule = hubModules[0];
      this.activeModule.set(firstModule.id);

      if (firstModule.status !== 'soon') {
        this.router.navigate([firstModule.route]);
      } else {
        this.router.navigate(['/coming-soon'], { queryParams: { module: firstModule.id } });
      }
    } else {
      this.activeModule.set(null);
      this.router.navigate([`/hub/${hubId}`]);
    }
  }

  /**
   * Toggle pin state for a module
   */
  togglePin(moduleId: string): void {
    const currentPins = this.pins();
    if (currentPins.includes(moduleId)) {
      this.pins.set(currentPins.filter(id => id !== moduleId));
    } else {
      // Max 12 pins
      if (currentPins.length < 12) {
        this.pins.set([...currentPins, moduleId]);
      }
    }
  }

  /**
   * Check if a module is pinned
   */
  isPinned(moduleId: string): boolean {
    return this.pins().includes(moduleId);
  }

  /**
   * Toggle sidebar expanded/collapsed state
   */
  toggleSidebar(): void {
    this.sidebarExpanded.update(v => !v);
  }

  /**
   * Open command palette
   */
  openCommandPalette(): void {
    this.cmdOpen.set(true);
  }

  /**
   * Close command palette
   */
  closeCommandPalette(): void {
    this.cmdOpen.set(false);
  }

  /**
   * Load pins from localStorage
   */
  loadPins(): void {
    try {
      const stored = localStorage.getItem('accudocs_pins');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          // Validate that all stored pins are still valid modules
          const validPins = parsed.filter(id => findModule(id) !== undefined);
          this.pins.set(validPins);
          return;
        }
      }
      // If no stored pins or invalid, use default pins
      this.pins.set(getDefaultPins().map(m => m.id));
    } catch (e) {
      // Fallback to default pins on error
      this.pins.set(getDefaultPins().map(m => m.id));
    }
  }

  /**
   * Save pins to localStorage
   */
  savePins(): void {
    try {
      localStorage.setItem('accudocs_pins', JSON.stringify(this.pins()));
    } catch (e) {
      console.warn('Failed to save pins to localStorage', e);
    }
  }

  /**
   * Sync router state with navigation signals
   * Called when user navigates via URL, back button, etc.
   */
  private syncRouteToState(url: string): void {
    // Check if URL matches a module route
    const module = MODULE_REGISTRY.find(m => url.startsWith(m.route));
    if (module) {
      this.activeModule.set(module.id);
      this.activeHub.set(module.hub);
    } else {
      // Check if it's a hub overview route
      const hubMatch = url.match(/^\/hub\/([a-z-]+)$/);
      if (hubMatch) {
        const hubId = hubMatch[1] as HubId;
        if (HUBS.find(h => h.id === hubId)) {
          this.activeHub.set(hubId);
          this.activeModule.set(null);
        }
      }
    }
  }

  /**
   * Get default (initial) view based on current hub
   */
  getDefaultModuleForHub(hubId: HubId): string | null {
    const hubModules = getHubModules(hubId);
    return hubModules.length > 0 ? hubModules[0].id : null;
  }
}
