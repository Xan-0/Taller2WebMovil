
export interface Usuario {
  uid: number;
  nombre: string;
  password_hash?: string; 
  tareas?: Tarea[];
}

export interface Tarea {
  id?: number; 
  uid: number; 
  titulo: string;
  descripcion?: string | null;
  fecha: string;
  inicio_minutos: number;
  duracion_minutos: number;
  estado: 'por hacer' | 'en progreso' | 'completada';
  prioridad?: 'baja' | 'media' | 'alta' | null;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface UserLogin {
  nombre: string;
  password_hash: string;
}