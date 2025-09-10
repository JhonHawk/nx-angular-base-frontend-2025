import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TeamService } from './team.service';
import {
  BackOfficeUser,
  UserRole,
  AvailableRole,
  RegisterUserRequest,
  AssignRoleRequest,
  BackOfficeStatusResponse,
  UsersPageResponse,
} from '../types/team.types';
import { environment } from '../../../../environments/environment';

describe('TeamService', () => {
  let service: TeamService;
  let httpMock: HttpTestingController;

  const mockUser: BackOfficeUser = {
    id: 1,
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    failedLoginAttempts: 0,
    isLocked: false,
    roles: [],
  };

  const mockRole: AvailableRole = {
    id: 1,
    name: 'Admin',
    description: 'Administrator role',
    isActive: true,
  };

  const mockUsersPageResponse: UsersPageResponse = {
    content: [mockUser],
    totalElements: 1,
    totalPages: 1,
    size: 20,
    number: 0,
    first: true,
    last: true,
    empty: false,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TeamService],
    });

    service = TestBed.inject(TeamService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  // ==================== BASIC SERVICE TESTS ====================

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with default state', () => {
    expect(service.users()).toEqual([]);
    expect(service.availableRoles()).toEqual([]);
    expect(service.isLoading()).toBe(false);
    expect(service.totalElements()).toBe(0);
    expect(service.currentPage()).toBe(0);
  });

  // ==================== USER MANAGEMENT TESTS ====================

  describe('getAllUsers', () => {
    it('should fetch all users successfully', () => {
      service.getAllUsers().subscribe((users) => {
        expect(users).toEqual([mockUser]);
        expect(service.users()).toEqual([mockUser]);
        expect(service.totalElements()).toBe(1);
        expect(service.isLoading()).toBe(false);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/users`);
      expect(req.request.method).toBe('GET');
      req.flush(mockUsersPageResponse);
    });

    it('should handle filters correctly', () => {
      const filters = {
        page: 1,
        size: 10,
        email: 'test@example.com',
        isActive: true,
      };

      service.getAllUsers(filters).subscribe();

      const req = httpMock.expectOne((request) => {
        return (
          request.url === `${environment.apiUrl}/users` &&
          request.params.get('page') === '1' &&
          request.params.get('size') === '10' &&
          request.params.get('email') === 'test@example.com' &&
          request.params.get('isActive') === 'true'
        );
      });

      expect(req.request.method).toBe('GET');
      req.flush(mockUsersPageResponse);
    });

    it('should handle errors gracefully', () => {
      service.getAllUsers().subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error).toBeDefined();
          expect(service.isLoading()).toBe(false);
        },
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/users`);
      req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });
    });
  });

  describe('getUserRoles', () => {
    it('should fetch user roles successfully', () => {
      const userId = 1;
      const mockRoles: UserRole[] = [
        {
          id: 1,
          name: 'Admin',
          description: 'Administrator role',
          isActive: true,
        },
      ];

      service.getUserRoles(userId).subscribe((roles) => {
        expect(roles).toEqual(mockRoles);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/users/${userId}/roles`);
      expect(req.request.method).toBe('GET');
      req.flush(mockRoles);
    });
  });

  describe('registerUser', () => {
    it('should register a new user successfully', () => {
      const registerRequest: RegisterUserRequest = {
        email: 'newuser@example.com',
        firstName: 'New',
        lastName: 'User',
        isActive: true,
      };

      service.registerUser(registerRequest).subscribe((user) => {
        expect(user).toEqual(mockUser);
        expect(service.users()).toContain(mockUser);
        expect(service.isLoading()).toBe(false);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/users/register`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(registerRequest);
      req.flush(mockUser);
    });
  });

  // ==================== ROLE MANAGEMENT TESTS ====================

  describe('getAvailableRoles', () => {
    it('should fetch available roles successfully', () => {
      const mockRoles: AvailableRole[] = [mockRole];

      service.getAvailableRoles().subscribe((roles) => {
        expect(roles).toEqual(mockRoles);
        expect(service.availableRoles()).toEqual(mockRoles);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/users/roles`);
      expect(req.request.method).toBe('GET');
      req.flush(mockRoles);
    });
  });

  describe('assignRoleToUser', () => {
    it('should assign role to user successfully', () => {
      const userId = 1;
      const assignRequest: AssignRoleRequest = {
        roleId: 1,
        areas: [1, 2],
      };
      const assignedRole: UserRole = {
        id: 1,
        name: 'Admin',
        description: 'Administrator role',
        isActive: true,
      };

      // First, set up a user in the state
      service.users.set([mockUser]);

      service.assignRoleToUser(userId, assignRequest).subscribe((role) => {
        expect(role).toEqual(assignedRole);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/users/${userId}/roles`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(assignRequest);
      req.flush(assignedRole);
    });
  });

  describe('removeRoleFromUser', () => {
    it('should remove role from user successfully', () => {
      const userId = 1;
      const roleId = 1;

      // Set up a user with roles in the state
      const userWithRole = {
        ...mockUser,
        roles: [{ id: 1, name: 'Admin', description: 'Admin role', isActive: true }],
      };
      service.users.set([userWithRole]);

      service.removeRoleFromUser(userId, roleId).subscribe(() => {
        const updatedUser = service.users().find((u) => u.id === userId);
        expect(updatedUser?.roles).toEqual([]);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/users/${userId}/roles/${roleId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });

  // ==================== SYSTEM STATUS TESTS ====================

  describe('getBackOfficeStatus', () => {
    it('should fetch BackOffice status successfully', () => {
      const mockStatus: BackOfficeStatusResponse = {
        status: 'OK',
        timestamp: '2024-01-01T00:00:00Z',
        version: '1.0.0',
        uptime: 86400,
      };

      service.getBackOfficeStatus().subscribe((status) => {
        expect(status).toEqual(mockStatus);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/users/status`);
      expect(req.request.method).toBe('GET');
      req.flush(mockStatus);
    });
  });

  // ==================== UTILITY METHOD TESTS ====================

  describe('resetUserLoginAttempts', () => {
    it('should reset user login attempts successfully', () => {
      const userId = 1;
      const updatedUser = { ...mockUser, failedLoginAttempts: 0, isLocked: false };

      service.resetUserLoginAttempts(userId).subscribe((user) => {
        expect(user).toEqual(updatedUser);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/users/${userId}/reset-login-attempts`);
      expect(req.request.method).toBe('PATCH');
      req.flush(updatedUser);
    });
  });

  describe('getUserStatistics', () => {
    it('should calculate user statistics from current state', () => {
      const users = [
        { ...mockUser, id: 1, isActive: true, isLocked: false },
        { ...mockUser, id: 2, isActive: false, isLocked: false },
        { ...mockUser, id: 3, isActive: true, isLocked: true },
      ];

      service.users.set(users);

      service.getUserStatistics().subscribe((stats) => {
        expect(stats.totalUsers).toBe(3);
        expect(stats.activeUsers).toBe(2);
        expect(stats.inactiveUsers).toBe(1);
        expect(stats.lockedUsers).toBe(1);
      });
    });
  });

  describe('searchUsers', () => {
    it('should search users with provided term', () => {
      const searchTerm = 'test@example.com';

      service.searchUsers(searchTerm).subscribe();

      const req = httpMock.expectOne((request) => {
        return (
          request.url === `${environment.apiUrl}/users` &&
          request.params.get('email') === searchTerm
        );
      });

      expect(req.request.method).toBe('GET');
      req.flush(mockUsersPageResponse);
    });
  });

  describe('getUsersByRole', () => {
    it('should filter users by role', () => {
      const roleId = 1;
      const usersWithRole = [
        { ...mockUser, roles: [{ id: 1, name: 'Admin', description: 'Admin', isActive: true }] },
      ];

      service.users.set(usersWithRole);

      service.getUsersByRole(roleId).subscribe((users) => {
        expect(users.length).toBe(1);
        expect(users[0].roles.some((r) => r.id === roleId)).toBe(true);
      });
    });
  });
});
