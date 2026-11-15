import { Component, inject, signal } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule
  ],
  styleUrls: ['./login.scss'],
  templateUrl: './login.html',
})
export class Login {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  isRegisterMode = signal<boolean>(false);

  // 'nombre' solo es obligatorio al registrarse
  authForm: FormGroup = this.fb.group({
    nombre: [''],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(4)]]
  });

  toggleMode() {
    this.isRegisterMode.update(value => !value);
    this.authForm.reset();
    const nombre = this.authForm.get('nombre')!;
    if (this.isRegisterMode()) {
      nombre.setValidators([Validators.required, Validators.minLength(3)]);
    } else {
      nombre.clearValidators();
    }
    nombre.updateValueAndValidity();
  }

  onSubmit() {
    if (this.authForm.invalid) {
      this.authForm.markAllAsTouched();
      this.snackBar.open('Por favor, completa los campos correctamente.', 'Cerrar', { duration: 3000 });
      return;
    }

    const { nombre, email, password } = this.authForm.value;

    if (this.isRegisterMode()) {
      this.authService.register({ nombre, email, password }).subscribe({
        next: () => {
          this.snackBar.open('¡Cuenta creada con éxito! Ahora puedes iniciar sesión.', 'Cerrar', { duration: 4000 });
          this.toggleMode();
        },
        error: (err) => {
          const detalle = typeof err.error?.detail === 'string' ? err.error.detail : 'No se pudo crear la cuenta.';
          this.snackBar.open(detalle, 'Cerrar', { duration: 4000 });
        }
      });
    } else {
      this.authService.login({ email, password }).subscribe({
        next: () => {
          this.snackBar.open('¡Inicio de sesión exitoso!', 'Cerrar', { duration: 3000 });
          this.router.navigate(['/dashboard']);
        },
        error: () => {
          this.snackBar.open('Correo o contraseña incorrectos.', 'Cerrar', { duration: 4000 });
        }
      });
    }
  }
}
