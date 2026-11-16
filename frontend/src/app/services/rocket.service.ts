import { Injectable, inject } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { RocketDialog } from '../components/rocket-dialog/rocket-dialog';

/** Abre la animación del cohete (se agita el celular para lanzarlo) al completar una tarea. */
@Injectable({ providedIn: 'root' })
export class RocketService {
  private dialog = inject(MatDialog);
  private abierto?: MatDialogRef<RocketDialog>;

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
