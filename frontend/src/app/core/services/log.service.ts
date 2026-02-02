import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';

export interface Log {
  id: string;
  action: string;
  description: string;
  ip?: string;
  userAgent?: string;
  metadata?: any;
  user?: {
    id: string;
    name: string;
    mobile: string;
  };
  createdAt: string;
}

export interface LogStats {
  totalLogs: number;
  actionCounts: Record<string, number>;
  recentActivity: Log[];
}

@Injectable({
  providedIn: 'root',
})
export class LogService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/logs`;

  getLogs(
    page: number = 1,
    limit: number = 20,
    filters: {
      userId?: string;
      action?: string;
      startDate?: string;
      endDate?: string;
      search?: string;
    } = {}
  ): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (filters.userId) params = params.set('userId', filters.userId);
    if (filters.action) params = params.set('action', filters.action);
    if (filters.startDate) params = params.set('startDate', filters.startDate);
    if (filters.endDate) params = params.set('endDate', filters.endDate);
    if (filters.search) params = params.set('search', filters.search);

    return this.http.get(this.baseUrl, { params });
  }

  getMyLogs(limit: number = 50): Observable<any> {
    return this.http.get(`${this.baseUrl}/me`, {
      params: new HttpParams().set('limit', limit.toString()),
    });
  }

  getStats(days: number = 30): Observable<any> {
    return this.http.get(`${this.baseUrl}/stats`, {
      params: new HttpParams().set('days', days.toString()),
    });
  }

  cleanupLogs(retentionDays: number = 90): Observable<any> {
    return this.http.delete(`${this.baseUrl}/cleanup`, {
      params: new HttpParams().set('retentionDays', retentionDays.toString()),
    });
  }

  getActionLabel(action: string): string {
    const labels: Record<string, string> = {
      LOGIN: 'User Login',
      LOGOUT: 'User Logout',
      OTP_SENT: 'OTP Sent',
      OTP_VERIFIED: 'OTP Verified',
      CLIENT_CREATED: 'Client Created',
      CLIENT_UPDATED: 'Client Updated',
      CLIENT_DELETED: 'Client Deleted',
      DOCUMENT_UPLOADED: 'Document Uploaded',
      DOCUMENT_DOWNLOADED: 'Document Downloaded',
      DOCUMENT_DELETED: 'Document Deleted',
      WHATSAPP_MESSAGE: 'WhatsApp Message',
      ACCESS_DENIED: 'Access Denied',
      PASSWORD_CHANGED: 'Password Changed',
    };
    return labels[action] || action;
  }

  getActionIcon(action: string): string {
    const icons: Record<string, string> = {
      LOGIN: 'login',
      LOGOUT: 'logout',
      OTP_SENT: 'sms',
      OTP_VERIFIED: 'verified',
      CLIENT_CREATED: 'person_add',
      CLIENT_UPDATED: 'edit',
      CLIENT_DELETED: 'person_remove',
      DOCUMENT_UPLOADED: 'cloud_upload',
      DOCUMENT_DOWNLOADED: 'cloud_download',
      DOCUMENT_DELETED: 'delete',
      WHATSAPP_MESSAGE: 'chat',
      ACCESS_DENIED: 'block',
      PASSWORD_CHANGED: 'lock',
    };
    return icons[action] || 'event';
  }
}
