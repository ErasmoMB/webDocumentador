# 📋 Guía de Migración de Secciones a Patrón Ideal

**Fecha:** 11 de febrero de 2026  
**Referencia:** Seccion8 (Estructura Ideal)  
**Objetivo:** Estandarizar todas las secciones con patrón consistente, mantenible y escalable

---

## 🎯 Estructura Final (4 Archivos + Constants)

Cada sección debe tener esta estructura:

```
src/app/shared/components/
├── seccionX/
│   ├── seccionX-constants.ts           ← Constantes compartidas
│   ├── seccionX-form.component.ts      ← Lógica de edición (423 líneas)
│   ├── seccionX-form.component.html    ← Template formulario
│   ├── seccionX-view.component.ts      ← Lógica de visualización (494 líneas)
│   └── seccionX-view.component.html    ← Template vista
└── forms/
    └── seccionX-form-wrapper.component.ts ← Wrapper minimalista (28 líneas)
```

### Distribución de Líneas:
- **form-wrapper**: ~28 líneas (delegación pura)
- **seccionX-form.ts**: ~400-450 líneas (edición)
- **seccionX-view.ts**: ~450-550 líneas (visualización)
- **constants.ts**: ~20-40 líneas (reutilizable)

**Total: ~5 archivos, < 1200 líneas por sección**

---

## 📄 1. Archivo de Constantes (`seccionX-constants.ts`)

**Ubicación:** `src/app/shared/components/seccionX/seccionX-constants.ts`

```typescript
/**
 * Constantes compartidas para Sección X
 * Usadas en form y view para evitar duplicación
 */

export const SECCIONX_WATCHED_FIELDS: string[] = [
  'grupoAISD',
  'provinciaSeleccionada',
  'textoParrafo1',
  'textoParrafo2',
  'tablaXDatos',
  'fotografiasX',
  // ... más campos que se usan en form y view
];

export const SECCIONX_PHOTO_PREFIXES = {
  GRUPO1: 'fotografiaGrupo1',
  GRUPO2: 'fotografiaGrupo2',
  GRUPO3: 'fotografiaGrupo3'
} as const;

export const SECCIONX_SECTION_ID = '3.1.X'; // ID de sección base
export const SECCIONX_DEFAULT_SUBSECTION = '3.1.X.1'; // Subsección default
```

**Propósito:**
- ✅ Eliminar duplicación entre form y view
- ✅ Mantener constantes en un único lugar
- ✅ Facilitar refactorización global
- ✅ Documentar las constantes críticas

---

## 🎨 2. Form-Wrapper Component (`seccionX-form-wrapper.component.ts`)

