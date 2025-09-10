/**
 * Backend API Response Types
 * These types are used for communication with backend APIs
 * Specific to API response patterns and HTTP communication
 */

/**
 * Standard API error response structure
 */
export interface ApiError {
  message: string;
  code?: string;
  details?: string;
  timestamp?: string;
  path?: string;
  status?: number;
}

/**
 * Generic API success response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp?: string;
}

/**
 * Sort direction for API pagination
 */
export type SortDirection = 'asc' | 'desc';

/**
 * Sort configuration for API requests
 */
export interface SortConfig {
  field: string;
  direction: SortDirection;
}

/**
 * Extended pagination request with additional parameters
 */
export interface PaginationRequest {
  page: number;
  size: number;
  sort?: string | SortConfig[];
  search?: string;
  filters?: Record<string, any>;
}

/**
 * API metadata for responses
 */
export interface ApiMetadata {
  requestId?: string;
  version?: string;
  timestamp: string;
  executionTime?: number;
}

/**
 * Generic API list response with metadata
 */
export interface ApiListResponse<T> {
  content: T[];
  metadata: ApiMetadata;
  pagination: {
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
    first: boolean;
    last: boolean;
    empty: boolean;
  };
}

/**
 * HTTP methods for API requests
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/**
 * API endpoint configuration
 */
export interface ApiEndpoint {
  method: HttpMethod;
  url: string;
  requiresAuth?: boolean;
  timeout?: number;
}

/**
 * Bulk operation request
 */
export interface BulkRequest<T> {
  operation: 'create' | 'update' | 'delete';
  data: T[];
}

/**
 * Bulk operation response
 */
export interface BulkResponse<T> {
  successful: T[];
  failed: Array<{
    item: T;
    error: ApiError;
  }>;
  totalProcessed: number;
  successCount: number;
  failureCount: number;
}