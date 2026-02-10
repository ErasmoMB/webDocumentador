# Numeración Global de Imágenes - Documentación Técnica

## Resumen

Este documento describe la implementación de la numeración global de imágenes (fotografías) para grupos AISI dinámicos (B.1, B.2, B.3, etc.) en el sistema Documentador.

---

## Arquitectura

```
┌─────────────────────────────────────────────────────────────────┐
│                    FLUJO DE NUMERACIÓN DE IMÁGENES                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   1. Usuario carga imagen en sección 3.1.4.B.1                  │
│      ↓                                                          │
│   2. ImageUploadComponent detecta cambio                        │
│      ↓                                                          │
│   3. Seccion21ViewComponent actualiza fotosCacheSignal          │
│      ↓                                                          │
│   4. GlobalNumberingService.getGlobalPhotoNumber()              │
│      ↓                                                          │
│   5. Cálculo del offset global:                                 │
│      - Secciones fijas (3.1.1, 3.1.2, 3.1.3)                    │
│      - Grupos AISD (A.1, A.2, ...)                              │
│      - Grupos AISI anteriores (B.1, B.2, ...)                   │
│      ↓                                                          │
│   6. Resultado: Foto N° 3.X                                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Componentes Principales

### 1. GlobalNumberingService

**Archivo**: [`src/app/core/services/global-numbering.service.ts`](src/app/core/services/global-numbering.service.ts)

**Responsabilidades**:
- Calcular el offset global de imágenes
- Generar números de imagen globales
- Contar imágenes en secciones y grupos

**Métodos clave**:

#### `getGlobalPhotoNumber(sectionId: string, prefix: string, photoIndex: number): string`

Calcula el número global de una imagen basándose en:
- `sectionId`: ID de la sección (ej: `3.1.4.B.1`)
- `prefix`: Prefijo de la imagen (ej: `fotografia_B1`)
- `photoIndex`: Índice de la imagen (0-basado)

```typescript
getGlobalPhotoNumber(sectionId: string, prefix: string, photoIndex: number): string {
  const offset = this.calculatePhotoOffset(sectionId, prefix);
  const globalNumber = offset + photoIndex + 1;
  return `3.${globalNumber}`;
}
```

#### `calculatePhotoOffset(sectionId: string, prefix: string): number`

Calcula el offset global de imágenes contando:
1. Imágenes en secciones fijas (3.1.1, 3.1.2, 3.1.3)
2. Imágenes en grupos AISD (A.1, A.2, ...)
3. Imágenes en grupos AISI anteriores (B.1, B.2, ...)

```typescript
calculatePhotoOffset(sectionId: string, prefix: string): number {
  let offset = 0;

  // 1. Secciones fijas
  offset += this.countImagesInSection('3.1.1', 'fotografia');
  offset += this.countImagesInSection('3.1.2', 'fotografia');
  offset += this.countImagesInSection('3.1.3', 'fotografia');

  // 2. Grupos AISD
  const aisdGroups = this.getAISDGroups();
  for (const group of aisdGroups) {
    const groupSectionId = `3.1.4.A.${group.orden}`;
    offset += this.countImagesInSection(groupSectionId, 'fotografia');
  }

  // 3. Grupos AISI anteriores
  const aisiGroups = this.getAISIGroups();
  const currentGroupNum = this.extractGroupNumber(sectionId);
  for (let i = 0; i < currentGroupNum - 1; i++) {
    const group = aisiGroups[i];
    const groupSectionId = `3.1.4.B.${i + 1}`;
    const groupPrefix = `fotografia_B${i + 1}`;
    offset += this.countImagesInSection(groupSectionId, groupPrefix);
  }

  return offset;
}
```

#### `countImagesInSection(sectionId: string, prefix: string): number`

Cuenta las imágenes en una sección específica buscando claves de imagen en el store.

```typescript
countImagesInSection(sectionId: string, prefix: string): number {
  const datos = this.projectFacade.obtenerDatos();
  let count = 0;

  for (let i = 1; i <= 10; i++) {
    const key = `${prefix}${i}Imagen`;
    if (datos[key]) {
      count++;
    }
  }

  return count;
}
```

#### `getAISIGroups(): { id: string; nombre: string }[]`

**IMPORTANTE**: Genera IDs correctos basados en el orden: `B.1`, `B.2`, `B.3`, etc.

```typescript
getAISIGroups(): { id: string; nombre: string }[] {
  const aisiGroups = this.projectFacade.groupsByType('AISI')();
  // Generar IDs correctos basados en el orden: B.1, B.2, B.3, etc.
  return aisiGroups.map((g, index) => ({ 
    id: `B.${index + 1}`, 
    nombre: g.nombre 
  }));
}
```

**Nota**: Este método es crítico porque el sistema de grupos internamente genera IDs como `A`, `B`, `C`, etc., pero para la numeración global necesitamos IDs como `B.1`, `B.2`, `B.3`, etc.

---

### 2. Seccion21ViewComponent

**Archivo**: [`src/app/shared/components/seccion21/seccion21-view.component.ts`](src/app/shared/components/seccion21/seccion21-view.component.ts)

**Responsabilidades**:
- Mantener el cache de fotos
- Generar números de foto globales
- Mostrar las fotos con su numeración

**Signals clave**:

```typescript
// Signal para el prefijo de fotos (ej: "fotografia_B1")
readonly photoPrefixSignal = computed(() => {
  const prefijo = this.obtenerPrefijoGrupo();
  return prefijo ? `fotografia${prefijo}` : 'fotografia';
});

