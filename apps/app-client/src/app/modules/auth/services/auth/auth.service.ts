import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import {
  AuthUtils,
  handleMockAuth,
  BackofficeUserData,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  LoginRequest,
  LoginResponse,
} from 'shared-features';
import { environment } from '../../../../../environments/environment';
import { ClientsStore } from '../../../../stores/clients/clients.store';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private clientsStore = inject(ClientsStore);

  // TODO: Replace with actual API endpoints from environment
  private readonly baseUrl = `${environment.apiUrl}`;
  private readonly storageKey = 'backoffice-user-data';

  // Signals for reactive state management
  currentUser = signal<BackofficeUserData | null>(null);
  isLoading = signal(false);

  constructor() {
    // Initialize user data from localStorage
    const userData = AuthUtils.getUserData<BackofficeUserData>(this.storageKey);
    if (userData) {
      this.currentUser.set(userData);
    }
  }

  /**
   * Login with email and password
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    this.isLoading.set(true);

    // TEMPORARY: Mock authentication for development - Remove this line for production
    const mockResult = handleMockAuth(credentials, 'backoffice', {
      storageKey: this.storageKey,
      onSuccess: (userData) => {
        this.currentUser.set(userData as BackofficeUserData);
        this.isLoading.set(false);
      },
      navigate: () => this.router.navigate(['/home']),
    });
    if (mockResult) return mockResult.observable as Observable<LoginResponse>;

    // Normal API call for non-mock users
    return this.http.post<LoginResponse>(`${this.baseUrl}/login`, credentials).pipe(
      tap((response) => {
        console.log(response);
        if (response.token && response.username && response.email) {
          // Create BackofficeUserData from response
          const userData: BackofficeUserData = {
            id: response.username, // Using username as id since no id is provided
            email: response.email,
            firstName: '', // Not provided in response, set as empty
            lastName: '', // Not provided in response, set as empty
            isActive: true, // Assume user is active if login is successful
            createdAt: new Date().toISOString(), // Set current date as placeholder
            updatedAt: new Date().toISOString(), // Set current date as placeholder
            roles: response.roles,
            permissions: [], // Not provided in response, set as empty array
          };

          // Store user data and token information
          AuthUtils.setUserData(userData, this.storageKey);
          localStorage.setItem('backoffice-token', response.token);
          localStorage.setItem('backoffice-refresh-token', response.refreshToken);
          localStorage.setItem('backoffice-token-type', response.tokenType);
          localStorage.setItem('backoffice-expires-in', response.expiresIn.toString());

          this.currentUser.set(userData);
          this.router.navigate(['/home']).then();
        }
      }),
      catchError((error) => {
        console.error('Login error:', error);
        this.isLoading.set(false);
        return throwError(() => error);
      }),
      tap(() => this.isLoading.set(false)),
    );
  }

  /**
   * Request password reset
   */
  forgotPassword(request: ForgotPasswordRequest): Observable<ForgotPasswordResponse> {
    this.isLoading.set(true);

    return this.http.post<ForgotPasswordResponse>(`${this.baseUrl}/forgot-password`, request).pipe(
      catchError((error) => {
        console.error('Forgot password error:', error);
        return throwError(() => error);
      }),
      tap(() => this.isLoading.set(false)),
    );
  }

  /**
   * Logout user
   */
  logout(): void {
    // Clear localStorage
    AuthUtils.removeUserData(this.storageKey);
    localStorage.removeItem('backoffice-token');
    localStorage.removeItem('backoffice-refresh-token');
    localStorage.removeItem('backoffice-token-type');
    localStorage.removeItem('backoffice-expires-in');

    // Clear selected organization (reset to ORCA)
    this.clientsStore.clearSelectedClient();

    // Reset signals
    this.currentUser.set(null);

    // Redirect to login
    this.router.navigate(['/login']).then();
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return AuthUtils.isAuthenticated(this.storageKey);
  }

  /**
   * Get current user data
   */
  getCurrentUser(): BackofficeUserData | null {
    return this.currentUser();
  }
}
