# Guia de Migracion para Secciones AISD

## Resumen

Este documento describe el proceso de migracion para implementar aislamiento de datos entre grupos AISD (Area de Influencia Social Directa) usando prefijos dinamicos.

## Objetivo

Cada grupo AISD (A.1, A.2, A.3...) debe tener:
- Sus propios datos aislados
- Sus propios titulos y fuentes
- Su propia numeracion global de tablas y fotos
- Sin interferencia entre grupos

## Arquitectura de Prefijos

### Sistema de Prefijos

| Grupo | Prefijo de Grupo | Ejemplo de Campo |
|-------|------------------|------------------|
| AISD-1 | _A1 | tablaAISD1Datos_A1, fotografiaCahuacho_A1 |
| AISD-2 | _A2 | tablaAISD1Datos_A2, fotografiaSondor_A2 |
| AISD-3 | _A3 | tablaAISD1Datos_A3, fotografiaPaucaray_A3 |

### Prefijos de Fotos por Seccion

Cada subseccion tiene su propio prefijo de foto:

| SectionId | Prefijo Base | Ejemplo Completo |
|-----------|--------------|------------------|
| 3.1.4.A.1 | fotografiaCahuacho | fotografiaCahuacho_A1 |
| 3.1.4.A.1.1 | fotografiaCahuacho | fotografiaCahuacho_A1 |
| 3.1.4.A.1.2 | fotografiaCapital | fotografiaCapital_A1 |
| 3.1.4.A.1.3 | fotografiaCahuacho | fotografiaCahuacho_A1 |
| ... | ... | ... |

## Archivos Clave

### ⚠️ IMPORTANTE: Servicios que NO se deben modificar

Los siguientes servicios YA soportan AISD y AISI. NO los modifiques:

| Servicio | Estado | Razon |
|----------|--------|-------|
| global-numbering.service.ts | ✅ Listo | Ya calcula numeracion global para AISD (36 tablas) y AISI (22 tablas) |
| photo-numbering.service.ts | ✅ Listo | Ya delega a GlobalNumberingService para ambos grupos |
| PrefijoHelper | ✅ Listo | Ya extrae `_A1`, `_A2` (AISD) y `_B1`, `_B2` (AISI) |
| group-config.model.ts | ✅ Listo | Ya soporta tipos 'AISD' y 'AISI' |
| table-initialization.service.ts | ✅ Listo | Ya respeta noInicializarDesdeEstructura |
| table-handler-factory.service.ts | ✅ Listo | Ya respeta noInicializarDesdeEstructura |
| project-state.facade.ts | ✅ Listo | Ya tiene groupsByType('AISD') y groupsByType('AISI') |

> **Esta es la BASE que se us para AMBOS grupos. La logica ya esta implementada.**

### Servicios Centrales

1. src/app/core/services/global-numbering.service.ts
   - Calcula numeracion global de tablas y fotos
   - getGlobalTableNumber(sectionId, localTableIndex)
   - getGlobalPhotoNumber(sectionId, fotoIndex, photoPrefix)

2. src/app/core/services/photo-numbering.service.ts
   - Delega a GlobalNumberingService
   - getGlobalPhotoNumber(sectionId, fotoIndex)

3. src/app/core/services/aisd-group.service.ts
   - Maneja grupos AISD dinamicos
   - getCurrentAISDGroup()
   - getAllAISDGroups()

### Componentes de Referencia (Seccion 4)

- src/app/shared/components/seccion4/seccion4-form.component.ts
- src/app/shared/components/seccion4/seccion4-view.component.ts
- src/app/shared/components/seccion4/seccion4-form.component.html
- src/app/shared/components/seccion4/seccion4.component.html

**Lo que se implementó en Sección 4:**
- ✅ Signals para prefijos de fotos (`photoPrefixUbicacionSignal`, `photoPrefixPoblacionSignal`)
- ✅ Signals para tablas (`tablaAISD1Signal`, `tablaAISD2Signal`)
- ✅ Uso de `aisdGroupService` para obtener datos del grupo actual
- ✅ HTML actualizado para usar signals con prefijos
- ⚠️ Las tablas aún usan `tablaKey` estático (pendiente de mejora)

## Proceso de Migracion por Seccion

### Archivos a Revisar por Seccion

Por CADA seccion que se migra, se deben revisar y modificar los siguientes archivos:

