// Modal contexts for different types of users and scenarios
// This file provides type-safe constants to avoid magic strings

// ===== USER CONTEXTS =====
// Contexts for Team users (backoffice users)
export const USER_MODAL_CONTEXTS = {
  // From sidebar navigation
  SIDEBAR: 'sidebar',
  // From users list page
  USERS_LIST: 'users-list',
  
  // Future contexts for users
  // ACCOUNT_ASSIGNMENT: 'account-assignment',     // Assign user to customer account
  // SUPPORT_TICKET: 'support-ticket',            // Assign user to support ticket  
  // AUDIT_LOG: 'audit-log',                      // Create user from audit context
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
export type UserModalContext = typeof USER_MODAL_CONTEXTS[keyof typeof USER_MODAL_CONTEXTS];
export type CustomerUserModalContext = typeof CUSTOMER_USER_MODAL_CONTEXTS[keyof typeof CUSTOMER_USER_MODAL_CONTEXTS];

// ===== MODAL CONTEXT CONFIGURATION =====
// Configuration for different context behaviors
export interface ModalContextConfig {
  autoRefresh?: boolean;          // Should automatically refresh the source list
  successMessage?: string;        // Custom success message for this context
  requiresNavigation?: boolean;   // Legacy: if requires navigation (to be removed)
}

// Configuration for User modal contexts
export const USER_MODAL_CONFIG: Record<UserModalContext, ModalContextConfig> = {
  [USER_MODAL_CONTEXTS.SIDEBAR]: {
    autoRefresh: false,
    successMessage: 'Usuario creado exitosamente',
    requiresNavigation: false
  },
  [USER_MODAL_CONTEXTS.USERS_LIST]: {
    autoRefresh: true,
    successMessage: 'Usuario creado y visible en la lista',
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