// Signal para el cache de fotos
readonly fotosCacheSignal = computed(() => {
  const prefix = this.photoPrefixSignal();
  const datos = this.projectFacade.obtenerDatos();
  const fotos: FotoConNumero[] = [];

  for (let i = 1; i <= 10; i++) {
    const key = `${prefix}${i}Imagen`;
    if (datos[key]) {
      fotos.push({
        index: i - 1,
        key: key,
        data: datos[key]
      });
    }
  }

  return fotos;
});

// Signal para números de fotos globales
readonly globalPhotoNumbersSignal = computed(() => {
  const prefix = this.photoPrefixSignal();
  const fotos = this.fotosCacheSignal();
  console.log(`[DEBUG-FOTOS] ===> sectionId: ${this.seccionId}, prefix: ${prefix}, fotos: ${fotos.length}`);
  return fotos.map((_, index) => 
    this.globalNumbering.getGlobalPhotoNumber(this.seccionId, prefix, index)
  );
});
```

---

### 3. ImageUploadComponent

**Archivo**: [`src/app/shared/components/image-upload/image-upload.component.ts`](src/app/shared/components/image-upload.component.ts)

**Responsabilidades**:
- Manejar la carga de imágenes
- Guardar las imágenes en el store con el prefijo correcto

**Código clave**:

```typescript
// Generar clave de imagen con prefijo
const prefijo = this.obtenerPrefijoGrupo(); // "_B1"
const prefix = prefijo ? `fotografia${prefijo}` : 'fotografia';
const imageKey = `${prefix}${this.fotoIndex}Imagen`; // "fotografia_B11Imagen"

// Guardar imagen en el store
this.projectFacade.setFields(this.seccionId, null, {
  [imageKey]: imageData
});
```

---

## Convenciones de Nombres

### Prefijos de Grupos

- **AISD**: `_A1`, `_A2`, ... (Comunidades Campesinas)
- **AISI**: `_B1`, `_B2`, ... (Distritos)

### Claves de Imágenes

```
// Sin prefijo (legacy)
fotografia1Imagen
fotografia2Imagen
fotografia3Imagen

