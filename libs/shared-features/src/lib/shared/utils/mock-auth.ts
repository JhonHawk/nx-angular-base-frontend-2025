import { Observable } from 'rxjs';
import { AuthUtils } from './utils-core';

// Type definitions to avoid circular dependencies
interface MockLoginRequest {
  username: string;
  password: string;
}

interface MockLoginResponse {
  token: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  username: string;
  email: string;
  roles: string[];
}

interface MockUserData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  permissions: string[];
  roles?: string[];
  accountId?: string;
  role?: string;
}

/**
 * TEMPORARY DEVELOPMENT UTILITY - REMOVE FOR PRODUCTION
 * Mock authentication for development when backend services are unavailable
 * To disable: Comment out or delete the handleMockAuth call in auth services
 */

const MOCK_CREDENTIALS = {
  username: 'jhonhawk',
  password: 'admin1'
};

export interface MockAuthResult<T> {
  isHandled: boolean;
  observable?: Observable<MockLoginResponse>;
  userData?: T;
}

/**
 * Handle mock authentication for development
 * Returns null if credentials don't match mock user
 */
export function handleMockAuth<T extends MockUserData>(
  credentials: MockLoginRequest,
  type: 'backoffice' | 'customer',
  options: {
    storageKey: string;
    onSuccess: (userData: T) => void;
    navigate: () => Promise<boolean>;
  }
): MockAuthResult<T> | null {
  // Check if credentials match mock user
  if (credentials.username !== MOCK_CREDENTIALS.username || credentials.password !== MOCK_CREDENTIALS.password) {
    return null;
  }

  // Create mock response based on application type
  const mockResponse: MockLoginResponse = {
    token: `mock-${type}-token-development-only`,
    refreshToken: `mock-${type}-refresh-token`,
    tokenType: 'Bearer',
    expiresIn: 3600,
    username: MOCK_CREDENTIALS.username,
    email: type === 'backoffice' ? 'jhonhawk@dev.local' : 'jhonhawk@customer.dev',
    roles: type === 'backoffice' ? ['ADMIN', 'SUPER_USER'] : ['CUSTOMER', 'VIP'],
  };

  // Create mock user data based on type
  let mockUserData: T;

  if (type === 'backoffice') {
    const backofficeData: MockUserData = {
      id: 'god-user-dev',
      email: 'jhonhawk@dev.local',
      firstName: 'Jhon',
      lastName: 'Hawk',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      roles: ['ADMIN', 'SUPER_USER'],
      permissions: ['ALL'],
    };
    mockUserData = backofficeData as T;
  } else {
    const customerData: MockUserData = {
      id: 'god-customer-dev',
      email: 'jhonhawk@customer.dev',
      firstName: 'Jhon',
      lastName: 'Hawk',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      accountId: 'dev-account-001',
      role: 'admin',
      permissions: ['ALL'],
    };
    mockUserData = customerData as T;
  }

  // Store mock data
  AuthUtils.setUserData(mockUserData as any, options.storageKey);

  // Store tokens based on application type
  const tokenPrefix = type === 'backoffice' ? 'backoffice' : 'customer';
  localStorage.setItem(`${tokenPrefix}-token`, mockResponse.token);
  localStorage.setItem(`${tokenPrefix}-refresh-token`, mockResponse.refreshToken);
  localStorage.setItem(`${tokenPrefix}-token-type`, mockResponse.tokenType);
  localStorage.setItem(`${tokenPrefix}-expires-in`, mockResponse.expiresIn.toString());

  // Update current user
  options.onSuccess(mockUserData);

  // Return mock observable
  const observable = new Observable<MockLoginResponse>((observer) => {
    setTimeout(() => {
      options.navigate();
      observer.next(mockResponse);
      observer.complete();
    }, 500); // Small delay to simulate network request
  });

  return {
    isHandled: true,
    observable,
    userData: mockUserData
  };
}
