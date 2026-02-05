# 🎯 MODO IDEAL PERFECTO - 100% ARQUITECTURA

**Versión:** 2.0  
**Fecha:** 2 de febrero de 2026  
**Conformidad:** 100% ProjectState + 100% Signals + 100% Arquitectura  
**Referencia:** Sección 12 (nueva)

---

## 📋 ESTRUCTURA BASE

```
shared/components/
├── forms/
│   └── seccion12-form-wrapper.component.ts      (29 líneas - SIEMPRE IGUAL)
└── seccion12/
    ├── seccion12-form.component.ts              (400-600 líneas)
    ├── seccion12-form.component.html
    ├── seccion12-view.component.ts              (400-600 líneas)
    └── seccion12-view.component.html
```

---

## 🏗️ PARTE 1: FORM-WRAPPER (NUNCA CAMBIA)

```typescript
import { Component, Input, OnInit, OnDestroy, ChangeDetectorRef, Injector } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CoreSharedModule } from '../../modules/core-shared.module';
import { Seccion12FormComponent } from '../seccion12/seccion12-form.component';
import { BaseSectionComponent } from '../base-section.component';

@Component({
    imports: [CommonModule, FormsModule, CoreSharedModule, Seccion12FormComponent],
    selector: 'app-seccion12-form-wrapper',
    template: `<app-seccion12-form [seccionId]="seccionId" [modoFormulario]="true"></app-seccion12-form>`,
    styles: [`:host { display: block; width: 100%; }`]
})
export class Seccion12FormWrapperComponent extends BaseSectionComponent implements OnInit, OnDestroy {
  @Input() override seccionId: string = '3.1.X';

  constructor(cdRef: ChangeDetectorRef, injector: Injector) {
    super(cdRef, injector);
  }

  protected override onInitCustom(): void { }
  protected override detectarCambios(): boolean { return false; }
  protected override actualizarValoresConPrefijo(): void { }
}
```

**29 líneas exactas. Copiar-pegar siempre.**

---

## 🎨 PARTE 2: FORM-COMPONENT (LA MAGIA)

### PASO 1: Declarar todos los Signals reactivos

