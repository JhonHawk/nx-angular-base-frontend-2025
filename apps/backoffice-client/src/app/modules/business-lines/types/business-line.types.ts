// Business line types for backoffice client
export interface BusinessLine {
  id: number;
  code: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  // Computed properties for UI compatibility
  status: 'active' | 'inactive';
}

// API response interfaces
export interface BusinessLineResponseDTO {
  id: number;
  code: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Request interfaces for business line operations
export interface CreateBusinessLineRequest {
  code: string;
  name: string;
  description: string;
  isActive?: boolean;
}

export interface UpdateBusinessLineRequest {
  code?: string;
  name?: string;
  description?: string;
  isActive?: boolean;
}

// Filters for business line queries
export interface BusinessLineFilters {
  page?: number;
  size?: number;
  search?: string;
  status?: 'active' | 'inactive' | '';
}

// Statistics interface
export interface BusinessLineStatistics {
  totalBusinessLines: number;
  activeBusinessLines: number;
  inactiveBusinessLines: number;
}
