# 📄 Párrafos Dinámicos de las Secciones

Este documento explica cómo implementar correctamente párrafos dinámicos que se conectan con los datos de las tablas y otros campos de la sección, asegurando que los valores se muestren correctamente tanto en la vista previa como en el editor.

---

## 🎯 Problema a Resolver

Los párrafos descriptivos de las secciones necesitan:

1. **Conectarse con datos de tablas**: Mostrar totales, porcentajes, categorías calculadas de las tablas
2. **Usar nombres dinámicos**: Mostrar el nombre correcto de la Comunidad Campesina según el prefijo (A1, A2, B1, B2)
3. **Sincronización**: El texto en el editor debe ser idéntico al de la vista previa (con valores reemplazados)
4. **Resaltados visuales**: En la vista previa, indicar el origen de cada dato (backend, calculado, sección, manual)

---

## ✅ Solución: Patrón de Implementación

### Estructura de Métodos Necesarios

Para cada párrafo necesitas **3 métodos principales**:

1. **`obtenerTextoX()`**: Obtiene el texto plano con valores reemplazados (para editor y base de vista previa)
2. **`obtenerTextoXConResaltado()`**: Genera HTML con resaltados CSS (para vista previa)
3. **`getFieldIdTextoX()`**: Obtiene el campo con prefijo para guardar texto personalizado

---

## 📋 Paso 1: Obtener Datos de la Tabla

### Ejemplo: Total de Población por Sexo

```typescript
getTotalPoblacionSexo(): string {
  const tablaSexo = this.getTablaSexo();
  if (!tablaSexo || !Array.isArray(tablaSexo)) {
    return '0';
  }
  const datosSinTotal = this.getPoblacionSexoSinTotal();
  const total = datosSinTotal.reduce((sum: number, item: any) => {
    const casos = typeof item.casos === 'number' ? item.casos : parseInt(item.casos) || 0;
    return sum + casos;
  }, 0);
  return total.toString();
}
```

**Importante**: 
- Usa métodos que obtengan datos con prefijo (`getTablaSexo()` en lugar de `datos.poblacionSexoAISD`)
- Calcula el total sumando los casos de todas las filas (excluyendo la fila "Total")
- Retorna string para facilitar el reemplazo en el texto

### Ejemplo: Porcentajes de la Tabla

```typescript
getPorcentajeHombres(): string {
  const tablaSexo = this.getTablaSexo();
  if (!tablaSexo || !Array.isArray(tablaSexo) || tablaSexo.length === 0) {
    return '____';
  }
  const hombres = tablaSexo.find((item: any) => 
    item.sexo && (item.sexo.toLowerCase().includes('hombre') || item.sexo.toLowerCase().includes('varon'))
  );
  return hombres?.porcentaje || '____';
}
```

**Importante**:
- Busca en la tabla usando criterios flexibles (puede ser "Hombres", "Varones", etc.)
- Retorna el porcentaje tal como está en la tabla (formato: "50,00 %")
- Retorna `'____'` si no encuentra el dato

### Ejemplo: Categorías Calculadas (Grupo Etario Mayoritario)

```typescript
getGrupoEtarioMayoritario(): string {
  const tablaEtario = this.getTablaEtario();
  if (!tablaEtario || !Array.isArray(tablaEtario) || tablaEtario.length === 0) {
    return '15 a 29 años';
  }
  
  let mayorPorcentaje = 0;
  let grupoMayoritario = '15 a 29 años';
  
  tablaEtario.forEach((item: any) => {
    if (item.porcentaje) {
      const porcentajeNum = parseFloat(item.porcentaje.replace(',', '.').replace(' %', '').trim());
      if (!isNaN(porcentajeNum) && porcentajeNum > mayorPorcentaje) {
        mayorPorcentaje = porcentajeNum;
        grupoMayoritario = item.categoria || '15 a 29 años';
      }
    }
  });
  
  return grupoMayoritario;
}
```

**Importante**:
- Itera sobre la tabla para encontrar el valor máximo
- Convierte porcentajes de formato "50,00 %" a número para comparar
- Retorna la categoría completa (ej: "45 a 64 años")

---

## 📋 Paso 2: Obtener Nombre de Comunidad Campesina

### Método con Fallbacks

