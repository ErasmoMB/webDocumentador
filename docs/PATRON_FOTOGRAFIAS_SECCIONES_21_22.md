# 📸 Patrón de Fotografías para Secciones 21-22

**Versión:** 1.0  
**Fecha:** 22 de febrero de 2026  
**Propósito:** Documentar el patrón correcto de manejo de fotografías para las secciones 21 y 22, y servir como guía para otras secciones.

---

## 1. ESQUEMA DE CLAVES DE FOTOGRAFÍAS

### 1.1 Formato Correcto

El sistema usa el siguiente esquema de claves para almacenar fotografías:

```
{prefix}{i}{suffix}{group}
```

| Sección | Prefix | Grupo AISD | Grupo AISI | Ejemplo Clave |
|---------|--------|------------|------------|---------------|
| 21 | `fotografia` | `_A1` | `_B1` | `fotografia1Imagen_B1` |
| 22 | `fotografiaCahuacho` | `_A1` | `_B1` | `fotografiaCahuacho1Imagen_B1` |

### 1.2 Estructura de Cada Foto

Cada fotografía tiene 3 campos asociados:

| Campo | Clave Ejemplo (Sección 21, Grupo B) |
|-------|-------------------------------------|
| Imagen | `fotografia1Imagen_B1` |
| Título | `fotografia1Titulo_B1` |
| Fuente | `fotografia1Fuente_B1` |

### 1.3 Cantidad Máxima

- **Máximo:** 10 fotografías por sección
- **Índices:** 1 a 10 (no 0 a 9)

---

## 2. IMPLEMENTACIÓN EN FORM-COMPONENT

### 2.1 Constantes Requeridas

```typescript
// En seccionXX-constants.ts
export const FOTOGRAFIA_SECCION21_PREFIX = 'fotografia';
export const FOTOGRAFIA_SECCION22_PREFIX = 'fotografiaCahuacho';
```

### 2.2 fotosCacheSignal (LECTURA)

**❌ INCORRECTO (Genera claves como `fotografia_B11Imagen`):**

```typescript
readonly fotosCacheSignal: Signal<FotoItem[]> = computed(() => {
  const prefix = this.photoPrefixSignal(); // Devuelve 'fotografia_B1'
  for (let i = 1; i <= 10; i++) {
    const imagen = this.projectFacade.selectField(this.seccionId, null, `${prefix}${i}Imagen`)();
    // ❌ Error: genera 'fotografia_B11Imagen'
  }
});
```

**✅ CORRECTO (Genera claves como `fotografia1Imagen_B1`):**

```typescript
readonly fotosCacheSignal: Signal<FotoItem[]> = computed(() => {
  const fotos: FotoItem[] = [];
  const basePrefix = 'fotografia'; // O 'fotografiaCahuacho' para sección 22
  const groupPrefix = this.obtenerPrefijoGrupo(); // '_B1' o '_A1'
  
  for (let i = 1; i <= 10; i++) {
    const imgKey = groupPrefix 
      ? `${basePrefix}${i}Imagen${groupPrefix}` 
      : `${basePrefix}${i}Imagen`;
    const titKey = groupPrefix 
      ? `${basePrefix}${i}Titulo${groupPrefix}` 
      : `${basePrefix}${i}Titulo`;
    const fuenteKey = groupPrefix 
      ? `${basePrefix}${i}Fuente${groupPrefix}` 
      : `${basePrefix}${i}Fuente`;
    
    const titulo = this.projectFacade.selectField(this.seccionId, null, titKey)();
    const fuente = this.projectFacade.selectField(this.seccionId, null, fuenteKey)();
    const imagen = this.projectFacade.selectField(this.seccionId, null, imgKey)();
    
    if (imagen) {
      fotos.push({ 
        titulo: titulo || `Fotografía ${i}`, 
        fuente: fuente || 'GEADES, 2024', 
        imagen 
      } as FotoItem);
    }
  }
  return fotos;
});
```

### 2.3 onFotografiasChange (ESCRITURA/PERSISTENCIA)

**❌ INCORRECTO (No persiste correctamente):**

```typescript
override onFotografiasChange(fotografias: FotoItem[]): void {
  const prefix = this.photoPrefixSignal();
  this.onGrupoFotografiasChange(prefix, fotografias); // ❌ Genera claves duplicadas
}
```

**✅ CORRECTO (Persiste al backend):**

