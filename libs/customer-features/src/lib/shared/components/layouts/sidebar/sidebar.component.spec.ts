import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { computed, signal } from '@angular/core';
import { SidebarComponent } from './sidebar.component';
import { DarkModeService, MenuService, MenuConfig, SidebarService } from '../../../internal';

describe('SidebarComponent', () => {
  let component: SidebarComponent;
  let fixture: ComponentFixture<SidebarComponent>;

  beforeEach(async () => {
    // Create mock menu configuration
    const mockMenuConfig = computed<MenuConfig>(() => ({
      items: [
        {
          name: 'Dashboard',
          icon: 'pi pi-home',
          routerLink: '/home',
          tooltip: 'Dashboard principal',
        },
      ],
      showLogoutButton: true,
    }));

    // Create mock services with signals
    const mockMenuService = {
      menuConfig: mockMenuConfig,
      clearOrganization: jest.fn(),
      hasOrganizationSelected: computed(() => false),
    };

    const mockDarkModeService = {
      isDarkMode: signal(false),
      toggleTheme: jest.fn(),
    };

    const collapsedSignal = signal(false);
    const mockSidebarService = {
      collapsed: collapsedSignal,
      toggleCollapse: jest.fn().mockImplementation(() => {
        collapsedSignal.set(!collapsedSignal());
      }),
    };

    await TestBed.configureTestingModule({
      imports: [SidebarComponent],
      providers: [
        provideRouter([]),
        MessageService,
        { provide: MenuService, useValue: mockMenuService },
        { provide: DarkModeService, useValue: mockDarkModeService },
        { provide: SidebarService, useValue: mockSidebarService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle collapse state', () => {
    const initialState = component.isCollapsed();
    component.toggleCollapse();
    expect(component.isCollapsed()).toBe(!initialState);
  });

  it('should handle logout', async () => {
    // Mock router navigate to prevent actual navigation in test
    const mockRouter = TestBed.inject(Router);
    const navigateSpy = jest.spyOn(mockRouter, 'navigate').mockResolvedValue(true);

    await component.handleLogout();

    // Verify navigation to login page occurs
    expect(navigateSpy).toHaveBeenCalledWith(['/login']);

    // Restore mocks
    navigateSpy.mockRestore();
  });

  it('should have consistent collapse state', () => {
    // Test multiple toggles
    const initialState = component.isCollapsed();

    component.toggleCollapse();
    expect(component.isCollapsed()).toBe(!initialState);

    component.toggleCollapse();
    expect(component.isCollapsed()).toBe(initialState);
  });

  it('should have menu config from service', () => {
    const menuConfig = component.menuConfig();
    expect(menuConfig).toBeDefined();
    expect(menuConfig.items).toHaveLength(1);
    expect(menuConfig.showLogoutButton).toBe(true);
  });
});
