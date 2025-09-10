/**
 * Clients Store - Simplified Version
 *
 * Store específico para gestión de clientes del sistema BackOffice
 * sin polling automático. Los servicios actualizan el store manualmente cuando es necesario.
 */

import { Injectable, computed, signal } from '@angular/core';
import { ClientResponseDTO as Client, ClientSettings } from 'shared-features';

// Define local types since some were removed
export interface ClientStatistics {
  totalClients: number;
  activeClients: number;
  suspendedClients: number;
}

// Temporary interface to maintain compatibility
interface ExtendedClient extends Client {
  status?: 'active' | 'suspended';
  enabled?: boolean;
}

export interface OrganizationOption {
  id: number | 'ORCA';
  name: string;
  isOrcaOption: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ClientsStore {
  // Private state signals
  private _clients = signal<ExtendedClient[]>([]);
  private _loading = signal(false);
  private _error = signal<Error | null>(null);
  private _lastFetch = signal<Date | null>(null);
  private _totalElements = signal(0);
  private _currentPage = signal(0);

  // Organization selection state
  private _selectedClient = signal<ExtendedClient | null>(null);
  private _customerToken = signal<string | null>(null);

  // Storage keys for persistence
  private readonly SELECTED_CLIENT_KEY = 'backoffice-selected-client';
  private readonly CUSTOMER_TOKEN_KEY = 'customer-token';

  // Public readonly signals
  readonly clients = this._clients.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly lastFetch = this._lastFetch.asReadonly();
  readonly totalElements = this._totalElements.asReadonly();
  readonly currentPage = this._currentPage.asReadonly();

  // Organization selection readonly signals
  readonly selectedClient = this._selectedClient.asReadonly();
  readonly customerToken = this._customerToken.asReadonly();

  // Computed signals para consultas específicas del dominio
  readonly hasData = computed(() => this.clients().length > 0);
  readonly totalClients = computed(() => this.clients().length);

  readonly activeClients = computed(() => this.clients().filter((client) => client.isActive ?? (client.enabled !== false)));

  readonly suspendedClients = computed(() => this.clients().filter((client) => !(client.isActive ?? (client.enabled !== false))));

  readonly clientsByStatus = computed(() => {
    const clients = this.clients();
    return {
      active: clients.filter((c) => (c.status === 'active') || (c.isActive ?? (c.enabled !== false))).length,
      suspended: clients.filter((c) => (c.status === 'suspended') || !(c.isActive ?? (c.enabled !== false))).length,
    };
  });

  readonly recentClients = computed(() => {
    const clients = this.clients();
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    return clients.filter((client) => {
      if (!client.createdAt) return false;
      return new Date(client.createdAt) > weekAgo;
    });
  });

  readonly statistics = computed((): ClientStatistics => {
    const clients = this.clients();

    return {
      totalClients: this.totalElements() || clients.length,
      activeClients: clients.filter((c) => c.isActive ?? (c.enabled !== false)).length,
      suspendedClients: clients.filter((c) => !(c.isActive ?? (c.enabled !== false))).length,
    };
  });

  // Organization selection computed signals
  readonly organizationOptions = computed((): OrganizationOption[] => {
    const activeClients = this.activeClients();
    const clientOptions: OrganizationOption[] = activeClients.map((client) => ({
      id: client.id,
      name: client.name,
      isOrcaOption: false,
    }));

    // Add ORCA option at the beginning
    return [{ id: 'ORCA', name: 'ORCA', isOrcaOption: true }, ...clientOptions];
  });

  readonly isOrcaSelected = computed(() => this.selectedClient() === null);

  constructor() {
    // Load persisted organization selection
    this.loadPersistedSelection();
  }

  /**
   * Métodos para actualizar el estado desde los servicios
   */

  /**
   * Establece la lista completa de clientes
   */
  setClients(clients: ExtendedClient[]): void {
    this._clients.set(clients);
    this._lastFetch.set(new Date());
    this._error.set(null);
  }

  /**
   * Establece datos de paginación junto con clientes
   */
  setClientsWithPagination(clients: ExtendedClient[], totalElements: number, currentPage: number): void {
    this._clients.set(clients);
    this._totalElements.set(totalElements);
    this._currentPage.set(currentPage);
    this._lastFetch.set(new Date());
    this._error.set(null);
  }

  /**
   * Agrega un nuevo cliente al store
   */
  addClient(client: ExtendedClient): void {
    const currentClients = this._clients();
    this._clients.set([...currentClients, client]);
    this._totalElements.update((count) => count + 1);
  }

  /**
   * Actualiza un cliente existente
   */
  updateClient(updatedClient: ExtendedClient): void {
    const currentClients = this._clients();
    const index = currentClients.findIndex((c) => c.id === updatedClient.id);

    if (index !== -1) {
      const newClients = [...currentClients];
      newClients[index] = updatedClient;
      this._clients.set(newClients);
    }
  }

  /**
   * Actualiza un cliente por ID con datos parciales
   */
  updateClientById(clientId: number, updates: Partial<ExtendedClient>): void {
    const currentClients = this._clients();
    const index = currentClients.findIndex((c) => c.id === clientId);

    if (index !== -1) {
      const newClients = [...currentClients];
      newClients[index] = { ...newClients[index], ...updates };
      this._clients.set(newClients);
    }
  }

  /**
   * Elimina un cliente del store
   */
  removeClient(clientId: number): void {
    const currentClients = this._clients();
    const filteredClients = currentClients.filter((c) => c.id !== clientId);
    this._clients.set(filteredClients);
    this._totalElements.update((count) => Math.max(0, count - 1));
  }

  /**
   * Cambia el estado de un cliente (activo/suspendido)
   */
  toggleClientStatus(clientId: number): void {
    const currentClients = this._clients();
    const index = currentClients.findIndex((c) => c.id === clientId);

    if (index !== -1) {
      const newClients = [...currentClients];
      const client = newClients[index];
      const currentActive = client.isActive ?? (client.enabled !== false);
      newClients[index] = {
        ...client,
        isActive: !currentActive,
        status: currentActive ? 'suspended' : 'active',
        updatedAt: new Date().toISOString(),
      };
      this._clients.set(newClients);
    }
  }

  /**
   * Establece el estado de loading
   */
  setLoading(loading: boolean): void {
    this._loading.set(loading);
  }

  /**
   * Establece un error
   */
  setError(error: Error | null): void {
    this._error.set(error);
  }

  /**
   * Actualiza información de paginación
   */
  setPaginationInfo(totalElements: number, currentPage: number): void {
    this._totalElements.set(totalElements);
    this._currentPage.set(currentPage);
  }

  /**
   * Limpia todos los datos del store
   */
  clear(): void {
    this._clients.set([]);
    this._loading.set(false);
    this._error.set(null);
    this._lastFetch.set(null);
    this._totalElements.set(0);
    this._currentPage.set(0);
    // Also clear organization selection
    this.clearSelectedClient();
  }

  /**
   * Organization selection methods
   */

  /**
   * Sets the selected client and customer token
   */
  setSelectedClient(client: ExtendedClient, customerToken: string): void {
    this._selectedClient.set(client);
    this._customerToken.set(customerToken);
    this.persistSelection();
  }

  /**
   * Clears the selected client and customer token (ORCA selection)
   */
  clearSelectedClient(): void {
    this._selectedClient.set(null);
    this._customerToken.set(null);
    this.persistSelection();
  }

  /**
   * Sets only the customer token (for cases where we get a new token)
   */
  setCustomerToken(token: string): void {
    this._customerToken.set(token);
    localStorage.setItem(this.CUSTOMER_TOKEN_KEY, token);
  }

  /**
   * Persists the current selection to localStorage
   */
  private persistSelection(): void {
    const selectedClient = this._selectedClient();
    const customerToken = this._customerToken();

    if (selectedClient && customerToken) {
      localStorage.setItem(this.SELECTED_CLIENT_KEY, JSON.stringify(selectedClient));
      localStorage.setItem(this.CUSTOMER_TOKEN_KEY, customerToken);
    } else {
      localStorage.removeItem(this.SELECTED_CLIENT_KEY);
      localStorage.removeItem(this.CUSTOMER_TOKEN_KEY);
    }
  }

  /**
   * Loads persisted selection from localStorage
   */
  private loadPersistedSelection(): void {
    try {
      const savedClient = localStorage.getItem(this.SELECTED_CLIENT_KEY);
      const savedToken = localStorage.getItem(this.CUSTOMER_TOKEN_KEY);

      if (savedClient && savedToken) {
        const client = JSON.parse(savedClient) as Client;
        this._selectedClient.set(client);
        this._customerToken.set(savedToken);
      }
    } catch (error) {
      console.warn('Error loading persisted client selection:', error);
      // Clear invalid data
      localStorage.removeItem(this.SELECTED_CLIENT_KEY);
      localStorage.removeItem(this.CUSTOMER_TOKEN_KEY);
    }
  }

  /**
   * Métodos de consulta
   */

  /**
   * Obtiene un cliente por ID
   */
  getClientById(id: number): ExtendedClient | undefined {
    return this.clients().find((client) => client.id === id);
  }

  /**
   * Obtiene clientes por estado
   */
  getClientsByStatus(status: 'active' | 'suspended'): ExtendedClient[] {
    return this.clients().filter((client) => client.status === status);
  }

  /**
   * Busca clientes por término
   */
  searchClients(searchTerm: string): ExtendedClient[] {
    if (!searchTerm.trim()) return this.clients();

    const term = searchTerm.toLowerCase();
    return this.clients().filter(
      (client) =>
        client.name.toLowerCase().includes(term) ||
        (client.description || '').toLowerCase().includes(term) ||
        (client.legalContactEmail || client.contactEmail || '').toLowerCase().includes(term) ||
        (client.legalContactPhone || client.contactPhone || '').toLowerCase().includes(term) ||
        (client.domainUrl || client.subdomain || '').toLowerCase().includes(term) ||
        client.schemaName.toLowerCase().includes(term),
    );
  }

  /**
   * Obtiene clientes por patrón de dominio
   */
  getClientsByDomain(domainPattern: string): ExtendedClient[] {
    const pattern = domainPattern.toLowerCase();
    return this.clients().filter((client) => (client.domainUrl || client.subdomain || '').toLowerCase().includes(pattern));
  }

  /**
   * Verifica si el store tiene datos frescos (últimos 5 minutos)
   */
  isDataFresh(): boolean {
    const lastFetch = this.lastFetch();
    if (!lastFetch) return false;

    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    return lastFetch > fiveMinutesAgo;
  }

  /**
   * Obtiene información de debug del store
   */
  getDebugInfo() {
    return {
      clientsCount: this.clients().length,
      totalElements: this.totalElements(),
      currentPage: this.currentPage(),
      isLoading: this.loading(),
      hasError: this.error() !== null,
      lastFetch: this.lastFetch(),
      isDataFresh: this.isDataFresh(),
      statistics: this.statistics(),
    };
  }
}
