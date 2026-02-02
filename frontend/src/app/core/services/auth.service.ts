import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError, BehaviorSubject } from 'rxjs';
import { environment } from '@environments/environment';

export interface User {
  id: string;
  name: string;
  mobile: string;
  role: 'admin' | 'client';
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
    user: User;
  };
}

export interface TokenPayload {
  userId: string;
  mobile: string;
  role: string;
  exp: number;
  iat: number;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private currentUserSignal = signal<User | null>(null);
  private isAuthenticatedSignal = signal<boolean>(false);

  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly isAuthenticated = this.isAuthenticatedSignal.asReadonly();
  readonly isAdmin = computed(() => this.currentUser()?.role === 'admin');

  constructor() {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    const token = this.getAccessToken();
    const user = localStorage.getItem('user');

    if (token && user && !this.isTokenExpired(token)) {
      this.currentUserSignal.set(JSON.parse(user));
      this.isAuthenticatedSignal.set(true);
    } else {
      this.clearStorage();
    }
  }

  sendOTP(mobile: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/auth/send-otp`, { mobile });
  }

  verifyOTP(mobile: string, otp: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/verify-otp`, { mobile, otp })
      .pipe(
        tap((response) => this.handleAuthResponse(response)),
        catchError((error) => throwError(() => error))
      );
  }

  adminLogin(mobile: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/admin-login`, { mobile, password })
      .pipe(
        tap((response) => this.handleAuthResponse(response)),
        catchError((error) => throwError(() => error))
      );
  }

  refreshToken(): Observable<{ accessToken: string; refreshToken: string }> {
    const refreshToken = this.getRefreshToken();
    return this.http
      .post<any>(`${environment.apiUrl}/auth/refresh-token`, { refreshToken })
      .pipe(
        tap((response) => {
          localStorage.setItem('accessToken', response.data.accessToken);
          localStorage.setItem('refreshToken', response.data.refreshToken);
        }),
        catchError((error) => {
          this.logout();
          return throwError(() => error);
        })
      );
  }

  logout(): void {
    const accessToken = this.getAccessToken();
    if (accessToken) {
      this.http.post(`${environment.apiUrl}/auth/logout`, {}).subscribe({
        complete: () => this.clearAndRedirect(),
        error: () => this.clearAndRedirect(),
      });
    } else {
      this.clearAndRedirect();
    }
  }

  changePassword(oldPassword: string, newPassword: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/auth/change-password`, {
      oldPassword,
      newPassword,
    });
  }

  getProfile(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/auth/me`);
  }

  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  isTokenExpired(token: string): boolean {
    try {
      const payload = this.decodeToken(token);
      if (!payload || !payload.exp) return true;
      return Date.now() >= payload.exp * 1000;
    } catch {
      return true;
    }
  }

  private decodeToken(token: string): TokenPayload | null {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(window.atob(base64));
    } catch {
      return null;
    }
  }

  private handleAuthResponse(response: AuthResponse): void {
    if (response.success && response.data) {
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      this.currentUserSignal.set(response.data.user);
      this.isAuthenticatedSignal.set(true);
    }
  }

  private clearStorage(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    this.currentUserSignal.set(null);
    this.isAuthenticatedSignal.set(false);
  }

  private clearAndRedirect(): void {
    this.clearStorage();
    this.router.navigate(['/auth/login']);
  }
}
