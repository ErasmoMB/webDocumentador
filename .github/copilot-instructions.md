# Copilot Instructions for webDocumentador

## Arquitectura y Patrones Clave
- **Estado centralizado inmutable**: Todo el estado de la app vive en `ProjectState` (ver `src/app/core/state/`). Solo se modifica mediante reducers puros y comandos inmutables.
- **Separación estricta UI/Estado**: Los componentes solo leen datos usando selectores y despachan comandos vía `UIStoreContract` (`select()` y `dispatch()`). Nunca acceden ni mutan el estado directamente.
- **Selectores**: Todas las lecturas de estado se hacen a través de funciones puras en `Selectors`. Ejemplo: `Selectors.getProjectName(state)`.
- **Commands**: Todas las mutaciones de estado se describen con objetos `{ type, payload }`. Ejemplo: `{ type: 'metadata/setProjectName', payload: { projectName: 'X' } }`.
- **Reducers**: Funciones puras que reciben el estado y un comando, y devuelven un nuevo estado. Nunca mutan el estado original.
- **Signals**: Angular Signals reemplazan a RxJS para la reactividad. Usa `projectName()` en templates, no pipes.
- **Persistence y Export**: Persistencia (localStorage) y exportación (PDF/JSON) están desacopladas y usan solo selectores para leer datos.

## Flujos y Workflows
- **Flujo de datos**: UI → Command → Reducer → State → Selector → UI. Nunca hay mutaciones directas ni efectos secundarios en reducers.
- **Auto-save**: Cambios de estado se persisten automáticamente tras debounce y validación (ver `persistence.service.ts`).
- **Exportación**: Usa `ExportService` y `DocumentBuilder` para generar documentos. Solo lee datos vía selectores.
- **Batch commands**: Para operaciones atómicas sobre múltiples partes del estado, usa `{ type: 'batch', payload: { commands: [...] } }`.

## Convenciones Específicas
- **Nombres**:
  - Commands: `dominio/accion` (ej: `metadata/setProjectName`)
  - Selectors: `get*`, `is*`, `has*`, `count*`
  - Archivos: `*.model.ts`, `*.service.ts`, `*.contract.ts`
- **Tests**: Reducers y selectores tienen tests unitarios puros (`*.spec.ts`). Usa `npm test` y revisa cobertura en `coverage/`.
- **E2E**: Pruebas Cypress en `cypress/e2e/`. Ejecuta con `npm run cypress:run`.

## Archivos y Directorios Clave
- `src/app/core/state/`: Modelos, comandos, reducers, selectores
- `src/app/core/persistence/`: Persistencia local y validación
- `src/app/core/export/`: Exportación de documentos
- `src/app/features/`, `src/app/pages/`, `src/app/shared/`: UI y componentes
- `docs/ARCHITECTURE.md`, `docs/DATA_FLOW.md`, `docs/TECHNICAL_DECISIONS.md`: Documentación profunda de arquitectura y decisiones

## Ejemplo de patrón correcto
```typescript
// Componente Angular
readonly projectName = this.facade.select(Selectors.getProjectName);
onSave(name: string) {
  this.facade.dispatch({ type: 'metadata/setProjectName', payload: { projectName: name } });
}
```

## Build y Testing
- Instala dependencias: `npm install`
- Desarrollo: `npm start`
- Tests unitarios: `npm test`
- Build producción: `npm run build`
- Coverage: `npm run test:coverage`
- E2E: `npm run cypress:run`

---

Consulta los archivos en `docs/` para detalles avanzados. Si un patrón no está documentado aquí, sigue la arquitectura de estado inmutable y separación UI/Store.
