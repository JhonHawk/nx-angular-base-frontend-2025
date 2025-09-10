import { Route } from '@angular/router';
import { AuthenticatedLayout, NotFoundComponent } from 'shared-features';
import { authGuard } from './core/guards/auth.guard';

export const appRoutes: Route[] = [
  // Auth routes (unauthenticated)
  {
    path: 'login',
    loadChildren: () => import('./modules/auth/auth.routes').then((m) => m.authRoutes),
  },

  // Consolidated authenticated routes with single layout parent
  {
    path: '',
    component: AuthenticatedLayout,
    canActivate: [authGuard],
    children: [
      // Default redirect to home
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      },
      // Home dashboard
      {
        path: 'home',
        loadComponent: () => import('./modules/home/pages/dashboard/home').then((m) => m.Home),
      },

      // User Management
      {
        path: 'users',
        loadChildren: () => import('./modules/users/users.routes').then((m) => m.usersRoutes),
      },
    ],
  },

  // 404 Not Found route
  {
    path: '**',
    component: NotFoundComponent,
  },
];
