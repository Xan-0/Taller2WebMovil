import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Dashboard } from './pages/dashboard/dashboard';
import { Detail } from './pages/detail/detail';
import { Calendar } from './pages/calendar/calendar';
import { Kanban } from './pages/kanban/kanban';
import { Profile } from './pages/profile/profile';
import { authGuard } from './guards/auth.service';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' }, // <-- Redirige automáticamente al login
  { path: 'login', component: Login },
  { path: 'dashboard', component: Dashboard, canActivate: [authGuard] },
  { path: 'detail/:id', component: Detail, canActivate: [authGuard] },
  { path: 'calendar', component: Calendar, canActivate: [authGuard] },
  { path: 'kanban', component: Kanban, canActivate: [authGuard] },
{ path: 'profile', component: Profile, canActivate: [authGuard] },
  { path: '**', redirectTo: 'login' } 
];