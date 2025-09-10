import { Routes } from '@angular/router';
import { UnauthenticatedLayout } from 'customer-features';
import { unauthGuard } from '../../core/guards/auth.guard';

export const authRoutes: Routes = [
  {
    path: '',
    component: UnauthenticatedLayout,
    canActivate: [unauthGuard],
    children: [
      {
        path: 'login',
        loadComponent: () => import('./pages/login/login').then((m) => m.Login),
      },
      {
        path: 'forgot-password',
        loadComponent: () =>
          import('./pages/forgot-password/forgot-password').then((m) => m.ForgotPassword),
      },
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full',
      },
    ],
  },
];
