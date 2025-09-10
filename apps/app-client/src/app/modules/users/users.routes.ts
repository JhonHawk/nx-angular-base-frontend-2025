import { Route } from '@angular/router';

export const usersRoutes: Route[] = [
  {
    path: '',
    redirectTo: 'users-list',
    pathMatch: 'full',
  },
  {
    path: 'users-list',
    loadComponent: () =>
      import('./pages/users-list/users-list').then((m) => m.UsersList),
  },
];
