import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'inventario', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'inventario',
    canActivate: [authGuard],
    loadComponent: () => import('./features/inventario/inventario.component').then(m => m.InventarioComponent)
  },
  {
    path: 'movimiento',
    canActivate: [authGuard],
    loadComponent: () => import('./features/movimiento/movimiento.component').then(m => m.MovimientoComponent)
  },
  { path: '**', redirectTo: 'inventario' }
];
