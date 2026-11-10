import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  obtenerPerfil(): Observable<any> {
    return this.http.get(`${this.apiUrl}/auth/perfil`);
  }

  actualizarPerfil(data: { nombre?: string; password_hash?: string }): Observable<any> {
    return this.http.put(`${this.apiUrl}/auth/perfil`, data);
  }
}