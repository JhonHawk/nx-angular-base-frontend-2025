import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import {
  EmptyStateComponent,
  ModalService,
  USER_MODAL_CONTEXTS,
  PageHeader,
} from 'shared-features';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { MenuModule } from 'primeng/menu';
import { DialogService } from 'primeng/dynamicdialog';
import { catchError, of, Subscription } from 'rxjs';
import { TeamService } from '../../services/team.service';
import { AvailableRole, BackOfficeUser } from '../../types/team.types';
import { ToastService } from '../../../../core/services/toast.service'; // Import simplified Users Store
import { UsersStore } from '../../../../stores/users/users.store';
import { CreateUserModalComponent } from '../../components/create-user-modal/create-user-modal.component';
import { DeleteUserModalComponent } from '../../components/delete-user-modal/delete-user-modal.component';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [
    DatePipe,
    TableModule,
    ButtonModule,
    InputTextModule,
    TagModule,
    CardModule,
    TooltipModule,
    ConfirmDialogModule,
    IconFieldModule,
    InputIconModule,
    MenuModule,
    PageHeader,
    EmptyStateComponent,
  ],
  providers: [DialogService, ConfirmationService],
  templateUrl: './users-list.html',
  styleUrl: './users-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersList implements OnInit, OnDestroy {
  private teamService = inject(TeamService);
  private toastService = inject(ToastService);
  private confirmationService = inject(ConfirmationService);
  private modalService = inject(ModalService);
  private dialogService = inject(DialogService);
  private usersStore = inject(UsersStore);

  // Store-backed signals (simplified)
  users = this.usersStore.users;
  isLoading = this.usersStore.loading;
  totalRecords = this.usersStore.totalUsers;

  // Local state for roles (keep an existing pattern for now)
  availableRoles = signal<AvailableRole[]>([]);

  // Table state
  rows = signal(50); // Increased to show more users by default

  // Subscription for user creation events
  private userCreatedSubscription?: Subscription;
  // Legacy subscription (will be removed)
  private modalSubscription?: Subscription;

  // Menu state
  currentMenuUser = signal<BackOfficeUser | null>(null);
  menuItems = signal<MenuItem[]>([]);

  ngOnInit() {
    // Load users manually - no more auto-loading with polling
    this.loadUsers();
    this.loadAvailableRoles();

    // Listen for user creation events (new system)
    this.userCreatedSubscription = this.modalService.userCreated$.subscribe((event: any) => {
      // Only refresh if the user was created from this context
      if (event.context === USER_MODAL_CONTEXTS.USERS_LIST) {
        this.loadUsers();
      }
    });

    // Legacy subscription for backwards compatibility (will be removed)
    this.modalSubscription = this.modalService.modalAction$.subscribe((action) => {
      if (action?.type === 'create-user') {
        this.openNew();
        this.modalService.closeUserModal();
      }
    });
  }

  ngOnDestroy() {
    if (this.userCreatedSubscription) {
      this.userCreatedSubscription.unsubscribe();
    }
    if (this.modalSubscription) {
      this.modalSubscription.unsubscribe();
    }
  }

  loadUsers() {
    // Use service's getAllUsers method - service will update the store
    this.teamService.getAllUsers({ size: 1000 }).subscribe({
      next: () => {},
      error: () => {
        this.toastService.showError(
          'Error',
          'No se pudieron cargar los usuarios. Por favor, inténtelo de nuevo.',
        );
      },
    });
  }

  refreshUsers() {
    // Use the service's refreshUsersStore method for forced update
    this.teamService.refreshUsersStore().subscribe({
      next: () => {
        this.toastService.showSuccess('Actualizado', 'Lista de usuarios actualizada correctamente');
      },
      error: () => {
        this.toastService.showError('Error', 'No se pudo actualizar la lista de usuarios');
      },
    });
  }

  loadAvailableRoles() {
    this.teamService
      .getAvailableRoles()
      .pipe(
        catchError(() => {
          return of([]);
        }),
      )
      .subscribe((roles) => {
        this.availableRoles.set(roles);
      });
  }

  // Dialog methods - Updated to use a single modal for both create and edit
  openNew() {
    this.createUser();
  }

  editUser(user: BackOfficeUser) {
    const dialogRef = this.dialogService.open(CreateUserModalComponent, {
      header: `Editar Usuario - ${user.firstName} ${user.lastName}`,
      width: '800px',
      modal: true,
      data: user, // Pass user data for edit mode
      contentStyle: { overflow: 'visible' },
      baseZIndex: 10000,
      closable: true,
      closeOnEscape: true,
      dismissableMask: false,
    });

    // Listen to userUpdated event
    dialogRef.onClose.subscribe((updatedUser?: BackOfficeUser) => {
      if (updatedUser) {
        this.loadUsers(); // Refresh the list
      }
    });
  }

  // Method to create new user using the same modal
  createUser() {
    const dialogRef = this.dialogService.open(CreateUserModalComponent, {
      header: 'Crear Nuevo Usuario',
      width: '800px',
      modal: true,
      data: null, // No data means create mode
      contentStyle: { overflow: 'visible' },
      baseZIndex: 10000,
      closable: true,
      closeOnEscape: true,
      dismissableMask: false,
    });

    // Listen to userCreated event
    dialogRef.onClose.subscribe((createdUser?: BackOfficeUser) => {
      if (createdUser) {
        this.loadUsers(); // Refresh the list
      }
    });
  }

  confirmDeleteUser(event: Event, user: BackOfficeUser) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `¿Está seguro que desea eliminar el usuario "${user.firstName} ${user.lastName}"?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.deleteUser(user);
      },
    });
  }

  private deleteUser(user: BackOfficeUser) {
    const dialogRef = this.dialogService.open(DeleteUserModalComponent, {
      header: 'Confirmar Eliminación',
      width: '600px',
      modal: true,
      data: user,
      contentStyle: { overflow: 'visible' },
      baseZIndex: 10000,
    });

    // Listen to userDeleted event
    dialogRef.onClose.subscribe((deletedUserId?: number) => {
      if (deletedUserId) {
        this.loadUsers(); // Refresh the list
      }
    });
  }

  resetLoginAttempts(user: BackOfficeUser) {
    this.teamService
      .resetUserLoginAttempts(user.id)
      .pipe(
        catchError(() => {
          this.toastService.showError('Error', 'No se pudieron resetear los intentos de login.');
          return of(null);
        }),
      )
      .subscribe((updatedUser) => {
        if (updatedUser) {
          this.toastService.showSuccess(
            'Éxito',
            `Intentos de login reseteados para "${user.firstName} ${user.lastName}".`,
          );
        }
      });
  }

  // Table event handlers are now handled natively by PrimeNG

  // Utility methods - Updated for new API structure
  getUserStatusSeverity(user: BackOfficeUser): 'success' | 'danger' {
    return user.enabled ? 'success' : 'danger';
  }

  getUserStatusLabel(user: BackOfficeUser): string {
    return user.enabled ? 'Activo' : 'Inactivo';
  }

  // Helper methods to maintain UI compatibility
  getFailedLoginAttempts(user: BackOfficeUser): number {
    return 0;
  }

  isUserLocked(user: BackOfficeUser): boolean {
    return false;
  }

  getLastLoginDisplay(user: BackOfficeUser): string {
    return user.lastLogin || '';
  }

  exportCSV() {
    // TODO: Implement CSV export functionality
    this.toastService.showInfo(
      'Próximamente',
      'La funcionalidad de exportación estará disponible próximamente.',
    );
  }

  importUsers() {
    // TODO: Implement import functionality
    this.toastService.showInfo(
      'Próximamente',
      'La funcionalidad de importación estará disponible próximamente.',
    );
  }

  showActionMenu(event: Event, user: BackOfficeUser, menu: any) {
    this.currentMenuUser.set(user);

    const items: MenuItem[] = [
      {
        label: 'Editar',
        icon: 'pi pi-pencil',
        command: () => this.editUser(user),
      },
      ...(this.isUserLocked(user) || this.getFailedLoginAttempts(user) > 0
        ? [
            {
              label: 'Resetear intentos',
              icon: 'pi pi-unlock',
              command: () => this.resetLoginAttempts(user),
            },
          ]
        : []),
      {
        separator: true,
      },
      {
        label: 'Eliminar',
        icon: 'pi pi-trash',
        styleClass: 'text-red-600',
        command: (event: any) => this.confirmDeleteUser(event.originalEvent || event, user),
      },
    ];

    this.menuItems.set(items);
    menu.toggle(event);
  }
}
