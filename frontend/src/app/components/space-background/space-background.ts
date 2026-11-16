import {
  AfterViewInit,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  ViewChild,
  ViewEncapsulation,
  inject,
} from '@angular/core';
import { SpaceService } from '../../services/space.service';

interface Star {
  x: number; // -1..1
  y: number; // -1..1
  z: number; // 0..1 (0 = cerca)
  tint: boolean;
}

interface Meteor {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
}

/**
 * Fondo animado: nebulosa, campo de estrellas en canvas (con modo "warp"),
 * estrellas fugaces, planeta/luna que cambian según la vista y viñeta.
 */
@Component({
  selector: 'app-space-background',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  host: { '[class.sp-warp]': 'space.warp()', 'aria-hidden': 'true' },
  template: `
    <div class="sp-nebula"></div>
    <div class="sp-nebula sp-nebula-2"></div>
    <canvas #stars class="sp-stars"></canvas>
    <div class="sp-planet-pos">
      <div class="sp-planet"><div class="sp-surface"></div></div>
      <div class="sp-ring"></div>
      <div class="sp-orbit"><i class="sp-moon"></i></div>
    </div>
    <div class="sp-flash"></div>
    <div class="sp-vignette"></div>
  `,
  styleUrl: './space-background.scss',
})
export class SpaceBackground implements AfterViewInit, OnDestroy {
  readonly space = inject(SpaceService);
  private zone = inject(NgZone);

