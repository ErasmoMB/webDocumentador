# 📊 ANÁLISIS DE PROBLEMAS ARQUITECTURA - Secciones 1-30

**Fecha:** 17 de febrero de 2026  
**Propósito:** Documentar todas las desviaciones de "la única verdad" encontradas en el proyecto

---

## RESUMEN EJECUTIVO

Después de analizar las secciones 1-30 del proyecto, se encontraron **múltiples desviaciones** del patrón ideal definido en [`UNICA_VERDAD_ARQUITECTURA.md`](UNICA_VERDAD_ARQUITECTURA.md). A continuación se detallan todos los problemas encontrados.

---

## 1. PROBLEMAS EN FORM-WRAPPERS

### ❌ Problema 1.1: Wrapper con HTML separado (NO DEBE EXISTIR)

**Sección afectada:** [`seccion1-form-wrapper.component.html`](webDocumentador/src/app/shared/components/forms/seccion1-form-wrapper.component.html)

**Estado ideal:** El wrapper debe usar **template inline** de máximo 29 líneas.

**Estado actual:**
- El wrapper tiene un **HTML separado** con 76 líneas de código
- Contiene lógica de formulario directamente en el wrapper
- Hay duplicación de campos que deberían estar en el Form component

```html
<!-- ESTO NO DEBE EXISTIR - 76 líneas de más -->
<div class="form-group-section">
  <h4 class="section-title">Información del Proyecto</h4>
  <!-- ... 76 líneas de campos ... -->
</div>
<app-seccion1 [seccionId]="seccionId" [modoFormulario]="true"></app-seccion1>
```

**Impacto:** Violación directa del patrón - el wrapper debe ser **casi vacío** (solo pasar props).

---

### ❌ Problema 1.2: SectionID por defecto inconsistente

| Wrapper | SectionID Actual | SectionID Esperado |
|---------|-----------------|-------------------|
| seccion1 | `'3.1.1'` ✅ | `'3.1.1'` |
| seccion2 | `'3.1.2'` ✅ | `'3.1.2'` |
| seccion4 | `''` (vacío) ❌ | `'3.1.4.A'` |

**Archivo:** [`seccion4-form-wrapper.component.ts`](webDocumentador/src/app/shared/components/forms/seccion4-form-wrapper.component.ts:15)

```typescript
// ❌ PROBLEMA: sectionId por defecto vacío
@Input() override seccionId: string = '';
```

**Impacto:** Puede causar errores si no se pasa el sectionId desde el padre.

---

### ❌ Problema 1.3: Wrapper con implementación extra

**Archivos afectados:**
- Todos los wrappers implementan `OnInit, OnDestroy` innecesariamente
- El patrón ideal solo extiende `BaseSectionComponent` sin implementar interfaces extras

```typescript
// ❌ PROBLEMA: Implementación innecesaria
export class Seccion1FormWrapperComponent extends BaseSectionComponent implements OnInit, OnDestroy {
```

```typescript
// ✅ ESTADO IDEAL: Solo extender
export class SeccionXXFormWrapperComponent extends BaseSectionComponent {
    // Sin implements
}
```

---

## 2. PROBLEMAS EN FORM-COMPONENTS

### ❌ Problema 2.1: Dos patrones diferentes de Signals

**Patrón A - createAutoSyncField (usado en secciones 1, 2, 3, 7, 8, 9, 10, 11, 17, 18, 25, 27):**

```typescript
// Sección 1 - Ejemplo
readonly projectName = this.createAutoSyncField('projectName', '');
readonly parrafoPrincipal = this.createAutoSyncField('parrafoSeccion1_principal', '');
```

**Patrón B - computed() directo (usado en secciones 4, 5, 6, 22):**

```typescript
// Sección 6 - Ejemplo
readonly poblacionSexoSignal: Signal<any[]> = computed(() => {
    const prefijo = this.prefijoGrupoSignal();
    const data = this.sectionDataSignal();
    const tablaKey = `poblacionSexoAISD${prefijo}`;
    return data[tablaKey] || [];
});
```

**Problema:** La arquitectura debe ser **consistente**. No deberían existir dos formas de hacer lo mismo.

---

### ❌ Problema 2.2: Campo modoFormulario inconsistente