**Ubicación:** `src/app/shared/components/forms/seccionX-form-wrapper.component.ts`

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
  @Input() override seccionId: string = '3.1.X.1';

  constructor(
    cdRef: ChangeDetectorRef,
    injector: Injector
  ) {
    super(cdRef, injector);
  }

  protected override onInitCustom(): void { }
  protected override detectarCambios(): boolean { return false; }
  protected override actualizarValoresConPrefijo(): void { }
}
```

**Características:**
- ✅ **28 líneas exactas** - Minimalismo puro
- ✅ **Delegación total** - Solo pasa props a `SeccionXFormComponent`
- ✅ **Extiende BaseSectionComponent** - DI centralizado
- ✅ **Template inline** - Sin archivo HTML adicional
- ✅ **Modo formulario siempre activo** - `modoFormulario="true"`

**Propósito:** Proporcionar un punto de entrada en el sistema de enrutamiento sin complejidad.

---

## ✏️ 3. Form Component (`seccionX-form.component.ts`)

**Ubicación:** `src/app/shared/components/seccionX/seccionX-form.component.ts`

```typescript
import { Component, ChangeDetectorRef, Input, OnDestroy, ChangeDetectionStrategy, Injector, Signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { BaseSectionComponent } from '../base-section.component';
import { PrefijoHelper } from '../../utils/prefijo-helper';
import { FotoItem, ImageUploadComponent } from '../image-upload/image-upload.component';
import { CoreSharedModule } from '../../modules/core-shared.module';
// Importar servicios específicos si los hay
import { SECCIONX_WATCHED_FIELDS, SECCIONX_PHOTO_PREFIXES } from './seccionX-constants';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CoreSharedModule,
    ImageUploadComponent
  ],
  selector: 'app-seccionX-form',
  templateUrl: './seccionX-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SeccionXFormComponent extends BaseSectionComponent implements OnDestroy {
  @Input() override seccionId: string = '3.1.X.1';
  @Input() override modoFormulario: boolean = true;
  
  override readonly PHOTO_PREFIX = '';
  override useReactiveSync: boolean = true;
  readonly PHOTO_PREFIX_GRUPO1 = SECCIONX_PHOTO_PREFIXES.GRUPO1;
  readonly PHOTO_PREFIX_GRUPO2 = SECCIONX_PHOTO_PREFIXES.GRUPO2;
  readonly PHOTO_PREFIX_GRUPO3 = SECCIONX_PHOTO_PREFIXES.GRUPO3;
  
  fotografiasGrupo1FormMulti: FotoItem[] = [];
  fotografiasGrupo2FormMulti: FotoItem[] = [];
  fotografiasGrupo3FormMulti: FotoItem[] = [];
  
  fotografiasGrupo1Cache: FotoItem[] = [];
  fotografiasGrupo2Cache: FotoItem[] = [];
  fotografiasGrupo3Cache: FotoItem[] = [];

  override watchedFields: string[] = SECCIONX_WATCHED_FIELDS;

  private readonly regexCache = new Map<string, RegExp>();

  // ✅ SIGNAL PRINCIPAL: Lee todos los datos de la sección actual
  readonly formDataSignal: Signal<Record<string, any>> = computed(() => 
    this.projectFacade.selectSectionFields(this.seccionId, null)()
  );

  // ✅ SIGNAL AISLADO POR PREFIJO: Tabla de datos
  readonly tablaDatosSignal: Signal<any[]> = computed(() => {
    const formData = this.formDataSignal();
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
    const tablaKey = prefijo ? `tablaDatos${prefijo}` : 'tablaDatos';
    return Array.isArray(formData[tablaKey]) ? formData[tablaKey] : [];
  });

  // ✅ SIGNAL PARA VALIDAR CAMBIOS EN FOTOS (hash)
  readonly photoFieldsHash: Signal<string> = computed(() => {
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
    let hash = '';
    for (let i = 1; i <= 5; i++) {
      const key = `${this.PHOTO_PREFIX_GRUPO1}${i}${prefijo}`;
      const valor = this.projectFacade.selectField(this.seccionId, null, key)();
      hash += `${valor || ''}|`;
    }
    return hash;
  });

  constructor(
    cdRef: ChangeDetectorRef,
    injector: Injector,
    private sanitizer: DomSanitizer
    // Inyectar servicios específicos si los hay
  ) {
    super(cdRef, injector);

    // ✅ EFFECT 1: Actualizar cuando datos de sección cambian
    effect(() => {
      this.formDataSignal();
      this.tablaDatosSignal();
      this.cdRef.markForCheck();
    });

    // ✅ EFFECT 2: Actualizar fotos cuando hash cambia
    effect(() => {
      this.photoFieldsHash();
      this.cargarFotografias();
      this.cdRef.markForCheck();
    }, { allowSignalWrites: true });
  }

  // ✅ MÉTODOS HELPER para template
  onTableUpdated(updatedData?: any[]): void {
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
    const tablaKey = prefijo ? `tablaDatos${prefijo}` : 'tablaDatos';
    const datosActuales = updatedData || this.datos[tablaKey] || [];
    this.onFieldChange(tablaKey, datosActuales, { refresh: true });
    this.cdRef.detectChanges();
  }

  onFotografiasGrupo1Changed(fotos: FotoItem[]): void {
    this.fotogafrasGrupo1FormMulti = fotos;
    this.onGrupoFotografiasChange(this.PHOTO_PREFIX_GRUPO1, fotos);
  }

  obtenerPrefijo(): string {
    return PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();
    // Limpieza específica si la hay
  }
}
```

**Características Clave:**
- ✅ **Extiende BaseSectionComponent** - Hereda DI y ciclo de vida
- ✅ **Signals puros** - `computed()` para derivación de datos
- ✅ **Prefijo dinámico** - `PrefijoHelper.obtenerPrefijoGrupo(this.seccionId)`
- ✅ **Aislamiento por grupo** - Cada grupo tiene sus datos `${nombre}${prefijo}`
- ✅ **Effects automáticos** - Reactividad sin RxJS subscriptions
- ✅ **ChangeDetectionStrategy.OnPush** - Performance óptimo
- ✅ **Standalone** - Imports internos

**Aislamiento de Datos:**
```
Grupo AISD A.1 (seccionId = "3.1.X.A.1.1")
  ↓ obtenerPrefijoGrupo() → "A1"
  ↓ tablaDatos${prefijo} → "tablaDatosA1"
  ↓ Datos completamente aislados de otros grupos

