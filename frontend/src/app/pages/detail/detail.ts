import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { Tarea } from '../../services/tareas.service';
import { environment } from '../../../environments/environment.prod';

@Component({
  selector: 'app-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatToolbarModule,
    MatIconModule
  ],
  templateUrl: './detail.html',
  styleUrls: ['./detail.scss']
})
export class Detail {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private http = inject(HttpClient);

  tarea = signal<Tarea | null>(null);
  loading = signal<boolean>(true);

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.http.get<Tarea>(`${environment.apiUrl}/tareas`).subscribe({
        next: (tareas: any) => {
          const encontrada = tareas.find((t: Tarea) => t.id === Number(id));
          if (encontrada) {
            this.tarea.set(encontrada);
          }
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
        }
      });
    }
  }

  volver() {
    this.router.navigate(['/dashboard']);
  }
}