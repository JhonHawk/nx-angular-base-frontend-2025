/**
 * Internal exports for components within customer-features library
 * 
 * This file contains exports that should only be used by components
 * within this library to avoid circular dependencies.
 * 
 * DO NOT import from this file in external applications.
 * External applications should only import from 'customer-features' root.
 */

// === INTERNAL SERVICES ===
export { MenuService } from './services/menu.service';
export { OrganizationService } from './services/organization.service';
export { SidebarService } from './services/sidebar.service';
export { BreadcrumbService } from './services/breadcrumb.service';
export { ModalService } from './services/modal.service';

// Menu service types (used internally)
export type { MenuItem, MenuConfig } from './services/menu.service';

// Modal service types (used internally)
export type { ModalAction } from './services/modal.service';

// === INTERNAL UTILITIES ===
export { DarkModeService } from './utils/dark-mode.service';
export { AuthUtils, utilsCore } from './utils/utils-core';

// === INTERNAL TYPES ===
// Authentication types
export type {
  LoginRequest,
  LoginResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  BaseUserData,
  BackofficeUserData,
  CustomerUserData,
  UserData
} from './types/authentication.types';

// Layout types
export type {
  LayoutMenuItem,
  HeaderConfig,
  SidebarConfig
} from './types/layout.types';

// Chart types - Co-located with components
export type {
  ChartData,
  ChartDataset,
  LineChartDataset,
  DoughnutChartDataset,
  RadarChartDataset
} from './components/charts/chart.types';

// === INTERNAL CONSTANTS ===
export { sharedConstants } from './constants/shared-constants';