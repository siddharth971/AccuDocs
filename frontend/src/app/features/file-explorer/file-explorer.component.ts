import { Component, OnInit } from '@angular/core';
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
    MatIconModule
  ],
  templateUrl: './file-explorer.component.html',
  styleUrls: ['./file-explorer.component.scss']
})
export class FileExplorerComponent implements OnInit {
  viewState$ = this.viewService.state$;
  files: FileItem[] = []; // This would typically come from a DataService
  selectedFile: FileItem | null = null;

  constructor(public viewService: ViewPreferenceService) { }

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