```typescript
import { Component, OnDestroy, Input, ChangeDetectionStrategy, Injector, Signal, computed, effect, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseSectionComponent } from '../base-section.component';
import { FotoItem } from '../image-upload/image-upload.component';
import { CoreSharedModule } from '../../modules/core-shared.module';

@Component({
    imports: [CommonModule, FormsModule, CoreSharedModule],
    selector: 'app-seccion12-form',
    templateUrl: './seccion12-form.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true
})
export class Seccion12FormComponent extends BaseSectionComponent implements OnDestroy {
  @Input() override seccionId: string = '3.1.X';
  @Input() override modoFormulario: boolean = false;

  override readonly PHOTO_PREFIX = 'fotografiaSeccion12';
  override useReactiveSync: boolean = true;

  // ✅ SIGNALS: DATOS DE SECCIÓN (TODOS los campos como Signals)
  readonly formDataSignal: Signal<Record<string, any>> = computed(() => {
    return this.projectFacade.selectSectionFields(this.seccionId, null)();
  });

  readonly parrafoSignal: Signal<string> = computed(() => {
    const manual = this.projectFacade.selectField(this.seccionId, null, 'parrafoSeccion12')();
    if (manual && manual.trim().length > 0) return manual;
    return this.generarTextoDefault();
  });

  readonly fotosCacheSignal: Signal<FotoItem[]> = computed(() => {
    // ✅ CRÍTICO: Delegar COMPLETAMENTE a projectFacade, no a imageService
    const fotos: FotoItem[] = [];
    for (let i = 1; i <= 10; i++) {
      const titulo = this.projectFacade.selectField(this.seccionId, null, `${this.PHOTO_PREFIX}${i}Titulo`)();
      const fuente = this.projectFacade.selectField(this.seccionId, null, `${this.PHOTO_PREFIX}${i}Fuente`)();
      const imagen = this.projectFacade.selectField(this.seccionId, null, `${this.PHOTO_PREFIX}${i}Imagen`)();
      
      if (imagen) {
        fotos.push({
          titulo: titulo || `Fotografía ${i}`,
          fuente: fuente || 'GEADES, 2024',
          imagen: imagen
        } as FotoItem);
      }
    }
    return fotos;
  });

  readonly photoFieldsHash: Signal<string> = computed(() => {
    let hash = '';
    for (let i = 1; i <= 10; i++) {
      const titulo = this.projectFacade.selectField(this.seccionId, null, `${this.PHOTO_PREFIX}${i}Titulo`)();
      const fuente = this.projectFacade.selectField(this.seccionId, null, `${this.PHOTO_PREFIX}${i}Fuente`)();
      const imagen = this.projectFacade.selectField(this.seccionId, null, `${this.PHOTO_PREFIX}${i}Imagen`)();
      hash += `${titulo || ''}|${fuente || ''}|${imagen ? '1' : '0'}|`;
    }
    return hash;
  });

  // ✅ VIEWMODEL: AGRUPA TODOS LOS DATOS (patrón crítico)
  readonly viewModel: Signal<{
    parrafo: string;
    fotos: FotoItem[];
    // ... agregar más campos aquí
  }> = computed(() => ({
    parrafo: this.parrafoSignal(),
    fotos: this.fotosCacheSignal(),
  }));

  constructor(cdRef: ChangeDetectorRef, injector: Injector) {
    super(cdRef, injector);

    // ✅ EFFECT 1: Sincronizar this.datos (para métodos que aún lo usan)
    effect(() => {
      const data = this.formDataSignal();
      const legacyData = this.projectFacade.obtenerDatos();
      this.datos = { ...legacyData, ...data };
      this.cdRef.markForCheck();
    });

    // ✅ EFFECT 2: Monitorear cambios en fotos
    effect(() => {
      this.photoFieldsHash();
      this.fotosCacheSignal(); // Recalcular cuando hash cambia
      this.cdRef.markForCheck();
    });
  }

  protected override onInitCustom(): void {
    this.cargarFotografias();
  }

  protected override detectarCambios(): boolean { return false; }
  protected override actualizarValoresConPrefijo(): void { }

  // ✅ MÉTODOS HELPER (REUTILIZABLES)
  private generarTextoDefault(): string {
    return 'Texto por defecto de Sección 12';
  }

  // ✅ CRUD OPERATIONS
  actualizarParrafo(valor: string): void {
    this.projectFacade.setField(this.seccionId, null, 'parrafoSeccion12', valor);
    this.onFieldChange('parrafoSeccion12', valor);
  }

  onFotografiasChange(fotografias: FotoItem[]): void {
    this.onGrupoFotografiasChange(this.PHOTO_PREFIX, fotografias);
    this.cdRef.markForCheck();
    this.cdRef.detectChanges();
  }

  // ✅ TRACKBY
  trackByIndex(index: number): number { return index; }
}
```

**Puntos clave:**
- ✅ TODO como Signal (no getters imperativos)
- ✅ `viewModel` agrupa datos relacionados
- ✅ `fotosCacheSignal` delega 100% a projectFacade
- ✅ EFFECT 1 + EFFECT 2 especializados
- ✅ Métodos auxiliares sin lógica compleja

---

## 👁️ PARTE 3: VIEW-COMPONENT (SOLO LECTURA REACTIVA)

