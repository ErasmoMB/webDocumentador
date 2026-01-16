# 🔗 Conexión entre Sección y Formulario de Datos

Este documento explica cómo conectar correctamente una sección (plantilla) con su formulario de datos para que ambos muestren los mismos datos, especialmente cuando se usan **prefijos dinámicos** para multi-grupos (A1, A2, B1, B2).

---

## 📋 Problema Original

Las secciones AISD tienen múltiples grupos (Comunidades Campesinas A1, A2, etc.) y los datos se guardan con **prefijos**:
- `poblacionSexoAISD_A1` → Datos para CC grupo A1
- `poblacionSexoAISD_A2` → Datos para CC grupo A2

**El problema**: La plantilla mostraba datos correctos, pero el formulario mostraba tablas vacías porque:
1. El componente `app-dynamic-table` usaba `config.tablaKey` fijo (`poblacionSexoAISD`)
2. Los datos reales estaban en `poblacionSexoAISD_A1`

---

## ✅ Solución Implementada

### Paso 1: Crear métodos para obtener tablaKey con prefijo

En el componente de la sección (ej: `seccion6.component.ts`), agregar métodos que retornen el `tablaKey` con el prefijo correcto:

```typescript
getTablaKeyPoblacionSexo(): string {
  const prefijo = this.obtenerPrefijoGrupo();
  return prefijo ? `poblacionSexoAISD${prefijo}` : 'poblacionSexoAISD';
}

getTablaKeyPoblacionEtario(): string {
  const prefijo = this.obtenerPrefijoGrupo();
  return prefijo ? `poblacionEtarioAISD${prefijo}` : 'poblacionEtarioAISD';
}
```

### Paso 2: Usar el método dinámico en el HTML

En el template, pasar el `tablaKey` como método dinámico en lugar de string fijo:

```html
<!-- ❌ ANTES (incorrecto - tablaKey fijo) -->
<app-dynamic-table
  [datos]="datos"
  [config]="poblacionSexoConfig"
  [tablaKey]="'poblacionSexoAISD'"
  ...>
</app-dynamic-table>

<!-- ✅ DESPUÉS (correcto - tablaKey dinámico) -->
<app-dynamic-table
  [datos]="datos"
  [config]="poblacionSexoConfig"
  [tablaKey]="getTablaKeyPoblacionSexo()"
  ...>
</app-dynamic-table>
```

### Paso 3: Modificar `dynamic-table.component.ts`

El componente `dynamic-table` debe priorizar el `@Input() tablaKey` sobre `config.tablaKey`:

```typescript
// En getTableData()
getTableData(): any[] {
  const tablaKeyActual = this.tablaKey || this.config?.tablaKey;
  return this.datos[tablaKeyActual] || [];
}

// En initializeTable()
initializeTable(): void {
  if (!this.config) return;
  
  const tablaKeyActual = this.tablaKey || this.config.tablaKey;
  this.tableService.inicializarTabla(this.datos, { ...this.config, tablaKey: tablaKeyActual });
  this.formularioService.actualizarDato(tablaKeyActual as any, this.datos[tablaKeyActual]);
  // ...
}

// En onFieldChange(), onAdd(), onDelete() - usar tablaKeyActual
const tablaKeyActual = this.tablaKey || this.config.tablaKey;
```

---

## 🔑 Conceptos Clave

### PrefijoHelper

Utilidad centralizada para obtener valores con prefijo:

```typescript
import { PrefijoHelper } from 'src/app/shared/utils/prefijo-helper';

// Obtener prefijo según seccionId
const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
// '3.1.4.A.1.2' → '_A1'
// '3.1.4.A.2.2' → '_A2'

// Obtener valor con prefijo
const grupoAISD = PrefijoHelper.obtenerValorConPrefijo(this.datos, 'grupoAISD', this.seccionId);
// Busca primero 'grupoAISD_A1', luego 'grupoAISD'
```

### obtenerPrefijoGrupo()

Método en cada sección para obtener el prefijo:

```typescript
override obtenerPrefijoGrupo(): string {
  if (this.seccionId.startsWith('3.1.4.A.1.')) return '_A1';
  if (this.seccionId.startsWith('3.1.4.A.2.')) return '_A2';
  if (this.seccionId.startsWith('3.1.4.B.1.')) return '_B1';
  if (this.seccionId.startsWith('3.1.4.B.2.')) return '_B2';
  return '';
}
```

