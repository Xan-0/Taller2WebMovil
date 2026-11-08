import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Tarea {
    id: number;
    uid: number;
    titulo: string;
    descripcion: string;
    fecha: string;
    inicio_minutos: number;
    duracion_minutos: number;
    estado: string;
    prioridad?: string;
}

export type TareaCreate = Omit<Tarea, 'id' | 'uid'>;
export type TareaUpdate = Partial<TareaCreate>;

@Injectable({
    providedIn: 'root'
})
export class TareasService {
    private http = inject(HttpClient);
    private apiUrl = 'http://localhost:8000/tareas';

    getTareas(): Observable<Tarea[]> {
        return this.http.get<Tarea[]>(this.apiUrl);
    }

    crearTarea(tarea: TareaCreate): Observable<Tarea> {
        return this.http.post<Tarea>(this.apiUrl, tarea);
    }

    actualizarTarea(id: number, tarea: TareaUpdate): Observable<Tarea> {
        return this.http.put<Tarea>(`${this.apiUrl}/${id}`, tarea);
    }

    eliminarTarea(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