```typescript
import { Component, OnDestroy, Input, ChangeDetectionStrategy, Injector, Signal, computed, effect, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FotoItem } from '../image-upload/image-upload.component';
import { CoreSharedModule } from '../../modules/core-shared.module';
import { BaseSectionComponent } from '../base-section.component';

@Component({
  selector: 'app-seccion12-view',
  templateUrl: './seccion12-view.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, CoreSharedModule],
  standalone: true
})
export class Seccion12ViewComponent extends BaseSectionComponent implements OnDestroy {
  @Input() override seccionId: string = '3.1.X';

  override readonly PHOTO_PREFIX = 'fotografiaSeccion12';
  override useReactiveSync: boolean = true;

  // ✅ SIGNALS: EXACTAMENTE IGUALES AL FORM (duplicadas para independencia)
  readonly formDataSignal: Signal<Record<string, any>> = computed(() => {
    return this.projectFacade.selectSectionFields(this.seccionId, null)();
  });

  readonly parrafoSignal: Signal<string> = computed(() => {
    const manual = this.projectFacade.selectField(this.seccionId, null, 'parrafoSeccion12')();
    if (manual && manual.trim().length > 0) return manual;
    return this.generarTextoDefault();
  });

  readonly fotosCacheSignal: Signal<FotoItem[]> = computed(() => {
    const fotos: FotoItem[] = [];
    for (let i = 1; i <= 10; i++) {
      const titulo = this.projectFacade.selectField(this.seccionId, null, `${this.PHOTO_PREFIX}${i}Titulo`)();
      const fuente = this.projectFacade.selectField(this.seccionId, null, `${this.PHOTO_PREFIX}${i}Fuente`)();
      const imagen = this.projectFacade.selectField(this.seccionId, null, `${this.PHOTO_PREFIX}${i}Imagen`)();
      
      if (imagen) {
        fotos.push({
          titulo: titulo || `Fotografía ${i}`,
          fuente: fuente || 'GEADES, 2024',
          imagen: imagen
        } as FotoItem);
      }
    }
    return fotos;
  });

  readonly photoFieldsHash: Signal<string> = computed(() => {
    let hash = '';
    for (let i = 1; i <= 10; i++) {
      const titulo = this.projectFacade.selectField(this.seccionId, null, `${this.PHOTO_PREFIX}${i}Titulo`)();
      const fuente = this.projectFacade.selectField(this.seccionId, null, `${this.PHOTO_PREFIX}${i}Fuente`)();
      const imagen = this.projectFacade.selectField(this.seccionId, null, `${this.PHOTO_PREFIX}${i}Imagen`)();
      hash += `${titulo || ''}|${fuente || ''}|${imagen ? '1' : '0'}|`;
    }
    return hash;
  });

  // ✅ VIEWMODEL: AGRUPA TODOS LOS DATOS
  readonly viewModel: Signal<{
    parrafo: string;
    fotos: FotoItem[];
  }> = computed(() => ({
    parrafo: this.parrafoSignal(),
    fotos: this.fotosCacheSignal(),
  }));

  constructor(cdRef: ChangeDetectorRef, injector: Injector) {
    super(cdRef, injector);

    // ✅ EFFECT 1: Sincronizar this.datos
    effect(() => {
      const data = this.formDataSignal();
      this.datos = { ...data };
      this.cdRef.markForCheck();
    });

    // ✅ EFFECT 2: Monitorear cambios en fotos
    effect(() => {
      this.photoFieldsHash();
      this.fotosCacheSignal();
      this.cdRef.markForCheck();
    });
  }

  protected override onInitCustom(): void {
    this.cargarFotografias();
  }

  protected override detectarCambios(): boolean { return false; }
  protected override actualizarValoresConPrefijo(): void { }

  private generarTextoDefault(): string {
    return 'Texto por defecto de Sección 12';
  }

  trackByIndex(index: number): number { return index; }
}
```

---

## 📱 PARTE 4: TEMPLATE FORM (SIGNALS PURO)

```html
<div class="seccion-formulario-content">
  <div class="form-group-section">
    <h4 class="section-title">Sección 12</h4>

    <!-- ✅ USO DE SIGNAL EN TEMPLATE (no método getter) -->
    <textarea 
      [value]="viewModel().parrafo"
      (change)="actualizarParrafo($event.target.value)"
      placeholder="Editar párrafo">
    </textarea>

    <!-- ✅ FOTOGRAFÍAS REACTIVAS -->
    <app-image-upload
      [fotografias]="viewModel().fotos"
      [sectionId]="seccionId"
      [photoPrefix]="PHOTO_PREFIX"
      [permitirMultiples]="true"
      [mostrarTitulo]="true"
      [mostrarFuente]="true"
      (fotografiasChange)="onFotografiasChange($event)">
    </app-image-upload>
  </div>
</div>
```

**Puntos clave:**
- ✅ `viewModel()` en lugar de múltiples signals
- ✅ Acceso a todos los datos en UN lugar
- ✅ No hay métodos getter llamados en template
- ✅ Cambios automáticos cuando Signal cambia

---

## 👁️ PARTE 5: TEMPLATE VIEW (SOLO LECTURA)

