/**
 * Team management types for BackOffice Users API endpoints
 * Based on the API documentation from docs/api-docs.yaml
 */

// Core User Interface - Updated to match BackofficeUserResponseDTO from API
export interface BackOfficeUser {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  secondLastName?: string; // Optional as per API
  fullName?: string; // Computed by API
  phoneNumber?: string; // E.164 format with country code like "+525551234567"
  phoneExtension?: string;
  avatarUrl?: string;
  languageId?: number;
  languageCode?: string;
  languageName?: string;
  enabled: boolean;
  verified?: boolean;
  lastLogin?: string; // format: date-time
  roles: string[]; // Array of role codes like ["BO_ADMIN", "BO_MANAGER"]
  clientSchemas?: string[];
  registeredByUsername?: string;
  createdAt?: string; // format: date-time
  updatedAt?: string; // format: date-time
}

// Role-related interfaces
export interface UserRole {
  id: number;
  name: string;
  description: string;
  isActive: boolean;
  areas?: RoleArea[];
}

export interface RoleArea {
  id: number;
  name: string;
  description: string;
  isActive: boolean;
}

export interface AvailableRole {
  id: number;
  code: string; // Role code like "BO_ADMIN"
  name: string;
  description: string;
  isActive: boolean;
}

// API Request/Response types - Updated to match RegisterRequestDTO from API
export interface RegisterUserRequest {
  username: string;
  email: string;
  firstName: string; // includes first and middle names
  lastName: string; // paternal surname
  secondLastName?: string; // maternal surname - optional
  phoneNumber?: string; // Phone number with country code, pattern: "^\\+?[1-9]\\d{1,14}$"
  phoneExtension?: string; // optional
  roleCodes?: string[]; // Array of role codes, defaults to USER if empty
  effectiveRoleCodes?: string[]; // Read-only field
}

// UpdateUserRequestDTO - Only allows updating specific fields per API
export interface UpdateUserRequest {
  firstName: string; // required - includes first and middle names
  lastName: string; // required - paternal surname
  secondLastName?: string; // optional - maternal surname
  phoneNumber?: string; // optional - Phone number with country code
  phoneExtension?: string; // optional - Phone extension number
  // Note: email, username, roles, languageId, and enabled cannot be updated via this endpoint
}

export interface AssignRoleRequest {
  roleId: number;
  areas?: number[]; // Array of area IDs
}

export interface UserFilters {
  page?: number;
  size?: number;
  email?: string;
  firstName?: string;
  lastName?: string;
  isActive?: boolean;
  role?: string;
}

// API Response types - Updated to match actual API response structure
export interface UsersPageResponse {
  content: BackOfficeUser[];
  page: {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
  };
}

export interface BackOfficeStatusResponse {
  status: string;
  timestamp: string;
  version: string;
  uptime: number;
}

// Statistics and aggregated data
export interface UserStatistics {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  lockedUsers: number;
  recentLogins: number; // Last 24 hours
}

// User activity tracking
export interface UserActivity {
  id: number;
  userId: number;
  action: string;
  description: string;
  timestamp: string;
  ipAddress?: string;
}

// Utility types for UI
export interface UserTableColumn {
  field: string;
  header: string;
  sortable: boolean;
  filterable: boolean;
  type: 'text' | 'email' | 'date' | 'boolean' | 'badge' | 'actions';
}

export interface UserAction {
  label: string;
  icon: string;
  command: (user: BackOfficeUser) => void;
  visible: (user: BackOfficeUser) => boolean;
  severity?: 'success' | 'info' | 'warning' | 'danger';
}

// Form validation types
export interface UserFormErrors {
  email?: string;
  firstName?: string;
  lastName?: string;
  roles?: string;
}

export interface UserFormState {
  isValid: boolean;
  errors: UserFormErrors;
  touched: { [key: string]: boolean };
}
