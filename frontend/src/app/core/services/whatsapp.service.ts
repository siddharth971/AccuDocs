
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

export interface WhatsAppSession {
  state: string;
  userId?: string;
  clientId?: string;
  clientCode?: string;
  selectedYear?: string;
  lastActivity: number;
}

@Injectable({
  providedIn: 'root'
})
export class WhatsAppService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/whatsapp`;

  sendMessage(to: string, message: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/send`, { to, message });
  }

  getSession(mobile: string): Observable<WhatsAppSession> {
    return this.http.get<WhatsAppSession>(`${this.apiUrl}/session/${mobile}`);
  }

  clearSession(mobile: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/session/${mobile}`);
  }
}