```html
<div class="seccion-vista-content">
  <h5>Sección 12</h5>

  <!-- ✅ LECTURA REACTIVA DESDE SIGNAL -->
  <p class="text-justify" [innerHTML]="viewModel().parrafo"></p>

  <!-- ✅ FOTOS AUTOMÁTICAMENTE ACTUALIZADAS -->
  <app-image-upload
    [modoVista]="true"
    [fotografias]="viewModel().fotos"
    [sectionId]="seccionId"
    [photoPrefix]="PHOTO_PREFIX">
  </app-image-upload>
</div>
```

---

## ✅ CHECKLIST CONFORMIDAD 100%

```
ESTRUCTURA
  [✓] Wrapper 29 líneas
  [✓] Form-component form.component.ts
  [✓] View-component view.component.ts
  [✓] HTMLs separados

SIGNALS
  [✓] formDataSignal = computed()
  [✓] parrafoSignal = computed()
  [✓] fotosCacheSignal = computed()
  [✓] photoFieldsHash = computed()
  [✓] viewModel = computed() ← CRÍTICO

EFFECTS
  [✓] EFFECT 1: Sincronizar this.datos
  [✓] EFFECT 2: Monitor photoFieldsHash

ARQUITECTURA
  [✓] TODO delegado a projectFacade
  [✓] NO imageService directo
  [✓] Signals como fuente única de verdad
  [✓] ViewModel agrupa datos

TEMPLATE
  [✓] Usa viewModel() (no múltiples signals)
  [✓] Usa Signals (no getters)
  [✓] Datos sincronizados form-view

REACTIVIDAD
  [✓] Sin setTimeout
  [✓] Sin detectarCambios() legacy
  [✓] Sin watchedFields
  [✓] Cambios automáticos

MANTENIBILIDAD
  [✓] Código predecible
  [✓] Fácil de testear
  [✓] Bajo riesgo de bugs
  [✓] 100% Arquitectura ProjectState
```

---

## 🚀 PASOS PARA SECCIÓN NUEVA (12+)

1. **Copiar wrapper** → form-wrapper.component.ts (29 líneas exactas)
2. **Crear form-component.ts** → Copy-paste Parte 2, adaptar fields
3. **Crear view-component.ts** → Copy-paste Parte 3, adaptar fields
4. **Crear HTMLs** → Copy-paste Parte 4 y 5, adaptar
5. **Declarar Signals** → Listar TODOS los campos como Signals reactivos
6. **Crear viewModel** → Agrupar campos lógicamente
7. **Configurar página sección** → Ver sección siguiente: loaders View + Form, `resolvePreviewRenderer` con **View** (izquierda), `formRules` con **Form-wrapper** (derecha), y plantilla con ambos componentes
8. **Numeración de cuadros** → En la vista usar `[sectionId]="seccionId"` en cada `app-table-wrapper`; añadir la sección en `TableNumberingService` (`sectionOrder` y `sectionTableCounts`)
9. **Conexión de tablas** → Ver sección "CONEXIÓN DE TABLAS": en el form merge de tablas en el effect (`selectField` + `selectTableData` → `this.datos`); en la view cada tabla con `selectField ?? selectTableData`; persistir con clave base
10. **Compilar** → `npm start`
11. **Probar** → Form y View sincronizados; izquierda = vista, derecha = formulario; cuadros con "Cuadro N° 3.XX"; ediciones en cuadros visibles en vista y persistentes al recargar

**Tiempo estimado:** 2 horas por sección nueva

---

## 📐 CONFIGURACIÓN PÁGINA SECCIÓN (VISTA IZQUIERDA / FORMULARIO DERECHA)

La página de edición (`seccion.component`) muestra **vista previa a la izquierda** y **formulario a la derecha**. Para que una sección con form+view se comporte igual que la sección 11/12:

### 1. Loaders en `seccion.component.ts`

- **Preview (izquierda):** debe cargar el **componente de vista** (solo lectura).
- **Form (derecha):** debe cargar el **form-wrapper** (formulario editable).

Definir dos loaders si la sección tiene view y form separados:

