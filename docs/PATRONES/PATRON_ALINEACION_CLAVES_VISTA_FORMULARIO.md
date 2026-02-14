# Patrón: Alineación de Claves de Campo entre Vista y Formulario

## Problema

Cuando un componente de **formulario** y un componente de **vista** necesitan sincronizar datos de la misma sección, ambos deben usar **exactamente las mismas claves de campo** al escribir y leer del almacenamiento o del estado compartido.

**Si las claves no coinciden**, los cambios realizados en el formulario no se reflejan en la vista, aunque ambos componentes existan y funcionen correctamente de manera independiente.

### Ejemplo del Problema: Sección 7 - "Índice de Desempleo"

**Formulario** (seccion7-form.component.ts, línea 138):
```typescript
readonly textoIndiceDesempleo = this.createAutoSyncField(
  `textoIndiceDesempleo${PrefijoHelper.obtenerPrefijoGrupo(this.seccionId)}`, 
  ''
);
```
**Clave escrita**: `textoIndiceDesempleo_A1` (con prefijo)

**Vista** (seccion7-view.component.ts, línea 312 - INCORRECTO):
```typescript
obtenerTextoIndiceDesempleoConResaltado(): SafeHtml {
  const viewData = this.viewDataSignal();
  const prefijo = this.obtenerPrefijo();
  const manualKey = `parrafoSeccion7_indice_desempleo${prefijo}`; // ❌ CLAVE DIFERENTE
  let texto = viewData[manualKey];
  // ...
}
```
**Clave leída**: `parrafoSeccion7_indice_desempleo_A1` (¡DIFERENTE!)

**Resultado**: El texto editado en el formulario (clave `textoIndiceDesempleo_A1`) nunca aparece en la vista (que busca en `parrafoSeccion7_indice_desempleo_A1`).

---

## Solución

Ambos componentes deben usar **exactamente** la misma clave al guardar y recuperar datos:

**Vista Corregida** (seccion7-view.component.ts, línea 312):
```typescript
obtenerTextoIndiceDesempleoConResaltado(): SafeHtml {
  const viewData = this.viewDataSignal();
  const prefijo = this.obtenerPrefijo();
  const manualKey = `textoIndiceDesempleo${prefijo}`; // ✅ MISMA CLAVE QUE EN FORMULARIO
  let texto = viewData[manualKey];
  if (!texto) {
    texto = viewData['textoIndiceDesempleo']; // Fallback sin prefijo
  }
  // ...
}
```

Ahora ambos componentes escriben y leen de la misma clave: `textoIndiceDesempleo_A1`

---

## Aplicación a Diferentes Tipos de Datos

Este patrón aplica a **párrafos, tablas, fotos y cualquier dato persistente**:

### 1. **Párrafos y Textos**
- **Formulario** define: `readonly textoXXX = this.createAutoSyncField('textoXXX${prefijo}', '')`
- **Vista** debe leer: `viewData['textoXXX${prefijo}']` (misma clave)

**Ejemplos en Sección 7**:
- `textoIndiceDesempleo` (Índice de Desempleo)
- `textoAnalisisOcupacion` (Análisis de Ocupación)
- `textoDetalePEA` (Detalle PEA)

### 2. **Tablas**
- **Formulario** almacena: `petTabla${prefijo}`, `peaTabla${prefijo}`, `peaTablaOcupada${prefijo}`
- **Vista** debe leer: Mismas claves
- Ambos usan `Array.isArray(viewData[tablaKey]) ? viewData[tablaKey] : []`

**Ejemplo en Sección 7**:
```typescript
// Formulario (form.component.ts, línea 147-151)
readonly petTablaSignal: Signal<any[]> = computed(() => {
  const formData = this.formDataSignal();
  const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
  const petTablaKey = prefijo ? `petTabla${prefijo}` : 'petTabla';
  return Array.isArray(formData[petTablaKey]) ? formData[petTablaKey] : [];
});

// Vista (view.component.ts, línea 36-40) - DEBE USAR MISMA CLAVE
readonly petTablaSignal: Signal<any[]> = computed(() => {
  const viewData = this.viewDataSignal();
  const prefijo = this.obtenerPrefijo();
  const petTablaKey = prefijo ? `petTabla${prefijo}` : 'petTabla'; // ✅ MISMO PATRÓN
  return Array.isArray(viewData[petTablaKey]) ? viewData[petTablaKey] : [];
});
```

### 3. **Fotografías**
- **Formulario** almacena: `fotosSeccion${sectionId}${prefijo}` o similar
- **Vista** debe leer: Misma clave
- Ambos acceden mediante `this.fotografiasCache` o `projectFacade.selectSectionFields()`

