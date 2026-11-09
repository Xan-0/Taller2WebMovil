import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { TareasService } from '../../services/tareas.service';
import { MatToolbar } from '@angular/material/toolbar';

@Component({
  selector: 'app-kanban',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, RouterLink, MatToolbar],
  templateUrl: './kanban.html',
  styleUrls: ['./kanban.scss']
})
export class Kanban implements OnInit {
  private tareasService = inject(TareasService);
  tareas = signal<any[]>([]);

  ngOnInit() {
    this.cargarTareas();
  }

  cargarTareas() {
    this.tareasService.getTareas().subscribe({
      next: (data) => this.tareas.set(data),
      error: (err) => console.error('Error al cargar tareas', err)
    });
  }

  obtenerPorEstado(estado: string) {
    return this.tareas().filter(t => t.estado.toLowerCase() === estado.toLowerCase());
  }
}