| Archivo | Descripcion | Accion Requerida
|---------|-------------|------------------
| `seccionX-form.component.ts` | Lógica del formulario | Agregar signals, handlers con prefijos
| `seccionX-form.component.html` | Vista del formulario | Actualizar bindings con signals
| `seccionX-view.component.ts` | Lógica de visualizacion | Agregar signals, metodos con prefijos
| `seccionX-view.component.html` | Vista de visualizacion | Actualizar bindings con metodos prefijados

> ⚠️ **IMPORTANTE**: Se deben revisar y modificar los 4 archivos. No basta con solo el TS.

### Flujo de Trabajo para Migrar UNA Seccion

```
1. Analizar seccionX-form.component.ts
   └─ Identificar campos sin prefijo
   └─ Agregar signals con prefijos
   └─ Actualizar handlers de cambio

2. Analizar seccionX-form.component.html  
   └─ Cambiar acceso directo a datos por signals/metodos
   └─ Usar metodos del componente en lugar de datos['campo']

3. Analizar seccionX-view.component.ts
   └─ Agregar signals para tablas con prefijos
   └─ Agregar photoFieldsHash con prefijo
   └─ Agregar metodos para titulos/fuentes con prefijos

4. Analizar seccionX-view.component.html
   └─ Usar metodos del componente en lugar de datos['campo']
   └─ Verificar que no haya acceso directo sin prefijo

5. Verificar CONSISTENCIA entre Form y View
   └─ Ambos deben usar los MISMOS keys de tabla
   └─ photoFieldsHash debe incluir prefijo
   └─ Los metodos deben retornar el mismo resultado
```

## Pasos de Migracion

### Paso 1: Agregar Signal de Prefijo de Foto

```typescript
// En el componente (form o view)
private aisdGroupService = inject(AISDGroupService);

readonly photoPrefixSignal: Signal<string> = computed(() => {
  const grupo = this.aisdGroupService.obtenerGrupoActual(this.seccionId);
  if (!grupo) return 'fotografia';
  
  const prefijoCP = this.obtenerPrefijoCP(grupo);
  const prefijoGrupo = `_${grupo.prefijoGrupo}`; // ej: _A1
  return prefijoCP ? `${prefijoCP}${prefijoGrupo}` : `fotografia${prefijoGrupo}`;
});
```

### Paso 2: Actualizar Signals de Datos

```typescript
// ANTES (sin aislamiento)
readonly tablaAISD1Signal: Signal<any[]> = computed(() => {
  return this.projectFacade.selectTableData(this.seccionId, null, 'tablaAISD1Datos')() ?? [];
});

// DESPUES (con aislamiento)
readonly tablaAISD1Signal: Signal<any[]> = computed(() => {
  const prefijo = this.obtenerPrefijoGrupo();
  const tablaKey = prefijo ? `tablaAISD1Datos${prefijo}` : 'tablaAISD1Datos';
  return this.projectFacade.selectTableData(this.seccionId, null, tablaKey)() ?? 
         this.projectFacade.selectField(this.seccionId, null, tablaKey)() ?? [];
});
```

### Paso 3: Actualizar Handlers de Cambio

```typescript
// ANTES
onTablaAISD1Change(valor: any[]): void {
  this.projectFacade.updateField(this.seccionId, null, 'tablaAISD1Datos', valor);
}

// DESPUES
onTablaAISD1Change(valor: any[]): void {
  const prefijo = this.obtenerPrefijoGrupo();
  const campoKey = prefijo ? `tablaAISD1Datos${prefijo}` : 'tablaAISD1Datos';
  this.projectFacade.updateField(this.seccionId, null, campoKey, valor);
}
```

### Paso 3b: Sobrescribir onFieldChange para agregar prefijos automáticamente

**PROBLEMA COMÚN:** Los campos se guardan sin prefijo pero se leen con prefijo, causando que los cambios no se vean en la Vista.

**SOLUCIÓN:** Sobrescribir `onFieldChange` en el componente Form para que agregue el prefijo automáticamente:

```typescript
// En seccionX-form.component.ts
override onFieldChange(fieldId: string, value: any, options?: { refresh?: boolean }): void {
  // Agregar prefijo al campo para aislamiento AISD
  const prefijo = this.obtenerPrefijo();
  const campoConPrefijo = prefijo ? `${fieldId}${prefijo}` : fieldId;
  super.onFieldChange(campoConPrefijo, value, options);
}
```

