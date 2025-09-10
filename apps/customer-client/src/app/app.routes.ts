import { Route } from '@angular/router';
import { AuthenticatedLayout, NotFoundComponent } from 'customer-features';
import { authGuard } from './core/guards/auth.guard';

export const appRoutes: Route[] = [
  // Auth routes (unauthenticated)
  {
    path: '',
    loadChildren: () => import('./modules/auth/auth.routes').then((m) => m.authRoutes),
  },

  // Consolidated authenticated routes with single layout parent
  {
    path: '',
    component: AuthenticatedLayout,
    canActivate: [authGuard],
    children: [
      // Default redirect for authenticated users
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

      // Organization routes - Use loadChildren for better chunk splitting
      {
        path: 'organization',
        loadChildren: () =>
          import('./modules/organization/organization.routes').then((m) => m.organizationRoutes),
      },
    ],
  },

  // 404 Not Found route
  {
    path: '**',
    component: NotFoundComponent,
  },
];
