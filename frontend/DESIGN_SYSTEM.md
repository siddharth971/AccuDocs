# AccuDocs Design System

## Enterprise-Grade UI Component Library

A professional, consistent, and accessible design system for the AccuDocs Accountant Document Management Dashboard.

---

## 📐 Design Principles

### 1. Consistency Over Creativity

Every component follows the same visual language and interaction patterns.

### 2. Clarity Over Decoration

Clean, minimal interfaces that communicate clearly without visual noise.

### 3. Accessibility First

WCAG AA compliant with proper ARIA labels, keyboard navigation, and focus management.

### 4. Mobile-First

Responsive design that works seamlessly across all device sizes.

### 5. Performance-Aware

Optimized components with efficient change detection and minimal re-renders.

---

## 🎨 Design Tokens

### Color System

```scss
// Primary Brand - Professional Blue
--primary-50: #f0f7ff --primary-100: #e0f0fe --primary-200: #b9e0fe
  --primary-300: #7cc8fd --primary-400: #36adf9 --primary-500: #0c93eb
  --primary-600: #0074c9 // DEFAULT
  --primary-700: #015da3 --primary-800: #064e86 --primary-900: #0b426f
  // Semantic Colors
  --success: #16a34a --warning: #d97706 --danger: #dc2626 --info: #0284c7
  // Surface Colors (Light Mode)
  --background-color: #f8fafc --surface-color: #ffffff --text-primary: #0f172a
  --text-secondary: #475569 --text-muted: #94a3b8 --border-color: #e2e8f0
  // Surface Colors (Dark Mode)
  --background-color: #0f172a --surface-color: #1e293b --text-primary: #f1f5f9
  --text-secondary: #94a3b8;
```

### Typography System

| Token       | Size | Line Height | Usage             |
| ----------- | ---- | ----------- | ----------------- |
| `text-xs`   | 12px | 16px        | Labels, captions  |
| `text-sm`   | 14px | 20px        | Body text, inputs |
| `text-base` | 16px | 24px        | Default body      |
| `text-lg`   | 18px | 28px        | Subtitles         |
| `text-xl`   | 20px | 28px        | Section headers   |
| `text-2xl`  | 24px | 32px        | Page headers      |
| `text-3xl`  | 30px | 36px        | Large headers     |
| `text-4xl`  | 36px | 40px        | Display text      |

**Font Family:** Inter (Primary), System Sans-Serif (Fallback)

### Spacing System (8pt Grid)

```
--space-1: 4px
--space-2: 8px
--space-3: 12px
--space-4: 16px
--space-6: 24px
--space-8: 32px
--space-12: 48px
--space-16: 64px
```

**Rule:** Only use these spacing values. No arbitrary margins or padding.

### Border Radius

| Token          | Value  | Usage            |
| -------------- | ------ | ---------------- |
| `rounded-xs`   | 4px    | Small badges     |
| `rounded-sm`   | 6px    | Buttons, inputs  |
| `rounded-md`   | 10px   | Cards, modals    |
| `rounded-lg`   | 16px   | Large containers |
| `rounded-xl`   | 24px   | Feature cards    |
| `rounded-full` | 9999px | Pills, avatars   |

### Shadow System

```scss
--shadow-card: 0 1px 3px 0 rgb(0 0 0 / 0.08) --shadow-card-hover: 0 10px
  25px -5px rgb(0 0 0 / 0.1) --shadow-dropdown: 0 10px 40px -8px
  rgb(0 0 0 / 0.15) --shadow-modal: 0 25px 50px -12px rgb(0 0 0 / 0.25);
```

---

## 🧩 Component Library

### Atoms (Base Components)

| Component | Selector        | Description                          |
| --------- | --------------- | ------------------------------------ |
| Button    | `<ui-button>`   | Primary action element with variants |
| Input     | `<ui-input>`    | Text input with validation           |
| Select    | `<ui-select>`   | Dropdown selection                   |
| Textarea  | `<ui-textarea>` | Multi-line text input                |
| Checkbox  | `<ui-checkbox>` | Boolean selection                    |
| Badge     | `<ui-badge>`    | Status indicator                     |
| Loader    | `<ui-loader>`   | Loading spinner                      |
| Icon      | `<ui-icon>`     | Icon wrapper                         |

### Molecules (Composite Components)

| Component  | Selector           | Description                |
| ---------- | ------------------ | -------------------------- |
| Card       | `<ui-card>`        | Content container          |
| SearchBar  | `<ui-search-bar>`  | Search input with debounce |
| Modal      | `<ui-modal>`       | Dialog overlay             |
| Dropdown   | `<ui-dropdown>`    | Action menu                |
| FormGroup  | `<ui-form-group>`  | Form field wrapper         |
| Toast      | `<ui-toast>`       | Notification message       |
| EmptyState | `<ui-empty-state>` | No data placeholder        |
| Skeleton   | `<ui-skeleton>`    | Loading placeholder        |

