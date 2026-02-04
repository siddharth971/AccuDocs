import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FileItem, ViewMode } from '../../models/file-explorer.models';

@Component({
  selector: 'app-file-grid',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatTooltipModule],
  templateUrl: './file-grid.component.html',
  styleUrls: ['./file-grid.component.scss']
})
export class FileGridComponent {
  @Input() files: FileItem[] = [];
  @Input() viewMode: ViewMode = 'large';
  @Output() fileSelected = new EventEmitter<FileItem>();
  @Output() fileOpened = new EventEmitter<FileItem>();

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
    this.fileSelected.emit(file);
  }

  onFileDoubleClick(file: FileItem) {
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
