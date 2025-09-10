import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { OrcaUsersList } from './orca-users-list';
import { TeamService } from '../../services/team.service';
import { OrcaUsersStore } from '../../../../stores/users/orca-users.store';
import { ToastService } from '../../../../core/services/toast.service';
import { ConfirmationService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { ModalService } from 'customer-features';
import { signal } from '@angular/core';
import { of } from 'rxjs';

// Mock services
const mockTeamService = {
  getAllUsers: jest.fn().mockReturnValue(of([])),
  refreshUsersStore: jest.fn().mockReturnValue(of([])),
  getAvailableRoles: jest.fn().mockReturnValue(of([])),
  resetUserLoginAttempts: jest.fn().mockReturnValue(of({})),
};

const mockOrcaUsersStore = {
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
  orcaUserCreated$: of(),
  modalAction$: of(),
  closeOrcaUserModal: jest.fn(),
};

describe('OrcaUsersList', () => {
  let component: OrcaUsersList;
  let fixture: ComponentFixture<OrcaUsersList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrcaUsersList],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        { provide: TeamService, useValue: mockTeamService },
        { provide: OrcaUsersStore, useValue: mockOrcaUsersStore },
        { provide: ToastService, useValue: mockToastService },
        { provide: ModalService, useValue: mockModalService },
        ConfirmationService,
        DialogService,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(OrcaUsersList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