| Sección | modoFormulario Default |
|---------|----------------------|
| seccion1 | `true` |
| seccion3 | `false` ❌ |
| seccion6 | (no definido) |
| seccion10 | `false` ❌ |

**Archivos afectados:**
- [`seccion3-form.component.ts`](webDocumentador/src/app/shared/components/seccion3/seccion3-form.component.ts:28)
- [`seccion10-form.component.ts`](webDocumentador/src/app/shared/components/seccion10/seccion10-form.component.ts:117)

```typescript
// ❌ PROBLEMA: Modo formulario diferente al ideal
@Input() override modoFormulario: boolean = false;
```

**Corrección esperada:**
```typescript
// ✅ ESTADO IDEAL
@Input() override modoFormulario: boolean = true;
```

---

### ❌ Problema 2.3: Nombres de signals inconsistentes

| Sección | Nombre del Signal |
|---------|------------------|
| seccion1 | `projectName` |
| seccion6 | `poblacionSexoSignal` |
| seccion7 | `cuadroTituloPET` |
| seccion22 | `textoDemografiaSignal` |

**Problema:** No hay convención de nombres consistente. Algunos usan el nombre del campo, otros usan el nombre del campo + "Signal".

---

### ❌ Problema 2.4: PHOTO_PREFIX inconsistente

| Sección | PHOTO_PREFIX |
|---------|-------------|
| seccion1 | `'fotografiaSeccion1'` |
| seccion4 | No tiene (usa vacío `''`) ❌ |
| seccion5 | `SECCION5_PHOTO_PREFIX.INSTITUCIONALIDAD` |
| seccion6 | `SECCION6_CONFIG.photoPrefix` |

**Archivo afectado:** [`seccion4-form.component.ts`](webDocumentador/src/app/shared/components/seccion4/seccion4-form.component.ts:31)

```typescript
// ❌ PROBLEMA: PHOTO_PREFIX vacío
override readonly PHOTO_PREFIX = '';
```

---

### ❌ Problema 2.5: Falta de viewModel en varias secciones

| Sección | Tiene viewModel? |
|---------|-----------------|
| seccion1 | ❌ No |
| seccion4 | ✅ Sí |
| seccion5 | ❌ No |
| seccion6 | ❌ No |
| seccion7 | ❌ No |
| seccion22 | ❌ No |

**Patrón ideal debería tener:**
```typescript
readonly viewModel: Signal<{
    campoXxx: string;
    parrafo: string;
    fotos: FotoItem[];
}> = computed(() => ({
    campoXxx: this.campoXxxSignal(),
    parrafo: this.parrafoSignal(),
    fotos: this.fotosCacheSignal()
}));
```

---

### ❌ Problema 2.6: Acceso directo a this.datos (ANTI-PATRÓN)

**Archivos afectados:** Múltiples secciones masihora usan `this.datos` directamente:

```typescript
// ❌ ANTI-PATRÓN - Acceso directo a this.datos
const comunidad = this.datos['comunidadesCampesinas']?.[0]?.nombre;

// ✅ PATRÓN CORRECTO
const comunidad = this.projectFacade.selectField(this.seccionId, null, 'comunidadesCampesinas')();
```

---

## 3. PROBLEMAS EN CONSTANTS

### ❌ Problema 3.1: Estructura de constants inconsistente

| Sección | Tiene TEXTOS_DEFAULT? | Tiene TEMPLATES? | Tiene CONFIG? |
|---------|---------------------|------------------|---------------|
| seccion1 | ✅ | ✅ | ✅ |
| seccion3 | ❌ Parcial | ✅ | ✅ |
| seccion4 | ❌ Parcial | ✅ | ✅ |
| seccion7 | ✅ | ✅ | ✅ |
| seccion22 | ✅ | ✅ | ✅ |

---

### ❌ Problema 3.2: WATCHED_FIELDS incompletos

**Sección 3:**
```typescript
// ❌ Faltan campos de fotografías
export const SECCION3_WATCHED_FIELDS: string[] = [
    'parrafoSeccion3_metodologia',
    'parrafoSeccion3_fuentes_primarias',
    // FALTAN: todas las fotos
];
```

