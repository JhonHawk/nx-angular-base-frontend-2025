import { Route } from '@angular/router';

export const organizationRoutes: Route[] = [
  {
    path: '',
    redirectTo: 'info', 
    pathMatch: 'full'
  },
  {
    path: 'info',
    loadComponent: () => import('./pages/info/organization-info').then(m => m.OrganizationInfoComponent)
  }
];