# GUIA: Refactorizacion Completa de Secciones con Constants

**Objetivo:** Eliminar 100% del hardcoding en una seccion y centralizar TODOS los textos en `*-constants.ts`.

**Patrones Referencia:**
- `seccion1-constants.ts` (Seccion 1 - Identificacion del Proyecto)
- `seccion2-constants.ts` (Seccion 2 - Delimitacion de Areas)

---

## META FINAL - OBLIGATORIA DESPUES DE REFACTORIZACION

### OBJETIVO UNICO: CERO HARDCODEADOS + ARQUITECTURA NUEVA COMPLETA

Despues de refactorizar una seccion, DEBE cumplir AMBAS:

#### 1. CERO HARDCODEADOS (100% Constantes)

```typescript
// ❌ PROHIBIDO - Despues de refactorizacion:
placeholder="Ej: Ingrese nombre"           // Hardcodeado
[labelTitulo]="'Titulo'"                   // Hardcodeado
return 'Texto por defecto'                 // Hardcodeado
{{ 'Mensaje' }}                            // Hardcodeado

// ✅ OBLIGATORIO - Despues de refactorizacion:
[placeholder]="SECCION_N_TEMPLATES.placeholderNombre"
[labelTitulo]="SECCION_N_TEMPLATES.labelFotoTitulo"
return SECCION_N_TEMPLATES.textoDefault
{{ SECCION_N_TEMPLATES.mensaje }}
```

**Validacion:**
```powershell
# Windows PowerShell:
powershell -Command "Select-String -Path 'src/app/shared/components/seccionN/*.ts' -Pattern \"return '\" | Select-Object -ExpandProperty Line"

# Esperar que NO aparezca:
# ❌ placeholder="...", [label]="'...'", return '...', {{ '...' }}
```

#### 2. ARQUITECTURA NUEVA COMPLETA (createAutoSyncField<T>())

```typescript
// ❌ PROHIBIDO - Despues de refactorizacion:
onFieldChange(fieldName: string, value: any) { ... }     // Legacy
stateSubscription: Subscription;                          // Legacy
ngOnDestroy() { this.stateSubscription?.unsubscribe(); }  // Legacy
this.datos?.campo                                          // Legacy

// ✅ OBLIGATORIO - Despues de refactorizacion:
readonly campo = this.createAutoSyncField('campo', initialValue)  // Signal reactivo
// NO hay onFieldChange()
// NO hay stateSubscription
// NO hay ngOnDestroy con unsubscribe
// Acceso: this.projectFacade.selectField(...) o computed()
```

**Validacion:**
```powershell
# Windows PowerShell:
powershell -Command "Select-String -Path 'src/app/shared/components/seccionN/*.ts' -Pattern 'onFieldChange' | Select-Object -ExpandProperty Line"

# Esperar: 0 resultados = ✅ ARQUITECTURA NUEVA
```

---

## ESTADO ACTUAL DE SECCIONES

| Secc | Hardcodeados | Constantes | Arquitectura | Estado |
|------|--------------|-----------|--------------|--------|
| **1** | ✅ 0 | 50+ | ✅ Completa | ✅ LISTA |
| **2** | ✅ 0 | 50+ | ✅ Completa | ✅ LISTA |
| **3** | ✅ 0 | 15+ | ⚠️ Parcial | ✅ LISTA |
| **4** | ✅ 0 | 40+ | ⚠️ Parcial | ✅ LISTA |
| **5-30** | ❌ 100+ | 0 | ❌ Legacy | ⏳ Pendiente |

---

## EJEMPLO COMPLETO: Seccion 1 y 2 (ARQUITECTURA NUEVA)

### 2.1 Seccion-Form Component (PATRON COMPLETO)