**Beneficio:** No necesitas modificar el HTML para agregar prefijos en los handlers. El método `onFieldChange` se encarga automáticamente.

**Ejemplo de uso en HTML:**
```html
<!-- El HTML usa el fieldId sin prefijo -->
<textarea [ngModel]="parrafoSignal()"
          (ngModelChange)="onFieldChange('parrafoSeccion12_salud_completo', $event)">
</textarea>

<!-- Se guarda automáticamente como: parrafoSeccion12_salud_completo_A1 -->
```

### Paso 4: Actualizar HTML

```html
<!-- ANTES - SIN AISLAMIENT O (un solo tipo de foto por seccion) -->
<input type="text" class="form-control" [(ngModel)]="datos['cuadroTituloAISD1']">
<app-dynamic-table [tablaKey]="'tablaAISD1Datos'"></app-dynamic-table>
<img [src]="datos['fotografia1Imagen']" [alt]="'Fotografia 1'">

<!-- DESPUES - CON AISLAMIENT O (una sola foto generica) -->
<input type="text" class="form-control" [(ngModel)]="datos[cuadroTituloAISD1Signal()]">
<app-dynamic-table [tablaKey]="tablaKeyAISD1Signal()"></app-dynamic-table>
<img [src]="datos[photoPrefixSignal() + '1Imagen']" [alt]="'Fotografia 1'">

<!-- IMPORTANTE: MULTIPLES FOTOS POR SECCION -->
<!-- Cuando hay varios image-upload, cada uno necesita su propio prefijo + grupo -->
<app-image-upload
  [fotografias]="fotosCapitalSignal()"
  [sectionId]="seccionId"
  [photoPrefix]="'fotografiaCapital' + obtenerPrefijoGrupo()"
  [permitirMultiples]="true"
  ...>
</app-image-upload>

<app-image-upload
  [fotografias]="fotosCentrosPobladosSignal()"
  [sectionId]="seccionId"
  [photoPrefix]="'fotografiaCentrosPoblados' + obtenerPrefijoGrupo()"
  [permitirMultiples]="true"
  ...>
</app-image-upload>
```

> ⚠️ **CRÍTICO: CONSISTENCIA ENTRE FORM Y VIEW**
> 
> Para evitar problemas de datos, ASEGURATE de que:
> 1. Form y View usen los MISMOS keys de tabla/foto
> 2. El photoFieldsHash incluya el prefijo de grupo
> 3. Los signals del View sigan el mismo patron que el Form
> 
> **Ejemplo de inconsistencia que causa problemas:**
> ```html
> <!-- ❌ INCORRECTO: Form usa 'institucionesSeccion5', View usa 'tablepagina6' -->
> <!-- Form: [tablaKey]="tablaKeyInstitucionesSignal()" --> 
> <!-- View: [tablaKey]="'tablepagina6' + obtenerPrefijoGrupo()" -->
> ```
> 
> **✅ CORRECTO: Ambos usan el mismo key**
> ```html
> <!-- Form: [tablaKey]="tablaKeyInstitucionesSignal()" --> 
> <!-- View: [tablaKey]="'institucionesSeccion5' + obtenerPrefijoGrupo()" -->
> ```

> Nota: obtenerPrefijoGrupo() retorna _A1, _A2, _A3, etc. El resultado sera:
> - fotografiaCapital_A1 para grupo A.1
> - fotografiaCentrosPoblados_A1 para grupo A.1
> - fotografiaCapital_A2 para grupo A.2

### Paso 5: Agregar Numeracion Global

```typescript
// En el componente view
readonly globalTableNumberSignal: Signal<string> = computed(() => {
  return this.globalNumberingService.getGlobalTableNumber(this.seccionId, 0);
});

readonly globalTableNumberSignal2: Signal<string> = computed(() => {
  return this.globalNumberingService.getGlobalTableNumber(this.seccionId, 1);
});
```

