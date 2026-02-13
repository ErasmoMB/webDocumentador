# 📋 Patrón: Obtener Datos de Tabla y Rellenar Placeholders

**Fecha:** 13 de febrero de 2026  
**Secciones que usan este patrón:** Sección 13, Sección 18 (y otros)

---

## 🎯 Objetivo

Leer datos dinámicamente de una tabla en una sección (ej: Sección 4 - Tabla "Ubicación referencial") y usarlos para rellenar placeholders (`____`) en textos de otras secciones. **El resultado es reactivo**: si la tabla cambia, los textos se actualizan automáticamente.

---

## 📊 Ejemplo Práctico: Sección 13 y 18

### **Tabla Fuente (Sección 4 - Cuadro N° 3.2)**

```
Ubicación referencial – CC CAHUACHO

Localidad        | Coordenadas                    | Altitud | Distrito  | Provincia | Departamento
---|---|---|---|---|---
Cahuacho         | 18L E: 663,078 m N: 8,285... | 3,423   | Cahuacho  | Caraveli  | Arequipa
```

### **Placeholder a Rellenar (Sección 13)**

```
Cuadro N° 3.27 - Casos por grupos de morbilidad – Distrito _____ (2023)
```

**Debería quedar:**
```
Cuadro N° 3.27 - Casos por grupos de morbilidad – Distrito Cahuacho (2023)
```

---

## 🔧 Implementación Step-by-Step

### **Paso 1: Agregar Método para Obtener el Dato de la Tabla**

En el componente (form o view):

```typescript
/**
 * ✅ Lee el dato DIRECTAMENTE de la tabla de otra sección
 * Retorna el valor del primer registro, o fallback si no existe
 */
obtenerDistrito(): string {
  const prefijo = this.obtenerPrefijoGrupo();
  const seccion4Id = '3.1.4.A.1'; // Sección 4 - Caracterización socioeconómica
  const tablaKey = `tablaAISD1Datos${prefijo}`; // Clave de la tabla
  
  // 🔴 CRÍTICO: Usar selectField() para obtener tabla REACTIVA
  const tabla = this.projectFacade.selectField(seccion4Id, null, tablaKey)() || [];
  
  // Leer dato del primer registro
  if (Array.isArray(tabla) && tabla.length > 0 && tabla[0]?.distrito) {
    return tabla[0].distrito;
  }
  
  // Fallback: valor por defecto o ubicacionGlobal
  return '____';
}
```

**Desglose:**
- `seccion4Id = '3.1.4.A.1'` → ID de la sección fuente
- `tablaKey = 'tablaAISD1Datos${prefijo}'` → Clave de la tabla en estado
- `selectField(...)()` → Lee tabla reactivamente (Signal)
- `tabla[0]?.distrito` → Acceda al campo del primer registro
- Si no existe, retorna `'____'` como fallback

---

### **Paso 2: Usar el Método en Textos con Placeholders**

En métodos que generan textos:

```typescript
obtenerTextoSeccion13MorbilidadCompleto(): string {
  // Si hay texto personalizado guardado, usarlo
  if (this.datos.parrafoSeccion13_morbilidad_completo) {
    return this.datos.parrafoSeccion13_morbilidad_completo;
  }
  
  // Obtener datos dinámicos
  const grupoAISD = this.obtenerNombreComunidadActual();
  const distrito = this.obtenerDistrito(); // ← Leer de tabla
  
  // Reemplazar placeholders con datos reales
  return SECCION13_TEMPLATES.textoMorbilidadDefault
    .replace(/____/g, (match, offset, string) => {
      const before = string.substring(0, offset);
      const countBefore = (before.match(/____/g) || []).length;
      if (countBefore === 0) return grupoAISD;      // 1ra ocurrencia
      if (countBefore === 1) return distrito;       // 2da ocurrencia
      return grupoAISD;                             // 3ra ocurrencia
    });
}
```

**Lógica de reemplazo:**
- Contar occurrencias de `____` usando índice
- 1ª ocurrencia → `grupoAISD`
- 2ª ocurrencia → `distrito`
- 3ª ocurrencia → `grupoAISD`

---

### **Paso 3: Usar en Títulos de Cuadros**

```typescript
obtenerTituloCuadroMorbilidad(): string {
  const distrito = this.obtenerDistrito(); // ← Leer de tabla
  
  // Template con placeholder
  const template = 'Casos por grupos de morbilidad – Distrito ____ (2023)';
  
  // Reemplazar todos los ____
  return template.replace(/____/g, distrito);
  // Resultado: 'Casos por grupos de morbilidad – Distrito Cahuacho (2023)'
}
```

---

### **Paso 4: Usar en Signals para Reactividad**

En componentes view:

```typescript
readonly textoMorbilidadSignal: Signal<SafeHtml> = computed(() => {
  const texto = this.obtenerTextoSeccion13MorbilidadCompleto();
  const grupoAISD = this.obtenerNombreComunidadActual();
  const distrito = this.obtenerDistrito(); // ← Reactivo: se actualiza si tabla cambia
  
  // Resaltar valores en HTML
  let textoConResaltado = texto
    .replace(new RegExp(grupoAISD, 'g'), `<span class="data-section">${grupoAISD}</span>`)
    .replace(new RegExp(distrito, 'g'), `<span class="data-section">${distrito}</span>`);
  
  return this.sanitizer.sanitize(1, textoConResaltado) as SafeHtml;
});
```