```typescript
// src/app/shared/components/seccion1/seccion1-form.component.ts

// 1️⃣ IMPORTS
import { Component, ChangeDetectorRef, Injector, ChangeDetectionStrategy, Signal, computed, effect, Input } from '@angular/core';
import { ProjectStateFacade } from '../../../core/state/project-state.facade';
import { BaseSectionComponent } from '../base-section.component';
import { SECCION1_WATCHED_FIELDS, SECCION1_TEMPLATES } from './seccion1-constants';

// 2️⃣ DECLARACION DEL COMPONENTE
export class Seccion1FormComponent extends BaseSectionComponent {
  @Input() override seccionId: string = SECCION1_SECTION_ID;
  @Input() override modoFormulario: boolean = true;

  // ✅ Exportar TEMPLATES para el HTML
  readonly SECCION1_TEMPLATES = SECCION1_TEMPLATES;
  override readonly PHOTO_PREFIX = 'fotografiaSeccion1';
  override useReactiveSync: boolean = true;
  override watchedFields: string[] = SECCION1_WATCHED_FIELDS;

  // 3️⃣ SEÑALES REACTIVAS CON createAutoSyncField (NUEVA ARQUITECTURA)
  readonly projectName = this.createAutoSyncField('projectName', '');
  readonly parrafoPrincipal = this.createAutoSyncField('parrafoSeccion1_principal', '');
  readonly parrafoIntroduccion = this.createAutoSyncField('parrafoSeccion1_4', '');
  readonly objetivosSeccion1 = this.createAutoSyncField<string[]>('objetivosSeccion1', []);
  readonly geoInfoField = this.createAutoSyncField<any>('geoInfo', {});

  // 4️⃣ SIGNALS COMPUTED PARA DATOS DERIVADOS
  readonly formDataSignal: Signal<Record<string, any>> = computed(() =>
    this.projectFacade.selectSectionFields(this.seccionId, null)()
  );

  readonly projectNameSignal: Signal<string> = computed(() => {
    return this.projectFacade.selectField(this.seccionId, null, 'projectName')() || '____';
  });

  // 5️⃣ CONSTRUCTOR
  constructor(
    cdRef: ChangeDetectorRef,
    injector: Injector
  ) {
    super(cdRef, injector);
    
    // ✅ Inicializar campos desde store O fallback
    this.inicializarCamposDesdeStore();
  }

  // 6️⃣ INICIALIZACION CON FALLBACK
  private inicializarCamposDesdeStore(): void {
    const parrafoPrincipalValue = this.projectFacade.selectField(this.seccionId, null, 'parrafoSeccion1_principal')() 
      || this.obtenerTextoParrafoPrincipal();
    this.parrafoPrincipal.update(parrafoPrincipalValue);
    
    const objetivosValue = this.projectFacade.selectField(this.seccionId, null, 'objetivosSeccion1')();
    if (Array.isArray(objetivosValue) && objetivosValue.length > 0) {
      this.objetivosSeccion1.update(objetivosValue);
    } else {
      this.objetivosSeccion1.update([
        this.getObjetivoDefault(0),
        this.getObjetivoDefault(1)
      ]);
    }
  }

  // 7️⃣ METODOS CRUD USANDO SEÑALES
  agregarObjetivo(): void {
    const actuales = this.objetivosSeccion1.value();
    const nuevos = [...actuales, ''];
    this.objetivosSeccion1.update(nuevos);
    this.cdRef.markForCheck();
  }

  eliminarObjetivo(index: number): void {
    const actuales = this.objetivosSeccion1.value();
    if (actuales.length > 1) {
      const nuevos = actuales.filter((_, i) => i !== index);
      this.objetivosSeccion1.update(nuevos);
      this.cdRef.markForCheck();
    }
  }

  actualizarObjetivo(index: number, valor: string): void {
    const actuales = this.objetivosSeccion1.value();
    if (index >= 0 && index < actuales.length && actuales[index] !== valor) {
      const nuevos = [...actuales];
      nuevos[index] = valor;
      this.objetivosSeccion1.update(nuevos);
      this.cdRef.markForCheck();
    }
  }
}
```

### 2.2 HTML Form Template (PATRON COMPLETO)

```html
<!-- src/app/shared/components/seccion1/seccion1-form.component.html -->

<!-- ✅ Parrafo editable con signal -->
<app-paragraph-editor
  fieldId="parrafoSeccion1_principal"
  [label]="SECCION1_TEMPLATES.labelParrafoPrincipal"
  [hint]="SECCION1_TEMPLATES.hintParrafoPrincipal"
  [rows]="8"
  [value]="parrafoPrincipal.value()"
  (valueChange)="parrafoPrincipal.update($event)">
</app-paragraph-editor>

<!-- ✅ Lista editable con signals -->
<div *ngFor="let objetivo of objetivosSeccion1.value(); let i = index; trackBy: trackByIndex">
  <input 
    type="text" 
    [ngModel]="objetivo"
    (ngModelChange)="actualizarObjetivo(i, $event)"
    [placeholder]="SECCION1_TEMPLATES.placeholderObjetivo">
  <button (click)="eliminarObjetivo(i)">{{ SECCION1_TEMPLATES.btnEliminar }}</button>
</div>
<button (click)="agregarObjetivo()">{{ SECCION1_TEMPLATES.btnAgregar }}</button>

<!-- ✅ Campo simple con signal -->
<input 
  type="text"
  [ngModel]="projectName.value()"
  (ngModelChange)="projectName.update($event)"
  [placeholder]="SECCION1_TEMPLATES.placeholderProjectName">
```

