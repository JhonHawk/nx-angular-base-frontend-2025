import { inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, catchError, map, Observable, of, throwError } from 'rxjs';
import { ClientResponseDTO, ClientSettings } from 'customer-features';

// Import clients store
import { ClientsStore } from '../../../../stores/clients/clients.store';

// Import types from dedicated type files
import {
  Client,
  ClientAssignment,
  ClientFilters,
  ClientStatistics,
  CreateClientRequest,
  UpdateClientRequest,
} from '../../types/client.types';
import {
  AddUserToClientRequest,
  BACKOFFICE_ENDPOINTS,
  ClientsPageResponse,
  ClientUser,
} from '../../types/api.types';

// All interfaces and API configuration have been moved to dedicated type files:
// - client.types.ts: Client, CreateClientRequest, UpdateClientRequest, ClientAssignment, etc.
// - api.types.ts: ClientsPageResponse, BACKOFFICE_ENDPOINTS, API-specific types

@Injectable({
  providedIn: 'root',
})
export class ClientsService {
  private http = inject(HttpClient);
  private clientsStore = inject(ClientsStore);

  // Expose store signals for backward compatibility
  clients = this.clientsStore.clients;
  isLoading = this.clientsStore.loading;
  totalElements = this.clientsStore.totalElements;
  currentPage = this.clientsStore.currentPage;

  private clientsSubject = new BehaviorSubject<Client[]>([]);
  public clients$ = this.clientsSubject.asObservable();

  constructor() {
    // Service initialized without automatic data loading
    // Data will be loaded when explicitly requested by components
  }

