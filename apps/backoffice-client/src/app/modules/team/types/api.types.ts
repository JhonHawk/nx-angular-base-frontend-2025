import { environment } from '../../../../environments/environment';

/**
 * API endpoints configuration for Team module
 * BackOffice - Users API endpoints
 */
export const TEAM_API_ENDPOINTS = {
  // Base URL for all team/user management endpoints (environment.apiUrl already includes /bo)
  BASE: `${environment.apiUrl}/users`,

  // User management endpoints
  USERS: `${environment.apiUrl}/users`,
  USER_BY_ID: (id: number) => `${environment.apiUrl}/users/${id}`,
  REGISTER_USER: `${environment.apiUrl}/users/register`,

  // Role management endpoints
  USER_ROLES: (userId: number) => `${environment.apiUrl}/users/${userId}/roles`,
  ASSIGN_ROLE: (userId: number) => `${environment.apiUrl}/users/${userId}/roles`,
  REMOVE_ROLE: (userId: number, roleId: number) =>
    `${environment.apiUrl}/users/${userId}/roles/${roleId}`,
  AVAILABLE_ROLES: `${environment.apiUrl}/users/roles`,

  // System status
  STATUS: `${environment.apiUrl}/users/status`,

  // User account management
  RESET_LOGIN_ATTEMPTS: (userId: number) =>
    `${environment.apiUrl}/users/${userId}/reset-login-attempts`,
} as const;

/**
 * HTTP method types for API endpoints
 */
export const TEAM_API_METHODS = {
  GET_USERS: 'GET',
  GET_USER_ROLES: 'GET',
  REGISTER_USER: 'POST',
  ASSIGN_ROLE: 'POST',
  REMOVE_ROLE: 'DELETE',
  GET_AVAILABLE_ROLES: 'GET',
  GET_STATUS: 'GET',
  RESET_LOGIN_ATTEMPTS: 'PATCH',
} as const;

/**
 * API response wrapper types
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}