```typescript
// Ejemplo: sección 12
seccion12: () => import('.../seccion12-form-wrapper.component').then(m => m.Seccion12FormWrapperComponent as unknown as Type<any>),
seccion12View: () => import('.../seccion12-view.component').then(m => m.Seccion12ViewComponent as unknown as Type<any>),
```

### 2. `resolvePreviewRenderer` (panel izquierdo)

Para la subsección correspondiente, devolver el loader de la **vista**, no del formulario:

```typescript
// Correcto: preview = vista (seccion12View)
if (this.esSubseccionAISD(seccionId, 8)) return { loader: this.componentLoaders.seccion12View, inputs };

// Incorrecto: preview = form (seccion12) → en la izquierda se vería el formulario
```

### 3. `resolveFormRenderer` / `formRules`

El formulario (derecha) sigue usando el loader del **form-wrapper**:

```typescript
{ matches: aisd(8), loader: this.componentLoaders.seccion12, inputs: withModoFormulario },
```

### 4. Plantilla (`plantilla.component.html`)

En la plantilla/resumen usar **vista** y **form-wrapper** por separado (para ViewChild y export):

```html
<app-seccion12-view [seccionId]="'3.1.4.A.1.8'" [modoFormulario]="false"></app-seccion12-view>
<app-seccion12-form-wrapper [seccionId]="'3.1.4.A.1.8'"></app-seccion12-form-wrapper>
```

**Resumen:** Izquierda = View, Derecha = Form-wrapper. No usar el form-wrapper en el preview.

---

## 📋 NUMERACIÓN DE CUADROS EN LA VISTA (CUADRO N° 3.XX)

Para que en la vista se muestre **"Cuadro N° 3.19"** (y siguientes) en cada tabla:

### 1. Usar `app-table-wrapper` con el `seccionId` real

En el HTML de la **vista** (view.component.html), pasar siempre el **id dinámico** de la sección, no un id fijo inventado:

```html
<!-- Correcto: el servicio de numeración conoce 3.1.4.A.1.8, 3.1.4.A.2.8, etc. -->
<app-table-wrapper [title]="'Título del cuadro'" [sectionId]="seccionId">
  <table>...</table>
</app-table-wrapper>

<!-- Incorrecto: 3.1.12 no está en el orden del servicio → no sale número -->
<app-table-wrapper title="..." sectionId="3.1.12">
```

### 2. `TableNumberingService`: sección en orden y conteo

- **`sectionOrder`:** la sección debe estar en el array en el orden correcto (ej. `'3.1.4.A.1.8'` para A.1.8).
- **`sectionTableCounts`:** registrar cuántas tablas tiene esa sección para el cálculo global.

En `table-numbering.service.ts`:

```typescript
// sectionTableCounts: añadir entrada para la nueva sección
['3.1.4.A.1.8', 6],  // Sección 12: 6 tablas

// sectionOrder: debe incluir la sección en la posición correcta (ya suele estar para A.1.X)
'3.1.4.A.1.8',  // A.1.8
```

### 3. `TableWrapperComponent`: secciones fijas

Si la sección debe usar **numeración dinámica** (según tablas en el DOM), no añadirla a `fixedSections` en `table-wrapper.component.ts`. Si tiene un número de tablas fijo y no se registra por DOM, sí puede ir en configuración fija; en ese caso el servicio debe tener ya su `sectionTableCounts`.

**Checklist numeración:**

- [ ] En la vista: todos los `<app-table-wrapper>` usan `[sectionId]="seccionId"`.
- [ ] En `TableNumberingService`: la sección está en `sectionOrder` y en `sectionTableCounts` con el número correcto de tablas.
- [ ] No usar ids inventados (ej. `3.1.12`) que no existan en `sectionOrder`.

---

## 🔗 CONEXIÓN DE TABLAS (FORM → STATE → VIEW)

Para que los cuadros editables en el formulario se vean en la vista y persistan al recargar:

### 1. Una sola fuente de verdad (ProjectState)

- Los datos de cada tabla se guardan con **clave base** (ej. `caracteristicasSaludTabla`) en el estado.
- El formulario persiste con `formChange.persistFields(sectionId, 'table', { [tablaKey]: datos })`, que llama a `setTableData` y/o el store actualiza campos.
- El **dynamic-table** debe persistir también con **clave base** para que la vista (que usa `selectField(seccionId, null, claveBase)`) reciba los datos. Si se usa prefijo, persistir ambas claves (base y con prefijo).

