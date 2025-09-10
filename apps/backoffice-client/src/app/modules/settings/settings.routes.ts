import { Route } from '@angular/router';

export const settingsRoutes: Route[] = [
  {
    path: '',
    redirectTo: 'general',
    pathMatch: 'full',
  },
  {
    path: 'general',
    loadComponent: () => import('./pages/general/settings-general').then((m) => m.SettingsGeneral),
  },
];
