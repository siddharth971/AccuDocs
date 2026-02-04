import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { NgxDatatableModule, ColumnMode } from '@swimlane/ngx-datatable';
import { FileItem } from '../../models/file-explorer.models';

@Component({
  selector: 'app-file-details',
  standalone: true,
  imports: [CommonModule, MatIconModule, NgxDatatableModule],
  templateUrl: './file-details.component.html',
  styleUrls: ['./file-details.component.scss']
})
export class FileDetailsComponent {
  @Input() files: FileItem[] = [];
  @Output() fileSelected = new EventEmitter<FileItem>();
  @Output() fileOpened = new EventEmitter<FileItem>();

  ColumnMode = ColumnMode;

  onActivate(event: any) {
    if (event.type === 'click') {
      this.fileSelected.emit(event.row);
    } else if (event.type === 'dblclick') {
      this.fileOpened.emit(event.row);
    }
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
