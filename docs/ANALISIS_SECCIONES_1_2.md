# Análisis de Arquitectura: Secciones 1 y 2

**Fecha:** 31 de enero de 2026  
**Objetivo:** Verificar que las secciones 1 y 2 estén correctamente conectadas a la arquitectura del proyecto, usando el sistema nuevo integrado sin código obsoleto.

---

## 📋 Resumen Ejecutivo

| Aspecto | Sección 1 | Sección 2 | Estado |
|---------|-----------|-----------|--------|
| **Signals** | ⚠️ Parcial | ✅ Completo | Mejorar S1 |
| **Commands** | ✅ Correcto | ✅ Correcto | ✅ OK |
| **Selectors** | ⚠️ Indirecto | ✅ Directo | Mejorar S1 |
| **Persistencia** | ✅ Correcto | ⚠️ Duplicada | Optimizar S2 |
| **Código Legacy** | ⚠️ Presente | ⚠️ Presente | Migrar |
| **Reactividad** | ⚠️ RxJS | ✅ Signals | Migrar S1 |

---

## 🔍 Análisis Detallado

### 1. SECCIÓN 1 (`seccion1-form-wrapper.component.ts`)

#### ✅ **Aspectos Positivos**

1. **Uso de Commands (Batch)**
   ```typescript
   // ✅ CORRECTO: Usa createJSONProcessingBatch y dispatch
   const { batch, result } = createJSONProcessingBatch(jsonContent, {...});
   this.store.dispatch(batch);
   ```
   - Usa `UIStoreService` directamente para dispatch
   - Crea batch commands correctamente
   - Sigue el patrón de arquitectura

2. **Validación de JSON**
   ```typescript
   // ✅ CORRECTO: Valida antes de procesar
   const validation = validateJSONStructure(jsonContent);
   if (!validation.valid) { ... }
   ```

3. **Persistencia con FormChangeService**
   ```typescript
   // ✅ CORRECTO: Usa FormChangeService para persistencia
   this.formChange.persistFields(this.seccionId, 'form', updates);
   ```

#### ⚠️ **Problemas Identificados**

1. **Código Legacy Duplicado**
   ```typescript
   // ⚠️ PROBLEMA: Método procesarJSON() duplica lógica ya en createJSONProcessingBatch
   private procesarJSON(jsonContent: any, fileName: string): {...}
   ```
   - **Impacto:** Mantenimiento duplicado, riesgo de inconsistencias
   - **Recomendación:** Eliminar `procesarJSON()` y usar solo `createJSONProcessingBatch`

2. **Uso de ReactiveStateAdapter (RxJS)**
   ```typescript
   // ⚠️ PROBLEMA: Usa RxJS en lugar de Signals
   this.stateSubscription = this.stateAdapter.datos$.subscribe(...)
   ```
   - **Impacto:** No sigue el patrón de Signals establecido
   - **Recomendación:** Migrar a Signals del `ProjectStateFacade`

3. **Lectura Indirecta de Estado**
   ```typescript
   // ⚠️ PROBLEMA: Usa obtenerDatos() en lugar de Selectors directos
   const datos = this.projectFacade.obtenerDatos();
   ```
   - **Impacto:** No aprovecha reactividad de Signals
   - **Recomendación:** Usar signals específicos (`projectName()`, `groupsByType()`, etc.)

---

### 2. SECCIÓN 2 (`seccion2-form-wrapper.component.ts`)

#### ✅ **Aspectos Positivos**

1. **Uso Completo de Signals**
   ```typescript
   // ✅ CORRECTO: Usa Signals directamente
   readonly aisdGroupsSignal: Signal<readonly any[]> = this.projectFacade.groupsByType('AISD');
   readonly aisiGroupsSignal: Signal<readonly any[]> = this.projectFacade.groupsByType('AISI');
   readonly allCentrosSignal = this.projectFacade.allPopulatedCenters();
   ```

2. **Reactividad con `effect()`**
   ```typescript
   // ✅ CORRECTO: Usa effect() para sincronización reactiva
   effect(() => {
     const gruposAISD = this.aisdGroupsSignal();
     // Actualizar arrays locales automáticamente
   });
   ```

3. **Computed Signals**
   ```typescript
   // ✅ CORRECTO: Signals derivados con computed()
   readonly comunidadesSignal: Signal<ComunidadCampesina[]> = computed(() => {
     const grupos = this.aisdGroupsSignal();
     return grupos.map(...);
   });
   ```

4. **Uso de Commands**
   ```typescript
   // ✅ CORRECTO: Despacha commands específicos
   this.projectFacade.addGroup('AISD', nombre, null);
   this.projectFacade.dispatch({
     type: 'groupConfig/setGroupCCPP',
     payload: { tipo: 'AISD', groupId: id, ccppIds: codigos }
   });
   ```

#### ⚠️ **Problemas Identificados**

1. **Persistencia Duplicada**
   ```typescript
   // ⚠️ PROBLEMA: Persiste dos veces - FormChangeService Y FormularioService
   this.formChange.persistFields(..., { updateLegacy: true, ... });
   // Luego también:
   this.formularioService.actualizarDatos({ comunidadesCampesinas: ... });
   ```
   - **Impacto:** Escrituras redundantes, posible inconsistencia
   - **Recomendación:** Usar solo `FormChangeService.persistFields()` con `updateLegacy: true`