```html
<!-- En el HTML del view -->
<p class="table-title">Cuadro Ndeg {{ globalTableNumberSignal() }}</p>
<app-table-wrapper [id]="'tabla-aisd-1'" [hideNumber]="true">
  <app-dynamic-table [tablaKey]="tablaKeyAISD1Signal()"></app-dynamic-table>
</app-table-wrapper>

<p class="table-title">Cuadro Ndeg {{ globalTableNumberSignal2() }}</p>
<app-table-wrapper [id]="'tabla-aisd-2'" [hideNumber]="true">
  <app-dynamic-table [tablaKey]="tablaKeyAISD2Signal()"></app-dynamic-table>
</app-table-wrapper>
```

### Paso 6: photoFieldsHash con Prefijo

Para que las fotos se actualicen correctamente al cambiar de grupo, el signal `photoFieldsHash` debe incluir el prefijo:

```typescript
// ❌ INCORRECTO: No incluye prefijo
readonly photoFieldsHash: Signal<string> = computed(() => {
  let hash = '';
  for (let i = 1; i <= 10; i++) {
    const tituloKey = `${this.PHOTO_PREFIX}${i}Titulo`;  // ⚠️ Falta prefijo
    // ...
  }
  return hash;
});

// ✅ CORRECTO: Incluye prefijo de grupo
readonly photoFieldsHash: Signal<string> = computed(() => {
  let hash = '';
  const prefijo = this.obtenerPrefijoGrupo();
  const prefix = `${this.PHOTO_PREFIX}${prefijo}`;  // ✅ Con prefijo
  for (let i = 1; i <= 10; i++) {
    const tituloKey = `${prefix}${i}Titulo`;
    const fuenteKey = `${prefix}${i}Fuente`;
    const imagenKey = `${prefix}${i}Imagen`;
    // ...
  }
  return hash;
});
```

> **Nota:** Sin el prefijo, el hash monitorea las fotos incorrectas y las fotos no se actualizan al cambiar de grupo.

### Paso 7: Text Generator Services con Prefijo

Los servicios de generación de texto deben usar `PrefijoHelper` para leer campos con prefijo:

```typescript
// ANTES - ❌ No usa prefijo
obtenerTextoIntroduccionAISD(datos: any, nombreComunidad: string): string {
  let textoPersonalizado = datos['parrafoSeccion4_introduccion_aisd'];
  // ...
}

// DESPUES - ✅ Usa PrefijoHelper con fallback
import { PrefijoHelper } from 'src/app/shared/utils/prefijo-helper';

private obtenerCampoConPrefijo(datos: any, campoBase: string, seccionId: string): string {
  return PrefijoHelper.obtenerValorConPrefijo(datos, campoBase, seccionId) || datos[campoBase] || '';
}

obtenerTextoIntroduccionAISD(datos: any, nombreComunidad: string, seccionId: string): string {
  const textoPersonalizado = this.obtenerCampoConPrefijo(datos, 'parrafoSeccion4_introduccion_aisd', seccionId);
  // ...
}
```

**Importante:** El servicio debe recibir `seccionId` como parámetro.

### Paso 8: ViewModel con Campos Prefijados

El viewModel debe incluir los campos con prefijo para que el HTML los use correctamente:

```typescript
this.viewModel = computed(() => {
  const sectionData = this.formDataSignal();
  const prefijo = this.obtenerPrefijoGrupo();
  
  return {
    data: {
      ...data,
      cuadroTituloAISD1: data['cuadroTituloAISD1' + prefijo] ?? '',
    },
    sources: {
      tablaAISD1Source: data['cuadroFuenteAISD1' + prefijo] ?? '',
      tablaAISD2Source: data['cuadroFuenteAISD2' + prefijo] ?? ''
    }
  };
});
```

### Paso 9: HTML del View con Prefijos

El HTML del view debe usar los campos con prefijo:

```html
<!-- ❌ INCORRECTO - Campo sin prefijo -->
<input type="text" [ngModel]="datos['cuadroTituloAISD1']">

<!-- ✅ CORRECTO - Campo con prefijo -->
<input type="text" [ngModel]="datos['cuadroTituloAISD1' + obtenerPrefijo()]">

<!-- ❌ BUG - Usa campo incorrecto -->
<app-table-wrapper [title]="(vm.data['cuadroTituloAISD1'] || ...) + ' – CC ' + vm.nombreComunidad">
  <!-- La tabla de POBLACION usa el titulo de UBICACION! -->
</app-table-wrapper>

<!-- ✅ CORRECTO - Campo correcto -->
<app-table-wrapper [title]="(vm.data['cuadroTituloAISD2'] || ...) + ' – CC ' + vm.nombreComunidad">
  <!-- La tabla de POBLACION usa SU propio titulo -->
</app-table-wrapper>
```

