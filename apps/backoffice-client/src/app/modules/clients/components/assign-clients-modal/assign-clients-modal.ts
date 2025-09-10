import { Component, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { FloatLabelModule } from 'primeng/floatlabel';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { OrcaUsersStore } from '../../../../stores/users/orca-users.store';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-assign-clients-modal',
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    SelectModule,
    FloatLabelModule,
    ProgressSpinnerModule,
  ],
  templateUrl: './assign-clients-modal.html',
  styleUrl: './assign-clients-modal.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssignClientsModal implements OnInit {
  private dialogRef = inject(DynamicDialogRef);
  private config = inject(DynamicDialogConfig);
  private orcaUsersStore = inject(OrcaUsersStore);
  private toastService = inject(ToastService);

  // Store signals
  users = this.orcaUsersStore.activeUsers;
  loading = this.orcaUsersStore.loading;
  error = this.orcaUsersStore.error;

  // Form data
  selectedUserId: number | null = null;
  clientsToAssign: unknown[] = [];

  // Select options
  userOptions: { label: string; value: number }[] = [];

  ngOnInit(): void {
    // Get clients data from dialog config
    this.clientsToAssign = this.config.data?.clients || [];

    // Transform users to select options
    this.userOptions = this.users().map((user) => ({
      label: `${user.firstName} ${user.lastName} (${user.email})`,
      value: user.id,
    }));
  }

  onAssign(): void {
    if (!this.selectedUserId) {
      this.toastService.showError('Error', 'Debe seleccionar un usuario responsable');
      return;
    }

    const selectedUser = this.users().find((user) => user.id === this.selectedUserId);
    if (!selectedUser) {
      this.toastService.showError('Error', 'Usuario no encontrado');
      return;
    }

    // Return the assignment data
    this.dialogRef.close({
      userId: this.selectedUserId,
      user: selectedUser,
      clients: this.clientsToAssign,
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