  /**
   * Load clients from API with pagination (used internally by getClients)
   */
  private loadClientsInternal(
    page = 0,
    size = 20,
    sort = 'name,asc',
    activeOnly = false,
  ): Observable<Client[]> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort);

    const endpoint = activeOnly
      ? BACKOFFICE_ENDPOINTS.ACTIVE_CLIENTS
      : BACKOFFICE_ENDPOINTS.CLIENTS;

    return this.http.get<ClientsPageResponse>(endpoint, { params }).pipe(
      map((response) => {
        // Update store with pagination info
        this.clientsStore.setPaginationInfo(response.totalElements, response.number);

        return response.content.map(this.mapClientResponseToClient);
      }),
      catchError((error) => {
        console.error('Error loading clients:', error);
        return throwError(() => error);
      }),
    );
  }

  /**
   * Get all clients with optional filtering
   */
  getClients(filters?: ClientFilters): Observable<Client[]> {
    this.clientsStore.setLoading(true);

    const page = filters?.page ?? 0;
    const size = filters?.size ?? 20;
    const activeOnly = filters?.status === 'active';

    return this.loadClientsInternal(page, size, 'name,asc', activeOnly).pipe(
      // Apply search filter on frontend (if backend doesn't support it)
      map((clients) => {
        if (filters?.search) {
          const searchTerm = filters.search.toLowerCase();
          return clients.filter(
            (client) =>
              client.name.toLowerCase().includes(searchTerm) ||
              client.description.toLowerCase().includes(searchTerm) ||
              client.contactEmail.toLowerCase().includes(searchTerm),
          );
        }
        return clients;
      }),
      // Update store and BehaviorSubject
      map((clients) => {
        this.clientsStore.setClients(clients);
        this.clientsSubject.next(clients);
        this.clientsStore.setLoading(false);
        return clients;
      }),
      catchError((error) => {
        console.error('Error fetching clients:', error);
        this.clientsStore.setLoading(false);
        this.clientsStore.setError(error);
        return throwError(() => error);
      }),
    );
  }

  /**
   * Get a single client by ID
   */
  getClientById(id: number): Observable<Client | null> {
    this.clientsStore.setLoading(true);

    return this.http.get<ClientResponseDTO>(BACKOFFICE_ENDPOINTS.CLIENT_BY_ID(id)).pipe(
      map((clientDto) => this.mapClientResponseToClient(clientDto)),
      catchError((error) => {
        console.error(`Error fetching client ${id}:`, error);
        this.clientsStore.setLoading(false);
        this.clientsStore.setError(error);
        return of(null);
      }),
      map((client) => {
        this.clientsStore.setLoading(false);
        return client;
      }),
    );
  }

  /**
   * Create a new client
   */
  createClient(clientData: CreateClientRequest): Observable<Client> {
    this.clientsStore.setLoading(true);

    // Convert ClientSettings to JSON string for API
    const apiRequest = {
      ...clientData,
      settings: clientData.settings ? JSON.stringify(clientData.settings) : '{}',
    };

    return this.http.post<ClientResponseDTO>(BACKOFFICE_ENDPOINTS.CLIENTS, apiRequest).pipe(
      map((clientDto) => this.mapClientResponseToClient(clientDto)),
      catchError((error) => {
        console.error('Error creating client:', error);
        this.clientsStore.setLoading(false);
        this.clientsStore.setError(error);
        return throwError(() => error);
      }),
      map((newClient) => {
        // Update store state
        this.clientsStore.addClient(newClient);
        const updatedClients = this.clients();
        this.clientsSubject.next(updatedClients);
        this.clientsStore.setLoading(false);
        return newClient;
      }),
    );
  }

  /**
   * Update an existing account
   */
  updateClient(id: number, updates: UpdateClientRequest): Observable<Client> {
    this.clientsStore.setLoading(true);

    // Convert updates to API format - only pass fields that exist in UpdateClientRequest
    const apiUpdates = {
      ...updates,
      settings: updates.settings ? JSON.stringify(updates.settings) : undefined,
    };

    return this.http.put<ClientResponseDTO>(BACKOFFICE_ENDPOINTS.CLIENT_BY_ID(id), apiUpdates).pipe(
      map((clientDto) => this.mapClientResponseToClient(clientDto)),
      catchError((error) => {
        console.error(`Error updating client ${id}:`, error);
        this.clientsStore.setLoading(false);
        this.clientsStore.setError(error);
        return throwError(() => error);
      }),
      map((updatedClient) => {
        // Update store state
        this.clientsStore.updateClient(updatedClient);
        const updatedClients = this.clients();
        this.clientsSubject.next(updatedClients);
        this.clientsStore.setLoading(false);
        return updatedClient;
      }),
    );
  }

  /**
   * Toggle client status (activate/suspend)
   */
  toggleClientStatus(id: number): Observable<Client> {
    const currentClients = this.clients();
    const client = currentClients.find((client) => client.id === id);

    if (!client) {
      throw new Error(`Client with ID ${id} not found`);
    }

    const newIsActive = !client.isActive;
    return this.updateClient(id, { isActive: newIsActive });
  }

  /**
   * Delete a client (soft delete by setting status to suspended)
   */
  deleteClient(id: number): Observable<boolean> {
    return this.updateClient(id, { isActive: false }).pipe(map(() => true));
  }

  /**
   * Assign users to clients
   */
  assignUsersToClients(assignments: ClientAssignment[]): Observable<boolean> {
    this.clientsStore.setLoading(true);

    // Execute all assignments in parallel
    const assignmentRequests = assignments.map((assignment) =>
      this.http.post<void>(
        BACKOFFICE_ENDPOINTS.ADD_USER_TO_CLIENT(assignment.clientId, assignment.userId),
        { role: assignment.role } as AddUserToClientRequest,
      ),
    );

    // Wait for all assignments to complete
    return new Observable<boolean>((subscriber) => {
      Promise.all(assignmentRequests.map((req) => req.toPromise()))
        .then(() => {
          this.clientsStore.setLoading(false);
          subscriber.next(true);
          subscriber.complete();
        })
        .catch((error) => {
          console.error('Error assigning users to clients:', error);
          this.clientsStore.setLoading(false);
          this.clientsStore.setError(error);
          subscriber.error(error);
        });
    });
  }

  /**
   * Get client statistics
   */
  getClientStatistics(): Observable<ClientStatistics> {
    // Fetch statistics from current cached data or make separate API calls
    const clients = this.clients();

    if (clients.length === 0) {
      // If no cached data, load clients first
      return this.getClients({ size: 1000 }).pipe(
        // Get large page to count all
        map(() => {
          const currentClients = this.clients();
          return {
            totalClients: this.totalElements(),
            activeClients: currentClients.filter((c) => c.isActive).length,
            suspendedClients: currentClients.filter((c) => !c.isActive).length,
          };
        }),
      );
    }

    return of({
      totalClients: this.totalElements(),
      activeClients: clients.filter((c) => c.isActive).length,
      suspendedClients: clients.filter((c) => !c.isActive).length,
    });
  }

  /**
   * Map ClientResponseDTO from API to frontend Client interface
   */
  private mapClientResponseToClient(clientDto: ClientResponseDTO): Client {
    // Parse settings JSON string, fallback to empty object if invalid
    let settings: ClientSettings = {};
    try {
      settings = clientDto.settings ? JSON.parse(clientDto.settings) : {};
    } catch {
      console.warn(`Invalid settings JSON for client ${clientDto.id}:`, clientDto.settings);
      settings = {};
    }

    return {
      id: clientDto.id,
      name: clientDto.name,
      domainUrl: clientDto.domainUrl || clientDto.subdomain || '',
      subdomain: clientDto.subdomain || '',
      legalName: clientDto.legalName || '',
      rfc: clientDto.rfc || '',
      businessLineId: clientDto.businessLineId || 0,
      responsibleUserId: clientDto.responsibleUserId,
      logoUrl: clientDto.logoUrl,
      schemaName: clientDto.schemaName,
      subscriptionStartDate: clientDto.subscriptionStartDate,
      subscriptionEndDate: clientDto.subscriptionEndDate,
      description: clientDto.description,
      contactEmail: clientDto.contactEmail || clientDto.legalContactEmail || '',
      contactPhone: clientDto.contactPhone || clientDto.legalContactPhone || '',
      settings: settings,
      isActive: clientDto.isActive,
      createdAt: new Date(clientDto.createdAt),
      updatedAt: new Date(clientDto.updatedAt),
      // Computed properties for UI compatibility
      status: clientDto.isActive ? 'active' : 'suspended',
      usersCount: 0, // Will be fetched separately if needed
    };
  }

  /**
   * Get users for a specific client
   */
  getClientUsers(clientId: number): Observable<ClientUser[]> {
    return this.http.get<ClientUser[]>(BACKOFFICE_ENDPOINTS.CLIENT_USERS(clientId)).pipe(
      catchError((error) => {
        console.error(`Error fetching users for client ${clientId}:`, error);
        return of([]);
      }),
    );
  }
}
