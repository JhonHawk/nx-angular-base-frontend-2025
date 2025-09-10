# Repository Guidelines

## Estructura del Proyecto

- Monorepo Nx con apps en `apps/` (`backoffice-client`, `customer-client`, `*-e2e`) y librería consolidada en `libs/customer-features`.
- Módulos de dominio: `libs/customer-features/src/lib/modules/...`; compartidos: `libs/customer-features/src/lib/shared/{components,utils,types,services,constants}`.
- Apps: código en `apps/<app>/src/{app,environments,assets}`.

## Construir, Probar y Desarrollar

- Desarrollo: `npm run start:backoffice` (puerto 4200), `npm run start:customer` (4201), o `npm run start:all`.
- Builds: `npm run build:backoffice`, `npm run build:customer`, `npm run build:all`, `npm run build:libs`.
- Calidad: `npm run lint`, `npm run test:all`, `nx test <proyecto> --coverage`, `npm run format(:check)`, `npm run graph`.
- Generación: `npm run generate:component`, `npm run generate:shared-component`, `npm run generate:module-component`.

## Estilo y Convenciones

- Prettier (ancho 100, `singleQuote: true`). ESLint Nx/Angular por proyecto.
- Identación 2 espacios; clases/tipos en PascalCase; archivos/selectores en kebab-case (ej.: `clients-list.ts`, `app-clients-list`).
- Tailwind CSS v4 + PrimeNG: en CSS de componente usa `@reference "tailwindcss"` para habilitar `@apply`. Modo oscuro con selector `.orca-app-dark`.
- Librería con ÚNICO barrel: `libs/customer-features/src/index.ts`. Internamente, usa imports directos o `shared/internal.ts` para evitar dependencias circulares.

## Pruebas

- Unit tests con Jest (`*.spec.ts` junto al código). E2E con Playwright en `apps/*-e2e`.
- Cobertura recomendada >80% en código nuevo (rutas, componentes, guards, servicios).

## Commits y Pull Requests

- Mensajes imperativos y claros (scope opcional), enlaza issues (`#123`). Resume impacto en apps/librería.
- En PR: descripción, capturas/GIFs UI, plan de pruebas (salida de `nx test/e2e`), y notas de cambios en config.

## Seguridad y Configuración

- No subas secretos. URLs y claves en `apps/<app>/src/environments/*.ts`. Cada app usa storage y auth propios: `backoffice-user-data` vs `customer-user-data`.
- Configura el HTTP interceptor desde `customer-features` con `configureHttpInterceptor(...)` por app (ver `docs/HTTP_INTERCEPTOR_GUIDE.md`).

Más detalles: consulta `CLAUDE.md`, `docs/DEVELOPMENT_GUIDE.md`, `docs/STYLING_GUIDE.md` y `docs/GLOBAL_MODALS_GUIDE.md`.
