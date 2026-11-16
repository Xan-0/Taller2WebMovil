import { Injectable, inject, signal } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationStart,
  Router,
} from '@angular/router';

/**
 * Estado global de la ambientación espacial:
 *  - planet: planeta de la vista actual (cambia colores, fondo y posición del planeta)
 *  - warp:   true mientras se "viaja" entre vistas (las estrellas se estiran)
 */
@Injectable({ providedIn: 'root' })
export class SpaceService {
  private router = inject(Router);

  readonly reduced =
    typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

  readonly planet = signal<string>('nova');
  readonly warp = signal<boolean>(false);

  private warpTimer?: ReturnType<typeof setTimeout>;
  private firstNavigation = true;

  constructor() {
    this.applyPlanet('nova');

    this.router.events.subscribe((e) => {
      if (e instanceof NavigationEnd) {
        this.applyPlanet(this.currentPlanet());
        // Las estrellas siguen estiradas un instante más mientras entra la nueva vista
        this.stopWarp(650);
      } else if (e instanceof NavigationCancel || e instanceof NavigationError) {
        this.stopWarp(200);
      } else if (e instanceof NavigationStart && !this.firstNavigation) {
        this.startWarp();
      }
      if (e instanceof NavigationEnd) this.firstNavigation = false;
    });
  }

  /** Inicia el efecto de hiperespacio */
  startWarp() {
    if (this.reduced) return;
    clearTimeout(this.warpTimer);
    this.warp.set(true);
  }

  private stopWarp(delay: number) {
    clearTimeout(this.warpTimer);
    this.warpTimer = setTimeout(() => this.warp.set(false), delay);
  }

  /**
   * Anima la salida de la vista actual (la usa el guard de transición) y
   * resuelve cuando termina para que Angular active la nueva ruta.
   */
  leave(ms = 480): Promise<void> {
    if (this.reduced || this.firstNavigation) return Promise.resolve();
    this.startWarp();
    const current = document.querySelector<HTMLElement>('.page-shell > :not(router-outlet)');
    current?.classList.add('page-leave');
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private currentPlanet(): string {
    let r: ActivatedRouteSnapshot | null = this.router.routerState.snapshot.root;
    let planet = 'nova';
    while (r) {
      if (r.data?.['planet']) planet = r.data['planet'];
      r = r.firstChild;
    }
    return planet;
  }

  private applyPlanet(p: string) {
    this.planet.set(p);
    document.body.dataset['planet'] = p;
  }
}
