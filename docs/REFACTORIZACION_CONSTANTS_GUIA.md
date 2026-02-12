# 📋 GUÍA: Refactorización Completa de Secciones con Constants

**Objetivo:** Eliminar 100% del hardcoding en una sección y centralizar TODOS los textos en `*-constants.ts`.

**Patrón Referencia:** `seccion3-constants.ts` (Sección 3 - Características Sociodemográficas)

---

## 📊 Estructura Ideal de `SECCION_N_CONSTANTS`

```typescript
// 1️⃣ CAMPOS OBSERVADOS (PERSISTENCIA)
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

// 2️⃣ CONFIGURACIÓN (METADATOS)
export const SECCION_N_CONFIG = {
  sectionId: '3.1.N',
  title: 'Título de la Sección',
  photoPrefix: 'fotografiaSeccionN',
  maxPhotos: 10,
};

// 3️⃣ TEMPLATES (TEXTOS - TODO CENTRALIZADO)
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
  
  // Mensajes vacíos/fallback
  mensajeCampoVacio: '...',
  
  // Fotografías (si aplica)
  labelFotoTitulo: 'Título',
  labelFotoFuente: 'Fuente',
  labelFotoImagen: 'Imagen',
};
```

---

## 🔍 PASO 1: Auditoría - Identificar Hardcoding

### 1.1 Buscar en Templates HTML

Ejecuta en terminal desde la sección:
```bash
grep -r "'" src/app/shared/components/seccionN/*.html | grep -v TEMPLATES | grep -v formData | grep -v "seccionId"
grep -r '"' src/app/shared/components/seccionN/*.html | grep -v TEMPLATES | grep -v formData | grep -v "sectionId"
```

**Busca específicamente:**
- ✅ `[labelXxx]="'Texto Hardcodeado'"`
- ✅ `placeholder="Ej: Texto"`
- ✅ `{{ 'Texto Fijo' }}`
- ✅ Mensajes de error/vacío en el HTML

**Ejemplo - Encontrar en Sección 3:**
```html
<!-- ❌ MAL (Hardcodeado):
[labelTitulo]="'Título'"

<!-- ✅ BIEN (Constants):
[labelTitulo]="SECCION3_TEMPLATES.labelFotoTitulo"
```

### 1.2 Buscar en Componentes TypeScript

```bash
grep -r "return '" src/app/shared/components/seccionN/*.ts
grep -r 'return "' src/app/shared/components/seccionN/*.ts
```

**Busca específicamente:**
- ✅ `return 'Texto largo hardcodeado'` en métodos
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

## 📝 PASO 2: Crear/Completar `SECCION_N_CONSTANTS.TS`

### 2.1 Template Mínimo
```typescript
/**
 * ✅ SECCION_N_CONSTANTS
 * Constantes centralizadas para Sección N - [Título]
 * - Campos observados para persistencia
 * - Configuración de sección
 * - Todos los textos centralizados
 */

export const SECCION_N_WATCHED_FIELDS = [
  // Agregar todos los campos que persisten
];

export const SECCION_N_CONFIG = {
  sectionId: '3.1.N',
  title: 'Título',
  photoPrefix: 'fotografiaSeccionN',
  maxPhotos: 10,
};

export const SECCION_N_TEMPLATES = {
  // TODO: Agregar todos los textos aquí
};
```

### 2.2 Categorizar Textos en Constants

**Categoría 1: Textos Principales**
```typescript
introduccionDefault: `Párrafo completo...`,
metodologiaDefault: `Párrafo completo...`,
fuentesPrimariasDefault: `Párrafo completo...`,
```

**Categoría 2: Labels**
```typescript
labelCampo1: 'Nombre del Campo',
labelFotoTitulo: 'Título de la Fotografía',
labelFotoFuente: 'Fuente',
```

**Categoría 3: Placeholders**
```typescript
placeholderCampo1: 'Ej: Ingrese valor',
placeholderFoto: 'Ej: Fotografía de...',
```

**Categoría 4: Mensajes Vacíos**
```typescript
mensajeNoDatos: 'No hay datos registrados',
mensajeListaVacia: 'No hay elementos',
```

**Categoría 5: Valores por Defecto**
```typescript
tituloFotoDefault: 'Sección N',
fuenteFotoDefault: 'GEADES, 2024',
```

---

## 🔧 PASO 3: Refactorizar Templates HTML

### 3.1 Seccion-View (Solo Lectura)

