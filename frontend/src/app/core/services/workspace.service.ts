import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';

// Types for the workspace system
export type FolderType = 'root' | 'documents' | 'years' | 'year';

export interface FileNode {
  id: string;
  fileName: string;
  originalName: string;
  s3Path: string;
  mimeType: string;
  size: number;
  uploadedBy: {
    id: string;
    name: string;
  };
  createdAt: string;
}

export interface FolderNode {
  id: string;
  name: string;
  slug: string;
  type: FolderType;
  s3Prefix: string;
  fileCount: number;
  folderCount: number;
  totalSize: number;
  children: FolderNode[];
  files: FileNode[];
}

export interface WorkspaceTree {
  clientId: string;
  clientCode: string;
  clientName: string;
  rootFolder: FolderNode;
}

export interface Breadcrumb {
  id: string;
  name: string;
}

export interface FolderContents {
  folder: FolderNode;
  breadcrumbs: Breadcrumb[];
}

export interface UploadResult {
  id: string;
  fileName: string;
  originalName: string;
  s3Path: string;
  size: number;
  mimeType: string;
  downloadUrl: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

@Injectable({
  providedIn: 'root',
})
export class WorkspaceService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/workspace`;

  /**
   * Get client workspace tree
   */
  getClientWorkspace(clientId: string): Observable<ApiResponse<WorkspaceTree>> {
    return this.http.get<ApiResponse<WorkspaceTree>>(`${this.baseUrl}/clients/${clientId}`);
  }

  /**
   * Get folder contents
   */
  getFolderContents(folderId: string): Observable<ApiResponse<FolderContents>> {
    return this.http.get<ApiResponse<FolderContents>>(`${this.baseUrl}/folders/${folderId}`);
  }

  /**
   * Upload file to folder
   */
  uploadFile(folderId: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('folderId', folderId);
    formData.append('file', file);

    return this.http.post(`${this.baseUrl}/files/upload`, formData, {
      reportProgress: true,
      observe: 'events',
    });
  }

  /**
   * Get file download URL
   */
  getFileDownloadUrl(fileId: string, preview: boolean = false): Observable<ApiResponse<{ url: string; fileName: string }>> {
    let params = new HttpParams();
    if (preview) {
      params = params.set('preview', 'true');
    }
    return this.http.get<ApiResponse<{ url: string; fileName: string }>>(`${this.baseUrl}/files/${fileId}/download`, { params });
  }

  /**
   * Delete a file
   */
  deleteFile(fileId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/files/${fileId}`);
  }

  /**
   * Rename a file
   */
  renameFile(fileId: string, name: string): Observable<ApiResponse<{ id: string; originalName: string }>> {
    return this.http.patch<ApiResponse<{ id: string; originalName: string }>>(`${this.baseUrl}/files/${fileId}/rename`, { name });
  }

  /**
   * Move a file to another folder
   */
  moveFile(fileId: string, targetFolderId: string): Observable<ApiResponse<{ id: string; folderId: string }>> {
    return this.http.patch<ApiResponse<{ id: string; folderId: string }>>(`${this.baseUrl}/files/${fileId}/move`, { targetFolderId });
  }

  /**
   * Create a new folder
   */
  createFolder(parentFolderId: string, name: string): Observable<ApiResponse<FolderNode>> {
    return this.http.post<ApiResponse<FolderNode>>(`${this.baseUrl}/folders`, { parentFolderId, name });
  }

  /**
   * Delete a folder
   */
  deleteFolder(folderId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/folders/${folderId}`);
  }

  /**
   * Rename a folder
   */
  renameFolder(folderId: string, name: string): Observable<ApiResponse<FolderNode>> {
    return this.http.patch<ApiResponse<FolderNode>>(`${this.baseUrl}/folders/${folderId}/rename`, { name });
  }

  /**
   * Add year folder to client
   */
  addYearFolder(clientId: string, year: string): Observable<ApiResponse<FolderNode>> {
    return this.http.post<ApiResponse<FolderNode>>(`${this.baseUrl}/clients/${clientId}/years`, { year });
  }

  /**
   * Download file
   */
  downloadFile(url: string, fileName: string): void {
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Format file size for display
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Get file icon based on MIME type
   */
  getFileIcon(mimeType: string): string {
    if (mimeType.includes('pdf')) return 'heroDocumentTextSolid';
    if (mimeType.includes('image')) return 'heroPhotographSolid';
    if (mimeType.includes('word') || mimeType.includes('document')) return 'heroDocumentSolid';
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'heroTableCellsSolid';
    if (mimeType.includes('text')) return 'heroDocumentTextSolid';
    if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('archive')) return 'heroArchiveBoxArrowDownSolid';
    return 'heroDocumentSolid';
  }

  /**
   * Get file type for preview
   */
  getFileType(mimeType: string): 'pdf' | 'image' | 'other' {
    if (mimeType.includes('pdf')) return 'pdf';
    if (mimeType.includes('image')) return 'image';
    return 'other';
  }
}