### 2.3 Seccion-View Component (LECTURA REACTIVA)

```typescript
// src/app/shared/components/seccion1/seccion1-view.component.ts

export class Seccion1ViewComponent extends BaseSectionComponent {
  readonly SECCION1_TEMPLATES = SECCION1_TEMPLATES;

  // ✅ Signal computado para datos
  readonly formDataSignal: Signal<Record<string, any>> = computed(() =>
    this.projectFacade.selectSectionFields(this.seccionId, null)()
  );

  // ✅ Signal para mostrar texto con fallback
  readonly parrafoPrincipalSignal: Signal<string> = computed(() => {
    const formData = this.formDataSignal();
    const guardado = formData['parrafoSeccion1_principal'];
    if (guardado) return this.reemplazarPlaceholdersEnParrafo(guardado);
    return this.obtenerTextoParrafoPrincipal();
  });

  // ✅ Para vista: retorna objetivos con reemplazo de placeholders
  obtenerObjetivosParaVista(): string[] {
    const proyecto = this.projectNameSignal();
    return this.objetivosSeccion1.value().map(o => (o || '').replace(/____/g, proyecto));
  }
}
```

### 2.4 HTML View Template (SOLO LECTURA)

```html
<!-- src/app/shared/components/seccion1/seccion1-view.component.html -->

<!-- ✅ Parrafo desde signal computado -->
<div *ngIf="parrafoPrincipalSignal() as parrafo" 
     class="text-justify" 
     [innerHTML]="formatearParrafo(parrafo)">
</div>

<!-- ✅ Lista desde signal -->
<ul>
  <li *ngFor="let objetivo of obtenerObjetivosParaVista()">{{ objetivo }}</li>
</ul>
```

### 2.5 Constants Completo

```typescript
// src/app/shared/components/seccion1/seccion1-constants.ts
export const SECCION1_WATCHED_FIELDS = [
  'projectName',
  'parrafoSeccion1_principal',
  'parrafoSeccion1_4',
  'objetivosSeccion1',
  'geoInfo',
  'centrosPobladosJSON',
  'comunidadesCampesinas',
  ...Array.from({ length: 10 }, (_, i) => `fotografiaSeccion1${i + 1}Titulo`),
  ...Array.from({ length: 10 }, (_, i) => `fotografiaSeccion1${i + 1}Fuente`),
  ...Array.from({ length: 10 }, (_, i) => `fotografiaSeccion1${i + 1}Imagen`),
];

export const SECCION1_SECTION_ID = '3.1.1';

export const SECCION1_TEMPLATES = {
  // Textos principales
  tituloSeccion: 'Identificacion del proyecto y area de estudio',
  labelParrafoPrincipal: 'Parrafo Principal',
  hintParrafoPrincipal: 'Edite el texto principal del proyecto',
  placeholderProjectName: 'Ej: Nombre del proyecto minero',
  
  // Labels
  labelProjectName: 'Nombre del Proyecto',
  labelObjetivo: 'Objetivo',
  btnAgregar: '+ Agregar Objetivo',
  btnEliminar: 'Eliminar',
  
  // Placeholders
  placeholderObjetivo: 'Ingrese el objetivo del proyecto',
  
  // Fotografias
  labelFotoTitulo: 'Titulo de la fotografia',
  labelFotoFuente: 'Fuente',
  labelFotoImagen: 'Imagen',
  placeholderFotoTitulo: 'Ej: Vista del area del proyecto',
  placeholderFotoFuente: 'Ej: GEADES, 2024',
  tituloFotoDefault: 'Seccion 1',
  fuenteFotoDefault: 'GEADES, 2024',
};

// Valores por defecto con template
export const OBJETIVO_DEFAULT_1 = `El objetivo general del proyecto {projectName} es realizar actividades de exploracion minera...`;
export const OBJETIVO_DEFAULT_2 = `Los objetivos especificos del proyecto son: analizar las caracteristicas del suelo...`;
```

### 2.6 Checklist de Validacion Final

