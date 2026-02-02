# ✅ CHECKLIST MODO IDEAL - SECCIÓN 7 (Verificación 01/02/2026)

## 📋 **ESTÁNDARES DE COMPONENTE**

### Form Component (`seccion7-form.component.ts`)
- [x] ¿Extiende `BaseSectionComponent`? **SÍ** ✅
  - Línea 24: `export class Seccion7FormComponent extends BaseSectionComponent`

- [x] ¿`@Input seccionId` está declarado? **SÍ** ✅
  - Línea 25: `@Input() override seccionId: string = '3.1.7';`

- [x] ¿Implements `OnDestroy`? **SÍ** ✅
  - Línea 24: `implements OnDestroy`

### View Component (`seccion7-view-internal.component.ts`)
- [x] ¿Extiende `BaseSectionComponent`? **SÍ** ✅
- [x] ¿`@Input seccionId` está declarado? **SÍ** ✅
- [x] ¿Implements `OnDestroy`? **SÍ** ✅

### Form-Wrapper Component (`seccion7-form-wrapper.component.ts`)
- [x] ¿Existe form-wrapper.component.ts? **SÍ** ✅
- [x] ¿Extiende `BaseSectionComponent`? **SÍ** ✅
- [x] ¿Tamaño mínimo (30 líneas máximo)? **SÍ** ✅ (28 líneas)
- [x] ¿No contiene lógica, solo delegación? **SÍ** ✅

---

## ⚡ **SIGNALS Y REACTIVIDAD**

### Signals Definidos
- [x] `formDataSignal` = `computed(() => projectFacade.selectSectionFields(...))`  **✅**
- [x] `petTablaSignal` = `computed(...)` con datos iniciales  **✅**
- [x] `peaTablaSignal` = `computed(...)` con datos iniciales  **✅**
- [x] `peaOcupadaTablaSignal` = `computed(...)` con datos iniciales  **✅**
- [x] `photoFieldsHash` = `computed(...)` para fotos  **✅**

### Effects (Sin subscriptions manuales)
- [x] ¿Usa `effect()` para auto-sync? **SÍ** ✅
  - Effect 1: Sincronizar `formData` → `this.datos`
  - Effect 2: Sincronizar tabla PET
  - Effect 3: Sincronizar tabla PEA
  - Effect 4: Sincronizar tabla PEA Ocupada
  - Effect 5: Sincronizar fotos

- [x] ¿NO hay RxJS subscriptions manuales? **SÍ** ✅
  - No se encontraron `.subscribe()` en el componente

- [x] ¿NO hay `stateSubscription` en `ngOnDestroy`? **SÍ** ✅
  - `ngOnDestroy()` está limpio

---

## 💾 **PERSISTENCIA**

### Persistencia de Tablas
- [x] ¿Persiste con `projectFacade.setField()`? **SÍ** ✅
  - `calcularPorcentajesPET()`: Línea ~409 → `projectFacade.setField()`
  - `calcularPorcentajesPEA()`: Línea ~459 → `projectFacade.setField()`
  - `calcularPorcentajesPEAOcupada()`: Línea ~509 → `projectFacade.setField()`

- [x] ¿NO hay `setTimeout` para sync? **SÍ** ✅
  - No se usan `setTimeout` para sincronización

- [x] ¿NO hay flags duplicados (updateLegacy, updateState)? **SÍ** ✅
  - Sin flags duplicados

- [x] ¿Persistencia es automática (no manual)? **SÍ** ✅
  - Effects se disparan automáticamente
  - Cambios de tabla se persisten vía `onTabla*Actualizada()` → `projectFacade.setField()`

### Persistencia de Campos Editables
- [x] ¿Usa `onFieldChange()` para campos manuales? **SÍ** ✅
  - Títulos: `(ngModelChange)="onFieldChange('cuadroTituloPET', $event)"`
  - Fuentes: `(ngModelChange)="onFieldChange('cuadroFuentePET', $event)"`
  - Párrafos: `(valueChange)="onFieldChange(...)"`

