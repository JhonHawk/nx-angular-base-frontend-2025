import { Injectable, computed, inject } from '@angular/core';
import { OrganizationOption, OrganizationSelectorService } from 'customer-features';
import { ClientsStore } from '../../stores/clients/clients.store';
import { ClientsService } from '../../modules/clients/services/clients/clients.service';
import { SchemaSwitchService } from '../../modules/auth/services/schema-switch/schema-switch.service';
import { ToastService } from '../../core/services/toast.service';
import { catchError, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BackofficeOrganizationSelectorService implements OrganizationSelectorService {
  private clientsStore = inject(ClientsStore);
  private clientsService = inject(ClientsService);
  private schemaSwitchService = inject(SchemaSwitchService);
  private toastService = inject(ToastService);

  // Implement the interface required by TopMenuComponent
  organizationOptions = computed((): OrganizationOption[] => {
    return this.clientsStore.organizationOptions();
  });

  selectedOrganization = computed((): OrganizationOption | null => {
    const selectedClient = this.clientsStore.selectedClient();
    if (!selectedClient) {
      return { id: 'ORCA', name: 'ORCA', isOrcaOption: true };
    }
    return {
      id: selectedClient.id,
      name: selectedClient.name,
      isOrcaOption: false,
    };
  });

  selectOrganization(id: number | 'ORCA'): void {
    this.schemaSwitchService.selectOrganization(id).subscribe({
      next: () => {
        // Show success message only when operation succeeds
        if (id === 'ORCA') {
          this.toastService.showSuccess('Éxito', 'Cambiado al contexto ORCA');
        } else {
          const selectedClient = this.clientsStore.getClientById(id as number);
          if (selectedClient) {
            this.toastService.showSuccess(
              'Éxito',
              `Cambiado a organización: ${selectedClient.name}`,
            );
          }
        }
      },
      error: (error) => {
        console.error('Error selecting organization:', error);

        // Show detailed error message based on error type
        let errorMessage = 'No se pudo cambiar la organización. Por favor, inténtelo de nuevo.';

        if (error?.status === 500) {
          errorMessage =
            'Error interno del servidor. Verifique que el cliente existe y esté activo.';
        } else if (error?.status === 400) {
          errorMessage = 'Cliente inválido o inactivo.';
        } else if (error?.status === 403) {
          errorMessage = 'No tiene permisos para acceder a esta organización.';
        }

        this.toastService.showError('Error', errorMessage);
      },
    });
  }

  loadOrganizations(): void {
    // Load clients if not already loaded or data is stale
    if (!this.clientsStore.hasData() || !this.clientsStore.isDataFresh()) {
      this.clientsService
        .getClients({ size: 100, status: 'active' })
        .pipe(
          catchError((error) => {
            console.error('Error loading organizations:', error);
            // Don't show toast error for silent loading
            return of([]);
          }),
        )
        .subscribe();
    }
  }
}