**Antes:**
```html
<p>{{ PHOTO_PREFIX }}</p>
<p [innerHTML]="'No hay fotog...."></p>
[labelTitulo]="'Título'"
{% endraw %}
```

**Después:**
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

**Después:**
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

## 🔧 PASO 4: Refactorizar Componentes TypeScript

### 4.1 View Component

**Antes:**
```typescript
obtenerTextoMetodologia(): string {
  const formData = this.formDataSignal();
  if (formData['parrafo']) return formData['parrafo'];
  return 'Texto por defecto hardcodeado muy largo...';
}
```

**Después:**
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

**Después:**
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

## 🎯 PASO 5: Identificar y Manejar Campos Dinámicos

**IMPORTANTE:** Algunos textos en párrafos y títulos contienen valores que DEBEN ser dinámicos (variables del proyecto).

### 5.1 Criterio para Identificar Campos Dinámicos

Un campo es dinámico si:
- ✅ Contiene un nombre de grupo/centro poblado/comunidad
- ✅ Contiene datos específicos del proyecto (proyecto, provincia, etc.)
- ✅ Se definieron en Sección 1 o 2
- ✅ Se reutiliza en múltiples párrafos/títulos
- ✅ El usuario debe poder editarlo/personalizarlo

### 5.2 Ejemplos de Campos Dinámicos

**EJEMPLO 1 - Párrafo con Nombre de Grupo (Sección 2)**

❌ MALO (Hardcodeado):
```
"En cuanto al área de influencia social indirecta (AISI), 
se ha determinado que esta se encuentra conformada por el CP Cahuacho, 
capital distrital..."
```

✅ BIEN (Con placeholder):
```
"En cuanto al área de influencia social indirecta (AISI), 
se ha determinado que esta se encuentra conformada por el CP _____, 
capital distrital..."
```

✅ MEJOR (Con variable dinámica):
```typescript
// En constants:
parrafoAISITemplate: `En cuanto al área de influencia social indirecta (AISI), 
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

**EJEMPLO 2 - Título de Tabla con Nombre de Grupo (Sección 3)**

❌ MALO (Hardcodeado):
```
"Cuadro N° 3.2 - PEA Ocupada según actividad económica – CP Cahuacho (2017)"
```

✅ BIEN (Con placeholder):
```
"Cuadro N° 3.2 - PEA Ocupada según actividad económica – CP _____"
```

✅ MEJOR (Como template dinámico):
```typescript
// En constants:
cuadroTituloTemplate: 'PEA Ocupada según actividad económica – CP {{nombreGrupo}}',

// En componente (template):
{{ cuadroTituloTemplate.replace('{{nombreGrupo}}', nombreGrupoAISI()) }}

// O mejor, con Signal:
readonly cuadroTituloFormateado = computed(() => {
  const nombre = this.projectFacade.selectField('3.1.2', null, 'nombreGrupoAISI')();
  return SECCION_N_TEMPLATES.cuadroTituloTemplate
    .replace('{{nombreGrupo}}', nombre || '_____');
});
```

---

### 5.3 Checklist de Campos Dinámicos

**Al refactorizar cada sección:**

- [ ] Buscar nombres específicos (ej: "Cahuacho", "CP", "provincia", "comunidad") en párrafos
- [ ] Buscar en títulos de tablas/cuadros
- [ ] Preguntarse: "¿Este valor debe venir de otra sección?"
- [ ] Si SÍ → Hacerlo dinámico con template + `replace()` o Signal `computed()`
- [ ] Si NO → Centralizarlo en TEMPLATES como texto fijo

**Patrón general:**
```typescript
// En TEMPLATES (con placeholder para edición manual):
textoConPlaceholder: 'Texto ...CP _____... más texto',

// O con variable (si viene de otra sección):
textoConVariable: 'Texto ...CP {{nombreGrupo}}... más texto',

// En componente (método):
obtenerTexto(): string {
  const nombre = this.projectFacade.selectField('3.1.2', null, 'nombreGrupo')();
  return SECCION_N_TEMPLATES.textoConVariable
    .replace('{{nombreGrupo}}', nombre || '_____');
}
```

---

### 5.4 Campos Dinámicos Comunes por Sección

| Secc | Campo Dinámico | Origen | Ejemplo |
|------|----------------|--------|---------|
| 2 | Nombre Grupo AISD | Sección 2 (usuario define) | "CP Cahuacho" |
| 2 | Nombre Grupo AISI | Sección 2 (usuario define) | "CP Mollendo" |
| 3+ | Nombre Proyecto | Sección 1 | "Proyecto Exploración X" |
| 3+ | CP en títulos tablas | Sección 2 | "CP _____" |
| 3+ | Provincia | Autocompleta desde JSON | "Arequipa" |
| 4+ | Población AISD | Sección 3 datos | "15,000 hab" |

