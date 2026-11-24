import { Injectable, inject } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RocketDialog } from '../components/rocket-dialog/rocket-dialog';

/** Abre la animación del cohete (se agita el celular para lanzarlo) al completar una tarea. */
@Injectable({ providedIn: 'root' })
export class RocketService {
  private dialog = inject(MatDialog);
  private snack = inject(MatSnackBar);
  private abierto?: MatDialogRef<RocketDialog>;

  /** Avisa de inmediato qué hay que hacer y abre el cohete tras la animación de la tarea */
  lanzarConAviso(titulo: string, retardoMs = 1000) {
    this.snack.open('¡Tarea completada! Prepárate: agita el celular para lanzar el cohete 🚀', 'OK', {
      duration: retardoMs + 1800,
      panelClass: 'snack-guia',
    });
    setTimeout(() => this.lanzar(titulo), retardoMs);
  }

  lanzar(titulo: string) {
    if (this.abierto) return; // ya hay un cohete en pantalla
    this.abierto = this.dialog.open(RocketDialog, {
      data: { titulo },
      panelClass: 'rocket-panel',
      backdropClass: 'rocket-backdrop',
      width: '100vw',
      maxWidth: '100vw',
      height: '100dvh',
      autoFocus: false,
      disableClose: true,
    });
    this.abierto.afterClosed().subscribe(() => (this.abierto = undefined));
  }
}
