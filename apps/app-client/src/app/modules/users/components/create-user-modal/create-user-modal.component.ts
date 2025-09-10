import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  OnInit,
  computed,
  output,
  input,
  DestroyRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { FloatLabelModule } from 'primeng/floatlabel';
import { CheckboxModule } from 'primeng/checkbox';
import { MultiSelectModule } from 'primeng/multiselect';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { finalize, catchError, of } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

// Import team service and types
import { TeamService } from '../../services/team.service';
import {
  BackOfficeUser,
  RegisterUserRequest,
  UpdateUserRequest,
  AvailableRole,
} from '../../types/team.types';
import { ToastService } from '../../../../core/services/toast.service';

// Import modal service for listening to modal open events
import { ModalService } from 'shared-features';

@Component({
  selector: 'app-create-orca-user-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    FloatLabelModule,
    CheckboxModule,
    MultiSelectModule,
  ],
  templateUrl: './create-user-modal.component.html',
  styleUrl: './create-user-modal.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateOrcaUserModalComponent implements OnInit {
  private teamService = inject(TeamService);
  private toastService = inject(ToastService);
  private fb = inject(FormBuilder);
  private dialogRef = inject(DynamicDialogRef, { optional: true });
  private config = inject(DynamicDialogConfig, { optional: true });
  private modalService = inject(ModalService);
  private destroyRef = inject(DestroyRef);

  // Input for user data (when used as regular component)
  userInput = input<BackOfficeUser | null>(null);

  // Output events for legacy support
  userCreated = output<BackOfficeUser>();
  userUpdated = output<BackOfficeUser>();
  cancelled = output<void>();

  // Get user data from dialog config or input (for edit mode)
  editUser: BackOfficeUser | null = this.config?.data || this.userInput() || null;

  // Signals for component state
  availableRoles = signal<AvailableRole[]>([]);
  isLoading = signal(false);

  // Computed properties
  isEditMode = computed(() => !!this.editUser?.id);
  modalTitle = computed(() => (this.isEditMode() ? 'Editar Usuario' : 'Crear Nuevo Usuario'));
  submitButtonText = computed(() => (this.isEditMode() ? 'Actualizar Usuario' : 'Crear Usuario'));

  // Reactive Form - Updated to match new API schema
  userForm: FormGroup = this.fb.group({
    username: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    secondLastName: [''],
    phoneNumber: ['', Validators.pattern(/^\+?[1-9]\d{1,14}$/)], // E.164 format validation
    phoneExtension: [''],
    roleCodes: [[]],
  });

  ngOnInit() {
    // Only load roles if this modal is opened via DynamicDialog (config exists)
    // For global modal instances in app.html, roles will be loaded when modal opens
    if (this.config?.data) {
      this.loadAvailableRoles();
    }

    // Listen for modal open events from ModalService
    this.modalService.orcaUserModalOpened$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        // Load roles when modal is opened from global instance
        this.loadAvailableRoles();
      });

    // If edit mode, populate form with existing data and disable username and email fields
    if (this.isEditMode() && this.editUser) {
      this.populateForm(this.editUser);
      // Disable username and email fields in edit mode as they cannot be updated
      this.userForm.get('username')?.disable();
      this.userForm.get('email')?.disable();
    }
  }

  private populateForm(user: BackOfficeUser) {
    this.userForm.patchValue({
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      secondLastName: user.secondLastName || '',
      phoneNumber: user.phoneNumber || '', // Already includes country code
      phoneExtension: user.phoneExtension || '',
      roleCodes: user.roles || [],
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

  onSave() {
    // Mark all fields as touched to trigger validation display
    this.userForm.markAllAsTouched();

    // Check if form is valid
    if (this.userForm.invalid) {
      return;
    }

    this.isLoading.set(true);
    const formValue = this.userForm.getRawValue();

    if (this.isEditMode() && this.editUser) {
      // Update existing user - Only fields allowed by UpdateUserRequestDTO
      const updateUserRequest: UpdateUserRequest = {
        firstName: formValue.firstName || '',
        lastName: formValue.lastName || '',
        secondLastName: formValue.secondLastName || '',
        phoneNumber: formValue.phoneNumber || '', // Includes country code
        phoneExtension: formValue.phoneExtension || '',
        // Note: email, username, roles cannot be updated via PUT /bo/users/{userId}
      };

      this.teamService
        .updateUser(this.editUser.id, updateUserRequest)
        .pipe(
          finalize(() => this.isLoading.set(false)),
          catchError((error) => {
            let errorMessage = 'No se pudo actualizar el usuario. Por favor, inténtelo de nuevo.';
            if (error.status === 404) {
              errorMessage = 'El usuario ya no existe en el sistema.';
            } else if (error.status === 403) {
              errorMessage = 'No tienes permisos para actualizar este usuario.';
            }

            this.toastService.showError('Error', errorMessage);
            return of(null);
          }),
        )
        .subscribe((updatedUser) => {
          if (updatedUser) {
            this.toastService.showSuccess(
              'Éxito',
              `Usuario "${updatedUser.email}" actualizado correctamente.`,
            );
            if (this.dialogRef) {
              this.dialogRef.close(updatedUser);
            } else {
              this.userUpdated.emit(updatedUser);
            }
          }
        });
    } else {
      // Create new user
      const newUserRequest: RegisterUserRequest = {
        username: formValue.username || '',
        email: formValue.email || '',
        firstName: formValue.firstName || '',
        lastName: formValue.lastName || '',
        secondLastName: formValue.secondLastName || '',
        phoneNumber: formValue.phoneNumber || '', // Includes country code
        phoneExtension: formValue.phoneExtension || '',
        roleCodes: formValue.roleCodes || [],
      };

      this.teamService
        .registerUser(newUserRequest)
        .pipe(
          finalize(() => this.isLoading.set(false)),
          catchError(() => {
            this.toastService.showError(
              'Error',
              'No se pudo crear el usuario. Por favor, inténtelo de nuevo.',
            );
            return of(null);
          }),
        )
        .subscribe((createdUser) => {
          if (createdUser) {
            this.toastService.showSuccess(
              'Éxito',
              `Usuario "${createdUser.email}" creado correctamente.`,
            );
            if (this.dialogRef) {
              this.dialogRef.close(createdUser);
            } else {
              this.userCreated.emit(createdUser);
            }
          }
        });
    }
  }

  onCancel() {
    if (this.dialogRef) {
      this.dialogRef.close();
    } else {
      this.cancelled.emit();
    }
  }

  public resetForm() {
    this.userForm.reset({
      username: '',
      email: '',
      firstName: '',
      lastName: '',
      secondLastName: '',
      phoneNumber: '',
      phoneExtension: '',
      roleCodes: [],
    });
    // Ensure username and email are enabled for new users
    this.userForm.get('username')?.enable();
    this.userForm.get('email')?.enable();
  }

  // Helper methods for template
  isFieldInvalid(fieldName: string): boolean {
    const field = this.userForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.userForm.get(fieldName);
    if (field && field.invalid && (field.dirty || field.touched)) {
      if (field.errors?.['required']) {
        switch (fieldName) {
          case 'username':
            return 'El nombre de usuario es requerido.';
          case 'email':
            return 'El correo electrónico es requerido.';
          case 'firstName':
            return 'El nombre es requerido.';
          case 'lastName':
            return 'El apellido paterno es requerido.';
          default:
            return 'Este campo es requerido.';
        }
      }
      if (field.errors?.['email']) {
        return 'Ingrese un correo electrónico válido.';
      }
      if (field.errors?.['pattern'] && fieldName === 'phoneNumber') {
        return 'Ingrese un número de teléfono válido (ej: +525551234567).';
      }
    }
    return '';
  }
}