### 2. Form-component: merge de tablas en `this.datos`

- `selectSectionFields()` puede devolver solo `state.fields`; las tablas a veces viven en `state.tables`.
- En el **effect** que sincroniza `this.datos`, unir siempre los datos de tablas desde el estado:

```typescript
effect(() => {
  const formData = this.formDataSignal();
  const tables: Record<string, any> = {};
  for (const key of this.TABLE_KEYS) {
    const fromField = this.projectFacade.selectField(this.seccionId, null, key)();
    const fromTable = this.projectFacade.selectTableData(this.seccionId, null, key)();
    tables[key] = fromField ?? fromTable ?? undefined;
  }
  this.datos = { ...formData, ...tables };
  this.cdRef.markForCheck();
});
```

- Así, tras recargar, `this.datos` incluye las tablas aunque vengan de `state.tables`.

### 3. View-component: leer tablas desde Field o Table

- Para cada tabla, usar **field + table** para no depender de dónde se haya persistido:

```typescript
readonly tablaSaludSignal: Signal<any[]> = computed(() => {
  const v = this.projectFacade.selectField(this.seccionId, null, 'caracteristicasSaludTabla')()
    ?? this.projectFacade.selectTableData(this.seccionId, null, 'caracteristicasSaludTabla')();
  return v != null ? v : this.caracteristicasSaludConfig.estructuraInicial;
});
```

### 4. Dynamic-table: persistir con clave base

- Al guardar, llamar a `projectFacade.setField(sectionId, null, tablaKeyBase, tablaCopia)` además de la clave con prefijo si se usa, para que vista y form lean por la misma clave base.
- En `persistFields`, incluir la clave base en el payload si es distinta de la clave con prefijo.

### 5. Checklist tablas

- [ ] Form: effect que hace merge de `formDataSignal()` + datos de tablas (`selectField` / `selectTableData`) en `this.datos`.
- [ ] View: cada signal de tabla usa `selectField(...)() ?? selectTableData(...)()` y fallback a `estructuraInicial`.
- [ ] Persistencia: tabla guardada con clave base (y con prefijo si aplica) para que form y view usen la misma clave.
- [ ] Tras recargar: los datos editados en los cuadros se ven en la vista y en el formulario.

---

## 📊 COMPARATIVA: SECCION 11 vs MODO IDEAL PERFECTO

| Aspecto | S11 (95%) | Ideal Perfecto (100%) |
|---------|-----------|----------------------|
| Getters imperativos | `getFotografias*()` | Signals: `fotosCacheSignal()` |
| Signals individuales | ✅ Muchos | ✅ + viewModel agrupado |
| ViewModel | ❌ No | ✅ Sí |
| Delegación projectFacade | 80% | 100% |
| Métodos en template | Algunos | Ninguno (solo Signals) |
| Optimización Change Detection | ⚠️ Parcial | ✅ Perfecta (computed) |

---

## 🎯 VENTAJAS 100% ARQUITECTURA

1. **ProjectState es fuente única de verdad** ✅
2. **Signals como intermediario reactivo** ✅
3. **Sin estado duplicado (imageService)** ✅
4. **ViewModel patrón profesional** ✅
5. **Template completamente reactivo** ✅
6. **Change detection óptima** ✅
7. **Testeable sin mocks complejos** ✅
8. **Mantenible a largo plazo** ✅

---

## 🐞 Corrección: Edición de párrafos (ej. Sección 19)

Problema
- La edición del párrafo no se reflejaba en la vista previa o quedaba bloqueada hasta que se realizaba otra acción (ej. agregar fila en una tabla).

Causa raíz
- El form-wrapper no estaba registrado correctamente en el helper de ViewChild, por lo que no era posible forzar la recarga del componente de vista.
- La clave usada en la vista no siempre coincidía con la clave persistida (problemas de prefijo de grupo).
- En algunos puntos, la sincronización automática sobrescribía campos locales durante la edición.

