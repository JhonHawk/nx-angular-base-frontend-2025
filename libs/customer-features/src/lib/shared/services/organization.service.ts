import { Injectable, signal, computed } from '@angular/core';

export interface Organization {
  id: string;
  name: string;
  description?: string;
}

@Injectable({
  providedIn: 'root'
})
export class OrganizationService {
  private selectedOrganization = signal<Organization | null>(null);
  private organizationToken = signal<string | null>(null);

  // Mock organizations data - replace with actual API call
  private organizations: Organization[] = [
    { id: '1', name: 'Acme Corporation', description: 'Technology Solutions' },
    { id: '2', name: 'Global Industries', description: 'Manufacturing & Logistics' },
    { id: '3', name: 'Digital Solutions Ltd', description: 'Software Development' },
    { id: '4', name: 'Green Energy Co', description: 'Renewable Energy' },
    { id: '5', name: 'HealthTech Partners', description: 'Healthcare Technology' }
  ];

  // Public signals
  selectedOrganization$ = computed(() => this.selectedOrganization());
  hasOrganizationSelected = computed(() => !!this.selectedOrganization());
  organizationToken$ = computed(() => this.organizationToken());

  // Get available organizations
  getOrganizations(): Organization[] {
    return this.organizations;
  }

  // Select an organization and generate token
  async selectOrganization(organization: Organization): Promise<void> {
    try {
      // Mock API call to get organization token
      const token = await this.generateOrganizationToken(organization.id);
      
      this.selectedOrganization.set(organization);
      this.organizationToken.set(token);
      
      // Store in localStorage for persistence
      localStorage.setItem('selected-organization', JSON.stringify(organization));
      localStorage.setItem('organization-token', token);
      
    } catch (error) {
      console.error('Error selecting organization:', error);
      throw error;
    }
  }

  // Clear organization selection
  clearOrganization(): void {
    this.selectedOrganization.set(null);
    this.organizationToken.set(null);
    
    // Clear from localStorage
    localStorage.removeItem('selected-organization');
    localStorage.removeItem('organization-token');
  }

  // Initialize from localStorage on service creation
  initializeFromStorage(): void {
    try {
      const storedOrganization = localStorage.getItem('selected-organization');
      const storedToken = localStorage.getItem('organization-token');
      
      if (storedOrganization && storedToken) {
        const organization = JSON.parse(storedOrganization);
        this.selectedOrganization.set(organization);
        this.organizationToken.set(storedToken);
      }
    } catch (error) {
      console.error('Error initializing from storage:', error);
      this.clearOrganization();
    }
  }

  // Mock API call to generate organization token
  private async generateOrganizationToken(organizationId: string): Promise<string> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock token generation
    return `org_token_${organizationId}_${Date.now()}`;
  }
}