/**
 * Client/Account Management Types
 * Specific to BackOffice API and client management functionality
 */

// Client/Account Management Types (BackOffice API)
// Updated to match CreateClientRequestDTO structure from API documentation
export interface ClientResponseDTO {
  id: number;                    // Client ID
  name: string;                  // Client name
  subdomain: string;             // Subdomain
  legalName: string;             // Legal name of the client
  rfc: string;                   // RFC (Tax ID)
  businessLineId: number;        // Business line ID
  responsibleUserId?: number;    // Responsible user ID
  description: string;           // Client description
  logoUrl: string;               // Client logo URL
  schemaName: string;            // Database schema name
  subscriptionStartDate: string; // Subscription start date (ISO date)
  subscriptionEndDate: string;   // Subscription end date (ISO date)
  isActive: boolean;             // Whether client is active
  legalContactName?: string;     // Legal contact name
  legalContactEmail?: string;    // Legal contact email
  legalContactPhone?: string;    // Legal contact phone
  technicalContactName?: string; // Technical contact name
  technicalContactEmail?: string;// Technical contact email
  technicalContactPhone?: string;// Technical contact phone
  settings: string;              // Client settings as JSON string
  createdAt: string;             // ISO date-time string
  updatedAt: string;             // ISO date-time string
  // Legacy fields for backward compatibility
  domainUrl?: string;            // Deprecated, use subdomain
  contactEmail?: string;         // Deprecated, use legalContactEmail
  contactPhone?: string;         // Deprecated, use legalContactPhone
}

export interface ClientAccessDTO {
  clientId: number;              // Client ID
  clientName: string;            // Client name
  schemaName: string;            // Database schema name
  domainUrl: string;             // Client domain URL  
  logoUrl: string;               // Client logo URL
}

// Pagination support for API endpoints
export interface Pageable {
  page: number;                  // Page number (0-based)
  size: number;                  // Page size
  sort: string;                  // Sort criteria (e.g., "name,asc")
}

export interface PageResponse<T> {
  content: T[];                  // Page content
  totalElements: number;         // Total number of elements
  totalPages: number;           // Total number of pages
  size: number;                 // Page size
  number: number;               // Current page number (0-based)
  first: boolean;               // Is first page
  last: boolean;                // Is last page
  empty: boolean;               // Is page empty
}

// Client settings interface (parsed from JSON string)
export interface ClientSettings {
  theme?: 'light' | 'dark';
  customColors?: {
    primary: string;
    secondary: string;
  };
  features?: {
    enableNotifications: boolean;
    enableAnalytics: boolean;
  };
  [key: string]: any;           // Additional custom settings
}