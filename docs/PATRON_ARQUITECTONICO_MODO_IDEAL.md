# Guía de Refactorización: Patrones Arquitectónicos y Estructura de Archivos

Este documento sirve como una guía de refactorización para implementar un patrón arquitectónico "MODO IDEAL" en el desarrollo de componentes, enfocándose en la estructura de archivos y patrones de código reutilizables.

## 🎯 PATRÓN ARQUITECTÓNICO - MODO IDEAL

**Referencia:** Secciones 1-9 (Actualizado 2 de febrero de 2026)

## 📋 ESTRUCTURA DE ARCHIVOS - PATRÓN UNIVERSAL

Cada sección en el "MODO IDEAL" se compone de 5 archivos clave, organizados de la siguiente manera:

```
shared/components/
├── forms/
│   └── seccionX-form-wrapper.component.ts      (29 líneas)
└── seccionX/
    ├── seccionX-form.component.ts              (300-600 líneas)
    ├── seccionX-form.component.html
    ├── seccionX-view.component.ts              (300-600 líneas)
    └── seccionX-view.component.html
```

### 🏗️ FORM-WRAPPER (Siempre Igual - 29 líneas)

Este componente actúa como un envoltorio para el formulario de la sección, asegurando una estructura consistente y la inyección de dependencias necesarias.

```typescript
import { Component, Input, OnInit, OnDestroy, ChangeDetectorRef, Injector } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CoreSharedModule } from '../../modules/core-shared.module';
import { SeccionXFormComponent } from '../seccionX/seccionX-form.component';
import { BaseSectionComponent } from '../base-section.component';

@Component({
    imports: [CommonModule, FormsModule, CoreSharedModule, SeccionXFormComponent],
    selector: 'app-seccionX-form-wrapper',
    template: `<app-seccionX-form [seccionId]="seccionId" [modoFormulario]="true"></app-seccionX-form>`,
    styles: [`:host { display: block; width: 100%; }`]
})
export class SeccionXFormWrapperComponent extends BaseSectionComponent implements OnInit, OnDestroy {
  @Input() override seccionId: string = '3.1.X';

  constructor(cdRef: ChangeDetectorRef, injector: Injector) {
    super(cdRef, injector);
  }

  protected override onInitCustom(): void { }
  protected override detectarCambios(): boolean { return false; }
  protected override actualizarValoresConPrefijo(): void { }
}
```

### 📊 FORM COMPONENT - Estructura Base

Este es el componente principal del formulario, donde se gestiona la lógica y los datos de la sección. Incluye la gestión de señales (Signals) y efectos (Effects) para una reactividad eficiente.

```typescript
import { Component, OnDestroy, Input, ChangeDetectionStrategy, Injector, Signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';
import { BaseSectionComponent } from '../base-section.component';
import { FotoItem } from '../image-upload/image-upload.component';
import { CoreSharedModule } from '../../modules/core-shared.module';

@Component({
    imports: [CommonModule, FormsModule, CoreSharedModule],
    selector: 'app-seccionX-view',
    templateUrl: './seccionX-view.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true
})
export class SeccionXViewComponent extends BaseSectionComponent implements OnDestroy {
  @Input() override seccionId: string = '3.1.X';
  @Input() override modoFormulario: boolean = false;
  
  override readonly PHOTO_PREFIX = 'fotografiaSeccionX';
  override useReactiveSync: boolean = true;
  
  fotografiasSeccionX: FotoItem[] = [];

  readonly formDataSignal: Signal<Record<string, any>> = computed(() =>
    this.projectFacade.selectSectionFields(this.seccionId, null)()
  );

  readonly parrafoSignal: Signal<string> = computed(() => {
    const data = this.formDataSignal();
    const manual = data['parrafoSeccionX'];
    if (manual && manual.trim().length > 0) return manual;
    return this.generarTextoDefault();
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

  constructor(cdRef: ChangeDetectorRef, injector: Injector) {
    super(cdRef, injector);

    effect(() => {
      const data = this.formDataSignal();
      this.datos = { ...data };
      this.cdRef.markForCheck();
    });

    effect(() => {
      this.photoFieldsHash();
      this.cargarFotografias();
      this.fotografiasSeccionX = [...this.fotografiasCache];
      this.cdRef.markForCheck();
    }, { allowSignalWrites: true });
  }

  protected override onInitCustom(): void {
    this.cargarFotografias();
    this.fotografiasSeccionX = [...this.fotografiasCache];
  }

  protected override detectarCambios(): boolean { return false; }
  protected override actualizarValoresConPrefijo(): void { }

  override onFotografiasChange(fotografias: FotoItem[]): void {
    super.onFotografiasChange(fotografias);
    this.fotografiasSeccionX = fotografias;
    this.cdRef.markForCheck();
  }

  private generarTextoDefault(): string {
    return 'Texto por defecto';
  }

  obtenerTextoParrafo(): string {
    return this.parrafoSignal();
  }
}
```

## 🎯 PATRONES POR TIPO DE CONTENIDO

### Patrón 1: Párrafo Simple (SIN prefijo)

Para la gestión de párrafos de texto simples sin la necesidad de prefijos dinámicos.

**Signal:**
```typescript
readonly parrafoSignal: Signal<string> = computed(() => {
  const data = this.formDataSignal();
  const manual = data['parrafoSeccionX'];
  if (manual && manual.trim().length > 0) return manual;
  return this.generarTextoDefault();
});
```

**Método generador:**
```typescript
private generarTextoDefault(): string {
  const data = this.formDataSignal();
  return `Texto por defecto`;
}
```

**HTML Formulario:**
```html
<textarea 
  [(ngModel)]="datos['parrafoSeccionX']"
  (ngModelChange)="onFieldChange('parrafoSeccionX', $event)">
</textarea>
```

**HTML Vista:**
```html
<div [innerHTML]="parrafoSignal()"></div>
```

### Patrón 2: Párrafo CON Prefijo (Grupo AISD/AISI)

Para párrafos que requieren un prefijo dinámico, útil en contextos donde el contenido varía según un grupo o categoría.