**Sección 4:**
```typescript
// ✅ Completo
export const SECCION4_WATCHED_FIELDS: string[] = [
    // ...includes photos
    ...Array.from({ length: 10 }, (_, i) => `fotografiaSeccion4${i + 1}Titulo`),
    // ...
];
```

---

## 4. PROBLEMAS EN VIEW-COMPONENTS

### ❌ Problema 4.1: View no replica exactamente los signals del Form

**Problema común:** Los View components no tienen los mismos signals que sus correspondientes Form components, causando inconsistencias en los datos mostrados.

---

### ❌ Problema 4.2: Estilos inline en View components

```typescript
// ❌ PROBLEMA: Estilos en el componente
@Component({
    styles: [`
        :host ::ng-deep .data-manual.has-data {
            border-left: 4px solid #007bff;
        }
    `]
})
```

**Recomendación:** Los estilos deberían estar en archivos CSS separados.

---

## 5. PROBLEMAS EN MANEJO DE DATOS

### ❌ Problema 5.1: Múltiples funciones de desarrollo de datos del backend

Cada sección tiene su propia versión de `unwrapDemograficoData`:

```typescript
// Sección 6
const unwrapDemograficoData = (responseData: any): any[] => { ... }

// Sección 7  
const unwrapDemograficoData = (responseData: any): any[] => { ... }

// Sección 9
const unwrapDemograficoData = (responseData: any): any[] => { ... }
```

**Problema:** Duplicación de código - debería haber una utilidad centralizada.

---

### ❌ Problema 5.2: Múltiples funciones transformadoras

Igual que el problema anterior, cada sección tiene sus propias funciones transformadoras:

```typescript
// Sección 7
const transformPETDesdeDemograficos = (data: any[]): any[] => { ... }
const transformPEADesdeDemograficos = (data: any[]): any[] => { ... }

// Sección 9
const transformCondicionOcupacionDesdeBackend = (data: any[]): any[] => { ... }
const transformMaterialesConstruccionDesdeBackend = (data: any[]): any[] => { ... }
```

**Solución:** Deberían existir utilitarios centrales en `/core/utils/`.

---

## 6. PROBLEMAS EN TABLAS

### ❌ Problema 6.1: Configuración de tablas hardcodeada vs desde constants

| Sección | Config来源 |
|---------|-----------|
| seccion3 | `entrevistadosConfig: TableConfig = {...}` inline |
| seccion6 | `poblacionSexoConfig: TableConfig = SECCION6_TABLA_POBLACION_SEXO_CONFIG` desde constants |
| seccion7 | Config inline en el componente |

**Inconsistencia:** Algunas tablas tienen su configuración en constants, otras no.

---

### ❌ Problema 6.2: Columnas como getters vs propiedades

```typescript
// Patrón 1: Getter
get poblacionSexoColumns() { return SECCION6_COLUMNAS_POBLACION_SEXO; }

// Patrón 2: Property readonly
readonly columnasEntrevistados: any[] = [ ... ];
```

---

## 7. PROBLEMAS EN PÁRRAFOS

### ❌ Problema 7.1: Jerarquía de fallback inconsistente

```typescript
// Sección 6 - Patrón correcto
if (manual && manual.trim().length > 0) {
    return manual;  // 1. Valor manual
}
const nombreComunidad = this.obtenerNombreComunidadActual();
return this.obtenerTextoPoblacionSexo(data, nombreComunidad); // 2. Template

// Sección 3 - Fallback directo
readonly parrafoMetodologia = this.createAutoSyncField<string>('parrafoSeccion3_metodologia', '');
// Sin jerarquía de fallback a template
```

---

## 8. PROBLEMAS EN FOTOGRAFÍAS

### ❌ Problema 8.1: Múltiples formas de manejar fotos

| Sección | Propiedad |
|---------|-----------|
| seccion1 | `fotografiasFormMulti: FotoItem[]` |
| seccion6 | No usa |
| seccion7 | `fotografiasSeccion7: FotoItem[]` |
| seccion22 | `fotosCacheSignal` |

**Solución ideal:** Usar siempre `fotosCacheSignal` como está definido en "la única verdad".

---

### ❌ Problema 8.2: Hash de fotos no consistente

