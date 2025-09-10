import { PageResponse, ClientResponseDTO } from 'customer-features';
import { environment } from '../../../../environments/environment';

/**
 * API response type for paginated clients list
 * Uses the generic PageResponse interface from customer-features
 */
export type ClientsPageResponse = PageResponse<ClientResponseDTO>;

/**
 * API endpoints configuration for clients module
 * Base URL comes from environment configuration
 */
export const BACKOFFICE_ENDPOINTS = {
  CLIENTS: `${environment.apiUrl}/clients`,
  CLIENT_BY_ID: (id: number) => `${environment.apiUrl}/clients/${id}`,
  ACTIVE_CLIENTS: `${environment.apiUrl}/clients/active`,
  CLIENT_USERS: (id: number) => `${environment.apiUrl}/clients/${id}/users`,
  ADD_USER_TO_CLIENT: (clientId: number, userId: number) =>
    `${environment.apiUrl}/clients/${clientId}/users/${userId}`,
} as const;

/**
 * API request/response type for user assignment
 */
export interface AddUserToClientRequest {
  role: 'admin' | 'user' | 'viewer';
}

/**
 * API response for client users
 * This will be refined once the actual API structure is known
 */
export interface ClientUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  assignedAt: string;
}