```typescript
obtenerNombreComunidadActual(): string {
  const prefijo = this.obtenerPrefijoGrupo();
  
  // 1. Intentar con PrefijoHelper (más confiable)
  const grupoAISD = PrefijoHelper.obtenerValorConPrefijo(this.datos, 'grupoAISD', this.seccionId);
  if (grupoAISD && grupoAISD.trim() !== '') {
    return grupoAISD;
  }
  
  // 2. Fallback: clave con sufijo directo
  const grupoConSufijo = prefijo ? this.datos[`grupoAISD${prefijo}`] : null;
  if (grupoConSufijo && grupoConSufijo.trim() !== '') {
    return grupoConSufijo;
  }
  
  // 3. Fallback: primera comunidad en array
  if (this.datos.comunidadesCampesinas && Array.isArray(this.datos.comunidadesCampesinas) && this.datos.comunidadesCampesinas.length > 0) {
    const primerCC = this.datos.comunidadesCampesinas[0];
    if (primerCC && primerCC.nombre && primerCC.nombre.trim() !== '') {
      return primerCC.nombre;
    }
  }
  
  // 4. Fallback: valor base sin prefijo
  if (this.datos.grupoAISD && this.datos.grupoAISD.trim() !== '') {
    return this.datos.grupoAISD;
  }
  
  return '____';
}
```

**Importante**:
- Usa múltiples fallbacks para asegurar que siempre haya un valor
- Prioriza valores con prefijo para multi-grupos (A1, A2, etc.)
- Retorna `'____'` solo si no hay ningún dato disponible

---

## 📋 Paso 3: Método para Obtener Texto Plano

### Estructura del Método

```typescript
obtenerTextoPoblacionSexoAISD(): string {
  // 1. Obtener texto personalizado (si existe)
  const fieldId = this.getFieldIdTextoPoblacionSexo();
  const textoConPrefijo = this.datos[fieldId];
  const textoSinPrefijo = this.datos.textoPoblacionSexoAISD;
  const textoPersonalizado = textoConPrefijo || textoSinPrefijo;
  
  // 2. Obtener valores dinámicos de la tabla y otros campos
  const grupoAISD = this.obtenerNombreComunidadActual();
  const totalPoblacion = this.getTotalPoblacionSexo();  // ← De la tabla
  const porcentajeHombres = this.getPorcentajeHombres();  // ← De la tabla
  const porcentajeMujeres = this.getPorcentajeMujeres();  // ← De la tabla
  
  // 3. Texto por defecto con valores reemplazados
  const textoPorDefecto = `Respecto a la población de la CC ${grupoAISD}, tomando en cuenta data obtenida de los Censos Nacionales 2017 y los puntos de población que la conforman, existen un total de ${totalPoblacion} habitantes que residen permanentemente en la comunidad. De este conjunto, el ${porcentajeHombres} son varones, por lo que se aprecia una leve mayoría de dicho grupo frente a sus pares femeninos (${porcentajeMujeres}).`;
  
  // 4. Si hay texto personalizado, reemplazar placeholders
  if (textoPersonalizado && textoPersonalizado !== '____' && textoPersonalizado.trim() !== '') {
    return textoPersonalizado
      .replace(/CC\s*___/g, `CC ${grupoAISD}`)
      .replace(/total de\s*___/g, `total de ${totalPoblacion}`)
      .replace(/existen un total de\s*___/g, `existen un total de ${totalPoblacion}`)
      .replace(/el\s*___\s*son varones/g, `el ${porcentajeHombres} son varones`)
      .replace(/\(\s*___\s*\)/g, `(${porcentajeMujeres})`)
      .replace(/femeninos\s*\(\s*___\s*\)/g, `femeninos (${porcentajeMujeres})`);
  }
  
  // 5. Retornar texto por defecto si no hay personalizado
  return textoPorDefecto;
}
```

### Patrones de Reemplazo

| Patrón Regex | Se Reemplaza Por | Ejemplo |
|--------------|------------------|---------|
| `/CC\s*___/g` | Nombre de CC | `CC CAHUACHO` |
| `/total de\s*___/g` | Total de tabla | `total de 610` |
| `/existen un total de\s*___/g` | Total de tabla | `existen un total de 610` |
| `/el\s*___\s*son varones/g` | Porcentaje hombres | `el 50,00 % son varones` |
| `/\(\s*___\s*\)/g` | Porcentaje genérico | `(50,00 %)` |

**Importante**:
- Usa patrones específicos para evitar reemplazos incorrectos
- El orden de los `.replace()` importa: más específicos primero
- Siempre retorna texto con valores reemplazados (nunca placeholders)

---

## 📋 Paso 4: Método para Obtener Texto con Resaltados

### Estructura del Método