---

## 📊 Patrón para Tablas

### En el Componente TypeScript

```typescript
// 1. Config fija (sin prefijo) - solo para estructura inicial
tablaMiTablaConfig: TableConfig = {
  tablaKey: 'miTablaAISD',  // Sin prefijo
  totalKey: 'campo',
  campoTotal: 'valor',
  campoPorcentaje: 'porcentaje',
  estructuraInicial: [{ campo: '', valor: 0, porcentaje: '0%' }]
};

// 2. Método para obtener tablaKey CON prefijo
getTablaKeyMiTabla(): string {
  const prefijo = this.obtenerPrefijoGrupo();
  return prefijo ? `miTablaAISD${prefijo}` : 'miTablaAISD';
}

// 3. Método para obtener datos de la tabla (para plantilla)
getMiTabla(): any[] {
  const pref = PrefijoHelper.obtenerValorConPrefijo(this.datos, 'miTablaAISD', this.seccionId);
  return pref || this.datos.miTablaAISD || [];
}
```

### En el Template HTML

```html
<!-- PLANTILLA (modoFormulario = false) -->
<tr *ngFor="let item of getMiTabla()">
  <td>{{ item.campo }}</td>
  <td>{{ item.valor }}</td>
</tr>

<!-- FORMULARIO (modoFormulario = true) -->
<app-dynamic-table
  [datos]="datos"
  [config]="tablaMiTablaConfig"
  [tablaKey]="getTablaKeyMiTabla()"
  ...>
</app-dynamic-table>
```

---

## 🏷️ Patrón para Campos Simples (grupoAISD, textos, etc.)

### En el Componente TypeScript

```typescript
// Método con fallbacks para obtener nombre de CC
obtenerNombreComunidadActual(): string {
  const prefijo = this.obtenerPrefijoGrupo();
  
  // 1. Intentar con PrefijoHelper
  const grupoAISD = PrefijoHelper.obtenerValorConPrefijo(this.datos, 'grupoAISD', this.seccionId);
  if (grupoAISD && grupoAISD.trim() !== '') return grupoAISD;
  
  // 2. Fallback: clave con sufijo directo
  const grupoConSufijo = prefijo ? this.datos[`grupoAISD${prefijo}`] : null;
  if (grupoConSufijo && grupoConSufijo.trim() !== '') return grupoConSufijo;
  
  // 3. Fallback: comunidadesCampesinas[0]
  if (this.datos.comunidadesCampesinas?.[0]?.nombre) {
    return this.datos.comunidadesCampesinas[0].nombre;
  }
  
  // 4. Fallback: valor base sin prefijo
  if (this.datos.grupoAISD && this.datos.grupoAISD.trim() !== '') {
    return this.datos.grupoAISD;
  }
  
  return '____';
}
```

### En el Template HTML

```html
<!-- ❌ ANTES (directo sin prefijo) -->
<span>{{ datos.grupoAISD || '____' }}</span>

<!-- ✅ DESPUÉS (método con fallbacks) -->
<span>{{ obtenerNombreComunidadActual() }}</span>
```

---

## 📄 Patrón para Párrafos de Texto

Los párrafos pueden tener texto personalizado del usuario o texto por defecto generado automáticamente. Ambos deben mostrar los mismos valores dinámicos (nombres de comunidades, porcentajes, etc.) y estar sincronizados entre la vista previa y el editor.

### Problema

1. **Vista previa**: Muestra texto con resaltados (colores) para indicar origen de datos
2. **Editor**: Muestra texto plano editable (sin resaltados)
3. **Sincronización**: Ambos deben mostrar el mismo contenido con valores reemplazados
4. **Placeholders**: El texto personalizado puede tener placeholders (`___`, `CC___`) que deben reemplazarse

### Solución: Dos Métodos por Párrafo

Para cada párrafo necesitas **dos métodos**:

1. **`obtenerTextoX()`**: Retorna el texto plano (para el editor y como base para la vista previa)
2. **`obtenerTextoXConResaltado()`**: Retorna HTML con resaltados (para la vista previa)

### En el Componente TypeScript

