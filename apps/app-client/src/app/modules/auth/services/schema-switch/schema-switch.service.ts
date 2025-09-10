import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';
import { ClientsStore } from '../../../../stores/clients/clients.store';
import { ClientResponseDTO as Client } from 'shared-features';

/**
 * Request DTO for schema switch operation
 */
export interface SwitchSchemaRequestDTO {
  idClient: number;
}

/**
 * Response DTO for schema switch operation
 */
export interface SwitchSchemaResponseDTO {
  token: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  username: string;
  email: string;
  roles: string[];
}

/**
 * Service for handling organization/schema switching
 * Manages the customer-token needed for client-specific API operations
 */
@Injectable({
  providedIn: 'root',
})
export class SchemaSwitchService {
  private http = inject(HttpClient);
  private clientsStore = inject(ClientsStore);

  private readonly SCHEMA_SWITCH_ENDPOINT = `${environment.apiUrl}/schema/switch`;

  /**
   * Switch to a specific client schema
   * @param clientId - The ID of the client to switch to
   * @returns Observable with the customer token
   */
  switchToClient(clientId: number): Observable<string> {
    const request: SwitchSchemaRequestDTO = {
      idClient: clientId,
    };

    console.log('Switching to client:', clientId, 'Request:', request);

    return this.http.post<SwitchSchemaResponseDTO>(this.SCHEMA_SWITCH_ENDPOINT, request).pipe(
      tap((response) => {
        console.log('Schema switch response:', response);

        // Get the client from the store
        const client = this.clientsStore.getClientById(clientId);
        if (client) {
          // Update the store with selected client and token
          this.clientsStore.setSelectedClient(client, response.token);
          console.log(
            'Client selected and token saved:',
            client.name,
            response.token.substring(0, 20) + '...',
          );
        } else {
          // If client not found in store, just set the token
          this.clientsStore.setCustomerToken(response.token);
          console.log('Token saved without client:', response.token.substring(0, 20) + '...');
        }
      }),
      map((response) => response.token),
      catchError((error) => {
        console.error('Error switching schema:', error);
        // Clear any existing selection on error
        this.clientsStore.clearSelectedClient();
        return throwError(() => error);
      }),
    );
  }

  /**
   * Switch to APP (no client selected)
   * Clears the customer token and returns to default backoffice context
   */
  switchToApp(): Observable<void> {
    // Clear the selected client and token
    this.clientsStore.clearSelectedClient();
    return of(void 0);
  }

  /**
   * Handle organization selection (client or APP)
   * @param organizationId - The organization ID or 'APP'
   * @returns Observable that completes when switch is done
   */
  selectOrganization(organizationId: number | 'APP'): Observable<void> {
    if (organizationId === 'APP') {
      return this.switchToApp();
    } else {
      return this.switchToClient(organizationId).pipe(map(() => void 0));
    }
  }

  /**
   * Get the current customer token if any
   * @returns The current customer token or null
   */
  getCurrentCustomerToken(): string | null {
    return this.clientsStore.customerToken();
  }

  /**
   * Get the currently selected client
   * @returns The currently selected client or null
   */
  getCurrentClient(): Client | null {
    return this.clientsStore.selectedClient();
  }

  /**
   * Check if APP is currently selected (no client)
   */
  isAppSelected(): boolean {
    return this.clientsStore.isAppSelected();
  }
}
