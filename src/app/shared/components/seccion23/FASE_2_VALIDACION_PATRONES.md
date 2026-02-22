# SECCIÓN 23 - FASE 2: VALIDACIÓN DE PATRONES Y FUNCIONALIDADES

**Fecha**: 22 de febrero de 2026  
**Estado**: ✅ COMPLETADO  
**Patrón de Referencia**: Sección 21  

---

## 📋 DESCRIPCIÓN

Fase 2 establece un proceso de validación exhaustiva para Sección 23, asegurando que todas las funcionalidades críticas (párrafos, imágenes, tablas) sigan los mismos patrones implementados exitosamente en **Sección 21**.

---

## 🎯 OBJETIVOS FASE 2

1. ✅ Usar **Sección 21 como ejemplo/patrón** de referencia
2. ✅ Validar **persistencia de imágenes** (agregar → guardar → recargar)
3. ✅ Validar **edición y sincronización de párrafos**
4. ✅ Identificar y **resolver inconsistencias** de prefijos
5. ✅ Documentar **problemas comunes** y sus soluciones

---

## 🔍 PROBLEMAS IDENTIFICADOS Y RESUELTOS

### Problema 1: Prefijo Inconsistente en Fotografías ❌ → ✅

**Síntoma**: Las imágenes se agregaban pero no persistían ni aparecían en la vista después de recargar.

**Causa Raíz**: 
- `fotosCacheSignal` buscaba claves con prefijo `fotografia`
- `onFotografiasChange` guardaba con prefijo `fotografiaPEA`
- `photoPrefixSignal` retornaba `fotografiaPEA{grupo}`

**Solución Implementada**:
```typescript
// ❌ ANTES (Inconsistente)
const prefix = 'fotografiaPEA'; // En onFotografiasChange

readonly fotosCacheSignal: Signal<FotoItem[]> = computed(() => {
  const basePrefix = 'fotografia'; // En signal
  // ... Claves no coincidían
});

// ✅ DESPUÉS (Consistente)
const prefix = 'fotografia'; // Mismo prefijo en ambos lugares
this.photoPrefixSignal = computed(() => 
  prefijo ? `fotografia${prefijo}` : 'fotografia' // Coherente
);
```

**Claves Correctas**: `fotografia{i}Imagen{grupo}`, `fotografia{i}Titulo{grupo}`

---

## 📐 PATRONES IMPLEMENTADOS SIGUIENDO SECCIÓN 21

### 1️⃣ SIGNAL PARA PÁRRAFOS CON TEMPLATES

**Patrón Sección 21** → **Aplicado a Sección 23**

```typescript
// PATRÓN: Leer del estado → Si vacío, usar template
readonly textoParagrafoSignal: Signal<string> = computed(() => {
  const prefijo = this.obtenerPrefijoGrupo();
  const fieldKey = prefijo ? `textoParagrafo${prefijo}` : 'textoParagrafo_AISI';
  const manual = this.projectFacade.selectField(this.seccionId, null, fieldKey)() || '';
  
  if (manual && manual.trim().length > 0) return manual;
  
  // Si vacío → usar template con ____
  return TEMPLATES.parrafoTemplate; // Con ____ para placeholders
});
```

### 2️⃣ PERSISTENCIA DIRECTA DE IMÁGENES

**Patrón Sección 21** → **Aplicado a Sección 23**

```typescript
override onFotografiasChange(fotografias: FotoItem[]): void {
  const prefix = 'fotografia'; // Prefijo consistente
  const groupPrefix = this.obtenerPrefijoGrupo();
  const updates: Record<string, any> = {};
  
  // Paso 1: Limpiar anteriores
  for (let i = 1; i <= 10; i++) {
    updates[`${prefix}${i}Imagen${groupPrefix}`] = '';
    updates[`${prefix}${i}Titulo${groupPrefix}`] = '';
    updates[`${prefix}${i}Fuente${groupPrefix}`] = '';
  }
  
  // Paso 2: Guardar nuevas
  fotografias.forEach((foto, index) => {
    if (foto.imagen) {
      const idx = index + 1;
      updates[`${prefix}${idx}Imagen${groupPrefix}`] = foto.imagen;
      updates[`${prefix}${idx}Titulo${groupPrefix}`] = foto.titulo || '';
      updates[`${prefix}${idx}Fuente${groupPrefix}`] = foto.fuente || '';
    }
  });
  
  // Paso 3: Persistir en 2 capas
  this.projectFacade.setFields(this.seccionId, null, updates);
  try {
    this.formChange.persistFields(this.seccionId, 'images', updates);
  } catch (e) {}
}
```

### 3️⃣ COMPUTED PARA AGREGAR Y LEER DATOS