Grupo AISD A.2 (seccionId = "3.1.X.A.2.1")
  ↓ obtenerPrefijoGrupo() → "A2"
  ↓ tablaDatos${prefijo} → "tablaDatosA2"
  ↓ Datos completamente aislados de A.1
```

---

## 👁️ 4. View Component (`seccionX-view.component.ts`)

**Ubicación:** `src/app/shared/components/seccionX/seccionX-view.component.ts`

```typescript
import { Component, ChangeDetectorRef, Input, ChangeDetectionStrategy, Injector, Signal, computed, effect, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { BaseSectionComponent } from '../base-section.component';
import { PrefijoHelper } from '../../utils/prefijo-helper';
import { FotoItem, ImageUploadComponent } from '../image-upload/image-upload.component';
import { CoreSharedModule } from '../../modules/core-shared.module';
import { SECCIONX_WATCHED_FIELDS, SECCIONX_PHOTO_PREFIXES } from './seccionX-constants';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    CoreSharedModule,
    ImageUploadComponent
  ],
  selector: 'app-seccionX-view',
  templateUrl: './seccionX-view.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    :host ::ng-deep .data-manual.has-data,
    :host ::ng-deep .data-section.has-data {
      background-color: transparent !important;
      padding: 0 !important;
      border-radius: 0 !important;
      font-weight: normal !important;
      color: inherit !important;
    }
  `]
})
export class SeccionXViewComponent extends BaseSectionComponent implements OnDestroy {
  @Input() override seccionId: string = '3.1.X.1';
  @Input() override modoFormulario: boolean = false;
  
  override readonly PHOTO_PREFIX = '';
  readonly PHOTO_PREFIX_GRUPO1 = SECCIONX_PHOTO_PREFIXES.GRUPO1;
  readonly PHOTO_PREFIX_GRUPO2 = SECCIONX_PHOTO_PREFIXES.GRUPO2;
  readonly PHOTO_PREFIX_GRUPO3 = SECCIONX_PHOTO_PREFIXES.GRUPO3;
  
  fotografiasGrupo1Cache: FotoItem[] = [];
  fotografiasGrupo2Cache: FotoItem[] = [];
  fotografiasGrupo3Cache: FotoItem[] = [];

  override watchedFields: string[] = SECCIONX_WATCHED_FIELDS;

  private readonly regexCache = new Map<string, RegExp>();

  // ✅ SIGNAL PRINCIPAL: Lee todos los datos de la sección actual
  readonly formDataSignal: Signal<Record<string, any>> = computed(() => 
    this.projectFacade.selectSectionFields(this.seccionId, null)()
  );

  // ✅ SIGNAL AISLADO POR PREFIJO: Tabla de datos
  readonly tablaDatosSignal: Signal<any[]> = computed(() => {
    const formData = this.formDataSignal();
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
    const tablaKey = prefijo ? `tablaDatos${prefijo}` : 'tablaDatos';
    return Array.isArray(formData[tablaKey]) ? formData[tablaKey] : [];
  });

  // ✅ SIGNAL DERIVADO: Tabla con cálculos
  readonly tablaDatosConPorcentajesSignal: Signal<any[]> = computed(() => {
    const tabla = this.tablaDatosSignal();
    if (!tabla || tabla.length === 0) return [];

    const total = tabla.reduce((sum, item) => sum + (item.valor || 0), 0);
    return tabla.map(item => ({
      ...item,
      porcentaje: total > 0 ? ((item.valor / total) * 100).toFixed(2) : '0.00'
    }));
  });

  constructor(
    cdRef: ChangeDetectorRef,
    injector: Injector,
    private sanitizer: DomSanitizer
  ) {
    super(cdRef, injector);

    // ✅ EFFECT: Actualizar cuando datos cambian
    effect(() => {
      this.formDataSignal();
      this.tablaDatosConPorcentajesSignal();
      this.cdRef.markForCheck();
    });
  }

  // ✅ MÉTODOS HELPER para template
  obtenerTitulo(): string {
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
    return `${prefijo ? prefijo + ' - ' : ''}Datos de la Sección X`;
  }

  obtenerTextoParrafo1(): string {
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
    const key = prefijo ? `textoParrafo1${prefijo}` : 'textoParrafo1';
    return this.datos[key] || '';
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();
  }
}
```