### Paso 10: Eliminar Estructura Inicial de Tablas (Opcional)

Si las tablas se llenaran con datos del backend, eliminar la estructura inicial predefined:

```typescript
// En el config de la tabla (form component)
readonly miTablaConfig: TableConfig = {
  tablaKey: 'tablaAISD1',
  totalKey: 'categoria',
  campoTotal: 'casos',
  campoPorcentaje: 'porcentaje',
  noInicializarDesdeEstructura: true,  // Agregar este flag
  calcularPorcentajes: true,
  camposParaCalcular: ['casos']
};
```

**Resultado:**
- Si hay datos del backend -> se muestran
- Si no hay datos -> tabla vacia []

### Paso 11: Patrón para Textos en View (SIMPLE)

**PROBLEMA COMÚN:** Usar `[innerHTML]` con servicios de texto resaltado puede causar que los cambios no se reflejen en la Vista.

**SOLUCIÓN:** Usar interpolación simple `{{ }}` con un método que lee directamente del signal (patrón sección 5):

```typescript
// View Component - Método simple que lee del signal
obtenerTextoPoblacionSexoView(): string {
  const texto = this.vistTextoPoblacionSexoSignal();
  const nombreComunidad = this.obtenerNombreComunidadActual();
  if (texto && texto.trim() !== '' && texto !== '____') {
    return texto.replace(/___/g, nombreComunidad);
  }
  // Fallback al texto por defecto
  return this.textGenSrv.obtenerTextoPoblacionSexo(
    this.vistDataSignal(),
    nombreComunidad,
    this.seccionId
  );
}
```

```html
<!-- View HTML - Interpolación simple -->
<p class="text-justify">{{ obtenerTextoPoblacionSexoView() }}</p>
```

> **Nota:** Este patrón es más simple y directo que usar `[innerHTML]` con servicios de texto resaltado. Evita problemas de reactividad.

## Helper Functions

### obtenerPrefijoCP()

```typescript
private obtenerPrefijoCP(grupo?: any): string {
  if (!grupo?.centroPoblado) return '';
  
  const cp = grupo.centroPoblado.toLowerCase().replace(/\s+/g, '');
  const mapeo: Record<string, string> = {
    'cahuacho': 'Cahuacho',
    'sondor': 'Sondor',
    'paucaray': 'Paucaray',
    // agregar mas segun necesidad
  };
  
  return mapeo[cp] || cp.charAt(0).toUpperCase() + cp.slice(1);
}
```

### obtenerPrefijoGrupo()

```typescript
private obtenerPrefijoGrupo(): string {
  const grupo = this.aisdGroupService.obtenerGrupoActual(this.seccionId);
  if (!grupo) return '';
  return `_${grupo.prefijoGrupo}`; // ej: '_A1'
}
```

## Verificacion

### Checklist de Migracion

- [ ] Signals de datos usan prefijos
- [ ] Handlers de cambio usan prefijos
- [ ] HTML usa signals con prefijos
- [ ] Numeracion global funciona
- [ ] Fotos usan photoPrefixSignal
- [ ] Titulos y fuentes usan prefijos
- [ ] Datos no se mezclan entre grupos
- [ ] **CONSISTENCIA CRÍTICA entre Form y View:**
  - [ ] Form y View usan los MISMOS keys de tabla
  - [ ] photoFieldsHash incluye el prefijo de grupo
  - [ ] Text Generators usan PrefijoHelper con fallback
  - [ ] ViewModel incluye campos con prefijo
  - [ ] HTML del view usa campos con prefijo
- [ ] **VERIFICAR BUGS COMUNES:**
  - [ ] Tablas usan campos correctos (cuadroTituloAISD1 vs cuadroTituloAISD2)
  - [ ] Fuentes usan campos correctos (cuadroFuenteAISD1 vs cuadroFuenteAISD2)
- [ ] Debug logging configurado (opcional)
- [ ] Tablas sin estructura inicial (si aplica)
  - [ ] Agregado noInicializarDesdeEstructura: true
  - [ ] Verificado que backend llenara datos

### Debug Logging

Activar logs en global-numbering.service.ts:

```typescript
// Descomentar console.log en:
// - calculatePhotoOffset
// - getGlobalPhotoNumber
// - countImagesInSection
```

