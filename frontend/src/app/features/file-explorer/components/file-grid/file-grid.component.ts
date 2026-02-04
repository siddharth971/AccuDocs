import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import { FileItem, ViewMode } from '../../models/file-explorer.models';

@Component({
  selector: 'app-file-grid',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatTooltipModule,
    MatMenuModule,
    MatCheckboxModule,
    MatButtonModule,
    MatRippleModule
  ],
  templateUrl: './file-grid.component.html',
  styleUrls: ['./file-grid.component.scss']
})
export class FileGridComponent {
  @Input() files: FileItem[] = [];
  @Input() viewMode: ViewMode = 'large';
  @Input() activeFile: FileItem | null = null;
  @Output() fileSelected = new EventEmitter<FileItem>();
  @Output() fileOpened = new EventEmitter<FileItem>();
  @Output() fileRenamed = new EventEmitter<{ file: FileItem, newName: string }>();
  @Output() filePreviewed = new EventEmitter<FileItem>();
  @Output() fileDownloaded = new EventEmitter<FileItem>();
  @Output() fileDeleted = new EventEmitter<FileItem>();

  // Multi-select events
  @Output() bulkCopy = new EventEmitter<FileItem[]>();
  @Output() bulkDownload = new EventEmitter<FileItem[]>();
  @Output() bulkDelete = new EventEmitter<FileItem[]>();
  @Output() bulkMove = new EventEmitter<FileItem[]>();

  @ViewChild(MatMenuTrigger) contextMenu!: MatMenuTrigger;
  contextMenuPosition = { x: '0px', y: '0px' };

  // Multi-select state
  selectedFiles: Set<string> = new Set();
  isMultiSelectMode: boolean = false;
  lastSelectedIndex: number = -1;

  // Inline rename state
  editingFileId: string | null = null;
  editingFileName: string = '';

  // Check if a file is selected
  isSelected(file: FileItem): boolean {
    return this.selectedFiles.has(file.id);
  }

  // Get selected files as array
  getSelectedFiles(): FileItem[] {
    return this.files.filter(f => this.selectedFiles.has(f.id));
  }

  // Get selected count
  get selectedCount(): number {
    return this.selectedFiles.size;
  }

  // Check if all files are selected
  get isAllSelected(): boolean {
    return this.files.length > 0 && this.selectedFiles.size === this.files.length;
  }

  // Check if some files are selected (for indeterminate state)
  get isSomeSelected(): boolean {
    return this.selectedFiles.size > 0 && this.selectedFiles.size < this.files.length;
  }

  // Toggle multi-select mode
  toggleMultiSelectMode(): void {
    this.isMultiSelectMode = !this.isMultiSelectMode;
    if (!this.isMultiSelectMode) {
      this.clearSelection();
    }
  }

  // Toggle single file selection
  toggleFileSelection(file: FileItem, event?: MouseEvent): void {
    if (event) {
      event.stopPropagation();
    }

    if (this.selectedFiles.has(file.id)) {
      this.selectedFiles.delete(file.id);
    } else {
      this.selectedFiles.add(file.id);
    }

    // Update last selected index for shift-click
    this.lastSelectedIndex = this.files.findIndex(f => f.id === file.id);

    // Auto-enable multi-select mode when items are selected
    if (this.selectedFiles.size > 0) {
      this.isMultiSelectMode = true;
    } else {
      this.isMultiSelectMode = false;
    }
  }

  // Toggle all files selection
  toggleSelectAll(): void {
    if (this.isAllSelected) {
      this.clearSelection();
    } else {
      this.files.forEach(file => this.selectedFiles.add(file.id));
      this.isMultiSelectMode = true;
    }
  }

  // Clear all selections
  clearSelection(): void {
    this.selectedFiles.clear();
    this.isMultiSelectMode = false;
    this.lastSelectedIndex = -1;
  }