**En Sección 7**:
```typescript
// Formulario (form.component.ts, línea 141)
fotografiasSeccion7: FotoItem[] = [];

// Vista (view.component.ts, línea 28)
fotografiasVista: FotoItem[] = [];

// Ambos cargan desde la misma fuente en cargarFotografias()
override cargarFotografias(): void {
  // ... lógica para obtener fotos
  this.fotografiasCache = fotos && fotos.length > 0 ? [...fotos] : [];
}
```

---

## Cómo Verificar y Prevenir el Error

### Checklist de Alineación:

1. **Identificar el campo** que necesita sincronización (ej: `textoIndiceDesempleo`)

2. **En el componente de formulario**:
   - Buscar la definición con `createAutoSyncField()` o persistencia
   - Anotar la clave exacta (ej: `textoIndiceDesempleo${prefijo}`)

3. **En el componente de vista**:
   - Buscar dónde se lee el mismo dato
   - Verificar que use **exactamente** la misma clave
   - Si construye la clave dinámicamente, asegurar que usa el mismo patrón de prefijo

4. **Validar rutas de acceso**:
   - Formulario → FormularioService → SessionDataService → Backend/LocalStorage
   - Vista → ProjectFacade → FormularioService → ViewDataSignal
   - Ambos deben recuperar desde la **misma clave**

### Grep para Detectar Desalineaciones:

```bash
# Buscar en Sección 7
grep -n "parrafoSeccion7_indice" src/app/shared/components/seccion7/*.ts
grep -n "textoIndiceDesempleo" src/app/shared/components/seccion7/*.ts

# Si los nombres base son diferentes → DESALINEADOS
# Si son iguales → ✅ correctamente alineados
```

---

## Patrón Correcto CON PREFIJO DINÁMICO (Sección 4 - MODELO A SEGUIR)

**Sección 4 implementa correctamente la alineación con prefijo dinámico.** Este es el patrón que **TODAS las secciones deberían seguir**:

### ✅ Títulos y Fuentes CON PREFIJO

**Formulario** (seccion4-form.component.html, línea 36):
```html
<input type="text" 
  class="form-control" 
  [ngModel]="viewModel().data['cuadroTituloAISD1' + obtenerPrefijoGrupo()]" 
  (ngModelChange)="actualizarCampoPrefijado('cuadroTituloAISD1', $event)" 
  [placeholder]="...">
```

**TypeScript** (seccion4-form.component.ts):
```typescript
private getPrefixedFieldKey(baseField: string): string {
  const prefijo = this.obtenerPrefijoGrupo();
  return `${baseField}${prefijo}`;
}

actualizarCampoPrefijado(baseField: string, value: any): void {
  // ✅ Guarda como: cuadroTituloAISD1_A1, cuadroTituloAISD1_A2, etc.
  this.onFieldChange(this.getPrefixedFieldKey(baseField), value, { refresh: false });
}
```

**Vista** (seccion4-view.component.ts, línea 109):
```typescript
cuadroTituloAISD1: data['cuadroTituloAISD1' + this.obtenerPrefijoGrupo()] ?? ''
// ✅ Lee desde: cuadroTituloAISD1_A1, cuadroTituloAISD1_A2, etc.
```

**Resultado**: ✅ Ambos usan exactamente la misma clave → **Persiste en F5**

---

### ✅ Fotografías CON PREFIJO

**Formulario** (seccion4-form.component.html, línea 98):
```html
<app-image-upload
  [fotografias]="getPhotoGroup(PHOTO_PREFIX_UBICACION)"
  [sectionId]="seccionId"
  [photoPrefix]="PHOTO_PREFIX_UBICACION + obtenerPrefijoGrupo()"
  [permitirMultiples]="true"
  (fotografiasChange)="onGrupoFotografiasChange(PHOTO_PREFIX_UBICACION, $event)">
</app-image-upload>
```

**Guarda como**:
- `fotografiaUbicacion_A1Titulo` (con prefijo dinámico)
- `fotografiaUbicacion_A1Fuente`
- `fotografiaUbicacion_A1Imagen`

**Vista** (seccion4-view.component.ts, línea 76-80):
```typescript
const prefijo = this.obtenerPrefijoGrupo();
for (let i = 1; i <= 10; i++) {
  const tituloKey = `${basePrefix}${i}Titulo${prefijo}`;
  const fuenteKey = `${basePrefix}${i}Fuente${prefijo}`;
  const imagenKey = `${basePrefix}${i}Imagen${prefijo}`;
  
  // ✅ Lee desde: fotografiaUbicacion_A1Titulo, fotografiaUbicacion_A1Fuente, etc.
}
```

**Resultado**: ✅ Ambos usan exactamente la misma clave → **Persiste en F5**

---

## 🎯 Regla de Oro para TODAS las Secciones

