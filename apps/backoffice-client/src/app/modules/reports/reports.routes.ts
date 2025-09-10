import { Route } from '@angular/router';

export const reportsRoutes: Route[] = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./pages/dashboard/reports-dashboard').then((m) => m.ReportsDashboard),
  },
];
