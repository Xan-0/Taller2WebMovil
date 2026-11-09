import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8000';

  obtenerPerfil(): Observable<any> {
    return this.http.get(`${this.apiUrl}/auth/perfil`);
  }

  actualizarPerfil(data: { username?: string; password?: string }): Observable<any> {
    return this.http.put(`${this.apiUrl}/auth/perfil`, data);
  }
}