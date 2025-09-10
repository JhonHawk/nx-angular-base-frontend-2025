import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  OnInit,
  output,
  signal,
  DestroyRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabelModule } from 'primeng/floatlabel';
import { CheckboxModule } from 'primeng/checkbox';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { catchError, finalize, of } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

// Import client service and types
import { ClientsService } from '../../services/clients/clients.service';
import { Client, CreateClientRequest, UpdateClientRequest } from '../../types/client.types';
import { ToastService } from '../../../../core/services/toast.service';

// Import business lines service and store
import { BusinessLinesService } from '../../../business-lines/services/business-lines/business-lines.service';
import { BusinessLine } from '../../../business-lines/types/business-line.types';

// Import orca users store and team service
import { OrcaUsersStore } from '../../../../stores/users/orca-users.store';
import { TeamService } from '../../../team/services/team.service';

// Import modal service for listening to modal open events
import { ModalService } from 'customer-features';

@Component({
  selector: 'app-create-client-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    FloatLabelModule,
    CheckboxModule,
    TextareaModule,
    SelectModule,
    DatePickerModule,
  ],
  templateUrl: './create-client-modal.component.html',
  styleUrl: './create-client-modal.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateClientModalComponent implements OnInit {
  private clientsService = inject(ClientsService);
  private businessLinesService = inject(BusinessLinesService);
  private orcaUsersStore = inject(OrcaUsersStore);
  private teamService = inject(TeamService);
  private toastService = inject(ToastService);
  private fb = inject(FormBuilder);
  private dialogRef = inject(DynamicDialogRef, { optional: true });
  private config = inject(DynamicDialogConfig, { optional: true });
  private modalService = inject(ModalService);
  private destroyRef = inject(DestroyRef);

  // Input for client data (when used as regular component)
  clientInput = input<Client | null>(null);

  // Output events for legacy support
  clientCreated = output<Client>();
  clientUpdated = output<Client>();
  cancelled = output<void>();

  // Get client data from dialog config or input (for edit mode)
  editClient: Client | null = this.config?.data || this.clientInput() || null;

  // Signals for component state
  isLoading = signal(false);
  businessLines = signal<BusinessLine[]>([]);

  // Computed dropdowns options
  businessLineOptions = computed(() =>
    this.businessLines().map((bl) => ({ label: bl.name, value: bl.id })),
  );

  // TODO: Change back to activeUsers() once user status issues are resolved
  orcaUserOptions = computed(() =>
    this.orcaUsersStore.users().map((user) => ({
      label: `${user.firstName} ${user.lastName} (${user.username})`,
      value: user.id,
    })),
  );

  // Computed properties
  isEditMode = computed(() => !!this.editClient?.id);
  submitButtonText = computed(() => (this.isEditMode() ? 'Actualizar Cliente' : 'Crear Cliente'));

  // Reactive Form (updated to match API requirements)
  clientForm: FormGroup = this.fb.group({
    // Basic client info
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(200)]],
    subdomain: ['', [Validators.required, Validators.pattern(/^[a-z0-9-]+$/)]],
    legalName: ['', [Validators.required, Validators.maxLength(300)]],
    rfc: ['', [Validators.required, Validators.pattern(/^[A-Z&Ñ]{3,4}[0-9]{6}[A-Z0-9]{3}$/)]],
    description: ['', [Validators.maxLength(1000)]],
    schemaName: [
      '',
      [Validators.required, Validators.pattern(/^[a-z0-9_]+$/), Validators.maxLength(49)],
    ],

    // Business line and responsible user
    businessLineId: [null, [Validators.required]],
    responsibleUserId: [null],

    // Subscription dates
    subscriptionStartDate: [new Date(), [Validators.required]],
    subscriptionEndDate: [this.getDefaultEndDate(), [Validators.required]],

    // Legal contact info
    legalContactName: ['', [Validators.maxLength(200)]],
    legalContactEmail: ['', [Validators.email, Validators.maxLength(150)]],
    legalContactPhone: ['', [Validators.maxLength(20)]],

    // Technical contact info
    technicalContactName: ['', [Validators.maxLength(200)]],
    technicalContactEmail: ['', [Validators.email, Validators.maxLength(150)]],
    technicalContactPhone: ['', [Validators.maxLength(20)]],

    // Hidden fields (set defaults, not shown in UI as per user request)
    logoUrl: ['https://default-logo.com/logo.png'], // Default value
    isActive: [true], // Default to true
  });

  ngOnInit() {
    // Load business lines for dropdown
    this.loadBusinessLines();

    // Only load orca users if this modal is opened via DynamicDialog (config exists)
    // For global modal instances in app.html, users will be loaded when modal opens
    if (this.config?.data) {
      this.loadOrcaUsersIfNeeded();
    }

    // Listen for modal open events from ModalService
    this.modalService.clientModalOpened$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      // Load users when modal is opened from global instance
      this.loadOrcaUsersIfNeeded();
    });

    // If edit mode, populate form with existing data
    if (this.isEditMode() && this.editClient) {
      this.populateForm(this.editClient);
    }
  }

  private getDefaultEndDate(): Date {
    const date = new Date();
    date.setFullYear(date.getFullYear() + 1); // Default to 1 year from now
    return date;
  }

  private loadBusinessLines() {
    this.businessLinesService.getActiveBusinessLines();
  }

  private loadOrcaUsersIfNeeded() {
    // Only load if no data is available
    if (!this.orcaUsersStore.hasData()) {
      this.teamService.getAllUsers({ size: 1000 });
    }
  }

  private populateForm(client: Client) {
    this.clientForm.patchValue({
      name: client.name,
      subdomain: client.subdomain,
      legalName: client.legalName,
      rfc: client.rfc,
      description: client.description,
      schemaName: client.schemaName,
      businessLineId: client.businessLineId,
      responsibleUserId: client.responsibleUserId,
      subscriptionStartDate: client.createdAt, // Use creation date as fallback
      subscriptionEndDate: this.getDefaultEndDate(),
      legalContactName: client.contactEmail.split('@')[0] || '', // Fallback
      legalContactEmail: client.contactEmail,
      legalContactPhone: client.contactPhone,
      technicalContactName: '',
      technicalContactEmail: '',
      technicalContactPhone: '',
      logoUrl: client.logoUrl || 'https://default-logo.com/logo.png',
      isActive: client.isActive,
    });
  }

  /**
   * Called when modal is opened from app.html to load required data
   */
  onModalOpen() {
    // Load orca users when modal opens
    this.loadOrcaUsersIfNeeded();
  }

  onSave() {
    // Mark all fields as touched to trigger validation display
    this.clientForm.markAllAsTouched();

    // Check if form is valid
    if (this.clientForm.invalid) {
      return;
    }

    this.isLoading.set(true);
    const formValue = this.clientForm.getRawValue();

    if (this.isEditMode() && this.editClient) {
      // Update existing client
      const updateClientRequest: UpdateClientRequest = {
        name: formValue.name || undefined,
        subdomain: formValue.subdomain || undefined,
        legalName: formValue.legalName || undefined,
        rfc: formValue.rfc || undefined,
        businessLineId: formValue.businessLineId || undefined,
        responsibleUserId: formValue.responsibleUserId || undefined,
        description: formValue.description || undefined,
        logoUrl: formValue.logoUrl || undefined,
        schemaName: formValue.schemaName || undefined,
        subscriptionStartDate: formValue.subscriptionStartDate
          ? this.formatDate(formValue.subscriptionStartDate)
          : undefined,
        subscriptionEndDate: formValue.subscriptionEndDate
          ? this.formatDate(formValue.subscriptionEndDate)
          : undefined,
        isActive: formValue.isActive,
        legalContactName: formValue.legalContactName || undefined,
        legalContactEmail: formValue.legalContactEmail || undefined,
        legalContactPhone: formValue.legalContactPhone || undefined,
        technicalContactName: formValue.technicalContactName || undefined,
        technicalContactEmail: formValue.technicalContactEmail || undefined,
        technicalContactPhone: formValue.technicalContactPhone || undefined,
        settings: {}, // Mantener configuraciones existentes
      };

      this.clientsService
        .updateClient(this.editClient.id, updateClientRequest)
        .pipe(
          finalize(() => this.isLoading.set(false)),
          catchError((error) => {
            let errorMessage = 'No se pudo actualizar el cliente. Por favor, inténtelo de nuevo.';
            if (error.status === 404) {
              errorMessage = 'El cliente ya no existe en el sistema.';
            } else if (error.status === 403) {
              errorMessage = 'No tienes permisos para actualizar este cliente.';
            } else if (error.status === 409) {
              errorMessage = 'Ya existe un cliente con este dominio.';
            }

            this.toastService.showError('Error', errorMessage);
            return of(null);
          }),
        )
        .subscribe((updatedClient) => {
          if (updatedClient) {
            this.toastService.showSuccess(
              'Éxito',
              `Cliente "${updatedClient.name}" actualizado correctamente.`,
            );
            if (this.dialogRef) {
              this.dialogRef.close(updatedClient);
            } else {
              this.clientUpdated.emit(updatedClient);
            }
          }
        });
    } else {
      // Create new client
      const newClientRequest: CreateClientRequest = {
        name: formValue.name || '',
        subdomain: formValue.subdomain || '',
        legalName: formValue.legalName || '',
        rfc: formValue.rfc || '',
        businessLineId: formValue.businessLineId,
        responsibleUserId: formValue.responsibleUserId || undefined,
        description: formValue.description || '',
        logoUrl: formValue.logoUrl || 'https://default-logo.com/logo.png',
        schemaName: formValue.schemaName || '',
        subscriptionStartDate: this.formatDate(formValue.subscriptionStartDate),
        subscriptionEndDate: this.formatDate(formValue.subscriptionEndDate),
        isActive: formValue.isActive,
        legalContactName: formValue.legalContactName || undefined,
        legalContactEmail: formValue.legalContactEmail || undefined,
        legalContactPhone: formValue.legalContactPhone || undefined,
        technicalContactName: formValue.technicalContactName || undefined,
        technicalContactEmail: formValue.technicalContactEmail || undefined,
        technicalContactPhone: formValue.technicalContactPhone || undefined,
        settings: {}, // Configuraciones por defecto
      };

      this.clientsService
        .createClient(newClientRequest)
        .pipe(
          finalize(() => this.isLoading.set(false)),
          catchError((error) => {
            let errorMessage = 'No se pudo crear el cliente. Por favor, inténtelo de nuevo.';
            if (error.status === 409) {
              errorMessage = 'Ya existe un cliente con este dominio.';
            } else if (error.status === 400) {
              errorMessage = 'Los datos proporcionados no son válidos.';
            }

            this.toastService.showError('Error', errorMessage);
            return of(null);
          }),
        )
        .subscribe((createdClient) => {
          if (createdClient) {
            this.toastService.showSuccess(
              'Éxito',
              `Cliente "${createdClient.name}" creado correctamente.`,
            );
            if (this.dialogRef) {
              this.dialogRef.close(createdClient);
            } else {
              this.clientCreated.emit(createdClient);
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
    this.clientForm.reset({
      name: '',
      subdomain: '',
      legalName: '',
      rfc: '',
      description: '',
      schemaName: '',
      businessLineId: null,
      responsibleUserId: null,
      subscriptionStartDate: new Date(),
      subscriptionEndDate: this.getDefaultEndDate(),
      legalContactName: '',
      legalContactEmail: '',
      legalContactPhone: '',
      technicalContactName: '',
      technicalContactEmail: '',
      technicalContactPhone: '',
      logoUrl: 'https://default-logo.com/logo.png',
      isActive: true,
    });
  }

  private formatDate(date: Date | string): string {
    if (typeof date === 'string') return date;
    return date.toISOString().split('T')[0]; // YYYY-MM-DD format
  }

  // Helper methods for template
  isFieldInvalid(fieldName: string): boolean {
    const field = this.clientForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.clientForm.get(fieldName);
    if (field && field.invalid && (field.dirty || field.touched)) {
      if (field.errors?.['required']) {
        switch (fieldName) {
          case 'name':
            return 'El nombre del cliente es requerido.';
          case 'subdomain':
            return 'El subdominio es requerido.';
          case 'legalName':
            return 'La razón social es requerida.';
          case 'rfc':
            return 'El RFC es requerido.';
          case 'schemaName':
            return 'El nombre del esquema es requerido.';
          case 'businessLineId':
            return 'La línea de negocio es requerida.';
          case 'subscriptionStartDate':
            return 'La fecha de inicio de suscripción es requerida.';
          case 'subscriptionEndDate':
            return 'La fecha de fin de suscripción es requerida.';
          default:
            return 'Este campo es requerido.';
        }
      }
      if (field.errors?.['email']) {
        return 'Ingrese un email válido.';
      }
      if (field.errors?.['pattern']) {
        switch (fieldName) {
          case 'subdomain':
            return 'El subdominio debe contener solo letras minúsculas, números y guiones.';
          case 'rfc':
            return 'Ingrese un RFC válido (ej: ABC123456DEF).';
          case 'schemaName':
            return 'El nombre del esquema debe contener solo letras minúsculas, números y guiones bajos.';
          default:
            return 'Formato inválido.';
        }
      }
      if (field.errors?.['minlength']) {
        const requiredLength = field.errors?.['minlength'].requiredLength;
        switch (fieldName) {
          case 'name':
            return `El nombre debe tener al menos ${requiredLength} caracteres.`;
          case 'legalName':
            return `La razón social debe tener al menos ${requiredLength} caracteres.`;
          default:
            return `Debe tener al menos ${requiredLength} caracteres.`;
        }
      }
    }
    return '';
  }
}
