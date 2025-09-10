// libs/shared-features/src/lib/index.ts - SINGLE BARREL FILE
// This is the ONLY barrel file in the shared-features library
// All other index.ts files should be removed for optimal tree-shaking

// ===== BUSINESS MODULES =====
// Future modules will be exported directly from their component files
// Example: export { InfoGeneralComponent } from './modules/organization/pages/info-general/info-general.component';

// ===== SHARED CONSTANTS =====
export { sharedConstants } from './shared/constants/shared-constants';

// Modal contexts and types
export { 
  ORCA_USER_MODAL_CONTEXTS, 
  CUSTOMER_USER_MODAL_CONTEXTS,
  ORCA_USER_MODAL_CONFIG,
  CUSTOMER_USER_MODAL_CONFIG
} from './shared/constants/modal-contexts';
export type { 
  OrcaUserModalContext, 
  CustomerUserModalContext, 
  ModalContextConfig 
} from './shared/constants/modal-contexts';

// ===== SHARED TYPES =====
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
} from './shared/types/authentication.types';

// Layout types
export type {
  LayoutMenuItem,
  HeaderConfig,
  SidebarConfig
} from './shared/types/layout.types';

// Client/Account Management types (BackOffice API)
export type {
  ClientResponseDTO,
  ClientAccessDTO,
  Pageable,
  PageResponse,
  ClientSettings
} from './shared/types/client-management.types';

// Chart types - Co-located with chart components
export type {
  ChartData,
  ChartDataset,
  LineChartDataset,
  DoughnutChartDataset,
  RadarChartDataset
} from './shared/components/charts/chart.types';

// Backend API types
export type {
  ApiError,
  ApiResponse,
  SortDirection,
  SortConfig,
  PaginationRequest,
  ApiMetadata,
  ApiListResponse,
  HttpMethod,
  ApiEndpoint,
  BulkRequest,
  BulkResponse
} from './shared/types/backend-api.types';

// ===== SHARED COMPONENTS =====
// Layout Components - Direct imports from component files
export { AuthenticatedLayout } from './shared/components/layouts/authenticated-layout/authenticated-layout';
export { UnauthenticatedLayout } from './shared/components/layouts/unauthenticated-layout/unauthenticated-layout';
export { PageHeader } from './shared/components/layouts/page-header';

// UI Components
export { ParticlesBackgroundComponent } from './shared/components/particles-background/particles-background.component';
export { NotFoundComponent } from './shared/components/not-found';
export { EmptyStateComponent } from './shared/components/empty-state/empty-state.component';

// Navigation Components
export { SidebarComponent } from './shared/components/layouts/sidebar/sidebar.component';
export { MenuItemComponent } from './shared/components/layouts/sidebar/menu-item/menu-item.component';
export { TopMenuComponent } from './shared/components/layouts/top-menu/top-menu.component';
export { BreadcrumbComponent } from './shared/components/breadcrumb/breadcrumb.component';

// Organization selector interfaces and injection token
export type { 
  OrganizationOption,
  OrganizationSelectorService 
} from './shared/components/layouts/top-menu/top-menu.component';

export { ORGANIZATION_SELECTOR_SERVICE } from './shared/components/layouts/top-menu/top-menu.component';

// Chart Components - Direct imports from component files
export { HorizontalBarChartComponent } from './shared/components/charts/horizontal-bar-chart/horizontal-bar-chart.component';
export { VerticalBarChartComponent } from './shared/components/charts/vertical-bar-chart/vertical-bar-chart.component';
export { LineChartComponent } from './shared/components/charts/line-chart/line-chart.component';
export { DoughnutChartComponent } from './shared/components/charts/doughnut-chart/doughnut-chart.component';
export { PieChartComponent } from './shared/components/charts/pie-chart/pie-chart.component';
export { RadarChartComponent } from './shared/components/charts/radar-chart/radar-chart.component';

// ===== SHARED UTILITIES =====
// Services
export { DarkModeService } from './shared/utils/dark-mode.service';

// HTTP Interceptor and configuration
export {
  httpInterceptor,
  configureHttpInterceptor,
  TIMEOUT_CONFIG,
  withTimeout
} from './shared/utils/http-interceptor';
export type { HttpInterceptorConfig } from './shared/utils/http-interceptor';

// Mock Auth Utilities
export { handleMockAuth } from './shared/utils/mock-auth';
export type { MockAuthResult } from './shared/utils/mock-auth';

// Core Utilities
export { AuthUtils, utilsCore } from './shared/utils/utils-core';

// ===== SHARED SERVICES =====
// NOTE: Services are primarily for internal use within components
// Applications should inject services directly, not import them
export { MenuService } from './shared/services/menu.service';
export { OrganizationService } from './shared/services/organization.service';
export { SidebarService } from './shared/services/sidebar.service';
export { BreadcrumbService } from './shared/services/breadcrumb.service';
export { ModalService } from './shared/services/modal.service';

// Modal service types
export type { 
  OrcaUserCreatedEvent, 
  CustomerUserCreatedEvent, 
  ModalAction 
} from './shared/services/modal.service';

// Menu service types - ONLY for external application use
// Internal library components should use internal.ts to avoid circular deps
export type { MenuItem, MenuConfig } from './shared/services/menu.service';

// ===== DATA EXPORTS =====
// Direct imports from data files (no intermediate barrel)
export { customerMenuItems, backofficeMenuItems } from './shared/constants/menu-items';

// Chart mock data exports
export {
  salesPerformanceData,
  userGrowthData,
  deviceUsageData,
  marketShareData,
  performanceMetricsData,
  monthlyRevenueData,
  customerSatisfactionData,
  trafficSourcesData,
  teamProductivityData
} from './shared/data/mocks/chart-data.mock';

// ===== STYLES =====
// PrimeNG Theme Preset
export { default as OrcaPreset } from './shared/styles/orcapreset';

// Note: CSS/SCSS styles don't need barrel files - imported directly in components

// ===== FORMS =====
// Future forms will be exported directly when implemented
// export { SomeFormComponent } from './shared/forms/some-form/some-form.component';

// ===== SIMPLIFIED STORES =====
// Los stores manejan directamente su lógica sin estrategias complejas
