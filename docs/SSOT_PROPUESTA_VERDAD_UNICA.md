# Propuesta SSOT (Single Source of Truth) — webDocumentador

Fecha: 2026-02-15

## Estado actual (tracking)

- **Rama de trabajo:** `refactor/verdad-unica`
- **Fase actual:** **Fase 2 — Unificar persistencia (matar doble escritura)**
- **Última verificación:** `npm run build` ✅ (guardrails OK)

## 1) Resumen ejecutivo

El repo declara una arquitectura de **estado centralizado inmutable** (ProjectState + Commands/Reducers + Selectors). Sin embargo, hoy conviven **múltiples “fuentes de verdad”** (ProjectState/UIStore, FormularioService, FormStateService/ReactiveStateAdapter, y objetos mutables `datos` en componentes). Esto provoca:

- Doble escritura (state + legacy) y lecturas mezcladas.
- Aislamiento por prefijos duplicado con aislamiento por `sectionId`.
- Inconsistencias entre modo formulario vs modo vista.

**Objetivo:** que toda lectura/escritura de datos “de negocio” ocurra exclusivamente en ProjectState. Persistencia = snapshot de ProjectState (no SSOT). Numeración global = derivada (selectors), nunca almacenada.

## 2) Estado objetivo (“verdad única”)

### 2.1 Fuente única

- **SSOT:** `ProjectState` en memoria, dentro de `UIStoreService`.
- **Lectura:** solo vía Selectors (`store.select(...)` / `selectWith(...)`) y `computed()`.
- **Escritura:** solo vía `dispatch(command)` (o helpers del facade que internamente despachan Commands).

Archivos base:
- `src/app/core/state/project-state.model.ts` (modelo)
- `src/app/core/state/commands.model.ts` + `src/app/core/state/reducers/*` (mutaciones)
- `src/app/core/state/ui-store.contract.ts` (selectors/contract)

### 2.2 Aislamiento de grupos (AISD/AISI)

Tu generador de secciones ya crea IDs únicos por grupo, por ejemplo:
- AISD root: `3.1.4.A.1` … y subsecciones `3.1.4.A.1.1` … `3.1.4.A.1.20`
- AISI root: `3.1.4.B.1` … y subsecciones `3.1.4.B.1.1` … `3.1.4.B.1.9`

**Propuesta SSOT para aislamiento:**
- El aislamiento debe ser **por `sectionId`** (ya encodea el grupo). 
- Los `fieldName/tableKey/photoKey` deben ser **base** (sin sufijos `_A1`, `_B3`, etc.).

Esto elimina la necesidad de `PrefijoHelper` como mecanismo de persistencia (puede quedar solo como puente temporal en migración/export).

### 2.3 Numeración global

Debe permanecer como está en el diseño: **computada** desde `SectionsContentState` (selectors), nunca guardada.

Referencia: `src/app/core/state/section.selectors.ts`.

### 2.4 Persistencia

Persistencia no debe escribir “otra verdad” (FormularioService/FormState). Solo debe guardar/cargar:
- `PersistenceEnvelope` con `PersistibleState` extraído de ProjectState.

Referencia: `src/app/core/persistence/*`.

## 3) Diagnóstico de “doble verdad” detectado

Hoy existen al menos estas fuentes simultáneas:

1) **ProjectState/UIStore** (arquitectura nueva)
2) **FormularioService** (legacy, persiste en localStorage y se considera “fuente de verdad” en comentarios)
3) **FormStateService + ReactiveStateAdapter + SectionSyncService** (estado reactivo paralelo)
4) `BaseSectionComponent.datos` (objeto mutable por sección) que se llena mezclando store + legacy
5) Claves con sufijo `_A1/_B1` (prefijos) + secciones ya aisladas por `sectionId` (aislamiento duplicado)