```typescript
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

constructor(
  // ... otros servicios
  private sanitizer: DomSanitizer
) {
  // ...
}

obtenerTextoPoblacionSexoAISDConResaltado(): SafeHtml {
  // 1. Obtener texto plano (ya con valores reemplazados)
  const texto = this.obtenerTextoPoblacionSexoAISD();
  
  // 2. Obtener valores para aplicar resaltados
  const grupoAISD = this.obtenerNombreComunidadActual();
  const totalPoblacion = this.getTotalPoblacionSexo();
  const porcentajeHombres = this.getPorcentajeHombres();
  const porcentajeMujeres = this.getPorcentajeMujeres();
  
  // 3. Escapar HTML y aplicar resaltados
  let html = this.escapeHtml(texto);
  
  if (grupoAISD && grupoAISD !== '____') {
    html = html.replace(
      new RegExp(this.escapeRegex(grupoAISD), 'g'), 
      `<span class="data-section">${this.escapeHtml(grupoAISD)}</span>`
    );
  }
  
  if (totalPoblacion && totalPoblacion !== '____' && totalPoblacion !== '0') {
    html = html.replace(
      new RegExp(this.escapeRegex(totalPoblacion), 'g'), 
      `<span class="data-calculated">${this.escapeHtml(totalPoblacion)}</span>`
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
  
  // 4. Sanitizar y retornar
  return this.sanitizer.bypassSecurityTrustHtml(html);
}
```

### Métodos Auxiliares

```typescript
private escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

private escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
```

### Clases CSS para Resaltados

