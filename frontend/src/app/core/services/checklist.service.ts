import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';

export type ChecklistItemStatus = 'pending' | 'received' | 'not_applicable' | 'rejected';

export interface ChecklistItem {
  id: string;
  label: string;
  description?: string;
  category?: string;
  required: boolean;
  status: ChecklistItemStatus;
  receivedDate?: string;
  fileId?: string;
  fileName?: string;
  rejectionReason?: string;
  notes?: string;
}

export interface Checklist {
  id: string;
  clientId: string;
  templateId?: string;
  name: string;
  financialYear: string;
  serviceType: string;
  items: ChecklistItem[];
  progress: number;
  totalItems: number;
  receivedItems: number;
  status: 'active' | 'completed' | 'archived';
  dueDate?: string;
  completedAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  creator?: {
    id: string;
    name: string;
  };
}

export interface ChecklistTemplate {
  id: string;
  name: string;
  serviceType: string;
  description?: string;
  items: any[];
  isDefault: boolean;
}

export interface CreateChecklistDto {
  clientId: string;
  templateId?: string;
  name: string;
  financialYear: string;
  serviceType: string;
  dueDate?: string;
  notes?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChecklistService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/checklists`;

  // ========== TEMPLATES ==========

  getTemplates(): Observable<{ success: boolean; data: ChecklistTemplate[] }> {
    return this.http.get<{ success: boolean; data: ChecklistTemplate[] }>(`${this.baseUrl}/templates`);
  }

  // ========== CHECKLISTS ==========

  getChecklists(params: {
    clientId?: string;
    financialYear?: string;
    status?: string;
    page?: number;
    limit?: number;
  } = {}): Observable<any> {
    let httpParams = new HttpParams();
    if (params.clientId) httpParams = httpParams.set('clientId', params.clientId);
    if (params.financialYear) httpParams = httpParams.set('financialYear', params.financialYear);
    if (params.status) httpParams = httpParams.set('status', params.status);
    if (params.page) httpParams = httpParams.set('page', params.page);
    if (params.limit) httpParams = httpParams.set('limit', params.limit);

    return this.http.get(this.baseUrl, { params: httpParams });
  }

  getClientChecklists(clientId: string): Observable<{ success: boolean; data: Checklist[] }> {
    return this.http.get<{ success: boolean; data: Checklist[] }>(`${this.baseUrl}/client/${clientId}`);
  }

  getChecklist(id: string): Observable<{ success: boolean; data: Checklist }> {
    return this.http.get<{ success: boolean; data: Checklist }>(`${this.baseUrl}/${id}`);
  }

  createChecklist(data: CreateChecklistDto): Observable<{ success: boolean; data: Checklist }> {
    return this.http.post<{ success: boolean; data: Checklist }>(this.baseUrl, data);
  }

  updateChecklist(id: string, data: Partial<Checklist>): Observable<any> {
    return this.http.patch(`${this.baseUrl}/${id}`, data);
  }

  deleteChecklist(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  // ========== ITEMS ==========

  addItem(checklistId: string, item: { label: string; description?: string; required?: boolean }): Observable<any> {
    return this.http.post(`${this.baseUrl}/${checklistId}/items`, item);
  }

  updateItemStatus(
    checklistId: string,
    itemId: string,
    status: ChecklistItemStatus,
    extraData: { notes?: string; rejectionReason?: string } = {}
  ): Observable<any> {
    return this.http.patch(`${this.baseUrl}/${checklistId}/items/${itemId}/status`, { status, ...extraData });
  }

  bulkUpdateItems(checklistId: string, updates: { itemId: string; status: ChecklistItemStatus }[]): Observable<any> {
    return this.http.patch(`${this.baseUrl}/${checklistId}/items/bulk-update`, { updates });
  }

  removeItem(checklistId: string, itemId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${checklistId}/items/${itemId}`);
  }

  // ========== STATS ==========

  getStats(clientId?: string): Observable<any> {
    let params = new HttpParams();
    if (clientId) params = params.set('clientId', clientId);
    return this.http.get(`${this.baseUrl}/stats`, { params });
  }
}
