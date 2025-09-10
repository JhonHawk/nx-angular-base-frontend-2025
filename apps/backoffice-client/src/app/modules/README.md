# Modules - Backoffice Client

This directory contains feature modules specific to the backoffice application.

## Module Structure Convention

Each module follows a standardized structure that separates **page components** (accessible by URL) from **reusable components** (not accessible by URL):

```
module-name/
├── pages/           # Views accessible by URL routes from sidebar
│   ├── list/        # Main listing page (/module-name)
│   │   ├── [name]-list.ts
│   │   ├── [name]-list.html
│   │   ├── [name]-list.css
│   │   └── [name]-list.spec.ts
│   ├── create/      # Creation page (/module-name/create)
│   │   ├── [name]-create.ts
│   │   ├── [name]-create.html
│   │   ├── [name]-create.css
│   │   └── [name]-create.spec.ts
│   ├── edit/        # Edit page (/module-name/:id/edit)
│   │   ├── [name]-edit.ts
│   │   ├── [name]-edit.html
│   │   ├── [name]-edit.css
│   │   └── [name]-edit.spec.ts
│   └── [other]/     # Additional route-accessible pages
├── components/      # Reusable components NOT accessible by URL
│   ├── [component-name]/
│   │   ├── [component-name].ts
│   │   ├── [component-name].html
│   │   ├── [component-name].css
│   │   └── [component-name].spec.ts
├── services/        # Module-specific services and business logic
├── guards/          # Route guards (if applicable)
└── [module].routes.ts # Module routing configuration
```

### Key Distinction: Pages vs Components

#### **Pages Directory (`pages/`)**

- Components that are **directly accessible via browser URL navigation**
- Represent full views/screens that users can navigate to
- Examples:
  - `/users` → `pages/list/users-list.ts`
  - `/users/create` → `pages/create/user-create.ts`
  - `/users/123/edit` → `pages/edit/user-edit.ts`

#### **Components Directory (`components/`)**

- Reusable components that **cannot be accessed directly via URL**
- Used within pages or other components to build complex functionality
- Examples:
  - Complex chart components for analytics
  - Organizational diagram widgets
  - Specialized form controls
  - Data visualization components

### Example Route Configuration

```typescript
// modules/users/users.routes.ts
import { Routes } from '@angular/router';
import { AuthenticatedLayout } from 'customer-features';
import { authGuard } from '../../core/guards/auth.guard';

export const usersRoutes: Routes = [
  {
    path: '',
    component: AuthenticatedLayout,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/list/users-list').then((m) => m.UsersList),
      },
      {
        path: 'create',
        loadComponent: () => import('./pages/create/user-create').then((m) => m.UserCreate),
      },
      {
        path: ':id/edit',
        loadComponent: () => import('./pages/edit/user-edit').then((m) => m.UserEdit),
      },
    ],
  },
];
```

## Available Modules

### Auth Module (`auth/`)

- **Purpose**: Authentication and authorization for backoffice users
- **API Domain**: VPN-protected backoffice API
- **Structure**:
  - `pages/login/` - Login page accessible at `/login`
  - `pages/forgot-password/` - Password recovery at `/forgot-password`
  - `components/` - Reusable auth-related components (if any)

### Home Module (`home/`)

- **Purpose**: Main dashboard for admin users
- **Structure**:
  - `pages/dashboard/` - Main dashboard accessible at `/home`
  - `components/` - Dashboard-specific widgets and charts

### Users Module (`users/`) _[Example Structure]_

- **Purpose**: User management operations
- **Structure**:
  - `pages/list/` - User list at `/users`
  - `pages/create/` - Create user at `/users/create`
  - `pages/edit/` - Edit user at `/users/:id/edit`
  - `components/user-card/` - Reusable user card component
  - `components/user-permissions-chart/` - Permissions visualization

### Clients Management Module (`clients/`)

- **Purpose**: CRUD operations for customer clients
- **Structure**:
  - `pages/list/` - Client listing
  - `pages/create/` - Client creation
  - `pages/edit/` - Client editing
  - `components/` - Client-specific reusable components

### Management Module (`management/`)

- **Purpose**: Administrative tools and system management
- **Structure**:
  - `pages/roles/` - Role management
  - `pages/licenses/` - License management
  - `pages/system/` - System settings
  - `components/org-diagram/` - Organizational chart component
  - `components/permission-matrix/` - Permission management widget

## Implementation Guidelines

### Creating a New Module

1. Create the module directory with `pages/` and `components/` subdirectories
2. Create route configuration file: `[module-name].routes.ts`
3. Implement pages as standalone components in individual folders
4. Build reusable components for complex functionality
5. Add services for business logic and API communication

### Route Integration

Add your module routes to the main app routing:

```typescript
// apps/backoffice-client/src/app/app.routes.ts
{
  path: 'users',
  loadChildren: () => import('./modules/users/users.routes').then(m => m.usersRoutes)
}
```

## Important Notes

- Each module consumes **different API endpoints** than the customer app
- Services use **VPN-protected domain** for backoffice operations
- Authentication flows are **specific to admin users** with different storage keys
- All page components are **standalone by default** and lazy-loaded for performance
- Components in `pages/` are accessible via URL, components in `components/` are not