| Clase | Color | Uso |
|-------|-------|-----|
| `.data-section` | Cyan (#00bcd4) | Datos de otras secciones (nombres de comunidades) |
| `.data-backend` | Lila (#9c27b0) | Datos obtenidos del backend |
| `.data-calculated` | Verde (#4caf50) | Valores calculados en frontend (porcentajes, totales) |
| `.data-manual` | Amarillo (#ffff00) | Datos ingresados manualmente |

**Importante**:
- Siempre escapa HTML antes de aplicar resaltados
- Escapa caracteres especiales en regex para evitar errores
- Verifica que el valor no sea `'____'` o `'0'` antes de aplicar resaltado
- Usa `DomSanitizer.bypassSecurityTrustHtml()` para permitir HTML en Angular

---

## 📋 Paso 5: Método para Obtener FieldId con Prefijo

```typescript
getFieldIdTextoPoblacionSexo(): string {
  const prefijo = this.obtenerPrefijoGrupo();
  return prefijo ? `textoPoblacionSexoAISD${prefijo}` : 'textoPoblacionSexoAISD';
}
```

**Importante**:
- Usa el prefijo del grupo para guardar texto personalizado por comunidad
- Permite que cada grupo (A1, A2, etc.) tenga su propio texto personalizado

---

## 📋 Paso 6: Uso en el Template HTML

### Vista Previa (modoFormulario = false)

```html
<p class="text-justify" [innerHTML]="obtenerTextoPoblacionSexoAISDConResaltado()"></p>
```

**Importante**: Usa `[innerHTML]` para renderizar el HTML con resaltados

### Formulario (modoFormulario = true)

```html
<app-paragraph-editor
  [fieldId]="getFieldIdTextoPoblacionSexo()"
  label="Población según Sexo - Texto Completo"
  hint="Edite el texto completo. Use Enter para crear nuevos párrafos. Deje vacío para usar el texto por defecto."
  [rows]="4"
  [value]="obtenerTextoPoblacionSexoAISD()"
  (valueChange)="onFieldChange(getFieldIdTextoPoblacionSexo(), $event)">
</app-paragraph-editor>
```

**Importante**: 
- Usa `[value]` con el método que retorna texto plano (sin HTML)
- El usuario verá el mismo texto que en la vista previa, pero sin resaltados

---

## 🔑 Conceptos Clave

### 1. Conexión con Tablas

**✅ CORRECTO**: Usar métodos que calculan valores de la tabla
```typescript
const totalPoblacion = this.getTotalPoblacionSexo();  // Calcula de la tabla
const porcentajeHombres = this.getPorcentajeHombres();  // Busca en la tabla
```

**❌ INCORRECTO**: Usar valores de otras secciones o hardcodeados
```typescript
const totalPoblacion = this.datos.tablaAISD2TotalPoblacion;  // De otra sección
const porcentajeHombres = '50%';  // Hardcodeado
```

### 2. Obtención de Nombre de CC

**✅ CORRECTO**: Usar método con fallbacks
```typescript
const grupoAISD = this.obtenerNombreComunidadActual();
```

**❌ INCORRECTO**: Acceso directo sin prefijo
```typescript
const grupoAISD = this.datos.grupoAISD;  // No considera prefijo
```

### 3. Reemplazo de Placeholders

**✅ CORRECTO**: Patrones específicos y ordenados
```typescript
.replace(/existen un total de\s*___/g, `existen un total de ${totalPoblacion}`)
.replace(/total de\s*___/g, `total de ${totalPoblacion}`)
```

**❌ INCORRECTO**: Patrón genérico que puede reemplazar incorrectamente
```typescript
.replace(/___/g, totalPoblacion)  // Reemplaza TODOS los ___
```

---

## 📊 Ejemplo Completo: Sección 6

### Datos de la Tabla Usados en el Párrafo

| Dato | Método | Origen |
|------|--------|--------|
| Nombre CC | `obtenerNombreComunidadActual()` | Campo `grupoAISD` con prefijo |
| Total población | `getTotalPoblacionSexo()` | Suma de casos en tabla `poblacionSexoAISD` |
| % Hombres | `getPorcentajeHombres()` | Campo `porcentaje` de fila "Hombres" |
| % Mujeres | `getPorcentajeMujeres()` | Campo `porcentaje` de fila "Mujeres" |
| Grupo mayoritario | `getGrupoEtarioMayoritario()` | Categoría con mayor porcentaje |
| % Grupo mayoritario | `getPorcentajeGrupoEtario(grupo)` | Porcentaje de la categoría |

### Flujo de Datos

```
Tabla poblacionSexoAISD_A1
  ↓
getTablaSexo() → obtiene datos con prefijo
  ↓
getTotalPoblacionSexo() → suma casos
  ↓
obtenerTextoPoblacionSexoAISD() → reemplaza en texto
  ↓
obtenerTextoPoblacionSexoAISDConResaltado() → aplica resaltados
  ↓
[innerHTML] en vista previa
```

---

## ⚠️ Errores Comunes

| Error | Causa | Solución |
|-------|-------|----------|
| Total muestra "____" | Usa `tablaAISD2TotalPoblacion` de otra sección | Usar `getTotalPoblacionSexo()` que calcula de la tabla actual |
| Nombre CC muestra "____" | Acceso directo sin prefijo | Usar `obtenerNombreComunidadActual()` |
| Porcentajes no se reemplazan | Patrón regex incorrecto | Usar patrones específicos como `/el\s*___\s*son varones/g` |
| Resaltados no aparecen | HTML no sanitizado | Usar `DomSanitizer.bypassSecurityTrustHtml()` |
| Texto diferente en editor vs vista | No reemplaza placeholders en texto personalizado | Asegurar que `obtenerTextoX()` reemplace todos los `___` |
| Valores se duplican en resaltados | Regex reemplaza múltiples veces | Verificar que el valor no esté ya dentro de un `<span>` |

---

## 📝 Checklist para Nueva Sección

Al implementar párrafos dinámicos en una nueva sección:

- [ ] Crear métodos para obtener datos de la tabla: `getTotalX()`, `getPorcentajeX()`, etc.
- [ ] Implementar `obtenerNombreComunidadActual()` si se usa nombre de CC
- [ ] Crear `obtenerTextoX()` que:
  - [ ] Obtiene texto personalizado con prefijo
  - [ ] Obtiene valores dinámicos de la tabla
  - [ ] Reemplaza placeholders en texto personalizado
  - [ ] Retorna texto por defecto si no hay personalizado
- [ ] Crear `obtenerTextoXConResaltado()` que:
  - [ ] Llama a `obtenerTextoX()`
  - [ ] Escapa HTML
  - [ ] Aplica resaltados con clases CSS
  - [ ] Sanitiza y retorna `SafeHtml`
- [ ] Crear `getFieldIdTextoX()` para obtener campo con prefijo
- [ ] Agregar métodos auxiliares: `escapeHtml()`, `escapeRegex()`
- [ ] Inyectar `DomSanitizer` en el constructor
- [ ] En vista previa: usar `[innerHTML]="obtenerTextoXConResaltado()"`
- [ ] En formulario: usar `[value]="obtenerTextoX()"` en `app-paragraph-editor`
- [ ] Probar que valores de la tabla se muestran correctamente
- [ ] Probar que texto personalizado reemplaza placeholders
- [ ] Probar que resaltados aparecen en vista previa

---

## 📁 Archivos de Referencia

- **`seccion6.component.ts`**: Implementación completa de párrafos dinámicos
- **`seccion6.component.html`**: Uso de métodos en template
- **`shared.css`**: Clases CSS para resaltados (`.data-section`, `.data-calculated`, etc.)

---

*Última actualización: Enero 2026*
