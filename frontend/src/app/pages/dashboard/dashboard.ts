import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { resource } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';

import { TareasService, Tarea, TareaCreate } from '../../services/tareas.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatToolbarModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatIconModule
  ],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class Dashboard {
  private tareasService = inject(TareasService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);

  displayedColumns: string[] = ['titulo', 'descripcion', 'fecha', 'estado', 'prioridad', 'acciones'];

  private refreshTrigger = signal<number>(0);

  tareasResource = resource({
    loader: async () => {
      this.refreshTrigger(); // Vincula reactivamente la señal
      return await firstValueFrom(this.tareasService.getTareas());
    }
  });

  editingTaskId = signal<number | null>(null);

  tareaForm: FormGroup = this.fb.group({
    titulo: ['', [Validators.required]],
    descripcion: [''],
    fecha: [new Date().toISOString().split('T')[0], [Validators.required]],
    inicio_minutos: [0, [Validators.required, Validators.min(0), Validators.max(1439)]],
    duracion_minutos: [60, [Validators.required, Validators.min(1)]],
    estado: ['por hacer', [Validators.required]],
    prioridad: ['media']
  });

  guardarTarea() {
    if (this.tareaForm.invalid) {
      this.snackBar.open('Completa los campos requeridos', 'Cerrar', { duration: 3000 });
      return;
    }

    const payload: TareaCreate = this.tareaForm.value;
    const currentId = this.editingTaskId();

    if (currentId !== null) {
      this.tareasService.actualizarTarea(currentId, payload).subscribe({
        next: () => {
          this.snackBar.open('Tarea actualizada', 'Cerrar', { duration: 3000 });
          this.resetForm();
          this.refreshTrigger.update(n => n + 1);
        },
        error: () => {
          this.snackBar.open('Error al actualizar', 'Cerrar', { duration: 3000 });
        }
      });
    } else {
      this.tareasService.crearTarea(payload).subscribe({
        next: () => {
          this.snackBar.open('Tarea creada con éxito', 'Cerrar', { duration: 3000 });
          this.resetForm();
          this.refreshTrigger.update(n => n + 1);
        },
        error: () => {
          this.snackBar.open('Error al crear tarea', 'Cerrar', { duration: 3000 });
        }
      });
    }
  }

  cargarParaEditar(tarea: Tarea) {
    this.editingTaskId.set(tarea.id);
    this.tareaForm.patchValue({
      titulo: tarea.titulo,
      descripcion: tarea.descripcion,
      fecha: tarea.fecha,
      inicio_minutos: tarea.inicio_minutos,
      duracion_minutos: tarea.duracion_minutos,
      estado: tarea.estado,
      prioridad: tarea.prioridad
    });
  }

  cancelarEdicion() {
    this.resetForm();
  }

  eliminarTarea(id: number) {
    if (confirm('¿Estás seguro de eliminar esta tarea?')) {
      this.tareasService.eliminarTarea(id).subscribe({
        next: () => {
          this.snackBar.open('Tarea eliminada', 'Cerrar', { duration: 3000 });
          this.refreshTrigger.update(n => n + 1);
        },
        error: () => {
          this.snackBar.open('Error al eliminar', 'Cerrar', { duration: 3000 });
        }
      });
    }
  }

  resetForm() {
    this.editingTaskId.set(null);
    this.tareaForm.reset({
      titulo: '',
      descripcion: '',
      fecha: new Date().toISOString().split('T')[0],
      inicio_minutos: 0,
      duracion_minutos: 60,
      estado: 'por hacer',
      prioridad: 'media'
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}