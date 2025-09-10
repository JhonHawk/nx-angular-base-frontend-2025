import { AuthenticatedLayout } from './authenticated-layout';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { OrganizationService, DarkModeService, ModalService } from '../../../internal';
import { signal, Injector, runInInjectionContext } from '@angular/core';
import { of } from 'rxjs';

// Mock services
const mockOrganizationService = {
  organization: signal(null),
  loading: signal(false),
  error: signal(null),
  getOrganization: jest.fn().mockReturnValue(of(null))
};

const mockDarkModeService = {
  isDarkMode: signal(false),
  toggleTheme: jest.fn(),
  setDarkMode: jest.fn(),
  clearPreference: jest.fn()
};

const mockModalService = {
  userCreated$: of(),
  modalAction$: of(),
  closeUserModal: jest.fn()
};

describe('AuthenticatedLayout', () => {
  let component: AuthenticatedLayout;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideNoopAnimations(),
        provideHttpClient(),
        { provide: OrganizationService, useValue: mockOrganizationService },
        { provide: DarkModeService, useValue: mockDarkModeService },
        { provide: ModalService, useValue: mockModalService }
      ]
    }).compileComponents();

    // Create component instance in injection context
    const injector = TestBed.inject(Injector);
    component = runInInjectionContext(injector, () => new AuthenticatedLayout());
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(component).toBeInstanceOf(AuthenticatedLayout);
  });
});
