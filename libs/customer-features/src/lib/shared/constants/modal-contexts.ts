// Modal contexts for different types of users and scenarios
// This file provides type-safe constants to avoid magic strings

// ===== ORCA USER CONTEXTS =====
// Contexts for Orca Team users (backoffice users)
export const ORCA_USER_MODAL_CONTEXTS = {
  // From sidebar navigation
  SIDEBAR: 'sidebar',
  // From orca team list page
  ORCA_TEAM_LIST: 'orca-team-list',
  
  // Future contexts for orca-users
  // ACCOUNT_ASSIGNMENT: 'account-assignment',     // Assign orca-user to customer account
  // SUPPORT_TICKET: 'support-ticket',            // Assign orca-user to support ticket  
  // AUDIT_LOG: 'audit-log',                      // Create orca-user from audit context
} as const;

// ===== CUSTOMER USER CONTEXTS =====
// Contexts for Customer organization users
export const CUSTOMER_USER_MODAL_CONTEXTS = {
  // From sidebar navigation (customer app)
  SIDEBAR: 'sidebar',
  // From customer users list
  CUSTOMER_LIST: 'customer-list',
  
  // Future contexts for customer-users
  // PROJECT_MEMBERS: 'project-members',          // Add customer-user to project team
  // ORGANIZATION_SETUP: 'organization-setup',   // Initial organization user setup
  // DEPARTMENT_USERS: 'department-users',       // Add user to department/area
  // APPROVAL_CHAIN: 'approval-chain',           // Add user to approval workflow
  // NOTIFICATION_GROUP: 'notification-group',   // Add user to notification groups
} as const;

// ===== TYPE DEFINITIONS =====
export type OrcaUserModalContext = typeof ORCA_USER_MODAL_CONTEXTS[keyof typeof ORCA_USER_MODAL_CONTEXTS];
export type CustomerUserModalContext = typeof CUSTOMER_USER_MODAL_CONTEXTS[keyof typeof CUSTOMER_USER_MODAL_CONTEXTS];

// ===== MODAL CONTEXT CONFIGURATION =====
// Configuration for different context behaviors
export interface ModalContextConfig {
  autoRefresh?: boolean;          // Should automatically refresh the source list
  successMessage?: string;        // Custom success message for this context
  requiresNavigation?: boolean;   // Legacy: if requires navigation (to be removed)
}

// Configuration for Orca User modal contexts
export const ORCA_USER_MODAL_CONFIG: Record<OrcaUserModalContext, ModalContextConfig> = {
  [ORCA_USER_MODAL_CONTEXTS.SIDEBAR]: {
    autoRefresh: false,
    successMessage: 'Usuario Orca creado exitosamente',
    requiresNavigation: false
  },
  [ORCA_USER_MODAL_CONTEXTS.ORCA_TEAM_LIST]: {
    autoRefresh: true,
    successMessage: 'Usuario Orca creado y visible en la lista',
    requiresNavigation: false
  }
};

// Configuration for Customer User modal contexts (future)
export const CUSTOMER_USER_MODAL_CONFIG: Record<CustomerUserModalContext, ModalContextConfig> = {
  [CUSTOMER_USER_MODAL_CONTEXTS.SIDEBAR]: {
    autoRefresh: false,
    successMessage: 'Usuario cliente creado exitosamente',
    requiresNavigation: false
  },
  [CUSTOMER_USER_MODAL_CONTEXTS.CUSTOMER_LIST]: {
    autoRefresh: true,
    successMessage: 'Usuario cliente creado y visible en la lista',
    requiresNavigation: false
  }
};