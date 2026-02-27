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
  | 'core' | 'compliance' | 'work' | 'billing'
  | 'clients' | 'analytics' | 'specialist'
  | 'firm' | 'settings';

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
  { id: 'core',        label: 'Home',         icon: '⊞',  color: '#C9943A', desc: 'Overview & navigation' },
  { id: 'compliance',  label: 'Compliance',   icon: '⚖️',  color: '#3A9E7A', desc: 'Deadlines & filings' },
  { id: 'work',        label: 'Work',         icon: '✅',  color: '#3A7FBF', desc: 'Tasks & productivity' },
  { id: 'billing',     label: 'Billing',      icon: '🧾',  color: '#C87C2A', desc: 'Invoices & payments' },
  { id: 'clients',     label: 'Clients',      icon: '👥',  color: '#8B5FBF', desc: 'CRM & relationships' },
  { id: 'analytics',   label: 'Analytics',    icon: '📊',  color: '#2A8F8A', desc: 'Reports & insights' },
  { id: 'specialist',  label: 'Specialist',   icon: '🎯',  color: '#C84B7A', desc: 'NRI, Payroll & CS' },
  { id: 'firm',        label: 'Firm Ops',     icon: '🏢',  color: '#7A8898', desc: 'Staff & operations' },
  { id: 'settings',    label: 'Settings',     icon: '⚙️',  color: '#7A8898', desc: 'Configuration' },
];

// ==========================================
// MODULE REGISTRY
// ==========================================

