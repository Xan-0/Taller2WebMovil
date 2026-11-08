import { Component, inject, signal } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

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
  private http = inject(HttpClient);
  private snackBar = inject(MatSnackBar);

  isRegisterMode = signal<boolean>(false);


  authForm: FormGroup = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', [Validators.required, Validators.minLength(4)]]
  });

  toggleMode() {
    this.isRegisterMode.update(value => !value);
    this.authForm.reset();
  }

  onSubmit() {
    if (this.authForm.invalid) {
      this.snackBar.open('Por favor, completa los campos correctamente.', 'Cerrar', { duration: 3000 });
      return;
    }

    const credentials = this.authForm.value;

    if (this.isRegisterMode()) {
      // Petición a tu endpoint backend/routers/auth.py -> /auth/register
      this.http.post('http://localhost:8000/auth/register', credentials).subscribe({
        next: () => {
          this.snackBar.open('¡Cuenta creada con éxito! Ahora puedes iniciar sesión.', 'Cerrar', { duration: 4000 });
          this.isRegisterMode.set(false);
          this.authForm.reset();
        },
        error: (err) => {
          console.error('Error al registrarse:', err);
          this.snackBar.open('El nombre de usuario ya existe o hubo un error.', 'Cerrar', { duration: 4000 });
        }
      });
    } else {
      // Petición a tu endpoint backend/routers/auth.py -> /auth/login
      this.authService.login(credentials).subscribe({
        next: () => {
          this.snackBar.open('¡Inicio de sesión exitoso!', 'Cerrar', { duration: 3000 });
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          console.error('Error al iniciar sesión:', err);
          this.snackBar.open('Usuario o contraseña incorrectos.', 'Cerrar', { duration: 4000 });
        }
      });
    }
  }
}