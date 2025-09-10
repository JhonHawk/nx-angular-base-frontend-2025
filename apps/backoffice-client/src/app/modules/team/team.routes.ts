import { Route } from '@angular/router';

export const teamRoutes: Route[] = [
  {
    path: '',
    redirectTo: 'users-list',
    pathMatch: 'full',
  },
  {
    path: 'users-list',
    loadComponent: () =>
      import('./pages/orca-users-list/orca-users-list').then((m) => m.OrcaUsersList),
  },
];