```
FORMULARIO ESCRIBE: baseField + prefijo dinámico
VISTA DEBE LEER: baseField + prefijo dinámico (IDÉNTICO)
```

### Estructura Recomendada:

```typescript
// ✅ FORMULARIO: Construir clave CON prefijo
private getPrefixedFieldKey(baseField: string): string {
  const prefijo = this.obtenerPrefijoGrupo();
  return `${baseField}${prefijo}`; // cuadroTitulo_A1, fotografiaUbicacion_A2Titulo, etc.
}

onFieldChange(baseField: string, value: any): void {
  const prefixedKey = this.getPrefixedFieldKey(baseField);
  this.projectFacade.setField(this.seccionId, null, prefixedKey, value);
}
```

```typescript
// ✅ VISTA: Leer CON prefijo
obtenerTitulo(): string {
  const formData = this.formDataSignal();
  const prefijo = this.obtenerPrefijoGrupo();
  
  const claveConPrefijo = `cuadroTitulo${prefijo}`; // cuadroTitulo_A1
  return formData[claveConPrefijo] ?? 'Título por defecto';
}
```

```html
<!-- ✅ HTML FORMULARIO: Mostrar y actualizar CON prefijo -->
<input 
  [ngModel]="formData['cuadroTitulo' + obtenerPrefijoGrupo()]"
  (ngModelChange)="onFieldChange('cuadroTitulo', $event)">
```

---

## Validación Completa del Patrón

| Sección | Elemento | Formulario Escribe | Vista Lee | F5 ✅ |
|---------|----------|---|---|---|---|
| 4 | cuadroTitulo | `cuadroTitulo_A1` | `cuadroTitulo_A1` | ✅ |
| 4 | cuadroFuente | `cuadroFuente_A1` | `cuadroFuente_A1` | ✅ |
| 4 | fotografiaUbicacion1Titulo | `fotografiaUbicacion_A11Titulo` | `fotografiaUbicacion_A11Titulo` | ✅ |
| 7 | textoIndiceDesempleo | `textoIndiceDesempleo_A1` | `textoIndiceDesempleo_A1` | ✅ |
| 8 | parrafoSeccion8_ganaderia_completo | `parrafoSeccion8_ganaderia_completo_A1` | `parrafoSeccion8_ganaderia_completo_A1` | ✅ |
| 8 | cuadroTituloPoblacionPecuaria | `cuadroTituloPoblacionPecuaria_A1` | `cuadroTituloPoblacionPecuaria_A1` | ✅ |
| 6 | ❌ INCORRECTO | `fotografiaOcupacion1Titulo` | `fotografiaOcupacion_A11Titulo` | ❌ |
| 8 | ❌ INCORRECTO | `fotografiaGanaderia_A11Titulo` | `fotografiaGanaderia1TituloSinPrefijo` | ❌ |

---

## Cambios Realizados (Ejemplos Validados)

### Sección 7 - "Índice de Desempleo"

**Archivo**: `seccion7-view.component.ts`  
**Línea**: 312  
**Cambio**:
```diff
- const manualKey = `parrafoSeccion7_indice_desempleo${prefijo}`;
+ const manualKey = `textoIndiceDesempleo${prefijo}`;
```
**Resultado**: ✅ El texto editado en el formulario ahora aparece inmediatamente en la vista.

---

### Sección 7 - Desempleo (CORRECTAMENTE ALINEADO)

**Archivo**: `seccion7-view.component.ts`  
**Línea**: 312  
**Patrón Aplicado**: Prefijo dinámico

```typescript
// ✅ Formulario (seccion7-form.component.ts)
readonly textoIndiceDesempleo = this.createAutoSyncField(
  `textoIndiceDesempleo${PrefijoHelper.obtenerPrefijoGrupo(this.seccionId)}`,
  ''
);
// Guarda como: textoIndiceDesempleo_A1

// ✅ Vista (seccion7-view.component.ts)
obtenerTextoIndiceDesempleoConResaltado(): SafeHtml {
  const viewData = this.viewDataSignal();
  const prefijo = this.obtenerPrefijo();
  const manualKey = `textoIndiceDesempleo${prefijo}`; // Lee como: textoIndiceDesempleo_A1
  let texto = viewData[manualKey];
  // ...
}
```

**Resultado**: ✅ Los párrafos persisten correctamente en F5.

---

### Sección 8 - Ganadería y Agricultura (CORRECTAMENTE ALINEADO)

**Archivo**: `seccion8-view.component.ts` y `seccion8-form.component.ts`  
**Patrón Aplicado**: Prefijo dinámico para párrafos