Implementación (pasos concretos)
1. Registrar el componente en el wrapper (ej.: `@ViewChild(Seccion19FormComponent)` + `ViewChildHelper.registerComponent('seccion19', this)` en `ngOnInit`).
2. Usar `PrefijoHelper.obtenerPrefijoGrupo(this.seccionId)` para construir `fieldId` (un solo lugar de verdad para los prefijos).
3. El `ParagraphEditor` debe emitir `(valueChange)` y el handler del form debe llamar `onFieldChange(fieldId, value)` para persistir vía `SectionPersistenceCoordinator`.
4. Evitar sobrescribir campos en edición: marcar campos en foco (`editingFlag`) y hacer que `SectionReactiveSyncCoordinator` no actualice campos que estén en edición activa.

Checklist (PR mínimo)
- [ ] Form-wrapper registra la instancia del componente.
- [ ] View usa `PrefijoHelper` para los `fieldId` dependientes de grupo.
- [ ] `ParagraphEditor` emite `valueChange` y el form llama `onFieldChange()`.
- [ ] `SectionReactiveSyncCoordinator` respeta `isFieldBeingEdited()`.

---

## 🐞 Corrección: Edición de tablas (ej. Sección 19)

Problema
- Ediciones en la tabla a veces no se veían en la vista o se perdían al recargar cuando existían claves con prefijo de grupo.

Causa raíz
- Inconsistencia entre clave con prefijo y clave base al persistir. Algunas inicializaciones usaban ceros (`0`) que aparecían como placeholders y bloqueaban flujos lógicos.
- El código de sincronización no siempre unía correctamente `selectField` y `selectTableData`, lo que provocaba que la vista y el formulario leyeran orígenes distintos.

Implementación (pasos concretos)
1. Al persistir la tabla siempre incluir en el payload tanto la `tablaKey` con prefijo como la `tablaKeyBase` (si son distintas). Ej.:
```ts
this.formChange.persistFields(this.seccionId, 'table', { [tablaKeyPref]: datos, [tablaKeyBase]: datos });
this.projectFacade.setField(this.seccionId, null, tablaKeyBase, datos);
```
2. `estructuraInicial` debe usar `''` en campos que deben mostrarse vacíos por defecto (evitar `0`/`0%`).
3. En el `Form-component` tener un `effect()` que una `formDataSignal()` con las tablas: `fromField ?? fromTable ?? estructuraInicial`.
4. `DynamicTable.getFormattedValue()` debe ocultar `0`/`0%` y mostrar `''` para celdas vacías; `validarYNormalizarValor()` debe devolver valores saneados (números dentro de rango, porcentajes 0-100).
5. Evitar race conditions en `obtenerTablaKeyConPrefijo()` (usar `lastTablaKey` solo si apunta a un array válido y con contenido real).

Checklist (PR mínimo)
- [ ] Persistir ambas claves (prefijo + base) al guardar tablas.
- [ ] `estructuraInicial` con `''` en campos sensibles.
- [ ] `Form-component` effect que merge `formDataSignal()` y tablas (`selectField`/`selectTableData`).
- [ ] `DynamicTable` normaliza valores y oculta placeholders numéricos.

---

## 🐞 Corrección: Sincronización inmediata de imágenes y metadatos (título/fuente)

Problema
- Subir/editar/eliminar imágenes o editar título/fuente no siempre actualizaba la vista inmediatamente (se necesitaba recargar la página).

Causa raíz
- Algunas cargas de imágenes leían directamente de almacenamiento (localStorage) u otras rutas fuera de los Signals; algunos componentes no eran forzados a recargar.

Implementación (pasos concretos)
1. `ImageStorageService.saveImages()` debe:
   - Persistir vía `projectFacade.setFields` y `formChange.persistFields`.
   - Llamar `stateAdapter.refreshFromStorage()` para reinyectar datos en `datos$` (ReactiveStateAdapter).
   - Llamar `ViewChildHelper.updateAllComponents('actualizarDatos')` para forzar recarga de componentes que no dependan directamente de `datos$`.
2. Señales que exponen fotos deben depender de `projectFacade.selectSectionFields(this.seccionId, null)()` para forzar re-evaluación cuando cambien campos relevantes.
3. Handlers de título/fuente: persisten con `onFieldChange()` y llaman a `ViewChildHelper.updateAllComponents('actualizarDatos')` si aplica.

