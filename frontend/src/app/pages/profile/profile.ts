import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { RouterLink } from '@angular/router';
import { TareasService } from '../../services/tareas.service';
import { UsuarioService } from '../../services/usuario.service';
import { MatToolbar } from '@angular/material/toolbar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { BiometricService, EstadoHuella } from '../../services/biometric.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    RouterLink,
    MatToolbar,
    MatSnackBarModule
],
  templateUrl: './profile.html',
  styleUrls: ['./profile.scss']
})
export class Profile implements OnInit {
  private fb = inject(FormBuilder);
  private tareasService = inject(TareasService);
  private usuarioService = inject(UsuarioService);
  private bio = inject(BiometricService);
  private snackBar = inject(MatSnackBar);

  huella = signal<EstadoHuella>('web');

  tareas = signal<any[]>([]);
  
  perfilForm: FormGroup = this.fb.group({
    nombre: ['', Validators.required],
    password: ['']
  });

  async ngOnInit() {
    this.cargarDatosUsuario();
    this.huella.set(await this.bio.estado());
  }

  async desactivarHuella() {
    await this.bio.desactivar();
    this.huella.set(await this.bio.estado());
    this.snackBar.open('Acceso con huella desactivado', 'Cerrar', { duration: 3000 });
  }

  cargarDatosUsuario() {
    this.tareasService.getTareas().subscribe({
      next: (data) => this.tareas.set(data),
      error: (err) => console.error('Error al cargar tareas', err)
    });

    this.usuarioService.obtenerPerfil().subscribe({
      next: (res) => {
        this.perfilForm.patchValue({
          nombre: res.nombre || res.email || ''
        });
      },
      error: (err) => console.error('Error al cargar perfil', err)
    });
  }

  actualizarPerfil() {
    if (this.perfilForm.valid) {
      const formValues = this.perfilForm.value;
      const datosAEnviar: any = {};

      if (formValues.nombre) {
        datosAEnviar.nombre = formValues.nombre;
      }
      if (formValues.password && formValues.password.trim() !== '') {
        datosAEnviar.password = formValues.password;
      }

      this.usuarioService.actualizarPerfil(datosAEnviar).subscribe({
        next: async (res) => {
          console.log('Perfil actualizado correctamente', res);
          // Si cambió la contraseña, la guardada para la huella queda obsoleta
          if (datosAEnviar.password && this.huella() === 'listo') {
            await this.bio.desactivar();
            this.huella.set(await this.bio.estado());
            this.snackBar.open('Cambiaste tu contraseña: vuelve a activar la huella al iniciar sesión.', 'Cerrar', { duration: 6000 });
          }
          alert('Perfil actualizado con éxito');
        },
        error: (err) => {
          console.error('Error al actualizar el perfil', err);
          alert('Hubo un error al actualizar el perfil');
        }
      });
    }
  }

  get totalTareas() {
    return this.tareas().length;
  }

  get porHacer() {
    return this.tareas().filter(t => t.estado.toLowerCase() === 'por hacer').length;
  }

  get enProgreso() {
    return this.tareas().filter(t => t.estado.toLowerCase() === 'en progreso').length;
  }

  get completadas() {
    return this.tareas().filter(t => t.estado.toLowerCase() === 'completada').length;
  }
}


