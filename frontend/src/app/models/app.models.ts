export interface ConfiguracionUsuario {
  agitar_para_escanear: boolean;
  musica_fondo: boolean;
  volumen_musica: number;
}

export type TipoElementoCalendario = 'tarea' | 'evento';

export interface ElementoCalendario {
  id: string; // ej. 'tarea-12' o 'evento-4' para evitar colisiones de ID numérico
  origenId: number;
  tipo: TipoElementoCalendario;
  titulo: string;
  descripcion?: string;
  fecha: string; // YYYY-MM-DD (para eventos de varios días, puedes expandir o marcar rango)
  horaTexto?: string; // ej. '14:30' a partir de inicio_minutos en tareas, o 'Todo el día' / horario del evento
  estado?: string; // en tareas: 'por hacer' | 'en progreso' | 'completada'
  prioridad?: string;
  ubicacionUrl?: string;
  eventoId?: number | null;
}