## Secciones por Migrar

| Seccion | Estado | Complejidad |
|---------|--------|-------------|
| 4 | ✅ Completada | Media |
| 5 | ✅ Completada | Media |
| 6 | ✅ Completada | Media |
| 7 | ✅ Completada | Media |
| 8 | ✅ Completada | Media |
| 9 | ✅ Completada | Media |
| 10 | ✅ Completada | Media |
| 11 | ⏳ Pendiente | Media |
| 12 | ✅ Completada | Media |
| 13 | ✅ Completada | Media |
| 14 | ✅ Completada | Media |
| 15 | ⏳ Pendiente | Media |
| 16 | ⏳ Pendiente | Media |
| 17 | ⏳ Pendiente | Media |
| 18 | ⏳ Pendiente | Media |
| 19 | ⏳ Pendiente | Media |
| 20 | ⏳ Pendiente | Media |

## Problemas Comunes

### 1. Datos no se guardan correctamente

Sintoma: Los cambios no se reflejan al cambiar de grupo.

Solucion: Verificar que los handlers usen obtenerPrefijoGrupo() correctamente.

### 2. Numeracion global incorrecta

Sintoma: Las tablas/fotos muestran numeros incorrectos.

Solucion: Verificar calculatePhotoOffset y getGlobalTableNumber.

### 3. Fotos no se muestran

Sintoma: Las imagenes aparecen vacias.

Solucion: Verificar que photoPrefixSignal() genere el prefijo correcto.

### 4. Fotos no se muestran

Sintoma: Las imagenes aparecen vacias.

Solucion: Verificar que photoPrefixSignal() genere el prefijo correcto.

### 5. Datos no se cargan en View (FORM Y VIEW INCONSISTENTES)

Sintoma: Los cambios se guardan en el Form pero no se ven en el View.

Causa: Form y View usan keys diferentes para las mismas tablas/fotos.

**Causa comun:** El `onFieldChange` se llama con fieldId sin prefijo, pero el View lee con prefijo.

**Solucion:** Sobrescribir `onFieldChange` en el componente Form:

```typescript
override onFieldChange(fieldId: string, value: any, options?: { refresh?: boolean }): void {
  const prefijo = this.obtenerPrefijo();
  const campoConPrefijo = prefijo ? `${fieldId}${prefijo}` : fieldId;
  super.onFieldChange(campoConPrefijo, value, options);
}
```

### 6. Datos guardados antes de la migracion no se muestran

Sintoma: Los datos existentes (guardados antes de implementar prefijos) no aparecen en la Vista.

Causa: Los datos antiguos están guardados en campos sin prefijo (ej: `parrafoSeccion12_salud_completo`), pero la Vista busca campos con prefijo (ej: `parrafoSeccion12_salud_completo_A1`).

Solucion: El usuario debe re-ingresar los datos para que se guarden con el nuevo formato.

Alternativamente, implementar un fallback en el signal:

```typescript
readonly parrafoSaludSignal: Signal<string> = computed(() => {
  const prefijo = this.obtenerPrefijo();
  const data = this.allSectionData();
  // Primero intentar con prefijo, luego sin prefijo (fallback)
  const manual = data[`parrafoSeccion12_salud_completo${prefijo}`] || 
                 data['parrafoSeccion12_salud_completo'];
  // ... resto del codigo
});
```


Solucion: Verificar que ambos usen los MISMOS keys:

```typescript
// ❌ INCORRECTO - Keys diferentes
// Form: usa 'institucionesSeccion5_A1'
// View: usa 'tablepagina6_A1'

// ✅ CORRECTO - Keys iguales
// Form: tablaKeyInstitucionesSignal() -> 'institucionesSeccion5_A1'
// View: 'institucionesSeccion5' + obtenerPrefijoGrupo() -> 'institucionesSeccion5_A1'
```

### 6. Fotos no se actualizan al cambiar de grupo

Sintoma: Las fotos del grupo anterior permanecen visibles al cambiar de grupo.

Causa: El signal photoFieldsHash no incluye el prefijo de grupo.

Solucion: Actualizar photoFieldsHash para incluir el prefijo.

### 7. BUG: Camposmezclados (Titulos/Fuentes)

Sintoma: La tabla de Población muestra el título/fuente de la tabla de Ubicación.

