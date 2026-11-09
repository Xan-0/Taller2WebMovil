import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { TareasService, Tarea } from '../../services/tareas.service';

@Component({
  selector: 'app-diagram',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule
  ],
  templateUrl: './diagram.html',
  styleUrls: ['./diagram.scss']
})
export class Diagram {
  private tareasService = inject(TareasService);
  private router = inject(Router);

  tareas = signal<Tarea[]>([]);
  loading = signal<boolean>(true);

  constructor() {
    this.tareasService.getTareas().subscribe({
      next: (data) => {
        this.tareas.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  calcularPosicion(minutos: number): string {
    const porcentaje = (minutos / 1440) * 100;
    return `${porcentaje}%`;
  }

  calcularAncho(duracion: number): string {
    const porcentaje = (duracion / 1440) * 100;
    return `${porcentaje}%`;
  }

  volver() {
    this.router.navigate(['/dashboard']);
  }
}