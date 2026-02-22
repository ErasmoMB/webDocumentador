# Guía: Patrón Correcto para Fotografías en Secciones

## Resumen

Este documento establece el patrón correcto para implementar la funcionalidad de fotografías en las secciones del documento, basado en el funcionamiento correcto de las secciones 21, 23 y 24.

## Problema Común

Las secciones que usan `imageFacade.loadImages()` tienen problemas de persistencia porque no leen correctamente los datos del backend. El patrón correcto es usar `projectFacade.selectField()` directamente.

## Patrón Correcto (como Sección 23)

### 1. Signal de Fotos en el Componente de Formulario

En el archivo `[seccionXX]-form.component.ts`, el signal `fotosCacheSignal` debe seguir este patrón:

```typescript
// Photos - SEGUIR PATRON SECCION 21/23: leer directamente desde ProjectStateFacade
readonly fotosCacheSignal: Signal<FotoItem[]> = computed(() => {
  const fotos: FotoItem[] = [];
  const basePrefix = 'fotografia'; // Cambiar al prefijo correcto de la sección
  const groupPrefix = this.obtenerPrefijoGrupo();
  
  for (let i = 1; i <= 10; i++) {
    // Esquema correcto: {prefix}{i}{suffix}{group} → fotografia1Imagen_B1
    const imgKey = groupPrefix ? `${basePrefix}${i}Imagen${groupPrefix}` : `${basePrefix}${i}Imagen`;
    const titKey = groupPrefix ? `${basePrefix}${i}Titulo${groupPrefix}` : `${basePrefix}${i}Titulo`;
    const fuenteKey = groupPrefix ? `${basePrefix}${i}Fuente${groupPrefix}` : `${basePrefix}${i}Fuente`;
    
    const titulo = this.projectFacade.selectField(this.seccionId, null, titKey)();
    const fuente = this.projectFacade.selectField(this.seccionId, null, fuenteKey)();
    const imagen = this.projectFacade.selectField(this.seccionId, null, imgKey)();
    
    if (imagen) {
      fotos.push({ titulo: titulo || `Fotografía ${i}`, fuente: fuente || 'GEADES, 2024', imagen } as FotoItem);
    }
  }
  return fotos;
});
```

### 2. Signal de Fotos en el Componente de Vista

En el archivo `[seccionXX]-view.component.ts`, usar el mismo patrón:

```typescript
readonly fotosCacheSignal: Signal<FotoItem[]> = computed(() => {
  const fotos: FotoItem[] = [];
  const basePrefix = 'fotografia'; // Cambiar al prefijo correcto de la sección
  const groupPrefix = this.obtenerPrefijoGrupo();
  
  for (let i = 1; i <= 10; i++) {
    const imgKey = groupPrefix ? `${basePrefix}${i}Imagen${groupPrefix}` : `${basePrefix}${i}Imagen`;
    const titKey = groupPrefix ? `${basePrefix}${i}Titulo${groupPrefix}` : `${basePrefix}${i}Titulo`;
    const fuenteKey = groupPrefix ? `${basePrefix}${i}Fuente${groupPrefix}` : `${basePrefix}${i}Fuente`;
    
    const titulo = this.projectFacade.selectField(this.seccionId, null, titKey)();
    const fuente = this.projectFacade.selectField(this.seccionId, null, fuenteKey)();
    const imagen = this.projectFacade.selectField(this.seccionId, null, imgKey)();
    
    if (imagen) {
      fotos.push({ titulo: titulo || `Fotografía ${i}`, fuente: fuente || 'GEADES, 2024', imagen } as FotoItem);
    }
  }
  return fotos;
});
```

### 3. Método onFotografíasChange en el Formulario

El método debe persistir las fotos correctamente:

