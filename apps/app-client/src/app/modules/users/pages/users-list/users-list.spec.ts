import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { UsersList } from './users-list';
import { TeamService } from '../../services/team.service';
import { UsersStore } from '../../../../stores/users/users.store';
import { ToastService } from '../../../../core/services/toast.service';
import { ConfirmationService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { ModalService } from 'shared-features';
import { signal } from '@angular/core';
import { of } from 'rxjs';

// Mock services
const mockTeamService = {
  getAllUsers: jest.fn().mockReturnValue(of([])),
  refreshUsersStore: jest.fn().mockReturnValue(of([])),
  getAvailableRoles: jest.fn().mockReturnValue(of([])),
  resetUserLoginAttempts: jest.fn().mockReturnValue(of({})),
};

const mockUsersStore = {
  users: signal([]),
  loading: signal(false),
  totalUsers: signal(0),
  hasData: jest.fn().mockReturnValue(false),
};

const mockToastService = {
  showSuccess: jest.fn(),
  showError: jest.fn(),
  showInfo: jest.fn(),
};

const mockModalService = {
  userCreated$: of(),
  modalAction$: of(),
  closeUserModal: jest.fn(),
};

describe('UsersList', () => {
  let component: UsersList;
  let fixture: ComponentFixture<UsersList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsersList],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        { provide: TeamService, useValue: mockTeamService },
        { provide: UsersStore, useValue: mockUsersStore },
        { provide: ToastService, useValue: mockToastService },
        { provide: ModalService, useValue: mockModalService },
        ConfirmationService,
        DialogService,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UsersList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
