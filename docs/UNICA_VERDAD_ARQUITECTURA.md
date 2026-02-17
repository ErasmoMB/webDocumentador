# 📘 LA ÚNICA VERDAD - Arquitectura Unificada del Documentador

**Versión:** 1.0  
**Fecha:** 17 de febrero de 2026  
**Propósito:** Unificar todos los patrones de las secciones 1-30 en una sola arquitectura coherente

---

## 📋 Tabla de Contenidos

1. [Filosofía Fundamental](#1-filosofía-fundamental)
2. [Estructura de Archivos por Sección](#2-estructura-de-archivos-por-sección)
3. [Patrón Form-Wrapper (Siempre Igual)](#3-patrón-form-wrapper-siempre-igual)
4. [Patrón Form-Component](#4-patrón-form-component)
5. [Patrón View-Component](#5-patrón-view-component)
6. [Patrón Constants](#6-patrón-constants)
7. [Manejo de Datos - Signals](#7-manejo-de-datos---signals)
8. [Manejo de Tablas](#8-manejo-de-tablas)
9. [Manejo de Párrafos](#9-manejo-de-párrafos)
10. [Manejo de Imágenes/Fotografías](#10-manejo-de-imágenesfotografías)
11. [Manejo de Prefijos (AISD/AISI)](#11-manejo-de-prefijos-aisdaisi)
12. [Patrón de Plantillas y Textos por Defecto](#12-patrón-de-plantillas-y-textos-por-defecto)
13. [Numeración Global](#13-numeración-global)
14. [Carga de Datos desde Backend](#14-carga-de-datos-desde-backend)
15. [Persistencia](#15-persistencia)
16. [Glosario de Términos](#16-glosario-de-términos)

---

## 1. FILOSOFÍA FUNDAMENTAL

### 1.1 Principios Core

| Principio | Descripción |
|-----------|-------------|
| **Fuente Única de Verdad** | `ProjectStateFacade` es la única fuente de datos para todas las secciones |
| **Reactividad 100%** | Todos los datos deben acceder via Signals, nunca directamente a `this.datos` |
| **Inmutabilidad** | Los Signals calculados (`computed`) derivan datos sin mutar el estado |
| **Separación de Responsabilidades** | Form = edición, View = presentación, Constants = configuración |
| **Prefijos Consistencia** | AISD usa prefijo `_A1`, `_A2`, etc.; AISI usa `_B1`, `_B2`, etc. |

### 1.2 Flujo de Datos Ideal

```
┌─────────────────┐     ┌──────────────────────┐     ┌─────────────────┐
│  Backend API    │────▶│  ProjectStateFacade │────▶│  Form Component │
└─────────────────┘     │  (Signals + Store)   │     │  (computed)     │
                        └──────────────────────┘     └────────┬────────┘
                                                               │
                                                               ▼
┌─────────────────┐     ┌──────────────────────┐     ┌─────────────────┐
│  LocalStorage   │◀───▶│  Persistence Layer  │◀────│  View Component │
└─────────────────┘     └──────────────────────┘     └─────────────────┘
```

---

## 2. ESTRUCTURA DE ARCHIVOS POR SECCIÓN

### 2.1 Directorio Estándar

```
shared/components/
├── forms/
│   └── seccionXX-form-wrapper.component.ts    ← SIEMPRE IGUAL (29 líneas)
└── seccionXX/
    ├── seccionXX-form.component.ts            ← 400-800 líneas
    ├── seccionXX-form.component.html           ← Template de edición
    ├── seccionXX-view.component.ts            ← 400-800 líneas
    ├── seccionXX-view.component.html          ← Template de presentación
    └── seccionXX-constants.ts                ← 200-400 líneas
```

### 2.2 Reglas de Nombrado

| Elemento | Patrón | Ejemplo |
|----------|--------|---------|
| Section ID AISD | `3.1.4.A.X.Y` | `3.1.4.A.1.1` |
| Section ID AISI | `3.1.4.B.X.Y` | `3.1.4.B.1.1` |
| Prefijo Fotos | `fotografiaSeccionXX` | `fotografiaSeccion7` |
| Campos con prefijo | `{campo}{prefijo}` | `petTabla_A1` |

---

## 3. PATRÓN FORM-WRAPPER (SIEMPRE IGUAL)

### 3.1 Template Exacto (29 líneas)

```typescript
import { Component, Input, ChangeDetectorRef, Injector } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CoreSharedModule } from '../../modules/core-shared.module';
import { SeccionXXFormComponent } from '../seccionXX/seccionXX-form.component';
import { BaseSectionComponent } from '../base-section.component';

@Component({
    imports: [CommonModule, FormsModule, CoreSharedModule, SeccionXXFormComponent],
    selector: 'app-seccionXX-form-wrapper',
    template: `<app-seccionXX-form [seccionId]="seccionId" [modoFormulario]="true"></app-seccionXX-form>`,
    styles: [`:host { display: block; width: 100%; }`],
    standalone: true
})
export class SeccionXXFormWrapperComponent extends BaseSectionComponent {
    @Input() override seccionId: string = '3.1.X';

    constructor(cdRef: ChangeDetectorRef, injector: Injector) {
        super(cdRef, injector);
    }

    protected override onInitCustom(): void { }
    protected override detectarCambios(): boolean { return false; }
    protected override actualizarValoresConPrefijo(): void { }
}
```

### 3.2 Reglas del Form-Wrapper

- ✅ **NUNCA modificar este archivo** - copiar y pegar tal cual
- ✅ Siempre extiende `BaseSectionComponent`
- ✅ El `seccionId` por defecto se define en constants
- ✅ El `modoFormulario` siempre es `true`

---

## 4. PATRÓN FORM-COMPONENT

### 4.1 Estructura Base

```typescript
import { Component, Input, OnDestroy, ChangeDetectionStrategy, Injector, Signal, computed, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseSectionComponent } from '../base-section.component';
import { FotoItem } from '../image-upload/image-upload.component';
import { CoreSharedModule } from '../../modules/core-shared.module';

@Component({
    imports: [CommonModule, FormsModule, CoreSharedModule],
    selector: 'app-seccionXX-form',
    templateUrl: './seccionXX-form.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true
})
export class SeccionXXFormComponent extends BaseSectionComponent implements OnDestroy {
    @Input() override seccionId: string = SECCIONXX_SECTION_ID;
    @Input() override modoFormulario: boolean = true;

    // =========================================================================
    // 🔧 CONFIGURACIÓN BASE
    // =========================================================================
    override readonly PHOTO_PREFIX = 'fotografiaSeccionXX';
    override useReactiveSync: boolean = true;
    override watchedFields: string[] = SECCIONXX_WATCHED_FIELDS;

    // =========================================================================
    // 📡 SIGNALS - DATOS PRINCIPALES
    // =========================================================================
    
    /** Signal principal: todos los datos de la sección */
    readonly formDataSignal: Signal<Record<string, any>> = computed(() => 
        this.projectFacade.selectSectionFields(this.seccionId, null)()
    );

    // =========================================================================
    // 📡 SIGNALS - CAMPOS ESPECÍFICOS (PATRÓN OBLIGATORIO)
    // =========================================================================
    
    /** Campo específico con valor por defecto */
    readonly campoXxxSignal: Signal<string> = computed(() => {
        const valor = this.projectFacade.selectField(this.seccionId, null, 'campoXxx')();
        return valor ?? 'valor_por_defecto';
    });

    /** Campo que requiere reemplazo de placeholders dinámicos */
    readonly parrafoConPlaceholdersSignal: Signal<string> = computed(() => {
        const manual = this.projectFacade.selectField(this.seccionId, null, 'parrafoCampo')();
        if (manual && manual.trim().length > 0) return manual;
        
        // Reemplazar {COMUNIDAD}, {DISTRITO}, {CP}, etc.
        return this.reemplazarPlaceholders(SECCIONXX_TEMPLATES.template);
    });

    // =========================================================================
    // 📡 SIGNALS - FOTOGRAFÍAS (PATRÓN OBLIGATORIO)
    // =========================================================================
    
    readonly fotosCacheSignal: Signal<FotoItem[]> = computed(() => {
        const fotos: FotoItem[] = [];
        const prefix = this.PHOTO_PREFIX;
        
        for (let i = 1; i <= 10; i++) {
            const titulo = this.projectFacade.selectField(this.seccionId, null, `${prefix}${i}Titulo`)();
            const fuente = this.projectFacade.selectField(this.seccionId, null, `${prefix}${i}Fuente`)();
            const imagen = this.projectFacade.selectField(this.seccionId, null, `${prefix}${i}Imagen`)();
            
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

    // =========================================================================
    // 📡 VIEWMODEL - ÁGREGADO DE DATOS
    // =========================================================================
    
    readonly viewModel: Signal<{
        campoXxx: string;
        parrafo: string;
        fotos: FotoItem[];
    }> = computed(() => ({
        campoXxx: this.campoXxxSignal(),
        parrafo: this.parrafoConPlaceholdersSignal(),
        fotos: this.fotosCacheSignal()
    }));

    // =========================================================================
    // 🎯 HELPERS
    // =========================================================================
    
    /** Reemplaza placeholders dinámicos en templates */
    protected reemplazarPlaceholders(template: string): string {
        const comunidad = this.obtenerNombreComunidadActual();
        const distrito = this.obtenerNombreDistritoActual();
        const cp = this.obtenerNombreCentroPobladoActual();
        
        return template
            .replace(/{COMUNIDAD}/g, comunidad)
            .replace(/{DISTRITO}/g, distrito)
            .replace(/{CP}/g, cp)
            .replace(/____/g, '____'); // Placeholder por defecto
    }

    /** Obtiene el nombre de comunidad AISD actual */
    protected obtenerNombreComunidadActual(): string {
        return super.obtenerNombreComunidadActual();
    }

    /** Obtiene el nombre del distrito AISI actual */
    protected obtenerNombreDistritoActual(): string {
        return super.obtenerNombreDistritoActual();
    }

    /** Obtiene el nombre del centro poblado AISI actual */
    protected obtenerNombreCentroPobladoActual(): string {
        return super.obtenerNombreCentroPobladoActual();
    }
}
```

### 4.2 Reglas del Form-Component

| Regla | Descripción |
|--------|-------------|
| **OnPush** | Siempre usar `ChangeDetectionStrategy.OnPush` |
| **Signals** | Todos los datos accesibles via Signals, nunca directamente de `this.datos` |
| **computed()** | Usar `computed()` para derivar datos reactivamente |
| **PHOTO_PREFIX** | Definir siempre el prefijo de fotografías |
| **useReactiveSync** | Activar siempre `useReactiveSync: true` |
| **watchedFields** | Definir campos a observar para persistencia |

---

## 5. PATRÓN VIEW-COMPONENT

### 5.1 Estructura Base

```typescript
import { Component, Input, OnDestroy, ChangeDetectionStrategy, Injector, Signal, computed, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseSectionComponent } from '../base-section.component';
import { CoreSharedModule } from '../../modules/core-shared.module';
import { FotoItem } from '../image-upload/image-upload.component';

@Component({
    imports: [CommonModule, CoreSharedModule],
    selector: 'app-seccionXX-view',
    templateUrl: './seccionXX-view.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    styles: [`
        :host ::ng-deep .data-manual.has-data {
            border-left: 4px solid #007bff;
            padding-left: 12px;
        }
        .text-justify { text-align: justify; }
    `]
})
export class SeccionXXViewComponent extends BaseSectionComponent implements OnDestroy {
    @Input() override seccionId: string = SECCIONXX_SECTION_ID;
    @Input() override modoFormulario: boolean = false;

    // =========================================================================
    // 🔧 CONFIGURACIÓN BASE
    // =========================================================================
    override readonly PHOTO_PREFIX = 'fotografiaSeccionXX';
    override useReactiveSync: boolean = true;
    override watchedFields: string[] = SECCIONXX_WATCHED_FIELDS;

    // =========================================================================
    // 📡 SIGNALS - REPLICAR LOS MISMOS DEL FORM
    // =========================================================================
    
    readonly formDataSignal: Signal<Record<string, any>> = computed(() => 
        this.projectFacade.selectSectionFields(this.seccionId, null)()
    );

    readonly campoXxxSignal: Signal<string> = computed(() => {
        const valor = this.projectFacade.selectField(this.seccionId, null, 'campoXxx')();
        return valor ?? 'valor_por_defecto';
    });

    readonly parrafoConPlaceholdersSignal: Signal<string> = computed(() => {
        const manual = this.projectFacade.selectField(this.seccionId, null, 'parrafoCampo')();
        if (manual && manual.trim().length > 0) return manual;
        return this.reemplazarPlaceholders(SECCIONXX_TEMPLATES.template);
    });

    readonly fotosCacheSignal: Signal<FotoItem[]> = computed(() => {
        const fotos: FotoItem[] = [];
        const prefix = this.PHOTO_PREFIX;
        
        for (let i = 1; i <= 10; i++) {
            const titulo = this.projectFacade.selectField(this.seccionId, null, `${prefix}${i}Titulo`)();
            const fuente = this.projectFacade.selectField(this.seccionId, null, `${prefix}${i}Fuente`)();
            const imagen = this.projectFacade.selectField(this.seccionId, null, `${prefix}${i}Imagen`)();
            
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

    readonly viewModel: Signal<{
        campoXxx: string;
        parrafo: string;
        fotos: FotoItem[];
    }> = computed(() => ({
        campoXxx: this.campoXxxSignal(),
        parrafo: this.parrafoConPlaceholdersSignal(),
        fotos: this.fotosCacheSignal()
    }));

    // =========================================================================
    // 🎯 HELPERS (REPLICAR DEL FORM)
    // =========================================================================
    
    protected reemplazarPlaceholders(template: string): string {
        const comunidad = this.obtenerNombreComunidadActual();
        const distrito = this.obtenerNombreDistritoActual();
        const cp = this.obtenerNombreCentroPobladoActual();
        
        return template
            .replace(/{COMUNIDAD}/g, comunidad)
            .replace(/{DISTRITO}/g, distrito)
            .replace(/{CP}/g, cp)
            .replace(/____/g, '____');
    }

    protected obtenerNombreComunidadActual(): string {
        return super.obtenerNombreComunidadActual();
    }

    protected obtenerNombreDistritoActual(): string {
        return super.obtenerNombreDistritoActual();
    }

    protected obtenerNombreCentroPobladoActual(): string {
        return super.obtenerNombreCentroPobladoActual();
    }
}
```

### 5.2 Diferencias Form vs View

| Aspecto | Form | View |
|---------|------|------|
| `modoFormulario` | `true` | `false` |
| `FormsModule` | ✅ Importado | ❌ No necesario |
| Estilos | Forms con inputs | Presentación enriquecida |
| Edición | `<input>`, `<select>`, `<textarea>` | Solo visualización |

---

## 6. PATRÓN CONSTANTS

### 6.1 Estructura Estándar

```typescript
/**
 * ✅ SECCIONXX_CONSTANTS
 * Constantes centralizadas para Sección XX - Título de la Sección
 * - Campos observados para persistencia
 * - Configuración de sección
 * - Todos los textos centralizados
 */

// ============================================================================
// 📋 CONFIGURACIÓN PRINCIPAL
// ============================================================================

export const SECCIONXX_SECTION_ID = '3.1.X.Y';  // ID único de sección
export const SECCIONXX_DEFAULT_SUBSECTION = '3.1.X.Y';

export const SECCIONXX_CONFIG = {
    sectionId: SECCIONXX_SECTION_ID,
    title: 'Título de la Sección',
    photoPrefix: 'fotografiaSeccionXX',
    maxPhotos: 10,
};

// ============================================================================
// 👁️ CAMPOS OBSERVADOS (WATCHED FIELDS)
// ============================================================================

export const SECCIONXX_WATCHED_FIELDS: string[] = [
    // Datos base (pueden tener prefijo)
    'grupoAISD',
    'grupoAISI',
    'centroPobladoAISI',
    
    // Campos específicos de la sección
    'campoTabla1',
    'campoTabla2',
    'tituloTabla1',
    'fuenteTabla1',
    
    // Párrafos
    'parrafoSeccionXX_principal',
    'parrafoSeccionXX_secundario',
    
    // Fotografías (10 máximo)
    ...Array.from({ length: 10 }, (_, i) => `fotografiaSeccionXX${i + 1}Titulo`),
    ...Array.from({ length: 10 }, (_, i) => `fotografiaSeccionXX${i + 1}Fuente`),
    ...Array.from({ length: 10 }, (_, i) => `fotografiaSeccionXX${i + 1}Imagen`),
];

// ============================================================================
// 🔧 PREFIJOS DE FOTOGRAFÍAS
// ============================================================================

export const SECCIONXX_PHOTO_PREFIX = 'fotografiaSeccionXX';

export const SECCIONXX_PHOTO_PREFIXES = {
    tema1: 'fotografiaSeccionXX_tema1',
    tema2: 'fotografiaSeccionXX_tema2',
} as const;

// ============================================================================
// 📝 TEXTOS POR DEFECTO (FALLBACKS)
// ============================================================================

export const SECCIONXX_TEXTOS_DEFAULT = {
    PARRAFO_PRINCIPAL: 'Texto por defecto que describe la sección. Este texto se muestra cuando el usuario no ha proporcionado uno personalizado.',
    PARRAFO_SECUNDARIO: 'Texto secundario por defecto...',
    TITULO_TABLA_DEFAULT: 'Título de tabla por defecto',
    FUENTE_TABLA_DEFAULT: 'GEADES, 2024',
};

// ============================================================================
// 📋 TEMPLATES - TEXTOS CENTRALIZADOS
// ============================================================================

export const SECCIONXX_TEMPLATES = {
    // =========================================================================
    // TÍTULOS PRINCIPALES
    // =========================================================================
    TITULO_SECCION: 'X.Y. Título de la Sección',
    SUBTITULO_SECCION: 'Subtítulo de la sección',
    
    // =========================================================================
    // LABELS DE FORMULARIO
    // =========================================================================
    LABEL_CAMPO_TABLA: 'Campo de Tabla',
    LABEL_TITULO_TABLA: 'Título de la Tabla',
    LABEL_FUENTE_TABLA: 'Fuente de la Tabla',
    LABEL_EDITAR_PARRAFOS: 'Editar Párrafos',
    LABEL_PARRAFO_PRINCIPAL: 'Párrafo Principal',
    LABEL_PARRAFO_SECUNDARIO: 'Párrafo Secundario',
    LABEL_FOTOGRAFIAS: 'Fotografías',
    
    // =========================================================================
    // HINTS Y PLACEHOLDERS
    // =========================================================================
    HINT_PARRAFO: 'Edite el texto completo. Use Enter para crear nuevos párrafos. Deje vacío para usar el texto por defecto.',
    PLACEHOLDER_TITULO_TABLA: 'Ej: Título de ejemplo',
    PLACEHOLDER_FUENTE_TABLA: 'Ej: GEADES, 2024',
    
    // =========================================================================
    // TEMPLATES CON PLACEHOLDERS
    // =========================================================================
    // Usar {COMUNIDAD}, {DISTRITO}, {CP}, {AÑO} como placeholders
    TEMPLATE_PARRAFO_PRINCIPAL: 'El presente informe presenta información sobre {COMUNIDAD}...',
    TEMPLATE_PARRAFO_SECUNDARIO: 'Respecto a {DISTRITO}...',
    
    // =========================================================================
    // CONFIGURACIÓN DE TABLAS
    // =========================================================================
    TABLA_CONFIG: {
        permiteAgregarFilas: true,
        permiteEliminarFilas: true,
        calcularPorcentajes: false,
    } as TableConfig,
};

// ============================================================================
// 🏷️ TIPOS DE DATOS (INTERFACES)
// ============================================================================

export interface SeccionXXData {
    campoTabla1: any[];
    campoTabla2: any[];
    tituloTabla1: string;
    fuenteTabla1: string;
    parrafoSeccionXX_principal?: string;
    parrafoSeccionXX_secundario?: string;
    [key: string]: any;
}
```

### 6.2 Reglas de Constants

| Sección | Contenido |
|---------|------------|
| **WATCHED_FIELDS** | Todos los campos que necesitan persistencia |
| **CONFIG** | ID, título, prefijo de fotos |
| **TEXTOS_DEFAULT** | Valores por defecto para párrafos |
| **TEMPLATES** | Textos con placeholders dinámicos |
| **PHOTO_PREFIXES** | Prefijos específicos por tema |

---

## 7. MANEJO DE DATOS - SIGNALS

### 7.1 Patrón de Acceso a Datos

```typescript
// ✅ CORRECTO: Usar Signals
readonly datosSignal: Signal<any> = computed(() => 
    this.projectFacade.selectSectionFields(this.seccionId, null)()
);

// ✅ CORRECTO: Campo específico
readonly campoSignal: Signal<string> = computed(() => 
    this.projectFacade.selectField(this.seccionId, null, 'nombreCampo')() ?? 'default'
);

// ❌ INCORRECTO: Acceso directo a this.datos
readonly datoIncorrecto = this.datos['nombreCampo']; // ¡NO HACER ESTO!
```

### 7.2 Métodos del ProjectStateFacade

| Método | Uso |
|--------|-----|
| `selectSectionFields(seccionId, groupId)` | Obtiene todos los campos de una sección |
| `selectField(seccionId, groupId, fieldName)` | Obtiene un campo específico |
| `selectTableData(seccionId, groupId, tableKey)` | Obtiene datos de tabla |
| `obtenerDatos()` | Obtiene todos los datos del proyecto |

### 7.3 Señales de Grupos Disponibles

```typescript
// En BaseSectionComponent ya disponibles:
readonly aisdGroups: Signal<readonly GroupDefinition[]>;
readonly aisiGroups: Signal<readonly GroupDefinition[]>;
readonly allPopulatedCenters: Signal<readonly CCPPEntry[]>;
```

---

## 8. MANEJO DE TABLAS

### 8.1 Tipos de Tablas

| Tipo | Descripción | Ejemplo |
|------|-------------|---------|
| **Editable** | Permite al usuario agregar/eliminar filas | Tablas de datos propios |
| **Solo Lectura** | Datos del backend, no editables | Datos demográficos |
| **Híbrida** | Datos base + edición manual | Tablas con datos calculados |

### 8.2 Configuración de Tabla

```typescript
export interface TableConfig {
    tablaKey: string;           // Clave para persistencia
    totalKey?: string;          // Clave para totales
    campoTotal?: string;        // Campo que es total
    campoPorcentaje?: string;  // Campo de porcentaje
    estructuraInicial?: any[]; // Datos iniciales por defecto
    calcularPorcentajes?: boolean;
    permiteAgregarFilas?: boolean;
    permiteEliminarFilas?: boolean;
    camposNoEditables?: string[];
}
```

### 8.3 Uso en Template

```html
<!-- Tabla editable -->
<app-dynamic-table
    [datos]="datos"
    [config]="tablaConfig"
    [columns]="columnasTabla"
    [sectionId]="seccionId"
    [tablaKey]="'miTabla'"
    (tableUpdated)="onTablaActualizada()">
</app-dynamic-table>

<!-- Tabla solo lectura (del backend) -->
<app-dynamic-table
    [datos]="datosBackend"
    [config]="tablaConfigReadOnly"
    [columns]="columnas"
    [sectionId]="seccionId"
    [tablaKey]="'tablaBackend'"
    [readonly]="true">
</app-dynamic-table>
```

### 8.4 Transformación de Datos del Backend

```typescript
// Función para desenvolver respuesta del backend
const unwrapDemograficoData = (responseData: any): any[] => {
    if (!responseData) return [];
    
    if (Array.isArray(responseData) && responseData.length > 0) {
        return responseData[0]?.rows || responseData;
    }
    if (responseData.data) {
        const data = responseData.data;
        if (Array.isArray(data) && data.length > 0) {
            return data[0]?.rows || data;
        }
        return data;
    }
    return [];
};

// Transformar datos al formato de la tabla
const transformDataDesdeBackend = (data: any[]): any[] => {
    if (!Array.isArray(data)) return [];
    
    return data.map(item => ({
        categoria: item.categoria || item.nombre || '',
        casos: item.casos ?? item.total ?? 0,
        porcentaje: item.porcentaje ?? ''
    }));
};
```

---

## 9. MANEJO DE PÁRRAFOS

### 9.1 Componente Paragraph-Editor

```html
<app-paragraph-editor
    [fieldId]="'parrafoSeccionXX_principal'"
    [label]="LABEL_PARRAFO_PRINCIPAL"
    [hint]="HINT_PARRAFO"
    [rows]="6"
    [value]="parrafoSignal()"
    (valueChange)="onParrafoChange($event)">
</app-paragraph-editor>
```

### 9.2 Señal de Párrafo con Fallback

```typescript
readonly parrafoSignal: Signal<string> = computed(() => {
    // 1. Primero intentar obtener valor manual del usuario
    const manual = this.projectFacade.selectField(this.seccionId, null, 'parrafoSeccionXX_principal')();
    if (manual && manual.trim().length > 0) return manual;
    
    // 2. Si no hay valor manual, usar template con placeholders
    return this.reemplazarPlaceholders(SECCIONXX_TEMPLATES.TEMPLATE_PARRAFO);
});
```

### 9.3 Placeholders Dinámicos

| Placeholder | Reemplaza con | Ejemplo |
|-------------|---------------|---------|
| `{COMUNIDAD}` | Nombre de comunidad AISD | "Comunidad Campesina de Tambo" |
| `{DISTRITO}` | Nombre del distrito | "Cahuacho" |
| `{CP}` | Centro poblado AISI | "Tambo" |
| `{AÑO}` | Año de referencia | "2017" |
| `____` | Placeholder vacío | (se deja así) |

---

## 10. MANEJO DE IMÁGENES/FOTOGRAFÍAS

### 10.1 Estructura de Fotografía

```typescript
export interface FotoItem {
    titulo: string;
    fuente: string;
    imagen: string | null;
    preview?: string | null;
    id?: string;
}
```

### 10.2 Señal de Fotografías

```typescript
readonly fotosCacheSignal: Signal<FotoItem[]> = computed(() => {
    const fotos: FotoItem[] = [];
    const prefix = this.PHOTO_PREFIX; // ej: 'fotografiaSeccion7'
    
    for (let i = 1; i <= 10; i++) {
        const titulo = this.projectFacade.selectField(this.seccionId, null, `${prefix}${i}Titulo`)();
        const fuente = this.projectFacade.selectField(this.seccionId, null, `${prefix}${i}Fuente`)();
        const imagen = this.projectFacade.selectField(this.seccionId, null, `${prefix}${i}Imagen`)();
        
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
```

### 10.3 Template de Visualización

```html
<!-- En view.component.html -->
<div class="fotografias-grid" *ngIf="fotosCacheSignal().length > 0">
    <div class="foto-item" *ngFor="let foto of fotosCacheSignal(); let i = index">
        <img [src]="foto.imagen" [alt]="foto.titulo" class="foto-imagen">
        <div class="foto-info">
            <span class="foto-numero">Foto {{ i + 1 }}:</span>
            <span class="foto-titulo">{{ foto.titulo }}</span>
            <span class="foto-fuente">Fuente: {{ foto.fuente }}</span>
        </div>
    </div>
</div>
```

### 10.4 Reglas de Fotografías

| Regla | Descripción |
|--------|-------------|
| **Máximo 10** | Cada sección puede tener hasta 10 fotografías |
| **Prefijo único** | Cada sección tiene su propio prefijo |
| **Campos** | Cada foto tiene: título, fuente, imagen |
| **Valores por defecto** | Título: "Fotografía N", Fuente: "GEADES, 2024" |

---

## 11. MANEJO DE PREFIJOS (AISD/AISI)

### 11.1 Sistema de Prefijos

| Tipo | Prefijo | Ejemplo Section ID | Ejemplo Campo |
|------|---------|-------------------|---------------|
| **AISD** | `_A1`, `_A2`, etc. | `3.1.4.A.1.1` | `petTabla_A1` |
| **AISI** | `_B1`, `_B2`, etc. | `3.1.4.B.1.1` | `poblacionSexo_B1` |
| **Base** | (sin prefijo) | `3.1.1` | `projectName` |

### 11.2 Obtención de Prefijo

```typescript
// Método disponible en BaseSectionComponent
protected obtenerPrefijoGrupo(): string {
    return PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
}

// Uso en el componente
const prefijo = this.obtenerPrefijoGrupo(); // '_A1' o '_B1' o ''
```

### 11.3 Acceso a Datos con Prefijo

```typescript
// ✅ Acceso con prefijo automático
const valor = this.obtenerValorConPrefijo('nombreCampo');

// ✅ Acceso directo
const valorA1 = this.projectFacade.selectField('3.1.4.A.1.1', null, 'campo_A1')();
const valorB1 = this.projectFacade.selectField('3.1.4.B.1.1', null, 'campo_B1')();
```

---

## 12. PATRÓN DE PLANTILLAS Y TEXTOS POR DEFECTO

### 12.1 Jerarquía de Valores

```
1. Valor manual del usuario (prioridad máxima)
        ▼
2. Template con placeholders reemplazados
        ▼
3. Texto por defecto hardcoded
        ▼
4. Placeholder vacío (____)
```

### 12.2 Ejemplo de Implementación

```typescript
readonly parrafoSignal: Signal<string> = computed(() => {
    // Nivel 1: Valor manual del usuario
    const manual = this.projectFacade.selectField(this.seccionId, null, 'parrafoCampo')();
    if (manual && manual.trim().length > 0) {
        return manual;
    }
    
    // Nivel 2: Template con placeholders
    const comunidad = this.obtenerNombreComunidadActual();
    const template = SECCIONXX_TEMPLATES.PARRAFO_TEMPLATE
        .replace(/{COMUNIDAD}/g, comunidad);
    
    // Si el template tiene contenido válido, retornarlo
    if (template && template.trim().length > 0 && !template.includes('____')) {
        return template;
    }
    
    // Nivel 3: Texto por defecto
    return SECCIONXX_TEXTOS_DEFAULT.PARRAFO_DEFAULT;
});
```

---

## 13. NUMERACIÓN GLOBAL

### 13.1 Servicio de Numeración

```typescript
// Numeración automática de tablas
constructor(private globalNumberingService: GlobalNumberingService) {}

// Obtener número de tabla global
readonly tableNumber = this.globalNumberingService.getTableNumber(this.seccionId, this.tableKey);

// Obtener números de fotos globales
readonly photoNumbers = this.globalNumberingService.getPhotoNumbers(this.seccionId);
```

### 13.2 Uso en Template

```html
<!-- Tabla con número global -->
<div class="tabla-numerada">
    <span class="numero-tabla">Tabla {{ tableNumber() }}:</span>
    <!-- contenido de la tabla -->
</div>

<!-- Foto con número global -->
<div class="foto-numerada" *ngFor="let foto of fotosCacheSignal(); let i = index">
    <span class="numero-foto">Foto {{ i + 1 }}:</span>
    <img [src]="foto.imagen">
</div>
```

---

## 14. CARGA DE DATOS DESDE BACKEND

### 14.1 Patrón de Carga

```typescript
// En el componente
protected loadBackendData(): void {
    const fieldsToLoad = this.fieldMapping.getFieldsForSection(this.seccionId);
    if (fieldsToLoad.length > 0) {
        this.sectionDataLoader.loadSectionData(this.seccionId, fieldsToLoad)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (data) => {
                    // Procesar datos recibidos
                    this.procesarDatosBackend(data);
                },
                error: (err) => {
                    console.error('Error cargando datos:', err);
                }
            });
    }
}
```

### 14.2 Transformación de Datos

```typescript
// Función helper para desenvolver datos
const unwrapBackendData = (response: any): any[] => {
    if (!response) return [];
    
    // Caso: array con objetos que tienen propiedad 'rows'
    if (Array.isArray(response) && response.length > 0) {
        return response[0]?.rows || response;
    }
    
    // Caso: objeto con propiedad 'data'
    if (response.data) {
        const data = response.data;
        if (Array.isArray(data) && data.length > 0) {
            return data[0]?.rows || data;
        }
        return data;
    }
    
    return [];
};

// Transformar al formato de la tabla
const transformToTableFormat = (data: any[]): TablaItem[] => {
    return data.map(item => ({
        categoria: item.categoria || item.nombre || '',
        casos: item.casos ?? item.total ?? 0,
        porcentaje: item.porcentaje ?? ''
    }));
};
```

---

## 15. PERSISTENCIA

### 15.1 Campos Observados

```typescript
// Definir watchedFields en constants
export const SECCIONXX_WATCHED_FIELDS: string[] = [
    'campo1',
    'campo2',
    'tabla1',
    'parrafo1',
    // ... todas las fotos
    ...Array.from({ length: 10 }, (_, i) => `fotografia${i + 1}Titulo`),
    ...Array.from({ length: 10 }, (_, i) => `fotografia${i + 1}Fuente`),
    ...Array.from({ length: 10 }, (_, i) => `fotografia${i + 1}Imagen`),
];
```

### 15.2 Activar Persistencia

```typescript
// En el componente
override useReactiveSync: boolean = true;
override watchedFields: string[] = SECCIONXX_WATCHED_FIELDS;
```

### 15.3 Guardado Automático

- Los cambios en campos observados se guardan automáticamente
- El guardado ocurre via `ProjectStateFacade`
- Los datos se persisten en `FormularioService` (localStorage)

---

## 16. GLOSARIO DE TÉRMINOS

| Término | Definición |
|---------|------------|
| **AISD** | Área de Influencia Social Directa - Comunidad Campesina |
| **AISI** | Área de Influencia Social Indirecta - Distrito/Centro Poblado |
| **Signal** | Tipo reactivo de Angular para estado derivadas |
| **computed** | Función que crea un Signal calculado |
| **Prefijo** | Sufijo `_A1`, `_A2`, etc. para aislar datos por grupo |
| **Watched Fields** | Campos que se observan para persistencia automática |
| **Form-Wrapper** | Componente contenedor del formulario |
| **Form-Component** | Componente con la lógica y template de edición |
| **View-Component** | Componente con el template de presentación |
| **Placeholder** | Valor temporal como `____` que se reemplaza dinámicamente |
| **Template** | Texto base con placeholders que se reemplaza |
| **Fallback** | Valor por defecto cuando no hay valor manual |

---

## 📌 RESUMEN DE LA ÚNICA VERDAD

### Reglas de Oro

1. **Signals en todo momento** - Nunca acceder directamente a `this.datos`
2. **Form y View sincronizados** - Ambos componentes tienen los mismos signals
3. **Constants centralizados** - Todo texto, label, hint en constants
4. **Placeholders dinámicos** - Usar `{COMUNIDAD}`, `{DISTRITO}`, `{CP}`
5. **10 fotos máximo** - Patrón consistente de fotografías
6. **OnPush siempre** - ChangeDetectionStrategy.OnPush en todos los componentes
7. **29 líneas del wrapper** - Copiar y pegar, nunca modificar
8. **Prefijos correctos** - AISD usa `_A*`, AISI usa `_B*`

### Estructura de Archivos por Sección

```
shared/components/
├── forms/seccionXX-form-wrapper.component.ts    (29 líneas - IGUAL)
└── seccionXX/
    ├── seccionXX-form.component.ts              (Signals + lógica)
    ├── seccionXX-form.component.html            (Inputs + editor)
    ├── seccionXX-view.component.ts              (Señales + presentación)
    ├── seccionXX-view.component.html             (Solo lectura)
    └── seccionXX-constants.ts                   (TODO centralizado)
```

---

*Documento generado el 17 de febrero de 2026*
*Este documento representa la arquitectura ideal para el proyecto Documentador*
