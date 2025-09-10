import { inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, catchError, map, Observable, of, tap, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { OrcaUsersStore } from '../../../stores/users/orca-users.store';

// Import types from a dedicated type file
import {
  AssignRoleRequest,
  AvailableRole,
  BackOfficeStatusResponse,
  BackOfficeUser,
  RegisterUserRequest,
  UpdateUserRequest,
  UserFilters,
  UserRole,
  UsersPageResponse,
  UserStatistics,
} from '../types/team.types';

/**
 * TeamService - BackOffice Users Management
 *
 * Handles all team/user management operations for BackOffice administration.
 * Based on the BackOffice - Users API endpoints (environment.apiUrl already includes /bo):
 * - GET /users/{userId}/roles - Get user roles
 * - POST /users/{userId}/roles - Assign role to user
 * - POST /users/register - Register new user
 * - PATCH /users/{userId}/reset-login-attempts - Reset user login attempts
 * - GET /users - Get all users
 * - GET /users/status - BackOffice status
 * - GET /users/roles - Get available roles
 * - DELETE /users/{userId}/roles/{roleId} - Remove role from user
 */
@Injectable({
  providedIn: 'root',
})
export class TeamService {
  private http = inject(HttpClient);
  private usersStore = inject(OrcaUsersStore);

  // API Endpoints configuration
  private readonly API_BASE = `${environment.apiUrl}/users`;

  private readonly ENDPOINTS = {
    // User management
    USERS: this.API_BASE,
    USER_BY_ID: (id: number) => `${this.API_BASE}/${id}`,
    REGISTER_USER: `${this.API_BASE}/register`,

    // User roles management
    USER_ROLES: (userId: number) => `${this.API_BASE}/${userId}/roles`,
    ASSIGN_ROLE: (userId: number) => `${this.API_BASE}/${userId}/roles`,
    REMOVE_ROLE: (userId: number, roleId: number) => `${this.API_BASE}/${userId}/roles/${roleId}`,

    // System endpoints
    STATUS: `${this.API_BASE}/status`,
    AVAILABLE_ROLES: `${this.API_BASE}/roles`,

    // User account management
    RESET_LOGIN_ATTEMPTS: (userId: number) => `${this.API_BASE}/${userId}/reset-login-attempts`,
  } as const;

  // Signal-based state management
  users = signal<BackOfficeUser[]>([]);
  availableRoles = signal<AvailableRole[]>([]);
  isLoading = signal(false);
  totalElements = signal(0);
  currentPage = signal(0);

  // Observable streams for reactive components
  private usersSubject = new BehaviorSubject<BackOfficeUser[]>([]);
  private rolesSubject = new BehaviorSubject<AvailableRole[]>([]);

  public users$ = this.usersSubject.asObservable();
  public availableRoles$ = this.rolesSubject.asObservable();

  constructor() {
    // Service initialized without automatic data loading
    // Data will be loaded when explicitly requested by components
  }

  // ==================== USER MANAGEMENT METHODS ====================

  /**
   * GET /bo/users - Get all users
   * Retrieves a paginated list of all users in the system
   */
  getAllUsers(filters?: UserFilters): Observable<BackOfficeUser[]> {
    this.usersStore.setLoading(true);
    this.isLoading.set(true);

    let params = new HttpParams();

    if (filters) {
      if (filters.page !== undefined) params = params.set('page', filters.page.toString());
      if (filters.size !== undefined) params = params.set('size', filters.size.toString());
      if (filters.email) params = params.set('email', filters.email);
      if (filters.firstName) params = params.set('firstName', filters.firstName);
      if (filters.lastName) params = params.set('lastName', filters.lastName);
      if (filters.isActive !== undefined)
        params = params.set('isActive', filters.isActive.toString());
      if (filters.role) params = params.set('role', filters.role);
    }

    return this.http.get<UsersPageResponse>(this.ENDPOINTS.USERS, { params }).pipe(
      tap((response) => {
        // Update pagination signals using the nested page object
        this.totalElements.set(response.page.totalElements);
        this.currentPage.set(response.page.number);

        // Update store first
        this.usersStore.setUsers(response.content);
        this.usersStore.setLoading(false);

        // Update legacy state for backwards compatibility
        this.users.set(response.content);
        this.usersSubject.next(response.content);
        this.isLoading.set(false);
      }),
      map((response) => response.content),
      catchError((error) => {
        this.usersStore.setError(error);
        this.usersStore.setLoading(false);
        this.isLoading.set(false);
        return throwError(() => error);
      }),
    );
  }

  /**
   * GET /bo/users/{userId}/roles - Get user roles
   * Retrieves all role assignments for a specific user
   */
  getUserRoles(userId: number): Observable<UserRole[]> {
    return this.http.get<UserRole[]>(this.ENDPOINTS.USER_ROLES(userId)).pipe(
      catchError((error) => {
        return throwError(() => error);
      }),
    );
  }

  /**
   * POST /bo/users/register - Register new user
   * Creates a new user in the system with specified roles
   */
  registerUser(userData: RegisterUserRequest): Observable<BackOfficeUser> {
    this.usersStore.setLoading(true);
    this.isLoading.set(true);

    return this.http.post<BackOfficeUser>(this.ENDPOINTS.REGISTER_USER, userData).pipe(
      tap((newUser) => {
        // Update store first
        this.usersStore.addUser(newUser);
        this.usersStore.setLoading(false);

        // Update legacy state for backwards compatibility
        const currentUsers = this.users();
        const updatedUsers = [...currentUsers, newUser];
        this.users.set(updatedUsers);
        this.usersSubject.next(updatedUsers);
        this.isLoading.set(false);
      }),
      catchError((error) => {
        this.usersStore.setError(error);
        this.usersStore.setLoading(false);
        this.isLoading.set(false);
        return throwError(() => error);
      }),
    );
  }

  /**
   * PUT /bo/users/{userId} - Update user
   * Updates an existing user in the system (only firstName, lastName, secondLastName, phoneNumber, phoneExtension)
   */
  updateUser(userId: number, userData: UpdateUserRequest): Observable<BackOfficeUser> {
    this.usersStore.setLoading(true);
    this.isLoading.set(true);

    return this.http.put<BackOfficeUser>(this.ENDPOINTS.USER_BY_ID(userId), userData).pipe(
      tap((updatedUser) => {
        // Update store first
        this.usersStore.updateUser(updatedUser);
        this.usersStore.setLoading(false);

        // Update legacy state for backwards compatibility
        this.updateUserInState(userId, () => updatedUser);
        this.isLoading.set(false);
      }),
      catchError((error) => {
        this.usersStore.setError(error);
        this.usersStore.setLoading(false);
        this.isLoading.set(false);
        return throwError(() => error);
      }),
    );
  }

  /**
   * Note: User deletion is not supported by the API.
   * Users can only be deactivated or have their roles removed.
   * Use resetUserLoginAttempts() or removeRoleFromUser() instead.
   */
  // deleteUser method removed - not supported by API

  // ==================== ROLE MANAGEMENT METHODS ====================

  /**
   * GET /bo/users/roles - Get available roles
   * Retrieves all available roles in the system for user assignment
   */
  getAvailableRoles(): Observable<AvailableRole[]> {
    return this.http.get<AvailableRole[]>(this.ENDPOINTS.AVAILABLE_ROLES).pipe(
      map((roles) => {
        this.availableRoles.set(roles);
        this.rolesSubject.next(roles);
        return roles;
      }),
      catchError((error) => {
        return throwError(() => error);
      }),
    );
  }

  /**
   * POST /bo/users/{userId}/roles - Assign role to user
   * Assigns a specific role to a backoffice user
   */
  assignRoleToUser(userId: number, roleData: AssignRoleRequest): Observable<UserRole> {
    return this.http.post<UserRole>(this.ENDPOINTS.ASSIGN_ROLE(userId), roleData).pipe(
      tap((assignedRole) => {
        // Update user in store first
        const user = this.usersStore.getUserById(userId);
        if (user) {
          const newRole = typeof assignedRole === 'string' ? assignedRole : assignedRole.name;
          const updatedRoles = [...user.roles, newRole];
          this.usersStore.updateUserRoles(userId, updatedRoles);
        }

        // Update legacy state for backwards compatibility
        this.updateUserInState(userId, (user) => ({
          ...user,
          roles: [
            ...user.roles,
            typeof assignedRole === 'string' ? assignedRole : assignedRole.name,
          ],
        }));
      }),
      catchError((error) => {
        return throwError(() => error);
      }),
    );
  }

  /**
   * DELETE /bo/users/{userId}/roles/{roleId} - Remove role from user
   * Removes a role assignment from a backoffice user
   */
  removeRoleFromUser(userId: number, roleId: number): Observable<void> {
    return this.http.delete<void>(this.ENDPOINTS.REMOVE_ROLE(userId, roleId)).pipe(
      tap(() => {
        // Update user in store first
        const user = this.usersStore.getUserById(userId);
        if (user) {
          const updatedRoles = user.roles.filter((role: string) => role !== roleId.toString());
          this.usersStore.updateUserRoles(userId, updatedRoles);
        }

        // Update legacy state for backwards compatibility
        this.updateUserInState(userId, (user) => ({
          ...user,
          roles: user.roles.filter((role: string) => role !== roleId.toString()),
        }));
      }),
      catchError((error) => {
        return throwError(() => error);
      }),
    );
  }

  // ==================== USER ACCOUNT MANAGEMENT ====================

  /**
   * PATCH /bo/users/{userId}/reset-login-attempts - Reset user login attempts
   * Resets failed login attempts and unlocks a user account
   */
  resetUserLoginAttempts(userId: number): Observable<BackOfficeUser> {
    return this.http.patch<BackOfficeUser>(this.ENDPOINTS.RESET_LOGIN_ATTEMPTS(userId), {}).pipe(
      tap((updatedUser) => {
        // Update user in store first
        this.usersStore.updateUser(updatedUser);

        // Update legacy state for backwards compatibility
        this.updateUserInState(userId, () => updatedUser);
      }),
      catchError((error) => {
        return throwError(() => error);
      }),
    );
  }

  // ==================== SYSTEM STATUS METHODS ====================

  /**
   * GET /bo/users/status - BackOffice status
   * Verifies the operational status of the BackOffice module
   */
  getBackOfficeStatus(): Observable<BackOfficeStatusResponse> {
    return this.http.get<BackOfficeStatusResponse>(this.ENDPOINTS.STATUS).pipe(
      catchError((error) => {
        return throwError(() => error);
      }),
    );
  }

  // ==================== STORE MANAGEMENT METHODS ====================

  /**
   * Fuerza una actualización del store cargando datos frescos
   * Útil para refrescar datos manualmente cuando sea necesario
   */
  refreshUsersStore(): Observable<BackOfficeUser[]> {
    return this.getAllUsers({ size: 1000 }); // Cargar todos para cache
  }

  /**
   * Limpia el store de usuarios
   */
  clearUsersStore(): void {
    this.usersStore.clear();
  }

  /**
   * Obtiene el estado actual del store
   */
  getStoreDebugInfo() {
    return this.usersStore.getDebugInfo();
  }

  // ==================== UTILITY AND HELPER METHODS ====================

  /**
   * Get user statistics for dashboard/overview
   */
  getUserStatistics(): Observable<UserStatistics> {
    const users = this.users();

    if (users.length === 0) {
      // If no cached data, load users first
      return this.getAllUsers({ size: 1000 }).pipe(map(() => this.calculateStatistics()));
    }

    return of(this.calculateStatistics());
  }

  /**
   * Search users by various criteria
   */
  searchUsers(searchTerm: string): Observable<BackOfficeUser[]> {
    return this.getAllUsers({
      email: searchTerm,
      firstName: searchTerm,
      lastName: searchTerm,
    });
  }

  /**
   * Get users by role
   */
  getUsersByRole(roleId: number): Observable<BackOfficeUser[]> {
    const users = this.users();
    const filteredUsers = users.filter((user) =>
      user.roles.some((role) => role === roleId.toString()),
    );

    return of(filteredUsers);
  }

  /**
   * Toggle user active status (utility method)
   * Note: This would require an additional API endpoint for user activation/deactivation
   */
  toggleUserStatus(userId: number): Observable<BackOfficeUser> {
    // This is a placeholder - actual implementation would depend on available API endpoint
    const user = this.users().find((u) => u.id === userId);
    if (!user) {
      return throwError(() => new Error('User not found'));
    }

    // For now, return the user as-is. In a real implementation,
    // this would call an API endpoint to toggle the user status
    return of(user);
  }

  // ==================== PRIVATE HELPER METHODS ====================

  /**
   * Load available roles into state
   */
  private loadAvailableRoles(): Observable<AvailableRole[]> {
    return this.getAvailableRoles();
  }

  /**
   * Update a specific user in the local state
   */
  private updateUserInState(
    userId: number,
    updateFn: (user: BackOfficeUser) => BackOfficeUser,
  ): void {
    const currentUsers = this.users();
    const userIndex = currentUsers.findIndex((user) => user.id === userId);

    if (userIndex !== -1) {
      const updatedUsers = [...currentUsers];
      updatedUsers[userIndex] = updateFn(updatedUsers[userIndex]);

      this.users.set(updatedUsers);
      this.usersSubject.next(updatedUsers);
    }
  }

  /**
   * Calculate user statistics from current state
   */
  private calculateStatistics(): UserStatistics {
    const users = this.users();
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    return {
      totalUsers: users.length,
      activeUsers: users.filter((u) => u.enabled).length,
      inactiveUsers: users.filter((u) => !u.enabled).length,
      lockedUsers: 0, // API doesn't provide lock status
      recentLogins: users.filter((u) => u.lastLogin && new Date(u.lastLogin) > yesterday).length,
    };
  }
}