```typescript
override onFotografiasChange(fotografias: FotoItem[], customPrefix?: string): void {
  const prefix = customPrefix || 'fotografia'; // Cambiar al prefijo correcto
  const groupPrefix = this.obtenerPrefijoGrupo();
  const updates: Record<string, any> = {};
  
  // Paso 1: Limpiar slots anteriores (hasta 10)
  for (let i = 1; i <= 10; i++) {
    const imgKey = groupPrefix ? `${prefix}${i}Imagen${groupPrefix}` : `${prefix}${i}Imagen`;
    const titKey = groupPrefix ? `${prefix}${i}Titulo${groupPrefix}` : `${prefix}${i}Titulo`;
    const fuenteKey = groupPrefix ? `${prefix}${i}Fuente${groupPrefix}` : `${prefix}${i}Fuente`;
    updates[imgKey] = '';
    updates[titKey] = '';
    updates[fuenteKey] = '';
  }
  
  // Paso 2: Guardar nuevas fotos
  fotografias.forEach((foto, index) => {
    if (foto.imagen) {
      const idx = index + 1;
      const imgKey = groupPrefix ? `${prefix}${idx}Imagen${groupPrefix}` : `${prefix}${idx}Imagen`;
      const titKey = groupPrefix ? `${prefix}${idx}Titulo${groupPrefix}` : `${prefix}${idx}Titulo`;
      const fuenteKey = groupPrefix ? `${prefix}${idx}Fuente${groupPrefix}` : `${prefix}${idx}Fuente`;
      updates[imgKey] = foto.imagen;
      updates[titKey] = foto.titulo || '';
      updates[fuenteKey] = foto.fuente || '';
    }
  });
  
  // Paso 3: Persistir en ProjectFacade (capa 1)
  this.projectFacade.setFields(this.seccionId, null, updates);
  
  // Paso 4: Persistir en Backend (capa 2)
  try {
    this.formChange.persistFields(this.seccionId, 'images', updates);
  } catch (e) {
    console.error('Error persistiendo imágenes:', e);
  }
}
```

### 4. Componente ImageUpload en el HTML

El componente debe pasar el prefijo correcto:

```html
<app-image-upload
    [fotografias]="fotosCacheSignal()"
    [sectionId]="seccionId"
    [photoPrefix]="'fotografia'"  <!-- Cambiar al prefijo correcto -->
    [permitirMultiples]="true"
    (fotografiasChange)="onFotografiasChangeHandler($event, 'fotografia')">
</app-image-upload>
```

## Lista de Secciones que Necesitan Corrección

Basado en el análisis, las siguientes secciones pueden necesitar corrección:

| Sección | Prefijo Actual | Estado |
|---------|---------------|--------|
| Sección 21 | `fotografia` | ✅ Ya tiene el patrón correcto |
| Sección 22 | `fotografia` | ✅ Ya tiene el patrón correcto |
| Sección 23 | `fotografia` | ✅ Ya tiene el patrón correcto |
| Sección 24 | `fotografiaHabitosConsumo`, `fotografiaActividadesEconomicas`, `fotografiaMercado` | ✅ Corregido |
| Sección 25 | `fotografiaCahuacho` | ⚠️ Necesita verificación |
| Sección 26 | ? | ⚠️ Por verificar |
| Sección 27 | ? | ⚠️ Por verificar |
| Sección 28 | ? | ⚠️ Por verificar |
| Sección 29 | ? | ⚠️ Por verificar |
| Sección 30 | ? | ⚠️ Por verificar |

## Cómo Verificar si una Sección Tiene el Problema

1. Abrir la sección en el navegador
2. Agregar una foto
3. Recargar la página
4. Si la foto no aparece, la sección tiene el problema

## Cómo Aplicar la Corrección

Para cada sección que necesite corrección:

1. Buscar `imageFacade.loadImages` en los archivos de la sección
2. Reemplazar por el patrón de `projectFacade.selectField()` mostrado arriba
3. Asegurarse de que el prefijo sea único para esa sección

## Importante: Prefijos Únicos

Cada sección debe tener un prefijo único para evitar conflictos:
- Sección 21: `fotografia`
- Sección 22: `fotografia`
- Sección 23: `fotografia`
- Sección 24: `fotografiaHabitosConsumo`, `fotografiaActividadesEconomicas`, `fotografiaMercado`
- Sección 25: `fotografiaCahuacho`
- etc.

Si dos secciones comparten el mismo prefijo, las fotos aparecerán en ambas secciones.

## Referencias

- Sección 23 funcionando correctamente: `webDocumentador/src/app/shared/components/seccion23/seccion23-form.component.ts`
- Ejemplo de implementación: `webDocumentador/docs/EJEMPLO_SECCION21_GUIA.md`
