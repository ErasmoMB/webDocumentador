# Guía de implementación: Tablas, Imágenes y Párrafos (MODO IDEAL) ✅

**Propósito:** Documento único y reproducible para implementar de forma consistente y segura la edición de párrafos, CRUD de imágenes y CRUD de tablas (incluyendo cálculos de porcentajes y persistencia) en cualquier sección que lo requiera.

---

## 1. Alcance 🎯
- Aplicable a nuevas secciones y refactorizaciones de secciones legacy.
- Cubre: arquitectura mínima, handlers clave, persistencia correcta (prefijo/base), actualizaciones inmediatas en UI, cálculo y presentación de porcentajes, tests y checklist de QA.

---

## 2. Principios clave 🔧
- **MODO IDEAL** (obligatorio): View + Form + Form-wrapper, Signals (no RxJS subscriptions en componentes), persistencia mediante `FormChangeService` y lectura con `Selectors`.
- **Estado centralizado inmutable**: usar `ProjectStateFacade` (`selectField`, `selectTableData`, `setTableData`, `setField`).
- **No mutar el estado localmente sin persistir**: siempre sincronizar con `ProjectState` y luego notificar (`persistFields(..., { notifySync: true })`).
- **Compatibilidad prefijo/base**: detectar si la tabla está bajo clave prefijada y persistir *ambas* claves (prefijo + base) para evitar que la vista lea claves desacopladas.
- **Mostrar cambios inmediatamente**: aplicar asignación local en el componente (ej. editar celda) antes de que la sincronización asíncrona ocurra y forzar actualización de la vista.

---

## 3. Estructura recomendada de archivos 🗂️
- `seccionX-view.component.ts` (lectura y presentación, usa selectores)
- `seccionX-form.component.ts` (form con handlers y viewModel)
- `seccionX-form-wrapper.component.ts` (extiende `BaseSectionComponent`, inyección y ciclo de vida)
- Reutilizables:
  - `dynamic-table.component.ts` (UI editable)
  - `image-crud.component.ts` (uploader/preview/orden/delete)
  - `table-calculation.service.ts` (porcentajes y ajustes)
  - `table-management.facade.ts` (helpers para prefijo/base)

---

## 4. Patrón para tablas: paso a paso ✅
1. **Inicializar**
   - Al init del form, leer con `selectTableData(key)` o `selectField(key)` y construir `tableData` con fallback a `structureInicial()`.
   - Registrar logs temporales para diagnosticar claves (`actualKey`, `baseKey`).
2. **Detección de clave real**
   - Usar `PrefixManager.getActualKey(groupId, key)` (o helper similar) para decidir si la tabla está en `prefijo/tabla` o `tabla` base.
3. **Agregar fila**
   - `onAdd` debe: insertar fila en `tableData` local, forzar `detectChanges()`/`ViewChildHelper.updateAllComponents('actualizarDatos')`, llamar `setTableData(actualKey, tableData)` y luego `persistFields({ groupId: 'table', payload })` con `notifySync: true`.
4. **Editar celda (onFieldChange)**
   - Aplicar asignación local inmediata a `tableData[rowIndex][colId] = nuevoValor` para actualización instantánea de la UI.
   - Calcular si aplica los porcentajes con `tableCalculationService.compute(...)` y asignar objetos `{ value, isCalculated }` cuando corresponda.
   - Llamar `setTableData(actualKey, tableData)` y `setField(actualKeyWithoutPrefix, transformedValue)` según convenga.
   - Finalmente llamar `persistFields({ groupId: 'table', payload }, { notifySync: true })`.
5. **Persistir ambas claves**
   - Siempre persistir `actualKey` y además `baseKey` (si existen ambas rutas) para asegurar compatibilidad con vistas que lean la clave base.
6. **Mostrar porcentajes**
   - `DynamicTable` debe usar `getFormattedValue(cell)` que extrae `cell.value` si `cell` es objeto `{ value, isCalculated }`.

Ejemplo (pseudocódigo):

```ts
// handleTableFieldChange
const actualKey = PrefixManager.getActualKey(groupId, key);
// update local
tableData[rowIndex][colId] = newValue;
// recalc
const porcentajes = tableCalculationService.compute(tableData);
setTableData(actualKey, tableData);
setField(baseKey, transformForField(tableData));
formChangeService.persistFields({ groupId: 'table', payload: { key: actualKey, data: tableData } }, { notifySync: true });
```

---

