import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { finalize, catchError, of } from 'rxjs';

// Import client service and types
import { ClientsService } from '../../services/clients/clients.service';
import { Client } from '../../types/client.types';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-delete-client-modal',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  templateUrl: './delete-client-modal.component.html',
  styleUrl: './delete-client-modal.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeleteClientModalComponent {
  private clientsService = inject(ClientsService);
  private toastService = inject(ToastService);
  private dialogRef = inject(DynamicDialogRef);
  private config = inject(DynamicDialogConfig);

  // Get client from dialog config
  client: Client = this.config.data;

  // Signals for component state
  isLoading = signal(false);

  onConfirmDelete() {
    this.isLoading.set(true);

    const clientData = this.client;

    this.clientsService
      .deleteClient(clientData.id)
      .pipe(
        finalize(() => this.isLoading.set(false)),
        catchError((error) => {
          // Customize error message based on error type
          let errorMessage = 'No se pudo eliminar el cliente. Por favor, inténtelo de nuevo.';

          if (error.status === 404) {
            errorMessage = 'El cliente ya no existe en el sistema.';
          } else if (error.status === 403) {
            errorMessage = 'No tienes permisos para eliminar este cliente.';
          } else if (error.status === 409) {
            errorMessage =
              'No se puede eliminar este cliente porque tiene usuarios activos o dependencias.';
          } else if (error.status === 400) {
            errorMessage = 'El cliente no puede ser eliminado en su estado actual.';
          }

          this.toastService.showError('Error', errorMessage);
          return of(null);
        }),
      )
      .subscribe((result) => {
        if (result !== null) {
          // Successful deletion
          this.toastService.showSuccess(
            'Éxito',
            `Cliente "${clientData.name}" eliminado correctamente.`,
          );
          this.dialogRef.close(clientData.id);
        }
      });
  }

  onCancel() {
    this.dialogRef.close();
  }

  // Computed properties for template
  get clientDisplayName(): string {
    const clientData = this.client;
    return clientData.name || 'Cliente sin nombre';
  }

  get hasActiveStatus(): boolean {
    const clientData = this.client;
    return clientData.isActive;
  }

  get statusText(): string {
    const clientData = this.client;
    return clientData.isActive ? 'Activo' : 'Suspendido';
  }

  get createdDateText(): string {
    const clientData = this.client;
    if (!clientData.createdAt) return 'Fecha no disponible';

    try {
      return new Date(clientData.createdAt).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return 'Fecha no disponible';
    }
  }

  get usersCountText(): string {
    const clientData = this.client;
    const count = clientData.usersCount || 0;

    if (count === 0) return 'Sin usuarios asignados';
    if (count === 1) return '1 usuario asignado';
    return `${count} usuarios asignados`;
  }
}