```typescript
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

constructor(
  // ... otros servicios
  private sanitizer: DomSanitizer
) {
  // ...
}

// Método 1: Obtener texto plano (con valores reemplazados)
obtenerTextoPoblacionSexoAISD(): string {
  const fieldId = this.getFieldIdTextoPoblacionSexo();
  const textoConPrefijo = this.datos[fieldId];
  const textoSinPrefijo = this.datos.textoPoblacionSexoAISD;
  const textoPersonalizado = textoConPrefijo || textoSinPrefijo;
  
  // Valores dinámicos a reemplazar
  const grupoAISD = PrefijoHelper.obtenerValorConPrefijo(this.datos, 'grupoAISD', this.seccionId) 
    || this.obtenerNombreComunidadActual() || '____';
  const totalPoblacion = PrefijoHelper.obtenerValorConPrefijo(this.datos, 'tablaAISD2TotalPoblacion', this.seccionId) 
    || this.datos.tablaAISD2TotalPoblacion || '____';
  const porcentajeHombres = this.getPorcentajeHombres();
  const porcentajeMujeres = this.getPorcentajeMujeres();
  
  // Texto por defecto (si no hay personalizado)
  const textoPorDefecto = `Respecto a la población de la CC ${grupoAISD}, tomando en cuenta data obtenida de los Censos Nacionales 2017 y los puntos de población que la conforman, existen un total de ${totalPoblacion} habitantes que residen permanentemente en la comunidad. De este conjunto, el ${porcentajeHombres} son varones, por lo que se aprecia una leve mayoría de dicho grupo frente a sus pares femeninos (${porcentajeMujeres}).`;
  
  // Si hay texto personalizado, reemplazar placeholders
  if (textoPersonalizado && textoPersonalizado !== '____' && textoPersonalizado.trim() !== '') {
    return textoPersonalizado
      .replace(/CC\s*___/g, `CC ${grupoAISD}`)
      .replace(/total de\s*___/g, `total de ${totalPoblacion}`)
      .replace(/el\s*___\s*son varones/g, `el ${porcentajeHombres} son varones`)
      .replace(/\(\s*___\s*\)/g, `(${porcentajeMujeres})`)
      .replace(/femeninos\s*\(\s*___\s*\)/g, `femeninos (${porcentajeMujeres})`);
  }
  
  return textoPorDefecto;
}

// Método 2: Obtener texto con resaltados HTML (para vista previa)
obtenerTextoPoblacionSexoAISDConResaltado(): SafeHtml {
  const texto = this.obtenerTextoPoblacionSexoAISD();
  const grupoAISD = PrefijoHelper.obtenerValorConPrefijo(this.datos, 'grupoAISD', this.seccionId) 
    || this.obtenerNombreComunidadActual() || '____';
  const totalPoblacion = PrefijoHelper.obtenerValorConPrefijo(this.datos, 'tablaAISD2TotalPoblacion', this.seccionId) 
    || this.datos.tablaAISD2TotalPoblacion || '____';
  const porcentajeHombres = this.getPorcentajeHombres();
  const porcentajeMujeres = this.getPorcentajeMujeres();
  
  // Escapar HTML y aplicar resaltados con clases CSS
  let html = this.escapeHtml(texto);
  if (grupoAISD !== '____') {
    html = html.replace(
      new RegExp(this.escapeRegex(grupoAISD), 'g'), 
      `<span class="data-section">${this.escapeHtml(grupoAISD)}</span>`
    );
  }
  if (totalPoblacion !== '____') {
    html = html.replace(
      new RegExp(this.escapeRegex(totalPoblacion.toString()), 'g'), 
      `<span class="data-calculated">${this.escapeHtml(totalPoblacion.toString())}</span>`
    );
  }
  if (porcentajeHombres && porcentajeHombres !== '____') {
    html = html.replace(
      new RegExp(this.escapeRegex(porcentajeHombres), 'g'), 
      `<span class="data-calculated">${this.escapeHtml(porcentajeHombres)}</span>`
    );
  }
  if (porcentajeMujeres && porcentajeMujeres !== '____') {
    html = html.replace(
      new RegExp(this.escapeRegex(porcentajeMujeres), 'g'), 
      `<span class="data-calculated">${this.escapeHtml(porcentajeMujeres)}</span>`
    );
  }
  
  return this.sanitizer.bypassSecurityTrustHtml(html);
}

// Métodos auxiliares
getFieldIdTextoPoblacionSexo(): string {
  const prefijo = this.obtenerPrefijoGrupo();
  return prefijo ? `textoPoblacionSexoAISD${prefijo}` : 'textoPoblacionSexoAISD';
}

private escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

private escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
```

