/**
 * Layout Component Types
 * Types specifically for layout components and configuration
 */

// Layout types
export interface LayoutMenuItem {
  label: string;
  icon?: string;
  route?: string;
  children?: LayoutMenuItem[];
  permission?: string;
}

export interface HeaderConfig {
  title: string;
  showUserMenu: boolean;
  showNotifications?: boolean;
}

export interface SidebarConfig {
  menuItems: LayoutMenuItem[];
  compactMode?: boolean;
}