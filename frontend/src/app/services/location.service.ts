import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';

export type MotivoUbicacion = 'denegado' | 'denegado-permanente' | 'gps-apagado' | 'tiempo' | 'sin-soporte' | 'error';

export type ResultadoUbicacion =
  | { ok: true; lat: number; lng: number; precision: number }
  | { ok: false; motivo: MotivoUbicacion; mensaje: string; puedeAbrirAjustes: boolean };

/**
 * Obtiene la ubicación del dispositivo (@capacitor/geolocation) gestionando permisos:
 * solicita el permiso cuando corresponde y devuelve un motivo claro si falla.
 */
@Injectable({ providedIn: 'root' })
export class LocationService {
  readonly esNativa = Capacitor.isNativePlatform();

  async obtener(): Promise<ResultadoUbicacion> {
    try {
      let permisos = await Geolocation.checkPermissions();
      if (permisos.location !== 'granted') {
        permisos = await Geolocation.requestPermissions({ permissions: ['location'] });
      }
      if (permisos.location !== 'granted') {
        // En Android, si el usuario marcó "No volver a preguntar", requestPermissions responde sin diálogo
        const permanente = permisos.location === 'denied';
        return {
          ok: false,
          motivo: permanente ? 'denegado-permanente' : 'denegado',
          mensaje: 'Necesitamos tu ubicación para validar que estás en el evento. Actívala en Ajustes > Permisos > Ubicación.',
          puedeAbrirAjustes: this.esNativa,
        };
      }

      const pos = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000,
      });
      return { ok: true, lat: pos.coords.latitude, lng: pos.coords.longitude, precision: pos.coords.accuracy };
    } catch (e) {
      return this.traducirError(e);
    }
  }

  private traducirError(e: unknown): ResultadoUbicacion {
    const msg = String((e as { message?: string })?.message ?? e ?? '').toLowerCase();
    if (msg.includes('not available') || msg.includes('services are not enabled') || msg.includes('disabled') || msg.includes('location unavailable')) {
      return { ok: false, motivo: 'gps-apagado', mensaje: 'El GPS está apagado. Actívalo e inténtalo de nuevo.', puedeAbrirAjustes: false };
    }
    if (msg.includes('timeout') || msg.includes('timed out')) {
      return { ok: false, motivo: 'tiempo', mensaje: 'No se obtuvo la ubicación a tiempo. Sal a un lugar abierto e inténtalo otra vez.', puedeAbrirAjustes: false };
    }
    if (msg.includes('denied') || msg.includes('permission')) {
      return { ok: false, motivo: 'denegado', mensaje: 'Permiso de ubicación denegado. Actívalo en Ajustes.', puedeAbrirAjustes: this.esNativa };
    }
    if (msg.includes('not supported') || msg.includes('unimplemented')) {
      return { ok: false, motivo: 'sin-soporte', mensaje: 'Este dispositivo no permite obtener la ubicación.', puedeAbrirAjustes: false };
    }
    return { ok: false, motivo: 'error', mensaje: 'No se pudo obtener la ubicación.', puedeAbrirAjustes: false };
  }
}