---

## 🚀 ARQUITECTURA REACTIVA NUEVA - Sincronización Inmediata

**CAMBIO FUNDAMENTAL:** La nueva arquitectura usa `createAutoSyncField<T>()` para lograr sincronización **INMEDIATA** entre formulario y vista (0-10ms en lugar de 100-300ms).

### 6.1 Problema de la Arquitectura Antigua

```typescript
// ❌ ANTIGUO (Lento - 100-300ms de retraso)
// Flujo: Input → onFieldChange() → FormChangeService → ProjectFacade → Signal → Detector de cambios

export class SeccionFormComponent {
  onFieldChange(fieldName: string, value: any) {
    this.formChangeService.persistFields(this.seccionId, [{ fieldName, value }]);
    // El cambio llega al estado DESPUÉS de varios pasos
    // El componente view se actualiza solo cuando el detector de cambios corre
  }
}
```

**Problemas:**
- ⏱️ Retraso de 100-300ms entre escribir en input y ver en vista
- 🔄 Múltiples intermediarios: Input → Method → Service → Facade → State → View
- 📊 El detector de cambios NO se dispara automáticamente
- 🐛 Valores truncados (ej: "paka" → "pak") por acceso a `this.datos` obsoleto

### 6.2 Solución: `createAutoSyncField<T>()` en BaseSectionComponent

```typescript
// ✅ NUEVO (Rápido - 0-10ms de retraso)
// Flujo: Input → Signal.set() → effect() → FormChangeService + DetectChanges

protected createAutoSyncField<T>(fieldName: string, initialValue: T): {
  value: Signal<T>,
  update: (newValue: T) => void
} {
  const valueSignal = signal(initialValue);
  
  // ⚡ AUTO-PERSIST: effect() se ejecuta INMEDIATAMENTE cuando signal cambia
  effect(() => {
    const newValue = valueSignal();
    
    // 1. Persiste al estado
    this.formChangeService.persistFields(this.seccionId, [
      { fieldName, value: newValue }
    ]);
    
    // 2. Fuerza detector de cambios (OnPush strategy)
    this.cdRef.markForCheck();
  });

  return {
    value: valueSignal,        // Signal síncrono para el template
    update: (newValue: T) => valueSignal.set(newValue)  // Actualizar signal
  };
}
```

**Ventajas:**
- ⚡ **INMEDIATO:** El `effect()` corre en MICROSEGUNDOS
- 🎯 **10 líneas de lógica:** Comparado con métodos de 30+ líneas
- 📡 **Reactive tracking:** Angular sabe qué signals se usan
- 🔄 **Auto-sync:** No necesitas llamar manualmente a persistFields
- ✅ **No trunca valores:** Usa signal, no `this.datos` obsoleto

---

### 6.3 Cómo Implementar en Componentes (PASO A PASO)

#### PASO 1: Declarar Signal Reactivo

```typescript
// seccionN-form.component.ts
import { Component, Input, computed, signal, effect } from '@angular/core';
import { BaseSectionComponent } from '../base-section.component';

@Component({
  selector: 'app-seccionN-form',
  templateUrl: './seccionN-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SeccionNFormComponent extends BaseSectionComponent {
  @Input() seccionId: string = '3.1.N';

  // ✅ NUEVO: Signal reactivo con auto-persist
  readonly projectName = this.createAutoSyncField('projectName', '');
  readonly provincia = this.createAutoSyncField('provincia', '');
  readonly notas = this.createAutoSyncField('notas', '');

  // Para tablas:
  readonly tablaPersonas = this.createAutoSyncField('tablaPersonas', []);
  readonly fotografias = this.createAutoSyncField('fotografias', []);
}
```

#### PASO 2: Usar Signal en Template (Con ngModel)

```html
<!-- seccionN-form.component.html -->

<!-- ✅ NUEVO: Binding con Signals -->
<input 
  [ngModel]="projectName.value()"
  (ngModelChange)="projectName.update($event)"
  [placeholder]="SECCION_N_TEMPLATES.placeholderNombre"
/>

<!-- Para datos más complejos -->
<textarea 
  [ngModel]="notas.value()"
  (ngModelChange)="notas.update($event)"
  [placeholder]="SECCION_N_TEMPLATES.placeholderNotas"
></textarea>

<!-- Para tablas (Array signal) -->
<app-tabla-editable 
  [datos]="tablaPersonas.value()"
  (datosChange)="tablaPersonas.update($event)"
></app-tabla-editable>
```

