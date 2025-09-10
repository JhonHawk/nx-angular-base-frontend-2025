import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import {
  AuthUtils,
  configureHttpInterceptor,
  DarkModeService,
  ModalService,
} from 'shared-features';
import { ToastModule } from 'primeng/toast';
import { StyleClassModule } from 'primeng/styleclass';
import { DialogModule } from 'primeng/dialog';
import { filter, take } from 'rxjs/operators';
import { CreateUserModalComponent } from './modules/users/components/create-user-modal/create-user-modal.component';

@Component({
  standalone: true,
  imports: [
    RouterModule,
    ToastModule,
    StyleClassModule,
    DialogModule,
    CreateUserModalComponent,
  ],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  public title = 'backoffice-client';
  private router = inject(Router);
  private darkModeService = inject(DarkModeService);
  protected modalService = inject(ModalService);

  @ViewChild('userModal') userModal!: CreateUserModalComponent;

  ngOnInit() {
    this.configureHttpInterceptorSettings();
    this.handleInitialRedirectAfterNavigation();
  }

  private configureHttpInterceptorSettings() {
    configureHttpInterceptor({
      // Use direct token storage key for Bearer token
      authStorageKey: 'backoffice-token',
      defaultTimeout: 30000,
      enableLogging: true,
      getTokenFromStorage: (storageKey: string) => {
        try {
          // Direct token retrieval from localStorage
          const token = localStorage.getItem(storageKey);
          return token || null;
        } catch {
          return null;
        }
      },
    });
  }

  private handleInitialRedirectAfterNavigation(): void {
    // Wait for the first navigation to complete before checking for redirects
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        take(1),
      )
      .subscribe((event: NavigationEnd) => {
        // Only redirect if user is on the root path ('/')
        if (event.url === '/') {
          const isAuthenticated = AuthUtils.isAuthenticated('backoffice-user-data');

          if (isAuthenticated) {
            this.router.navigate(['/home']);
          } else {
            this.router.navigate(['/login']);
          }
        }
      });
  }

  // Handle modal close to reset form
  handleModalClose() {
    // Reset the form in the modal component
    if (this.userModal) {
      this.userModal.resetForm();
    }
    // Close the modal
    this.modalService.closeUserModal();
  }

}
