import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthUtils, configureHttpInterceptor, DarkModeService } from 'customer-features';
import { ToastModule } from 'primeng/toast';

@Component({
  standalone: true,
  imports: [RouterModule, ToastModule],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  protected title = 'customer-client';
  private router = inject(Router);
  private darkModeService = inject(DarkModeService);

  ngOnInit() {
    this.configureHttpInterceptorSettings();
    this.handleInitialRedirect();
  }

  private configureHttpInterceptorSettings() {
    configureHttpInterceptor({
      // SECURITY: Ensure this matches the auth storage key used in AuthUtils.isAuthenticated()
      authStorageKey: 'customer-user-data', // Changed to match auth check
      defaultTimeout: 30000,
      enableLogging: true,
      getTokenFromStorage: (storageKey: string) => {
        try {
          const userData = localStorage.getItem(storageKey);
          if (!userData) return null;
          const parsed = JSON.parse(userData);
          // Extract token from user data object structure
          return parsed.token || parsed.accessToken || parsed.authToken || null;
        } catch {
          return null;
        }
      },
    });
  }

  private handleInitialRedirect() {
    const currentPath = this.router.url;

    // Skip redirect if already on auth routes or already on home
    if (currentPath.includes('/login') || currentPath.includes('/home')) {
      return;
    }

    const isAuthenticated = AuthUtils.isAuthenticated('customer-user-data');

    if (isAuthenticated) {
      this.router.navigate(['/home']).then();
    } else {
      this.router.navigate(['/login']).then();
    }
  }
}