Causa: Bug en el código donde se usa el campo incorrecto.

Solucion: Verificar que cada tabla use SU campo:

```typescript
// ❌ INCORRECTO - BUG
sources: {
  tablaAISD1Source: data['cuadroFuenteAISD1'],
  tablaAISD2Source: data['cuadroFuenteAISD1']  // ❌ BUG! Debería ser AISD2
}

// ✅ CORRECTO
sources: {
  tablaAISD1Source: data['cuadroFuenteAISD1' + prefijo],
  tablaAISD2Source: data['cuadroFuenteAISD2' + prefijo]
}

// ❌ INCORRECTO - BUG en HTML
<app-table-wrapper [title]="(vm.data['cuadroTituloAISD1'] || ...) + ...">
  <!-- La tabla de POBLACION usa el titulo de UBICACION! -->
</app-table-wrapper>

// ✅ CORRECTO
<app-table-wrapper [title]="(vm.data['cuadroTituloAISD2'] || ...) + ...">
  <!-- La tabla de POBLACION usa SU propio titulo -->
</app-table-wrapper>
```

### 8. Text Generators no usan PrefijoHelper

Sintoma: Los cambios en el Form no se ven en el View.

Causa: El Text Generator lee campos sin prefijo, pero el Form guarda con prefijo.

Solucion: Actualizar Text Generator para usar PrefijoHelper:

```typescript
// ❌ INCORRECTO
obtenerTextoIntroduccionAISD(datos: any, nombreComunidad: string): string {
  let textoPersonalizado = datos['parrafoSeccion4_introduccion_aisd'];  // Sin prefijo
  // ...
}

// ✅ CORRECTO
import { PrefijoHelper } from 'src/app/shared/utils/prefijo-helper';

private obtenerCampoConPrefijo(datos: any, campo: string, seccionId: string): string {
  return PrefijoHelper.obtenerValorConPrefijo(datos, campo, seccionId) || datos[campo] || '';
}

obtenerTextoIntroduccionAISD(datos: any, nombreComunidad: string, seccionId: string): string {
  const textoPersonalizado = this.obtenerCampoConPrefijo(datos, 'parrafoSeccion4_introduccion_aisd', seccionId);
  // ...
}
```

> **Nota:** El Text Generator debe recibir `seccionId` como tercer parámetro.

### 9. photoFieldsHash sin prefijo

Sintoma: Las fotos del grupo anterior permanecen visibles al cambiar de grupo.

Causa: El signal photoFieldsHash no incluye el prefijo de grupo.

Solucion: Actualizar photoFieldsHash para incluir el prefijo:

```typescript
// ❌ INCORRECTO
readonly photoFieldsHash: Signal<string> = computed(() => {
  let hash = '';
  for (let i = 1; i <= 10; i++) {
    const tituloKey = `${this.PHOTO_PREFIX}${i}Titulo`;  // ❌ Falta prefijo
    // ...
  }
  return hash;
});

// ✅ CORRECTO
readonly photoFieldsHash: Signal<string> = computed(() => {
  let hash = '';
  const prefijo = this.obtenerPrefijoGrupo();
  const prefix = `${this.PHOTO_PREFIX}${prefijo}`;  // ✅ Con prefijo
  for (let i = 1; i <= 10; i++) {
    const tituloKey = `${prefix}${i}Titulo`;
    const fuenteKey = `${prefix}${i}Fuente`;
    const imagenKey = `${prefix}${i}Imagen`;
    // ...
  }
  return hash;
});
```

## Diferencias con AISI

| Aspecto | AISD | AISI |
|---------|------|------|
| Prefijos | _A1, _A2, _A3 | _B1, _B2, _B3 |
| SectionId | 3.1.4.A.1, 3.1.4.A.2 | 3.1.4.B.1, 3.1.4.B.2 |
| Tablas por grupo | 36 tablas | 22 tablas |
| Servicio | aisd-group.service.ts | aisi-group.service.ts |
| Tipo de grupo | Comunidades Campesinas | Distritos |

## Eliminar Estructura Inicial de Tablas

Si las tablas se llenaran con datos del backend, eliminar la estructura inicial:

### Paso 1: Quitar estructuraInicial de los configs