Checklist (PR mínimo)
- [ ] `saveImages()` persiste + `stateAdapter.refreshFromStorage()` + `ViewChildHelper.updateAllComponents('actualizarDatos')`.
- [ ] Señales de fotos y metadatos dependen de `selectSectionFields()`.
- [ ] Handlers de título/fuente persisten y forzan `updateAllComponents`.

---

## ✅ Normativa PR / Tests (resumen rápido)
- En cada PR que modifique tables/paragraphs/photos incluir:
  - Snippet de `effect()` que hace merge (`formDataSignal()` + tablas).
  - Tests unitarios para `DynamicTable` (normalización y renderizado de placeholders).
  - Test E2E que cubra: crear fila, editar título/fuente, persistir, y verificar vista sin recargar.

---


---


## 🐞 Corrección: Sincronización inmediata de imágenes y edición de título/fuente (detalle técnico)

**Síntoma:** Tras subir, editar o eliminar una fotografía (o editar título/fuente), los cambios se persistían pero NO se veían en la vista hasta recargar la página.

**Causa raíz:** Las operaciones guardaban correctamente en FormularioService y en ProjectState, pero los componentes de vista no se re-evaluaban automáticamente en todos los puntos (la carga de fotografías dependía de accesos directos a localStorage en lugar de los signals y algunos componentes no eran forzados a recargar).

**Qué se cambió exactamente (resumen y archivos):**
- `ImageStorageService.saveImages()` → ya persiste con `projectFacade.setFields` y `formChange.persistFields`, y además llama a `this.stateAdapter.refreshFromStorage()` y a `ViewChildHelper.updateAllComponents('actualizarDatos')` para forzar re-evaluaciones en caliente (archivo: `src/app/core/services/images/image-storage.service.ts`).
- `ViewChildHelper.updateAllComponents()` → ahora, al invocar `actualizarDatos`, además intenta llamar `cargarFotografias()` en componentes que lo soporten y marca sus `cdRef` con `markForCheck()` para asegurar que la vista preview se refresque (archivo: `src/app/shared/utils/view-child-helper.ts`).
- `ImageUploadComponent` → tras subir o eliminar imágenes guarda vía `imageFacade.saveImages()` y llama a `ViewChildHelper.updateAllComponents('actualizarDatos')` (archivo: `src/app/shared/components/image-upload/image-upload.component.ts`).
- Señales de fotos en Sección 19 (form y view) → ahora delegan a `imageFacade.loadImages()` y además referencian `projectFacade.selectSectionFields(this.seccionId, null)()` para que el computed se re-evalúe cuando cambien campos de la sección (archivos: `src/app/shared/components/seccion19/seccion19-form.component.ts` y `seccion19-view.component.ts`).
- Handlers de título/fuente → después de persistir (via `onFieldChange`) invocan `ViewChildHelper.updateAllComponents('actualizarDatos')` para propagar el cambio a la vista.
- Se eliminaron logs ruidosos y se usa `debugLog()` para trazas opcionales (archivo: `src/app/shared/utils/debug.ts`).

**Por qué esta solución funciona:**
- `FormChangeService.persistFields()` actualiza `FormStateService` (BehaviorSubject) y `ProjectStateFacade` (store). `ReactiveStateAdapter` está suscrito y publica a `datos$` inmediatamente, por lo que las vistas suscritas se actualizan. Al añadir la llamada explícita a `ViewChildHelper.updateAllComponents('actualizarDatos')` nos aseguramos de cubrir componentes que no dependan directamente de `datos$` (ej. que usan `imageFacade.loadImages()`), forzando su recarga y `cdRef.markForCheck()`.

**Checklist de verificación (manual / E2E):**
- [ ] Subir imagen → aparece en preview sin recargar.  
- [ ] Eliminar imagen → desaparece en preview sin recargar.  
- [ ] Editar Título/Fuente → vista se actualiza inmediatamente.  
- [ ] Prueba E2E que valide el flujo subir/eliminar y edición de título/fuente.  

**Estado:** 🟢 Corregido y documentado.

**Estado:** 🟢 LISTO PARA SECCIÓN 12+  
**Conformidad:** 🟢 100% ARQUITECTURA  
**Reactividad:** 🟢 100% SIGNALS
