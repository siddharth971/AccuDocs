
import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  TemplateRef,
  signal,
  computed,
  effect,
  HostListener,
  OnInit,
  OnChanges,
  OnDestroy,
  AfterViewInit,
  SimpleChanges,
  ViewEncapsulation,
  ChangeDetectionStrategy,
  Type,
  ChangeDetectorRef,
  Injector,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgxDatatableModule, DatatableComponent, ColumnMode, SelectionType } from '@swimlane/ngx-datatable';
import { HotToastService } from '@ngneat/hot-toast';
import { TableColumn, TableAction } from './models';
import { ExcelUtil } from '../utils/excel.util';
import { PdfUtil } from '../utils/pdf.util';

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgxDatatableModule,
    RouterModule
    // Icons will be SVG or standard for simplicity avoiding unresolved lib imports
  ],
  encapsulation: ViewEncapsulation.None,
  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataTableComponent implements OnInit, OnChanges, OnDestroy, AfterViewInit {
  @ViewChild(DatatableComponent) table!: DatatableComponent;

  // Inputs
  @Input() title: string = 'Data Table';
  @Input() tableColumns: TableColumn[] = [];
  @Input() set tableData(data: any[]) {
    this._data.set(data || []);
  }

  @Input() serverSide: boolean = false;
  @Input() totalCount: number = 0;
  @Input() loading: boolean = false;

  // Permissions / Standard Actions
  @Input() canAdd: boolean = true;
  @Input() canEdit: boolean = true;
  @Input() canDelete: boolean = true;
  @Input() canExport: boolean = true;

  // Templates
  @Input() actionsTemplate?: TemplateRef<any>;
  @Input() filtersTemplate?: TemplateRef<any>;
  @Input() rowClass: any;

  // Form Modal Support
  @Input() formComponent: Type<any> | null = null;
  @Input() addFormComponent!: Type<any>;
  @Input() updateFormComponent!: Type<any>;
  @Input() initialFormData: any;

  // Outputs
  @Output() loadMore = new EventEmitter<{ offset: number; limit: number; sort?: any }>();
  @Output() rowAction = new EventEmitter<{ action: string; row: any }>();
  @Output() add = new EventEmitter<void>();
  @Output() modalClosed = new EventEmitter<void>();

  // State Signals
  _data = signal<any[]>([]);
  searchQuery = signal<string>('');
  showModal = signal(false);
  closeModalRef = this.closeModal.bind(this);

  // Search Support
  @Output() search = new EventEmitter<string>();

  updateSearch(query: string) {
    this.searchQuery.set(query);
    this.search.emit(query);
  }

  // Modal Support
  formInjector = inject(Injector);

  // Column Toggling State
  showColumnToggle = false;
  allTableColumns: TableColumn[] = [];

  // Computed State
  filteredData = computed(() => {
    const query = this.searchQuery().toLowerCase();
    const data = this._data();

    if (this.serverSide || !query) {
      return data;
    }

    // Client-side filtering
    return data.filter(row => {
      // Check all properties
      return Object.values(row).some((val: any) =>
        String(val).toLowerCase().includes(query)
      );
    });
  });

  // Datatable Config
  ColumnMode = ColumnMode;
  SelectionType = SelectionType;
  page = { limit: 10, count: 0, offset: 0 };

  constructor(
    private toast: HotToastService,
    private cdr: ChangeDetectorRef
  ) {
    // Mobile check removed or simplified since Card View is removed
  }

  ngOnInit() {
    this.page.count = this.totalCount;
    // Initialize all columns copy for toggling
    this.allTableColumns = [...this.tableColumns];

    window.addEventListener('click', this.onClickOutside);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['totalCount']) {
      this.page.count = this.totalCount;
    }
    if (changes['tableColumns']) {
      this.allTableColumns = [...(this.tableColumns || [])];
    }
  }

  ngOnDestroy() {
    window.removeEventListener('click', this.onClickOutside);
  }

  // Click Outside Listener for Column Toggle
  onClickOutside = (event: any) => {
    const toggleBtn = document.getElementById('columnToggleBtn');
    const toggleBox = document.getElementById('columnToggleBox');

    if (this.showColumnToggle && toggleBtn && toggleBox) {
      if (!toggleBtn.contains(event.target) && !toggleBox.contains(event.target)) {
        this.showColumnToggle = false;
      }
    }
  }


  ngAfterViewInit() {
    // If needed for infinite scroll on body
  }

  // Actions
  onAdd() {
    if (this.addFormComponent || this.formComponent) {
      this.openModalWithType('add');
    } else {
      this.add.emit();
    }
  }

  onAction(action: string, row: any) {
    if (action === 'edit' && (this.updateFormComponent || this.formComponent)) {
      this.openModalWithType('edit', row);
    } else {
      this.rowAction.emit({ action, row });
    }
  }

  // Modal Logic
  openModalWithType(type: 'add' | 'edit' = 'add', data?: any) {
    const comp = type === 'add' ? (this.addFormComponent || this.formComponent) : (this.updateFormComponent || this.formComponent);
    if (comp) {
      this.formComponent = comp;
      this.initialFormData = data;
      this.showModal.set(true);
      document.body.style.overflow = 'hidden';
      document.body.classList.add('modal-open');
      this.cdr.markForCheck();
    }
  }

  closeModal() {
    this.showModal.set(false);
    document.body.style.overflow = '';
    document.body.classList.remove('modal-open');
    this.initialFormData = null;
    this.modalClosed.emit();
    this.cdr.markForCheck();
  }

  onPage(event: any) {
    if (this.serverSide) {
      this.page.offset = event.offset;
      this.loadMore.emit({
        offset: event.offset,
        limit: this.page.limit
      });
    }
  }

  // Export
  export(type: 'excel' | 'pdf') {
    const dataToExport = this.filteredData();
    // Use visible/active columns for export
    const columns = this.tableColumns.map(c => ({ header: c.name, key: c.prop, dataKey: c.prop }));

    if (dataToExport.length === 0) {
      this.toast.warning('No data to export');
      return;
    }

    try {
      if (type === 'excel') {
        ExcelUtil.exportToExcel(dataToExport, this.title, columns);
      } else {
        PdfUtil.exportToPdf(dataToExport, this.title, columns);
      }
      this.toast.success('Export started successfully');
    } catch (error) {
      console.error(error);
      this.toast.error('Failed to export data');
    }
  }

  // Column Toggling Logic
  toggleColumn(col: TableColumn) {
    const isChecked = this.isColumnChecked(col);

    if (isChecked) {
      this.tableColumns = this.tableColumns.filter(c => c.prop !== col.prop);
    } else {
      // Add back in correct order
      const newCols = [...this.tableColumns, col];
      // Sort based on original allTableColumns order
      this.tableColumns = newCols.sort((a, b) => {
        const idxA = this.allTableColumns.findIndex(c => c.prop === a.prop);
        const idxB = this.allTableColumns.findIndex(c => c.prop === b.prop);
        return idxA - idxB;
      });
    }
    // Trigger change detection for datatable if needed by creating new ref
    this.tableColumns = [...this.tableColumns];
  }

  isColumnChecked(col: TableColumn): boolean {
    return this.tableColumns.some(c => c.prop === col.prop);
  }
}
