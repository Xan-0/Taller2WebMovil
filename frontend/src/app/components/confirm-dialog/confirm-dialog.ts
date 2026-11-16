import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface ConfirmDialogData {
  titulo: string;
  mensaje: string;
  confirmar?: string;
  cancelar?: string;
  peligro?: boolean;
  icono?: string;
}

/** Diálogo de confirmación reutilizable (eliminar tarea / evento). */
@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="confirm" [class.danger]="data.peligro">
      <div class="confirm-icon"><mat-icon>{{ data.icono ?? (data.peligro ? 'warning' : 'help') }}</mat-icon></div>
      <h2 mat-dialog-title>{{ data.titulo }}</h2>
      <mat-dialog-content>{{ data.mensaje }}</mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button [mat-dialog-close]="false">{{ data.cancelar ?? 'Cancelar' }}</button>
        <button mat-raised-button [class.mat-warn]="data.peligro" [mat-dialog-close]="true" cdkFocusInitial>
          {{ data.confirmar ?? 'Aceptar' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: `
    .confirm { text-align: center; padding: 8px 4px 0; }
    .confirm-icon {
      width: 56px; height: 56px; margin: 8px auto 0; border-radius: 50%;
      display: grid; place-items: center;
      background: color-mix(in srgb, var(--accent) 18%, transparent);
      color: var(--accent);
      box-shadow: 0 0 24px color-mix(in srgb, var(--accent) 45%, transparent);
      animation: pulse 2s ease-in-out infinite;
    }
    .danger .confirm-icon {
      background: rgba(244, 63, 94, 0.18); color: #fb7185;
      box-shadow: 0 0 24px rgba(244, 63, 94, 0.5);
    }
    h2 { font-family: var(--font-display); letter-spacing: 0.5px; }
    mat-dialog-content { color: var(--muted); }
    @keyframes pulse { 50% { transform: scale(1.08); } }
  `,
})
export class ConfirmDialog {
  data = inject<ConfirmDialogData>(MAT_DIALOG_DATA);
}
