import { Component, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { FileItem, ViewMode } from '../../models/file-explorer.models';

@Component({
  selector: 'app-file-grid',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatTooltipModule, MatMenuModule],
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

  @ViewChild(MatMenuTrigger) contextMenu!: MatMenuTrigger;
  contextMenuPosition = { x: '0px', y: '0px' };

  // Inline rename state
  editingFileId: string | null = null;
  editingFileName: string = '';

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

  onFileClick(file: FileItem) {
    // Cancel any ongoing rename if clicking elsewhere
    if (this.editingFileId && this.editingFileId !== file.id) {
      this.cancelRename();
    }
    this.fileSelected.emit(file);
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
