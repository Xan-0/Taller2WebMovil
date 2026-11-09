import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Dashboard } from './pages/dashboard/dashboard';
import { Detail } from './pages/detail/detail';
import { Diagram } from './pages/diagram/diagram';
import { authGuard } from './guards/auth.service';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' }, // <-- Redirige automáticamente al login
  { path: 'login', component: Login },
  { path: 'dashboard', component: Dashboard, canActivate: [authGuard] },
  { path: 'detail/:id', component: Detail, canActivate: [authGuard] },
  { path: 'diagram', component: Diagram, canActivate: [authGuard] },
  { path: '**', redirectTo: 'login' } 
];