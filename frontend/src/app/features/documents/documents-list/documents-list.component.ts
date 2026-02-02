import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { HttpEventType } from '@angular/common/http';
import { DocumentService, Document } from '@core/services/document.service';
import { AuthService } from '@core/services/auth.service';
import { NotificationService } from '@core/services/notification.service';
import { ConfirmDialogComponent } from '@shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-documents-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatCardModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatProgressSpinnerModule,
    MatProgressBarModule, MatMenuModule, MatDialogModule, MatTooltipModule,
    MatPaginatorModule,
  ],
  template: `
    <div class="w-full space-y-6">
      <!-- Header -->
      <header class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-text-primary">Documents</h1>
          <p class="text-text-secondary mt-1">Manage and access your uploaded documents.</p>
        </div>
        @if (authService.isAdmin()) {
          <input type="file" #fileInput (change)="onFileSelected($any($event))" hidden>
          <button (click)="fileInput.click()" class="btn-primary">
            <mat-icon class="text-xl">cloud_upload</mat-icon>
            Upload Document
          </button>
        }
      </header>

      <!-- Content Card -->
      <div class="bg-white dark:bg-slate-800 rounded-xl border border-border-color shadow-sm overflow-hidden">
        @if (isLoading()) {
          <div class="flex flex-col items-center justify-center py-20">
            <mat-spinner diameter="40"></mat-spinner>
            <p class="mt-4 text-text-secondary">Loading documents...</p>
          </div>
        } @else if (documents().length === 0) {
          <div class="flex flex-col items-center justify-center py-20 text-center">
            <mat-icon class="text-6xl text-text-muted mb-4">folder_open</mat-icon>
            <h3 class="text-lg font-semibold text-text-primary mb-2">No documents found</h3>
            <p class="text-text-secondary">Upload your first document to get started.</p>
          </div>
        } @else {
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-6">
            @for (doc of documents(); track doc.id) {
              <div 
                class="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-700 rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors border border-transparent hover:border-primary-200"
                (click)="download(doc)"
              >
                <mat-icon class="text-primary-600 text-3xl">{{ documentService.getFileIcon(doc.mimeType) }}</mat-icon>
                <div class="flex-1 min-w-0">
                  <p class="font-medium text-text-primary truncate">{{ doc.originalName }}</p>
                  <p class="text-sm text-text-secondary">{{ documentService.formatFileSize(doc.size) }}</p>
                </div>
                <button mat-icon-button [matMenuTriggerFor]="menu" (click)="$event.stopPropagation()">
                  <mat-icon>more_vert</mat-icon>
                </button>
                <mat-menu #menu="matMenu">
                  <button mat-menu-item (click)="download(doc)"><mat-icon>download</mat-icon>Download</button>
                  @if (authService.isAdmin()) {
                    <button mat-menu-item (click)="confirmDelete(doc)" class="text-danger-600"><mat-icon>delete</mat-icon>Delete</button>
                  }
                </mat-menu>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [``],
})
export class DocumentsListComponent implements OnInit {
  authService = inject(AuthService);
  documentService = inject(DocumentService);
  private route = inject(ActivatedRoute);
  private notificationService = inject(NotificationService);
  private dialog = inject(MatDialog);

  documents = signal<Document[]>([]);
  isLoading = signal(false);
  selectedYearId = signal<string | null>(null);

  ngOnInit(): void {
    const yearId = this.route.snapshot.queryParams['yearId'];
    if (yearId) {
      this.selectedYearId.set(yearId);
      this.loadDocuments();
    }
  }

  loadDocuments(): void {
    const yearId = this.selectedYearId();
    if (!yearId) return;
    this.isLoading.set(true);
    this.documentService.getDocumentsByYear(yearId).subscribe({
      next: (res) => this.documents.set(res.data || []),
      complete: () => this.isLoading.set(false),
    });
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    const yearId = this.selectedYearId();
    if (!file || !yearId) return;
    this.documentService.uploadDocument(yearId, file).subscribe({
      next: (evt) => {
        if (evt.type === HttpEventType.Response) {
          this.notificationService.success('Uploaded');
          this.loadDocuments();
        }
      },
    });
  }

  download(doc: Document): void {
    this.documentService.getDownloadUrl(doc.id).subscribe({
      next: (res) => this.documentService.downloadFile(res.data.url, doc.originalName),
    });
  }

  confirmDelete(doc: Document): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Delete', message: `Delete ${doc.originalName}?`, confirmText: 'Delete', color: 'warn' },
    });
    ref.afterClosed().subscribe((ok) => ok && this.documentService.deleteDocument(doc.id).subscribe({
      next: () => { this.notificationService.success('Deleted'); this.loadDocuments(); },
    }));
  }
}
