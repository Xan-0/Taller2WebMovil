import { Component, computed, inject, signal, resource } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { Capacitor } from '@capacitor/core';
import QRCode from 'qrcode';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';

import { EventosService, Evento, EventoCreate } from '../../services/eventos.service';
import { AuthService } from '../../services/auth.service';

interface QrActivo {
  id: number;
  nombre: string;
  dataUrl: string;
}

@Component({
  selector: 'app-eventos',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatToolbarModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatIconModule,
  ],
  templateUrl: './eventos.html',
  styleUrls: ['./eventos.scss'],
})
export class Eventos {
  private eventosService = inject(EventosService);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);

  /** true solo dentro de la APK (Capacitor); en el navegador no se muestra el botón de QR */
  readonly esNativa = Capacitor.isNativePlatform();
  readonly miUid = this.authService.getUid();

  private refresh = signal(0);

  eventosResource = resource({
    params: () => this.refresh(),
    loader: () => firstValueFrom(this.eventosService.getEventos()),
  });

  asistenciasResource = resource({
    params: () => this.refresh(),
    loader: () => firstValueFrom(this.eventosService.misAsistencias()),
  });

  asistidos = computed(() => new Set(this.asistenciasResource.value() ?? []));

  qrActivo = signal<QrActivo | null>(null);
  confirmando = signal(false);
  obteniendoUbicacion = signal(false);

  // ---------- Formularios ----------
  confirmarForm: FormGroup = this.fb.group({
    idEvento: [null, [Validators.required, Validators.min(1), Validators.pattern(/^\d+$/)]],
  });

  eventoForm: FormGroup = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(3)]],
    descripcion: [''],
    fecha_inicio: [new Date().toISOString().split('T')[0], [Validators.required]],
    duracion_dias: [1, [Validators.required, Validators.min(1)]],
    distancia_maxima_metros: [200, [Validators.required, Validators.min(10)]],
    latitud: [null, [Validators.required, Validators.min(-90), Validators.max(90)]],
    longitud: [null, [Validators.required, Validators.min(-180), Validators.max(180)]],
  });

  // ---------- Ubicación ----------
  private obtenerUbicacion(): Promise<{ lat: number; lng: number } | null> {
    return new Promise((resolve) => {
      if (!('geolocation' in navigator)) return resolve(null);
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => resolve(null),
        { enableHighAccuracy: true, timeout: 8000 },
      );
    });
  }

  async usarMiUbicacion() {
    this.obteniendoUbicacion.set(true);
    const pos = await this.obtenerUbicacion();
    this.obteniendoUbicacion.set(false);
    if (!pos) {
      this.snackBar.open('No se pudo obtener tu ubicación. Revisa los permisos o ingrésala a mano.', 'Cerrar', {
        duration: 4000,
      });
      return;
    }
    this.eventoForm.patchValue({
      latitud: Number(pos.lat.toFixed(6)),
      longitud: Number(pos.lng.toFixed(6)),
    });
  }

  // ---------- Crear / eliminar eventos ----------
  crearEvento() {
    if (this.eventoForm.invalid) {
      this.eventoForm.markAllAsTouched();
      this.snackBar.open('Completa los campos requeridos del evento', 'Cerrar', { duration: 3000 });
      return;
    }
    const v = this.eventoForm.getRawValue();
    const payload: EventoCreate = {
      nombre: v.nombre,
      descripcion: v.descripcion || null,
      fecha_inicio: v.fecha_inicio,
      duracion_dias: Number(v.duracion_dias),
      distancia_maxima_metros: Number(v.distancia_maxima_metros),
      latitud: Number(v.latitud),
      longitud: Number(v.longitud),
      ubicacion_url: `https://www.google.com/maps?q=${v.latitud},${v.longitud}`,
    };
    this.eventosService.crearEvento(payload).subscribe({
      next: (ev) => {
        this.snackBar.open(`Evento creado. Su número identificador es ${ev.id}`, 'Cerrar', { duration: 5000 });
        this.eventoForm.reset({
          nombre: '',
          descripcion: '',
          fecha_inicio: new Date().toISOString().split('T')[0],
          duracion_dias: 1,
          distancia_maxima_metros: 200,
          latitud: null,
          longitud: null,
        });
        this.refresh.update((n) => n + 1);
      },
      error: (err) => this.mostrarError(err, 'No se pudo crear el evento'),
    });
  }

  eliminarEvento(ev: Evento) {
    if (!confirm(`¿Eliminar el evento "${ev.nombre}"?`)) return;
    this.eventosService.eliminarEvento(ev.id).subscribe({
      next: () => {
        if (this.qrActivo()?.id === ev.id) this.qrActivo.set(null);
        this.snackBar.open('Evento eliminado', 'Cerrar', { duration: 3000 });
        this.refresh.update((n) => n + 1);
      },
      error: (err) => this.mostrarError(err, 'No se pudo eliminar el evento'),
    });
  }

  // ---------- Confirmar visita ----------
  /** Modo web y APK: ingresar el número identificador del evento */
  confirmarManual() {
    if (this.confirmarForm.invalid) {
      this.confirmarForm.markAllAsTouched();
      return;
    }
    this.confirmar(Number(this.confirmarForm.value.idEvento));
  }

  async confirmar(idEvento: number) {
    if (this.confirmando()) return;
    this.confirmando.set(true);
    const pos = await this.obtenerUbicacion(); // opcional: si hay GPS el backend valida cercanía
    this.eventosService
      .confirmarAsistencia({
        id_evento: idEvento,
        latitud_actual: pos?.lat ?? null,
        longitud_actual: pos?.lng ?? null,
      })
      .subscribe({
        next: () => {
          this.confirmando.set(false);
          this.snackBar.open('¡Visita confirmada!', 'Cerrar', { duration: 4000 });
          this.confirmarForm.reset();
          this.refresh.update((n) => n + 1);
        },
        error: (err) => {
          this.confirmando.set(false);
          this.mostrarError(err, 'No se pudo confirmar la visita');
        },
      });
  }

  /** Solo APK: escanea un QR que contiene el número identificador del evento */
  async escanearQr() {
    try {
      const { BarcodeScanner, BarcodeFormat } = await import('@capacitor-mlkit/barcode-scanning');

      const permisos = await BarcodeScanner.requestPermissions();
      if (permisos.camera !== 'granted' && permisos.camera !== 'limited') {
        this.snackBar.open('Necesitas dar permiso de cámara para escanear el QR.', 'Cerrar', { duration: 5000 });
        return;
      }

      // En Android el escáner usa un módulo de Google Play Services que puede faltar
      const { available } = await BarcodeScanner.isGoogleBarcodeScannerModuleAvailable();
      if (!available) {
        await BarcodeScanner.installGoogleBarcodeScannerModule();
        this.snackBar.open('Instalando el módulo del escáner. Reintenta en unos segundos.', 'Cerrar', {
          duration: 5000,
        });
        return;
      }

      const { barcodes } = await BarcodeScanner.scan({ formats: [BarcodeFormat.QrCode] });
      const crudo = barcodes[0]?.rawValue ?? '';
      const id = Number(/(\d+)/.exec(crudo)?.[1]);
      if (!id) {
        this.snackBar.open('El QR leído no corresponde a un evento.', 'Cerrar', { duration: 4000 });
        return;
      }
      this.confirmarForm.patchValue({ idEvento: id });
      await this.confirmar(id);
    } catch (e: any) {
      const msg = String(e?.message ?? e ?? '');
      if (/cancel/i.test(msg)) return; // el usuario cerró el escáner
      this.snackBar.open('No se pudo usar la cámara para escanear el QR.', 'Cerrar', { duration: 4000 });
    }
  }

  // ---------- QR del evento (para el host) ----------
  async mostrarQr(ev: Evento) {
    const dataUrl = await QRCode.toDataURL(`evento:${ev.id}`, { width: 260, margin: 1 });
    this.qrActivo.set({ id: ev.id, nombre: ev.nombre, dataUrl });
  }

  cerrarQr() {
    this.qrActivo.set(null);
  }

  private mostrarError(err: any, porDefecto: string) {
    const detalle = typeof err?.error?.detail === 'string' ? err.error.detail : porDefecto;
    this.snackBar.open(detalle, 'Cerrar', { duration: 5000 });
  }
}