---

## 📋 Checklist de Implementación

```
✅ PASO 1: Método obtenerDato()
  [ ] Identifica sección fuente (ej: '3.1.4.A.1')
  [ ] Identifica tabla clave (ej: 'tablaAISD1Datos${prefijo}')
  [ ] Usa selectField() para reactividad
  [ ] Retorna valor del primer registro
  [ ] Tiene fallback a '____' o valor por defecto

✅ PASO 2: Reemplazar placeholders
  [ ] Texto template tiene ____ 
  [ ] Usa .replace(/____/g, ...) para reemplazar
  [ ] Maneja múltiples ____ si existen

✅ PASO 3: Usar en métodos de título/párrafo
  [ ] Métodos como obtenerTituloCuadroX() usan obtenerDato()
  [ ] Métodos como obtenerTextoX() usan obtenerDato()

✅ PASO 4: Reactivo (si es Signal)
  [ ] Computed signal llama a obtenerDato()
  [ ] Cambios en tabla → Signal reactualiza automáticamente
```

---

## 🔄 Flujo de Datos (Diagrama)

```
┌─────────────────────────────────────────────────────┐
│ Sección 4 - Tabla "Ubicación referencial"           │
│ [{ distrito: "Cahuacho", ... }]                     │
└──────────────┬──────────────────────────────────────┘
               │
               │ selectField('3.1.4.A.1', null, 'tablaAISD1Datos${prefijo}')()
               ╱
        ┌─────────────────────────────────────┐
        │ obtenerDistrito()                   │ ← Leer tabla
        │ return tabla[0].distrito            │
        │ → "Cahuacho"                        │
        └──────────┬──────────────────────────┘
                   │
                   │ Usar valor
                   ╱
    ┌──────────────────────────────────────────────┐
    │ obtenerTituloCuadroMorbilidad()              │
    │ Template: "Casos... Distrito ____ (2023)"   │
    │ .replace(/____/g, distrito)                 │
    │ → "Casos... Distrito Cahuacho (2023)"       │
    └──────────────┬───────────────────────────────┘
                   │
                   │ Renderizar en HTML
                   ╱
            ┌─────────────────┐
            │ Vista (Usuario) │
            │ Lee título texto│
            │ y párrafos con  │
            │ "Cahuacho"      │
            └─────────────────┘
```

---

## ⚡ Ventajas de este Patrón

| Ventaja | Descripción |
|---------|------------|
| **🔄 Reactivo** | Cambias tabla S4 → S13 se actualiza automáticamente |
| **📦 DRY** | Single source of truth (tabla S4) |
| **🎯 Centralizado** | Todas las secciones usan la misma tabla |
| **💾 Persistido** | El dato viene de estado, es automático |
| **🔧 Fallback** | Si no existe tabla, usa valor por defecto |

---

## 🚀 Casos de Uso

### Sección 13
- ✅ Título: "Casos por grupos de morbilidad – Distrito **Cahuacho** (2023)"
- ✅ Párrafo: "a nivel distrital de **Cahuacho**..."

### Sección 18
- ✅ Título: "NBI por grupos etarios – Distrito **Cahuacho** (2024)"
- ✅ Párrafo: "en el distrito de **Cahuacho**..."

### Sección 29 (similar)
- ✅ Título: Reemplaza valores de tabla
- ✅ Párrafo: Usa datos de tabla dinámicamente

---

## ⚠️ Errores Comunes

❌ **ERROR 1: No usar selectField() → Datos no reactivos**
```typescript
// ❌ MAL - No reactivo
const tabla = this.projectFacade.sectionData()[tablaKey];

// ✅ BIEN - Reactivo
const tabla = this.projectFacade.selectField(seccionId, null, tablaKey)();
```

❌ **ERROR 2: Acceder a tabla sin verificar si es array**
```typescript
// ❌ MAL - Crash si tabla es undefined
const distrito = tabla[0].distrito;

// ✅ BIEN - Seguro
if (Array.isArray(tabla) && tabla.length > 0 && tabla[0]?.distrito) {
  return tabla[0].distrito;
}
```

❌ **ERROR 3: Hardcodear el prefijo en tablaKey**
```typescript
// ❌ MAL - Solo funciona para un grupo
const tablaKey = 'tablaAISD1Datos'; // Falta prefijo

// ✅ BIEN - Funciona para todos los grupos
const prefijo = this.obtenerPrefijoGrupo();
const tablaKey = `tablaAISD1Datos${prefijo}`;
```

---

## 📚 Archivos Referencia

- [Sección 13 Form](../src/app/shared/components/seccion13/seccion13-form.component.ts#L200-L223)
- [Sección 13 View](../src/app/shared/components/seccion13/seccion13-view.component.ts#L178-L205)
- [Sección 18 Form](../src/app/shared/components/seccion18/seccion18-form.component.ts#L187-L207)
- [Sección 18 View](../src/app/shared/components/seccion18/seccion18-view.component.ts#L284-L304)

---

## 🎓 Conclusión

Este patrón es **esencial** para createContent dinámico que refleje datos de otras secciones sin duplicar información. Usa:

1. **selectField()** para lectura reactiva
2. **replace()** para reemplazar placeholders
3. **Fallbacks** para casos sin datos
4. **Signals/Computed** para reactividad automática

✅ **Implementado en Sección 13 (13/02/2026)**
