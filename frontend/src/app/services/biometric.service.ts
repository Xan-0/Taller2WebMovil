import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { AccessControl, NativeBiometric } from '@capgo/capacitor-native-biometric';

/**
 * Estado del acceso con huella:
 *  - web:        no es la app (no se ofrece)
 *  - sin-sensor: el celular no tiene sensor biométrico o no hay huellas registradas
 *  - inactivo:   hay sensor, pero el usuario aún no activó la huella
 *  - listo:      activada; se puede entrar con la huella
 */
export type EstadoHuella = 'web' | 'sin-sensor' | 'inactivo' | 'listo';

const SERVER = 'cl.ucn.gestortareas';
const FLAG = 'huella_activada';

/** Códigos de error del plugin que interesan para dar mensajes claros */
const COD = { bloqueo: 2, bloqueoTemporal: 4, sinHuellas: 3, cancelado: [15, 16, 17], sinCredenciales: 21 };

@Injectable({ providedIn: 'root' })
export class BiometricService {
  get esNativa(): boolean {
    return Capacitor.isNativePlatform();
  }

  async estado(): Promise<EstadoHuella> {
    if (!this.esNativa) return 'web';
    try {
      const r = await NativeBiometric.isAvailable();
      if (!r.isAvailable) return 'sin-sensor';
    } catch (e) {
      console.warn('[huella] no disponible:', e);
      return 'sin-sensor';
    }
    return localStorage.getItem(FLAG) === '1' ? 'listo' : 'inactivo';
  }

  /**
   * Guarda las credenciales en el almacén seguro del teléfono (Keystore), protegidas por
   * biometría: solo se pueden leer después de verificar la huella.
   */
  async activar(email: string, password: string): Promise<void> {
    await NativeBiometric.setCredentials({
      username: email,
      password,
      server: SERVER,
      accessControl: AccessControl.BIOMETRY_ANY,
    });
    localStorage.setItem(FLAG, '1');
  }

  /** Muestra el lector de huella y, si coincide, entrega las credenciales guardadas */
  async obtenerCredenciales(): Promise<{ email: string; password: string }> {
    const c = await NativeBiometric.getSecureCredentials({
      server: SERVER,
      reason: 'Inicia sesión con tu huella',
      title: 'Gestor de Tareas',
      subtitle: 'Verifica tu identidad',
      description: 'Apoya tu dedo en el sensor de huella',
      negativeButtonText: 'Usar contraseña',
    });
    return { email: c.username, password: c.password };
  }

  async desactivar(): Promise<void> {
    try {
      await NativeBiometric.deleteCredentials({ server: SERVER });
    } catch {
      /* si no había nada guardado no es un error */
    }
    localStorage.removeItem(FLAG);
  }

  /** Traduce un error del plugin a un mensaje para el usuario (null = el usuario canceló) */
  mensajeError(err: any): string | null {
    const code = Number(err?.code);
    if (COD.cancelado.includes(code)) return null;
    if (code === COD.bloqueo || code === COD.bloqueoTemporal)
      return 'Demasiados intentos fallidos. Espera un momento o inicia sesión con tu contraseña.';
    if (code === COD.sinHuellas) return 'No hay huellas registradas en este celular. Regístrala en los ajustes del sistema.';
    if (code === COD.sinCredenciales)
      return 'La huella guardada ya no es válida. Inicia sesión con tu contraseña y vuelve a activarla.';
    return 'No se pudo verificar la huella. Intenta de nuevo o usa tu contraseña.';
  }

  esCredencialInvalida(err: any): boolean {
    return Number(err?.code) === COD.sinCredenciales;
  }
}
