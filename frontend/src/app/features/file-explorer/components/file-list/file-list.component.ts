import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FileItem } from '../../models/file-explorer.models';

@Component({
  selector: 'app-file-list',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './file-list.component.html',
  styleUrls: ['./file-list.component.scss']
})
export class FileListComponent {
  @Input() files: FileItem[] = [];
  @Output() fileSelected = new EventEmitter<FileItem>();
  @Output() fileOpened = new EventEmitter<FileItem>();

  onFileClick(file: FileItem) {
    this.fileSelected.emit(file);
  }

  onFileDoubleClick(file: FileItem) {
    this.fileOpened.emit(file);
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

  formatSize(bytes?: number): string {
    if (bytes === undefined) return '--';
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