// Con prefijo (aislado)
fotografia_B11Imagen
fotografia_B12Imagen
fotografia_B13Imagen
fotografia_B21Imagen
fotografia_B22Imagen
```

---

## Ejemplo de Flujo

### Escenario: Usuario carga 1 foto en B.1 y 1 foto en B.2

#### Paso 1: Usuario carga foto en B.1

```
1. Usuario selecciona imagen en sección 3.1.4.B.1
2. ImageUploadComponent genera clave: "fotografia_B11Imagen"
3. Imagen se guarda en store
4. Seccion21ViewComponent actualiza fotosCacheSignal
5. GlobalNumberingService.getGlobalPhotoNumber() calcula:
   - Offset de secciones fijas: 0
   - Offset de grupos AISD: 0
   - Offset de grupos AISI anteriores: 0
   - Total offset: 0
   - Número global: 0 + 0 + 1 = 1
6. Resultado: Foto N° 3.1
```

#### Paso 2: Usuario carga foto en B.2

```
1. Usuario selecciona imagen en sección 3.1.4.B.2
2. ImageUploadComponent genera clave: "fotografia_B21Imagen"
3. Imagen se guarda en store
4. Seccion21ViewComponent actualiza fotosCacheSignal
5. GlobalNumberingService.getGlobalPhotoNumber() calcula:
   - Offset de secciones fijas: 0
   - Offset de grupos AISD: 0
   - Offset de grupos AISI anteriores: 1 (1 foto en B.1)
   - Total offset: 1
   - Número global: 1 + 0 + 1 = 2
6. Resultado: Foto N° 3.2
```

---

## Troubleshooting

### Las fotos no se numeran correctamente

1. Verificar que `getAISIGroups()` genera IDs correctos (`B.1`, `B.2`, etc.)
2. Verificar que el prefijo de fotos es correcto (`fotografia_B1`, `fotografia_B2`, etc.)
3. Verificar que `countImagesInSection()` cuenta las imágenes correctamente

### Los números de foto se reinician en cada grupo

1. Verificar que `calculatePhotoOffset()` suma los offsets de grupos anteriores
2. Verificar que `extractGroupNumber()` extrae el número de grupo correcto
3. Verificar que el loop de grupos AISI itera hasta el grupo actual - 1

### Logs de depuración

Para habilitar logs de depuración, revisa la consola del navegador:

```
[DEBUG-FOTOS] ===> sectionId: 3.1.4.B.1, prefix: fotografia_B1, fotos: 1
[DEBUG-PHOTO-OFFSET] sectionId=3.1.4.B.1, groupNum=1, sectionNum=1
[DEBUG-COUNT-IMAGES] sectionId=3.1.4.B.1, prefix=fotografia_B1
[DEBUG-COUNT-IMAGES]   fotografia_B11Imagen: SÍ ✅ (total: 1)
[DEBUG-COUNT-IMAGES] TOTAL: 1
[DEBUG-PHOTO-OFFSET] AISI B.1 (3.1.4.B.1): +1 (total: 1)
[DEBUG-PHOTO-OFFSET] TOTAL OFFSET: 1
[DEBUG-PHOTO] sectionId: 3.1.4.B.1
[DEBUG-PHOTO] prefijoGrupo: _B1
[DEBUG-PHOTO] fotoIndex (0-basado): 0
[DEBUG-PHOTO] clave de imagen: fotografia_B11Imagen
[DEBUG-PHOTO] ¿HAY IMAGEN?: SÍ ✅
[DEBUG-PHOTO] fotos anteriores: 1
[DEBUG-PHOTO] globalNumber: 1 + 0 + 1 = 2
[DEBUG-PHOTO] RESULTADO: 3.2
```

---

## Archivos Modificados

| Archivo | Cambio |
|---------|--------|
| `global-numbering.service.ts` | Implementación de numeración global de imágenes |
| `seccion21-view.component.ts` | Signals para cache de fotos y números globales |
| `image-upload.component.ts` | Generación de claves de imagen con prefijo |

---

## Recursos

- [`AISI_GROUPS_ISOLATION.md`](AISI_GROUPS_ISOLATION.md) - Documentación de aislamiento de grupos AISI
- [`GLOBAL_NUMBERING_TABLES.md`](GLOBAL_NUMBERING_TABLES.md) - Documentación de numeración global de tablas
- [`GRUPOS-DINAMICOS-AISI.md`](GRUPOS-DINAMICOS-AISI.md) - Documentación general de grupos AISI
