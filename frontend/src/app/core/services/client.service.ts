import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';

export interface Client {
  id: string;
  code: string;
  user: {
    id: string;
    name: string;
    mobile: string;
    isActive: boolean;
  };
  years: {
    id: string;
    year: string;
    documentCount: number;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateClientDto {
  name: string;
  mobile: string;
  code: string;
}

export interface UpdateClientDto {
  name?: string;
  mobile?: string;
  code?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

@Injectable({
  providedIn: 'root',
})
export class ClientService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/clients`;

  getClients(
    page: number = 1,
    limit: number = 10,
    search?: string,
    sortBy?: string,
    sortOrder?: 'asc' | 'desc'
  ): Observable<PaginatedResponse<Client>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (search) params = params.set('search', search);
    if (sortBy) params = params.set('sortBy', sortBy);
    if (sortOrder) params = params.set('sortOrder', sortOrder);

    return this.http.get<PaginatedResponse<Client>>(this.baseUrl, { params });
  }

  getClient(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/${id}`);
  }

  getClientByCode(code: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/code/${code}`);
  }

  createClient(data: CreateClientDto): Observable<any> {
    return this.http.post(this.baseUrl, data);
  }

  updateClient(id: string, data: UpdateClientDto): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, data);
  }

  deleteClient(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }

  toggleClientActive(id: string): Observable<any> {
    return this.http.patch(`${this.baseUrl}/${id}/toggle-active`, {});
  }

  getNextCode(): Observable<any> {
    return this.http.get(`${this.baseUrl}/next-code`);
  }
}
