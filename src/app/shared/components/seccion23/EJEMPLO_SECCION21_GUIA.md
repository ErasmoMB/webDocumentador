# 📘 EJEMPLO A SEGUIR: SECCIÓN 21 - 100% UNICA VERDAD

**Versión:** 1.0  
**Fecha:** 22 de febrero de 2026  
**Propósito:** Documentar la sección 21 como el ejemplo a seguir para todas las demás secciones.

---

## 📋 Tabla de Contenidos

1. [Filosofía](#1-filosofía)
2. [Estructura de Archivos](#2-estructura-de-archivos)
3. [Constants](#3-constants)
4. [Form Component](#4-form-component)
5. [View Component](#5-view-component)
6. [Patrones de Implementación](#6-patrones-de-implementación)
7. [Flujo de Datos](#7-flujo-de-datos)
8. [Resumen de Funcionalidades](#8-resumen-de-funcionalidades)

---

## 1. FILOSOFÍA

La sección 21 cumple 100% con la arquitectura UNICA VERDAD:

| Principio | Estado |
|-----------|--------|
| Fuente Única de Verdad (ProjectStateFacade) | ✅ |
| Reactividad 100% (Signals) | ✅ |
| Separación Form/View | ✅ |
| Persistencia completa | ✅ |
| Textos centralizados | ✅ |

---

## 2. ESTRUCTURA DE ARCHIVOS

```
seccion21/
├── seccion21-constants.ts          → Configuración centralizada (6410 chars)
├── seccion21-form.component.ts     → Lógica del formulario (27992 chars)
├── seccion21-form.component.html  → Template de edición (6297 chars)
├── seccion21-view.component.ts    → Lógica de presentación (11541 chars)
└── seccion21-view.component.html → Template de vista (3986 chars)
```

---

## 3. CONSTANTS

### 3.1 Campos Observados (WATCHED_FIELDS)

```typescript
export const SECCION21_WATCHED_FIELDS = [
  // Párrafos (pueden tener prefijo)
  'parrafoSeccion21_aisi_intro_completo',
  'parrafoSeccion21_centro_poblado_completo',
  
  // Datos históricos del centro poblado
  'leyCreacionDistrito',
  'fechaCreacionDistrito',
  'distritoAnterior',
  'origenPobladores1',
  'origenPobladores2',
  'departamentoOrigen',
  'anexosEjemplo',
  
  // Tabla de ubicación
  'ubicacionCpTabla',
  
  // Título y fuente de tabla
  'cuadroTituloUbicacionCp',
  'cuadroFuenteUbicacionCp',
  
  // Datos base
  'centroPobladoAISI',
  'provinciaSeleccionada',
  'departamentoSeleccionado',
  
  // Fotografías base (sin prefijo de grupo)
  ...Array.from({ length: 10 }, (_, i) => `fotografia${i + 1}Titulo`),
  ...Array.from({ length: 10 }, (_, i) => `fotografia${i + 1}Fuente`),
  ...Array.from({ length: 10 }, (_, i) => `fotografia${i + 1}Imagen`),
  
  // Fotografías con prefijo AISD (_A1, _A2, etc.)
  ...Array.from({ length: 10 }, (_, i) => `fotografia_A1${i + 1}Titulo`),
  ...Array.from({ length: 10 }, (_, i) => `fotografia_A1${i + 1}Fuente`),
  ...Array.from({ length: 10 }, (_, i) => `fotografia_A1${i + 1}Imagen`),
  
  // Fotografías con prefijo AISI (_B1, _B2, etc.)
  ...Array.from({ length: 10 }, (_, i) => `fotografia_B1${i + 1}Titulo`),
  ...Array.from({ length: 10 }, (_, i) => `fotografia_B1${i + 1}Fuente`),
  ...Array.from({ length: 10 }, (_, i) => `fotografia_B1${i + 1}Imagen`),
];
```

### 3.2 Configuración

```typescript
export const SECCION21_CONFIG = {
  sectionId: '3.1.4.B',
  title: 'Caracterización socioeconómica del Área de Influencia Social Indirecta (AISI)',
  photoPrefix: 'fotografia',
  maxPhotos: 10,
};
```

### 3.3 Templates (Textos Centralizados)

```typescript
export const SECCION21_TEMPLATES = {
  // TÍTULOS PRINCIPALES
  tituloSeccion: 'B. Caracterización socioeconómica del Área de Influencia Social Indirecta (AISI)',
  tituloSubseccion: 'B.1. Centro Poblado',
  labelEditarParrafos: 'Editar Párrafos',
  labelDatosParrafos: 'Datos para Generar Párrafos del Centro Poblado',

  // LABELS DE CAMPOS
  labelParrafoAISI: 'AISI - Introducción - Texto Completo',
  labelParrafoCentro: 'Centro Poblado - Texto Completo',
  labelLeyCreacion: 'Ley N° de Creación del Distrito',
  labelFechaCreacion: 'Fecha de Creación del Distrito',
  labelDistritoAnterior: 'Distrito Anterior',
  labelOrigenPobladores1: 'Origen de Pobladores (Lugar/Provincia)',
  labelOrigenPobladores2: 'Origen de Pobladores (Provincia)',
  labelDepartamentoOrigen: 'Departamento de Origen',
  labelAnexosEjemplo: 'Anexos Ejemplo',
  labelTituloUbicacion: 'Título del Cuadro',
  labelFuenteUbicacion: 'Fuente del Cuadro',
  labelFotografias: 'Fotografías de',

  // PLACEHOLDERS
  placeholderLey: 'Ej: 8004',
  placeholderFecha: 'Ej: 22 de febrero de 1935',
  placeholderDistrito: 'Ej: Caravelí',
  placeholderOrigen1: 'Ej: Caravelí',
  placeholderOrigen2: 'Ej: Parinacochas',
  placeholderDepartamento: 'Ej: Arequipa',
  placeholderAnexos: 'Ej: Llacsahuanca, Salome',
  placeholderTituloUbicacion: 'Ubicación referencial – Centro Poblado',
  placeholderFuenteUbicacion: 'Ej: GEADES (2024)',
  placeholderTituloFoto: 'Ej: Centro Poblado',
  placeholderFuenteFoto: 'Ej: GEADES, 2024',
};
```

---

## 4. FORM COMPONENT

### 4.1 Configuración Base

```typescript
@Component({
  imports: [CommonModule, FormsModule, CoreSharedModule],
  selector: 'app-seccion21-form',
  templateUrl: './seccion21-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export class Seccion21FormComponent extends BaseSectionComponent implements OnDestroy {
  @Input() override seccionId: string = SECCION21_CONFIG.sectionId;
  @Input() override modoFormulario: boolean = false;

  // ✅ EXPORTAR CONSTANTES PARA EL TEMPLATE
  readonly SECCION21_TEMPLATES = SECCION21_TEMPLATES;

  // ✅ REACTIVIDAD 100%
  override useReactiveSync: boolean = true;
  
  // PHOTO_PREFIX dinámico
  readonly photoPrefixSignal: Signal<string>;
  override PHOTO_PREFIX: string = '';
}
```

### 4.2 Signals (Computed)

| Signal | Descripción |
|--------|-------------|
| `formDataSignal` | Todos los datos de la sección desde ProjectStateFacade |
| `parrafoAisiSignal` | Párrafo AISI con placeholders dinámicos |
| `parrafoCentroSignal` | Párrafo centro poblado con placeholders |
| `fotosCacheSignal` | Fotografías con esquema de claves correcto |
| `ubicacionCpSignal` | Datos de la tabla de ubicación |
| `leyCreacionDistritoSignal` | Campo ley de creación |
| `fechaCreacionDistritoSignal` | Campo fecha de creación |
| `distritoAnteriorSignal` | Campo distrito anterior |
| `origenPobladores1Signal` | Campo origen 1 |
| `origenPobladores2Signal` | Campo origen 2 |
| `departamentoOrigenSignal` | Campo departamento |
| `anexosEjemploSignal` | Campo anexos |
| `cuadroTituloUbicacionCpSignal` | Título del cuadro |
| `cuadroFuenteUbicacionCpSignal` | Fuente del cuadro |
| `photoPrefixSignal` | Prefijo dinámico para fotos |
| `globalTableNumberSignal` | Numeración global de tabla |
| `globalPhotoNumbersSignal` | Numeración global de fotos |
| `ubicacionGlobalSignal` | Ubicación global desde metadata |
| `viewModel` | Agregado de todos los datos |

### 4.3 Ejemplo de Signal (Párrafo)

```typescript
readonly parrafoAisiSignal: Signal<string> = computed(() => {
  // 1. Leer texto personalizado
  const data = this.formDataSignal();
  const manual = data['parrafoSeccion21_aisi_intro_completo'];
  
  // 2. Si existe texto manual, retornarlo
  if (manual && manual.trim().length > 0) return manual;
  
  // 3. Si no, generar automáticamente usando template
  const centro = this.obtenerNombreCentroPobladoActual();
  // ... generación automática
  return resultado;
});
```

### 4.4 Ejemplo de Signal (Fotografías)

```typescript
readonly fotosCacheSignal: Signal<FotoItem[]> = computed(() => {
  const fotos: FotoItem[] = [];
  const basePrefix = 'fotografia';
  const groupPrefix = this.obtenerPrefijoGrupo();
  
  for (let i = 1; i <= 10; i++) {
    // Esquema correcto: {prefix}{i}{suffix}{group}
    const imgKey = groupPrefix 
      ? `${basePrefix}${i}Imagen${groupPrefix}` 
      : `${basePrefix}${i}Imagen`;
    const titKey = groupPrefix 
      ? `${basePrefix}${i}Titulo${groupPrefix}` 
      : `${basePrefix}${i}Titulo`;
    const fuenteKey = groupPrefix 
      ? `${basePrefix}${i}Fuente${groupPrefix}` 
      : `${basePrefix}${i}Fuente`;
    
    const titulo = this.projectFacade.selectField(this.seccionId, null, titKey)();
    const fuente = this.projectFacade.selectField(this.seccionId, null, fuenteKey)();
    const imagen = this.projectFacade.selectField(this.seccionId, null, imgKey)();
    
    if (imagen) {
      fotos.push({ 
        titulo: titulo || `Fotografía ${i}`, 
        fuente: fuente || 'GEADES, 2024', 
        imagen 
      } as FotoItem);
    }
  }
  return fotos;
});
```

### 4.5 Handlers de Cambio

| Handler | Persistencia |
|---------|-------------|
| `actualizarParrafoAisi(valor)` | `formChange.persistFields('text', {...})` |
| `actualizarParrafoCentro(valor)` | `formChange.persistFields('text', {...})` |
| `onLeyCreacionDistritoChange(valor)` | `formChange.persistFields('form', {...})` |
| `onFechaCreacionDistritoChange(valor)` | `formChange.persistFields('form', {...})` |
| `onDistritoAnteriorChange(valor)` | `formChange.persistFields('form', {...})` |
| `onOrigenPobladores1Change(valor)` | `formChange.persistFields('form', {...})` |
| `onOrigenPobladores2Change(valor)` | `formChange.persistFields('form', {...})` |
| `onDepartamentoOrigenChange(valor)` | `formChange.persistFields('form', {...})` |
| `onAnexosEjemploChange(valor)` | `formChange.persistFields('form', {...})` |
| `onTituloUbicacionChange(valor)` | `formChange.persistFields('form', {...})` |
| `onFuenteUbicacionChange(valor)` | `formChange.persistFields('form', {...})` |
| `onTablaUpdated()` | `formChange.persistFields('table', {...})` |
| `agregarUbicacionCp()` | `projectFacade.setField()` + persist |
| `eliminarUbicacionCp(index)` | `projectFacade.setField()` + persist |
| `actualizarUbicacionCp(index, field, value)` | `projectFacade.setField()` + persist |
| `onFotografiasChange(fotografias)` | `projectFacade.setFields()` + persist |

### 4.6 Ejemplo de Handler

```typescript
onTituloUbicacionChange(valor: string): void {
  const prefijo = this.obtenerPrefijoGrupo();
  const fieldId = prefijo ? `cuadroTituloUbicacionCp${prefijo}` : 'cuadroTituloUbicacionCp';
  
  // 1. Actualizar estado local
  this.datos[fieldId] = valor;
  this.datos['cuadroTituloUbicacionCp'] = valor; // Compatibilidad
  
  // 2. Actualizar ProjectStateFacade
  this.onFieldChange(fieldId, valor, { refresh: false });
  
  // 3. Persistir en backend/localStorage
  try { 
    this.formChange.persistFields(this.seccionId, 'form', { [fieldId]: valor }); 
  } catch (e) {}
  
  // 4. Forzar actualización de otros componentes
  try { 
    const { ViewChildHelper } = require('src/app/shared/utils/view-child-helper'); 
    ViewChildHelper.updateAllComponents('actualizarDatos'); 
  } catch (e) {}
  
  this.cdRef.markForCheck();
}
```

### 4.7 Effect para Recarga de Fotos

```typescript
effect(() => {
  // Monitorear cambios en fotos
  this.fotosCacheSignal();
  // Forzar actualización de la vista
  this.cdRef.markForCheck();
});
```

### 4.8 Template HTML

#### Párrafos Editables
```html
<app-paragraph-editor
  fieldId="parrafoSeccion21_aisi_intro_completo"
  [label]="SECCION21_TEMPLATES.labelParrafoAISI"
  [hint]="SECCION21_TEMPLATES.hintParrafoAISI"
  [rows]="4"
  [value]="parrafoAisiSignal()"
  (valueChange)="actualizarParrafoAisi($event)">
</app-paragraph-editor>
```

#### Campos de Texto
```html
<div class="form-field">
  <label class="label">{{ SECCION21_TEMPLATES.labelLeyCreacion }}</label>
  <input type="text" class="form-control"
    [value]="leyCreacionDistritoSignal()"
    (input)="onLeyCreacionDistritoChange($any($event.target).value)"
    [placeholder]="SECCION21_TEMPLATES.placeholderLey">
</div>
```

#### Tabla Editable
```html
<app-dynamic-table
  [datos]="datos"
  [sectionId]="seccionId"
  [config]="ubicacionCpConfig"
  [columns]="columnasUbicacionCp"
  [tablaKey]="getTablaKeyUbicacionCp()"
  (tableUpdated)="onTablaUpdated()">
</app-dynamic-table>
```

#### Imágenes
```html
<app-image-upload
  [fotografias]="fotosCacheSignal()"
  [sectionId]="seccionId"
  [photoPrefix]="photoPrefixSignal()"
  [permitirMultiples]="true"
  [labelTitulo]="SECCION21_TEMPLATES.labelTituloFoto"
  [labelFuente]="SECCION21_TEMPLATES.labelFuenteFoto"
  [labelImagen]="SECCION21_TEMPLATES.labelImagenFoto"
  [placeholderTitulo]="SECCION21_TEMPLATES.placeholderTituloFoto + ': ' + tituloDefaultFotoSignal()"
  [placeholderFuente]="SECCION21_TEMPLATES.placeholderFuenteFoto"
  [tituloDefault]="tituloDefaultFotoSignal()"
  [fuenteDefault]="SECCION21_TEMPLATES.fuenteFotoDefault"
  [requerido]="false"
  (fotografiasChange)="onFotografiasChange($event)">
</app-image-upload>
```

---

## 5. VIEW COMPONENT

### 5.1 Configuración Base

```typescript
@Component({
  imports: [CommonModule, CoreSharedModule],
  selector: 'app-seccion21-view',
  templateUrl: './seccion21-view.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export class Seccion21ViewComponent extends BaseSectionComponent implements OnDestroy {
  @Input() override seccionId: string = SECCION21_CONFIG.sectionId;
  @Input() override modoFormulario: boolean = false;

  override useReactiveSync: boolean = true;
}
```

### 5.2 Signals (Replicar del Form)

```typescript
// REPLICAR EXACTAMENTE LOS MISMOS SIGNALS DEL FORM
readonly fotosCacheSignal: Signal<FotoItem[]> = computed(() => {
  // ... mismo código que en form
});

readonly parrafoAisiSignal: Signal<string> = computed(() => {
  // ... mismo código que en form
});

readonly viewModel = computed(() => ({
  fotos: this.fotosCacheSignal(),
  ubicacionCp: this.ubicacionCpSignal(),
  parrafoAisi: this.parrafoAisiSignal(),
  parrafoCentro: this.parrafoCentroSignal()
}));
```

### 5.3 Template HTML (Modo Vista)

```html
<!-- Párrafo (solo lectura) -->
<app-paragraph-editor 
  [value]="parrafoAisiSignal()" 
  [readonly]="true">
</app-paragraph-editor>

<!-- Tabla (solo lectura) -->
<app-dynamic-table 
  [datos]="ubicacionCpSignal()" 
  [readonly]="true">
</app-dynamic-table>

<!-- Imágenes (modo vista) -->
<app-image-upload
  [modoVista]="true"
  [permitirMultiples]="true"
  [fotografias]="fotosCacheSignal()"
  [sectionId]="seccionId"
  [photoPrefix]="PHOTO_PREFIX"
  [labelTitulo]="SECCION21_TEMPLATES.labelTituloFoto"
  [labelFuente]="SECCION21_TEMPLATES.labelFuenteFoto"
  [labelImagen]="SECCION21_TEMPLATES.labelImagenFoto">
</app-image-upload>
```

---

## 6. PATRONES DE IMPLEMENTACIÓN

### 6.1 Patrón: Signal con Placeholders

```typescript
readonly miCampoSignal: Signal<string> = computed(() => {
  // 1. Leer del store
  const data = this.formDataSignal();
  const valor = data['miCampo'];
  
  // 2. Si tiene valor, retornarlo
  if (valor && valor.trim().length > 0) return valor;
  
  // 3. Si no, generar desde template
  return this.reemplazarPlaceholders(MI_TEMPLATE);
});
```

### 6.2 Patrón: Handler de Cambio

```typescript
onMiCampoChange(valor: string): void {
  // 1. Actualizar estado local
  this.datos['miCampo'] = valor;
  
  // 2. Actualizar ProjectStateFacade
  this.onFieldChange('miCampo', valor);
  
  // 3. Persistir
  try { 
    this.formChange.persistFields(this.seccionId, 'form', { 'miCampo': valor }); 
  } catch (e) {}
  
  // 4. Forzar detección de cambios
  this.cdRef.markForCheck();
}
```

### 6.3 Patrón: Fotografías con Prefijos

```typescript
override onFotografiasChange(fotografias: FotoItem[]): void {
  const basePrefix = 'fotografia'; // Sin grupo
  const groupPrefix = this.obtenerPrefijoGrupo(); // _A1, _B1, o ''
  
  const updates: Record<string, any> = {};
  
  // Limpiar fotos anteriores
  for (let i = 1; i <= 10; i++) {
    const imgKey = groupPrefix 
      ? `${basePrefix}${i}Imagen${groupPrefix}` 
      : `${basePrefix}${i}Imagen`;
    updates[imgKey] = '';
    // ... limpiar título y fuente
  }
  
  // Guardar nuevas fotos
  fotografias.forEach((foto, index) => {
    if (foto.imagen) {
      const idx = index + 1;
      const imgKey = groupPrefix 
        ? `${basePrefix}${idx}Imagen${groupPrefix}` 
        : `${basePrefix}${idx}Imagen`;
      updates[imgKey] = foto.imagen;
      // ... guardar título y fuente
    }
  });
  
  // Persistir
  this.projectFacade.setFields(this.seccionId, null, updates);
  try { 
    this.formChange.persistFields(this.seccionId, 'images', updates); 
  } catch (e) {}
  
  this.cdRef.markForCheck();
}
```

---

## 7. FLUJO DE DATOS

### 7.1 Flujo de Lectura

```
ProjectStateFacade (Store)
       ↓ selectField()
Signal (computed)
       ↓
Template (HTML)
       ↓
Vista del usuario
```

### 7.2 Flujo de Escritura

```
Usuario/edición
       ↓ Input event
Handler (onXxxChange)
       ↓ onFieldChange()
ProjectStateFacade.setField()
       ↓
FormChangeService.persistFields()
       ↓
Backend / LocalStorage
       ↓
Effect detecta cambio
       ↓
ChangeDetector actualiza vista
```

---

## 8. RESUMEN DE FUNCIONALIDADES

| Funcionalidad | Sección 21 | Patrón |
|---------------|------------|--------|
| **Párrafos editables** | ✅ | `parrafoXxxSignal` + `actualizarParrafoXxx` |
| **Campos de texto** | ✅ | `campoXxxSignal` + `onCampoXxxChange` |
| **Tabla editable** | ✅ | `ubicacionCpSignal` + `onTablaUpdated` |
| **Título de tabla** | ✅ | `cuadroTituloXxxSignal` + `onTituloXxxChange` |
| **Fuente de tabla** | ✅ | `cuadroFuenteXxxSignal` + `onFuenteXxxChange` |
| **Imágenes** | ✅ | `fotosCacheSignal` + `onFotografiasChange` |
| **Título de imagen** | ✅ | En FotoItem + persistido |
| **Fuente de imagen** | ✅ | En FotoItem + persistido |
| **Persistencia** | ✅ | `formChange.persistFields()` |
| **Vista inmediata** | ✅ | `cdRef.markForCheck()` |
| **Recarga página** | ✅ | Signals + persistencia |
| **Numeración global** | ✅ | `globalNumberingService` |
| **Textos centralizados** | ✅ | `SECCIONXX_TEMPLATES` |

---

## ✅ CHECKLIST PARA NUEVAS SECCIONES

- [ ] Definir `SECCIONXX_WATCHED_FIELDS`
- [ ] Definir `SECCIONXX_CONFIG`
- [ ] Definir `SECCIONXX_TEMPLATES` con TODOS los textos
- [ ] Usar `useReactiveSync: true`
- [ ] Implementar signals con `computed()`
- [ ] Implementar handlers con `onFieldChange()` + `persistFields()`
- [ ] Implementar `fotosCacheSignal` con esquema correcto
- [ ] Implementar `onFotografiasChange` override
- [ ] Agregar effect para recarga de fotos
- [ ] Replicar signals en View Component
- [ ] Usar constants en templates
- [ ] Probar: editar → vista inmediata → recargar página
