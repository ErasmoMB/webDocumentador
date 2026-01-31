## Sección 1 & 2 — Flujo de estado

1. **Carga JSON (Sección 1)**
   - `Seccion1Component.onJSONFileSelected` valida y normaliza el JSON usando `validateJSONStructure` + `createJSONProcessingBatch`.
   - El batch resultante despacha metadatos, ubicación, registro de CCPP y creación de grupos (`Commands.batch`).
   - Además, la sección persiste el JSON completo, los centros poblados detectados y la ubicación en los campos (`onFieldChange`), lo que alimenta tanto el `ProjectStateFacade` como el `FormularioService` (persistencia local).

2. **Detección automática (Sección 2)**
   - `Seccion2Component` vuelve a leer `centrosPobladosJSON` desde `ProjectStateFacade.obtenerDatos()` y agrupa:
     - AISD = claves del objeto (comunidades campesinas).
     - AISI = distritos únicos (valores `DIST`).
   - Los grupos se guardan de vuelta con `onFieldChange`, lo que permite que otras secciones lean referencias por código.

3. **Referencias centralizadas**
   - El nuevo contrato de UI expone selectores auxiliares (`getGroupsByType`, `getGroupById`, `getPopulatedCenterById`) para que cualquier sección pueda obtener:
     - Definiciones completas de grupos (incluye `ccppIds`).
     - Centros poblados registrados por su ID (referencia `CCPPEntry`).
   - `ProjectStateFacade` ofrece señales (`groupsByType`, `groupById`, `populatedCenterById`) que conectan directamente con estos selectores, facilitando la construcción de componentes reactivos en Angular.

4. **Persistencia sin duplicar**
   - `SectionPersistenceCoordinator` escribe primero en el store (`ProjectStateFacade.setField`) y luego en `FormularioService`, evitando escrituras duplicadas desde componentes.
   - La lectura inicial chequea primero el localStorage del `FormularioService` y luego sincroniza cualquier dato declarado en `ProjectState`.

5. **Próximos pasos**
   - Las subsecciones posteriores deben usar `ProjectStateFacade.groupsByType('AISD')`/`('AISI')` y `populatedCenterById` para construir tablas referenciando grupos/UBIGEO, sin duplicar datos.
   - Antes de avanzar, crear una validación que recorra las referencias y verifique existencia en los lookup signals; si falla, bloquear navegación y mostrar un mensaje de error.
