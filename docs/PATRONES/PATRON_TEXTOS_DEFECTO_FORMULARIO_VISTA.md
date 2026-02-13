# Patrón: Textos por Defecto Sincronizados entre Formulario y Vista

## 🎯 Objetivo

Garantizar que el **formulario** y la **vista** muestren los **mismos textos por defecto** cuando un campo está vacío, proporcionando una experiencia consistente al usuario y evitando confusión.

---

## 📋 Problema Original

### Antes (❌ Inconsistente)

**Vista** mostraba:
```
La Población Económicamente Activa (PEA) constituye un indicador 
fundamental para comprender la dinámica económica y social...
```

**Formulario** mostraba:
```
____
```

**Impacto:** El usuario no sabía qué texto se vería en la vista final.

---

## ✅ Solución: Método getValueOrDefault()

### Patrón Básico

En **formulario**, reemplaza:
```typescript
return this.datos[manualKey] || this.datos['fieldName'] || '____';
```

Con:
```typescript
const texto = this.datos[manualKey] || this.datos['fieldName'];

if (!texto || texto.trim() === '') {
  return `TEXTO_POR_DEFECTO_AQUI`;
}

return texto;
```

---

## 🔄 Implementación Paso-a-Paso

### 1. Identificar el Texto por Defecto en la Vista

En `seccion7-view.component.ts`:

```typescript
obtenerTextoDetalePEAConResaltado(): SafeHtml {
  const viewData = this.viewDataSignal();
  const prefijo = this.obtenerPrefijo();
  
  const manualKey = `textoDetalePEA${prefijo}`;
  let texto = viewData[manualKey];
  
  if (!texto) {
    texto = viewData['textoDetalePEA'];
  }
  
  // ✅ Este es el texto por defecto que queremos sincronizar
  if (!texto || texto.trim() === '') {
    texto = `La Población Económicamente Activa (PEA) constituye un indicador 
    fundamental para comprender la dinámica económica y social. En este apartado, 
    se presenta la caracterización de la PEA del distrito, empleando información 
    oficial del INEI.`;
  }
  
  return this.sanitizer.bypassSecurityTrustHtml(texto);
}
```

### 2. Replicar en el Formulario

En `seccion7-form.component.ts`:

```typescript
obtenerTextoDetalePEA(): string {
  const prefijo = this.obtenerPrefijoGrupo();
  const manualKey = `textoDetalePEA${prefijo}`;
  const texto = this.datos[manualKey] || this.datos['textoDetalePEA'];
  
  // ✅ MISMO TEXTO que en la vista
  if (!texto || texto.trim() === '') {
    return `La Población Económicamente Activa (PEA) constituye un indicador 
    fundamental para comprender la dinámica económica y social. En este apartado, 
    se presenta la caracterización de la PEA del distrito, empleando información 
    oficial del INEI.`;
  }
  
  return texto;
}
```

### 3. Usar en Template (Formulario)

```html
<app-paragraph-editor
  [fieldId]="'textoDetalePEA' + obtenerPrefijoGrupo()"
  [label]="SECCION7_TEMPLATES.LABEL_DETALLE_PEA_TEXTO"
  [hint]="SECCION7_TEMPLATES.HINT_TEXTO_COMPLETO"
  [rows]="4"
  [value]="obtenerTextoDetalePEA()"
  (valueChange)="textoDetalePEA.update($event)">
</app-paragraph-editor>
```

---

## 📊 Comparación: Antes vs. Después

### ANTES (❌)

```typescript
// Formulario
obtenerTextoDetalePEA(): string {
  return this.datos[manualKey] || this.datos['textoDetalePEA'] || '____';
}

// Resultado en template:
// ________
```

### DESPUÉS (✅)

```typescript
// Formulario
obtenerTextoDetalePEA(): string {
  const texto = this.datos[manualKey] || this.datos['textoDetalePEA'];
  if (!texto || texto.trim() === '') {
    return `La Población Económicamente Activa (PEA) constituye...`;
  }
  return texto;
}

// Resultado en template:
// La Población Económicamente Activa (PEA) constituye un indicador 
// fundamental para comprender la dinámica económica y social...
```

---

## 🏗️ Estructura Recomendada

### En Constantes (templates.ts)

Mejor: Define los textos por defecto como constantes para reutilización:

```typescript
export const SECCION7_TEMPLATES = {
  textoDetalePEADefault: `La Población Económicamente Activa (PEA) constituye un indicador 
  fundamental para comprender la dinámica económica y social. En este apartado, 
  se presenta la caracterización de la PEA del distrito, empleando información 
  oficial del INEI.`,
  
  textoAnalisisPEADefault: `Del cuadro precedente, se aprecia que la PEA representa 
  un porcentaje importante de la población en edad de trabajar. Asimismo, 
  se evidencia una distribución diferenciada entre hombres y mujeres...`,
  
  // Más...
} as const;
```

### En Vista

```typescript
obtenerTextoDetalePEAConResaltado(): SafeHtml {
  const viewData = this.viewDataSignal();
  let texto = viewData['textoDetalePEA'];
  
  if (!texto || texto.trim() === '') {
    texto = SECCION7_TEMPLATES.textoDetalePEADefault;
  }
  
  return this.sanitizer.bypassSecurityTrustHtml(texto);
}
```

