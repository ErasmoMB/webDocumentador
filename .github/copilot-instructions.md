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

## 🎯 **MODO IDEAL PARA SECCIONES (Importante)**

Cada sección DEBE cumplir con estos 5 requisitos para estar en MODO IDEAL:

1. ✅ **Signals Puros**: Usar `computed()` y `effect()` en lugar de RxJS subscriptions
2. ✅ **Form-wrapper Mínimo**: Heredar de `BaseSectionComponent`, delegar al componente principal
3. ✅ **Persistencia Limpia**: Usar `FormChangeService` directamente (sin `setTimeout`)
4. ✅ **No Legacy Data**: Nunca mezclar `obtenerDatos()` con Signals en viewModel
5. ✅ **Estándares**: Component extends `BaseSectionComponent`, sin manual subscriptions

**Si una sección NO cumple esto, REQUIERE REFACTORIZACIÓN antes de uso en producción.**

---

## Patrones de Las 4 Secciones (ACTUALIZADO 01/02/2026)

### ✅ Sección 1 - Ubicación del Proyecto (MODO IDEAL)
- **Form-wrapper**: [seccion1-form-wrapper.component.ts](../src/app/shared/components/forms/seccion1-form-wrapper.component.ts)
- **Component**: [seccion1.component.ts](../src/app/shared/components/seccion1/seccion1.component.ts)
- **Estado**: 🟢 **MODO IDEAL** ✅ (refactorizado 01/02/2026)
- **Signals**: ✅ `formDataSignal = computed()` → auto-sync con `effect()`
- **Persistencia**: ✅ Directa, sin setTimeout
- **Form-wrapper**: ✅ OK (extiende BaseSectionComponent)

### ✅ Sección 2 - Área de Influencia Social (MODO IDEAL)
- **Form-wrapper**: [seccion2-form-wrapper.component.ts](../src/app/shared/components/forms/seccion2-form-wrapper.component.ts)
- **Component**: [seccion2.component.ts](../src/app/shared/components/seccion2/seccion2.component.ts)
- **Estado**: 🟢 **MODO IDEAL** ✅ (refactorizado 01/02/2026)
- **Signals**: ✅ `groupsByType()` con `aisdGroups()` y `aisiGroups()`
- **Persistencia**: ✅ Limpia, sin setTimeout (removido 5+ calls)
- **Form-wrapper**: ✅ OK (extiende BaseSectionComponent)

### ✅ Sección 3 - Características Sociodemográficas (MODO IDEAL)
- **Form-wrapper**: [seccion3-form-wrapper.component.ts](../src/app/shared/components/forms/seccion3-form-wrapper.component.ts) ✅ **CREADO 01/02/2026**
- **Component**: [seccion3.component.ts](../src/app/shared/components/seccion3/seccion3.component.ts)
- **Estado**: 🟢 **MODO IDEAL** ✅
- **Signals**: ✅ `selectTableData()` para tabla entrevistados
- **Persistencia**: ✅ Limpia y directa
- **Form-wrapper**: ✅ NUEVO - patrón ideal (mínimo, delegación pura)

### ✅ Sección 4 - Análisis de Impactos (MODO IDEAL - REFERENCIA)
- **Form-wrapper**: [seccion4-form-wrapper.component.ts](src/app/shared/components/forms/seccion4-form-wrapper.component.ts)
- **Component**: [seccion4.component.ts](src/app/shared/components/seccion4/seccion4.component.ts)
- **Estado**: 🟢 **MODO IDEAL** ✅ (refactorizado 01/02/2026)
- **Signals**: ✅ Computed signal limpio, solo usa `sectionData`
- **Persistencia**: ✅ Directa sin legacy data
- **Form-wrapper**: ✅ **PATRÓN REFERENCIA** (29 líneas, mínimo perfecto)

### 📋 **Checklist - Verificación de MODO IDEAL (USO OBLIGATORIO)**

Al trabajar en cualquier sección o crear una nueva, verificar:

```
✅ ESTÁNDARES DE COMPONENTE
  [ ] ¿Extiende BaseSectionComponent?
  [ ] ¿@Input seccionId está declarado?
  [ ] ¿Implements OnDestroy?
  
✅ SIGNALS Y REACTIVIDAD
  [ ] ¿Usa Signal<T> = computed() para datos?
  [ ] ¿Usa effect() para auto-sync (si necesario)?
  [ ] ¿NO hay RxJS subscriptions manuales?
  [ ] ¿NO hay stateSubscription en ngOnDestroy?
  
✅ PERSISTENCIA
  [ ] ¿Usa FormChangeService.persistFields() directamente?
  [ ] ¿NO hay setTimeout para sync?
  [ ] ¿NO hay flags duplicados (updateLegacy, updateState)?
  [ ] ¿Persistent es automática (no manual)?
  
✅ VIEWMODEL (si aplica)
  [ ] ¿ViewModel es Signal<T> = computed()?
  [ ] ¿Nunca mezcla obtenerDatos() con sectionData?
  [ ] ¿Solo usa sectionData o selectField()?
  
✅ FORM-WRAPPER
  [ ] ¿Existe form-wrapper.component.ts?
  [ ] ¿Extiende BaseSectionComponent?
  [ ] ¿Template inline delega: <app-seccion [modoFormulario]="true">?
  [ ] ¿Mínimo (30 líneas máximo)?
  [ ] ¿No contiene lógica, solo delegación?

🔴 SI ALGUNO ES "NO" → REQUIERE REFACTORIZACIÓN ANTES DE USAR
```

---

## Ejemplo de Form-Wrapper en MODO IDEAL

```typescript
// seccion4-form-wrapper.component.ts - 29 líneas (REFERENCIA)
import { Component, Input, OnInit, OnDestroy, ChangeDetectorRef, Injector } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CoreSharedModule } from '../../modules/core-shared.module';
import { Seccion4FormComponent } from '../seccion4/seccion4-form.component';
import { BaseSectionComponent } from '../base-section.component';

@Component({
    imports: [CommonModule, FormsModule, CoreSharedModule, Seccion4FormComponent],
    selector: 'app-seccion4-form-wrapper',
    template: `<app-seccion4-form [seccionId]="seccionId" [modoFormulario]="true"></app-seccion4-form>`,
    styles: [`:host { display: block; width: 100%; }`]
})
export class Seccion4FormWrapperComponent extends BaseSectionComponent implements OnInit, OnDestroy {
  @Input() override seccionId: string = '3.1.4.A.1';

  constructor(cdRef: ChangeDetectorRef, injector: Injector) {
    super(cdRef, injector);
  }

  protected override onInitCustom(): void { }
  protected override detectarCambios(): boolean { return false; }
  protected override actualizarValoresConPrefijo(): void { }
}
```

✅ **Características clave:**
- Mínimo: 29 líneas
- Delegación pura: Solo pasa props y modo formulario
- Extiende BaseSectionComponent: Hereda DI y ciclo de vida
- Template inline: No archivos HTML adicionales
- Styles inline: Mínimos (solo display/width)

## Build y Testing
- Instala dependencias: `npm install`
- Desarrollo: `npm start`
- Tests unitarios: `npm test`
- Build producción: `npm run build`
- Coverage: `npm run test:coverage`
- E2E: `npm run cypress:run`

---

## 🚨 **REGLA DE ORO: MODO IDEAL ES OBLIGATORIO**

**ANTES de cualquier cambio en una sección:**

1. **VERIFICAR**: ¿Está la sección en MODO IDEAL?
   - Si SÍ → Procede seguro, el código es reutilizable ✅
   - Si NO → REFACTORIZA PRIMERO, luego procede 🔧

2. **SI CREAS NUEVA SECCIÓN**: 
   - Sigue el patrón de S4 (form-wrapper mínimo)
   - Usa Signals puros desde día 1
   - Sin RxJS subscriptions manuales
   - Persistencia directa con FormChangeService

3. **SI REFACTORIZAS CÓDIGO**:
   - Ejecuta el checklist completo (ver arriba)
   - Marca cada item como ✅
   - Compila sin errores: `npm start`
   - Prueba en navegador antes de commit

4. **SI ENCUENTRAS CÓDIGO NO-IDEAL**:
   - Reporta el issue
   - Refactoriza ANTES de reutilizar
   - Documenta el cambio en `docs/REFACTORIZACION_CRITICA.md`

---

Consulta `docs/REFACTORIZACION_CRITICA.md` para detalles de cambios implementados en las 4 secciones.

Consulta los archivos en `docs/` para detalles avanzados. Si un patrón no está documentado aquí, sigue la arquitectura de estado inmutable y separación UI/Store.
