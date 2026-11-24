import { Injectable, effect, inject, signal } from '@angular/core';
import { UsuarioService } from './usuario.service';
import { ConfiguracionUsuario } from '../models/app.models';

export const CONFIG_DEFAULT: ConfiguracionUsuario = {
  agitar_para_escanear: true,
  musica_fondo: false,
  volumen_musica: 40,
};

const STORAGE_KEY = 'app_configuracion_usuario';

@Injectable({
  providedIn: 'root'
})
export class PreferenciasService {
  private usuarioService = inject(UsuarioService);

  config = signal<ConfiguracionUsuario>(this.cargarLocal());
  private audio?: HTMLAudioElement;
  private listenerDesbloqueoRegistrado = false;

  constructor() {
    this.initAudio();
    this.registrarDesbloqueoAutoplay();

    effect(() => {
      const cfg = this.config();
      this.guardarLocal(cfg);
      this.aplicarAudio(cfg);
    });
  }

  private cargarLocal(): ConfiguracionUsuario {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { ...CONFIG_DEFAULT };
      const parsed = JSON.parse(raw);
      return {
        agitar_para_escanear: parsed.agitar_para_escanear ?? CONFIG_DEFAULT.agitar_para_escanear,
        musica_fondo: parsed.musica_fondo ?? CONFIG_DEFAULT.musica_fondo,
        volumen_musica: typeof parsed.volumen_musica === 'number'
          ? Math.min(100, Math.max(0, parsed.volumen_musica))
          : CONFIG_DEFAULT.volumen_musica,
      };
    } catch {
      return { ...CONFIG_DEFAULT };
    }
  }

  private guardarLocal(cfg: ConfiguracionUsuario) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg));
    } catch {}
  }

  /**
   * hidrata la configuración del usuario en el servicio
   * 
   * @param backendCfg 
   * @returns 
   */
  hidratarDesdeBackend(backendCfg: unknown) {
    if (!backendCfg || typeof backendCfg !== 'object') return;
    const raw = backendCfg as Partial<ConfiguracionUsuario>;
    this.config.set({
      agitar_para_escanear: raw.agitar_para_escanear ?? CONFIG_DEFAULT.agitar_para_escanear,
      musica_fondo: raw.musica_fondo ?? CONFIG_DEFAULT.musica_fondo,
      volumen_musica: typeof raw.volumen_musica === 'number'
        ? Math.min(100, Math.max(0, raw.volumen_musica))
        : CONFIG_DEFAULT.volumen_musica,
    });
  }

  actualizarPreferencia<K extends keyof ConfiguracionUsuario>(
    clave: K,
    valor: ConfiguracionUsuario[K],
    sincronizarBackend = true
  ) {
    const nuevaConfig: ConfiguracionUsuario = {
      ...this.config(),
      [clave]: valor,
    };
    this.config.set(nuevaConfig);

    if (sincronizarBackend) {
      this.usuarioService.actualizarPerfil({ configuracion: nuevaConfig }).subscribe({
        error: (err) => console.error('Error al sincronizar configuración', err),
      });
    }
  }

  // ---------- Música de fondo ----------
  private initAudio() {
    if (typeof Audio === 'undefined') return;
    this.audio = new Audio('audio/ambient-space.mp3');
    this.audio.addEventListener('error', () => {
        console.error('Error cargando audio:', this.audio?.error, 'src:', this.audio?.currentSrc);
    });
    this.audio.loop = true;
  }

  private aplicarAudio(cfg: ConfiguracionUsuario) {
    if (!this.audio) return;
    this.audio.volume = Math.min(1, Math.max(0, cfg.volumen_musica / 100));

    if (cfg.musica_fondo) {
      this.audio.play().catch(() => {
        // Si el navegador/WebView bloquea autoplay inicial, se reintentará al primer toque
      });
    } else {
      this.audio.pause();
    }
  }

  private registrarDesbloqueoAutoplay() {
    if (this.listenerDesbloqueoRegistrado || typeof window === 'undefined') return;
    this.listenerDesbloqueoRegistrado = true;

    const intentarReproducir = () => {
      if (this.config().musica_fondo && this.audio && this.audio.paused) {
        this.audio.play().catch(() => {});
      }
    };

    window.addEventListener('pointerdown', intentarReproducir, { passive: true });
    window.addEventListener('keydown', intentarReproducir, { passive: true });
  }
}