### En Formulario

```typescript
obtenerTextoDetalePEA(): string {
  const texto = this.datos['textoDetalePEA'];
  
  if (!texto || texto.trim() === '') {
    return SECCION7_TEMPLATES.textoDetalePEADefault;
  }
  
  return texto;
}
```

---

## 🎓 Casos de Uso

### Caso 1: Párrafos Descriptivos

```typescript
// Vista
if (!texto) {
  texto = `En la CC ${nombreComunidad}, se evidencia...`;
}

// Formulario (sincronizado)
if (!texto) {
  return `En la CC ${nombreComunidad}, se evidencia...`; // Mismo
}
```

### Caso 2: Análisis de Tablas

```typescript
// Vista
if (!análisis || análisis.trim() === '') {
  análisis = `Del cuadro precedente, se aprecia que...`;
}

// Formulario (sincronizado)
if (!análisis || análisis.trim() === '') {
  return `Del cuadro precedente, se aprecia que...`; // Mismo
}
```

### Caso 3: Descripciones de Indicadores

```typescript
// Vista
if (!descripción || descripción.trim() === '') {
  descripción = `Este indicador refleja...`;
}

// Formulario (sincronizado)
if (!descripción || descripción.trim() === '') {
  return `Este indicador refleja...`; // Mismo
}
```

---

## ✅ Checklist para Implementar

Cuando vayas a sincronizar un nuevo campo:

```markdown
✅ PASO 1: Identificar Texto en Vista
  [ ] Buscar el método `obtenerTexto*()` en _view.component.ts
  [ ] Copiar el texto por defecto (if (!texto) ... return)
  
✅ PASO 2: Crear/Actualizar Método en Formulario
  [ ] Buscar método correspondiente en _form.component.ts
  [ ] Reemplazar '____' con el texto por defecto
  
✅ PASO 3: Verificar Prefijo Dinámico
  [ ] ¿Usa prefijo (_A1, _A2)?
  [ ] ¿Lee desde datos[fieldName + prefijo]?
  
✅ PASO 4: Usar en Template
  [ ] Cambiar [value]="'____'" por [value]="obtenerTexto*()"
  [ ] O usar [ngModel] con el método getter
  
✅ PASO 5: Probar
  [ ] Dejar campo vacío → Ver texto por defecto en formulario
  [ ] Guardar → Verificar que vista muestra lo mismo
  [ ] Editar y cambiar → Verificar que se guarda correctamente
```

---

## 🚨 Posibles Problemas y Soluciones

### Problema 1: Textos Diferentes Entre Vista y Formulario

**Síntoma:** Vista muestra "AAAA" pero formulario muestra "BBBB"

**Solución:**
```typescript
// ❌ INCORRECTO - Textos diferentes
// Vista
if (!texto) return `Texto A...`;

// Formulario
if (!texto) return `Texto B...`;

// ✅ CORRECTO - Crear constante y reutilizar
export const DEFAULT_TEXT = `Texto...`;

// Vista
if (!texto) return DEFAULT_TEXT;

// Formulario
if (!texto) return DEFAULT_TEXT;
```

### Problema 2: Olvidé el Prefijo

**Síntoma:** Formulario muestra el mismo texto para todos los grupos (_A1, _A2)

**Solución:**
```typescript
// ❌ INCORRECTO - Sin prefijo
const texto = this.datos['fieldName'];

// ✅ CORRECTO - Con prefijo
const prefijo = this.obtenerPrefijoGrupo();
const manualKey = `fieldName${prefijo}`;
const texto = this.datos[manualKey] || this.datos['fieldName'];
```

### Problema 3: Texto Tiene Espacios en Blanco

**Síntoma:** Campo que dice "   " (solo espacios) muestra el texto por defecto

**Solución:**
```typescript
// ❌ INCORRECTO - No trim
if (!texto) return DEFAULT;

// ✅ CORRECTO - Con trim
if (!texto || texto.trim() === '') return DEFAULT;
```

---

## 🔗 Referencias de Implementación

- **Sección 7 - Vista**: [seccion7-view.component.ts](../src/app/shared/components/seccion7/seccion7-view.component.ts#L228)
- **Sección 7 - Formulario**: [seccion7-form.component.ts](../src/app/shared/components/seccion7/seccion7-form.component.ts#L677)
- **Constantes**: [seccion7-constants.ts](../src/app/shared/components/seccion7/seccion7-constants.ts)

---

## 💡 Beneficios del Patrón

1. **Consistencia** → Usuario ve el mismo texto en formulario y vista
2. **Claridad** → No quedan campos "misteriosamente" vacíos
3. **Eficiencia** → Usuario puede editar directamente desde el placeholder visible
4. **Mantenibilidad** → Un solo lugar para cambiar textos por defecto (constantes)
5. **UX Mejorada** → Guía visual clara de qué se espera en cada campo

---

## 📝 Resumen

El patrón es simple pero poderoso:

1. **Extrae el texto por defecto** de la vista
2. **Úsalo también en el formulario** en lugar de `____`
3. **Define como constante** si se reutiliza
4. **Mantén sincronizados** vista y formulario siempre

**Resultado:** Un formulario que guía al usuario con ejemplos reales de lo que verá en la vista final. ✅

