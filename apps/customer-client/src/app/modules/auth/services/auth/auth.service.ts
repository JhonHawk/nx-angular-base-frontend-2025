import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import {
  AuthUtils,
  handleMockAuth,
  LoginRequest,
  LoginResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  CustomerUserData
} from 'customer-features';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  // Customer portal API endpoint
  // private readonly baseUrl = 'https://n2w1pf59-8080.usw3.devtunnels.ms/sns/auth';
  private readonly baseUrl = `${environment.apiUrl}/auth`;
  private readonly storageKey = 'customer-user-data';

  // Signals for reactive state management
  currentUser = signal<CustomerUserData | null>(null);
  isLoading = signal(false);

  constructor() {
    // Initialize user data from localStorage
    const userData = AuthUtils.getUserData<CustomerUserData>(this.storageKey);
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
    const mockResult = handleMockAuth(credentials, 'customer', {
      storageKey: this.storageKey,
      onSuccess: (userData) => {
        this.currentUser.set(userData as CustomerUserData);
        this.isLoading.set(false);
      },
      navigate: () => this.router.navigate(['/home'])
    });
    if (mockResult) return mockResult.observable as Observable<LoginResponse>;

    // Normal API call for non-mock users
    return this.http.post<LoginResponse>(`${this.baseUrl}/login`, credentials).pipe(
      tap((response) => {
        console.log(response);
        if (response.token && response.username && response.email) {
          // Create CustomerUserData from response
          const userData: CustomerUserData = {
            id: response.username, // Using username as id since no id is provided
            email: response.email,
            firstName: '', // Not provided in response, set as empty
            lastName: '', // Not provided in response, set as empty
            isActive: true, // Assume user is active if login is successful
            createdAt: new Date().toISOString(), // Set current date as placeholder
            updatedAt: new Date().toISOString(), // Set current date as placeholder
            accountId: response.username, // Using username as accountId placeholder
            role: 'user', // Default role for customer
            permissions: [], // Not provided in response, set as empty array
          };

          // Store user data and token information
          AuthUtils.setUserData(userData, this.storageKey);
          localStorage.setItem('customer-token', response.token);
          localStorage.setItem('customer-refresh-token', response.refreshToken);
          localStorage.setItem('customer-token-type', response.tokenType);
          localStorage.setItem('customer-expires-in', response.expiresIn.toString());

          this.currentUser.set(userData);
          this.router.navigate(['/home']).then();
        }
      }),
      catchError((error) => {
        console.error('Login error:', error);
        return throwError(() => error);
      }),
      tap(() => this.isLoading.set(false))
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
      tap(() => this.isLoading.set(false))
    );
  }

  /**
   * Logout user
   */
  logout(): void {
    // Clear localStorage
    AuthUtils.removeUserData(this.storageKey);
    localStorage.removeItem('customer-token');
    localStorage.removeItem('customer-refresh-token');
    localStorage.removeItem('customer-token-type');
    localStorage.removeItem('customer-expires-in');

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
  getCurrentUser(): CustomerUserData | null {
    return this.currentUser();
  }
}