**Signal:**
```typescript
readonly parrafoGrupoSignal: Signal<string> = computed(() => {
  const data = this.formDataSignal();
  const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
  const keyManual = prefijo ? `parrafo${prefijo}` : 'parrafo';
  
  const manual = data[keyManual];
  if (manual && manual.trim().length > 0) return manual;
  return this.generarTextoGrupo();
});
```

**Método generador:**
```typescript
private generarTextoGrupo(): string {
  const data = this.formDataSignal();
  const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
  const nombreGrupo = data[prefijo ? `nombreGrupo${prefijo}` : 'nombreGrupo'];
  return `Texto para ${nombreGrupo}`;
}
```

**Método helper:**
```typescript
private get fieldKeyParrafo(): string {
  const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
  return prefijo ? `parrafo${prefijo}` : 'parrafo';
}
```

**HTML Formulario:**
```html
<textarea 
  [(ngModel)]="datos[fieldKeyParrafo]"
  (ngModelChange)="onFieldChange(fieldKeyParrafo, $event)">
</textarea>
```

### Patrón 3: Tabla Simple (Estructura Fija)

Implementación de tablas con una estructura predefinida y datos iniciales.

**Signal:**
```typescript
readonly tablaSignal: Signal<any[]> = computed(() => {
  const data = this.formDataSignal();
  let tabla = Array.isArray(data['miTabla']) ? data['miTabla'] : [];
  
  if (tabla.length === 0) {
    tabla = [
      { categoria: 'Fila 1', casos: 0, porcentaje: '0,00 %' },
      { categoria: 'Fila 2', casos: 0, porcentaje: '0,00 %' }
    ];
  }
  return tabla;
});
```

**HTML Formulario:**
```html
<app-dynamic-table
  [datos]="datos"
  [columns]="[
    { field: 'categoria', label: 'Categoría', readonly: true },
    { field: 'casos', label: 'Casos', readonly: false },
    { field: 'porcentaje', label: 'Porcentaje', readonly: true }
  ]"
  [sectionId]="seccionId"
  [tablaKey]="'miTabla'"
  [showAddButton]="false"
  [showDeleteButton]="false"
  (tableUpdated)="onTablaActualizada($event)">
</app-dynamic-table>
```

**Handler:**
```typescript
onTablaActualizada(updatedData?: any[]): void {
  const datos = updatedData || this.datos['miTabla'] || [];
  this.onFieldChange('miTabla', datos, { refresh: true });
  this.cdRef.detectChanges();
}
```

### Patrón 4: Tabla Dinámica CON Porcentajes

Tablas que calculan y muestran porcentajes dinámicamente basados en los datos de la tabla.

**Signal con cálculos:**
```typescript
readonly tablaConPorcentajesSignal: Signal<any[]> = computed(() => {
  const tabla = this.tablaSignal();
  if (!tabla || tabla.length === 0) return [];

  const total = tabla.reduce((sum, item) => {
    return sum + (parseInt(item?.casos) || 0);
  }, 0);

  if (total <= 0) {
    return tabla.map(item => ({ ...item, porcentaje: '0,00 %' }));
  }

  return tabla.map((item: any) => {
    const casos = parseInt(item?.casos) || 0;
    const porcentaje = ((casos / total) * 100)
      .toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      .replace('.', ',') + ' %';
    
    return { ...item, porcentaje };
  });
});
```

**HTML Vista:**
```html
<tr *ngFor="let item of tablaConPorcentajesSignal()">
  <td>{{ item.categoria }}</td>
  <td>{{ item.casos }}</td>
  <td>{{ item.porcentaje }}</td>
</tr>
```

### Patrón 5: Tabla CON Prefijo - ✅ SINCRONIZACIÓN FORM-VIEW PERFECTA

Tablas que utilizan prefijos dinámicos para identificar diferentes conjuntos de datos. **CRÍTICO:** Cuando `dynamic-table.component.ts` persiste datos con clave prefijada (ej: `tablaKey_A1`), la form y view deben leerla con la función `selectTableData()` que maneja el lookup automático.

#### PASO 1: Signal con Dual Fallback (OBLIGATORIO)

**⚠️ ERROR COMÚN:** Usar solo `selectField()` sin fallback a `selectTableData()`
```typescript
// ❌ MALO - No funciona después de reload con prefijo dinámico
readonly tablaSignal = computed(() => this.projectFacade.selectField(this.seccionId, null, 'miTabla')());

// ✅ CORRECTO - Busca en selectField(), fallback a selectTableData() para claves prefijadas
readonly tablaSignal: Signal<any[]> = computed(() => {
  const data = this.formDataSignal();
  
  // ✅ PASO 1: Intenta leer directamente
  let tabla = this.projectFacade.selectField(this.seccionId, null, 'miTabla')();
  
  // ✅ PASO 2: Si vacío, fallback a selectTableData() (busca con prefijo automático)
  if (!Array.isArray(tabla) || tabla.length === 0) {
    tabla = this.projectFacade.selectTableData(this.seccionId, null, 'miTabla')();
  }
  
  // ✅ PASO 3: Si aún vacío, estructura inicial (NUNCA [unFilaInicial])
  if (!Array.isArray(tabla) || tabla.length === 0) {
    tabla = []; // ← CRÍTICO: [] no [{ categoria: 'Fila 1', casos: 0 }]
  }
  
  return tabla;
});
```

**¿Por qué el dual fallback?**
- `dynamic-table` persiste con clave prefijada: `miTabla_A1`, `miTabla_B2`, etc
- `selectField('miTabla')` → devuelve undefined (no coincide)
- `selectTableData('miTabla')` → busca automáticamente `miTabla_*` y devuelve datos
- **Sin esto:** después de reload, form y view no ven los datos porque PrefixManager generó prefijo

#### PASO 2: Método Helper para Obtener Clave Tabla

```typescript
private obtenerTablaKey(): string {
  // Esta clave es usada SOLO en el HTML del dynamic-table [tablaKey]
  // El dynamic-table la prefijará automáticamente al persistir
  return 'miTabla'; // ← Siempre SIN prefijo (el dynamic-table añade el prefijo)
}
```