```powershell
# Windows PowerShell:
powershell -Command "Select-String -Path 'src/app/shared/components/seccionN/*.ts' -Pattern 'onFieldChange' | Select-Object -ExpandProperty Line"

# Verificar: 0 resultados = ✅ EXITO
```

**TODOS estos deben pasar:**
- [ ] 0 `onFieldChange()` en TS
- [ ] 0 hardcodeados de texto visible
- [ ] Todos los textos en `SECCION_N_TEMPLATES`
- [ ] `createAutoSyncField` para campos editables
- [ ] `[value]="campo.value()"` en HTML
- [ ] `(valueChange)="campo.update($event)"` en HTML
- [ ] `computed()` para datos derivados
- [ ] Inicializacion con fallback en `onInitCustom()`

---

## GUIA: Refactorizacion Completa de Secciones con Constants

### 1. CAMPOS OBSERVADOS (PERSISTENCIA)

```typescript
export const SECCION_N_WATCHED_FIELDS = [
  'parrafoSeccionN_campo1',
  'parrafoSeccionN_campo2',
  'tabla1',
  'tabla2',
  // Fotos (si aplica)
  ...Array.from({ length: 10 }, (_, i) => `fotografiaSeccionN${i + 1}Titulo`),
  ...Array.from({ length: 10 }, (_, i) => `fotografiaSeccionN${i + 1}Fuente`),
  ...Array.from({ length: 10 }, (_, i) => `fotografiaSeccionN${i + 1}Imagen`),
];
```

### 2. CONFIGURACION (METADATOS)

```typescript
export const SECCION_N_CONFIG = {
  sectionId: '3.1.N',
  title: 'Titulo de la Seccion',
  photoPrefix: 'fotografiaSeccionN',
  maxPhotos: 10,
};
```

### 3. TEMPLATES (TEXTOS - TODO CENTRALIZADO)

```typescript
export const SECCION_N_TEMPLATES = {
  // Textos principales por defecto
  introduccionDefault: '...',
  metodologiaDefault: '...',
  
  // Labels de formularios
  labelCampo1: '...',
  labelCampo2: '...',
  
  // Placeholders
  placeholderCampo1: '...',
  placeholderCampo2: '...',
  
  // Mensajes vacios/fallback
  mensajeCampoVacio: '...',
  
  // Fotografias (si aplica)
  labelFotoTitulo: 'Titulo',
  labelFotoFuente: 'Fuente',
  labelFotoImagen: 'Imagen',
};
```

---

## PASO 1: Auditoria - Identificar Hardcoding

### 1.1 Buscar en Templates HTML

```powershell
# Windows PowerShell:
powershell -Command "Select-String -Path 'src/app/shared/components/seccionN/*.html' -Pattern \"'\" | Select-Object -ExpandProperty Line"
```

**Busca especificamente:**
- ✅ `[labelXxx]="'Texto Hardcodeado'"`
- ✅ `placeholder="Ej: Texto"`
- ✅ `{{ 'Texto Fijo' }}`
- ✅ Mensajes de error/vacio en el HTML

**Ejemplo - Encontrar en Seccion 3:**
```html
<!-- ❌ MAL (Hardcodeado):
[labelTitulo]="'Titulo'"

<!-- ✅ BIEN (Constants):
[labelTitulo]="SECCION3_TEMPLATES.labelFotoTitulo"
```

### 1.2 Buscar en Componentes TypeScript

```powershell
powershell -Command "Select-String -Path 'src/app/shared/components/seccionN/*.ts' -Pattern \"return '\" | Select-Object -ExpandProperty Line"
```

**Busca especificamente:**
- ✅ `return 'Texto largo hardcodeado'` en metodos
- ✅ `const texto = "..."`
- ✅ Template literals con `${...}` pero sin usar constants

**Ejemplo:**
```typescript
// ❌ MAL:
obtenerMensaje(): string {
  return 'Este es un mensaje por defecto';
}

// ✅ BIEN:
obtenerMensaje(): string {
  return SECCION3_TEMPLATES.mensajeDefault;
}
```

---

## PASO 2: Crear/Completar `SECCION_N_CONSTANTS.TS`

### 2.1 Template Minimo

```typescript
/**
 * ✅ SECCION_N_CONSTANTS
 * Constantes centralizadas para Seccion N - [Titulo]
 * - Campos observados para persistencia
 * - Configuracion de seccion
 * - Todos los textos centralizados
 */

export const SECCION_N_WATCHED_FIELDS = [
  // Agregar todos los campos que persisten
];

export const SECCION_N_CONFIG = {
  sectionId: '3.1.N',
  title: 'Titulo',
  photoPrefix: 'fotografiaSeccionN',
  maxPhotos: 10,
};

export const SECCION_N_TEMPLATES = {
  // TODO: Agregar todos los textos aqui
};
```