  @ViewChild('stars', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  private ctx!: CanvasRenderingContext2D;
  private stars: Star[] = [];
  private meteors: Meteor[] = [];
  private w = 0;
  private h = 0;
  private dpr = 1;
  private speed = 0.05;
  private raf = 0;
  private last = 0;
  private tint = '#22d3ee';
  private tintAt = 0;
  private px = 0; // paralaje suavizado
  private py = 0;
  private tx = 0; // paralaje objetivo
  private ty = 0;
  private nextMeteor = 0;
  private acc = 0;

  private onResize = () => this.resize();
  private onPointer = (e: PointerEvent) => {
    this.tx = (e.clientX / window.innerWidth - 0.5) * 2;
    this.ty = (e.clientY / window.innerHeight - 0.5) * 2;
  };

  ngAfterViewInit() {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    this.resize();

    window.addEventListener('resize', this.onResize);

    if (this.space.reduced) {
      // Sin movimiento: se dibuja un cielo estático una sola vez
      this.draw(0);
      return;
    }

    window.addEventListener('pointermove', this.onPointer, { passive: true });
    // El bucle de animación corre fuera de Angular para no disparar detección de cambios
    this.zone.runOutsideAngular(() => {
      this.last = performance.now();
      this.raf = requestAnimationFrame(this.loop);
    });
  }

  ngOnDestroy() {
    cancelAnimationFrame(this.raf);
    window.removeEventListener('resize', this.onResize);
    window.removeEventListener('pointermove', this.onPointer);
  }

  private resize() {
    const canvas = this.canvasRef.nativeElement;
    this.dpr = window.innerWidth < 720 ? 1 : Math.min(window.devicePixelRatio || 1, 1.25);
    this.w = window.innerWidth;
    this.h = window.innerHeight;
    canvas.width = Math.floor(this.w * this.dpr);
    canvas.height = Math.floor(this.h * this.dpr);
    canvas.style.width = `${this.w}px`;
    canvas.style.height = `${this.h}px`;

    const count = this.w < 720 ? 80 : 170;
    this.stars = Array.from({ length: count }, () => this.newStar(true));
    if (this.space.reduced) this.draw(0);
  }

  private newStar(randomZ: boolean): Star {
    return {
      x: Math.random() * 2 - 1,
      y: Math.random() * 2 - 1,
      z: randomZ ? Math.random() : 1,
      tint: Math.random() < 0.22,
    };
  }

  private loop = (t: number) => {
    this.acc += Math.min(0.05, (t - this.last) / 1000);
    this.last = t;
    // En crucero (movimiento muy lento) basta con ~24 fps; a pleno ritmo solo durante el salto
    const minStep = this.space.warp() ? 0 : 1 / 24;
    if (this.acc >= minStep) {
      this.draw(this.acc);
      this.acc = 0;
    }
    this.raf = requestAnimationFrame(this.loop);
  };

  private draw(dt: number) {
    const ctx = this.ctx;
    const warp = this.space.warp();

    // Velocidad: crucero lento -> salto de hiperespacio
    const target = warp ? 2.4 : 0.05;
    this.speed += (target - this.speed) * Math.min(1, dt * (warp ? 5 : 2.5));

    // Paralaje suave con el puntero / dedo
    this.px += (this.tx - this.px) * Math.min(1, dt * 3);
    this.py += (this.ty - this.py) * Math.min(1, dt * 3);

    // Color de acento del planeta actual (cambia con transición CSS)
    this.tintAt -= dt;
    if (this.tintAt <= 0) {
      this.tintAt = 0.4;
      const c = getComputedStyle(document.body).getPropertyValue('--accent').trim();
      if (c) this.tint = c;
    }

    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.clearRect(0, 0, this.w, this.h);

    const cx = this.w / 2 - this.px * 26;
    const cy = this.h / 2 - this.py * 18;
    const scale = Math.max(this.w, this.h) * 0.62;
    const streak = this.speed * 0.16; // largo de la estela en unidades de z

    ctx.lineCap = 'round';
    for (const s of this.stars) {
      s.z -= this.speed * dt;
      if (s.z <= 0.012) {
        Object.assign(s, this.newStar(false));
        continue;
      }
      const sx = cx + (s.x / s.z) * scale * 0.12;
      const sy = cy + (s.y / s.z) * scale * 0.12;
      if (sx < -50 || sx > this.w + 50 || sy < -50 || sy > this.h + 50) {
        Object.assign(s, this.newStar(false));
        continue;
      }

      const near = 1 - s.z;
      const size = 0.4 + near * 2.1;
      const alpha = Math.min(1, 0.25 + near * 0.9);
      const color = s.tint ? this.tint : '#ffffff';

      ctx.globalAlpha = alpha;
      ctx.strokeStyle = color;
      ctx.fillStyle = color;

      const zPrev = s.z + streak;
      if (streak > 0.02) {
        const px = cx + (s.x / zPrev) * scale * 0.12;
        const py = cy + (s.y / zPrev) * scale * 0.12;
        ctx.lineWidth = size;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(sx, sy);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.arc(sx, sy, size * 0.6, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    this.drawMeteors(dt);
    ctx.globalAlpha = 1;
  }

  private drawMeteors(dt: number) {
    const ctx = this.ctx;
    this.nextMeteor -= dt;
    if (this.nextMeteor <= 0 && this.meteors.length < 3) {
      this.nextMeteor = 2.5 + Math.random() * 5;
      const fromLeft = Math.random() < 0.5;
      this.meteors.push({
        x: Math.random() * this.w * (fromLeft ? 0.6 : 1),
        y: Math.random() * this.h * 0.4,
        vx: (fromLeft ? 1 : -1) * (500 + Math.random() * 400),
        vy: 220 + Math.random() * 220,
        life: 1,
      });
    }

    this.meteors = this.meteors.filter((m) => m.life > 0);
    for (const m of this.meteors) {
      m.x += m.vx * dt;
      m.y += m.vy * dt;
      m.life -= dt * 1.1;
      const tail = 0.09;
      const g = ctx.createLinearGradient(m.x, m.y, m.x - m.vx * tail, m.y - m.vy * tail);
      g.addColorStop(0, 'rgba(255,255,255,0.95)');
      g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.globalAlpha = Math.max(0, m.life);
      ctx.strokeStyle = g;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(m.x, m.y);
      ctx.lineTo(m.x - m.vx * tail, m.y - m.vy * tail);
      ctx.stroke();
    }
  }
}