#### PASO 3: HTML - Binding a `app-dynamic-table`

```html
<app-dynamic-table
  [datos]="datos"
  [columns]="[
    { field: 'categoria', label: 'Categoría', readonly: true },
    { field: 'casos', label: 'Casos', readonly: false },
    { field: 'porcentaje', label: 'Porcentaje', readonly: true }
  ]"
  [sectionId]="seccionId"
  [tablaKey]="'miTabla'"
  [showAddButton]="true"
  [showDeleteButton]="true"
  (tableUpdated)="onTablaActualizada($event)">
</app-dynamic-table>
```

#### PASO 4: Handler - Sincronización Inmediata + Persist

```typescript
onTablaActualizada(updatedData?: any[]): void {
  // ✅ PASO 1: Si el dynamic-table pasa updatedData, usarlo
  if (Array.isArray(updatedData) && updatedData.length > 0) {
    this.datos['miTabla'] = updatedData;
  }
  
  // ✅ PASO 2: Leer desde ProjectState (selectTableData busca claves prefijadas)
  const tablaDelState = this.projectFacade.selectTableData(this.seccionId, null, 'miTabla')();
  if (Array.isArray(tablaDelState)) {
    this.datos['miTabla'] = tablaDelState;
  }
  
  // ✅ PASO 3: Persistir cambios inmediatamente
  this.onFieldChange('miTabla', this.datos['miTabla'] || [], { refresh: true });
  
  // ✅ PASO 4: Fuerza detección visual inmediata
  this.cdRef.markForCheck();
  this.cdRef.detectChanges();
}
```

#### PASO 5: EFFECT Crítico para Sincronización Form-View

**En el constructor, agregar EFFECT 1:**
```typescript
effect(() => {
  const sectionData = this.formDataSignal();
  this.datos = { ...this.datos, ...sectionData }; // ✅ Merge inteligente
  this.cdRef.markForCheck();
});
```

**¿Por qué es crítico?**
- `dynamic-table` persiste datos en `ProjectState`
- `formDataSignal()` devuelve datos del estado
- Sin este effect, `this.datos` no se sincroniza con cambios de tabla
- Form no ve actualizaciones después de reload

#### PASO 6: La Clave - Nunca inicializar con Estructura por Defecto

```typescript
// ❌ MALO - Sobrescribe datos cuando se agregan 3+ filas
readonly tablaSignal = computed(() => {
  const tabla = this.projectFacade.selectField(...) || 
    [{ categoria: 'Fila 1', casos: 0 }];
  return tabla;
});

// ✅ CORRECTO - Estructura vacía, dynamic-table agregará filas
readonly tablaSignal = computed(() => {
  const tabla = this.projectFacade.selectField(...) ?? 
                this.projectFacade.selectTableData(...) ??
                [];
  return tabla;
});
```

#### PASO 7: Testing la Sincronización

Para verificar que la sincronización funciona:

```typescript
// 1. Agregar 3 filas en form → Guardar
// 2. Recargar página
// 3. En consola: 
console.log('Form data:', this.projectFacade.selectField(this.seccionId, null, 'miTabla')());
console.log('Table data (prefixed):', this.projectFacade.selectTableData(this.seccionId, null, 'miTabla')());
// Deben ambos mostrar 3 filas

// 4. Ver que form.tablaSignal() devuelve 3 filas
console.log('Form Signal:', this.tablaSignal());

// 5. Ver que view.tablaSignal() también devuelve 3 filas
```

#### RESUMEN - Patrón Correcto para Tablas con Prefijo

| Elemento | Patrón | Crítico? |
|----------|--------|----------|
| Signal lectura | `selectField() ?? selectTableData() ?? []` | 🔴 SÍ |
| Estructura inicial | `[]` (NO `[{...}]`) | 🔴 SÍ |
| HTML tablaKey | `'miTabla'` (sin prefijo) | 🟢 NO |
| Handler sync | Lee `selectTableData()` + `onFieldChange()` | 🟡 SÍ |
| EFFECT 1 | Sincroniza `formDataSignal()` a `this.datos` | 🔴 SÍ |
| Detección cambios | `cdRef.detectChanges()` después de update | 🟡 SÍ |

### Patrón 6: Numeración Dinámica de Cuadros

Para la numeración automática y dinámica de cuadros o tablas dentro de una sección.

**Métodos getters:**
```typescript
obtenerNumeroCuadro(indice: number): string {
  return this.tableNumberingService.getGlobalTableNumber(this.seccionId, indice);
}

obtenerTituloCuadro(indice: number): string {
  const numero = this.obtenerNumeroCuadro(indice);
  return `Cuadro N° ${numero}`;
}
```

**HTML:**
```html
<h4>{{ obtenerTituloCuadro(0) }}</h4>
<p>Condición de ocupación de las viviendas – CC ____ (2017)</p>
```

### Patrón 7: Títulos y Fuentes Editables

Permite la edición de títulos y fuentes de tablas o cuadros, con valores por defecto si no se proporcionan.

**Métodos getters:**
```typescript
obtenerTituloTabla(): string {
  const tituloKey = 'tituloTabla';
  const titulo = this.datos[tituloKey];
  
  if (titulo && titulo.trim().length > 0) return titulo;
  const numeroCuadro = this.obtenerNumeroCuadro(0);
  return `Cuadro N° ${numeroCuadro} - Título por defecto`;
}

obtenerFuenteTabla(): string {
  const fuenteKey = 'fuenteTabla';
  const fuente = this.datos[fuenteKey];
  
  if (fuente && fuente.trim().length > 0) return fuente;
  return 'Fuente por defecto';
}
```

**HTML Formulario:**
```html
<input 
  type="text"
  [value]="obtenerTituloTabla()"
  (change)="onTituloChange($event)">

<input 
  type="text"
  [value]="obtenerFuenteTabla()"
  (change)="onFuenteChange($event)">
```

**Handlers:**
```typescript
onTituloChange(event: Event): void {
  const valor = (event.target as HTMLInputElement).value;
  this.onFieldChange('tituloTabla', valor, { refresh: false });
  this.cdRef.markForCheck();
}

onFuenteChange(event: Event): void {
  const valor = (event.target as HTMLInputElement).value;
  this.onFieldChange('fuenteTabla', valor, { refresh: false });
  this.cdRef.markForCheck();
}
```

