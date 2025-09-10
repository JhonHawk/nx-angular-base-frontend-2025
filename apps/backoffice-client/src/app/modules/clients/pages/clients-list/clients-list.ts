import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  computed,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { FloatLabelModule } from 'primeng/floatlabel';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { MenuModule } from 'primeng/menu';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { finalize, catchError, of, Subscription } from 'rxjs';

import { ClientsService } from '../../services/clients/clients.service';
import { Client } from '../../types/client.types';
import { ToastService } from '../../../../core/services/toast.service';
import { PageHeader, EmptyStateComponent, ModalService } from 'customer-features';

// Import client modals
import { CreateClientModalComponent } from '../../components/create-client-modal/create-client-modal.component';
import { DeleteClientModalComponent } from '../../components/delete-client-modal/delete-client-modal.component';

interface StatusOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-clients-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    TagModule,
    CardModule,
    TooltipModule,
    ConfirmDialogModule,
    FloatLabelModule,
    IconFieldModule,
    InputIconModule,
    MenuModule,
    PageHeader,
    EmptyStateComponent,
  ],
  providers: [DialogService, ConfirmationService],
  templateUrl: './clients-list.html',
  styleUrl: './clients-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientsList implements OnInit, OnDestroy {
  private clientsService = inject(ClientsService);
  private toastService = inject(ToastService);
  private dialogService = inject(DialogService);
  private confirmationService = inject(ConfirmationService);
  private modalService = inject(ModalService);

  // Signals for reactive state management
  clients = signal<Client[]>([]);
  isLoading = signal(false);
  searchTerm = signal('');
  selectedStatus = signal<string>('');

  // Menu state
  currentMenuClient = signal<Client | null>(null);
  menuItems = signal<MenuItem[]>([]);

  // Dialog references
  createClientDialogRef?: DynamicDialogRef;
  assignClientsDialogRef?: DynamicDialogRef;

  // Subscription for client creation events from sidebar
  private clientCreatedSubscription?: Subscription;

  // Dropdown options (removed 'pending' as it's not supported by API)
  statusOptions: StatusOption[] = [
    { label: 'Todos los estados', value: '' },
    { label: 'Activo', value: 'active' },
    { label: 'Suspendido', value: 'suspended' },
  ];

  // Computed filtered clients (using correct Client interface properties)
  filteredClients = computed(() => {
    const clients = this.clients();
    const search = this.searchTerm().toLowerCase();
    const status = this.selectedStatus();

    return clients.filter((client) => {
      const matchesSearch =
        !search ||
        client.name.toLowerCase().includes(search) ||
        client.schemaName.toLowerCase().includes(search) ||
        client.domainUrl.toLowerCase().includes(search);

      const matchesStatus = !status || client.status === status;

      return matchesSearch && matchesStatus;
    });
  });

  // Statistics computed from clients (removed 'pending' status)
  clientStats = computed(() => {
    const clients = this.clients();
    return {
      total: clients.length,
      active: clients.filter((c) => c.status === 'active').length,
      suspended: clients.filter((c) => c.status === 'suspended').length,
    };
  });

  ngOnInit() {
    this.loadClients();

    // Listen for client creation events (from any context)
    this.clientCreatedSubscription = this.modalService.clientCreated$.subscribe((event) => {
      // Refresh the list whenever a client is created
      this.loadClients();
    });
  }

  ngOnDestroy() {
    if (this.clientCreatedSubscription) {
      this.clientCreatedSubscription.unsubscribe();
    }
  }

  loadClients() {
    this.isLoading.set(true);

    this.clientsService
      .getClients()
      .pipe(
        finalize(() => this.isLoading.set(false)),
        catchError((error) => {
          console.error('Error loading clients:', error);
          this.toastService.showError(
            'Error',
            'No se pudieron cargar los clientes. Por favor, inténtelo de nuevo.',
          );
          return of([]);
        }),
      )
      .subscribe((clients) => {
        this.clients.set(clients);
      });
  }

  onSearchChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this.searchTerm.set(target.value);
  }

  onStatusChange(value: string) {
    this.selectedStatus.set(value);
  }

  getStatusSeverity(status: string): 'success' | 'warning' | 'danger' | 'info' | 'secondary' {
    switch (status) {
      case 'active':
        return 'success';
      case 'suspended':
        return 'danger';
      default:
        return 'secondary';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'active':
        return 'Activo';
      case 'suspended':
        return 'Suspendido';
      default:
        return status;
    }
  }

  openCreateClientModal() {
    const dialogRef = this.dialogService.open(CreateClientModalComponent, {
      header: 'Crear Nuevo Cliente',
      width: '800px',
      modal: true,
      data: null, // No data means create mode
      contentStyle: { overflow: 'visible' },
      baseZIndex: 10000,
      closable: true,
      closeOnEscape: true,
      dismissableMask: false,
    });

    // Listen to clientCreated event
    dialogRef.onClose.subscribe((createdClient?: Client) => {
      if (createdClient) {
        this.loadClients(); // Refresh the list
      }
    });
  }

  openAssignClientsModal() {
    // TODO: Implement assign clients modal
    this.toastService.showInfo(
      'Próximamente',
      'La funcionalidad de asignación de clientes estará disponible próximamente.',
    );
  }

  editClient(client: Client) {
    const dialogRef = this.dialogService.open(CreateClientModalComponent, {
      header: `Editar Cliente - ${client.name}`,
      width: '800px',
      modal: true,
      data: client, // Pass client data for edit mode
      contentStyle: { overflow: 'visible' },
      baseZIndex: 10000,
      closable: true,
      closeOnEscape: true,
      dismissableMask: false,
    });

    // Listen to clientUpdated event
    dialogRef.onClose.subscribe((updatedClient?: Client) => {
      if (updatedClient) {
        this.loadClients(); // Refresh the list
      }
    });
  }

  toggleClientStatus(client: Client) {
    const action = client.status === 'active' ? 'suspender' : 'activar';
    const newStatus = client.status === 'active' ? 'suspendido' : 'activo';

    this.confirmationService.confirm({
      message: `¿Está seguro que desea ${action} el cliente "${client.name}"?`,
      header: `Confirmar ${action}`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, confirmar',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.isLoading.set(true);

        this.clientsService
          .toggleClientStatus(client.id)
          .pipe(
            finalize(() => this.isLoading.set(false)),
            catchError((error) => {
              console.error('Error toggling client status:', error);
              this.toastService.showError(
                'Error',
                `No se pudo ${action} el cliente. Por favor, inténtelo de nuevo.`,
              );
              return of(null);
            }),
          )
          .subscribe((updatedClient) => {
            if (updatedClient) {
              // Update the clients array
              const currentClients = this.clients();
              const updatedClients = currentClients.map((client) =>
                client.id === updatedClient.id ? updatedClient : client,
              );
              this.clients.set(updatedClients);

              this.toastService.showSuccess(
                'Éxito',
                `El cliente "${client.name}" ha sido ${newStatus} correctamente.`,
              );
            }
          });
      },
    });
  }

  viewClientDetails(client: Client) {
    // TODO: Implement view details functionality
    this.toastService.showInfo(
      'Próximamente',
      `Los detalles del cliente "${client.name}" estarán disponibles próximamente.`,
    );
  }

  deleteClient(client: Client) {
    const dialogRef = this.dialogService.open(DeleteClientModalComponent, {
      header: 'Confirmar Eliminación',
      width: '600px',
      modal: true,
      data: client,
      contentStyle: { overflow: 'visible' },
      baseZIndex: 10000,
      closable: true,
      closeOnEscape: true,
      dismissableMask: false,
    });

    // Listen to clientDeleted event
    dialogRef.onClose.subscribe((deletedClientId?: number) => {
      if (deletedClientId) {
        this.loadClients(); // Refresh the list
      }
    });
  }

  refreshClients() {
    this.loadClients();
    this.toastService.showInfo('Actualizado', 'La lista de clientes ha sido actualizada.');
  }

  showActionMenu(event: Event, client: Client, menu: any) {
    this.currentMenuClient.set(client);

    const items: MenuItem[] = [
      {
        label: 'Ver detalles',
        icon: 'pi pi-eye',
        command: () => this.viewClientDetails(client),
      },
      {
        label: 'Editar',
        icon: 'pi pi-pencil',
        command: () => this.editClient(client),
      },
      {
        separator: true,
      },
      {
        label: client.status === 'active' ? 'Suspender' : 'Activar',
        icon: client.status === 'active' ? 'pi pi-ban' : 'pi pi-check',
        command: () => this.toggleClientStatus(client),
      },
      {
        separator: true,
      },
      {
        label: 'Eliminar',
        icon: 'pi pi-trash',
        styleClass: 'text-red-600',
        command: () => this.deleteClient(client),
      },
    ];

    this.menuItems.set(items);
    menu.toggle(event);
  }
}
