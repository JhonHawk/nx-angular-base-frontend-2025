/**
 * Orca Users Store - Simplified Version
 *
 * Store específico para gestión de usuarios del equipo Orca (BackOffice Team)
 * sin polling automático. Los servicios actualizan el store manualmente cuando es necesario.
 */

import { Injectable, computed, signal } from '@angular/core';
import { BackOfficeUser, UserStatistics } from '../../modules/users/types/team.types';

@Injectable({
  providedIn: 'root',
})
export class UsersStore {
  // Private state signals
  private _users = signal<BackOfficeUser[]>([]);
  private _loading = signal(false);
  private _error = signal<Error | null>(null);
  private _lastFetch = signal<Date | null>(null);

  // Public readonly signals
  readonly users = this._users.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly lastFetch = this._lastFetch.asReadonly();

  // Computed signals para consultas específicas del dominio
  readonly hasData = computed(() => this.users().length > 0);
  readonly totalUsers = computed(() => this.users().length);

  readonly activeUsers = computed(() => this.users().filter((user) => user.enabled));

  readonly inactiveUsers = computed(() => this.users().filter((user) => !user.enabled));

  readonly usersByRole = computed(() => {
    const users = this.users();
    return users.reduce(
      (acc, user) => {
        user.roles.forEach((role: string) => {
          acc[role] = (acc[role] || 0) + 1;
        });
        return acc;
      },
      {} as Record<string, number>,
    );
  });

  readonly recentUsers = computed(() => {
    const users = this.users();
    const dayAgo = new Date();
    dayAgo.setDate(dayAgo.getDate() - 1);

    // Placeholder - la API actual no proporciona fecha de creación detallada
    return users.filter((user) => user.id > 0);
  });

  readonly statistics = computed((): UserStatistics => {
    const users = this.users();

    return {
      totalUsers: users.length,
      activeUsers: users.filter((u) => u.enabled).length,
      inactiveUsers: users.filter((u) => !u.enabled).length,
      lockedUsers: 0, // La API actual no proporciona estado de bloqueo
      recentLogins: this.recentUsers().length,
    };
  });

  constructor() {}

  /**
   * Métodos para actualizar el estado desde los servicios
   */

  /**
   * Establece la lista completa de usuarios
   */
  setUsers(users: BackOfficeUser[]): void {
    this._users.set(users);
    this._lastFetch.set(new Date());
    this._error.set(null);
  }

  /**
   * Agrega un nuevo usuario al store
   */
  addUser(user: BackOfficeUser): void {
    const currentUsers = this._users();
    this._users.set([...currentUsers, user]);
  }

  /**
   * Actualiza un usuario existente
   */
  updateUser(updatedUser: BackOfficeUser): void {
    const currentUsers = this._users();
    const index = currentUsers.findIndex((u) => u.id === updatedUser.id);

    if (index !== -1) {
      const newUsers = [...currentUsers];
      newUsers[index] = updatedUser;
      this._users.set(newUsers);
    }
  }

  /**
   * Actualiza un usuario por ID con datos parciales
   */
  updateUserById(userId: number, updates: Partial<BackOfficeUser>): void {
    const currentUsers = this._users();
    const index = currentUsers.findIndex((u) => u.id === userId);

    if (index !== -1) {
      const newUsers = [...currentUsers];
      newUsers[index] = { ...newUsers[index], ...updates };
      this._users.set(newUsers);
    }
  }

  /**
   * Elimina un usuario del store
   */
  removeUser(userId: number): void {
    const currentUsers = this._users();
    const filteredUsers = currentUsers.filter((u) => u.id !== userId);
    this._users.set(filteredUsers);
  }

  /**
   * Actualiza el rol de un usuario
   */
  updateUserRoles(userId: number, roles: string[]): void {
    this.updateUserById(userId, { roles });
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
   * Limpia todos los datos del store
   */
  clear(): void {
    this._users.set([]);
    this._loading.set(false);
    this._error.set(null);
    this._lastFetch.set(null);
  }

  /**
   * Métodos de consulta
   */

  /**
   * Obtiene un usuario por ID
   */
  getUserById(id: number): BackOfficeUser | undefined {
    return this.users().find((user) => user.id === id);
  }

  /**
   * Obtiene usuarios por rol
   */
  getUsersByRole(role: string): BackOfficeUser[] {
    return this.users().filter((user) => user.roles.includes(role));
  }

  /**
   * Busca usuarios por término
   */
  searchUsers(searchTerm: string): BackOfficeUser[] {
    if (!searchTerm.trim()) return this.users();

    const term = searchTerm.toLowerCase();
    return this.users().filter(
      (user) =>
        user.firstName.toLowerCase().includes(term) ||
        user.lastName.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term) ||
        user.username.toLowerCase().includes(term),
    );
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
      usersCount: this.users().length,
      isLoading: this.loading(),
      hasError: this.error() !== null,
      lastFetch: this.lastFetch(),
      isDataFresh: this.isDataFresh(),
      statistics: this.statistics(),
    };
  }
}
