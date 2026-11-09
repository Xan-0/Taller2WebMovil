import { Component, OnInit, inject, signal, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { RouterLink } from '@angular/router';
import { TareasService } from '../../services/tareas.service';
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
    RouterLink,
    MatToolbar
],
  templateUrl: './calendar.html',
  styleUrls: ['./calendar.scss'],
  encapsulation: ViewEncapsulation.None
})
export class Calendar implements OnInit {
  private tareasService = inject(TareasService);
  
  tareas = signal<any[]>([]);
  fechaSeleccionada: Date = new Date();
  tareasDelDia = signal<any[]>([]);

  ngOnInit() {
    this.cargarTareas();
  }

  cargarTareas() {
    this.tareasService.getTareas().subscribe({
      next: (data) => {
        this.tareas.set(data);
        this.filtrarTareasPorFecha(this.fechaSeleccionada);
      },
      error: (err) => console.error('Error al cargar tareas', err)
    });
  }

  onDateChange(event: Date | null) {
    if (event) {
      this.fechaSeleccionada = event;
      this.filtrarTareasPorFecha(event);
    }
  }

  filtrarTareasPorFecha(fecha: Date) {
    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    const fechaStr = `${anio}-${mes}-${dia}`;

    const filtradas = this.tareas().filter(t => t.fecha === fechaStr);
    this.tareasDelDia.set(filtradas);
  }

  dateClass = (cellDate: Date): string => {
    const anio = cellDate.getFullYear();
    const mes = String(cellDate.getMonth() + 1).padStart(2, '0');
    const dia = String(cellDate.getDate()).padStart(2, '0');
    const fechaStr = `${anio}-${mes}-${dia}`;

    const tienePorHacer = this.tareas().some(
      t => t.fecha === fechaStr && t.estado.toLowerCase() === 'por hacer'
    );

    return tienePorHacer ? 'highlight-todo-date' : '';
  };
}