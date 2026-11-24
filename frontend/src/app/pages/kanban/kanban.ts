import { Component, ElementRef, OnInit, ViewChild, ViewEncapsulation, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDrag, CdkDragEnd, CdkDragMove, CdkDragStart, CdkDropList, CdkDropListGroup, CdkDragDrop } from '@angular/cdk/drag-drop';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterLink } from '@angular/router';
import { TareasService, Tarea } from '../../services/tareas.service';
import { FxService } from '../../services/fx.service';
import { RocketService } from '../../services/rocket.service';
import { ConfirmDialog } from '../../components/confirm-dialog/confirm-dialog';

type Estado = 'por hacer' | 'en progreso' | 'completada';

@Component({
  selector: 'app-kanban',
  standalone: true,
  imports: [
    CommonModule,
    CdkDropListGroup,
    CdkDropList,
    CdkDrag,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule,
    MatToolbarModule,
    RouterLink,
  ],
  templateUrl: './kanban.html',
  styleUrls: ['./kanban.scss'],
  // Sin encapsulación para que la tarjeta que se arrastra (se clona en <body>) conserve sus estilos
  encapsulation: ViewEncapsulation.None,
})
export class Kanban implements OnInit {
  private tareasService = inject(TareasService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private fx = inject(FxService);
  private rocket = inject(RocketService);

  @ViewChild('hole') hole?: ElementRef<HTMLElement>;

  readonly columnas: { estado: Estado; titulo: string; icono: string }[] = [
    { estado: 'por hacer', titulo: 'Por Hacer', icono: 'radio_button_unchecked' },
    { estado: 'en progreso', titulo: 'En Progreso', icono: 'autorenew' },
    { estado: 'completada', titulo: 'Completada', icono: 'task_alt' },
  ];

  tareas = signal<Tarea[]>([]);
  /** Efecto visual por tarea (id -> tipo) */
  fxState = signal<Record<number, 'complete' | 'delete' | 'new'>>({});
  arrastrando = signal(false);
  sobreAgujero = signal(false);

  ngOnInit() {
    this.cargarTareas();
  }

  cargarTareas() {
    this.tareasService.getTareas().subscribe({
      next: (data) => this.tareas.set(data),
      error: () => this.snackBar.open('Error al cargar las tareas', 'Cerrar', { duration: 3000 }),
    });
  }

  obtenerPorEstado(estado: string) {
    return this.tareas().filter((t) => t.estado.toLowerCase() === estado.toLowerCase());
  }

  // ---------- Arrastrar y soltar ----------
  onDragStart(_: CdkDragStart) {
    this.arrastrando.set(true);
  }

  onDragMoved(e: CdkDragMove) {
    const r = this.hole?.nativeElement.getBoundingClientRect();
    if (!r) return;
    const { x, y } = e.pointerPosition;
    this.sobreAgujero.set(x >= r.left && x <= r.right && y >= r.top && y <= r.bottom);
  }

  onDragEnded(e: CdkDragEnd<Tarea>) {
    const soltadoEnAgujero = this.sobreAgujero();
    this.arrastrando.set(false);
    this.sobreAgujero.set(false);
    if (soltadoEnAgujero) this.pedirEliminar(e.source.data, e.source.element.nativeElement);
  }

  soltar(event: CdkDragDrop<Estado, Estado, Tarea>) {
    if (event.previousContainer === event.container) return;
    const tarea = event.item.data;
    const nuevoEstado = event.container.data;
    const anterior = tarea.estado;

    // Actualización optimista: la tarjeta cambia de columna al instante
    this.tareas.update((ts) => ts.map((t) => (t.id === tarea.id ? { ...t, estado: nuevoEstado } : t)));

    this.tareasService.actualizarTarea(tarea.id, { estado: nuevoEstado }).subscribe({
      next: () => {
        if (nuevoEstado === 'completada') {
          this.marcar(tarea.id, 'complete', 1400);
          setTimeout(() => this.fx.burst(this.tarjeta(tarea.id), 'complete'), 60);
          this.rocket.lanzarConAviso(tarea.titulo, 1000);
        }
      },
      error: () => {
        // si el servidor falla, se devuelve a su columna original
        this.tareas.update((ts) => ts.map((t) => (t.id === tarea.id ? { ...t, estado: anterior } : t)));
        this.snackBar.open('No se pudo mover la tarea', 'Cerrar', { duration: 3000 });
      },
    });
  }

  // ---------- Eliminar (arrastrando al agujero negro) ----------
  private pedirEliminar(tarea: Tarea, el: HTMLElement) {
    this.dialog
      .open(ConfirmDialog, {
        data: {
          titulo: 'Eliminar tarea',
          mensaje: `¿Enviar "${tarea.titulo}" al agujero negro? Esta acción no se puede deshacer.`,
          confirmar: 'Eliminar',
          peligro: true,
          icono: 'delete_forever',
        },
        autoFocus: false,
      })
      .afterClosed()
      .subscribe((ok) => {
        if (!ok) return;
        const objetivo = this.tarjeta(tarea.id) ?? el;
        this.marcar(tarea.id, 'delete', 0);
        this.fx.burst(objetivo, 'delete');
        setTimeout(() => {
          this.tareasService.eliminarTarea(tarea.id).subscribe({
            next: () => {
              this.tareas.update((ts) => ts.filter((t) => t.id !== tarea.id));
              this.snackBar.open('Tarea eliminada', 'Cerrar', { duration: 3000 });
            },
            error: () => {
              this.quitarFx(tarea.id);
              this.snackBar.open('Error al eliminar', 'Cerrar', { duration: 3000 });
            },
          });
        }, 800);
      });
  }

  // ---------- Utilidades ----------
  private tarjeta(id: number): Element | null {
    return document.querySelector(`[data-task-id="${id}"]`);
  }

  private marcar(id: number, tipo: 'complete' | 'delete' | 'new', ms: number) {
    this.fxState.update((m) => ({ ...m, [id]: tipo }));
    if (ms > 0) setTimeout(() => this.quitarFx(id), ms);
  }

  private quitarFx(id: number) {
    this.fxState.update((m) => {
      const { [id]: _, ...resto } = m;
      return resto;
    });
  }
}
