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
import { LayoutComponent } from '@shared/components/layout/layout.component';
import { ConfirmDialogComponent } from '@shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-documents-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatCardModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatProgressSpinnerModule,
    MatProgressBarModule, MatMenuModule, MatDialogModule, MatTooltipModule,
    MatPaginatorModule, LayoutComponent,
  ],
  template: `
    <app-layout>
      <div class="documents-container fade-in">
        <header class="page-header">
          <h1>Documents</h1>
          @if (authService.isAdmin()) {
            <input type="file" #fileInput (change)="onFileSelected($any($event))" hidden>
            <button mat-raised-button color="primary" (click)="fileInput.click()">
              <mat-icon>cloud_upload</mat-icon> Upload
            </button>
          }
        </header>

        <mat-card>
          @if (isLoading()) {
            <div class="loading"><mat-spinner diameter="40"></mat-spinner></div>
          } @else if (documents().length === 0) {
            <div class="empty"><mat-icon>folder_open</mat-icon><p>No documents found</p></div>
          } @else {
            <div class="grid">
              @for (doc of documents(); track doc.id) {
                <div class="doc-card" (click)="download(doc)">
                  <mat-icon>{{ documentService.getFileIcon(doc.mimeType) }}</mat-icon>
                  <div class="info">
                    <span class="name">{{ doc.originalName }}</span>
                    <span class="meta">{{ documentService.formatFileSize(doc.size) }}</span>
                  </div>
                  <button mat-icon-button [matMenuTriggerFor]="menu" (click)="$event.stopPropagation()">
                    <mat-icon>more_vert</mat-icon>
                  </button>
                  <mat-menu #menu="matMenu">
                    <button mat-menu-item (click)="download(doc)"><mat-icon>download</mat-icon>Download</button>
                    @if (authService.isAdmin()) {
                      <button mat-menu-item (click)="confirmDelete(doc)"><mat-icon>delete</mat-icon>Delete</button>
                    }
                  </mat-menu>
                </div>
              }
            </div>
          }
        </mat-card>
      </div>
    </app-layout>
  `,
  styles: [`
    .documents-container { padding: 1.5rem; }
    .page-header { display: flex; justify-content: space-between; margin-bottom: 1rem; }
    .page-header h1 { margin: 0; }
    .loading, .empty { display: flex; flex-direction: column; align-items: center; padding: 4rem; }
    .empty mat-icon { font-size: 48px; height: 48px; width: 48px; color: var(--text-secondary); }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1rem; padding: 1rem; }
    .doc-card { display: flex; align-items: center; gap: 1rem; padding: 1rem; background: var(--background-color); border-radius: 8px; cursor: pointer; }
    .doc-card:hover { background: var(--border-color); }
    .info { flex: 1; min-width: 0; }
    .name { display: block; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .meta { font-size: 0.8rem; color: var(--text-secondary); }
  `],
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