2. **Uso de FormularioService Directo (Deprecated)**
   ```typescript
   // ⚠️ PROBLEMA: FormularioService está deprecated
   private formularioService: FormularioService
   this.formularioService.actualizarDatos(...)
   ```
   - **Impacto:** Dependencia de código deprecated
   - **Recomendación:** Eliminar llamadas directas, usar solo `FormChangeService`

3. **Uso de ReactiveStateAdapter (RxJS)**
   ```typescript
   // ⚠️ PROBLEMA: Usa ReactiveStateAdapter.setDatos() (RxJS)
   this.stateAdapter.setDatos(this.projectFacade.obtenerDatos() as any);
   ```
   - **Impacto:** Mezcla Signals con RxJS, no sigue arquitectura pura
   - **Recomendación:** Eliminar, los signals ya notifican cambios automáticamente

4. **setTimeout para Sincronización**
   ```typescript
   // ⚠️ PROBLEMA: Usa setTimeout para esperar efectos
   setTimeout(() => {
     const gruposAISD = this.aisdGroupsSignal();
     // Persistir...
   }, 50);
   ```
   - **Impacto:** Fragilidad, posibles race conditions
   - **Recomendación:** Usar `effect()` para persistencia reactiva

---

### 3. COMPONENTES DE VISTA

#### Sección 1 (`seccion1.component.ts`)

✅ **Correcto:**
- Extiende `BaseSectionComponent`
- Usa `OnPush` change detection
- Suscripción a `ReactiveStateAdapter.datos$` solo en modo vista

⚠️ **Mejorable:**
- Podría usar Signals directamente en lugar de RxJS

#### Sección 2 (`seccion2.component.ts`)

✅ **Excelente:**
- Usa Signals exclusivamente
- `effect()` para reactividad
- Commands específicos para cada acción
- No usa `obtenerDatos()`, solo signals

---

## 🎯 Recomendaciones Prioritarias

### 🔴 **CRÍTICO - Hacer Inmediatamente**

1. **Eliminar Persistencia Duplicada en Sección 2**
   - Remover todas las llamadas directas a `formularioService.actualizarDatos()`
   - Confiar solo en `FormChangeService.persistFields()` con `updateLegacy: true`

2. **Eliminar Código Legacy Duplicado en Sección 1**
   - Eliminar método `procesarJSON()` después de verificar que `createJSONProcessingBatch` cubre todos los casos

### 🟡 **IMPORTANTE - Hacer Pronto**

3. **Migrar Sección 1 a Signals**
   - Reemplazar `ReactiveStateAdapter.datos$` por signals del `ProjectStateFacade`
   - Usar `effect()` en lugar de `subscribe()`

4. **Eliminar ReactiveStateAdapter.setDatos() en Sección 2**
   - Los signals ya notifican cambios automáticamente
   - No es necesario llamar `setDatos()` manualmente

5. **Optimizar Persistencia con effect()**
   - Mover lógica de persistencia dentro de `effect()` para que sea reactiva
   - Eliminar `setTimeout` para sincronización

### 🟢 **MEJORA - Hacer Cuando Sea Posible**

6. **Usar Selectors Directos en Sección 1**
   - En lugar de `obtenerDatos()`, usar signals específicos
   - Mejorar reactividad y performance

7. **Documentar Patrones**
   - Crear guía de migración de RxJS a Signals
   - Documentar patrón de persistencia correcto

---

## 📊 Comparación con Arquitectura Ideal

| Principio Arquitectónico | Sección 1 | Sección 2 | Ideal |
|-------------------------|-----------|-----------|-------|
| **Signals para lectura** | ⚠️ Parcial | ✅ Completo | ✅ Solo Signals |
| **Commands para escritura** | ✅ Correcto | ✅ Correcto | ✅ Solo Commands |
| **Selectors puros** | ⚠️ Indirecto | ✅ Directo | ✅ Selectors directos |
| **Persistencia única** | ✅ Correcto | ⚠️ Duplicada | ✅ Una sola fuente |
| **Sin código legacy** | ⚠️ Presente | ⚠️ Presente | ✅ Sin legacy |
| **Reactividad Signals** | ⚠️ RxJS | ✅ Signals | ✅ Solo Signals |
| **Inmutabilidad** | ✅ Correcto | ✅ Correcto | ✅ Inmutable |

---

## ✅ Conclusión

**Sección 2 está mejor alineada con la arquitectura nueva:**
- ✅ Usa Signals exclusivamente
- ✅ Reactividad con `effect()`
- ✅ Commands específicos
- ⚠️ Necesita eliminar persistencia duplicada

**Sección 1 necesita migración:**
- ⚠️ Aún usa RxJS (`ReactiveStateAdapter`)
- ⚠️ Código legacy duplicado (`procesarJSON`)
- ⚠️ Lectura indirecta de estado

**Recomendación General:**
1. Priorizar eliminación de persistencia duplicada en Sección 2
2. Migrar Sección 1 a Signals siguiendo el patrón de Sección 2
3. Eliminar código legacy una vez verificada funcionalidad

---

## 📝 Checklist de Migración

- [ ] Eliminar `formularioService.actualizarDatos()` directo en Sección 2
- [ ] Eliminar `procesarJSON()` en Sección 1
- [ ] Migrar `ReactiveStateAdapter.datos$` a Signals en Sección 1
- [ ] Eliminar `ReactiveStateAdapter.setDatos()` en Sección 2
- [ ] Reemplazar `setTimeout` por `effect()` para persistencia
- [ ] Usar Selectors directos en lugar de `obtenerDatos()`
- [ ] Documentar patrón de persistencia correcto