### 2.2 Categorizar Textos en Constants

**Categoria 1: Textos Principales**
```typescript
introduccionDefault: `Parrafo completo...`,
metodologiaDefault: `Parrafo completo...`,
fuentesPrimariasDefault: `Parrafo completo...`,
```

**Categoria 2: Labels**
```typescript
labelCampo1: 'Nombre del Campo',
labelFotoTitulo: 'Titulo de la Fotografia',
labelFotoFuente: 'Fuente',
```

**Categoria 3: Placeholders**
```typescript
placeholderCampo1: 'Ej: Ingrese valor',
placeholderFoto: 'Ej: Fotografia de...',
```

**Categoria 4: Mensajes Vacios**
```typescript
mensajeNoDatos: 'No hay datos registrados',
mensajeListaVacia: 'No hay elementos',
```

**Categoria 5: Valores por Defecto**
```typescript
tituloFotoDefault: 'Seccion N',
fuenteFotoDefault: 'GEADES, 2024',
```

---

## PASO 3: Refactorizar Templates HTML

### 3.1 Seccion-View (Solo Lectura)

**Antes:**
```html
<p>{{ PHOTO_PREFIX }}</p>
<p [innerHTML]="'No hay fotog...."></p>
[labelTitulo]="'Titulo'"
```

**Despues:**
```html
<p>{{ SECCION_N_TEMPLATES.introDefault }}</p>
<p [innerHTML]="SECCION_N_TEMPLATES.mensajeVacio"></p>
[labelTitulo]="SECCION_N_TEMPLATES.labelFotoTitulo"
```

### 3.2 Seccion-Form (Editable)

**Antes:**
```html
placeholder="Ej: Nombre"
[labelXxx]="'Etiqueta'"
```

**Despues:**
```html
[placeholder]="SECCION_N_TEMPLATES.placeholderNombre"
[labelXxx]="SECCION_N_TEMPLATES.labelXxx"
```

### 3.3 Checklist de Reemplazo

- [ ] Todos los `[label*]="'..'"` → `[label*]="SECCION_N_TEMPLATES.label..."`
- [ ] Todos los `placeholder="..."` → `[placeholder]="SECCION_N_TEMPLATES.placeholder..."`
- [ ] Todos los `{{ 'Texto Fijo' }}` → `{{ SECCION_N_TEMPLATES.textoFijo }}`
- [ ] Todos los fallback/mensajes → Constants

---

## PASO 4: Refactorizar Componentes TypeScript

### 4.1 View Component

**Antes:**
```typescript
obtenerTextoMetodologia(): string {
  const formData = this.formDataSignal();
  if (formData['parrafo']) return formData['parrafo'];
  return 'Texto por defecto hardcodeado muy largo...';
}
```

**Despues:**
```typescript
obtenerTextoMetodologia(): string {
  const formData = this.formDataSignal();
  if (formData['parrafo']) return formData['parrafo'];
  return SECCION_N_TEMPLATES.metodologiaDefaultFallback;
}
```

### 4.2 Form Component

**Antes:**
```typescript
columnasTabla = [
  { label: 'Nombre', placeholder: 'Ingrese nombre...' },
];
```

**Despues:**
```typescript
columnasTabla = [
  { label: SECCION_N_TEMPLATES.labelNombre, placeholder: SECCION_N_TEMPLATES.placeholderNombre },
];
```

### 4.3 Checklist de Reemplazo

- [ ] Importar: `import { SECCION_N_TEMPLATES } from './seccionN-constants';`
- [ ] Crear propiedad: `readonly SECCION_N_TEMPLATES = SECCION_N_TEMPLATES;`
- [ ] Reemplazar todos los `return 'Texto'` por `return SECCION_N_TEMPLATES.texto`
- [ ] Reemplazar labels hardcodeados en `columnasTabla`

---

## PASO 5: Identificar y Manejar Campos Dinamicos

**IMPORTANTE:** Algunos textos en parrafos y titulos contienen valores que DEBEN ser dinamicos (variables del proyecto).

### 5.1 Criterio para Identificar Campos Dinamicos

