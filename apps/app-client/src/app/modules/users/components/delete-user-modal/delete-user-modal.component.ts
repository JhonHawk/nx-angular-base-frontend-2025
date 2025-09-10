import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
// Removed unused imports: finalize, catchError, of

// Import team service and types
import { TeamService } from '../../services/team.service';
import { BackOfficeUser } from '../../types/team.types';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-delete-user-modal',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  templateUrl: './delete-user-modal.component.html',
  styleUrl: './delete-user-modal.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeleteUserModalComponent {
  private teamService = inject(TeamService);
  private toastService = inject(ToastService);
  private dialogRef = inject(DynamicDialogRef);
  private config = inject(DynamicDialogConfig);

  // Get user from dialog config
  user: BackOfficeUser = this.config.data;

  // Signals for component state
  isLoading = signal(false);

  onConfirmDelete() {
    // User deletion is not supported by the API
    // This method should not be called - showing error message instead
    this.toastService.showError(
      'Operación no soportada',
      'La eliminación de usuarios no está permitida por la API. Los usuarios solo pueden ser desactivados o tener sus roles removidos.',
    );
    this.dialogRef.close();
  }

  onCancel() {
    this.dialogRef.close();
  }

  // Computed properties for template
  get userFullName(): string {
    const userData = this.user;
    return `${userData.firstName} ${userData.lastName}`.trim();
  }

  get hasActiveRoles(): boolean {
    const userData = this.user;
    return userData.roles && userData.roles.length > 0;
  }

  get activeRolesText(): string {
    const userData = this.user;
    if (!userData.roles || userData.roles.length === 0) {
      return 'Sin roles asignados';
    }
    return userData.roles.join(', ');
  }
}
