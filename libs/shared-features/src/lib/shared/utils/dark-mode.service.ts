import { Injectable, signal, effect, DestroyRef, inject } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DarkModeService {
  private readonly STORAGE_KEY = 'theme-preference';
  private readonly DARK_CLASS = 'orca-app-dark';
  private readonly destroyRef = inject(DestroyRef);
  private readonly mediaQueryList = window.matchMedia('(prefers-color-scheme: dark)');
  
  isDarkMode = signal<boolean>(false);

  constructor() {
    this.initializeTheme();
    
    // Apply theme changes when signal updates
    effect(() => {
      this.applyTheme(this.isDarkMode());
    });

    // Clean up event listener on service destruction
    this.destroyRef.onDestroy(() => {
      this.mediaQueryList.removeEventListener('change', this.handleSystemThemeChange);
    });
  }

  private readonly handleSystemThemeChange = (e: MediaQueryListEvent) => {
    // Only update if user hasn't set a preference
    if (!localStorage.getItem(this.STORAGE_KEY)) {
      this.isDarkMode.set(e.matches);
    }
  };

  private initializeTheme(): void {
    // Check localStorage for saved preference
    const savedTheme = localStorage.getItem(this.STORAGE_KEY);
    
    if (savedTheme) {
      this.isDarkMode.set(savedTheme === 'dark');
    } else {
      // Check system preference
      this.isDarkMode.set(this.mediaQueryList.matches);
    }
    
    // Listen for system theme changes
    this.mediaQueryList.addEventListener('change', this.handleSystemThemeChange);
  }

  private applyTheme(isDark: boolean): void {
    const element = document.documentElement;
    
    if (isDark) {
      element.classList.add(this.DARK_CLASS);
      localStorage.setItem(this.STORAGE_KEY, 'dark');
    } else {
      element.classList.remove(this.DARK_CLASS);
      localStorage.setItem(this.STORAGE_KEY, 'light');
    }
  }

  toggleTheme(): void {
    this.isDarkMode.update(current => !current);
  }

  setDarkMode(isDark: boolean): void {
    this.isDarkMode.set(isDark);
  }

  clearPreference(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    // Revert to system preference
    this.isDarkMode.set(this.mediaQueryList.matches);
  }
}