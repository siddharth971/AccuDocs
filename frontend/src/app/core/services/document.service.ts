import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';

export interface Document {
  id: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  size: number;
  uploadedBy: {
    id: string;
    name: string;
  };
  createdAt: string;
}

export interface StorageStats {
  totalSize: number;
  documentCount: number;
  byYear: {
    year: string;
    count: number;
    size: number;
  }[];
}

@Injectable({
  providedIn: 'root',
})
export class DocumentService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/documents`;

  getDocuments(
    page: number = 1,
    limit: number = 10,
    yearId?: string,
    search?: string
  ): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (yearId) params = params.set('yearId', yearId);
    if (search) params = params.set('search', search);

    return this.http.get(this.baseUrl, { params });
  }

  getDocumentsByYear(yearId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/year/${yearId}`);
  }

  uploadDocument(yearId: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('yearId', yearId);

    return this.http.post(`${this.baseUrl}/upload`, formData, {
      reportProgress: true,
      observe: 'events',
    });
  }

  getDownloadUrl(documentId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/${documentId}/download`);
  }

  deleteDocument(documentId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${documentId}`);
  }

  getStorageStats(clientId?: string): Observable<any> {
    let params = new HttpParams();
    if (clientId) params = params.set('clientId', clientId);

    return this.http.get(`${this.baseUrl}/stats`, { params });
  }

  downloadFile(url: string, fileName: string): void {
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getFileIcon(mimeType: string): string {
    if (mimeType.includes('pdf')) return 'picture_as_pdf';
    if (mimeType.includes('image')) return 'image';
    if (mimeType.includes('word') || mimeType.includes('document')) return 'description';
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'table_chart';
    if (mimeType.includes('text')) return 'text_snippet';
    return 'insert_drive_file';
  }
}