Puntos concretos que rompen SSOT:
- `ProjectStateFacade.obtenerDatos()` aplana campos/tablas a un objeto “legacy” y se usa para alimentar `datos`.
- `SectionPersistenceCoordinator` restaura desde `FormularioService.obtenerDatos()` y luego sincroniza al store.
- `FormChangeService.persistFields()` por defecto hace `updateLegacy=true` y `updateState=true`.

## 4) Propuesta de migración (por fases)

La idea es **no reescribir todo de golpe**, sino converger en pasos con bajo riesgo.

### Fase 0 — Congelar legacy (reglas)

Reglas a partir de ahora:
- Prohibido usar `ProjectStateFacade.obtenerDatos()` en nuevas secciones/cambios.
- Prohibido escribir directamente a `FormularioService` desde componentes.
- El template debe consumir Signals/Selectors, no `datos` mutable.

### Fase 1 — SSOT en UI (sección por sección)

Por cada sección (form + view):
- Reemplazar `datos = { ...legacy, ...store }` por **signals** y `computed()`.
- Mantener `createAutoSyncField` para campos editables, pero apuntando a store.
- Evitar `setTimeout` como “pipeline”; si necesitas esperar datos, usa `effect()` con condiciones.

Resultado: UI ya lee desde una sola verdad (ProjectState), aunque legacy aún exista debajo.

### Fase 2 — Unificar persistencia (matar doble escritura)

- Cambiar defaults para que `FormChangeService.persistFields()` use `updateLegacy=false` (o migrar llamadas para que explícitamente no escriban legacy).
- Reemplazar `SectionPersistenceCoordinator` por restauración desde `core/persistence` (rehydration de ProjectState).
- Eliminar uso de `ReactiveStateAdapter` para refrescar vistas; las vistas deben re-renderizar por Signals del store.

Resultado: solo hay 1 escritura real: Commands/Reducers → ProjectState → persistence snapshot.

### Fase 3 — Eliminar prefijos como mecanismo de aislamiento

- Crear migración de esquema (p.ej. `1.1.0`) que:
  - Para cada `sectionId` dinámico, copie valores desde claves con sufijo (`campo_A1`) a claves base (`campo`), si la base está vacía.
  - Haga lo mismo para fotos (`fotografia10...Imagen_A1` → `fotografia10...Imagen`).
  - Elimine o deje de generar los sufijos.

- Actualizar secciones para que dejen de construir `fieldName + prefijo`.

Resultado: aislamiento = por `sectionId` (simple, consistente) y el estado es más limpio.

### Fase 4 — Eliminar FormularioService como verdad (deprecación real)

- Dejar FormularioService solo como compatibilidad temporal (si aún se requiere export legacy), o eliminarlo.
- El único storage oficial queda en `core/persistence` con `documentador_project_state`.

## 5) Prioridad sugerida por secciones (señales de legacy)

Basado en escaneo rápido de patrones (obtenerDatos/setTimeout/subscribe):

- **Prioridad Alta (doble verdad clara)**: secciones con `obtenerDatos()` y/o `setTimeout` en lógica principal.
- **Prioridad Media (RxJS subscribe en UI)**: secciones con `.subscribe()` en componentes (ideal mover a servicios/capas de aplicación).
- **Prioridad Baja**: secciones que ya consumen `selectSectionFields/selectField` sin mezclar legacy.

> Nota: `.subscribe()` no siempre es “legacy”, pero en SSOT ideal los efectos async viven fuera del componente o se encapsulan.

## 6) Checklist “SSOT-ready” para declarar una sección en modo ideal

Una sección está SSOT-ready si:
- No llama `obtenerDatos()`.
- No depende de `this.datos` como fuente primaria (solo computed/derivado si existe).
- No escribe a FormularioService.
- Sus campos editables persisten vía Commands/Facade (o FormChangeService configurado a state-only).
- Las claves de datos no incluyen sufijos de prefijo.

---

Si quieres, el siguiente paso práctico es:
1) Generar una tabla por sección (1..30) con los patrones encontrados.
2) Elegir 1 sección AISD y 1 sección AISI como “piloto” y aplicar Fase 1 completa.
