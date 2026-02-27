import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';

export interface User {
  id: string;
  name: string;
  mobile: string;
  role: 'admin' | 'client' | string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
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
export class UserService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/users`;

  getUsers(
    page: number = 1,
    limit: number = 10,
    search?: string,
    role?: string,
    isActive?: boolean
  ): Observable<PaginatedResponse<User>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (search) params = params.set('search', search);
    if (role) params = params.set('role', role);
    if (isActive !== undefined) params = params.set('isActive', isActive.toString());

    return this.http.get<PaginatedResponse<User>>(this.baseUrl, { params });
  }

  getUser(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/${id}`);
  }

  createUser(userData: Partial<User>): Observable<any> {
    return this.http.post(this.baseUrl, userData);
  }

  updateUser(id: string, userData: Partial<User>): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, userData);
  }

  deleteUser(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}
