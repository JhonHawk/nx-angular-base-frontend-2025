import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';

import { NotFoundComponent } from './not-found';
import { DarkModeService } from '../utils/dark-mode.service';

// Mock DarkModeService
class MockDarkModeService {
  isDarkMode = signal(false);
  toggleTheme = jest.fn();
  setDarkMode = jest.fn();
  clearPreference = jest.fn();
}

describe('NotFoundComponent', () => {
  let component: NotFoundComponent;
  let fixture: ComponentFixture<NotFoundComponent>;
  let router: Router;
  let location: Location;
  let mockDarkModeService: MockDarkModeService;

  beforeEach(async () => {
    mockDarkModeService = new MockDarkModeService();

    await TestBed.configureTestingModule({
      imports: [NotFoundComponent],
      providers: [
        provideRouter([]),
        { provide: DarkModeService, useValue: mockDarkModeService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(NotFoundComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    location = TestBed.inject(Location);
    
    // Setup spies
    jest.spyOn(router, 'navigate');
    jest.spyOn(location, 'back');
    Object.defineProperty(window.history, 'length', { value: 2, writable: true });
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have particles background component', () => {
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('orca-particles-background')).toBeTruthy();
  });

  describe('Dark Mode Integration', () => {
    it('should use light mode colors by default', () => {
      mockDarkModeService.isDarkMode.set(false);
      fixture.detectChanges();
      
      expect(component.backgroundColor()).toBe('#ffffff');
      expect(component.particleColor()).toBe('#2d2d2d');
    });

    it('should use dark mode colors when enabled', () => {
      mockDarkModeService.isDarkMode.set(true);
      fixture.detectChanges();
      
      expect(component.backgroundColor()).toBe('#0f0f0f');
      expect(component.particleColor()).toBe('#ffffff');
    });
  });

  describe('Navigation', () => {
    it('should navigate to home', () => {
      component.goHome();
      expect(router.navigate).toHaveBeenCalledWith(['/home']);
    });

    it('should go back when history exists', () => {
      Object.defineProperty(window.history, 'length', { value: 2 });
      component.goBack();
      expect(location.back).toHaveBeenCalled();
    });

    it('should navigate home when no history', () => {
      Object.defineProperty(window.history, 'length', { value: 1 });
      component.goBack();
      expect(router.navigate).toHaveBeenCalledWith(['/home']);
    });
  });

  describe('UI Elements', () => {
    it('should display 404 error', () => {
      const compiled = fixture.nativeElement;
      const errorDigits = compiled.querySelectorAll('.error-digit');
      expect(errorDigits.length).toBe(3);
    });

    it('should have navigation buttons', () => {
      const compiled = fixture.nativeElement;
      const buttons = compiled.querySelectorAll('button');
      expect(buttons.length).toBe(2);
    });

    it('should display error message', () => {
      const compiled = fixture.nativeElement;
      const title = compiled.querySelector('.error-title');
      expect(title?.textContent).toContain('Página no encontrada');
    });
  });
});
