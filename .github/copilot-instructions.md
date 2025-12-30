# Copilot Instructions for LBS (Angular Project)

## Arquitectura General
- Proyecto Angular (ver angular.json, src/)
- Estructura modular: `src/app/` contiene módulos, servicios, modelos y componentes.
- Servicios principales en `src/app/core/services/` y `src/app/shared/services/`.
- Componentes de páginas en `src/app/pages/` y componentes compartidos en `src/app/shared/components/`.
- Modelos de datos en `src/app/core/models/` y `src/app/models/`.
- Archivos de entorno en `src/environments/`.

## Flujos y Patrones Clave
- Navegación gestionada por `app-routing.module.ts` y servicios de navegación.
- Comunicación entre componentes y servicios vía inyección de dependencias Angular.
- Datos simulados en `src/assets/mockData/` para desarrollo y pruebas.
- Scripts personalizados en `scripts/` para tareas de mantenimiento y generación de datos.

## Workflows de Desarrollo
- **Servidor de desarrollo:** `ng serve` (o `npm start` si está configurado)
- **Build:** `ng build`
- **Tests unitarios:** `ng test`
- **E2E:** `ng e2e` (requiere configuración adicional)
- **Scripts útiles:** Ejecutar scripts JS en la carpeta `scripts/` con Node.js para manipulación de datos y generación de archivos.

## Convenciones Específicas
- Usar servicios para lógica de negocio y acceso a datos (ver `core/services/`, `shared/services/`).
- Modelos de datos tipados en TypeScript (ver `core/models/`, `models/`).
- Componentes de UI reutilizables en `shared/components/`.
- Estilos compartidos en `shared/styles/`.
- No modificar directamente archivos en `assets/mockData/` sin actualizar los scripts relacionados.

## Integraciones y Dependencias
- Angular CLI v16.x
- Karma para tests unitarios
- Scripts Node.js para tareas de datos

## Ejemplos de Patrones
- Servicio de datos: `core/services/data.service.ts`
- Componente de página: `pages/resumen/resumen.component.ts`
- Modelo de datos: `core/models/datos.model.ts`

## Archivos Clave
- `angular.json`, `tsconfig.json`: configuración global
- `src/app/app.module.ts`: módulo raíz
- `src/app/app-routing.module.ts`: rutas principales
- `README.md`: instrucciones generales

---

**Actualiza este archivo si cambian los flujos, convenciones o estructura del proyecto.**
