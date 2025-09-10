import { environment } from '../../../../environments/environment';

// API endpoints for business lines
// Base URL comes from environment configuration
export const BUSINESS_LINE_ENDPOINTS = {
  BUSINESS_LINES: `${environment.apiUrl}/business-lines`,
  BUSINESS_LINE_BY_ID: (id: number) => `${environment.apiUrl}/business-lines/${id}`,
  BUSINESS_LINE_BY_CODE: (code: string) => `${environment.apiUrl}/business-lines/code/${code}`,
  ACTIVE_BUSINESS_LINES: `${environment.apiUrl}/business-lines/active`,
  TOGGLE_STATUS: (id: number) => `${environment.apiUrl}/business-lines/${id}/toggle-status`,
} as const;

// Response interfaces for paginated results
export interface BusinessLinesPageResponse {
  content: import('./business-line.types').BusinessLineResponseDTO[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
}