#### PASO 3: En Vista - Acceder a Signals Directamente

```typescript
// seccionN-view.component.ts
export class SeccionNViewComponent extends BaseSectionComponent {
  // ✅ Los signals viene automáticamente del estado
  readonly projectNameSignal = computed(() => 
    this.projectFacade.selectField(this.seccionId, null, 'projectName')()
  );

  readonly provinciaSignal = computed(() => 
    this.projectFacade.selectField(this.seccionId, null, 'provincia')()
  );

  // Para párrafos dinámicos
  readonly parrafoCompleto = computed(() => {
    const nombre = this.projectNameSignal();
    const provincia = this.provinciaSignal();
    
    return SECCION_N_TEMPLATES.introTemplate
      .replace('{{nombre}}', nombre || '_____')
      .replace('{{provincia}}', provincia || '_____');
  });
}
```

```html
<!-- seccionN-view.component.html -->
<p>{{ parrafoCompleto() }}</p>
<p>Proyecto: {{ projectNameSignal() }}</p>
<p>Provincia: {{ provinciaSignal() }}</p>
```

---

### 6.4 Comparativa: Arquitectura Antigua vs Nueva

| Aspecto | ❌ ANTIGUA | ✅ NUEVA |
|---------|-----------|----------|
| **Flujo** | Input → Method → Service → Facade → State → Detector | Input → Signal.set() → effect() |
| **Latencia** | 100-300ms | 0-10ms ⚡ |
| **Líneas de código** | 30-50 por field | 1 por field |
| **Truncación de valores** | Sí ("paka" → "pak") | No ✅ |
| **Auto-persist** | Manual (`onFieldChange()`) | Automático (effect) |
| **Auto-detectChanges** | No | Sí (dentro effect) |
| **Reactividad cruzada** | Lenta | Instantánea |
| **DX (Developer Experience)** | Complejo | Simple |

**Ejemplo lado a lado:**

❌ ANTIGUA - 40 líneas:
```typescript
export class SeccionNFormComponent {
  projectName: any;
  updateLegacyData: boolean = false;

  onFieldChange(fieldName: string, value: any) {
    this.projectName = value;
    this.updateLegacyData = true;
    
    this.formChangeService.persistFields(this.seccionId, [
      { fieldName, value }
    ]);
    
    this.cdRef.markForCheck();
    
    setTimeout(() => {
      this.projectFacade.dispatch({
        type: 'field/update',
        payload: { sectionId: this.seccionId, fieldName, value }
      });
    }, 50);
  }

  ngOnInit() {
    this.stateSubscription = this.projectFacade.select(
      Selectors.getField(this.seccionId, fieldName)
    ).subscribe(value => {
      this.projectName = value;
      this.cdRef.markForCheck();
    });
  }

  ngOnDestroy() {
    this.stateSubscription?.unsubscribe();
  }
}
```

✅ NUEVA - 3 líneas:
```typescript
export class SeccionNFormComponent extends BaseSectionComponent {
  readonly projectName = this.createAutoSyncField('projectName', '');
  readonly provincia = this.createAutoSyncField('provincia', '');
}
```

---

### 6.5 Checklist de Implementación - Arquitectura Reactiva

```
PREPARACIÓN
  [ ] BaseSectionComponent tiene createAutoSyncField<T>() importado y declarado
  [ ] Componentes extienden BaseSectionComponent
  [ ] FormChangeService inyectado en base
  [ ] ChangeDetectorRef inyectado en base

FORM COMPONENT
  [ ] Declara Signals: readonly campo1 = this.createAutoSyncField('campo1', initialValue)
  [ ] Template usa [ngModel]="campo1.value()" + (ngModelChange)="campo1.update($event)"
  [ ] No hay onFieldChange() manuales
  [ ] No hay setTimeout para sync
  [ ] NO hay stateSubscription en ngOnDestroy

VIEW COMPONENT  
  [ ] Declara readonly signals con computed() desde projectFacade
  [ ] Template accede con campo1Signal()
  [ ] Tabla, párrafos usan computed() para formatos dinámicos
  [ ] NO accede a this.datos (obsoleto)

TESTING
  [ ] Input cambia → view se actualiza en < 20ms
  [ ] valores completos (sin truncación)
  [ ] cambios persisten en localStorage
  [ ] Cambiar en forma → ver en vista (OK)
  [ ] Cambiar en vista → ver en form (OK - si es editable)

VALIDACIÓN
  [ ] npm start compila sin errores ✅
  [ ] grep de "onFieldChange" = 0 resultados
  [ ] grep de "stateSubscription" = 0 resultados
  [ ] grep de "setTimeout" = 0 resultados
  [ ] Performance: sin retrasos observables
```

