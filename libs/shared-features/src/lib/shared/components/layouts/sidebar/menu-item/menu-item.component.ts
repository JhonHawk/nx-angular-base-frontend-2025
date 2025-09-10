import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TooltipModule } from 'primeng/tooltip';
import { MenuModule } from 'primeng/menu';
import { MenuItem as PrimeMenuItem } from 'primeng/api';
import { MenuItem } from '../../../../services/menu.service';

/**
 * MenuItemComponent - Reusable menu item component for sidebar navigation
 *
 * Extracted from SidebarComponent to provide a modular, reusable navigation item
 * that supports both collapsed and expanded states with PrimeNG integration.
 *
 * @example
 * ```html
 * <!-- Basic usage with a simple menu item -->
 * <app-menu-item
 *   [item]="menuItem"
 *   [isCollapsed]="false"
 *   (itemClick)="onItemClick($event)"
 *   (menuToggle)="onMenuToggle($event)">
 * </app-menu-item>
 *
 * <!-- In a sidebar with multiple items -->
 * @for (item of menuItems; track item.name) {
 *   <app-menu-item
 *     [item]="item"
 *     [isCollapsed]="isCollapsed()"
 *     (itemClick)="handleItemClick($event)"
 *     (menuToggle)="handleMenuToggle($event)">
 *   </app-menu-item>
 * }
 * ```
 *
 * Features:
 * - Supports both collapsed and expanded sidebar states
 * - Handles menu items with and without children
 * - Floating PrimeNG menus for collapsed items with children
 * - Router integration with active state highlighting
 * - Tooltip support for collapsed items
 * - TypeScript strict mode compatible
 * - Angular v20+ patterns (signals, modern control flow)
 */
@Component({
  standalone: true,
  selector: 'app-menu-item',
  imports: [RouterModule, TooltipModule, MenuModule],
  templateUrl: './menu-item.component.html',
  styleUrls: ['./menu-item.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuItemComponent {
  // Input signals
  item = input.required<MenuItem>();
  isCollapsed = input.required<boolean>();

  // Output events
  menuToggle = output<Event>();
  itemClick = output<MenuItem>();

  // Computed properties
  hasChildren = computed(() => {
    const menuItem = this.item();
    return Boolean(menuItem.children && menuItem.children.length > 0);
  });

  tooltipText = computed(() => {
    const menuItem = this.item();
    return menuItem.tooltip || menuItem.name;
  });

  baseClasses = computed(() => {
    return 'flex items-center gap-1 cursor-pointer text-base rounded-lg transition-all select-none text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-700 bg-transparent dark:bg-transparent';
  });

  collapsedClasses = computed(() => {
    return this.baseClasses() + ' w-12 justify-center py-4';
  });

  expandedClasses = computed(() => {
    return this.baseClasses() + ' px-4 py-1';
  });

  // Transform MenuItem to PrimeNG Menu format (for floating menus)
  transformMenuItem = computed(() => {
    return this.transformMenuItemToPrime(this.item());
  });

  // Handle menu toggle for collapsed items with children
  onMenuToggle(event: Event, menu?: { toggle: (event: Event) => void }) {
    this.menuToggle.emit(event);
    if (menu && typeof menu.toggle === 'function') {
      menu.toggle(event);
    }
  }

  // Handle item click
  onItemClick() {
    const menuItem = this.item();
    
    // Emit click event if item has routerLink, command, or is a placeholder
    if (menuItem.routerLink || menuItem.command || menuItem.isPlaceholder) {
      this.itemClick.emit(menuItem);
    }
  }

  // Transform MenuItem to PrimeNG Menu format (for floating menus)
  private transformMenuItemToPrime(item: MenuItem): PrimeMenuItem {
    const primeItem: PrimeMenuItem = {
      label: item.name,
      icon: item.icon,
    };

    // Handle items with commands
    if (item.command) {
      primeItem.command = () => {
        this.itemClick.emit(item);
      };
    } else if (item.isPlaceholder) {
      // Handle placeholder items - show toast instead of navigating
      primeItem.command = () => {
        this.itemClick.emit(item);
      };
    } else if (item.routerLink && (!item.children || item.children.length === 0)) {
      // Only add routerLink for leaf items (items without children) that don't have commands or placeholders
      primeItem.routerLink = item.routerLink;
    }

    if (item.children && item.children.length > 0) {
      primeItem.items = item.children.map((child: MenuItem) => this.transformMenuItemToPrime(child));
    }

    return primeItem;
  }
}
