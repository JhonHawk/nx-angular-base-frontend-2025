// UserData interface is now imported from authentication types
import { UserData } from '../types/authentication.types';

/**
 * Authentication utilities for localStorage management
 */
export class AuthUtils {
  /**
   * Check if user data exists in localStorage
   */
  static hasUserData(storageKey = 'user-data'): boolean {
    try {
      const userData = localStorage.getItem(storageKey);
      return userData !== null && userData !== 'null' && userData !== '';
    } catch {
      return false;
    }
  }

  /**
   * Get user data from localStorage
   */
  static getUserData<T extends UserData>(storageKey = 'user-data'): T | null {
    try {
      const userData = localStorage.getItem(storageKey);
      return userData ? JSON.parse(userData) : null;
    } catch {
      return null;
    }
  }

  /**
   * Set user data in localStorage
   */
  static setUserData(userData: UserData, storageKey = 'user-data'): void {
    try {
      localStorage.setItem(storageKey, JSON.stringify(userData));
    } catch (error) {
      console.error('Error saving user data to localStorage:', error);
    }
  }

  /**
   * Remove user data from localStorage
   */
  static removeUserData(storageKey = 'user-data'): void {
    try {
      localStorage.removeItem(storageKey);
    } catch (error) {
      console.error('Error removing user data from localStorage:', error);
    }
  }

  /**
   * Check if user is authenticated based on localStorage data
   */
  static isAuthenticated(storageKey = 'user-data'): boolean {
    const userData = this.getUserData(storageKey);
    if (!userData) return false;
    
    // Additional validation can be added here (token expiration, etc.)
    return userData.isActive;
  }

  /**
   * Check if user has specific permission
   */
  static hasPermission(permission: string, storageKey = 'user-data'): boolean {
    const userData = this.getUserData(storageKey);
    if (!userData) return false;
    
    return userData.permissions?.includes(permission) || false;
  }
}

export function utilsCore(): string {
  return 'utils-core';
}
