# Patrón: Nombres de Comunidad Dinámicos con aisdGroups() Signal

## 🎯 Objetivo
Mostrar automáticamente el nombre correcto de la comunidad (ej: "CC GRUPOAISD") en lugar de placeholders ("CC ____") en vistas y formularios, de forma **reactiva** y **sin duplicación de lógica**.

---

## 📋 Problema Original

Antes, las secciones mostraban:
```
En la CC ____, según datos del censo...
Instituciones existentes – CC ____
```

**Por qué ocurría:**
- No se reemplazaba `{COMUNIDAD}` con el nombre real
- El nombre no se obtenía desde el grupo AISD correspondiente
- Cada sección implementaba lógica diferente (inconsistencia)

---

## ✅ Solución: aisdGroups() Signal

### 1. Entender la Estructura

Cuando tienes múltiples grupos AISD (_A1, _A2, etc.):
- **seccionId**: `3.1.4.A.1_A1` (Sección 5 del grupo AISD #1)
- **Prefijo**: `_A1` (extraído del seccionId)
- **Índice**: `0` (A1 → índice 0, A2 → índice 1)
- **Nombre**: `"GRUPOAISD"` (obtenido desde `aisdGroups()[0].nombre`)

### 2. Implementación en obtenerNombreComunidadActual()

**En `BaseSectionComponent`** (herencia para todas las secciones):

```typescript
obtenerNombreComunidadActual(): string {
  const prefijo = this.obtenerPrefijoGrupo();
  
  // ✅ PASO 1: Usar aisdGroups() signal para obtener el nombre del grupo actual
  if (prefijo && prefijo.startsWith('_A')) {
    const match = prefijo.match(/_A(\d+)/);
    if (match) {
      const index = parseInt(match[1]) - 1; // _A1 → índice 0, _A2 → índice 1
      const grupos = this.aisdGroups();
      if (grupos && grupos[index]?.nombre) {
        return grupos[index].nombre; // ✅ RETORNA EL NOMBRE CORRECTO
      }
    }
  }
  
  // ✅ PASO 2: Fallback a datos guardados
  const grupoAISD = PrefijoHelper.obtenerValorConPrefijo(this.datos, 'grupoAISD', this.seccionId);
  if (grupoAISD && grupoAISD.trim() !== '') {
    return grupoAISD;
  }
  
  const grupoConSufijo = prefijo ? this.datos[`grupoAISD${prefijo}`] : null;
  if (grupoConSufijo && grupoConSufijo.trim() !== '') {
    return grupoConSufijo;
  }
  
  // ✅ PASO 3: Fallback a comunidades campesinas
  if (this.datos.comunidadesCampesinas && Array.isArray(this.datos.comunidadesCampesinas) && this.datos.comunidadesCampesinas.length > 0) {
    const primerCC = this.datos.comunidadesCampesinas[0];
    if (primerCC && primerCC.nombre && primerCC.nombre.trim() !== '') {
      return primerCC.nombre;
    }
  }
  
  return '____'; // Placeholder como último recurso
}
```

---

## 🔄 Flujo de Reemplazo

### En Constantes (templates.ts)

```typescript
export const SECCION5_TEMPLATES = {
  textoInstitucionalidadLargo: `La CC {COMUNIDAD} posee una estructura organizativa...
  Entre las principales instituciones se encuentran...`,
  
  labelInstituciones: 'Instituciones existentes – CC {COMUNIDAD}'
};

export const SECCION6_TEMPLATES = {
  textoPoblacionSexoDefault: `En la CC {COMUNIDAD}, según datos del censo...`,
  textoPoblacionEtarioDefault: `La estructura etaria de la CC {COMUNIDAD} presenta...`,
  
  tituloTablaSexoDefault: 'Población por sexo – CC {COMUNIDAD} (2017)',
  tituloTablaEtarioDefault: 'Población por grupo etario – CC {COMUNIDAD} (2017)'
};
```

### En Componentes (form y view)

```typescript
obtenerTextoInstitucionalidad(datos: any, nombreComunidad: string): string {
  const textoPersonalizado = PrefijoHelper.obtenerValorConPrefijo(datos, 'parrafoSeccion5_institucionalidad', this.seccionId);
  
  // Si existe texto personalizado, reemplazar {COMUNIDAD} con el nombre real
  if (textoPersonalizado && textoPersonalizado.trim() !== '') {
    return textoPersonalizado.replace(/{COMUNIDAD}/g, nombreComunidad);
  }
  
  // Si no, usar template por defecto y reemplazar
  const textoPorDefecto = SECCION5_TEMPLATES.textoInstitucionalidadLargo
    .replace(/{COMUNIDAD}/g, nombreComunidad);
  
  return textoPorDefecto;
}
```

### En Templates HTML

```html
<!-- OPCIÓN 1: Replacer dinámico en template -->
<h5>{{ SECCION5_TEMPLATES.labelInstituciones.replace('{COMUNIDAD}', obtenerNombreComunidadActual()) }}</h5>

<!-- OPCIÓN 2: Signal reactivo (más eficiente) -->
<!-- Mejor: pre-calcular en component -->
<h5>{{ titulo() }}</h5> <!-- donde titulo es un computed signal -->
```

---

## 🏗️ Estructura del Patrón: PASO A PASO

### Paso 1: Override obtenerNombreComunidadActual() en Componente

Si la sección necesita personalización:

```typescript
// En seccion6-form.component.ts O seccion6-view.component.ts
override obtenerNombreComunidadActual(): string {
  const prefijo = this.obtenerPrefijoGrupo();
  
  // ✅ Usar aisdGroups() signal
  if (prefijo && prefijo.startsWith('_A')) {
    const match = prefijo.match(/_A(\d+)/);
    if (match) {
      const index = parseInt(match[1]) - 1;
      const grupos = this.aisdGroups();
      if (grupos && grupos[index]?.nombre) {
        return grupos[index].nombre;
      }
    }
  }
  
  // Fallbacks...
  return '____';
}
```

### Paso 2: Crear Signals Computed para Textos

```typescript
// En form.component.ts
readonly textoPoblacionSexoSignal: Signal<string> = computed(() => {
  const prefijo = this.prefijoGrupoSignal();
  const data = this.sectionDataSignal();
  const nombreComunidad = this.obtenerNombreComunidadActual();
  
  // Leer texto personalizado si existe
  const manualKey = `textoPoblacionSexoAISD${prefijo}`;
  const manual = data[manualKey];
  
  if (manual && manual.trim().length > 0) {
    return manual.replace(/{COMUNIDAD}/g, nombreComunidad);
  }
  
  // Usar template por defecto
  return SECCION6_TEMPLATES.textoPoblacionSexoDefault
    .replace(/{COMUNIDAD}/g, nombreComunidad);
});
```

### Paso 3: Usar en Template

```html
<p class="text-justify">{{ textoPoblacionSexoSignal() }}</p>

<h4>{{ SECCION6_TEMPLATES.tituloTablaSexoDefault.replace('{COMUNIDAD}', obtenerNombreComunidadActual()) }}</h4>
```

---

## 📊 Comparación: Antes vs. Después

### ANTES (❌ Incorrecto)

```
Sección 5 - Vista:
  "Instituciones existentes – CC ____"

Sección 5 - Formulario:
  "Instituciones existentes – CC ____"

Sección 6 - Vista:
  "En la CC ____, según datos del censo..."

Sección 6 - Formulario:
  "En la CC ____, según datos del censo..."
```

### DESPUÉS (✅ Correcto)

```
Sección 5 - Vista:
  "Instituciones existentes – CC GRUPOAISD"

Sección 5 - Formulario:
  "Instituciones existentes – CC GRUPOAISD"

Sección 6 - Vista:
  "En la CC GRUPOAISD, según datos del censo..."

Sección 6 - Formulario:
  "En la CC GRUPOAISD, según datos del censo..."
```

---

## 🎓 Lecciones Aprendidas

### 1. Importancia de Signals Reactivos
- `aisdGroups()` es un **signal** que reacciona a cambios
- No es un dato estático guardado
- Se actualiza automáticamente cuando cambia el grupo

### 2. Jerarquía de Fallback
```
1. aisdGroups() signal → más confiable (reactivo)
2. Datos guardados (grupoAISD, grupoAISD_A1) → respaldo
3. Comunidades campesinas → último recurso
4. '____' → placeholder si todo falla
```

### 3. Mismo Código en Form y View
- Ambos componentes deben usar **exactamente** la misma lógica
- Evita inconsistencias
- Facilita mantenimiento

### 4. Reemplazo Consistente
- Siempre usar `.replace(/{COMUNIDAD}/g, nombreComunidad)`
- La `g` (global) es crítica: reemplaza TODAS las ocurrencias
- Usar `{COMUNIDAD}` como placeholder en template, **no** `{{nombreComunidad}}`

---

## � **Mismo Patrón para AISI (Área de Influencia Social Indirecta)**

El patrón es **idéntico** para AISI. Solo cambian estos detalles técnicos:

| Aspecto | AISD | AISI |
|--------|------|------|
| **Métodos** | `obtenerNombreComunidadActual()` | `obtenerNombreCentroPobladoActual()` |
| **Signal** | `aisdGroups()` | `aisiGroups()` |
| **Prefijo** | `_A1`, `_A2`, etc. | `_B1`, `_B2`, etc. |
| **Regex** | `/\_A(\d+)/` | `/\_B(\d+)/` |
| **Ejemplo** | Secciones 5, 6, 7 | Secciones 21, 22, 23 |

### Aplicación AISI - Paso a Paso

**Paso 1: Constants con placeholders**
```typescript
export const SECCION23_TEMPLATES = {
  indiceDesempleoTemplate: `El índice de desempleo del distrito de {DISTRITO}, que abarca al CP {CENTROPOBLADO}...`,
  peaCompleteTemplate: `La PEA del distrito de {DISTRITO}, jurisdicción que abarca a su capital distrital, el CP {CENTROPOBLADO}...`
};
```

**Paso 2: Signal computed con `.replace()`**
```typescript
readonly textoIndiceDesempleoSignal: Signal<string> = computed(() => {
  const manual = this.projectFacade.selectField(this.seccionId, null, 'textoIndiceDesempleo_AISI')();
  if (manual && manual.trim().length > 0) return manual;
  
  const distrito = this.obtenerNombreDistritoActual();
  const cp = this.obtenerNombreCentroPobladoActual();
  
  return SECCION23_TEMPLATES.indiceDesempleoTemplate
    .replace(/{DISTRITO}/g, distrito)
    .replace(/{CENTROPOBLADO}/g, cp);
});
```

**Paso 3: Usar en HTML (Form Y View)**
```html
<p class="text-justify">{{ textoIndiceDesempleoSignal() }}</p>
```

### Métodos AISI Disponibles en BaseSectionComponent

```typescript
// Para centro poblado AISI
obtenerNombreCentroPobladoActual(): string {
  const prefijo = this.obtenerPrefijoGrupo();
  if (prefijo && prefijo.startsWith('_B')) {
    const index = parseInt(prefijo.match(/_B(\d+)/)[1]) - 1;
    return this.aisiGroups()[index]?.nombre || '____';
  }
  return '____';
}

// Para distrito AISI (si necesitas)
obtenerNombreDistritoActual(): string {
  // Mismo patrón, lee el mismo .nombre del grupo o datos guardados
  return nombreDelDistrito || '____';
}
```

---

## �🚀 Aplicación en Nuevas Secciones

Checklist para integrar este patrón:

```markdown
✅ PASO 1: Crear constantes con placeholders {COMUNIDAD}
  - Textos en TEMPLATES.ts
  - Títulos de tablas
  - Descripciones por defecto

✅ PASO 2: Crear Signal para cada texto
  - computed(() => { ... template.replace(...) })
  - Usar sectionDataSignal()
  - Llamar a obtenerNombreComunidadActual()

✅ PASO 3: Override obtenerNombreComunidadActual()
  - Copiar patrón de aisdGroups()
  - Parsear prefijo (_A1 → índice 0)
  - Aplicar fallbacks

✅ PASO 4: Usar Signals en Template
  - {{ miSignal() }} para computed
  - {{ template.replace(...) }} para valores dinámicos

✅ PASO 5: Aplicar EN AMBOS (form y view)
  - Mismo código
  - Mismo resultado
```

---

## 🔗 Referencias

- **BaseSectionComponent**: [base-section.component.ts](../src/app/shared/components/base-section.component.ts#L339)
- **PrefijoHelper**: [prefijo-helper.ts](../src/app/shared/utils/prefijo-helper.ts)
- **Sección 5 (Referencia)**: [seccion5-view.component.ts](../src/app/shared/components/seccion5/seccion5-view.component.ts#L85)
- **Sección 6 (Referencia)**: [seccion6-view.component.ts](../src/app/shared/components/seccion6/seccion6-view.component.ts#L130)

---

## 💡 Tips y Buenas Prácticas

1. **No hardcodee nombres de comunidad** - siempre use relativamente
2. **Prefiera signals computed** - más eficiente que métodos llamados cada render
3. **Documente el {COMUNIDAD}** en las constantes
4. **Pruebe con múltiples grupos** (_A1, _A2, _A3) para validar
5. **Use este patrón consistentemente** - evita confusión futura

---

## ❓ Preguntas Frecuentes

**P: ¿Qué pasa si hay más de 2 grupos AISD (_A1, _A2, _A3)?**
R: El patrón escala automáticamente. El regex `_A(\d+)` captura cualquier número.

**P: ¿Puedo usar esto en otras secciones (AISI)?**
R: **Sí, completamente.** Es el mismo patrón, solo cambian:
   - `aisdGroups()` → `aisiGroups()`
   - Prefijo `_A` → `_B`
   - Métodos: `obtenerNombreComunidadActual()` → `obtenerNombreCentroPobladoActual()`
   - Ver sección "Mismo Patrón para AISI" arriba.

**P: ¿El nombre se actualiza en tiempo real?**
R: Sí, porque `aisdGroups()` e `aisiGroups()` son signals reactivos. Cualquier cambio en grupos dispara re-renders.

**P: ¿Debo eliminar la lógica antigua?**
R: Sí, si ya no se usa. Mantener código muerto genera confusión.