**Características Clave:**
- ✅ **Espejo de form** - Misma estructura y signals
- ✅ **Exclusivamente lectura** - No modifica datos
- ✅ **Signals derivados** - Cálculos sobre datos (porcentajes, totales, etc.)
- ✅ **Aislamiento por prefijo** - Mismo aislamiento que form
- ✅ **ChangeDetectionStrategy.OnPush** - Performance máximo
- ✅ **Effects para reactividad** - Sin subscriptions manuales

---

## 🗂️ Templates

### Form Template (`seccionX-form.component.html`)

```html
<div class="seccion-formulario-content">
  <div class="form-group-section">
    <h4 class="section-title">{{ obtenerTitulo() }}</h4>
    
    <!-- Párrafos editables -->
    <div class="form-group-section" style="margin-top: 20px;">
      <h5>Editar Párrafos</h5>
      
      <app-paragraph-editor
        fieldId="textoParrafo1"
        label="Párrafo 1"
        hint="Edite el texto. Use Enter para párrafos nuevos."
        [rows]="3"
        [value]="datos['textoParrafo1' + obtenerPrefijo()]"
        (valueChange)="onFieldChange('textoParrafo1' + obtenerPrefijo(), $event)">
      </app-paragraph-editor>
    </div>

    <!-- Tabla dinámica -->
    <div class="form-field" style="margin-top: 30px;">
      <label class="label">Tabla de Datos</label>
      <app-dynamic-table
        [datos]="datos"
        [columns]="columnsTableX"
        [sectionId]="seccionId"
        [tablaKey]="'tablaDatos' + obtenerPrefijo()"
        [showAddButton]="true"
        [showDeleteButton]="true"
        (tableUpdated)="onTableUpdated($event)">
      </app-dynamic-table>
    </div>

    <!-- Fotos -->
    <div class="form-field" style="margin-top: 30px;">
      <label class="label">Fotografías</label>
      <app-image-upload
        [prefix]="PHOTO_PREFIX_GRUPO1"
        [prefijo]="obtenerPrefijo()"
        [maxPhotos]="10"
        (photosChanged)="onFotografiasGrupo1Changed($event)">
      </app-image-upload>
    </div>
  </div>
</div>
```

### View Template (`seccionX-view.component.html`)

