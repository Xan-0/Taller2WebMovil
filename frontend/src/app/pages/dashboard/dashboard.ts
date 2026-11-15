import { Component, computed, inject, signal, resource } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  ValidatorFn,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
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

export type Orden = 'llegada' | 'fecha' | 'estado' | 'prioridad' | 'categoria';

/** Valida que hora de inicio + duración no pase de las 24:00 (el backend exige < 1440). */
const limiteDia: ValidatorFn = (group) => {
  const hora: string | null = group.get('hora')?.value;
  const duracion = Number(group.get('duracion_minutos')?.value);
  if (!hora || !duracion) return null;
  const [h, m] = hora.split(':').map(Number);
  return h * 60 + m + duracion >= 1440 ? { fueraDeDia: true } : null;
};

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
    MatIconModule,
    RouterLink,
  ],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss'],
})
export class Dashboard {
  private tareasService = inject(TareasService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);

  displayedColumns: string[] = [
    'titulo',
    'descripcion',
    'fecha',
    'horario',
    'estado',
    'prioridad',
    'categoria',
    'acciones',
  ];

  readonly opcionesOrden: { value: Orden; label: string }[] = [
    { value: 'llegada', label: 'Orden de llegada' },
    { value: 'fecha', label: 'Fecha' },
    { value: 'estado', label: 'Estado' },
    { value: 'prioridad', label: 'Prioridad' },
    { value: 'categoria', label: 'Categoría' },
  ];

  // ---------- Estado (signals) ----------
  orden = signal<Orden>('llegada');
  editingTaskId = signal<number | null>(null);
  private refreshTrigger = signal<number>(0);

  // Se recarga automáticamente cuando cambia refreshTrigger
  tareasResource = resource({
    params: () => this.refreshTrigger(),
    loader: () => firstValueFrom(this.tareasService.getTareas()),
  });

  tareasOrdenadas = computed<Tarea[]>(() => {
    const tareas = [...(this.tareasResource.value() ?? [])];
    const estadoPeso: Record<string, number> = { 'por hacer': 0, 'en progreso': 1, completada: 2 };
    const prioridadPeso: Record<string, number> = { alta: 0, media: 1, baja: 2 };
    const porId = (a: Tarea, b: Tarea) => a.id - b.id;

    switch (this.orden()) {
      case 'fecha':
        return tareas.sort(
          (a, b) =>
            a.fecha.localeCompare(b.fecha) || a.inicio_minutos - b.inicio_minutos || porId(a, b),
        );
      case 'estado':
        return tareas.sort(
          (a, b) =>
            (estadoPeso[a.estado?.toLowerCase()] ?? 9) -
              (estadoPeso[b.estado?.toLowerCase()] ?? 9) || porId(a, b),
        );
      case 'prioridad':
        return tareas.sort(
          (a, b) =>
            (prioridadPeso[a.prioridad?.toLowerCase() ?? ''] ?? 9) -
              (prioridadPeso[b.prioridad?.toLowerCase() ?? ''] ?? 9) || porId(a, b),
        );
      case 'categoria':
        return tareas.sort(
          (a, b) => (a.categoria ?? '').localeCompare(b.categoria ?? '') || porId(a, b),
        );
      default:
        return tareas.sort(porId); // orden de llegada
    }
  });

  tareaForm: FormGroup = this.fb.group(
    {
      titulo: ['', [Validators.required]],
      descripcion: [''],
      fecha: [new Date().toISOString().split('T')[0], [Validators.required]],
      hora: ['09:00', [Validators.required]],
      duracion_minutos: [60, [Validators.required, Validators.min(1), Validators.max(1439)]],
      estado: ['por hacer', [Validators.required]],
      prioridad: ['media'],
      categoria: ['general'],
    },
    { validators: limiteDia },
  );

  // ---------- Utilidades de hora ----------
  horaAMinutos(hora: string): number {
    const [h, m] = hora.split(':').map(Number);
    return h * 60 + m;
  }

  minutosAHora(minutos: number): string {
    const h = Math.floor(minutos / 60);
    const m = minutos % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }

  formatoHorario(t: Tarea): string {
    return `${this.minutosAHora(t.inicio_minutos)} – ${this.minutosAHora(
      t.inicio_minutos + t.duracion_minutos,
    )} (${t.duracion_minutos} min)`;
  }

  // ---------- Acciones ----------
  guardarTarea() {
    if (this.tareaForm.invalid) {
      this.tareaForm.markAllAsTouched();
      this.snackBar.open('Completa los campos requeridos', 'Cerrar', { duration: 3000 });
      return;
    }

    const v = this.tareaForm.getRawValue();
    const payload: TareaCreate = {
      titulo: v.titulo,
      descripcion: v.descripcion ?? '',
      fecha: v.fecha,
      inicio_minutos: this.horaAMinutos(v.hora),
      duracion_minutos: Number(v.duracion_minutos),
      estado: v.estado,
      prioridad: v.prioridad,
      categoria: v.categoria,
    };
    const currentId = this.editingTaskId();

    if (currentId !== null) {
      this.tareasService.actualizarTarea(currentId, payload).subscribe({
        next: () => {
          this.snackBar.open('Tarea actualizada', 'Cerrar', { duration: 3000 });
          this.resetForm();
          this.refreshTrigger.update((n) => n + 1);
        },
        error: () => this.snackBar.open('Error al actualizar', 'Cerrar', { duration: 3000 }),
      });
    } else {
      this.tareasService.crearTarea(payload).subscribe({
        next: () => {
          this.snackBar.open('Tarea creada con éxito', 'Cerrar', { duration: 3000 });
          this.resetForm();
          this.refreshTrigger.update((n) => n + 1);
        },
        error: () => this.snackBar.open('Error al crear tarea', 'Cerrar', { duration: 3000 }),
      });
    }
  }

  cargarParaEditar(tarea: Tarea) {
    this.editingTaskId.set(tarea.id);
    this.tareaForm.patchValue({
      titulo: tarea.titulo,
      descripcion: tarea.descripcion,
      fecha: tarea.fecha,
      hora: this.minutosAHora(tarea.inicio_minutos),
      duracion_minutos: tarea.duracion_minutos,
      estado: tarea.estado,
      prioridad: tarea.prioridad,
      categoria: tarea.categoria ?? 'general',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelarEdicion() {
    this.resetForm();
  }

  eliminarTarea(id: number) {
    if (confirm('¿Estás seguro de eliminar esta tarea?')) {
      this.tareasService.eliminarTarea(id).subscribe({
        next: () => {
          this.snackBar.open('Tarea eliminada', 'Cerrar', { duration: 3000 });
          this.refreshTrigger.update((n) => n + 1);
        },
        error: () => this.snackBar.open('Error al eliminar', 'Cerrar', { duration: 3000 }),
      });
    }
  }

  resetForm() {
    this.editingTaskId.set(null);
    this.tareaForm.reset({
      titulo: '',
      descripcion: '',
      fecha: new Date().toISOString().split('T')[0],
      hora: '09:00',
      duracion_minutos: 60,
      estado: 'por hacer',
      prioridad: 'media',
      categoria: 'general',
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
