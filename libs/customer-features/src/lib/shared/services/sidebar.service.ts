import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {
  private readonly STORAGE_KEY = 'sidebar-collapsed-state';

  // Signal to manage sidebar collapsed state - initialize from localStorage
  private _collapsed = signal(this.getInitialCollapsedState());

  // Public readonly signal for components to subscribe to
  readonly collapsed = this._collapsed.asReadonly();

  /**
   * Toggle sidebar collapsed state
   */
  toggleCollapse(): void {
    this._collapsed.update(current => {
      const newState = !current;
      this.saveToLocalStorage(newState);
      return newState;
    });
  }

  /**
   * Set specific collapsed state
   */
  setCollapsed(collapsed: boolean): void {
    this._collapsed.set(collapsed);
    this.saveToLocalStorage(collapsed);
  }

  /**
   * Collapse the sidebar
   */
  collapse(): void {
    this._collapsed.set(true);
    this.saveToLocalStorage(true);
  }

  /**
   * Expand the sidebar
   */
  expand(): void {
    this._collapsed.set(false);
    this.saveToLocalStorage(false);
  }

  /**
   * Check if sidebar is currently collapsed
   */
  isCollapsed(): boolean {
    return this._collapsed();
  }

  /**
   * Get initial collapsed state from localStorage
   */
  private getInitialCollapsedState(): boolean {
    if (typeof window === 'undefined' || !window.localStorage) {
      return false;
    }
    
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : false;
    } catch (error) {
      console.warn('Failed to read sidebar state from localStorage:', error);
      return false;
    }
  }

  /**
   * Save collapsed state to localStorage
   */
  private saveToLocalStorage(collapsed: boolean): void {
    if (typeof window === 'undefined' || !window.localStorage) {
      return;
    }
    
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(collapsed));
    } catch (error) {
      console.warn('Failed to save sidebar state to localStorage:', error);
    }
  }
}