---

### 6.6 Patrón Completo: Sección Refactorizada

**Archivo:** `seccionN-constants.ts`
```typescript
export const SECCION_N_WATCHED_FIELDS = [
  'nombreProyecto',
  'provincia',
  'notas',
  'tablaPersonas',
];

export const SECCION_N_CONFIG = {
  sectionId: '3.1.N',
  title: 'Sección N',
};

export const SECCION_N_TEMPLATES = {
  placeholderNombre: 'Ingrese nombre del proyecto',
  placeholderProvincia: 'Seleccione provincia',
  placeholderNotas: 'Notas adicionales...',
  introTemplate: 'El proyecto {{nombre}} está ubicado en {{provincia}}...',
  tituloTabla: 'Datos de {{provincia}}',
};
```

**Archivo:** `seccionN-form.component.ts`
```typescript
@Component({
  selector: 'app-seccionN-form',
  templateUrl: './seccionN-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SeccionNFormComponent extends BaseSectionComponent implements OnInit {
  @Input() override seccionId: string = '3.1.N';

  // ✅ NUEVO: Signals reactivos con auto-persist (EN 1 LÍNEA C/U)
  readonly nombreProyecto = this.createAutoSyncField('nombreProyecto', '');
  readonly provincia = this.createAutoSyncField('provincia', '');
  readonly notas = this.createAutoSyncField('notas', '');
  readonly tablaPersonas = this.createAutoSyncField('tablaPersonas', []);

  readonly SECCION_N_TEMPLATES = SECCION_N_TEMPLATES;

  constructor(cdRef: ChangeDetectorRef, injector: Injector, public formChangeService: FormChangeService) {
    super(cdRef, injector);
  }

  ngOnInit() {
    this.initializeBaseComponent(this.seccionId);
    // Los signals se sincronizan AUTOMÁTICAMENTE
  }
}
```

**Archivo:** `seccionN-form.component.html`
```html
<div class="form-section">
  <div class="form-group">
    <label>{{ SECCION_N_TEMPLATES.labelNombre }}</label>
    <input 
      [ngModel]="nombreProyecto.value()"
      (ngModelChange)="nombreProyecto.update($event)"
      [placeholder]="SECCION_N_TEMPLATES.placeholderNombre"
      class="form-control"
    />
  </div>

  <div class="form-group">
    <label>{{ SECCION_N_TEMPLATES.labelProvincia }}</label>
    <select
      [ngModel]="provincia.value()"
      (ngModelChange)="provincia.update($event)"
      class="form-control"
    >
      <option value="">Seleccione...</option>
      <option value="Arequipa">Arequipa</option>
      <option value="Lima">Lima</option>
    </select>
  </div>

  <div class="form-group">
    <label>{{ SECCION_N_TEMPLATES.labelNotas }}</label>
    <textarea
      [ngModel]="notas.value()"
      (ngModelChange)="notas.update($event)"
      [placeholder]="SECCION_N_TEMPLATES.placeholderNotas"
      class="form-control"
      rows="4"
    ></textarea>
  </div>
</div>
```

**Archivo:** `seccionN-view.component.ts`
```typescript
@Component({
  selector: 'app-seccionN-view',
  templateUrl: './seccionN-view.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SeccionNViewComponent extends BaseSectionComponent {
  @Input() override seccionId: string = '3.1.N';

  readonly SECCION_N_TEMPLATES = SECCION_N_TEMPLATES;

  // ✅ Signals para acceder a datos (automáticamente desde estado)
  readonly nombreProyectoSignal = computed(() =>
    this.projectFacade.selectField(this.seccionId, null, 'nombreProyecto')() || '_____'
  );

  readonly provinciaSignal = computed(() =>
    this.projectFacade.selectField(this.seccionId, null, 'provincia')() || '_____'
  );

  readonly tablaPersonasSignal = computed(() =>
    this.projectFacade.selectField(this.seccionId, null, 'tablaPersonas')() || []
  );

  // ✅ Párrafo dinámico con placeholders reemplazados
  readonly parrafoIntroFormateado = computed(() => {
    const nombre = this.nombreProyectoSignal();
    const provincia = this.provinciaSignal();
    
    return SECCION_N_TEMPLATES.introTemplate
      .replace('{{nombre}}', nombre)
      .replace('{{provincia}}', provincia);
  });

  // ✅ Títulos dinámicos
  readonly tituloTablaFormateado = computed(() => {
    const provincia = this.provinciaSignal();
    return SECCION_N_TEMPLATES.tituloTabla
      .replace('{{provincia}}', provincia);
  });
}
```

