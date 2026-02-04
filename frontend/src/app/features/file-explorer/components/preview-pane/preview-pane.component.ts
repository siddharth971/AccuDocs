import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MatIconModule } from '@angular/material/icon';
import { FileItem } from '../../models/file-explorer.models';

@Component({
  selector: 'app-preview-pane',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './preview-pane.component.html',
  styleUrls: ['./preview-pane.component.scss']
})
export class PreviewPaneComponent {
  private sanitizer = inject(DomSanitizer);
  @Input() selectedFile: FileItem | null = null;

  getSafeUrl(url?: string | SafeResourceUrl): SafeResourceUrl {
    if (!url) return this.sanitizer.bypassSecurityTrustResourceUrl('');
    if (typeof url === 'string') {
      return this.sanitizer.bypassSecurityTrustResourceUrl(url);
    }
    return url;
  }

  getPreviewType(): 'image' | 'pdf' | 'text' | 'none' {
    if (!this.selectedFile) return 'none';
    return this.selectedFile.type as any;
  }
}
