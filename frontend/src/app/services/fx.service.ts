import { Injectable } from '@angular/core';

export type FxKind = 'complete' | 'delete' | 'create';

/**
 * Efectos de partículas sobre un elemento (tarea). Las partículas se dibujan en una
 * capa fija sobre la pantalla y se eliminan solas; los estilos viven en styles.scss (.fx-*).
 */
@Injectable({ providedIn: 'root' })
export class FxService {
  private readonly reduced =
    typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

  private readonly palettes: Record<FxKind, string[]> = {
    complete: ['#34d399', '#22d3ee', '#fde047', '#ffffff', '#a7f3d0'],
    delete: ['#f43f5e', '#a855f7', '#fb923c', '#e879f9', '#ffffff'],
    create: ['#22d3ee', '#a78bfa', '#ffffff', '#67e8f9'],
  };

  burst(target: Element | null | undefined, kind: FxKind) {
    if (!target || this.reduced) return;

    const rect = target.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) return;

    const layer = document.createElement('div');
    layer.className = `fx-layer fx-${kind}`;
    layer.style.left = `${rect.left + rect.width / 2}px`;
    layer.style.top = `${rect.top + rect.height / 2}px`;

    // Anillo de onda (completar/crear) o agujero negro (eliminar)
    const ring = document.createElement('i');
    ring.className = kind === 'delete' ? 'fx-hole' : 'fx-ring';
    layer.appendChild(ring);

    const count = kind === 'create' ? 14 : 26;
    const colors = this.palettes[kind];
    const halfW = Math.min(rect.width / 2, 260);
    const halfH = Math.min(rect.height / 2 + 20, 90);

    for (let i = 0; i < count; i++) {
      const p = document.createElement('i');
      p.className = `fx-p ${i % 3 === 0 ? 'fx-star' : ''}`;
      const angle = Math.random() * Math.PI * 2;
      let dx: number, dy: number;
      if (kind === 'delete') {
        // Parten repartidas por la tarjeta y son succionadas hacia el centro
        dx = (Math.random() * 2 - 1) * halfW;
        dy = (Math.random() * 2 - 1) * halfH;
      } else {
        const dist = 50 + Math.random() * 120;
        dx = Math.cos(angle) * dist * (kind === 'create' ? 0.8 : 1.4);
        dy = Math.sin(angle) * dist - 20;
      }
      p.style.setProperty('--dx', `${dx.toFixed(1)}px`);
      p.style.setProperty('--dy', `${dy.toFixed(1)}px`);
      p.style.setProperty('--s', `${(5 + Math.random() * 8).toFixed(1)}px`);
      p.style.setProperty('--d', `${(Math.random() * 160).toFixed(0)}ms`);
      p.style.setProperty('--r', `${(Math.random() * 540 - 270).toFixed(0)}deg`);
      p.style.setProperty('--c', colors[i % colors.length]);
      layer.appendChild(p);
    }

    document.body.appendChild(layer);
    setTimeout(() => layer.remove(), 1600);
  }
}
