import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  organizationId: string;
  clientId: string;
  branchId: string;
  invoiceDate: string;
  dueDate: string;
  financialYear: string;
  status: 'DRAFT' | 'ISSUED' | 'PARTIALLY_PAID' | 'FULLY_PAID' | 'OVERDUE' | 'CANCELLED';
  serviceCategory?: string;
  gstSlab: number;
  subtotal: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  totalTax: number;
  grandTotal: number;
  amountPaid: number;
  outstandingAmount: number;
  client?: any;
}

export interface MetricSummary {
  totalOutstanding: number;
  totalOverdue: number;
  draftInvoices: number;
  revenueForecast30Days: number;
}

@Injectable({
  providedIn: 'root'
})
export class BillingService {
  private apiUrl = `${environment.apiUrl}/billing`;

  constructor(private http: HttpClient) { }

  getInvoices(params?: any): Observable<{ data: Invoice[], total: number }> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
          httpParams = httpParams.set(key, params[key]);
        }
      });
    }
    return this.http.get<{ data: Invoice[], total: number }>(`${this.apiUrl}/invoices`, { params: httpParams });
  }

  getInvoiceMetrics(): Observable<MetricSummary> {
    return this.http.get<MetricSummary>(`${this.apiUrl}/metrics`);
  }

  getInvoiceById(id: string): Observable<Invoice> {
    return this.http.get<Invoice>(`${this.apiUrl}/invoices/${id}`);
  }

  sendWhatsAppReminder(id: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/invoices/${id}/whatsapp`, {});
  }

  issueInvoice(id: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/invoices/${id}/issue`, {});
  }

  downloadPdf(id: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/invoices/${id}/pdf`, { responseType: 'blob' });
  }
}
