# Referencias explícitas & validación de tablas

## 1. Esquema de referencia para las filas de tabla

Todas las tablas (`TableContent.rows`) deben transportar el siguiente subconjunto dentro de `data`:

```ts
interface TableRowReferenceData {
  groupReferenceId?: string;       // ID del grupo (AISD/AISI)
  groupReferenceType?: 'AISD' | 'AISI';
  populatedCenterId?: string;     // ID único del CCPP registrado
  ubigeoCode?: string;            // Código UBIGEO asociado
}
```

- `groupReferenceId` + `groupReferenceType` permiten chequear la existencia del grupo mediante `Selectors.getGroupById`.
- `populatedCenterId` apunta a un `CCPPEntry` registrado en `ccppRegistry`.
- `ubigeoCode` permite validar que el código UBIGEO existe en los CCPP cargados (se usa `ubigeo` y `codigo` como fuente).

## 2. Servicio `SectionReferenceValidationService`

- Recorre `sectionsContent.sectionOrder`, valida cada tabla y busca filas con `groupReferenceId`, `populatedCenterId` o `ubigeoCode`.
- Usa los selectores del contrato (`getGroupById`, `getPopulatedCenterById`) para confirmar que el destino existe.  
- Expone:
  - `validationState: Signal<{ isValid: boolean; errors: SectionReferenceError[] }>`  
  - `isValid: Signal<boolean>`  
  - `errors: Signal<SectionReferenceError[]>`
- Cada error contiene sección, tabla, fila y campo inválido para mostrar mensajes localizados.

## 3. Selectores expuestos (UIStoreContract)

1. `getGroupsByType(state, tipo)` → `GroupDefinition[]` (AISD/AISI).  
2. `getGroupById(state, tipo, id)` → `GroupDefinition | null`.  
3. `getAllPopulatedCenters(state)` → lista de `CCPPEntry`.  
4. `getPopulatedCenterById(state, centerId)` → `CCPPEntry | null`.  

Estas permiten que la UI manifieste el estado maestro sin recomputar o reparsear el JSON.

## 4. Integración con el medio de navegación

- `SectionNavigationService` consulta `SectionReferenceValidationService.isValid()` antes de devolver anterior/siguiente.  
- El componente `SeccionComponent` consume `validationService.errors()` y muestra un banner con los errores (sección · tabla · fila).  
- Cualquier banner/toast futuro debe leer `SectionNavigationService.getValidationErrors()` para ofrecer mensajes detallados y despejar la navegación.

## 5. QA manual

1. Cargar un JSON válido y revisar que `ProjectStateFacade.groupsByType('AISD')` / `allPopulatedCenters()` devuelven datos.  
2. Inyectar (desde consola) una fila con `groupReferenceId` inválido en una tabla de la sección 3 y verificar que:  
   - `SectionReferenceValidationService.isValid()` → `false`.  
   - La navegación (Anterior/Siguiente) se deshabilita.  
   - El banner muestra la sección + tabla + fila en el UI.  
3. Repetir con `populatedCenterId` o `ubigeoCode` roto para confirmar mensajes específicos.  
4. Restablecer la referencia (usar IDs existentes) y comprobar que la validación pasa y se reanuda la navegación.

## 6. Refactorización completada - Sección 2 basada en Signals

**Fecha de refactorización**: Completado Fase 3

### Componentes refactorizados

#### `Seccion2Component`
- **Eliminado**: Uso de `projectFacade.obtenerDatos()` para leer grupos y centros poblados.
- **Eliminado**: Arrays locales (`comunidadesCampesinas`, `distritosAISI`).
- **Implementado**: Consumo exclusivo de signals:
  - `aisdGroups: Signal<readonly GroupDefinition[]>` vía `projectFacade.groupsByType('AISD')`
  - `aisiGroups: Signal<readonly GroupDefinition[]>` vía `projectFacade.groupsByType('AISI')`
  - `allPopulatedCenters: Signal<readonly CCPPEntry[]>` vía `projectFacade.allPopulatedCenters()`
- **Comandos despachados**:
  - `addGroup(tipo, nombre, parentId)`: Agregar comunidad/distrito
  - `removeGroup(tipo, groupId, cascade)`: Eliminar comunidad/distrito
  - `renameGroup(tipo, groupId, nuevoNombre)`: Cambiar nombre
  - `setGroupCCPP(tipo, groupId, ccppIds)`: Reemplazar todos los CCPP de un grupo
  - `addCCPPToGroup(tipo, groupId, ccppId)`: Agregar un CCPP individual
  - `removeCCPPFromGroup(tipo, groupId, ccppId)`: Remover un CCPP individual
- **Reactividad**: `effect()` registrado para loguear cambios automáticamente en consola cada vez que los signals cambian.

#### `Seccion2FormComponent`
- **Eliminado**: Arrays locales (`comunidadesCampesinas`, `distritosAISI`, `centrosPobladosJSON`).
- **Implementado**: Delegación total a `Seccion2Component` para comandos.
- **Implementado**: Lectura reactiva desde signals del `ProjectStateFacade`.
- **Métodos de consulta**: Todos derivados de signals (`obtenerComunidades`, `obtenerDistritos`, `obtenerTodosLosCentrosPoblados`, etc.).