  // Handle file click with multi-select support
  handleFileClick(file: FileItem, event: MouseEvent): void {
    // Cancel any ongoing rename if clicking elsewhere
    if (this.editingFileId && this.editingFileId !== file.id) {
      this.cancelRename();
    }

    const currentIndex = this.files.findIndex(f => f.id === file.id);

    // Ctrl+Click: Toggle individual selection
    if (event.ctrlKey || event.metaKey) {
      this.toggleFileSelection(file);
      return;
    }

    // Shift+Click: Range selection
    if (event.shiftKey && this.lastSelectedIndex !== -1) {
      const start = Math.min(this.lastSelectedIndex, currentIndex);
      const end = Math.max(this.lastSelectedIndex, currentIndex);

      for (let i = start; i <= end; i++) {
        this.selectedFiles.add(this.files[i].id);
      }
      this.isMultiSelectMode = true;
      return;
    }

    // Normal click in multi-select mode: toggle selection
    if (this.isMultiSelectMode) {
      this.toggleFileSelection(file);
      return;
    }

    // Normal click: single selection
    this.lastSelectedIndex = currentIndex;
    this.fileSelected.emit(file);
  }

  // Bulk actions
  onBulkCopy(): void {
    const files = this.getSelectedFiles();
    if (files.length > 0) {
      this.bulkCopy.emit(files);
    }
  }

  onBulkDownload(): void {
    const files = this.getSelectedFiles();
    if (files.length > 0) {
      this.bulkDownload.emit(files);
    }
  }

  onBulkDelete(): void {
    const files = this.getSelectedFiles();
    if (files.length > 0) {
      this.bulkDelete.emit(files);
    }
  }

  onBulkMove(): void {
    const files = this.getSelectedFiles();
    if (files.length > 0) {
      this.bulkMove.emit(files);
    }
  }

  // Escape key to exit multi-select mode
  @HostListener('document:keydown.escape', ['$event'])
  onEscapeKey(event: KeyboardEvent): void {
    if (this.isMultiSelectMode) {
      this.clearSelection();
    }
  }

  // Ctrl+A to select all
  @HostListener('document:keydown.control.a', ['$event'])
  onSelectAllKey(event: KeyboardEvent): void {
    event.preventDefault();
    this.toggleSelectAll();
  }

  onContextMenu(event: MouseEvent, file: FileItem) {
    event.preventDefault();
    this.fileSelected.emit(file);
    this.contextMenuPosition.x = event.clientX + 'px';
    this.contextMenuPosition.y = event.clientY + 'px';
    this.contextMenu.menuData = { item: file };
    this.contextMenu.openMenu();
  }

  onRename(event: any, file: FileItem) {
    if (file) {
      // Start inline editing instead of emitting immediately
      this.startInlineEdit(file);
    }
  }

  startInlineEdit(file: FileItem) {
    this.editingFileId = file.id;
    this.editingFileName = file.name;
    // Focus the input after Angular renders it
    setTimeout(() => {
      const input = document.querySelector('.inline-rename-input') as HTMLInputElement;
      if (input) {
        input.focus();
        // Select filename without extension
        const dotIndex = file.name.lastIndexOf('.');
        if (dotIndex > 0) {
          input.setSelectionRange(0, dotIndex);
        } else {
          input.select();
        }
      }
    }, 50);
  }

  confirmRename(file: FileItem) {
    const newName = this.editingFileName.trim();
    if (newName && newName !== file.name) {
      this.fileRenamed.emit({ file, newName });
    }
    this.cancelRename();
  }

  cancelRename() {
    this.editingFileId = null;
    this.editingFileName = '';
  }

  onRenameKeydown(event: KeyboardEvent, file: FileItem) {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.confirmRename(file);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      this.cancelRename();
    }
  }

  onPreview(event: any, file: FileItem) {
    if (file) {
      this.filePreviewed.emit(file);
    }
  }

  onDownload(event: any, file: FileItem) {
    if (file) {
      this.fileDownloaded.emit(file);
    }
  }

  onDelete(event: any, file: FileItem) {
    if (file) {
      this.fileDeleted.emit(file);
    }
  }

  getIconSize(): number {
    switch (this.viewMode) {
      case 'extra-large': return 96;
      case 'large': return 72;
      case 'medium': return 48;
      case 'small': return 32;
      default: return 72;
    }
  }

  onFileDoubleClick(file: FileItem) {
    if (this.editingFileId) return; // Don't open if editing
    this.fileOpened.emit(file);
  }

  trackById(index: number, item: FileItem): string {
    return item.id;
  }

  getFileIcon(type: string): string {
    switch (type) {
      case 'folder': return 'folder';
      case 'pdf': return 'picture_as_pdf';
      case 'image': return 'image';
      case 'text': return 'description';
      default: return 'insert_drive_file';
    }
  }
}
