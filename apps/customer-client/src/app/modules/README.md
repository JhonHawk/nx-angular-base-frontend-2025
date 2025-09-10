# Modules - Customer Client

This directory contains feature modules specific to the customer-facing application.

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
- Represent full views/screens that users can navigate to from sidebar
- Examples:
  - `/team` → `pages/list/team-list.ts`
  - `/team/create` → `pages/create/team-create.ts`
  - `/organization/structure` → `pages/structure/org-structure.ts`

#### **Components Directory (`components/`)**

- Reusable components that **cannot be accessed directly via URL**
- Used within pages or other components for specific functionality
- Examples:
  - Team member cards for displaying team info
  - Organization chart widgets
  - Role assignment components
  - Team statistics charts

### Example Route Configuration

```typescript
// modules/team/team.routes.ts
import { Routes } from '@angular/router';
import { AuthenticatedLayout } from 'customer-features';
import { authGuard } from '../../core/guards/auth.guard';

export const teamRoutes: Routes = [
  {
    path: '',
    component: AuthenticatedLayout,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/list/team-list').then((m) => m.TeamList),
      },
      {
        path: 'create',
        loadComponent: () => import('./pages/create/team-create').then((m) => m.TeamCreate),
      },
      {
        path: ':id/edit',
        loadComponent: () => import('./pages/edit/team-edit').then((m) => m.TeamEdit),
      },
    ],
  },
];
```

## Available Modules

### Auth Module (`auth/`)

- **Purpose**: Authentication and authorization for customer users
- **API Domain**: Public API endpoints
- **Structure**: Currently uses shared authentication components
- **Note**: Auth pages are handled at app level, no module-specific pages yet

### Home Module (`home/`)

- **Purpose**: Customer dashboard with team-focused metrics
- **Structure**:
  - `pages/dashboard/` - Main dashboard accessible at `/home`
  - `components/` - Dashboard widgets for team metrics, project status

### Team Module (`team/`) _[Example Structure]_

- **Purpose**: Team management and collaboration tools
- **Structure**:
  - `pages/list/` - Team overview at `/team`
  - `pages/create/` - Add team member at `/team/create`
  - `pages/edit/` - Edit member at `/team/:id/edit`
  - `components/member-card/` - Team member display component
  - `components/team-stats/` - Team statistics widget

### Organization Management Module (`organization-management/`)

- **Purpose**: Customer organization structure and management
- **Structure**:
  - `pages/structure/` - Org chart view
  - `pages/roles/` - Role management
  - `pages/permissions/` - Permission settings
  - `components/org-diagram/` - Interactive org chart component
  - `components/role-matrix/` - Role-permission matrix widget

### Profile Module (`profile/`)

- **Purpose**: Customer user profile management
- **Structure**:
  - `pages/settings/` - Profile settings
  - `pages/preferences/` - User preferences
  - `components/avatar-upload/` - Profile picture component
  - `components/notification-settings/` - Notification preferences widget

## Implementation Guidelines

### Creating a New Module

1. Create the module directory with `pages/` and `components/` subdirectories
2. Create route configuration file: `[module-name].routes.ts`
3. Implement pages as standalone components in individual folders
4. Build reusable components for customer-specific functionality
5. Add services for business logic and API communication

### Route Integration

Add your module routes to the main app routing:

```typescript
// apps/customer-client/src/app/app.routes.ts
{
  path: 'team',
  loadChildren: () => import('./modules/team/team.routes').then(m => m.teamRoutes)
}
```

## Important Notes

- Each module consumes **different API endpoints** than the backoffice app
- Services use **public API domain** for customer operations
- Authentication flows are **specific to customer users** with different storage keys
- All page components are **standalone by default** and lazy-loaded for performance
- Components in `pages/` are accessible via URL and represent sidebar navigation items
- Components in `components/` are reusable widgets not directly accessible via URL
- Focus on team-oriented and customer-facing functionality