### Verificación de reactividad

**Consola del navegador**:
```javascript
// 1. Verificar que los signals contienen datos
const facade = inject(ProjectStateFacade);
console.log('AISD Groups:', facade.groupsByType('AISD')());
console.log('AISI Groups:', facade.groupsByType('AISI')());
console.log('All Centers:', facade.allPopulatedCenters()());

// 2. Agregar un grupo y verificar actualización automática
facade.addGroup('AISD', 'Test Comunidad', null);
console.log('AISD Groups después de agregar:', facade.groupsByType('AISD')());
```

**Observar en UI**:
1. Abrir Sección 2 en modo edición.
2. Agregar/eliminar una comunidad o distrito.
3. Verificar en la consola del navegador que aparece el log:
   ```
   🔄 [Seccion2] Grupos AISD actualizados: N grupos
      Grupo <nombre> → centros: [<lista>]
   ```

### Pasos de QA manual - Sección 2

1. **Cargar JSON y verificar detección automática**:
   - Cargar un JSON con estructura válida en Sección 1.
   - Navegar a Sección 2.
   - Verificar que los grupos AISD/AISI se detectan automáticamente desde `groupsByType`.
   - Verificar que NO se llama a `projectFacade.obtenerDatos()` (buscar en código o poner breakpoint).

2. **Agregar comunidad campesina**:
   - Hacer clic en "Agregar Comunidad".
   - Verificar en consola el log: `✅ [Comando] Agregada comunidad: <nombre>`.
   - Verificar que el signal `aisdGroups()` se actualiza automáticamente.
   - Verificar que la UI muestra el nuevo grupo sin recargar.

3. **Editar nombre de comunidad**:
   - Cambiar el nombre de una comunidad en el formulario.
   - Verificar log: `📝 [Comando] Renombrada comunidad <id> → <nuevo_nombre>`.
   - Verificar que `ProjectStateFacade.groupsByType('AISD')()` refleja el cambio inmediatamente.

4. **Seleccionar centros poblados**:
   - Marcar/desmarcar checkboxes de centros poblados.
   - Verificar logs: `➕ [Comando] Centro <codigo> agregado...` o `➖ [Comando] Centro <codigo> removido...`.
   - Verificar que el array `grupo.ccppIds` se actualiza en el signal.
   - Verificar en la consola que el effect logra: `Grupo <nombre> → centros: [<lista actualizada>]`.

5. **Seleccionar todos / Deseleccionar todos**:
   - Hacer clic en "Seleccionar todos" para una comunidad.
   - Verificar log: `✅ [Comando] Todos los centros seleccionados para comunidad <id>`.
   - Verificar que todos los `ccppIds` aparecen en el signal del grupo.

6. **Eliminar comunidad**:
   - Hacer clic en "Eliminar" para una comunidad.
   - Verificar log: `❌ [Comando] Eliminada comunidad: <id>`.
   - Verificar que la comunidad desaparece del signal `aisdGroups()`.
   - Verificar que la UI se actualiza automáticamente.

7. **Repetir para distritos (AISI)**:
   - Repetir pasos 2-6 para grupos AISI.
   - Verificar comandos equivalentes para `aisiGroups()`.

### Mapeo tabla → sección → columnas que usan referencias

**Sección 3 - Características sociodemográficas**:
- `Tabla 3.1`: `groupReferenceId`, `groupReferenceType`
- `Tabla 3.2`: `populatedCenterId`, `ubigeoCode`

**Sección 4 - Análisis de impactos**:
- `Tabla 4.1`: `groupReferenceId`, `groupReferenceType`, `populatedCenterId`
- `Tabla 4.2`: `ubigeoCode`

**Sección 7 - Participación ciudadana**:
- `Tabla 7.1`: `groupReferenceId`, `populatedCenterId`

### Verificación de referencias en tablas

1. Abrir Sección 3 (o 4, 7) en el navegador.
2. Editar una fila de tabla y seleccionar un grupo/centro poblado.
3. Verificar en consola (DevTools → Application → Local Storage → `documentadorState`) que la fila contiene:
   ```json
   {
     "id": "row_123",
     "orden": 1,
     "data": {
       "groupReferenceId": "A.1",
       "groupReferenceType": "AISD",
       "populatedCenterId": "CENTRO_001",
       "ubigeoCode": "150101",
       "otrosCampos": "..."
     }
   }
   ```
4. Cambiar el `groupReferenceId` por un ID inválido (ej. "INVALID_ID").
5. Verificar que `SectionReferenceValidationService.isValid()` devuelve `false`.
6. Verificar que el banner de errores aparece en la UI indicando la tabla y fila con error.
7. Corregir el ID (poner uno válido).
8. Verificar que el banner desaparece y la navegación se habilita.

## 7. Próximos pasos

- ✅ **Completado**: Migrar Sección 2 para que consuma `groupsByType`, `groupById` y `populatedCenterById` en lugar de `projectFacade.obtenerDatos()`.
- Instrumentar Secciones 3, 4 y 7 para que rellenen `TableRowReferenceData` al editar filas.
- Agregar un toast "Ir al error" que navegue automáticamente a la sección/tabla con referencias inválidas.
- Actualizar documentación para desarrolladores con patrones de uso de signals y comandos.
