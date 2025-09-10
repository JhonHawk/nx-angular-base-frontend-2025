import { ClientSettings } from 'customer-features';

/**
 * Frontend Client interface (mapped from ClientResponseDTO)
 * This interface represents the client data structure used in the frontend,
 * with parsed and computed properties for better UI compatibility.
 */
export interface Client {
  id: number; // Changed from string to number (API uses integer)
  name: string; // Maps to ClientResponseDTO.name
  domainUrl: string; // Maps to ClientResponseDTO.domainUrl (deprecated, use subdomain)
  subdomain: string; // Maps to ClientResponseDTO.subdomain
  legalName: string; // Maps to ClientResponseDTO.legalName
  rfc: string; // Maps to ClientResponseDTO.rfc
  businessLineId: number; // Maps to ClientResponseDTO.businessLineId
  responsibleUserId?: number; // Maps to ClientResponseDTO.responsibleUserId
  logoUrl: string; // Maps to ClientResponseDTO.logoUrl
  schemaName: string; // Maps to ClientResponseDTO.schemaName
  subscriptionStartDate: string; // Maps to ClientResponseDTO.subscriptionStartDate
  subscriptionEndDate: string; // Maps to ClientResponseDTO.subscriptionEndDate
  description: string; // Maps to ClientResponseDTO.description
  contactEmail: string; // Maps to ClientResponseDTO.contactEmail
  contactPhone: string; // Maps to ClientResponseDTO.contactPhone
  settings: ClientSettings; // Parsed from ClientResponseDTO.settings JSON string
  isActive: boolean; // Maps to ClientResponseDTO.isActive
  createdAt: Date; // Parsed from ClientResponseDTO.createdAt ISO string
  updatedAt: Date; // Parsed from ClientResponseDTO.updatedAt ISO string
  // Additional computed properties for UI compatibility
  status: 'active' | 'suspended'; // Computed from isActive boolean
  usersCount?: number; // Will be fetched separately if needed
}

/**
 * Request interface for creating a new client
 * Based on CreateClientRequestDTO from API documentation
 */
export interface CreateClientRequest {
  name: string; // Required: Client name (2-200 chars)
  subdomain: string; // Required: Subdomain (lowercase, alphanumeric, hyphens)
  legalName: string; // Required: Legal name of the client (0-300 chars)
  rfc: string; // Required: RFC (Tax ID) (12-13 chars, specific pattern)
  businessLineId: number; // Required: Business line ID
  responsibleUserId?: number; // Optional: Responsible user ID
  description?: string; // Optional: Client description (max 1000 chars)
  logoUrl: string; // Required: Logo URL (max 500 chars) - set as default
  schemaName: string; // Required: Schema name suffix (1-49 chars, pattern)
  subscriptionStartDate: string; // Required: Subscription start date (YYYY-MM-DD)
  subscriptionEndDate: string; // Required: Subscription end date (YYYY-MM-DD)
  isActive?: boolean; // Optional: Whether the client is active (default: true)
  legalContactName?: string; // Optional: Legal contact name (max 200 chars)
  legalContactEmail?: string; // Optional: Legal contact email (max 150 chars)
  legalContactPhone?: string; // Optional: Legal contact phone (max 20 chars)
  technicalContactName?: string; // Optional: Technical contact name (max 200 chars)
  technicalContactEmail?: string; // Optional: Technical contact email (max 150 chars)
  technicalContactPhone?: string; // Optional: Technical contact phone (max 20 chars)
  settings?: ClientSettings; // Optional: Client settings
}

/**
 * Request interface for updating an existing client
 * All fields are optional to support partial updates
 */
export interface UpdateClientRequest {
  name?: string;
  subdomain?: string;
  legalName?: string;
  rfc?: string;
  businessLineId?: number;
  responsibleUserId?: number;
  description?: string;
  logoUrl?: string;
  schemaName?: string;
  subscriptionStartDate?: string;
  subscriptionEndDate?: string;
  isActive?: boolean;
  legalContactName?: string;
  legalContactEmail?: string;
  legalContactPhone?: string;
  technicalContactName?: string;
  technicalContactEmail?: string;
  technicalContactPhone?: string;
  settings?: ClientSettings;
}

/**
 * Interface for assigning users to clients
 */
export interface ClientAssignment {
  clientId: number; // Changed to match API
  userId: number; // API likely uses integer IDs
  role: 'admin' | 'user' | 'viewer';
  assignedAt: Date;
}

/**
 * Client statistics interface
 */
export interface ClientStatistics {
  totalClients: number;
  activeClients: number;
  suspendedClients: number;
}

/**
 * Client filters interface for API queries
 */
export interface ClientFilters {
  status?: string;
  search?: string;
  page?: number;
  size?: number;
}
