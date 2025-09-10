import { Injectable, signal } from '@angular/core';
import { Subject } from 'rxjs';
import {
  CUSTOMER_USER_MODAL_CONFIG,
  CustomerUserModalContext,
  ModalContextConfig,
  ORCA_USER_MODAL_CONFIG,
  OrcaUserModalContext,
} from '../constants/modal-contexts';

// Types for the different user models
// Note: These should match the actual types from their respective modules
export interface OrcaUserCreatedEvent {
  user: any; // Should be BackOfficeUser but avoiding circular dependency
  context: OrcaUserModalContext;
  config: ModalContextConfig;
}

export interface CustomerUserCreatedEvent {
  user: any; // Should be CustomerUser type when implemented
  context: CustomerUserModalContext;
  config: ModalContextConfig;
}

// Client modal types
export interface ClientCreatedEvent {
  client: any; // Should be Client type from clients module
  context: 'SIDEBAR' | 'CLIENT_LIST';
}

// Legacy interface for backwards compatibility (will be removed)
export interface ModalAction {
  type: 'create-user' | 'create-account' | 'assign-account' | 'create-client';
  payload?: any;
}

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  // ===== ORCA USER MODAL MANAGEMENT =====
  // State management for Orca Team users (backoffice)
  private orcaUserModalVisible = signal(false);
  private orcaUserModalContext = signal<OrcaUserModalContext | null>(null);
  private orcaUserModalMetadata = signal<any>(null);

  // Event stream for orca user creation
  private orcaUserCreatedSubject = new Subject<OrcaUserCreatedEvent>();
  public orcaUserCreated$ = this.orcaUserCreatedSubject.asObservable();

  // Event stream for orca user modal opening
  private orcaUserModalOpenedSubject = new Subject<{ context: OrcaUserModalContext; metadata?: any }>();
  public orcaUserModalOpened$ = this.orcaUserModalOpenedSubject.asObservable();

  /**
   * Open Orca User creation modal with context
   */
  openOrcaUserModal(context: OrcaUserModalContext, metadata?: any) {
    console.log(
      'ModalService.openOrcaUserModal called with context:',
      context,
      'metadata:',
      metadata,
    );
    this.orcaUserModalContext.set(context);
    this.orcaUserModalMetadata.set(metadata);
    this.orcaUserModalVisible.set(true);
    
    // Emit modal opened event for components to react
    this.orcaUserModalOpenedSubject.next({ context, metadata });
  }

  /**
   * Close Orca User modal and reset state
   */
  closeOrcaUserModal() {
    console.log('ModalService.closeOrcaUserModal called');
    this.orcaUserModalVisible.set(false);
    this.orcaUserModalContext.set(null);
    this.orcaUserModalMetadata.set(null);
  }

  /**
   * Handle Orca User creation success
   */
  handleOrcaUserCreated(user: any) {
    const context = this.orcaUserModalContext();
    if (context) {
      const config = ORCA_USER_MODAL_CONFIG[context];
      console.log('ModalService.handleOrcaUserCreated - context:', context, 'config:', config);

      this.orcaUserCreatedSubject.next({
        user,
        context,
        config,
      });

      // Close the modal after successful creation
      this.closeOrcaUserModal();
    }
  }

  // Getters for reactive state
  isOrcaUserModalVisible() {
    return this.orcaUserModalVisible;
  }

  getCurrentOrcaUserModalContext() {
    return this.orcaUserModalContext;
  }

  // ===== CUSTOMER USER MODAL MANAGEMENT =====
  // State management for Customer users (future implementation)
  private customerUserModalVisible = signal(false);
  private customerUserModalContext = signal<CustomerUserModalContext | null>(null);
  private customerUserModalMetadata = signal<any>(null);

  // Event stream for customer user creation (future)
  private customerUserCreatedSubject = new Subject<CustomerUserCreatedEvent>();
  public customerUserCreated$ = this.customerUserCreatedSubject.asObservable();

  /**
   * Open Customer User creation modal with context (future)
   */
  openCustomerUserModal(context: CustomerUserModalContext, metadata?: any) {
    console.log(
      'ModalService.openCustomerUserModal called with context:',
      context,
      'metadata:',
      metadata,
    );
    this.customerUserModalContext.set(context);
    this.customerUserModalMetadata.set(metadata);
    this.customerUserModalVisible.set(true);
  }

  /**
   * Close Customer User modal and reset state (future)
   */
  closeCustomerUserModal() {
    console.log('ModalService.closeCustomerUserModal called');
    this.customerUserModalVisible.set(false);
    this.customerUserModalContext.set(null);
    this.customerUserModalMetadata.set(null);
  }

  /**
   * Handle Customer User creation success (future)
   */
  handleCustomerUserCreated(user: any) {
    const context = this.customerUserModalContext();
    if (context) {
      const config = CUSTOMER_USER_MODAL_CONFIG[context];
      console.log('ModalService.handleCustomerUserCreated - context:', context, 'config:', config);

      this.customerUserCreatedSubject.next({
        user,
        context,
        config,
      });

      // Close the modal after successful creation
      this.closeCustomerUserModal();
    }
  }

  // Getters for reactive state
  isCustomerUserModalVisible() {
    return this.customerUserModalVisible;
  }

  getCurrentCustomerUserModalContext() {
    return this.customerUserModalContext;
  }

  // ===== CLIENT MODAL MANAGEMENT =====
  // State management for client creation/editing
  private clientModalVisible = signal(false);
  private clientModalContext = signal<'SIDEBAR' | 'CLIENT_LIST' | null>(null);
  private clientModalMetadata = signal<any>(null);

  // Event stream for client creation
  private clientCreatedSubject = new Subject<ClientCreatedEvent>();
  public clientCreated$ = this.clientCreatedSubject.asObservable();

  // Event stream for client modal opening
  private clientModalOpenedSubject = new Subject<{ context: 'SIDEBAR' | 'CLIENT_LIST'; metadata?: any }>();
  public clientModalOpened$ = this.clientModalOpenedSubject.asObservable();

  /**
   * Open Client creation modal with context
   */
  openClientModal(context: 'SIDEBAR' | 'CLIENT_LIST', metadata?: any) {
    console.log(
      'ModalService.openClientModal called with context:',
      context,
      'metadata:',
      metadata,
    );
    this.clientModalContext.set(context);
    this.clientModalMetadata.set(metadata);
    this.clientModalVisible.set(true);
    
    // Emit modal opened event for components to react
    this.clientModalOpenedSubject.next({ context, metadata });
  }

  /**
   * Close Client modal and reset state
   */
  closeClientModal() {
    console.log('ModalService.closeClientModal called');
    this.clientModalVisible.set(false);
    this.clientModalContext.set(null);
    this.clientModalMetadata.set(null);
  }

  /**
   * Handle Client creation success
   */
  handleClientCreated(client: any) {
    const context = this.clientModalContext();
    if (context) {
      console.log('ModalService.handleClientCreated - context:', context, 'client:', client);

      this.clientCreatedSubject.next({
        client,
        context,
      });

      // Close the modal after successful creation
      this.closeClientModal();
    }
  }

  // Getters for reactive state
  isClientModalVisible() {
    return this.clientModalVisible;
  }

  getCurrentClientModalContext() {
    return this.clientModalContext;
  }

  // ===== LEGACY METHODS (For backwards compatibility, will be removed) =====
  private modalActionSubject = new Subject<ModalAction>();
  public modalAction$ = this.modalActionSubject.asObservable();
  currentModalAction = signal<ModalAction | null>(null);

  constructor() {}

  /**
   * @deprecated Use openOrcaUserModal() instead
   */
  triggerModalAction(action: ModalAction) {
    console.log('ModalService.triggerModalAction called with:', action, '(DEPRECATED)');
    this.modalActionSubject.next(action);
    this.currentModalAction.set(action);
  }

  /**
   * @deprecated Use closeOrcaUserModal() instead
   */
  clearModalAction() {
    console.log('ModalService.clearModalAction called (DEPRECATED)');
    this.currentModalAction.set(null);
  }

  /**
   * @deprecated Use openOrcaUserModal() instead
   */
  triggerCreateUser() {
    console.log('ModalService.triggerCreateUser called! (DEPRECATED)');
    this.triggerModalAction({ type: 'create-user' });
  }

  /**
   * @deprecated Use openClientModal() instead
   */
  triggerCreateClient() {
    console.log('ModalService.triggerCreateClient called! (DEPRECATED)');
    this.triggerModalAction({ type: 'create-client' });
  }

  /**
   * @deprecated Future implementation
   */
  triggerCreateAccount() {
    this.triggerModalAction({ type: 'create-account' });
  }

  /**
   * @deprecated Future implementation
   */
  triggerAssignAccount() {
    this.triggerModalAction({ type: 'assign-account' });
  }
}