**HTML Vista:**
```html
<h5>{{ obtenerTituloTabla() }}</h5>
<!-- Tabla -->
<p>Fuente: {{ obtenerFuenteTabla() }}</p>
```

### Patrón 8: Fotografías (SIEMPRE IGUAL) ✅ CON FORM-VIEW SYNC

Gestión estandarizada de la carga y visualización de fotografías asociadas a una sección.

**IMPORTANTE:** Este patrón debe combinarse con EFFECT 1 en el constructor para sincronización correcta cuando hay form-view separado.

#### PASO 1: Effect de Sincronización de Datos (CRÍTICO con Form-View)

**En FORM component:**
```typescript
effect(() => {
  const sectionData = this.formDataSignal();
  const legacyData = this.projectFacade.obtenerDatos();
  this.datos = { ...legacyData, ...sectionData }; // ✅ Merge inteligente
  this.cdRef.markForCheck();
});
```

**En VIEW component:**
```typescript
effect(() => {
  const data = this.formDataSignal();
  this.datos = { ...data }; // ✅ Sincroniza datos persistidos
  this.cdRef.markForCheck();
});
```

**¿Por qué es crítico?**
- Form persiste título con `formChange.persistFields()`
- View recibe `formDataSignal()` actualizado
- Sin este effect, View no sincroniza `this.datos`
- Métodos como `obtenerTituloFoto()` leen `this.datos[tituloKey]` → VACÍO sin sync

#### PASO 2: Signal de Hash de Fotografías

```typescript
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
```

#### PASO 3: Effect que Monitorea Cambios de Fotos

```typescript
effect(() => {
  this.photoFieldsHash(); // ✅ Trackea hash de fotos
  this.cargarFotografias(); // ✅ Recarga cuando hash cambia
  this.fotografiasSeccionX = [...this.fotografiasCache];
  this.cdRef.markForCheck();
}, { allowSignalWrites: true });
```

#### PASO 4: Handler para Edición Inmediata

```typescript
override onFotografiasChange(fotografias: FotoItem[]): void {
  super.onFotografiasChange(fotografias);
  // ✅ Actualizar referencias locales
  this.fotografiasSeccionX = fotografias;
  // ✅ CRÍTICO: Llama detectChanges() para sincronización INMEDIATA
  // Sin esto, los cambios solo aparecen en la siguiente detección de cambios
  this.cdRef.markForCheck();
  this.cdRef.detectChanges();
}
```

**Nota importante:** El componente `app-image-upload` **persiste automáticamente** cada título/fuente mediante `formChange.persistFields()` cuando el usuario edita, así que el handler SOLO necesita:
1. Actualizar referencias locales
2. Llamar `cdRef.detectChanges()` para fuerza la detección inmediata
3. NO llamar `onFieldChange()` nuevamente (evita duplicación)

#### PASO 5: HTML Formulario (Con Banderas Explícitas)

```html
<app-image-upload
  [fotografias]="fotografiasFormMulti"
  [sectionId]="seccionId"
  [photoPrefix]="PHOTO_PREFIX"
  [permitirMultiples]="true"
  [mostrarTitulo]="true"
  [mostrarFuente]="true"
  labelTitulo="Título de la fotografía"
  labelFuente="Fuente de la fotografía"
  labelImagen="Fotografía - Imagen"
  placeholderTitulo="Ej: Vista del área"
  placeholderFuente="Ej: GEADES, 2024"
  tituloDefault="Fotografía"
  fuenteDefault="GEADES, 2024"
  [requerido]="false"
  (fotografiasChange)="onFotografiasChange($event)">
</app-image-upload>
```

#### PASO 6: Métodos de Vista que Leen Datos Reactivos

```typescript
obtenerTituloFoto(index: number): string {
  const tituloKey = `${this.PHOTO_PREFIX}${index}Titulo`;
  // ✅ Lee from this.datos que está sincronizado por effect()
  return this.datos[tituloKey] || `Fotografía ${index}`;
}

obtenerFuenteFoto(index: number): string {
  const fuenteKey = `${this.PHOTO_PREFIX}${index}Fuente`;
  // ✅ Lee from this.datos que está sincronizado por effect()
  return this.datos[fuenteKey] || 'GEADES, 2024';
}
```

#### PASO 7: HTML Vista (Que Consume Métodos Reactivos)

```html
<div class="photo-container">
  <img [src]="..." alt="...">
  <p class="photo-title">{{ obtenerTituloFoto(1) }}</p>
  <p class="photo-source">{{ obtenerFuenteFoto(1) }}</p>
</div>
```

**Flujo Completo de Reactividad:**
1. Usuario edita título en form
2. `app-image-upload.onTituloChange()` → `formChange.persistFields()`
3. Estado se actualiza
4. `formDataSignal()` devuelve nuevo valor
5. EFFECT 1 sincroniza a `this.datos`
6. `obtenerTituloFoto()` lee `this.datos` actualizado
7. Template re-renderiza automáticamente

**Notas críticas para sincronización perfecta:**
- ✅ EFFECT 1 (sincronización de datos) es OBLIGATORIO con form-view separado
- ✅ `[mostrarTitulo]="true"` y `[mostrarFuente]="true"` son explícitos
- ✅ Handler llama `cdRef.detectChanges()` para detección inmediata
- ✅ El `image-upload` component persiste automáticamente vía `formChange.persistFields()`
- ✅ Sin EFFECT 1, los cambios se pierden entre instancias
- ✅ Comparar con Sección 1 (simple) vs Sección 4 (REFERENCIA form-view)

## ✅ CHECKLIST UNIVERSAL

Este checklist asegura la adherencia a los estándares de desarrollo para cada componente de sección.

**ESTRUCTURA**
*   [ ] Extiende `BaseSectionComponent`
*   [ ] `@Input` `seccionId`
*   [ ] `@Input` `modoFormulario`
*   [ ] Implements `OnDestroy`
*   [ ] `ChangeDetectionStrategy.OnPush`