### Organisms (Complex Components)

| Component     | Selector              | Description             |
| ------------- | --------------------- | ----------------------- |
| DataTable     | `<ui-data-table>`     | Full-featured data grid |
| PageHeader    | `<ui-page-header>`    | Page title with actions |
| StatsCard     | `<ui-stats-card>`     | Metric display          |
| StatsGrid     | `<ui-stats-grid>`     | Grid of stats           |
| ConfirmDialog | `<ui-confirm-dialog>` | Action confirmation     |
| DeleteConfirm | `<ui-delete-confirm>` | Delete confirmation     |

---

## 📝 Component Usage

### Button Component

```html
<!-- Primary Button -->
<ui-button variant="primary" (clicked)="save()">Save Changes</ui-button>

<!-- Secondary Button -->
<ui-button variant="secondary">Cancel</ui-button>

<!-- Danger Button with Loading -->
<ui-button variant="danger" [loading]="isDeleting">Delete</ui-button>

<!-- Ghost Button with Icon -->
<ui-button variant="ghost" [iconLeft]="true">
  <svg icon-left>...</svg>
  Settings
</ui-button>

<!-- Full Width Button -->
<ui-button [fullWidth]="true" size="lg">Continue</ui-button>
```

**Button Variants:**

- `primary` - Main actions (blue)
- `secondary` - Secondary actions (white/gray)
- `success` - Positive actions (green)
- `warning` - Caution actions (orange)
- `danger` - Destructive actions (red)
- `ghost` - Subtle actions
- `link` - Inline links

### Input Component

```html
<!-- Basic Input -->
<ui-input
  type="email"
  label="Email Address"
  placeholder="Enter your email"
  [required]="true"
  [(ngModel)]="email"
></ui-input>

<!-- Password with Toggle -->
<ui-input type="password" label="Password" [clearable]="true"></ui-input>

<!-- Input with Error -->
<ui-input
  label="Username"
  [hasError]="true"
  errorMessage="Username is required"
></ui-input>
```

### Data Table Component

```html
<ui-data-table
  [data]="clients"
  [columns]="tableColumns"
  [loading]="isLoading"
  [pagination]="{ page: 1, pageSize: 10, total: 100 }"
  [selectable]="true"
  [hoverable]="true"
  (sortChange)="onSort($event)"
  (pageChange)="onPageChange($event)"
  (selectionChange)="onSelectionChange($event)"
>
  <button table-header-right>Add New</button>
</ui-data-table>
```

### Modal Component

```html
<ui-modal
  [isOpen]="showModal"
  title="Edit Client"
  description="Update client information"
  size="md"
  (closed)="showModal = false"
>
  <!-- Modal content -->
  <form>...</form>

  <!-- Modal footer -->
  <div modal-footer>
    <ui-button variant="secondary" (clicked)="close()">Cancel</ui-button>
    <ui-button variant="primary" (clicked)="save()">Save</ui-button>
  </div>
</ui-modal>
```

### Toast Notifications

```typescript
// In your component
import { ToastService } from "@core/services/toast.service";

export class MyComponent {
  toastService = inject(ToastService);

  onSuccess() {
    this.toastService.success(
      "Client saved",
      "The client was saved successfully.",
    );
  }

  onError() {
    this.toastService.error(
      "Save failed",
      "Unable to save client. Please try again.",
    );
  }
}
```

---

## 📐 Layout System

### Page Structure

Every page MUST follow this structure:

```html
<div class="space-y-8">
  <!-- Page Header -->
  <ui-page-header
    title="Clients"
    subtitle="Manage your client accounts"
    [breadcrumbs]="[{ label: 'Dashboard', path: '/dashboard' }, { label: 'Clients' }]"
    [showSearch]="true"
    [showFilters]="true"
    (search)="onSearch($event)"
  >
    <ui-button page-actions variant="primary">Add Client</ui-button>
  </ui-page-header>

  <!-- Page Content -->
  <ui-card>
    <ui-data-table [data]="clients" [columns]="columns"></ui-data-table>
  </ui-card>
</div>
```

### Grid System

```html
<!-- 12-column grid -->
<div class="grid grid-cols-12 gap-6">
  <div class="col-span-12 lg:col-span-8">Main content</div>
  <div class="col-span-12 lg:col-span-4">Sidebar</div>
</div>

<!-- Stats grid -->
<ui-stats-grid [columns]="4">
  <ui-stats-card label="Total Clients" [value]="150"></ui-stats-card>
  <ui-stats-card label="Documents" [value]="1234"></ui-stats-card>
  <ui-stats-card label="Storage" value="45 GB"></ui-stats-card>
  <ui-stats-card
    label="Active"
    [value]="89"
    [change]="12"
    trend="up"
  ></ui-stats-card>
</ui-stats-grid>
```

