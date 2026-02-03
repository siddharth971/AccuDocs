# Enterprise DataTable Component

A reusable, responsive, and feature-rich DataTable component for Angular applications. Built with `@swimlane/ngx-datatable` and Tailwind CSS.

## Features

- **Dual View Mode**: Automatically switches between Table view (desktop) and Card view (mobile/tablet).
- **Responsive**: Mobile-first design with `grid` layout for cards.
- **Filtering**: Client-side filtering across all columns.
- **Server Siding**: Support for server-side pagination and sorting.
- **Exporting**: Built-in Excel and PDF export using `exceljs` and `jspdf`.
- **Dynamic Columns**: Configuration-based columns with specific types (`text`, `status`, `boolean`, `date`).
- **Actions**: built-in Add, Edit, Delete and custom action support.
- **Enterprise Themed**: Styled with Tailwind CSS matching the application design system.

## Usage

### 1. Import Component

In your feature module or standalone component:

```typescript
import { DataTableComponent } from "@shared/data-table/data-table.component";
import { TableColumn } from "@shared/data-table/models";

@Component({
  standalone: true,
  imports: [DataTableComponent],
  // ...
})
export class MyComponent {
  // ...
}
```

### 2. Define Columns

```typescript
columns: TableColumn[] = [
  { name: 'Name', prop: 'name', type: 'text', sortable: true },
  { name: 'Role', prop: 'role', type: 'text' },
  { name: 'Status', prop: 'isActive', type: 'status' },
  { name: 'Created At', prop: 'createdAt', type: 'date' },
  { name: 'Verified', prop: 'isVerified', type: 'boolean' }
];
```

### 3. Use in Template

```html
<app-data-table
  title="Users"
  [tableColumns]="columns"
  [tableData]="users"
  [totalCount]="totalUsers"
  [serverSide]="true"
  (loadMore)="onLoadMore($event)"
  (rowAction)="onAction($event)"
  (add)="onAdd()"
>
</app-data-table>
```

## Inputs

| Input             | Type            | Default        | Description                     |
| ----------------- | --------------- | -------------- | ------------------------------- |
| `title`           | `string`        | `'Data Table'` | Title displayed in the header.  |
| `tableColumns`    | `TableColumn[]` | `[]`           | Array of column definitions.    |
| `tableData`       | `any[]`         | `[]`           | Array of data objects.          |
| `serverSide`      | `boolean`       | `false`        | Enable server-side pagination.  |
| `totalCount`      | `number`        | `0`            | Total records (for pagination). |
| `loading`         | `boolean`       | `false`        | Show loading overlay.           |
| `canAdd`          | `boolean`       | `true`         | Show Add button.                |
| `canEdit`         | `boolean`       | `true`         | Show Edit action.               |
| `canDelete`       | `boolean`       | `true`         | Show Delete action.             |
| `actionsTemplate` | `TemplateRef`   | `null`         | Custom actions template.        |
| `filtersTemplate` | `TemplateRef`   | `null`         | Custom filters template.        |

## Outputs

| Output      | Event               | Description                              |
| ----------- | ------------------- | ---------------------------------------- |
| `loadMore`  | `{ offset, limit }` | Emitted when page changes (server-side). |
| `rowAction` | `{ action, row }`   | Emitted when edit/delete is clicked.     |
| `add`       | `void`              | Emitted when Add button is clicked.      |

## Dependencies

Ensure the following packages are installed:

```bash
npm install @swimlane/ngx-datatable exceljs file-saver jspdf jspdf-autotable @ngneat/hot-toast
```