---

## 🎯 **REACTIVIDAD DE TABLAS (MODO IDEAL)**

### Estructura Fija
- [x] ¿Categorías NO editables? **SÍ** ✅
  - Configuración: `{ field: 'categoria', readonly: true }`

- [x] ¿Filas de Total NO editables? **SÍ** ✅
  - Template dinámico respeta filas con "Total" en categoria

- [x] ¿Porcentajes calculados dinámicamente (readonly)? **SÍ** ✅
  - PET: `porcentaje` readonly
  - PEA: `porcentajeHombres`, `porcentajeMujeres`, `porcentaje` readonly
  - PEA Ocupada: `porcentajeHombres`, `porcentajeMujeres`, `porcentaje` readonly

- [x] ¿Campos editables claramente definidos? **SÍ** ✅
  - PET: solo `casos` editable
  - PEA: `hombres` y `mujeres` editables, `casos` auto-calculado
  - PEA Ocupada: `hombres` y `mujeres` editables, `casos` auto-calculado

### Botones de Tabla
- [x] ¿Botones "Agregar fila" ocultos? **SÍ** ✅
  - `[showAddButton]="false"` en todas las 3 tablas

- [x] ¿Botones "Eliminar fila" ocultos? **SÍ** ✅
  - `[showDeleteButton]="false"` en todas las 3 tablas

---

## 🔄 **SINCRONIZACIÓN FORM-VIEW**

### Flujo de Datos
```
Usuario edita tabla en FORM
    ↓
onTabla*Actualizada() se dispara
    ↓
persistir cambios: projectFacade.setField()
    ↓
calcularPorcentajes*() recalcula
    ↓
ProjectState actualiza
    ↓
Signals detectan cambio (computed)
    ↓
Effects se disparan automáticamente
    ↓
VIEW se actualiza sin intervención manual
```

- [x] ¿Form y View comparten el mismo `formDataSignal`? **SÍ** ✅
  - Ambos leen: `this.projectFacade.selectSectionFields(this.seccionId, null)()`

- [x] ¿Cambios en tabla form se reflejan en view? **SÍ** ✅
  - Via Effects y Signals compartidos

- [x] ¿Sin props duplicadas entre componentes? **SÍ** ✅

---

## 📸 **FOTOS (MODO IDEAL)**

- [x] ¿Usa `Signal` para fotos? **SÍ** ✅
  - `photoFieldsHash`: Trigger para recargar

- [x] ¿Effect sincroniza fotos automáticamente? **SÍ** ✅

---

## ✨ **RESUMEN FINAL**

| Categoría | Estado | Detalles |
|-----------|--------|----------|
| **Estructura de Componente** | ✅ 100% | Form, View, Form-wrapper en MODO IDEAL |
| **Signals y Reactividad** | ✅ 100% | Todos `computed()`, sin subscriptions manuales |
| **Persistencia** | ✅ 100% | `projectFacade.setField()`, sin `setTimeout` |
| **Tablas (Estructura Fija)** | ✅ 100% | Categorías/Porcentajes readonly, botones ocultos |
| **Sincronización Form-View** | ✅ 100% | Automática via Signals compartidos |
| **Fotos** | ✅ 100% | Sincronización automática con Effects |

---

## 🎯 **VEREDICTO: ✅ MODO IDEAL COMPLETO**

**La Sección 7 cumple 100% con el patrón MODO IDEAL:**

✅ Componentes siguen estándares (extends `BaseSectionComponent`)
✅ Signals puros sin RxJS subscriptions manuales
✅ Persistencia limpia y automática
✅ Sincronización form-view reactiva
✅ Tablas con estructura fija (categorías/porcentajes no editables)
✅ Sin legacy data innecesaria
✅ Form-wrapper mínimo (28 líneas, solo delegación)

**La sección está 100% lista para producción** 🚀
