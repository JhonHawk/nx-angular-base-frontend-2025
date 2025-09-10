import { inject } from '@angular/core';
import { type CanActivateFn, Router } from '@angular/router';
import { AuthUtils } from 'shared-features';

/**
 * Guard that protects routes requiring authentication
 * Redirects to login if user is not authenticated
 */
export const authGuard: CanActivateFn = () => {
  const router = inject(Router);

  if (AuthUtils.isAuthenticated('backoffice-user-data')) {
    return true;
  }

  router.navigate(['/login']).then();
  return false;
};

/**
 * Guard that protects routes that should only be accessible when NOT authenticated
 * Redirects to dashboard if user is already authenticated
 */
export const unauthGuard: CanActivateFn = () => {
  const router = inject(Router);

  if (!AuthUtils.isAuthenticated('backoffice-user-data')) {
    return true;
  }

  router.navigate(['/home']).then();
  return false;
};