```typescript
// ANTES (con estructura inicial)
readonly miTablaConfig: TableConfig = {
  tablaKey: 'tablaAISD1',
  estructuraInicial: [
    { categoria: 'Fila 1', casos: 0 },
    { categoria: 'Fila 2', casos: 0 }
  ],
  ...
};

// DESPUES (sin estructura inicial)
readonly miTablaConfig: TableConfig = {
  tablaKey: 'tablaAISD1',
  noInicializarDesdeEstructura: true,
  ...
};
```

### Paso 2: Verificar que los servicios respeten el flag

Los siguientes servicios ya fueron modificados para respetar noInicializarDesdeEstructura:

- table-initialization.service.ts
  - Si noInicializarDesdeEstructura: true, no crea ninguna fila

- table-handler-factory.service.ts
  - Si noInicializarDesdeEstructura: true, crea array vacio []

### Resultado

| Situacion | Resultado |
|-----------|-----------|
| Hay datos del backend | Se muestran los datos |
| No hay datos | Tabla vacia [] |
| Usuario/edita | Puede agregar filas |

### Importante

Si las tablas NO usan noInicializarDesdeEstructura, mantendran su comportamiento original:
- Con estructuraInicial: Usan la estructura predefined
- Sin estructuraInicial: Crean 1 fila vacia [{}]

## Lecciones Aprendidas de la Seccion 14

### Problema 1: Doble Prefijo en el Guardado

**Sintoma:** Los cambios en el Form no se ven en el View.

**Causa:** El HTML pasaba el campo CON prefijo, y el TS también agregaba otro prefijo:

```typescript
// HTML: onFieldChange('parrafoSeccion14_indicadores_educacion_intro_A1', $event)
// TS: const campoConPrefijo = `${fieldId}${prefijo}`; // 'parrafoSeccion14_indicadores_educacion_intro_A1_A1'
```

**Solucion:** El HTML NO debe agregar prefijo. El `onFieldChange` lo hace automáticamente:

```html
<!-- ❌ INCORRECTO - Doble prefijo -->
<textarea (ngModelChange)="onFieldChange('campo' + obtenerPrefijoGrupo(), $event)">

<!-- ✅ CORRECTO - Solo el TS agrega prefijo -->
<textarea (ngModelChange)="onFieldChange('campo', $event)">
```

**Y en el TS:**

```typescript
override onFieldChange(fieldId: string, value: any, options?: { refresh?: boolean }): void {
  const prefijo = this.obtenerPrefijo();
  const campoConPrefijo = prefijo ? `${fieldId}${prefijo}` : fieldId;  // TS agrega prefijo
  super.onFieldChange(campoConPrefijo, value, options);
}
```

---

### Problema 2: Signals no detectan cambios (actualizacion en tiempo real)

**Sintoma:** Los cambios requieren recargar la página para verse.

**Causa:** Los signals de texto usaban `obtenerValorConPrefijo()` que lee de `this.datos`, pero no tenían dependencia explícita con `formDataSignal()`. Angular no detectaba los cambios.

**Solucion:** Los signals deben depender directamente de `formDataSignal()`:

```typescript
// ❌ INCORRECTO - No detecta cambios
readonly textoSignal: Signal<string> = computed(() => {
  return this.obtenerValorConPrefijo('campo') || 'valor por defecto';
});

// ✅ CORRECTO - Detecta cambios en tiempo real
readonly textoSignal: Signal<string> = computed(() => {
  const prefijo = this.obtenerPrefijo();
  const campo = 'campo' + prefijo;
  const data = this.formDataSignal();  // ✅ Dependencia explícita
  const valor = data[campo];
  return (valor && String(valor).trim().length > 0) ? String(valor) : 'valor por defecto';
});
```

---

### Verificacion de Funcionalidad

Para verificar que la seccion funciona correctamente:

1. **Cambios en tiempo real:** Editar un párrafo en el Form y ver que se actualice inmediatamente en el View.
2. **Prefijo correcto:** Verificar en la consola que los logs muestren el prefijo correcto (`_A1`, `_A2`, etc.).
3. **Consistencia Form/View:** Ambos componentes deben usar los mismos keys de campo.

---

## Recursos Adicionales

- Documentacion de Arquitectura
- Flujo de Datos
- Logica de Grupos AISD
- Implementacion de Grupos Dinamicos
- Guia de Migracion AISI (referencia)

---

Ultima actualizacion: 2026-02-11
Version: 1.0