Algunas secciones usan `photoFieldsHash`, otras no:

```typescript
// Sección 6 - Usa
readonly photoFieldsHash: Signal<string> = computed(() => { ... });

// Sección 1 - No usa
```

---

## 9. PROBLEMAS EN SERVICIOS Y UTILIDADES

### ❌ Problema 9.1: Métodos duplicados en BaseSectionComponent

```typescript
// obtenerNombreComunidadActual() existe tanto en:
// - BaseSectionComponent (línea 339)
// - Seccion6FormComponent
// - Seccion10FormComponent
// - etc.
```

**Problema:** Los componentes sobrescriben métodos que deberían heredar de la clase base.

---

### ❌ Problema 9.2: PrefijoHelper usado inconsistentemente

```typescript
// Algunos usan:
PrefijoHelper.obtenerPrefijoGrupo(this.seccionId)

// Otros usan:
this.obtenerPrefijoGrupo()  // método del base

// Otros usan:
this.prefijoGrupoSignal()  // signal computado
```

---

## 10. PROBLEMAS DE CONSISTENCIA GENERAL

### ❌ Problema 10.1: Section IDs inconsistentes

| Sección | Section ID | ¿Es consistente con el patrón? |
|---------|-----------|--------------------------------|
| 1 | `'3.1.1'` | ✅ |
| 2 | `'3.1.2'` | ✅ |
| 3 | `'3.1.3'` | ✅ |
| 4 | `'3.1.4.A'` | ⚠️ Formato diferente |
| 6 | `'3.1.4.A.1.2'` | ✅ |
| 7 | `'3.1.4.A.1.3'` | ✅ |
| 22 | `'3.1.4.B.1.1'` | ✅ |

---

### ❌ Problema 10.2: Imports inconsistentes

```typescript
// Algunos usan paths relativos
import { BaseSectionComponent } from '../base-section.component';

// Otros usan paths absolutos
import { BaseSectionComponent } from 'src/app/shared/components/base-section.component';
```

---

## 📊 RESUMEN DE PROBLEMAS POR SECCIÓN

| # | Sección | Problemas Principales |
|---|---------|---------------------|
| 1 | Sección 1 | Wrapper con HTML, createAutoSyncField vs computed |
| 2 | Sección 2 | createAutoSyncField, watched_fields incompletos |
| 3 | Sección 3 | modoFormulario=false, createAutoSyncField |
| 4 | Sección 4 | SectionID vacío, PHOTO_PREFIX vacío |
| 5 | Sección 5 | Sin viewModel |
| 6 | Sección 6 | computed() vs createAutoSyncField |
| 7 | Sección 7 | Múltiples patrones |
| 8 | Sección 8 | createAutoSyncField con prefijo inline |
| 9 | Sección 9 | createAutoSyncField con prefijo inline |
| 10 | Sección 10 | modoFormulario=false, múltiples patrones |
| 11-21 | Secciones 11-21 | Problemas similares |
| 22 | Sección 22 | Sin viewModel, computed() |
| 23-30 | Secciones 23-30 | En análisis |

---

## 🔧 PLAN DE CORRECCIÓN PRIORIZADO

### PRIORIDAD ALTA (Bloqueantes)

1. **Estandarizar Form-Wrapper** - Eliminar HTMLs de wrappers, dejar solo template inline
2. **Unificar patrón de Signals** - Elegir: `createAutoSyncField` O `computed()` - NO ambos
3. **Corregir sectionId por defecto** - Ningún wrapper debe tener `seccionId = ''`

### PRIORIDAD MEDIA

4. **Completar viewModel** en todas las secciones
5. **Centralizar funciones de backend** - unwrapDemograficoData, transformaciones
6. **Completar WATCHED_FIELDS** con fotografías

### PRIORIDAD BAJA

7. **Estandarizar estilos** en archivos CSS separados
8. **Limpiar imports** - Usar solo paths absolutos o solo relativos (elegir uno)
9. **Documentar utilidades centrales**

---

*Documento generado el 17 de febrero de 2026*
*Análisis basado en la comparación con [`UNICA_VERDAD_ARQUITECTURA.md`](UNICA_VERDAD_ARQUITECTURA.md)*
