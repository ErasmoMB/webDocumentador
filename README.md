# webDocumentador

Sistema de documentación de proyectos construido con Angular 17+ y arquitectura basada en estado inmutable.

## Stack Tecnológico

| Capa | Tecnología |
|------|------------|
| Framework | Angular 17 (Standalone + Signals) |
| Estado | Inmutable con Reducers puros |
| Tests | Jasmine + Karma (598 tests) |
| Build | Angular CLI + esbuild |
| E2E | Cypress |

## Inicio Rápido

```bash
# Instalar dependencias
npm install

# Desarrollo
npm start

# Tests unitarios
npm test

# Build producción
npm run build
```

## Arquitectura

El sistema sigue una arquitectura de **estado centralizado inmutable** inspirada en Redux/NgRx pero simplificada:

```
┌─────────────────────────────────────────────────────────────────┐
│                           UI LAYER                              │
│  (Components solo leen Selectors y despachan Commands)          │
└────────────────────────────┬────────────────────────────────────┘
                             │
              ┌──────────────┴──────────────┐
              │      UIStoreContract        │
              │  ┌─────────┐  ┌──────────┐  │
              │  │Selectors│  │ dispatch │  │
              │  │ (read)  │  │(command) │  │
              │  └────┬────┘  └────┬─────┘  │
              └───────┼────────────┼────────┘
                      │            │
              ┌───────┴────────────┴────────┐
              │       ProjectState          │
              │    (Signal<ProjectState>)   │
              └──────────────┬──────────────┘
                             │
              ┌──────────────┴──────────────┐
              │         Reducers            │
              │  (state, command) => state  │
              └─────────────────────────────┘
```

## Estructura del Proyecto

```
src/app/
├── core/                      # Núcleo de la aplicación
│   ├── state/                 # Sistema de estado
│   │   ├── project-state.model.ts    # Modelo del estado
│   │   ├── commands.model.ts         # Comandos disponibles
│   │   ├── ui-store.contract.ts      # Contrato UI↔Store
│   │   └── reducers/                 # Funciones reductoras
│   │
│   ├── persistence/           # Capa de persistencia
│   │   ├── persistence.contract.ts   # Tipos y validación
│   │   ├── storage.adapter.ts        # Adaptador localStorage
│   │   └── persistence.service.ts    # Orquestador
│   │
│   ├── export/               # Sistema de exportación
│   │   ├── export.contract.ts        # Tipos de exportación
│   │   ├── document-builder.service.ts
│   │   ├── pdf-renderer.service.ts
│   │   └── json-exporter.service.ts
│   │
│   ├── domain/               # Entidades de dominio
│   ├── application/          # Casos de uso
│   └── infrastructure/       # Servicios externos
│
├── features/                 # Módulos de funcionalidad
├── pages/                    # Páginas/rutas
└── shared/                   # Componentes compartidos
```

## Documentación Detallada

- [ARCHITECTURE.md](./docs/ARCHITECTURE.md) - Arquitectura completa del sistema
- [DATA_FLOW.md](./docs/DATA_FLOW.md) - Flujo de datos detallado
- [TECHNICAL_DECISIONS.md](./docs/TECHNICAL_DECISIONS.md) - Decisiones técnicas clave

## Testing

```bash
# Tests unitarios
npm test

# Tests con coverage
npm run test:coverage

# Tests E2E
npm run cypress:run
```

## Licencia

Propiedad del equipo de desarrollo.