## 5. Patrón para CRUD de imágenes 🖼️
- **UI**: `image-crud.component` con uploader (limit size/type), vista previa, ordenar y eliminar.
- **Persistencia**: almacenar referencias en `ProjectState` como array de objetos `{ id, url, alt, metadata }` bajo `field/imageKey` o group `images`.
- **Flujo**:
  1. Selección de archivo → validar → upload temporal (o base64 según el caso) → asignación local inmediata a `images[]` → `setField(key, images)` → `persistFields(..., { notifySync: true })`.
  2. Borrar → eliminar localmente → `setField` + `persistFields`.
- **Consideraciones**: mantener thumbs en `assets/mocks/` para preview en entorno de desarrollo si aplica.

Snippet:
```ts
onUpload(file) {
  const item = { id: genId(), url: urlFromUpload, alt: '', metadata: {} };
  images.push(item);
  setField(key, images);
  formChangeService.persistFields({ groupId: 'images', payload: { key, images } }, { notifySync: true });
}
```

---

## 6. Párrafos y textos (Fallbacks) ✍️
- Mantener el comportamiento del monolito: si un párrafo está vacío, calcular fallback desde `Selectors` o helper (ej. `getTextoIntroServiciosBasicosAISI()`).
- El `form` debe exponer el control para editar `titulo`, `fuente` y `texto`, y llamar `setField(fieldKey, value)` + `persistFields(...)` al guardar.
- En la `view`, usar `computed()` que lee `selectField(key)` y aplica fallback si necesario.

---

## 7. Tests recomendados ✅ (Unit + E2E)
- Unit tests (ejemplos):
  - `DynamicTable`: que `getFormattedValue` maneja objetos `{value,isCalculated}`.
  - `TableCalculationService`: casos base, suma != 100, ajuste y rounding.
  - `seccionX-form`: `handleTableFieldChange` persiste `actualKey` y `baseKey`.
- E2E (Cypress) scenario:
  1. Abrir seccion → editar celda de tabla → comprobar UI muestra cambio inmediatamente.
  2. Añadir fila → comprobar aparece sin reload.
  3. Ir a preview → comprobar tabla y porcentajes reflejados.
  4. Subir imagen → ir a preview → comprobar imagen visible.

---

## 8. Checklist de PR / QA ✅
- [ ] Form-wrapper existe y extiende `BaseSectionComponent`.
- [ ] Signals puros en component (no subscripciones manuales).
- [ ] `handleTableFieldChange` detecta `actualKey` y persiste **ambas** claves.
- [ ] `onAdd` actualiza `tableData` local y llama `setTableData` antes de `persistFields`.
- [ ] `getFormattedValue` trata porcentajes correctamente.
- [ ] Tests unitarios y E2E añadidos o actualizados.
- [ ] Logs de debugging removidos o marcados `debugOnly` antes del merge.
- [ ] Documentación actualizada (`docs/IMPLEMENTACION_TABLAS_IMAGENES_PARRAFO.md`).

---

## 9. Notas de migración y compatibilidad 🔁
- Si hay secciones legacy que escriben en la clave base, mantén la estrategia de persistir ambas claves hasta que todas las lecturas usen la clave prefijada.
- Añadir feature flag temporario si el cambio puede afectar a producción; desplegar en staging y verificar E2E.

---

## 10. Plantillas y fragmentos (copiar/pegar) 📋
- `handleTableFieldChange` minimal:

```ts
function handleTableFieldChange({ key, rowIndex, colId, value }) {
  const actualKey = PrefixManager.getActualKey(groupId, key);
  tableData[rowIndex][colId] = value; // update local
  // recalc porcentajes
  const calc = tableCalculationService.compute(tableData);
  setTableData(actualKey, tableData);
  // persist both keys
  const baseKey = PrefixManager.getBaseKey(key);
  setField(baseKey, transformForField(tableData));
  formChangeService.persistFields({ groupId: 'table', payload: { key: actualKey, tableData } }, { notifySync: true });
}
```

---

## 11. Próximos pasos recomendados 🚀
1. Aplicar esta guía a las tablas restantes (saneamiento, cobertura, combustibles) y ejecutar E2E.
2. Añadir tests unitarios para `DynamicTable` y `TableCalculationService`.
3. Revisar logs y limpiar `console.*` antes de merge final.

---

> Si prefieres, puedo crear automáticamente un PR con la guía y aplicar la plantilla en las secciones restantes (crear commits que repliquen el patrón) y añadir tests iniciales. ¿Lo hago? ✨

---

Documento generado el 5 de febrero de 2026.
