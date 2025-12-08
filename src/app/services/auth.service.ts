import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';

export interface User {
  username: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  username: string;
  email: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = 'http://localhost:8080/api/auth';
  
  private currentUserSignal = signal<User | null>(null);
  private tokenSignal = signal<string | null>(null);
  
  public isAuthenticated = computed(() => this.currentUserSignal() !== null);
  public currentUser = computed(() => this.currentUserSignal());
  
  constructor() {
    this.loadUserFromStorage();
  }
  
  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, request)
      .pipe(
        tap(response => this.handleAuthSuccess(response)),
        catchError(this.handleError)
      );
  }
  
  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, request)
      .pipe(
        tap(response => {
          console.log('Auth successful, storing token');
          this.handleAuthSuccess(response);
        }),
        catchError((error: HttpErrorResponse) => {
          console.error('Login error in service:', error);
          return throwError(() => error);
        })
      );
  }
  
  logout(): void {
    this.currentUserSignal.set(null);
    this.tokenSignal.set(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }
  
  getToken(): string | null {
    return this.tokenSignal();
  }
  
  private handleAuthSuccess(response: AuthResponse): void {
    console.log('Handling auth success:', response);
    this.tokenSignal.set(response.token);
    this.currentUserSignal.set({
      username: response.username,
      email: response.email
    });
    
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify({
      username: response.username,
      email: response.email
    }));
    
    console.log('Token stored:', this.tokenSignal());
    console.log('User stored:', this.currentUserSignal());
  }
  
  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('HTTP Error:', error);
    return throwError(() => error);
  }
  
  private loadUserFromStorage(): void {
    const token = localStorage.getItem('token');
    const userJson = localStorage.getItem('user');
    
    if (token && userJson) {
      try {
        this.tokenSignal.set(token);
        this.currentUserSignal.set(JSON.parse(userJson));
        console.log('Restored session from storage');
      } catch (e) {
        console.error('Failed to restore session:', e);
        this.logout();
      }
    }
  }
}