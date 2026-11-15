import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';
import { environment } from '../../environments/environment.prod';

export interface UsuarioSesion {
  uid: number;
  nombre: string;
  email: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;

  public isAuthenticated = signal<boolean>(!!localStorage.getItem('token'));

  constructor(private http: HttpClient) {}

  // El backend inicia sesión con email + password
  login(credentials: { email: string; password: string }) {
    return this.http
      .post<{ access_token: string; usuario: UsuarioSesion }>(`${this.apiUrl}/auth/login`, credentials)
      .pipe(
        tap(response => {
          localStorage.setItem('token', response.access_token);
          localStorage.setItem('usuario', JSON.stringify(response.usuario));
          this.isAuthenticated.set(true);
        })
      );
  }

  register(data: { nombre: string; email: string; password: string }) {
    return this.http.post(`${this.apiUrl}/auth/register`, data);
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    this.isAuthenticated.set(false);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUid(): number | null {
    try {
      return JSON.parse(localStorage.getItem('usuario') || 'null')?.uid ?? null;
    } catch {
      return null;
    }
  }
}
