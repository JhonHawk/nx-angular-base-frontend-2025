/**
 * Authentication and User Management Types
 * These are truly shared types used across multiple applications
 */

// Authentication types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  username: string;
  email: string;
  roles: string[];
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
  success: boolean;
}

// User types
export interface BaseUserData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BackofficeUserData extends BaseUserData {
  roles: string[];
  permissions: string[];
  selectedAccountId?: string;
}

export interface CustomerUserData extends BaseUserData {
  accountId: string;
  role: 'account_admin' | 'user';
  permissions: string[];
}

export type UserData = BackofficeUserData | CustomerUserData;