export const MODULE_REGISTRY: AppModule[] = [

  // ── CORE ──
  { id: 'dashboard',       hub: 'core',       label: 'Dashboard',            icon: '⊞',  desc: 'Today\'s office overview',        status: 'live',  badge: null,  route: '/dashboard',       pinned: true },
  { id: 'clients_list',    hub: 'core',       label: 'All Clients',          icon: '👥',  desc: 'Client portfolio table',          status: 'live',  badge: 47,    route: '/clients',         pinned: true },
  { id: 'documents_all',   hub: 'core',       label: 'Documents',            icon: '📁',  desc: 'Global document vault',           status: 'live',  badge: null,  route: '/documents',       pinned: true },
  { id: 'search',          hub: 'core',       label: 'Search',               icon: '🔍',  desc: 'Search everything',               status: 'live',  badge: null,  route: '/search',          pinned: false },

  // ── COMPLIANCE ──
  { id: 'calendar',        hub: 'compliance', label: 'Compliance Calendar',  icon: '📅',  desc: 'All filing deadlines',            status: 'live',  badge: 3,     route: '/compliance/calendar',     pinned: true },
  { id: 'checklists',      hub: 'compliance', label: 'Doc Checklists',       icon: '📋',  desc: 'Pending documents tracker',       status: 'live',  badge: 23,    route: '/compliance/checklists',   pinned: true },
  { id: 'deadlines',       hub: 'compliance', label: 'Deadline Tracker',     icon: '⏰',  desc: 'Custom deadline management',      status: 'live',  badge: null,  route: '/compliance/deadlines',    pinned: false },
  { id: 'notices',         hub: 'compliance', label: 'IT Notice Manager',    icon: '⚖️',  desc: 'Notice workflow & responses',     status: 'beta',  badge: 2,     route: '/compliance/notices',      pinned: false },
  { id: 'ais',             hub: 'compliance', label: 'AIS / 26AS Analyzer',  icon: '🔍',  desc: 'Mismatch detection engine',       status: 'beta',  badge: null,  route: '/compliance/ais',          pinned: false },
  { id: 'udin',            hub: 'compliance', label: 'UDIN Registry',        icon: '🔐',  desc: 'Certificate & UDIN tracking',     status: 'live',  badge: null,  route: '/compliance/udin',         pinned: false },
  { id: 'dsc',             hub: 'compliance', label: 'DSC Expiry Tracker',   icon: '🪪',  desc: 'Digital signature expiry alerts', status: 'live',  badge: null,  route: '/compliance/dsc',          pinned: false },
  { id: 'engagement',      hub: 'compliance', label: 'Engagement Letters',   icon: '✍️',  desc: 'E-sign client agreements',        status: 'beta',  badge: null,  route: '/compliance/engagement',   pinned: false },

  // ── WORK ──
  { id: 'tasks',           hub: 'work',       label: 'Task Board',           icon: '✅',  desc: 'Kanban & work tracker',           status: 'live',  badge: 8,     route: '/work/tasks',              pinned: true },
  { id: 'timetracking',    hub: 'work',       label: 'Time Tracking',        icon: '⏱️',  desc: 'Hours per client & task',         status: 'live',  badge: null,  route: '/work/time',               pinned: false },
  { id: 'workload',        hub: 'work',       label: 'Workload Balancer',    icon: '⚖️',  desc: 'Staff capacity & assignment',     status: 'beta',  badge: null,  route: '/work/workload',           pinned: false },
  { id: 'task_templates',  hub: 'work',       label: 'Task Templates',       icon: '📌',  desc: 'Recurring task templates',        status: 'live',  badge: null,  route: '/work/templates',          pinned: false },
  { id: 'knowledge',       hub: 'work',       label: 'Knowledge Base',       icon: '📚',  desc: 'SOPs & firm wiki',                status: 'live',  badge: null,  route: '/work/knowledge',          pinned: false },

  // ── BILLING ──
  { id: 'invoices',        hub: 'billing',    label: 'Invoices',             icon: '🧾',  desc: 'GST billing & management',        status: 'live',  badge: null,  route: '/billing/invoices',        pinned: true },
  { id: 'payments',        hub: 'billing',    label: 'Payments',             icon: '💳',  desc: 'Receivables & collections',       status: 'live',  badge: null,  route: '/billing/payments',        pinned: true },
  { id: 'expenses',        hub: 'billing',    label: 'Expenses',             icon: '💸',  desc: 'Petty cash & firm expenses',      status: 'live',  badge: null,  route: '/billing/expenses',        pinned: false },
  { id: 'service_catalog', hub: 'billing',    label: 'Service Catalog',      icon: '🗂️',  desc: 'Fees & SAC code library',         status: 'live',  badge: null,  route: '/billing/catalog',         pinned: false },
  { id: 'credit_notes',    hub: 'billing',    label: 'Credit Notes',         icon: '📝',  desc: 'Invoice adjustments',             status: 'live',  badge: null,  route: '/billing/credit-notes',    pinned: false },
  { id: 'fee_optimizer',   hub: 'billing',    label: 'Fee Optimizer',        icon: '📈',  desc: 'Benchmark & raise fees',          status: 'beta',  badge: null,  route: '/billing/fee-optimizer',   pinned: false },
  { id: 'retainers',       hub: 'billing',    label: 'Retainer Manager',     icon: '🔄',  desc: 'Monthly recurring billing',       status: 'live',  badge: null,  route: '/billing/retainers',       pinned: false },

  // ── CLIENTS ──
  { id: 'clients_user_client',   hub: 'clients',    label: 'Client',               icon: '👤',  desc: 'Client management & interactions',    status: 'live',  badge: null,  route: '/clients/client',          pinned: false },
  { id: 'clients_user_staff',    hub: 'clients',    label: 'Staff',                icon: '👥',  desc: 'Staff management & assignments',      status: 'live',  badge: null,  route: '/clients/staff',           pinned: false },

  // ── ANALYTICS ──
  { id: 'reports',         hub: 'analytics',  label: 'Reports',              icon: '📊',  desc: 'Revenue, compliance & work',      status: 'live',  badge: null,  route: '/analytics/reports',       pinned: true },
  { id: 'practice_value',  hub: 'analytics',  label: 'Practice Valuation',   icon: '🏆',  desc: 'Your business worth calculator',  status: 'beta',  badge: null,  route: '/analytics/valuation',     pinned: false },
  { id: 'tax_savings',     hub: 'analytics',  label: 'Tax Saving Engine',    icon: '💡',  desc: 'Mid-year opportunity finder',     status: 'beta',  badge: 12,    route: '/analytics/tax-savings',   pinned: false },
  { id: 'budget',          hub: 'analytics',  label: 'Budget Analyzer',      icon: '📰',  desc: 'Finance act impact per client',   status: 'beta',  badge: null,  route: '/analytics/budget',        pinned: false },
  { id: 'gst_recon',       hub: 'analytics',  label: 'GST Reconciliation',   icon: '⚡',  desc: 'GSTR-2B vs purchase register',    status: 'beta',  badge: null,  route: '/analytics/gst-recon',     pinned: false },
  { id: 'capital_gains',   hub: 'analytics',  label: 'Capital Gains',        icon: '📈',  desc: 'Portfolio & CG calculator',       status: 'beta',  badge: null,  route: '/analytics/capital-gains', pinned: false },
  { id: 'advance_tax',     hub: 'analytics',  label: 'Advance Tax',          icon: '🧮',  desc: 'Quarterly instalment engine',     status: 'live',  badge: null,  route: '/analytics/advance-tax',   pinned: false },

  // ── SPECIALIST ──
  { id: 'nri',             hub: 'specialist', label: 'NRI Module',           icon: '✈️',  desc: 'DTAA, FEMA & NRI compliance',     status: 'beta',  badge: null,  route: '/specialist/nri',          pinned: false },
  { id: 'payroll',         hub: 'specialist', label: 'Payroll Manager',      icon: '💼',  desc: 'Salary, PF, ESI, Form 16',        status: 'beta',  badge: null,  route: '/specialist/payroll',      pinned: false },
  { id: 'company_sec',     hub: 'specialist', label: 'Company Secretarial',  icon: '🏢',  desc: 'Board minutes, ROC, MGT filing',  status: 'beta',  badge: null,  route: '/specialist/company-sec',  pinned: false },
  { id: 'loans',           hub: 'specialist', label: 'Loan & EMI Tracker',   icon: '🏦',  desc: 'Interest certificates & Sec 24b', status: 'live',  badge: null,  route: '/specialist/loans',        pinned: false },

  // ── FIRM OPS ──
  { id: 'staff',           hub: 'firm',       label: 'Staff Management',     icon: '👔',  desc: 'HR, roles & staff profiles',      status: 'live',  badge: null,  route: '/firm/staff',              pinned: false },
  { id: 'attendance',      hub: 'firm',       label: 'Attendance',           icon: '📆',  desc: 'Daily check-in & check-out',      status: 'live',  badge: null,  route: '/firm/attendance',         pinned: false },
  { id: 'leaves',          hub: 'firm',       label: 'Leave Manager',        icon: '🏖️',  desc: 'Apply & approve leaves',          status: 'live',  badge: null,  route: '/firm/leaves',             pinned: false },
  { id: 'partners',        hub: 'firm',       label: 'Partner Marketplace',  icon: '🤝',  desc: 'CS, lawyers & referral fees',     status: 'beta',  badge: null,  route: '/firm/partners',           pinned: false },
  { id: 'handover',        hub: 'firm',       label: 'File Handover',        icon: '📦',  desc: 'Client file export & transfer',   status: 'live',  badge: null,  route: '/firm/handover',           pinned: false },
  { id: 'watermark',       hub: 'firm',       label: 'Doc Watermarking',     icon: '🔏',  desc: 'Traceable secure sharing',        status: 'live',  badge: null,  route: '/firm/watermark',          pinned: false },
  { id: 'audit_log',       hub: 'firm',       label: 'Audit Log',            icon: '📜',  desc: 'All system actions logged',       status: 'live',  badge: null,  route: '/firm/audit-log',          pinned: false },

  // ── SETTINGS ──
  { id: 'firm_settings',   hub: 'settings',   label: 'Firm Settings',        icon: '🏛️',  desc: 'Name, logo & CA details',         status: 'live',  badge: null,  route: '/settings/firm',           pinned: false },
  { id: 'whatsapp_setup',  hub: 'settings',   label: 'WhatsApp Setup',       icon: '💬',  desc: 'Connect WhatsApp account',        status: 'live',  badge: null,  route: '/settings/whatsapp',       pinned: false },
  { id: 'storage',         hub: 'settings',   label: 'Storage (S3)',         icon: '☁️',  desc: 'AWS S3 configuration',            status: 'live',  badge: null,  route: '/settings/storage',        pinned: false },
  { id: 'roles',           hub: 'settings',   label: 'Roles & Permissions',  icon: '🔑',  desc: 'RBAC configuration',              status: 'live',  badge: null,  route: '/settings/roles',          pinned: false },
  { id: 'subscription',    hub: 'settings',   label: 'Subscription',         icon: '💳',  desc: 'AccuDocs plan & billing',         status: 'live',  badge: null,  route: '/settings/subscription',   pinned: false },
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