```typescript
override onFotografiasChange(fotografias: FotoItem[]): void {
  const basePrefix = 'fotografia'; // O 'fotografiaCahuacho' para sección 22
  const groupPrefix = this.obtenerPrefijoGrupo(); // '_B1' o '_A1'
  
  // NO llamar a onGrupoFotografiasChange - genera claves duplicadas incorrectas
  const updates: Record<string, any> = {};
  
  // 1. Limpiar fotos anteriores (todas las 10 posiciones)
  for (let i = 1; i <= 10; i++) {
    const imgKey = groupPrefix 
      ? `${basePrefix}${i}Imagen${groupPrefix}` 
      : `${basePrefix}${i}Imagen`;
    const titKey = groupPrefix 
      ? `${basePrefix}${i}Titulo${groupPrefix}` 
      : `${basePrefix}${i}Titulo`;
    const fuenteKey = groupPrefix 
      ? `${basePrefix}${i}Fuente${groupPrefix}` 
      : `${basePrefix}${i}Fuente`;
    updates[imgKey] = '';
    updates[titKey] = '';
    updates[fuenteKey] = '';
  }
  
  // 2. Guardar nuevas fotos
  fotografias.forEach((foto, index) => {
    if (foto.imagen) {
      const idx = index + 1;
      const imgKey = groupPrefix 
        ? `${basePrefix}${idx}Imagen${groupPrefix}` 
        : `${basePrefix}${idx}Imagen`;
      const titKey = groupPrefix 
        ? `${basePrefix}${idx}Titulo${groupPrefix}` 
        : `${basePrefix}${idx}Titulo`;
      const fuenteKey = groupPrefix 
        ? `${basePrefix}${idx}Fuente${groupPrefix}` 
        : `${basePrefix}${idx}Fuente`;
      
      updates[imgKey] = foto.imagen;
      updates[titKey] = foto.titulo || '';
      updates[fuenteKey] = foto.fuente || '';
    }
  });
  
  // 3. Guardar en ProjectStateFacade
  this.projectFacade.setFields(this.seccionId, null, updates);
  
  // 4. Persistir al backend
  try {
    this.formChange.persistFields(this.seccionId, 'images', updates);
  } catch (e) {}
  
  this.cdRef.markForCheck();
}
```

---

## 3. IMPLEMENTACIÓN EN VIEW-COMPONENT

El view-component debe replicar el mismo `fotosCacheSignal` que el form-component:

```typescript
readonly fotosCacheSignal: Signal<FotoItem[]> = computed(() => {
  const fotos: FotoItem[] = [];
  const basePrefix = 'fotografia'; // O 'fotografiaCahuacho' para sección 22
  const groupPrefix = this.obtenerPrefijoGrupo();
  
  for (let i = 1; i <= 10; i++) {
    const imgKey = groupPrefix 
      ? `${basePrefix}${i}Imagen${groupPrefix}` 
      : `${basePrefix}${i}Imagen`;
    const titKey = groupPrefix 
      ? `${basePrefix}${i}Titulo${groupPrefix}` 
      : `${basePrefix}${i}Titulo`;
    const fuenteKey = groupPrefix 
      ? `${basePrefix}${i}Fuente${groupPrefix}` 
      : `${basePrefix}${i}Fuente`;
    
    const titulo = this.projectFacade.selectField(this.seccionId, null, titKey)();
    const fuente = this.projectFacade.selectField(this.seccionId, null, fuenteKey)();
    const imagen = this.projectFacade.selectField(this.seccionId, null, imgKey)();
    
    if (imagen) {
      fotos.push({ 
        titulo: titulo || `Fotografía ${i}`, 
        fuente: fuente || 'GEADES, 2024', 
        imagen 
      } as FotoItem);
    }
  }
  return fotos;
});
```

---

## 4. OBTENER PREFIJO DE GRUPO

El método `obtenerPrefijoGrupo()` devuelve el sufijo de grupo según el sectionId:

| sectionId | Grupo | Prefijo Retornado |
|-----------|-------|-------------------|
| `3.1.4.A.1.1` | AISD | `_A1` |
| `3.1.4.B.1.1` | AISI | `_B1` |

Este método ya está implementado en la clase base `BaseSectionComponent`.

---

## 5. RESUMEN: APLICAR A OTRAS SECCIONES

Para aplicar este patrón a otras secciones (23-30):

1. **Definir el prefijo base** en constants:
   - `fotografia` para secciones estándar
   - `fotografiaCahuacho` para sección 22
   - Otro prefijo específico para otras secciones

2. **Implementar `fotosCacheSignal`** usando:
   - `basePrefix = 'tuPrefijo'`
   - `groupPrefix = this.obtenerPrefijoGrupo()`
   - Construir claves: `${basePrefix}${i}Imagen${groupPrefix}`

3. **Implementar `onFotografiasChange`** con:
   - Limpiar las 10 posiciones antes de guardar
   - Usar el mismo esquema de claves
   - Persistir con `this.formChange.persistFields()`

4. **Replicar en View-Component** el mismo `fotosCacheSignal`

---

## 6. VERIFICACIÓN

Para verificar que el patrón está implementado correctamente:

1. **Agregar una foto** en el formulario
2. **Verificar que aparece inmediatamente** en la vista
3. **Recargar la página** y verificar que la foto persiste
4. **Verificar las claves** en el backend/depuración:
   - Deben ser `fotografia1Imagen_B1`, NO `fotografia_B11Imagen`