```html
<div class="seccion-view-content">
  <div class="view-section">
    <h5 class="view-title">{{ obtenerTitulo() }}</h5>
    
    <!-- Párrafos solo lectura -->
    <div class="view-paragraph-section">
      <p class="text-justify">{{ obtenerTextoParrafo1() }}</p>
    </div>

    <!-- Tabla solo lectura con datos calculados -->
    <div class="view-table-section" *ngIf="(tablaDatosConPorcentajesSignal() | async) as tabla">
      <h6 class="table-title">Datos de la Sección</h6>
      <div class="table-wrapper">
        <table class="view-table">
          <thead>
            <tr>
              <th class="view-table-header">Descripción</th>
              <th class="view-table-header">Valor</th>
              <th class="view-table-header">Porcentaje</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let item of tabla" class="view-table-row">
              <td class="view-table-cell">{{ item.descripcion }}</td>
              <td class="view-table-cell text-right">{{ item.valor | number:'1.0-0' }}</td>
              <td class="view-table-cell text-right">{{ item.porcentaje }}%</td>
            </tr>
            <tr *ngIf="tabla.length === 0" class="view-table-row-empty">
              <td colspan="3" class="view-table-cell text-center">No hay datos disponibles</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Galería de fotos solo lectura -->
    <div *ngIf="fotografiasGrupo1Cache && fotografiasGrupo1Cache.length > 0" class="view-gallery-section">
      <h6 class="gallery-title">Fotografías</h6>
      <div class="gallery-grid">
        <div *ngFor="let foto of fotografiasGrupo1Cache" class="gallery-item-view">
          <img [src]="foto.url" [alt]="foto.titulo" class="gallery-image">
          <div class="gallery-info">
            <p class="gallery-titulo">{{ foto.titulo }}</p>
            <small class="gallery-fuente">{{ foto.fuente }}</small>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
```

---

## 🔄 Patrón de Aislamiento de Datos

**Problema:** Seccion8 se usa en múltiples grupos AISD, necesita datos independientes.

**Solución:** Usar prefijos dinámicos per grupo.

### Ejemplo Práctico:

```typescript
// Usuario navega a Seccion8 en Grupo A.1
seccionId = "3.1.4.A.1.1"
prefijo = "A1"

// En el form:
readonly peaOcupacionesSignal = computed(() => {
  const formData = this.formDataSignal();
  const tablaKey = "peaOcupacionesTabla" + "A1" // → "peaOcupacionesTablaA1"
  return formData[tablaKey] ?? [];
});

// Datos guardados en estado:
estado.datos = {
  peaOcupacionesTablaA1: [...datos de A.1...],
  // Otros grupos NO afectan
}

// Usuario navega a Seccion8 en Grupo A.2
seccionId = "3.1.4.A.2.1"
prefijo = "A2"

// En el form:
readonly peaOcupacionesSignal = computed(() => {
  const formData = this.formDataSignal();
  const tablaKey = "peaOcupacionesTabla" + "A2" // → "peaOcupacionesTablaA2"
  return formData[tablaKey] ?? [];
});

// Datos guardados en estado:
estado.datos = {
  peaOcupacionesTablaA1: [...datos de A.1...], // ← AISLADO
  peaOcupacionesTablaA2: [...datos de A.2...], // ← AISLADO
}
```

**Ventajas:**
- ✅ Cada grupo tiene datos completamente independientes
- ✅ Cambios en A.1 no afectan A.2
- ✅ Mismo componente, múltiples usos
- ✅ Escalable a infinitos grupos

---

## ✅ Checklist de Migración

Para migrar cada sección al patrón, seguir este checklist:

```
SECCION X (3.1.X)

PASO 1: CREAR ARCHIVOS BASE
  [ ] Crear seccionX-constants.ts
      [ ] Listar SECCIONX_WATCHED_FIELDS
      [ ] Crear SECCIONX_PHOTO_PREFIXES (si hay fotos)
      [ ] Exportar SECCIONX_SECTION_ID
  
  [ ] Crear seccionX-form.component.ts
      [ ] Extiende BaseSectionComponent
      [ ] Implementa OnDestroy
      [ ] Import constantes
      [ ] watchedFields = SECCIONX_WATCHED_FIELDS
      [ ] formDataSignal = computed()
      [ ] Señales aisladas por prefijo
      [ ] Effects para reactividad
      [ ] Métodos helper para template
  
  [ ] Crear seccionX-form.component.html
      [ ] Template edit con form controls
      [ ] Usar dynamic-table si hay tablas
      [ ] Usar image-upload si hay fotos
  
  [ ] Crear seccionX-view.component.ts
      [ ] Espejo de form (same signals)
      [ ] Señales derivadas (cálculos)
      [ ] Solo lectura (no modifica)
      [ ] watchedFields = SECCIONX_WATCHED_FIELDS
  
  [ ] Crear seccionX-view.component.html
      [ ] Template visualización
      [ ] Usar app-table-wrapper
      [ ] Mostrar datos calculados

PASO 2: CREAR FORM-WRAPPER
  [ ] Crear forms/seccionX-form-wrapper.component.ts
      [ ] Extiende BaseSectionComponent
      [ ] @Input seccionId = "3.1.X.1"
      [ ] Template inline delegando
      [ ] 28 líneas máximo
      [ ] Métodos override vacíos

PASO 3: INTEGRACIÓN
  [ ] Registrar en seccion.component.ts componentLoaders
  [ ] Agregar imports en app.module si no standalone
  [ ] Verificar routing en app-routing.module.ts
  [ ] Probar navegación form ↔️ view

PASO 4: TESTING
  [ ] Abrir URL http://localhost:4200/seccion/3.1.X.1
      [ ] Form carga correctamente
      [ ] Datos se guardan al editar
      [ ] View muestra datos
  [ ] Navegar entre prefijos (si aplica)
      [ ] Datos A.1 NO afectan A.2
      [ ] Cambios persisten en localStorage
  [ ] Probar botones Anterior/Siguiente
  [ ] Probar persistencia en page reload

PASO 5: CLEANUP
  [ ] Eliminar archivos legacy si los hay
  [ ] Verificar imports en componentes
  [ ] Ejecutar lint: ng lint
  [ ] Ejecutar tests: npm test
```

