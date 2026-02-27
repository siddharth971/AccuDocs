import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';

export type DeadlineType = 'ITR' | 'GST' | 'TDS' | 'ROC' | 'ADVANCE_TAX' | 'OTHER';
export type ClientDeadlineStatus = 'pending' | 'filed' | 'overdue';

export interface ComplianceDeadline {
  id: string;
  type: DeadlineType;
  title: string;
  dueDate: string;
  recurring: boolean;
  recurringPattern?: string;
  description?: string;
  isSeeded: boolean;
  clientDeadlines?: ClientDeadlineAssignment[];
  createdAt: string;
  updatedAt: string;
}

export interface ClientDeadlineAssignment {
  id: string;
  clientId: string;
  deadlineId: string;
  status: ClientDeadlineStatus;
  filedDate?: string;
  notes?: string;
  client?: {
    id: string;
    code: string;
    name: string;
    user: { id: string; name: string; mobile: string };
  };
  deadline?: ComplianceDeadline;
  createdAt: string;
  updatedAt: string;
}

export interface ComplianceStats {
  totalDeadlines: number;
  upcoming: number;
  overdue: number;
  filed: number;
  pending: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

@Injectable({
  providedIn: 'root',
})
export class ComplianceService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/compliance`;

  // ========== DEADLINES ==========

  getDeadlines(params?: {
    type?: string;
    month?: number;
    year?: number;
    startDate?: string;
    endDate?: string;
  }): Observable<ApiResponse<ComplianceDeadline[]>> {
    let httpParams = new HttpParams();
    if (params?.type) httpParams = httpParams.set('type', params.type);
    if (params?.month) httpParams = httpParams.set('month', params.month.toString());
    if (params?.year) httpParams = httpParams.set('year', params.year.toString());
    if (params?.startDate) httpParams = httpParams.set('startDate', params.startDate);
    if (params?.endDate) httpParams = httpParams.set('endDate', params.endDate);
    return this.http.get<ApiResponse<ComplianceDeadline[]>>(`${this.baseUrl}/deadlines`, { params: httpParams });
  }

  getDeadline(id: string): Observable<ApiResponse<ComplianceDeadline>> {
    return this.http.get<ApiResponse<ComplianceDeadline>>(`${this.baseUrl}/deadlines/${id}`);
  }

  createDeadline(data: {
    type: DeadlineType;
    title: string;
    dueDate: string;
    recurring?: boolean;
    recurringPattern?: string;
    description?: string;
  }): Observable<ApiResponse<ComplianceDeadline>> {
    return this.http.post<ApiResponse<ComplianceDeadline>>(`${this.baseUrl}/deadlines`, data);
  }

  updateDeadline(id: string, data: Partial<ComplianceDeadline>): Observable<ApiResponse<ComplianceDeadline>> {
    return this.http.patch<ApiResponse<ComplianceDeadline>>(`${this.baseUrl}/deadlines/${id}`, data);
  }

  deleteDeadline(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/deadlines/${id}`);
  }

  // ========== CLIENT ASSIGNMENTS ==========

  assignClient(deadlineId: string, clientId: string, notes?: string): Observable<ApiResponse<ClientDeadlineAssignment>> {
    return this.http.post<ApiResponse<ClientDeadlineAssignment>>(`${this.baseUrl}/deadlines/${deadlineId}/assign`, { clientId, notes });
  }

  bulkAssignClients(deadlineId: string, clientIds: string[]): Observable<ApiResponse<ClientDeadlineAssignment[]>> {
    return this.http.post<ApiResponse<ClientDeadlineAssignment[]>>(`${this.baseUrl}/deadlines/${deadlineId}/bulk-assign`, { clientIds });
  }

  getClientDeadlines(params?: {
    clientId?: string;
    deadlineId?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  }): Observable<ApiResponse<ClientDeadlineAssignment[]>> {
    let httpParams = new HttpParams();
    if (params?.clientId) httpParams = httpParams.set('clientId', params.clientId);
    if (params?.deadlineId) httpParams = httpParams.set('deadlineId', params.deadlineId);
    if (params?.status) httpParams = httpParams.set('status', params.status);
    if (params?.startDate) httpParams = httpParams.set('startDate', params.startDate);
    if (params?.endDate) httpParams = httpParams.set('endDate', params.endDate);
    return this.http.get<ApiResponse<ClientDeadlineAssignment[]>>(`${this.baseUrl}/client-deadlines`, { params: httpParams });
  }

  updateClientDeadline(id: string, data: {
    status?: ClientDeadlineStatus;
    filedDate?: string;
    notes?: string;
  }): Observable<ApiResponse<ClientDeadlineAssignment>> {
    return this.http.patch<ApiResponse<ClientDeadlineAssignment>>(`${this.baseUrl}/client-deadlines/${id}`, data);
  }

  removeClientDeadline(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/client-deadlines/${id}`);
  }

  // ========== STATS & WIDGETS ==========

  getStats(year?: number): Observable<ApiResponse<ComplianceStats>> {
    let httpParams = new HttpParams();
    if (year) httpParams = httpParams.set('year', year.toString());
    return this.http.get<ApiResponse<ComplianceStats>>(`${this.baseUrl}/stats`, { params: httpParams });
  }

  getUpcomingThisWeek(): Observable<ApiResponse<ClientDeadlineAssignment[]>> {
    return this.http.get<ApiResponse<ClientDeadlineAssignment[]>>(`${this.baseUrl}/upcoming`);
  }

  getOverdue(): Observable<ApiResponse<ClientDeadlineAssignment[]>> {
    return this.http.get<ApiResponse<ClientDeadlineAssignment[]>>(`${this.baseUrl}/overdue`);
  }
}