**SIGNALS**
*   [ ] `formDataSignal = computed()`
*   [ ] `parrafoSignal = computed()` (para cada párrafo)
*   [ ] `tablaSignal = computed()` (para cada tabla)
*   [ ] `photoFieldsHash = computed()`

**EFFECTS**
*   [ ] EFFECT 1: Auto-sync `formDataSignal`
*   [ ] EFFECT 2: Monitor `photoFieldsHash`

**MÉTODOS**
*   [ ] `onInitCustom()` - cargar fotografías
*   [ ] `detectarCambios()` - retorna `false`
*   [ ] `actualizarValoresConPrefijo()` - vacío
*   [ ] `onFotografiasChange()` - actualiza local

**PÁRRAFOS**
*   [ ] Verifica `trim().length > 0`
*   [ ] Fallback a generador
*   [ ] Soporta prefijo si aplica

**TABLAS**
*   [ ] Event binding con `$event`
*   [ ] Handler recibe `updatedData`
*   [ ] `onFieldChange` con `refresh: true`
*   [ ] Estructura inicial si está vacío
*   [ ] `readonly` correcto (categoría, %)

**SINCRONIZACIÓN**
*   [ ] Form y View usan mismo `formDataSignal`
*   [ ] Sin duplicación de datos
*   [ ] Sin `setTimeout`

**LIMPIEZA FINAL**
*   [ ] Eliminar `seccionX.component.ts` (archivo original deprecado)
*   [ ] Eliminar `seccionX.component.html` (template original deprecado)
*   [ ] Verificar que solo queden 4 archivos en `/seccionX/`
*   [ ] Compilación exitosa sin errores
*   [ ] Funcionalidad completa preservada

## 🚀 MIGRACIÓN RÁPIDA

Guía paso a paso para la migración y creación de nuevas secciones siguiendo el "MODO IDEAL".

1.  **Paso 1: Copiar template wrapper (1 min)**
    ```bash
    cp seccion9-form-wrapper.component.ts seccionX-form-wrapper.component.ts
    # Editar: selector, import, seccionId
    ```

2.  **Paso 2: Crear form.component.ts (30 min)**
    ```bash
    # Usar template arriba
    # Cambiar: nombre, PHOTO_PREFIX, señales específicas 
    ```

3.  **Paso 3: Crear view.component.ts (15 min)**
    ```bash
    # Copiar form.component.ts
    # Solo renombrar clase
    # Cambiar template a view 
    ```

4.  **Paso 4: Crear HTML formulario (45 min)**
    ```bash
    # Estructura: párrafos + tablas + fotos
    # Usar patrones arriba 
    ```

5.  **Paso 5: Crear HTML vista (30 min)**
    ```bash
    # Copiar HTML formulario
    # Remover inputs, agregar readonly
    # Mostrar datos del Signal 
    ```

6.  **Paso 6: Eliminar archivos deprecados (2 min)**
    ```bash
    # Una vez que la compilación funciona correctamente:
    rm seccionX.component.ts      # Archivo original deprecado
    rm seccionX.component.html    # Template original deprecado
    # Verificar que solo queden los 4 archivos del patrón MODO IDEAL
    ls seccionX/                  # Debe mostrar solo: form.component.ts, form.component.html, view.component.ts, view.component.html
    ```

**Tiempo total:** 2 horas por sección

## 📚 REFERENCIA RÁPIDA

| Elemento             | Patrón                      | Complejidad |
| :------------------- | :-------------------------- | :---------- |
| Párrafo simple       | `computed()` + manual check | 🟢          |
| Párrafo con prefijo  | `computed()` + `PrefijoHelper` | 🟡          |
| Tabla estática       | Signal + estructura inicial | 🟡          |
| Tabla dinámica       | Signal + `reduce()` porcentajes | 🟠          |
| Tabla con prefijo    | `obtenerTablaKey()`         | 🟠          |
| Numeración dinámica  | `TableNumberingService`     | 🟢          |
| Fotos                | `photoFieldsHash` + cargar  | 🟢          |

**Estado:** 🟢 Listo para producción
**Secciones:** 1-9 en MODO IDEAL
**Tiempo proyectado:** 2 horas por nueva sección
**Mantenibilidad:** 9/10
**Limpieza:** Eliminar archivos deprecados después de refactorización

## 🔧 TROUBLESHOOTING - TABLAS EN FORM-VIEW

### OBLIGATORIO — Patrón de tablas con prefijo (LEER PRIMERO)

**Resumen corto:** Todas las secciones que usan tablas dinámicas con prefijo deben aplicar este patrón OBLIGATORIO para evitar pérdida de datos, fallos al recargar y problemas de sincronización entre form y view.

Checklist obligatorio (si falta cualquiera de estos, considera el cambio **NO APTO**):
- Signal de lectura: `selectField() ?? selectTableData() ?? []`
- EFFECT 1 (constructor): sincronizar `formDataSignal()` → `this.datos` (merge inteligente)
- Handler `onTablaActualizada`: leer `selectTableData()`, actualizar `this.datos`, llamar `onFieldChange('miTabla', datos, { refresh: true })` y `cdRef.detectChanges()`
- HTML: usar `[tablaKey]="'miTabla'"` (SIN prefijo; el dynamic-table añade el prefijo al persistir)

Snippets obligatorios (copiar y pegar):

```typescript
// SIGNAL: dual fallback (OBLIGATORIO)
readonly tablaSignal: Signal<any[]> = computed(() => {
  const fromSelectField = this.projectFacade.selectField(this.seccionId, null, 'miTabla')();
  const fromSelectTableData = this.projectFacade.selectTableData(this.seccionId, null, 'miTabla')();
  return fromSelectField ?? fromSelectTableData ?? [];
});
```

```typescript
// EFFECT 1: Sincronización (OBLIGATORIO)
constructor(cdRef: ChangeDetectorRef, injector: Injector) {
  super(cdRef, injector);
  effect(() => {
    const sectionData = this.formDataSignal();
    this.datos = { ...this.projectFacade.obtenerDatos(), ...sectionData };
    this.cdRef.markForCheck();
  });
}
```