---

## 📊 Comparativa: Antes vs Después

| Aspecto | ANTES | DESPUÉS |
|--------|-------|---------|
| **Archivos por sección** | 5-10+ (inconsistente) | 5 (consistente) |
| **Líneas totales** | 1500+ (variado) | ~1200 (estándar) |
| **Duplicación** | Mucha (`watchedFields`, prefijos) | Cero (constantes.ts) |
| **Aislamiento datos** | Manual/frágil | Automático vía prefijo |
| **Reactividad** | RxJS subscriptions | Signals + effects |
| **Form-wrapper** | Complejo | 28 líneas |
| **Mantenibilidad** | Difícil (patrones variados) | Fácil (patrón único) |
| **Testing** | Complicado (dependencias) | Simple (standalone) |
| **Reutilización** | Baja | Alta (mismo patrón) |

---

## 🚀 Guía de Implementación Rápida

### Paso 1: Copiar Template

```bash
# Clonar seccion8 como base para seccionX
cp -r src/app/shared/components/seccion8 src/app/shared/components/seccionX
cp src/app/shared/components/forms/seccion8-form-wrapper.component.ts \
   src/app/shared/components/forms/seccionX-form-wrapper.component.ts
```

### Paso 2: Refactorizar

```bash
# Cambiar nombres
# seccion8 → seccionX
# 3.1.8 → 3.1.X
# Usar find & replace en editor
```

### Paso 3: Validar

```bash
npm start
# Verificar compilación sin errores
# Probar navegación y persistencia
```

---

## 📚 Referencias

- **Arquitectura Principal**: `docs/ARCHITECTURE.md`
- **Data Flow**: `docs/DATA_FLOW.md`
- **Exemplo Funcional**: `src/app/shared/components/seccion8/`
- **Base Component**: `src/app/shared/components/base-section.component.ts`
- **PrefijoHelper**: `src/app/shared/utils/prefijo-helper.ts`

---

## 💡 Notas Importantes

1. **PrefijoHelper** es crítico:
   - Extrae prefijo del `seccionId`
   - Transforma "3.1.4.A.1.1" → "A1"
   - Usado en todas los aislamiento de datos

2. **Signals reemplazan RxJS**:
   - `computed()` para derivaciones
   - `effect()` para reactividad
   - Sin subscriptions manuales

3. **Aislamiento automático**:
   - Campo "tablaDatos" → "tablaDatos" + "A1" = "tablaDatosA1"
   - Cada grupo AISD tiene sus propios datos
   - Completo, automático, escalable

4. **Form-wrapper mínimo**:
   - No contiene lógica
   - Solo delega a componente principal
   - Punto de entrada en router

5. **View es espejo de Form**:
   - Mismas signals
   - Mismo aislamiento
   - Diferentes métodos de renderizado

---

**Autor:** Cocreador  
**Versión:** 1.0  
**Última actualización:** 11 de febrero de 2026
