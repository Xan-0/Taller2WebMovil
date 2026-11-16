import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SpaceBackground } from './components/space-background/space-background';
import { SpaceService } from './services/space.service';

@Component({
  imports: [RouterOutlet, SpaceBackground],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  // Se inyecta aquí para que el servicio escuche la navegación desde el inicio
  protected readonly space = inject(SpaceService);
}
