import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FileViewToolbarComponent } from './components/file-view-toolbar/file-view-toolbar.component';
import { FileGridComponent } from './components/file-grid/file-grid.component';
import { FileListComponent } from './components/file-list/file-list.component';
import { FileDetailsComponent } from './components/file-details/file-details.component';
import { DetailsPaneComponent } from './components/details-pane/details-pane.component';
import { PreviewPaneComponent } from './components/preview-pane/preview-pane.component';
import { ViewPreferenceService } from './services/view-preference.service';
import { FileItem } from './models/file-explorer.models';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-file-explorer',
  standalone: true,
  imports: [
    CommonModule,
    FileViewToolbarComponent,
    FileGridComponent,
    FileListComponent,
    FileDetailsComponent,
    DetailsPaneComponent,
    PreviewPaneComponent,
    MatIconModule,
    MatDialogModule
  ],
  templateUrl: './file-explorer.component.html',
  styleUrls: ['./file-explorer.component.scss']
})
export class FileExplorerComponent implements OnInit {
  viewState$ = this.viewService.state$;
  files: FileItem[] = []; // This would typically come from a DataService
  selectedFile: FileItem | null = null;

  constructor(
    public viewService: ViewPreferenceService,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.loadMockFiles();
  }

  onFileSelected(file: FileItem) {
    this.selectedFile = file;
  }

  onFileOpened(file: FileItem) {
    if (file.type === 'folder') {
      console.log('Navigating to folder:', file.name);
      // Logic to load folder content
    } else {
      console.log('Opening file:', file.name);
    }
  }

  onFileRenamed(event: { file: FileItem, newName: string }) {
    if (event.newName && event.newName !== event.file.name) {
      console.log('Renaming file:', event.file.name, 'to', event.newName);
      event.file.name = event.newName;
      // In a real app, you would call a service to update the backend
    }
  }

  onFilePreviewed(file: FileItem) {
    console.log('FileExplorer: onFilePreviewed called for', file.name);
    this.selectedFile = file;
    this.viewService.setPreview(true);
    this.cdr.detectChanges(); // Force immediate UI update
    console.log('FileExplorer: Preview state set to true');
  }

  onFileDownloaded(file: FileItem) {
    console.log('Downloading file:', file.name);
    // Logic for downloading
    const link = document.createElement('a');
    link.href = '#'; // Mock URL
    link.download = file.name;
    link.click();
  }

  onFileDeleted(file: FileItem) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete File',
        message: `Are you sure you want to delete "${file.name}"?`,
        confirmText: 'Delete',
        color: 'warn'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Deleting file:', file.name);
        this.files = this.files.filter(f => f.id !== file.id);
        if (this.selectedFile?.id === file.id) {
          this.selectedFile = null;
        }
      }
    });
  }

  // Bulk action handlers
  onBulkCopy(files: FileItem[]) {
    console.log('Bulk copy:', files.map(f => f.name));
    // TODO: Implement actual copy functionality
    // For now, show a success message
    alert(`${files.length} item(s) copied to clipboard`);
  }

  onBulkDownload(files: FileItem[]) {
    console.log('Bulk download:', files.map(f => f.name));
    // TODO: Implement actual download functionality
    files.forEach(file => {
      const link = document.createElement('a');
      link.href = '#'; // Mock URL - replace with actual file URL
      link.download = file.name;
      link.click();
    });
  }

  onBulkMove(files: FileItem[]) {
    console.log('Bulk move:', files.map(f => f.name));
    // TODO: Implement folder selection dialog for moving files
    alert(`Move ${files.length} item(s) - Feature coming soon`);
  }

  onBulkDelete(files: FileItem[]) {
    const fileNames = files.map(f => f.name).join(', ');
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Multiple Items',
        message: `Are you sure you want to delete ${files.length} item(s)?\n\n${files.length <= 5 ? fileNames : files.slice(0, 5).map(f => f.name).join(', ') + ` and ${files.length - 5} more...`}`,
        confirmText: 'Delete All',
        color: 'warn'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Bulk deleting files:', files.map(f => f.name));
        const idsToDelete = new Set(files.map(f => f.id));
        this.files = this.files.filter(f => !idsToDelete.has(f.id));
        if (this.selectedFile && idsToDelete.has(this.selectedFile.id)) {
          this.selectedFile = null;
        }
      }
    });
  }

  private loadMockFiles() {
    this.files = [
      { id: '1', name: 'Annual Report 2024.pdf', type: 'pdf', size: 2500000, modifiedDate: new Date(), createdDate: new Date(), owner: 'John Doe', path: '/Documents/Annual Report 2024.pdf' },
      { id: '2', name: 'Project Screenshots', type: 'folder', modifiedDate: new Date(), createdDate: new Date(), owner: 'Admin', path: '/Documents/Project Screenshots' },
      { id: '3', name: 'Contract_v1.txt', type: 'text', size: 1024, modifiedDate: new Date(), createdDate: new Date(), owner: 'Jane Smith', path: '/Documents/Contract_v1.txt' },
      { id: '4', name: 'Logo_Final.png', type: 'image', size: 500000, modifiedDate: new Date(), createdDate: new Date(), owner: 'Design Team', path: '/Documents/Logo_Final.png' },
      { id: '5', name: 'Invoice_Jan.pdf', type: 'pdf', size: 150000, modifiedDate: new Date(), createdDate: new Date(), owner: 'Finance', path: '/Documents/Invoice_Jan.pdf' },
      { id: '6', name: 'Archive', type: 'folder', modifiedDate: new Date(), createdDate: new Date(), owner: 'System', path: '/Documents/Archive' },
      { id: '7', name: 'Draft_Notes.txt', type: 'text', size: 500, modifiedDate: new Date(), createdDate: new Date(), owner: 'John Doe', path: '/Documents/Draft_Notes.txt' },
      { id: '8', name: 'Marketing_Banner.jpg', type: 'image', size: 1200000, modifiedDate: new Date(), createdDate: new Date(), owner: 'Marketing', path: '/Documents/Marketing_Banner.jpg' },
    ];
  }
}
