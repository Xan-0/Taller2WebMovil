import { DecimalPipe } from '@angular/common';
import { Component, NgZone, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ShakeService, ShakeWatch } from '../../services/shake.service';

type Fase = 'esperando' | 'despegando' | 'listo';

/**
 * Cohete de "misión cumplida": hay que agitar el celular (acelerómetro) para cargar los
 * propulsores. Si el dispositivo no tiene acelerómetro se avisa y se lanza tocando un botón.
 */
@Component({
  selector: 'app-rocket-dialog',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, DecimalPipe],
  templateUrl: './rocket-dialog.html',
  styleUrl: './rocket-dialog.scss',
})
export class RocketDialog implements OnInit, OnDestroy {
  data = inject<{ titulo: string }>(MAT_DIALOG_DATA);
  private ref = inject(MatDialogRef<RocketDialog>);
  private shake = inject(ShakeService);
  private zone = inject(NgZone);

  fase = signal<Fase>('esperando');
  carga = signal(0); // 0..100
  sinSensor = signal(false);
  mostrarBoton = signal(false);

  readonly humo = Array.from({ length: 14 }, (_, i) => i);

  private watcher?: ShakeWatch;
  private decaimiento?: ReturnType<typeof setInterval>;
  private ayuda?: ReturnType<typeof setTimeout>;
  private cierre?: ReturnType<typeof setTimeout>;

  async ngOnInit() {
    // La carga baja sola: hay que seguir agitando
    this.zone.runOutsideAngular(() => {
      this.decaimiento = setInterval(() => {
        if (this.fase() === 'esperando' && this.carga() > 0) {
          this.zone.run(() => this.carga.update((c) => Math.max(0, c - 2.5)));
        }
      }, 100);
    });

    // Si pasan unos segundos sin agitar, se ofrece el botón alternativo
    this.ayuda = setTimeout(() => this.mostrarBoton.set(true), 7000);

    this.watcher = await this.shake.watch(
      (potencia) =>
        this.zone.run(() => {
          if (this.fase() !== 'esperando') return;
          this.carga.update((c) => Math.min(100, c + Math.min(potencia, 60) * 0.22));
          if (this.carga() >= 100) this.despegar();
        }),
      () =>
        this.zone.run(() => {
          this.sinSensor.set(true);
          this.mostrarBoton.set(true);
        }),
    );
  }

  /** Despegue (por agitar o por el botón alternativo) */
  despegar() {
    if (this.fase() !== 'esperando') return;
    this.carga.set(100);
    this.fase.set('despegando');
    this.watcher?.stop();
    navigator.vibrate?.([80, 40, 160]);
    // Termina el vuelo -> mensaje final -> se cierra solo
    setTimeout(() => this.fase.set('listo'), 2300);
    this.cierre = setTimeout(() => this.ref.close(true), 3900);
  }

  omitir() {
    this.ref.close(false);
  }

  ngOnDestroy() {
    this.watcher?.stop();
    clearInterval(this.decaimiento);
    clearTimeout(this.ayuda);
    clearTimeout(this.cierre);
  }
}