```typescript
// HANDLER: al actualizar tabla (OBLIGATORIO)
onTablaActualizada(updatedData?: any[]): void {
  const tablaDelState = this.projectFacade.selectTableData(this.seccionId, null, 'miTabla')();
  const datos = tablaDelState || updatedData || [];
  this.datos['miTabla'] = datos;
  this.onFieldChange('miTabla', datos, { refresh: true });
  this.cdRef.markForCheck();
  this.cdRef.detectChanges();
}

#### Ejemplo práctico — Sección 14: Tablas (Nivel Educativo y Tasa de Analfabetismo) ✅
A continuación se muestra el patrón aplicado en la Sección 14 (implementación real que solucionó los problemas vistos):

- En `seccion14-form.component.ts` (dentro de la clase):

```typescript
// Configs de tabla (Signal dentro de la clase, NO al top-level)
readonly nivelEducativoConfigSignal: Signal<TableConfig> = computed(() => ({
  tablaKey: 'nivelEducativoTabla',
  totalKey: 'categoria',
  campoTotal: 'casos',
  campoPorcentaje: 'porcentaje',
  permiteAgregarFilas: true,
  permiteEliminarFilas: true,
  noInicializarDesdeEstructura: false,
  estructuraInicial: [{ categoria: '', casos: 0, porcentaje: '0%' }],
  calcularPorcentajes: true
}));

readonly tasaAnalfabetismoConfigSignal: Signal<TableConfig> = computed(() => ({
  tablaKey: 'tasaAnalfabetismoTabla',
  totalKey: 'indicador',
  campoTotal: 'casos',
  campoPorcentaje: 'porcentaje',
  permiteAgregarFilas: true,
  permiteEliminarFilas: true,
  noInicializarDesdeEstructura: false,
  estructuraInicial: [{ indicador: '', casos: 0, porcentaje: '0%' }],
  calcularPorcentajes: true
}));
```

- En el template `seccion14-form.component.html` pasar la config al componente:

```html
<app-dynamic-table
  [datos]="datos"
  [config]="nivelEducativoConfigSignal()"
  [columns]="[...]"
  [sectionId]="seccionId"
  [tablaKey]="'nivelEducativoTabla'"
  (tableUpdated)="onNivelEducativoTableUpdated($event)">
</app-dynamic-table>
```

- Handler robusto (prioriza `updatedData`, persiste con notifySync, lee estado y actualiza `this.datos`):

```typescript
onNivelEducativoTableUpdated(updatedData?: any[]): void {
  console.log('[Seccion14][form] onNivelEducativoTableUpdated - incoming', { updatedDataLength: updatedData?.length ?? 0 });

  const datos = (updatedData && updatedData.length > 0)
    ? updatedData
    : (this.projectFacade.selectTableData(this.seccionId, null, 'nivelEducativoTabla')() || []);

  const formChange = this.injector.get(FormChangeService);
  formChange.persistFields(this.seccionId, 'table', { nivelEducativoTabla: datos }, { updateState: true, notifySync: true, persist: false } as any);

  // Read-back para asegurar estado consistente y evitar race conditions
  const tablaPersistida = this.projectFacade.selectTableData(this.seccionId, null, 'nivelEducativoTabla')() || [];
  this.datos['nivelEducativoTabla'] = tablaPersistida;

  // Opcional: persistir el field para que otros mecanismos lo detecten
  this.onFieldChange('nivelEducativoTabla', tablaPersistida, { refresh: false });

  this.cdRef.markForCheck();
  this.cdRef.detectChanges();
}
```

- En la vista (`seccion14-view.component.ts`) usar la función correcta de cálculo para que aparezca la fila **Total** (Cuadro 3.26):

```typescript
getTasaAnalfabetismoConPorcentajes(): any[] {
  const tabla = this.tasaAnalfabetismoTablaSignal();
  if (!tabla || tabla.length === 0) return [];
  return TablePercentageHelper.calcularPorcentajesAnalfabetismo(tabla, '3.26');
}
```

**Checklist específico (Sección 14)**
- [ ] Config signals dentro de la clase (no fuera)
- [ ] Pasar `[config]` al `app-dynamic-table`
- [ ] Handler usa `updatedData` cuando viene, si no lee `selectTableData()`
- [ ] `persistFields(..., { updateState: true, notifySync: true })` para asegurar efectos
- [ ] Read-back `selectTableData()` y asignar a `this.datos[...]`
- [ ] Forzar `cdRef.detectChanges()` para vista inmediata
- [ ] En la vista usar `calcularPorcentajesAnalfabetismo` para agregar fila `Total`

Esta sección práctica queda integrada al bloque OBLIGATORIO para que al seguir la guía no haya dudas al aplicar el patrón en futuras refactorizaciones.

```

```html
<!-- HTML: [tablaKey] WITHOUT prefix (OBLIGATORIO) -->
<app-dynamic-table
  [datos]="datos"
  [columns]="[ ... ]"
  [sectionId]="seccionId"
  [tablaKey]="'miTabla'"
  (tableUpdated)="onTablaActualizada($event)">
</app-dynamic-table>
```

---

### Problema 1: "Form no muestra datos de tabla después de reload"

**Causa:** Signal usa solo `selectField()` sin fallback a `selectTableData()`

**Síntomas:**
- Form está vacío después de reload
- View muestra datos correctamente
- Datos están en localStorage (verificado en DevTools)

**Solución:**
```typescript
// ❌ ANTES (Causa el bug)
readonly tablaSignal = computed(() => 
  this.projectFacade.selectField(this.seccionId, null, 'miTabla')()
);

// ✅ DESPUÉS (Funciona)
readonly tablaSignal = computed(() => {
  const fromSelectField = this.projectFacade.selectField(this.seccionId, null, 'miTabla')();
  const fromSelectTableData = this.projectFacade.selectTableData(this.seccionId, null, 'miTabla')();
  return fromSelectField ?? fromSelectTableData ?? [];
});
```

### Problema 2: "Agregar 3ª fila limpia todos los datos"