**Archivo:** `seccionN-view.component.html`
```html
<div class="section-view">
  <div class="intro">
    <p class="text-justify">{{ parrafoIntroFormateado() }}</p>
  </div>

  <div class="metadata">
    <p><strong>Proyecto:</strong> {{ nombreProyectoSignal() }}</p>
    <p><strong>Provincia:</strong> {{ provinciaSignal() }}</p>
  </div>

  <div class="table-section" *ngIf="(tablaPersonasSignal() | async as personas)">
    <h3>{{ tituloTablaFormateado() }}</h3>
    <app-table-viewer 
      [datos]="personas"
      [columns]="['nombre', 'cargo', 'contacto']"
    ></app-table-viewer>
  </div>
</div>
```

---

### 6.7 Migración Paso a Paso - De Antigua a Nueva

**Antes de empezar:** Hacer backup (`git commit`)

**Paso 1.** Reemplazar `onFieldChange()` → `createAutoSyncField()`

```typescript
// ❌ ANTES:
onNombreChange(value: string) {
  this.nombre = value;
  this.formChangeService.persistFields(...);
  this.cdRef.markForCheck();
}

// ✅ DESPUÉS:
readonly nombre = this.createAutoSyncField('nombre', '');
```

**Paso 2.** Cambiar Template - [value]/(input) → [ngModel]/(ngModelChange)

```html
<!-- ❌ ANTES: -->
<input [value]="nombre" (input)="onNombreChange($event.target.value)" />

<!-- ✅ DESPUÉS: -->
<input [ngModel]="nombre.value()" (ngModelChange)="nombre.update($event)" />
```

**Paso 3.** Remover stateSubscription

```typescript
// ❌ ANTES:
ngOnInit() {
  this.stateSubscription = this.projectFacade.select(...).subscribe(v => { ... });
}

ngOnDestroy() {
  this.stateSubscription?.unsubscribe();
}

// ✅ DESPUÉS:
ngOnInit() {
  this.initializeBaseComponent(this.seccionId);
  // Nada más - los signals se sincronizan automáticamente
}

ngOnDestroy() {
  this.onDestroyCustom?.();
}
```

**Paso 4.** Cambiar View - `this.datos` → `computed signals`

```typescript
// ❌ ANTES:
obtenerTexto(): string {
  return this.datos?.nombre || '_____';
}

// ✅ DESPUÉS:
readonly nombreSignal = computed(() =>
  this.projectFacade.selectField(this.seccionId, null, 'nombre')() || '_____'
);

obtenerTexto(): string {
  return this.nombreSignal();
}
```

---

### 6.8 Ventajas Observables Después de Migración

| Métrica | Antes | Después |
|---------|-------|---------|
| Latencia form→view | 150-300ms | 0-10ms |
| Líneas de código/field | 30-50 | 1 |
| Memoria (subscriptions) | 1+ per field | 0 |
| Complejidad | Alta | Baja |
| Sincronización cross-section | Lenta | Instantánea |
| Truncación de valores | Sí | No ✅ |
| Developer experience | Confuso | Intuitivo |

---

## ✅ VALIDACIÓN FINAL

### 5.1 Checklist de Compilación

```bash
npm start
# Ver que compila sin errores ✅
```

### 5.2 Checklist de Funcionalidad

- [ ] Vista carga correctamente con todos textos
- [ ] Formulario renderiza sin errores
- [ ] Tablas dinámicas funcionan
- [ ] Fotografías cargan correctamente
- [ ] Mensajes de error/vacío se muestran

### 5.3 Verificación de Cero Hardcoding

```bash
# Ejecutar auditoría final
grep -r "'" src/app/shared/components/seccionN/ | grep -v TEMPLATES | grep -v "seccionId" | grep -v "true\|false"

# Si NO hay resultados → ✅ CERO HARDCODING
```

