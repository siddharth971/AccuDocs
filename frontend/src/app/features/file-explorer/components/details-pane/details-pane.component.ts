import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FileItem } from '../../models/file-explorer.models';

@Component({
  selector: 'app-details-pane',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './details-pane.component.html',
  styleUrls: ['./details-pane.component.scss']
})
export class DetailsPaneComponent {
  @Input() selectedFile: FileItem | null = null;

  formatSize(bytes?: number): string {
    if (bytes === undefined) return '--';
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