---

## 🎭 Interaction States

All interactive elements must implement these states:

| State        | Description                             |
| ------------ | --------------------------------------- |
| **Default**  | Normal appearance                       |
| **Hover**    | Mouse over element                      |
| **Focus**    | Keyboard focus (must have visible ring) |
| **Active**   | Being clicked/pressed                   |
| **Disabled** | Not interactive (50% opacity)           |
| **Loading**  | Operation in progress (spinner)         |
| **Error**    | Validation failed (red border)          |
| **Success**  | Validation passed (green indicator)     |

---

## ♿ Accessibility

### Requirements

1. **Color Contrast:** Minimum 4.5:1 for normal text, 3:1 for large text
2. **Focus Indicators:** All interactive elements must have visible focus rings
3. **ARIA Labels:** All non-text elements need descriptive labels
4. **Keyboard Navigation:** Full keyboard accessibility
5. **Screen Reader Support:** Proper semantic HTML and ARIA announcements

### Implementation

```html
<!-- Good: Accessible button -->
<button
  type="button"
  aria-label="Delete client John Doe"
  aria-describedby="delete-warning"
  [attr.aria-busy]="isDeleting"
>
  Delete
</button>

<!-- Good: Accessible form field -->
<label for="email">Email Address <span aria-hidden="true">*</span></label>
<input
  id="email"
  type="email"
  aria-required="true"
  aria-invalid="hasError"
  aria-describedby="email-error"
/>
<p id="email-error" role="alert">Please enter a valid email</p>
```

---

## 📱 Responsive Design

### Breakpoints

| Breakpoint | Width  | Usage         |
| ---------- | ------ | ------------- |
| `sm`       | 640px  | Large phones  |
| `md`       | 768px  | Tablets       |
| `lg`       | 1024px | Small laptops |
| `xl`       | 1280px | Desktops      |
| `2xl`      | 1536px | Large screens |

### Responsive Patterns

- **Sidebar:** Collapses to bottom drawer on mobile
- **Tables:** Convert to card lists on mobile
- **Actions:** Move to bottom sheet on mobile
- **Modals:** Full-screen on mobile
- **Stats Grid:** 1 column → 2 columns → 4 columns

---

## 🌙 Theme System

### Usage

```typescript
import { ThemeService } from "@core/services/theme.service";

export class MyComponent {
  themeService = inject(ThemeService);

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  get isDark() {
    return this.themeService.isDarkMode();
  }
}
```

### Features

- Light/Dark mode support
- System preference detection
- User preference persistence (localStorage)
- Smooth transitions between themes

---

## ✅ Quality Checklist

Before committing UI changes, verify:

- [ ] Uses only design system components
- [ ] Follows spacing system (8pt grid)
- [ ] Uses defined color tokens
- [ ] Implements all interaction states
- [ ] Keyboard accessible
- [ ] Screen reader friendly
- [ ] Responsive on all breakpoints
- [ ] Works in light and dark mode
- [ ] No console errors
- [ ] Animations are smooth
- [ ] Loading states implemented
- [ ] Empty states handled
- [ ] Error states handled

---

## 📂 File Structure

```
src/app/shared/ui/
├── atoms/
│   ├── button.component.ts
│   ├── input.component.ts
│   ├── select.component.ts
│   ├── textarea.component.ts
│   ├── checkbox.component.ts
│   ├── badge.component.ts
│   ├── loader.component.ts
│   ├── icon.component.ts
│   └── index.ts
├── molecules/
│   ├── card.component.ts
│   ├── search-bar.component.ts
│   ├── modal.component.ts
│   ├── dropdown.component.ts
│   ├── form-group.component.ts
│   ├── toast.component.ts
│   ├── empty-state.component.ts
│   ├── skeleton.component.ts
│   └── index.ts
├── organisms/
│   ├── data-table.component.ts
│   ├── page-header.component.ts
│   ├── stats-card.component.ts
│   ├── confirm-dialog.component.ts
│   └── index.ts
└── index.ts
```

---

## 🚀 Getting Started

### Import Components

```typescript
// Import specific components
import { ButtonComponent, InputComponent } from "@shared/ui/atoms";
import { CardComponent, ModalComponent } from "@shared/ui/molecules";
import { DataTableComponent, PageHeaderComponent } from "@shared/ui/organisms";

// Or import all from main barrel
import { ButtonComponent, CardComponent, DataTableComponent } from "@shared/ui";
```

### Use in Templates

```html
<ui-button variant="primary" (clicked)="save()">Save</ui-button>
<ui-card title="Client Details">
  <ui-input label="Name" [(ngModel)]="name"></ui-input>
</ui-card>
```

---

**Version:** 1.0.0  
**Last Updated:** February 2026  
**Maintainer:** AccuDocs Team