**Causa:** `estructuraInicial: [{ ...unFilaCompleta }]` sobrescribe datos al inicializar Signal

**Síntomas:**
- 1 y 2 filas se guardan correctamente
- Al agregar 3ª fila: todos los datos desaparecen
- localStorage tiene solo 1 fila después

**Solución:**
```typescript
// ❌ ANTES (Causa sobrescritura en 3+ filas)
const estructuraInicial = [
  { categoria: 'Salud', casos: 0, porcentaje: '0,00 %' }
];
readonly tablaSignal = computed(() => 
  this.projectFacade.selectField(this.seccionId, null, 'miTabla')() || estructuraInicial
);

// ✅ DESPUÉS (Estructura vacía, dynamic-table agrega filas)
readonly tablaSignal = computed(() => 
  this.projectFacade.selectField(this.seccionId, null, 'miTabla')() ?? 
  this.projectFacade.selectTableData(this.seccionId, null, 'miTabla')() ?? 
  []
);
```

### Problema 3: "Agregar fila en form no aparece hasta reload"

**Causa:** Handler no sincroniza datos desde ProjectState después de agregar fila

**Síntomas:**
- View muestra nueva fila inmediatamente
- Form requiere reload para mostrar fila nueva
- dynamic-table emite evento `tableUpdated`

**Solución:**
```typescript
// ❌ ANTES (No sincroniza desde State)
onTablaActualizada(updatedData?: any[]): void {
  this.onFieldChange('miTabla', updatedData || [], { refresh: false });
}

// ✅ DESPUÉS (Lee desde State + Detección inmediata)
onTablaActualizada(updatedData?: any[]): void {
  // 1. Leer desde ProjectState (maneja prefijos)
  const tablaDelState = this.projectFacade.selectTableData(
    this.seccionId, null, 'miTabla'
  )();
  
  // 2. Usar datos más frescos (del State)
  const datos = tablaDelState || updatedData || [];
  
  // 3. Actualizar this.datos para sincronización inmediata
  this.datos['miTabla'] = datos;
  
  // 4. Persistir al estado
  this.onFieldChange('miTabla', datos, { refresh: true });
  
  // 5. Fuerza detección visual INMEDIATA
  this.cdRef.markForCheck();
  this.cdRef.detectChanges();
}
```

### Problema 4: "EFFECT 1 no existe y form no se sincroniza con view"

**Causa:** Falta EFFECT crítico que sincroniza `formDataSignal()` con `this.datos`

**Síntomas:**
- Form muestra datos de antigua sesión
- Cambios en view no se ven en form
- Métodos como `obtenerTituloFoto()` leen vacíos

**Solución (en constructor):**
```typescript
constructor(cdRef: ChangeDetectorRef, injector: Injector) {
  super(cdRef, injector);

  // ✅ EFFECT 1 (OBLIGATORIO): Sincroniza estado con formulario
  effect(() => {
    const sectionData = this.formDataSignal();
    const legacyData = this.projectFacade.obtenerDatos();
    
    // Merge inteligente: prefer sectionData (más actual)
    this.datos = { ...legacyData, ...sectionData };
    this.cdRef.markForCheck();
  });

  // ✅ EFFECT 2 (Para fotos): Monitorea cambios
  effect(() => {
    this.photoFieldsHash();
    this.cargarFotografias();
    this.cdRef.markForCheck();
  });
}
```

### Problema 5: "dynamic-table persiste con clave prefijada pero Signal no la encuentra"

**Causa:** PrefixManager genera `tablaKey_A1`, `tablaKey_B2`, pero Signal busca solo `tablaKey`

**Síntomas:**
- DevTools localStorage muestra `miTabla_A1` (con prefijo)
- Signal busca solo `miTabla` (sin prefijo) → vacío
- `selectField('miTabla')` devuelve undefined

**Solución - Usar `selectTableData()` que maneja lookup automático:**
```typescript
// ❌ MALO - No busca claves prefijadas
readonly tablaSignal = computed(() => 
  this.projectFacade.selectField(this.seccionId, null, 'miTabla')()
);

// ✅ CORRECTO - selectTableData() busca tablaKey_* automáticamente
readonly tablaSignal = computed(() => {
  // Primero intenta clave directa
  let data = this.projectFacade.selectField(this.seccionId, null, 'miTabla')();
  
  // Si no existe, busca con prefijo automático
  if (!data) {
    data = this.projectFacade.selectTableData(this.seccionId, null, 'miTabla')();
  }
  
  return data ?? [];
});

// ¿Qué hace selectTableData()?
// 1. Lee el prefijo actual del estado
// 2. Busca `miTabla_prefijo` en projectState
// 3. Si existe, devuelve esos datos
// 4. Si no existe, devuelve undefined
```

---

## 📋 GUÍA RÁPIDA - Flujo Correcto de Tabla Form-View

### ✅ Flujo CORRECTO (Toda tabla con prefijo debe seguir esto)

```
1. SIGNAL (en formulario)
   ├─ Intenta: selectField('miTabla')
   ├─ Fallback: selectTableData('miTabla') 👈 CRÍTICO para prefijos
   └─ Fallback: [] (nunca estructura con datos)

2. EFFECT 1 (en constructor)
   └─ Sincroniza: formDataSignal() → this.datos

3. HTML DYNAMIC-TABLE
   ├─ [tablaKey]="'miTabla'" (sin prefijo, dynamic-table lo añade)
   └─ (tableUpdated)="onTablaActualizada($event)"

4. HANDLER (onTablaActualizada)
   ├─ Lee desde: selectTableData() 👈 Por si hay prefijo
   ├─ Actualiza: this.datos['miTabla'] = datos
   ├─ Persiste: onFieldChange('miTabla', datos)
   └─ Detecta: cdRef.detectChanges() (INMEDIATO)

5. PERSISTENCIA (automática en dynamic-table)
   ├─ dynamic-table.onAdd() → persistirTablaConLog()
   ├─ Usa: setField() + persistFields()
   └─ Guarda con prefijo: 'miTabla_A1', 'miTabla_B2'

6. RELOAD
   ├─ localStorage tiene 'miTabla_A1' (con prefijo)
   ├─ Signal lee selectTableData() (maneja prefijo) 👈
   └─ Form y View muestran datos correctamente
```

