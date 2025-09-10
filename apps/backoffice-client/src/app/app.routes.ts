import { Route } from '@angular/router';
import { AuthenticatedLayout, NotFoundComponent } from 'customer-features';
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

      // Client Management
      {
        path: 'clients',
        loadChildren: () => import('./modules/clients/clients.routes').then((m) => m.clientsRoutes),
      },

      // Team Management - Use loadChildren for better chunk splitting
      {
        path: 'orca-team',
        loadChildren: () => import('./modules/team/team.routes').then((m) => m.teamRoutes),
      },

      // Reports - Use loadChildren for better chunk splitting
      {
        path: 'reports',
        loadChildren: () => import('./modules/reports/reports.routes').then((m) => m.reportsRoutes),
      },

      // Settings - Use loadChildren for better chunk splitting
      {
        path: 'settings',
        loadChildren: () =>
          import('./modules/settings/settings.routes').then((m) => m.settingsRoutes),
      },
    ],
  },

  // 404 Not Found route
  {
    path: '**',
    component: NotFoundComponent,
  },
];
