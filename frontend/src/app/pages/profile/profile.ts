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
    MatToolbar
],
  templateUrl: './profile.html',
  styleUrls: ['./profile.scss']
})
export class Profile implements OnInit {
  private fb = inject(FormBuilder);
  private tareasService = inject(TareasService);
  private usuarioService = inject(UsuarioService);

  tareas = signal<any[]>([]);
  
  perfilForm: FormGroup = this.fb.group({
    username: ['', Validators.required],
    password: ['']
  });

  ngOnInit() {
    this.cargarDatosUsuario();
  }

  cargarDatosUsuario() {
    this.tareasService.getTareas().subscribe({
      next: (data) => this.tareas.set(data),
      error: (err) => console.error('Error al cargar tareas', err)
    });

    this.usuarioService.obtenerPerfil().subscribe({
      next: (res) => {
        this.perfilForm.patchValue({
          username: res.username || res.email || ''
        });
      },
      error: (err) => console.error('Error al cargar perfil', err)
    });
  }

  actualizarPerfil() {
    if (this.perfilForm.valid) {
      const formValues = this.perfilForm.value;
      const datosAEnviar: any = {};

      if (formValues.username) {
        datosAEnviar.username = formValues.username;
      }
      if (formValues.password && formValues.password.trim() !== '') {
        datosAEnviar.password = formValues.password;
      }

      this.usuarioService.actualizarPerfil(datosAEnviar).subscribe({
        next: (res) => {
          console.log('Perfil actualizado correctamente', res);
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