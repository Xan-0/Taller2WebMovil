import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.prod';

export interface Evento {
  id: number;
  usuario_host: number;
  nombre: string;
  descripcion?: string | null;
  distancia_maxima_metros: number;
  ubicacion_url: string;
  latitud: number;
  longitud: number;
  fecha_inicio: string;
  duracion_dias: number;
}

export type EventoCreate = Omit<Evento, 'id' | 'usuario_host'>;

export interface AsistenciaCreate {
  id_evento: number;
  latitud_actual?: number | null;
  longitud_actual?: number | null;
}

export interface Asistencia {
  id_evento: number;
  uid: number;
  fecha_registro?: string | null;
}

@Injectable({ providedIn: 'root' })
export class EventosService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/eventos`;

  getEventos(): Observable<Evento[]> {
    return this.http.get<Evento[]>(this.apiUrl);
  }

  crearEvento(evento: EventoCreate): Observable<Evento> {
    return this.http.post<Evento>(this.apiUrl, evento);
  }

  eliminarEvento(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  misAsistencias(): Observable<number[]> {
    return this.http.get<number[]>(`${this.apiUrl}/mis-asistencias`);
  }

  confirmarAsistencia(data: AsistenciaCreate): Observable<Asistencia> {
    return this.http.post<Asistencia>(`${this.apiUrl}/asistencia`, data);
  }
}



