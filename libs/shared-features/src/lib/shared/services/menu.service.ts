import { computed, inject, Injectable, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter, startWith } from 'rxjs/operators';
import { OrganizationService } from './organization.service';
import { backofficeMenuItems, customerMenuItems } from '../constants/menu-items';

export interface MenuItem {
  name: string;
  icon: string;
  routerLink?: string;
  tooltip?: string;
  description?: string;
  root?: boolean;
  children?: MenuItem[];
  badge?: string;
  isPlaceholder?: boolean;
  command?: () => void;
}

export interface MenuConfig {
  items: MenuItem[];
  showLogoutButton: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class MenuService {
  private organizationService = inject(OrganizationService);
  private router = inject(Router);

  private currentActiveMenuItem = signal<MenuItem | null>(null);
  private customerMenuItems = customerMenuItems;
  private backofficeMenuItems = backofficeMenuItems;

  // Computed menu configuration based on organization selection
  menuConfig = computed<MenuConfig>(() => {
    const hasOrganization = this.organizationService.hasOrganizationSelected();

    return {
      items: hasOrganization ? this.customerMenuItems : this.backofficeMenuItems,
      showLogoutButton: true,
    };
  });

  // Computed active menu item
  activeMenuItem = computed(() => this.currentActiveMenuItem());

  constructor() {
    // Listen to router events to update active menu item
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        startWith(null),
      )
      .subscribe(() => {
        this.updateActiveMenuItem();
      });
  }

  private updateActiveMenuItem(): void {
    const currentUrl = this.router.url;
    const menuConfig = this.menuConfig();
    const activeItem = this.findActiveMenuItemByUrl(currentUrl, menuConfig.items);
    this.currentActiveMenuItem.set(activeItem);
  }

  private findActiveMenuItemByUrl(url: string, menuItems: MenuItem[]): MenuItem | null {
    for (const item of menuItems) {
      // Direct match
      if (item.routerLink === url) {
        return item;
      }

      // Check children
      if (item.children) {
        const childMatch = this.findActiveMenuItemByUrl(url, item.children);
        if (childMatch) {
          return childMatch;
        }
      }
    }

    return null;
  }

  // Method to get the full breadcrumb path for the active menu item
  getActiveMenuPath(): MenuItem[] {
    const currentUrl = this.router.url;
    const menuConfig = this.menuConfig();
    return this.findMenuPathByUrl(currentUrl, menuConfig.items);
  }

  private findMenuPathByUrl(url: string, menuItems: MenuItem[]): MenuItem[] {
    for (const item of menuItems) {
      if (item.routerLink === url) {
        return [item];
      }

      if (item.children) {
        const childPath = this.findMenuPathByUrl(url, item.children);
        if (childPath.length > 0) {
          return [item, ...childPath];
        }
      }
    }

    return [];
  }

  // Delegate to organization service
  clearOrganization() {
    this.organizationService.clearOrganization();
  }

  // Check if an organization is selected
  hasOrganizationSelected = computed(() => this.organizationService.hasOrganizationSelected());
}
