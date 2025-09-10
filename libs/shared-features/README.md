# Shared Features Library

This is the consolidated shared library for the Base Frontend Web monorepo, containing all shared functionality organized by domain.

## Architecture

The library follows the same organizational pattern as applications with a consolidated structure:

```
libs/shared-features/src/lib/
├── modules/                          # Business logic modules
│   ├── users/                        # User management domain
│   ├── organization-management/      # Organization domain
│   └── profile-management/          # Profile domain
├── shared/                          # Cross-cutting concerns
│   ├── components/                  # Reusable UI components (standalone by default)
│   ├── constants/                   # Application constants
│   ├── types/                       # TypeScript interfaces
│   ├── utils/                       # Utility functions & services
│   ├── services/                    # Cross-cutting services
│   └── forms/                       # Reusable form utilities
└── index.ts                         # Main library export
```

## Creating Components

All components in this library are standalone by default (Angular 20+):

```bash
# Shared components (cross-app usage)
nx generate @nx/angular:component --path=libs/shared-features/src/lib/shared/components/data-table

# Domain-specific components
nx generate @nx/angular:component --path=libs/shared-features/src/lib/modules/users/components/user-profile
```

## Usage

Import from the single consolidated library:

```typescript
import { 
  ButtonComponent,        // shared/components
  DarkModeService,        // shared/utils
  UserData,              // shared/types
  API_ENDPOINTS          // shared/constants
} from 'shared-features';
```

## Running unit tests

Run `nx test shared-features` to execute the unit tests.
