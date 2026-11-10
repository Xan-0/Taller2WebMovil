import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';
import { environment } from '../../environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl; 

  public isAuthenticated = signal<boolean>(!!localStorage.getItem('token'));

  constructor(private http: HttpClient) {}

  login(credentials: { nombre: string; password: string }) {
    return this.http.post<{ access_token: string }>(`${this.apiUrl}/auth/login`, credentials).pipe(
      tap(response => {
        localStorage.setItem('token', response.access_token);
        this.isAuthenticated.set(true);
      })
    );
  }

  logout() {
    localStorage.removeItem('token');
    this.isAuthenticated.set(false);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }
}