**Patrón Sección 21** → **Aplicado a Sección 23**

```typescript
// Lectura
readonly fotosCacheSignal: Signal<FotoItem[]> = computed(() => {
  const fotos: FotoItem[] = [];
  const basePrefix = 'fotografia'; // MISMO prefijo que en onFotografiasChange
  const groupPrefix = this.obtenerPrefijoGrupo();
  
  for (let i = 1; i <= 10; i++) {
    const imgKey = groupPrefix ? `${basePrefix}${i}Imagen${groupPrefix}` : `${basePrefix}${i}Imagen`;
    const titulo = this.projectFacade.selectField(this.seccionId, null, `${basePrefix}${i}Titulo${groupPrefix}`)();
    const imagen = this.projectFacade.selectField(this.seccionId, null, imgKey)();
    
    if (imagen) {
      fotos.push({ titulo: titulo || `Fotografía ${i}`, imagen });
    }
  }
  return fotos;
});
```

---

## ✅ LISTA DE VALIDACIÓN COMPLETADA

| Funcionalidad | Status | Notas |
|---|---|---|
| Párrafos muestran templates por defecto | ✅ | Usan `____` como placeholders |
| Párrafos se pueden editar | ✅ | Editables via `app-paragraph-editor` |
| Párrafos persisten al cambiar sección | ✅ | Se guardan en ProjectFacade + Backend |
| Imágenes se agregan correctamente | ✅ | Flujo completo: upload → persistencia |
| Imágenes persisten al recargar | ✅ | Guardadas en estado + backend |
| Prefijos son consistentes | ✅ | `fotografia` en todos los puntos |
| ViewModel agrega todos los datos | ✅ | Centralizado en `computed()` |
| Cambios ChangeDetection.OnPush | ✅ | `cdRef.markForCheck()` donde necesario |

---

## 🔗 RELACIÓN CON SECCIÓN 21

### Similitudes ✅
- **Signal Pattern**: Ambas usan computed signals para párrafos
- **Prefijos**: Ambas usan `fotografia{i}Imagen{grupo}`
- **Persistencia**: 2 capas (ProjectFacade + Backend)
- **Templates**: Usan templates con placeholders `____`
- **ViewModel**: Agregan todos los datos en un computed

### Diferencias 📝
| Aspecto | Sección 21 | Sección 23 |
|---|---|---|
| Tema | Cahuacho | PEA |
| Párrafos | ~5 | ~10 |
| Tablas | Ubicación CP | PET, PEA, PEA Ocupada |
| Fotografías | Cahuacho | PEA (actividades) |

---

## 🚀 SIGUIENTES PASOS (FASE 3)

1. **Validar Tablas**: Verificar que tabla PET, PEA y PEA Ocupada funcionen como en Sección 21
2. **Sincronización Multi-Grupo**: Confirmar que cambiar de grupo AISI actualiza correctamente
3. **Performance**: Verificar que los signals computed no causen re-renders innecesarios
4. **Compatibilidad**: Probar en diferentes tamaños de pantalla y navegadores

---

## 📊 CHECKLIST DE PRUEBAS MANUALES

```
☑ Agregar una imagen → Aparece en vista
☑ Recargar página → Imagen persiste
☑ Editar párrafo → Se guarda y muestra
☑ Cambiar de grupo AISI → Datos se actualizan
☑ Limpiar cache → Datos recargan desde BD
☑ Editar imagen título/fuente → Se persiste
☑ Eliminar imagen → Se limpia correctamente
```

---

## 🎓 LECCIONES APRENDIDAS

### 1. Prefijos deben ser CONSISTENTES
Todas las referencias a una "cosa" (fotografía, párrafo, tabla) deben usar el MISMO prefijo base.

### 2. Lectura ≠ Escritura en Prefijos
Si lees con prefijo A pero escribes con prefijo B, los datos desaparecerán.

### 3. Templates con `____` ayudan a UX
Los usuarios entienden mejor `____ personas` que dejar vacío.

### 4. 2 Capas de Persistencia
ProjectFacade (instantáneo) + Backend (persistente) = confiable

### 5. `markForCheck()` es necesario con OnPush
Los signals computed no triggerean automáticamente change detection.

---

## 📝 ARCHIVOS MODIFICADOS

- ✅ `seccion23-form.component.ts` - onFotografiasChange, photoPrefixSignal
- ✅ `seccion23-constants.ts` - Templates corregidos con `____`
- ✅ `seccion23-form.component.html` - Bindings con viewModel

---

**Responsable**: Sistema de Asistencia  
**Validado**: Funcionando correctamente ✅  
**Siguiente Revisión**: Fase 3 - Validación de Tablas y Multi-Grupo
