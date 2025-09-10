import { computed, inject, Injectable, signal } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { MenuItem as PrimeMenuItem } from 'primeng/api';
import { filter, startWith } from 'rxjs/operators';
import { MenuService, MenuItem } from './menu.service';

@Injectable({
  providedIn: 'root',
})
export class BreadcrumbService {
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private menuService = inject(MenuService);

  private currentBreadcrumbs = signal<PrimeMenuItem[]>([]);

  // Home breadcrumb item
  private readonly homeBreadcrumb: PrimeMenuItem = {
    icon: 'pi pi-home',
    routerLink: '/home',
    label: 'Dashboard'
  };

  // Computed breadcrumbs for reactive updates
  breadcrumbs = computed(() => this.currentBreadcrumbs());

  constructor() {
    // Listen to router events to update breadcrumbs
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        startWith(null)
      )
      .subscribe(() => {
        this.updateBreadcrumbs();
      });
  }

  private updateBreadcrumbs(): void {
    const url = this.router.url;
    const breadcrumbs = this.buildBreadcrumbsFromUrl(url);
    this.currentBreadcrumbs.set(breadcrumbs);
  }

  private buildBreadcrumbsFromUrl(url: string): PrimeMenuItem[] {
    // Always start with home
    const breadcrumbs: PrimeMenuItem[] = [this.homeBreadcrumb];

    // If we're on home page, return just home
    if (url === '/home' || url === '/') {
      return breadcrumbs;
    }

    // Get menu configuration
    const menuConfig = this.menuService.menuConfig();
    const menuPath = this.findMenuPathByUrl(url, menuConfig.items);

    if (menuPath.length > 0) {
      // Add menu path to breadcrumbs (skip home since it's already added)
      const menuBreadcrumbs = menuPath
        .filter(item => item.routerLink !== '/home')
        .map(item => this.menuItemToBreadcrumb(item));
      
      breadcrumbs.push(...menuBreadcrumbs);
    } else {
      // Fallback: build breadcrumbs from URL segments
      const segments = url.split('/').filter(segment => segment);
      segments.forEach((segment, index) => {
        const path = '/' + segments.slice(0, index + 1).join('/');
        breadcrumbs.push({
          label: this.capitalizeSegment(segment),
          routerLink: path
        });
      });
    }

    return breadcrumbs;
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

  private menuItemToBreadcrumb(menuItem: MenuItem): PrimeMenuItem {
    return {
      label: menuItem.name,
      icon: menuItem.icon,
      routerLink: menuItem.routerLink
    };
  }

  private capitalizeSegment(segment: string): string {
    return segment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  // Method to manually set breadcrumbs if needed
  setBreadcrumbs(breadcrumbs: PrimeMenuItem[]): void {
    this.currentBreadcrumbs.set([this.homeBreadcrumb, ...breadcrumbs]);
  }

  // Method to clear breadcrumbs and reset to home
  clearBreadcrumbs(): void {
    this.currentBreadcrumbs.set([this.homeBreadcrumb]);
  }
}