**Párrafos CON PREFIJO**:
```typescript
// ✅ Formulario
readonly parrafoGanaderia = this.createAutoSyncField(
  `parrafoSeccion8_ganaderia_completo${prefijo}`,
  ''
);
// Guarda como: parrafoSeccion8_ganaderia_completo_A1

// ✅ Vista
obtenerTextoSeccion8GanaderiaCompleto(): string {
  const formData = this.formDataSignal();
  const prefijo = this.obtenerPrefijoGrupo();
  const claveConPrefijo = `parrafoSeccion8_ganaderia_completo${prefijo}`;
  // Lee como: parrafoSeccion8_ganaderia_completo_A1
  if (formData[claveConPrefijo]) {
    return formData[claveConPrefijo];
  }
  return formData['parrafoSeccion8_ganaderia_completo'] ?? 'Texto por defecto';
}
```

**Títulos CON PREFIJO**:
```typescript
// ✅ Formulario (seccion8-form.component.ts, línea 525)
onFotografiasGanaderiaChange(event: any): void {
  super.onFotografiasGanaderiaChange(event);
  const prefijo = this.obtenerPrefijoGrupo();
  
  // Guarda títulos CON prefijo
  for (let i = 0; i < event.length; i++) {
    const tituloKey = `${PHOTO_PREFIX_GANADERIA}${i + 1}Titulo${prefijo}`;
    this.projectFacade.setField(this.seccionId, null, tituloKey, event[i].titulo || '');
  }
}
// Guarda como: fotografiaGanaderia1Titulo_A1

// ✅ Vista (seccion8-view.component.ts, línea 164)
cargarFotografias(): void {
  const prefijo = this.obtenerPrefijoGrupo();
  
  // Lee títulos CON prefijo
  for (let i = 1; i <= 10; i++) {
    const tituloKey = `${basePrefix}${i}Titulo${prefijo}`;
    // Lee como: fotografiaGanaderia1Titulo_A1
  }
}
```

**Resultado**: ✅ Párrafos y títulos persisten correctamente en F5.

---

### ⚠️ Secciones CON DESALINEACIÓN (Pendiente de Corrección)

#### Sección 6 - Fotografías (INCORRECTO)
```typescript
// ❌ Formulario: Guarda SIN prefijo
const tituloKey = `fotografiaOcupacion${i}Titulo`; // SIN prefijo
this.imageService.savePhoto(this.seccionId, tituloKey, titulo);

// ❌ Vista: Lee CON prefijo
const tituloKey = `fotografiaOcupacion_A1${i}Titulo`; // CON prefijo
```
**Problema**: Las claves NO coinciden → Los títulos no persisten en F5

**Acción**: Aplicar patrón de Sección 4 o 8 (agregar prefijo dinámico en ambos lados)

---

#### Sección 1 - Párrafos (PARCIALMENTE ALINEADO)
```typescript
// ✅ Formulario: Guarda CON blocker (flag especial)
readonly parrafoSeccion1TextoCompleto = this.createAutoSyncField(
  'parrafoSeccion1TextoCompleto_blocker',
  ''
);

// ⚠️ Vista: Lee SIN blocker
const parrafo = formData['parrafoSeccion1TextoCompleto'] ?? '';
```
**Problema**: El blocker es un patrón especial, no debería interferir con otros datos

**Acción**: Simplificar al patrón estándar sin flags especiales

---

## 📋 Checklist para Auditar Cada Sección

Para validar que una sección sigue el patrón correcto:

```bash
# 1. Buscar en el formulario qué clave guarda:
grep -n "createAutoSyncField\|setField\|setData" seccionX-form.component.ts

# 2. Buscar en la vista qué clave lee:
grep -n "data\['" seccionX-view.component.ts

# 3. Comparar: ¿Las claves son idénticas?
# ✅ IGUAL = Persiste en F5
# ❌ DIFERENTE = NO persiste en F5
```

---

## 🎯 Resumen Final

| Sección | Título + Fuente | Fotografías | Párrafos | Status |
|---------|----------|----------|---------|--------|
| 1 | ⚠️ Blocker special | - | ⚠️ Sin prefijo | ⚠️ Parcial |
| 2 | - | - | - | 🔍 Revisar |
| 3 | ✅ Correcto | ✅ Correcto | - | ✅ OK |
| 4 | ✅ Con prefijo | ✅ Con prefijo | - | ✅ GOLD STANDARD |
| 5 | - | - | - | 🔍 Revisar |
| 6 | - | ❌ Sin prefijo | - | ❌ Faltan prefijos |
| 7 | - | - | ✅ Con prefijo | ✅ OK |
| 8 | ✅ Con prefijo | ✅ Con prefijo | ✅ Con prefijo | ✅ OK |
| 9 | - | - | - | 🔍 Revisar (tablas) |
| 10 | - | - | - | 🔍 Revisar |

**Conclusión**: El patrón es sólido y aplicable a todas las secciones. El modelo de Sección 4 debe replicarse en todas partes.
