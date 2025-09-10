import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter, withViewTransitions } from '@angular/router';
import { appRoutes } from './app.routes';
import { providePrimeNG } from 'primeng/config';
import { MessageService } from 'primeng/api';
import {
  httpInterceptor,
  configureHttpInterceptor,
  OrcaPreset,
  ORGANIZATION_SELECTOR_SERVICE,
} from 'shared-features';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { BackofficeOrganizationSelectorService } from './services/organization-selector/organization-selector.service';

// Configure HTTP interceptor for backoffice app
configureHttpInterceptor({
  authStorageKey: 'backoffice-user-data',
  customerTokenStorageKey: 'customer-token',
  defaultTimeout: 10000,
  enableLogging: true,
  logLevel: 'standard',
});

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(appRoutes, withViewTransitions()),
    provideHttpClient(withInterceptors([httpInterceptor])),
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: OrcaPreset,
        options: {
          darkModeSelector: '.orca-app-dark',
          cssLayer: {
            name: 'primeng',
            order: 'theme, base, primeng',
          },
        },
      },
      ripple: true,
      inputStyle: 'outlined',
      inputVariant: 'outlined',
    }),
    MessageService,
    // Provide organization selector service for top menu
    {
      provide: ORGANIZATION_SELECTOR_SERVICE,
      useClass: BackofficeOrganizationSelectorService,
    },
  ],
};