### ❌ Flujo INCORRECTO (Causas de bugs)

```
1. SIGNAL (ERROR)
   └─ Solo selectField('miTabla') ← No maneja prefijos

2. EFFECT 1 (ERROR)
   └─ No existe ← Form no sincroniza con State

3. HANDLER (ERROR)
   └─ No usa selectTableData() ← Pierde datos con prefijo

4. ESTRUCTURA INICIAL (ERROR)
   └─ [{ ... }] ← Sobrescribe en 3+ filas

5. Sin cdRef.detectChanges() (ERROR)
   └─ Cambios no se ven hasta próxima detección
```

### Checklist para Arreglar Tabla Rota

```
[ ] ¿Signal usa dual fallback? selectField() ?? selectTableData() ?? []
[ ] ¿estructuraInicial es []? (NO [{ ... }])
[ ] ¿Existe EFFECT 1 en constructor?
[ ] ¿Handler llama selectTableData()?
[ ] ¿Handler actualiza this.datos?
[ ] ¿Handler llama onFieldChange()?
[ ] ¿Handler llama cdRef.detectChanges()?
[ ] ¿HTML dynamic-table usa [tablaKey]="'miTabla'"?
[ ] ¿Test: Agregar 3 filas → Reload → ¿Se ven en form y view?
```

---

## 🎯 EJEMPLO REAL - Sección 12 Tabla COMPLETA

Esta es la implementación CORRECTA 100% para una tabla con prefijo dinámico:

### Form Component (seccion12-form.component.ts)

```typescript
export class Seccion12FormComponent extends BaseSectionComponent implements OnDestroy {
  @Input() override seccionId: string = '3.1.12';
  @Input() override modoFormulario: boolean = false;

  // ✅ SIGNAL: Dual fallback obligatorio
  readonly tablaSaludSignal: Signal<any[]> = computed(() => {
    const directField = this.projectFacade.selectField(this.seccionId, null, 'caracteristicasSalud')();
    const tableData = this.projectFacade.selectTableData(this.seccionId, null, 'caracteristicasSalud')();
    return directField ?? tableData ?? [];
  });

  constructor(cdRef: ChangeDetectorRef, injector: Injector) {
    super(cdRef, injector);

    // ✅ EFFECT 1: Sincronización obligatoria
    effect(() => {
      const sectionData = this.formDataSignal();
      this.datos = { ...this.projectFacade.obtenerDatos(), ...sectionData };
      this.cdRef.markForCheck();
    });
  }

  // ✅ HANDLER: Sincronización inmediata
  onCaracteristicasSaludTableUpdated(updatedData?: any[]): void {
    const tablaDelState = this.projectFacade.selectTableData(
      this.seccionId, null, 'caracteristicasSalud'
    )();
    const datos = tablaDelState || updatedData || [];
    
    this.datos['caracteristicasSalud'] = datos;
    this.onFieldChange('caracteristicasSalud', datos, { refresh: true });
    this.cdRef.detectChanges(); // ← INMEDIATO
  }
}
```

### View Component (seccion12-view.component.ts)

```typescript
export class Seccion12ViewComponent extends BaseSectionComponent implements OnDestroy {
  @Input() override seccionId: string = '3.1.12';
  @Input() override modoFormulario: boolean = false;

  // ✅ SIGNAL: IDÉNTICA a form.component
  readonly tablaSaludSignal: Signal<any[]> = computed(() => {
    const directField = this.projectFacade.selectField(this.seccionId, null, 'caracteristicasSalud')();
    const tableData = this.projectFacade.selectTableData(this.seccionId, null, 'caracteristicasSalud')();
    return directField ?? tableData ?? [];
  });

  constructor(cdRef: ChangeDetectorRef, injector: Injector) {
    super(cdRef, injector);

    // ✅ EFFECT 1: Idéntica a form.component
    effect(() => {
      const sectionData = this.formDataSignal();
      this.datos = { ...this.projectFacade.obtenerDatos(), ...sectionData };
      this.cdRef.markForCheck();
    });
  }
}
```

### HTML Form Template

```html
<!-- ✅ CRÍTICO: [tablaKey]="'caracteristicasSalud'" SIN prefijo -->
<app-dynamic-table
  [datos]="datos"
  [columns]="[
    { field: 'caracteristica', label: 'Característica', readonly: true },
    { field: 'casos', label: 'Casos', readonly: false },
    { field: 'porcentaje', label: '%', readonly: true }
  ]"
  [sectionId]="seccionId"
  [tablaKey]="'caracteristicasSalud'"
  [showAddButton]="true"
  (tableUpdated)="onCaracteristicasSaludTableUpdated($event)">
</app-dynamic-table>
```

### HTML View Template

```html
<!-- ✅ MISMO HTML pero sin dynamic-table (solo lectura) -->
<table>
  <tr *ngFor="let item of tablaSaludSignal()">
    <td>{{ item.caracteristica }}</td>
    <td>{{ item.casos }}</td>
    <td>{{ item.porcentaje }}</td>
  </tr>
</table>
```

---

## 📚 CONCLUSIÓN - Patrón Universal Para Tablas

**Esta es la ÚNICA forma correcta de implementar tablas con prefijo dinámico:**

1. **Signal:** `selectField() ?? selectTableData() ?? []`
2. **HTML:** `[tablaKey]="'sinkPrefijo'"`
3. **Handler:** Lee con `selectTableData()` + Detecta cambios
4. **EFFECT 1:** Sincroniza `formDataSignal()` a `this.datos`
5. **Estructura:** Inicializa como `[]` (nunca con datos)

**Sin esto:** Bugs garantizados (form no muestra datos, 3ª fila limpia todo, changes no aparecen inmediatamente)

**Con esto:** 100% funcional en form y view, con sincronización perfecta y reload-safe

**IMPORTANTE:** Después de completar la refactorización, eliminar los archivos originales deprecados (`seccionX.component.ts` y `seccionX.component.html`) para mantener la estructura limpia del patrón MODO IDEAL.