Un campo es dinamico si:
- ✅ Contiene un nombre de grupo/centro poblado/comunidad
- ✅ Contiene datos especificos del proyecto (proyecto, provincia, etc.)
- ✅ Se definieron en Seccion 1 o 2
- ✅ Se reutiliza en multiples parrafos/titulos
- ✅ El usuario debe poder editarlo/personalizarlo

### 5.2 Ejemplos de Campos Dinamicos

**EJEMPLO 1 - Parrafo con Nombre de Grupo (Seccion 2)**

❌ MALO (Hardcodeado):
```
"En cuanto al area de influencia social indirecta (AISI), 
se ha determinado que esta se encuentra conformada por el CP Cahuacho, 
capital distrital..."
```

✅ BIEN (Con placeholder):
```
"En cuanto al area de influencia social indirecta (AISI), 
se ha determinado que esta se encuentra conformada por el CP _____, 
capital distrital..."
```

✅ MEJOR (Con variable dinamica):
```typescript
// En constants:
parrafoAISITemplate: `En cuanto al area de influencia social indirecta (AISI), 
se ha determinado que esta se encuentra conformada por el CP {{nombreGrupoAISI}}, 
capital distrital...`

// En componente:
obtenerParrafoAISI(): string {
  const nombreGrupo = this.projectFacade.selectField('3.1.2', null, 'nombreGrupoAISI')();
  return SECCION_N_TEMPLATES.parrafoAISITemplate
    .replace('{{nombreGrupoAISI}}', nombreGrupo || '_____');
}
```

---

### 5.3 Checklist de Campos Dinamicos

**Al refactorizar cada seccion:**

- [ ] Buscar nombres especificos (ej: "Cahuacho", "CP", "provincia", "comunidad") en parrafos
- [ ] Buscar en titulos de tablas/cuadros
- [ ] Preguntarse: "¿Este valor debe venir de otra seccion?"
- [ ] Si SÍ → Hacerlo dinamico con template + `replace()` o Signal `computed()`
- [ ] Si NO → Centralizarlo en TEMPLATES como texto fijo

**Patron general:**
```typescript
// En TEMPLATES (con placeholder para edicion manual):
textoConPlaceholder: 'Texto ...CP _____... mas texto',

// O con variable (si viene de otra seccion):
textoConVariable: 'Texto ...CP {{nombreGrupo}}... mas texto',

// En componente (metodo):
obtenerTexto(): string {
  const nombre = this.projectFacade.selectField('3.1.2', null, 'nombreGrupo')();
  return SECCION_N_TEMPLATES.textoConVariable
    .replace('{{nombreGrupo}}', nombre || '_____');
}
```

---

## VALIDACION FINAL

### Checklist de Aceptacion

```powershell
# Verificar que no haya hardcodeados en HTML:
powershell -Command "Select-String -Path 'src/app/shared/components/seccionN/*.html' -Pattern \"'\" | Select-Object -ExpandProperty Line" | Select-String -NotMatch "TEMPLATES"
```

**TODOS estos deben pasar:**
- [ ] 0 hardcodeados de texto visible en TS
- [ ] 0 hardcodeados de texto visible en HTML
- [ ] 100% de textos en `SECCION_N_TEMPLATES`
- [ ] `createAutoSyncField` para campos editables
- [ ] `computed()` para datos derivados
- [ ] Sin `onFieldChange()` legacy
- [ ] Compila sin errores
- [ ] Funciona en navegador

---

## RECURSOS ADICIONALES

### Comandos utiles (Windows PowerShell)

```powershell
# Buscar onFieldChange (legacy)
powershell -Command "Select-String -Path 'src/app/shared/components/seccionN/*.ts' -Pattern 'onFieldChange' | Select-Object -ExpandProperty Line"

# Buscar hardcodeados en HTML
powershell -Command "Select-String -Path 'src/app/shared/components/seccionN/*.html' -Pattern \"'\" | Select-Object -ExpandProperty Line" | Select-String -NotMatch "TEMPLATES"

# Buscar return con strings
powershell -Command "Select-String -Path 'src/app/shared/components/seccionN/*.ts' -Pattern \"return '\" | Select-Object -ExpandProperty Line"
```

### Archivos de referencia
- `seccion1-constants.ts` - 100% refactorizada
- `seccion2-constants.ts` - 100% refactorizada
- `seccion1-form.component.ts` - Arquitectura nueva
- `seccion1-view.component.ts` - Arquitectura nueva
- `seccion2-form.component.ts` - Arquitectura nueva
- `seccion2-view.component.ts` - Arquitectura nueva