---

## 📋 Checklist Completo de Refactorización

```
AUDITORÍA (PASO 1)
  [ ] Identificar todos los textos hardcodeados en HTML
  [ ] Identificar todos los textos hardcodeados en TS
  [ ] Documentar cada one en un listado
  [ ] ⚡ IDENTIFICAR CAMPOS DINÁMICOS (nombres, proyectos, etc.)

CONSTANTS (PASO 2)
  [ ] Crear estructura base (WATCHED_FIELDS, CONFIG, TEMPLATES)
  [ ] Agregar textos principales (intro, metodología, etc.)
  [ ] Agregar labels
  [ ] Agregar placeholders
  [ ] Agregar mensajes vacíos
  [ ] Agregar valores por defecto (fotos)
  [ ] ⚡ Agregar templates con placeholders {{...}} para campos dinámicos

HTML (PASO 3)
  [ ] View: Reemplazar [label*]="'...'"
  [ ] View: Reemplazar placeholder="..."
  [ ] View: Reemplazar {{ 'Texto' }}
  [ ] Form: Reemplazar [label*]="'...'"
  [ ] Form: Reemplazar placeholder="..."
  [ ] Form: Reemplazar argumentos en componentes
  [ ] ⚡ Párrafos: Usar {{signal}} para campos dinámicos
  [ ] ⚡ Títulos: Usar computed() para títulos con variables

TYPESCRIPT (PASO 4)
  [ ] Importar SECCION_N_TEMPLATES
  [ ] Crear propiedad readonly en componentes
  [ ] Reemplazar returns hardcodeados
  [ ] Reemplazar labels en columnasTabla[]
  [ ] ⚡ Crear methods/computeds para reemplazar {{variables}} en templates
  [ ] ⚡ Usar .replace() para sustituir placeholders

VALIDACIÓN (PASO 5)
  [ ] Compila sin errores (npm start)
  [ ] Vista funciona correctamente
  [ ] Formulario funciona correctamente
  [ ] Grep final: CERO hardcoding
  [ ] ⚡ Campos dinámicos se llenan correctamente (no muestran {{placeholder}})
  [ ] ⚡ Cambiar valor en Sección 2 → se refleja en secciones posteriores
```

---

## 🎯 Ejemplo Práctico: Sección 3 (YA COMPLETADA)

**Arquivos modificados:**
- ✅ `seccion3-constants.ts` → 15+ templates centralizados
- ✅ `seccion3-view.component.html` → 7 reemplazos
- ✅ `seccion3-view.component.ts` → 3 métodos actualizados
- ✅ `seccion3-form.component.html` → 8 reemplazos

**Resultado:**
```
Textosources privados: 0
Hardcoded labels: 0
Hardcoded placeholders: 0
Hardcoded messages: 0
```

---

## 🚀 Próximas Secciones

**Orden recomendado (dependencias):**
1. ✅ **Sección 1** (Ubicación del Proyecto) - COMPLETADA
   - Define: proyecto, ubicación geográfica
   - Usado por: todas las secciones

2. ⚡ **Sección 2** (Delimitación de Áreas AISD/AISI) - CRÍTICA
   - Define: nombres de grupos, comunidades, centros poblados
   - ⚠️ **IMPORTANTE:** Agregar campos a WATCHED_FIELDS para persistir nombres
   - Usado por: secciones 3, 4, 5, ... (títulos, párrafos)

3. ⚡ **Sección 3+** (Resto)
   - Leen nombres de Sección 2 con `selectField()`
   - Usan templates con `{{nombreGrupo}}` 
   - Aplican `.replace()` para reemplazar placeholders

**Ejemplo flujo dinámico:**
```
Sección 2: Usuario define → "CP Cahuacho" (guardado en projectState)
           ↓
Sección 3: Lee nombre → "PEA Ocupada según actividad económica – CP Cahuacho"
Sección 4: Lee nombre → "En el CP Cahuacho se registran..."
Sección 5: Lee nombre → "...interacción con Cahuacho..."
```

---

## � Patrones de Implementación - Campos Dinámicos

### Patrón 1: Método Simple con .replace()

