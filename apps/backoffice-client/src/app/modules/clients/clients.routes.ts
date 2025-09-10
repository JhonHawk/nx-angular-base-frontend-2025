import { Route } from '@angular/router';

export const clientsRoutes: Route[] = [
  {
    path: '',
    redirectTo: 'clients-list',
    pathMatch: 'full',
  },
  {
    path: 'clients-list',
    loadComponent: () => import('./pages/clients-list/clients-list').then((m) => m.ClientsList),
  },
];
