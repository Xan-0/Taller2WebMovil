import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.service';
import { transitionGuard } from './guards/transition.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    // Ruta sin path que anima la salida de la vista anterior; cada vista define su "planeta"
    path: '',
    canActivateChild: [transitionGuard],
    children: [
      { path: 'login', loadComponent: () => import('./pages/login/login').then((m) => m.Login), data: { planet: 'nova' } },
      { path: 'dashboard', loadComponent: () => import('./pages/dashboard/dashboard').then((m) => m.Dashboard), canActivate: [authGuard], data: { planet: 'terra' } },
      { path: 'detail/:id', loadComponent: () => import('./pages/detail/detail').then((m) => m.Detail), canActivate: [authGuard], data: { planet: 'terra' } },
      { path: 'calendar', loadComponent: () => import('./pages/calendar/calendar').then((m) => m.Calendar), canActivate: [authGuard], data: { planet: 'mars' } },
      { path: 'kanban', loadComponent: () => import('./pages/kanban/kanban').then((m) => m.Kanban), canActivate: [authGuard], data: { planet: 'jupiter' } },
      { path: 'eventos', loadComponent: () => import('./pages/eventos/eventos').then((m) => m.Eventos), canActivate: [authGuard], data: { planet: 'neptuno' } },
      { path: 'profile', loadComponent: () => import('./pages/profile/profile').then((m) => m.Profile), canActivate: [authGuard], data: { planet: 'saturno' } },
    ],
  },
  { path: '**', redirectTo: 'login' },
];
