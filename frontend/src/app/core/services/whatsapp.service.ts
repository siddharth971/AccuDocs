
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface WhatsAppSession {
  state: string;
  userId?: string;
  clientId?: string;
  clientCode?: string;
  selectedYear?: string;
  lastActivity: number;
}

// Add interface for WhatsApp Status
export interface WhatsAppStatus {
  status: 'INITIALIZING' | 'QR_READY' | 'AUTHENTICATED' | 'DISCONNECTED';
  qrCode: string | null;
}

// Add interface for WhatsApp Chat
export interface WhatsAppChat {
  id: string;
  name: string;
  unreadCount: number;
  lastMessage: {
    body: string;
    timestamp: number;
  } | null;
}

@Injectable({
  providedIn: 'root'
})
export class WhatsAppService {
  private http = inject(HttpClient);
  // private apiUrl = `${environment.apiUrl}/whatsapp`; // Keep original, but can be inferred from context
  private apiUrl = `${environment.apiUrl}/whatsapp`;

  sendMessage(to: string, message: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/send`, { to, message });
  }

  getSession(mobile: string): Observable<WhatsAppSession> {
    return this.http.get<any>(`${this.apiUrl}/session/${mobile}`).pipe(
      map(response => response.data)
    );
  }

  clearSession(mobile: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/session/${mobile}`);
  }

  getQR(): Observable<WhatsAppStatus> {
    return this.http.get<any>(`${this.apiUrl}/qr`).pipe(
      map(response => response.data)
    );
  }

  logoutBot(): Observable<any> {
    return this.http.post(`${this.apiUrl}/logout`, {});
  }

  getChats(): Observable<WhatsAppChat[]> {
    return this.http.get<any>(`${this.apiUrl}/chats`).pipe(
      map(response => response.data)
    );
  }
}
