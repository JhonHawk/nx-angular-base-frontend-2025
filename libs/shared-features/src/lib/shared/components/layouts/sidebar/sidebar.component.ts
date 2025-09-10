import { ChangeDetectionStrategy, Component, computed, HostBinding, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TooltipModule } from 'primeng/tooltip';
import { ButtonModule } from 'primeng/button';
import { PanelMenuModule } from 'primeng/panelmenu';
import { MenuItem as PrimeMenuItem, MessageService } from 'primeng/api';
import {
  DarkModeService,
  MenuItem,
  MenuService,
  ModalService,
  SidebarService,
} from '../../../internal';
import { MenuItemComponent } from './menu-item/menu-item.component';
import { setModalService, setRouter } from '../../../constants/menu-items';

@Component({
  standalone: true,
  selector: 'app-sidebar',
  imports: [RouterModule, TooltipModule, ButtonModule, PanelMenuModule, MenuItemComponent],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent {
  private menuService = inject(MenuService);
  private darkModeService = inject(DarkModeService);
  private sidebarService = inject(SidebarService);
  private modalService = inject(ModalService);
  private router = inject(Router);
  private messageService = inject(MessageService);

  // Computed properties
  menuConfig = this.menuService.menuConfig;
  isDarkMode = this.darkModeService.isDarkMode;
  isCollapsed = this.sidebarService.collapsed;

  // Convert menu items for PrimeNG PanelMenu
  panelMenuItems = computed(() => {
    return this.menuConfig().items.map((item) => this.transformMenuItemForPanelMenu(item));
  });

  // Host binding for a collapsed class
  @HostBinding('class.collapsed')
  get hostCollapsedClass() {
    return this.isCollapsed();
  }

  constructor() {
    setModalService(this.modalService);
    setRouter(this.router);
  }

  // Component properties - Using Tailwind classes based on reference design
  sidebarClasses = computed(() => {
    return 'rounded-2xl py-5 bg-zinc-50 dark:bg-zinc-900 h-full flex flex-col justify-between items-center border border-gray-200 dark:border-gray-700 transition-all duration-300 ease-in-out w-auto';
  });

  toggleCollapse() {
    this.sidebarService.toggleCollapse();
  }

  async handleLogout() {
    // Clear organization selection
    this.menuService.clearOrganization();

    const keys = [
      'backoffice-user-data',
      'backoffice-token',
      'backoffice-refresh-token',
      'backoffice-token-type',
      'backoffice-expires-in',
    ];
    keys.forEach((key) => localStorage.removeItem(key));
    await this.router.navigate(['/login']);
  }

  // Event handlers for MenuItemComponent
  onItemClick(item: MenuItem) {
    // Handle menu item click

    if (item.command) {
      item.command();

      // Show placeholder toast only for placeholder items WITH commands
      if (item.isPlaceholder) {
        this.showPlaceholderToast(item.name);
      }
    } else if (item.isPlaceholder) {
      // Show placeholder toast for items WITHOUT commands but marked as placeholders
      this.showPlaceholderToast(item.name);
    }
  }

  // Show placeholder toast message
  private showPlaceholderToast(featureName: string) {
    this.messageService.add({
      severity: 'info',
      summary: 'Próximamente',
      detail: `La funcionalidad "${featureName}" estará disponible próximamente.`,
      life: 4000,
    });
  }

  onMenuToggle(event: Event) {
    // Handle menu toggle - can be extended for analytics or other behaviors
    console.log('Menu toggle event:', event);
  }

  // Transform MenuItem to PrimeNG PanelMenu format
  private transformMenuItemForPanelMenu(item: MenuItem): PrimeMenuItem {
    const primeItem: PrimeMenuItem = {
      label: item.name,
      icon: item.icon,
    };

    // Handle items with commands - CRITICAL: execute command directly
    if (item.command) {
      primeItem.command = () => {
        // Execute the command directly instead of delegating
        if (item.command) {
          item.command();
        }
        // Show placeholder toast for items WITH commands that are placeholders
        if (item.isPlaceholder) {
          this.showPlaceholderToast(item.name);
        }
      };
    } else if (item.isPlaceholder) {
      // Handle placeholder items WITHOUT commands - show toast
      primeItem.command = () => {
        this.showPlaceholderToast(item.name);
      };
    } else if (item.routerLink && (!item.children || item.children.length === 0)) {
      // Only add routerLink for leaf items (items without children) that don't have commands or placeholders
      primeItem.routerLink = item.routerLink;
    }

    if (item.children && item.children.length > 0) {
      primeItem.items = item.children.map((child) => this.transformMenuItemForPanelMenu(child));
    }

    return primeItem;
  }
}
