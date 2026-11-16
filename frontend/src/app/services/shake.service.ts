import { Injectable } from '@angular/core';
import { Motion } from '@capacitor/motion';
import type { PluginListenerHandle } from '@capacitor/core';

export interface ShakeWatch {
  stop(): void;
}

/**
 * Detecta "agitadas" del dispositivo con el acelerómetro (@capacitor/motion).
 * Si el aparato no tiene el sensor (o no entrega datos válidos) avisa con onNoSensor
 * para que la interfaz ofrezca una alternativa.
 */
@Injectable({ providedIn: 'root' })
export class ShakeService {
  /** Cambio mínimo de aceleración entre dos lecturas (m/s²) para contar como sacudida */
  private readonly UMBRAL = 14;

  async watch(
    onShake: (potencia: number) => void,
    onNoSensor: () => void,
    sondeoMs = 1500,
  ): Promise<ShakeWatch> {
    let hayDatos = false;
    let detenido = false;
    let ultima: { x: number; y: number; z: number } | null = null;
    let handle: PluginListenerHandle | undefined;

    // Si en `sondeoMs` no llegó ninguna lectura válida, se asume que no hay acelerómetro
    const timer = setTimeout(() => {
      if (!hayDatos && !detenido) onNoSensor();
    }, sondeoMs);

    try {
      handle = await Motion.addListener('accel', (ev) => {
        const g = ev?.accelerationIncludingGravity;
        if (!g || g.x == null || g.y == null || g.z == null) return;
        hayDatos = true;
        if (ultima) {
          const salto = Math.abs(g.x - ultima.x) + Math.abs(g.y - ultima.y) + Math.abs(g.z - ultima.z);
          if (salto > this.UMBRAL) onShake(salto);
        }
        ultima = { x: g.x, y: g.y, z: g.z };
      });
    } catch {
      clearTimeout(timer);
      if (!detenido) onNoSensor();
    }

    return {
      stop: () => {
        detenido = true;
        clearTimeout(timer);
        handle?.remove();
      },
    };
  }
}