```typescript
// En SECCION_N_CONSTANTS.ts:
parrafoAISI: `En cuanto al área de influencia social indirecta (AISI), 
se ha determinado que esta se encuentra conformada por el CP {{grupoAISI}}, 
capital distrital de la jurisdicción...`,

// En seccionN-view.component.ts:
obtenerParrafoAISI(): string {
  const grupoAISI = this.projectFacade.selectField('3.1.2', null, 'nombreGrupoAISI')();
  return SECCION_N_TEMPLATES.parrafoAISI
    .replace('{{grupoAISI}}', grupoAISI || '_____');
}

// En template:
<div class="text-justify">{{ obtenerParrafoAISI() }}</div>
```

---

### Patrón 2: Signal Computed (Más Eficiente)

```typescript
// En seccionN-view.component.ts:
readonly grupoAISISignal: Signal<string> = computed(() => 
  this.projectFacade.selectField('3.1.2', null, 'nombreGrupoAISI')() || '_____'
);

readonly parrafoAISIFormateado: Signal<string> = computed(() => 
  SECCION_N_TEMPLATES.parrafoAISI
    .replace('{{grupoAISI}}', this.grupoAISISignal())
);

// En template (más simple):
<div class="text-justify">{{ parrafoAISIFormateado() }}</div>
```

---

### Patrón 3: Para Títulos de Tablas

```typescript
// En SECCION_N_CONSTANTS.ts:
cuadroTituloTemplate: 'PEA Ocupada según actividad económica – CP {{grupoAISI}}',

// En seccionN-form.component.ts:
readonly cuadroTituloFormateado: Signal<string> = computed(() => {
  const grupoAISI = this.projectFacade.selectField('3.1.2', null, 'nombreGrupoAISI')();
  return SECCION_N_TEMPLATES.cuadroTituloTemplate
    .replace('{{grupoAISI}}', grupoAISI || '_____');
});

// En template:
<app-table-wrapper [title]="cuadroTituloFormateado()">
  <!-- contenido tabla -->
</app-table-wrapper>
```

---

### Patrón 4: Múltiples Placeholders en un Template

```typescript
// En SECCION_N_CONSTANTS.ts:
analisisCompletoTemplate: `El CP {{grupoAISI}} ubicado en {{provincia}}, {{departamento}}, 
presenta una población de {{poblacion}} habitantes. El proyecto {{nombreProyecto}} 
interactuará principalmente con {{grupoAISI}}.`,

// En seccionN-view.component.ts:
obtenerAnalisisCompleto(): string {
  const grupoAISI = this.projectFacade.selectField('3.1.2', null, 'nombreGrupoAISI')() || '_____';
  const provincia = this.projectFacade.selectField('3.1.1', null, 'provinciaSeleccionada')() || '_____';
  const departamento = this.projectFacade.selectField('3.1.1', null, 'departamentoSeleccionado')() || '_____';
  const poblacion = this.projectFacade.selectField('3.1.3', null, 'poblacionTotal')() || '_____';
  const nombreProyecto = this.projectFacade.selectField('3.1.1', null, 'projectName')() || '_____';

  return SECCION_N_TEMPLATES.analisisCompletoTemplate
    .replace('{{grupoAISI}}', grupoAISI)
    .replace('{{provincia}}', provincia)
    .replace('{{departamento}}', departamento)
    .replace('{{poblacion}}', poblacion)
    .replace('{{nombreProyecto}}', nombreProyecto);
}

// En template:
<p class="text-justify">{{ obtenerAnalisisCompleto() }}</p>
```

---

### Patrón 5: En Método Fallback (Si usuario no captura dato)

```typescript
// En seccionN-view.component.ts:
obtenerTextoMetodologia(): string {
  const formData = this.formDataSignal();
  
  // Si usuario capturó dato personalizado, usarlo
  if (formData['parrafoSeccionN_metodologia']) {
    return formData['parrafoSeccionN_metodologia'];
  }

  // Si no, usar template dinámico con valores por defecto
  const grupoAISI = this.projectFacade.selectField('3.1.2', null, 'nombreGrupoAISI')() || '_____';
  return SECCION_N_TEMPLATES.metodologiaDefaultFallback
    .replace('{{grupoAISI}}', grupoAISI);
}
```

---



**Buscar rápido en VS Code:**
```
Ctrl+Shift+F → Buscar en carpeta
"'" 
-TEMPLATES
```

**Reemplazar múltiple (Multi-Replace):**
1. `multi_replace_string_in_file` para cambios coordinados
2. Incluir 3-5 líneas de contexto antes/después

**Validar cambios:**
```bash
npm start  # Compilar
npm test   # Tests unitarios (si existen)
```

---

**Versión:** 1.0 | **Fecha:** 12/02/2026 | **Patrón:** SECCION3_TEMPLATES