### En el Template HTML

```html
<!-- VISTA PREVIA (modoFormulario = false) -->
<p class="text-justify" [innerHTML]="obtenerTextoPoblacionSexoAISDConResaltado()"></p>

<!-- FORMULARIO (modoFormulario = true) -->
<app-paragraph-editor
  [fieldId]="getFieldIdTextoPoblacionSexo()"
  label="Población según Sexo - Texto Completo"
  hint="Edite el texto completo. Use Enter para crear nuevos párrafos. Deje vacío para usar el texto por defecto."
  [rows]="4"
  [value]="obtenerTextoPoblacionSexoAISD()"
  (valueChange)="onFieldChange(getFieldIdTextoPoblacionSexo(), $event)">
</app-paragraph-editor>
```

### Clases CSS para Resaltados

Las clases CSS aplicadas en los resaltados:

| Clase | Color | Uso |
|-------|-------|-----|
| `.data-section` | Cyan (#00bcd4) | Datos de otras secciones (nombres de comunidades) |
| `.data-backend` | Lila (#9c27b0) | Datos obtenidos del backend |
| `.data-calculated` | Verde (#4caf50) | Valores calculados en frontend (porcentajes) |
| `.data-manual` | Amarillo (#ffff00) | Datos ingresados manualmente |

### Ejemplo Completo: Párrafo con Múltiples Valores

```typescript
obtenerTextoPoblacionEtarioAISD(): string {
  const fieldId = this.getFieldIdTextoPoblacionEtario();
  const textoPersonalizado = this.datos[fieldId] || this.datos.textoPoblacionEtarioAISD;
  
  const grupoAISD = PrefijoHelper.obtenerValorConPrefijo(this.datos, 'grupoAISD', this.seccionId) 
    || this.obtenerNombreComunidadActual() || '____';
  const grupoMayoritario = this.getGrupoEtarioMayoritario();
  const porcentajeMayoritario = this.getPorcentajeGrupoEtario(grupoMayoritario);
  const grupoSegundo = this.getGrupoEtarioSegundo();
  const porcentajeSegundo = this.getPorcentajeGrupoEtario(grupoSegundo);
  const grupoMenoritario = this.getGrupoEtarioMenoritario();
  const porcentajeMenoritario = this.getPorcentajeGrupoEtario(grupoMenoritario);
  
  const textoPorDefecto = `En una clasificación en grandes grupos de edad, se puede observar que el grupo etario mayoritario en la CC ${grupoAISD} es el de ${grupoMayoritario}, puesto que representa el ${porcentajeMayoritario} de la población total. En segundo lugar, bastante cerca del primero, se halla el bloque etario de ${grupoSegundo} (${porcentajeSegundo}). Por otro lado, el conjunto minoritario está conformado por la población de ${grupoMenoritario}, pues solo representa un ${porcentajeMenoritario}.`;
  
  if (textoPersonalizado && textoPersonalizado !== '____' && textoPersonalizado.trim() !== '') {
    return textoPersonalizado
      .replace(/CC\s*___/g, `CC ${grupoAISD}`)
      .replace(/es el de\s*___/g, `es el de ${grupoMayoritario}`)
      .replace(/representa el\s*___/g, `representa el ${porcentajeMayoritario}`)
      .replace(/bloque etario de\s*___/g, `bloque etario de ${grupoSegundo}`)
      .replace(/\(\s*___\s*\)/g, `(${porcentajeSegundo})`)
      .replace(/población de\s*___/g, `población de ${grupoMenoritario}`)
      .replace(/representa un\s*___/g, `representa un ${porcentajeMenoritario}`);
  }
  
  return textoPorDefecto;
}
```

### Placeholders Comunes

Cuando el usuario escribe texto personalizado, puede usar estos placeholders que se reemplazarán automáticamente:

| Placeholder | Se Reemplaza Por |
|-------------|------------------|
| `CC___` | Nombre de la Comunidad Campesina |
| `___` (en contexto de total) | Total de población |
| `___` (en contexto de porcentaje) | Porcentaje correspondiente |
| `___` (en contexto de grupo etario) | Grupo etario correspondiente |

**Nota**: El reemplazo de `___` genérico es contextual y depende del texto alrededor. Para mayor precisión, usa patrones más específicos como `total de ___` o `el ___ son varones`.

---

## 📸 Patrón para Fotografías

Las fotografías deben mostrarse inmediatamente tanto en el formulario como en la vista previa cuando se suben, sin necesidad de actualizar la sección.

### Problema

Cuando se sube una fotografía en el formulario:
1. Se guarda correctamente en el servicio
2. Se actualiza el formulario (`fotografiasFormMulti`)
3. **Pero la vista previa no se actualiza** hasta que se recarga la sección

**Causa**: La vista previa lee de `this.datos` o de un cache que no se actualiza cuando se sube una nueva imagen.

### Solución: Actualizar Cache y Forzar Detección de Cambios

Para cada grupo de fotografías necesitas:

1. **Cache de fotografías**: Variable `fotografiasCache` para la vista previa
2. **Método para cargar**: `cargarFotografias()` que carga del servicio
3. **Método para vista**: `getFotografiasX()` que prioriza el cache
4. **Handler de cambios**: `onFotografiasChange()` que actualiza todo

### En el Componente TypeScript

```typescript
export class Seccion6Component extends BaseSectionComponent {
  override readonly PHOTO_PREFIX = 'fotografiaDemografia';
  
  fotografiasCache: FotoItem[] = [];
  fotografiasFormMulti: FotoItem[] = [];

  protected override onInitCustom(): void {
    this.verificarCargaDatos();
    if (!this.modoFormulario) {
      // Suscribirse a cambios en datos para recargar fotografías
      this.stateSubscription = this.stateService.datos$.subscribe(() => {
        this.cargarFotografias();
        this.cdRef.detectChanges();
      });
    }
  }

  // Método para cargar fotografías del servicio
  cargarFotografias(): void {
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    const fotos = this.imageService.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX,
      groupPrefix
    );
    this.fotografiasCache = [...fotos];
    this.cdRef.markForCheck();
  }

  // Método para obtener fotografías en vista previa (prioriza cache)
  getFotografiasDemografiaVista(): any[] {
    // 1. Si hay cache, usarlo (más rápido y actualizado)
    if (this.fotografiasCache && this.fotografiasCache.length > 0) {
      return this.fotografiasCache.map(foto => ({
        imagen: foto.imagen || '',
        titulo: foto.titulo || 'Demografía',
        fuente: foto.fuente || 'GEADES, 2024'
      }));
    }
    
    // 2. Fallback: leer de this.datos con prefijo
    const prefijo = this.obtenerPrefijoGrupo();
    const fotografias: any[] = [];
    for (let i = 1; i <= 10; i++) {
      const imagenConPrefijo = prefijo ? this.datos[`fotografiaDemografia${i}Imagen${prefijo}`] : null;
      const imagenSinPrefijo = this.datos[`fotografiaDemografia${i}Imagen`];
      const imagen = imagenConPrefijo || imagenSinPrefijo;
      if (imagen && imagen.trim() !== '') {
        const tituloConPrefijo = prefijo ? this.datos[`fotografiaDemografia${i}Titulo${prefijo}`] : null;
        const tituloSinPrefijo = this.datos[`fotografiaDemografia${i}Titulo`];
        const titulo = tituloConPrefijo || tituloSinPrefijo || 'Demografía';
        const fuenteConPrefijo = prefijo ? this.datos[`fotografiaDemografia${i}Fuente${prefijo}`] : null;
        const fuenteSinPrefijo = this.datos[`fotografiaDemografia${i}Fuente`];
        const fuente = fuenteConPrefijo || fuenteSinPrefijo || 'GEADES, 2024';
        fotografias.push({ imagen, titulo, fuente });
      }
    }
    return fotografias;
  }

  // Método para actualizar fotografías del formulario
  protected override actualizarFotografiasFormMulti(): void {
    const groupPrefix = this.obtenerPrefijoGrupo();
    this.fotografiasFormMulti = this.imageService.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX,
      groupPrefix
    );
  }

  // Handler cuando se sube/elimina una fotografía
  onFotografiasChange(fotografias: FotoItem[]) {
    // 1. Guardar en el servicio (actualiza this.datos)
    this.onGrupoFotografiasChange(this.PHOTO_PREFIX, fotografias);
    
    // 2. Actualizar formulario
    this.fotografiasFormMulti = [...fotografias];
    
    // 3. ⚠️ IMPORTANTE: Actualizar cache para vista previa
    this.fotografiasCache = [...fotografias];
    
    // 4. Forzar detección de cambios
    this.cdRef.detectChanges();
  }
}
```

### En el Template HTML

```html
<!-- VISTA PREVIA (modoFormulario = false) -->
<app-image-upload
  [modoVista]="true"
  [permitirMultiples]="true"
  [fotografias]="getFotografiasDemografiaVista()"
  [sectionId]="seccionId"
  [photoPrefix]="PHOTO_PREFIX"
  [labelTitulo]="'Título'"
  [labelFuente]="'Fuente'"
  [labelImagen]="'Imagen'">
</app-image-upload>

<!-- FORMULARIO (modoFormulario = true) -->
<app-image-upload
  [fotografias]="fotografiasFormMulti"
  [sectionId]="seccionId"
  [photoPrefix]="PHOTO_PREFIX"
  [permitirMultiples]="true"
  labelTitulo="Título de la fotografía"
  labelFuente="Fuente de la fotografía"
  labelImagen="Fotografía - Imagen"
  [requerido]="false"
  (fotografiasChange)="onFotografiasChange($event)">
</app-image-upload>
```

### Flujo de Actualización

```
Usuario sube imagen
  ↓
onFotografiasChange(fotografias)
  ↓
onGrupoFotografiasChange() → guarda en servicio → actualiza this.datos
  ↓
fotografiasFormMulti = [...fotografias] → actualiza formulario
  ↓
fotografiasCache = [...fotografias] → actualiza vista previa
  ↓
cdRef.detectChanges() → fuerza renderizado
  ↓
Vista previa muestra imagen inmediatamente ✅
```

### Puntos Clave

1. **Cache como fuente principal**: `getFotografiasX()` prioriza `fotografiasCache` sobre `this.datos`
2. **Actualizar cache en cambios**: `onFotografiasChange()` debe actualizar `fotografiasCache`
3. **Detección de cambios**: Usar `cdRef.detectChanges()` después de actualizar
4. **Suscripción a cambios**: En `onInitCustom()`, suscribirse a `stateService.datos$` para recargar cuando cambien datos externos

### Manejo de Prefijos

Si la sección usa prefijos (A1, A2, etc.), el método `getFotografiasX()` debe:

1. **Primero**: Intentar leer del cache (ya tiene prefijo aplicado)
2. **Segundo**: Leer de `this.datos` con prefijo: `fotografiaDemografia${i}Imagen${prefijo}`
3. **Tercero**: Leer de `this.datos` sin prefijo: `fotografiaDemografia${i}Imagen`

---

## 📝 Checklist para Nueva Sección

Al crear/modificar una sección AISD:

- [ ] Importar `PrefijoHelper` en el componente
- [ ] Importar `DomSanitizer` y `SafeHtml` si hay párrafos con resaltados
- [ ] Implementar `obtenerPrefijoGrupo()` si no existe
- [ ] Crear métodos `getTablaKey[NombreTabla]()` para cada tabla
- [ ] Crear métodos `get[NombreTabla]()` para obtener datos con prefijo
- [ ] Usar métodos dinámicos en el HTML del formulario: `[tablaKey]="getTablaKeyX()"`
- [ ] Usar métodos en la plantilla: `*ngFor="let item of getTablaX()"`
- [ ] Implementar `obtenerNombreComunidadActual()` si usa grupoAISD
- [ ] Para cada párrafo: crear `obtenerTextoX()` y `obtenerTextoXConResaltado()`
- [ ] Para cada párrafo: crear `getFieldIdTextoX()` para obtener el campo con prefijo
- [ ] En vista previa: usar `[innerHTML]="obtenerTextoXConResaltado()"`
- [ ] En formulario: usar `[value]="obtenerTextoX()"` en `app-paragraph-editor`
- [ ] Para fotografías: crear `fotografiasCache` y `fotografiasFormMulti`
- [ ] Para fotografías: crear `getFotografiasX()` que prioriza cache
- [ ] Para fotografías: crear `cargarFotografias()` que carga del servicio
- [ ] Para fotografías: en `onFotografiasChange()` actualizar cache y forzar detección
- [ ] En `onInitCustom()`: suscribirse a `stateService.datos$` para recargar fotos
- [ ] Actualizar `actualizarValoresConPrefijo()` para sincronizar datos

---

## 🎨 Resaltado de Datos (appDataSource)

Para indicar visualmente el origen de los datos:

```html
<span [appDataSource]="'section'">{{ obtenerNombreComunidadActual() }}</span>  <!-- Cyan -->
<span [appDataSource]="'backend'">{{ item.casos }}</span>                       <!-- Lila -->
<span [appDataSource]="'calculated'">{{ item.porcentaje }}</span>               <!-- Verde -->
<span [appDataSource]="'manual'">{{ textoPersonalizado }}</span>                <!-- Amarillo -->
```

---

## 📁 Archivos Modificados (Sección 6 como referencia)

1. **`seccion6.component.ts`**
   - Agregado: `getTablaKeyPoblacionSexo()`, `getTablaKeyPoblacionEtario()`
   - Agregado: `obtenerNombreComunidadActual()`
   - Agregado: `obtenerTextoPoblacionSexoAISD()`, `obtenerTextoPoblacionEtarioAISD()`
   - Agregado: `obtenerTextoPoblacionSexoAISDConResaltado()`, `obtenerTextoPoblacionEtarioAISDConResaltado()`
   - Agregado: `getFieldIdTextoPoblacionSexo()`, `getFieldIdTextoPoblacionEtario()`
   - Agregado: Métodos auxiliares `escapeHtml()`, `escapeRegex()`
   - Agregado: `getFotografiasDemografiaVista()` que prioriza cache
   - Agregado: `cargarFotografias()` para cargar del servicio
   - Corregido: `onFotografiasChange()` actualiza `fotografiasCache` y fuerza detección
   - Inyectado: `DomSanitizer` en el constructor
   - Corregido: `getTotalPoblacionSexo()`, `getTotalPoblacionEtario()` usan métodos con prefijo

2. **`seccion6.component.html`**
   - Cambiado: `[tablaKey]="getTablaKeyPoblacionSexo()"` (dinámico)
   - Cambiado: `{{ obtenerNombreComunidadActual() }}` en lugar de `{{ datos.grupoAISD }}`
   - Cambiado: Vista previa de párrafos usa `[innerHTML]="obtenerTextoXConResaltado()"`
   - Cambiado: Editor de párrafos usa `[value]="obtenerTextoX()"`
   - Cambiado: Vista previa de fotografías usa `[fotografias]="getFotografiasDemografiaVista()"`
   - Cambiado: Formulario de fotografías usa `[fotografias]="fotografiasFormMulti"` y `(fotografiasChange)="onFotografiasChange($event)"`

3. **`dynamic-table.component.ts`**
   - Modificado: `getTableData()` prioriza `this.tablaKey` sobre `config.tablaKey`
   - Modificado: `initializeTable()`, `onFieldChange()`, `onAdd()`, `onDelete()` usan `tablaKeyActual`

---

## ⚠️ Errores Comunes

| Error | Causa | Solución |
|-------|-------|----------|
| Formulario vacío | `tablaKey` fijo sin prefijo | Usar método `getTablaKey[X]()` |
| Plantilla vacía | Acceso directo `datos.tabla` | Usar método `getTabla()` con PrefijoHelper |
| "CC ____" en lugar de nombre | `datos.grupoAISD` sin prefijo | Usar `obtenerNombreComunidadActual()` |
| Totales en 0 | Método usa array sin prefijo | Llamar a `getTablaSexo()` en lugar de `datos.poblacionSexoAISD` |
| Párrafo diferente en editor vs vista | Texto sin reemplazar placeholders | Usar `obtenerTextoX()` que reemplaza `___` |
| Párrafos sin resaltados en vista | HTML sin clases CSS | Usar `obtenerTextoXConResaltado()` con `[innerHTML]` |
| "Sanitizing HTML stripped content" | HTML no sanitizado | Usar `DomSanitizer.bypassSecurityTrustHtml()` |
| Placeholders no se reemplazan | Regex incorrecto o contexto | Revisar patrones de reemplazo en `obtenerTextoX()` |
| Fotografías no aparecen en vista previa | Cache no actualizado | Actualizar `fotografiasCache` en `onFotografiasChange()` |
| Fotografías aparecen después de recargar | No se fuerza detección | Agregar `cdRef.detectChanges()` después de actualizar cache |
| Vista previa muestra fotos antiguas | `getFotografiasX()` no prioriza cache | Hacer que el método primero lea de `fotografiasCache` |

---

*Última actualización: Enero 2026*
