export type ModuleStatus = 'live' | 'beta' | 'soon';

export interface AppModule {
  id: string;
  hub: HubId;
  label: string;
  icon: string;           // emoji
  desc: string;           // one line description
  status: ModuleStatus;
  badge?: number | null;  // notification count
  route: string;          // Angular route path
  pinned?: boolean;       // default pinned
}

export type HubId =
  | 'core' | 'compliance' | 'work'
  | 'clients' | 'firm' | 'settings' | 'billing';

export interface Hub {
  id: HubId;
  label: string;
  icon: string;
  color: string;          // hex accent color for this hub
  desc: string;
}

// ==========================================
// HUB DEFINITIONS
// ==========================================

export const HUBS: Hub[] = [
  { id: 'core', label: 'Home', icon: '⊞', color: '#C9943A', desc: 'Overview & navigation' },
  { id: 'compliance', label: 'Compliance', icon: '⚖️', color: '#3A9E7A', desc: 'Deadlines & filings' },
  { id: 'work', label: 'Work', icon: '✅', color: '#3A7FBF', desc: 'Tasks & productivity' },
  { id: 'clients', label: 'Clients', icon: '👥', color: '#8B5FBF', desc: 'CRM & relationships' },
  { id: 'billing', label: 'Billing & Rev', icon: '💰', color: '#10B981', desc: 'Invoices & collections' },
  { id: 'firm', label: 'Firm Ops', icon: '🏢', color: '#7A8898', desc: 'Staff & operations' },
  { id: 'settings', label: 'Settings', icon: '⚙️', color: '#7A8898', desc: 'Configuration' },
];

// ==========================================
// MODULE REGISTRY
// ==========================================

export const MODULE_REGISTRY: AppModule[] = [

  // ── CORE ──
  { id: 'dashboard', hub: 'core', label: 'Dashboard', icon: '⊞', desc: 'Today\'s office overview', status: 'live', badge: null, route: '/dashboard', pinned: true },
  { id: 'documents_all', hub: 'core', label: 'Documents', icon: '📁', desc: 'Global document vault', status: 'live', badge: null, route: '/documents', pinned: true },

  // ── BILLING ──
  { id: 'billing_invoices', hub: 'billing', label: 'Revenue & Invoices', icon: '🧾', desc: 'CA Invoicing & prediction', status: 'live', badge: 12, route: '/billing/invoices', pinned: true },

  // ── COMPLIANCE ──
  { id: 'calendar', hub: 'compliance', label: 'Compliance Calendar', icon: '📅', desc: 'All filing deadlines', status: 'live', badge: 3, route: '/compliance/calendar', pinned: true },
  { id: 'checklists', hub: 'compliance', label: 'Doc Checklists', icon: '📋', desc: 'Pending documents tracker', status: 'live', badge: 23, route: '/compliance/checklists', pinned: true },

  // ── WORK ──
  { id: 'tasks', hub: 'work', label: 'Task Board', icon: '✅', desc: 'Kanban & work tracker', status: 'live', badge: 8, route: '/work/tasks', pinned: true },

  // ── CLIENTS ──
  { id: 'clients_user_client', hub: 'clients', label: 'Client', icon: '👤', desc: 'Client management & interactions', status: 'live', badge: null, route: '/clients/client', pinned: true },
  { id: 'clients_user_staff', hub: 'clients', label: 'Staff', icon: '👥', desc: 'Staff management & assignments', status: 'live', badge: null, route: '/clients/staff', pinned: true },

  // ── FIRM OPS ──
  { id: 'staff', hub: 'firm', label: 'Staff Management', icon: '👔', desc: 'HR, roles & staff profiles', status: 'live', badge: null, route: '/firm/staff', pinned: true },

  // ── SETTINGS ──
  { id: 'whatsapp_setup', hub: 'settings', label: 'WhatsApp Setup', icon: '💬', desc: 'Connect WhatsApp account', status: 'live', badge: null, route: '/settings/whatsapp', pinned: true },
];


// ==========================================
// UTILITY FUNCTIONS
// ==========================================

/**
 * Get all modules for a specific hub
 */
export function getHubModules(hubId: HubId): AppModule[] {
  return MODULE_REGISTRY.filter(m => m.hub === hubId);
}

/**
 * Get the total badge count for a hub
 */
export function getHubBadgeCount(hubId: HubId): number {
  return getHubModules(hubId).reduce((sum, m) => sum + (m.badge || 0), 0);
}

/**
 * Get all default pinned modules
 */
export function getDefaultPins(): AppModule[] {
  return MODULE_REGISTRY.filter(m => m.pinned === true);
}

/**
 * Find a module by ID
 */
export function findModule(id: string): AppModule | undefined {
  return MODULE_REGISTRY.find(m => m.id === id);
}

/**
 * Search modules by query string
 * Searches: label, description, hub label, status
 */
export function searchModules(query: string): AppModule[] {
  const q = query.toLowerCase();
  return MODULE_REGISTRY.filter(m => {
    const hub = HUBS.find(h => h.id === m.hub);
    return (
      m.label.toLowerCase().includes(q) ||
      m.desc.toLowerCase().includes(q) ||
      hub?.label.toLowerCase().includes(q) ||
      m.status.includes(q)
    );
  });
}

/**
 * Get a hub by ID
 */
export function findHub(hubId: HubId): Hub | undefined {
  return HUBS.find(h => h.id === hubId);
}

/**
 * Get module count by status for a hub
 */
export function getHubStatusCounts(hubId: HubId): { live: number; beta: number; soon: number } {
  const modules = getHubModules(hubId);
  return {
    live: modules.filter(m => m.status === 'live').length,
    beta: modules.filter(m => m.status === 'beta').length,
    soon: modules.filter(m => m.status === 'soon').length,
  };
}

/**
 * Group modules by status
 */
export function groupModulesByStatus(modules: AppModule[]): {
  live: AppModule[];
  beta: AppModule[];
  soon: AppModule[];
} {
  return {
    live: modules.filter(m => m.status === 'live'),
    beta: modules.filter(m => m.status === 'beta'),
    soon: modules.filter(m => m.status === 'soon'),
  };
}