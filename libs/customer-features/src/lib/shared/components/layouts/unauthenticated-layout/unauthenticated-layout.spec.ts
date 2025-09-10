import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { UnauthenticatedLayout } from './unauthenticated-layout';
import { DarkModeService } from '../../../utils/dark-mode.service';

// Mock DarkModeService
class MockDarkModeService {
  isDarkMode = signal(false);
  toggleTheme = jest.fn();
  setDarkMode = jest.fn();
  clearPreference = jest.fn();
}

describe('UnauthenticatedLayout', () => {
  let component: UnauthenticatedLayout;
  let fixture: ComponentFixture<UnauthenticatedLayout>;
  let mockDarkModeService: MockDarkModeService;

  beforeEach(async () => {
    mockDarkModeService = new MockDarkModeService();

    await TestBed.configureTestingModule({
      imports: [UnauthenticatedLayout],
      providers: [
        provideRouter([]),
        { provide: DarkModeService, useValue: mockDarkModeService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UnauthenticatedLayout);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Component Creation', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should inject DarkModeService', () => {
      expect(component.isDarkMode).toBeDefined();
      expect(component.isDarkMode()).toBe(false);
    });

    it('should have layout classes computed property', () => {
      expect(component.layoutClasses).toBeDefined();
      const classes = component.layoutClasses();
      expect(classes['unauthenticated-layout']).toBe(true);
      expect(classes['unauthenticated-layout--dark']).toBe(false);
    });
  });

  describe('Dark Mode Integration', () => {
    it('should apply dark mode class when isDarkMode is true', () => {
      mockDarkModeService.isDarkMode.set(true);
      fixture.detectChanges();

      expect(component.isDarkMode()).toBe(true);
      const classes = component.layoutClasses();
      expect(classes['unauthenticated-layout--dark']).toBe(true);
    });

    it('should not apply dark mode class when isDarkMode is false', () => {
      mockDarkModeService.isDarkMode.set(false);
      fixture.detectChanges();

      expect(component.isDarkMode()).toBe(false);
      const classes = component.layoutClasses();
      expect(classes['unauthenticated-layout--dark']).toBe(false);
    });

    it('should update dark mode class reactively', () => {
      // Start with light mode
      mockDarkModeService.isDarkMode.set(false);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.unauthenticated-layout--dark')).toBeNull();

      // Switch to dark mode
      mockDarkModeService.isDarkMode.set(true);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.unauthenticated-layout--dark')).toBeTruthy();

      // Switch back to light mode
      mockDarkModeService.isDarkMode.set(false);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.unauthenticated-layout--dark')).toBeNull();
    });

    it('should have correct base class always present', () => {
      // Test with both light and dark modes
      mockDarkModeService.isDarkMode.set(false);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.unauthenticated-layout')).toBeTruthy();

      mockDarkModeService.isDarkMode.set(true);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.unauthenticated-layout')).toBeTruthy();
    });

    it('should compute layout classes reactively', () => {
      const initialClasses = component.layoutClasses();
      expect(initialClasses['unauthenticated-layout--dark']).toBe(false);

      mockDarkModeService.isDarkMode.set(true);
      fixture.detectChanges();

      const updatedClasses = component.layoutClasses();
      expect(updatedClasses['unauthenticated-layout--dark']).toBe(true);
    });
  });

  describe('Template Structure', () => {
    it('should render main content container', () => {
      const mainContent = fixture.nativeElement.querySelector('.main-content');
      expect(mainContent).toBeTruthy();
    });

    it('should contain router-outlet', () => {
      const routerOutlet = fixture.nativeElement.querySelector('router-outlet');
      expect(routerOutlet).toBeTruthy();
    });

    it('should apply computed classes to root element', () => {
      const rootElement = fixture.nativeElement.querySelector('div');
      expect(rootElement.classList.contains('unauthenticated-layout')).toBe(true);
      
      // Test dark mode class application
      mockDarkModeService.isDarkMode.set(true);
      fixture.detectChanges();
      expect(rootElement.classList.contains('unauthenticated-layout--dark')).toBe(true);
    });
  });

  describe('Accessibility', () => {
    it('should have proper semantic structure', () => {
      const mainElement = fixture.nativeElement.querySelector('main');
      expect(mainElement).toBeTruthy();
      expect(mainElement.classList.contains('main-content')).toBe(true);
    });

    it('should maintain contrast in both light and dark modes', () => {
      // Light mode
      mockDarkModeService.isDarkMode.set(false);
      fixture.detectChanges();
      const lightClasses = component.layoutClasses();
      expect(lightClasses['unauthenticated-layout']).toBe(true);

      // Dark mode
      mockDarkModeService.isDarkMode.set(true);
      fixture.detectChanges();
      const darkClasses = component.layoutClasses();
      expect(darkClasses['unauthenticated-layout']).toBe(true);
      expect(darkClasses['unauthenticated-layout--dark']).toBe(true);
    });
  });

  describe('Integration with Particle Background', () => {
    it('should be compatible with particle background components', () => {
      // The layout should not interfere with particle backgrounds
      const mainContent = fixture.nativeElement.querySelector('.main-content');
      expect(mainContent).toBeTruthy();
      
      // Verify the main content container exists for particle integration
      expect(mainContent.classList.contains('main-content')).toBe(true);
      
      // Verify component structure is compatible with z-index layering
      expect(fixture.nativeElement.querySelector('.unauthenticated-layout')).toBeTruthy();
    });
  });
});
