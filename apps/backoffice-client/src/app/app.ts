import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import {
  AuthUtils,
  configureHttpInterceptor,
  DarkModeService,
  ModalService,
} from 'customer-features';
import { ToastModule } from 'primeng/toast';
import { StyleClassModule } from 'primeng/styleclass';
import { DialogModule } from 'primeng/dialog';
import { filter, take } from 'rxjs/operators';
import { CreateOrcaUserModalComponent } from './modules/team/components/create-orca-user-modal/create-orca-user-modal.component';
import { CreateClientModalComponent } from './modules/clients/components/create-client-modal/create-client-modal.component';

@Component({
  standalone: true,
  imports: [
    RouterModule,
    ToastModule,
    StyleClassModule,
    DialogModule,
    CreateOrcaUserModalComponent,
    CreateClientModalComponent,
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

  @ViewChild('orcaUserModal') orcaUserModal!: CreateOrcaUserModalComponent;
  @ViewChild('clientModal') clientModal!: CreateClientModalComponent;

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
    if (this.orcaUserModal) {
      this.orcaUserModal.resetForm();
    }
    // Close the modal
    this.modalService.closeOrcaUserModal();
  }

  // Handle client modal close to reset form
  handleClientModalClose() {
    // Reset the form in the client modal component
    if (this.clientModal) {
      this.clientModal.resetForm();
    }
    // Close the client modal
    this.modalService.closeClientModal();
  }
}
