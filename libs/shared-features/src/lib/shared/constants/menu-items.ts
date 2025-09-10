// Menu items for customer client
import { MenuItem } from '../services/menu.service';
import { USER_MODAL_CONTEXTS } from './modal-contexts';

let modalService: any = null;
let router: any = null;

// Inject modal service dynamically to avoid circular dependencies
export function setModalService(service: any) {
  modalService = service;
}

// Inject router service dynamically 
export function setRouter(routerService: any) {
  router = routerService;
}

// Create placeholder function for non-implemented features
function createPlaceholderCommand(featureName: string) {
  return () => {
    // This will be handled by the sidebar component to show toast
    console.log(`Placeholder activated for: ${featureName}`);
  };
}

// Create user creation command (type-safe with context)
function createNewUserCommand() {
  return () => {
    console.log('createNewUserCommand executed - modalService available:', !!modalService);
    if (modalService) {
      console.log('Opening user modal with SIDEBAR context');
      // Direct modal opening - no navigation needed!
      modalService.openUserModal(USER_MODAL_CONTEXTS.SIDEBAR);
    } else {
      console.warn('createNewUserCommand: ModalService not available');
    }
  };
}

// Create Client creation command
function createClientCommand() {
  return () => {
    console.log('createClientCommand executed - modalService available:', !!modalService);
    if (modalService) {
      console.log('Opening Client modal with SIDEBAR context');
      // Direct modal opening - no navigation needed!
      modalService.openClientModal('SIDEBAR');
    } else {
      console.warn('createClientCommand: ModalService not available');
    }
  };
}

// Legacy function for backwards compatibility (will be removed)
/**
 * @deprecated Use createUserCommand() instead
 */
function createUserCommand() {
  return () => {
    console.log('createUserCommand executed (DEPRECATED) - router:', !!router, 'modalService:', !!modalService);
    if (router && modalService) {
      console.log('Navigating to /users-list first...');
      // Navigate to users-list first to ensure component is loaded
      router.navigate(['/users-list']).then(() => {
        console.log('Navigation complete, triggering modal with delay...');
        // Small delay to ensure component is initialized and subscribed
        setTimeout(() => {
          console.log('Triggering create user modal...');
          modalService.triggerCreateUser();
        }, 200);
      }).catch((err: any) => {
        console.error('Navigation error:', err);
      });
    } else {
      console.warn('createUserCommand: Missing router or modalService');
    }
  };
}

export const customerMenuItems: MenuItem[] = [
  {
    name: 'Inicio',
    icon: 'pi pi-home',
    routerLink: '/home',
    root: true,
  },
  {
    name: 'Organización',
    icon: 'pi pi-building',
    root: true,
    children: [
      {
        name: 'Información general',
        icon: 'pi pi-info-circle',
        routerLink: '/organization/info',
      },
      {
        name: 'Áreas',
        icon: 'pi pi-sitemap',
        routerLink: '/organization/org-chart',
        isPlaceholder: true,
      },
      {
        name: 'Objetivos y KPIs',
        icon: 'pi pi-flag',
        routerLink: '/organization/objectives-kpis',
        isPlaceholder: true,
      },
      {
        name: 'Apetito de riesgo',
        icon: 'pi pi-exclamation-triangle',
        routerLink: '/organization/risk-appetite',
        isPlaceholder: true,
      },
    ],
  },
  {
    name: 'Usuarios y roles',
    icon: 'pi pi-users',
    root: true,
    children: [
      {
        name: 'Usuarios',
        icon: 'pi pi-user',
        routerLink: '/users',
        isPlaceholder: true,
      },
      {
        name: 'Crear usuario',
        icon: 'pi pi-plus',
        isPlaceholder: true,
      },
      {
        name: 'Roles',
        icon: 'pi pi-shield',
        routerLink: '/users',
        isPlaceholder: true,
      },
      {
        name: 'Crear rol',
        icon: 'pi pi-plus-circle',
        isPlaceholder: true,
      },
    ],
  },
  {
    name: 'Administración',
    icon: 'pi pi-cog',
    root: true,
    children: [
      {
        name: 'Reportes',
        icon: 'pi pi-chart-bar',
        routerLink: '/reports',
      },
      {
        name: 'Configuración',
        icon: 'pi pi-wrench',
        routerLink: '/settings',
      },
    ],
  },
];

// Menu items for backoffice
export const backofficeMenuItems: MenuItem[] = [
  {
    name: 'Inicio',
    icon: 'pi pi-home',
    routerLink: '/home',
    root: true,
  },
  {
    name: 'Gestión de clientes',
    icon: 'pi pi-building',
    root: true,
    children: [
      {
        name: 'Listado de clientes',
        icon: 'pi pi-list',
        routerLink: '/clients',
      },
      {
        name: 'Crear cliente',
        icon: 'pi pi-plus',
        command: createClientCommand(),
      },
      {
        name: 'Asignación de clientes',
        icon: 'pi pi-users',
        routerLink: '/clients',
        isPlaceholder: true,
      },
    ],
  },
  {
    name: 'Team',
    icon: 'pi pi-users',
    root: true,
    children: [
      {
        name: 'Listado de usuarios',
        icon: 'pi pi-user',
        routerLink: '/users-list',
      },
      {
        name: 'Crear usuario',
        icon: 'pi pi-plus',
        command: createNewUserCommand(),
      },
    ],
  },
  {
    name: 'Administración',
    icon: 'pi pi-cog',
    root: true,
    children: [
      {
        name: 'Reportes',
        icon: 'pi pi-chart-bar',
        routerLink: '/reports',
      },
      {
        name: 'Configuración',
        icon: 'pi pi-wrench',
        routerLink: '/settings',
      },
    ],
  },
];
