import { Component, OnInit, computed, inject, signal, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { TareasService, Tarea, TareaCreate } from '../../services/tareas.service';
import { EventosService, Evento } from '../../services/eventos.service';
import { ElementoCalendario } from '../../models/app.models';
import { MatToolbar } from '@angular/material/toolbar';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonToggleModule,
    RouterLink,
    MatToolbar
  ],
  templateUrl: './calendar.html',
  styleUrls: ['./calendar.scss'],
  encapsulation: ViewEncapsulation.None
})
export class Calendar implements OnInit {
  private tareasService = inject(TareasService);
  private eventosService = inject(EventosService);

  elementos = signal<ElementoCalendario[]>([]);
  asistenciasIds = signal<Set<number>>(new Set());
  filtroTipo = signal<'todos' | 'tarea' | 'evento'>('todos');
  fechaSeleccionada = signal<Date>(new Date());

elementosDelDia = computed(() => {
    const fechaStr = this.formatearFechaLocal(this.fechaSeleccionada());
    const tipoFiltro = this.filtroTipo();

    return this.elementos().filter((item) => {
      const coincideFecha = item.fecha === fechaStr;
      const coincideTipo = tipoFiltro === 'todos' || item.tipo === tipoFiltro;
      return coincideFecha && coincideTipo;
    });
  });

  ngOnInit() {
    this.cargarAgenda();
  }

  cargarAgenda() {
    forkJoin({
      tareas: this.tareasService.getTareas(),
      eventos: this.eventosService.getEventos(),
      asistencias: this.eventosService.misAsistencias(),
    }).subscribe({
      next: ({ tareas, eventos, asistencias }) => {
        this.asistenciasIds.set(new Set(asistencias));
        const mapTareas = tareas.map((t) => this.mapTarea(t));
        const mapEventos = eventos.flatMap((e) => this.mapEvento(e));
        this.elementos.set([...mapTareas, ...mapEventos]);
      },
      error: (err) => console.error('Error al cargar la agenda', err),
    });
  }

  private mapTarea(t: Tarea): ElementoCalendario {
    const horas = String(Math.floor((t.inicio_minutos ?? 0) / 60)).padStart(2, '0');
    const mins = String((t.inicio_minutos ?? 0) % 60).padStart(2, '0');
    return {
      id: `tarea-${t.id}`,
      origenId: t.id,
      tipo: 'tarea',
      titulo: t.titulo,
      descripcion: t.descripcion || undefined,
      fecha: t.fecha,
      horaTexto: `${horas}:${mins}`,
      estado: t.estado,
      prioridad: t.prioridad,
      eventoId: t.id_evento ?? null,
    };
  }

  private mapEvento(e: Evento): ElementoCalendario[] {
    const dias = Math.max(1, e.duracion_dias || 1);
    const [anio, mes, dia] = e.fecha_inicio.split('-').map(Number);
    const base = new Date(anio, (mes || 1) - 1, dia || 1);
    const lista: ElementoCalendario[] = [];

    for (let i = 0; i < dias; i++) {
      const actual = new Date(base);
      actual.setDate(base.getDate() + i);
      lista.push({
        id: `evento-${e.id}-d${i + 1}`,
        origenId: e.id,
        tipo: 'evento',
        titulo: dias > 1 ? `${e.nombre} (Día ${i + 1}/${dias})` : e.nombre,
        descripcion: e.descripcion || `Radio GPS: ${e.distancia_maxima_metros}m`,
        fecha: this.formatearFechaLocal(actual),
        horaTexto: 'Evento',
        ubicacionUrl: e.ubicacion_url,
      });
    }
    return lista;
  }

crearTareaDesdeEvento(item: ElementoCalendario) {
    if (item.tipo !== 'evento') return;

    const nuevaTarea: TareaCreate = {
      titulo: `Preparar: ${item.titulo}`,
      descripcion: item.ubicacionUrl
        ? `Evento (${item.ubicacionUrl})`
        : (item.descripcion ?? ''),
      fecha: item.fecha, // YYYY-MM-DD
      inicio_minutos: 540, // 09:00
      duracion_minutos: 60, // entre 1 y 1439
      estado: 'por hacer',
      prioridad: 'media',
      categoria: 'general',
      id_evento: item.origenId,
    };

    this.tareasService.crearTarea(nuevaTarea).subscribe({
      next: () => this.cargarAgenda(),
      error: (err) => {
        console.error('Error 422 al crear tarea vinculada:', err.error ?? err);
      },
    });
  }

  onDateChange(event: Date | null) {
    if (event) {
      this.fechaSeleccionada.set(event);
    }
  }

  dateClass = (cellDate: Date): string => {
    const fechaStr = this.formatearFechaLocal(cellDate);
    const items = this.elementos().filter((item) => item.fecha === fechaStr);
    if (items.length === 0) return '';

    const tieneEvento = items.some((i) => i.tipo === 'evento');
    const tienePorHacer = items.some((i) => i.tipo === 'tarea' && i.estado?.toLowerCase() === 'por hacer');

    if (tieneEvento && tienePorHacer) return 'highlight-todo-date highlight-event-date';
    if (tieneEvento) return 'highlight-event-date';
    if (tienePorHacer) return 'highlight-todo-date';
    return '';
  };

  private formatearFechaLocal(fecha: Date): string {
    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    return `${anio}-${mes}-${dia}`;
  }
}